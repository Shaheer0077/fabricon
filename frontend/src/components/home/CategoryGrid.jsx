import React from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hoodie from '../../assets/Images/hoodie.png'
import Men from '../../assets/Images/Men.png'
import Women from '../../assets/Images/Women.png'
import Kids from '../../assets/Images/Kids.png'

const categories = [
    {
        name: 'Men',
        img: Men,
    },
    {
        name: 'Women',
        img: Women,
    },
    {
        name: 'Kids',
        img: Kids,
    },
    {
        name: 'Hoodies',
        img: Hoodie,
    }
];

const CategoryGrid = () => {
    const navigate = useNavigate();

    return (
        <section className="bg-white">
            <div className="container mx-auto px-6 lg:px-40 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Large CTA Card */}
                    <div className="sm:col-span-2 bg-[#003d29] rounded-3xl p-8 flex flex-col justify-center min-h-[300px] relative overflow-hidden group">
                        <div className="relative z-10">
                            <span className="text-[#ff4d00] font-black tracking-[0.2em] text-[9px] uppercase mb-4 block">Fabricon Selection</span>
                            <h2 className="text-3xl md:text-[2.25rem] font-bold text-white mb-4 leading-[1.1] tracking-tight">
                                Timeless items <br />tailored for you
                            </h2>
                            <p className="text-white/60 text-base mb-8 font-medium max-w-md">
                                Discover a curated collection of premium artisanal products. Perfectly crafted, uniquely yours.
                            </p>
                            <button
                                onClick={() => navigate('/catalog')}
                                className="inline-flex items-center gap-3 bg-white hover:bg-[#ff4d00] hover:text-white text-slate-900 px-6 py-3.5 rounded-xl font-black transition-all text-[10px] group shadow-xl uppercase tracking-widest"
                            >
                                EXPLORE ALL
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Abstract background element */}
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700" />
                    </div>

                    {/* Category Cards */}
                    {categories.map((cat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => navigate(`/catalog/${cat.name.toLowerCase()}`)}
                            className="bg-[#f3f4f6] rounded-xl overflow-hidden cursor-pointer relative group h-[300px]"
                        >
                            <img
                                src={cat.img}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            />

                            {/* Title Label */}
                            <div className="absolute bottom-6 left-6 z-10">
                                <span className="bg-white px-4 py-2 rounded-md text-[10px] font-black text-slate-900 shadow-xl inline-block uppercase tracking-widest group-hover:bg-[#ff4d00] group-hover:text-white transition-all duration-300">
                                    {cat.name}
                                </span>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
