import mongoose from "mongoose";
const { Schema } = mongoose;

const groupSchema = new Schema({
  title: String,
  members: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
      }
    }
  ],
  timestamps: true
});

export default mongoose.model("groups", groupSchema);
