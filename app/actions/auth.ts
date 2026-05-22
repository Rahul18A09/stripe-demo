"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";

const sessionCookieName = "headphones_session";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function createDemoSession(email: string) {
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, encodeURIComponent(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

async function saveUserToSupabase({
  email,
  name,
}: {
  email: string;
  name?: string;
}) {
  const supabase = createSupabaseServerClient();
  const payload = {
    email,
    ...(name ? { name } : {}),
    last_login_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "email" });

  if (error) {
    throw new Error(error.message);
  }
}

export async function login(formData: FormData) {
  const email = readText(formData, "email");
  const password = readText(formData, "password");

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  try {
    await saveUserToSupabase({ email });
  } catch (error) {
    console.log("SUPABASE ERROR:", error);
    redirect("/login?error=supabase");
  }

  await createDemoSession(email);
  redirect("/account?message=login");
}

export async function signup(formData: FormData) {
  const name = readText(formData, "name");
  const email = readText(formData, "email");
  const password = readText(formData, "password");

  if (!name || !email || password.length < 6) {
    redirect("/signup?error=invalid");
  }

  try {
    await saveUserToSupabase({ email, name });
  } catch (error) {
    console.log("SUPABASE ERROR:", error);
    redirect("/signup?error=supabase");
  }

  await createDemoSession(email);
  redirect("/account?message=signup");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
  redirect("/login?message=logout");
}
