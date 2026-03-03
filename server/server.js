require('dotenv').config();
const { connectDB } = require('./db');
const fastify = require('fastify')({ logger: false });

const authRoutes = require('./authRoutes');

fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET
});

fastify.get('/', async (request, reply) => {
    return { status: "server running" };
});

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
