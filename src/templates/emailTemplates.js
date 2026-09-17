export const registrationOtpTemplate = (otp) => `
  <h2>Welcome to Ecommerce API</h2>
  <p>Your registration OTP is:</p>
  <h1>${otp}</h1>
  <p>This OTP will expire soon.</p>
`;

export const forgotPasswordOtpTemplate = (otp) => `
  <h2>Password Reset</h2>
  <p>Your password reset OTP is:</p>
  <h1>${otp}</h1>
  <p>If you didn't request this, please ignore this email.</p>
`;

export const orderConfirmationTemplate = (order) => `
  <h2>Order Confirmed 🎉</h2>
  <p>Your order has been successfully placed.</p>

  <p><strong>Order ID:</strong> ${order._id}</p>
  <p><strong>Total:</strong> ${order.totalPrice}</p>
`;

export const orderStatusTemplate = (order, status) => `
  <h2>Order Status Update</h2>
  <p>Your order status has been updated.</p>

  <p><strong>Order ID:</strong> ${order._id}</p>
  <p><strong>New Status:</strong> ${status}</p>
`;