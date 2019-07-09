import mongoose from "mongoose";
import User from "../models/User.mjs";

export const mainRoutes = (app, express) => {
  app.get("/", (req, res) => {
    if (req.user) {
      return res.redirect("/profile");
    }
    res.render("index.ejs");
  });

  app.use("/static", express.static("public"));
};
