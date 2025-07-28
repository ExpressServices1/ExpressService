import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

type Section = {
    name: string;
    id: string;
    content: string;
};

const legalSections: Section[] = [
    {
        name: 'Terms of Service',
        id: 'terms',
        content: `By using our platform, you agree to abide by all applicable laws and our company’s service policies.

We reserve the right to modify or discontinue any service without prior notice. Use of the service is at your own risk and subject to all terms stated herein.`
    },
    {
        name: 'Privacy Policy',
        id: 'privacy',
        content: `We value your privacy. All personal data collected through our platform is handled in accordance with international data protection laws.

We never sell or share your information without consent. Data is used strictly for service improvement and logistics coordination.`
    },
    {
        name: 'Shipping Terms',
        id: 'shipping-terms',
        content: `Shipping timelines are estimates and may vary due to customs, weather, or logistical issues.

Clients are responsible for accurate address input. Delays due to incorrect information or unavailable recipients are not covered under standard delivery guarantees.`
    },
    {
        name: 'Prohibited Items',
        id: 'prohibited',
        content: `The following items are not allowed in any shipment:

• Hazardous materials  
• Illegal substances  
• Live animals  
• Firearms or explosives  

Failure to comply may result in shipment confiscation and legal action.`
    }
];

const LegalPage: React.FC = () => {
    const { hash } = useLocation();
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
    const [activeId, setActiveId] = useState<string>('terms');

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
                entries.forEach((entry) => {
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

        legalSections.forEach(({ id }) => {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 ">
            <div className="text-center ">
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 pt-32 pb-8">
                    <h1 className="text-4xl font-bold text-indigo-100 mb-2">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">Policies & Legal </span> </h1>
                    <p className="text-indigo-100 text-lg">
                        Learn more about our terms, shipping guidelines, and how we protect your privacy.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 pt-10 text-white">
                        {legalSections.map((section) => (
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
                {legalSections.map((section) => (
                    <section
                        key={section.id}
                        id={section.id}
                        ref={(el) => {
                            sectionRefs.current[section.id] = el;
                        }}

                        className="scroll-mt-28 bg-white/30 rounded-2xl p-6 shadow-xl backdrop-blur-md"
                    >
                        <h2 className="text-2xl font-semibold text-indigo-900 mb-4">{section.name}</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</p>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default LegalPage;
