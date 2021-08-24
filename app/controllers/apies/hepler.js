var { decrypt, encrypt, encrypt1, decrypt1 } = require('../../helpers/encrypt-decrypt')
var bitcoinTransaction = require('bitcoin-transaction');
const nodemailer = require("nodemailer");
var dateTime = require('node-datetime')
var crypto = require('crypto');
var stb = require("satoshi-bitcoin");
var async = require('async');
var axios = require('axios');
var bitcoin = require("bitcoinjs-lib");
var { NotificationModel,tbl_notification_registration_tokens } = require('../../models/notification');
const TESTNET = bitcoin.networks.testnet;
const MAINNET = bitcoin.networks.bitcoin;
const admin = require("firebase-admin");
const serviceAccount = require("./firebase2.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "https://notifications-f9232-default-rtdb.firebaseio.com"
  });


//btc balance
exports.btcbalance=async function(address){
    //  var address="mhJhQGa5gecXjBMSyGuhWTg1ZTAWSqjmCE";
     // var data = JSON.stringify({ "address": address });
      //console.log("param ", data)
      
      var config = {
        method: 'get',
        url: `https://api.blockcypher.com/v1/btc/test3/addrs/${address}`,
        headers: {
         'Content-Type': 'application/json',
        },
      };
      return axios(config)
         .then(function (response) {
     
         //  console.log("BBBBBBBBBBBBBBBBBBBBBBB",response);
           let balance=response.data.balance;
           let actuaLBtc=stb.toBitcoin(balance);
           console.log("BBBBBBBBBBBBBBBBBBBBBBB",actuaLBtc);
           return actuaLBtc;
         }) 
       }


//send main notification 
//send notification function
exports.updateNotification=async function(sender_userid,receiver_userid,msg,subject,profile_pic){
    console.log("creating notificationnnnnnnnnnnnnnn");
    try{
      var dt = dateTime.create();
      var formatted = dt.format('Y-m-d H:M:S');
          let isCreated= await NotificationModel.create({
                sender_id:sender_userid,
                receiver_id:receiver_userid,
                subject:subject,
                notification_msg:msg,
                profile_pic:profile_pic,
                notification_date:formatted
               })
               if(isCreated){
                 return true;
               }else{
                 return false;
               }
    }catch(err){
      throw err
    }
  }
  
//push notification
exports.pushnotification = async (userId, titles, bodys) => {
    //fetching device token from db
    try{
    var deviceObj = await tbl_notification_registration_tokens.findOne({where:{reg_user_id:userId}});
    }catch(err){
      throw err
    }
    let token = deviceObj.registrationToken;
  
    console.log("device token.................:", token);
   var registrationToken = [token];
    var payload = {
      notification: {
        title: titles,
        body: bodys
      }
    };
  
    var options = {
      priority: "high",
      timeToLive: 60 * 60 * 24
    };
  
    admin.messaging().sendToDevice(registrationToken, payload, options)
      .then(response => {
        console.log(response);
  
        // return { status: true, data: { response }, msg: "Notification sent successfully", }
        //  res.status(200).send("Notification sent successfully" + JSON.stringify(response))
      })
      .catch(error => {
        console.log(error);
      });
  
  }