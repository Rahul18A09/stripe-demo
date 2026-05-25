import { NextResponse } from "next/server";
import { getUserSubscriptionData } from "@/lib/account-subscriptions";
import { reconcileUserSubscriptions } from "@/lib/reconcile-subscriptions";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await reconcileUserSubscriptions(user.id);
    const { activeSubscription, subscriptions } =
      await getUserSubscriptionData(user.id);

    return NextResponse.json({
      success: true,
      active: Boolean(activeSubscription),
      planName: activeSubscription?.plan_name ?? null,
      totalRecords: subscriptions.length,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unable to sync subscription";

    console.error("[sync]", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
