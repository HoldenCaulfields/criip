import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  text: String,
  imageUrl: String,
  tags: [String],
  location: {
    latitude: Number,
    longitude: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Post", postSchema);
