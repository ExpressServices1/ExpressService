import React, { useState } from 'react';
import {
  Mail,
  MapPin,
  // Facebook,
  // Twitter,
  // Instagram,
  // Linkedin,
  // Youtube,
  Package,
  Globe,
  Shield,
  Clock,
  ArrowRight,
  Star
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const Footer: React.FC = () => {
  const [Email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  // submit mail function can be added here if needed
  const handleSubscribe = async () => {
    const errorElement = document.getElementById('errfomsg') as HTMLElement;
    errorElement.textContent = '';
    const email = Email.trim();

    if (!email) {
      errorElement.textContent = 'Please enter your email address.';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      errorElement.textContent = 'Please enter a valid email address.';
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://expressback-kylv.onrender.com/api/footer/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        errorElement.style.color = 'green';
        errorElement.textContent = 'Subscribed successfully!';
        setTimeout(() => {
          errorElement.textContent = '';
          errorElement.style.color = '';
          setEmail('');
        }, 3000);
      } else {
        errorElement.textContent = `Subscription failed: ${data.error}`;
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      errorElement.textContent = 'Subscription failed. Please try again later.';
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubscribe();
    }
  };

  const footerSections = [
    {
      title: 'Services',
      links: [
        { name: 'Express Shipping', href: '/services#express' },
        { name: 'International Shipping', href: '/services#international' },
        { name: 'Freight Services', href: '/services#freight' },
        { name: 'Supply Chain', href: '/services/supply-chain' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/company#about' },
        { name: 'Our Story', href: '/company#story' },
        { name: 'Locations', href: '/company#locations' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Track Package', href: '/track' },
        { name: 'Contact Support', href: '/contact' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', href: '/legal#terms' },
        { name: 'Privacy Policy', href: '/legal#privacy' },
        { name: 'Shipping Terms', href: '/legal#shipping-terms' },
        { name: 'Prohibited Items', href: '/legal#prohibited' },
      ]
    }
  ];

  const socialLinks = [
    // { icon: <Facebook className="h-5 w-5" />, href: '#', name: 'Facebook' },
    { icon: <FaWhatsapp className="h-5 w-5" size={24} color="#25D366" />, href: 'https://wa.me/+16474936699', name: 'Whatsapp' },
    // { icon: <Twitter className="h-5 w-5" />, href: '#', name: 'Twitter' },
    // { icon: <Instagram className="h-5 w-5" />, href: '#', name: 'Instagram' },
    // { icon: <Linkedin className="h-5 w-5" />, href: '#', name: 'LinkedIn' },
    // { icon: <Youtube className="h-5 w-5" />, href: '#', name: 'YouTube' }
  ];

  const features = [
    { icon: <Package className="h-6 w-6" />, text: 'Safe & Secure Packaging' },
    { icon: <Globe className="h-6 w-6" />, text: '200+ Countries Worldwide' },
    { icon: <Shield className="h-6 w-6" />, text: 'Full Insurance Coverage' },
    { icon: <Clock className="h-6 w-6" />, text: '24/7 Customer Support' }
  ];

  const logoUrl = "/essfavico.png";

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                Stay Updated with <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">ExpressEase</span>
              </h3>
              <p className="text-blue-200 text-lg">
                Get the latest shipping updates, exclusive offers, and logistics insights delivered to your inbox.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-2 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <p className="text-lg text-red-600 mt-2 text-left" id="errfomsg"></p>
              </div>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  {feature.icon}
                </div>
                <span className="text-blue-200 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <a href="/">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="w-15 h-12 bg-gradient-to-r from-white-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                    {/* <Truck className="h-7 w-7 text-white" /> */}
                    <img src={logoUrl} className="h-20 w-20" alt="" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    Express<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">Ease</span>
                  </h2>
                  <p className="text-blue-200 text-sm">Service</p>
                </div>
              </div>
            </a>
            <p className="text-blue-200 mb-6 leading-relaxed">
              Your trusted global shipping partner, delivering excellence across 200+ countries with cutting-edge logistics solutions and unparalleled customer service.
            </p>

            <div className="flex items-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-blue-200 ml-2">4.9/5 Customer Rating</span>
            </div>

            <div className="space-y-3">
              {/* <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-cyan-400" />
                <span className="text-blue-200">1-800-SHIP-NOW (1-800-744-7669)</span>
              </div> */}
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-cyan-400" />
                <span className="text-blue-200">support@expresseaseservice.xyz</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-cyan-400" />
                <span className="text-blue-200">3201 6th St, Columbus, Ne 68601, USA</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="lg:col-span-1">
              <h3 className="text-lg font-bold mb-6">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-blue-200 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <p className="text-blue-200 text-center sm:text-left">
                © {currentYear} ExpressEase Service. All rights reserved.
              </p>
              {/* <div className="flex items-center space-x-6 text-sm">
                <a href="/sitemap" className="text-blue-200 hover:text-white transition-colors">
                  Sitemap
                </a>
                <a href="/accessibility" className="text-blue-200 hover:text-white transition-colors">
                  Accessibility
                </a>
                <a href="/security" className="text-blue-200 hover:text-white transition-colors">
                  Security
                </a>
              </div> */}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-blue-200 text-sm mr-2">Follow Us:</span>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.name}
                  className="w-10 h-10 bg-white/10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg border border-white/20 hover:border-transparent"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-40"
        aria-label="Back to top"
      >
        <ArrowRight className="h-6 w-6 text-white transform -rotate-90" />
      </button>
    </footer>
  );
};

export default Footer;