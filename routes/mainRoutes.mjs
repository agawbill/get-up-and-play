import mongoose from "mongoose";
import User from "../models/User.mjs";

export const mainRoutes = app => {
  app.get("/", (req, res) => {
    res.render("index.ejs");
  });
  // app.post("/create", async (req, res) => {
  //   try {
  //     const userId = await new User({ googleId: req.body.googleId }).save();
  //     await res.send(userId);
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // });
};
