import express from "express";
import { config } from "dotenv";
import path from "path";
import mysql from "mysql";
import bcrypt from "bcrypt";
import session from 'express-session'

config();

const startServer = async () => {
  const app = express();
  const port = process.env.PORT || 8000;

  // View engine setup
  app.set("views", path.join(__dirname, "src/views/pages"));
  app.set("view engine", "ejs");

  //Midlewares
  app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }))
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "src/public")));

  //Database Connection
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "soksan",
    database: "portfolio_db",
  });

  connection.connect((err) => {
    if (err) throw err;
    console.log("Database is connected successfully !");
  });

  app.route("/users").get((req, res) => {
    connection.query("SELECT*FROM user", (err, users) => {
      if (err) throw err;
      res.render("user/index", { users, title: "All users" });
    });
  });

  app.route("/newuser").get((req, res) => {
    res.render("user/create", { title: "Create User" });
  });

  app.route("/newuser").post(async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password,10)
    console.log(req.body);

    let sql = `INSERT INTO user (username, email, password) VALUES ("${username}", "${email}", "${password}")`;
    connection.query(sql, (err, rows) => {
      if (err) throw err;
      res.redirect("/users");
    });
  });

  app.route("/user/:id").get((req, res) => {
    console.log(req.params.id);
    let sql = `SELECT * FROM user WHERE id = ${req.params.id}`;

    connection.query(sql, (err, rows) => {
      if (err) throw err;
      res.render("user/show", { user: rows[0], title: rows[0].username });
    });
  });

  app.route("/edit/:id").get((req, res) => {
    console.log(req.params.id);
    let sql = `SELECT * FROM user WHERE id = ${req.params.id}`;

    connection.query(sql, (err, rows) => {
      if (err) throw err;
      res.render("user/edit", { user: rows[0], title: rows[0].username });
    });
  });

  app.route("/edit/:id").post(async (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body);
    let sql = `UPDATE user SET username = "${username}", email="${email}", password="${await bcrypt.hash(password, 10)
      }" WHERE id=${req.params.id}`;
    connection.query(sql, (err, rows) => {
      if (err) throw err;
      res.redirect("/users");
    });
  });

  app.route("/delete/:id").get((req, res) => {
    let sql = `DELETE FROM user WHERE id = ${req.params.id}`;
    connection.query(sql, (err, rows) => {
      if (err) throw err;
      console.log(rows.affectedRows + " record deleted");
    });
    res.redirect("/users");
  });

  app.route("/login").get((req, res) => {
    res.render("auth/login", { title: "Login" });
  });

  app.route("/login").post(async (req: any, res: any) => {
    const { username, password } = req.body;
    if (username && password) {
      const user = `SELECT*FROM user WHERE username = "${username}"`;
      connection.query(user, async (err, rows) => {
        if (err) throw err;
        if (rows.length > 0) {
          const validPassword = await bcrypt.compare(password, rows[0].password)
          if (validPassword) {
            req.session.loggedin = true
            req.session.username = username
            res.redirect("/")
            console.log(req.session)
          } else {
            res.json({ message: "Invalid Password"})
          }
        } else {
          res.json({ message: "User is not existed" });
        }
      })
    } 
  });

  app.route("/signup").get( (req, res) => {
    res.render("auth/signup", { title: "Signup" })
  })

  app.route("/signup").post(async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password,10)
    console.log(req.body);
    connection.query(`SELECT username FROM user WHERE username = "${username}"`, (err, rows) => {
      if (err) throw err;
      
      if (rows.length > 0) {
        res.render("auth/signup", { title: "Signup", message: 'That username is already taken' })
        console.log('That username is already taken')
      } else {
        let sql = `INSERT INTO user (username, email, password) VALUES ("${username}", "${email}", "${password}")`;
        connection.query(sql, (err, rows) => {
          if (err) throw err;
          res.redirect("login");
        });
      }
    })
  })

  app.get("/", (req, res) => {
    res.render("main", { title: "Home" });
  });

  app.listen({ port }, () => console.log(`Server starting at ${port}`));
};
startServer();
