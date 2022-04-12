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
    password: "travnica",
    database: "smart-brain",
  },
});
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);

  /*const hash1 =bcrypt.hash(password, null, null, function (err, hash) {
    // Store hash in your password DB.
    return hash;
  });*/
  db.transaction((trx) => {
    trx
      .insert({ hash: hash, email: email })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            name: name,
            email: loginEmail[0].email,
            joined: new Date(),
          })
          .then((user) => res.json(user[0]));
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json("unable to register"));
});

/*
console.log(
  db
    .select("*")
    .from("users")
    .then((data) => console.log(data))
);*/

app.get("/", (req, res) => {
  res.send("success");
});

app.post("/signin", (req, res) => {
  db.select("email", "hash")
    .where("email", "=", req.body.email)
    .from("login")
    .then((data) => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) => res.status(400).json("Unable to get user"));
      } else {
        res.status(400).json("Wrong credentials");
      }
    })
    .catch((err) => res.status(400).json("Wrong credentials"));

  /* bcrypt.compare("bacon", hash, function (err, res) {
    // res == true
    return res;
  });
*/
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({ id })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("Not found");
      }
    })
    .catch((err) => res.status(400).json("error getting user"));
});
app.put("/image", (req, res) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => console.log(entries[0].entries))
    .catch((err) => res.status(400).json("Unable to get entries"));
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
