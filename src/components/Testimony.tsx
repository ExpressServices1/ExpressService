import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  Facebook,
  Linkedin,
  Send,
  Twitter,
  Instagram,
} from "lucide-react";

const testimonials = [
  {
    title: "Enhanced Shipping Experience",
    text: "The innovative logistics system has transformed how we handle deliveries. Their technology-driven process ensures faster dispatch, real-time tracking, and reliable arrivals. We’ve saved significant time and boosted customer satisfaction with every shipment.",
    name: "Olivia Martins",
    image: "https://randomuser.me/api/portraits/women/49.jpg",
    socialmedia: Linkedin,
  },
  {
    title: "Quality Service and Great Support",
    text: "Throughout our delivery operations, any issues or questions were handled quickly and professionally. The SwiftShip team’s responsiveness and dedication to customer satisfaction have made logistics smooth, reliable, and stress-free for our business.",
    name: "Julia Roberts",
    image: "https://randomuser.me/api/portraits/men/62.jpg",
    socialmedia: Facebook,
  },
  {
    title: "Reliable and Efficient Service",
    text: "The team consistently delivers high-quality work on time. Their attention to detail and commitment to excellence have made them a trusted partner for our logistics needs.",
    name: "Liam Johnson",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    socialmedia: Linkedin,
  },
  {
    title: "Seamless Delivery Partnership",
    text: "Working with the SwiftShip team has been effortless from start to finish. Communication is always clear, pickups are on time, and deliveries consistently exceed expectations. It’s been a professional and reliable partnership every step of the way.",
    name: "James Walker",
    image: "https://randomuser.me/api/portraits/women/64.jpg",
    socialmedia: Instagram,
  },
  {
    title: "Exceptional Logistics Solutions",
    text: "The logistics solutions provided have significantly improved our supply chain efficiency. Their innovative approach and use of technology have streamlined our operations, resulting in faster deliveries and reduced costs.",
    name: "Sophia Lee",
    image: "https://randomuser.me/api/portraits/women/80.jpg",
    socialmedia: Send,
  },
  {
    title: "Outstanding Customer Service",
    text: "The customer service team is always available to assist with any inquiries or issues. Their professionalism and dedication to customer satisfaction have made our logistics experience smooth and hassle-free.",
    name: "Michael Brown",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    socialmedia: Twitter,
  },
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const testimonial = testimonials[index];

  const resetTimer = (delay: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, delay);
  };

  const next = () => {
    setIndex((i) => (i + 1) % testimonials.length);
    resetTimer(10000);
  };

  const prev = () => {
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
    resetTimer(10000);
  };

  // Auto switch timer
  useEffect(() => {
    resetTimer(3000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      };
    };
  }, []);

  // Pause on hover
  useEffect(() => {
    if (hovered) timerRef.current && clearInterval(timerRef.current);
    else resetTimer(3000);
  }, [hovered]);

  // Auto-scroll active image into view
  useEffect(() => {
  const container = scrollContainerRef.current;
  if (!container) return;

  const activeImage = container.children[index] as HTMLElement;
  if (!activeImage) return;

  // Calculate position manually to avoid full-page scroll
  const containerRect = container.getBoundingClientRect();
  const imageRect = activeImage.getBoundingClientRect();

  const offset =
    imageRect.left -
    containerRect.left -
    containerRect.width / 2 +
    imageRect.width / 2;

  container.scrollBy({ left: offset, behavior: "smooth" });
}, [index]);


  return (
    <div
      className="w-full max-w-5xl mx-auto text-center py-16 px-4 bg-gray-50 rounded-3xl shadow-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Section Header */}
      <div className="mb-10">
        <p className="text-indigo-600 font-medium">Clients Reviews</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Our Clients <span className="text-indigo-600">Love Us</span> Because
          of Our Quality Work
        </h2>
      </div>

      {/* Avatar Navigation */}
      <div className="flex items-center justify-center gap-2 md:gap-4 mb-10">
        <button
          onClick={prev}
          className="p-2 rounded-full hover:bg-indigo-50 border border-gray-300 flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Avatar list — hidden scrollbar, scrollable if needed */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 px-2 sm:px-4 max-w-[80vw] md:max-w-none overflow-x-auto scroll-smooth no-scrollbar flex-nowrap justify-start md:justify-center"
        >
          {testimonials.map((t, i) => (
            <img
              key={i}
              src={t.image}
              alt={t.name}
              onClick={() => setIndex(i)}
              className={`rounded-xl object-cover cursor-pointer transition-all duration-300 ${i === index
                  ? "ring-2 ring-indigo-600 scale-105"
                  : "opacity-50 hover:opacity-100"
                } w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="p-2 rounded-full hover:bg-indigo-50 border border-gray-300 flex-shrink-0"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Testimonial Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-md rounded-3xl px-6 py-10 md:px-10 md:py-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 max-w-4xl mx-auto"
        >
          <div className="relative flex-shrink-0">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-indigo-100"
            />
            <div className="absolute -top-0 -right-1 bg-indigo-600 text-white p-2 rounded-full shadow-md">
              <Quote size={20} />
            </div>
          </div>

          <div className="text-left flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              “{testimonial.title}”
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {testimonial.text}
            </p>
            <p className="font-bold text-gray-900">{testimonial.name}</p>

            {testimonial.socialmedia && (
              <div className="flex gap-4 mt-3">
                <testimonial.socialmedia
                  size={20}
                  className="text-indigo-600 hover:text-indigo-800 cursor-pointer transition"
                />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
