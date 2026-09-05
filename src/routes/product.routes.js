import express from "express";

import {
  CreateProduct,
  DeleteProduct,
  GetAllProducts,
  GetProductById,
  UpdateProduct,
} from "../controllers/product.controller.js";

import adminPerms from "../middleware/admin.middleware.js";
import auth from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const productRoutes = express.Router();

// CRUD
productRoutes.post("/", auth, adminPerms, upload.array("images", 5), CreateProduct);
productRoutes.get("/", GetAllProducts);
productRoutes.get("/:id", GetProductById);
productRoutes.put("/update/:id", auth, adminPerms, upload.array("images", 5), UpdateProduct);
productRoutes.delete("/:id", auth, adminPerms, DeleteProduct);

// Search

export default productRoutes;
