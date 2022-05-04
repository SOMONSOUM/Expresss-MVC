import express from "express";
import { CreateUser, UserForm, UserList } from "../controllers/user.controller";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("main", { title: "Home" });
});

router.get("/users", UserList);
router.get("/newuser", UserForm);
router.post("/newuser", CreateUser);

export default router;
