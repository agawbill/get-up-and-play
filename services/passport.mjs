import User from "../models/User.mjs";
import googleOauth20 from "passport-google-oauth20";
import facebookAuth from "passport-facebook";
import localAuth from "passport-local";

const GoogleStrategy = googleOauth20.Strategy;
const FacebookStrategy = facebookAuth.Strategy;
const LocalStrategy = localAuth.Strategy;

export const authPassport = (passport, keys) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        // asynchronous

        //  Whether we're signing up or connecting an account, we'll need
        //  to know if the email address is in use.
        await User.findOne({ "local.email": email }, (err, existingUser) => {
          // if there are any errors, return the error
          if (err) return done(err);

          // validations for email and password are below

          const errors = [];

          if (existingUser) {
            errors.push("That email is already taken.");
          }
          if (email.indexOf("@") == -1) {
            errors.push("Email is not a valid email.");
          }
          if (email.match(/[-!$%^&*()_+|~=`{}\[\]:\/;<>?,#]/)) {
            errors.push("Email is not a valid email.");
          }
          if (password !== req.body.confirmPassword) {
            errors.push("The passwords do not match.");
          }
          if (password.length < 7) {
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
            return done(null, false, req.flash("signupMessage", errors));
          }

          //  If we're logged in, we're connecting a new local account. This is accomplished by looking for an active session
          if (req.user) {
            let user = req.user;
            user.local.email = email;
            user.local.password = user.generateHash(password);
            user.save(err => {
              if (err) throw err;
              return done(null, user);
            });
          }
          //  We're not logged in, so we're creating a brand new user.
          else {
            // create the user
            let newUser = new User();

            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);

            newUser.save(function(err) {
              if (err) throw err;

              return done(null, newUser);
            });
          }
        });
      }
    )
  );

  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      (req, email, password, done) => {
        User.findOne({ "local.email": email }, (err, user) => {
          if (err) return done(err);

          if (!user)
            return done(
              null,
              false,
              req.flash("loginMessage", "No user found.")
            ); // req.flash is the way to set flashdata using connect-flash

          // if the user is found but the password is wrong
          if (!user.validPassword(password))
            return done(
              null,
              false,
              req.flash("loginMessage", "Oops! Wrong password.")
            ); // create the loginMessage and save it to session as flashdata

          // log in the user successfully
          return done(null, user);
        });
      }
    )
  );

  // GOOGLE STRATEGY

  passport.use(
    new GoogleStrategy(
      {
        clientID: keys().googleClientID,
        clientSecret: keys().googleClientSecret,
        callbackURL: "/auth/google/callback",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        passReqToCallback: true,
        proxy: true
      },
      async (req, token, tokenSecret, profile, done) => {
        // if there's not an active session, we're going to need to create a new user.. below checks for the active session
        if (!req.user) {
          // checks to see if a user has already been registered with a google id
          let existingUser = await User.findOne({
            "google.id": profile.id
          });
          // checks to see if a user has been registered with a local email
          let existingUserLocal = await User.findOne({
            "local.email": profile._json.email
          });
          // checks to see if a user has the "temp_email" field populated... which indicates an aborted social media signup prior
          let existingUserLocalTemp = await User.findOne({
            "local.temp_email": profile._json.email
          });
          if (existingUser) {
            // already have a record
            return done(null, existingUser);
            // what you need to call once passport has finished authenticating
            // null indicates no error, second argument is user record
          }
          // checking to see if local email is registered
          if (existingUserLocal) {
            // if a local email exists that matches the social media email for this user, instead of creating a new record in the database, simply add
            // the google account information to that record to avoid creating a new record
            existingUserLocal.google.id = profile.id;
            existingUserLocal.google.token = token;
            existingUserLocal.google.name = `${profile._json.name}`;
            existingUserLocal.google.email = profile._json.email;
            existingUserLocal.facebook.active = true;

            // save the user
            existingUserLocal.save(err => {
              if (err) throw err;
              return done(null, existingUserLocal);
            });
          }

          // Check if someone has already attempted to create an account with their social media, but failed to link a local account
          // (hit the back button before completing the local registration after signing up with a social media account)
          // A temporary email is saved to the database when this happens, so a new record isn't created in the database for the aborted social media sign up.
          // The app will search if that temp email matches the email of whatever social media they're trying to register with now.
          //  IF it matches, they'll be able to add their soeicla media credentials to the record, and then local credentials
          //  This is done to avoid creating a new, unecessary record in the database if a user doesn't complete registration

          if (existingUserLocalTemp) {
            existingUserLocalTemp.google.id = profile.id;
            existingUserLocalTemp.google.token = token;
            existingUserLocalTemp.google.name = `${profile._json.name}`;
            existingUserLocalTemp.google.email = profile._json.email;
            existingUserLocalTemp.facebook.active = true;

            // save the user
            existingUserLocalTemp.save(err => {
              if (err) throw err;
              return done(null, existingUserLocalTemp);
            });
          }
          //No temp or local account found, register new email/social media account
          let user = await new User({
            "local.temp_email": profile._json.email,
            "google.id": profile.id,
            "google.email": profile._json.email,
            "google.token": token,
            "google.name": profile._json.name,
            "google.active": true
          }).save();
          done(null, user);
          // }
        } else {
          // user already exists and is logged in, we have to link accounts
          let user = req.user; // pull the user out of the session
          if (user.local.email == profile._json.email) {
            // link to the current local account if a common email is found
            user.google.id = profile.id;
            user.google.token = token;
            user.google.name = profile._json.name;
            user.google.email = profile._json.email;
            user.google.active = true;

            // save the user
            user.save(err => {
              if (err) throw err;
              return done(null, user);
            });
          } else {
            // If there is already an active session... link accounts

            let existingUser = await User.findOne({
              "google.id": profile.id
            });
            let existingUserLocalTemp = await User.findOne({
              "local.temp_email": profile._json.email
            });

            if (existingUser) {
              // already have a record
              return done(null, existingUser);
              // what you need to call once passport has finished authenticating
              // null indicates no error, second argument is user recor
            }

            // Check if someone has already attempted to create an account with their social media, but failed to link a local account
            // (hit the back button before completing the local registration after signing up with a social media account)
            // A temporary email is saved to the database when this happens, so a new record isn't created in the database for the aborted social media sign up.
            // The app will search if that temp email matches the email of whatever social media they're trying to register with now.
            //  IF it matches, they'll be able to add their soeicla media credentials to the record, and then local credentials
            //  This is done to avoid creating a new, unecessary record in the database if a user doesn't complete registration

            if (existingUserLocalTemp) {
              existingUserLocalTemp.google.id = profile.id;
              existingUserLocalTemp.google.token = token;
              existingUserLocalTemp.google.name = `${profile._json.name}`;
              existingUserLocalTemp.google.email = profile._json.email;
              existingUserLocalTemp.facebook.active = true;

              // save the user
              existingUserLocalTemp.save(err => {
                if (err) throw err;
                return done(null, existingUserLocalTemp);
              });
            }
            // Below, because there's no local email address that matches this new social media account you want to link, a new account will be created...
            // Where you'll be forced to register this new email locally as well

            let user = await new User({
              "local.temp_email": profile._json.email,
              "google.id": profile.id,
              "google.email": profile._json.email,
              "google.token": token,
              "google.name": profile._json.name,
              "google.active": true
            }).save();
            done(
              null,
              user,
              req.flash(
                "signupMessage",
                "Email is different than local account. Create a new account for this email."
              )
            );
          }
        }
      }
    )
  );

  // FACEBOOK STRATEGY

  passport.use(
    new FacebookStrategy(
      {
        // pull in our app id and secret from our auth.js file
        clientID: keys().facebookAppID,
        clientSecret: keys().facebookAppSecret,
        callbackURL: keys().facebookCallBackURI,
        profileFields: ["id", "emails", "name"],
        passReqToCallback: true
      },

      // facebook will send back the token and profile
      async (req, token, refreshToken, profile, done) => {
        // asynchronous
        // find the user in the database based on their facebook id
        if (!req.user) {
          let existingUser = await User.findOne({ "facebook.id": profile.id });
          let existingUserLocal = await User.findOne({
            "local.email": profile._json.email
          });
          let existingUserLocalTemp = await User.findOne({
            "local.temp_email": profile._json.email
          });
          // if there is an error, stop everything and return that
          // ie an error connecting to the database
          if (existingUser) {
            return done(null, existingUser); // user found, return that user
          }

          // checking to see if local email is registered
          if (existingUserLocal) {
            // if (existingUserLocal.local.email == profile._json.email) {
            // link to the current local account if a common email is found
            existingUserLocal.facebook.id = profile.id;
            existingUserLocal.facebook.token = token; // we will save the token that facebook provides to the user
            existingUserLocal.facebook.name = `${profile._json.first_name} ${
              profile._json.last_name
            }`;
            existingUserLocal.facebook.email = profile._json.email;
            existingUserLocal.facebook.active = true;

            // save the user
            existingUserLocal.save(err => {
              if (err) throw err;
              return done(null, existingUserLocal);
            });
            // }
          }
          // IF there's no active session...
          // Check if someone has already attempted to create an account with their social media, but failed to link a local account
          // (hit the back button before completing the local registration after signing up with a social media account)
          // A temporary email is saved to the database when this happens, so a new record isn't created in the database for the aborted social media sign up.
          // The app will search if that temp email matches the email of whatever social media they're trying to register with now.
          //  IF it matches, they'll be able to add their soeicla media credentials to the record, and then local credentials
          //  This is done to avoid creating a new, unecessary record in the database if a user doesn't complete registration

          if (existingUserLocalTemp) {
            existingUserLocalTemp.facebook.id = profile.id;
            existingUserLocalTemp.facebook.token = token; // we will save the token that facebook provides to the user
            existingUserLocalTemp.facebook.name = `${
              profile._json.first_name
            } ${profile._json.last_name}`;
            existingUserLocalTemp.facebook.email = profile._json.email;
            existingUserLocalTemp.facebook.active = true;

            // save the user
            existingUserLocalTemp.save(err => {
              if (err) throw err;
              return done(null, existingUserLocalTemp);
            });
          } else {
            // Below, because there's no local email address that matches this new social media account you want to link, a new account will be created...
            // Where you'll be forced to register this new email
            let newUser = await new User({
              "local.temp_email": profile._json.email, //add temp email just in case client aborts linking local email
              "facebook.id": profile.id, // set the users facebook id
              "facebook.token": token, // we will save the token that facebook provides to the user
              "facebook.name": `${profile._json.first_name} ${
                profile._json.last_name
              }`,
              "facebook.email": profile._json.email,
              "facebook.active": true
            }).save();
            // if successful, return the new user
            done(null, newUser);
          }
        } else {
          // user already exists and is logged in, we have to link accounts
          let user = req.user; // pull the user out of the session
          if (user.local.email == profile._json.email) {
            // if a local email is found that matches the profile's email, link
            user.facebook.id = profile.id;
            user.facebook.token = token; // we will save the token that facebook provides to the user
            user.facebook.name = `${profile._json.first_name} ${
              profile._json.last_name
            }`;
            user.facebook.email = profile._json.email;
            user.facebook.active = true;

            // save the user
            user.save(err => {
              if (err) throw err;
              return done(null, user);
            });
          } else {
            // if there is no local email that matches the linked social media account's emaail, create a new account
            let existingUser = await User.findOne({
              "facebook.id": profile.id
            });

            let existingUserLocalTemp = await User.findOne({
              "local.temp_email": profile._json.email
            });
            // if t
            if (existingUser) {
              // already have a record
              return done(null, existingUser);
              // what you need to call once passport has finished authenticating
              // null indicates no error, second argument is user recor
            }

            // Below, it's going to check if someone has already attempted to create an account with their social media, but failed to link a local account
            // (hit the back button before completing the local registration after signing up with a social media account)
            // A temporary email is saved to the database so a new record isn't created in the database for the aborted social media sign up, and
            // the app will find the record based on the temp email that was added during the oauth, and then add the local email to that record once
            // local registration is conplete

            if (existingUserLocalTemp) {
              existingUserLocalTemp.facebook.id = profile.id;
              existingUserLocalTemp.facebook.token = token;
              existingUserLocalTemp.facebook.name = `${
                profile._json.first_name
              } ${profile._json.last_name}`;
              existingUserLocalTemp.facebook.email = profile._json.email;
              existingUserLocalTemp.facebook.active = true;

              // save the user
              existingUserLocalTemp.save(err => {
                if (err) throw err;
                return done(null, existingUserLocalTemp);
              });
            } else {
              // Below, because there's no local email address that matches this new social media account you want to link, a new account will be created...
              // Where you'll be forced to register this new email
              let newUser = await new User({
                "local.temp_email": profile._json.email,
                "facebook.id": profile.id, // set the users facebook id
                "facebook.token": token, // we will save the token that facebook provides to the user
                "facebook.name": `${profile._json.first_name} ${
                  profile._json.last_name
                }`, // look at the passport user profile to see how names are returned
                "facebook.email": profile._json.email, // facebook can return multiple emails so we'll take the first});
                "facebook.active": true
              }).save();
              // if successful, return the new user
              done(
                null,
                newUser,
                req.flash(
                  "signupMessage",
                  "Email is different than local account. Create a new account for this email."
                )
              );
            }
          }
        }
      }
    )
  );
};
