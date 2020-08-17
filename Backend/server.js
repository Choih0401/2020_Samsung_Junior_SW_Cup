const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const router = require("./routers/router");
const config = require("./config/config");

mongoose.Promise = global.Promise;
mongoose
  .connect(config.dbUrl)
  .then(() => console.log("success"))
  .catch((err) => console.log(err));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/", router);

app.listen(3000, () => console.log("started"));

module.exports = app;
