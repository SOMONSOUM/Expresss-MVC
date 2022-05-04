
import bcrypt from 'bcrypt'
import connection from "../../config/db";

export const UserList = (req, res) => {
  connection.query("SELECT*FROM user", (err, users) => {
    if (err) throw err;
    res.render("user/index", { users, title: "All users" });
  });
}

export const UserForm =  (req, res) => {
  res.render("user/create", { title: "Create User" });
}

export const CreateUser = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = await bcrypt.hash(req.body.password,10)
  console.log(req.body);

  let sql = `INSERT INTO user (username, email, password) VALUES ("${username}", "${email}", "${password}")`;
  connection.query(sql, (err, rows) => {
    if (err) throw err;
    res.redirect("/users");
  });
}

