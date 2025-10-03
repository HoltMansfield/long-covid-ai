import StripeWelcomeEmail from "@/react-email/emails/stripe-welcome";
import { Resend } from "resend";

export const sendWelcomeEmail = async (email: string) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "no-reply@long-covid-ai.com",
    to: email,
    subject: "Welcome to Long COVID AI",
    react: <StripeWelcomeEmail />,
  });
};
