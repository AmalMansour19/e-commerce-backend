import stripe from "../config/stripe.js";
import Order from "../models/Order.model.js";

const createPaymentIntent = async (req, res, next) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
        });

        if (!order) {
            const error = new Error("Order not found");
            error.statusCode = 404;
            return next(error);
        }

        if (order.paymentMethod !== "stripe") {
            const error = new Error("This order does not use Stripe");
            error.statusCode = 400;
            return next(error);
        }
        if (order.paymentStatus === "paid") {
        const error = new Error("Order is already paid");
        error.statusCode = 400;
        return next(error);
        }

         if (order.transactionId) {
            const paymentIntent = await stripe.paymentIntents.retrieve(
                order.transactionId
            );
        
            if (paymentIntent.status !== "canceled") {
                return res.status(200).json({
                    success: true,
                    paymentIntentId: paymentIntent.id,
                    clientSecret: paymentIntent.client_secret,
                    status: paymentIntent.status,
                });
            }
        }


        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(order.totalPrice * 100),
          currency: "egp",
          automatic_payment_methods: {
              enabled: true,
              allow_redirects: "never",
          },
      });

        order.transactionId = paymentIntent.id;

        await order.save();

        res.status(200).json({
            success: true,
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            status: paymentIntent.status,
        });

    } catch (error) {
        next(error);
    }
};
//////////////////////////////
const stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);

    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        const order = await Order.findOne({
          transactionId: paymentIntent.id,
        });

        if (order) {
          order.paymentStatus = "paid";
          order.paidAt = new Date();

          await order.save();

          console.log(`Order ${order._id} marked as paid`);
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;

        const order = await Order.findOne({
          transactionId: paymentIntent.id,
        });

        if (order) {
          order.paymentStatus = "failed";

          await order.save();

          console.log(`Order ${order._id} marked as failed`);
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("Webhook processing error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};


export {
  createPaymentIntent,
  stripeWebhook,
};
