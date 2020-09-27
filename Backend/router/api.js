const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("THIS_IS_API!");
});

module.exports = router;
