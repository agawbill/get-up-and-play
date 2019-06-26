import mongoose from "mongoose";
import User from "../models/User.mjs";

export const friendRoutes = app => {
  app.get("/friend/search-users", async (req, res) => {
    res.render("search-users", {});
  });

  app.post("/friend/search-users", async (req, res) => {
    let users = await User.find().select([
      "-local.password",
      "-friends",
      "-facebook",
      "-google",
      "-twitter"
    ]);

    // console.log(users);

    let filteredUsers = [];

    class Member {
      constructor(name, email) {
        this.name = name;
        this.email = email;
      }
    }

    users.forEach(name => {
      let isConfirmed = name.local.confirmed;
      let user = name.local.fullName;
      let email = name.local.email;

      if (user !== undefined && isConfirmed !== false) {
        console.log(email);
        filteredUsers.push(new Member(user, email));
      }
    });
    // console.log(filteredUsers);

    const queriedUsers = filteredUsers.filter(user => {
      let query = req.body.query;
      let name = user.name;
      const regex = new RegExp(query, "gi");
      return name.match(regex);
    });

    return res.send(queriedUsers);
  });

  app.get("/friend/user", async (req, res) => {
    let user = await User.find({ "local.name": req.body.name }, (err, user) => {
      if (err) {
        return res.send("Something went wrong", err);
      }
      return res.json(users);
    });
  });

  app.post("/friend/send-request", async (req, res) => {
    // create token
    let token = await crypto.randomBytes(20, (err, buf) => {
      return (token = buf.toString("hex"));
    });

    // token is passed to next function, search for email in DB
    const user = await User.findOne(
      { "local.confirmToken": req.params.token },
      (err, user) => {
        if (!user) {
          // if a user with that email can't be found, redirect back home
          return res.redirect("/");
        }

        if (user.local.confirmed == true) {
          return res.redirect("/profile");
        }
        // if a user is found with that email, save a token and a token expiration date to that user's object in the db
        user.local.confirmToken = token;
        user.local.confirmTokenExpires = Date.now() + 360000; // 1 hour
        user.save(err => {
          return user;
        });
      }
    );
  });
};
