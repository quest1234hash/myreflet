var { UserModel, LogDetailsModel, tbl_log_manage, tokeModel } = require('../../models/user');
var { decrypt, encrypt } = require('../../helpers/encrypt-decrypt')
const request = require("request")
var os = require('os');
const nodemailer = require("nodemailer");
const express = require('express');
var app = express();
const ejs = require('ejs');
const cron = require('node-cron')
var axios = require('axios');
var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime')
var crypto = require('crypto');
var text_func = require('../../helpers/text');
var mail_func = require('../../helpers/mail');
const util = require('util');
const { base64encode, base64decode } = require('nodejs-base64');
var CryptoJS = require("crypto-js");
var jwt = require('jsonwebtoken');

var { WalletModel, WalletModelImport } = require('../../models/wallets');
var { btcTxHistoryModel } = require('../../models/btc_transaction');
var { doTransaction }= require('../../helpers/btc_contract_post');



const { MAIL_SEND_ID,
  PASS_OF_MAIL,
  TOKEN_SECRET,
} = require('../../config/config')

cron.schedule('*/30 * * * *', async () => {
  check_status();
  console.log('running task every 30 minute');

});
async function check_status() {

  let data = await btcTxHistoryModel.findAll({
    where: {
      status: 'pending'
    }
  });
  for (tx of data) {
    //console.log("!!!",tx.dataValues.hash);
    let param = JSON.stringify({ "txHash": tx.dataValues.hash });
    let config = {
      method: 'post',
      url: 'http://165.22.209.72:9000/btc-transaction-status',
      headers: {
        'Content-Type': 'application/json'
      },
      data: param
    };

    axios(config)
      .then(async function (response) {
        //console.log("status--------cron",JSON.stringify(response.data)); 
        if (response.data.msg == "success") {
          await btcTxHistoryModel.update({ status: 'confirmed' }, {
            where: {
              transaction_id: tx.dataValues.transaction_id
            }
          });
        }

      })
      .catch(function (error) {
        console.log("Estatus--------cron", error);
      });

  }

}

function generateAccessToken(username) {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign(username, TOKEN_SECRET);
}

/** API for BTC balance retreival */
exports.btcBalance = async (req, res, next) => {


  let address = req.body.address;

  console.log("btc_details balmcce....",address)
  console.log("btc_details balmcce....req.body...",req.body)

  let options = {
    'method': 'POST',
    'url': 'http://165.22.209.72:9000/btc-wallet-balance',
    'headers': {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ "address": address })

  };
  request(options, function (error, response,body) {
  
    // console.log("8888", body)

    let resp = JSON.parse(response.body)
    console.log("8888", resp)
    if (resp) {
      if (resp.status == 1 || resp.success==1) {
        console.log('in if1')
        res.json({ status: 1, msg: resp.msg, data: { balance: resp.balance } });
      }
      else {
        console.log('in else1')

        res.json({ status: 0, msg: resp.msg, data: { err_msg: 'Error occurred.' } });
      }
    }
    else {
      res.json({
        status: 0,
        msg: "Could not find API",
        data: {
          err_msg: error
        },
      });
    }
  });
}

