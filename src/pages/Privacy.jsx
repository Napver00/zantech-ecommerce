import React from "react";
import LegalPageLayout from "@/components/LegalPageLayout";
import { Shield, ShieldCheck, Lock, Cookie, UserCheck } from "lucide-react";

const Privacy = () => (
  <LegalPageLayout
    icon={Shield}
    title="Privacy Policy"
    subtitle="What we collect when you shop with us, why we need it, and how we protect it."
    endpoint="privacy-policy"
    seo={{
      title: "Privacy Policy - ZAN Tech Store",
      description: "Read the ZAN Tech Store privacy policy to understand how we collect, use, and protect your personal data.",
      url: "https://store.zantechbd.com/privacy-policy",
    }}
    highlights={[
      { icon: ShieldCheck, title: "Never sold", desc: "We don't sell, trade or rent your personal details." },
      { icon: UserCheck, title: "Only what's needed", desc: "Name, contact and address to deliver your order." },
      { icon: Cookie, title: "Cookies you control", desc: "Used for your cart and login; manage them in your browser." },
      { icon: Lock, title: "Kept secure", desc: "Technical and organisational safeguards protect your data." },
    ]}
  />
);

export default Privacy;
