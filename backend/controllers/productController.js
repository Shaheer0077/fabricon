import Product from "../models/Product.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const { title, description, price, category, colors, sizes } = req.body;

        // Ensure files are processed correctly
        const imageUrls = req.files ? req.files.map(file => `/${file.path.replace(/\\/g, '/')}`) : [];

        const product = new Product({
            title,
            description,
            price,
            category,
            colors: colors ? (Array.isArray(colors) ? colors : colors.split(',')) : [],
            sizes: sizes ? (Array.isArray(sizes) ? sizes : sizes.split(',')) : [],
            images: imageUrls,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await Product.deleteOne({ _id: product._id });
            res.json({ message: "Product removed" });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            const { title, description, price, category, colors, sizes, existingImages } = req.body;

            product.title = title || product.title;
            product.description = description || product.description;
            product.price = price !== undefined ? price : product.price;
            product.category = category || product.category;
            product.colors = colors ? (Array.isArray(colors) ? colors : colors.split(',')) : product.colors;
            product.sizes = sizes ? (Array.isArray(sizes) ? sizes : sizes.split(',')) : product.sizes;

            // Handle Images
            let newImages = [];
            if (req.files && req.files.length > 0) {
                newImages = req.files.map(file => `/${file.path.replace(/\\/g, '/')}`);
            }

            // If we have existing images passed back (multi-image support)
            const keptImages = existingImages ? (Array.isArray(existingImages) ? existingImages : [existingImages]) : [];

            product.images = [...keptImages, ...newImages];

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
