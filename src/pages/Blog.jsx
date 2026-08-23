import React from "react";
import PostListLayout from "@/components/PostListLayout";
import { BookOpen } from "lucide-react";

const Blog = () => (
  <PostListLayout
    icon={BookOpen}
    title="Our"
    highlight="Blog"
    subtitle="Insights, stories, and expert knowledge from the ZAN Tech team — robotics, IoT, and maker culture."
    category="blog"
    statLabel="articles published"
    emptyTitle="No Blog Posts Yet"
    emptyDescription="We're working on creating great content for you. Check back soon for insightful articles and updates!"
    emptyCtaLabel="Browse Our Shop"
    emptyCtaHref="/shop"
    seo={{
      title: "ZAN Tech Blog - Robotics, IoT & Electronics Articles in Bangladesh",
      description: "Read articles from ZAN Tech Store on robotics, Arduino, ESP32, IoT, electronics projects, STEM education and maker culture in Bangladesh.",
      url: "https://store.zantechbd.com/blog",
      keywords: "ZAN Tech blog, robotics blog Bangladesh, Arduino articles, ESP32 articles, IoT blog BD, electronics blog, STEM education Bangladesh",
    }}
  />
);

export default Blog;
