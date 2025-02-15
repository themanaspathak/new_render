import request from 'request';

if (!process.env.MESSAGE_CENTRAL_AUTH_TOKEN) {
  throw new Error("MESSAGE_CENTRAL_AUTH_TOKEN environment variable must be set");
}

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map<string, { otp: string; expires: Date }>();

export async function sendOTP(mobileNumber: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`📤 Attempting to send OTP to ${mobileNumber}`);

    // Store OTP with 5-minute expiration
    otpStore.set(mobileNumber, {
      otp,
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });

    const options = {
      method: 'POST',
      url: `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=C-0BD79595E45C4DB&flowType=SMS&mobileNumber=${mobileNumber}`,
      headers: {
        'authToken': process.env.MESSAGE_CENTRAL_AUTH_TOKEN
      }
    };

    return new Promise((resolve, reject) => {
      request(options, function (error, response) {
        if (error) {
          console.error("❌ Failed to send OTP:", {
            error: {
              message: error.message,
              name: error.name,
              timestamp: new Date().toISOString()
            }
          });
          reject({
            success: false,
            message: "Failed to send OTP. Please try again."
          });
        }

        console.log('✅ SMS sent successfully', {
          statusCode: response.statusCode,
          body: response.body,
          timestamp: new Date().toISOString()
        });

        resolve({
          success: true,
          message: "OTP sent successfully"
        });
      });
    });
  } catch (error: any) {
    console.error("❌ Failed to send OTP:", {
      error: {
        message: error.message,
        name: error.name,
        timestamp: new Date().toISOString()
      }
    });

    return {
      success: false,
      message: "Failed to send OTP. Please try again.",
    };
  }
}

export function verifyOTP(mobileNumber: string, otp: string): {
  success: boolean;
  message: string;
} {
  const storedData = otpStore.get(mobileNumber);

  if (!storedData) {
    return {
      success: false,
      message: "No OTP found. Please request a new OTP.",
    };
  }

  const { otp: storedOtp, expires } = storedData;

  // Check if OTP is expired
  if (expires < new Date()) {
    otpStore.delete(mobileNumber);
    return {
      success: false,
      message: "OTP has expired. Please request a new OTP.",
    };
  }

  // Verify OTP
  const isValid = storedOtp === otp;

  // Clear OTP after verification (whether successful or not)
  otpStore.delete(mobileNumber);

  return {
    success: isValid,
    message: isValid ? "OTP verified successfully" : "Invalid OTP. Please try again.",
  };
}
