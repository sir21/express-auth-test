require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");

const fakeUsers = [
  { id: 1, username: "jake", auth: { password: "password", expiresIn: "1m" } },
  { id: 2, username: "anne", auth: { password: "password", expiresIn: "5m" } },
];

const app = express();
app.use(express.json());

app.get("/post", authenticateUser, (req, res) => {
  console.log("post");
  const user = req.user;
  return res.json(user);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const findUser = fakeUsers.find((u) => u.username === username);
  if (!findUser) {
    return res.sendStatus(401);
  }
  if (findUser.auth.password !== password) {
    return res.sendStatus(401);
  }

  console.log("User logged in", findUser);
  console.log("token", process.env.ACCESS_TOKEN_SECRET);

  {
    const { auth, ...user } = findUser;
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: auth.expiresIn, // can config for different number defending on the user
    });
    res.json(accessToken);
  }
});

function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log(token);
  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

app.listen(3000);
