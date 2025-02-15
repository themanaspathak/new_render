import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const scryptAsync = promisify(scrypt);

// Password validation schema
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export async function validatePassword(password: string) {
  try {
    await passwordSchema.parseAsync(password);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    return false;
  }
}

export async function hashPassword(password: string) {
  await validatePassword(password);
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashedPassword, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashedPassword, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return hashedBuf.length === suppliedBuf.length && timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export class AuthError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    const result = await db.select().from(users).where(eq(users.email, email));
    const user = result[0];

    if (!user) {
      // Use consistent error message to prevent user enumeration
      throw new AuthError("Invalid email or password");
    }

    // Add brute force protection
    const attempts = await getRateLimit(email);
    if (attempts >= 5) {
      throw new AuthError("Too many login attempts. Please try again later.", 429);
    }

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      await incrementRateLimit(email);
      throw new AuthError("Invalid email or password");
    }

    // Reset rate limit on successful login
    await resetRateLimit(email);

    return user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("An error occurred during authentication");
  }
}

// Simple in-memory rate limiting
const loginAttempts = new Map<string, { count: number; timestamp: number }>();

async function getRateLimit(email: string): Promise<number> {
  const attempt = loginAttempts.get(email);
  if (!attempt) return 0;

  // Reset after 30 minutes
  if (Date.now() - attempt.timestamp > 30 * 60 * 1000) {
    loginAttempts.delete(email);
    return 0;
  }

  return attempt.count;
}

async function incrementRateLimit(email: string): Promise<void> {
  const attempt = loginAttempts.get(email);
  if (!attempt) {
    loginAttempts.set(email, { count: 1, timestamp: Date.now() });
  } else {
    attempt.count += 1;
    attempt.timestamp = Date.now();
  }
}

async function resetRateLimit(email: string): Promise<void> {
  loginAttempts.delete(email);
}

// Function to create admin user if it doesn't exist
export async function ensureAdminUser(email: string, password: string) {
  try {
    const result = await db.select().from(users).where(eq(users.email, email));

    if (result.length === 0) {
      const hashedPassword = await hashPassword(password);
      await db.insert(users).values({
        email,
        password: hashedPassword,
        isAdmin: true,
      });
      console.log("Admin user created:", email);
    }
  } catch (error) {
    console.error("Error ensuring admin user:", error);
    throw new Error("Failed to create admin user");
  }
}