import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account?message=confirmed";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const { error: profileError } = await supabase.from("users").upsert(
          {
            auth_user_id: user.id,
            email: user.email,
            name:
              typeof user.user_metadata.name === "string"
                ? user.user_metadata.name
                : null,
            last_login_at: new Date().toISOString(),
          },
          { onConflict: "auth_user_id" }
        );

        if (profileError) {
          return NextResponse.redirect(`${origin}/login?error=supabase`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to login page with an error parameter if verification fails
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
