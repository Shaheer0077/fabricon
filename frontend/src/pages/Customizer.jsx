import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as fabric from 'fabric';
import {
    Type,
    Image as ImageIcon,
    Palette,
    Trash2,
    Download,
    ChevronLeft,
    Layers,
    MousePointer2,
    Undo2,
    Redo2,
    Save,
    Plus,
    Box,
    Layout,
    Upload,
    Sticker,
    Zap,
    Crown,
    Droplets,
    HelpCircle,
    X,
    ShoppingCart,
    Maximize2,
    Search,
    ChevronDown,
    Copy,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/client';

const Customizer = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [activeTab, setActiveTab] = useState('text');
    const [selectedObject, setSelectedObject] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [productColor, setProductColor] = useState('#ffffff');
    const [view, setView] = useState('Front');

    const FONT_COMBINATIONS = [
        { name: 'Vintage Sport', text: 'VARSITY', font: 'Bebas Neue', size: 60, weight: '900', style: 'italic' },
        { name: 'Modern Minimal', text: 'ESSENTIALS', font: 'Inter', size: 40, weight: '400', spacing: 10 },
        { name: 'Bold Street', text: 'CREATIVE', font: 'Montserrat', size: 45, weight: '900' },
        { name: 'Classic Serif', text: 'ESTABLISHED', font: 'Playfair Display', size: 35, weight: '700', style: 'italic' },
        { name: 'Retro Wave', text: 'RADICAL', font: 'Courier New', size: 40, weight: 'bold' },
        { name: 'Luxury Edge', text: 'PREMIUM', font: 'Inter', size: 30, weight: '900', spacing: 15 }
    ];

    const READY_QUOTES = [
        { text: 'BURN FOR WHAT YOU LOVE', color: '#dc2626' },
        { text: "DON'T LIVE IN A COMFORT ZONE", color: '#2563eb' },
        { text: 'BETTER AN OOPS THAN WHAT IF', color: '#16a34a' },
        { text: 'CONSISTENCY IS KEY', color: '#1a1a1a' },
        { text: 'STAY REAL', color: '#ff4d00' },
        { text: 'LIMITLESS', color: '#8b5cf6' }
    ];

    const CLIPART_CATEGORIES = {
        'Basic Shapes': [
            { type: 'circle', color: '#1a1a1a' },
            { type: 'rect', color: '#1a1a1a' },
            { type: 'triangle', color: '#1a1a1a' }
        ],
        'Icons': [
            'https://cdn-icons-png.flaticon.com/512/1043/1043431.png',
            'https://cdn-icons-png.flaticon.com/512/2589/2589175.png',
            'https://cdn-icons-png.flaticon.com/512/747/747376.png',
            'https://cdn-icons-png.flaticon.com/512/4359/4359295.png'
        ],
        'Illustrations': [
            'https://cdn-icons-png.flaticon.com/512/6062/6062646.png',
            'https://cdn-icons-png.flaticon.com/512/3661/3661330.png',
            'https://cdn-icons-png.flaticon.com/512/9379/9379854.png'
        ]
    };

    const FILL_COLORS = [
        '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
        '#ffff00', '#00ffff', '#ff00ff', '#808080', '#ffa500',
        '#800080', '#008000', '#000080', '#800000'
    ];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const { data } = await API.get(`/products/${productId}`);
                setProduct(data);
                if (data.colors?.length > 0) setProductColor(data.colors[0]);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching product:', error);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const [canvasObjects, setCanvasObjects] = useState([]);
    const [colorLayer, setColorLayer] = useState(null);

    // Calculate baseImage safely
    const baseImage = product?.images?.[0]
        ? (product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`)
        : "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=715&auto=format&fit=crop";

    useEffect(() => {
        if (!canvasRef.current || !product) return;

        // 1. Setup Canvas
        const initCanvas = new fabric.Canvas(canvasRef.current, {
            width: 500,
            height: 580,
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
            selection: true
        });

        // Professional Selection Styling
        initCanvas.selectionColor = 'rgba(255, 77, 0, 0.1)';
        initCanvas.selectionBorderColor = '#ff4d00';
        initCanvas.selectionLineWidth = 2;

        fabric.Object.prototype.set({
            cornerColor: '#ff4d00',
            cornerStyle: 'circle',
            cornerSize: 10,
            borderColor: '#ff4d00',
            transparentCorners: false,
            borderScaleFactor: 2
        });

        const loadScene = async () => {
            try {
                // 2. Load Base Product Image
                const imgObj = await fabric.FabricImage.fromURL(baseImage, { crossOrigin: 'anonymous' });

                // Calculate Scale to fit
                const scale = Math.max(500 / imgObj.width, 580 / imgObj.height);
                const center = { x: 250, y: 290 };

                // Configure Base (Product)
                imgObj.set({
                    scaleX: scale, scaleY: scale,
                    originX: 'center', originY: 'center',
                    left: center.x, top: center.y,
                    selectable: false, evented: false
                });

                // Set as Background
                initCanvas.backgroundImage = imgObj;

                // 3. Setup Clipping (Real Print-Area Clipping)
                // We clip the entire canvas to the shape of the product using the product image itself
                const clipPathObj = await fabric.FabricImage.fromURL(baseImage, { crossOrigin: 'anonymous' });
                clipPathObj.set({
                    scaleX: scale, scaleY: scale,
                    originX: 'center', originY: 'center',
                    left: center.x, top: center.y,
                    absolutePositioned: true
                });
                initCanvas.clipPath = clipPathObj;

                // 4. Color Layer (Restored for Fill Tab)
                // We center the rect and make it huge to ensure it fully covers the canvas.
                const cLayer = new fabric.Rect({
                    width: 600, height: 700,
                    originX: 'center', originY: 'center',
                    left: 250, top: 290, // Canvas center
                    fill: productColor,
                    opacity: 1.0,
                    selectable: false, evented: false,
                    globalCompositeOperation: 'hue'
                });

                initCanvas.add(cLayer);
                initCanvas.sendObjectToBack(cLayer);
                // We send it to back, but since background is separate, it sits on top of background.
                // However, to be safe and visible, let's bring it forward one step if needed, or rely on layer order.
                // Actually, simply adding it puts it at index 0 (above BG).
                setColorLayer(cLayer);

                // 5. Shadow/Texture Layer (Regular Object
                const shadowObj = await fabric.FabricImage.fromURL(baseImage, { crossOrigin: 'anonymous' });
                shadowObj.set({
                    scaleX: scale, scaleY: scale,
                    originX: 'center', originY: 'center',
                    left: center.x, top: center.y,
                    opacity: 0.35,
                    globalCompositeOperation: 'multiply',
                    selectable: false, evented: false
                });
                initCanvas.add(shadowObj);
                // Don't set overlayImage. Just add it.
                // Order is now: Background -> Color -> Shadow -> Text (Future)

                initCanvas.renderAll();
            } catch (err) {
                console.error("Error setting up studio:", err);
            }
        };

        loadScene();
        setCanvas(initCanvas);

        const syncObjects = () => setCanvasObjects([...initCanvas.getObjects()]);
        const handleSelection = (e) => setSelectedObject(e.selected?.[0] || null);

        initCanvas.on('selection:created', handleSelection);
        initCanvas.on('selection:updated', handleSelection);
        initCanvas.on('selection:cleared', () => setSelectedObject(null));
        initCanvas.on('object:added', syncObjects);
        initCanvas.on('object:removed', syncObjects);
        initCanvas.on('object:modified', syncObjects);

        return () => initCanvas.dispose();
    }, [product]);

    // Separate Effect for Color Updates
    useEffect(() => {
        if (colorLayer && canvas) {
            colorLayer.set('fill', productColor);
            canvas.requestRenderAll();
        }
    }, [productColor, colorLayer, canvas]);

    const addCustomText = (config) => {
        if (!canvas) {
            return;
        }

        const text = new fabric.IText(config.text || 'YOUR TEXT', {
            left: 100,
            top: 150,
            fontFamily: config.font || 'Inter',
            fontSize: config.size || 32,
            fill: config.color || '#000000',
            fontWeight: config.weight || '700',
            fontStyle: config.style || 'normal',
            charSpacing: config.spacing || 0,
            cornerColor: '#ff4d00',
            cornerStyle: 'circle',
            padding: 10
        });

        canvas.add(text);
        canvas.centerObject(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
    };

    const addClipart = async (url) => {
        if (!canvas) return;
        try {
            const imgObj = await fabric.FabricImage.fromURL(url, {
                crossOrigin: 'anonymous'
            });
            imgObj.scaleToWidth(120);
            canvas.add(imgObj);
            canvas.centerObject(imgObj);
            canvas.setActiveObject(imgObj);
            canvas.renderAll();
        } catch (error) {
            console.error("Error adding clipart:", error);
        }
    };

    const addShape = (type) => {
        if (!canvas) return;
        let shape;
        const common = { left: 150, top: 200, fill: '#1a1a1a', cornerColor: '#ff4d00', cornerStyle: 'circle' };

        if (type === 'circle') shape = new fabric.Circle({ ...common, radius: 50 });
        if (type === 'rect') shape = new fabric.Rect({ ...common, width: 100, height: 100 });
        if (type === 'triangle') shape = new fabric.Triangle({ ...common, width: 100, height: 100 });

        if (shape) {
            canvas.add(shape);
            canvas.centerObject(shape);
            canvas.setActiveObject(shape);
            canvas.renderAll();
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file || !canvas) return;
        const reader = new FileReader();
        reader.onload = async (f) => {
            const imgObj = await fabric.FabricImage.fromURL(f.target.result);
            imgObj.scaleToWidth(150);
            canvas.centerObject(imgObj);
            canvas.add(imgObj);
            canvas.setActiveObject(imgObj);
            canvas.renderAll();
        };
        reader.readAsDataURL(file);
    };

    const deleteObject = () => {
        if (!canvas) return;
        canvas.getActiveObjects().forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.renderAll();
    };

    const duplicateObject = () => {
        if (!canvas || !selectedObject) return;
        selectedObject.clone().then((cloned) => {
            canvas.discardActiveObject();
            cloned.set({
                left: cloned.left + 20,
                top: cloned.top + 20,
                evented: true,
            });
            if (cloned.type === 'activeSelection') {
                cloned.canvas = canvas;
                cloned.forEachObject((obj) => canvas.add(obj));
                cloned.setCoords();
            } else {
                canvas.add(cloned);
            }
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
        });
    };

    const updateObjectProperty = (prop, value) => {
        if (!canvas || !selectedObject) return;
        selectedObject.set(prop, value);
        canvas.renderAll();
        setCanvasObjects([...canvas.getObjects()]);
    };

    const generateFinalImage = async () => {
        if (!canvas || !product) return;
        setLoading(true);
        try {
            // Since the canvas NOW contains the product, color, and design perfectly
            // We just need to export the canvas directly!
            // No more complex merging.
            const dataURL = canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 2
            });

            const link = document.createElement('a');
            link.download = `custom-${product.title}.png`;
            link.href = dataURL;
            link.click();
            setLoading(false);
        } catch (error) {
            console.error("Error generating image:", error);
            setLoading(false);
        }
    };

    const SIDEBAR_TOOLS = [
        { id: 'product', icon: Box, label: 'Product' },
        { id: 'layers', icon: Layers, label: 'Layers' },
        { id: 'uploads', icon: Upload, label: 'Uploads' },
        { id: 'text', icon: Type, label: 'Text' },
        { id: 'clipart', icon: Sticker, label: 'Clipart' },
        { id: 'quick', icon: Zap, label: 'Quick' },
        { id: 'premium', icon: Crown, label: 'Premium' },
        { id: 'fill', icon: Droplets, label: 'Fill' },
    ];

    const VIEW_OPTIONS = ['Front', 'Back', 'Outside label', 'Inside label', 'Left sleeve', 'Right sleeve'];

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white font-black text-slate-300 uppercase tracking-widest text-xs">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-[#ff4d00] border-t-transparent rounded-full animate-spin" />
                Initializing Space...
            </div>
        </div>
    );



    return (
        <div className="flex h-screen bg-[#f3f4f6] pt-20 overflow-hidden">

            {/* 1. Slim Left Sidebar */}
            <div className="w-[80px] bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-2 z-30">
                {SIDEBAR_TOOLS.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTab(tool.id)}
                        className={`w-[60px] py-3 flex flex-col items-center gap-1.5 transition-all rounded-xl ${activeTab === tool.id
                            ? 'bg-orange-50 text-[#ff4d00] shadow-sm'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <tool.icon size={20} className={activeTab === tool.id ? 'stroke-[2.5px]' : ''} />
                        <span className="text-[9px] font-black uppercase tracking-wider">{tool.label}</span>
                    </button>
                ))}
            </div>

            {/* 2. Secondary Sidebar */}
            <div className="w-[380px] bg-white border-r border-slate-200 z-20 flex flex-col shadow-2xl">
                <div className="p-7 h-full overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {activeTab === 'product' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="space-y-8">
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[10px] font-black text-[#ff4d00] uppercase tracking-widest mb-1 block">{product.category}</span>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{product.title}</h3>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{product.description?.substring(0, 100)}...</p>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Global Palette</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {product.colors?.map((color, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setProductColor(color)}
                                                    className={`w-10 h-10 rounded-xl border-2 transition-all ${productColor === color ? 'border-[#ff4d00] scale-110 shadow-lg' : 'border-transparent hover:border-slate-200'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'text' && (
                            <motion.div key="text" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                                {selectedObject?.type === 'i-text' && (
                                    <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100 mb-8">
                                        <h4 className="text-[10px] font-black text-[#ff4d00] uppercase tracking-widest mb-4">Live Edit</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Text Content</label>
                                                <textarea
                                                    value={selectedObject.text}
                                                    onChange={(e) => updateObjectProperty('text', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-[#ff4d00]/30 transition-all resize-none"
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Size</label>
                                                    <input
                                                        type="number"
                                                        value={selectedObject.fontSize}
                                                        onChange={(e) => updateObjectProperty('fontSize', parseInt(e.target.value))}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Color</label>
                                                    <div className="flex gap-2">
                                                        {['#000000', '#ffffff', '#ff4d00', '#2563eb'].map(c => (
                                                            <button
                                                                key={c}
                                                                onClick={() => updateObjectProperty('fill', c)}
                                                                className={`w-6 h-6 rounded-full border-2 ${selectedObject.fill === c ? 'border-[#ff4d00]' : 'border-white shadow-sm'}`}
                                                                style={{ backgroundColor: c }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Font Presets</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {FONT_COMBINATIONS.map((f, i) => (
                                            <button
                                                key={i}
                                                onClick={() => addCustomText(f)}
                                                className="group relative h-24 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#ff4d00]/30 hover:bg-white hover:shadow-xl transition-all flex flex-col items-center justify-center p-4"
                                            >
                                                <span className="text-xs font-black line-clamp-1 text-center font-style" style={{ fontFamily: f.font, fontWeight: f.weight, fontStyle: f.style || 'normal' }}>{f.text}</span>
                                                <span className="absolute bottom-2 text-[8px] font-black text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">{f.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'layers' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Scene Elements</h3>
                                <div className="space-y-3">
                                    {canvasObjects.length === 0 && (
                                        <div className="py-12 flex flex-col items-center justify-center text-slate-300 gap-3 grayscale opacity-50">
                                            <Layers size={32} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No Layers Detected</p>
                                        </div>
                                    )}
                                    {canvasObjects.slice().reverse().map((obj, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                canvas.setActiveObject(obj);
                                                canvas.renderAll();
                                            }}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${canvas.getActiveObject() === obj ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                    {obj.type === 'i-text' ? <Type size={14} className="text-slate-400" /> : <ImageIcon size={14} className="text-slate-400" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 line-clamp-1">{obj.text || 'Imported Element'}</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{obj.type}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    canvas.remove(obj);
                                                    canvas.renderAll();
                                                }}
                                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        {/* Clipart, Uploads, Layers... (Keeping consistency from previous) */}
                        {activeTab === 'uploads' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="space-y-8">
                                    <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:border-[#ff4d00]/30 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-50 transition-colors">
                                            <Upload className="text-slate-300 group-hover:text-[#ff4d00]" size={28} />
                                        </div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Click to Upload</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-relaxed">PNG, JPG or SVG<br />Max 5MB</p>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-center">Your Local Assets</p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'quick' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ready Quotes</h3>
                                <div className="space-y-4">
                                    {READY_QUOTES.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => addCustomText({ text: q.text, color: q.color, font: 'Inter', weight: '900', size: 28 })}
                                            className="w-full text-left p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-[#ff4d00]/30 hover:shadow-xl transition-all group"
                                        >
                                            <p className="text-xs font-black uppercase tracking-tight mb-2" style={{ color: q.color }}>{q.text}</p>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Zap size={10} className="text-[#ff4d00]" />
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Instant Apply</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'clipart' && (
                            <motion.div key="clipart" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(CLIPART_CATEGORIES).map(([cat, items]) => items.map((item, i) => (
                                        <button key={`${cat}-${i}`} onClick={() => typeof item === 'string' ? addClipart(item) : addShape(item.type)} className="aspect-square bg-slate-50 rounded-xl hover:shadow-lg border border-slate-100 transition-all p-3 flex items-center justify-center group">
                                            {typeof item === 'string' ? <img src={item} alt="" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" /> : <div className="w-8 h-8 bg-slate-900 group-hover:scale-110 transition-transform" style={item.type === 'circle' ? { borderRadius: '50%' } : {}} />}
                                        </button>
                                    )))}
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'fill' && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Product Color</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {FILL_COLORS.map((color, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setProductColor(color)}
                                            className={`aspect-square rounded-xl border-2 transition-all ${productColor === color ? 'border-[#ff4d00] scale-110 shadow-lg' : 'border-slate-100 hover:border-slate-300'}`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">
                                    Select a color to tint the product. Works best with transparent product images.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {selectedObject && (
                    <div className="p-6 border-t border-slate-100 bg-white">
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={deleteObject} className="flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={14} /> Remove</button>
                            <button onClick={duplicateObject} className="flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-900 hover:text-white transition-all"><Copy size={14} /> Clone</button>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Main Studio Workbench */}
            <div className="grow flex flex-col relative overflow-hidden bg-[#ebeef2]">
                {/* Workspace Header */}
                <div className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-20">
                    <div className="flex items-center gap-6">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {VIEW_OPTIONS.slice(0, 2).map(v => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <div className="flex items-center gap-4 text-slate-400">
                            <button className="hover:text-[#ff4d00] transition-colors"><Undo2 size={16} /></button>
                            <button className="hover:text-[#ff4d00] transition-colors"><Redo2 size={16} /></button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                            <Maximize2 size={14} /> Fullscreen
                        </button>
                    </div>
                </div>

                {/* Studio Floor */}
                <div className="flex-grow relative flex items-center justify-center overflow-hidden custom-studio-bg">
                    {/* Perspective Mockup Container */}
                    <div className="relative group/workbench">
                        {/* Shadow Floor */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-12 bg-black/10 blur-3xl rounded-[100%] transition-opacity opacity-50" />

                        <div className="relative w-[500px] h-[580px] hover:scale-[1.02] transition-transform duration-500 ease-out shadow-2xl rounded-sm">
                            {/* Main Canvas Area */}
                            <canvas ref={canvasRef} />

                            {/* Safety Guideline - Visual Only */}
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-black text-[#ff4d00]/40 uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Interactive Studio Mode
                            </div>
                        </div>
                    </div>

                    {/* Quick HUD Controls */}
                    <div className="absolute top-8 right-8 flex flex-col gap-2">
                        <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#ff4d00] hover:border-[#ff4d00]/30 transition-all shadow-sm">
                            <Plus size={18} />
                        </button>
                        <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#ff4d00] hover:border-[#ff4d00]/30 transition-all shadow-sm">
                            <Search size={18} />
                        </button>
                    </div>
                </div>

                {/* Status Bar / Footer */}
                <div className="h-24 bg-white border-t border-slate-100 px-12 flex items-center justify-between z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-[#ff4d00] uppercase tracking-widest mb-0.5">Price Node</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-slate-900 tracking-tighter">${product.price?.toFixed(2)}</span>
                                <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase tracking-widest">
                                    Sync Ready
                                </div>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-slate-100" />

                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 text-center">Estimation</span>
                            <p className="text-[10px] font-bold text-slate-500 italic">Expected ship: 48h</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                            Save Draft
                        </button>
                        <button
                            onClick={generateFinalImage}
                            className="flex items-center gap-4 px-12 py-5 bg-[#ff4d00] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-orange-500/10 active:scale-[0.98]"
                        >
                            <ShoppingCart size={18} /> Apply & Bag
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-studio-bg {
                    background-image: radial-gradient(circle at 50% 50%, #ffffff 0%, #ebeef2 100%);
                }
            `}</style>
        </div>
    );
};

export default Customizer;
