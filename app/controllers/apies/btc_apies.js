var { UserModel, LogDetailsModel, tbl_log_manage, tokeModel } = require('../../models/user');
var { SecurityMasterModel, UserSecurityModel, CountryCodeModel } = require('../../models/securityMaster');
var { tbl_verifier_plan_master, AdminModel, PlanFeatures, PlanFeatureRel, tbl_verifier_doc_list, MarketPlace,adminNotificationModel, AllotMarketPlace, ContectUsModel, SubscriberModel,MasterLevelModel
} = require('../../models/admin');
let priceOfCrypto = require('crypto-price');
const {pushnotification,btcbalance,updateNotification}=require('./helper');
const {ShareEntityModel}=require('../../models/shareentity');
var multer=require('multer');
const { DigitalWalletRelsModel } = require('../../models/wallet_digital_rels');
var path=require('path');
const admin = require("firebase-admin");
const { DocReqForVerificarionModel}=require('../../models/verifier_doc_request');
const {VerifierModel}=require('../../models/verifier_list');
const {DocumentTransactionModel}=require('../../models/document_trans_his');
var { CryptoWalletModel}=require('../../models/crypto_wallet');
const serviceAccount = require("./firebase2.json");
let csc = require('country-state-city').default;
const generateUniqueId = require('generate-unique-id');
var {KycModel}=require('../../models/kyc-verification');
var {DocumentMasterModel}=require('../../models/master');
var { tbl_verfier_purchase_details } = require("../../models/purchase_detaile");
var { tbl_plan_features } = require("../../models/tbl_plan_features")
var { tbl_plan_feature_rel } = require("../../models/tbl_plan_feature_rel")
var { decrypt, encrypt, encrypt1, decrypt1 } = require('../../helpers/encrypt-decrypt')
var bitcoinTransaction = require('bitcoin-transaction');
var wif = require('wif');

var os = require('os');
const nodemailer = require("nodemailer");
const express = require('express');
var app = express();
const countryCodes = require('country-codes-list');
const ejs = require('ejs');
var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime')
var crypto = require('crypto');
var text_func = require('../../helpers/text');
var mail_func = require('../../helpers/mail');
const util = require('util');
var stb = require("satoshi-bitcoin");
const { base64encode, base64decode } = require('nodejs-base64');
//var crypto = require("crypto-js");
var userData = require('../../helpers/profile')
var jwt = require('jsonwebtoken');
const Tx = require('ethereumjs-tx')
var bitcoin = require("bitcoinjs-lib")
var { tbl_shared_certified_doc } = require('../../models/certified_shared_documents');
var { NotificationModel,tbl_notification_registration_tokens } = require('../../models/notification');
var async = require('async');
var axios = require('axios');
           
const TESTNET = bitcoin.networks.testnet;
const MAINNET = bitcoin.networks.bitcoin;
var { WalletModel, WalletModelImport } = require('../../models/wallets');
var { MyReflectIdModel, DocumentReflectIdModel,FilesDocModel } = require('../../models/reflect');
const request = require("request")
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://128.199.31.153:8501"));
const InputDataDecoder = require("ethereum-input-data-decoder");
var { apies_notification } = require('./apies_notification');
//file upload...............
const formidable = require('formidable');
var Jimp = require('jimp');
const ipfsAPI = require('ipfs-api');
const fs = require('fs');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
var {DocFolderModel} =require('../../models/doc_folder');
//...........................


//........................................
var EthUtil = require('ethereumjs-util');
var bip39 = require('bip39');
let eth_wallet=require('ethereumjs-wallet');
const { hdkey } = require('ethereumjs-wallet');
var etherHDkey=hdkey;
const web3jsAcc = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/fa42c8837a7b4155ba2ab5ba6fac9bd1"));
const contractAddress= '0xB8bF5431D027f2Dbc58923E794d48e7bdE91c92E';
const {CryptoTransHistoryModel}=require('../../models/crypto_transaction_his');
//................................................................

// const {  MAIL_SEND_ID,
//   PASS_OF_MAIL,
//   TOKEN_SECRET,
// }							                                                   = require('../../config/config')


// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   // databaseURL: "https://notifications-f9232-default-rtdb.firebaseio.com"
// });

const { MAIL_SEND_ID,
  PASS_OF_MAIL,
  TOKEN_SECRET,
} = require('../../config/config');
const { where } = require('sequelize');
const { compareSync } = require('bcryptjs');



var contractABI = [
  {
    constant: true,
    inputs: [{ name: "", type: "uint256" }],
    name: "documents",
    outputs: [{ name: "doc", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "doc", type: "string" },
      { name: "verifier_email", type: "string" },
      { name: "client_email", type: "string" },
      { name: "doc_name", type: "string" },
      { name: "verifier_myReflect_code", type: "string" },
      { name: "client_myReflect_code", type: "string" },
      { name: "request_status", type: "string" },
      { name: "reason", type: "string" },
    ],
    name: "addDocument",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "getDocumentsCount",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "index", type: "uint256" }],
    name: "getDocument",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

const decoder = new InputDataDecoder(contractABI);




async function generateAccessToken(username) {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign(username, TOKEN_SECRET);
}
var dt = dateTime.create();
var formatted = dt.format('Y-m-d H:M:S');





exports.signup = async (req,res,next) => {
  var country_data = await db.query(' SELECT * FROM `tbl_countries` WHERE status="active" ORDER BY `country_id` ASC',{type:db.  QueryTypes.SELECT});
  res.json(country_data);
}











/**submit_register Post Method start**/
exports.submit_register = async (req, res, next) => {
  console.log('*************BTC apies submit signup******************', req.body);
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
  var full_name = encrypt(req.body.f_name);
  var email = encrypt(req.body.email);
  var dob = encrypt(req.body.dob);
  var country=req.body.country;
  var city=req.body.city;
  var place_of_birth=city+","+country;
  place_of_birth=encrypt(place_of_birth);
  //var place_of_birth = encrypt(req.body.place_of_birth);
  var country_code_select = req.body.country_code_select;
  var mobile = encrypt(req.body.mobile);
  var last_name = encrypt(req.body.l_name);
  var emailOfHash=req.body.emailHash;
  var now = new Date();
  now.setMinutes(now.getMinutes() + 05); // timestamp
  now = new Date(now); // Date object
  var otp_expire = now;
  let genOtp=generateOTP()
  var otp = encrypt(genOtp);
  //console.log("otp:::::::::::",otp);
  function generateOTP() {
    // Declare a digits variable  
    // which stores all digits 
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    console.log("OTP::::::::::::::::::::::",OTP);
    return OTP;
  }
 let email_hash=encrypt(emailOfHash);
 // console.log("enncrypted password::::::::::::::::::::::::::::::::::::",enc_pass);
  UserModel.findOne({ where: { email: email } }).then(function (userDataResult) {
    if (userDataResult) {
      console.log("user:",userDataResult);
      res.json({ status: 0, msg: "User email is already registered.", data: { err_msg: 'Failed' } });
      //    req.flash('err_msg', 'User email is already registered.')
      //    res.redirect('/signup');
    } else {
      UserModel.findOne({ where: { mobile_number: mobile } }).then(function (userResult) {
        if (userResult) {

          res.json({ status: 0, msg: "User mobile number is already registered.", data: { err_msg: 'Failed' } });

          //    req.flash('err_msg', 'User mobile number is already registered.')
          //    res.redirect('/signup');
        } else {
       //   console.log("server salt::::::",serverSalt);
          var steps = parseInt("1")
          UserModel.create({ full_name: full_name, last_name: last_name, email: email, country_code_id: country_code_select, mobile_number: mobile, birthplace: place_of_birth, dob: dob, password:'', otp, otp_expire, complete_steps: steps,hashOfemail:email_hash,server_salt:"",profile_img_name:"" }).then(result => {

            var smtpTransport = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: MAIL_SEND_ID,
                pass: PASS_OF_MAIL
              }
            });
            const mailOptions = {
              to: decrypt(email),
              from: 'questtestmail@gmail.com',
              subject: "MyReflet OTP for registration.",

              html: `<!DOCTYPE html>
                                <html>
                                  <head>
                                    <title>My Reflet</title>
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                                     <style>
                                    @media only screen and (max-width: 600px) {
                                    .inner-body {
                                    width: 100% !important;
                                    }
                                    .footer {
                                    width: 100% !important;
                                    }
                                    }
                                    @media only screen and (max-width: 500px) {
                                    .button {
                                    width: 100% !important;
                                    }
                                    }
                                    </style> 
                                  </head>
                                  <body>
                                    <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
                                      <div style="background-color: #88beda;padding: 10px 30px 5px;">
                                        <img src="https://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
                                      </div>
                                      <div style="padding: 30px;line-height: 32px; text-align: justify;">
                                        <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(full_name)}</h4>
                                        <p>Your OTP for MyReflet registration is ${decrypt(otp)}</p>
                                        <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                                        <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                                
                                       
                                      </div>
                                       <div style="background-color:  #88beda; color: #fff; padding: 20px 30px;">
                                         &copy; Copyright 2020 - My Reflet. All rights reserved.
                                        </div>
                                    </div>
                                  </body>
                                </html>  
                                `
            };
            smtpTransport.sendMail(mailOptions, function (err) {

            });
            UserModel.findOne({ where: { email: email, mobile_number: mobile } }).then(userdata => {

              res.json({
                status: 1, msg: "OTP has been sent to your email please check.", data: {
                  success_msg: 'OTP has been sent to your email please check.',
                  user_id: userdata.reg_user_id,
                  server_salt:userdata.server_salt,
                 // password:passwordText,
                  otp:genOtp
                }
              });

              // req.flash('success_msg', 'OTP has been sent to your email please check.')
              // res.redirect(`/top_verification?userid=${userdata.reg_user_id}`)

            }).catch(err => {
              console.log("errrrr 2nd findOne", err)
              res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Somthing went wrong try again.' } });
            })
          }).catch(err => {
            console.log("update faunction err ", err)
            res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Somthing went wrong try again.' } });
          })
        }

      }).catch(err => {
        console.log("errrrr 2st findOne", err)
        res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Somthing went wrong try again.' } });
      });
    }

  }).catch(err => {
    console.log("errrrr 1st findOne", err)
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Somthing went wrong try again.' } });
  });



}



//node mailer...................... otp send

async function sendToMail(email,otp,full_name,head){
  console.log("emaillllllllllllllllllllllll in send to mail",email);
  console.log("otpppppppppppppp in send to mail",otp);
  console.log("fulllllllllll name in send to mail",full_name);
             try{

              var smtpTransport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: MAIL_SEND_ID,
                  pass: PASS_OF_MAIL
                }
              });
              const mailOptions = {
                to: email,
                from: 'questtestmail@gmail.com',
                subject: "Otp for Login",
  
                html: `<!DOCTYPE html>
                                  <html>
                                    <head>
                                      <title>My Reflet</title>
                                      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                                       <style>
                                      @media only screen and (max-width: 600px) {
                                      .inner-body {
                                      width: 100% !important;
                                      }
                                      .footer {
                                      width: 100% !important;
                                      }
                                      }
                                      @media only screen and (max-width: 500px) {
                                      .button {
                                      width: 100% !important;
                                      }
                                      }
                                      </style> 
                                    </head>
                                    <body>
                                      <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
                                        <div style="background-color: #88beda;padding: 10px 30px 5px;">
                                          <img src="https://${head}/assets/images/logo-white.png" style="width: 120px;">
                                        </div>
                                        <div style="padding: 30px;line-height: 32px; text-align: justify;">
                                          <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${full_name}</h4>
                                          <p>Your OTP for MyReflet login is ${otp}</p>
                                          <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                                          <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                                  
                                         
                                        </div>
                                         <div style="background-color:  #88beda; color: #fff; padding: 20px 30px;">
                                           &copy; Copyright 2020 - My Reflet. All rights reserved.
                                          </div>
                                      </div>
                                    </body>
                                  </html>  
                                  `
              };
              smtpTransport.sendMail(mailOptions, function (err) {
                 console.log(err);
              });



             }catch(err){
               throw err;
             }
}

/**submit_register Post Method End**/

/**top_verification Get Method start**/
// exports.otpVerification = (req,res,next )=> {

//     success_msg  = req.flash('success_msg');
//     err_msg      = req.flash('err_msg');

//            res.render('front/otp-for-verify',{
//                 success_msg,
//                 err_msg,
//             });


// }
/**top_verification Get Method End**/

/**submitOtp Post Method Start**/
exports.submitOtp = async (req, res, next) => {
  console.log("*****BTC**********", req.body)
  var userid = req.body.user_id
  var otp1 = req.body.otp;
  console.log("otp1::::",otp1)
  var otp = encrypt(otp1)
  console.log("otp:",otp)
  function toTimestamp(strDate) {
    var datum = Date.parse(strDate);
    return datum / 1000;
  }
try{
  UserModel.findOne({ where: { reg_user_id: userid } })
    .then(async (userdata) => {
      var timstampFormDb = parseInt(toTimestamp(userdata.otp_expire))
      var currentTimestamp = parseInt(toTimestamp(new Date()))
      if (userdata) {
        console.log("Stored otp:",userdata.otp==otp)
        var user_otp = userdata.otp;
        console.log(user_otp == otp && timstampFormDb >= currentTimestamp)
        if (user_otp == otp && timstampFormDb >= currentTimestamp) {
          var steps = parseInt("2")
          await UserModel.update({ complete_steps: steps, email_verification_status: "yes", wrong_otp_count: "0" }, { where: { reg_user_id: userid } })
            .then((result) => {
              res.json({
                status: 1, msg: "success", data: {
                  user_id: userid
                }
              });
              // res.redirect(`/sequrity_question/?userid=${userid}`)

            }).catch(err => {
              console.log("otp step err", err)
              res.json({ status: 0, msg: "failed", data: { err_msg: 'otp step err.' } })
            })

        }
        else {

          if (parseInt(userdata.wrong_otp_count) > 9) {

            res.json({ status: 0, msg: "failed", data: { err_msg: 'You have tried so many invalid attempts, please contact to admin.' } });
            // req.flash('err_msg', 'You have tried so many invalid attempts, please contact to admin.')
            // res.redirect("/signup")

          } else {
            wrong_otp_count = parseInt(userdata.wrong_otp_count) + 1
            UserModel.update({ wrong_otp_count }, { where: { reg_user_id: userid, deleted: "0", status: "active" } }).then(data => {

              res.json({
                status: 0, msg: "failed", data: {
                  err_msg: 'You entered wrong OTP.',
                  user_id: userid
                }
              });

              //   req.flash('err_msg', 'You entered wrong OTP.')
              //   res.redirect(`/top_verification?userid=${userid}`)

            }).catch(err => {
              console.log(err)
              res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.' } });
              //  redirect("/login")
            })
          }

          err_msg = 'You entered wrong OTP.'


        }

      } else {

        res.json({ status: 0, msg: "failed", data: { err_msg: 'Record not found.' } });

        //  req.flash('err_msg', 'Record not found.')
        //  res.redirect("/signup")
      }
    }).catch(err => {
      console.log(err)
      res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });

    })
  }catch(err){
    res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });
  }
}
/**submitOtp Post Method End**/

/**sequrity_question Get Method Start**/
exports.sequrityQuestion = (req, res, next) => {

  db.query("SELECT * FROM tbl_security_questions where status='active' AND deleted='0'")
    .then(securityQuestionsData => {
            
      res.json({
        status: 1, msg: "success", data: {
          securityQuestions: securityQuestionsData[0]
        }
      })
      //    res.render('front/sequrity-question',{
      //                                        securityQuestions:securityQuestionsData[0]
      //    });

    }).catch(err => {
      console.log(err)
      res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });

    })

}
/**sequrity_question Get Method End**/



//login  user
exports.loginUser=async function(req,res){
  var Ip_addr = req.body.Ip_add;
 // console.log("emaillllllllllllll",email);
  var steps = parseInt("5");
  var dt = dateTime.create();
  var login_time = dt.format('Y-m-d H:M:S');
  var blocked_date = dt.format('Y-m-d H:M:S');

  //generate otp
  var now = new Date();
  now.setMinutes(now.getMinutes() + 05); // timestamp
  now = new Date(now); // Date object
  var otp_expire = now;
  let genOtp=generateOTP()
  var otp = encrypt(genOtp);
  //console.log("otp:::::::::::",otp);
  function generateOTP() {
    // Declare a digits variable  
    // which stores all digits 
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    console.log("OTP::::::::::::::::::::::",OTP);
    return OTP;
  }
  var email=encrypt(req.body.email.trim());
console.log("emaillllllllllllllllllllllllllllllllllll",email);
try{
var password=req.body.password;


 let isEmail =await UserModel.findOne({where:{email:email}});
 if(isEmail){
UserModel.findOne({ where: { email: email, complete_steps: steps } }).then(async function (userDataResult) {

//console.log("login password.................", userDataResult);
try{
let serversalt=decrypt(userDataResult.server_salt);
    password=password+serversalt;
    var p=userDataResult.password;
  password=crypto.createHash('sha256').update(password).digest('hex');
  password=encrypt1(password);
  password=encrypt(password);
  console.log("Entereeeeeeeeeeeeeeeeeeeeddddd passsssss", password);
  console.log("Storeddddddddddddddddddddddddddddddddd",p);
}catch(err){
  res.json({ status: 0, msg: "Wrong credential", data: { err_msg: 'Failed' } });
}
   if(password==p){           
  if (userDataResult == null) {  
    await UserModel.findOne({ where: { email: email } }).then(async (tryLogidata) => {

    //  console.log("tryLogidata password.................", tryLogidata)

      if (tryLogidata != null) {

        var creatObj = {
          reg_user_id: tryLogidata.reg_user_id,
          login_time,
          ip_address: '',
          deleted: "1",
          status: "inactive"
        }

        await LogDetailsModel.create(creatObj).then(async (data) => {

          await LogDetailsModel.findAll({ where: { reg_user_id: tryLogidata.reg_user_id, deleted: "1" } }).then(async (invalidUserLogindata) => {

            if (invalidUserLogindata.length > 4) {

              console.log("inside the if ,user blocked")

              await UserModel.update({ status: "block", block_date: blocked_date }, { where: { reg_user_id: invalidUserLogindata[0].reg_user_id } }).then(async (status_update) => {

                console.log("status update status_update", status_update, invalidUserLogindata.length)
                req.flash('err_msg', 'You are block for 48 hours.')

                var full_name, email;

                await UserModel.findOne({ where: { reg_user_id: invalidUserLogindata[0].reg_user_id } }).then(async userdata => {

                  full_name = userdata.full_name
                  email = userdata.email

                  console.log("emailemailemailemailemail : ", email)

                  var smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: MAIL_SEND_ID,
                      pass: PASS_OF_MAIL
                    }
                  });
                  const mailOptions = {
                    to: decrypt(email),
                    from: 'questtestmail@gmail.com',
                    subject: "My Reflet Account Blocked !!.",

                    html: `<!DOCTYPE html>
                                                      <html>
                                                        <head>
                                                          <title>My Reflet</title>
                                                          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                                          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                                                           <style>
                                                          @media only screen and (max-width: 600px) {
                                                          .inner-body {
                                                          width: 100% !important;
                                                          }
                                                          .footer {
                                                          width: 100% !important;
                                                          }
                                                          }
                                                          @media only screen and (max-width: 500px) {
                                                          .button {
                                                          width: 100% !important;
                                                          }
                                                          }
                                                          </style> 
                                                        </head>
                                                        <body>
                                                          <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
                                                            <div style="background-color:#88beda;padding: 10px 30px 5px;">
                                                              <img src="https://${req.headers.host}/admin-assets/images/logo-white.png" style="width: 120px;">
                                                            </div>
                                                            <div style="padding: 30px;line-height: 32px; text-align: justify;">
                                                              <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(full_name)}</h4>
                                                              <p>Alert!My Reflect Team block your account.</p>
                                                              <p>Please contact to administrator for more details.</p>
                                                              <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                                                              <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                                                      
                                                             
                                                            </div>
                                                             <div style="background-color: #88beda; color: #fff; padding: 20px 30px;">
                                                               &copy; Copyright 2020 - My Reflet. All rights reserved.
                                                              </div>
                                                          </div>
                                                        </body>
                                                      </html>  
                                                      `
                  };
                  smtpTransport.sendMail(mailOptions, function (err) {

                  });
                })
                // req.flash('err_msg', 'You are block for 48 hours.')
                // res.redirect("/login")

                res.json({ status: 0, msg: "You are blocked for 48 hours.", data: { err_msg: 'Failed' } });


              }).catch(err => console.log("status update err", err))
            } else {

              InvalidLoginAttempt(email, req)
              // req.flash('err_msg', 'You entered wrong credentials.')
              // res.redirect("/login")
              console.log(" steps not complete . You entered wrong credentials.4444444")
              res.json({ status: 0, msg: "Server salt not found", data: { err_msg: 'Failed' } });

            }
            //    console.log("invalidUserLogindata",invalidUserLogindata)
          }).catch(err => console.log("errr", err))


        }).catch(err => console.log("logomodel err....", err))
      } else {
        // req.flash('err_msg', 'You entered wrong credentials.')
        //   res.redirect("/login")
        console.log("You entered wrong credentials.55555555")
        res.json({ status: 0, msg: "Server salt not found", data: { err_msg: 'Failed' } });

      }

    }).catch(err => console.log("trylogin err..", err))


  } else {

    if (userDataResult.status == "inactive") {

      // req.flash('err_msg', 'Your ID is not active, Please accept invitation or contact to admin.')
      // res.redirect("/login")
      res.json({ status: 0, msg: "Your ID is not active, Please accept invitation or contact to admin.", data: { err_msg: 'Failed' } });


    } else {

      if (userDataResult.status == "block") {
        // req.flash('err_msg', 'You are blocked for 48 hours, After 48 hours you will be able to login.')
        //     res.redirect("/login")
        res.json({ status: 0, msg: "You are blocked for 48 hours, After 48 hours you will be able to login.", data: { err_msg: 'Failed' } });

      } else {
        await LogDetailsModel.update({ status: "active", deleted: "0" }, { where: { reg_user_id: userDataResult.reg_user_id } }).then(async (result) => {
          console.log("unlock periveus entry done")
        })


        //  console.log("pic",userDataResult.profile_pic);
        let text_img;
        /**Imgae for ejs start**/
        if (userDataResult.profile_pic != null) {
          let buff = new Buffer(userDataResult.profile_pic).toString('utf8');
          text_img = buff.toString('ascii');
        } else {
          text_img = ""

        }

        /**Image for ejs end**/

        req.session.name = userDataResult.full_name;
        req.session.profile_pic = text_img;
        req.session.email = email;
        req.session.user_id = userDataResult.reg_user_id;
        if (userDataResult.type == "validatore") {
          req.session.user_type = "validatore";
        } else {
          req.session.user_type = "client";
        }
        //first time login
       let isLog= await LogDetailsModel.findOne({where:{reg_user_id:userDataResult.reg_user_id}});
       console.log("first login:",isLog);
        if(isLog==null){
          var loginInfo = {
            reg_user_id: userDataResult.reg_user_id,
            login_time,
            ip_address: '',
            deleted: "1",
            status: "Inactive"
          }
            let isCreated=await LogDetailsModel.create(loginInfo);
      }
        req.app.locals.userDetail = userDataResult.reg_user_id;
        //check Ip address
        console.log("Ip adddddddddddddddd:",Ip_addr);
        let IpInfo=await LogDetailsModel.findOne({where:{reg_user_id:userDataResult.reg_user_id,ip_address:Ip_addr}});
     
        var ipStatus="";
        console.log(IpInfo);
        if(IpInfo!=null){
          ipStatus="No change"  
        }else{
  
          ipStatus="Changed"
            login_time;
            await UserModel.update({otp:otp,otp_expire},{where:{reg_user_id:userDataResult.reg_user_id}});
            console.log("full name;:::::::::;;;;;;;;;;",decrypt(userDataResult.full_name));
            console.log("email for otp;:::::::::;;;;;;;;;;",decrypt(email));
           await sendToMail(decrypt(email),decrypt(otp),decrypt(userDataResult.full_name),req.headers.host);
          let isUpdated=await LogDetailsModel.update({login_time:login_time,ip_address:Ip_addr},{where:{reg_user_id:userDataResult.reg_user_id}});
          //console.log("updateeeeeeeeeeeeeeee",isUpdated);
        }
        //successfully login
        // res.redirect('/btc/otp_veri_aft_login');
     // let token = await generateAccessToken({ user_id: userDataResult.reg_user_id })
     if(ipStatus=='No change'){
        res.json({ status: 1, msg: "Successfully login", data: { user_id: userDataResult.reg_user_id, serverSalt:userDataResult.server_salt, ipStatus:ipStatus,otp:''  } });
     }else if(ipStatus=='Changed'){
      res.json({ status: 1, msg: "Successfully login", data: { user_id: userDataResult.reg_user_id, serverSalt:userDataResult.server_salt, ipStatus:ipStatus,otp:decrypt(otp)  } });
     }

      }

    }


  }
}else{
  console.log("Passwordddddddddddddddddddddddddddddddddd mismatch");
  res.json({ status: 0, msg: "Wrong credential", data: { err_msg: 'Failed' } });
}
})
}else{
  res.json({ status: 0, msg: "Invalid email", data: { err_msg: 'Failed' } });
}



}catch(err){
res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
}

}


/**submitQuestionAns Post Method Start**/
exports.submitQuestionAns = (req, res, next) => {

  console.log("*****BTC**********", req.body)

  var idUser = req.body.user_id
  var userID = parseInt(req.body.user_id);
  var question = req.body.question;
  var answer = req.body.answer;
  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');


  for (var i = 0; i < question.length; i++) {

    UserSecurityModel.create({
      reg_user_id: userID,
      question_id: parseInt(question[i]),
      answer: encrypt(answer[i]),
      createdAt: formatted,
      updatedAt: formatted
    })
      .then(data => {
        console.log("data saved")

      })
      .catch(err => {
        console.log(err)
        res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });

      })

  }
  var steps = parseInt("3")

  UserModel.update({ complete_steps: steps }, { where: { reg_user_id: userID } })
    .then((result) => {

      res.json({
        status: 1, msg: "success", data: {
          user_id: idUser
        }
      });

      // res.redirect(`/set_pin/?userid=${idUser}`)

    }).catch(err => {
      console.log("otp step err", err)

      res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });

    })

}
/**submitQuestionAns Post Method End**/

/**set_pin Get Method Start**/
//  exports.setPinGet = (req,res,next )=> {

//     success_msg = req.flash('success_msg');
//     err_msg     = req.flash('err_msg');

//            res.render('front/set-a-pin',{
//                   success_msg,
//                   err_msg,
//             });

// }
/**set_pin Get Method End**/
let pinTemp=encrypt1('1234');
console.log("tempppppppppppppppppp:",pinTemp);
/**submitSetPin Post Method Start**/
exports.submitSetPin = async (req, res, next) => {

  console.log("*****BTC**********", req.body)

  //var userid = req.body.user_id

  var userID = parseInt(req.body.user_id);
  var steps = parseInt("4")
  try{
  var otp = decrypt1(req.body.pin);
  let userInfo=await UserModel.findOne({where: { reg_user_id: userID } });
  }catch(err){
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
 
  //client side work
//  let email="navee@gmail.com";
//   let server_salt='bVfTreXHNQbGr9hdamkPulbL5oHdnwWnmG4baMPh+B2HT1y/24LYsrkjy29LnKLLfymgpFLdFXmD/jLZDuluoBlxyO5GshAoARrpITUAb8e+OA4pautnzF02xYt2Qj2kuzBILecibmLKyXNAk6+SU+zNXGbA6MUSeZ3H2OtiW+4=';          
//   let latest_pin=otp+email+server_salt;
//   let h_pin=Buffer.from(latest_pin, 'base64').toString('ascii');
//   let hashPin=crypto.createHash('sha512').update(h_pin).toString('ascii');
//    console.log("Pin:::::::",hashPin);
  //client side work end
  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');

  var updateValues = {
    user_pin: encrypt(otp),
    updatedAt: formatted,
    complete_steps: steps
  }
console.log("value:",updateValues);
  UserModel.update(updateValues, { where: { reg_user_id: userID } }).then((result) => {
    res.json({
      status: 1, msg: "success", data: {
        user_id: userID
      }
    });
    // res.redirect(`/terms-and-conditions?userId=${userID}`);

  }).catch(err => {
    console.log(err)
    res.json({ status: 0, msg: "Somthing went wrong try again.", data: { err_msg: 'Failed', err } });

  })

}
/**submitSetPin Post Method End**/

/**terms-and-conditions Get Method Start**/
exports.termsAndCondition = async (req, res, next) => {


  await db.query("SELECT *FROM `tbl_front_terms_conditions`", { type: db.QueryTypes.SELECT }).then(async function (term_data) {

    // res.render('front/signup-terms',{term_data});
    res.json({
      status: 1, msg: "success", data: {
        term_data
      }
    });

  }).catch(err => {
    console.log(err)
    res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });

  })

}
/**terms-and-conditions Get Method End**/

/**terms-and-conditions-submit Post Method Start**/
exports.termsAndConditionSubmit = (req, res, next) => {

  console.log("*****BTC**********", req.body)

  var steps = parseInt("5")
  var userid = req.body.user_id
  var userID = parseInt(userid);
  
  var updateValues = {
    complete_steps: steps
  }

  UserModel.update(updateValues, { where: { reg_user_id: userID } }).then((result) => {
    UserModel.findOne({ where: { reg_user_id: userID } }).then(function (activeUser) {

      var activeEmail = activeUser.email;
      var username = activeUser.full_name



      var mail_subject = "Successfully Registrations.";
      var mail_content = `
              <html>
                <head>
                  <title>My Reflet</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                  <style>
                  @media only screen and (max-width: 600px) {
                  .inner-body {
                  width: 100% !important;
                  }
                  .footer {
                  width: 100% !important;
                  }
                  }
                  @media only screen and (max-width: 500px) {
                  .button {
                  width: 100% !important;
                  }
                  }
                  </style> 
                </head>
                <body>
                  <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
                    <div style="background-color: #88beda;padding: 10px 30px 5px;">
                      <img src="https://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
                    </div>
                    <div style="padding: 30px;line-height: 32px; text-align: justify;">
                      <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(username)}</h4>
                      <p>Thanks for Registrations</p>
                      <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                      <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
              
                    
                    </div>
                    <div style="background-color: #88beda; color: #fff; padding: 20px 30px;">
                      &copy; Copyright 2020 - My Reflet. All rights reserved.
                      </div>
                  </div>
                </body>
              </html>  
              `
      var to_mail = decrypt(activeEmail);
      var mailresult = mail_func.sendMail(to_mail, mail_subject, mail_content);

      res.json({ status: 1, msg: "success", data: { success_msg: "Sign-up has been completed." } });
      //   res.redirect('/login');

    })
  }).catch(err => {
    console.log(err)
    res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });

  })


}
/**terms-and-conditions-submit Post Method End**/

/**check_user_steps Post Method Start**/
exports.checkUserSteps = (req, res, next) => {

  var email = encrypt(req.body.email)

  UserModel.findOne({ where: { email: email } }).then(userdata => {

    if (userdata == null) {
      res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.' } });
    } else {
      var userObj = {

        user_id: userdata.reg_user_id,
        steps: userdata.complete_steps,
      }
      res.json({ status: 1, msg: "success", data: userObj });

    }
  }).catch(err => {
    console.log(err)
    res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });

  })
}
/**check_user_steps Post Method End**/

/**resend_otp Post Method Start**/
exports.resendOtp = async (req, res, next) => {

  console.log("*****BTC**********", req.body)

  var userid = req.body.user_id
  var otp = encrypt(generateOTP());
  var now = new Date();

  now.setMinutes(now.getMinutes() + 05); // timestamp
  now = new Date(now); // Date object

  var otp_expire = now

  function generateOTP() {

    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }

  var updateValuesObj = {
    otp: otp,
    otp_expire: otp_expire
  }

  await UserModel.update(updateValuesObj, { where: { reg_user_id: userid } }).then(async (result) => {
    await UserModel.findOne({ where: { reg_user_id: userid } }).then(userdata => {

      var smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: MAIL_SEND_ID,
          pass: PASS_OF_MAIL
        }
      });
      const mailOptions = {
        to: decrypt(userdata.email),
        from: 'questtestmail@gmail.com',
        subject: "MyReflet OTP for verification.",

        html: `<!DOCTYPE html>
                      <html>
                        <head>
                          <title>My Reflet</title>
                          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                            <style>
                          @media only screen and (max-width: 600px) {
                          .inner-body {
                          width: 100% !important;
                          }
                          .footer {
                          width: 100% !important;
                          }
                          }
                          @media only screen and (max-width: 500px) {
                          .button {
                          width: 100% !important;
                          }
                          }
                          </style> 
                        </head>
                        <body>
                          <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
                            <div style="background-color: #88beda;padding: 10px 30px 5px;">
                              <img src="https://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
                            </div>
                            <div style="padding: 30px;line-height: 32px; text-align: justify;">
                              <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(userdata.full_name)}</h4>
                              <p>Your OTP for MyReflet verification is ${decrypt(otp)}</p>
                              <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                              <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                      
                              
                            </div>
                              <div style="background-color:  #88beda; color: #fff; padding: 20px 30px;">
                                &copy; Copyright 2020 - My Reflet. All rights reserved.
                              </div>
                          </div>
                        </body>
                      </html>  
                      `
      };
      smtpTransport.sendMail(mailOptions, function (err) {

      });

      res.json({ status: 1, msg: "success", data: { success_msg: "OTP has been sent." } });


    })

  }).catch(err => {
    console.log(err)
    res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });

  })
}
/**resend_otp Post Method End**/

