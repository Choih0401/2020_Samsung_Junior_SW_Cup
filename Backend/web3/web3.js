const Web3 = require("web3");
const BN = Web3.utils.BN;
const conf = require("./web3_conf");

let web3 = new Web3(new Web3.providers.HttpProvider(conf.url));

module.exports = {
  unlockAccount: (address, key, sec = 30) => {
    return new Promise((resolve, reject) => {
      web3.eth.personal
        .unlockAccount(address, key, sec)
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  },

  getBloodCerts: (fromAddress, id) => {
    return new Promise((resolve, reject) => {
      let myContract = new web3.eth.Contract(conf.abi, conf.cont_address, {
        fromAddress: fromAddress,
      });
      myContract.methods
        .BloodCerts(id)
        .call()
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }, // pass

  use: (fromAddress, tokenId) => {
    return new Promise((resolve, reject) => {
      let myContract = new web3.eth.Contract(conf.abi, conf.cont_address, {
        fromAddress: fromAddress,
      });
      myContract.methods
        .bloockUse(tokenId)
        .send({ from: fromAddress })
        .on("confirmation", () => {
          return resolve();
        })
        .catch((err) => {
          return reject(err);
        });
    })
  }, // pass

  sendCoin: (from, to, value = 100000000000000000000) => {
    web3.eth
      .sendTransaction({
        from: from,
        to: to,
        value: value,
      })
      .on("transactionHash", console.log)
      .on("receipt", console.log)
      .on("confirmation", console.log)
      .on("error", console.error);
  }, // pass

  giveCoin: (to) => {
    module.exports.sendCoin(conf.develop_addr, to);
  }, // pass

  createAccount: (key) => {
    return new Promise((resolve, reject) => {
      web3.eth.personal.newAccount(key, (err, address) => {
        if (err) return reject(err);
        return resolve(address);
      });
    });
  }, // pass

  // function createCert(uint _donateDate,uint _birth, uint _gender, string memory _name, string memory _kind) public
  createCert: (fromAddress, donateDate, birth, gender, name, kind) => {
    return new Promise((resolve, reject) => {
      let myContract = new web3.eth.Contract(conf.abi, conf.cont_address, {
        fromAddress: fromAddress,
      });
      myContract.methods
        .createCert(donateDate, birth, gender, name, kind)
        .send({ from: fromAddress })
        .on("confirmation", () => {
          return resolve();
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }, // pass

  // function getCertByOwner(address _owner) external view returns(uint[] memory)
  getCertByOwner: (fromAddress, owner) => {
    return new Promise((resolve, reject) => {
      let myContract = new web3.eth.Contract(conf.abi, conf.cont_address, {
        fromAddress: fromAddress,
      });
      myContract.methods
        .getCertByOwner(owner)
        .call()
        .then((result) => {
          return resolve(result);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }, // pass

  //function balanceOf(address _owner) public view returns (uint256 _balance)
  balanceOf: (fromAddress, owner) => {
    return new Promise((resolve, reject) => {
      let myContract = new web3.eth.Contract(conf.abi, conf.cont_address, {
        fromAddress: fromAddress,
      });
      myContract.methods
        .balanceOf(owner)
        .call()
        .then((result) => {
          return resolve(result);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }, // pass

  // function ownerOf(uint256 _tokenId) public view returns (address _owner)
  ownerOf: (fromAddress, tokenId) => {
    return new Promise((resolve, reject) => {
      let myContract = new web3.eth.Contract(conf.abi, conf.cont_address, {
        fromAddress: fromAddress,
      });
      myContract.methods
        .ownerOf(tokenId)
        .call()
        .then((result) => {
          return resolve(result);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }, // pass

  // function transfer(address _to, uint256 _tokenId) public onlyOwnerOf(_tokenId)
  transfer: (fromAddress, to, tokenId) => {
    return new Promise((resolve, reject) => {
      let myContract = new web3.eth.Contract(conf.abi, conf.cont_address, {
        fromAddress: fromAddress,
      });
      myContract.methods
        .transfer(to, tokenId)
        .send({ from: fromAddress })
        .on("confirmation", () => {
          return resolve();
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }, // pass

  // function approve(address _to, uint256 _tokenId) public onlyOwnerOf(_tokenId)
  approve: (fromAddress, to, tokenId) => {
    return new Promise((resolve, reject) => {
      let myContract = new web3.eth.Contract(conf.abi, conf.cont_address, {
        fromAddress: fromAddress,
      });
      myContract.methods
        .approve(to, tokenId)
        .send({ from: fromAddress })
        .on("confirmation", () => {
          return resolve();
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }, // pass

  // function takeOwnership(uint256 _tokenId) public
  takeOwnership: (fromAddress, tokenId) => {
    return new Promise((resolve, reject) => {
      let myContract = new web3.eth.Contract(conf.abi, conf.cont_address, {
        fromAddress: fromAddress,
      });
      myContract.methods
        .takeOwnership(to, tokenId)
        .send({ from: fromAddress })
        .on("confirmation", () => {
          return resolve();
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }, // pass
};
