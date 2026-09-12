import { Router } from "express";

import auth from "../middleware/auth.middleware.js";
import adminPerms from "../middleware/admin.middleware.js";

import {
  getDashboard,
  getAllCarts,
  getAllWishlists,
  getWishlistStats,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
}from "../controllers/admin.controller.js";

const router = Router();

// Admin Dashboard
router.get(
  "/dashboard",
  auth,
  adminPerms,
  getDashboard
);

// Admin Carts

router.get(
  "/carts",
  auth,
  adminPerms,
  getAllCarts
);

// Admin Wishlists
router.get(
  "/wishlists",
  auth,
  adminPerms,
  getAllWishlists
);

// Wishlist Statistics

router.get(
  "/wishlists/stats",
  auth,
  adminPerms,
  getWishlistStats
);

// Get All Orders
router.get(
  "/",
  auth,
  adminPerms,
  getAllOrders
);

// Get Order By ID
router.get(
  "/:id",
  auth,
  adminPerms,
  getOrderById
);

// Update Order Status
router.patch(
  "/:id/status",
  auth,
  adminPerms,
  updateOrderStatus
);

export default router;