/** API for BTC transfer */
exports.btcTransfer = async (req, res, next) => {
  let dt = dateTime.create();
  let formatted = dt.format('Y-m-d H:M:S');
  console.log(req.body);
  let sender_address = req.body.sender_address;
  let sender_reg_user_id = req.body.sender_reg_user_id;
  let token = await generateAccessToken({ user_id: sender_reg_user_id });
  let sender_wallet_id = req.body.sender_wallet_id;
  let sender_reflet_id = req.body.sender_reflet_id;
  let sender_eth_address //= req.body.sender_eth_address;
  let sender_eth_priv_key = req.body.sender_eth_priv_key;

  console.log("+++++",req.body)
  let receiver_address = req.body.receiver_address;


  let amount = req.body.amount;
  let privateKey = req.body.secret;
  //let eth_hash;
  
  let sender_eth_info= await db.query( "SELECT * FROM `tbl_wallet_reflectid_rels` join tbl_user_wallets on tbl_wallet_reflectid_rels.wallet_id= tbl_user_wallets.wallet_id WHERE tbl_wallet_reflectid_rels.reflect_id="+ sender_reflet_id, { type: db.QueryTypes.SELECT });
  if(sender_eth_info)
  {
    sender_eth_address = sender_eth_info[0].wallet_address; 
  }
  
  let senderData = await db.query('SELECT * FROM `tbl_wallet_imports` join `tbl_wallet_reflectid_rels` on tbl_wallet_imports.wallet_id WHERE tbl_wallet_imports.wallet_id=' + sender_wallet_id + ' and tbl_wallet_imports.status="active" and tbl_wallet_reflectid_rels.reflect_id=' + sender_reflet_id + ' and tbl_wallet_imports.reg_user_id=' + sender_reg_user_id + ' and tbl_wallet_imports.wallet_type="BTC"', { type: db.QueryTypes.SELECT })
  //let receiverData = await db.query('SELECT * FROM tbl_user_wallets INNER JOIN tbl_wallet_imports ON tbl_user_wallets.wallet_id=tbl_user_wallets.wallet_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id WHERE tbl_user_wallets.wallet_address=" ' + receiver_address + ' " AND tbl_wallet_imports.wallet_type="BTC"');
  let receiverData = await db.query('SELECT * FROM tbl_user_wallets INNER JOIN tbl_wallet_imports ON tbl_wallet_imports.wallet_id=tbl_user_wallets.wallet_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.btc_wallet_id =tbl_user_wallets.wallet_id WHERE tbl_user_wallets.wallet_address="'+receiver_address +'" AND tbl_wallet_imports.wallet_type="BTC"', { type: db.QueryTypes.SELECT });
  
  console.log("SD", senderData)
  console.log("RD", receiverData[0])
  console.log("eth add", sender_eth_address)
  
  if (senderData.length>0 && receiverData.length>0) {
    console.log("heloooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
    let options = {
      'method': 'POST',
      //'method': 'GET',
      'url': 'http://165.22.209.72:9000/btc-wallet-transfer',
      'headers': {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "sender_address": sender_address,
        "sender_reg_user_id": sender_reg_user_id,
        "sender_wallet_id": sender_wallet_id,
        "sender_reflect_id": sender_reflet_id,
        "receiver_address": receiver_address,
        "receiver_reg_user_id": receiverData[0].reg_user_id,
        "receiver_wallet_id": receiverData[0].wallet_id,
        "receiver_reflect_id": receiverData[0].reflect_id,
        "secret": privateKey,
        "amount": amount
      })

    };
    request(options, async function (error, response) {
    //  console.log('response======',response)
      //console.log('body********',body)
      let resp = JSON.parse(response.body)
      if (resp) {
        console.log("checking............................:",resp);
        if (resp.success == 1) {

          /**Ethereum transaction method */
          //try{}catch{}
          console.log('in respsuccess')
          let eth_hash = await doTransaction("Test1",resp.hash,"btc","sender@gmail.com","receiver@gmail.com",amount,senderData[0].reflect_code,receiverData[0].reflect_code,
          sender_address,
          receiver_address,
          formatted,
          sender_eth_address,
          sender_eth_priv_key);//.then(eth_hash=>{
            
        //  console.log("eth hashhhhhhhhhhhhhhhh---------", eth_hash)
          if(eth_hash){
            var obj= {
              hash: resp.hash,
              sender_address: sender_address,
              sender_reg_user_id: sender_reg_user_id,
              sender_wallet_id: sender_wallet_id,
              sender_reflect_id: sender_reflet_id,
              receiver_address: receiver_address,
              receiver_reg_user_id: receiverData[0].reg_user_id,
              receiver_wallet_id: receiverData[0].wallet_id,
              receiver_reflect_id: receiverData[0].reflect_id,
              receiver_address: receiver_address,
              amount: amount,
              eth_hash: eth_hash
  
            }
            //console.log("obj:::::",obj)
            btcTxHistoryModel.create(obj).then(result => {
              
           //   console.log("result ..............................:",result);
              res.json({ status: 1, msg: resp.msg, data: { hash: resp.hash, eth_hash: eth_hash, token } });
            }).catch(error => {
              console.log("application testing error1:",error);
              res.json({ status: 0, msg: "Error occurrred while saving transaction", data: { err_msg: error } });
            })
          }
          else{
            console.log("errrrrrrrrrrrrrrrrrrrrrrrrr222222222222222:",error);
            res.json({ status: 0, msg: "Error occurrred while doing ethereum transaction", data: { btc_hash:resp.hash , token, err_msg: "Error occurrred while doing ethereum transaction" } });
          }
          // }).catch(err=>{
          //   res.json({ status: 0, msg: "Error occurrred while doing ethereum transaction1!!!!!", data: { err_msg: "Error occurrred while doing ethereum transaction" } });
          //   console.log('error::::',err)
          // })

          
          //res.json({status:1,msg:resp.msg, data:{hash:resp.hash}});
        }
        else {
          console.log("errrrrrrrrrrrrrrrrrrrrrrrrr33333333333333333:",error);
          res.json({ status: 0, msg: resp.msg, data: { err_msg: "Transaction Failed" } });
        }
      }
      else {
        //console.log("errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr:",error);
        res.json({ status: 0, msg: "Could not find API", data: { err_msg: error } });
      }
         
    });
  }
  else{
  //  console.log("errrrrrrrrrrrrrrrrrrrrrrrrr444444444444444:",error);
    res.json({ status: 0, msg: "Address does not Exist in MyReflet Portal", data: { err_msg: "Address not found in MyReflet" } });
  }

}

