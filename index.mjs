import mongoose from "mongoose";
import bodyParser from "body-parser";
import express from "express";
import passport from "passport";
import cookieSession from "cookie-session";
import session from "express-session";
import flash from "connect-flash";
import morgan from "morgan";
import { authPassport } from "./services/passport.mjs";
import { mainRoutes } from "./routes/mainRoutes.mjs";
import { authRoutes } from "./routes/authRoutes.mjs";
import { keys } from "./config/keys.mjs";

mongoose.connect(keys().mongoURI);

console.log(keys());

const app = express();

app.set("view engine", "ejs");

app.use(
  session({
    secret: "keyboard cat",
    proxy: true,
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mainRoutes(app);
authRoutes(app, passport, keys);
authPassport(passport, keys);

const PORT = process.env.PORT || 5000;

app.listen(PORT);
