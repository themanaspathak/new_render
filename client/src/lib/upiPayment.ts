import { z } from "zod";

// UPI Payment Status Schema
export const UPIPaymentStatusSchema = z.object({
  status: z.enum(["success", "failure", "pending"]),
  transactionId: z.string().optional(),
  responseCode: z.string().optional(),
  approvalRefNo: z.string().optional(),
});

export type UPIPaymentStatus = z.infer<typeof UPIPaymentStatusSchema>;

// UPI Payment Configuration
interface UPIConfig {
  merchantId: string;
  merchantName: string;
  merchantCode: string;
  transactionNote: string;
}

const DEFAULT_CONFIG: UPIConfig = {
  merchantId: "DEFAULT_MERCHANT",
  merchantName: "Restaurant Name",
  merchantCode: "1234",
  transactionNote: "Food Order Payment",
};

export const createUPIPaymentLink = (
  amount: number,
  orderId: string,
  upiId: string,
  app?: string,
  config: Partial<UPIConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const params = new URLSearchParams({
    pa: upiId, // Payee VPA
    pn: finalConfig.merchantName, // Payee Name
    mc: finalConfig.merchantCode, // Merchant Code
    tr: orderId, // Transaction Reference ID
    tn: finalConfig.transactionNote, // Transaction Note
    am: amount.toString(), // Amount
    cu: "INR", // Currency
    mode: "04", // Mode (04 for UPI)
  });

  // App-specific deep links
  const appSchemes: Record<string, string> = {
    gpay: "tez://upi/pay",
    phonepe: "phonepe://pay",
    paytm: "paytmmp://pay",
    bhim: "bhim://pay",
    mobikwik: "mobikwik://pay",
  };

  // Return app-specific URI if app is specified, otherwise return generic UPI URI
  const baseUri = app ? appSchemes[app] : "upi://pay";
  return `${baseUri}?${params.toString()}`;
};

export const verifyUPIPayment = async (
  orderId: string,
  transactionId?: string
): Promise<UPIPaymentStatus> => {
  try {
    const response = await fetch(`/api/payments/upi/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        transactionId,
      }),
    });

    if (!response.ok) {
      throw new Error("Payment verification failed");
    }

    const result = await response.json();
    return UPIPaymentStatusSchema.parse(result);
  } catch (error) {
    console.error("UPI Payment verification error:", error);
    return {
      status: "failure",
      responseCode: "ERROR",
    };
  }
};

export const generateOrderId = () => {
  return `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};
