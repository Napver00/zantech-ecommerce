import React from "react";
import LegalPageLayout from "@/components/LegalPageLayout";
import { Shield, Lock, Eye, FileText } from "lucide-react";

const Privacy = () => (
  <LegalPageLayout
    icon={Shield}
    title="Privacy Policy"
    subtitle="We are committed to protecting your personal information and your right to privacy."
    endpoint="privacy-policy"
    seo={{
      title: "Privacy Policy - ZAN Tech Store",
      description: "Read the ZAN Tech Store privacy policy to understand how we collect, use, and protect your personal data.",
      url: "https://store.zantechbd.com/privacy-policy",
    }}
    highlights={[
      { icon: Lock, title: "Secure Data", desc: "Your data is encrypted and stored securely." },
      { icon: Eye, title: "Transparent", desc: "No hidden tracking or data selling." },
      { icon: FileText, title: "Compliance", desc: "We follow all local data protection laws." },
    ]}
  />
);

export default Privacy;
