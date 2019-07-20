import {
  isLoggedIn,
  checkLocal,
  checkConfirmed
} from "../middleware/authMiddleware.mjs";
import User from "../models/User.mjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
// import async from "async";

export const authRoutes = (app, passport, keys) => {
  // Authentication
  // local routes
  app.get("/login", (req, res) => {
    res.render("login.ejs", {
      message: req.flash("loginMessage"),
      message2: req.flash("resetMessage")
    });
  });

  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/check-local",
      failureRedirect: "/login",
      failureFlash: true
    })
  );
  app.get("/signup", (req, res) => {
    if (req.user) {
      return res.redirect("/profile");
    }
    res.render("signup.ejs", { message: req.flash("signupMessage") });
  });

  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/check-local",
      failureRedirect: "/signup",
      failureFlash: true
    })
  );

  app.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/");
  });

  app.get(
    "/profile",
    isLoggedIn,
    checkLocal,
    checkConfirmed,
    async (req, res) => {
      const currentUser = await User.findOne(
        { _id: req.user.id },
        (err, user) => {
          if (err) {
            return req.user;
          }
          return user;
        }
      );

      const avatar = currentUser.avatar;

      res.render("profile.ejs", {
        user: req.user,
        message: req.flash("uploadMessage"),
        avatar: avatar
      });
    }
  );

  // google auth routes

  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"]
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/check-google",
      failureRedirect: "/"
    })
  );

  app.get("/check-google", (req, res) => {
    let user = req.user;

    if (user.google.active == true) {
      res.redirect("/profile");
    } else {
      user.google.active = true;
      user.save(err => {
        res.redirect("/profile");
      });
    }
  });

  app.get("/api/current_user", (req, res) => {
    res.send(req.user);
  });

  // FACEBOOK ROUTES

  app.get(
    "/auth/facebook",
    passport.authenticate("facebook", {
      scope: ["public_profile", "email"]
    })
  );

  // handle the callback after facebook has authenticated the user
  app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", {
      successRedirect: "/check-facebook",
      failureRedirect: "/"
    })
  );

  // a middle route to reconnect facebook if a user disconnects from the sign on page
  app.get("/check-facebook", (req, res) => {
    let user = req.user;
    if (user.facebook.active == true) {
      res.redirect("/profile");
    } else {
      user.facebook.active = true;
      user.save(err => {
        res.redirect("/profile");
      });
    }
  });

  // AUTHORIZATION

  // LOCAL
  app.get("/connect/local", (req, res) => {
    let user = req.user;
    res.render("connect-local.ejs", {
      message: req.flash("loginMessage"),
      message: req.flash("signupMessage"),
      user: user
    });
  });
  app.post(
    "/connect/local",
    passport.authenticate("local-signup", {
      successRedirect: "/check-local",
      failureRedirect: "/connect/local",
      failureFlash: true
    })
  );

  app.get("/check-local", (req, res) => {
    let user = req.user;
    if (user.local.confirmed == true) {
      res.redirect("/profile");
    } else {
      res.redirect("/confirm-local");
    }
  });

  // FACEBOOK
  app.get(
    "/connect/facebook",
    passport.authorize("facebook", {
      scope: ["public_profile", "email"]
    })
  );

  // handle the callback after facebook has authorized the user
  app.get(
    "/connect/facebook/callback",
    passport.authorize("facebook", {
      successRedirect: "/profile",
      failureRedirect: "/"
    })
  );

  // GOOGLE
  app.get(
    "/connect/google",
    passport.authorize("google", { scope: ["profile", "email"] })
  );

  // the callback after google has authorized the user
  app.get(
    "/connect/google/callback",
    passport.authorize("google", {
      successRedirect: "/profile",
      failureRedirect: "/"
    })
  );

  // UNLINK

  // facebook -------------------------------
  app.get("/unlink/facebook", (req, res) => {
    let user = req.user;
    user.facebook.active = false;
    user.save(err => {
      res.redirect("/profile");
    });
  });

  // google ---------------------------------
  app.get("/unlink/google", (req, res) => {
    let user = req.user;
    user.google.active = false;
    user.save(err => {
      res.redirect("/profile");
    });
  });

  // confirm local email address before registering

  app.get("/confirm-local", isLoggedIn, (req, res) => {
    let user = req.user;
    if (user.local.confirmed == true) {
      return res.redirect("/profile");
    }
    res.render("confirm-local", {
      email: user.local.email,
      message: req.flash("confirmMessage")
    });
  });

  app.post("/confirm-local", async (req, res) => {
    // create token
    let token = await crypto.randomBytes(20, (err, buf) => {
      return (token = buf.toString("hex"));
    });

    // token is passed to next function, search for email in DB
    const user = await User.findOne(
      { "local.email": req.body.email },
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

    // send email to that user with password reset link with token
    const smtpTransport = await nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "getupandplay1@gmail.com",
        pass: keys().gmailPW
      }
    });
    const mailOptions = await {
      to: user.local.email,
      from: "GetUpAndPlay1@gmail.com",
      subject: "Confirm Email",
      text: `You are receiving this message because you (or someone else) has registered using this email, ${
        user.local.email
      }, at GetUp & Play! If you did not register, please disregard this email.
        If you did, please click this link: http://${
          req.headers.host
        }/confirmed-local/${token} to complete registration and confirm your email address.`
    };
    await smtpTransport.sendMail(mailOptions, err => {
      console.log("mail sent");

      return res.send("success");
    });
  });

  // FULLY CONFIRM EMAIL
  // routes to actually set the email to confirmed

  app.get("/confirmed-local/:token", async (req, res) => {
    let user = await User.findOne({
      "local.confirmToken": req.params.token
    });
    let date = Date.now();

    if (user.local.confirmed == true) {
      return res.redirect("/profile");
    }
    // if the token is not expired, render a page with expiredToken showing false, and user will be prompted to confirm email
    if (user.local.confirmTokenExpires > date) {
      res.render("confirmed-local", {
        expiredToken: false,
        email: user.local.email,
        token: req.params.token,
        message: req.flash("confirmEmail")
      });
    } else {
      // if token is expired,  render a page with expiredToken true, and the user will be given the option to resend the email
      res.render("confirmed-local", {
        expiredToken: true,
        email: user.local.email,
        token: req.params.token,
        message: req.flash("confirmEmail")
      });
    }
  });

  app.post("/confirmed-local/:token", async (req, res) => {
    // try {
    const user = await User.findOne(
      {
        "local.confirmToken": req.body.token,
        "local.confirmTokenExpires": { $gt: Date.now() }
      },
      (err, user) => {
        if (!user) {
          console.log(err);
          return;
        }

        user.local.confirmed = true;
        user.local.confirmToken = undefined;
        user.local.confirmTokenExpires = undefined;
        user.save(err => {
          return user;
        });
      }
    );
    res.send("success!");
  });

  app.post("/resend-token/:token", async (req, res) => {
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

    // send email to that user with password reset link with token
    const smtpTransport = await nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "getupandplay1@gmail.com",
        pass: keys().gmailPW
      }
    });
    const mailOptions = await {
      to: user.local.email,
      from: "GetUpAndPlay1@gmail.com",
      subject: "Confirm Email",
      text: `You are receiving this message because you (or someone else) has registered using this email, ${
        user.local.email
      }, at GetUp & Play! If you did not register, please disregard this email.
          If you did, please click this link: http://${
            req.headers.host
          }/confirmed-local/${token} to complete registration and confirm your email address.`
    };
    await smtpTransport.sendMail(mailOptions, err => {
      console.log("mail sent");

      return res.send("success");
    });
  });

  // FORGOT PASSWORD ROUTES-------------------

  // enter email to receive link with token
  app.get("/forgot", (req, res) => {
    res.render("forgot.ejs", { message: req.flash("forgotMessage") });
  });

  app.post("/forgot", async (req, res, next) => {
    // create token
    let token = await crypto.randomBytes(20, (err, buf) => {
      return (token = buf.toString("hex"));
    });

    // token is passed to next function, search for email in DB
    const user = await User.findOne(
      { "local.email": req.body.email },
      (err, user) => {
        if (!user) {
          // if a user with that email can't be found, flash this error, redirect back to forgot page
          req.flash(
            "forgotMessage",
            "No account with that email address exists."
          );
          return res.redirect("/forgot");
        }
        // if a user is found with that email, save a token and a token expiration date to that user's object in the db
        user.resetPasswordToken = token;
        user.resetPasswordTokenExpires = Date.now() + 360000; // 1 hour
        user.save(err => {
          return user;
        });
      }
    );

    // send email to that user with password reset link with token
    const smtpTransport = await nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "getupandplay1@gmail.com",
        pass: keys().gmailPW
      }
    });
    const mailOptions = await {
      to: user.local.email,
      from: "GetUpAndPlay1@gmail.com",
      subject: "Password Reset",
      text: `You are receiving this message because you (or someone else) have requested a password reset for your account on GET UP AND PLAY!
          Please click this link: http://${req.headers.host}/reset/${token}
          If you did NOT request a password reset, please ignore this email and your password will remain the same.
          `
    };
    await smtpTransport.sendMail(mailOptions, err => {
      console.log("mail sent");
      req.flash(
        "forgotMessage",
        `SUCCESS! An email has been sent to ${
          user.local.email
        } with a password reset link.`
      );
      return res.redirect("/forgot");
    });
  });

  // reset password page

  app.get("/reset/:token", (req, res) => {
    // find the user based on the reset token... check and see if it's still active

    User.findOne(
      {
        resetPasswordToken: req.params.token,
        resetPasswordTokenExpires: { $gt: Date.now() }
      },
      (err, user) => {
        // if a user with that token can't be found, or the reset token isn't greater than the present time, a user won't be found
        if (!user) {
          req.flash(
            "resetMessage",
            "Sorry, password reset token is expired or invalid"
          );
          // will redirect back to forgot page with error messages
          return res.redirect("/forgot");
        }
        // if it can be found, user will be sent to the reset page
        res.render("reset", {
          token: req.params.token,
          message: req.flash("resetMessage")
        });
      }
    );
  });

  app.post("/reset/:token", async (req, res, next) => {
    // find the user based on the reset token... check and see if it's still active
    const user = await User.findOne(
      {
        resetPasswordToken: req.params.token,
        resetPasswordTokenExpires: { $gt: Date.now() }
      },
      (err, user) => {
        if (!user) {
          req.flash(
            "resetMessage",
            "Sorry, password reset token is expired or invalid"
          );
          return res.redirect("back");
        }

        // password validations--due to issues related to scope I have to do them directly in the route

        const errors = [];

        let password = req.body.password;

        if (password !== req.body.confirmPassword) {
          errors.push("The passwords do not match.");
        }
        if (password.length < 8) {
          errors.push("The password is too short.");
        }
        if (!password.match(/[A-Z]/)) {
          errors.push("Password must contain at least one capital letter.");
        }
        if (!password.match(/[a-z]/)) {
          errors.push("Password must contain at least one lowercase letter.");
        }
        if (!password.match(/[-!$%^&*()_+|~=`{}\[\]:\/;<>?,.@#]/)) {
          errors.push("Password must contain at least one special symbol.");
        }

        if (errors.length > 0) {
          req.flash("resetMessage", errors);
          return res.redirect("back");
        }

        // if no errors, change the password

        let userLocal = user.local;
        userLocal.password = user.generateHash(req.body.password);
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpires = undefined;
        user.save(err => {
          return user;
        });
      }
    );

    // email logic to notify password has been changed
    const smtpTransport = await nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "getupandplay1@gmail.com",
        pass: keys().gmailPW
      }
    });
    const mailOptions = await {
      to: user.local.email,
      from: "GetUpAndPlay1@gmail.com",
      subject: "Your password has been changed.",
      text: `This is to confirm that ${
        user.local.email
      }'s password has been updated.`
    };
    await smtpTransport.sendMail(mailOptions, err => {
      req.flash("resetMessage", `SUCCESS! Your password has been changed.`);
      return res.redirect("/login");
    });
  });
};
