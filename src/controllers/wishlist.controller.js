import WishList from "../models/Wishlist.model.js";
import Product from "../models/Product.model.js";

export const getWishlists = async (req, res, next) => {
  try {
    const wishlist = await WishList.findOne({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      wishlist,
    });
  } catch (err) {
    next(err);
  }
};

export const addProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Check if there is no product with productId
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      return next(error);
    }

    let wishlist = await WishList.findOne({ user: req.user._id });

    // Check if the wishlist is new or there is one created before
    // 1) New one
    if (!wishlist) {
      wishlist = await WishList.create({
        user: req.user._id,
        products: [productId],
      });
    }
    // 2) The wishlist created before
    else {
      // A) Check if the wishlist already has the sent product
      if (wishlist.products.some((id) => id.toString() === productId)) {
        const error = new Error("Product already exists in wishlist");
        error.statusCode = 400;
        return next(error);
      }

      // B) Wishlist doesn't have the product
      wishlist.products.push(productId);
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: "Product added successfully",
      wishlist,
    });
  } catch (err) {
    next(err);
  }
};

export const removeProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Check if there is no product with productId
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      return next(error);
    }

    const wishlist = await WishList.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { products: productId } },
      { new: true },
    );

    if (!wishlist) {
      const error = new Error("Wishlist not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Product removed successfully",
      wishlist,
    });
  } catch (err) {
    next(err);
  }
};

export const clearWishlist = async (req, res, next) => {
  try {
    await WishList.findOneAndUpdate(
      { user: req.user._id },
      { $set: { products: [] } },
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
