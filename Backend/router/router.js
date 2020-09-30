const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const apiRouter = require("./api");

router.get("/", (req, res) => {
  res.render("index", { 헌혈증: [] });
});

router.get("/login", (req, res) => {
  res.render("login");
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

module.exports = router;
