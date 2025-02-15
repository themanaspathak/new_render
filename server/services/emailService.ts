import nodemailer from "nodemailer";

// Create reusable transporter with secure configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true,
  logger: true
});

// Enhanced connection verification with detailed logging
async function verifyEmailConfiguration() {
  try {
    const verified = await transporter.verify();
    if (verified) {
      console.log("✓ SMTP server is ready to send messages");
      console.log("Email configuration:", {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: "configured: " + (!!process.env.EMAIL_PASSWORD)
        }
      });
      return true;
    }
  } catch (error) {
    console.error("✗ SMTP connection error:", error);
    console.error("Email configuration state:", {
      EMAIL_USER_SET: !!process.env.EMAIL_USER,
      EMAIL_PASSWORD_SET: !!process.env.EMAIL_PASSWORD,
      ERROR_MESSAGE: error.message,
      ERROR_CODE: error.code,
      ERROR_RESPONSE: error.response
    });
    return false;
  }
}

// Verify configuration on startup
verifyEmailConfiguration();

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map<string, { otp: string; expires: Date }>();

export async function sendOTP(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Verify email configuration first
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("Email configuration error: Missing credentials");
      throw new Error("Email credentials are not properly configured");
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Attempting to send OTP to ${email}`);

    // Store OTP with 5-minute expiration
    otpStore.set(email, {
      otp,
      expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Enhanced email options with better formatting
    const mailOptions = {
      from: {
        name: "Restaurant Management",
        address: process.env.EMAIL_USER
      },
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
    };

    console.log('🚀 Attempting to send email with configuration:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      timestamp: new Date().toISOString()
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: "OTP sent successfully",
    };
  } catch (error) {
    console.error("✗ Failed to send OTP. Detailed error:", error);

    let errorMessage = "Failed to send OTP";
    if (error instanceof Error) {
      // Enhanced error detection
      if (error.message.includes("Invalid login") || error.message.includes("535-5.7.8")) {
        errorMessage = "Email authentication failed. Please ensure you're using a valid Gmail App Password.";
      } else if (error.message.includes("Email credentials are not configured")) {
        errorMessage = error.message;
      } else if (error.message.includes("getaddrinfo")) {
        errorMessage = "Network connection error. Please check your internet connection.";
      }

      console.error('Detailed error diagnostics:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: (error as any).code,
        command: (error as any).command,
        timestamp: new Date().toISOString()
      });
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export function verifyOTP(email: string, otp: string): {
  success: boolean;
  message: string;
} {
  const storedData = otpStore.get(email);

  if (!storedData) {
    return {
      success: false,
      message: "No OTP found. Please request a new OTP.",
    };
  }

  const { otp: storedOtp, expires } = storedData;

  // Check if OTP is expired
  if (expires < new Date()) {
    otpStore.delete(email);
    return {
      success: false,
      message: "OTP has expired. Please request a new OTP.",
    };
  }

  // Verify OTP
  const isValid = storedOtp === otp;

  // Clear OTP after verification (whether successful or not)
  otpStore.delete(email);

  return {
    success: isValid,
    message: isValid ? "OTP verified successfully" : "Invalid OTP. Please try again.",
  };
}