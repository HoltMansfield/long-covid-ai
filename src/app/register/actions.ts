"use server";
import { db } from "@/db/connect";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import * as yup from "yup";
import { RegisterFormInputs, schema } from "./schema";
//import { sendWelcomeEmail } from "@/actions/emails";

export async function registerAction(
  state: { error?: string; message?: string; success?: boolean } | undefined,
  data: RegisterFormInputs
): Promise<
  { error?: string; message?: string; success?: boolean } | undefined
> {
  const { email, password } = data;
  // Validate using yup schema
  try {
    await schema.validate({ email, password });
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      return { error: err.errors.join("; ") };
    }
    return { error: "Unknown validation error" };
  }

  const existing = await db.select().from(users).where(eq(users.email, email));

  if (existing.length > 0) {
    return { error: "User already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    id: uuidv4(),
    email,
    passwordHash,
  });

  if (env.APP_ENV !== "E2E") {
    try {
      //await sendWelcomeEmail(email);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  }

  return { message: "Action successful!", success: true };
}



