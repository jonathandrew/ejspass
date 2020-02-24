var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const passport = require("passport");
const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");
let url = `https://api.themoviedb.org/3/search/movie?api_key=df43c66dc01ba4672160d92b60570522&query=2019`;
let token =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZjQzYzY2ZGMwMWJhNDY3MjE2MGQ5MmI2MDU3MDUyMiIsInN1YiI6IjVlNGRjYjI0OWEzYzQ5MDAxOTM2MDdlNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.b-pKh_Ulq67AM5i2JgLTGlql3isNgaCA9YKn6glFdY8";
/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/login", (req, res) => {
  return res.render("login");
});

router.get("/register", (req, res) => {
  return res.render("register");
});

router.get("/options", (req, res) => {
  return res.render("options");
});

router.get("/randomusers", (req, res) => {
  fetch("https://randomuser.me/api/?results=20")
    .then(res => {
      return res.json();
    })
    .then(data => {
      let names = data.results.map(item => {
        return item;
      });

      res.render("randomusers", { names: names });
    });
});

router.get("/movies", (req, res) => {
  fetch(url)
    .then(res => {
      return res.json();
    })
    .then(data => {
      let movies = data.results.map(info => {
        return info;
      });
      res.render("movies", { movies: movies });
    });
});
router.post(
  "/register",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please include valid password").isLength({ min: 3 })
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.render("register", { errors: "All inputs must be filled" });
    }
    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        return console.log("User exists");
      } else {
        const user = new User();
        salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        user.name = req.body.name;
        user.email = req.body.email;
        user.password = hash;
        user
          .save()
          .then(user => {
            // return res.status(200).json({ message: "User was created", user });
            req.login(user, err => {
              if (err) {
                return res.status(500).json({ message: "Server error" });
              } else {
                res.redirect("/login");
                next();
              }
            });
          })
          .catch(err => {
            console.log(err);
          });
      }
    });
  }
);

router.post(
  "/login",
  passport.authenticate("local-login", {
    successRedirect: "/options",
    failureRedirect: "/login",
    failureFlash: true
  })
);
module.exports = router;
