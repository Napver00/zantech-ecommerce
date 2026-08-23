import React from "react";
import LegalPageLayout from "@/components/LegalPageLayout";
import { Scale, AlertCircle, HelpCircle, ShieldCheck } from "lucide-react";

const Terms = () => (
  <LegalPageLayout
    icon={Scale}
    title="Terms & Conditions"
    subtitle="Please read these terms carefully before using our services."
    endpoint="term-condition"
    seo={{
      title: "Terms & Conditions - ZAN Tech Store",
      description: "Read the terms and conditions for using ZAN Tech Store.",
      url: "https://store.zantechbd.com/terms-and-conditions",
    }}
    highlights={[
      { icon: ShieldCheck, title: "Fair Use", desc: "Guidelines for using our store and services." },
      { icon: AlertCircle, title: "Your Responsibilities", desc: "What we expect from every customer." },
      { icon: HelpCircle, title: "Need Help?", desc: "Reach out if anything is unclear." },
    ]}
  />
);

export default Terms;
