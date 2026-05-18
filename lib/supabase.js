import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nbrkffiscchcmmwxkolb.supabase.co";
const supabaseKey = "sb_publishable_9b46iTRc4Y4Q-yMBrwwsKQ_dOZeCzFn";

export const supabase = createClient(supabaseUrl, supabaseKey);