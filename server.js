const express = require("express");
require("dotenv").config();

const { verifyToken } = require("./middleware/isAuth");

const app = express();

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

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`server run on PORT ${PORT}`);
});