/** API for BTC transaction history  for particular wallet*/
exports.btcHistory = async (req, res, next) => {
  let address = req.body.address;
  let reg_user_id = req.body.reg_user_id;
  let token = await generateAccessToken({ user_id: reg_user_id });
  console.log("dataaa" ,address, reg_user_id)

  let historyData = await db.query('SELECT * , sender.reflect_code AS sender_myReflect_code , receiver.reflect_code AS receiver_myReflect_code , sender.rep_firstname as sender_rep_first_name, sender.entity_company_name AS sender_entity_company_name, receiver.rep_firstname as receiver_rep_first_name, receiver.entity_company_name AS receiver_entity_company_name, tbl_btc_transaction_historys.createdAt as tx_createdAt, tbl_btc_transaction_historys.updatedAt as tx_updatedAt FROM `tbl_btc_transaction_historys` INNER JOIN tbl_wallet_reflectid_rels AS sender ON sender.reflect_id=tbl_btc_transaction_historys.sender_reflect_id INNER JOIN tbl_wallet_reflectid_rels AS receiver ON receiver.reflect_id= tbl_btc_transaction_historys.receiver_reflect_id WHERE (sender_address="'+ address + '" OR receiver_address="'+ address + '") AND (sender_reg_user_id="' + reg_user_id + '" OR receiver_reg_user_id="' + reg_user_id + '")', { type: db.QueryTypes.SELECT });
  
  // 'SELECT * , sender.reflect_code AS sender_myReflect_code , receiver.reflect_code AS receiver_myReflect_code , sender.rep_firstname as sender_rep_first_name, sender.entity_company_name AS sender_entity_company_name, receiver.rep_firstname as receiver_rep_first_name, receiver.entity_company_name AS receiver_entity_company_name FROM `tbl_btc_transaction_historys` INNER JOIN tbl_wallet_reflectid_rels AS sender ON sender.reflect_id=tbl_btc_transaction_historys.sender_reflect_id INNER JOIN tbl_wallet_reflectid_rels AS receiver ON receiver.reflect_id= tbl_btc_transaction_historys.receiver_reflect_id WHERE (sender_address="1BnnMCvuCWsCPzzsef5g1BBw3tJDeoyxUW" OR receiver_address="1BnnMCvuCWsCPzzsef5g1BBw3tJDeoyxUW") AND (sender_reg_user_id="1" OR receiver_reg_user_id="1")'
  // console.log("dataaa", historyData)
console.log("history :::::::::::::::",historyData);
  if(historyData && historyData.length>0){
    for (record of historyData){
      if(record.sender_address == address || record.sender_reg_user_id == reg_user_id){
        record.type= "send";
      }
      else{
        record.type="receive";
      }
    }
    res.json({ status: 1, msg: "History found", data: { history: historyData, token } });
  }  
  else{
    res.json({ status: 0, msg: "Could not find History", data: { err_msg: "Record not found" } });
  }
}



