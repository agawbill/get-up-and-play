import mongoose from "mongoose";
import User from "../models/User.mjs";

export const mainRoutes = app => {
  app.get("/", (req, res) => {
    res.render("index.ejs");
  });
};
