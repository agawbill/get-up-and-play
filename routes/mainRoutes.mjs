import {
  isLoggedIn,
  checkLocal,
  checkConfirmed
} from "../middleware/authMiddleware.mjs";
import mongoose from "mongoose";
import fileUpload from "../services/file-upload.mjs";
import User from "../models/User.mjs";

export const mainRoutes = (app, express) => {
  app.get("/", (req, res) => {
    if (req.user) {
      return res.redirect("/profile");
    }
    res.render("index.ejs");
  });

  app.use("/static", express.static("public"));

  app.post("/add-avatar", isLoggedIn, async (req, res) => {
    const singleUpload = fileUpload().single("image");
    const currentUser = req.user;
    const filter = { _id: "Jean-Luc Picard" };
    const update = { age: 59 };

    await singleUpload(req, res, function(err) {
      if (err) {
        return res.redirect("/profile");
      }

      // cognitoUser = userPool.getCurrentUser();

      // const pictureInfo = {
      //   title: req.body.title,
      //   username: req.body.username,
      //   url: req.file.location
      // };

      // new Picture(pictureInfo)
      //   .save()
      //   .then(result => {})
      //   .catch(err => {
      //     res.status(400).send("Unable to save data");
      //   });
      if (req.file == undefined) {
        req.flash(
          "uploadMessage",
          "Please only upload files with a jpeg or png extension."
        );
        return res.redirect("/profile");
      }
      const userProfile = User.findOneAndUpdate(
        { _id: currentUser.id },
        { $set: { avatar: req.file.location } },
        (err, user) => {
          if (err) {
            return res.send(err);
          }
          return user;
        }
      );

      return res.redirect("/profile");
    });
  });
};
