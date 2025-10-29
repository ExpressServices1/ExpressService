import React, { useEffect } from 'react';
import { Truck, Globe, Shield, Clock, ArrowRight, Package, Users, Award, MapPin } from 'lucide-react';
import PricingPlans from '../components/PricingSection';
import { pingServer } from "../components/pingServer";
import TestimonialCarousel from "../components/Testimony";

const Home: React.FC = () => {

  // Ping the server when the component mounts
  useEffect(() => {
    pingServer();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Ship <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">Anywhere</span>
                  <br />
                  <span className="text-4xl lg:text-6xl">Lightning Fast</span>
                </h1>
                <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed max-w-2xl">
                  Global shipping solutions that deliver your packages safely, quickly, and affordably to every corner of the world.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/pricing" className="group bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
                  Get Quote Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="/track" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center">
                  Track Package
                  <Package className="ml-2 h-5 w-5" />
                </a >
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">50M+</div>
                    <div className="text-blue-200">Packages Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">200+</div>
                    <div className="text-blue-200">Countries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">99.9%</div>
                    <div className="text-blue-200">On-Time Delivery</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">24/7</div>
                    <div className="text-blue-200">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/10 to-transparent"></div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Our Service</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of shipping with our cutting-edge logistics solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Truck className="h-12 w-12" />,
                title: "Express Delivery",
                description: "Next-day and same-day delivery options for urgent shipments",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Globe className="h-12 w-12" />,
                title: "Global Network",
                description: "Worldwide shipping to over 200 countries and territories",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: <Shield className="h-12 w-12" />,
                title: "Secure Handling",
                description: "Advanced tracking and insurance for complete peace of mind",
                color: "from-green-500 to-teal-500"
              },
              {
                icon: <Clock className="h-12 w-12" />,
                title: "Real-time Tracking",
                description: "Live updates on your package location and delivery status",
                color: "from-orange-500 to-red-500"
              }
            ].map((service, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${service.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>

                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Simple <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Pricing</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent pricing with no hidden fees.
            </p>
          </div>

          <PricingPlans className="py-20 px-6" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">Millions</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Package className="h-8 w-8" />, number: "50M+", label: "Packages Delivered" },
              { icon: <Users className="h-8 w-8" />, number: "2M+", label: "Happy Customers" },
              { icon: <Award className="h-8 w-8" />, number: "15+", label: "Years Experience" },
              { icon: <MapPin className="h-8 w-8" />, number: "200+", label: "Countries Served" }
            ].map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="inline-flex p-4 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Ship Smart</span>?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join millions of customers who trust us with their most important deliveries. Get started today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
              Start Shipping Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            {/* <button className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center">
              Contact Sales
            </button> */}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div>
          <TestimonialCarousel />
        </div>
      </section>
    </div>
  );
};

export default Home;