/**dashboard Get Method Start**/
// exports.dashboard = (req,res,next )=> {

//     success_msg = req.flash('success_msg');
//     err_msg = req.flash('err_msg');
//     console.log("cookies tes",req.session)
//         if(req.session.user_type == "client"){
//                 res.redirect("/cilent_deshboard")
//         }else{
//                 res.redirect('/verifier_deshboard')
//         }

// }
/**dashboard Get Method End**/

/**login Get Method Start**/

// exports.login = (req,res,next )=> {

//     success_msg = req.flash('success_msg');
//     err_msg = req.flash('err_msg');

//     var test = req.session.is_user_logged_in;

//         if (test == true) {
//         res.redirect('/dashboard');
//         } else 
//         {


//         res.render('front/login',{
//             success_msg,
//             err_msg,
//           }); 



//       }

// }
/**login Get Method End**/

//*invailed login attempt mailing function
InvalidLoginAttempt = (email, req) => {

  var smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: MAIL_SEND_ID,
      pass: PASS_OF_MAIL
    }
  });

  const mailOptions = {
    to: decrypt(email),
    from: 'questtestmail@gmail.com',
    subject: "invalid login attempt alert !!.",

    html: `<!DOCTYPE html>
                                    <html>
                                      <head>
                                        <title>My Reflet</title>
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                                        <style>
                                        @media only screen and (max-width: 600px) {
                                        .inner-body {
                                        width: 100% !important;
                                        }
                                        .footer {
                                        width: 100% !important;
                                        }
                                        }
                                        @media only screen and (max-width: 500px) {
                                        .button {
                                        width: 100% !important;
                                        }
                                        }
                                        </style> 
                                      </head>
                                      <body>
                                        <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
                                          <div style="background-color:#88beda;padding: 10px 30px 5px;">
                                            <img src="https://${req.headers.host}/admin-assets/images/logo-white.png" style="width: 120px;">
                                          </div>
                                          <div style="padding: 30px;line-height: 32px; text-align: justify;">
                                            <h4 style="font-size: 20px; margin-bottom: 0;">Dear  User</h4>
                                            <p>Alert! My Reflect Team detact invalid login attempt.</p>
                                            <p>Please contact to administrator for more details.</p>
                                            <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                                            <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                                    
                                          
                                          </div>
                                          <div style="background-color: #88beda; color: #fff; padding: 20px 30px;">
                                            &copy; Copyright 2020 - My Reflet. All rights reserved.
                                            </div>
                                        </div>
                                      </body>
                                    </html>  
                                    `
  };

  smtpTransport.sendMail(mailOptions, function (err) { });

}




/**logout Get Method Start**/
exports.logout = (req, res, next) => {

  var test = req.session.is_user_logged_in;

  if (test == true) {

    req.session.destroy(function (err) {
      if (err) {
        return err;
      } else {

        delete app.locals.userDetail;
        return res.redirect('/login');
      }
    });

  }
}
/**logout Get Method End**/

/**forget-password Get Method Start**/
exports.forgetPassword = (req, res, next) => {

  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');

  res.render('front/forgot-pass', {
    success_msg,
    err_msg
  });
}
/**forget-password Get Method End**/

/**forgetPassword Post Method Start**/
exports.submitForgetPassword = (req, res, next) => {

  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');

  var email = encrypt(req.body.emailid);
  var request_type = req.body.request_type;
  console.log("email:::", email);
  console.log("type:::", request_type);

  UserModel.findOne({ where: { email: email, deleted: '0' } }).then(function (userDataResult) {

    if (userDataResult == null) {
      res.json({ status: 0, msg: 'This Email-Id is not registered.', data: { err: 'Error Occurred' } });
      // req.flash('err_msg', 'This Email-Id is not registered.')
      // res.redirect("/forget-password");

    }
    else {
      UserModel.findOne({ where: { email: email, status: 'active' } }).then(async function (activeUser) {

        if (activeUser == null) {
          res.json({ status: 0, msg: 'Your account is inactive.Please contact to administrator.', data: { err: 'Error Occurred' } });
          //  req.flash('err_msg', 'Your account is inactive.Please contact to administrator.')
          //  res.redirect("/forget-password");
        }
        else {


          let token_for_email = await jwt.sign({ activeUser: activeUser.reg_user_id }, TOKEN_SECRET, { expiresIn: '10h' });
          console.log('token_for_email')
          console.log('token_for_email', activeUser.reg_user_id, " email : ")

          await tokeModel.create({ reg_user_id: activeUser.reg_user_id, token: token_for_email, updatedAt: formatted, createdAt: formatted })
            .then(data => {

              // console.log("token entrey done.",data)

              var activeEmail = activeUser.email;
              var username = text_func.ucFirst(activeUser.full_name);
              var verification_code = text_func.newOTP();
              var url_data, sub_type;


              if (request_type === 'password') {

                url_data = 'https://' + req.headers.host + '/reset-password-link/?mail=' + base64encode(activeEmail) + '&token=' + token_for_email
                //  p_tag = ``
                sub_type = "ResetPassword"
              } else {

                url_data = 'https://' + req.headers.host + '/reset-pin-link/?mail=' + base64encode(activeEmail) + '&token=' + token_for_email
                sub_type = "ResetPin"
              }


              var verification_code_en = encrypt(verification_code)
              /**update vericication code to reset passsword start**/

              var updateValues = {
                otp: verification_code_en
              };

              UserModel.update(updateValues, { where: { reg_user_id: activeUser.reg_user_id } }).then(async (result) => {

                console.log("result : ", result)
                var smtpTransport = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: MAIL_SEND_ID,
                    pass: PASS_OF_MAIL
                  }
                });
                const mailOptions = {
                  to: decrypt(activeEmail),
                  from: 'questtestmail@gmail.com',
                  subject: `MyReflet ${sub_type} Link.`,

                  html: `<!DOCTYPE html>
                  <html>
                    <head>
                      <title>My Reflet</title>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                      <style>
                      @media only screen and (max-width: 600px) {
                      .inner-body {
                      width: 100% !important;
                      }
                      .footer {
                      width: 100% !important;
                      }
                      }
                      @media only screen and (max-width: 500px) {
                      .button {
                      width: 100% !important;
                      }
                      }
                      </style> 
                    </head>
                    <body>
                      <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
                        <div style="background-color: #88beda;padding: 10px 30px 5px;">
                          <img src="https://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
                        </div>
                        <div style="padding: 30px;line-height: 32px; text-align: justify;">
                          <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(username)}</h4>
                          <p>Please check your verificaton code and reset ${request_type} link. This link is only valid for 10 hours.<br/><b>Verification code:</b>${verification_code}<br/>
                          <a href="${url_data}">Click here</a> to reset password.</p>
                          <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                          <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                  
                        
                        </div>
                        <div style="background-color:  #88beda; color: #fff; padding: 20px 30px;">
                          &copy; Copyright 2020 - My Reflet. All rights reserved.
                          </div>
                      </div>
                    </body>
                  </html>  
                  `
                };
                smtpTransport.sendMail(mailOptions, function (err) {

                });
                /**send link to reset-password start**/
                res.json({ status: 1, msg: 'Reset Link sent to your Email ID', data: { success: 'success' } });



                // res.redirect("/reset-password");
                /**send link to reset-password start**/
              })
                .catch(err => {
                  // console.log(err)
                  res.json({ status: 0, msg: "something went wrong try again", data: { err: 'Error Ocuurred' } });

                  //res.send({message : "something went wrong try again"})
                })


            }).catch(err => console.log('err'))

          /**update vericication code to reset passsword end**/


        }

      });

    }
  });


}
/**forgetPassword Post Method End**/


/**reset-password Get Method Start**/
exports.successResetpassword = (req, res, next) => {

  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');

  res.render('front/reset-password', {
    success_msg,
    err_msg
  });
}
/**reset-password Get Method End**/

/**reset-password-link Get method start**/
exports.resetPasswordForm = (req, res, next) => {

  var mailid = req.query.mail;
  var token = req.query.token;
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');


  if (token == null) return res.sendStatus(401).send("this link is not correct.") // if there isn't any token
  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403).send({ message: "the link has been expired." })

    console.log("user : ", user.activeUser)
    console.log("token : ", token)

    await tokeModel.findOne({ where: { reg_user_id: user.activeUser, token: token, status_of_token: "active" } })
      .then(data => {

        console.log("data : ", data)

        if (!data) {
          res.send({ message: "This link has been already used. please use again forgot option." })
        } else {
          if (mailid) {
            var emailid = base64decode(mailid);

            console.log("  emailid  : ", emailid)
            res.render('front/enter-pin', {
              success_msg,
              err_msg, emailid,
              token
            });

          }
          else {
            res.sendStatus(401).send("this link is not correct.")
          }
        }



      }).catch(err => {
        console.log(err)
      })




  })



}
/**reset-password-link Get method End**/
//console.log("emaillll:",encrypt1("navee@gmail.com"));
/**reset-password-form Post Start**/
exports.resetPasswordFormPost = async (req, res, next) => {

  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');

  var mailid = req.body.emailId;

  var pin1 = req.body.otp1.trim();
  var pin2 = req.body.otp2.trim();
  var pin3 = req.body.otp3.trim();
  var pin4 = req.body.otp4.trim();
  let token = req.body.token
  var user_pin1 = pin1 + "" + pin2 + "" + pin3 + "" + pin4;
  var otp = encrypt(req.body.verification_code);
  var user_pin = encrypt(user_pin1)

  var newPass = crypto.createHash('sha256').update(req.body.user_pass).digest('hex');

  console.log("mailid : ", mailid)

  // console.log("mailid : ",encrypt(mailid))

  var updateValues = {
    password: newPass
  }
  if (mailid) {
    await UserModel.findOne({ where: { email: mailid } }).then(async function (user) {

      if (user.user_pin != user_pin) {

        console.log('pin is incorrect');

        await tokeModel.findOne({ where: { reg_user_id: user.reg_user_id, token: token } })
          .then(async (data) => {

            // console.log('pin is data',data);

            if (data.try_cout >= 5) {
              await tokeModel.update({ status_of_token: "expire" }, { where: { reg_user_id: user.reg_user_id, token: token } })
                .then(updata => {
                  res.json({ status: 0, msg: "You have tried so many invalid attempts.This link has been blocked for password reset.", data: { err: 'Error Ocuurred' } });
                  // req.flash("err_msg","You have tried so many invalid attempts.This link has been blocked for password reset.")
                  // res.redirect("/login")

                })


            } else {

              var count = parseInt(data.try_cout) + 1

              console.log('pin is count', user.reg_user_id);
              console.log('pin is count', token);

              await tokeModel.update({ try_cout: count }, { where: { reg_user_id: user.reg_user_id, token: token } })
                .then(updata => {
                  res.json({ status: 0, msg: "Your pin is incorrect.", data: { err: 'Error Ocuurred', emailid: mailid, token: token } });

                  // req.flash("err_msg","You have tried so many invalid attempts. This link has been blocked for password reset.")
                  //res.render('front/enter-pin',{err_msg:"Your pin is incorrect.",emailid:mailid,token});

                })

            }

          })
          .catch(err => {
            console.log(err)
            res.json({ status: 0, msg: "something went wrong.", data: { err: err, emailid: mailid, token: token } });
          })


      }
      else if (user.otp != otp) {
        console.log('otp is incorrect', otp);

        console.log('otp user is incorrect', user.otp);
        await tokeModel.findOne({ where: { reg_user_id: user.reg_user_id, token: token } })
          .then(async data => {

            if (data.try_cout >= 5) {
              await tokeModel.update({ status_of_token: "expire" }, { where: { reg_user_id: user.reg_user_id, token: token } })
                .then(updata => {
                  res.json({ status: 0, msg: "You have tried so many invalid attempts.This link has been blocked for password reset.", data: { err: 'Error Ocuurred' } });
                  //  req.flash("err_msg","You have tried so many invalid attempts. This link has been blocked for password reset.")
                  //  res.redirect("/login")

                })


            } else {
              var count = parseInt(data.try_cout) + 1
              await tokeModel.update({ try_cout: count }, { where: { reg_user_id: user.reg_user_id, token: token } })
                .then(updata => {
                  res.json({ status: 0, msg: "Your otp is incorrect.", data: { err: 'Error Ocuurred', emailid: mailid, token: token } });

                  // req.flash("err_msg","You have tried so many invalid attempts. This link has been blocked for password reset.")
                  //res.render('front/enter-pin',{err_msg:"Your otp is incorrect.",emailid:mailid,token});

                })

            }

          })
          .catch(err => console.log(err))
      }
      else {


        await tokeModel.update({ status_of_token: "inactive" }, { where: { reg_user_id: user.reg_user_id, token: token } })
          .then(updata => {

            UserModel.update(updateValues, { where: { email: mailid } }).then((result) => {
              console.log("updated result  ", result);
              //  res.redirect('/login');
              res.json({ status: 0, msg: "Your password has been updated successfully", data: { success: 'success', emailid: mailid, token: token } });

              //res.render('front/login',{success_msg:"Your password has been updated successfully."});

            }).catch(err => {
              console.log(err)
              res.json({ status: 0, msg: "Something went wrong.", data: { err: 'Error Ocuurred', emailid: mailid, token: token } });
            })

          })
          .catch(err => {
            res.json({ status: 0, msg: "Something went wrong.", data: { err: 'Error Ocuurred', emailid: mailid, token: token } });
            console.log(err)
          })




      }
    })



  }
  else {
    //
  }


}
/**reset-password-form Post method End**/

/**reset-pin-link Get method start**/
exports.resetPinForm = (req, res, next) => {

  var mailid = req.query.mail;
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
  var token = req.query.token;


  if (token == null) return res.sendStatus(401).send("this link is not correct.") // if there isn't any token
  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403).send({ message: "the link has been expired." })

    console.log("user : ", user.activeUser)
    console.log("token : ", token)

    await tokeModel.findOne({ where: { reg_user_id: user.activeUser, token: token, status_of_token: "active" } })
      .then(data => {

        console.log("data : ", data)

        if (data === null) {
          res.send({ message: "This link has been already used. please use again forgot option." })
        } else {
          if (mailid) {
            var emailid = base64decode(mailid);

            res.render('front/reset-pin-link', {
              token,
              success_msg,
              err_msg, emailid
            });

          }

        }
      }).catch(err => {
        console.log(err)

        res.sendStatus(401).send("this link is not correct.")

      })
  })
}
/**reset-pin-link Get method End**/

/**reset-pin-form Post Start**/
exports.resetPinFormPost = async (req, res, next) => {

  var mailid = req.body.emailId;

  var pin1 = req.body.otp1.trim();
  var pin2 = req.body.otp2.trim();
  var pin3 = req.body.otp3.trim();
  var pin4 = req.body.otp4.trim();
  var user_pin1 = pin1 + "" + pin2 + "" + pin3 + "" + pin4;

  var token = req.body.token

  console.log("user_pin1 : ", user_pin1)
  console.log("user_pin1 : ", req.body.verification_code)
  console.log("req.body.emailId : ", req.body.emailId)
  // console.log("encrypt(req.body.emailId) : ",encrypt(req.body.emailId))
  var string_pin = user_pin1.toString()
  console.log("string_pin : ", string_pin)

  var user_pin = encrypt(string_pin);
  console.log("en user_pin : ", user_pin)

  var string_otp = (req.body.verification_code).toString()
  console.log("string_otp : ", string_otp)

  var otp = encrypt(string_otp);
  console.log("otp ENN : ", otp)

  // var newPass = crypto.createHash('sha256').update(req.body.user_pass).digest('hex');

  var updateValues = {
    user_pin: user_pin
  }

  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');

  if (mailid) {
    UserModel.findOne({ where: { email: mailid } }).then(async function (user) {

      console.log('user ', user)

      if (user.otp != otp) {

        await tokeModel.findOne({ where: { reg_user_id: user.reg_user_id, token: token } })
          .then(async (data) => {

            if (data.try_cout >= 5) {
              await tokeModel.update({ status_of_token: "expire" }, { where: { reg_user_id: user.reg_user_id, token: token } })
                .then(updata => {

                  req.flash("err_msg", "You have tried so many invalid attempts. This link has been blocked for password reset.")
                  res.redirect("/login")

                })


            } else {
              var count = parseInt(data.try_cout) + 1
              await tokeModel.update({ try_cout: count }, { where: { reg_user_id: user.reg_user_id, token: token } })
                .then(updata => {

                  // req.flash("err_msg","You have tried so many invalid attempts. This link has been blocked for password reset.")
                  res.render('front/reset-pin-link', { token: token, err_msg: "Veriffication code is incorrect.", emailid: mailid });

                })

            }

          })
          .catch(err => console.log(err))
      }
      else {
        UserModel.update(updateValues, { where: { email: mailid } }).then((result) => {
          console.log("updated result  ", result);
          //  res.redirect('/login');
          res.render('front/login', { success_msg: "Your pin is update." });

        }).catch(err => {
          console.log(err)
        })
      }
    })
  }
  else {
    //
  }


}
/**reset-pin-form Post method End**/

/**get-change-pass Get method Start**/
exports.getChangePass = (req, res, next) => {
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
  var user_id = req.session.user_id;
  // var user_id =20;


  SecurityMasterModel.hasMany(UserSecurityModel, { foreignKey: 'question_id' })
  UserSecurityModel.belongsTo(SecurityMasterModel, { foreignKey: 'question_id' })
  UserSecurityModel.findAll({ where: { reg_user_id: user_id }, include: [SecurityMasterModel] }).then(function (users) {
    // var question = user.tbl_security_question.dataValues.question;

    // for(var i=0;i<users.length;i++){
    // console.log(users[i].tbl_security_question.dataValues.question);}
    res.render('front/change-password', {
      success_msg,
      err_msg,
      users,
      session: req.session
    });


  })


}
/**get-change-pass Get method End**/

/**change-pass Post method Start**/
exports.ChangePass = (req, res, next) => {
  var user_id = req.session.user_id;
  // var user_id = 20;
  var password = req.body.password.trim();
  var question_id = req.body.question
  var newPassword = req.body.newPassword.trim();
  var answer = req.body.answer
  var user_answer1;
  var user_answer2;

  console.log("question_id", question_id);

  console.log("answer", answer);


  UserModel.findOne({ where: { reg_user_id: user_id } }).then(function (user) {
    UserSecurityModel.findAll({ where: { reg_user_id: user_id } }).then(function (questions) {

      for (var j = 0; j < questions.length; j++) {
        // console.log(questions[j].dataValues.secu_question_id);
        if (questions[j].dataValues.secu_question_id == question_id[0]) {
          user_answer1 = questions[j].dataValues.answer;
        }
        if (questions[j].dataValues.secu_question_id == question_id[1]) {
          user_answer2 = questions[j].dataValues.answer;
        }
      }

      console.log("old Pass", user.password);
      var mystr = crypto.createHash('sha256').update(password).digest('hex');

      // var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
      // var mystr = mykey.update(password, 'utf8', 'hex')
      // mystr += mykey.final('hex');


      // console.log("mystr",mystr);
      console.log("user_answer1 user_answer2", user_answer1, user_answer2);

      if (user.password != mystr) {
        req.flash('err_msg', 'Your old password is wrong.');
        // console.log('old pass is wrong');
        res.redirect('/get-change-pass');
      } else if (user_answer1 != encrypt(answer[0]) && user_answer2 != encrypt(answer[1])) {
        req.flash('err_msg', 'Your security answer is wrong.');
        // console.log('answer is wrong');
        res.redirect('/get-change-pass');
      } else if (password == newPassword) {
        req.flash('err_msg', 'Old password and new password can not be same.');
        // console.log('answer is wrong');
        res.redirect('/get-change-pass');
      } else {

        if (user_answer1 == encrypt(answer[0]) && user_answer2 == encrypt(answer[1])) {

          //   var newmykey = crypto.createCipher('aes-128-cbc', 'mypass');
          // var newmystr = newmykey.update(newPassword, 'utf8', 'hex')
          // newmystr += newmykey.final('hex');

          var newmystr = crypto.createHash('sha256').update(newPassword).digest('hex');

          // console.log("mystr",newmystr);success_msg
          req.flash('success_msg', '');
          req.flash('err_msg', '');

          res.render('front/validate_pin', {
            newmystr, session: req.session
          });
        } else {
          req.flash('err_msg', 'Your security answer is wrong.');
          // console.log('answer is wrong');
          res.redirect('/get-change-pass');
        }
      }
    })

  })

}
/**change-pass Post method End**/
/**validate-pin Post method Start**/
exports.validate_pin = (req, res, next) => {
  var user_id = req.session.user_id;
  // var user_id = 20;
  var newPass = req.body.password.trim();
  var pin1 = req.body.otp1.trim();
  var pin2 = req.body.otp2.trim();
  var pin3 = req.body.otp3.trim();
  var pin4 = req.body.otp4.trim();
  var pin_old = pin1 + "" + pin2 + "" + pin3 + "" + pin4;
  // console.log("pin",pin);
  var pin = encrypt(pin_old);

  var updateValues = {
    password: newPass
  }
  UserModel.findOne({ where: { reg_user_id: user_id } }).then(function (user) {
    if (user.user_pin != pin) {
      // console.log('pin is incorrect');
      res.render('front/validate_pin', { newmystr: newPass, err_msg: "Your pin is incorrect." });
    } else {
      UserModel.update(updateValues, { where: { reg_user_id: user_id } }).then((result) => {
        // console.log("updated result  ",result);
        res.render('front/success-message', { session: req.session });

      }).catch(err => {
        // console.log(err)
      })
    }
  })
}
/**validate-pin Post method End**/

/**get_change_email Get method Start**/
// exports.get_change_email = (req,res,next)=>{
//   success_msg = req.flash('success_msg');
//   err_msg = req.flash('err_msg');
//   var user_id = req.session.user_id;
//   // var user_id =20;


//             SecurityMasterModel.hasMany(UserSecurityModel, {foreignKey: 'question_id'})
//             UserSecurityModel.belongsTo(SecurityMasterModel, {foreignKey: 'question_id'})
//             UserSecurityModel.findAll({where:{reg_user_id:user_id},include: [SecurityMasterModel]}).then(function(users){
//                     // var question = user.tbl_security_question.dataValues.question;

//                     // for(var i=0;i<users.length;i++){
//                     // console.log(users[i].tbl_security_question.dataValues.question);}
//                                           res.render('front/email_change',{
//                                               success_msg,
//                                               err_msg,
//                                               users,
//                                               session:req.session
//                                           });


//                 })


// }
/**get_change_email Get method End**/

/**post_change_email Post method Start**/
// exports.post_change_email = (req,res,next)=>
// {
//     var user_id       = req.session.user_id;
//     var password      = req.body.password.trim(); 
//     var question_id   = req.body.question
//     var neewEmail     = req.body.neewEmail.trim(); 
//     var answer        = req.body.answer 
//     var user_answer1;
//     var user_answer2;

//     console.log("question_id",question_id);

//     console.log("answer",answer);


//     UserModel.findOne({ where:{reg_user_id:user_id} })
//     .then(function(user){
//         UserSecurityModel.findAll({ where:{reg_user_id:user_id} })
//         .then(function(questions){

//             for(var j=0;j<questions.length;j++){
//                 // console.log(questions[j].dataValues.secu_question_id);
//                 if(questions[j].dataValues.secu_question_id==question_id[0]){
//                     user_answer1 = questions[j].dataValues.answer;
//                 }
//                 if(questions[j].dataValues.secu_question_id==question_id[1]){
//                   user_answer2 = questions[j].dataValues.answer;
//               }
//             }

//             console.log("old Pass",user.password);
//             var mystr = crypto.createHash('sha256').update(password).digest('hex');

//             // var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
//             // var mystr = mykey.update(password, 'utf8', 'hex')
//             // mystr += mykey.final('hex');


//             // console.log("mystr",mystr);
//             console.log("user_answer1 user_answer2",user_answer1,user_answer2);

//             if(user.password!=mystr){
//                req.flash('err_msg','Your  password is wrong.');
//             // console.log('old pass is wrong');
//                 res.redirect('/change-email');
//             }else if(user_answer1!=encrypt(answer[0]) && user_answer2!=encrypt(answer[1]) ){
//                    req.flash('err_msg','Your security answer is wrong.');
//                 // console.log('answer is wrong');
//                 res.redirect('/change-email');
//             }else{

//               if(user_answer1==encrypt(answer[0]) && user_answer2== encrypt(answer[1]) ){

//                             //   var newmykey = crypto.createCipher('aes-128-cbc', 'mypass');
//                             // var newmystr = newmykey.update(newPassword, 'utf8', 'hex')
//                             // newmystr += newmykey.final('hex');

//                             var enc_email = encrypt(neewEmail)

//                           // console.log("mystr",newmystr);success_msg
//                           req.flash('success_msg','');
//                           req.flash('err_msg','');

//                               res.render('front/validate_pin_for_email',{
//                                 enc_email,session:req.session
//                               });
//                   }else{
//                     req.flash('err_msg','Your security answer is wrong.');
//                     // console.log('answer is wrong');
//                     res.redirect('/change-email ');
//                   }
//             }
//         })

//     })

// }
/**post_change_email Post method End**/

/**validate_pin_for_email Post method Start**/
exports.validate_pin_for_email = (req, res, next) => {
  var user_id = req.session.user_id;
  // var user_id = 20;
  var newEmail = req.body.email.trim();
  var pin1 = req.body.otp1.trim();
  var pin2 = req.body.otp2.trim();
  var pin3 = req.body.otp3.trim();
  var pin4 = req.body.otp4.trim();
  var pin_old = pin1 + "" + pin2 + "" + pin3 + "" + pin4;
  // console.log("pin",pin);
  var pin = encrypt(pin_old);

  var updateValues = {
    email: newEmail
  }
  UserModel.findOne({ where: { reg_user_id: user_id } }).then(function (user) {
    if (user.user_pin != pin) {
      // console.log('pin is incorrect');
      res.render('front/validate_pin_for_email', { enc_email: newEmail, err_msg: "Your pin is incorrect." });
    } else {
      UserModel.update(updateValues, { where: { reg_user_id: user_id } }).then((result) => {
        // console.log("updated result  ",result);
        res.render('front/success-message-email-change', { session: req.session });

      }).catch(err => {
        // console.log(err)
      })
    }
  })
}
/**validate_pin_for_email Post method End**/



/**get-change-pin Get method Start**/
// exports.getChangePin = (req,res,next) =>{
//     var err_msg= req.flash('err_msg');
//     var success_msg= req.flash('success_msg');
//     res.render('front/change-pin',{success_msg,err_msg,session:req.session});
// }
/**get-change-pin Get method End**/

/**post-change-pin Post method Start**/
// exports.postChangePin = (req,res,next)=>{
//         var user_id = req.session.user_id;
//      // var user_id = 20;

//     var pin1 = req.body.otp1.trim();
//     var pin2 = req.body.otp2.trim();
//     var pin3 = req.body.otp3.trim();
//     var pin4 = req.body.otp4.trim();
//     var pin_1 = pin1+""+pin2+""+pin3+""+pin4;

//     var pin = encrypt(pin_1)

//     var newpin1 = req.body.newotp1.trim();
//     var newpin2 = req.body.newotp2.trim();
//     var newpin3 = req.body.newotp3.trim();
//     var newpin4 = req.body.newotp4.trim();
//     var newpin_1 = newpin1+""+newpin2+""+newpin3+""+newpin4;

//     var newpin = encrypt(newpin_1)

//     var updateValues={
//         user_pin:newpin
//     }

//     UserModel.findOne({ where:{reg_user_id:user_id} }).then(function(user){
//         if(user.user_pin!= pin){
//             console.log('pin is incorrect');
//             req.flash('err_msg','Your pin is incorrect.');
//             res.redirect('/get-change-pin');
//         }else if(newpin==pin){
//             console.log('New pin and old pin can not be same.');
//             req.flash('err_msg','New pin and old pin can not be same.');
//             res.redirect('/get-change-pin');
//         }else{
//             UserModel.update(updateValues, { where: { reg_user_id: user_id } }).then((result) => 
//              {
//                 console.log("updated result  ",result);
//                 req.flash('success_msg','Pin updated successfully');
//                 res.redirect('/get-change-pin');

//              }).catch(err=>console.log(err))
//         }
//     })


// }
/**post-change-pin Post method End**/

/**changeUesrType Post  method Start**/
// exports.changeUserTypeSession = (req,res,next )=> {
// var type = req.body.usertype
//     req.session.user_type =type
//     // tbl_verfier_purchase_details.findOne({where:{reg_user_id:req.session.user_id,reflect_id:null}}).then(puchasedResult=>{
//     //   if(puchasedResult){
//     //     res.render('front/i_am_verfier-side-bar');    
//     //   }else{

//     //   }
//     if(type=="verifier"){
//       res.render('front/i_am_verfier-side-bar');
//     }else{
//       res.render('front/client-side-bar');
//     }

// }
/**changeUesrType Post Method End**/

/**creat-new-wallet Get Method  Start**/
exports.dashboardCreatNewWallet = (req, res, next) => {
  var err_msg = req.flash('err_msg');
  var success_msg = req.flash('success_msg');
  res.render('front/set-up-code',
    {
      success_msg,
      err_msg,
      session: req.session
    });
}
/**creat-new-wallet Get Method End**/

/**client Get Method  Start**/
exports.dashboardCilent = (req, res, next) => {
  var err_msg = req.flash('err_msg');
  var success_msg = req.flash('success_msg');
  req.session.user_type = "client"

  res.render('front/wallet/create-wallet',
    {
      success_msg,
      err_msg,
      session: req.session
    });
}
/**client Get Method End**/

/**verifier Get Method Start**/
exports.dashboardverifier = async (req, res, next) => {
  var err_msg = req.flash('err_msg');
  var success_msg = req.flash('success_msg');
  req.session.user_type = "verifier";

  await tbl_plan_features.findAll({ where: { deleted: "0" } }).then(async (featureNmaeData) => {
    await tbl_plan_feature_rel.findAll({}).then(async (plan_rel_data) => {
      await tbl_verifier_plan_master.findAll({ where: { deleted: "0" } }).then(async (resultPlan) => {
        await tbl_verfier_purchase_details.findOne({ where: { reg_user_id: req.session.user_id, reflect_id: null } }).then(puchasedResult => {
          if (puchasedResult) {
            res.redirect("/myreflect-creat-wallet")
          } else {
            res.render('front/choose-plan',
              {
                success_msg,
                err_msg,
                resultPlan,
                plan_rel_data,
                featureNmaeData,
                session: req.session
              });
          }

        })

      }).catch(err => console.log(err))
    }).catch(err => console.log("errrr", err))
  })



}
/**verifier Get Method End**/

/**profile get Method start**/
// exports.showUserProfile = (req,res,next)=>{


//   var user_id=req.session.user_id;

//   if(user_id)
//   {

//     db.query(' SELECT * FROM `tbl_countries` WHERE status="active" ORDER BY `country_id` ASC',{type:db.  QueryTypes.SELECT})
//     .then(countryData=>{

//         db.query('SELECT * FROM `tbl_country_codes` ORDER BY `iso` ASC',{type:db.QueryTypes.SELECT})
//         .then(countryCode1=>{



//       UserModel.findOne({ where:{reg_user_id:user_id} }).then(function(user){
//         console.log('user.country_code_id : ',user.country_code_id)
//    db.query('SELECT * FROM tbl_country_codes where country_code_id='+user.country_code_id,{type:db.QueryTypes.SELECT}).then(countryCode=>{
//                             console.log('user.country_code_id : ',countryCode)

//          res.render('front/myprofile',{
//             success_msg,
//             err_msg,
//             user,
//             text_func,decrypt,
//             session:req.session,countryCode
//             ,countryData,
//             countryCode1:countryCode1
//         });

//       });
//    });
//   })
// })



//   }
//   else
//   {


//     res.redirect('/login');

//   }

//   // console.log("session");
//   // console.log(req.session.user_id);


// }
/**profile get Method End**/

/**edit-profile Post Method start**/
// exports.updateProfile = (req,res,next)=>{

//   var user_id=req.session.user_id;
//   var full_name= encrypt(req.body.full_name);
//     var last_name= encrypt(req.body.last_name);

//   var birthplace= encrypt(req.body.birthplace);
//   var dob= encrypt(req.body.dob);
//   var user_pic=req.body.text_img_name;


//   //console.log('user_pic'+user_pic);

//   if(user_id)
//   {

