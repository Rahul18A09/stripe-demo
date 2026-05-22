"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function login(formData: FormData) {
  const email = readText(formData, "email");
  const password = readText(formData, "password");

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
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
  redirect("/account?message=login");
}

export async function signup(formData: FormData) {
  const name = readText(formData, "name");
  const email = readText(formData, "email");
  const password = readText(formData, "password");

  if (!name || !email || password.length < 6) {
    redirect("/signup?error=invalid");
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error || !data.user) {
    console.error("SIGNUP ERROR:", error);
    redirect("/signup?error=supabase");
  }

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

  // Email confirmation enabled
  // if (!data.session) {
  //   redirect("/login?message=check-email");
  // }

  redirect("/account?message=signup");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?message=logout");
}
