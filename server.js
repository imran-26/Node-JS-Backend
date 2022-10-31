import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import productRouter from "./routes/product.js";

// Configuration
dotenv.config();
const app = express();

const PORT = process.env.PORT || 4000;
const DB_URI = process.env.MONGO_URI;

// Middleware
app.use(
  cors({
    origin: "https://frontendbrandr.vercel.app",
    credentials: true,
  }),
);
app.set("trust proxy", 1)
app.use(express.json());

// Route
app.all("/", (req, res) => {
  res.send({ message: "Welcome" });
});
// Auth Routes
app.use("/api/v1/user", authRouter);
// User Routes
app.use("/api/v1/users", userRouter);
// Product Routes
app.use("/api/v1/products", productRouter);

app.all("*", (req, res) => res.status(404).send({ message: "Could not find any resource!" }));

// Connect
const connect = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log(`DB Connected successfully`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

app.listen(PORT, () => {
  console.log(`server connected to port ${PORT} successfully`);
  connect();
});
