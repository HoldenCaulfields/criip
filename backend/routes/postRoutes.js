import express from "express";
import { upload } from "../config/cloudinary.js";
import Post from "../models/Post.js";

const router = express.Router();

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { text, tags, location } = req.body;
    const parsedTags = JSON.parse(tags || "[]");
    const parsedLocation = location ? JSON.parse(location) : undefined;

    const newPost = await Post.create({
      text,
      imageUrl: req.file?.path || "", // multer-storage-cloudinary adds `path`
      tags: parsedTags,
      location: parsedLocation,
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // get all posts
    res.json(posts);
  } catch (err) {
    console.error("❌ Fetch posts error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id/love", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // if 'loves' not exist yet, default to 0
    post.loves = (post.loves || 0) + 1;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to update love" });
  }
});

router.get("/:roomId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.roomId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
