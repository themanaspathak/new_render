import { Router } from "express";
import { sendOTP, verifyOTP } from "../services/emailService";
import { z } from "zod";

const router = Router();

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const verifySchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

router.post("/send-email-otp", async (req, res) => {
  try {
    const { email } = emailSchema.parse(req.body);

    const { success, message } = await sendOTP(email);

    if (success) {
      res.json({ message });
    } else {
      res.status(500).json({ error: message });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      console.error("Send OTP error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.post("/verify-email-otp", (req, res) => {
  try {
    const { email, otp } = verifySchema.parse(req.body);

    const { success, message } = verifyOTP(email, otp);

    if (success) {
      res.json({ message });
    } else {
      res.status(400).json({ error: message });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      console.error("Verify OTP error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;