import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, name } = req.body;

  try {
    await resend.emails.send({
      from: "Plate2Purpose <welcome@plate2purpose.com>",
      to: email,
      subject: "🎉 Welcome to Plate2Purpose!",
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 32px; border-radius: 16px; border: 1px solid #ffd8c2; background: #fffaf7; text-align: center;">

        <img
          src="https://www.plate2purpose.com/images/plate2purposename.png"
          alt="Plate2Purpose"
          style="width: 300px; max-width: 100%; display: block; margin: 0 auto 30px auto;"
        >

        <div style="font-size: 50px;">🎉</div>

        <h1 style="color: #ff7b42;">Welcome to Plate2Purpose!</h1>

        <p>Hi <strong>${name}</strong>,</p>

        <p>
          Thank you for joining Plate2Purpose.
          Together we can reduce food waste and create a more sustainable future.
        </p>

        <div style="background:#fff1e8; border-radius:12px; padding:20px; margin:30px 0;">
          <h3 style="color:#ff7b42;">🌱 What's Next?</h3>
          <p>✓ Explore your dashboard</p>
          <p>✓ Track food-saving initiatives</p>
          <p>✓ Join the mission to reduce food waste</p>
        </div>

        <a href="https://www.plate2purpose.com"
          style="background:linear-gradient(135deg,#ff9966,#ff7b42);
          color:white;
          padding:15px 30px;
          border-radius:30px;
          text-decoration:none;
          display:inline-block;
          font-weight:bold;">
          Visit Plate2Purpose
        </a>

        <hr style="margin:30px 0; border:none; border-top:1px solid #ffd8c2;">

        <p style="font-size:13px;color:#999;">
          © 2026 Plate2Purpose | Building a waste-free future 🌱
        </p>

      </div>
      `
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
