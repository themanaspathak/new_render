import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map<string, { otp: string; expires: Date }>();

export async function sendOTP(email: string): Promise<boolean> {
  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 5-minute expiration
    otpStore.set(email, {
      otp,
      expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Restaurant Order",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your One-Time Password</h2>
          <p style="color: #666; font-size: 16px;">Use the following OTP to verify your email address:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #333; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This OTP will expire in 5 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Failed to send OTP:", error);
    return false;
  }
}

export function verifyOTP(email: string, otp: string): boolean {
  const storedData = otpStore.get(email);
  
  if (!storedData) {
    return false;
  }

  const { otp: storedOtp, expires } = storedData;

  // Check if OTP is expired
  if (expires < new Date()) {
    otpStore.delete(email);
    return false;
  }

  // Verify OTP
  const isValid = storedOtp === otp;
  
  // Clear OTP after verification (whether successful or not)
  otpStore.delete(email);

  return isValid;
}
