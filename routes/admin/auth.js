const express = require("express");
const { check, validationResult } = require("express-validator");

const usersRepo = require("../../repositories/users");
const signupTemplate = require("../../views/adm/auth/signup");
const signinTemplate = require("../../views/adm/auth/signin");
const { requireEmail } = require("./validators");
const { requirePassword } = require("./validators");
const { requirePasswordConfirmation } = require("./validators");

const router = express.Router();

router.get("/signup", (req, res) => {
  res.send(signupTemplate({ req }));
});

router.post(
  "/signup",
  [requireEmail, requirePassword, requirePasswordConfirmation],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send(signupTemplate({ req, errors }));
    }

    const { email, password, passwordConfirmation } = req.body;

    //create an user in our Userrepo
    const user = await usersRepo.create({ email, password });
    //store the id of that user inside the users cookies
    //cookie add aditional property "req.session"
    req.session.userId = user.id;
    res.send("Account created!!!");
  }
);

router.get("/signout", (req, res) => {
  //forget information store inside the cookie
  req.session = null;
  res.send("You are logged out");
});

router.get("/signin", (req, res) => {
  res.send(signinTemplate());
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await usersRepo.getOneBy({ email });

  if (!user) {
    return res.send("Email not found");
  }

  const validPassword = await usersRepo.comparePassword(
    user.password,
    password
  );

  if (!validPassword) {
    return res.send("Invalid Password");
  }

  req.session.userId = user.id;

  res.send("You are signed in!!");
});

module.exports = router;
