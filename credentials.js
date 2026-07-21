// credentials.js
const { createClient } = supabase;

const client = supabase.createClient(
  "https://pljmachiuahkrkiddehc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsam1hY2hpdWFoa3JraWRkZWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTAyNDEsImV4cCI6MjA2NjY4NjI0MX0.ke4EYw5lGX5DHrgu1GCDxRUbMYU-M6KzbLZVeesoVm8"
);

export default client;
