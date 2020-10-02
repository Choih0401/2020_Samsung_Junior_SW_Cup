const express = require("express");
const router = express.Router();
const db = require("../db/db_conn")();
const crypto = require("crypto");
const conn = db.init();
const web3 = require("../web3/web3");

db.connect(conn);

router.get("/", (req, res) => {
  res.render("index", {
    헌혈증: [
      {
        이름: "이름",
        생년월일: "생년월일",
        헌혈종류: "헌혈종류",
        성별: "성별",
        헌혈일자: "헌혈일자",
        고유번호: "고유번호",
      },
    ],
  });
});

module.exports = router;
