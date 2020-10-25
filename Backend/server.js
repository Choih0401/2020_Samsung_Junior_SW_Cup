const express = require("express");
const app = express();
const expressSession = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const router = require("./router/router");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("html", require("ejs").renderFile);

app.use(
  expressSession({
    secret: "talmo",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use("/", router);

app.listen(80, () => {
  console.log("listening!");
});

module.exports = app;
