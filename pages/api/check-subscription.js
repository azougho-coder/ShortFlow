import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PRICE_TO_PLAN = {
  [process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID]: { name: "starter", maxClients: 2 },
  [process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID]: { name: "pro", maxClients: 10 },
  [process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID]: { name: "agency", maxClients: 999 },
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const email = session.user.email;

  // Admin bypass — full access for the site owner
  if (email === process.env.ADMIN_EMAIL) {
    return res.status(200).json({ hasAccess: true, plan: "agency", maxClients: 999, email });
  }

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });

    if (customers.data.length === 0) {
      return res.status(200).json({ hasAccess: false, plan: null });
    }

    const customer = customers.data[0];

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(200).json({ hasAccess: false, plan: null });
    }

    const priceId = subscriptions.data[0].items.data[0].price.id;
    const planInfo = PRICE_TO_PLAN[priceId] || { name: "starter", maxClients: 2 };

    return res.status(200).json({
      hasAccess: true,
      plan: planInfo.name,
      maxClients: planInfo.maxClients,
      email,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
