const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const apiRouter = require("./api");
const loginRouter = require("./login");
const registerRouter = require("./register");
const indexRouter = require("./index");
const adminRouter = require("./admin")
const writeRouter = require("./write")
const unusedRouter = require("./unused")
const usedRouter = require("./used")
const giveRouter = require("./give")
const phoneRouter = require("./phone")

authCheck = (req, res, next) => {
  if (!req.session.userid) {
    return res.send("<script>location.href='/login';</script>");
  } else {
    next();
  }
}

router.get("/", (req, res) => {
  res.send("<script>location.href='/index'</script>");
});

router.use("/public", (req, res) => {
  let p = path.join(__dirname, "../public", req.path);
  if (fs.existsSync(p)) {
    if (fs.lstatSync(p).isFile()) {
      try {
        res.sendFile(p);
      } catch {
        res.status(500).send("Internal Error");
      }
    } else {
      res.status(403).send("Not Allowed");
    }
  } else {
    res.status(404).send("Not Found");
  }
});

router.use("/api", apiRouter);
router.use("/login", loginRouter);
router.use("/register", registerRouter);
router.use("/give", authCheck, giveRouter);
router.use("/admin", authCheck, adminRouter);
router.use("/write", authCheck, writeRouter);
router.use("/index", authCheck, indexRouter);
router.use("/unused", authCheck, unusedRouter);
router.use("/used", authCheck, usedRouter);
router.use("/phone", authCheck, phoneRouter);

module.exports = router;
