const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { verifyToken } = require("./middleware/isAuth");

const app = express();

let users = [
  { id: 1, userName: "ltb", refreshToken: null },
  { id: 2, userName: "ltn", refreshToken: null },
];

// update refresh token in db
const updateRefreshToken = (userName, refreshToken) => {
  users = users.map((user) => {
    if (user.userName === userName) {
      return { ...user, refreshToken };
    }
    return user;
  });
};

// generate token
const generateTokens = (payload) => {
  const { id, userName } = payload;
  const accessToken = jwt.sign(
    { id, userName },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "2m",
    }
  );
  const refreshToken = jwt.sign(
    { id, userName },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "20m",
    }
  );
  return { accessToken, refreshToken };
};

app.use(express.json());

app.post("/login", (req, res) => {
  const userName = req.body.userName;

  const user = users.find((user) => user.userName == userName);
  if (!user) {
    res.status(401).json({ message: " Unauthorized " });
  }

  // create access token and refresh token
  const tokens = generateTokens(user);

  // update user to add refresh token
  updateRefreshToken(userName, tokens.refreshToken);

  res.json({ tokens });
});

app.post("/refreshToken", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "no refresh token found" });
  }
  // check refresh token in db
  const user = users.find((user) => user.refreshToken === refreshToken);

  if (!user) {
    return res.status(403).json({ message: "refresh token invalid" });
  }

  // find that user have refresh token in db, verify refresh access token

  try {
    // validate refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // no error throw from above state, do the next states,create new
    // access token and refresh token to send back for user
    const tokens = generateTokens(user);
    // update the refresh token in db
    updateRefreshToken(user.userName, tokens.refreshToken);

    // return new token and new refresh token to client
    res.json({ message: "successfully", tokens });
  } catch (error) {
    return res.status(403).json({ message: "refresh token invalid" });
  }
});

// delete to delete refresh token in db
app.delete("/logout", verifyToken, (req, res) => {
  const { userId } = req;
  console.log(userId);
  const user = users.find((user) => user.id === userId);
  // delete refresh token in server,but the access token still valid , then
  // client is able to use access token to send request to protected routes
  // we need to set access token expiry is short time
  updateRefreshToken(user.userName, null);
  res.json({ message: "logout successfully" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server run on PORT ${PORT}`);
});
