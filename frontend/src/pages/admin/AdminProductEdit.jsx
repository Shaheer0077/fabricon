import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Check, Image as ImageIcon, Plus, Info } from 'lucide-react';
import API from '../../api/client';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { motion } from 'framer-motion';

const AdminProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [colors, setColors] = useState('');
    const [sizes, setSizes] = useState('');
    const [images, setImages] = useState([]);

    // View States
    const [views, setViews] = useState({
        front: null,
        back: null,
        leftSleeve: null,
        rightSleeve: null,
        insideLabel: null,
        outsideLabel: null
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const adminInfo = localStorage.getItem('adminInfo');
        if (!adminInfo) {
            navigate('/admin/login');
        } else if (id) {
            fetchProduct();
        }
    }, [id, navigate]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const { data } = await API.get(`/products/${id}`);
            setTitle(data.title);
            setPrice(data.price);
            setCategory(data.category);
            setDescription(data.description);
            setColors(data.colors ? data.colors.join(', ') : '');
            setSizes(data.sizes ? data.sizes.join(', ') : '');
            setImages(data.images || []);

            // Set Views
            if (data.views) {
                setViews({
                    front: data.views.front || null,
                    back: data.views.back || null,
                    leftSleeve: data.views.leftSleeve || null,
                    rightSleeve: data.views.rightSleeve || null,
                    insideLabel: data.views.insideLabel || null,
                    outsideLabel: data.views.outsideLabel || null
                });
            }

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const uploadFileHandler = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImages([...images, file]);
    };

    const handleViewUpload = (e, viewName) => {
        const file = e.target.files[0];
        if (!file) return;
        setViews(prev => ({ ...prev, [viewName]: file }));
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('price', price);
            formData.append('category', category);
            formData.append('description', description);

            colors.split(',').map(c => c.trim()).filter(c => c).forEach(c => formData.append('colors', c));
            sizes.split(',').map(s => s.trim()).filter(s => s).forEach(s => formData.append('sizes', s));

            // General Images
            images.forEach((img) => {
                if (typeof img === 'string') {
                    formData.append('existingImages', img);
                } else {
                    formData.append('images', img);
                }
            });

            // View Images
            if (views.front instanceof File) formData.append('viewFront', views.front);
            if (views.back instanceof File) formData.append('viewBack', views.back);
            if (views.leftSleeve instanceof File) formData.append('viewLeftSleeve', views.leftSleeve);
            if (views.rightSleeve instanceof File) formData.append('viewRightSleeve', views.rightSleeve);
            if (views.insideLabel instanceof File) formData.append('viewInsideLabel', views.insideLabel);
            if (views.outsideLabel instanceof File) formData.append('viewOutsideLabel', views.outsideLabel);

            if (id) {
                await API.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            navigate('/admin');
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving product');
        } finally {
            setLoading(false);
        }
    };

    const renderViewUpload = (label, viewKey) => (
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <label className="cursor-pointer relative aspect-square bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center hover:border-[#ff4d00]/50 hover:bg-orange-50/20 transition-all group overflow-hidden">
                {views[viewKey] ? (
                    <img
                        src={views[viewKey] instanceof File ? URL.createObjectURL(views[viewKey]) : (views[viewKey].startsWith('http') ? views[viewKey] : `http://localhost:5000${views[viewKey]}`)}
                        alt={label}
                        className="w-full h-full object-contain p-2 mix-blend-multiply"
                    />
                ) : (
                    <div className="flex flex-col items-center">
                        <Plus size={20} className="text-slate-300 group-hover:text-[#ff4d00] transition-colors" />
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Upload</span>
                    </div>
                )}
                <input type="file" className="hidden" onChange={(e) => handleViewUpload(e, viewKey)} accept="image/*" />
            </label>
            {views[viewKey] && (
                <button onClick={() => setViews(prev => ({ ...prev, [viewKey]: null }))} className="text-[9px] text-red-500 font-bold hover:underline self-center">Remove</button>
            )}
        </div>
    );

    if (loading && id) return <div className="h-screen flex items-center justify-center font-black text-slate-300 uppercase tracking-widest text-xs">Loading Blueprint...</div>;

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <AdminSidebar />

            <div className="flex-grow lg:ml-60 p-6 md:p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                {id ? 'Refine Product' : 'New Creation'}
                            </h1>
                            <p className="text-slate-400 text-xs font-bold mt-1">Configure your artisanal assets and market specs</p>
                        </div>

                        <button
                            onClick={submitHandler}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 bg-[#ff4d00] hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/10 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={18} /> {id ? 'Save Changes' : 'Publish Product'}</>}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Media Column */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Specific Views Section */}
                            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                                    <ImageIcon size={14} className="text-[#ff4d00]" /> Configuration Views
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {renderViewUpload('Front View', 'front')}
                                    {renderViewUpload('Back View', 'back')}
                                    {renderViewUpload('L. Sleeve', 'leftSleeve')}
                                    {renderViewUpload('R. Sleeve', 'rightSleeve')}
                                    {renderViewUpload('Inside', 'insideLabel')}
                                    {renderViewUpload('Outside', 'outsideLabel')}
                                </div>
                            </section>

                            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                                    <ImageIcon size={14} className="text-[#ff4d00]" /> Gallery Visuals
                                </h3>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {images.map((img, index) => (
                                        <div key={index} className="relative aspect-square bg-slate-50 rounded-xl border border-slate-100 overflow-hidden group">
                                            <img
                                                src={typeof img === 'string' ? (img.startsWith('http') ? img : `http://localhost:5000${img}`) : URL.createObjectURL(img)}
                                                alt=""
                                                className="w-full h-full object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-white shadow-md text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    <label className="cursor-pointer aspect-square bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center hover:border-[#ff4d00]/50 hover:bg-orange-50/20 transition-all group">
                                        <Plus size={20} className="text-slate-300 group-hover:text-[#ff4d00] transition-colors" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Upload</span>
                                        <input type="file" className="hidden" onChange={uploadFileHandler} multiple />
                                    </label>
                                </div>

                                <p className="text-slate-400 text-[9px] font-bold leading-relaxed flex items-start gap-2 italic">
                                    <Info size={10} className="mt-0.5 shrink-0" /> Higher resolution PNGs with transparency provide the best results.
                                </p>
                            </section>

                            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100/50">
                                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Check size={12} /> Sync Status
                                </h4>
                                <p className="text-[10px] text-blue-900/60 font-medium leading-normal">
                                    Changes are synchronized with the primary node immediately upon publication.
                                </p>
                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="lg:col-span-8">
                            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-black text-slate-900 mb-8 uppercase tracking-[0.2em] border-b border-slate-100 pb-4">Specifications Blueprint</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Market Identity</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Archetype Heavyweight Tee"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#ff4d00]/30 focus:bg-white rounded-xl font-bold text-sm text-slate-900 outline-none transition-all"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Price Point (USD)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#ff4d00]/30 focus:bg-white rounded-xl font-bold text-sm text-slate-900 outline-none transition-all"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Domain Category</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#ff4d00]/30 focus:bg-white rounded-xl font-bold text-sm text-slate-900 outline-none transition-all appearance-none cursor-pointer"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Men">Men</option>
                                            <option value="Women">Women</option>
                                            <option value="Kids">Kids</option>
                                            <option value="Hoodies">Hoodies</option>
                                            <option value="Accessories">Accessories</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Size Tier (CSV)</label>
                                        <input
                                            type="text"
                                            placeholder="S, M, L, XL"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#ff4d00]/30 focus:bg-white rounded-xl font-bold text-sm text-slate-900 outline-none transition-all"
                                            value={sizes}
                                            onChange={(e) => setSizes(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Chromatic Registry</label>
                                        <input
                                            type="text"
                                            placeholder="#000000, #FFFFFF"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#ff4d00]/30 focus:bg-white rounded-xl font-bold text-sm text-slate-900 outline-none transition-all"
                                            value={colors}
                                            onChange={(e) => setColors(e.target.value)}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Craftsmanship Narrative</label>
                                        <textarea
                                            rows="4"
                                            placeholder="Detail the narrative, texture, and fit philosophy..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#ff4d00]/30 focus:bg-white rounded-xl font-medium text-sm text-slate-900 outline-none transition-all resize-none leading-relaxed"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProductEdit;
