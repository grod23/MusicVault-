import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envFile = readFileSync(
  new URL("../.env", import.meta.url),
  "utf8"
);

const env = Object.fromEntries(
  envFile
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [
        line.slice(0, index).trim(),
        line.slice(index + 1).trim(),
      ];
    })
);

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const { data, error } = await supabase
  .from("Music Vault")
  .select("id, username, created_at");

if (error) {
  console.log("Anonymous SELECT blocked or failed:", {
    code: error.code,
    message: error.message,
  });
} else {
  console.log("Anonymous SELECT result:", {
    rowCount: data.length,
    canReadProfiles: data.length > 0,
  });
}
// Test authenticated profile read access

const email = process.env.RLS_TEST_EMAIL;
const password = process.env.RLS_TEST_PASSWORD;

if (!email || !password) {
  console.error("Missing RLS test account credentials.");
  process.exitCode = 1;
} else {
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError || !authData.user) {
    console.error("Authentication failed:", authError?.message);
    process.exitCode = 1;
  } else {
    const { data: profiles, error: profileError } =
      await supabase
        .from("Music Vault")
        .select("id, username, created_at");

    if (profileError) {
      console.error("Profile read failed:", profileError.message);
      process.exitCode = 1;
    } else {
      console.log("Authenticated SELECT result:", {
        rowCount: profiles.length,
        ownProfileVisible: profiles.some(
          (profile) => profile.id === authData.user.id
        ),
        otherProfilesVisible: profiles.some(
          (profile) => profile.id !== authData.user.id
        ),
      });
    }

    await supabase.auth.signOut();
  }
}
