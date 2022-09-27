const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { verifyToken } = require("./middleware/isAuth");

const app = express();

const users = [
  { id: 1, userName: "ltb" },
  { id: 2, userName: "ltn" },
];

const posts = [
  {
    userId: 1,
    post: "hello world",
  },
  {
    userId: 2,
    post: "hello ocean",
  },
];

app.use(express.json());

app.get("/posts", verifyToken, (req, res) => {
  const { userId } = req;
  res.json(posts.filter((post) => post.userId === userId));
});

app.post("/login", (req, res) => {
  const userName = req.body.userName;
  const user = users.find((user) => user.userName == userName);
  if (!user) {
    res.status(401).json({ message: " Unauthorized " });
  }
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1m",
  });
  res.json({ accessToken });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`server run on PORT ${PORT}`);
});
