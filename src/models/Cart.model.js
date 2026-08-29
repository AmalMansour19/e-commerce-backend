const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: {
    type: [cartItemSchema],
    default: [],
  },
  coupon: {
    code: {
      type: String,
      required: false,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: false,
    },
    discountValue: {
      type: Number,
      required: false,
    },
  },
});

cartSchema.virtual("subtotal").get(function () {
  return this.calculateSubtotal();
});

cartSchema.virtual("discountAmount").get(function () {
  return this.calculateDiscountAmount();
});

cartSchema.virtual("total").get(function () {
  return this.calculateTotal();
});

cartSchema.virtual("itemCount").get(function () {
  return this.calculateItemCount();
});

cartSchema.methods.addItem = function (item) {
  const itemIndex = this.items.findIndex(
    (cartItem) => cartItem.product.toString() === item.product.toString(),
  );

  if (itemIndex !== -1) {
    this.items[itemIndex].quantity += item.quantity;
  } else {
    this.items.push(item);
  }
};

cartSchema.methods.calculateSubtotal = function () {
  const cart = this;
  let subtotal = 0;

  cart.items.forEach((item) => {
    subtotal += item.price * item.quantity;
  });

  return subtotal;
};

cartSchema.methods.calculateDiscountAmount = function () {
  const subtotal = this.calculateSubtotal();

  if (
    !this.coupon ||
    !this.coupon.discountType ||
    this.coupon.discountValue == null
  ) {
    return 0;
  }

  if (this.coupon.discountType === "percentage") {
    return (subtotal * this.coupon.discountValue) / 100;
  }

  if (this.coupon.discountType === "fixed") {
    return this.coupon.discountValue;
  }

  return 0;
};

cartSchema.methods.calculateTotal = function () {
  const subtotal = this.calculateSubtotal();
  const discountAmount = this.calculateDiscountAmount();

  return subtotal - discountAmount;
};

cartSchema.methods.calculateItemCount = function () {
  const cart = this;

  return cart.items.reduce((total, item) => total + item.quantity, 0);
};

module.exports = mongoose.model("Cart", cartSchema);
