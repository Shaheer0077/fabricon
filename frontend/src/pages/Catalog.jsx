import React from 'react';
import Sidebar from '../components/catalog/Sidebar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categories = [
    {
        title: "Men",
        slug: "men",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
    },
    {
        title: "Women",
        slug: "women",
        image: "https://images.unsplash.com/photo-1506629082923-d9ad3393a884?q=80&w=800&auto=format&fit=crop",
    },
    {
        title: "Kids",
        slug: "kids",
        image: "https://images.unsplash.com/photo-1544816153-1f17fa370604?q=80&w=800&auto=format&fit=crop",
    },
    {
        title: "Hoodies",
        slug: "hoodies",
        image: "https://static.cdn.printful.com/s/static/v877/images/homepage/fancy-product-images/img7b.png",
    }
];

const Catalog = () => {
    return (
        <div className="bg-[#fafafa] min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Sidebar */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="sticky top-32 p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <Sidebar />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow">
                        <div className="mb-12">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Master Catalog</h1>
                            <p className="text-slate-500 font-medium text-lg italic opacity-70">Curated craftsmanship for the discerning soul.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {categories.map((cat, i) => (
                                <Link
                                    to={`/catalog/${cat.slug}`}
                                    key={i}
                                    className="group block relative overflow-hidden rounded-[1.5rem] h-[280px] bg-slate-100 border border-slate-200 transition-all shadow-sm hover:shadow-xl"
                                >
                                    <motion.img
                                        src={cat.image}
                                        alt={cat.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

                                    <div className="absolute bottom-6 left-6">
                                        <span className="text-[#ff4d00] font-black text-[9px] uppercase tracking-[0.2em] mb-1 block">Browse</span>
                                        <h3 className="text-xl font-black text-white tracking-tight">{cat.title}</h3>
                                    </div>
                                </Link>
                            ))}

                            <Link
                                to={`/catalog`}
                                className="group block relative overflow-hidden rounded-[1.5rem] h-[280px] bg-slate-900 flex flex-col items-center justify-center p-8 text-center"
                            >
                                <div className="w-10 h-10 bg-[#ff4d00] rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                    <ArrowRight size={20} className="text-white" />
                                </div>
                                <h3 className="text-xl font-black text-white tracking-tight mb-2">View All</h3>
                                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest leading-none">Complete Archives</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal icon for the fallback card
const ArrowRight = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

export default Catalog;
