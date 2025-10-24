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
  loves: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Post", postSchema);
