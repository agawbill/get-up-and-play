import mongoose from "mongoose";
import User from "../models/User.mjs";

export const friendRoutes = app => {
  app.get("/users", async (req, res) => {
    let users = await User.find({}, (err, users) => {
      if (err) {
        return res.send("Something went wrong", err);
      }
      return res.json(users);
    });
  });

  app.get("/user", async (req, res) => {
    let user = await User.find({ "local.name": req.body.name }, (err, user) => {
      if (err) {
        return res.send("Something went wrong", err);
      }
      return res.json(users);
    });
  });
};
