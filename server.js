import express from "express";
import dotenv from "dotenv";
import db from "./db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/admin", adminRoutes);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});