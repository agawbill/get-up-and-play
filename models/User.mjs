import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcrypt-nodejs";

const userSchema = new Schema({
  local: {
    email: {
      type: String,
      unique: true,
      sparse: true
    },
    password: {
      type: String
    },
    active: {
      type: Boolean,
      default: false
    }
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
  resetPasswordTokenExpires: Date
});

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

// generating a hash

export default mongoose.model("users", userSchema);
