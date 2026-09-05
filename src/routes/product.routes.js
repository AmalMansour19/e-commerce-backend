import express from "express";

import {
  getProducts,
  addReview,
  getReviews,
  deleteReview,
} from "../controllers/product.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Search + Filter + Sort + Pagination
router.get("/search", getProducts);

// Get all reviews for a product
router.get("/:id/reviews", getReviews);

// Add review to a product
router.post("/:id/reviews", authMiddleware, addReview);

// Delete review from a product
router.delete("/:id/reviews/:rid", authMiddleware, deleteReview);

export default router;