//transaction history for all btc transaction
exports.btcHistoryForAll = async (req, res, next) => {
  let reg_user_id = req.body.reg_user_id;
  let token = await generateAccessToken({ user_id: reg_user_id });

  let historyData1 = await db.query('SELECT * , sender.reflect_code AS sender_myReflect_code , receiver.reflect_code AS receiver_myReflect_code , sender.rep_firstname as sender_rep_first_name, sender.entity_company_name AS sender_entity_company_name, receiver.rep_firstname as receiver_rep_first_name, receiver.entity_company_name AS receiver_entity_company_name, tbl_btc_transaction_historys.createdAt as tx_createdAt, tbl_btc_transaction_historys.updatedAt as tx_updatedAt FROM `tbl_btc_transaction_historys` INNER JOIN tbl_wallet_reflectid_rels AS sender ON sender.reflect_id=tbl_btc_transaction_historys.sender_reflect_id INNER JOIN tbl_wallet_reflectid_rels AS receiver ON receiver.reflect_id= tbl_btc_transaction_historys.receiver_reflect_id WHERE (sender_reg_user_id="' + reg_user_id + '" OR receiver_reg_user_id="' + reg_user_id + '")', { type: db.QueryTypes.SELECT });
  
  // 'SELECT * , sender.reflect_code AS sender_myReflect_code , receiver.reflect_code AS receiver_myReflect_code , sender.rep_firstname as sender_rep_first_name, sender.entity_company_name AS sender_entity_company_name, receiver.rep_firstname as receiver_rep_first_name, receiver.entity_company_name AS receiver_entity_company_name FROM `tbl_btc_transaction_historys` INNER JOIN tbl_wallet_reflectid_rels AS sender ON sender.reflect_id=tbl_btc_transaction_historys.sender_reflect_id INNER JOIN tbl_wallet_reflectid_rels AS receiver ON receiver.reflect_id= tbl_btc_transaction_historys.receiver_reflect_id WHERE (sender_address="1BnnMCvuCWsCPzzsef5g1BBw3tJDeoyxUW" OR receiver_address="1BnnMCvuCWsCPzzsef5g1BBw3tJDeoyxUW") AND (sender_reg_user_id="1" OR receiver_reg_user_id="1")'
  // console.log("dataaa", historyData)
//console.log("history :::::::::::::::",historyData);
//dummy data
let historyData=[{
  "transaction_id": 3,
  "hash": "3b1828396181b94457e547133efd41a918efefd7f8ed59dc571c8364428f8603",
  "sender_address": "msbRTR1ZSvA7LnhayC6QiQ4iEQBWyEneA1",
  "sender_reg_user_id": 16,
  "sender_wallet_id": 27,
  "sender_reflect_id": 10,
  "receiver_address": "mrzTRfzxmRD97b5RenWyHc6v1yGMb7WAnx",
  "receiver_reg_user_id": 2,
  "receiver_wallet_id": 1,
  "receiver_reflect_id": 1,
  "amount": 0.001,
  "status": "confirmed",
  "eth_hash": "",
  "createdAt": "2020-10-05T06:28:26.000Z",
  "updatedAt": "2020-12-07T14:16:15.000Z",
  "reflect_id": 1,
  "reflect_code": "1255",
  "reflectid_by": "entity",
  "reg_user_id": 2,
  "user_as": "client",
  "verifier_type": null,
  "verifier_type_name": "general",
  "verifier_category_id": null,
  "wallet_id": 1,
  "btc_wallet_id": 48,
  "child_wallet_id": null,
  "rep_username": null,
  "rep_firstname": null,
  "rep_lastname": null,
  "rep_emailid": null,
  "rep_btc_address": "1DeaxQ9BjwkwSHrd9HE7vP7swCUd9KxoMS",
  "rep_company_name": null,
  "rep_dob": null,
  "rep_eth_addess": null,
  "rep_nationality": null,
  "email_verification_status": "pending",
  "entity_company_name": "QuestGlt ",
  "entity_name": null,
  "entity_company_regno": null,
  "entity_company_emailid": null,
  "entity_dateof_incorporation": null,
  "entity_company_country": null,
  "entity_company_address": null,
  "entity_company_phoneno": null,
  "additional_info": null,
  "deleted": "0",
  "deleted_at": null,
  "wallet_name": null,
  "property_name": null,
  "sender_myReflect_code": "6003",
  "receiver_myReflect_code": "1255",
  "sender_rep_first_name": "Nupura",
  "sender_entity_company_name": null,
  "receiver_rep_first_name": null,
  "receiver_entity_company_name": "QuestGlt ",
  "tx_createdAt": "2020-11-27T11:21:14.000Z",
  "tx_updatedAt": "2020-11-27T12:30:00.000Z",
  "type": "send"
},
{
  "transaction_id": 4,
  "hash": "f53fa4c9aae7ba930e50efdc24abe076eed2e904d72e6fbd6ecd395e85685b3f",
  "sender_address": "mrzTRfzxmRD97b5RenWyHc6v1yGMb7WAnx",
  "sender_reg_user_id": 16,
  "sender_wallet_id": 27,
  "sender_reflect_id": 10,
  "receiver_address": "msbRTR1ZSvA7LnhayC6QiQ4iEQBWyEneA1",
  "receiver_reg_user_id": 16,
  "receiver_wallet_id": 13,
  "receiver_reflect_id": 10,
  "amount": 0.001,
  "status": "confirmed",
  "eth_hash": "",
  "createdAt": "2020-11-16T10:05:54.000Z",
  "updatedAt": "2020-12-02T13:17:26.000Z",
  "reflect_id": 10,
  "reflect_code": "6003",
  "reflectid_by": "representative",
  "reg_user_id": 16,
  "user_as": "client",
  "verifier_type": null,
  "verifier_type_name": "general",
  "verifier_category_id": null,
  "wallet_id": 13,
  "btc_wallet_id": 35,
  "child_wallet_id": null,
  "rep_username": "Nupura",
  "rep_firstname": "Nupura",
  "rep_lastname": "T",
  "rep_emailid": "c5519537b55a00b62f2337676c765d6fbd80fccd446b67624ca6ae3acb2ecdbb",
  "rep_btc_address": "mfY5HF9EtmxeFNBZmNT1eij6EXkqMUn2cW",
  "rep_company_name": null,
  "rep_dob": null,
  "rep_eth_addess": null,
  "rep_nationality": null,
  "email_verification_status": "pending",
  "entity_company_name": null,
  "entity_name": null,
  "entity_company_regno": null,
  "entity_company_emailid": null,
  "entity_dateof_incorporation": null,
  "entity_company_country": 99,
  "entity_company_address": null,
  "entity_company_phoneno": null,
  "additional_info": null,
  "deleted": "0",
  "deleted_at": null,
  "wallet_name": "Nupura's wallet1",
  "property_name": null,
  "sender_myReflect_code": "6003",
  "receiver_myReflect_code": "6003",
  "sender_rep_first_name": "Nupura",
  "sender_entity_company_name": null,
  "receiver_rep_first_name": "Nupura",
  "receiver_entity_company_name": null,
  "tx_createdAt": "2020-11-27T11:41:49.000Z",
  "tx_updatedAt": "2020-11-27T12:00:00.000Z",
  "type": "send"
}
]

  if(historyData && historyData.length>0){
    for (record of historyData){
      if(record.sender_reg_user_id == reg_user_id){
        record.type= "send";
      }
      else{
        record.type="receive";
      }
    }
    res.json({ status: 1, msg: "History found", data: { history: historyData, token } });
  }  
  else{
    res.json({ status: 0, msg: "Could not find History", data: { err_msg: "Record not found" } });
  }
}