const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth");
const { check, body } = require("express-validator/check");
const User = require("../models/user");

router.get("/signup", authControllers.getsignUp);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        if (value === "neetimacollege123@gmail.com") {
          throw new Error("This email is forbidden.");
        }
        return User.findOne({ email: value }).then((userdata) => {
          if (userdata) {
            return Promise.reject("This email is already exist");
          }
        });
      }),
    body(
      "password",
      "Please enter with number and text and atleast 6 character"
    )
      .isAlphanumeric()
      .custom((value, { req }) => {
        var Exp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;

        if (!value.match(Exp))
          throw new Error(
            "Please enter with number and text and atleast 6 character"
          );
        else return true;
      })
      .isLength({ min: 6 }),
    body("confirmpassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match");
        }
        return true;
      }),
    check("contact").custom((value, { req }) => {
      var no = /^(?:(?:\+|0{0,2})91(\s*[\ -]\s*)?|[0]?)?[789]\d{9}|(\d[ -]?){10}\d$/;
      if (value.match(no)) {
        return true;
      }
      throw new Error("Please enter a valid phone number");
    }),
  ],
  authControllers.postsignUp
);

router.get("/login", authControllers.getLogin);

router.post(
  "/login",
  [check("email").normalizeEmail()],
  authControllers.postLogin
);

router.get("/logout", authControllers.getlogout);

router.get("/changepass", authControllers.getchangepass);

router.post("/resetpass", authControllers.postresetpass);

router.get("/reset/:token", authControllers.getupdatepass);

router.post("/confirmreset", authControllers.postconfirmreset);

module.exports = router;
