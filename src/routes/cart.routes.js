import express from "express";
import   {getCart,addItemToCart,updateItemQuantity,removeItemFromCart,clearCart, applyCoupon, removeCoupon} from "../controllers/cart.controller.js";


const router=express.Router();


router.get("/",getCart);
router.post("/items",addItemToCart);
router.patch("/items",updateItemQuantity);
router.delete("/items/:productId",removeItemFromCart);
router.delete("/clear",clearCart);
router.post("/coupon", applyCoupon);
router.delete("/coupon", removeCoupon);

export default router;
