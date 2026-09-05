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
      images.map((image) => deleteFromCloudinary(image.public_id)),
    );
  }
}

export async function CreateProduct(req, res) {
  try {
    let images = [];

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
      cleanUpImages(images);

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
    cleanUpImages(images);

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
      ...(minPrice && {
        price: {
          ...(maxPrice && { $lte: maxPrice }),
          $gte: minPrice,
        },
      }),
      ...(search && { name: { $regex: search, $options: "i" } }),
    };

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
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
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }

    let newImages = [];
    if (req.files?.length > 0) {
      newImages = await uploadMultipleToCloudinary(req.files);
    }

    let imagesToDelete = [];
    if (req.body.deletedImages) {
      try {
        imagesToDelete = JSON.parse(req.body.deletedImages);
      } catch (error) {
        if (newImages.length > 0) {
          cleanUpImages(newImages);
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
      cleanUpImages(newImages);

      return res.status(400).send({
        success: false,
        message: "Failed to update product",
        details: error.details.map((detail) => detail.message),
      });
    }

    Object.assign(product, value);
    await product.save();

    if (imagesToDelete.length > 0) {
      await deleteImagesFromCloudinary(imagesToDelete);
    }

    res.status(200).send({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    cleanUpImages(newImages);

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

    cleanUpImages(product.images || []);

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
