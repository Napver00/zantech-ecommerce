import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { config } from "@/config";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Clock,
  ArrowRight,
} from "lucide-react";
import Seo from "@/components/Seo";

const Contact = () => {
  const [form, setForm] = useState({
    f_name: "",
    l_name: "",
    email: "",
    project_type: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchCompany = async () => {
      try {
        const res = await fetch(`${config.baseURL}/company`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && json.data && mounted) setCompany(json.data);
      } catch (err) {
        console.error("Failed to load company info in contact page:", err);
      }
    };
    fetchCompany();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch(`${config.baseURL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setSuccess(json.message || "Message sent successfully");
        setForm({
          f_name: "",
          l_name: "",
          email: "",
          project_type: "",
          message: "",
        });
      } else {
        throw new Error(json.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Contact submit error:", err);
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Seo
        title="Contact Zantech Store - Robotics & IoT Support in Bangladesh"
        description="Get in touch with Zantech Store for product queries, orders, technical support, or project consultation."
        url="https://store.zantechbd.com/contact"
        type="website"
      />

      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[50%] -right-[20%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-[50%] -left-[20%] w-[80%] h-[80%] bg-purple-600/10 rounded-full blur-[100px]"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
              <MessageSquare className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Let's Start a Conversation
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Have a question about our products or need technical support?
              We're here to help you build the future.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16 -mt-10 relative z-20">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {/* Location Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                  <MapPin size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Visit Us
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {company?.location || "Barishal, Barisal Division Bangladesh"}
                </p>
              </div>

              {/* Contact Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 text-green-600">
                  <Phone size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Call Us
                </h3>
                <p className="text-slate-600 mb-2">Mon-Fri from 9am to 6pm</p>
                {company?.phone && (
                  <a
                    href={`tel:${company.phone}`}
                    className="text-lg font-medium text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {company.phone}
                  </a>
                )}
              </div>

              {/* Email Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                  <Mail size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Email Us
                </h3>
                <p className="text-slate-600 mb-2">
                  We'll respond within 24 hours
                </p>
                {company?.email && (
                  <a
                    href={`mailto:${company.email}`}
                    className="text-lg font-medium text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {company.email}
                  </a>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 md:p-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Send us a Message
                </h2>

                {success && (
                  <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fade-in">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-green-800 font-medium">
                        Message Sent!
                      </p>
                      <p className="text-green-700 text-sm mt-1">{success}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 font-medium">Failed to Send</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="f_name"
                        className="text-sm font-medium text-slate-700"
                      >
                        First Name
                      </label>
                      <input
                        id="f_name"
                        name="f_name"
                        value={form.f_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-slate-50 focus:bg-white"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="l_name"
                        className="text-sm font-medium text-slate-700"
                      >
                        Last Name
                      </label>
                      <input
                        id="l_name"
                        name="l_name"
                        value={form.l_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-slate-50 focus:bg-white"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-700"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-slate-50 focus:bg-white"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="project_type"
                      className="text-sm font-medium text-slate-700"
                    >
                      Subject
                    </label>
                    <input
                      id="project_type"
                      name="project_type"
                      value={form.project_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-slate-50 focus:bg-white"
                      placeholder="Product Inquiry, Support, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-slate-700"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-slate-50 focus:bg-white resize-none"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Map Section (Optional Placeholder) */}
          <div className="mt-16 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="aspect-video w-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
              {/* You can embed a Google Map iframe here */}
              <iframe
                src="https://maps.google.com/maps?q=23.863472,90.387222&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
                className="rounded-xl"
              ></iframe>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
