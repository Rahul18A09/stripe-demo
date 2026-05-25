import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

type ReadNotificationsRequest = {
  ids?: string[];
  all?: boolean;
};

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as ReadNotificationsRequest;

  let query = supabase
    .from("subscription_notifications")
    .update({ read: true })
    .eq("user_id", user.id);

  if (!body.all && body.ids?.length) {
    query = query.in("id", body.ids);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
