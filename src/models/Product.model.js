const mongoose = require("mongoose");
const slugify = require("slugify");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: [true, "Review rating is required"],
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
    },
  },
  { _id: true },
);

const imageSchema = new mongoose.Schema(
  {
    public_id: {
      type: String,
      required: [true, "Image public_id is required"],
    },

    url: {
      type: String,
      required: [true, "Image url is required"],
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      unique: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: String,
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },
    description: {
      type: String,
      required: [true, "Full description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: [0, "Discount price cannot be negative"],
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true, // allows multiple docs without sku while keeping uniqueness when present
      trim: true,
    },
    images: {
      type: [imageSchema],
      required: [true, "Product images are required"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: "At least one product image is required",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      lowercase: true,
      trim: true,
    },
    subCategory: {
      type: String,
      lowercase: true,
      trim: true,
    },
    brand: String,
    tags: [String],
    reviews: {
      type: [reviewSchema],
      ref: "Review",
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: String,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "createdBy (admin user reference) is required"],
    },
  },
  {
    toJSON: true,
    toObject: true,
    timestamps: true,
  },
);

productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
    next();
  }
});

productSchema.methods.calcAverageRating = function calcAverageRating() {
  const reviews = this.review || [];
  this.numReviews = reviews.length;

  if (!reviews.length) {
    this.averageRating = 0;
    this.numReviews = 0;
    return;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  this.averageRating = Math.round((total / reviews.length) * 10) / 10;
};

productSchema.virtual("hasDiscount").get(function hasDiscount() {
  return this.discountPrice > 0 && this.discountPrice < this.price;
});

productSchema.index({
  name: "text",
  description: "text",
  brand: "text",
});

productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
