const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
var MongoStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const User = require("./models/user");
const Order = require("./models/order");
const Admin = require("./models/admin");
const bcrypt = require("bcryptjs");
const fileupload = require("express-fileupload");
const favicon = require("serve-favicon");

const MongoUri =
  "mongodb+srv://coderbiceps:loltroll123@cluster0.vovzc.mongodb.net/college?retryWrites=true&w=majority";

const store = new MongoStore({
  uri: MongoUri,
  collection: "session",
});

const pathname = path.join(__dirname, "data");

app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());
app.use(fileupload());
app.set("view engine", "ejs");
app.set("views", "views");

app.use(
  session({
    secret: "Mysecretofcollege",
    saveUninitialized: false,
    resave: false,
    store: store,
    unset: "destroy",
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

app.use(authRoutes);
app.use(adminRoutes);
app.use(userRoutes);

app.use("/", (req, res, next) => {
  res.status(404).render("error");
});

mongoose
  .connect(MongoUri)
  .then((client) => {
    console.log("connected");
    Admin.findOne({ email: "neetimacollege123@gmail.com" }).then((admin) => {
      if (!admin) {
        bcrypt.hash("loltroll123", 12).then((hashpass) => {
          const newadmin = new Admin({
            email: "neetimacollege123@gmail.com",
            password: hashpass,
          });
          newadmin.save();
        });
      }
    });
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
