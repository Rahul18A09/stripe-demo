import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing supabase env variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log("=== Checking database state ===");
  
  const { data: users, error: errU } = await supabase.from("users").select("*");
  console.log("Users Count:", users?.length, errU);

  const { data: orders, error: errO } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  console.log("Orders (latest 5):", JSON.stringify(orders?.slice(0, 5), null, 2));

  const { data: webhookEvents, error: errW } = await supabase
    .from("webhook_events")
    .select("*")
    .order("processed_at", { ascending: false })
    .limit(15);
  console.log("Webhook Events (latest 15):", JSON.stringify(webhookEvents, null, 2));
}

run();
