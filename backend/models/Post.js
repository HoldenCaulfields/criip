import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  _id: String,
  text: String,
  imageUrl: String,
  tags: [String],
  loves: { type: Number, default: 0 },
  location: { latitude: Number, longitude: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Post", postSchema);
