import nodemailer from 'nodemailer';

export async function POST(request) {
  const { to, otp } = await request.json();

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // SMTP host
      port: 587, // SMTP port
      secure: false, // true for 465, false for other ports
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return new Response(JSON.stringify({ message: 'OTP sent successfully!' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return new Response(JSON.stringify({ message: 'Error sending OTP', error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
