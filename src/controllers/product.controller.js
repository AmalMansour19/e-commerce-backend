import Product from "../models/Product.model.js";
import productValidation, {
  updateProductValidation,
} from "../validation/product.validation.js";

import {
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";

async function cleanUpImages(images) {
  if (images.length > 0) {
    await Promise.all(
      images.map((image) => {
        if (typeof image === "string") {
          return deleteFromCloudinary(image);
        }

        return deleteFromCloudinary(image.public_id);
      }),
    );
  }
}

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


export async function CreateProduct(req, res) {
  let images = [];

  try {
    if (req.files?.length > 0) {
      images = await uploadMultipleToCloudinary(req.files);
    }

    const validationData = {
      ...req.body,
      images,
    };

    const { error, value } = productValidation.validate(validationData, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      await cleanUpImages(images);

      return res.status(400).send({
        success: false,
        message: "Failed to create product",
        details: error.details.map((detail) => detail.message),
      });
    }

    const product = new Product({ ...value, createdBy: req.user._id });
    await product.save();

    res.status(201).send({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    await cleanUpImages(images);

    res
      .status(400)
      .send({ success: false, message: "Failed to create product", error });
  }
}

export async function GetAllProducts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const category = req.query.category;
    const brand = req.query.brand;
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);
    const search = req.query.search;
    const sort = req.query.sort;

    const filter = {
      ...(category && { category }),
      ...(brand && { brand }),
      ...(search && { name: { $regex: search, $options: "i" } }),
    };

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.price = {};

      if (!isNaN(minPrice)) {
        filter.price.$gte = minPrice;
      }

      if (!isNaN(maxPrice)) {
        filter.price.$lte = maxPrice;
      }
    }

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { averageRating: -1 },
    };

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortMap[sort] || { createdAt: -1 });

    const totalProductsCount = await Product.countDocuments(filter);

    if (products.length === 0) {
      return res.status(404).send({ message: "No products found" });
    }

    res.status(200).send({
      success: true,
      totalProducts: totalProductsCount,
      currentPage: page,
      totalPages: Math.ceil(totalProductsCount / limit),
      products,
    });
  } catch (error) {
    res
      .status(400)
      .send({ success: false, message: "Failed to get products", error });
  }
}

export async function GetProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    res.status(200).send({
      success: true,
      product,
    });
  } catch (error) {
    res
      .status(400)
      .send({ success: false, message: "Failed to get product", error });
  }
}

export async function UpdateProduct(req, res) {
  let newImages = [];

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }

    if (req.files?.length > 0) {
      newImages = await uploadMultipleToCloudinary(req.files);
    }

    let imagesToDelete = [];
    if (req.body.deletedImages) {
      try {
        imagesToDelete = JSON.parse(req.body.deletedImages);
      } catch (error) {
        if (newImages.length > 0) {
          await cleanUpImages(newImages);
        }

        return res.status(400).send({
          success: false,
          message:
            "Invalid format for deletedImages. It should be a JSON array.",
        });
      }
    }

    let updatedImages = (product.images || []).filter(
      (image) => !imagesToDelete.includes(image.public_id),
    );

    if (newImages.length > 0) {
      updatedImages = [...updatedImages, ...newImages];
    }

    const validationData = {
      ...req.body,
      images: updatedImages,
    };

    const { error, value } = updateProductValidation.validate(validationData, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      await cleanUpImages(newImages);

      return res.status(400).send({
        success: false,
        message: "Failed to update product",
        details: error.details.map((detail) => detail.message),
      });
    }

    Object.assign(product, value);
    await product.save();

    await cleanUpImages(imagesToDelete);

    res.status(200).send({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    await cleanUpImages(newImages);

    res
      .status(400)
      .send({ success: false, message: "Failed to update product", error });
  }
}

export async function DeleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }

    await cleanUpImages(product.images || []);

    await Product.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .send({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .send({ success: false, message: "Failed to delete product", error });
  }
}

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

    product.reviews.push({
      user: userId,
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

