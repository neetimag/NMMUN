const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const session = require("express-session");
const Admin = require("../models/admin");
const crypto = require("crypto");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const user = require("../models/user");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.getsignUp = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("signup", {
    pagetitle: "Signup",
    error: message,
    oldinput: {
      fname: "",
      lname: "",
      email: "",
      contact: "",
    },
  });
  // res.render('staytuned');
};

exports.postsignUp = (req, res, next) => {
  const fname = req.body.fname;
  const lname = req.body.lname;
  const email = req.body.email;
  const password = req.body.password;
  const contact = req.body.contact;

  console.log(password);

  const error = validationResult(req);
  if (!error.isEmpty()) {
    var message = error.array()[0].msg;
    return res.status(422).render("signup", {
      pagetitle: "Signup",
      oldinput: {
        fname: fname,
        lname: lname,
        email: email,
        contact: contact,
      },
      error: message,
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedpassword) => {
      const newuser = new User({
        firstname: fname,
        lastname: lname,
        email: email,
        password: hashedpassword,
        contact: contact,
      });
      return newuser.save();
    })
    .then((result) => {
      res.redirect("/login");
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getLogin = (req, res, next) => {
  var message = req.flash("err");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("login", {
    pagetitle: "Login",
    error: message,
  });
  // res.render('staytuned');
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  Admin.findOne({ email: email }).then((admin) => {
    if (admin) {
      bcrypt.compare(password, admin.password).then((domatch) => {
        if (domatch) {
          req.session.isadmin = true;
          req.session.isloggedin = true;
          return res.redirect("/admin");
        }
        return res.redirect("/login");
      });
    } else {
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            req.flash("err", "Invalid Email or Password");
            return res.redirect("/login");
          }
          bcrypt
            .compare(password, user.password)
            .then((domatch) => {
              console.log(domatch);
              if (!domatch) {
                req.flash(error, "Invaild Email or Password");
                return res.redirect("/login");
              }
              req.session.user = user;
              req.session.isloggedin = true;
              return req.session.save((err) => {
                console.log(err);
                res.redirect("/profile");
              });
            })
            .catch((error) => {
              console.log(error);
              req.flash("err", "Invalid Email or Password");
              console.log("redirected");
              return res.redirect("/login");
            });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    }
  });
};

exports.getlogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

exports.getchangepass = (req, res, next) => {
  var message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("changepass", {
    pagetitle: "Login",
    error: message,
  });
};

exports.postresetpass = (req, res, next) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");

    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with this email found");
          return res.redirect("/changepass");
        }
        user.resettoken = token;
        user.tokenexpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        req.flash(
          "error",
          "An email with link to reset password has been sent to your email"
        );
        res.redirect("/changepass");
        transporter.sendMail({
          to: email,
          from: "do-not-reply@nmmun.in",
          subject: "PASSWORD RESET",
          html: `
            <h1>YOU HAVE REQUESTED A PASSWORD RESET <h1>
            <p> Click this <a href="https://nmmun.herokuapp.com/reset/${token}"> link </a> to set a new password <p>
          `,
        });
      });
  });
};

exports.getupdatepass = (req, res, next) => {
  const token = req.param.token;
  User.findOne({ token: token, tokenexpiration: { $gt: Date.now() } }).then(
    (user) => {
      if (!user) {
        res.write("<html><body><h1>TOKEN EXPIRED</h1></body></html>");
        return res.end();
      }
      var message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("resetpassword", {
        pagetitle: "Reset Password",
        error: message,
        userinfo: user,
      });
    }
  );
};

exports.postconfirmreset = (req, res, next) => {
  const userid = req.body.userid;
  const password = req.body.password;
  let globaluser;
  User.findById(userid)
    .then((user) => {
      globaluser = user;
      return bcrypt.hash(password, 12).then((hashedpassword) => {
        globaluser.password = hashedpassword;
        globaluser.token = undefined;
        globaluser.tokenexpiration = undefined;
        return globaluser.save();
      });
    })
    .then((result) => {
      res.redirect("/login");
    });
};
