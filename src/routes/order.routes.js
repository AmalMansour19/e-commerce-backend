import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

router.use(auth);

router.post("/", createOrder);
router.get("/my", getOrders);
router.get("/my/:id", getOrderById);
router.patch("/my/:id/cancel", cancelOrder);

export default router;