import mongoose from 'mongoose';

import Order from "../models/Order.model.js";
import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";

const createOrder = async (req, res, next) => {
    try {
        const { shippingAddress, paymentMethod, customerNote } = req.body;
        const cart = await Cart.findOne({user: req.user._id}).populate('items.product');

        if (!cart || cart.items.length == 0) {
            const error = new Error ("Cart is empty");
            error.statusCode = 400;
            return next(error);
        }

        cart.items.forEach((item) => {
            if (!item.product){
                const error = new Error("A product in your cart is no longer available");
                error.statusCode = 400;
                return next(error);
            }
        })

        const session = await mongoose.startSession();
        session.startTransaction();

        const orderItems = cart.items.map((item) => ({
            product: item.product._id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
        }))

        const subtotal = cart.subtotal;
        const discount = cart.discountAmount || 0;

        const [order] = await Order.create([
            {
                user: req.user._id,
                items: orderItems,
                shippingAddress,
                paymentMethod,
                subtotal,
                discount,
                customerNote,
            }
        ], { session }
        );

        cart.items = [];
        cart.coupon = null;
        await cart.save({ session });
        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order
        })
    } 
    catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        next(error);
    } finally {
        if (session) {
            session.endSession();
        }
    }
}

const validOrderStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
];


const getOrders = async (req,res,next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {user: req.user._id};
        if (req.query.status){

            if (!validOrderStatuses.includes(req.query.status)){
                const error = new Error( `Invalid status. Must be one of: ${validOrderStatuses.join(", ")}`);
                error.statusCode = 400;
                return next(error);
            }

            filter.status = req.query.status;
        }

        const orders = await Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Order.countDocuments(filter);

        res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        orders,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            }
        })
    } catch(error){
        next(error);
    }
}


const getOrderById =async (req,res,next) => {
    try{
        const order = await Order.findById(req.params.id)
        
        if (!order){
            const error =new Error("Order doesn't exist");
            error.statusCode = 404;
            return next(error);
        }

        if (order.user.toString() !== req.user._id.toString()){
            const error = new Error("You are not authorized to access this order");
            error.statusCode = 403;
            return next(error);
        }

        res.status(200).json({
            success:true,
            message:"Order fetched successfully",
            order
        });
    }
    catch(error){
        next(error);
    }
}


const cancelOrder =async (req,res,next) => {
    try{
        const order =await Order.findById(req.params.id);

        if (!order){
            const error =new Error("Order doesn't exist");
            error.statusCode = 404;
            return next(error);
        }

        if(order.user.toString() !== req.user._id.toString()){
            const error = new Error("You are not authorized to cancel this order");
            error.statusCode = 403;
            return next(error);
        }

        const cancellableStatuses = ["pending", "confirmed"];
        if ( !cancellableStatuses.includes(order.status)){
            const error = new Error(`Order cannot be cancelled once it is ${order.status}`);
            error.statusCode = 400;
            return next(error);
        }

        let session = await mongoose.startSession();
        session.startTransaction();

        order.items.forEach(async (item) => {
            const product = await Product.findById(item.product).session(session);

            if (product){
                product.stock += item.quantity;
                await product.save({ session });
            }
        })

        order.status = "cancelled";
        order.cancelledAt = new Date();
        await order.save({ session });
        await session.commitTransaction();

        res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        order,
        })
    }
    catch(error){
        if (session) {
            await session.abortTransaction();
        }
        next(error)
    }
    finally {
        if (session){
            await session.endSession();
        }
    }
}

    




export { createOrder, getOrders, getOrderById, cancelOrder };