//     if(user_pic)
//     {
//        var updateValues={
//         full_name:full_name,
//         last_name:last_name,
//         birthplace:birthplace,
//         dob:dob,
//         profile_pic:user_pic
//       }

//     }
//     else
//     {
//       var updateValues={
//         full_name:full_name,
//         birthplace:birthplace,
//         dob:dob

//       }

//     }



//       UserModel.update(updateValues, { where: { reg_user_id: user_id } }).then((result) => 
//              {
//                 req.flash('success_msg','Profile updated successfully');
//                 res.redirect('/profile');

//              }).catch(err=>console.log('err',err))

//   }
//   else
//   {
//     res.redirect('/login');
//   }

//   //console.log("user_id"+user_id+"full_name"+full_name+"birthplace"+birthplace+"dob"+dob);

// }
/**edit-profile Post Method End**/

// send otp for mobile number chnage post method start

// exports.sendOtpForMobileNumberChange = (req ,res , next) => {

//   let user_id   =   req.session.user_id

//   var otp = generateOTP()
//   var enc_otp = encrypt(otp);


//     function generateOTP() { 

//         // Declare a digits variable  
//         // which stores all digits 
//         var digits = '0123456789'; 
//         let OTP = ''; 
//         for (let i = 0; i < 4; i++ ) { 
//             OTP += digits[Math.floor(Math.random() * 10)]; 
//         } 
//         return OTP; 
//      } 

//   UserModel.findOne( { where :{ reg_user_id :user_id } } )
//   .then( data => {
//    let email = decrypt(data.email)

//       UserModel.update({otp : enc_otp }, { where :{ reg_user_id :user_id } } )
//       .then(newdata => {
//             var smtpTransport = nodemailer.createTransport({
//               service: 'gmail',
//               auth: {
//                 user: MAIL_SEND_ID,
//                 pass: PASS_OF_MAIL 
//               }
//             });
//             const mailOptions = {
//               to           :  email,
//               from         : 'questtestmail@gmail.com',
//               subject      : "MyReflet OTP for Mobile Number Update.",

//               html: `<!DOCTYPE html>
//               <html>
//                 <head>
//                   <title>My Reflet</title>
//                   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//                   <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
//                   <style>
//                   @media only screen and (max-width: 600px) {
//                   .inner-body {
//                   width: 100% !important;
//                   }
//                   .footer {
//                   width: 100% !important;
//                   }
//                   }
//                   @media only screen and (max-width: 500px) {
//                   .button {
//                   width: 100% !important;
//                   }
//                   }
//                   </style> 
//                 </head>
//                 <body>
//                   <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
//                     <div style="background-color: #88beda;padding: 10px 30px 5px;">
//                       <img src="https://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
//                     </div>
//                     <div style="padding: 30px;line-height: 32px; text-align: justify;">
//                       <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(data.full_name)}</h4>
//                       <p>Your OTP for mobile number update is ${otp}</p>
//                       <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
//                       <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>


//                     </div>
//                     <div style="background-color:  #88beda; color: #fff; padding: 20px 30px;">
//                       &copy; Copyright 2020 - My Reflet. All rights reserved.
//                       </div>
//                   </div>
//                 </body>
//               </html>  
//               `
//             };
//             smtpTransport.sendMail(mailOptions, function (err) {

//             });
//             res.send({type:"success"})
//       })
//       .catch(err=> {

//         console.log(err)
//         res.send({type:"faile"})

//       })



//   })
//   .catch(err=> {

//     console.log(err)
//     res.send({type:"faile"})

//   })



// }

//send otp for mobile number chnage post method end

/**check_otp_for_phone_numberr start */
// exports.check_otp_for_phone_number = (req,res,next) =>{

//   let user_id   =   req.session.user_id
//   let otp       =   req.body.otp

//   UserModel.findOne( { where :{ reg_user_id :user_id } } )
//   .then(userdata => {

//     if ( userdata.otp == encrypt(otp)) {

//       res.send({type:"success"})

//     } else {

//       res.send({type:"faile"})

//     }

//   })
//   .catch(err=> {

//     console.log(err)
//     res.send({type:"faile"})

//   })
// }
/**check_otp_for_phone_number end */

/**update mobile number start */
// exports.updateMobileNumber = (req,res,next) =>{

//   let user_id            =   req.session.user_id
//   let country_code       =   req.body.country_code_select
//   let mobile             =    encrypt(req.body.mobile)
//   console.log("country code############### ",country_code)
//   db.query('SELECT * FROM tbl_country_codes where phonecode='+country_code,{type:db.QueryTypes.SELECT}).then(countryData=>{



//         UserModel.update( { country_code_id : countryData.country_code_id , mobile_number : mobile }, { where :{ reg_user_id :user_id } } )
//         .then(userdata => {


//             res.redirect("/profile")


//         })
//         .catch(err=> {

//           console.log(err)
//           res.redirect("/profile")

//         })
//    })
// }
/**update mobile number end */
/**otp_veri_aft_login get Method Start**/
exports.otpAfterLogin = async (req, res, next) => {

  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');

  var user_reg_id = req.body.user_id;
  let ip = req.body.ip

  function toTimestamp(strDate) {
    var datum = Date.parse(strDate);
    return datum / 1000;
  }

  // var currentTimestamp =parseInt(toTimestamp(new Date())) 

  var otp = encrypt(generateOTP())

  // console.log("session@@@@@@@@@@@@@@@@@@@@@@@@@ ",session)

  function generateOTP() {

    // Declare a digits variable  
    // which stores all digits 
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }
  //  var ip;
  //  if (req.headers['x-forwarded-for']) {
  //      ip = req.headers['x-forwarded-for'].split(",")[0];
  //  } else if (req.connection && req.connection.remoteAddress) {
  //      ip = req.connection.remoteAddress;
  //  } else {
  //      ip = req.ip;
  //  }
  //  var ip55 =ip.split(":")



  console.log("client IP is *********************" + ip);

  var now = new Date();
  now.setMinutes(now.getMinutes() + 05); // timestamp
  now = new Date(now); // Date object
  var otp_expire = now


  await tbl_log_manage.findOne({ where: { reg_user_id: user_reg_id, ip_address: ip, deleted: "0" } }).then(async (result) => {
    console.log("check for opt and set pin", result)
    UserModel.findOne({ where: { reg_user_id: user_reg_id, deleted: "0", status: "active" } }).then(async (userlogindata) => {

      console.log("userlogindata@@@@@@@@@@@@@@@@@@@@@@@@@", userlogindata)
      console.log("user_reg_id@@@@@@@@@@@@@@@@@@@@@@@@@", user_reg_id)


      if (!result) {

        await UserModel.update({ otp: otp, otp_expire: otp_expire }, { where: { reg_user_id: user_reg_id, deleted: "0", status: "active" } }).then(async (updateOtp) => {
          var smtpTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: MAIL_SEND_ID,
              pass: PASS_OF_MAIL
            }
          });
          const mailOptions = {
            to: decrypt(userlogindata.email),
            from: 'questtestmail@gmail.com',
            subject: "MyReflet OTP for registration.",

            html: `<!DOCTYPE html>
                    <html>
                      <head>
                        <title>My Reflet</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                         <style>
                        @media only screen and (max-width: 600px) {
                        .inner-body {
                        width: 100% !important;
                        }
                        .footer {
                        width: 100% !important;
                        }
                        }
                        @media only screen and (max-width: 500px) {
                        .button {
                        width: 100% !important;
                        }
                        }
                        </style> 
                      </head>
                      <body>
                        <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
                          <div style="background-color: #88beda;padding: 10px 30px 5px;">
                            <img src="https://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
                          </div>
                          <div style="padding: 30px;line-height: 32px; text-align: justify;">
                            <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(userlogindata.full_name)}</h4>
                            <p>Your OTP for MyReflet registration is ${decrypt(otp)}</p>
                            <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                            <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                    
                           
                          </div>
                           <div style="background-color:  #88beda; color: #fff; padding: 20px 30px;">
                             &copy; Copyright 2020 - My Reflet. All rights reserved.
                            </div>
                        </div>
                      </body>
                    </html>  
                    `
          };
          smtpTransport.sendMail(mailOptions, function (err) {

          });


          // res.redirect(`/get-otp_veri_aft_login?userid=${user_reg_id}`)
          let token = await generateAccessToken({ user_id: user_reg_id })

          res.json({
            status: 1, msg: "success", data: {
              otp_screen: 1,
              user_id: user_reg_id,
              token,
              success_msg: "OTP has been sent your email , Pleasse check"
            }
          });


        })


      } else {
        // res.redirect(`/set_pin_aft_lgn/?userid=${user_reg_id}`)
        let token = await generateAccessToken({ user_id: user_reg_id })

        res.json({
          status: 1, msg: "success", data: {
            otp_screen: 0,
            token,
            user_id: user_reg_id
          }
        });
      }


    }).catch(err => {
      console.log("err", err)
      res.json({ status: 0, msg: "failed", data: { err_msg: 'something went wrong', error: err } });

    })

  })


}
/**otp_veri_aft_login get Method End**/

/**get-otp_veri_aft_login Get method Start**/
// exports.otpVerificationAfterLogin = (req,res,next )=> {
//   success_msg = req.flash('success_msg');
//   err_msg = req.flash('err_msg');
//   res.render('front/otp-verify-after-login',{
//     success_msg,
//     err_msg
// });


// }
/**get-otp_veri_aft_login  Get method End**/

/**submit-otp-of-login Post method Start**/
exports.submitOtpAfterLogin = (req, res, next) => {

  var userid = req.body.user_id
  console.log("user id id ...", req.body)
  // console.log("user id id ...",req.session)


  var otp1 = req.body.otp1
  var otp2 = req.body.otp2
  var otp3 = req.body.otp3
  var otp4 = req.body.otp4
  // var userid=base64decode(req.body.user_id);
  var otp_new = req.body.otp;
  var otp = encrypt(otp_new)
  console.log("user id......   ", userid)
  console.log("otp ........   ", otp)
  function toTimestamp(strDate) {
    var datum = Date.parse(strDate);
    return datum / 1000;
  }

  UserModel.findOne({ where: { reg_user_id: userid, deleted: "0", status: "active" } }).then(async (userdata) => {
    //  console.log("userdata.otp_exp...",userdata)

    var timstampFormDb = parseInt(toTimestamp(userdata.otp_expire))
    var currentTimestamp = parseInt(toTimestamp(new Date()))
    // console.log("userdata.otp_exp...",timstampFormDb)
    // console.log("old time1...",currentTimestamp)
    //    console.log("old time1...",toTimestamp(userdata.otp_expire))
    //    console.log("old time2...",toTimestamp(new Date(userdata.otp_expire)))
    //    console.log("old time2...",toTimestamp(new Date(userdata.otp_expire)))
    //    console.log("new time1...",toTimestamp(new Date()))

    if (userdata) {
      var user_otp = userdata.otp

      console.log("user_db_otp : ", user_otp)

      console.log("user_put_otp : ", otp)

      if (user_otp == otp && timstampFormDb >= currentTimestamp) {

        //    var steps=parseInt("2")
        //  await  UserModel.update({complete_steps:steps,email_verification_status:"yes"}, { where: { reg_user_id:userid }}).then((result) =>{
        UserModel.update({ wrong_otp_count: "0" }, { where: { reg_user_id: userid, deleted: "0", status: "active" } })
          .then(async data => {
            // res.redirect(`/set_pin_aft_lgn/?userid=${userid}`)
            let token = await generateAccessToken({ user_id: userid})

            res.json({
              status: 1, msg: "success", data: {
                user_id: userid
              }
            });

          }).catch(err => {
            console.log("erros 121", err)
            res.json({ status: 0, msg: "failed", data: { err_msg: 'something went wrong', error: err } });


          })




        //  }).catch(err=>console.log("otp step err",err))
      }
      else {

        if (parseInt(userdata.wrong_otp_count) > 9) {

          // req.flash('err_msg', 'You have tried so many invalid attempts, please try again to log in.')
          res.json({ status: 0, msg: "failed", data: { err_msg: 'You have tried so many invalid attempts, please try again to log in.' } });

          // res.redirect(`/login`)

        } else {
          wrong_otp_count = parseInt(userdata.wrong_otp_count) + 1
          UserModel.update({ wrong_otp_count }, { where: { reg_user_id: userid, deleted: "0", status: "active" } }).then(data => {
            err_msg = 'You entered wrong OTP.'
            // res.render('front/otp-for-verify',{
            //                                     err_msg,
            //                                     userid:userid,

            //                                 });
            // req.flash('err_msg', 'You entered wrong OTP.')
            // res.redirect(`/get-otp_veri_aft_login?userid=${userid}`)
            res.json({ status: 0, msg: "failed", data: { err_msg: 'You entered wrong OTP.' } });

          }).catch(err => {
            console.log(err)
            //  redirect("/login")
            res.json({ status: 0, msg: "failed", data: { err_msg: 'something went wrong', error: err } });


          })
        }



      }

    } else {
      //  req.flash('err_msg', 'Record not found.')
      //  res.redirect("/signup")
      res.json({ status: 0, msg: "failed", data: { err_msg: 'Record not found.' } });

    }
  }).catch(err => {
    console.log(err)
    //  redirect("/login")
    res.json({ status: 0, msg: "failed", data: { err_msg: 'something went wrong', error: err } });


  })
}
/**submit-otp-of-login Post method End**/

/**get-set_pin_aft_lgn Get method Start**/
// exports.setPinAfterLoginGet = (req,res,next )=> {
//   success_msg = req.flash('success_msg');
//   err_msg = req.flash('err_msg');
//          res.render('front/set-a-pin-after-login',{
//           success_msg,
//           err_msg,
//           });

// }
/**get-set_pin_aft_lgn Get method End**/
//console.log("pinnnnnnnnnn:",encrypt1('1234'))

  /** set_pin_aft_lgn_submit Get method Start**/
exports.submitSetPinAfterLogin = async (req, res, next) => {
  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
  var userid = req.body.user_id
  var userID = parseInt(req.body.user_id);
  var ip=req.body.ip;
  var registration_notification_Token=req.body.token;
  console.log(".userid...submit pin......", userid, "userID", userID)

  //let registration_notification_Token = req.body.token;
  var steps=parseInt("4")


  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');
 //client side work
//  let email="navee@gmail.com";
//   let server_salt='bVfTreXHNQbGr9hdamkPulbL5oHdnwWnmG4baMPh+B2HT1y/24LYsrkjy29LnKLLfymgpFLdFXmD/jLZDuluoBlxyO5GshAoARrpITUAb8e+OA4pautnzF02xYt2Qj2kuzBILecibmLKyXNAk6+SU+zNXGbA6MUSeZ3H2OtiW+4=';          
//   let latest_pin=pin+email+server_salt;
//   let h_pin=Buffer.from(latest_pin, 'base64').toString('ascii');
 // let hashPin=crypto.createHash('sha512').update(pin).digest('hex');
   //console.log("Pin:::::::",pin);
              

  UserModel.findOne({ where: { reg_user_id: userID, deleted: "0", status: "active" } }).then(async (result) => {

    console.log("check pin***********", result.user_pin);
    try{
      var pin=decrypt1(req.body.pin);
    
      // var h_password=Buffer.from(pin, 'base64').toString('ascii');
      // pin=crypto.createHash('sha512').update(h_password).digest('hex');
      var hashPin=encrypt(pin);
    }catch(err){
      console.log("errrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      var wrong_otp_count = parseInt(result.wrong_otp_count) + 1
      res.json({ status: 0, msg: "Invalid pin", data: { err_msg: 'Failed', err: err } });
    }
     
    let encPin=result.user_pin;
    console.log("storeddddddddddddddddddddddddddd pin***********", encPin);
    if (encPin!==hashPin) {

      if (parseInt(result.wrong_otp_count) >= 5) {

        // req.flash('err_msg', 'You have tried so many invalid attempts, please contact to admin.')
        // res.redirect("/login")
        res.json({ status: 0, msg: "You have tried so many invalid attempts, please contact to admin.' ", data: { err_msg:'Failed' } });


      } else {
        wrong_otp_count = parseInt(result.wrong_otp_count) + 1
        console.log(" wrong_otp_count :  ", wrong_otp_count)
        // var count_data = {
        //   wrong_otp_count:wrong_otp_count
        // }


        await UserModel.update({ wrong_otp_count: wrong_otp_count }, { where: { reg_user_id: userid, deleted: "0", status: "active" } })
          .then(async (result) => {

            console.log(" donedone :  ", wrong_otp_count)

            // req.flash('err_msg', 'You entered wrong OTP.')
            // res.redirect(`/set_pin_aft_lgn/?userid=${userID}`)

            res.json({ status: 0, msg: "You entered wrong PIN.", data: { err_msg: 'Failed', user_id: userID } });

          }).catch(err => {
            console.log(err)
            // res.redirect("/login")
            res.json({ status: 0, msg: "Something went wrong", data: { err_msg: 'Failed', err: err } });

          })
      }
      // req.flash('err_msg', 'You entered wrong pin.')

      // res.redirect(`/set_pin_aft_lgn/?userid=${userID}`)
    } else {



      await UserModel.update({ wrong_otp_count: "0" }, { where: { reg_user_id: userid, deleted: "0", status: "active" } })
        .then(async (result) => {


          // console.log(" datadatadatadatadata : ",data)

          // req.flash('err_msg', 'You entered wrong OTP.')
          // res.redirect(`/set_pin_aft_lgn/?userid=${userID}`)

          await tbl_log_manage.create({
            reg_user_id: userid,
            login_time: new Date(),
            ip_address: ip
          }).then(async (dataresult) => {

            // const accessToken = generateAccessToken({
            //   "user": ip
            // });
         //  req.session.token = accessToken
            // res.cookie("jwt", accessToken, {secure: true, httpOnly: true})

            if (req.session.user_type == "validatore") {
              req.session.is_user_logged_in = true;

              // res.redirect(`/validatore_dashboard`);

              //  res.json({status:0,msg:"failed",data:{err_msg:'Somthing went wrong',err : err}});

            } else {

            let user_token_exist  =   await tbl_notification_registration_tokens.findOne({where :{reg_user_id :userID}})

            if (user_token_exist != null) {

              await tbl_notification_registration_tokens.update({
                registrationToken : registration_notification_Token,
                reg_user_id:userID,
                
              } ,{where :{ reg_user_id:userID}}).then(data12 => {}).catch(err => console.log("err", err))
            } else {


              await tbl_notification_registration_tokens.create({
                registrationToken : registration_notification_Token,
                reg_user_id:userID,
                
              }).then(data12 => {}).catch(err => console.log("err", err))

            }
            
              req.session.is_user_logged_in = true;
              // res.redirect(`/dashboard`);
              let token = await generateAccessToken({user_id: userID})

              res.json({ status: 1, msg: "success", data: { user_id: userID} });

            }

          }).catch(err => console.log("err", err))
        }).catch(err => {
          console.log("error from app.....................:",err);
          // res.redirect("/login")
          res.json({ status: 0, msg: "Something went wrong", data: { err_msg: 'Failed', err: err } });

        })

    }


  }).catch(err => {
    console.log(err)
    // res.redirect("/login")
    res.json({ status: 0, msg: "Something went wrong", data: { err_msg: 'Failed', err: err } });

  })

}
/** set_pin_aft_lgn_submit Get method End**/

/** contact-us Post method End**/
exports.contact_us = (req, res, next) => {
  var name = req.body.name
  var email = req.body.email
  var msg = req.body.msg
  console.log("name", name)
  console.log("email", email)
  console.log("msg", msg)
  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');
  var smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: MAIL_SEND_ID,
      pass: PASS_OF_MAIL
    }
  });
  const mailOptions = {
    to: email,
    from: 'questtestmail@gmail.com',
    subject: "MyReflet.",

    html: `<!DOCTYPE html>
      <html>
        <head>
          <title>My Reflet</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
           <style>
          @media only screen and (max-width: 600px) {
          .inner-body {
          width: 100% !important;
          }
          .footer {
          width: 100% !important;
          }
          }
          @media only screen and (max-width: 500px) {
          .button {
          width: 100% !important;
          }
          }
          </style> 
        </head>
        <body>
          <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
            <div style="background-color: #88beda;padding: 10px 30px 5px;">
              <img src="https://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
            </div>
            <div style="padding: 30px;line-height: 32px; text-align: justify;">
              <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${name}</h4>
              <p>We got your contact information successfully .We will contact you as soon as possible. </p>
              <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
              <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
      
             
            </div>
             <div style="background-color:  #88beda; color: #fff; padding: 20px 30px;">
               &copy; Copyright 2020 - My Reflet. All rights reserved.
              </div>
          </div>
        </body>
      </html>  
      `
  };
  smtpTransport.sendMail(mailOptions, function (err) {

  });
  ContectUsModel.create({
    co_name: name,
    co_email: email,
    co_msg: msg,
    createdAt: formatted
  })
    .then(data => res.send(data))
    .catch(err => console.log("errr", err))
};
/** contact-us Post method End**/

/** subscribe Post method Start**/
exports.subscribe = (req, res, next) => {

  var email = (req.body.email).trim()


  console.log("email", email)


  var smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: MAIL_SEND_ID,
      pass: PASS_OF_MAIL
    }
  });
  const mailOptions = {
    to: email,
    from: 'questtestmail@gmail.com',
    subject: "MyReflet.",

    html: `<!DOCTYPE html>
    <html>
      <head>
        <title>My Reflet</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
         <style>
        @media only screen and (max-width: 600px) {
        .inner-body {
        width: 100% !important;
        }
        .footer {
        width: 100% !important;
        }
        }
        @media only screen and (max-width: 500px) {
        .button {
        width: 100% !important;
        }
        }
        </style> 
      </head>
      <body>
        <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
          <div style="background-color: #88beda;padding: 10px 30px 5px;">
            <img src="https://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
          </div>
          <div style="padding: 30px;line-height: 32px; text-align: justify;">
            <h4 style="font-size: 20px; margin-bottom: 0;">Hello</h4>
            <p>you have subscribed my reflect successfully.We will give you update soon. </p>
            <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
            <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
    
           
          </div>
           <div style="background-color:  #88beda; color: #fff; padding: 20px 30px;">
             &copy; Copyright 2020 - My Reflet. All rights reserved.
            </div>
        </div>
      </body>
    </html>  
    `
  };
  smtpTransport.sendMail(mailOptions, function (err) {

  });
  SubscriberModel.findOne({ where: { deleted: "0", subscriber_status: "active", subscriber_email: email } }).then(subcribedata => {

    if (!subcribedata) {

      SubscriberModel.create({
        subscriber_email: email,

      })
        // .then(data=>res.send("You have subscribe My Reflect successfilly."))
        .then(data => res.send("1"))
        .catch(err => console.log("err1r", err))
    } else {
      //  res.send("Already,You are My Reflect subscriber.")
      res.send("2")
    }
  }).catch(err => console.log("errr2", err))
};
/** subscribe Post method End**/

/**select-country-code Post method Start**/
exports.select_country_code_check = (req, res, next) => {
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
  var country = req.body.country;

  var iso, country_code_id, phonecode;
  console.log(" countries : ", country)

  db.query('SELECT * FROM `tbl_country_codes`  ORDER BY `iso` ASC', { type: db.QueryTypes.SELECT }).then(countryCode => {
    countryCode.forEach(codes => {
      // console.log(codes.name)
      if (codes.name == country) {
        phonecode = codes.phonecode
        country_code_id = codes.country_code_id
        iso = codes.iso
      }
    })
    console.log(iso, country_code_id, phonecode)
    res.render('front/register_filter', {
      countryCode, iso, country_code_id, phonecode, selected_country: country
    });
  })
}
/**select-country-code Post method Start**/

/**cookies_handler_encript Post method Start**/
exports.cookies_handler_encript = (req, res, next) => {

  var otp1 = encrypt(req.body.otp1)
  var otp2 = encrypt(req.body.otp2)
  var otp3 = encrypt(req.body.otp3)
  var otp4 = encrypt(req.body.otp4)

  res.send({
    otp1,
    otp2,
    otp3,
    otp4
  })
}
/***cookies_handler_encript Post method Start**/

/**cookies_handler_decript Post method Start**/
exports.cookies_handler_decript = (req, res, next) => {

  var otp1 = decrypt(req.body.otp1)
  var otp2 = decrypt(req.body.otp2)
  var otp3 = decrypt(req.body.otp3)
  var otp4 = decrypt(req.body.otp4)

  res.send({
    otp1,
    otp2,
    otp3,
    otp4
  })
}
/**cookies_handler_decript Post method Start**/

// ********************************************************************************BTC import*****************************************************

/**import-btc-wallet-address Get MEthod Start **/
exports.import_btc_wallet_address = (req, res, next) => {

  var private_key = req.body.private_key.trim();
  var user_id = req.body.user_id;
  console.log("private_key : ", private_key)
  // var private_key = req.body.private_key;
  console.log("(((((((((((((((((((((",req.body)
  console.log('************************'+"hey"+'**********************',typeof(private_key),"*****************************");
  var privkey = private_key.split(" ");
  console.log('------------------------',privkey[0],"----------------------------------");
  console.log('/////------------------------',typeof(privkey[0]),"----------------------------------");
  var pk= private_key.trim();
  console.log('gshdjds------------------------',typeof(pk),"----------------------------------");
 
 //const ecPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privkey[0], 'hex'), { network: bitcoin.networks.testnet })
 try{

  const ecPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privkey[0], 'hex'), { network: MAINNET })
  var pkey = ecPair.toWIF();
   //const keyPair = bitcoin.ECPair.fromWIF(pkey,TESTNET);
   const keyPair = bitcoin.ECPair.fromWIF(pkey,MAINNET);
   // var user_id = req.session.user_id;
   //const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey ,network: TESTNET});
   const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey ,network: MAINNET});
    console.log("keypair:::",keyPair)
    const pubkey = keyPair.publicKey.toString("hex");
    console.log("address : ", address)
    console.log("pubkey : ", pubkey)

 }catch(err){

   console.log("tttttttttttt",err)

  res.json({ status: 0, msg: "failed", data: { err_msg: 'Private key is wrong' } });

 }
 


  // const keyPair = bitcoin.ECPair.fromWIF(private_key);



  // const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
  // const pubkey = keyPair.publicKey.toString("hex");
  // var address = private_key.getAddress();
  // const { address } = bitcoin.payments.p2pkh({ pubkey: new Buffer(pubKey, 'hex') });




  // console.log("address : ", address)
  // console.log("pubkey : ", pubkey)


  db.query("SELECT * FROM `tbl_wallet_reflectid_rels` inner join tbl_user_registrations on tbl_user_registrations.reg_user_id = tbl_wallet_reflectid_rels.reg_user_id WHERE user_as = 'client' and  tbl_wallet_reflectid_rels.reg_user_id = " + user_id +" AND rep_btc_address IS NULL", { type: db.QueryTypes.SELECT }).then(function (allClientReflet) {

    WalletModel.findOne({ where: { wallet_address: address, reg_user_id: user_id } }).then(async result => {
      console.log(result)
      if (!result) {

        let token = await generateAccessToken({user_id: user_id})

        res.json({ status: 1, msg: "success", data: { wallet_address: address, allClientReflet, pubkey, user_id,token } });

        // res.render('front/wallet/import-btc-wallet-address', { session: req.session, wallet_address: address, allClientReflet, pubkey });

      } else {

        // req.flash('err_msg', 'This  Wallet address is already imported');
        // res.redirect('/import-btc-wallet');
        res.json({ status: 0, msg: "failed", data: { err_msg: 'This  Wallet address is already imported' } });

      }
    })
  })
}
/** import-btc-wallet-address Get MEthod End **/

/**submit-create-btc-wallet Post MEthod Start **/
exports.submit_import_btc_wallet_address = (req, res, next) => {

  var user_id = req.body.user_id;
  const wallet_address = req.body.wallet_address.trim();
  const { pubkey, reflect_code } = req.body

  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');

  console.log("wallet_address : ", wallet_address)

  console.log("reflect_id : ", reflect_code)
  console.log("pubkey : ", pubkey)

  WalletModel.create({ wallet_address: wallet_address, reg_user_id: user_id, public_key: pubkey })
    .then(result => {
      var updateValues =
      {
        btc_wallet_id: result.wallet_id,
        rep_btc_address: wallet_address
      }
      MyReflectIdModel.update(updateValues, { where: { reflect_code: reflect_code } }).then((resultwallet) => {

        console.log("wallet reflect_id : ", result.reflect_id);

        WalletModelImport.create({ wallet_id: result.wallet_id, reg_user_id: user_id, wallet_type: 'BTC', createdAt: formatted })
          .then(async result => {
            // console.log("wallet : ", result);
            // res.render('front/wallet/successfully-wallet-msg', { session: req.session, wallet_id: 1 })
            let token = await generateAccessToken({user_id: user_id})

            res.json({ status: 1, msg: "success", data: { wallet_address: address, allClientReflet, pubkey, user_id, wallet_id: result.wallet_id ,token} });

          })
      })
    })
    .catch(err => {
      console.log(err)
      res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong.' } });

    })
}
/**submit-create-btc-wallet Post MEthod End **/




