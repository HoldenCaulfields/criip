import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import postRoutes from "./routes/postRoutes.js";
import http from "http";
import {Server} from "socket.io";
import initSocket from "./socket/socket.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" })); // handle image base64 uploads

connectDB();

app.use("/api/posts", postRoutes);

//socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
initSocket(io);

server.listen(5000, () => console.log("✅ Server running on port 5000"));
