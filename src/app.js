import express from "express";
import cors from  "cors";
import auth from "./middleware/auth.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app= express()


app.use(cors())
app.use(express.json())


app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/carts",auth , cartRoutes);
app.use("/wishlists", wishlistRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);



app.get("/", (req,res)=>{
    res.json({
        message: "E-Commerce API is running",
    })
})

export default app;