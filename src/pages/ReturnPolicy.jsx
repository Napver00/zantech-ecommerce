import React from "react";
import LegalPageLayout from "@/components/LegalPageLayout";
import { RotateCcw, PackageCheck, Truck, Headphones } from "lucide-react";

const ReturnPolicy = () => (
  <LegalPageLayout
    icon={RotateCcw}
    title="Return Policy"
    subtitle="We want you to be completely satisfied with your purchase."
    endpoint="return-policy"
    seo={{
      title: "Return Policy - ZAN Tech Store",
      description: "Read the ZAN Tech Store return policy.",
      url: "https://store.zantechbd.com/return-policy",
    }}
    highlights={[
      { icon: PackageCheck, title: "Easy Returns", desc: "Simple process for eligible items." },
      { icon: Truck, title: "Return Shipping", desc: "Guidelines for shipping back items." },
      { icon: Headphones, title: "Support", desc: "We're here to help you every step." },
    ]}
  />
);

export default ReturnPolicy;
