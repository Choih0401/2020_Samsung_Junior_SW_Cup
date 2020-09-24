const express = require("express");
const app = express();
const Web3 = require("web3");

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545/"));

// //#region SendCoin
// let fromAddress = "0x6575780A92bFA196FB10d0D646656e6CeaDe0d99";
// let toAddress = "0x2928805dBa5b3a271F162D9cE1066b19863b133b";
// sendCoin = (fa, ta, v) => {
//   web3.eth
//     .sendTransaction({
//       from: fa,
//       to: ta,
//       value: v,
//     })
//     .on("transactionHash", console.log)
//     .on("receipt", console.log)
//     .on("confirmation", console.log)
//     .on("error", console.error);
// };
// sendCoin(fromAddress, toAddress, "1000000000000000000");
// //#endregion

// //#region CallContractFunction
// let contractAbi = [
//   {
//     constant: false,
//     inputs: [
//       {
//         name: "_str",
//         type: "string",
//       },
//     ],
//     name: "setName",
//     outputs: [],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "constructor",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "run",
//     outputs: [
//       {
//         name: "",
//         type: "string",
//       },
//     ],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "str",
//     outputs: [
//       {
//         name: "",
//         type: "string",
//       },
//     ],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
// ];
// let contractAddress = "0xbF2aC1e33048dd219cc81729eb219CC5A196D7f7";
// let fromAddress = "0x6575780A92bFA196FB10d0D646656e6CeaDe0d99";
// let myContract = new web3.eth.Contract(contractAbi, contractAddress, {
//   fromAddress: fromAddress,
// });
// myContract.methods
//   .setName("boo :(")
//   .send({ from: fromAddress })
//   .on("transactionHash", console.log)
//   .on("receipt", console.log)
//   //  .on("confirmation", console.log)
//   .on("confirmation", () => {
//     myContract.methods
//       .run()
//       .call()
//       .then((result) => {
//         console.log("boo", result);
//       });
//   })
//   .on("error", console.error);
// //#endregion

// //#region UnlockAccount
// let address = "0x73241825897f2b4Bca9CAFcD6302999921ACd4F1";
// let key = "p455w0rdd";
// let sec = 300;
// web3.eth.personal
//   .unlockAccount(address, key, sec)
//   .then(() => console.log("Account Unlocked!"))
//   .catch((err) => {
//     console.log(err);
//     if (err.message.includes("could not decrypt key with given password")) {
//       console.log("Wrong password");
//     }
//   });
// //#endregion

// //#region CreateAccount
// web3.eth.personal.newAccount("p455w0rd", (err, address) => {
//   console.log(address);
// });
// //#endregion
