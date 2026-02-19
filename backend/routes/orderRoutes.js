import express from "express";
const router = express.Router();
import {
    createOrder,
    getOrders,
    updateOrderStatus,
    deleteOrder,
} from "../controllers/orderController.js";

router.route("/").post(createOrder).get(getOrders);
router.route("/:id/status").put(updateOrderStatus);
router.route("/:id").delete(deleteOrder);

export default router;
