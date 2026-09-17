import express from "express";

import auth from "../middleware/auth.middleware.js";

import {
    createPaymentIntent,
} from "../controllers/payment.controller.js";

const router = express.Router();

// router.use(auth);

router.post("/create-intent",auth, createPaymentIntent);

export default router;