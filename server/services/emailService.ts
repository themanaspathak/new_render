import nodemailer from "nodemailer";

// Create reusable transporter with secure configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  connectionTimeout: 5000, // 5 seconds timeout
  greetingTimeout: 5000,
  socketTimeout: 5000,
  debug: true,
  logger: true
});

// Enhanced connection verification with detailed logging
async function verifyEmailConfiguration() {
  try {
    console.log("🔍 Verifying email configuration...");
    console.log("📧 Using email:", process.env.EMAIL_USER);
    console.log("🔑 Password configured:", !!process.env.EMAIL_PASSWORD);

    const verified = await transporter.verify();
    if (verified) {
      console.log("✅ SMTP server connection successful");
      return true;
    }
  } catch (error: any) {
    console.error("❌ SMTP connection failed:");
    console.error("Configuration state:", {
      EMAIL_USER_SET: !!process.env.EMAIL_USER,
      EMAIL_PASSWORD_SET: !!process.env.EMAIL_PASSWORD,
      ERROR_DETAILS: {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        timestamp: new Date().toISOString()
      }
    });
    return false;
  }
}

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map<string, { otp: string; expires: Date }>();

export async function sendOTP(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Verify configuration first
    const isConfigValid = await verifyEmailConfiguration();
    if (!isConfigValid) {
      throw new Error("Email configuration verification failed");
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`📤 Attempting to send OTP to ${email}`);

    // Store OTP with 5-minute expiration
    otpStore.set(email, {
      otp,
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Enhanced email options with better formatting
    const mailOptions = {
      from: {
        name: "Restaurant Management",
        address: process.env.EMAIL_USER as string
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

    console.log('📧 Sending email with configuration:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      timestamp: new Date().toISOString()
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: "OTP sent successfully",
    };
  } catch (error: any) {
    console.error("❌ Failed to send OTP:", {
      error: {
        message: error.message,
        name: error.name,
        code: error.code,
        command: error.command,
        response: error.response,
        timestamp: new Date().toISOString()
      }
    });

    let errorMessage = "Failed to send OTP";
    if (error.message.includes("535-5.7.8") || error.message.includes("535-5.7.9")) {
      errorMessage = "Gmail authentication failed. Please ensure you're using a valid Gmail App Password.";
    } else if (error.message.includes("getaddrinfo")) {
      errorMessage = "Network connection error. Please check your internet connection.";
    } else if (error.responseCode === 550) {
      errorMessage = "Email sending failed due to Gmail's security settings. Please check your Gmail account settings.";
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