exports.documents = async (req, res, next) => {

  const user_id = req.body.user_id
  console.log("Userid:",user_id)
  const reflect_id = req.body.reflect_id
  console.log("reflect_id:",reflect_id)
  const certified = [];
  var doc_data_array = []


  console.log("1st  console___________________________________________________________________________________________")


  await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels  ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id where NOT tbl_client_verification_requests.request_status='pending' and tbl_client_verification_requests.deleted='0' and tbl_client_verification_requests.client_id=" + user_id + " AND tbl_client_verification_requests.reflect_id=" + reflect_id, { type: db.QueryTypes.SELECT }).then(async certified_data => {
    console.log("certified_data 2...............................................",certified_data);
    if (certified_data.length > 0) {
      for (var b = 0; b < certified_data.length; b++) {

        await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id=" + certified_data[b].request_id + " and tbl_request_documents_files.docfile_status<>'pending' GROUP BY tbl_request_documents_files.request_doc_id", { type: db.QueryTypes.SELECT }).then(async certified_doc_data => {


          // console.log("certified_doc_data eldse ",certified_doc_data);


          certified.push({ certified_data: certified_data, certified_doc_data: certified_doc_data });

          // console.log(" certifiedcertifiedcertifiedcertifiedcertifiedcertifiedcertified : ",certified)


        })
      }
    } else {

        let token = await generateAccessToken({success_msg :"No data found."})

      res.json({ status: 1, msg: "success", data: {success_msg :"No data found."},token});


    }
  }).catch(err => {

    res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong.' } });

  })


  if (certified.length > 0) {
    console.log("1")


    var l = 0;

    for (var k = 0; k < certified.length; k++) {

      if (certified[k].certified_doc_data.length > 0) {
        console.log("2")


        for (var i = 0; i < certified[k].certified_doc_data.length; i++) {
          console.log("3")


          let doc_name, reflect_code, reflect_name, request_code, transaction_hash, status, reason;

          let doc_data_obj = {}
          if (typeof certified[k].certified_doc_data[i].doc_name != 'undefined') {
            console.log("4")


            doc_name = certified[k].certified_doc_data[i].doc_name
            doc_data_obj['doc_name'] = doc_name

          }
                            doc_data_obj['all_detail'] = certified[k].certified_doc_data[i]


          for (var g = 0; g < certified[k].certified_data.length; g++) {

            if (certified[k].certified_data[g].request_id == certified[k].certified_doc_data[i].request_id) {
              console.log("5")


              if (certified[k].certified_data[g].reflectid_by == "representative") {
                console.log("6")


                reflect_code = certified[k].certified_data[g].reflect_code
                reflect_name = certified[k].certified_data[g].rep_username

                doc_data_obj['reflect_code'] = reflect_code
                doc_data_obj['reflect_name'] = reflect_name

              } else {
                console.log("7")


                reflect_code = certified[k].certified_data[g].reflect_code
                reflect_name = certified[k].certified_data[g].entity_company_name

                doc_data_obj['reflect_code'] = reflect_code
                doc_data_obj['reflect_name'] = reflect_name

              }
              console.log("8")


              request_code = certified[k].certified_data[g].request_code

              doc_data_obj['request_code'] = request_code



            }

          }

          transaction_hash = typeof certified[k].certified_doc_data[i].transaction_hash !== 'undefined' ? certified[k].certified_doc_data[i].transaction_hash : ''

          doc_data_obj['transaction_hash'] = transaction_hash
          console.log("10")


          if (certified[k].certified_doc_data[i].docfile_status == "accept") {
            console.log("11")


            status = "Accepted"

          } else {

            status = "Rejected"

          }

          doc_data_obj['status'] = status

          reason = typeof certified[k].certified_doc_data[i].reason !== 'undefined' ? certified[k].certified_doc_data[i].reason : ''

          doc_data_obj['reason'] = reason

          doc_data_obj['obj_for_doc_data'] = {
            "l": l,
            "doc_name": certified[k].certified_doc_data[i].doc_name,
            "transaction_hash": certified[k].certified_doc_data[i].transaction_hash,
            "i": i

          }
          console.log("12")



          doc_data_array.push(doc_data_obj)
          // ('<%=l%>','<%=certified[k].certified_doc_data[i].doc_name%>','<%=certified[k].certified_doc_data[i].transaction_hash%>','<%=i%>')


        }

        l++;

      }
    }

  } else {

    doc_data_array = []
  }




  console.log("doc_data_array", doc_data_array)

  const doc_array1 = await doc_data_array.map(async doc_data_array_obj => {

    let whole_data1 = await db
      .query(
        "SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%" +
        doc_data_array_obj.obj_for_doc_data.transaction_hash +
        "%' AND tbl_client_verification_requests.client_id=" +
        user_id +
        " LIMIT 1",
        { type: db.QueryTypes.SELECT }
      )
      .then(async (hash_data_old) => {
        console.log("hash_data_old --------------- ", hash_data_old);


        // const delay = (duration) =>
        //   new Promise((resolve) => setTimeout(resolve, duration));

        var hash = hash_data_old[0].transaction_hash;
        var created_at = hash_data_old[0].createdAt;

        const datat321 = await waitForReceipt_sec(hash);

        async function waitForReceipt_sec(hashes) {

          let array_of_all_doc1 = await web3.eth.getTransaction(hashes).then(async body => {
            // if (err) {
            //   error(err);
            // }

            if (body !== null) {

              const result_input = await decoder.decodeData(`${body.input}`);

              // console.log("result result_input api ", result_input);

              if (result_input.inputs.length > 0) {
                // console.log(
                //  "result result_input.inputs[0] api ",
                //    result_input.inputs[0]
                // );

                var new_hash = [];

                new_hash = result_input.inputs[0].split(",");

                var t_length = new_hash.length;
                var t = 0;

                async function wait_ipfs_request() {

                  // async.each(new_hash, async function (content, cb) {
                  let result2 = await new_hash.map(async content => {

                    let temp = content.split("-");
                    let doc = temp[1];
                    let doc_type;
                    let obj;

                    if (temp[0] == "image") {
                      doc_type = "image";
                      // await request(
                      //   `https://ipfs.io/ipfs/${doc}`,
                      //   async function (error, response, body) {
                      //     console.log(
                      //       "result_input inner",
                      //       t,
                      //       " new_hash[t] :",
                      //       content
                      //     );

                      //     if (!error && response.statusCode == 200) {
                      //       console.log(" tttt : ", t);
                      //       doc_array.push({ type: doc_type, body, doc_name });

                      //       t++;
                      //     }
                      //   }
                      // );
                      obj = { type: doc_type, doc_hash: doc, doc_name: doc_data_array_obj.doc_name, all_details: doc_data_array_obj }

                    } else if (temp[0] == "pdf") {
                      doc_type = "pdf";

                      // console.log(" tttt : ", t);
                      // doc_array.push({ type: doc_type, body: doc, doc_name });
                      // t++;
                      obj = { type: doc_type, doc_hash: doc, doc_name: doc_data_array_obj.doc_name, all_details: doc_data_array_obj }

                    } else if (temp[0] == "video") {
                      doc_type = "video";

                      // console.log(" tttt : ", t);
                      // doc_array.push({ type: doc_type, body: doc, doc_name });
                      // t++;

                      obj = { type: doc_type, doc_hash: doc, doc_name: doc_data_array_obj.doc_name, all_details: doc_data_array_obj }

                    } else {
                      doc_type = "image";
                      // await request(
                      //   `https://ipfs.io/ipfs/${doc}`,
                      //   async function (error, response, body) {
                      //     console.log(
                      //       "result_input inner",
                      //       t,
                      //       " new_hash[t] :",
                      //       content
                      //     );

                      //     if (!error && response.statusCode == 200) {
                      //       console.log(" tttt : ", t);
                      //       doc_array.push({ type: doc_type, body, doc_name });

                      //       t++;
                      //     }
                      //   }
                      // );

                      obj = { type: doc_type, doc_hash: doc, doc_name: doc_data_array_obj.doc_name, all_details: doc_data_array_obj }

                    }

                    return obj

                  });


                  const result3 = await Promise.all(result2)


                  return result3

                }

                // async function send_data() {
                //   console.log("doc length ", doc_array.length);
                //   console.log("receipt_array 2");

                //   if (type == "entity") {
                //     console.log("type : ", type);

                //     res.render("front/myReflect/entity_download_certified_ajax", {
                //       doc_array,
                //     });
                //   } else {
                //     console.log("type : ", type);

                //     res.render("front/myReflect/download_certified_ajax", {
                //       doc_array,
                //     });
                //   }

                //   //  res.send(doc)
                // }
                // console.log("before request ");

                let data_test = await wait_ipfs_request();
                // console.log("result3-----",data_test);


                return data_test

                // console.log("After request ");
                // await delay(10000);

                // console.log("before send ");
                // await send_data();
                // console.log("After send ");
              }
            } else {
              console.log("error");
            }

          });
          const array_of_all_doc = await Promise.all(array_of_all_doc1)


          return array_of_all_doc


        }

        const datat3215 = await Promise.all(datat321)

        return datat3215


      }).catch(err => {

        res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong.' } });

      })

    const whole_data = await Promise.all(whole_data1)

    // console.log("whole_data",whole_data);

    return whole_data


  })



  const doc_array = await Promise.all(doc_array1)

  let token = await generateAccessToken({success_msg :"--------"})

  res.json({ status: 1, msg: "success", data: { all_doc: doc_array },token });

  // console.log("doc_array",doc_array);




  console.log("last  console___________________________________________________________________________________________")
}


/**import-btc-wallet-address Get MEthod Start **/
exports.import_btc_submit_private_key = (req, res, next) => {
  var private_key = req.body.private_key;
  

try{
  var privkey = private_key.split(" ");
  const ecPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privkey[0], 'hex'), { network: bitcoin.networks.testnet })
  var pkey = ecPair.toWIF();
  const keyPair = bitcoin.ECPair.fromWIF(pkey, TESTNET);
  //var user_id = req.session.user_id;
  var user_id = req.body.user_id;
  var { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: TESTNET });
  console.log("keypair:::", keyPair)
  var pubkey = keyPair.publicKey.toString("hex");
  console.log("address : ", address)
  console.log("pubkey : ", pubkey)

}catch(err){
   
   console.log("tttttttttttt",err)

  res.json({ status: 0, msg: "failed", data: { err_msg: 'Private key is wrong' } });

 }


  // var private_key = req.body.private_key.trim();
  // var user_id     = req.body.user_id;
  // console.log("private_key : ", private_key)

  // const keyPair = bitcoin.ECPair.fromWIF(private_key);



  // const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
  // const pubkey = keyPair.publicKey.toString("hex");
  // var address = private_key.getAddress();
  // const { address } = bitcoin.payments.p2pkh({ pubkey: new Buffer(pubKey, 'hex') });

  // console.log("address : ", address)
  // console.log("pubkey : ", pubkey)


  db.query("SELECT * FROM `tbl_wallet_reflectid_rels` inner join tbl_user_registrations on tbl_user_registrations.reg_user_id = tbl_wallet_reflectid_rels.reg_user_id WHERE user_as = 'client' and  tbl_wallet_reflectid_rels.reg_user_id = " + user_id, { type: db.QueryTypes.SELECT }).then(function (allClientReflet) {

    WalletModel.findOne({ where: { wallet_address: address, reg_user_id: user_id } }).then(async result => {
      console.log(result)
      if (!result) {

        // res.render('front/wallet/import-btc-wallet-address', { session: req.session, wallet_address: address, allClientReflet, pubkey });
        let token = await generateAccessToken({user_id:user_id})

        res.json({ status: 1, msg: "success", data: { wallet_address: address, pubkey, user_id } ,token});

      } else {
        // req.flash('err_msg', 'This  Wallet address is already imported');
        res.json({ status: 0, msg: "failed", data: { err_msg: 'This  Wallet address is already imported.' } });


      }
    }).catch(err => {
      console.log(err)

      res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });
    })
  }).catch(err => {
    console.log(err)

    res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });
  })
}
/** import-btc-wallet-address Get MEthod End **/

/**submit-create-btc-wallet Post MEthod Start **/
exports.submit_btc_pub_pri_key = async (req, res, next) => {

  var user_id = req.body.user_id;
  const wallet_address = req.body.wallet_address.trim();
  const { pubkey, reflect_code } = req.body

  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');

  console.log("wallet_address : ", wallet_address)

  // console.log("reflect_id : ", reflect_id)
  console.log("pubkey : ", pubkey)

  await db.query("SELECT * FROM tbl_wallet_reflectid_rels WHERE reg_user_id=" + user_id + " AND reflect_code=" + reflect_code, { type: db.QueryTypes.SELECT })
    .then(async reflect_data1 => {

      if (!reflect_data1) {

        res.json({ status: 0, msg: "failed", data: { err_msg: 'User does not have this Relect Id.' } });

      } else {

        await db.query("SELECT * FROM tbl_wallet_reflectid_rels WHERE reg_user_id=" + user_id + " AND reflect_code=" + reflect_code + " AND btc_wallet_id IS NOT NULL", { type: db.QueryTypes.SELECT })
          .then(async reflect_data => {
            console.log("!!!!!!!!!!!!!",reflect_data)
            if (!reflect_data) {

              res.json({ status: 0, msg: "failed", data: { err_msg: 'This reflect id alredy attech with other BTC wallet.' } });


            } else {


              await WalletModel.create({ wallet_address: wallet_address, reg_user_id: user_id, public_key: pubkey })
                .then(async result => {
                  var updateValues =
                  {
                    btc_wallet_id: result.wallet_id,
                    rep_btc_address: wallet_address
                  }



                  await MyReflectIdModel.update(updateValues, { where: { reflect_id: reflect_data1[0].reflect_id } }).then(async (resultwallet) => {
                    console.log("wallet reflect_id : ", result.reflect_id);

                    await WalletModelImport.create({ wallet_id: result.wallet_id, reg_user_id: user_id, wallet_type: 'BTC', createdAt: formatted })
                      .then(async WalletModelImport_result => {
                        console.log("wallet : ", result);
                        // res.render('front/wallet/successfully-wallet-msg', { session: req.session, wallet_id: 1 })
                        let token = await generateAccessToken({user_id:user_id})

                        res.json({ status: 1, msg: "success", data: { result, WalletModelImport_result, reflect_data } ,token});

                      }).catch(err => {
                        console.log(err)

                        res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again1.', err } });
                      })
                  }).catch(err => {
                    console.log(err)

                    res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again2.', err } });
                  })




                })
                .catch(err => {
                  console.log(err)

                  res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again3.', err } });
                })

            }

          }).catch(err => {
            console.log(err)

            res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again4.', err } });
          })

      }




    })


}
/**submit-create-btc-wallet Post MEthod End **/

/**BTC-wallet Get MEthod Start **/
exports.btc_wallet_lists = async (req, res, next) => {

  var user_id = req.body.user_id;
  let balance

  await db.query("select * from tbl_wallet_imports inner join tbl_user_wallets on tbl_user_wallets.wallet_id=tbl_wallet_imports.wallet_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.btc_wallet_id = tbl_user_wallets.wallet_id where wallet_type='BTC' and tbl_wallet_imports.reg_user_id=" + user_id, { type: db.QueryTypes.SELECT }).then(async function (btcWallet) {
    console.log('btcwallet', btcWallet)

    //important :..................................................we need to check temporary commented by naveen.............
    // for (wallet of btcWallet) {
    //   console.log('data', typeof (wallet.rep_btc_address));
    //   balanceData = await getBalance(wallet.rep_btc_address)

    //   console.log('balance----', balanceData.data.balance)

    //   if (balanceData.data.balance) {

    //     wallet.balance = balanceData.data.balance;
    //           //wallet.balance = 0;
        
    //     console.log('balance----', balanceData.data.balance)
    //   }
    //   else{

    //     wallet.balance ="testnet";
    //     // res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.' } });
    //   }

    // }
    // res.render('front/wallet/btc-wallet', {btcWallet, base64encode ,user_id});
    let token = await generateAccessToken({user_id:user_id})

    res.json({ status: 1, msg: "success", data: { btcWallet, base64encode, user_id },token });


  }).catch(err => {
    console.log(err)

    res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });
  })
}
/** get-BTC-wallet Get MEthod End **/

/** Fuction to get balance */
const getBalance = async (address) => {
  var data = JSON.stringify({ "address": address });
  console.log("param ", data)
  
  var config = {
    method: 'post',
    url: 'https://teststart.myreflet.com/btc/balance',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'connect.sid=s%3ANaZW0jANNSJZ_94zOFXGt_EuX7sS0UFy.eH7t3tWbLbJ8Dj0kT%2BFBYdyo%2BZuRW66Ghx2wu261GUc'
    },
    data: data
  };
  console.log('......', config);
  return axios(config)
    .then(function (response) {
      console.log('in res',response)

      if(response.data.status== "1")
      {
        console.log('in if2')

        console.log(JSON.stringify(response.data));
        //return JSON.stringify(response.data.data.balance);
        return response.data;
      }
      else{
        console.log('in else2')

        return {
         
            balance:'0'
          
        };
      }
    })
    .catch(function (error) {
      console.log("error",error);
      return error;
    });

}

/**myreflect_all_client_doc Get method Start**/
exports.receiver_all_client_doc = async (req, res, next) => {
  // var email = req.session.email; 
  var reflect_id = req.body.reflect_id;
  // var type        =  req.body.user_type 

  // var page = req.query.page || 1
  // var perPage = 10;
  // var page_data=[]

  console.log('type : ', reflect_id);



  await db.query("SELECT *,tbl_shared_certified_docs.createdAt as 'shared_created_id' FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE receiver_my_reflect_id =" + reflect_id + " and tbl_shared_certified_docs.deleted='0' GROUP By sender_my_reflect_id,reflect_id order by shared_doc_id desc ", { type: db.QueryTypes.SELECT })

    .then(async SharedClientDataResult => {



      page_data = SharedClientDataResult


      console.log("tbl_shared_certified_docs : ", SharedClientDataResult)


      // const SharedClientData = paginate(page_data,page, perPage);

      console.log("tbl_shared_certified_docs : ", SharedClientDataResult)
      let token = await generateAccessToken({reflect_id:reflect_id})

      res.json({ status: 1, msg: "success", data: { reflect_id, SharedClientData: page_data } ,token});

      //  res.render('front/myReflect/myreflect-client-all-doc',{ session:req.session,moment,reflect_id,SharedClientData:page_data});

    })
    .catch(err => {
      console.log(err)

      res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });
    })



}
/**myreflect_all_client_doc Get method End**/

/**myreflect_all_client_view_doc Get method Start**/
exports.receive_doc_list = async (req, res, next) => {
  // var email = req.session.email; 
  var reflect_id = req.body.sender_my_reflect_id;
  const receiver_my_reflect_id = req.body.receiver_my_reflect_id;
  // var type                            =  req.body.user_type  

  // var page = req.query.page || 1
  // var perPage = 10;
  // var page_data=[]

  // console.log('type : ',type);



  //    await  db.query("SELECT *,tbl_documents_masters.document_name as doc_name,tbl_shared_certified_docs.createdAt as 'shared_created_at' FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_request_documents_files on tbl_request_documents_files.request_doc_id=tbl_shared_certified_docs.request_doc_id inner join tbl_request_documents ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE sender_my_reflect_id ="+reflect_id+" and tbl_shared_certified_docs.deleted='0' GROUP By transaction_hash ",{type:db.QueryTypes.SELECT})

  await db.query("SELECT *,tbl_documents_masters.document_name as doc_name,tbl_shared_certified_docs.createdAt as 'shared_created_at' FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_request_documents_files on tbl_request_documents_files.request_doc_id=tbl_shared_certified_docs.request_doc_id inner join tbl_request_documents ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE sender_my_reflect_id =" + reflect_id + " and receiver_my_reflect_id =" + receiver_my_reflect_id + " and tbl_shared_certified_docs.deleted='0' GROUP By tbl_request_documents_files.request_doc_id", { type: db.QueryTypes.SELECT })

    .then(async SharedClientDocumentResult => {

      // console.log("SharedClientDocumentResult : ",SharedClientDocumentResult)    

      console.log("SharedClientDocumentResult : ", SharedClientDocumentResult.length)


      // if(i == (SharedClientDocumentResult.length - 1) && temp == 0){
      //     res.render('front/personal-explorer/explorer_ver',{receipt_array:[],moment});
      // }

      page_data = SharedClientDocumentResult

      let token = await generateAccessToken({reflect_id:reflect_id})

      // const SharedClientDocument = paginate(page_data,page, perPage);
      res.json({ status: 1, msg: "success", data: { reflect_id, SharedClientData: page_data } });

      // res.render('front/myReflect/client-all-doc-view',{ session:req.session,moment,SharedClientDocument,reflect_id});


    })
    .catch(err => {
      console.log(err)

      res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });
    })



}
/**myreflect_all_client_view_doc Get method End**/

//***************************************************************sender doc side*********************************** */

/**myreflect_all_client_doc Get method Start**/
exports.doc_sender_all_client = async (req, res, next) => {
  // var email = req.session.email; 
  var reflect_id = req.body.reflect_id;
  var reg_user_id = req.body.user_id
  // var type=  req.session.user_type 

  //   console.log('type : ',type);

  // var page = req.query.page || 1
  // var perPage = 10;
  // var page_data=[]


  await db
    .query("SELECT * FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.receiver_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_shared_certified_docs.sender_reg_user_id=" + reg_user_id + " AND  tbl_shared_certified_docs.sender_my_reflect_id =" + reflect_id + " and tbl_shared_certified_docs.deleted='0'  GROUP BY tbl_shared_certified_docs.receiver_my_reflect_id", { type: db.QueryTypes.SELECT })

    .then(async SharedClientDataResult => {
      // console.log('SharedClientData : ',SharedClientDataResult);

      page_data = SharedClientDataResult
      // const SharedClientData = paginate(page_data,page, perPage);
      let token = await generateAccessToken({reflect_id:reflect_id})

      //  res.render('front/my_send_doc/myreflect-client-all-doc',{ session:req.session,moment,SharedClientData,reflect_id});
      res.json({ status: 1, msg: "success", data: { SharedClientData: page_data, reflect_id } ,token});


    })

    .catch(err => {
      console.log(err)

      res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });
    })



}
/**myreflect_all_client_doc Get method End**/


/**myreflect_all_client_view_doc Get method Start**/
exports.sender_client_doc = async (req, res, next) => {
  // var email = req.session.email; 
  const reflect_id = req.body.sender_my_reflect_id;
  const receiver_my_reflect_id = req.body.receiver_my_reflect_id;
  // var type                            =  req.body.user_type  

  // var page = req.query.page || 1
  // var perPage = 10;
  // var page_data=[]

  // console.log('type : ',type);



  //    await  db.query("SELECT *,tbl_documents_masters.document_name as doc_name,tbl_shared_certified_docs.createdAt as 'shared_created_at' FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_request_documents_files on tbl_request_documents_files.request_doc_id=tbl_shared_certified_docs.request_doc_id inner join tbl_request_documents ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE sender_my_reflect_id ="+reflect_id+" and tbl_shared_certified_docs.deleted='0' GROUP By transaction_hash ",{type:db.QueryTypes.SELECT})
  await db.query("SELECT *,tbl_documents_masters.document_name as doc_name,tbl_shared_certified_docs.createdAt as 'shared_created_at' FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_request_documents_files on tbl_request_documents_files.request_doc_id=tbl_shared_certified_docs.request_doc_id inner join tbl_request_documents ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE sender_my_reflect_id =" + reflect_id + " and receiver_my_reflect_id =" + receiver_my_reflect_id + " and tbl_shared_certified_docs.deleted='0' GROUP By tbl_request_documents_files.request_doc_id ", { type: db.QueryTypes.SELECT })
    .then(async SharedClientDocumentResult => {

      // console.log("SharedClientDocumentResult : ",SharedClientDocumentResult)    

      console.log("SharedClientDocumentResult : ", SharedClientDocumentResult.length, reflect_id)


      // if(i == (SharedClientDocumentResult.length - 1) && temp == 0){
      //     res.render('front/personal-explorer/explorer_ver',{receipt_array:[],moment});
      // }

      page_data = SharedClientDocumentResult


      // const SharedClientDocument = paginate(page_data,page, perPage);
      let token = await generateAccessToken({reflect_id:reflect_id})

      // res.render('front/my_send_doc/client-all-doc-view',{ session:req.session,moment,reflect_id,SharedClientDocument});
      res.json({ status: 1, msg: "success", data: { reflect_id, SharedClientDocument: page_data },token });



    })
    .catch(err => {
      console.log(err)

      res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });
    })



}

/**myreflect_all_client_doc Get method Start**/


/**myreflect_all_client_view_doc Get method End**/
exports.shared_doc_view = async (req, res, next) => {

  var query = req.body.tx_value;
  var reflect_id = req.body.reflect_id;
  var user_reg_id = req.body.user_id
  console.log("value **** 123 ***** ", query);

  var page = req.query.page || 1
  var perPage = 10;
  var page_data = [];
  var hash_data = [];
  var temp = 0;
  var doc = [];

  // const receipt_array=[];
  // await db.query("SELECT *,tbl_documents_masters.document_name as doc_name FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_request_documents_files on tbl_request_documents_files.request_doc_id=tbl_shared_certified_docs.request_doc_id inner join tbl_request_documents ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE sender_my_reflect_id ="+reflect_id+" and transaction_hash ='"+query+"' and tbl_shared_certified_docs.deleted='0' GROUP By transaction_hash ",{type:db.QueryTypes.SELECT}).then(async hash_data_old =>{
  await db.query("SELECT *,tbl_documents_masters.document_name as doc_name FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_request_documents_files on tbl_request_documents_files.request_doc_id=tbl_shared_certified_docs.request_doc_id inner join tbl_request_documents ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE sender_my_reflect_id =" + reflect_id + " and transaction_hash ='" + query + "' and tbl_shared_certified_docs.deleted='0' Group by tbl_request_documents_files.request_doc_id ", { type: db.QueryTypes.SELECT }).then(async hash_data_old => {
    if (hash_data_old.length > 0) {
      console.log('hash_data_old : ', hash_data_old);

      // hash_data = hash_data_old;
      // console.log(hash_data_old);

      const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration))


      var hash = hash_data_old[0].transaction_hash;
      var created_at = hash_data_old[0].createdAt;

      await waitForReceipt_sec(hash);

      async function waitForReceipt_sec(hashes) {

        await web3.eth.getTransaction(hashes, async function (err, receipt) {
          if (err) {
            error(err);
          }
          // console.log("result outside",hash_data_old[i]);

          if (receipt !== null) {

            // await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {

            // console.log("error ",error);

            // if (!error && response.statusCode == 200) {
            //     const tx = JSON.parse(body)
            //     const result = tx.result;
            //     // const message = tx.message;
            //     // console.log("tx ",result);
            //     // console.log("result inside api ",hash);

            //     console.log("result inside length ",result.length);

            //     for(var j=0;j<result.length;j++){
            //         if(result[j].hash!=hashes){

            //         }else{



            const result_input = decoder.decodeData(`${receipt.input}`);

            if (result_input.inputs.length > 0) {

              console.log("result result_input.inputs[0] api ", result_input.inputs[0]);

              var new_hash = [];

              new_hash = (result_input.inputs[0]).split(",")



              var t_length = new_hash.length;
              var t = 0;

              async function wait_ipfs_request() {

                async.each(new_hash, async function (content, cb) {
                  let temp = content.split('-')
                  let doc_hash = temp[1]
                  let doc_type

                  if (temp[0] == "image") {

                    doc_type = "image"

                    await request(`https://ipfs.io/ipfs/${doc_hash}`, async function (error, response, body) {

                      // console.log("result_input inner",t," new_hash[t] :",content);


                      if (!error && response.statusCode == 200) {
                        console.log(" tttt : ", t);
                        doc.push({ type: doc_type, body });

                        t++;
                      }
                    })

                  } else if (temp[0] == "video") {

                    doc_type = "video"
                    // await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {

                    //     console.log("result_input inner", t, " new_hash[t] :", content);


                    //     if (!error && response.statusCode == 200) {
                    console.log(" tttt : ", t);
                    doc.push({ type: doc_type, body: doc_hash });
                    t++;
                    //     }
                    // })

                  } else if (temp[0] == "pdf") {

                    doc_type = "pdf"
                    // await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {

                    //     console.log("result_input inner", t, " new_hash[t] :", content);


                    //     if (!error && response.statusCode == 200) {
                    console.log(" tttt : ", t);
                    doc.push({ type: doc_type, body: doc_hash });
                    t++;
                    //     }
                    // })

                  } else {

                    doc_type = "image"

                    await request(`https://ipfs.io/ipfs/${doc_hash}`, async function (error, response, body) {

                      // console.log("result_input inner",t," new_hash[t] :",content);


                      if (!error && response.statusCode == 200) {
                        console.log(" tttt : ", t);
                        doc.push({ type: doc_type, body });

                        t++;
                      }
                    })

                  }


                  await delay(10000)

                })
              }


              async function send_data() {

                console.log("doc length ", doc.length);
                console.log("receipt_array 2");


                // res.render('front/myReflect/view_certified_ajax',{doc})
                let token = await generateAccessToken(doc)

                res.json({ status: 1, msg: "success", data: doc ,token });

                //  res.send(doc)



              }
              console.log("before request ");

              await wait_ipfs_request();

              console.log("After request ");
              await delay(10000)

              console.log("before send ");
              await send_data();
              console.log("After send ");
            }
            //         }
            //     }


            // }
            // })

          } else {
            console.log("error");
            res.json({ status: 0, msg: "Something Went wrong 1", data: { err: "No data available" } });
          }
        });

      }
    }
    else {
      res.json({ status: 0, msg: "Something Went wrong 2", data: { err: "No data available" } });
    }


  })
    .catch(err => {
      res.json({ status: 0, msg: "Something Went wrong 3", data: { err: "No data available" } });
    })
}




exports.share_certify_doc = async (req, res, next) => {

  var share_doc_data = req.body.share_doc_data     //Array
  var reflect_code = req.body.reflect_code.trim()
  var my_reflect_id = req.body.my_reflect_id
  var reg_user_id = req.body.user_id
  var descriptions = req.body.descriptions_for_share_doc

  console.log(share_doc_data)
  console.log(reflect_code)
  console.log(my_reflect_id)
  console.log(reg_user_id)

  await MyReflectIdModel.findOne({ where: { reflect_code: reflect_code } }).then(async (myRefdata_for_reflect_id) => {


    if (!myRefdata_for_reflect_id) {

      res.json({ status: 0, msg: "failed", data: { err_msg: 'This code does not exist' } });


    } else {



      for (i = 0; i < share_doc_data.length; i++) {

        console.log("share_doc_data : ", share_doc_data)

        await tbl_shared_certified_doc.create({
          sender_my_reflect_id: my_reflect_id,
          receiver_my_reflect_id: myRefdata_for_reflect_id.reflect_id,
          sender_reg_user_id: reg_user_id,
          request_id: share_doc_data[i].request_id,
          request_doc_id: share_doc_data[i].request_doc_id,
          descriptions: descriptions
        })
          .then(async data => {


            console.log("share_doc_data : ", share_doc_data.length, " i val : ", i)

            if (i == (share_doc_data.length)) {


            }

          })
          .catch(err => {
            console.log(err)
            res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });
          })

      }
      await MyReflectIdModel.findOne({ where: { reflect_id: myRefdata_for_reflect_id.reflect_id } }).then(async (myRefdata) => {

        await UserModel.findOne({ where: { reg_user_id: reg_user_id } }).then(async user_data => {

          var msg = ` ${decrypt(user_data.full_name)} is shared  a document for this reflet code-${myRefdata.reflect_code}.`

          await NotificationModel.create({
            notification_msg: msg,
            sender_id: reg_user_id,
            receiver_id: myRefdata.reg_user_id,
            notification_type: '11',
            notification_date: new Date()
          }).then(async (notification) => {
            console.log("notification.....",notification)
            console.log({notification_id:notification.notification_id , r_user_id:notification.receiver_id})

           await apies_notification({notification_id:notification.notification_id , r_user_id:notification.receiver_id})
           console.log("notification function called succesfully....................")
          })
            .catch(err => {
              console.log(err)
              res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });
            })
        })
          .catch(err => {
            console.log(err)
            res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });
          })
      })
        .catch(err => {
          console.log(err)
          res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });
        })
      console.log("i ,share_doc_data.length", i, share_doc_data.length)
      let token = await generateAccessToken({ success_msg: "Documents has been sent successfully." })

      res.json({ status: 1, msg: "success", data: { success_msg: "Documents has been sent successfully." },token });


    }

  })
    .catch(err => {
      console.log(err)
      res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });
    })

}


//forgot password by naveen

//forgot password by naveen

exports.forgetPassword=async function(req,res){
  var otp = encrypt(generateOTP());
  var now = new Date();

  now.setMinutes(now.getMinutes() + 05); // timestamp
  now = new Date(now); // Date object

  var otp_expire = now

  function generateOTP() {

    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }
try{
try{
email= decrypt1(req.body.email);
}catch(err){
 res.json({ status: 0, msg: "This email id is not registered", data: { err_msg: 'Failed' } });
}
    email= encrypt(email);
   let isData =await UserModel.findOne({where:{email:email,deleted: '0'}});
     if(isData!=null){
      let isActive= await UserModel.findOne({ where: { email: email, status: 'active' } })
      if(isActive!=null){
        await UserModel.update({otp:otp,otp_expire},{where:{email:email}});
       var smtpTransport = nodemailer.createTransport({
         service: 'gmail',
         auth: {
           user: MAIL_SEND_ID,
           pass: PASS_OF_MAIL
         }
       });
       console.log("emaillllllllllllllllll enterd:",decrypt(email))
       const mailOptions = {
         to: decrypt(email),
         from: 'questtestmail@gmail.com',
         subject: "OTP for Forgot password",
     
         html: `<!DOCTYPE html>
           <html>
             <head>
               <title>My Reflet</title>
               <meta name="viewport" content="width=device-width, initial-scale=1.0" />
               <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <style>
               @media only screen and (max-width: 600px) {
               .inner-body {
               width: 100% !important;
               }
               .footer {
               width: 100% !important;
               }
               }
               @media only screen and (max-width: 500px) {
               .button {
               width: 100% !important;
               }
               }
               </style> 
             </head>
             <body>
               <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
                 <div style="background-color: #88beda;padding: 10px 30px 5px;">
                   <img src="https://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
                 </div>
                 <div style="padding: 30px;line-height: 32px; text-align: justify;">
                   <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(isActive.full_name)}</h4>
                   <p>Your OTP for forgot passowrd:${decrypt(otp)} </p>
                   <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                   <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                 </div>
                  <div style="background-color:  #88beda; color: #fff; padding: 20px 30px;">
                    &copy; Copyright 2020 - My Reflet. All rights reserved.
                   </div>
               </div>
             </body>
           </html>  
           `
       };
       smtpTransport.sendMail(mailOptions, function (err) {
     
       });

         res.json({
           status: 1, msg: "Successfully sent otp", data: {
             user_id:isActive.reg_user_id,
             serverSalt:isActive.server_salt,
             otp:decrypt(otp)
           }})

      }else{
       res.json({ status: 0, msg: 'Your account is inactive.Please contact to administrator.', data: { err: 'Error Occurred' } });
      }
     }else{
       res.json({ status: 0, msg: "This email id is not registered", data: { err_msg: 'Failed' } });
     }
}catch(err){
res.json({ status: 0, msg: "Somthing went wrong try again.", data: { err_msg: 'Failed', err } });
}
}



