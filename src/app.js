import express from "express";
import cors from  "cors";

const app= express()


app.use(cors())
app.use(express.json())


app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/carts", cartRoutes);
app.use("/wishlists", wishlistRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);



app.get("/", (req,res)=>{
    res.json({
        message: "E-Commerce API is running",
    })
})

export default app;