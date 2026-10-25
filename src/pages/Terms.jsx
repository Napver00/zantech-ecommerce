import React from "react";
import LegalPageLayout from "@/components/LegalPageLayout";
import { Scale, Tag, CreditCard, Truck, RotateCcw } from "lucide-react";

const Terms = () => (
  <LegalPageLayout
    icon={Scale}
    title="Terms & Conditions"
    subtitle="The rules for buying from the ZAN Tech Store: pricing, payment, delivery and returns."
    endpoint="term-condition"
    seo={{
      title: "Terms & Conditions - ZAN Tech Store",
      description: "Read the terms and conditions for buying robotics and IoT products from ZAN Tech Store.",
      url: "https://store.zantechbd.com/terms",
    }}
    highlights={[
      { icon: Tag, title: "Prices include tax", desc: "Shown in BDT, unless a product says otherwise." },
      { icon: CreditCard, title: "Pay in full", desc: "Orders are paid at checkout and confirmed by us." },
      { icon: Truck, title: "Delivery across Bangladesh", desc: "Shipping options and costs are shown at checkout." },
      { icon: RotateCcw, title: "3-day returns", desc: "Unused items in original packaging, within 3 days." },
    ]}
  />
);

export default Terms;
