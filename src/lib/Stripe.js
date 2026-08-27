import { loadStripe } from "@stripe/stripe-js";

let stripePromise;

export const getStripe = () => {
  const key =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!key) {
    console.warn(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined. Please add it to your environment variables."
    );
    return null;
  }

  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};
