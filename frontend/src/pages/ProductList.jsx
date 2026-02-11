import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/catalog/Sidebar';
import ProductCard from '../components/catalog/ProductCard';
import { ChevronRight, SlidersHorizontal, ChevronDown, LayoutGrid, List, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/client';

const ProductList = () => {
    const { category } = useParams();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('q');

    const categoryTitle = searchQuery
        ? `Results for "${searchQuery}"`
        : (category
            ? category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            : "All Products");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const { data } = await API.get('/products');

                let filtered = data;

                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    filtered = data.filter(p =>
                        p.title?.toLowerCase().includes(q) ||
                        p.category?.toLowerCase().includes(q) ||
                        p.description?.toLowerCase().includes(q)
                    );
                } else if (category && category.toLowerCase() !== 'all') {
                    filtered = data.filter(p => {
                        const productCat = p.category?.toLowerCase().replace(/ /g, '-');
                        const urlCat = category.toLowerCase();
                        return productCat === urlCat;
                    });
                }

                setProducts(filtered);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category, searchQuery]);

    return (
        <div className="bg-[#fafafa] min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-6 lg:px-12">

                {/* Header section with Breadcrumbs */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                        <Link to="/" className="hover:text-[#ff4d00] transition-colors">Home</Link>
                        <ChevronRight size={12} />
                        <Link to="/catalog" className="hover:text-[#ff4d00] transition-colors">Catalog</Link>
                        {(category || searchQuery) && (
                            <>
                                <ChevronRight size={12} />
                                <span className="text-slate-900">{categoryTitle}</span>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                                {categoryTitle}
                            </h1>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                                {products.length} Items Available
                            </p>
                        </motion.div>

                        <div className="flex items-center gap-3">
                            <div className="flex p-1 bg-white rounded-xl border border-slate-200">
                                <button className="p-2 text-[#ff4d00] bg-orange-50 rounded-lg"><LayoutGrid size={18} /></button>
                                <button className="p-2 text-slate-400 hover:text-slate-600"><List size={18} /></button>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-[#ff4d00] transition-all">
                                <SlidersHorizontal size={16} /> Filter
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <div className="sticky top-32 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <Sidebar />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-grow">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-[#ff4d00] border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Filtering Archives...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center px-10">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-8">
                                    <Search size={32} className="text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">No results found</h3>
                                <p className="text-slate-500 max-w-sm mb-10 font-medium">We couldn't find any products matching your criteria. Try adjusting your search or category.</p>
                                <Link to="/catalog" className="px-10 py-4 bg-[#ff4d00] text-white rounded-2x font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-orange-500/10">
                                    Return to Catalog
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={{
                                            id: product._id,
                                            title: product.title,
                                            image: product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`) : 'https://via.placeholder.com/400x500?text=Fabricon',
                                            price: product.price,
                                            category: product.category,
                                            rating: 4.8,
                                            reviews: 120,
                                            colors: product.colors || [],
                                            sizes: product.sizes?.join(' - ') || "S - XL"
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
