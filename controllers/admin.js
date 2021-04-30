const User = require("../models/user");
const Notice = require("../models/notice");
const path = require("path");
const fs = require("fs");
const notice = require("../models/notice");
exports.getadmin = (req, res, next) => {
  res.render("admin");
};

exports.getmembers = (req, res, next) => {
  User.find({ member: true }).then((users) => {
    console.log(users);
    res.render("members", {
      users: users,
    });
  });
};

exports.getnotification = (req, res, next) => {
  res.render("notice");
};

exports.postnotice = (req, res, next) => {
  const noticetitle = req.body.title;
  const doc = req.files.pdfdoc;
  const newnotice = new Notice({
    title: noticetitle,
  });

  newnotice
    .save()
    .then((result) => {
      const filepath = path.join(__dirname, "../", "data");
      const filename = result.title + "-" + result._id;
      doc.mv(filepath + "/docs/" + filename + ".pdf", function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("uploaded");
          res.redirect("/admin");
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getallnotice = (req, res, next) => {
  Notice.find()
    .then((notices) => {
      res.render("mail", {
        notices: notices,
        isadmin: req.session.isadmin,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getdeletenotice = (req, res, next) => {
  const id = req.params.noticeid;
  Notice.findById(id).then((result) => {
    const filename = result.title + "-" + result._id + ".pdf";
    const filepath = path.join(__dirname, "../", "data", "docs", filename);
    fs.unlink(filepath, (err) => {
      console.log(err);
    });

    Notice.findByIdAndRemove(id)
      .then((result) => {
        console.log(result);
        res.redirect("/checkallnotice");
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.downloadpdf = (req, res, next) => {
  const id = req.params.filename;
  Notice.findById(id).then((notice) => {
    const filename = notice.title + "-" + notice._id + ".pdf";
    const downloadname = notice.title + "-" + notice._id;
    console.log(filename);
    const filepath = path.join(__dirname, "../", "data", "docs", filename);

    fs.readFile(filepath, (err, data) => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline ; filename=" ' + downloadname + ' "'
      );
      res.send(data);
    });
  });
};
