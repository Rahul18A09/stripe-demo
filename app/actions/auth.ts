"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function saveUserToSupabase({
  authUserId,
  email,
  name,
}: {
  authUserId: string;
  email: string;
  name?: string;
}) {
  const supabase = await createSupabaseServerClient();
  const payload = {
    auth_user_id: authUserId,
    email,
    ...(name ? { name } : {}),
    last_login_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "auth_user_id" });

  if (error) {
    throw new Error(error.message);
  }
}

function isEmailNotConfirmedError(message?: string) {
  return message?.toLowerCase().includes("email not confirmed") ?? false;
}

function safeRedirectPath(next: string) {
  if (next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/account?message=login";
}

export async function login(formData: FormData) {
  const email = readText(formData, "email");
  const password = readText(formData, "password");
  const next = readText(formData, "next");

  console.log("EMAIL", email);
  console.log("PASSWORD", password);

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });


  console.log("LOGIN ERROR: ", error );
  console.log("LOGIN DATA:", data);

  if (error || !data.user) {
    if (isEmailNotConfirmedError(error?.message)) {
      redirect("/login?error=email-not-confirmed");
    }

    redirect("/login?error=invalid");
  }

  try {
    await saveUserToSupabase({
      authUserId: data.user.id,
      email,
      name:
        typeof data.user.user_metadata.name === "string"
          ? data.user.user_metadata.name
          : undefined,
    });
  } catch (error) {
    console.log("SUPABASE ERROR:", error);
    redirect("/login?error=supabase");
  }

  revalidatePath("/", "layout");
  redirect(next ? safeRedirectPath(next) : "/account?message=login");
}

export async function signup(formData: FormData) {
  const name = readText(formData, "name");
  const email = readText(formData, "email");
  const password = readText(formData, "password");

  if (!name || !email || password.length < 6) {
    redirect("/signup?error=invalid");
  }

  const headersList = await headers();
  const origin = headersList.get("origin") ?? "";

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        name,
      },
    },
  });

  if (error) {
    console.error("SIGNUP ERROR:", error.message);
    redirect("/signup?error=supabase");
  }

  if (!data.user) {
    redirect("/login?message=check-email");
  }

  if (data.session) {
    try {
      await saveUserToSupabase({
        authUserId: data.user.id,
        email,
        name,
      });
    } catch (error) {
      console.error("DATABASE ERROR:", error);
      redirect("/signup?error=supabase");
    }

    revalidatePath("/", "layout");
    redirect("/account?message=signup");
  }

  revalidatePath("/", "layout");
  redirect("/login?message=check-email");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?message=logout");
}
