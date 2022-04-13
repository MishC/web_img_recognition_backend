const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const app = express();
const knex = require("knex");
const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "",
    database: "smart-brain",
  },
});
const register = require("./controllers/register");
const signin = require("./controllers/signin");
const profile = require("./controllers/profile");
const image = require("./controllers/image");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/", (res) => {
  res.send("success");
});

app.post("/register", (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});

app.post("/signin", (req, res) => {
  signin.handleSignin(req, res, db, bcrypt);
});

app.get("/profile/:id", (req, res) => {
  profile.handleProfileGet(req, res, db);
});
app.put("/image", (req, res) => {
  image.handleImage(req, res, db);
});

app.listen(3000, () => {
  console.log("app is running on port");
});

/*
/signin --> POST = success/fail
/register --> POST =user
/profile/:userId ---> GET = user
/image --> PUT --> user ++ entries

*/
