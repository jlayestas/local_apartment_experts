import type { Metadata } from "next";
import ContactContent from "@/features/contact/ContactContent";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to a local agent and find your next apartment in Miami.",
};

export default function ContactPage() {
  return <ContactContent />;
}
