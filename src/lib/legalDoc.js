import DOMPurify from "dompurify";
import { fixText } from "@/lib/text";

// The documents are written in the admin panel, often pasted from another site,
// so they arrive with inline colours and backgrounds that break the dark theme.
// Keep the structure, drop the styling, and fix the known text problems.
export const cleanHtml = (html = "") =>
  fixText(DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, FORBID_ATTR: ["style", "class", "id"] }))
    .replace(/(&nbsp;|\u00a0)+/g, " ");

const slugify = (text, used) => {
  let base = text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 50) || "section";
  let slug = base;
  for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;
  used.add(slug);
  return slug;
};

const BLOCKS = "h1,h2,h3,h4,h5,h6,p,ul,ol,table,blockquote,pre,figure,img,hr";

/**
 * Splits a document into the text before the first heading, one section per
 * heading, and the closing text after the last section's list or paragraph.
 * Wrapper divs and sections are flattened away.
 */
export const splitDocument = (html) => {
  const doc = new DOMParser().parseFromString(cleanHtml(html), "text/html");
  const blocks = [...doc.body.querySelectorAll(BLOCKS)].filter(
    (el) => !el.parentElement.closest(BLOCKS) && (el.textContent.trim() !== "" || el.tagName === "IMG")
  );

  // Use the top heading level the document actually has.
  const level = ["H2", "H1", "H3"].find((h) => blocks.some((b) => b.tagName === h));
  const used = new Set();
  const intro = [];
  const sections = [];

  for (const el of blocks) {
    if (el.tagName === level) {
      sections.push({ id: slugify(el.textContent, used), title: el.textContent.trim(), html: "" });
    } else if (sections.length) {
      sections[sections.length - 1].html += el.outerHTML;
    } else {
      intro.push(el.outerHTML);
    }
  }

  // A closing "contact us / thank you" paragraph is not part of the last section.
  let outro = "";
  const last = sections[sections.length - 1];
  if (last) {
    const tail = new DOMParser().parseFromString(last.html, "text/html").body;
    const end = tail.lastElementChild;
    if (end?.tagName === "P" && tail.children.length > 1 && /contact us|thank you/i.test(end.textContent)) {
      outro = end.textContent.trim();
      end.remove();
      last.html = tail.innerHTML;
    }
  }

  return { intro: intro.join(""), sections, outro };
};
