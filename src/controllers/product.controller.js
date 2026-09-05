import Product from "../models/Product.model.js";

// Search + Filter + Sort + Pagination
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      subcategory,
      brand,
      tags,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      isActive: true,
    };

    // Search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    // Category
    if (category) {
      filter.category = {
        $regex: category,
        $options: "i",
      };
    }

    // Subcategory
    if (subcategory) {
      filter.subcategory = {
        $regex: subcategory,
        $options: "i",
      };
    }

    // Brand
    if (brand) {
      filter.brand = {
        $regex: brand,
        $options: "i",
      };
    }

    // Tags
    if (tags) {
      const tagList = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      filter.tags = {
        $in: tagList,
      };
    }

    // Price
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Pagination
    const currentPage = Math.max(Number(page) || 1, 1);
    const itemsLimit = Math.max(Number(limit) || 10, 1);
    const skip = (currentPage - 1) * itemsLimit;

    // Sorting
    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;

      case "price_desc":
        sortOption = { price: -1 };
        break;

      case "rating":
        sortOption = { averageRating: -1 };
        break;

      case "popular":
        sortOption = { numReviews: -1 };
        break;

      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(itemsLimit),

      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / itemsLimit);

    res.status(200).json({
      success: true,
      totalProducts,
      currentPage,
      totalPages,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Add Review
const addReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const userId = req.user._id || req.user.id || req.user.userId;

    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const username =
      req.user.username || req.user.name || "User";

    product.reviews.push({
      user: userId,
      username,
      rating: Number(rating),
      comment,
    });

    product.calcAverageRating();

    await product.save();

    const addedReview =
      product.reviews[product.reviews.length - 1];

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: addedReview,
      averageRating: product.averageRating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    next(error);
  }
};

// Get Reviews
const getReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).select(
      "reviews averageRating numReviews"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
      averageRating: product.averageRating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Review
const deleteReview = async (req, res, next) => {
  try {
    const { id, rid } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const review = product.reviews.id(rid);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const userId = req.user._id || req.user.id || req.user.userId;

    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    review.deleteOne();

    product.calcAverageRating();

    await product.save();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      averageRating: product.averageRating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getProducts,
  addReview,
  getReviews,
  deleteReview,
};