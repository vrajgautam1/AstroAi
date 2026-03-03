//server.js

import 'dotenv/config';
import { connectDB } from './db.js';
import Fastify from 'fastify';
const fastify = Fastify({ logger: false });
import formbody from '@fastify/formbody';
import cors from '@fastify/cors';

import authRoutes from './authRoutes.js';
import fastifyJwt from '@fastify/jwt';
import oauthPlugin from '@fastify/oauth2';

fastify.register(cors, {
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
});

fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET
});

fastify.register(oauthPlugin, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
        client: {
            id: process.env.GOOGLE_CLIENT_ID,
            secret: process.env.GOOGLE_CLIENT_SECRET
        },
        auth: {
            authorizeHost: 'https://accounts.google.com',
            authorizePath: '/o/oauth2/v2/auth',
            tokenHost: 'https://oauth2.googleapis.com',
            tokenPath: '/token'
        }
    },
    startRedirectPath: '/auth/google',
    callbackUri: 'http://localhost:3000/auth/google/callback'
});

fastify.get('/', async (request, reply) => {
    return { status: "server running" };
});

fastify.register(formbody);

fastify.register(authRoutes, { prefix: '/auth' });

const start = async () => {
    try {
        // Await Mongo connection before starting server
        await connectDB();

        const port = process.env.PORT || 3000;

        // Start server
        await fastify.listen({ port: parseInt(port, 10), host: '0.0.0.0' });
        console.log(`Server successfully started on port ${port}`);
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
};

start();
