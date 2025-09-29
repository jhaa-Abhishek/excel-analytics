import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: { type: String, required: true },
    columns: [String],
    data: [{}],
  },
  { timestamps: true }
);

export default mongoose.model("Upload", uploadSchema);
