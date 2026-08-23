import React from "react";
import PostListLayout from "@/components/PostListLayout";
import { GraduationCap } from "lucide-react";

const Tutorials = () => (
  <PostListLayout
    icon={GraduationCap}
    title="Learn with"
    highlight="Tutorials"
    subtitle="Step-by-step guides on Arduino, ESP32, robotics, and electronics — from beginner basics to practical projects."
    category="tutorial"
    statLabel="tutorials available"
    emptyTitle="No Tutorials Yet"
    emptyDescription="We're creating comprehensive tutorials for you. Check back soon for step-by-step guides and learning materials!"
    emptyCtaLabel="Read Our Blog"
    emptyCtaHref="/blog"
    seo={{
      title: "Robotics & IoT Tutorials | ZAN Tech Store Bangladesh",
      description: "Step-by-step tutorials on Arduino, ESP32, robotics, IoT and electronics. Learn practical projects, coding, and hardware with ZAN Tech Store's free tutorials in Bangladesh.",
      url: "https://store.zantechbd.com/tutorials",
      keywords: "Arduino tutorial Bangladesh, ESP32 tutorial, robotics tutorials BD, IoT tutorials, ZAN Tech tutorials, electronics learning",
    }}
  />
);

export default Tutorials;
