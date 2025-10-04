import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://pljmachiuahkrkiddehc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsam1hY2hpdWFoa3JraWRkZWhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTExMDI0MSwiZXhwIjoyMDY2Njg2MjQxfQ.W-Bwi5vn-rDRsnkWz0BAWmrocuFGFSQBXT7GtVeGBtE"
);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 100,
    });

    if (error) throw error;

    res.status(200).json(data.users);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: err.message });
  }
}
