const express = require("express");
const app = express();
const cors = require("cors");
const router = require("./router/router");

app.use(cors());
app.use("/", router);

app.listen(3000, () => {
  console.log("listening!");
});

module.exports = app;
