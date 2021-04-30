const User = require("../models/user");
const { validationResult, body } = require("express-validator");
const Order = require("../models/order");
const Notice = require("../models/notice");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Razorpay = require("razorpay");
const path = require("path");


const keyid = "rzp_live_D7tRwqaTWZaczN";

const instance = new Razorpay({
    key_id: "rzp_live_D7tRwqaTWZaczN",
    key_secret: "0Br6E7eYaMqWbxRCx9dMJXGm",
});

exports.gethome = (req, res, next) => {
    res.render("index", {
        pagetitle: "Profile",
    });
};

exports.getprofile = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render("profile", {
        pagetitle: "Profile",
        userdata: req.user,
        error: null,
        error1: null,
        message: message,
    });
};

exports.postusersetting = (req, res, next) => {
    const username = req.body.username;
    const fname = req.body.fname;
    const lname = req.body.lname;
    const committee1 = req.body.s1;
    const committee2 = req.body.country2;
    const committee3 = req.body.country3;
    const prefrence11 = req.body.s2;
    const prefrence12 = req.body.s3;
    const prefrence13 = req.body.s4;
    const prefrence21 = req.body.country21;
    const prefrence22 = req.body.country22;
    const prefrence23 = req.body.country23;
    const prefrence31 = req.body.country31;
    const prefrence32 = req.body.country32;
    const prefrence33 = req.body.country33;

    console.log(req.body);

    const error1 = validationResult(req);

    if (!error1.isEmpty()) {
        return res.status(422).render("profile", {
            pagetitle: "Profile",
            error1: error1.array()[0].msg,
            userdata: req.user,
            error: null,
            message: null,
        });
    }

    User.findById(req.user._id)
        .then((user) => {
            user.username = username;
            user.firstname = fname;
            user.lname = lname;
            user.committee1 = committee1;
            user.committee2 = committee2;
            user.committee3 = committee3;
            user.prefrence11 = prefrence11;
            user.prefrence12 = prefrence12;
            user.prefrence13 = prefrence13;
            user.prefrence21 = prefrence21;
            user.prefrence22 = prefrence22;
            user.prefrence23 = prefrence23;
            user.prefrence31 = prefrence31;
            user.prefrence32 = prefrence32;
            user.prefrence33 = prefrence33;

            return user.save();
        })
        .then((result) => {
            return res.redirect("/profile");
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postcontactsetting = (req, res, next) => {
    const address = req.body.address;
    const contact = req.body.contact;
    const city = req.body.city;

    const error = validationResult(req);

    if (!error.isEmpty()) {
        return res.status(422).render("profile", {
            pagetitle: "Profile",
            error: error.array()[0].msg,
            userdata: req.user,
            error1: null,
        });
    }

    User.findById(req.user._id)
        .then((user) => {
            user.city = city;
            user.contact = contact;
            user.address = address;
            return user.save();
        })
        .then((result) => {
            console.log(result);
            return res.redirect("/profile");
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postfeedback = (req, res, next) => {
    const signature = req.body.signature;
    User.findById(req.user._id).then(user => {
        if (!user) {
            return res.redirect('/profile');
        }
        user.pastexp = signature;
        user.save().then(result => {
            return res.redirect('/profile');
        })
    }).catch(err => {
        console.log(err);
    })
};

exports.getorderid = (req, res, next) => {
    const com1 = req.user.committee1 ? req.user.committee1.length : 0;
    const com2 = req.user.committee2 ? req.user.committee2.length : 0;
    const com3 = req.user.committee3 ? req.user.committee3.length : 0;

    if (req.user.member) {
        return res.redirect("/profile");
    } else if (com1 == 0 || com2 == 0 || com3 == 0) {
        console.log("running");
        req.flash("error", "Please Select any one committee and country");
        return res.redirect("/profile");
    }

    var options = {
        amount: 461.25 * 100, // amount in the smallest currency unit
        currency: "INR",
    };
    instance.orders.create(options, function(err, order) {
        if (err) {
            console.log(err);
            return res.redirect("/profile");
        }
        res.render("paymentpage", {
            userdetails: req.user,
            orderdetails: order,
            keyid: keyid,
        });
    });
};

exports.postcallback = (req, res, next) => {
    console.log(res.req.body);
    console.log(res.req.user);

    const razorpayid = res.req.body.razorpay_payment_id;
    const razorpayorderid = res.req.body.razorpay_order_id;
    const signature = res.req.body.razorpay_signature;

    const newsignature = razorpayorderid + "|" + razorpayid;

    var expectedsignature = crypto
        .Hmac("sha256", "0Br6E7eYaMqWbxRCx9dMJXGm")
        .update(newsignature.toString())
        .digest("hex");

    if (expectedsignature === signature) {
        User.findById(res.req.user._id).then((user) => {
            user.member = true;
            user.transdate = new Date().toString();
            user.save().then((result) => {
                const order = new Order({
                    user: {
                        userid: user._id,
                    },
                });
                res.redirect("/profile");
                order.save();
                console.log("ordersaved");
            });
        });
    } else {
        console.log("condtion breaked");
        res.redirect("/login");
    }
};


exports.getimage = (req, res, next) => {
    res.render("updating");
};

exports.getcheckmail = (req, res, next) => {
    Notice.find()
        .then((notices) => {
            res.render("mail", {
                notices: notices,
                isadmin: req.session.isadmin,
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/profile");
        });
};

exports.getsuccess = (req, res, next) => {
    console.log(req.body);

    if (req.body.STATUS === "TXN_FAILURE") {
        console.log("cancel");
        return res.redirect("/profile");
    }

    if (req.body.STATUS === "TXN_SUCCESS") {
        const userid = req.params.customerid;
        console.log(userid);
        User.findById(userid).then((user) => {
            user.member = true;
            user.paymentmode = req.body.PAYMENTMODE;
            user.transdate = req.body.TXNDATE.toString();
            user.save().then((result) => {
                const order = new Order({
                    user: {
                        userid: user._id,
                    },
                });
                res.redirect("/profile");
                order.save();
                console.log("ordersaved");
            });
        });
    } else {
        console.log("condtion breaked");
        res.redirect("/login");
    }
};