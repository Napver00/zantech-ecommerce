import React from "react";
import LegalPageLayout from "@/components/LegalPageLayout";
import { RotateCcw, CalendarCheck, PackageCheck, Camera, XCircle } from "lucide-react";

const ReturnPolicy = () => (
  <LegalPageLayout
    icon={RotateCcw}
    title="Return Policy"
    subtitle="How to return or exchange an item, and what happens if something arrives damaged."
    endpoint="return-policy"
    seo={{
      title: "Return Policy - ZAN Tech Store",
      description: "Read the ZAN Tech Store return policy: 3-day returns, refunds, exchanges and cancellations.",
      url: "https://store.zantechbd.com/return-policy",
    }}
    highlights={[
      { icon: CalendarCheck, title: "3 days to return", desc: "Contact us within 3 days of receiving your order." },
      { icon: PackageCheck, title: "Unused & boxed", desc: "Items must be unused and in their original packaging." },
      { icon: Camera, title: "Damaged on arrival?", desc: "Tell us right away; a photo helps us fix it faster." },
      { icon: XCircle, title: "Free cancellation", desc: "Cancel for a full refund any time before we ship." },
    ]}
  />
);

export default ReturnPolicy;
