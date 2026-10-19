import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { config } from '@/config';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, AlertTriangle, Search, MessageCircle, Mail } from 'lucide-react';
import Seo from '@/components/Seo';

const Faq = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${config.baseURL}/faqs/active`);
        if (!response.ok) {
          throw new Error('Failed to fetch FAQs. Please try again later.');
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const storeFaqs = data.data.filter(faq => faq.category === 'store');
          setFaqs(storeFaqs);
        } else {
          throw new Error('Invalid data format received from the server.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSkeletons = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border border-white/10 rounded-xl p-6 bg-card">
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Seo
        title="FAQ - ZAN Tech Store | Frequently Asked Questions"
        description="Find answers to common questions about orders, shipping, payment, returns, and robotics & IoT products at ZAN Tech Store."
        url="https://store.zantechbd.com/faq"
        type="website"
      />

      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-surface-2 text-white py-20 relative overflow-hidden">
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[50%] -left-[20%] w-[80%] h-[80%] bg-zan-cyan/10 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-[50%] -right-[20%] w-[80%] h-[80%] bg-zan-red/10 rounded-full blur-[100px]"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
              <HelpCircle className="w-8 h-8 text-zan-cyan" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Have questions? We're here to help. Find answers to the most common questions about our store and products.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-zan-cyan/40 focus:bg-white/20 transition-all backdrop-blur-sm"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <div className="container mx-auto px-4 py-16 -mt-10 relative z-20">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl shadow-xl shadow-slate-200/50 p-8 md:p-10 border border-white/10">
              {loading && renderSkeletons()}

              {!loading && error && (
                <div className="text-center py-12">
                  <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Error loading FAQs</h3>
                  <p className="text-gray-300 mb-6">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-zan-cyan text-zan-dark rounded-lg hover:bg-cyan-300 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && filteredFaqs.length > 0 && (
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {filteredFaqs.map(faq => (
                    <AccordionItem 
                      key={faq.id} 
                      value={`item-${faq.id}`}
                      className="border border-white/10 rounded-xl px-6 data-[state=open]:bg-background data-[state=open]:border-zan-cyan/20 transition-all duration-200"
                    >
                      <AccordionTrigger className="text-lg font-medium text-white hover:text-zan-cyan hover:no-underline py-6">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-base text-gray-300 leading-relaxed pb-6">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}

              {!loading && !error && filteredFaqs.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Results Found</h3>
                  <p className="text-gray-300">
                    We couldn't find any FAQs matching "{searchQuery}". Try a different search term.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Still Have Questions? */}
          <div className="max-w-3xl mx-auto mt-16 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
            <p className="text-gray-300 mb-8">
              Can't find the answer you're looking for? Please chat to our friendly team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-zan-cyan hover:bg-cyan-300 text-zan-dark font-medium transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Support
              </a>
              <a 
                href="mailto:support@zantechbd.com" 
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-card border border-white/10 hover:bg-background text-gray-200 font-medium transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                Email Us
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Faq;
