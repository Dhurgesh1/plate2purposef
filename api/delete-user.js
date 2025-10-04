import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://pljmachiuahkrkiddehc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsam1hY2hpdWFoa3JraWRkZWhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTExMDI0MSwiZXhwIjoyMDY2Njg2MjQxfQ.W-Bwi5vn-rDRsnkWz0BAWmrocuFGFSQBXT7GtVeGBtE"
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({ error: err.message });
  }
}
