import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleDropdown = (dropdown: string) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    };

    const navItems = [
        { name: 'Home', href: '/' },
        {
            name: 'Services',
            href: '/services',
            dropdown: [
                { name: 'Express Shipping', href: '/services#express' },
                { name: 'International Shipping', href: '/services#international' },
                { name: 'Freight Services', href: '/services#freight' },
            ]
        },
        { name: 'Track Package', href: '/track' },
        { name: 'Pricing', href: '/pricing' },
        {
            name: 'Company',
            href: '/company',
            dropdown: [
                { name: 'About Us', href: '/company#about' },
                { name: 'Locations', href: '/company#locations' }
            ]
        },
        { name: 'Contact', href: '/contact' }
    ];

    const logoUrl = "/essfavico.png";

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/20'
            : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <a href="/">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <div className="w-15 h-12 bg-gradient-to-r from-white-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                                    {/* <Truck className="h-7 w-7 text-white" /> */}
                                    <img src={logoUrl} className="h-20 w-20" alt="" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                                    Express<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">Ease</span>
                                </h1>
                                <p className={`text-xs ${isScrolled ? 'text-gray-500' : 'text-white/80'}`}>Service</p>
                            </div>
                        </div>
                    </a>

                    {/* Desktop and Mobile Navigation */}
                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-10">
                        {navItems.map((item) => (
                            <div key={item.name} className="relative group">
                                <a
                                    href={item.href}
                                    className={`flex items-center space-x-1 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isScrolled
                                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        : 'text-white hover:text-white hover:bg-white/10'
                                        }`}
                                    onClick={item.dropdown ? (e) => { e.preventDefault(); toggleDropdown(item.name); } : undefined}
                                >
                                    <span>{item.name}</span>
                                    {item.dropdown && (
                                        <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''
                                            }`} />
                                    )}
                                </a>

                                {/* Dropdown Menu */}
                                {item.dropdown && (
                                    <div className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 transition-all duration-300 ${activeDropdown === item.name ? 'opacity-100 visible transform translate-y-0' : 'opacity-0 invisible transform -translate-y-2'
                                        }`}>
                                        {item.dropdown.map((dropdownItem) => (
                                            <a
                                                key={dropdownItem.name}
                                                href={dropdownItem.href}
                                                className="block px-2 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                            >
                                                {dropdownItem.name}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/*Mobile CTA Buttons */}
                    <div className=" lg:flex items-center space-x-1">
                        <button className={`p-1.5 rounded-lg transition-all duration-300 ${isScrolled
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-white hover:bg-white/10'
                            }`}>
                            {/* <a href="/login">
                                <User className="h-5 w-5" />
                            </a> */}
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`lg:hidden p-2 rounded-lg transition-colors ${isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                            }`}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden bg-white/95 backdrop-blur-lg border-t border-gray-200`}>
                <div className="px-2 py-6 space-y-4">
                    {navItems.map((item) => (
                        <div key={item.name}>
                            <a
                                href={item.href}
                                className="block px-2 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
                                onClick={item.dropdown ? (e) => { e.preventDefault(); toggleDropdown(item.name); } : undefined}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{item.name}</span>
                                    {item.dropdown && (
                                        <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''
                                            }`} />
                                    )}
                                </div>
                            </a>

                            {/* Mobile Dropdown */}
                            {item.dropdown && activeDropdown === item.name && (
                                <div className="ml-4 mt-2 space-y-2">
                                    {item.dropdown.map((dropdownItem) => (
                                        <a
                                            key={dropdownItem.name}
                                            href={dropdownItem.href}
                                            className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                        >
                                            {dropdownItem.name}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;