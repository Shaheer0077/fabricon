import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
    {
        customer: {
            fullName: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
        },
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            zipCode: { type: String, required: true },
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "Product",
                },
                title: { type: String, required: true },
                image: { type: String, required: true },
                size: { type: String, required: true },
                quantity: { type: Number, required: true },
                color: { type: String, required: true },
                fabric: { type: String, required: true },
                logoType: { type: String, required: true },
                price: { type: Number, required: true },
            },
        ],
        totalPrice: { type: Number, required: true, default: 0.0 },
        status: {
            type: String,
            required: true,
            default: "Pending",
            enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
