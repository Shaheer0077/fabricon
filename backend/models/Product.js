import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    colors: [String],
    sizes: [String],
    images: [String],
    views: {
        front: String,
        back: String,
        leftSleeve: String,
        rightSleeve: String,
        insideLabel: String,
        outsideLabel: String
    },

    customizable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
