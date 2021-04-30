const express = require("express");

const router = express.Router();

const adminControllers = require("../controllers/admin");

const isAdmin = require("../helper/isadminhelper");
const isAuth  = require('../helper/isauthhelper');

router.get("/members", isAdmin, adminControllers.getmembers);

router.get("/admin", isAdmin, adminControllers.getadmin);

router.get("/notification", isAdmin, adminControllers.getnotification);

router.post("/notice", isAdmin, adminControllers.postnotice);

router.get("/checkallnotice", isAdmin, adminControllers.getallnotice);

router.get("/deletemail/:noticeid", isAdmin, adminControllers.getdeletenotice);

router.get("/download/:filename", isAuth, adminControllers.downloadpdf);

module.exports = router;
