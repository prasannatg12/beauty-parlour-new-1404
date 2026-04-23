// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vyllwlydzfgehihtomyg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5bGx3bHlkemZnZWhpaHRvbXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzczMDEsImV4cCI6MjA4NDE1MzMwMX0.RnhubbS0ttbyeykWfCyaObGMHEptUZN0tU2-wB5hjcw"
);

export default supabase;