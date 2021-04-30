const express = require("express");
const { body, check } = require("express-validator/check");
const isAuth = require("../helper/isauthhelper");
const router = express.Router();
const userControllers = require("../controllers/user");

router.get("/", userControllers.gethome);
router.get("/profile", isAuth, userControllers.getprofile);

router.post(
  "/usersetting",
  isAuth,
  [
    body(
      "username",
      "Please enter username with alteast 4 character"
    ).isLength({ min: 4 }),
    body("fname", "Please enter valid First Name").isLength({ min: 1 }),
    body("lname", "Please enter valid Last Name").isLength({ min: 1 }),
  ],
  userControllers.postusersetting
);

router.post(
  "/contactsetting",
  isAuth,
  [
    check("contact").custom((value, { req }) => {
      var no = /^(?:(?:\+|0{0,2})91(\s*[\ -]\s*)?|[0]?)?[789]\d{9}|(\d[ -]?){10}\d$/;
      if (value.match(no)) {
        return true;
      }
      throw new Error("Please enter a valid number");
    }),
    body("address", "Please enter a valid address")
      .isLength({ min: 6 })
      .withMessage("please enter an address"),
    body("city", "Please enter a city name ")
      .isLength({ min: 3 })
      .withMessage("please enter an address"),
  ],
  userControllers.postcontactsetting
);

router.post("/feedback", isAuth, userControllers.postfeedback);

router.get("/image", isAuth, userControllers.getimage);

router.get("/checkmail", isAuth, userControllers.getcheckmail);

// router.get("/payment", isAuth, userControllers.getpayement);

router.get("/order", isAuth, userControllers.getorderid);

router.post("/callback/payment", isAuth, userControllers.postcallback);

// router.post("/success/:customerid", userControllers.getsuccess);

router.get("/aippm", (req, res, next) => {
  res.render("aippm");
});

router.get("/crisis", (req, res, next) => {
  res.render("crisis");
});

router.get("/disec", (req, res, next) => {
  res.render("disec");
});

router.get("/hlpf", (req, res, next) => {
  res.render("hlpf");
});

router.get("/ip", (req, res, next) => {
  res.render("ip");
});

router.get("/sochum", (req, res, next) => {
  res.render("sochum");
});

router.get("/unsc", (req, res, next) => {
  res.render("unsc");
});

router.get("/wha", (req, res, next) => {
  res.render("wha");
});

module.exports = router;
