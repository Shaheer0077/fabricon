import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Truck,
    ShieldCheck,
    Plus,
    Minus,
    CheckCircle2,
    ShoppingBag,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/client';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { product, customizedImage, color } = location.state || {};

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        zipCode: '',
        phone: ''
    });

    const [orderItems, setOrderItems] = useState([
        { id: 1, size: 'M', quantity: 1, color: color || '#ffffff', fabric: 'Cotton 100%', logoType: 'DTF' }
    ]);

    const [orderPlaced, setOrderPlaced] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!product) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-6">No order data found</p>
                    <button
                        onClick={() => navigate('/catalog')}
                        className="px-8 py-4 bg-black text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#ff4d00] transition-colors"
                    >
                        Return to Catalog
                    </button>
                </div>
            </div>
        );
    }

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...orderItems];
        if (field === 'fabric' || field === 'logoType') {
            // Synchronize global selections across all items
            newItems.forEach(item => {
                item[field] = value;
            });
        } else {
            newItems[index][field] = value;
        }
        setOrderItems(newItems);
    };

    const addItem = () => {
        const lastItem = orderItems[orderItems.length - 1];
        setOrderItems([...orderItems, {
            id: Date.now(),
            size: 'M',
            quantity: 1,
            color: color || '#ffffff',
            fabric: lastItem.fabric,
            logoType: lastItem.logoType
        }]);
    };

    const removeItem = (index) => {
        if (orderItems.length > 1) {
            setOrderItems(orderItems.filter((_, i) => i !== index));
        }
    };

    const totalQuantity = orderItems.reduce((acc, item) => acc + item.quantity, 0);

    // Dynamic Pricing Logic: Higher quantity = Lower unit price
    const getUnitPrice = (qty) => {
        const basePrice = product.price || 0;
        if (qty === 1) return basePrice * 1.2; // 20% premium for single item
        if (qty < 5) return basePrice;           // Standard price for 2-4 items
        if (qty < 20) return basePrice * 0.9;    // 10% discount for 5-19 items
        if (qty < 50) return basePrice * 0.8;    // 20% discount for 20-49 items
        return basePrice * 0.7;                  // 30% discount for 50+ items
    };

    const currentUnitPrice = getUnitPrice(totalQuantity);
    const totalPrice = totalQuantity * currentUnitPrice;
    const baseTotalPrice = totalQuantity * (product.price || 0);
    const totalSavings = baseTotalPrice - totalPrice + (totalQuantity === 1 ? (product.price * 0.2) : 0);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email || !formData.address || !formData.city || !formData.zipCode || !formData.phone) {
            alert("Please fill in all required delivery details.");
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                customer: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone
                },
                shippingAddress: {
                    address: formData.address,
                    city: formData.city,
                    zipCode: formData.zipCode
                },
                items: orderItems.map(item => ({
                    product: product._id,
                    title: product.title,
                    image: customizedImage || product.images?.[0],
                    size: item.size,
                    quantity: item.quantity,
                    color: item.color,
                    fabric: item.fabric,
                    logoType: item.logoType,
                    price: product.price
                })),
                totalPrice: totalPrice
            };

            await API.post('/orders', orderData);
            setOrderPlaced(true);
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="text-emerald-500" size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Order Received!</h2>
                    <p className="text-slate-500 font-medium mb-12">
                        Your custom creation for <span className="text-slate-900 font-bold">{product.title}</span> is being processed.
                        We'll send a confirmation to <span className="text-slate-900 font-bold">{formData.email}</span> shortly.
                    </p>
                    <button
                        onClick={() => navigate('/catalog')}
                        className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#ff4d00] transition-all shadow-xl shadow-slate-200"
                    >
                        Continue Shopping
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-20 px-6 sm:px-10 md:px-50">
            <div className="max-w-7xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-10 group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Studio</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Left: Form */}
                    <div className="lg:col-span-7 space-y-16">
                        <section>
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-slate-200">1</div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Delivery Details</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Where should we send your creation?</p>
                                </div>
                            </div>

                            <form className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Your Name"
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[#ff4d00] focus:ring-4 focus:ring-orange-50 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="name@example.com"
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[#ff4d00] focus:ring-4 focus:ring-orange-50 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+92 307 8182447"
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[#ff4d00] focus:ring-4 focus:ring-orange-50 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Shipping Address</label>
                                    <textarea
                                        name="address"
                                        required
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Street name and House number"
                                        rows={2}
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[#ff4d00] focus:ring-4 focus:ring-orange-50 transition-all resize-none shadow-sm"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="Lahore"
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[#ff4d00] focus:ring-4 focus:ring-orange-50 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Zip Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        required
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        placeholder="54000"
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[#ff4d00] focus:ring-4 focus:ring-orange-50 transition-all shadow-sm"
                                    />
                                </div>
                            </form>
                        </section>

                        <section>
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-slate-200">2</div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Stock & Specs</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select quantities for each variant</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Global Configuration: Fabric & Logo Type */}
                                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-8 grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Primary Fabric</label>
                                        <div className="relative">
                                            <select
                                                value={orderItems[0].fabric}
                                                onChange={(e) => updateItem(0, 'fabric', e.target.value)}
                                                className="w-full bg-white border border-slate-100 rounded-xl px-6 py-4 text-xs font-black text-slate-900 outline-none focus:border-black transition-all appearance-none cursor-pointer pr-12 shadow-sm"
                                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 20px center', backgroundSize: '16px' }}
                                            >
                                                {['Cotton 100%', 'Cotton 75%', 'Heece 25%', 'Polyster 100%', 'Polyster Heece', 'Spendex'].map(f => (
                                                    <option key={f} value={f}>{f}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight pl-1 ">Applied to all variants in this order</p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Print/Logo Method</label>
                                        <div className="relative">
                                            <select
                                                value={orderItems[0].logoType}
                                                onChange={(e) => updateItem(0, 'logoType', e.target.value)}
                                                className="w-full bg-white border border-slate-100 rounded-xl px-6 py-4 text-xs font-black text-slate-900 outline-none focus:border-black transition-all appearance-none cursor-pointer pr-12 shadow-sm"
                                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 20px center', backgroundSize: '16px' }}
                                            >
                                                {['Embroidery', 'DTF', 'Screen Print'].map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight pl-1 ">Consistent across entire batch</p>
                                    </div>
                                </div>

                                {/* Variants List */}
                                <div className="space-y-4">
                                    <AnimatePresence initial={false}>
                                        {orderItems.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-6">
                                                    {/* Size Selector Group */}
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest block ml-1">Select Size</label>
                                                        <div className="flex gap-2">
                                                            {['S', 'M', 'L', 'XL', '2XL'].map(s => (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => updateItem(index, 'size', s)}
                                                                    className={`w-11 h-11 rounded-xl border-2 transition-all font-black text-xs ${item.size === s ? 'border-black bg-black text-white shadow-lg' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'}`}
                                                                >
                                                                    {s}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Base Color Group */}
                                                    <div className="space-y-3 flex-1 min-w-[150px]">
                                                        <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest block text-center">Base Color</label>
                                                        <div className="flex items-center justify-center">
                                                            <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 shadow-inner">
                                                                <div className="w-5 h-6 rounded-md shadow-sm border-2 border-white ring-1 ring-slate-200" style={{ backgroundColor: item.color }} />
                                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Primary</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Quantity Group */}
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest block text-center">Batch Quantity</label>
                                                        <div className="flex items-center bg-white rounded-2xl px-2 py-1.5 border-2 border-slate-100 group-hover:border-slate-200 transition-all shadow-sm">
                                                            <button onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))} className="w-8 h-10 flex items-center justify-center text-slate-300 hover:text-black transition-colors"><Minus size={16} /></button>
                                                            <span className="w-10 text-center text-sm font-black text-slate-900">{item.quantity}</span>
                                                            <button onClick={() => updateItem(index, 'quantity', item.quantity + 1)} className="w-8 h-10 flex items-center justify-center text-slate-300 hover:text-black transition-colors"><Plus size={16} /></button>
                                                        </div>
                                                    </div>

                                                    {/* Floating Removal Action - Outside Top Right */}
                                                    {orderItems.length > 1 && (
                                                        <button
                                                            onClick={() => removeItem(index)}
                                                            className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 w-9 h-9 flex items-center justify-center rounded-xl bg-red-500 text-white shadow-lg shadow-red-200 z-20 hover:bg-black hover:shadow-black/20"
                                                            title="Remove variant"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    <button
                                        onClick={addItem}
                                        className="w-full py-6 bg-white border-2 border-dashed border-slate-100 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-[#ff4d00] hover:text-[#ff4d00] hover:bg-orange-50/20 transition-all flex items-center justify-center gap-4 group shadow-sm hover:shadow-md"
                                    >
                                        <div className="w-6 h-6 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-[#ff4d00] group-hover:text-white transition-all">
                                            <Plus size={14} />
                                        </div>
                                        Add Another Specification
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-10 bg-white border border-slate-200 rounded-[1rem] p-12 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50/50 rounded-full translate-x-16 -translate-y-16" />

                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-12 relative flex items-center gap-3">
                                <ShoppingBag size={18} className="text-[#ff4d00]" />
                                Your Order
                            </h3>

                            <div className="flex gap-8 mb-12 pb-12 border-b-2 border-dashed border-slate-100 relative">
                                <div className="w-36 aspect-[4/5] bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 p-4 group shadow-sm flex items-center justify-center">
                                    <img src={customizedImage} alt="" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="flex flex-col justify-center flex-1">
                                    <span className="text-[10px] font-black text-[#ff4d00] uppercase tracking-widest mb-2 px-3 py-1 bg-orange-50 rounded-full self-start">{product.category}</span>
                                    <h4 className="text-2xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">{product.title}</h4>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="w-6 h-6 rounded-lg border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custom Finish</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 mb-12">
                                <div className="flex justify-between items-center text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>Base Unit Price</span>
                                    <span className="text-slate-900">${product.price?.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest border-y-2 border-dashed border-slate-50 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-slate-400">Quantity Applied</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-black bg-slate-100 px-2 py-0.5 rounded-md text-[9px]">{totalQuantity} Units</span>
                                            {totalQuantity > 1 && (
                                                <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md text-[9px]">
                                                    {totalQuantity >= 50 ? '30% WHOLESALE' :
                                                        totalQuantity >= 20 ? '20% TIER 2' :
                                                            totalQuantity >= 5 ? '10% TIER 1' : 'Standard'}
                                                </span>
                                            )}
                                            {totalQuantity === 1 && (
                                                <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md text-[9px]">SINGLE UNIT FEE APPLIED</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-slate-900 text-lg">${currentUnitPrice.toFixed(2)} /unit</span>
                                </div>

                                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>Priority Shipping</span>
                                    <span className="text-emerald-500 font-black">COMPLIMENTARY</span>
                                </div>

                                {totalQuantity > 4 && (
                                    <div className="flex justify-between text-[11px] font-black text-emerald-500 uppercase tracking-widest">
                                        <span>Bulk Savings</span>
                                        <span className="">-${(baseTotalPrice - totalPrice).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="pt-10 border-t-2 border-slate-900/5 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Grand Total</p>
                                        <p className="text-5xl font-black text-slate-900 tracking-tighter leading-none">${totalPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className={`w-full py-6 bg-black text-white rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-300 hover:bg-[#ff4d00] hover:shadow-[#ff4d00]/30 transition-all active:scale-[0.98] relative overflow-hidden group flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="relative z-10">Confirm Purchase</span>
                                        <div className="absolute top-0 -left-full w-full h-full bg-white/10 group-hover:left-full transition-all duration-700 skewed-glass" />
                                    </>
                                )}
                            </button>

                            <div className="mt-10 pt-10 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 group cursor-default">
                                    <ShieldCheck size={18} className="text-emerald-500" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Encrypted</span>
                                </div>
                                <div className="flex items-center gap-2 group cursor-default">
                                    <Truck size={18} className="text-[#ff4d00]" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Priority</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .skewed-glass {
                    transform: skewX(-20deg);
                }
            `}</style>
        </div>
    );
};

export default Checkout;
