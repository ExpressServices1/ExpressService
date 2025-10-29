import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';

const companySections = [
    {
        name: 'About Us',
        id: 'about',
        content: `We are a logistics and supply chain company committed to delivering excellence. With years of experience in domestic and international shipping, we bridge the gap between businesses and their customers through innovative and reliable services.`,
        img: "/about_img01.png"
    },
    {
        name: 'Our Story',
        id: 'story',
        content: `Our journey began with a single van and a mission to make logistics more efficient. Today, we operate globally, handling thousands of shipments daily with precision, speed, and care. We believe in continuous innovation and lasting relationships.`,
        img: "/essfavico.png"
    },
    {
        name: 'Locations',
        id: 'locations',
        content: `We have strategically located hubs in over 30 countries worldwide. Our main offices are in New York, London, Lagos, and Dubai, with distribution centers that ensure timely delivery and localized customer support.`,
        img: '', // no image
        fallbackIcon: <Globe className="w-24 h-24 text-indigo-600" />,
    }
];

const CompanyPage: React.FC = () => {
    const { hash } = useLocation();
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
    const [activeId, setActiveId] = useState<string>('about');

    useEffect(() => {
        if (hash) {
            const section = document.querySelector(hash);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [hash]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-50% 0px -50% 0px',
                threshold: 0.1
            }
        );

        companySections.forEach(({ id }) => {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-center ">
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 pt-32 pb-8">
                    <h1 className="text-4xl font-bold text-indigo-100 mb-2">Our  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">Company </span></h1>
                    <p className="text-indigo-100 text-lg">
                        Discover more about who we are, where we came from, and where we're going.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 pt-10 text-white">
                        {companySections.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition bg-indigo-600 hover:bg-indigo-700 ${activeId === section.id ? 'ring-2 ring-white/80' : ''
                                    }`}
                            >
                                {section.name}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-12 max-w-5xl mx-auto pt-32 pb-16 px-6">
                {companySections.map((section) => (
                    <section
                        key={section.id}
                        id={section.id}
                        ref={(el) => {
                            sectionRefs.current[section.id] = el;
                        }}
                        className="scroll-mt-28 bg-white/30 rounded-2xl p-6 shadow-xl backdrop-blur-md"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-full md:w-1/2 flex justify-center items-start">
                                {section.img ? (
                                    <img
                                        src={section.img}
                                        alt={section.name}
                                        className="rounded-lg object-contain w-full h-auto max-h-64"
                                        onError={(e: any) => e.currentTarget.style.display = 'none'}
                                    />
                                ) : section.fallbackIcon ? (
                                    section.fallbackIcon
                                ) : null}
                            </div>

                            <div className="w-full md:w-1/2">
                                <h2 className="text-2xl font-semibold text-indigo-900 mb-4">{section.name}</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</p>
                            </div>
                        </div>

                    </section>
                ))}
            </div>

        </div>
    );
};

export default CompanyPage;
