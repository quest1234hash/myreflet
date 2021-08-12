const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const InputDataDecoder = require('ethereum-input-data-decoder');

const request = require('request');

var { btcTxHistoryModel } = require('../models/btc_transaction');

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

async function getTransaction(_hash) {

  let hash = _hash;

  var contractABI = tokenContractABI;

  return web3.eth.getTransaction(hash)
    .then(async function (response) {

      console.log('-----------Inside get tx', hash);
      const decoder = new InputDataDecoder(contractABI);
      let result_input;
      let result_obj={};
      let msg = 'Transaction not found'

      if (response === null) {

      let result= await btcTxHistoryModel.findOne({ hash: hash })

         
          if(result && result.length>0){
            
          //   key_array= JSON.parse(result.key_array);
          //   value_array= JSON.parse(result.value_array);
          //   for (let i=0;i< key_array.length;i++){
          //     result_obj[key_array[i]] = value_array[i];
          //   }
          //   result_obj[hash]= result.hash;
          // result_obj[blockNumber]= result.blockNumber;
          //   console.log(response)
          //   console.log('$$$$$$$')
          //   console.log( result_obj )
            return result  
          } 
          else {
            return msg;
          }       

      }
      else if (response.blockNumber > 0) {
        console.log('From blockchain - - - - - - - -',response)
        result_input = decoder.decodeData(`${response.input}`);
        console.log("result_input*******",result_input)
        if (result_input.inputs[0] != null && result_input.inputs[0] != undefined) {
          
          let tx_details = JSON.parse(result_input.inputs[0]);
          // value_array = JSON.parse(result_input.inputs[2]);
          //console.log('Type of::::::::::'+key_array.length)
          for (let i=0;i< result_input.names.length;i++){
            result_obj[result_input.names[i]] = result_input.inputs[i];
          }
          //console.log(response)
          console.log("99999999999999999")
          
          //console.log(key_array,'-----------------',value_array);
          result_obj['hash']= response.hash;
          result_obj['blockNumber']= response.blockNumber;
          //result_obj['project_id']= value_array[0];
          console.log(result_obj)
          return result_obj;
        }
        else {
          return msg;
        }
      }
    })
    .catch(err => {
      return err
    })
}

async function getLatestBlock() {

  return web3.eth.getBlock('latest')
    .then(async function (response) {
      console.log(response.number)
      return response.number
    })
    .catch(err => {
      return err
    })
}

//getLatestBlock()
getTransaction('0x748e54a074dba40d814b461ebbdcdf6ff8a40072782c079aeae961857d178de0');
// function getTransaction(hash){

//     var contractABI = tokenContractABI;

//     return web3.eth.getTransaction(hash)
//     .then(function(res) {
//       const decoder = new InputDataDecoder(contractABI);
//       const result_input = decoder.decodeData(`${res.input}`);
//       console.log("data...",result_input);

//       if(result_input.inputs[0]!=null && result_input.inputs[0]!=undefined ){
//         var key_array  = JSON.parse(result_input.inputs[1]);
//         var value_array =   JSON.parse(result_input.inputs[2]);

//         console.log(key_array,'-----------------',value_array);
//       }
//       return result_input;
//       // console.log(res);
//     })
// }

module.exports = {
  getTransaction,getLatestBlock,
}
