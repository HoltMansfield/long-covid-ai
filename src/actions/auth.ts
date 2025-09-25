"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();
  
  // Clear the session cookie
  cookieStore.delete("session_user");
  
  // Redirect to login page
  redirect("/login");
}

export async function getCurrentUser(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_user");
  
  return sessionCookie?.value || null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_user");
  
  if (!sessionCookie?.value) {
    return null;
  }

  // Get user ID from database using email
  const { db } = await import("@/db/connect");
  const { users } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  
  try {
    const user = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.email, sessionCookie.value))
      .limit(1);
    
    return user[0]?.id || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}
