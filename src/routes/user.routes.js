import express from "express";
import {
  addUser,
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
} from "../controllers/user.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  userIdSchema,
} from "../validation/user.validation.js";

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  adminMiddleware,
  validate(createUserSchema),
  addUser
);

router.get(
  "/all",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);

router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(userIdSchema),
  getUserById
);

router.patch(
  "/password",
  authMiddleware,
  validate(changePasswordSchema),
  changePassword
);

router.patch(
  "/:id",
  authMiddleware,
  validate(userIdSchema),
  validate(updateUserSchema),
  updateUser
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(userIdSchema),
  deleteUser
);

export default router;
