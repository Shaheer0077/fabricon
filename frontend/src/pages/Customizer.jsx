import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as fabricModule from 'fabric';
const fabric = fabricModule.fabric || fabricModule.default || fabricModule;
console.log("Customizer: Module File Loaded", {
    hasFabricProp: !!fabricModule.fabric,
    hasDefaultProp: !!fabricModule.default,
    fabricType: typeof fabric,
    hasCanvas: !!fabric?.Canvas
});
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
    console.log("Customizer: COMPONENT_INIT_START");
    const { productId } = useParams();
    console.log("Customizer: COMPONENT_MOUNTED_ID:", productId);
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const fabricCanvas = useRef(null);
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
        console.log("Customizer: User is on Customizer with ID:", productId);
        const fetchProduct = async () => {
            try {
                setLoading(true);
                console.log("Customizer: Fetching product data for ID:", productId);
                const { data } = await API.get(`/products/${productId}`);
                console.log("Customizer: Product Data Received:", data);
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

    // Standardize URL: Convert backslashes to forward slashes and ensure full path
    const getProductImageUrl = (path) => {
        if (!path) return "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=715&auto=format&fit=crop";
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/\\/g, '/');
        const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
        return `http://localhost:5000${finalPath}`;
    };

    const baseImage = getProductImageUrl(product?.images?.[0]);

    // 1. Initialize Canvas (Only Once)
    useEffect(() => {
        if (!canvasRef.current || fabricCanvas.current) return;

        console.log("Customizer: Initializing Canvas inside useEffect");
        try {
            const initCanvas = new fabric.Canvas(canvasRef.current, {
                width: 500,
                height: 580,
                backgroundColor: '#ffffff',
                preserveObjectStacking: true,
                selection: true,
                renderOnAddRemove: false
            });
            console.log("Customizer: Fabric Canvas instance created");

            // Global Object Settings
            fabric.Object.prototype.set({
                cornerColor: '#ff4d00',
                cornerStyle: 'circle',
                cornerSize: 10,
                borderColor: '#ff4d00',
                transparentCorners: false,
                borderScaleFactor: 2,
                objectCaching: true
            });

            // Add Custom Delete Control
            fabric.Object.prototype.controls.deleteControl = new fabric.Control({
                x: 0.5,
                y: -0.5,
                offsetY: -16,
                offsetX: 16,
                cursorStyle: 'pointer',
                mouseUpHandler: (eventData, transform) => {
                    const target = transform.target;
                    const canvas = target.canvas;
                    canvas.remove(target);
                    canvas.requestRenderAll();
                    return true;
                },
                render: (ctx, left, top, styleOverride, fabricObject) => {
                    const size = 24;
                    ctx.save();
                    ctx.translate(left, top);
                    ctx.beginPath();
                    ctx.arc(0, 0, size / 2, 0, 2 * Math.PI, false);
                    ctx.fillStyle = '#ef4444';
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    // Draw X
                    ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(4, 4); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(4, -4); ctx.lineTo(-4, 4); ctx.stroke();
                    ctx.restore();
                },
                cornerSize: 24
            });

            // Events
            initCanvas.on('selection:created', (e) => setSelectedObject(e.target));
            initCanvas.on('selection:updated', (e) => setSelectedObject(e.target));
            initCanvas.on('selection:cleared', () => setSelectedObject(null));
            initCanvas.on('object:added', () => setCanvasObjects([...initCanvas.getObjects()]));
            initCanvas.on('object:removed', () => setCanvasObjects([...initCanvas.getObjects()]));
            initCanvas.on('object:modified', () => setCanvasObjects([...initCanvas.getObjects()]));

            fabricCanvas.current = initCanvas;
            setCanvas(initCanvas);
            console.log("Customizer: Canvas state and ref set");
        } catch (err) {
            console.error("Customizer: ERROR during fabric init:", err);
        }

        return () => {
            console.log("Customizer: Cleaning up/disposing canvas");
            if (fabricCanvas.current) {
                fabricCanvas.current.dispose();
                fabricCanvas.current = null;
            }
        };
    }, [product]);

    // 2. Load Product Scene
    useEffect(() => {
        if (!canvas || !product) return;

        const loadScene = () => {
            console.log("Customizer: Loading Scene:", baseImage);

            canvas.getObjects().forEach(obj => {
                if (obj.data?.isBackground) canvas.remove(obj);
            });

            const loadingText = new fabric.Text("Applying Masked Color...", {
                fontSize: 12, fill: '#94a3b8', left: 250, top: 290, originX: 'center', originY: 'center',
                data: { isBackground: true }
            });
            canvas.add(loadingText);
            canvas.requestRenderAll();

            fabric.Image.fromURL(baseImage, (img) => {
                canvas.remove(loadingText);
                if (!img) return console.error("Customizer: Image load failed");

                const scale = Math.min(460 / img.width, 540 / img.height);
                const center = { x: 250, y: 290 };

                // 1. Texture Layer (Underlying fabric detail)
                img.set({
                    scaleX: scale, scaleY: scale,
                    left: center.x, top: center.y,
                    originX: 'center', originY: 'center',
                    selectable: false, evented: false,
                    data: { isBackground: true, type: 'texture' }
                });
                canvas.add(img);
                canvas.sendToBack(img);

                // 2. Color Mask Layer (The "Magic" Fit)
                img.clone((mask) => {
                    // Force the mask to ignore "white" background if transparent pixels are missing
                    // This creates a silhouette from a standard white-background PNG/JPG
                    mask.filters = [
                        new fabric.Image.filters.RemoveColor({
                            color: '#ffffff',
                            distance: 0.05 // Adjust if edges are jagged
                        })
                    ];
                    mask.applyFilters();

                    mask.set({
                        absolutePositioned: true,
                        left: center.x, top: center.y,
                        originX: 'center', originY: 'center',
                        scaleX: scale, scaleY: scale
                    });

                    const colorOverlay = new fabric.Rect({
                        width: img.width * scale,
                        height: img.height * scale,
                        left: center.x, top: center.y,
                        originX: 'center', originY: 'center',
                        fill: productColor,
                        globalCompositeOperation: 'multiply',
                        selectable: false, evented: false,
                        data: { isBackground: true, type: 'color' },
                        clipPath: mask
                    });

                    canvas.add(colorOverlay);
                    canvas.insertAt(colorOverlay, 1);
                    setColorLayer(colorOverlay);
                    canvas.requestRenderAll();
                });

                // 3. Highlight Boost (Preserves shine)
                img.clone((lights) => {
                    lights.set({
                        scaleX: scale, scaleY: scale,
                        left: center.x, top: center.y,
                        originX: 'center', originY: 'center',
                        globalCompositeOperation: 'screen',
                        opacity: 0.1,
                        selectable: false, evented: false,
                        data: { isBackground: true, type: 'highlight' }
                    });
                    canvas.add(lights);
                    canvas.requestRenderAll();
                });

            }, { crossOrigin: 'anonymous' });
        };

        loadScene();
    }, [canvas, product, baseImage]);

    // Separate Effect for Color Updates
    useEffect(() => {
        if (colorLayer && canvas) {
            console.log("Customizer: Updating Color Layer Fill:", productColor);
            colorLayer.set('fill', productColor);
            canvas.requestRenderAll();
        } else {
            console.warn("Customizer: Color Update Skipped - Layer or Canvas missing", { hasLayer: !!colorLayer, hasCanvas: !!canvas });
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
        canvas.bringToFront(text);
        canvas.setActiveObject(text);
        setSelectedObject(text); // Sync React state immediately
        canvas.requestRenderAll();
        setActiveTab('text'); // Ensure we stay in text tab to see the controls
    };

    const addClipart = (url) => {
        if (!canvas) return;
        fabric.Image.fromURL(url, (imgObj) => {
            imgObj.scaleToWidth(120);
            canvas.add(imgObj);
            canvas.centerObject(imgObj);
            canvas.bringToFront(imgObj);
            canvas.setActiveObject(imgObj);
            setSelectedObject(imgObj); // Sync React state immediately
            canvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
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
            canvas.bringToFront(shape);
            canvas.setActiveObject(shape);
            canvas.requestRenderAll();
        }
    };

    const handleImageUpload = (e) => {
        e.stopPropagation(); // Prevent bubbling
        const file = e.target.files[0];
        if (!file || !canvas) return;

        console.log('Customizer: Uploading Image:', file.name);
        const reader = new FileReader();
        reader.onload = (f) => {
            fabric.Image.fromURL(f.target.result, (imgObj) => {
                if (!imgObj) {
                    console.error("Customizer: Upload image loading failed");
                    return;
                }
                console.log("Customizer: Upload image processed");
                imgObj.scaleToWidth(150);

                // Add on top of everything
                canvas.add(imgObj);
                canvas.bringToFront(imgObj);

                canvas.centerObject(imgObj);
                canvas.setActiveObject(imgObj);
                canvas.requestRenderAll();
            }, { crossOrigin: 'anonymous' });
        };
        reader.readAsDataURL(file);
    };


    const deleteObject = () => {
        if (!canvas) return;
        canvas.getActiveObjects().forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
    };

    const duplicateObject = () => {
        if (!canvas || !selectedObject) return;
        selectedObject.clone((cloned) => {
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
            canvas.bringToFront(cloned);
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
        });
    };

    const updateObjectProperty = (prop, value) => {
        if (!canvas || !selectedObject) return;
        selectedObject.set(prop, value);
        canvas.requestRenderAll();
        setCanvasObjects([...canvas.getObjects()]);
    };

    const generateFinalImage = async () => {
        if (!canvas || !product) return;

        try {
            // 1. Generate PNG from Fabric canvas
            const dataURL = canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 1.5 // optional: increases resolution
            });

            // 2. Navigate to checkout page, passing the image and product info
            navigate('/checkout', {
                state: {
                    product,
                    customizedImage: dataURL, // the generated image
                    color: productColor
                }
            });
        } catch (error) {
            console.error('Error generating image:', error);
        }
    };

    const handleDownload = () => {
        if (!canvas) return;

        try {
            const dataURL = canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 2 // High resolution download
            });

            const link = document.createElement('a');
            link.download = `fabricon-design-${product?.title || 'custom'}.png`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading image:', error);
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

    if (!product) return (
        <div className="h-screen flex items-center justify-center bg-white font-black text-slate-300 uppercase tracking-widest text-xs">
            <div className="flex flex-col items-center gap-4">
                Product Data Unavailable
                <button onClick={() => navigate(-1)} className="text-[#ff4d00] underline">Back</button>
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
                                        <span className="text-[10px] font-black text-[#ff4d00] uppercase tracking-widest mb-1 block">{product?.category}</span>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{product?.title}</h3>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{product?.description?.substring(0, 100)}...</p>
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
                                {selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text') && (
                                    <div className="p-6 bg-orange-50 border border-orange-200 rounded-2xl shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-[10px] font-black text-[#ff4d00] uppercase tracking-widest">Text Style & Color</h4>
                                            <button onClick={deleteObject} className="text-rose-500 hover:text-rose-700 transition-colors"><Trash2 size={16} /></button>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Change Text</label>
                                                <input
                                                    type="text"
                                                    value={selectedObject.text}
                                                    onChange={(e) => updateObjectProperty('text', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#ff4d00] transition-all"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Font Size</label>
                                                    <input
                                                        type="number"
                                                        value={selectedObject.fontSize}
                                                        onChange={(e) => updateObjectProperty('fontSize', parseInt(e.target.value))}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Letter Spacing</label>
                                                    <input
                                                        type="number"
                                                        value={selectedObject.charSpacing / 10}
                                                        onChange={(e) => updateObjectProperty('charSpacing', parseInt(e.target.value) * 10)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-wider italic">Quick Colors</label>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {FILL_COLORS.slice(0, 12).map(c => (
                                                        <button
                                                            key={c}
                                                            onClick={() => updateObjectProperty('fill', c)}
                                                            className={`w-7 h-7 rounded-full border-2 transition-all ${selectedObject.fill === c ? 'border-[#ff4d00] scale-110 shadow-md' : 'border-white shadow-sm hover:scale-105'}`}
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl group hover:border-[#ff4d00]/20 transition-all">
                                                    <input
                                                        type="color"
                                                        value={typeof selectedObject.fill === 'string' ? selectedObject.fill : '#000000'}
                                                        onChange={(e) => updateObjectProperty('fill', e.target.value)}
                                                        className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                                                    />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#ff4d00] transition-colors">Custom Text Color</span>
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
                                    {canvasObjects
                                        .filter(obj => !obj.data?.isBackground)
                                        .slice()
                                        .reverse()
                                        .map((obj, i) => (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    canvas.setActiveObject(obj);
                                                    canvas.requestRenderAll();
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
                                                        canvas.requestRenderAll();
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
                                    <div
                                        className="p-8 border-2 border-dashed border-orange-400 bg-orange-50 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:bg-orange-100 transition-all cursor-pointer"
                                        onClick={() => {
                                            console.log("Customizer: Upload Card CLICKED");
                                            fileInputRef.current?.click();
                                        }}
                                    >
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
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                                    {selectedObject ? 'Element Color' : 'Product Color'}
                                </h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {FILL_COLORS.map((color, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (selectedObject) {
                                                    updateObjectProperty('fill', color);
                                                } else {
                                                    setProductColor(color);
                                                }
                                            }}
                                            className={`aspect-square rounded-xl border-2 transition-all ${(selectedObject ? selectedObject.fill === color : productColor === color) ? 'border-[#ff4d00] scale-110 shadow-lg' : 'border-slate-100 hover:border-slate-300'}`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                    {selectedObject
                                        ? "Pick a color for your selected design element."
                                        : "Pick a global base color for the product mockup."}
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
            <div className="grow flex flex-col relative overflow-hidden">
                <div className="h-14 bg-white flex items-center justify-between px-6 z-20">
                    <div className="flex items-center gap-2">
                        {VIEW_OPTIONS.map(v => (
                            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${view === v ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-slate-400 hover:text-slate-600'}`}>{v}</button>
                        ))}
                    </div>
                </div>

                <div className="flex-grow flex items-center justify-center p-4 min-h-0 overflow-hidden">
                    <div className="relative w-full max-w-[1240px] h-full max-h-[750px] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0" />
                        <div className="relative overflow-hidden z-10" style={{ width: 500, height: 580 }}>
                            <canvas ref={canvasRef} width={500} height={580} style={{ display: 'block' }} />
                        </div>
                        <div className="absolute bottom-6 right-8 flex flex-col gap-3 z-20">
                            <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#ff4d00] hover:shadow-xl transition-all shadow-sm"><Plus size={20} /></button>
                            <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#ff4d00] hover:shadow-xl transition-all shadow-sm"><Search size={20} /></button>
                        </div>

                    </div>
                </div>

                <div className="h-24 bg-white border-t border-slate-100 px-10 flex items-center justify-between z-30 shadow-2xl">
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-[#ff4d00] uppercase tracking-widest mb-1">Total Price</span>
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">${product?.price?.toFixed(2)}</span>
                        </div>
                        <div className="text-center">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Estimation</span>
                            <p className="text-[11px] font-bold text-slate-500 italic">Expected ship: 48h</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleDownload}
                            className="px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                        >
                            Save Draft
                        </button>
                        <button onClick={generateFinalImage} className="flex items-center gap-3 px-10 py-4 bg-[#ff4d00] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-orange-500/20 active:scale-95">
                            <ShoppingCart size={20} /> Checkout
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default Customizer;
