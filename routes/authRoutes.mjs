import { isLoggedIn, checkLocal } from "../middleware/authMiddleware.mjs";
import User from "../models/User.mjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import async from "async";

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
      successRedirect: "/profile",
      failureRedirect: "/login",
      failureFlash: true
    })
  );
  app.get("/signup", (req, res) => {
    res.render("signup.ejs", { message: req.flash("signupMessage") });
  });

  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/profile",
      failureRedirect: "/signup",
      failureFlash: true
    })
  );

  app.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/");
  });

  app.get("/profile", isLoggedIn, checkLocal, (req, res) => {
    res.render("profile.ejs", {
      user: req.user
    });
  });

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
    console.log(user);
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
      successRedirect: "/profile", // redirect to the secure profile section
      failureRedirect: "/connect/local", // redirect back to the signup page if there is an error
      failureFlash: true // allo••••••w flash messages
    })
  );

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
  // FORGOT PASSWORD ROUTES

  // enter email to receive link with token
  app.get("/forgot", (req, res) => {
    res.render("forgot.ejs", { message: req.flash("forgotMessage") });
  });

  app.post("/forgot", (req, res, next) => {
    async.waterfall(
      [
        done => {
          // create token
          crypto.randomBytes(20, (err, buf) => {
            const token = buf.toString("hex");
            done(err, token);
          });
        },
        (token, done) => {
          // token is passed to next function, search for email in DB
          User.findOne({ "local.email": req.body.email }, (err, user) => {
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
              done(err, token, user);
            });
          });
        },
        (token, user, done) => {
          // send email to that user with password reset link with token
          const smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: "getupandplay1@gmail.com",
              pass: keys().gmailPW
            }
          });
          const mailOptions = {
            to: user.local.email,
            from: "GetUpAndPlay1@gmail.com",
            subject: "Password Reset",
            text: `You are receiving this message because you (or someone else) have requested a password reset for your account on GET UP AND PLAY!
          Please click this link: http://${req.headers.host}/reset/${token}
          If you did NOT request a password reset, please ignore this email and your password will remain the same.
          `
          };
          smtpTransport.sendMail(mailOptions, err => {
            console.log("mail sent");
            req.flash(
              "forgotMessage",
              `SUCCESS! An email has been sent to ${
                user.local.email
              } with a password reset link.`
            );
            done(err, "done");
          });
        }
      ],

      err => {
        if (err) return next(err);
        res.redirect("/forgot");
      }
    );
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

  app.post("/reset/:token", (req, res, next) => {
    async.waterfall(
      [
        done => {
          // find the user based on the reset token... check and see if it's still active
          User.findOne(
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

              // password validations
              const errors = [];

              let password = req.body.password;

              if (password !== req.body.confirmPassword) {
                errors.push("The passwords do not match.");
              }
              if (password.length < 8) {
                errors.push("The password is too short.");
              }
              if (!password.match(/[A-Z]/)) {
                errors.push(
                  "Password must contain at least one capital letter."
                );
              }
              if (!password.match(/[a-z]/)) {
                errors.push(
                  "Password must contain at least one lowercase letter."
                );
              }
              if (!password.match(/[-!$%^&*()_+|~=`{}\[\]:\/;<>?,.@#]/)) {
                errors.push(
                  "Password must contain at least one special symbol."
                );
              }

              if (errors.length > 0) {
                req.flash("resetMessage", errors);
                return res.redirect("back");
              }

              // if no errors, change the password

              console.log(user);
              let userLocal = user.local;
              userLocal.password = user.generateHash(req.body.password);
              user.resetPasswordToken = undefined;
              user.resetPasswordTokenExpires = undefined;
              user.save(function(err) {
                done(err, user);
              });
            }
          );
        },
        (user, done) => {
          // email logic to notify password has been changed
          const smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: "getupandplay1@gmail.com",
              pass: keys().gmailPW
            }
          });
          const mailOptions = {
            to: user.local.email,
            from: "GetUpAndPlay1@gmail.com",
            subject: "Your password has been changed.",
            text: `This is to confirm that ${
              user.local.email
            }'s password has been updated.`
          };
          smtpTransport.sendMail(mailOptions, err => {
            req.flash(
              "resetMessage",
              `SUCCESS! Your password has been changed.`
            );
            done(err);
          });
        }
      ],
      err => {
        res.redirect("/login");
      }
    );
  });
};
