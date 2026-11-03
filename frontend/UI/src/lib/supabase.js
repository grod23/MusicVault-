import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

console.log(
  "Supabase key loaded:",
  Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
);

console.log(
  "Key type:",
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.startsWith("sbpublishable")
    ? "Publishable"
    : "Other or missing"
);