import nodemailer from "nodemailer";

export async function POST(request) {
  const body = await request.json();
  const { to, otp } = body;

  if (!to || !otp) {
    return new Response(JSON.stringify({ message: "Missing email or OTP" }), {
      status: 400,
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your OTP Code",
      html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
    });

    return new Response(JSON.stringify({ message: "OTP sent successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Nodemailer error:", error);
    return new Response(JSON.stringify({ message: "Failed to send OTP" }), {
      status: 500,
    });
  }
}
