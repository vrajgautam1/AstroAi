/**
 * User Document Structure
 * 
 * {
 *   email: string (required, unique),
 *   passwordHash: string (nullable),
 *   authProvider: "local" or "google",
 *   googleId: string (nullable),
 *   isVerified: boolean,
 *   createdAt: Date
 * }
 */

const userSchema = {
    email: { type: "string", required: true, unique: true },
    passwordHash: { type: "string", nullable: true },
    authProvider: { type: "string", enum: ["local", "google"], required: true },
    googleId: { type: "string", nullable: true },
    isVerified: { type: "boolean", default: false },
    createdAt: { type: "date", default: Date.now }
};

export {
    userSchema
};
