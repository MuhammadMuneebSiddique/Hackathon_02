import { betterAuth } from "better-auth";
// import { authMiddleware } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set");
}

// Create a Pool instance with proper configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Additional configuration to handle SSL properly
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
    autoSignIn:true
  },
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [
    jwt({
      expiresIn: "7d",
      keyPairConfig: {
        alg: "EdDSA",
        crv: "Ed25519"
      } // JWT expires in 7 days as requested
    }),
    // authMiddleware()
  ]
});

export default auth;

