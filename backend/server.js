import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" })); // handle image base64 uploads

connectDB();

app.use("/api/posts", postRoutes);

app.listen(5000, () => console.log("✅ Server running on port 5000"));
