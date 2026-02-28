import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Mail, MessageSquare } from "lucide-react";

const QuickSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm Zanu AI. How can I help you today?", sender: "ai" },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newUserMsg = { id: Date.now(), text: inputText, sender: "user" };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI delay
    setTimeout(() => {
      const newAiMsg = {
        id: Date.now() + 1,
        text: "Zanu AI is currently under development",
        sender: "ai",
      };
      setMessages((prev) => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const socialLinks = [
    {
      name: "Zanu AI",
      action: () => {
        setIsChatOpen(true);
        setIsOpen(false);
      },
      color: "bg-violet-600",
      hoverColor: "hover:bg-violet-700",
      icon: (
        <img
          src="/zanu-ai-icon.png"
          alt="Zanu AI"
          className="w-8 h-8 rounded-full object-cover"
        />
      ),
    },
    {
      name: "WhatsApp",
      url: "https://wa.me/8801894634149",
      color: "bg-[#25D366]",
      hoverColor: "hover:bg-[#1fb855]",
      icon: (
        <svg
          className="w-5 h-5 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/ZanTechBD",
      color: "bg-[#1877F2]",
      hoverColor: "hover:bg-[#0d65d9]",
      icon: (
        <svg
          className="w-5 h-5 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "Email",
      url: "mailto:zantechbd@gmail.com",
      color: "bg-red-500",
      hoverColor: "hover:bg-red-600",
      icon: <Mail className="w-5 h-5 text-white" />,
    },
  ];

  return (
    <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-[9999] flex flex-col items-end gap-3 font-sans">
      {/* Chat Window - Minimalist */}
      <div
        className={`bg-white rounded-3xl shadow-2xl w-[320px] sm:w-[380px] h-[480px] flex flex-col overflow-hidden border border-gray-100 mb-2 transition-all duration-500 origin-bottom-right ${
          isChatOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-10 pointer-events-none absolute bottom-16 right-0"
        }`}
      >
        {/* Header - Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center text-gray-900">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/zanu-ai-icon.png"
                alt="Zanu AI"
                className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Zanu AI</h3>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                Support Agent
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsChatOpen(false)}
            className="hover:bg-gray-100 p-2 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages - Clean */}
        <div className="flex-1 p-5 overflow-y-auto bg-white space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-4 text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm shadow-md shadow-blue-200"
                    : "bg-gray-50 text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-sm border border-gray-100 flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150"></span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - Minimal */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 bg-white border-t border-gray-50 flex gap-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="How can we help?"
            className="flex-1 bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-blue-100/50 rounded-2xl px-4 py-3 text-sm transition-all outline-none border border-gray-100"
          />
          <button
            type="submit"
            className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            disabled={!inputText.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Expanded Options - Minimalist Tooltips */}
      <div
        className={`flex flex-col gap-3 transition-all duration-400 ${isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-90 pointer-events-none absolute bottom-16 right-0"}`}
      >
        {socialLinks.map((link, index) =>
          link.url ? (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-2xl shadow-xl transition-all duration-300 ${link.color} ${link.hoverColor} hover:scale-110 text-white`}
              style={{ transitionDelay: `${index * 40}ms` }}
            >
              {link.icon}
              <span className="absolute right-16 bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-xl pointer-events-none">
                {link.name}
              </span>
            </a>
          ) : (
            <button
              key={index}
              onClick={link.action}
              className={`group relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-2xl shadow-xl transition-all duration-300 ${link.color} ${link.hoverColor} hover:scale-110 text-white`}
              style={{ transitionDelay: `${index * 40}ms` }}
            >
              {link.icon}
              <span className="absolute right-16 bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-xl pointer-events-none">
                {link.name}
              </span>
            </button>
          ),
        )}
      </div>

      {/* Main Toggle Button - Refined */}
      <button
        onClick={toggleWidget}
        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-2xl flex items-center justify-center text-white transition-all duration-500 hover:scale-105 active:scale-95 z-50 ${isOpen ? "bg-gray-900 rotate-90" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"}`}
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
        )}

        {/* Subtle Pulse */}
        {!isOpen && !isChatOpen && (
          <span className="absolute -inset-1 rounded-2xl bg-blue-400 opacity-20 animate-pulse pointer-events-none"></span>
        )}
      </button>
    </div>
  );
};

export default QuickSupport;
