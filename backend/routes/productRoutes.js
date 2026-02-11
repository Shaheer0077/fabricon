import express from "express";
import { upload } from "../middleware/upload.js";
import {
    getProducts,
    createProduct,
    getProductById,
    deleteProduct,
    updateProduct
} from "../controllers/productController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", protectAdmin, upload.array("images"), createProduct);

router.get("/:id", getProductById);
router.delete("/:id", protectAdmin, deleteProduct);
router.put("/:id", protectAdmin, upload.array("images"), updateProduct);

export default router;
