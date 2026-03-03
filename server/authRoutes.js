const bcrypt = require('bcrypt');
const { getUsersCollection } = require('./db');

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

        return reply.code(201).send({ message: "registered" });
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
}

module.exports = authRoutes;
