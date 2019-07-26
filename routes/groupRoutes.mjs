import mongoose from "mongoose";
import { isLoggedIn } from "../middleware/authMiddleware.mjs";
import User from "../models/User.mjs";
import FriendRequest from "../models/FriendRequest.mjs";

export const groupRoutes = app => {
  app.get("/groups/manage", isLoggedIn, (req, res) => {
    const currentUser = req.user;
    res.render("groupManage.ejs", {
      user: currentUser
    });
  });
  app.get("/groups/create", () => {});
};
