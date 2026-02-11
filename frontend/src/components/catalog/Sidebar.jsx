import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { name: "All products", path: "/catalog" },
        { name: "Men", path: "/catalog/men" },
        { name: "Women", path: "/catalog/women" },
        { name: "Kids", path: "/catalog/kids" },
        { name: "Hoodies", path: "/catalog/hoodies" },
        { name: "Accessories", path: "/catalog/accessories" },
    ];

    const topMenu = [
        "Special offers",
        "New products",
        "Bestsellers",
        "Eco-friendly",
    ];

    const hoverColor = "hover:text-[#ff4d00]";

    return (
        <aside className="w-full">
            <nav className="space-y-8">
                {/* Categories */}
                <div>
                    <h3 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Categories</h3>
                    <ul className="space-y-1">
                        {menuItems.map((item, i) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={i}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center justify-between px-3 py-2 text-[13px] font-bold rounded-xl transition-all ${isActive
                                                ? "bg-orange-50 text-[#ff4d00]"
                                                : `text-slate-600 ${hoverColor}`
                                            }`}
                                    >
                                        <span>{item.name}</span>
                                        <ChevronDown size={14} className={isActive ? "text-[#ff4d00]" : "text-slate-300"} />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="border-t border-slate-100 mx-2" />

                {/* Filter Markers */}
                <div>
                    <h3 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Highlights</h3>
                    <ul className="space-y-1">
                        {topMenu.map((item, i) => (
                            <li key={i}>
                                <button className={`block w-full text-left px-3 py-2 text-[13px] font-bold text-slate-600 ${hoverColor} transition-colors whitespace-nowrap`}>
                                    {item}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
