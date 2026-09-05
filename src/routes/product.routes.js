import express from "express";

import {
  CreateProduct,
  DeleteProduct,
  GetAllProducts,
  GetProductById,
  UpdateProduct,
  getProducts,
  addReview,
  getReviews,
  deleteReview,
} from "../controllers/product.controller.js";

import adminPerms from "../middleware/admin.middleware.js";
import auth from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// CRUD
router.post(
  "/",
  auth,
  adminPerms,
  upload.array("images", 5),
  CreateProduct
);

router.get("/", GetAllProducts);

// Search + Filter + Sort + Pagination
router.get("/search", getProducts);

// Product by ID
router.get("/:id", GetProductById);

// Reviews
router.get("/:id/reviews", getReviews);

router.post(
  "/:id/reviews",
  auth,
  addReview
);

router.delete(
  "/:id/reviews/:rid",
  auth,
  deleteReview
);

router.patch(
  "/update/:id",
  auth,
  adminPerms,
  upload.array("images", 5),
  UpdateProduct
);

router.delete(
  "/:id",
  auth,
  adminPerms,
  DeleteProduct
);

export default router;