//otp after login and forgot password
exports.otpAfterLogin=async function(req,res){
    let otp=encrypt(req.body.otp);
    let userid= req.body.user_id;
    function toTimestamp(strDate) {
      var datum = Date.parse(strDate);
      return datum / 1000;
    }
  try{
    UserModel.findOne({ where: { reg_user_id: userid } })
    .then(async (userdata) => {
      var timstampFormDb = parseInt(toTimestamp(userdata.otp_expire))
      var currentTimestamp = parseInt(toTimestamp(new Date()))
      if (userdata) {
        console.log("Stored otp:::::::::::::::::::",userdata.otp)
        console.log("entered otp:::::::::::::::::::",userdata.otp)
        var user_otp = userdata.otp;
        console.log(user_otp == otp && timstampFormDb >= currentTimestamp)
       // if (user_otp == otp && timstampFormDb >= currentTimestamp) {   you need to uncomment this
         if(req.body.otp=="2456"){
          await UserModel.update({wrong_otp_count: "0" }, { where: { reg_user_id: userid } })
            .then((result) => {
              res.json({
                status: 1, msg: "success", data: {
                  user_id: userid
                }
              });
              // res.redirect(`/sequrity_question/?userid=${userid}`)

            }).catch(err => {
              console.log("otp step err", err)
              res.json({ status: 0, msg: "failed", data: { err_msg: 'otp step err.' } })
            })

        }
        else {

          if (parseInt(userdata.wrong_otp_count) > 9) {

            res.json({ status: 0, msg: "You have tried so many invalid attempts, please contact to admin.", data: { err_msg: 'You have tried so many invalid attempts, please contact to admin.' } });
            // req.flash('err_msg', 'You have tried so many invalid attempts, please contact to admin.')
            // res.redirect("/signup")

          } else {
            wrong_otp_count = parseInt(userdata.wrong_otp_count) + 1
            UserModel.update({ wrong_otp_count }, { where: { reg_user_id: userid, deleted: "0", status: "active" } }).then(data => {

              res.json({
                status: 0, msg: "failed", data: {
                  err_msg: 'You entered wrong OTP.',
                  user_id: userid
                }
              });

              //   req.flash('err_msg', 'You entered wrong OTP.')
              //   res.redirect(`/top_verification?userid=${userid}`)

            }).catch(err => {
              console.log(err)
              res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.' } });
              //  redirect("/login")
            })
          }

          err_msg = 'You entered wrong OTP.'


        }

      } else {

        res.json({ status: 0, msg: "Record not found.", data: { err_msg: 'Record not found.' } });

        //  req.flash('err_msg', 'Record not found.')
        //  res.redirect("/signup")
      }
    }).catch(err => {
      console.log(err)
      res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Somthing went wrong try again.', err } });

    })
  }catch(err){
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}



//multer file uploading
var Storage=multer.diskStorage({
 // destination:'../public/profilepic',
 destination:path.join(__dirname, "../../public/profilepic"),
  filename:(req,file,cb)=>{
    console.log("Sttttttttttttttttttttttttttt");
    cb(null,req.body.user_id+file.originalname)
  }
})
//middleware
exports.upload=multer({
   storage:Storage
}).single('file');
//update profile image
exports.updateProfileImg=async function(req,res){
  let fileName= req.file.originalname;
  fileName=req.body.user_id+fileName;
  console.log("fileeeeeeeeeeeeeeeee name:",fileName);
  let userId=req.body.user_id;
  try{ 
    try{
      await UserModel.update({profile_img_name:fileName},{where:{reg_user_id:userId}});
      console.log("Successfullu uploaded...............")
    }catch(err){
      res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
    }
      res.json({
        status: 1, msg: "successfully uploaded", data: {success_msg:"successfully uploaded"
        }
      });
  }catch(err){
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}

//get user profile
exports.getUserProfile=async function(req,res){
      let userid=req.params.user_id;
  try{
     let userData=await UserModel.findOne({where:{reg_user_id:userid}});
     let uploadedKyc=await KycModel.findAll({where:{reg_user_id:parseInt(userid)},order: sequelize.literal('kyc_id DESC')});
     let kycStatus='';
    // console.log("User kyc statttstt",uploadedKyc[0]);
         if(uploadedKyc.length>0){
           if(uploadedKyc[0].status=='reject'){
              kycStatus='Rejected'
           }
           if(uploadedKyc[0].status=='approved'){
            kycStatus='Verified'
           }
           if(uploadedKyc[0].status=='pending'){
            kycStatus='Pending'
           }
              
          }else{
            kycStatus="Not verified"
           }

        if(userData){
          if(userData.profile_img_name==null){
            userData.profile_img_name=''
          }
                let getUserProfile={
                    firstname:decrypt(userData.full_name),
                    lastname:decrypt(userData.last_name),
                    profilename:userData.profile_img_name,
                    email:decrypt(userData.email),
                    phone:decrypt(userData.mobile_number),
                    dob:decrypt(userData.dob),
                    placeofbirth:decrypt(userData.birthplace),
                    kycStatus:kycStatus
                }
                console.log("user datttttttttttttt",getUserProfile);
                res.json({
                  status: 1, msg: "success", data: {
                    getUserProfile
                  }
                });
        }else{
          res.json({ status: 0, msg: "User not present", data: { err_msg: 'Failed'} });
        }
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}

//get profile image
exports.getImg=async function(req,res){
  let name = req.params.name;
  try{
    
    let filePath = path.join(__dirname, "../../public/profilepic/"+name);
    console.log(filePath);
    res.sendFile(filePath);
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}



//get country code
exports.getCountryCode=async function(req,res){
  //const myCountryCodesObject = countryCodes.customList('countryCode', '{countryNameEn}: +{countryCallingCode}');
  const myCountryCodesObject = countryCodes.customList('countryNameEn' ,'{countryCallingCode}');
  //const myCountryCodesObject =countryCodes.customList()
  //console.log(myCountryCodesObject);
  let countryArr=[];
  let i=0;
  for (var key in myCountryCodesObject) {
    let obj={
      'countryname':'',
      'countrycode':''
    };
    if (myCountryCodesObject.hasOwnProperty(key)) {
        obj.countrycode='+'+myCountryCodesObject[key];
        obj.countryname=key;
      //  console.log(key + " -> " + myCountryCodesObject[key]);
    }
    countryArr[i]=obj;
    i++;
}
//console.log(countryArr);

 //return sendResponse(res, 200, { status: true, data: countries.callingCodes.all, message: 'successfully sent country code' });
 //return sendResponse(res, 200, { status: true, data: countryArr, message: 'successfully sent country code' });

 res.json({
  status: 1, msg: "Successfully sent country code", data:countryArr
});
}


//get country list
exports.getCountry=async function(req,res){
  let countryList=[];
 
  try{
    let countries=csc.getAllCountries();
    console.log(countries);
    for(let i=0;i<countries.length;i++){
      let countryObj={
        countryName:'',
        countryCode:'',
        phoneCode:""
      }
      countryObj.countryCode=countries[i].isoCode;
      countryObj.countryName=countries[i].name;
      //let codeList=countries[i].phonecode.split('');
      // if(codeList[0]!='+'){
      //   countries[i].phonecode='+'+countries[i].phonecode
      // }
      countryObj.phoneCode=countries[i].phonecode;
      countryList[i]=countryObj;
    }
    res.json({ status: 1, msg: "Success", data:countryList});
  }catch(err){
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}

//get city from COUNTRY CODE
exports.getCity=async function(req,res){
  let countrycode=req.body.countrycode;
   try{
   let cities=await csc.getCitiesOfCountry(countrycode);
   console.log("City::::::::::::::::",cities)
   res.json({ status: 1, msg: "Success", data:cities});
   // console.log(cities);
   }catch(err){
     console.log(err);
     //res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
   }
 }
 async function disp(){
 let cities= await csc.getCitiesOfCountry('af');
 console.log(cities);
 }
 disp();
 //save password
//saved password
exports.savePassword=async function(req,res){
  let password=req.body.password;
  let user_id=req.body.user_id;
  let client_salt=req.body.client_salt;
  let serverSalt=await crypto.randomBytes(16).toString('base64');
  console.log("Generated salt::::::::::::::::::::::",serverSalt);
  password=password+serverSalt;
  password=crypto.createHash('sha256').update(password).digest('hex');
  password=encrypt1(password);
  password=encrypt(password);
  console.log("after hashing passworddddddddddddddd and encryption:",password);
  serverSalt=encrypt(serverSalt);
try{
 let isSavedPassword=await UserModel.update({password:password,server_salt:serverSalt,client_salt:client_salt},{where:{reg_user_id:user_id}});
 if(isSavedPassword){
   res.json({status:1,msg:"Successfully saved",data:{success_msg:'Successfully saved'}});
 }else{
     res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
 }
}catch(err){
console.log(err);
res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
}
}

//get client salt
exports.getClientSalt=async function(req,res){
  let email=encrypt(req.body.email);
  try{
        let userData=await UserModel.findOne({where:{email:email}});
        if(userData){
          res.json({status:1,msg:"Successfully sent",data:{client_salt:userData.client_salt}});
        }else{
          res.json({ status: 0, msg: "You entered wrong credential", data: { err_msg: 'Failed'} });
        }
  }catch(err){
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
  }
}

//change password: test old password correct or not if correct send otp 

exports.validateOldPassword=async function(req,res){
  let oldPassword=req.body.oldpassword;
  let user_id=req.body.user_id;
  var otp = encrypt(generateOTP());
  var now = new Date();

  now.setMinutes(now.getMinutes() + 05); // timestamp
  now = new Date(now); // Date object

  var otp_expire = now

  function generateOTP() {

    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }
  try{
        
       let userData=await UserModel.findOne({where:{reg_user_id:user_id}});
       if(userData){
         try{
              let server_salt=decrypt(userData.server_salt);
              oldPassword=oldPassword+server_salt;
              var storedPassword=userData.password;
              console.log("stored password::::::::::",storedPassword);

              oldPassword=crypto.createHash('sha256').update(oldPassword).digest('hex');
              oldPassword=encrypt1(oldPassword);
              oldPassword=encrypt(oldPassword);
               console.log("Entered passsworrddddddddddddddd",oldPassword);
               if(storedPassword==oldPassword){
                 try{
                await UserModel.update({otp:otp,otp_expire},{where:{reg_user_id:user_id}});
                 }catch(err){
                   console.log(err);
                 }
                var smtpTransport = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: MAIL_SEND_ID,
                    pass: PASS_OF_MAIL
                  }
                });
                const mailOptions = {
                  to: decrypt(userData.email),
                  from: 'questtestmail@gmail.com',
                  subject: "OTP for Change password",
              
                  html: `<!DOCTYPE html>
                    <html>
                      <head>
                        <title>My Reflet</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                         <style>
                        @media only screen and (max-width: 600px) {
                        .inner-body {
                        width: 100% !important;
                        }
                        .footer {
                        width: 100% !important;
                        }
                        }
                        @media only screen and (max-width: 500px) {
                        .button {
                        width: 100% !important;
                        }
                        }
                        </style> 
                      </head>
                      <body>
                        <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
                          <div style="background-color: #88beda;padding: 10px 30px 5px;">
                            <img src="https://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
                          </div>
                          <div style="padding: 30px;line-height: 32px; text-align: justify;">
                            <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(userData.full_name)}</h4>
                            <p>Your OTP for change passowrd:${decrypt(otp)} </p>
                            <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                            <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                          </div>
                           <div style="background-color:  #88beda; color: #fff; padding: 20px 30px;">
                             &copy; Copyright 2020 - My Reflet. All rights reserved.
                            </div>
                        </div>
                      </body>
                    </html>  
                    `
                };
                smtpTransport.sendMail(mailOptions, function (err) {
              
                });

                res.json({
                  status: 1, msg: "Successfully sent otp", data: {
                    user_id:userData.reg_user_id,
                    otp:decrypt(otp)
                  }})
               }else{
                res.json({ status: 0, msg: "Wrong password", data: { err_msg: 'Failed'} });
               }
         }catch(err){
           console.log(err);
          res.json({ status: 0, msg: "Wrong password", data: { err_msg: 'Failed'} });
         }
       }else{
        res.json({ status: 0, msg: "Try again", data: { err_msg: 'Failed'} });
       }                          
  }catch(err){
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
  }
}

//generate public key for natural person
exports.generatePublicKey=async function(req,res){
  let user_id=req.body.user_id;
  let username=encrypt(req.body.username);  
  let firstName=encrypt(req.body.firstName);
  let lastName=encrypt(req.body.lastName); 
  let passphrase = 'hkjggh';
  var reflect_code = generateUniqueId({
    length: 4,
    useLetters: false,
    excludeSymbols: ['0']
  });
var user_account='';
let refletData=await MyReflectIdModel.findOne({where:{reg_user_id:user_id,reflectid_by:'representative',idCreated:'true'}});
if(refletData==null){
    //  let public_key="0x24100e77a7389ec2bdd147732f04c99b4e6d79c7";
    let user_passphrase = crypto.createHash('sha256').update(passphrase).digest('base64');
    
    var options = {
    //  url: "http://13.232.156.125:8503",
       url:"http://139.59.83.232:8503",
      method: 'POST',
      headers:
      {
        "content-type": "application/json"
      },
      body: JSON.stringify({ "jsonrpc": "2.0", "method": "personal_newAccount", "params": [passphrase], "id": 1 })
    };
  
    
    let promise = new Promise( async (resolve ,reject) => { 
  
      await request(options, async function (error, response, body) {
        console.log("Bodyyyyyyyyyyyyyy:",body);
     
       console.log('response..................................................  : ', response);
        if ( error ) reject();
          console.log('  first request@@@@@@@@@ ',body);
          var JSONbody = JSON.parse(body);
         console.log('Account - - - - - -',JSONbody);
          account1 = JSONbody.result;
          user_account=account1;
          console.log('Account - - - - - .......................................................................-', account1);
          resolve(account1)
      })
  
    })
    
  var account ;
    promise.then((data)=>{
      account=data
      user_account=data;
     getSegment(account)
    })
    .catch(err=>{
        console.log(err);
        res.json({ status: 0, msg: "Internal issue", data: { err_msg: 'Failed'} });
    })
  
  
    //  let lastSegment="UTC--2021-05-14T04-41-39.136759192Z--24100e77a7389ec2bdd147732f04c99b4e6d79c7";
    async function getSegment(user_account){
    var options = {
      // url: "http://13.232.156.125:8503",
       url:"http://139.59.83.232:8503",
       method: 'POST',
       headers:
       {
         "content-type": "application/json"
       },
       body: JSON.stringify({ "jsonrpc": "2.0", "method": "personal_listWallets", "params": [], "id": 1 })
     };
 
     request(options, async function (error, response, body) {
       // console.log(body.result);
       // console.log(JSON.parse(body).result);
       if(error){
         console.log("opppppppppppppssssssssssssssss errr");
         res.json({ status: 0, msg: "Internal issue", data: { err_msg: 'Failed'} });
       }
       console.log('-------------second request--------');
       var lastSegment;
 
       var c = JSON.parse(body).result;
       // console.log(c);
       c.forEach(function (element) {
         // console.log(element.accounts);
         var accounts_details = element.accounts;
         accounts_details.forEach(async function (element1) {
           // console.log(element1.address);
           let address = user_account.toLowerCase();
           if (element1.address === address) {
             // console.log(element1.url)
             var parts = element1.url.split('/');
             lastSegment = parts.pop() || parts.pop();
             
             console.log("lastSegment:::::::::::::::::::::::::",lastSegment);
             if(lastSegment&&user_account){
              let userData= await UserModel.findOne({where:{reg_user_id:user_id}});
              if(userData.email_verification_status=='yes'){
                userData.email_verification_status='verified'
              }else{
                userData.email_verification_status='pending'
              }
              let isCreatdWallt=await WalletModel.create({
                wallet_address:user_account,
                reg_user_id:user_id
              })
              let isCreated=await MyReflectIdModel.create({
                  reflect_code:reflect_code,
                  reg_user_id:user_id,
                  user_as:'client',
                  rep_username:username,
                  rep_firstname:firstName,
                  rep_lastname:lastName,
                  rep_emailid:userData.email,
                  wallet_id:isCreatdWallt.wallet_id,
                  email_verification_status:userData.email_verification_status
              }) ;
              
              if(isCreated){
                res.json({
                  status: 1, msg: "Successfully generated natural person MyRefletId", data: {
                    walletAddress:user_account,
                    user_id:user_id,
                    myrefletCode:reflect_code,
                    type:"Natural person",
                    name:decrypt(username),
                    segment:lastSegment
                  }
                });
              
              }else{
                res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
              }
              
             }
           }
         })
       })
         
     })
    }
  }else{
    res.json({ status: 0, msg: "You have already created Natural myreflet id", data: { err_msg: 'Failed'} });
  }
     
  }

exports.createPrivateKey=async function(req,res){
    let lastSegment=req.body.segment;
    let user_id=req.body.user_id;
    let reflet_code=parseInt(req.body.reflet_id);
    var user_pass='hkjggh';
 try{
   console.log("segmenttttttttttttttttttttt",lastSegment);
   var options2 = {
   url:`http://139.59.83.232/devnetwork/node1/keystore/${lastSegment}`,
     method: 'GET',
     headers:
     {
       "content-type": "application/json"
     }
   };
   try{
   await request(options2, async function (error, response, body) {
     // console.log('-----------------------', options2.url)
     console.log(body);
     // // })
     console.log('-------------3rd request--------');
     // await request.get(` http://34.194.223.110/devnetwork/node1/keystore/${lastSegment}`,function (error, response, body) {
      try{
        var csv = JSON.parse(body);
         }catch(err){
          res.json({ status: 0, msg: "It takes few seconds to generate private key,Please try again after 20sec.", data: { err_msg: 'Failed'} });
         }
     console.log("CSVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",csv);
     var c = web3.eth.accounts.decrypt(csv,user_pass);
     console.log("Private key::::::::::",c.privateKey);
     pk = c.privateKey;
     if(pk){
       await MyReflectIdModel.update({idCreated:'true'},{where:{reg_user_id:user_id,reflect_code:reflet_code}})
     }
     res.json({
       status: 1, msg: "Successfully generated private key", data: {
         privateKey:pk,
         user_id:user_id,
       }
     });
     //  sender_private_key = pk;
     // privateKey  = Buffer.from(sender_private_key, 'hex');
   })
 }catch(err){
   res.json({ status: 0, msg: "Internal error,Please try again.", data: { err_msg: 'Failed'} });
 }

 }catch(err){
   res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
 }
}


//create public key and segment for entity
exports.generatePublicKeyForEntity=async function(req,res){
  let user_id=req.body.user_id;
  let company_name=encrypt(req.body.company_name);  
  let company_country=req.body.company_country;
  let company_address=encrypt(req.body.company_address);
  let company_reg_no=encrypt(req.body.company_reg_no); 
  let entity_name=encrypt(req.body.user_name);
  let phone=encrypt(req.body.company_phone);
  //let entity_password=req.body.password;

  let passphrase = 'hkjggh';
  var reflect_code = generateUniqueId({
    length: 4,
    useLetters: false,
    excludeSymbols: ['0']
  });
var user_account='';
let refletData=await MyReflectIdModel.findOne({where:{reg_user_id:user_id,reflectid_by:'entity',entity_company_regno:company_reg_no}});
if(refletData==null){
  // let userData=await UserModel.findOne({where:{reg_user_id:user_id}});
  //        let server_salt=userData.server_salt;
  //        console.log("Server saltttttttttt",server_salt);
  //        entity_password=entity_password+server_salt;
  //        entity_password=crypto.createHash('sha256').update(entity_password).digest('hex');
  //        entity_password=encrypt(entity_password);
    //  let public_key="0x24100e77a7389ec2bdd147732f04c99b4e6d79c7";
    //let user_passphrase = crypto.createHash('sha256').update(passphrase).digest('base64');
    
    var options = {
    //  url: "http://13.232.156.125:8503",
       url:"http://139.59.83.232:8503",
      method: 'POST',
      headers:
      {
        "content-type": "application/json"
      },
      body: JSON.stringify({ "jsonrpc": "2.0", "method": "personal_newAccount", "params": [passphrase], "id": 1 })
    };
  
    
    let promise = new Promise( async (resolve ,reject) => { 
  
      await request(options, async function (error, response, body) {
        console.log("Bodyyyyyyyyyyyyyy:",body);
     
       console.log('response..................................................  : ', response);
        if ( error ) reject();
          console.log('  first request@@@@@@@@@ ',body);
          var JSONbody = JSON.parse(body);
         console.log('Account - - - - - -',JSONbody);
          account1 = JSONbody.result;
          user_account=account1;
          console.log('Account - - - - - .......................................................................-', account1);
          resolve(account1)
      })
  
    })
    
  var account ;
    promise.then((data)=>{
      account=data
      user_account=data;
     getSegment(account)
    })
    .catch(err=>{
        console.log(err);
        res.json({ status: 0, msg: "Internal issue", data: { err_msg: 'Failed'} });
    })
  
  
    //  let lastSegment="UTC--2021-05-14T04-41-39.136759192Z--24100e77a7389ec2bdd147732f04c99b4e6d79c7";
    async function getSegment(user_account){
    var options = {
      // url: "http://13.232.156.125:8503",
       url:"http://139.59.83.232:8503",
       method: 'POST',
       headers:
       {
         "content-type": "application/json"
       },
       body: JSON.stringify({ "jsonrpc": "2.0", "method": "personal_listWallets", "params": [], "id": 1 })
     };
 
     request(options, async function (error, response, body) {
       // console.log(body.result);
       // console.log(JSON.parse(body).result);
       if(error){
         console.log("opppppppppppppssssssssssssssss errr");
         res.json({ status: 0, msg: "Internal issue", data: { err_msg: 'Failed'} });
       }
       console.log('-------------second request--------');
       var lastSegment;
 
       var c = JSON.parse(body).result;
       // console.log(c);
       c.forEach(function (element) {
         // console.log(element.accounts);
         var accounts_details = element.accounts;
         accounts_details.forEach(async function (element1) {
           // console.log(element1.address);
           let address = user_account.toLowerCase();
           if (element1.address === address) {
             // console.log(element1.url)
             var parts = element1.url.split('/');
             lastSegment = parts.pop() || parts.pop();
             
             console.log("lastSegment:::::::::::::::::::::::::",lastSegment);
             if(lastSegment&&user_account){
              let userData= await UserModel.findOne({where:{reg_user_id:user_id}});
              if(userData.email_verification_status=='yes'){
                userData.email_verification_status='verified'
              }else{
                userData.email_verification_status='pending'
              }
              let isCreatdWallt=await WalletModel.create({
                wallet_address:user_account,
                reg_user_id:user_id
              })
            
              let isCreated=await MyReflectIdModel.create({
                  reflect_code:reflect_code,
                  reg_user_id:user_id,
                  user_as:'client',
                  entity_company_name:company_name,
                  entity_name:entity_name,
                  entity_company_address:company_address,
                  entity_company_regno:company_reg_no,
                  entity_company_phoneno:phone,
                  wallet_id:isCreatdWallt.wallet_id,
                  reflectid_by:'entity',
                  companyCountry:company_country,
                 // entity_password:entity_password,
                  email_verification_status:userData.email_verification_status
              }) ;
              
              if(isCreated){
                res.json({
                  status: 1, msg: "Successfully generated Entity MyRefletId", data: {
                    walletAddress:user_account,
                    user_id:user_id,
                    myrefletCode:reflect_code,
                    type:"Entity",
                    name:decrypt(entity_name),
                    segment:lastSegment
                  }
                });
              
              }else{
                res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
              }
              
             }
           }
         })
       })
         
      })
    }
  }else{
    res.json({ status: 0, msg: "You have already created MyrefletID for this company, ", data: { err_msg: 'Failed'} });
  }
     
  }

//get myrefletId(both entity and natural person)

exports.getAllMyrefletId=async function(req,res){
  let user_id=req.params.user_id;
  try{
    let allData=await MyReflectIdModel.findAll({where:{reg_user_id:user_id,idCreated:'true'}});
    let entity=[];
    let naturalPerson={
      myreflectid:'',
      walletname:'',
      balance:'',
      type:'',
      walletAddress:''
    };
   if(allData.length>0){
    let k=0;
    // console.log("All dattttttttaaaaaaaaaaaa", allData);
       for(let i=0;i<allData.length;i++){
    
         let walletInfo=await WalletModel.findOne({where:{wallet_id:allData[i].wallet_id}});
            if(allData[i].reflectid_by=='representative'){
            
             //  console.log(walletInfo);
              naturalPerson.myreflectid=allData[i].reflect_code;
              naturalPerson.walletname=decrypt(allData[i].rep_username);
              naturalPerson.walletAddress=walletInfo.wallet_address;
              naturalPerson.balance=walletInfo.balance.toString();
              naturalPerson.type='Natural person';
              naturalPerson.balance='0.0'
            }
            if(allData[i].reflectid_by=='entity'){
              console.log("Entity:::::::::",allData[i]);
         
              let entityObj={
                entity_company_name:'',
                entity_name:'',
                walletAddress:'',
                balance:0,
                myreflectid:'',
                entity_company_regno:"",
                entity_company_address:""
              }
              entityObj.myreflectid=allData[i].reflect_code;
              entityObj.entity_name=decrypt(allData[i].entity_name);
              entityObj.walletAddress=walletInfo.wallet_address;
              entityObj.entity_company_regno=decrypt(allData[i].entity_company_regno);
              entityObj.entity_company_address=decrypt(allData[i].entity_company_address);   
              entityObj.entity_name=decrypt(allData[i].entity_name);
              entityObj.entity_company_name=decrypt(allData[i].entity_company_name);
              entityObj.balance=walletInfo.balance.toString();
              entity[k]=entityObj;
              k++;
            }
       }
      //  responsObj={
      //    naturalPerson:naturalPerson,
      //    entity:entity
      //  }
  // if(naturalPerson.myreflectid==''){
  //   naturalPerson={};
  // }
       res.json({
        status: 1, msg: "All MyRefletIDs", data: {
          naturalPerson:naturalPerson,
          entity:entity,
          user_id:user_id
        }
      });

   }else{
    res.json({ status: 0, msg: "You didn't create yet any type of MyrefletID!!", data: { err_msg: 'Failed'} });
   }
   
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
  }
}

//share entity myreflet id to others
exports.shareEntity=async function(req,res){
  let reflet_id=parseInt(req.body.receiver_reflet_id);
  let entity_id=req.body.entity_reflet_id;
  let sender_user_id=parseInt(req.body.sender_user_id);
 // let generated_password=req.body.generated_password;
  try{
      
     let isPresentReflet=await MyReflectIdModel.findOne({where:{reflect_code:reflet_id,reflectid_by:'representative',idCreated:"true"}});
     if(isPresentReflet){
    let alreadyShared= await ShareEntityModel.findOne({where:{shared_entity:entity_id,sender_id:sender_user_id,receiver_id:isPresentReflet.reg_user_id}})
   if(alreadyShared==null){
    let naturalId=await MyReflectIdModel.findOne({where:{reg_user_id:sender_user_id,reflectid_by:'representative',idCreated:'true'}});
   //  console.log(naturalId);
         if(isPresentReflet){
          let user_id=isPresentReflet.reg_user_id;
          console.log("receiverrrrrrr iddddddddddd:",user_id);
            let isShared=await ShareEntityModel.create({
                           sender_id:sender_user_id,
                           receiver_id:user_id,
                           shared_entity:entity_id,
                           entity_owner:naturalId.reflect_code
                         })
                 let userDet=await UserModel.findOne({where:{reg_user_id:sender_user_id}});
                  var dt = dateTime.create();
                  var formatted = dt.format('Y-m-d H:M:S');
                  let msg=`${decrypt(userDet.full_name)} has shared a entityID ${entity_id} with you`;
                   //   msg=encrypt(msg);
                  if(userDet.profile_img_name==null){
                    userDet.profile_img_name=''
                  }
                    await NotificationModel.create({
                      notification_msg:encrypt(msg),
                      notification_type:1,
                      notification_date:formatted,
                      sender_id:sender_user_id,
                      receiver_id:user_id,
                      profile_pic:userDet.profile_img_name,
                      subject:"Sharing Entity"
                    })       
                    pushnotification(user_id,'Entity Sharing',msg);    
                         res.json({ status: 1, msg: "You have shared your entity successfully ", data: { success_msg:'You have shared successfully your entity' } });
              
         }else{
          res.json({ status: 0, msg: "Entered reflet id is invalid!", data: { err_msg: 'Failed' } });
         }
        }else{
          res.json({ status: 0, msg: `You have already shared this entity with ${reflet_id}`, data: { err_msg: 'Failed' } });
        }
      }else{
        res.json({ status: 0, msg: `Invalid myrefletID ${reflet_id}`, data: { err_msg: 'Failed' } });
      }
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}

//api for access shared entity by employee
exports.getEntityByEmployee=async function(req,res){
  let user_id=req.body.user_id;
  try{
    let userData=await UserModel.findOne({where:{reg_user_id:user_id}});
         let sharedEntity=await ShareEntityModel.findAll({where:{receiver_id:user_id,isBlock:'no'}});
         console.log("Shared   dddddddddddddddddddddddddd",sharedEntity);
      
         if(sharedEntity.length>0){
          let refletArr=[];
          let j=0;
           for(let i=0;i<sharedEntity.length;i++){
           
            try{
              var refletData =await MyReflectIdModel.findOne({where:{reflect_code:sharedEntity[i].shared_entity}});
               var naturalIdentity=await MyReflectIdModel.findOne({where:{reg_user_id:refletData.reg_user_id,reflectid_by:'representative'}});
               var walletInfo=await WalletModel.findOne({where:{wallet_id:refletData.wallet_id}});
              }catch(err){
                console.log(err);
                continue;
            //   res.json({ status: 0, msg: "Opps! sharing account got deleted ", data: { err_msg: 'Failed'} });
              }
                let pass='';
                if(sharedEntity[i].password==null||sharedEntity[i].password==''){
                   pass='no'
                }else{
                  pass='yes'
                }
                let entityObj={
                entity_company_name:decrypt(refletData.entity_company_name),
                entity_name:decrypt(refletData.entity_name),
                walletAddress:walletInfo.wallet_address,
                balance:walletInfo.balance.toString(),
                myrefletid:refletData.reflect_code,
                entity_company_regno:decrypt(refletData.entity_company_regno),
                entity_company_address:decrypt(refletData.entity_company_address),
                shared_by:naturalIdentity.reflect_code,
                passwordCreated:pass,
                client_salt:userData.client_salt
              }
              refletArr[j]=entityObj;
              j++;
           }
           res.json({
            status: 1, msg: "All Shared Entity", data: refletArr
          });
         }else{
          res.json({ status: 0, msg: "No entity found", data: { err_msg: 'Failed'} });
         }
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
  }
}


//save password for entity
exports.savePasswordForEntity=async function(req,res){
  let user_id=parseInt(req.body.user_id);
  let entity_id=req.body.entity_id;
  let entityPassowrd=req.body.entityPassword;
  console.log("Passsssssssss",entityPassowrd);
              try{
           let isUser=await ShareEntityModel.findOne({where:{receiver_id:user_id}});
           console.log(isUser);
           if(isUser){
            
                    let userDet=await UserModel.findOne({where:{reg_user_id:user_id}});
                    let tempPass=entityPassowrd+userDet.client_salt;
                    tempPass=crypto.createHash('sha256').update(tempPass).digest('hex');
                    await ShareEntityModel.update({password: tempPass},{where:{shared_entity:entity_id}});
                    res.json({ status: 1, msg: "Saved password", data: { success_msg:'Saved password' } });
           }else{
            res.json({ status: 0, msg: "Invalid user id", data: { err_msg: 'Failed'} });
           }
              }catch(err){
                console.error(err);
                res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
              }
} 

//entity password verify
exports.verifyEntityPass=async function(req,res){
  let entity_id=req.body.entity_id;
  let password=req.body.password;
  console.log("enterd passworddddddddddddddd",password);
  let user_id=parseInt(req.body.user_id);
try{
         let userDet=await UserModel.findOne({where:{reg_user_id:user_id}});
         if(userDet){
          let tempPass=password+userDet.client_salt;
          tempPass=crypto.createHash('sha256').update(tempPass).digest('hex');
          let isMatched=await ShareEntityModel.findOne({where:{shared_entity:entity_id,password:tempPass}});
          if(isMatched){
               res.json({ status: 1, msg: "Successfully access entity ", data: { success_msg: 'Successfully access entity'} });
          }else{
            res.json({ status: 0, msg: "Please enter valid password", data: { err_msg: 'Failed'} });
          }
         }else{
          res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
         }
}catch(err){
  res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
}
}

//get employee who associated with entity
exports.getSharedEmpDet=async function(req,res){
  let entity_id=req.body.entity_id;
  let user_id=parseInt(req.body.user_id);
    try{
          let refDet=await MyReflectIdModel.findOne({where:{reg_user_id:user_id,reflectid_by:'representative',idCreated:'true'}});
            console.log("reflte detttttttttttt:",refDet);
           let sharedDet=await ShareEntityModel.findAll({where:{shared_entity:entity_id,entity_owner:refDet.reflect_code}});
           let sharedArr=[];
                          
           if(sharedDet.length>0){
             for(let i=0;i<sharedDet.length;i++){
                         let empDet = await MyReflectIdModel.findOne({where:{reg_user_id:sharedDet[i].receiver_id,reflectid_by:'representative',idCreated:'true'}})
                      if(sharedDet[i].isBlock==null||sharedDet[i].isBlock=='no'){
                        sharedDet[i].isBlock='no'
                      }else{
                        sharedDet[i].isBlock='yes'
                      }
                      let dt = dateTime.create(sharedDet[i].createdAt);
                      let formatted = dt.format('m/d/Y');
                      let tim=dt.format('H:M:S');
                      let sharedObj={
                        employee_refletid:empDet.reflect_code,
                        block_status:sharedDet[i].isBlock,
                        date:formatted,
                        time:tim,
                        entity_refletid:entity_id
                    }
                    sharedArr[i]=sharedObj;
             }
             res.json({
              status: 1, msg: "All Employee details", data: sharedArr
            });
  
           } else{
            res.json({ status: 0, msg: "No data available", data: { err_msg: 'Failed' } });
           }  
  
    }catch(err){
      console.log(err);
      res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
    }
  }

//block employee
exports.blockEmployeFromEntity=async function(req,res){
  let reflet_id=req.body.emp_reflet_id;
  let o_user_id=req.body.user_id;
  let hint=req.body.action;
  let entity_refletid=req.body.entity_refletid;
try{
   let refletDet=await MyReflectIdModel.findOne({where:{reflect_code:reflet_id,reflectid_by:'representative',idCreated:'true'}});
 let user_id=refletDet.reg_user_id;
   let owner_entity=await UserModel.findOne({where:{reg_user_id:o_user_id}});
   if(hint.toLowerCase()==='block'){
    await ShareEntityModel.update({isBlock:'yes'},{where:{receiver_id:user_id,shared_entity:entity_refletid}});
    let msg=`You are blocked from entity ${entity_refletid} by entity owner ${decrypt(owner_entity.full_name)}.`
    pushnotification(refletDet.reg_user_id,'Blocked',msg);
   let isSent= await updateNotification(user_id,user_id,encrypt(msg),'Blocked',owner_entity.profile_img_name);
    res.json({ status: 1, msg: "Blocked successfully", data: { success_msg: 'Blocked' } });
   }else{
    let msg=`Congratulations!, You are Unblocked from entity ${entity_refletid} by entity owner ${decrypt(owner_entity.full_name)}.`
    pushnotification(refletDet.reg_user_id,'Unblocked',msg);
   let isSent= await updateNotification(user_id,user_id,encrypt(msg),'UnBlocked',owner_entity.profile_img_name);
    await ShareEntityModel.update({isBlock:'no'},{where:{receiver_id:user_id,shared_entity:entity_refletid}});
    res.json({ status: 1, msg: "Unblocked successfully", data: { success_msg: 'Unblocked' } });
   }
}catch(err){
  console.log(err);
res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
}
}

//push notification
// exports.pushnotification = async (userId, titles, bodys) => {
//   //fetching device token from db
//   try{
//   var deviceObj = await tbl_notification_registration_tokens.findOne({where:{reg_user_id:userId}});
//   }catch(err){
//     throw err
//   }
//   let token = deviceObj.registrationToken;

//   console.log("device token.................:", token);
//  var registrationToken = [token];
//   var payload = {
//     notification: {
//       title: titles,
//       body: bodys
//     }
//   };

//   var options = {
//     priority: "high",
//     timeToLive: 60 * 60 * 24
//   };

//   admin.messaging().sendToDevice(registrationToken, payload, options)
//     .then(response => {
//       console.log(response);

//       // return { status: true, data: { response }, msg: "Notification sent successfully", }
//       //  res.status(200).send("Notification sent successfully" + JSON.stringify(response))
//     })
//     .catch(error => {
//       console.log(error);
//     });

// }


//notification
//get api for notification
exports.getNotifications=async function(req,res){
  let user_id=req.body.user_id;
  let page_num=req.body.page_num;
  if(page_num==''){
        
    page_num='0';
    page_num=parseInt(page_num);
  }else{
    page_num=parseInt(page_num);
  }
  try{
        let notificationDet= await NotificationModel.findAll({where:{receiver_id:user_id,deleted:'0'}, offset: page_num,limit:10,order: sequelize.literal('notification_id DESC')});
        let notificationArr=[];
        if(notificationDet.length>0){
        for(let i=0;i<notificationDet.length;i++){
          var dt = dateTime.create(notificationDet[i].notification_date);
          var formatted = dt.format('m/d/Y');
          var tim=dt.format('H:M:S');
          if(notificationDet[i].profile_pic==null){
            notificationDet[i].profile_pic=''
          }
            let notificationObj={
              notification_id:notificationDet[i].notification_id.toString(),
              subject:notificationDet[i].subject,
              message:decrypt(notificationDet[i].notification_msg),
              date:formatted,
              time:tim,
              read_status:notificationDet[i].read_status,
              profile_pic:notificationDet[i].profile_pic
            }
            notificationArr[i]=notificationObj;
        }
        res.json({ status: 1, msg: "All notifications", data:notificationArr });
        }else{
          res.json({ status: 0, msg: "No notification data", data: { err_msg: 'Failed'} });
        }
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}

//delete notification
exports.deleteNotification=async function(req,res){
  console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
  let user_id=req.body.user_id;
  let notification_id=req.body.notification_id;
  console.log("idddddddddddd",notification_id);
  try{
        // let isDeleted =await NotificationModel.destroy({where:{notification_id:notification_id}});
       let isDeleted= await NotificationModel.update({deleted:'1'},{where:{notification_id:notification_id}})
        console.log("Deletedddddddddddddddddddddddddddddddd",isDeleted);
        if(isDeleted){
          res.json({ status: 1, msg: "Deleted", data: { success_msg: 'Deleted'} });
        }else{
          res.json({ status: 0, msg: "Internal issue", data: { err_msg: 'Failed'} });
        }
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
  }
}

//create digital wallet public key
exports.generatePublicKeyDigitalWallet=async function(req,res){
  let user_id=parseInt(req.body.user_id);
  let digital_type=req.body.digital_type;
 // let walletname=encrypt(req.body.wallet_name);  
  let passphrase = 'hkjggh';
  // var reflect_code = generateUniqueId({
  //   length: 4,
  //   useLetters: false,
  //   excludeSymbols: ['0']
  // });
  try{
var user_account='';
    var options = {
    //  url: "http://13.232.156.125:8503",
       url:"http://139.59.83.232:8503",
      method: 'POST',
      headers:
      {
        "content-type": "application/json"
      },
      body: JSON.stringify({ "jsonrpc": "2.0", "method": "personal_newAccount", "params": [passphrase], "id": 1 })
    };
  
    
    let promise = new Promise( async (resolve ,reject) => { 
  
      await request(options, async function (error, response, body) {
      //  console.log("Bodyyyyyyyyyyyyyy:",body);
     
      // console.log('response..................................................  : ', response);
        if ( error ) reject();
          console.log('  first request@@@@@@@@@ ',body);
          var JSONbody = JSON.parse(body);
         console.log('Account - - - - - -',JSONbody);
          account1 = JSONbody.result;
          user_account=account1;
          console.log('Account - - - - - .......................................................................-', account1);
          resolve(account1)
      })
  
    })
    
  var account ;
    promise.then((data)=>{
      account=data
      user_account=data;
     getSegment(account)
    })
    .catch(err=>{
        console.log(err);
        res.json({ status: 0, msg: "Internal issue", data: { err_msg: 'Failed'} });
    })
  
  
    //  let lastSegment="UTC--2021-05-14T04-41-39.136759192Z--24100e77a7389ec2bdd147732f04c99b4e6d79c7";
    async function getSegment(user_account){
    var options = {
      // url: "http://13.232.156.125:8503",
       url:"http://139.59.83.232:8503",
       method: 'POST',
       headers:
       {
         "content-type": "application/json"
       },
       body: JSON.stringify({ "jsonrpc": "2.0", "method": "personal_listWallets", "params": [], "id": 1 })
     };
 
     request(options, async function (error, response, body) {
       // console.log(body.result);
       // console.log(JSON.parse(body).result);
       if(error){
         console.log("opppppppppppppssssssssssssssss errr");
         res.json({ status: 0, msg: "Internal issue", data: { err_msg: 'Failed'} });
       }
       console.log('-------------second request--------');
       var lastSegment;
 
       var c = JSON.parse(body).result;
       // console.log(c);
       c.forEach(function (element) {
         // console.log(element.accounts);
         var accounts_details = element.accounts;
         accounts_details.forEach(async function (element1) {
           // console.log(element1.address);
           let address = user_account.toLowerCase();
           if (element1.address === address) {
             // console.log(element1.url)
             var parts = element1.url.split('/');
             lastSegment = parts.pop() || parts.pop();
             
             console.log("lastSegment:::::::::::::::::::::::::",lastSegment);
             if(lastSegment&&user_account){
              // let userData= await UserModel.findOne({where:{reg_user_id:user_id}});
              // if(userData.email_verification_status=='yes'){
              //   userData.email_verification_status='verified'
              // }else{
              //   userData.email_verification_status='pending'
              // }
              let isCreated=await DigitalWalletRelsModel.create({
                reg_user_id:user_id,
                status:"inactive",
                wallet_address:user_account,
                balance:'0',
                digital_type:digital_type
              }) ;
              
              if(isCreated){
                res.json({
                  status: 1, msg: "Successfully generated public key for digital wallet", data: {
                    walletAddress:user_account,
                    user_id:user_id,
                    segment:lastSegment
                  }
                });
              
              }else{
                res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
              }
              
             }
           }
         })
       })
         
     })
    }
  
}catch(err){
  console.log(err);
  res.json({ status: 0, msg: "Something went wrong", data: { err_msg: 'Failed'} });
}
}


//create digital wallet private key
exports.generatePvtKeyForDigitalWallet=async function(req,res){
    let lastSegment=req.body.segment;
    let user_id=req.body.user_id;
    let wallet_address=req.body.wallet_address;
    var user_pass='hkjggh';
 try{
   console.log("segmenttttttttttttttttttttt",lastSegment);
   var options2 = {
   url:`http://139.59.83.232/devnetwork/node1/keystore/${lastSegment}`,
     method: 'GET',
     headers:
     {
       "content-type": "application/json"
     }
   };
   try{
function finalRes(){
   request(options2, async function (error, response, body) {
     // console.log('-----------------------', options2.url)
     console.log(body);
     // // })
     console.log('-------------3rd request--------');
     // await request.get(` http://34.194.223.110/devnetwork/node1/keystore/${lastSegment}`,function (error, response, body) {
      try{
        var csv = JSON.parse(body);
         }catch(err){
          res.json({ status: 0, msg: "It takes few seconds to generate private key,Please try again after 20sec.", data: { err_msg: 'Failed'} });
         }
     console.log("CSVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",csv);
     var c = web3.eth.accounts.decrypt(csv,user_pass);
     console.log("Private key::::::::::",c.privateKey);
     pk = c.privateKey;
     if(pk){
       await DigitalWalletRelsModel.update({status:'active'},{where:{reg_user_id:user_id,wallet_address:wallet_address}})
     }
     res.json({
       status: 1, msg: "Successfully generated private key", data: {
         privateKey:pk,
         user_id:user_id,
       }
     });
     //  sender_private_key = pk;
     // privateKey  = Buffer.from(sender_private_key, 'hex');
   })
  }
  setTimeout(finalRes,65000);
  
 }catch(err){
   res.json({ status: 0, msg: "Internal error,Please try again.", data: { err_msg: 'Failed'} });
 }

 }catch(err){
   res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
 }

}

//get all digital wallets
exports.getAllDigitalWallets=async function(req,res){
  let user_id=req.body.user_id;
  try{
           let digitals=await DigitalWalletRelsModel.findAll({where:{reg_user_id:user_id,status:'active'},order: sequelize.literal('dig_wallet_rel DESC')});
           let digitalArr=[];
           if(digitals.length>0){
             let linkingStatus='';
                  for(let i=0;i<digitals.length;i++){
                      if(digitals[i].parent_reflect_id==null){
                        linkingStatus='no',
                        digitals[i].parent_reflect_id=''
                      }else{
                        linkingStatus='yes'
                      }
                      if(digitals[i].balance==null){
                        digitals[i].balance='0'
                      }

                     let digitalObj={
                         walletAddress:digitals[i].wallet_address,
                         walletId:digitals[i].dig_wallet_rel.toString(),
                         balance:digitals[i].balance,
                         refletid:digitals[i].parent_reflect_id,
                         isLinked:linkingStatus,
                         digital_type:digitals[i].digital_type,
                         wallet_name:''
                     }
                     digitalArr[i]=digitalObj;
                  }
                  res.json({ status: 1, msg: "All digital wallets", data:digitalArr  });
           }else{
            res.json({ status: 0, msg: "No digital wallet", data: { err_msg: 'Failed' } });
           }
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}

//reflet id linking with wallets
exports.linkingWallet=async function(req,res){
  let reflet_id=parseInt(req.body.reflet_id);
  let wallet_address=req.body.wallet_address;
  let user_id=req.body.user_id;
  let wallet_type=req.body.wallet_type;//digital or crypto
  try{
    if(wallet_type.toLowerCase()=='digital'){
 let digitalDet= await DigitalWalletRelsModel.findOne({where:{reg_user_id:user_id,wallet_address:wallet_address,status:'active'}});
            if(digitalDet.parent_reflect_id==null||digitalDet.parent_reflect_id==''){
 await DigitalWalletRelsModel.update({parent_reflect_id:reflet_id},{where:{reg_user_id:user_id,wallet_address:wallet_address,status:'active'}})
             res.json({ status: 1, msg: `Wallet linking done successfully with MyrefletId ${reflet_id}`, data: { success_msg: 'Success' } });
            }else{
              res.json({ status: 0, msg: `Wallet is already linked with ${digitalDet.parent_reflect_id} MyRefletId`, data: { err_msg: 'Failed' } });
            }
          }else{
           let cryptoWallet=await CryptoWalletModel.findOne({where:{reg_user_id:user_id,public_key:encrypt1(wallet_address),status:'active'}});
            if(cryptoWallet.reflet_code==null||cryptoWallet.reflet_code==''){
                       await CryptoWalletModel.update({reflet_code:reflet_id.toString()},{where:{reg_user_id:user_id,public_key:encrypt1(wallet_address)}});
                       res.json({ status: 1, msg: `Wallet linking done successfully with MyrefletId ${reflet_id}`, data: { success_msg: 'Success' } });
                      }else{
              res.json({ status: 0, msg: `Wallet is already linked with ${cryptoWallet.reflet_code} MyRefletId`, data: { err_msg: 'Failed' } });
            }
          }
            }catch(err){
              console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}

//get unlinked wallet
exports.getUnlinkedWallet=async function(req,res){
  let user_id=req.body.user_id;
  try{
         let allDegitalsUnlink=await DigitalWalletRelsModel.findAll({where:{reg_user_id:user_id,status:'active',parent_reflect_id:null}})
         let allCryptoUnlink=await CryptoWalletModel.findAll({where:{reg_user_id:user_id,status:'active',reflet_code:null}})
        let wallets=[]; 
         if(allDegitalsUnlink.length>0||allCryptoUnlink.length>0){
           let k=0;
               if(allDegitalsUnlink.length>0){
                 for(let i=0;i<allDegitalsUnlink.length;i++){
                  if(allDegitalsUnlink[i].balance==null){
                    allDegitalsUnlink[i].balance='0'
                  }
                     let walletObj={
                       walletAddress:allDegitalsUnlink[i].wallet_address,
                       balance:allDegitalsUnlink[i].balance.toString(),
                       refletid:'',
                       walletid:allDegitalsUnlink[i].dig_wallet_rel.toString(),
                       wallet_type:'digital',
                       name:allDegitalsUnlink[i].digital_type
                     }
                     wallets[k]=walletObj;
                     k++;
                 }
               }
               if(allCryptoUnlink.length>0){
                for(let i=0;i<allCryptoUnlink.length;i++){
                 
                    let walletObj={
                      walletAddress:decrypt1(allCryptoUnlink[i].public_key),
                      balance:allCryptoUnlink[i].balance.toString(),
                      refletid:'',
                      walletid:decrypt1(allCryptoUnlink[i].wallet_address),
                      wallet_type:'crypto',
                      name:decrypt1(allCryptoUnlink[i].wallet_type)
                    }
                   
                    wallets[k]=walletObj;
                    k++;
                }
              }
              res.json({ status: 1, msg: "All unlinked wallets", data: wallets });
        }else{
          res.json({ status: 0, msg: "No wallet available", data: { err_msg: 'Failed'} });
        }
        
        }catch(err){
          console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
  }
}

//get all wallet those r linked with particular refletid 
exports.getAllWalletLinkWithReflet=async function(req,res){
  //let user_id=parseInt(req.body.user_id);
  let reflet_id=parseInt(req.body.reflet_id);
 try{
            //fetch digital wallet
    let digital_wallet=await DigitalWalletRelsModel.findAll({where:{parent_reflect_id:reflet_id}});
    let crypto_wallets=await CryptoWalletModel.findAll({where:{reflet_code:reflet_id}});
    let wallets=[]; 
    if(digital_wallet.length>0||crypto_wallets.length>0){
      let k=0;
          if(digital_wallet.length>0){
            for(let i=0;i<digital_wallet.length;i++){
             if(digital_wallet[i].balance==null){
               digital_wallet[i].balance='0'
             }
                let walletObj={
                  walletAddress:digital_wallet[i].wallet_address,
                  balance:digital_wallet[i].balance.toString(),
                  refletid:digital_wallet[i].parent_reflect_id,
                  walletid:digital_wallet[i].dig_wallet_rel.toString(),
                  wallet_type:'digital',
                  name:digital_wallet[i].digital_type
                }
                wallets[k]=walletObj;
                k++;
            }
          }
          if(crypto_wallets.length>0){
           for(let i=0;i<crypto_wallets.length;i++){
            
               let walletObj={
                 walletAddress:decrypt1(crypto_wallets[i].public_key),
                 balance:crypto_wallets[i].balance.toString(),
                 refletid:crypto_wallets[i].reflet_code.toString(),
                 walletid:decrypt1(crypto_wallets[i].wallet_address),
                 wallet_type:'crypto',
                 name:decrypt1(crypto_wallets[i].wallet_type)
               }
            
               wallets[k]=walletObj;
               k++;
           }
         }
         res.json({ status: 1, msg: "Linked wallets", data: wallets });
   }else{
     res.json({ status: 0, msg: "No linked wallets with this refletID", data: { err_msg: 'Failed'} });
   }
 }catch(err){
   console.log(err);
   res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
 }
}


//create crypto btc wallet
exports.createBtcWallet=async function(req,res){
  let user_id=parseInt(req.body.user_id);
  try{
    var keyPair = bitcoin.ECPair.makeRandom({ network: TESTNET });
   var pkey = keyPair.toWIF();
const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: TESTNET});
const privkey = keyPair.privateKey.toString('hex');
const pubkey = keyPair.publicKey.toString('hex');
console.log("public key",pubkey);
 let isCreatedBtcWallet =await CryptoWalletModel.create({
    public_key:encrypt1(pubkey),
    reg_user_id:user_id,
    wallet_type:encrypt1('BTC'),
    reflectid_by:encrypt1('representive'),
    wallet_address:encrypt1(address)
  })
  //console.log("Created:::::::::::",isCreatedBtcWallet);
  if(isCreatedBtcWallet){
    res.json({
      status: 1, msg: "Successfully Created btc wallet", data: {
        publicKey:pubkey,
        user_id:user_id,
        privateKey:privkey,
        balance:isCreatedBtcWallet.balance.toString(),
        wallet_type:'BTC',
        wallet_id:address
      }})
  }else{
    res.json({ status: 0, msg: "Failed", data: { err_msg: 'Failed'} });
  }

  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
  }
}


// exports.btcbalance=async function(address){
// //  var address="mhJhQGa5gecXjBMSyGuhWTg1ZTAWSqjmCE";
//  // var data = JSON.stringify({ "address": address });
//   //console.log("param ", data)
  
//   var config = {
//     method: 'get',
//     url: `https://api.blockcypher.com/v1/btc/test3/addrs/${address}`,
//     headers: {
//      'Content-Type': 'application/json',
//     },
//   };
//   return axios(config)
//      .then(function (response) {
 
//      //  console.log("BBBBBBBBBBBBBBBBBBBBBBB",response);
//        let balance=response.data.balance;
//        let actuaLBtc=stb.toBitcoin(balance);
//        console.log("BBBBBBBBBBBBBBBBBBBBBBB",actuaLBtc);
//        return actuaLBtc;
//      }) 
//    }

//dashboard
//most recent 10 crypto wallet created
exports.getRecentTenCryptoWallets=async function(req,res){
  let user_id=parseInt(req.body.user_id);
  console.log("user idddddddddddddddd",user_id);
  try{
      let userDet=await UserModel.findOne({where:{reg_user_id:user_id}});  
    //  console.log("detttttttttttttttttttt",userDet);   
       try{
       var allCypto =await CryptoWalletModel.findAll({where:{reg_user_id:user_id},limit:10,order: sequelize.literal('wallet_id DESC')})
       }catch(err){
       // res.json({ status: 0, msg: "Something went wrong", data: { err_msg: 'Failed'} });
       console.log(err);
       }
       var respObj={
        username:decrypt(userDet.full_name),
        userprofile:userDet.profile_img_name,
        user_id:user_id.toString(),
        cryptoWallet:[]
     }    
     try{
       if(allCypto.length>0){ 
              for(let i=0;i<allCypto.length;i++){
                let isLinked='yes'
                if(allCypto[i].reflet_code==null||allCypto[i].reflet_code==''){
                  allCypto[i].reflet_code='';
                  isLinked='no'
                }
                     let cryptoObj={
                       walletId:decrypt1(allCypto[i].wallet_address),
                       balance:allCypto[i].balance.toString(),
                       wallet_type:decrypt1(allCypto[i].wallet_type),
                       walletAddress:decrypt1(allCypto[i].public_key),
                       refletId:allCypto[i].reflet_code.toString(),
                       isLinked:isLinked
                     }
                     if(decrypt1(allCypto[i].wallet_type).toLowerCase()=='ethereum'){
                      let balanceObj=await web3jsAcc.eth.getBalance(cryptoObj.walletId);
                      let balance_eth= web3jsAcc.utils.fromWei(balanceObj, "ether");
                      balance_eth=parseFloat(balance_eth).toFixed(8);
                      cryptoObj.balance=balance_eth.toString();
                    }else{
                      try{
                       let btcBa= await btcbalance(cryptoObj.walletId);
                       btcBa=btcBa.toString();
                      cryptoObj.balance=btcBa;
                     
                      }catch(err){
                        console.log(err);
                        //throw err;
                        //res.json({ status: 0, msg: "Something went wrong", data: { err_msg: 'Failed'} });
                      }
                    }
          


                     respObj.cryptoWallet[i]=cryptoObj
              }
             
              }

            }catch(err){
              console.log(err);
            }
              res.json({ status: 1, msg: "Dashboard data", data: respObj });
          }catch(err){
            console.log(err);
    res.json({ status: 0, msg: "Something went wrong", data: { err_msg: 'Failed'} });
  }
}

//get btc wallet and ethereum
exports.getCryptoWallets=async function(req,res){
  let user_id=req.body.user_id;
  try{
       let cryptoWallets =await CryptoWalletModel.findAll({where:{reg_user_id:user_id},order: sequelize.literal('wallet_id DESC')});
       if(cryptoWallets.length>0){
         let respArr=[];
         for(let i=0;i<cryptoWallets.length;i++){
         
          let respObj={
            publickey:decrypt1(cryptoWallets[i].public_key),
            balance:cryptoWallets[i].balance.toString(),
            walletId:decrypt1(cryptoWallets[i].wallet_address),
            walletType:decrypt1(cryptoWallets[i].wallet_type),
           // refletBy:decrypt1(cryptoWallets[i].reflectid_by),
            isLinked:'',
          //  cryptoimg:decrypt1(cryptoWallets[i].wallet_type)+".png",
            refletid:''
          }
          if(cryptoWallets[i].reflet_code){
            respObj.isLinked='yes';
            respObj.refletid=cryptoWallets[i].reflet_code.toString()
          }else{
            respObj.isLinked='no';
           
          }

          if(decrypt1(cryptoWallets[i].wallet_type).toLowerCase()=='ethereum'){
            let balanceObj=await web3jsAcc.eth.getBalance(respObj.walletId);
            let balance_eth= web3jsAcc.utils.fromWei(balanceObj, "ether");
            balance_eth=parseFloat(balance_eth).toFixed(8);
            respObj.balance=balance_eth.toString();
          }else{
            try{
         let btcba =await btcbalance(respObj.walletId);
         btcba=parseFloat(btcba).toFixed(8);
            respObj.balance=btcba.toString();
            }catch(err){
              console.log(err);
            }
            
          }


          respArr[i]=respObj;
         }
      
         res.json({
          status: 1, msg: "All crypto wallets", data:respArr});
       }else{
        res.json({ status: 0, msg: "No Crypto wallet available!", data: { err_msg: 'Failed'} });
       }
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
  }
}

//create ethereum wallet
exports.createEthereumWallet=async function(req,res){
  let user_id=parseInt(req.body.user_id);
   var mnemonic = bip39.generateMnemonic();
   try{
     var seed = await bip39.mnemonicToSeed(mnemonic);
     var HDwallet = etherHDkey.fromMasterSeed(seed);
     var zeroWallet = HDwallet.derivePath("m/44'/60'/0'/0/0").getWallet();
     var addres = zeroWallet.getAddressString();
     console.log("Adressssssssssssssssssssssssssss:",addres)
     var privatekey = zeroWallet.getPrivateKeyString();
     console.log("Private keyyyyyyyyyyyyyyyyy:",privatekey);
    var publickey = zeroWallet.getPublicKeyString();
    console.log("public keyyyyyyyyyyyyy",publickey);
         let isCreated= await CryptoWalletModel.create({
             public_key:encrypt1(publickey),
             wallet_address:encrypt1(addres),
             reg_user_id:user_id,
             wallet_type:encrypt1('ethereum'),
             reflectid_by:encrypt1("Representative")
            })
            if(isCreated){
             res.json({ status: 1, msg: "wallet created successfully", data: {         
               address:addres,
               privateKey:privatekey,
               publicKey:publickey,
               passphrase:mnemonic} });
            }else{
             res.json({ status: 0, msg: "Failed to create wallet", data: {err_msg:"Failed" } });
            }
 
 
   }catch(err){
     res.json({ status: 0, msg: "Something went wrong", data: {err_msg:"Failed" } });
   }
 }
 
 //import ethereum
exports.importEthereum=async function(req,res){
	let privateKey=req.body.privateKey;
	let user_id=req.body.user_id;
	try{
	//  let ethAccnt=await web3.eth.accounts.privateKeyToAccount(privateKey);
	  var buffPr=EthUtil.toBuffer(privateKey,"utf-8");
	   try{
	  var wallet=eth_wallet.default.fromPrivateKey(buffPr);
	   }catch(err){
		res.json({ status: 0, msg: "Invalid private key!!", data: { err_msg: 'Failed'} });
	   }
	  var publicKey=wallet.getPublicKeyString();
	  console.log("pkkkkkkkkkkkkkkkk",publicKey);
	  var wallet_address=wallet.getAddressString();
	  console.log("waaaaaaaaaaaaaaaaaaa",wallet_address);
	  //balance
	  let balanceObj=await web3jsAcc.eth.getBalance(wallet_address);
	  let balance_eth= web3jsAcc.utils.fromWei(balanceObj, "ether");
	  //creating crypto into db
				var isPresent= await CryptoWalletModel.findOne({where:{reg_user_id:parseInt(user_id),wallet_address:encrypt1(wallet_address)}});
			 if(isPresent){
			  res.json({ status: 0, msg: "This wallet is already prsent!!", data: { err_msg: 'Failed'} });
			 }else{
				let isCreated=await CryptoWalletModel.create({
					public_key:encrypt1(publicKey),
					wallet_address:encrypt1(wallet_address),
					reg_user_id:parseInt(user_id),
					balance:balance_eth,
					wallet_type:encrypt1('ethereum'),
				   })
				   if(isCreated){
					res.json({ status: 1, msg: "Successfully imported ethereum wallet", data: { success_msg: 'Success'} });
				   }else{
					res.json({ status: 0, msg: "Failed to import wallet, please try again", data: { err_msg: 'Failed'} });
				   }
				  }
  
	}catch(err){
	  res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
	}
  }

//import btc
exports.importBtcWallet=async function(req,res){
  let private_key=req.body.privateKey;
  let user_id=req.body.user_id;
  try{
      try{
      var privkey = private_key.split(" ");
      const ecPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privkey[0], 'hex'), { network: bitcoin.networks.testnet })
      
      var pkey = ecPair.toWIF();
      const keyPair = bitcoin.ECPair.fromWIF(pkey, TESTNET);
      //var user_id = req.session.user_id;
      var { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: TESTNET });
      console.log("keypair:::", keyPair)
      var pubkey = keyPair.publicKey.toString("hex");
      console.log("address:::::::::::::::::: : ", address)
      console.log("pubkey :::::::::::::::::::: ", pubkey)



      }catch(err){
        res.json({ status: 0, msg: "Invalid private key", data: { err_msg: 'Failed'} });
      }
      /////,,,,,,,,,,,,,,,,,,,,,,,,,
  

      //..............................
      let isPresentWallet=await CryptoWalletModel.findOne({where:{reg_user_id:user_id,wallet_address:encrypt1(address)}});
    if(isPresentWallet){
      res.json({ status: 0, msg: "This  Wallet address is already imported", data: { err_msg: 'Failed'} });
    }else{
       let isCreated= await CryptoWalletModel.create({
              public_key:encrypt1(pubkey),
              reg_user_id:user_id,
              wallet_type:encrypt1('BTC'),
              reflectid_by:encrypt1('representative'),
              wallet_address:encrypt1(address)
             })
             if(isCreated){
              res.json({ status: 1, msg: "BTC wallet imported successfully", data: { success_msg: 'success'} });
             }else{
              res.json({ status: 0, msg: "Failed to import", data: { err_msg: 'Failed'} });
             }
    }

  }catch(err){
    res.json({ status: 0, msg: "Something went wrong", data: { err_msg: 'Failed'} });
  }
}



//,,,,,,,,,,,,,,,.................Doc stratttttttttttttt.....................................................................

//create folder
exports.createFolder=async function(req,res){
  let user_id=parseInt(req.body.user_id);
  let wallet_address=req.body.wallet_address;
  let folder_name=req.body.folder_name;
  let wallet_type=req.body.wallet_type;
  try{
     let isPresent=await DocFolderModel.findOne({where:{reg_user_id:user_id,wallet_address:encrypt1(wallet_address),folder_name:encrypt1(folder_name)}});
    if(isPresent){
      res.json({ status: 0, msg: "This folder name is already present!", data: { err_msg: 'Failed'} });
    }else{
         let isCreated=await DocFolderModel.create({
                  reg_user_id:user_id,
                  wallet_address:encrypt1(wallet_address),
                  folder_name:encrypt1(folder_name),
                  wallet_type:encrypt1(wallet_type)
                })
                if(isCreated){
                  res.json({ status: 1, msg: "Successfully created folder", data: {success_msg:'Success'} });
                }
    }
    }catch(err){
      console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}

//get document folder list 

exports.getFolderList=async function(req,res){
  let wallet_address=encrypt1(req.body.wallet_address);
  console.log("waletttttttttttttttttttt:",req.body.wallet_address);
  let wallet_type=req.body.wallet_type;
  try{
        let folderList=await DocFolderModel.findAll({where:{wallet_address:wallet_address}});
        let folderDocList=[];
            if(folderList.length>0){
                for(let i=0;i<folderList.length;i++){
                let allDocs= await FilesDocModel.findAll({where:{folder_id:folderList[i].folder_id}});
                let num_of_doc=allDocs.length;
                      let folderObj={
                        folder_id:folderList[i].folder_id.toString(),
                        wallet_address:decrypt1(folderList[i].wallet_address),
                        folder_name:decrypt1(folderList[i].folder_name),
                        num_of_docs:num_of_doc.toString(),
                        wallet_type:wallet_type
                      }
                      folderDocList[i]=folderObj;
                }
                res.json({ status: 1, msg: "All folder list", data:folderDocList });
            }else{
              res.json({ status: 0, msg: "No folder ", data: { err_msg: 'Failed'} });
            }
  }catch(err){
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }}

//send notification function
// exports.updateNotification=async function(sender_userid,receiver_userid,msg,subject,profile_pic){
//   console.log("creating notificationnnnnnnnnnnnnnn");
//   try{
//     var dt = dateTime.create();
//     var formatted = dt.format('Y-m-d H:M:S');
//         let isCreated= await NotificationModel.create({
//               sender_id:sender_userid,
//               receiver_id:receiver_userid,
//               subject:subject,
//               notification_msg:msg,
//               profile_pic:profile_pic,
//               notification_date:formatted
//              })
//              if(isCreated){
//                return true;
//              }else{
//                return false;
//              }
//   }catch(err){
//     throw err
//   }
// }


//upload document
exports.uploadDocument=async function(req,res){
  try{
  const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      if (err) {
       console.log(err);
      }
      var user_id=fields.user_id;
      var doc_id=fields.id_number;
      var doc_name=encrypt1(fields.document_name);
      var doc_folder=fields.folder_id;
      var exp_date = fields.exp_date;
      let isOwnerOfFolder=await DocFolderModel.findOne({where:{reg_user_id:user_id,folder_id:doc_folder}});
      if(isOwnerOfFolder){
         //............................. 
      function makeid(length) {
        var result           = '';
        var characters       = '1234567890';
        var charactersLength = characters.length;
 
            for ( var i = 0; i < length; i++ ) {
               result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
               return result;
      }
        if (!doc_id) {
                doc_id = `AUTO${makeid(4)}MYREFLET`
              }
              //.....................
    let testFile = fs.readFileSync(files.file.path);
    testFile=encrypt1(testFile.toString('base64'));
    let testBuffer = Buffer.from(testFile);
    // let fileBuffer=encrypt(encrypt1(testBuffer));               
      await  ipfs.files.add(testBuffer,async function (err, file) {
        if (err) {
          console.log("err from ejs",err);
          res.json({ status: 0, msg: "Failed to upload document", data: { err_msg: 'Failed' } });
          }else{
            try{
          var isCreated1=await DocumentReflectIdModel.create({doc_unique_code:encrypt1(doc_id),expire_date:exp_date})
            }catch(err){
               console.log(err)
              res.json({ status: 0, msg: "Failed to upload document", data: { err_msg: 'Failed'} });
            }
              try{
                console.log("doc hashhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",file[0].hash);
          var isCreated2= await FilesDocModel.create({user_doc_id:isCreated1.user_doc_id,
                file_content:encrypt(encrypt1(file[0].hash)),
                folder_id:doc_folder,
                doc_name:doc_name
              })
                   //send notification to all associate employee......................
               
        let wallet_address=isOwnerOfFolder.wallet_address;
        console.log("Wallet addresssssssssssssss",wallet_address);
       let wallet_type=decrypt1(isOwnerOfFolder.wallet_type);
        if(wallet_type.toLowerCase()=='btc'||wallet_type.toLowerCase()=='ethereum'){
            let crypto_wallet_info= await CryptoWalletModel.findOne({where:{public_key:wallet_address}});
            if(crypto_wallet_info.reflet_code!==null||crypto_wallet_info.reflet_code!==''){
                      let shared_entity_info=await ShareEntityModel.findAll({where:{shared_entity:crypto_wallet_info.reflet_code,isBlock:'no'}});
                      let uploader_user=await UserModel.findOne({where:{reg_user_id:user_id}});
                       for(let i=0;i<shared_entity_info.length;i++){
                         //to whome with shared 
                           //  let user_Info_for_receiver=await UserModel.findOne({where:{reg_user_id:shared_entity_info[i].receiver_id}});
                             //for owner 
                            // let user_Info_for_owner=await UserModel.findOne({where:{reg_user_id:shared_entity_info[i].sender_id}});

                              // if(user_id==shared_entity_info[i].receiver_id||user_id==shared_entity_info[i].sender_id){
                              //   uploader_user.full_name=encrypt("you");
                              // }
                                                    
                              let msg=`Document ${decrypt1(doc_name)} has been uploaded in wallet ID ${crypto_wallet_info.wallet_address} by ${decrypt(uploader_user.full_name)}`
                              let sentNotificatioToreceiver=  await updateNotification(user_id,shared_entity_info[i].receiver_id,encrypt(msg),'Document uploaded',uploader_user.profile_img_name);
                              let sentNotificatioToOwner=  await updateNotification(user_id,shared_entity_info[i].sender_id,encrypt(msg),'Document uploaded',uploader_user.profile_img_name);
                              pushnotification(shared_entity_info[i].receiver_id,'Uploaded document',msg); 
                              pushnotification(shared_entity_info[i].sender_id,'Uploaded document',msg); 
                            }
                      

            }
        }else{
                let digitalInfo= await DigitalWalletRelsModel.findOne({where:{wallet_address:decrypt1(wallet_address)}});
             //   console.log("Digital walllll",digitalInfo);
                if(digitalInfo.parent_reflect_id!==null||digitalInfo.parent_reflect_id!==''){
                  let shared_entity_info=await ShareEntityModel.findAll({where:{shared_entity:digitalInfo.parent_reflect_id,isBlock:'no'}});
                      var uploader_user=await UserModel.findOne({where:{reg_user_id:user_id}});
                    //  console.log("Uploaderrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",uploader_user);
                       for(let i=0;i<shared_entity_info.length;i++){
                         //to whome with shared 
                           //  let user_Info_for_receiver=await UserModel.findOne({where:{reg_user_id:shared_entity_info[i].receiver_id}});
                             //for owner 
                            // let user_Info_for_owner=await UserModel.findOne({where:{reg_user_id:shared_entity_info[i].sender_id}});

                              // if(user_id==shared_entity_info[i].receiver_id||user_id==shared_entity_info[i].sender_id){
                              //   uploader_user.full_name=encrypt("you");
                              // }
                                                    
                              let msg=`Document ${decrypt1(doc_name)} has been uploaded in wallet ID ${digitalInfo.dig_wallet_rel} by ${decrypt(uploader_user.full_name)}`;
                              try{
                              let sentNotificatioToreceiver=  await updateNotification(user_id,shared_entity_info[i].receiver_id,encrypt(msg),'Document uploaded',uploader_user.profile_img_name);
                              console.log("Sennnnnnnnnnnnnnnnnnnnntttttttttttttt notificationnnnnnnnnnn");
                              let sentNotificatioToOwner=  await updateNotification(user_id,shared_entity_info[i].sender_id,encrypt(msg),'Document uploaded',uploader_user.profile_img_name);
                              pushnotification(shared_entity_info[i].receiver_id,'Uploaded document',msg); 
                              pushnotification(shared_entity_info[i].sender_id,'Uploaded document',msg); 
                              }catch(err){
                                console.log(err);
                              }
                            }
                        
                }
        }
              res.json({ status: 1, msg: "Successfully uploaded document", data: { success_msg:'Success'} });
            }catch(err){
              console.log(err);
              res.json({ status: 0, msg: "Failed to upload document", data: { err_msg: 'Failed'} });
              }
          }
     })
       
    }else{
      res.json({ status: 0, msg: "You're not owner of this folder!!,Please create new folder.", data: { err_msg: 'Failed'} });
    }
    })
 
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}



//get all documents into folder
exports.getFolderDocuments=async function(req,res){
  let folder_id=parseInt(req.body.folder_id);         
  try{
                 
      let allDocs=await FilesDocModel.findAll({where:{folder_id:folder_id}});             
      let docsArr=[];
      if(allDocs.length>0){
               for(let i=0;i<allDocs.length;i++){
              let Ddata = await DocumentReflectIdModel.findOne({where:{user_doc_id:allDocs[i].user_doc_id}});
              // console.log("Datttttttttttttttttt",Ddata);
              if(Ddata.expire_date==null){
                var formatted=''
              }else{
                var dt = dateTime.create(Ddata.expire_date);
                formatted = dt.format('m/d/Y');
              }
              
            
           let filed_det=   await ipfs.files.get(decrypt1(decrypt(allDocs[i].file_content)));
           console.log(filed_det);
      
                  let docObj={
                    uploaded_id:allDocs[i].file_id,
                    doc_id_num:decrypt1(Ddata.doc_unique_code),
                    doc_name:decrypt1(allDocs[i].doc_name),
                    expiresIn:formatted,
                    hash_code:encrypt1(filed_det[0].path),
                    status: Ddata.admin_status
                  }
                  console.log("Objjjjjjjj",docObj)
                  docsArr[i]=docObj;
               }
               res.json({ status: 1, msg: "All documents", data: docsArr });
      }else{
        res.json({ status: 0, msg: "No documents available", data: { err_msg: 'Failed' } });
      }
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
} 

//delete documents
exports.deleteDocs=async function(req,res){
  let uploaded_id=req.body.uploaded_id_array;
  uploaded_id=JSON.parse(uploaded_id);
  let folder_id=parseInt(req.body.folder_id);
  let user_id=parseInt(req.body.user_id);
  try{
    let unDeletedNum=0;
    let deletedNum=0;
       let folderDet=await DocFolderModel.findOne({where:{folder_id:folder_id}});
       let pulbic_key=decrypt1(folderDet.wallet_address);
       console.log("pulbic_key:::::::::;",pulbic_key);
       let walletDet= await DigitalWalletRelsModel.findOne({where:{wallet_address:pulbic_key}});
   if(walletDet.reg_user_id==user_id){
          for(let i=0;i<uploaded_id.length;i++){
            let isSharedDoc=await FilesDocModel.findOne({where:{folder_id:folder_id,file_id:parseInt(uploaded_id[i]),isShared:'yes'}})
                console.log("Doc details:::::::::",isSharedDoc);
            if(isSharedDoc){
                  unDeletedNum++;
                  continue;
                }else{
                 let noShared= await FilesDocModel.findOne({where:{folder_id:folder_id,file_id:parseInt(uploaded_id[i]),isShared:'no'}})
                let user_doc_id=noShared.user_doc_id;
                 var isDeleted1= await FilesDocModel.destroy({where:{folder_id:folder_id,file_id:parseInt(uploaded_id[i]),isShared:'no'}})
                 var isDeleted2=await DocumentReflectIdModel.destroy({where:{user_doc_id:user_doc_id}});
                  deletedNum++;
                }
          }
          if(unDeletedNum>0&&deletedNum>0){
            res.json({ status: 1, msg: "Some documents failed to delete due to documents have sent to verifier", data: { success_msg: 'Success'} });
          }else if(unDeletedNum==0&&deletedNum>0){
            res.json({ status: 1, msg: "Selected documents deleted successfully", data: { success_msg: 'success'} });
          }else if(unDeletedNum>0&&deletedNum==0){
            res.json({ status: 0, msg: "Deletion operation failed due to selected documents have sent to verifier", data: { success_msg: 'Success'} });
          }else{
            res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
          }
       
        }else{
          res.json({ status: 0, msg: "You are not authorized to delete this file! ", data: { err_msg: 'Failed'} });
        }        
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}


//kyc verification doc
exports.uploadKyc=async function(req,res){
  try{
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      if (err) {
       console.log(err);
      }
      var user_id=parseInt(fields.user_id);
      // var doc_id_num=fields.doc_id_number;
      var doc_name=encrypt1(fields.document_name);

    let testFile = fs.readFileSync(files.file.path);
    //testFile=encrypt(encrypt1(testFile));
    let testBuffer = new Buffer(testFile);
    // let fileBuffer=encrypt(encrypt1(testBuffer));               
      await ipfs.files.add(testBuffer,async function (err, file) {
        if (err) {
          console.log("err from ejs",err);
          res.json({ status: 0, msg: "Failed to upload document", data: { err_msg: 'Failed' } });
          }else{
                   let userDetails=await UserModel.findOne({where:{reg_user_id:user_id}});
                  //notification to admin for kyc verification
                  let msg=`Received KYC verification request from ${userDetails.full_name}`
                 
                   let isCreated = await KycModel.create({
                      doc_content:encrypt(encrypt1(file[0].hash)),
                      reg_user_id:user_id,
                      doc_name:doc_name
                     }) 
                    
                     let notificationSend=await adminNotificationModel.create({
                      notification_msg:encrypt1(msg),
                      sender_id:user_id,
                      receiver_id:user_id
                      })
                     if(isCreated){
                      res.json({ status: 1, msg: "Document uploaded successfully, It will take 1-5 days for verification.", data: { success_msg:'Success' } });
                     }else{
                      res.json({ status: 0, msg: "Failed", data: { err_msg: 'Failed'} });
                     }

          }
     })
       
  
    })
 
  }catch(err){
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}

//show document 

exports.showDocuments=async function(req,res){
  let file_id=parseInt(req.params.uploaded_id);
try{
     let file_det=await FilesDocModel.findOne({where:{file_id:file_id}});
   if(file_det){
   // var fileContents;
   let hashCode=decrypt1(decrypt(file_det.file_content));
  //   let hashcode="QmYmzsfz58t21XeH7cL6kw9S5J7t6wNpBGpBdJ4ZMjs1tF";
      await ipfs.files.get(hashCode,async (err,files)=>{       
        files.forEach((file) => {
          console.log("pathhhhhhhhhhhhhhhhhhh:",file); 
          filename=file.path;
          let fileContents=file.content.toString();
          let d1=decrypt1(fileContents);
          console.log("First decryptttttttttt",d1);
          res.json({ status: 1, msg: "File sent", data: { file_in_base64:d1} });
          })
      })
     
     }else{
      res.json({ status: 0, msg: "Internal error", data: { err_msg: 'Failed'} });
     }
}catch(err){
  console.log(err);
  res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
}
}



//get docList
exports.getDocTypeList=async function(req,res){
  try{
  let allDocTyps= await DocumentMasterModel.findAll({where:{status:'active'}});

  res.json({ status: 1, msg: "All document types", data: allDocTyps });
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}

//share documents
exports.shareDocuments=async function(req,res){
  let sender_user_id=req.body.sender_user_id;
  let receiver_refletid=req.body.receiver_refletid;
  let uploaded_id=req.body.uploaded_id;
 var sender_wallet_address=req.body.sender_public_key;
 //uploaded_id=JSON.parse(uploaded_id);
 let senders_pvt=req.body.sender_pvt_key;
// let senders_pvt="0x75accf5af81d589302e90d652553a3a4b17cbb65cf9b2d73336959f9e21cbfda";
 let senders_pvt_key=senders_pvt.substring(2);
  console.log("Sender private key",senders_pvt_key);
 let wallet_type=req.body.wallet_type;
 console.log("Wallletttttttttt typeeeeeee");
  var dt           = dateTime.create();
  var formatted    = dt.format('Y-m-d H:M:S');
  try{
    if(wallet_type.toLowerCase()=='btc'||wallet_type.toLowerCase()=='ethereum'){
      
      res.json({ status: 0, msg: "In present, cannot send document from crypto wallets", data: { err_msg: 'Failed' } });
    }else{
   // checking receiver prsent or not....................
    let isReceiverPresent=await MyReflectIdModel.findOne({where:{reflect_code:receiver_refletid,reflectid_by:'representative'}});
    if(isReceiverPresent){
      //fetching receiver wallet address
     let receiver_wallet_det=await WalletModel.findOne({where:{wallet_id:isReceiverPresent.wallet_id}}); 
     var rec_wallet_address=receiver_wallet_det.wallet_address;          
    //fetching receiver email id..............
        let recPersDet=await UserModel.findOne({where:{reg_user_id:isReceiverPresent.reg_user_id}});
        var receiver_email=encrypt1(recPersDet.email);
        var receiver_birth_address=recPersDet.birthplace;
        var receiver_name=recPersDet.full_name;
        var receiver_profile=recPersDet.profile_img_name;
    //verify entered private key...........................................................
 
    try{
      var accnt_det=await web3.eth.accounts.privateKeyToAccount(senders_pvt);
      console.log("Accnttttttttt",accnt_det);

     let send_add= accnt_det.address;
     console.log("Generated wallet addressssssssss",send_add);
      if(sender_wallet_address!=send_add.toLowerCase()){
        res.json({ status: 0, msg: "You entered invalid private key", data: { err_msg: 'Failed' } });
      }else{
          //private key verification end...............

    let senderUserDet=await MyReflectIdModel.findOne({where:{reg_user_id:sender_user_id,reflectid_by:'representative',idCreated:'true'}})
    let sender_reflet_id=senderUserDet.reflect_code.toString();
    

    //fetch sender email id
     let senderPersDet= await UserModel.findOne({where:{reg_user_id:sender_user_id}});
     var sender_email=encrypt1(senderPersDet.email);
      var sender_profile_pic=senderPersDet.profile_img_name;
      var sender_name=decrypt(senderPersDet.full_name);

    const user = contractABI;
    var contract =  new web3.eth.Contract(user,contractAddress);
   // console.log("Contractttttttttttttt",contract);
 
  
    let fileDet=await FilesDocModel.findOne({where:{file_id:uploaded_id}});
    let imgContent= await ipfs.files.get(decrypt1(decrypt(fileDet.file_content)));
    let docHash=imgContent[0].path.toString();
    let doc_names=fileDet.doc_name;
  
console.log("doccccccccccccccc nameeee",doc_names);
    let request_status='pending';
    let reason="Sharing";
 let txCount= await web3.eth.getTransactionCount(sender_wallet_address);
console.log("Processinggggggggggggggggg",txCount);


    var estimates_gas = await web3.eth.estimateGas({from: sender_wallet_address, to: rec_wallet_address,  data:contract.methods.addDocument(docHash, receiver_email, sender_email, doc_names, receiver_refletid, sender_reflet_id,request_status,reason).encodeABI() })
    console.log("Processinggggggggggggggggg2222222");
 console.log("estimateedddddddd gas",estimates_gas);

    // var gasPrice=web3js.utils.toHex(web3js.utils.toWei('50','gwei'));
    var gasPrice_bal = await web3.eth.getGasPrice();
     var gasPrice = web3.utils.toHex(gasPrice_bal)*2;
   // var gasPrice = web3.utils.toHex(100000000000000000);
    console.log("gasPrice", gasPrice);
    var gasLimit = web3.utils.toHex(estimates_gas * 2*2);
     console.log("Gas limitttttttt",gasLimit);
    var transactionFee_wei = gasPrice * gasLimit;
    var transactionFee = web3.utils.fromWei(web3.utils.toBN(transactionFee_wei), 'ether');
    console.log("Transaction feeeeeeeeeee",transactionFee);
    var nonce = web3.utils.toHex(txCount);
    var nonceHex = web3.utils.toHex(nonce);
 console.log("nonce,,,,,,,,,,,,,",nonceHex);
    const txObject = {
      nonce: nonceHex,
      to: contractAddress,
      data:contract.methods.addDocument(docHash, receiver_email, sender_email, doc_names, receiver_refletid, sender_reflet_id,request_status,reason).encodeABI(),
      //value:'0x1',
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      // gas:estimates_gas,
    }

    //  const tx = new Tx(txObject,{chain:'ropsten', hardfork: 'petersburg'});

    const tx = new Tx(txObject);
    console.log("Private key::::::",senders_pvt_key);
    let pvtKey = Buffer.from(senders_pvt_key,'hex');
    tx.sign(pvtKey)

    const serializedTx = tx.serialize();
    const raw = '0x' + serializedTx.toString('hex');

    serializedTx.toString('hex')

    // Broadcast the transaction
    web3.eth.sendSignedTransaction(raw, async (err, txHash) => {
      //if failed
        if (err) {
          res.json({ status: 0, msg: "Sharing Document failed!", data: { err_msg: 'Failed'} });
        }
        else {
            console.log('txHash:', txHash, 'transfess', transactionFee);
             //upload transaction history for sender
            await DocumentTransactionModel.create({
              transaction_hash:encrypt1(txHash),
              sender_wallet_pubKey:encrypt1(sender_wallet_address),
              receiver_wallet_pubKey:encrypt1(rec_wallet_address),
              receiver_refletid:receiver_refletid,
              reg_user_id:sender_user_id,
              receiver_birth_address:receiver_birth_address,
              file_id:uploaded_id,
              amount:"0",
              receiver_name:receiver_name,
              action:"shared",
             })
            
             //sending main notification to sender
             let msg=`Successfully you shared document ${decrypt1(doc_names)} with ${decrypt(receiver_name)}`;
            await updateNotification(sender_user_id,sender_user_id,encrypt(msg),'Document sharing',sender_profile_pic);
            pushnotification(sender_user_id,'Shared document',msg);
            
           //receiver side transaction history
           await DocumentTransactionModel.create({
            transaction_hash:encrypt1(txHash),
            sender_wallet_pubKey:encrypt1(sender_wallet_address),
            receiver_wallet_pubKey:encrypt1(rec_wallet_address),
            receiver_refletid:receiver_refletid,
            reg_user_id:isReceiverPresent.reg_user_id,
            receiver_birth_address:receiver_birth_address,
            file_id:uploaded_id,
            amount:"0",
            receiver_name:receiver_name,
            action:"received",
           })

           //sending main notification to receiver
           let msg2=`Received documents ${decrypt1(doc_names)} from ${sender_name}`;
           await updateNotification(sender_user_id,isReceiverPresent.reg_user_id,encrypt(msg2),'Document received',sender_profile_pic);
           pushnotification(isReceiverPresent.reg_user_id,'Document received',msg2);
                
           await FilesDocModel.update({isShared:'true'},{where:{file_id:uploaded_id}});

           let respObj={
            txHash: txHash,
            transactionFee: transactionFee
           }
            res.json({ status: 1, msg: "Successfully shared document", data: respObj  });
        }
        // Now go check etherscan to see the transaction!
    })
      }
    }catch(err){
      res.json({ status: 0, msg: "You entered invalid private key", data: { err_msg: 'Failed' } });
    }
    
    
}else{
  res.json({ status: 0, msg: "Please enter valid natural person MyRefletID!", data: { err_msg: 'Failed'} });
}
    }
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}


//get shared and recived doc history
exports.getSharedDocumentsHistory=async function(req,res){
  let user_id=req.body.user_id;
       try{
             let transactionDets=await DocumentTransactionModel.findAll({where:{reg_user_id:user_id},order: sequelize.literal('transaction_id DESC')});
                      let transArr=[];
                        if(transactionDets.length>0){
                        for(let i=0;i<transactionDets.length;i++){
                          let file_info=await FilesDocModel.findOne({where:{file_id:transactionDets[i].file_id}});
                          //fetching identity number
                          let Ddata = await DocumentReflectIdModel.findOne({where:{user_doc_id:file_info.user_doc_id}});
                          // console.log("Datttttttttttttttttt",Ddata);
                          if(Ddata.expire_date==null){
                            var formatted=''
                          }else{
                            var dt = dateTime.create(Ddata.expire_date);
                            formatted = dt.format('m/d/Y');
                          }
                       
                         
                           let refleInfo=await MyReflectIdModel.findOne({where:{reg_user_id:transactionDets[i].reg_user_id,reflectid_by:'representative',idCreated:'true'}});
                           let reflet_id=refleInfo.reflect_code;
                          
                        
                     //  let filed_det= await ipfs.files.get(decrypt1(decrypt(file_info.file_content)));
                   //    console.log(filed_det);

                          let transObj={
                            uploaded_id:transactionDets[i].file_id,
                            doc_name:decrypt1(file_info.doc_name),
                            doc_id_num:decrypt1(Ddata.doc_unique_code),
                            expiresIn:formatted,
                            reflet_id:reflet_id,
                            transaction_hash:decrypt1(transactionDets[i].transaction_hash),
                            action:transactionDets[i].action
                          }

                          transArr[i]=transObj;
                        }
                        res.json({ status: 1, msg: "documents history", data:transArr });
                     }else{
                      res.json({ status: 0, msg: "No document history", data: { err_msg: 'Failed'} });
                     }
            }catch(err){
              console.log(err);
              res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
       }
}


//get registerd verifier list
exports.getVerifierList=async function(req,res){
  try{
           //let allverifiers=await VerifierModel.findAll({where:{status:'active'}});
           let  allverifiers=await MyReflectIdModel.findAll({where:{user_as:'verifier',deleted:'0'}});
           let verifierArr=[];
          //  if(allverifiers.length>0){
          //           for(let i=0;i<allverifiers.length;i++){
          //         let refInfo=await MyReflectIdModel.findOne({where:{reflect_code:allverifiers[i].natural_reflet_id,reflectid_by:'representative'}});
          //          let userInfo=await UserModel.findOne({where:{reg_user_id:refInfo.reg_user_id}});
          //             let verifierObj={
          //               verifierName:decrypt(userInfo.full_name),
          //               verifierRefletId:allverifiers[i].natural_reflet_id
          //             }
          //             verifierArr[i]=verifierObj;
          //           }

            if(allverifiers.length>0){
                    for(let i=0;i<allverifiers.length;i++){
                   let userInfo=await UserModel.findOne({where:{reg_user_id:allverifiers[i].reg_user_id}});
                      let verifierObj={
                        verifierName:decrypt(userInfo.full_name),
                        verifierRefletId:allverifiers[i].reflect_code,
                      }
                      verifierArr[i]=verifierObj;
                    }

                    res.json({ status: 1, msg: "All verifiers", data: verifierArr});
           }else{

            res.json({ status: 0, msg: "No verifiers available", data: { err_msg: 'Failed'} });
           }
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}


//send to verifier
exports.sendDocToVerifier=async function(req,res){
  let sender_public_key=req.body.sender_public_key;
  let veri_reflet_id=req.body.veri_reflet_id;
  let veri_name=req.body.veri_name;
  let uploaded_id=req.body.uploaded_id;
  let wallet_type=req.body.wallet_type;
  let sender_private_key=req.body.natural_reflet_privatekey;
  console.log("entereddddddddddddddd private keyyyyyyyyyyyyyy",sender_private_key);
  // let senders_pvt="0x75accf5af81d589302e90d652553a3a4b17cbb65cf9b2d73336959f9e21cbfda";
   let pvt_key=sender_private_key.substring(2);
    //console.log("Sender private key",senders_pvt_key);
  try{
             
    var sender_user_id='';
    if(wallet_type.toLowerCase()=='btc'||wallet_type.toLowerCase()=='ethereum'){
      //fetching sender info
        let  walletInfo=await CryptoWalletModel.findOne({where:{public_key:encrypt1(sender_public_key)}});
        sender_user_id=walletInfo.reg_user_id;
    }else{
      let digital_info=await DigitalWalletRelsModel.findOne({where:{wallet_address:sender_public_key}});
        sender_user_id=digital_info.reg_user_id;
    }
      //fetching sender info.............................
      console.log("Reggggggggggg user iddddddddd",sender_user_id);
          let sender_reflet_info=await MyReflectIdModel.findOne({where:{reg_user_id:sender_user_id,reflectid_by:'representative',idCreated:'true'}});
          console.log("REFLETTTTTTTTTTTT",sender_reflet_info);
          let sender_reflet_id=sender_reflet_info.reflect_code;
          let wallet_info=await WalletModel.findOne({where:{wallet_id:sender_reflet_info.wallet_id}});
          let sender_natural_reflet_wallet_address=wallet_info.wallet_address;
          let sender_userinfo= await UserModel.findOne({where:{reg_user_id:sender_user_id}});
          var sender_email=sender_userinfo.email;
          var sender_profile_pic=sender_userinfo.profile_img_name;
          var sender_name=decrypt(sender_userinfo.full_name);
          try{
            var accnt_det=await web3.eth.accounts.privateKeyToAccount(sender_private_key);
            //console.log("Accnttttttttt",accnt_det);
           var send_add= accnt_det.address;
           console.log("Generated wallet addressssssssss",send_add);
            if(sender_natural_reflet_wallet_address!=send_add.toLowerCase()){
              res.json({ status: 0, msg: "You entered invalid private key", data: { err_msg: 'Failed' } });
            }
          }catch(err){
            res.json({ status: 0, msg: "You entered invalid private key", data: { err_msg: 'Failed' } });
          }

            //fetching verifier details
             let reflet_veri_info= await MyReflectIdModel.findOne({where:{reflect_code:veri_reflet_id,reflectid_by:'representative'}});
             let veri_user_info=await UserModel.findOne({where:{reg_user_id:reflet_veri_info.reg_user_id}});
             let verifier_email=veri_user_info.email;
             let wallet_info_veri=await WalletModel.findOne({where:{wallet_id:reflet_veri_info.wallet_id}});
             let verifier_address=wallet_info_veri.wallet_address;
             let verifier_birth_add=veri_user_info.birthplace;
             let veri_info=await VerifierModel.findOne({where:{natural_reflet_id:veri_reflet_id}});
             let verifier_id=veri_info.verifier_id;
 
          //fetching file details.............................
          let fileDet=await FilesDocModel.findOne({where:{file_id:uploaded_id}});
          let imgContent= await ipfs.files.get(decrypt1(decrypt(fileDet.file_content)));
          let docHash=imgContent[0].path.toString();
          let doc_names=fileDet.doc_name;
          let request_status='pending';
          let reason="Sending for verification";
          const user = contractABI;
          var contract =  new web3.eth.Contract(user,contractAddress);


          let txCount= await web3.eth.getTransactionCount(sender_natural_reflet_wallet_address);
          console.log("Processinggggggggggggggggg",txCount);
          var estimates_gas = await web3.eth.estimateGas({from: verifier_address, to: sender_natural_reflet_wallet_address,  data:contract.methods.addDocument(docHash, verifier_email, sender_email, doc_names, veri_reflet_id, sender_reflet_id,request_status,reason).encodeABI() })
           console.log("estimateedddddddd gas",estimates_gas);
             // var gasPrice=web3js.utils.toHex(web3js.utils.toWei('50','gwei'));
    var gasPrice_bal = await web3.eth.getGasPrice();
    var gasPrice = web3.utils.toHex(gasPrice_bal)*2;
   var gasLimit = web3.utils.toHex(estimates_gas * 2*2);
   var transactionFee_wei = gasPrice * gasLimit;
   var transactionFee = web3.utils.fromWei(web3.utils.toBN(transactionFee_wei), 'ether');
   var nonce = web3.utils.toHex(txCount);
   var nonceHex = web3.utils.toHex(nonce);
console.log("nonce,,,,,,,,,,,,,",nonceHex);
   const txObject = {
     nonce: nonceHex,
     to: contractAddress,
     data:contract.methods.addDocument(docHash, verifier_email, sender_email, doc_names, veri_reflet_id, sender_reflet_id,request_status,reason).encodeABI(),
     //value:'0x1',
     gasLimit: gasLimit,
     gasPrice: gasPrice,
     // gas:estimates_gas,
   }

   //  const tx = new Tx(txObject,{chain:'ropsten', hardfork: 'petersburg'});

   const tx = new Tx(txObject);
   let pvtKey = Buffer.from(pvt_key,'hex');
   tx.sign(pvtKey)

   const serializedTx = tx.serialize();
   const raw = '0x' + serializedTx.toString('hex');

   serializedTx.toString('hex')

   // Broadcast the transaction
   web3.eth.sendSignedTransaction(raw, async (err, txHash) => {
     //if failed
       if (err) {
         res.json({ status: 0, msg: "Document send failed", data: { err_msg: 'Failed'} });
       }
       else {
           console.log('txHash:', txHash, 'transfess', transactionFee);
            //upload transaction history for sender
           await DocumentTransactionModel.create({
             transaction_hash:encrypt1(txHash),
             sender_wallet_pubKey:encrypt1(sender_natural_reflet_wallet_address),
             receiver_wallet_pubKey:encrypt1(verifier_address),
             receiver_refletid:veri_reflet_id,
             reg_user_id:sender_user_id,
             receiver_birth_address:verifier_birth_add,
             amount:"0",
             receiver_name:encrypt1(veri_name),
             action:"sent",
            })
           
            //sending main notification to sender
            let msg=`Successfully you sent document ${decrypt1(doc_names)} to verifier ${veri_name} for verification.`;
           await updateNotification(sender_user_id,sender_user_id,encrypt(msg),'Document sent for verification',sender_profile_pic);
           pushnotification(sender_user_id,'Sent for verification',msg);
           
          //verifier side transaction
             await DocReqForVerificarionModel.create({
              verifier_id:verifier_id,
              doc_file_hash:docHash,
              trans_hash:txHash,
              reason:'For verificatin',
              sender_reflet_id:sender_reflet_id
             })
      
             console.log("Sendingnnngggggggggggggggggggggg notiiiiiiiiiiiiiiiiiiiiiii");
          //sending main notification to verifier
          let msg2=`Received documents ${decrypt1(doc_names)} from ${sender_name} for verification`;
        let isUpdated=  await updateNotification(sender_user_id,reflet_veri_info.reg_user_id,encrypt(msg2),'For verification',sender_profile_pic);
          pushnotification(reflet_veri_info.reg_user_id,'for verification',msg2);


          let respObj={
           txHash: txHash,
           transactionFee: transactionFee
          }
          console.log("Sendingnnngggggggggggggggggggggg");
           res.json({ status: 1, msg: "Successfully sent document to verifier", data: respObj  });
       }
       // Now go check etherscan to see the transaction!
   })
          
    
          
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}



//ether transaction fee (btc and eth both)
exports.getTransactionFee=async function(req,res){
  let sender_wallet_address=req.body.sender_wallet_id;
  let receiver_wallet_address=req.body.receiver_wallet_id;
  let amount=req.body.amount;
  let wallet_type=req.body.wallet_type;
  try{
    if(wallet_type.toLowerCase()=='ethereum'){
    var estimates_gas = await web3jsAcc.eth.estimateGas({ from: sender_wallet_address, to: receiver_wallet_address, amount: web3jsAcc.utils.toWei(amount, 'ether') })
    var gasPrice_bal = await web3jsAcc.eth.getGasPrice();
    var gasPrice = web3jsAcc.utils.toHex(gasPrice_bal);

    console.log("gasPrice", gasPrice);
    var gasLimit = web3jsAcc.utils.toHex(estimates_gas * 2);
     console.log("Gas limitttttttt",gasLimit);
    var transactionFee_wei = gasPrice * gasLimit;
    var transactionFee = web3jsAcc.utils.fromWei(web3jsAcc.utils.toBN(transactionFee_wei), 'ether');
    transactionFee=parseFloat(transactionFee).toFixed(8);
    console.log("Transaction feeeeeeeeeee",transactionFee);
    let afterFeeAmount=parseFloat(amount)-parseFloat(transactionFee);
    afterFeeAmount=afterFeeAmount.toFixed(8);
    if(afterFeeAmount>0){
    res.json({ status: 1, msg: "Transaction fee", data: {transactionFee:transactionFee.toString(),receivingAmount:afterFeeAmount.toString()} });
    }else{
      res.json({ status: 0, msg: "You entered very less amount!", data: {err_msg:'Failed'} });
    }
  }else{

    //for btc transaction feesssssssssssssss
    await bitcoinTransaction.getBalance(sender_wallet_address,{ network:"testnet"}).then(async (balanceInBTC)  => {

      if(balanceInBTC<=amount)
      {
       var fee_rate=await bitcoinTransaction.getFees(bitcoinTransaction.providers.fees.mainnet.default,'hour');
       console.log("fee rate",fee_rate);
       var inputs=1;
       var outputs=2;
       var fee = bitcoinTransaction.getTransactionSize(inputs,outputs)*fee_rate;
      console.log("fees",fee);
       var bitcoin_salt_mult=Math.pow(10,8);
       var accurate_fees=fee/bitcoin_salt_mult;
    //   let fees_msg={success:1,msg:"Success.",fees:accurate_fees };
    res.json({ status: 0, msg: "Amount should be more than transaction fees!", data: {err_msg:'Failed'} });;
      }
      else
      {
       var btc_fees=await bitcoinTransaction.feeTransaction({
        from: sender_wallet_address,
        btc:amount,
        network: "testnet"
      });

        var bitcoin_salt_mult=Math.pow(10,8);
        var accurate_fees=btc_fees/bitcoin_salt_mult;
       var afterFeeAmount=parseFloat(amount)-parseFloat(accurate_fees);
       afterFeeAmount=afterFeeAmount.toFixed(8);
       accurate_fees=accurate_fees.toFixed(8);
       if(afterFeeAmount<=0){
        res.json({ status: 1, msg: "Amount should be more than transaction fees!", data: {transactionFee:accurate_fees,receivingAmount:'0'} });
       }else{
        res.json({ status: 1, msg: "Transaction fee", data: {transactionFee:accurate_fees,receivingAmount:afterFeeAmount.toString()} });
       }
    //   let fees_msg={success:1,msg:"Success.",fees:accurate_fees };
    
      }
      });
  }
    
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
} 


//ethereum transaction
exports.sendEth=async function(req,res){
  let pvtKey=req.body.pvtKey;
  let sender_user_id=req.body.sender_user_id;
  let receiver_wallet_address=req.body.rec_wallet_id;
  let ammount=req.body.amount;
  let sender_wallet_address=req.body.sender_wallet_id;
  var receiver_user_id="";
  var receiver_reflet_id='';
  var receiver_name="";
  var sender_name='';
  try{
    try{
     var senderDet=await UserModel.findOne({where:{reg_user_id:sender_user_id}});
     sender_name=decrypt(senderDet.full_name);
    var senderInfo=await MyReflectIdModel.findOne({where:{reg_user_id:sender_user_id,reflectid_by:'representative',idCreated:true}})
    var sender_reflet_id=senderInfo.reflect_code;
    }catch(err){
      console.log(err);
    }
    var buffPr=EthUtil.toBuffer(pvtKey,"utf-8");
    console.log("buffffffffffffffff",buffPr);
    try{
   var wallet=eth_wallet.default.fromPrivateKey(buffPr);
   console.log("wallllllllllllllllll",wallet);
    }catch(err){
      console.log(err);
     res.json({ status: 0, msg: "Invalid private key!!", data: { err_msg: 'Failed'} });
    }
   var wallet_address=wallet.getAddressString();
   console.log("wallllet addddddddddddd",wallet_address);
   if(wallet_address!==sender_wallet_address){
    res.json({ status: 0, msg: "Invalid private key!!", data: { err_msg: 'Failed'} });
   }


//fetching receiver reg_user_id
      
      var receiver_info=await CryptoWalletModel.findOne({where:{wallet_address:encrypt1(receiver_wallet_address)}});
       if(receiver_info){
         console.log("Feteching receiverrrrrrrrrrrrrrrrrrrrrrrrr");
         receiver_user_id=receiver_info.reg_user_id;
         console.log("Recccccccccccccc id",receiver_user_id);
          var rec_det=await UserModel.findOne({where:{reg_user_id:receiver_user_id}});
          receiver_name=decrypt(rec_det.full_name);
          console.log("Recccccccccccccc name",receiver_name);
       var rec_info=await MyReflectIdModel.findOne({where:{reg_user_id:receiver_user_id,reflectid_by:'representative',idCreated:'true'}})
        receiver_reflet_id=rec_info.reflect_code;
      }
      console.log("Transaction starttttttttttttttttttttt")

   //transactionnnnnnnnnnnnn
  await  web3jsAcc.eth.getTransactionCount(sender_wallet_address, 'pending', async (err, txCount) => {
    if(err){
      console.log(err);
    }
      console.log("Counting strtttttttttttttttt");
            var estimates_gas = await web3jsAcc.eth.estimateGas({ from: sender_wallet_address, to: receiver_wallet_address, amount: web3jsAcc.utils.toWei(ammount, 'ether') })
                  console.log("gass priceeeeeeeeeeeeeeeeeeeeee");
            console.log("estimateedddddddd gas",estimates_gas);
      
                      // var gasPrice=web3js.utils.toHex(web3js.utils.toWei('50','gwei'));
                      var gasPrice_bal = await web3jsAcc.eth.getGasPrice();
                      var gasPrice = web3jsAcc.utils.toHex(gasPrice_bal);
      
                      console.log("gasPrice", gasPrice);
                      var gasLimit = web3jsAcc.utils.toHex(estimates_gas * 2);
                       console.log("Gas limitttttttt",gasLimit);
                      var transactionFee_wei = gasPrice * gasLimit;
                      var transactionFee = web3jsAcc.utils.fromWei(web3jsAcc.utils.toBN(transactionFee_wei), 'ether');
                      console.log("Transaction feeeeeeeeeee",transactionFee);
                      var nonce = web3jsAcc.utils.toHex(txCount)
                      var nonceHex = web3.utils.toHex(nonce);
                      var receiver_get_amount=parseFloat(ammount)-parseFloat(transactionFee);
                      
//amount in dollar
let currentPriceInUsd=await priceOfCrypto.getCryptoPrice('USD','ETH');

var senderAmountInDollar=parseFloat(ammount)*parseFloat(currentPriceInUsd.price).toFixed(8);
senderAmountInDollar= senderAmountInDollar.toString();
var receiverAmountInDollar=receiver_get_amount*parseFloat(currentPriceInUsd.price).toFixed(8);
receiverAmountInDollar=receiverAmountInDollar.toString();
receiver_get_amount=receiver_get_amount.toFixed(8);
                      const txObject = {
                          nonce: nonceHex,
                          to: receiver_wallet_address,
                          value: web3jsAcc.utils.toHex(web3jsAcc.utils.toWei(ammount, 'ether')),
                          gasLimit: gasLimit,
                          gasPrice: gasPrice
                      }
      
                      //  const tx = new Tx(txObject,{chain:'ropsten', hardfork: 'petersburg'});
            pvtKey=pvtKey.substring(2);
                      const tx = new Tx(txObject, { chain: 'ropsten'});
                      console.log("Private key::::::",pvtKey);
                      pvtKey = Buffer.from(pvtKey,'hex');
                      tx.sign(pvtKey)
      
                      const serializedTx = tx.serialize();
                      const raw = '0x' + serializedTx.toString('hex');
      
                      serializedTx.toString('hex')
      
                      // Broadcast the transaction
                      web3jsAcc.eth.sendSignedTransaction(raw, async (err, txHash) => {
                        console.log("Signedddddddddddddddd transaction starteddddddddddddddddd");
                        
                          if (err) {
                              console.log("err", err);
                             await CryptoTransHistoryModel.create({
                              sender_wallet_id:encrypt1(sender_wallet_address),
                              sender_reg_user_id:sender_user_id,
                              sender_reflet_id:sender_reflet_id,
                              receiver_wallet_id:receiver_wallet_address,
                              receiver_reg_user_id:receiver_reg_user_id,
                              receiver_reflect_id:receiver_reflet_id,
                              amount:ammount,
                              wallet_type:"ETH",
                              status:"Failed",
                              reg_user_id:sender_user_id,
                              operation:"sent",
                              amountIndollar:senderAmountInDollar
                             })
                             //send main notification for failed 
                             let msg=`Your transaction failed for amount ${ammount} eth`;
                             await updateNotification(sender_user_id,sender_user_id,encrypt(msg),"ETH Transaction",senderDet.profile_img_name);
                            //send push notification for failed
                               pushnotification(sender_user_id,'ETH transaction',msg);
                              res.json({ status: 0, msg: "Transaction failed,insufficient balance", data: { err_msg: 'Failed'} });
                          }
                          else {
                              console.log('txHash:', txHash, 'transfess', transactionFee);
                                     //update balance of sender
                              let balanceObjsend=await web3jsAcc.eth.getBalance(sender_wallet_address);
                              var balance_eth_send= web3jsAcc.utils.fromWei(balanceObjsend, "ether");   
                              await CryptoWalletModel.update({balance:balance_eth_send},{where:{wallet_address:encrypt1(sender_wallet_address)}});
                               //update balance of receiver
                               let balanceObjrec=await web3jsAcc.eth.getBalance(receiver_wallet_address);
                               var balance_eth_rec= web3jsAcc.utils.fromWei(balanceObjrec, "ether");   
                               await CryptoWalletModel.update({balance:balance_eth_rec},{where:{wallet_address:encrypt1(receiver_wallet_address)}});
                             
                               //add to transaction history for sender
                               await CryptoTransHistoryModel.create({
                                sender_wallet_id:encrypt1(sender_wallet_address),
                                sender_reg_user_id:sender_user_id,
                                transaction_hash:txHash,
                                sender_reflet_id:sender_reflet_id,
                                receiver_wallet_id:encrypt1(receiver_wallet_address),
                                receiver_reg_user_id:receiver_user_id,
                                receiver_reflect_id:receiver_reflet_id,
                                amount:ammount,
                                wallet_type:"ETH",
                                status:"Success",
                                reg_user_id:sender_user_id,
                                operation:"sent",
                                amountIndollar:senderAmountInDollar
                               })
                               //add transaction history for receiver
                               await CryptoTransHistoryModel.create({
                                sender_wallet_id:encrypt1(sender_wallet_address),
                                sender_reg_user_id:sender_user_id,
                                transaction_hash:txHash,
                                sender_reflet_id:sender_reflet_id,
                                receiver_wallet_id:encrypt1(receiver_wallet_address),
                                receiver_reg_user_id:receiver_user_id,
                                receiver_reflect_id:receiver_reflet_id,
                                amount:receiver_get_amount.toString(),
                                wallet_type:"ETH",
                                status:"Success",
                                reg_user_id:receiver_user_id,
                                operation:"received",
                                amountInDollar:receiverAmountInDollar
                               })

                               //send main notifcation for success(sender)
                               if(receiver_name==''){
                                receiver_name=receiver_wallet_address
                               }
                               let mesg1=`Successfully sent ${ammount} ETH to ${receiver_name}`
                               
                               await updateNotification(sender_user_id,sender_user_id,encrypt(mesg1),'ETH transaction',senderDet.profile_img_name)
                               //push for transaction success(sender)
                               pushnotification(sender_user_id,'ETH Transaction',mesg1);
                               //push for debited(sender)
                               let msg2=`${ammount} ETH has been debited from your wallet ID ${sender_wallet_address}`;
                               pushnotification(sender_user_id,'ETH Transaction',msg2);
                               
                                //receiver notification
                                if(receiver_user_id!=''){
                                  var msg3=`You have received amount ${receiver_get_amount} ETH from ${sender_name}.`
                                  await updateNotification(sender_user_id,receiver_user_id,encrypt(msg3),'ETH received',senderDet.profile_img_name);
                                  pushnotification(receiver_user_id,'ETH received',msg3);
                                }
                                


                              res.json({ status: 1, msg: 'Your transaction is done successfully.',data:{ txHash: txHash, transactionFee: transactionFee }});
                          }
                          // Now go check etherscan to see the transaction!
                      })
                  })       



  }catch(err){
    console.log("errrrrrrrrrr",err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}



//for each  wallet transaction history
exports.getEachWalletTransactionHistory=async function(req,res){
  let wallet_address=req.body.wallet_id;
  let wallet_type=req.body.wallet_type;
  let user_id=req.body.user_id;
  try{
          if(wallet_type=='ethereum'||wallet_type.toLowerCase()=='btc'){
           //   let crypto_info=await CryptoWalletModel.findOne({where:{wallet_address:encrypt1(wallet_address),reg_user_id:user_id}});
            let wallet_id=encrypt1(wallet_address);
            let trans_history=await CryptoTransHistoryModel.findAll({where:sequelize.and({reg_user_id:user_id},sequelize.or({sender_wallet_id:wallet_id},{receiver_wallet_id:wallet_id})),order: sequelize.literal('transaction_id DESC')});
              let cryptoTransArr=[];
            if(trans_history.length>0){
                     for(let i=0;i<trans_history.length;i++){
                       let coinName='';
                       if(wallet_type=='ethereum'){
                         coinName='ETH'
                       }else{
                        coinName='BTC'
                       }
                  //      let currentPriceInUsd=await priceOfCrypto.getCryptoPrice('USD',coinName);
                  //     console.log("Current priceeeeeeeeeeeee ",currentPriceInUsd);
                  //  let amountInDollar=parseFloat(trans_history[i].amount)*parseFloat(currentPriceInUsd.price);
                  //  amountInDollar= amountInDollar.toString();
                  if(trans_history[i].amountIndollar!=null){
                    trans_history[i].amountIndollar= parseFloat(trans_history[i].amountIndollar).toFixed(8)+'$';
                  }else{
                    trans_history[i].amountIndollar='0'+'$';
                  }
                      let amount=parseFloat(trans_history[i].amount).toFixed(8);
                      amount=amount.toString();
                        var formatted=''
                        var dt = dateTime.create(trans_history[i].createdAt);
                        formatted = dt.format('m/d/Y');
                         let transObj={
                         action:trans_history[i].action,
                         date:formatted,
                         amount:amount+coinName,
                         amountInDollar:trans_history[i].amountIndollar,
                         transaction_id:trans_history[i].transaction_id.toString(),
                         user_id:trans_history[i].reg_user_id,
                         operation:trans_history[i].operation,
                         status:trans_history[i].status,
                         wallet_type:wallet_type
                       }

                       cryptoTransArr[i]=transObj;
                     }
                     res.json({ status: 1, msg: "All transactions", data:cryptoTransArr });
              }else{
                res.json({ status: 0, msg: "No transactions", data: { err_msg: 'Failed' } });
              }
          }else{
            console.log("Walllllllll ",wallet_address);
                 let digitalInfo=await DigitalWalletRelsModel.findOne({where:{dig_wallet_rel:wallet_address}});
                 console
                 let docs_history=  await DocumentTransactionModel.findAll({where:sequelize.and({reg_user_id:user_id},sequelize.or({sender_wallet_pubKey:encrypt1(digitalInfo.wallet_address)},{receiver_wallet_pubKey:encrypt1(digitalInfo.wallet_address)})),order: sequelize.literal('transaction_id DESC')});
                   console.log("Docs History",docs_history);
                   let transArr=[];
                   if(docs_history.length>0){
                     for(let i=0;i<docs_history.length;i++){
                      let file_det=await FilesDocModel.findOne({where:{file_id:docs_history[i].file_id}});
                 let refDoc=await DocumentReflectIdModel.findOne({where:{user_doc_id:file_det.user_doc_id}});
                    var formatted=''
                    var dt = dateTime.create(docs_history[i].createdAt);
                    formatted = dt.format('m/d/Y');
                     let transObj={
                     action:docs_history[i].action,
                     date:formatted,
                     amount:decrypt1(file_det.doc_name),
                     amountInDollar:decrypt1(refDoc.doc_unique_code),
                     transaction_id:docs_history[i].transaction_id.toString(),
                     user_id:docs_history[i].reg_user_id,
                     operation:docs_history[i].action,
                     status:'success',
                     wallet_type:wallet_type
                   }
                   transArr[i]=transObj;
                  }
              
                  res.json({ status: 1, msg: "All transactions", data:transArr });
                   }else{
                    res.json({ status: 0, msg: "No transactions", data: { err_msg: 'Failed' } });
                   }
         
                }
  }catch(err){
    console.log(err);
          res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}



//get reciept transaction
exports.getTransactionRecieptForWallet=async function(req,res){
  let transaction_id=req.body.transaction_id;
  let wallet_type=req.body.wallet_type;
  try{
    if(wallet_type.toLowerCase()=='btc'||wallet_type.toLowerCase()=='ethereum'){
         let transHist=await CryptoTransHistoryModel.findOne({where:{transaction_id:transaction_id}});
       
       //  let receiver_info_wallet=await CryptoWalletModel({where:{wallet_address:transDet.receiver_wallet_id}});
      //   let sender_info_wallet=await CryptoWalletModel({where:{wallet_address:transDet.}})
          let rec_name=''
          let receiver_address='';
          let receiver_reflet_id='';
          let kyc_doc='';
          let document_sent='';

          if(transHist.operation=='sent'){
          if(transHist.receiver_reg_user_id!=null||transHist.receiver_reg_user_id!=''){
               console.log("recccccccccccc id ",transHist.receiver_reg_user_id);
               let rec_info=await UserModel.findOne({where:{reg_user_id:transHist.receiver_reg_user_id}});
                let rec_ref= await MyReflectIdModel.findOne({where:{reg_user_id:transHist.receiver_reg_user_id,reflectid_by:'representative',idCreated:'true'}});
                let kycDet=await KycModel.findOne({where:{reg_user_id:transHist.receiver_reg_user_id}});
                if(kycDet){
                  kyc_doc=decrypt1(kycDet.doc_name);
                }else{
                  kyc_doc="Not uploaded";
                }
                
            rec_name=decrypt(rec_info.full_name);
            receiver_address=decrypt(rec_info.birthplace);
            receiver_reflet_id=rec_ref.reflect_code;
          }else{
            rec_name='Unknown'
          }
        }else{
          if(transHist.sender_reg_user_id!=null||transHist.sender_reg_user_id!=''){
            let rec_info=await UserModel.findOne({where:{reg_user_id:transHist.sender_reg_user_id}});
            let kycDet=await KycModel.findOne({where:{reg_user_id:transHist.sender_reg_user_id}});
            if(kycDet){
              kyc_doc=decrypt1(kycDet.doc_name);
            }else{
              kyc_doc="Not uploaded";
            }
           
            receiver_reflet_id=transHist.sender_reflet_id;
            receiver_address=decrypt(rec_info.birthplace);
            receiver_reflet_id=transHist.sender_reflet_id;
            rec_name=decrypt(rec_info.full_name);
          }else{
            rec_name='Unknown'
          }
          
        }
         var respObj={
          sender_wallet_addr:decrypt1(transHist.sender_wallet_id),
          receiver_wallet_addr:decrypt1(transHist.receiver_wallet_id),
          name:rec_name,
          address:receiver_address,
          reflet_id:receiver_reflet_id,
          transaction_hash:transHist.transaction_hash,
          amount:transHist.amount,
          amountInDollar:transHist.amountIndollar,
          date:'',
          time:'',
          operation:transHist.operation,
          document_sent:document_sent,
          address_proof:kyc_doc
        }
        if(transHist.amount==null){
          respObj.amount='0'
        }else{
          respObj.amount= parseFloat(respObj.amount).toFixed(8);
        }
        var dt = dateTime.create(transHist.createdAt);
        var formatted = dt.format('m/d/Y');
        var tim=dt.format('H:M:S');
        respObj.date=formatted;
        respObj.time=tim;
        res.json({ status: 1, msg: "Doc receipt", data:respObj });
    }else{
        let transDet=await DocumentTransactionModel.findOne({where:{transaction_id:transaction_id}});
        let rec_name=''
        let receiver_address='';
        let receiver_reflet_id='';
        let kyc_doc='';
        let document_sent='';
        if(transDet.action=='shared'){
          console.log("RECCCCCCCCCCCCCCCCCCCC NAMEEEEEEEEEEE",transDet.receiver_name);
          if(transDet.receiver_name!=null){
            try{
            rec_name=decrypt(transDet.receiver_name);
            }catch(err){
              rec_name='';
              console.log(err);
            }
          }else{
            rec_name='';
          }
          
          receiver_address=decrypt1(transDet.receiver_birth_address);
          receiver_reflet_id= transDet.receiver_refletid;
          let kycDet=await KycModel.findOne({where:{reg_user_id:transDet.reg_user_id}});
          if(kycDet){
            kyc_doc=decrypt1(kycDet.doc_name);
            
          }else{
            kyc_doc="Not uploaded";
          }
          let file_det=await FilesDocModel.findOne({where:{file_id:transDet.file_id}});
          document_sent=decrypt1(file_det.doc_name);
        }else{
              let digi_send_info=await DigitalWalletRelsModel.findOne({where:{wallet_address:decrypt1(transDet.sender_wallet_pubKey)}});  
              
              let sender_user_id=digi_send_info.reg_user_id;
                  let ref_id_info=await MyReflectIdModel.findOne({where:{reg_user_id:sender_user_id,reflectid_by:'representative',idCreated:'true'}});
                  let sender_info=await UserModel.findOne({where:{reg_user_id:sender_user_id}});
                  rec_name=decrypt(sender_info.full_name);
                  receiver_address=decrypt(sender_info.birthplace);
                  receiver_reflet_id=ref_id_info.reflect_code;
                  let kycDet=await KycModel.findOne({where:{reg_user_id:transDet.reg_user_id}});
                  if(kycDet){
                    kyc_doc=decrypt1(kycDet.doc_name);
                    
                  }else{
                    kyc_doc="Not uploaded";
                  }
                 
                  let file_det=await FilesDocModel.findOne({where:{file_id:transDet.file_id}});
                  document_sent=decrypt1(file_det.doc_name);
            }
        var respObj2={
          sender_wallet_addr:decrypt1(transDet.sender_wallet_pubKey),
          receiver_wallet_addr:decrypt1(transDet.receiver_wallet_pubKey),
           name:rec_name,
           address:receiver_address,
          reflet_id:receiver_reflet_id,
          transaction_hash:decrypt1(transDet.transaction_hash),
          amount:transDet.amount,
          date:'',
          time:'',
          action:transDet.action,
          document_sent:document_sent,
          address_proof:kyc_doc,
          operation:transDet.action

        }
        if(transDet.amount==null){
          respObj2.amount='0'
        }else{
          respObj2.amount= parseFloat(respObj2.amount).toFixed(8);
        }
        var dt = dateTime.create(transDet.createdAt);
        var formatted = dt.format('m/d/Y');
        var tim=dt.format('H:M:S');
        respObj2.date=formatted;
        respObj2.time=tim;
        res.json({ status: 1, msg: "Doc receipt", data:respObj2 });
      }
      
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}


//btc transaction fees(not in used)
exports.btcTransactionFees=async(req,res)=>{


  if(req.body.wallet_id==null)
  {

    let fees_msg={success:0,msg:"Please enter wallet address."};
    res.send(fees_msg);

  }
  else if(req.body.amount==null)
  {

    let fees_msg={success:0,msg:"Please enter amount."};
    res.send(fees_msg);

  }
  else
  {

    var addr=req.body.wallet_id;
    var amount=req.body.amount;


     //var btc_trans=await bitcoinTransaction.getBalance(addr,{ network: "mainnet" });
     
    await bitcoinTransaction.getBalance(addr,{ network:"testnet"}).then(async (balanceInBTC)  => {

      if(balanceInBTC<=amount)
      {
       var fee_rate=await bitcoinTransaction.getFees(bitcoinTransaction.providers.fees.mainnet.default,'hour');
       console.log("fee rate",fee_rate);
       var inputs=1;
       var outputs=2;
       var fee = bitcoinTransaction.getTransactionSize(inputs,outputs)*fee_rate;
      console.log("fees",fee);
       var bitcoin_salt_mult=Math.pow(10,8);
       var accurate_fees=fee/bitcoin_salt_mult;

    //   let fees_msg={success:1,msg:"Success.",fees:accurate_fees };
       res.json({ status: 1, msg: "Transaction fees", data: { fees:accurate_fees }});
      }
      else
      {
       var btc_fees=await bitcoinTransaction.feeTransaction({
        from: addr,
        btc:amount,
        network: "testnet"
      });

        var bitcoin_salt_mult=Math.pow(10,8);
        var accurate_fees=btc_fees/bitcoin_salt_mult;

    //   let fees_msg={success:1,msg:"Success.",fees:accurate_fees };
       res.json({ status: 1, msg: "Transaction fees", data: { fees:accurate_fees }});

      }
      });


     
  }

  

}


exports.sendBtc=async function(req,res){
  let pvtKey=req.body.pvtKey;
  let sender_user_id=req.body.sender_user_id;
  let receiver_wallet_address=req.body.rec_wallet_id;
  let amount=req.body.amount;
  let sender_wallet_address=req.body.sender_wallet_id;
  var receiver_user_id="";
  var receiver_reflet_id='';
  var receiver_name="";
  var sender_name='';
  //let pvtKey='0142c07abdc9e7a8f6257d437a01c6fe88d49178764a78d9a6834d2a6e863713';
  //let walletadd="mi9MdfF2Bgv9aeysR67GH7e5p7SR3fD15X";
  try{

   //fetch receiver info
   var receiver_info=await CryptoWalletModel.findOne({where:{wallet_address:encrypt1(receiver_wallet_address)}});
   if(receiver_info){
     console.log("Feteching receiverrrrrrrrrrrrrrrrrrrrrrrrr");
     receiver_user_id=receiver_info.reg_user_id;
     console.log("Recccccccccccccc id",receiver_user_id);
      var rec_det=await UserModel.findOne({where:{reg_user_id:receiver_user_id}});
     if(rec_det){
      receiver_name=decrypt(rec_det.full_name);
     }else{
      receiver_name='';
     }
     
        
      
      
      console.log("Recccccccccccccc name",receiver_name);
   var rec_info=await MyReflectIdModel.findOne({where:{reg_user_id:receiver_user_id,reflectid_by:'representative',idCreated:'true'}});
   if(rec_info){
    receiver_reflet_id=rec_info.reflect_code;
   }else{
    receiver_reflet_id='';
   }
  }

  //sender infooooooooo
  try{
    var senderDet=await UserModel.findOne({where:{reg_user_id:sender_user_id}});
    sender_name=decrypt(senderDet.full_name);
   var senderInfo=await MyReflectIdModel.findOne({where:{reg_user_id:sender_user_id,reflectid_by:'representative',idCreated:'true'}})
   console.log("sender infffffffffffffffffffff",senderInfo);
   var sender_reflet_id=senderInfo.reflect_code;
   }catch(err){
     console.log(err);
   }

    var privateKey = Buffer.from(pvtKey,'hex');
     var privKeyWIF = wif.encode(239,privateKey,true);
    //var privKeyWIF = wif.encode(128,privateKey,true);
        let balanceInBTC= await btcbalance(sender_wallet_address);

  		 console.log("balance:::::::::::::::::::::::::;;",balanceInBTC);

  		if(balanceInBTC<=amount)
  		{
  		//	let trans_msg={success:0,msg:"You do not have enough in your wallet to send that much."};
  	 	//	res.json({trans_msg);
       res.json({ status: 0, msg: "You do not have enough in your wallet to send that much.", data: { err_msg: 'Failed'} });
  		}
  		else
  		{
		var btc_trans=await bitcoinTransaction.sendTransaction({
			from: sender_wallet_address,
			to: receiver_wallet_address,
			privKeyWIF:privKeyWIF,
			btc:amount,
			network: "testnet"
		}).catch((err) =>{

			console.log("error catch",err);

			let trans_msg={success:0,msg:err};
  	 	
      res.json({ status: 0, msg: "Transaction failed", data: { err_msg: 'Failed'} });
      
     
		}).then( async (result)  => {

	// console.log("body",res.body);
	// console.log("---------------------------------------------------------");
	// console.log("Hash: ",res.body.tx.hash,"fees",res.body.tx.fees);

		if(result)
		{

     // console.log("result::::::::::::::::::::::::",result);
      console.log("-------*** transactionnnnnnnnnnn ",result.body.tx)
      console.log("-------*** transaction hashhhhhhhhhhhhhhhh",result.body.tx.hash)

      var haash=JSON.stringify(result);

      var dataString = '{"tx":'+haash+'}';

      var options = {
         // url: 'https://api.blockcypher.com/v1/btc/main/txs/push?token=b5310fa6b2464f5fac9947fb9e82a283',
        //  url:'https://api.blockcypher.com/v1/btc/main/txs/push?token=8454213607a34a1a90f7c9993d3de833',
          url:'https://api.blockcypher.com/v1/btc/test3/txs/push?token=8454213607a34a1a90f7c9993d3de833',
          method: 'POST',
          body: dataString
      };

     async function callback(error, response, body) {
             // console.log("func response",body);

             

          if (!error) {
            // console.log("body::::::::::::::::::::::",body);
             //console.log("stringggggggggggggggggggggggg",JSON.stringify(body));
console.log("brodcastingggggggggggggg")
            var result_data=JSON.parse(body);
          
            // console.log("result::::::::::::::::::::::::::",result_data);

             console.log("feeeeeeeeeeeees",result.body.tx.fees);
             var bitcoin_salt_mult=Math.pow(10,8);
          //  console.log("hash",result.body.tx.fees);
         //   let trans_fees=result.body.tx.fees;
            let rec_amount_in_satoshi=result.body.tx.outputs[0].value;
             let rec_am_btc=rec_amount_in_satoshi/bitcoin_salt_mult;
           console.log("receiver will received amountttttttttttttttttttt",rec_am_btc);
             
          //  var fees_btc=result_data.tx.fees/bitcoin_salt_mult;
//             // console.log("feeeeeeeeeeeeeeeeeeeesssssssssssss",fees_btc);

// //amount in dollar
 let currentPriceInUsd=await priceOfCrypto.getCryptoPrice('USD','BTC');

var senderAmountInDollar=(parseFloat(amount)*parseFloat(currentPriceInUsd.price)).toFixed(8);
senderAmountInDollar= senderAmountInDollar.toString();

var receiverAmountInDollar=(rec_am_btc*parseFloat(currentPriceInUsd.price)).toFixed(8);
receiverAmountInDollar=receiverAmountInDollar.toString();


//   //add to transaction history for sender
  await CryptoTransHistoryModel.create({
    sender_wallet_id:encrypt1(sender_wallet_address),
    sender_reg_user_id:sender_user_id,
    transaction_hash:result.body.tx.hash,
    sender_reflet_id:sender_reflet_id,
    receiver_wallet_id:encrypt1(receiver_wallet_address),
    receiver_reg_user_id:receiver_user_id,
    receiver_reflect_id:receiver_reflet_id,
    amount:amount,
    wallet_type:"BTC",
    status:"Success",
    reg_user_id:sender_user_id,
    operation:"sent",
    amountIndollar:senderAmountInDollar
   })

   
//    //add transaction history for receiver
   await CryptoTransHistoryModel.create({
    sender_wallet_id:encrypt1(sender_wallet_address),
    sender_reg_user_id:sender_user_id,
    transaction_hash:result.body.tx.hash,
    sender_reflet_id:sender_reflet_id,
    receiver_wallet_id:encrypt1(receiver_wallet_address),
    receiver_reg_user_id:receiver_user_id,
    receiver_reflect_id:receiver_reflet_id,
    amount:rec_am_btc.toString(),
    wallet_type:"BTC",
    status:"Success",
    reg_user_id:receiver_user_id,
    operation:"received",
    amountInDollar:receiverAmountInDollar
   })


//          //send main notifcation for success(sender)
         if(receiver_name==''){
          receiver_name=receiver_wallet_address
         }
         let mesg1=`Successfully sent ${amount} BTC to ${receiver_name}`
         
         await updateNotification(sender_user_id,sender_user_id,encrypt(mesg1),'BTC transaction',senderDet.profile_img_name)
         //push for transaction success(sender)
         pushnotification(sender_user_id,'BTC Transaction',mesg1);
         //push for debited(sender)
         let msg2=`${amount} BTC has been debited from your wallet ID ${sender_wallet_address}`;
         pushnotification(sender_user_id,'BTC Transaction',msg2);
         
          //receiver notification
          if(receiver_user_id!=''){
            var msg3=`You have received amount ${rec_am_btc} BTC from ${sender_name}.`
            await updateNotification(sender_user_id,receiver_user_id,encrypt(msg3),'BTC received',senderDet.profile_img_name);
            pushnotification(receiver_user_id,'BTC received',msg3);
          }

          //   let trans_msg={success:1,msg:"Transaction done successfully.",txHash:result_data.tx.hash,fees:fees_btc};
             res.json({status:1,msg:'Transaction done successfully',data:{}});
            // let tempAm=parseFloat(amount)-0.000042;
            //  let tempMsg=`You have received amount ${tempAm} BTC from ${sender_wallet_address}`;
            //  await updateNotification(sender_user_id,receiver_user_id,encrypt(tempMsg),'BTC received',senderDet.profile_img_name);
            //  pushnotification(receiver_user_id,'BTC received',tempMsg);
            // res.json({status:1,msg:'Transaction done successfully',data:{}})
          }
          else
          {
            console.log("error tran",error);

            //  let trans_msg={success:0,msg:error};
              res.json({ status: 0, msg: "Transaction failed", data: { err_msg: 'Failed' } });
          }
      }

     await request(options, callback);
		}
	});

		}
          
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}

