import React, { useEffect, useState } from 'react';
import { LucideMail, LucideMapPin, LucidePhone } from 'lucide-react';
import { pingServer } from "../components/pingServer";
import TestimonialCarousel from '../components/Testimony';

const ContactPage: React.FC = () => {
  const [Name, setName] = useState('');
  const [Email, setEmail] = useState('');
  const [Msg, setMsg] = useState('');

  // Ping the server when the component mounts
  useEffect(() => {
    pingServer();
  }, []);

  // State to manage loading state
  const [loading, setLoading] = useState(false);

  const handleContact = async () => {
    const errorElement = document.getElementById('errmsg') as HTMLElement;
    errorElement.textContent = '';
    const name = Name.trim();
    const email = Email.trim();
    const msg = Msg.trim();

    if (!name || !email || !msg) {
      errorElement.textContent = 'Please fill in all fields.';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      errorElement.textContent = 'Please enter a valid email address.';
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://expressback-kylv.onrender.com/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, msg })
      });
      const data = await response.json();
      if (response.ok) {
        errorElement.style.color = 'green';
        errorElement.textContent = 'Message sent successfully!';
        setTimeout(() => {
          errorElement.textContent = '';
          errorElement.style.color = '';
          setName('');
          setEmail('');
          setMsg('');
        }, 3000);

      } else {
        errorElement.textContent = `Contacting Us Failed: ${data.error}`;
      }
    } catch (error) {
      //console.error('Error sending message:', error);
      errorElement.textContent = 'Error sending message. Please try again later.';
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleContact();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ">
      <div className=" text-center">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 pt-32 pb-16">
          <h1 className="text-4xl font-bold text-indigo-100 mb-3">Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">Touch </span></h1>
          <p className="text-indigo-100 text-lg">
            Have questions about shipping, delivery, or partnerships? Our support team is here to help.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto pt-20 pb-20 px-6">
        {/* Contact Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('Message submitted! (This is a mock form)');
          }}
          className="bg-white/40 rounded-2xl p-8 shadow-xl backdrop-blur-md"
        >
          <h2 className="text-2xl font-semibold text-indigo-900 mb-6">Send Us a Message</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={Name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              required
              rows={5}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={Msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            ></textarea>
            <p className="text-lg text-red-600 mt-2 text-left" id="errmsg"></p>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-md transition"
            onClick={handleContact}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        {/* Contact Info */}
        <div className="flex flex-col gap-6 justify-center text-gray-700">
          <div className="flex items-start gap-4">
            <LucideMail className="text-indigo-600 mt-1" />
            <div>
              <h3 className="font-semibold text-lg text-indigo-800">Email Support</h3>
              <p>support@expresseaseservice.xyz</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <LucidePhone className="text-indigo-600 mt-1" />
            <div>
              <h3 className="font-semibold text-lg text-indigo-800">Phone</h3>
              <p>+1 (647) 493-6699</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <LucideMapPin className="text-indigo-600 mt-1" />
            <div>
              <h3 className="font-semibold text-lg text-indigo-800">Head Office</h3>
              <p>3201 6th St, Columbus, Ne 68601, USA</p>
            </div>
          </div>

          <div className="pt-6">
            <h3 className="font-semibold text-lg text-indigo-800">Business Hours</h3>
            <p>Mon–Fri: 8am – 6pm<br />Sat: 9am – 2pm</p>
          </div>
        </div>
      </div>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div>
          <TestimonialCarousel />
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
