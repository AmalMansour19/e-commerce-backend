import mongoose from "mongoose";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";
import Cart from "../models/Cart.model.js";
import WishList from "../models/wishlist.model.js";
import sendEmail from "../utils/sendEmail.js";

// Admin Dashboard
const getDashboard = async (req, res, next) => {
  try {

    //Calculate total revenue from paid orders
    const revenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalPrice",
          },
        },
      },
    ]);

    //Count total orders excluding cancelled and returned orders
    const totalOrders = await Order.countDocuments({
      status: {
        $nin: ["cancelled", "returned"],
      },
    });

    //Count registered customers only
    const totalCustomers = await User.countDocuments({
      role: "customer",
    });

    //Get the top 10 best-selling products
    const topProducts = await Order.aggregate([
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.name",
          totalSold: {
            $sum: "$items.quantity",
          },
        },
      },
      {
        $sort: {
          totalSold: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    //Calculate daily revenue for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sevenDaysAgo,
          },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          revenue: {
            $sum: "$totalPrice",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    //Get the 10 most recent active orders
    const recentOrders = await Order.find({
      status: {
        $nin: ["cancelled", "returned"],
      },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    //Send dashboard statistics
    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      revenue,
      totalOrders,
      totalCustomers,
      topProducts,
      dailyRevenue,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Active Carts=
const getAllCarts = async (req, res, next) => {
  try {
    const carts = await Cart.find({
      "items.0": { $exists: true },
    })
      .populate("user")
      .populate("items.product");

    res.status(200).json({
      success: true,
      message: "Carts fetched successfully",
      carts,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Wishlists
const getAllWishlists = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const wishlists = await WishList.find()
      .populate("user")
      .skip(skip)
      .limit(limit);

    const totalWishlists = await WishList.countDocuments();

    res.status(200).json({
      success: true,
      message: "Wishlists fetched successfully",
      page,
      limit,
      totalWishlists,
      totalPages: Math.ceil(totalWishlists / limit),
      wishlists,
    });
  } catch (error) {
    next(error);
  }
};

// Wishlist Statistics
const getWishlistStats = async (req, res, next) => {
  try {
    const stats = await WishList.aggregate([
      {
        $unwind: "$products",
      },
      {
        $group: {
          _id: "$products",
          wishlistCount: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          wishlistCount: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          _id: 0,
          product: 1,
          wishlistCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Wishlist statistics fetched successfully",
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Orders
const getAllOrders = async (req, res, next) => {
  try {
    const {
      status,
      paymentStatus,
      startDate,
      endDate,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};

    // Filter by order status
    if (status) {
      filter.status = status;
    }

    // Filter by payment status
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);

        end.setHours(23, 59, 59, 999);

        filter.createdAt.$lte = end;
      }
    }

    // Sorting
    const sortOrder = order === "asc" ? 1 : -1;

    const orders = await Order.find(filter).sort({
      [sort]: sortOrder,
    });

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get Order By ID
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Update Order Status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ];

    // Validate status
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // Find order
    const order = await Order.findById(id).populate("user");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update status
    order.status = status;

    // Update deliveredAt
    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    // Update cancelledAt
    if (status === "cancelled") {
      order.cancelledAt = new Date();
    }

    await order.save();

    // Send email to customer
    if (order.user?.email) {
      await sendEmail({
        to: order.user.email,
        subject: `Order Status Updated - ${status}`,
        html: `
          <h2>Order Status Updated</h2>

          <p>
            Hello ${order.user.username || "Customer"},
          </p>

          <p>
            Your order status has been updated to:
            <strong>${status}</strong>
          </p>

          <p>
            Order ID: ${order._id}
          </p>

          <p>
            Thank you for shopping with us.
          </p>
        `,
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getDashboard,
  getAllCarts,
  getAllWishlists,
  getWishlistStats,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};





