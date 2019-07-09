import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcrypt-nodejs";

const userSchema = new Schema(
  {
    local: {
      firstName: {
        type: String,
        sparse: true
      },
      lastName: {
        type: String,
        sparse: true
      },
      fullName: {
        type: String,
        sparse: true
      },
      email: {
        type: String,
        unique: true,
        sparse: true
      },
      temp_email: {
        type: String,
        // select: false,
        sparse: true
      },
      password: {
        type: String
        // select: false
      },
      confirmed: {
        type: Boolean,
        // select: false,
        default: false
      },
      confirmToken: String,
      confirmTokenExpires: Date
    },
    facebook: {
      id: String,
      token: String,
      email: String,
      name: String,
      active: {
        type: Boolean,
        default: false
      }
    },
    twitter: {
      id: String,
      token: String,
      displayName: String,
      username: String,
      active: {
        type: Boolean,
        default: false
      }
    },
    google: {
      id: String,
      token: String,
      email: String,
      name: String,
      active: {
        type: Boolean,
        default: false
      }
    },
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId, //   id from the User model
        ref: "users" // ref refers to the model that we are going to use here. Which is User.
      }
    ]
  },
  { timestamps: true }
);

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

// generating a hash

export default mongoose.model("users", userSchema);
