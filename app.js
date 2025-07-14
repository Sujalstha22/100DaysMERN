const express = require("express");
require("dotenv").config();
const app = express();
const userModel = require("./models/user.model.js");
const postModel = require("./models/post.model.js");
const CookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 8000;
const upload = require("./utils/multerconfig.js");
app.set("view engine", "ejs");
app.use(express.static("public")); // Optional, if using assets
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(CookieParser());

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/profile/upload", (req, res) => {
  res.render("profileupload");
});
app.post("/upload", isLoggedin, upload.single("image"), async (req, res) => {
  let user = await userModel.findById(req.user.userId);
  user.profilePic = req.file.filename;
  await user.save();
  res.redirect("/profile");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/profile", isLoggedin, async (req, res) => {
  let user = await userModel.findById(req.user.userId).populate("posts");
  res.render("profile", { user });
});
app.get("/like/:id", isLoggedin, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");

  if (post.likes.indexOf(req.user.userId) === -1) {
    post.likes.push(req.user.userId);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userId), 1);
  }

  await post.save();
  res.redirect("/profile");
});
app.get("/edit/:id", isLoggedin, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  res.render("edit", { post });
});
app.post("/update/:id", isLoggedin, async (req, res) => {
  let post = await postModel.findOneAndUpdate(
    { _id: req.params.id },
    { content: req.body.content }
  );
  res.redirect("/profile");
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
  const token = jwt.sign({ userId: user._id, email: user.email }, "shhhh");
  res.cookie("token", token, { httpOnly: true });

  res.redirect("/login");
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("something went wrong");
  bcrypt.compare(password, user.password, function (err, result) {
    const token = jwt.sign({ userId: user._id, email: user.email }, "shhhh");
    res.cookie("token", token, { httpOnly: true });
    if (result) res.status(200).redirect("/profile");
    else res.redirect("/login");
  });
});
app.post("/post", isLoggedin, async (req, res) => {
  let user = await userModel.findById(req.user.userId);
  let { content } = req.body;
  let post = await postModel.create({
    user: user._id,
    content: content,
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});
app.get("/logout", async (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

function isLoggedin(req, res, next) {
  if (req.cookies.token === "") res.render("login");
  else {
    const data = jwt.verify(req.cookies.token, "shhhh");
    req.user = data;
    next();
  }
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
