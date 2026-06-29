import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  const contents = readFileSync(envPath, "utf8");

  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator);
    const value = trimmed.slice(separator + 1);
    process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("FAIL: Missing Supabase env vars in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, anonKey);

  const categories = await supabase
    .from("project_categories")
    .select("id, name")
    .order("name");

  if (categories.error) {
    console.error(`FAIL: Categories query — ${categories.error.message}`);
    process.exit(1);
  }

  console.log(`OK: Loaded ${categories.data?.length ?? 0} categories`);

  const members = await supabase.from("team_members").select("id").limit(1);

  if (members.error) {
    console.error(`FAIL: Members query — ${members.error.message}`);
    process.exit(1);
  }

  console.log(`OK: team_members table accessible (${members.data?.length ?? 0} sample rows)`);

  const testName = `Verify User ${Date.now()}`;
  const categoryId = categories.data?.[0]?.id;

  if (!categoryId) {
    console.error("FAIL: No categories available for create test");
    process.exit(1);
  }

  const created = await supabase
    .from("team_members")
    .insert({
      name: testName,
      role: "Verification Engineer",
      project_category_id: categoryId,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (created.error || !created.data) {
    console.error(`FAIL: Create — ${created.error?.message ?? "No data returned"}`);
    process.exit(1);
  }

  console.log("OK: Created test member");

  const updated = await supabase
    .from("team_members")
    .update({
      role: "Senior Verification Engineer",
      updated_at: new Date().toISOString(),
    })
    .eq("id", created.data.id);

  if (updated.error) {
    console.error(`FAIL: Update — ${updated.error.message}`);
    process.exit(1);
  }

  console.log("OK: Updated test member");

  const deleted = await supabase
    .from("team_members")
    .delete()
    .eq("id", created.data.id);

  if (deleted.error) {
    console.error(`FAIL: Delete — ${deleted.error.message}`);
    process.exit(1);
  }

  console.log("OK: Deleted test member");
  console.log("ALL CHECKS PASSED");
}

void main();
