import React, { useEffect, useState } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-arduino";
import { Copy, Check } from "lucide-react";

// Default className to empty string to avoid "undefined" class
const CodeBlock = ({ children, className = "" }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [children]);

  // Recursive function to extract text from React children
  const extractText = (node) => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (!node) return "";

    // Handle array of nodes
    if (Array.isArray(node)) {
      return node.map(extractText).join("");
    }

    // Handle React element
    if (node.props && node.props.children) {
      return extractText(node.props.children);
    }

    return "";
  };

  const handleCopy = async () => {
    try {
      const text = extractText(children);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    // "not-prose" prevents Tailwind Typography from affecting this block
    <div className="not-prose relative my-8 rounded-xl overflow-hidden shadow-2xl border border-[#3a3a3a] bg-[#1e1e1e]">
      {/* Header Bar */}
      <div className="flex justify-between items-center bg-[#252526] px-5 py-3 border-b border-[#3a3a3a]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 transition-all cursor-pointer shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 transition-all cursor-pointer shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#27c93f]/80 transition-all cursor-pointer shadow-sm"></div>
          </div>
          <div className="h-4 w-px bg-[#4b5563]"></div>
          <span className="text-[#9aa4b2] text-xs font-mono font-medium tracking-wide uppercase">
            Arduino Code
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
            copied
              ? "bg-[#22c55e1a] text-[#4ade80] border-[#22c55e33]"
              : "bg-[#ffffff0d] text-[#d1d5db] border-[#ffffff1a] hover:bg-[#ffffff1a] hover:text-[#fff] hover:border-[#ffffff33]"
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>

      {/* Code Area */}
      {/* overflow-x-auto handles the scrolling. w-full ensures it fits container. */}
      <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <pre
          className={`!m-0 !p-6 !bg-[#1e1e1e] !font-mono text-sm md:text-[15px] leading-relaxed min-w-max ${className}`}
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            whiteSpace: "pre", // FORCE NO WRAPPING to ensure horizontal scroll
          }}
        >
          <code
            className="language-cpp block min-w-full"
            style={{ whiteSpace: "pre" }} // Double redundancy
          >
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
