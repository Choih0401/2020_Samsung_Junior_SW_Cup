const express = require("express");
const app = express();
const expressSession = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const router = require("./router/router");
const cookieParser = require("cookie-parser");

const web3 = require("./web3/web3");
const db = require("./db/db_conn")();
const conn = db.init();
const crypto = require("crypto")
const request = require("request-promise-native")

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


getBloodCerts = async (address, result) => {
  let bloodCerts = [];
  for (let i = 0; i < result.length; i++) {
    bloodCerts = bloodCerts.concat(
      Object.assign(await web3.getBloodCerts(address, result[i]), {
        num: result[i],
      })
    );
  }
  console.log(bloodCerts);
  return bloodCerts;
};

setInterval(() => {
  conn.query("SELECT * FROM user", [], (err, rows, fields) => {
    (async () => {
      for(let i = 0;i < rows.length;i++) {
        let num = 0;
        let phonenum = "";
        await new Promise((resolve, reject) => {
          conn.query("SELECT * FROM phone WHERE id=?", [rows[i].id], (err, rows, fields) => {
            conn.query("SELECT * FROM phone WHERE id=?", [rows[i].id], (err, rows2, fields) => {
              if(rows2.length == 0) {
                resolve();
              }
              let address = rows[i].address;
              let phone = rows2[0].phone;
              let now = parseInt(Date.now() / 1000)
              phonenum = phone;
              web3.getCertByOwner(address, address)
              .then((result) => {
                getBloodCerts(address, result)
                .then((bloodCerts) => {
                  for(let j = 0;j < bloodCerts.length;j++) {
                    if(bloodCerts[i].used == 0 && parseInt(bloodCerts[i].donateDate) + 31536000 < now) {
                      num++;
                    }
                  }
                  resolve();
                })
              })
            })
          })
        })
        if(num != 0) {
          send_sms(phonenum, "1년 이상 지난 사용하지 않은 헌혈증이 " + num + "개 있습니다.")
        }
      }
    })()
  })
}, 31536000000)

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
