const express = require("express");
const router = express.Router();
const db = require("../db/db_conn")();
const crypto = require("crypto");
const conn = db.init();
const web3 = require("../web3/web3");
const request = require("request-promise-native")

db.connect(conn);

send_sms = (phoneNumber, number) => {
  const NCP_accessKey = "amEhhOZJIVwfNNMu1My6";          

      // access key id (from portal or sub account)
  const NCP_secretKey = "xSmNIV9qsku9MqQy7ek67OUzUJxxUlTjgXn14MqY";           

      // secret key (from portal or sub account)
  const NCP_serviceID = "ncp:sms:kr:260833819066:block";

      // sens serviceID
  const myPhoneNumber = "01049556397";

  const space = " ";          // one space
  const newLine = "\n";           // new line
  const method = "POST";          // method

  const url = `https://sens.apigw.ntruss.com/sms/v2/services/${NCP_serviceID}/messages`;  

      // url (include query string)
  const url2 = `/sms/v2/services/${NCP_serviceID}/messages`;

  const timestamp = Date.now().toString();         // current timestamp (epoch)
  let message = [];
  let hmac=crypto.createHmac('sha256',NCP_secretKey);

  message.push(method);
  message.push(space);
  message.push(url2);
  message.push(newLine);
  message.push(timestamp);
  message.push(newLine);
  message.push(NCP_accessKey);
  const signature = hmac.update(message.join('')).digest('base64');

  request({
      method: method,
      json: true,
      uri: url,
      headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-iam-access-key' : NCP_accessKey,
          'x-ncp-apigw-timestamp': timestamp,
          'x-ncp-apigw-signature-v2': signature.toString()
      },
      body: {
          "type":"SMS",
          "contentType":"COMM",
          "countryCode":"82",
          "from": myPhoneNumber,
          "content": number,
          "messages":[
              {
                  "to":`${phoneNumber}`,
              }
          ]
      }
  });
}

router.post("/", (req, res) => {
  if (!req.body.pass) {
    if(!req.body.phone) {
      return res.send("<script>alert('전화번호를 입력해주세요');history.go(-1);</script>")
    }
    const number = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    send_sms(req.body.phone, `Bloock 인증번호 ${number}입니다.`)
    conn.query("DELETE FROM phone WHERE id=?", [req.session.userid], () => {
      conn.query("INSERT INTO phone (id, phone, num) VALUES (?, ?, ?)", [req.session.userid, req.body.phone, number], (err, rows, fields) => {
        return res.send("<script>alert('인증번호가 전송되었습니다.');history.go(-1);</script>")
      })
    })
  } else {
    console.log([req.session.userid, req.body.pass])
    conn.query("SELECT * FROM phone WHERE id=? AND num=?", [req.session.userid, req.body.pass], (err, rows, fields) => {
      if(rows.length == 0) {
        return res.send("<script>alert('인증번호가 올바르지 않습니다.');history.go(-1);</script>")
      } else {
        conn.query("UPDATE phone SET isActive=1 WHERE id=?", [req.session.userid], (err, rows, fields) => {
          return res.send("<script>alert('인증이 완료되었습니다.');location.href='/';</script>")
        })
      }
    })
  }
})

router.get("/", (req, res) => {
  conn.query("SELECT COUNT(*) AS num FROM user", [], (err, rows, fields) => {
    res.render("phone", {
      num: rows[0].num
    });
  })
});

module.exports = router;