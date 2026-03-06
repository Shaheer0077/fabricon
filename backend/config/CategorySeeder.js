import Category from "../models/Category.js";

const seedCategories = async () => {
    try {
        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            const categories = [
                {
                    name: "Men",
                    subcategories: ["T-shirt", "Longsleeve", "Tracksuits", "Hoodies", "Shorts"]
                },
                {
                    name: "Women",
                    subcategories: ["T-shirt", "Dresses", "Leggings", "Hoodies", "Tops"]
                },
                {
                    name: "Kids",
                    subcategories: ["T-shirt", "Hoodies", "Pants"]
                },
                {
                    name: "Hoodies",
                    subcategories: ["Pullover", "Zip-up", "Oversized"]
                }
            ];

            await Category.insertMany(categories);
            console.log("Categories Seeded!");
        }
    } catch (error) {
        console.error("Error seeding categories:", error);
    }
};

export default seedCategories;
