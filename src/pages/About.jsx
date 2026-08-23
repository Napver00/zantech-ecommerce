import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { config } from '@/config';
import { useCategories } from '@/context/CategoriesContext';
import {
  Target,
  Globe,
  ArrowRight,
  CheckCircle2,
  Package,
  LayoutGrid,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import Seo from '@/components/Seo';

const About = () => {
  const { categories } = useCategories();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchAbout = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${config.baseURL}/documents/about`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const html = json.data[0].text || '';
          const sanitized = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
          if (mounted) setContent(sanitized);
        } else if (mounted) {
          setContent('');
        }
      } catch (err) {
        console.error('Failed to load about:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAbout();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchProductCount = async () => {
      try {
        const res = await fetch(`${config.baseURL}/products?page=1&limit=1`);
        const json = await res.json();
        if (mounted) setProductCount(json?.pagination?.total_rows ?? null);
      } catch (err) {
        console.error('Failed to load product count:', err);
      }
    };
    fetchProductCount();
    return () => {
      mounted = false;
    };
  }, []);

  const renderSkeletons = () => (
    <div className="grid lg:grid-cols-2 gap-12">
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl bg-gray-100" />
        <Skeleton className="h-40 w-full rounded-2xl bg-gray-100" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-2/3 bg-gray-100" />
        <Skeleton className="h-4 w-full bg-gray-100" />
        <Skeleton className="h-4 w-full bg-gray-100" />
        <Skeleton className="h-4 w-5/6 bg-gray-100" />
      </div>
    </div>
  );

  const statItems = [
    { label: 'Products', value: productCount != null ? `${productCount}+` : '—', icon: Package },
    { label: 'Categories', value: categories.length > 0 ? `${categories.length}+` : '—', icon: LayoutGrid },
    { label: 'Delivery', value: 'Bangladesh-wide', icon: Truck },
    { label: 'Components', value: '100% Genuine', icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Seo
        title="About ZAN Tech - Innovating the Future"
        description="Discover ZAN Tech's mission to make robotics, IoT, and STEM education accessible in Bangladesh."
        url="https://store.zantechbd.com/about"
        type="website"
      />

      <Header />

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-gray-900 text-white py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <span className="text-blue-300 text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
              Robotics · IoT · STEM Education
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-5 tracking-tight">
              We Are ZAN Tech
            </h1>
            <p className="text-gray-300 max-w-xl mx-auto leading-relaxed">
              Empowering makers, students, and engineers across Bangladesh with genuine
              electronics components and hands-on STEM education.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-10 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {statItems.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                  <div className="text-xl font-extrabold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission / Vision + Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              renderSkeletons()
            ) : (
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                      <Target className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Our Mission</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      To democratize access to technology education and provide high-quality
                      electronic components to makers, students, and engineers across Bangladesh.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                      <Globe className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Our Vision</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      To be a leading catalyst for technological innovation in the region,
                      fostering a community of creators who solve real-world problems.
                    </p>
                  </div>
                </div>

                <div>
                  {content ? (
                    <div
                      className="prose prose-sm md:prose-base max-w-none
                        prose-headings:font-bold prose-headings:text-gray-900
                        prose-p:text-gray-600 prose-p:leading-relaxed
                        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-gray-900
                        prose-ul:list-disc prose-ul:pl-4
                        prose-img:rounded-2xl"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  ) : (
                    <div className="space-y-5">
                      <h2 className="text-2xl font-bold text-gray-900">Why Choose Us?</h2>
                      <p className="text-gray-600 leading-relaxed">
                        At ZAN Tech, we believe in quality, integrity, and innovation. We don't
                        just sell products; we provide solutions. Our team is dedicated to
                        helping you succeed in your projects, whether you're a beginner or a
                        professional.
                      </p>
                      <ul className="space-y-3">
                        {[
                          'Authentic components guaranteed',
                          'Expert technical support',
                          'Fast and reliable delivery',
                          'Comprehensive learning resources',
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-2.5 text-gray-700 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Explore our wide range of products or get in touch with our team for custom solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                Browse Shop
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-7 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/10 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
