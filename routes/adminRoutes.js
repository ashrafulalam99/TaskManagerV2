import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  getAllTasksAdmin,
  deleteUser
} from "../controllers/adminController.js";

const router = express.Router();

router.use(verifyToken);
router.use(allowRoles("admin"));

router.get("/tasks", getAllTasksAdmin);
router.delete("/user/:id", deleteUser);

export default router;