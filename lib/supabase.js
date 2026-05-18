import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nbrkffiscchcmmwxkolb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icmtmZmlzY2NoY21td3hrb2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDk3MzUsImV4cCI6MjA5NDYyNTczNX0.WxlhAhoL3yEyO7bRAzHzyX810-Cp5_-sPkoMMc9ivq0";

export const supabase = createClient(supabaseUrl, supabaseKey);