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
const uploadFields = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'viewFront', maxCount: 1 },
    { name: 'viewBack', maxCount: 1 },
    { name: 'viewLeftSleeve', maxCount: 1 },
    { name: 'viewRightSleeve', maxCount: 1 },
    { name: 'viewInsideLabel', maxCount: 1 },
    { name: 'viewOutsideLabel', maxCount: 1 }
]);

router.post("/", protectAdmin, uploadFields, createProduct);

router.get("/:id", getProductById);
router.delete("/:id", protectAdmin, deleteProduct);
router.put("/:id", protectAdmin, uploadFields, updateProduct);

export default router;
