const express = require("express");
require("dotenv").config();
const app = express();
const path = require("path");
const userModel = require("./models/user.model.js");
const CookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 8000;

app.set("view engine", "ejs");
app.use(express.static("public")); // Optional, if using assets
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(CookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profile", isLoggedin, (req, res) => {
  res.render("profile");
});
app.post("/register", async (req, res) => {
  const { email, password, username, name, age } = req.body;

  const existingUser = await userModel.findOne({ email });

  if (existingUser) return res.status(400).send("User already exists");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await userModel.create({
    email,
    password: hashedPassword,
    username,
    name,
    age,
  });
  const token = jwt.sign({ userId: user._id }, "shhhh");
  res.cookie("token", token, { httpOnly: true });

  res.send("User created");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("something went wrong");
  bcrypt.compare(password, user.password, function (err, result) {
    const token = jwt.sign({ userId: user._id }, "shhhh");
    res.cookie("token", token, { httpOnly: true });
    if (result) res.status(200).redirect("/profile");
    else res.redirect("/login");
  });
});

app.get("/logout", async (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

function isLoggedin(req, res, next) {
  if (req.cookies.token === "") res.send("you must be logged in");
  else {
    let data = jwt.verify(req.cookies.token, "shhhh");
    req.user = data;
  }
  next();
}
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
