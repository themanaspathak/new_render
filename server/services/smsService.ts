import axios from 'axios';

if (!process.env.MESSAGE_CENTRAL_API_KEY) {
  throw new Error("MESSAGE_CENTRAL_API_KEY environment variable must be set");
}

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map<string, { otp: string; expires: Date }>();

export async function sendSMSOTP(phoneNumber: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`📤 Attempting to send OTP to ${phoneNumber}`);

    // Store OTP with 5-minute expiration
    otpStore.set(phoneNumber, {
      otp,
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Message Central API endpoint
    const messageCentralEndpoint = 'https://api.messagecentral.com/sms/v1/send';
    
    // Prepare the message
    const message = `Your OTP for Restaurant Order is: ${otp}. Valid for 5 minutes.`;

    // Make request to Message Central API
    const response = await axios.post(messageCentralEndpoint, {
      to: phoneNumber,
      message: message,
      sender: 'RESTMGT', // Sender ID
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.MESSAGE_CENTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ SMS sent successfully', {
      to: phoneNumber,
      status: response.status,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: "OTP sent successfully",
    };
  } catch (error: any) {
    console.error("❌ Failed to send SMS:", {
      error: {
        message: error.message,
        name: error.name,
        code: error.response?.status,
        response: error.response?.data,
        timestamp: new Date().toISOString()
      }
    });

    let errorMessage = "Failed to send OTP";
    if (error.response?.status === 401) {
      errorMessage = "Message Central authentication failed. Please check the API key.";
    } else if (error.response?.status === 403) {
      errorMessage = "Message Central authorization failed. Please verify API credentials.";
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export function verifySMSOTP(phoneNumber: string, otp: string): {
  success: boolean;
  message: string;
} {
  const storedData = otpStore.get(phoneNumber);

  if (!storedData) {
    return {
      success: false,
      message: "No OTP found. Please request a new OTP.",
    };
  }

  const { otp: storedOtp, expires } = storedData;

  // Check if OTP is expired
  if (expires < new Date()) {
    otpStore.delete(phoneNumber);
    return {
      success: false,
      message: "OTP has expired. Please request a new OTP.",
    };
  }

  // Verify OTP
  const isValid = storedOtp === otp;

  // Clear OTP after verification (whether successful or not)
  otpStore.delete(phoneNumber);

  return {
    success: isValid,
    message: isValid ? "OTP verified successfully" : "Invalid OTP. Please try again.",
  };
}
