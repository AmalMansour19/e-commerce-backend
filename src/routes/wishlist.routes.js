import express from "express";
import auth from "../middleware/auth.middleware.js";
import * as wishlistController from "../controllers/wishlist.controller.js";

const router = express.Router();

router.use(auth);

router.get("/my", wishlistController.getWishlists);

router.post("/add/:productId", wishlistController.addProduct);

router.delete("/remove/:productId", wishlistController.removeProduct);

router.delete("/clear", wishlistController.clearWishlist);

export default router;
