import mongoose from "mongoose";
const { Schema } = mongoose;

const friendRequestSchema = new Schema({
  sender: {
    id: {
      type: mongoose.Schema.Types.ObjectId, //   id from the User model
      ref: "User" // ref refers to the model that we are going to use here. Which is User.
    }
  },
  receiver: {
    id: {
      type: mongoose.Schema.Types.ObjectId, //   id from the User model
      ref: "User" // ref refers to the model that we are going to use here. Which is User.
    }
  },
  status: Number
});

export default mongoose.model("friendRequests", friendRequestSchema);
