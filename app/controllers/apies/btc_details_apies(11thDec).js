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
  let options = {
    'method': 'POST',
    'url': 'http://165.22.209.72:9000/btc-wallet-balance',
    'headers': {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ "address": address })

  };
  request(options, function (error, response,body) {
    // console.log("8888", response)
    // console.log("8888", body)

    let resp = JSON.parse(response.body)
    if (resp) {
      if (resp.success == 1) {
        res.json({ status: 1, msg: resp.msg, data: { balance: resp.balance } });
      }
      else {
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
  let sender_wallet_id = req.body.sender_wallet_id;
  let sender_reflet_id = req.body.sender_reflet_id;

  //console.log("+++++",req.body)
  let receiver_address = req.body.receiver_address;


  let amount = req.body.amount;
  let privateKey = req.body.secret;

  

  let senderData = await db.query('SELECT * FROM `tbl_wallet_imports` join `tbl_wallet_reflectid_rels` on tbl_wallet_imports.wallet_id WHERE tbl_wallet_imports.wallet_id=' + sender_wallet_id + ' and tbl_wallet_imports.status="active" and tbl_wallet_reflectid_rels.reflect_id=' + sender_reflet_id + ' and tbl_wallet_imports.reg_user_id=' + sender_reg_user_id + ' and tbl_wallet_imports.wallet_type="BTC"', { type: db.QueryTypes.SELECT })
  //let receiverData = await db.query('SELECT * FROM tbl_user_wallets INNER JOIN tbl_wallet_imports ON tbl_user_wallets.wallet_id=tbl_user_wallets.wallet_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id WHERE tbl_user_wallets.wallet_address=" ' + receiver_address + ' " AND tbl_wallet_imports.wallet_type="BTC"');
  let receiverData = await db.query('SELECT * FROM tbl_user_wallets INNER JOIN tbl_wallet_imports ON tbl_wallet_imports.wallet_id=tbl_user_wallets.wallet_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.btc_wallet_id =tbl_user_wallets.wallet_id WHERE tbl_user_wallets.wallet_address="'+receiver_address +'" AND tbl_wallet_imports.wallet_type="BTC"', { type: db.QueryTypes.SELECT });
  
  // console.log("SD", senderData)
  // console.log("RD", receiverData[0])
  // let run=0;
  if (senderData && receiverData) {
    let options = {
      'method': 'POST',
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
    request(options, function (error, response) {
      console.log('response======',response)
      //console.log('body********',body)
      let resp = JSON.parse(response.body)
      if (resp) {
        if (resp.success == 1) {
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

          }
          //console.log("obj:::::",obj)
          btcTxHistoryModel.create(obj).then(result => {
            console.log(result)
            res.json({ status: 1, msg: resp.msg, data: { hash: resp.hash } });
          }).catch(error => {
            res.json({ status: 0, msg: "Error occurrred while saving transaction", data: { err_msg: error } });
          })
          //res.json({status:1,msg:resp.msg, data:{hash:resp.hash}});
        }
        else {
          res.json({ status: 0, msg: resp.msg, data: { err_msg: 'Error occurred.' } });
        }
      }
      else {
        res.json({ status: 0, msg: "Could not find API", data: { err_msg: error } });
      }
    });
  }
  else{
    res.json({ status: 0, msg: "Address does not Exist in MyReflet Portal", data: { err_msg: "Address not found in MyReflet" } });
  }
}

/** API for BTC transaction history */
exports.btcHistory = async (req, res, next) => {
  let address = req.body.address;
  let reg_user_id = req.body.reg_user_id;
  console.log("dataaa" ,address, reg_user_id)

  let historyData = await db.query('SELECT * , sender.reflect_code AS sender_myReflect_code , receiver.reflect_code AS receiver_myReflect_code , sender.rep_firstname as sender_rep_first_name, sender.entity_company_name AS sender_entity_company_name, receiver.rep_firstname as receiver_rep_first_name, receiver.entity_company_name AS receiver_entity_company_name, tbl_btc_transaction_historys.createdAt as tx_createdAt, tbl_btc_transaction_historys.updatedAt as tx_updatedAt FROM `tbl_btc_transaction_historys` INNER JOIN tbl_wallet_reflectid_rels AS sender ON sender.reflect_id=tbl_btc_transaction_historys.sender_reflect_id INNER JOIN tbl_wallet_reflectid_rels AS receiver ON receiver.reflect_id= tbl_btc_transaction_historys.receiver_reflect_id WHERE (sender_address="'+ address + '" OR receiver_address="'+ address + '") AND (sender_reg_user_id="' + reg_user_id + '" OR receiver_reg_user_id="' + reg_user_id + '")', { type: db.QueryTypes.SELECT });
  
  // 'SELECT * , sender.reflect_code AS sender_myReflect_code , receiver.reflect_code AS receiver_myReflect_code , sender.rep_firstname as sender_rep_first_name, sender.entity_company_name AS sender_entity_company_name, receiver.rep_firstname as receiver_rep_first_name, receiver.entity_company_name AS receiver_entity_company_name FROM `tbl_btc_transaction_historys` INNER JOIN tbl_wallet_reflectid_rels AS sender ON sender.reflect_id=tbl_btc_transaction_historys.sender_reflect_id INNER JOIN tbl_wallet_reflectid_rels AS receiver ON receiver.reflect_id= tbl_btc_transaction_historys.receiver_reflect_id WHERE (sender_address="1BnnMCvuCWsCPzzsef5g1BBw3tJDeoyxUW" OR receiver_address="1BnnMCvuCWsCPzzsef5g1BBw3tJDeoyxUW") AND (sender_reg_user_id="1" OR receiver_reg_user_id="1")'
  // console.log("dataaa", historyData)

  if(historyData && historyData.length>0){
    for (record of historyData){
      if(record.sender_address == address || record.sender_reg_user_id == reg_user_id){
        record.type= "send";
      }
      else{
        record.type="receive";
      }
    }
    res.json({ status: 1, msg: "History found", data: { history: historyData } });
  }  
  else{
    res.json({ status: 0, msg: "Could not find History", data: { err_msg: "Record not found" } });
  }
}