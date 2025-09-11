// server.js — backend for 323drop paywall
// Node >= 20

import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // set in Render env vars

/* ---------------- CORS ---------------- */
app.use(cors({
  origin: ["https://1ai323.ai", "https://www.1ai323.ai"], // allow your domains
  methods: ["GET", "POST"],
  credentials: true
}));

/* ---------------- JSON ---------------- */
app.use(express.json());

/* ---------------- Stripe Checkout ---------------- */
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // includes Apple Pay / Google Pay
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "323drop feed (10 seconds access)" },
            unit_amount: 300, // $3 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://1ai323.ai/323cosmetics-1?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://1ai323.ai/323cosmetics-1",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- Server ---------------- */
app.listen(PORT, () => {
  console.log(`🚀 323drop backend running on port ${PORT}`);
});
