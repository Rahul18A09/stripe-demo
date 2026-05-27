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
  console.log("=== Updating stuck orders for rahulbharada.dev@gmail.com ===");

  const { data, error } = await supabase
    .from("orders")
    .update({ status: "completed" })
    .eq("user_email", "rahulbharada.dev@gmail.com")
    .eq("status", "checkout_started")
    .select();

  if (error) {
    console.error("Error updating orders:", error);
    process.exit(1);
  }

  console.log(`Successfully updated ${data.length} orders to completed.`);
  console.log("Updated orders details:", JSON.stringify(data, null, 2));
}

run();
