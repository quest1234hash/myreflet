const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const InputDataDecoder = require('ethereum-input-data-decoder');

const request = require('request');
//const { POA_Transaction, POA_UserWallet } = require('../model/transaction_model')

const tokenContractABI = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "records",
    "outputs": [
      {
        "name": "tx_details",
        "type": "string"
      },
      {
        "name": "tx_hash",
        "type": "string"
      },
      {
        "name": "sender_myReflect_code",
        "type": "string"
      },
      {
        "name": "receiver_myReflect_code",
        "type": "string"
      },
      {
        "name": "tx_sender_add",
        "type": "string"
      },
      {
        "name": "tx_receiver_add",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "tx_details",
        "type": "string"
      },
      {
        "name": "tx_hash",
        "type": "string"
      },
      {
        "name": "tx_type",
        "type": "string"
      },
      {
        "name": "sender_email",
        "type": "string"
      },
      {
        "name": "receiver_email",
        "type": "string"
      },
      {
        "name": "tx_amount",
        "type": "string"
      },
      {
        "name": "sender_myReflect_code",
        "type": "string"
      },
      {
        "name": "receiver_myReflect_code",
        "type": "string"
      },
      {
        "name": "tx_sender_add",
        "type": "string"
      },
      {
        "name": "tx_receiver_add",
        "type": "string"
      },
      {
        "name": "tx_created_At",
        "type": "string"
      }
    ],
    "name": "addRecord",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getRecordCount",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getRecordDetails",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getRecordHash",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]
const contractAddress = '0xdD2BC1FAaD99f8Cd869313B55FF04C761c5b5237';

var web3 = new Web3(new Web3.providers.HttpProvider("http://13.233.173.250:8501"));

async function doTransaction(
  tx_details,
  tx_hash,
  tx_type,
  sender_email,
  receiver_email,
  tx_amount,
  sender_myReflect_code,
  receiver_myReflect_code,
  tx_sender_add,
  tx_receiver_add,
  tx_created_At,
  sender_eth_address,
  sender_eth_priv_key) {
 
  var wallet_address = sender_eth_address;//'0xE9da7CC15E416AB431917f88eDDB7314Bd709711';
  var contractABI = tokenContractABI;

  var contract = new web3.eth.Contract(contractABI, contractAddress);
  var private_key1 = sender_eth_priv_key;//'0x6765c35c62e998f9de4a9a590c137c8a3845721a398289737beb8178c001faba';
  var private_key = private_key1.slice(2);
  var privateKey = Buffer.from(private_key, 'hex');

  return web3.eth.getTransactionCount(wallet_address).then(function (v) {

    count = v;
    console.log("*********count*********", count);

    var rawTransaction = {
      "from": wallet_address,
      "gasPrice": '0x0',
      "gasLimit": web3.utils.toHex(1000000),
      "to": contractAddress,
      "value": "0x0",
      "data": contract.methods.addRecord(
              JSON.stringify(tx_details),tx_hash,
              tx_type,
              sender_email,
              receiver_email,
              tx_amount,
              sender_myReflect_code,
              receiver_myReflect_code,
              tx_sender_add,
              tx_receiver_add,
              tx_created_At
              ).encodeABI(),
      "nonce": web3.utils.toHex(count)
    }

    var transaction = new Tx(rawTransaction);
    transaction.sign(privateKey);

    return web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
      .then(tx_hash => {
        console.log("tx_hash: ", tx_hash.transactionHash);
        console.log("tx ", tx_hash);
        
        return tx_hash.transactionHash;
      })
      .catch(err => console.log(err))

  })
  // console.log('counter@@@@@@@@@@: ' + counter123)
  // return counter123 + 1;
}

// let hash1=doTransaction(["btc-test","docs","ahhsfiejfkrokgok-dochash", "sender eth address"],
//   "tx-hash-jajhdljfekofkojfofjrsjs",
//   "btc",
//   "sender@adjhsjf.com",
//   "receiver@hwkjajf.com",
//   "0.00004",
//   "1111",
//   "2222",
//   "qwqeeehdkushfusgfhgio",
//   "wajwjieroewproptr",
//   "12-11-2020",
//   "0xE9da7CC15E416AB431917f88eDDB7314Bd709711",
//   '0x6765c35c62e998f9de4a9a590c137c8a3845721a398289737beb8178c001faba').then(hash1=>{
//     console.log("lllllllllllll", hash1)
//   }).catch(err=>{
//     console.log("error", err)
//   });

module.exports = {
  doTransaction,
}
//test tx====0x748e54a074dba40d814b461ebbdcdf6ff8a40072782c079aeae961857d178de0