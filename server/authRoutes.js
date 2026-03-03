//authRoutes.js

import bcrypt from 'bcrypt';
import { getUsersCollection } from './db.js';
import { sendVerificationEmail } from './emailService.js';
import { ObjectId } from 'mongodb';

async function authRoutes(fastify, options) {
    fastify.post('/register', async (request, reply) => {
        const { email, password } = request.body || {};

        // Validate
        if (!email || !password || password.length < 6) {
            return reply.code(400).send({ error: "Email and a password (min 6 chars) are required" });
        }

        const usersCol = getUsersCollection();

        // Check if user already exists
        const existingUser = await usersCol.findOne({ email });
        if (existingUser) {
            return reply.code(400).send({ error: "User already exists" });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert user
        const newUser = {
            email,
            passwordHash,
            authProvider: "local",
            googleId: null,
            isVerified: false,
            createdAt: new Date()
        };

        await usersCol.insertOne(newUser);

        // Send Verification Email
        const token = fastify.jwt.sign(
            { email },
            { expiresIn: '15m' }
        );
        await sendVerificationEmail(email, token);

        return reply.code(201).send({ message: "registered, verification email sent" });
    });

    fastify.post('/login', async (request, reply) => {
        const { email, password } = request.body || {};

        // Validate
        if (!email || !password) {
            return reply.code(400).send({ error: "Email and password are required" });
        }

        const usersCol = getUsersCollection();

        // Find user by email
        const user = await usersCol.findOne({ email });
        if (!user) {
            return reply.code(400).send({ error: "Invalid credentials" });
        }

        if (user.authProvider !== "local") {
            return reply.code(400).send({ error: "Please log in with the correct provider" });
        }

        if (user.isVerified === false) {
            return reply.code(403).send({ error: "Please verify your email first" });
        }

        // Compare password
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return reply.code(400).send({ error: "Invalid credentials" });
        }

        const token = fastify.jwt.sign({ userId: user._id, email: user.email });
        return reply.send({ token });
    });
    fastify.get('/me', async (request, reply) => {
        try {
            await request.jwtVerify();
            return reply.send({ user: request.user });
        } catch (err) {
            return reply.code(401).send({ error: "Unauthorized" });
        }
    });

    fastify.post('/logout', async (request, reply) => {
        try {
            await request.jwtVerify();
            return reply.send({ message: "Logged out successfully" });
        } catch (err) {
            return reply.code(401).send({ error: "Unauthorized" });
        }
    });

    fastify.get('/verify', async (request, reply) => {
        const token = request.query.token;

        if (!token) {
            return reply.code(400).send({ error: "Missing verification token" });
        }

        try {
            const decoded = fastify.jwt.verify(token);
            const email = decoded.email;

            const usersCol = getUsersCollection();
            const user = await usersCol.findOne({ email });

            if (!user) {
                return reply.code(400).send({ error: "User not found" });
            }

            await usersCol.updateOne(
                { _id: user._id },
                { $set: { isVerified: true } }
            );

            return reply.send({ message: "email verified successfully" });
        } catch (err) {
            return reply.code(400).send({ error: "Invalid or expired token" });
        }
    });

    fastify.get('/google/callback', async (request, reply) => {
        try {
            const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

            const userResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
                headers: { Authorization: `Bearer ${token.access_token}` }
            });
            const profile = await userResponse.json();

            if (!userResponse.ok) {
                console.error("Google userinfo failed:", profile);
                return reply.code(401).send({ error: "Failed to fetch user profile from Google" });
            }

            const email = profile.email;
            const googleId = profile.sub || profile.id;

            const usersCol = getUsersCollection();
            let user = await usersCol.findOne({ email });

            if (!user) {
                user = {
                    email,
                    passwordHash: null,
                    authProvider: "google",
                    googleId,
                    isVerified: true,
                    createdAt: new Date()
                };
                const result = await usersCol.insertOne(user);
                user._id = result.insertedId;
            } else {
                if (user.authProvider !== "google") {
                    await usersCol.updateOne(
                        { _id: user._id },
                        { $set: { authProvider: "google", googleId, isVerified: true } }
                    );
                    user.authProvider = "google";
                    user.googleId = googleId;
                }
            }

            const jwtToken = fastify.jwt.sign({ userId: user._id, email: user.email });
            return reply.redirect(`http://localhost:5173/dashboard?token=${jwtToken}`);
        } catch (err) {
            return reply.code(500).send({ error: "Google OAuth failed", details: err.message });
        }
    });
}
export default authRoutes;
