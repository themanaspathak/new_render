import request from 'request';

const AUTH_TOKEN = process.env.MESSAGE_CENTRAL_AUTH_TOKEN;
const IS_DEVELOPMENT = !AUTH_TOKEN;

// Store verification IDs temporarily (in production, use Redis or similar)
const verificationStore = new Map<string, { verificationId: string; expires: Date }>();

export async function sendOTP(mobileNumber: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log(`📤 Attempting to send OTP to ${mobileNumber}`);

    // In development mode without auth token, simulate successful OTP send
    if (IS_DEVELOPMENT) {
      console.log('🔧 Development mode: Simulating OTP send');
      verificationStore.set(mobileNumber, {
        verificationId: 'dev-verification-id',
        expires: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry
      });
      return {
        success: true,
        message: "OTP sent successfully (Development mode)"
      };
    }

    const options = {
      method: 'POST',
      url: `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=C-0BD79595E45C4DB&flowType=SMS&mobileNumber=${mobileNumber}`,
      headers: {
        'authToken': AUTH_TOKEN
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

        try {
          const responseData = JSON.parse(response.body);
          console.log('✅ SMS sent successfully', {
            statusCode: response.statusCode,
            body: response.body,
            timestamp: new Date().toISOString()
          });

          // Store the verification ID
          verificationStore.set(mobileNumber, {
            verificationId: responseData.data.verificationId,
            expires: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry
          });

          resolve({
            success: true,
            message: "OTP sent successfully"
          });
        } catch (parseError) {
          console.error("❌ Failed to parse response:", parseError);
          reject({
            success: false,
            message: "Failed to process OTP request."
          });
        }
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

export async function verifyOTP(mobileNumber: string, otp: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log(`🔍 Verifying OTP for ${mobileNumber}`, { 
      receivedOtp: otp,
      storedData: verificationStore.get(mobileNumber)
    });

    const storedData = verificationStore.get(mobileNumber);

    if (!storedData) {
      console.log("❌ No verification ID found for", mobileNumber);
      return {
        success: false,
        message: "Verification session expired. Please request a new OTP.",
      };
    }

    const { verificationId, expires } = storedData;

    // Check if verification session is expired
    if (expires < new Date()) {
      console.log("❌ Verification session expired for", mobileNumber);
      verificationStore.delete(mobileNumber);
      return {
        success: false,
        message: "Verification session expired. Please request a new OTP.",
      };
    }

    // In development mode, accept any 6-digit OTP
    if (IS_DEVELOPMENT) {
      console.log('🔧 Development mode: Simulating OTP verification');
      verificationStore.delete(mobileNumber);
      const isValid = /^\d{6}$/.test(otp);
      return {
        success: isValid,
        message: isValid ? "OTP verified successfully (Development mode)" : "Invalid OTP format. Please enter 6 digits.",
      };
    }

    const options = {
      method: 'GET',
      url: `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&mobileNumber=${mobileNumber}&verificationId=${verificationId}&customerId=C-0BD79595E45C4DB&code=${otp}`,
      headers: {
        'authToken': AUTH_TOKEN
      }
    };

    return new Promise((resolve) => {
      request(options, function (error, response) {
        if (error) {
          console.error("❌ Verification request failed:", error);
          return resolve({
            success: false,
            message: "Failed to verify OTP. Please try again."
          });
        }

        try {
          const responseData = JSON.parse(response.body);
          console.log("Verification API Response:", responseData);
          const isValid = responseData.responseCode === "200" || responseData.responseCode === 200;

          console.log(`${isValid ? '✅' : '❌'} OTP verification ${isValid ? 'successful' : 'failed'}`, {
            verificationId,
            receivedOtp: otp,
            mobileNumber,
            response: responseData
          });

          // Clear verification data after attempt
          verificationStore.delete(mobileNumber);

          return resolve({
            success: isValid,
            message: isValid ? "OTP verified successfully" : "Invalid OTP. Please try again.",
          });
        } catch (parseError) {
          console.error("❌ Failed to parse verification response:", parseError);
          return resolve({
            success: false,
            message: "Failed to verify OTP. Please try again."
          });
        }
      });
    });
  } catch (error) {
    console.error("❌ Verification error:", error);
    return {
      success: false,
      message: "Failed to verify OTP. Please try again."
    };
  }
}