var { UserModel, LogDetailsModel, tbl_log_manage, tokeModel } = require('../../models/user');
var { SecurityMasterModel, UserSecurityModel, CountryCodeModel } = require('../../models/securityMaster');
var { tbl_verifier_plan_master, AdminModel, PlanFeatures, PlanFeatureRel, tbl_verifier_doc_list, MarketPlace, AllotMarketPlace, ContectUsModel, SubscriberModel
} = require('../../models/admin');
var { tbl_verfier_purchase_details } = require("../../models/purchase_detaile")
var { tbl_plan_features } = require("../../models/tbl_plan_features")
var { tbl_plan_feature_rel } = require("../../models/tbl_plan_feature_rel")
var { decrypt, encrypt } = require('../../helpers/encrypt-decrypt')
var os = require('os');
const nodemailer = require("nodemailer");
const express = require('express');
var app = express();
const ejs = require('ejs');
var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime')
var crypto = require('crypto');
var text_func = require('../../helpers/text');
var mail_func = require('../../helpers/mail');
const util = require('util');
const { base64encode, base64decode } = require('nodejs-base64');
var CryptoJS = require("crypto-js");
var userData = require('../../helpers/profile')
var jwt = require('jsonwebtoken');
const Tx = require('ethereumjs-tx')
var bitcoin = require("bitcoinjs-lib")
var { tbl_shared_certified_doc } = require('../../models/certified_shared_documents');
var { NotificationModel } = require('../../models/notification');
var async = require('async');
var axios = require('axios');

const TESTNET = bitcoin.networks.testnet;
var { WalletModel, WalletModelImport } = require('../../models/wallets');
var { MyReflectIdModel, DocumentReflectIdModel } = require('../../models/reflect');
const request = require("request")
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://13.233.173.250:8501"));
const InputDataDecoder = require("ethereum-input-data-decoder");


const { MAIL_SEND_ID,
  PASS_OF_MAIL,
  TOKEN_SECRET,
} = require('../../config/config')


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




function generateAccessToken(username) {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign(username, TOKEN_SECRET);
}
var dt = dateTime.create();
var formatted = dt.format('Y-m-d H:M:S');

/**signup Get Method start**/
exports.signup = (req, res, next) => {

  console.log('*************BTC apies signup******************');

  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');

  db.query(' SELECT * FROM `tbl_countries` WHERE status="active" ORDER BY `country_id` ASC', { type: db.QueryTypes.SELECT })
    .then(countryData => {

      db.query('SELECT * FROM `tbl_country_codes` ORDER BY `iso` ASC', { type: db.QueryTypes.SELECT })
        .then(countryCode => {

          //   res.render('front/register',{
          //                                 success_msg,
          //                                 err_msg,
          //                                 countryData,countryCode
          //                               });


          res.json({
            status: 1, msg: "success", data: {
              countryData,
              countryCode
            }
          });

        })
    })
}
/**signup Get Method End**/

/**submit_register Post Method start**/
exports.submit_register = (req, res, next) => {

  console.log('*************BTC apies submit signup******************', req.body);


  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
  var full_name = encrypt(req.body.f_name);
  var email = encrypt(req.body.email);
  var dob = encrypt(req.body.dob);
  var place_of_birth = encrypt(req.body.place_of_birth);
  var country_code_select = req.body.country_code_select;
  var mobile = encrypt(req.body.mobile);
  var last_name = encrypt(req.body.l_name);

  var now = new Date();
  now.setMinutes(now.getMinutes() + 05); // timestamp
  now = new Date(now); // Date object
  var otp_expire = now

  var otp = encrypt(generateOTP());


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

  let test_pass = Buffer.from(req.body.password, 'base64').toString('ascii')
  var mystr = crypto.createHash('sha256').update(test_pass).digest('hex');

  UserModel.findOne({ where: { email: email } }).then(function (userDataResult) {
    if (userDataResult) {
      res.json({ status: 0, msg: "failed", data: { err_msg: 'User email is already registered.' } });
      //    req.flash('err_msg', 'User email is already registered.')
      //    res.redirect('/signup');
    } else {
      UserModel.findOne({ where: { mobile_number: mobile } }).then(function (userResult) {
        if (userResult) {

          res.json({ status: 0, msg: "failed", data: { err_msg: 'User mobile number is already registered.' } });

          //    req.flash('err_msg', 'User mobile number is already registered.')
          //    res.redirect('/signup');
        } else {
          var steps = parseInt("1")
          UserModel.create({ full_name: full_name, last_name: last_name, email: email, country_code_id: country_code_select, mobile_number: mobile, birthplace: place_of_birth, dob: dob, password: mystr, otp, otp_expire, complete_steps: steps }).then(result => {

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
                status: 1, msg: "success", data: {
                  success_msg: 'OTP has been sent to your email please check.',
                  user_id: userdata.reg_user_id
                }
              });

              // req.flash('success_msg', 'OTP has been sent to your email please check.')
              // res.redirect(`/top_verification?userid=${userdata.reg_user_id}`)

            }).catch(err => {
              console.log("errrrr 2nd findOne", err)
              res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.' } });

            })



          }).catch(err => {
            console.log("update faunction err ", err)
            res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.' } });
          })
        }

      }).catch(err => {
        console.log("errrrr 2st findOne", err)
        res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.' } });
      });
    }

  }).catch(err => {
    console.log("errrrr 1st findOne", err)
    res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.' } });
  });



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
exports.submitOtp = (req, res, next) => {

  console.log("*****BTC**********", req.body)

  var userid = req.body.user_id
  var otp1 = req.body.otp1
  var otp2 = req.body.otp2
  var otp3 = req.body.otp3
  var otp4 = req.body.otp4
  var otp1 = otp1 + otp2 + otp3 + otp4

  console.log(otp1)
  var otp = encrypt(otp1)
  console.log(otp)


  function toTimestamp(strDate) {
    var datum = Date.parse(strDate);
    return datum / 1000;
  }

  UserModel.findOne({ where: { reg_user_id: userid } })
    .then(async (userdata) => {



      var timstampFormDb = parseInt(toTimestamp(userdata.otp_expire))
      var currentTimestamp = parseInt(toTimestamp(new Date()))



      if (userdata) {
        var user_otp = userdata.otp

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
}
/**submitOtp Post Method End**/

/**sequrity_question Get Method Start**/
exports.sequrityQuestion = (req, res, next) => {

  db.query("SELECT * FROM tbl_security_questions")
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

/**submitQuestionAns Post Method Start**/
exports.submitQuestionAns = (req, res, next) => {

  console.log("*****BTC**********", req.body)

  var idUser = req.body.user_id
  var userID = parseInt(req.body.user_id);
  var question = req.body.question
  var answer = req.body.answer
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

/**submitSetPin Post Method Start**/
exports.submitSetPin = (req, res, next) => {

  console.log("*****BTC**********", req.body)

  var userid = req.body.user_id

  var userID = parseInt(req.body.user_id);
  var otp1 = req.body.pin1
  var otp2 = req.body.pin2
  var otp3 = req.body.pin3
  var otp4 = req.body.pin4
  var steps = parseInt("4")

  var otp = otp1 + otp2 + otp3 + otp4

  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');

  var updateValues = {
    user_pin: encrypt(otp),
    updatedAt: formatted,
    complete_steps: steps
  }

  UserModel.update(updateValues, { where: { reg_user_id: userID } }).then((result) => {
    res.json({
      status: 1, msg: "success", data: {
        user_id: userID
      }
    });
    // res.redirect(`/terms-and-conditions?userId=${userID}`);

  }).catch(err => {
    console.log(err)
    res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });

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

/**submit_login Post Method Start**/
exports.submitLogin = (req, res, next) => {  // var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
  // var pass = mykey.update(req.body.password, 'utf8', 'hex')
  // pass += mykey.final('hex');

  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');

  console.log("login password.................befor.....", req.body.password)

  let test_pass = Buffer.from(req.body.password, 'base64').toString('ascii')
  var pass = crypto.createHash('sha256').update(test_pass).digest('hex');


  console.log("login password.................", test_pass)

  var email = encrypt((req.body.email).trim());
  var dt = dateTime.create();
  var login_time = dt.format('Y-m-d H:M:S');
  var blocked_date = dt.format('Y-m-d H:M:S');
  var Ip_addr = req.body.Ip_add
  var steps = parseInt("5")

  console.log("emailemailemailemail : ", email, Ip_addr)

  UserModel.findOne({ where: { email: email, password: pass, complete_steps: steps } }).then(async function (userDataResult) {

    console.log("login password.................", userDataResult)

    if (userDataResult == null) {


      await UserModel.findOne({ where: { email: email } }).then(async (tryLogidata) => {

        console.log("tryLogidata password.................", tryLogidata)

        if (tryLogidata != null) {

          var creatObj = {
            reg_user_id: tryLogidata.reg_user_id,
            login_time,
            ip_address: Ip_addr,
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

                  await UserModel.findOne({ where: { reg_user_id: invalidUserLogindata[0].reg_user_id } }).then(userdata => {

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

                  res.json({ status: 0, msg: "failed", data: { err_msg: 'You are block for 48 hours.' } });


                }).catch(err => console.log("status update err", err))
              } else {

                InvalidLoginAttempt(email, req)
                // req.flash('err_msg', 'You entered wrong credentials.')
                // res.redirect("/login")
                console.log(" steps not complete . You entered wrong credentials.4444444")
                res.json({ status: 0, msg: "failed", data: { err_msg: 'You entered wrong credentials.' } });

              }
              //    console.log("invalidUserLogindata",invalidUserLogindata)
            }).catch(err => console.log("errr", err))


          }).catch(err => console.log("logomodel err....", err))
        } else {
          // req.flash('err_msg', 'You entered wrong credentials.')
          //   res.redirect("/login")
          console.log("You entered wrong credentials.55555555")
          res.json({ status: 0, msg: "failed", data: { err_msg: 'You entered wrong credentials.' } });

        }

      }).catch(err => console.log("trylogin err..", err))


    } else {

      if (userDataResult.status == "inactive") {

        // req.flash('err_msg', 'Your ID is not active, Please accept invitation or contact to admin.')
        // res.redirect("/login")
        res.json({ status: 0, msg: "failed", data: { err_msg: 'Your ID is not active, Please accept invitation or contact to admin.' } });


      } else {

        if (userDataResult.status == "block") {
          // req.flash('err_msg', 'You are blocked for 48 hours, After 48 hours you will be able to login.')
          //     res.redirect("/login")
          res.json({ status: 0, msg: "failed", data: { err_msg: 'You are blocked for 48 hours, After 48 hours you will be able to login.' } });

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


          req.app.locals.userDetail = userDataResult.reg_user_id;
          //successfully login
          // res.redirect('/btc/otp_veri_aft_login');
          res.json({ status: 1, msg: "success", data: { user_id: userDataResult.reg_user_id } });

        }

      }


    }

  })


}
/**submit_login Post Method End**/

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
                  res.json({ status: 0, msg: "somthing went wrong try again", data: { err: 'Error Ocuurred' } });

                  //res.send({message : "somthing went wrong try again"})
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

          res.json({
            status: 1, msg: "success", data: {
              otp_screen: 1,
              user_id: user_reg_id,
              success_msg: "OTP has been sent your email , Pleasse check"
            }
          });


        })


      } else {
        // res.redirect(`/set_pin_aft_lgn/?userid=${user_reg_id}`)
        res.json({
          status: 1, msg: "success", data: {
            otp_screen: 0,
            user_id: user_reg_id
          }
        });
      }


    }).catch(err => {
      console.log("err", err)
      res.json({ status: 0, msg: "failed", data: { err_msg: 'somthing went wrong', error: err } });

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
  var otp_new = otp1 + otp2 + otp3 + otp4
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
          .then(data => {
            // res.redirect(`/set_pin_aft_lgn/?userid=${userid}`)
            res.json({
              status: 1, msg: "success", data: {
                user_id: userid
              }
            });

          }).catch(err => {
            console.log("erros 121", err)
            res.json({ status: 0, msg: "failed", data: { err_msg: 'somthing went wrong', error: err } });


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
            res.json({ status: 0, msg: "failed", data: { err_msg: 'somthing went wrong', error: err } });


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
    res.json({ status: 0, msg: "failed", data: { err_msg: 'somthing went wrong', error: err } });


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

/** set_pin_aft_lgn_submit Get method Start**/
exports.submitSetPinAfterLogin = (req, res, next) => {
  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
  var userid = req.body.user_id
  var userID = parseInt(req.body.user_id);

  console.log(".userid...submit pin......", userid, "userID", userID)

  var otp1 = req.body.pin1
  var otp2 = req.body.pin2
  var otp3 = req.body.pin3
  var otp4 = req.body.pin4
  // var steps=parseInt("4")
  // console.log("1",otp1)
  // console.log("1",otp2)
  // console.log("1",otp3)
  // console.log("1",otp4)
  var otp = encrypt(otp1 + otp2 + otp3 + otp4)

  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');

  // var ip;
  // if (req.headers['x-forwarded-for']) {
  //     ip = req.headers['x-forwarded-for'].split(",")[0];
  // } else if (req.connection && req.connection.remoteAddress) {
  //     ip = req.connection.remoteAddress;
  // } else {
  //     ip = req.ip;
  // }
  // var ip55 =ip.split(":")

  // console.log("client IP is *********************" + ip55[3]);
  var ip = req.body.ip

  UserModel.findOne({ where: { reg_user_id: userID, deleted: "0", status: "active" } }).then(async (result) => {

    console.log("check pin***********", result)

    if (result.user_pin != otp) {

      if (parseInt(result.wrong_otp_count) >= 5) {

        // req.flash('err_msg', 'You have tried so many invalid attempts, please contact to admin.')
        // res.redirect("/login")
        res.json({ status: 0, msg: "failed", data: { err_msg: 'You have tried so many invalid attempts, please contact to admin.' } });


      } else {
        var wrong_otp_count = parseInt(result.wrong_otp_count) + 1
        console.log(" wrong_otp_count :  ", wrong_otp_count)
        // var count_data = {
        //   wrong_otp_count:wrong_otp_count
        // }


        await UserModel.update({ wrong_otp_count: wrong_otp_count }, { where: { reg_user_id: userid, deleted: "0", status: "active" } })
          .then(async (result) => {

            console.log(" donedone :  ", wrong_otp_count)

            // req.flash('err_msg', 'You entered wrong OTP.')
            // res.redirect(`/set_pin_aft_lgn/?userid=${userID}`)

            res.json({ status: 0, msg: "failed", data: { err_msg: 'You entered wrong OTP.', user_id: userID } });

          }).catch(err => {
            console.log(err)
            // res.redirect("/login")
            res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong', err: err } });

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

            const accessToken = generateAccessToken({
              "user": ip
            });
            req.session.token = accessToken
            // res.cookie("jwt", accessToken, {secure: true, httpOnly: true})

            if (req.session.user_type == "validatore") {
              req.session.is_user_logged_in = true;

              // res.redirect(`/validatore_dashboard`);

              //  res.json({status:0,msg:"failed",data:{err_msg:'Somthing went wrong',err : err}});

            } else {

              req.session.is_user_logged_in = true;
              // res.redirect(`/dashboard`);

              res.json({ status: 1, msg: "success", data: { user_id: userID } });

            }

          }).catch(err => console.log("err", err))
        }).catch(err => {
          console.log(err)
          // res.redirect("/login")
          res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong', err: err } });

        })

    }


  }).catch(err => {
    console.log(err)
    // res.redirect("/login")
    res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong', err: err } });

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
 
 const ecPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privkey[0], 'hex'), { network: bitcoin.networks.testnet })
 var pkey = ecPair.toWIF();
  const keyPair = bitcoin.ECPair.fromWIF(pkey,TESTNET);
  // var user_id = req.session.user_id;
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey ,network: TESTNET});
   console.log("keypair:::",keyPair)
   const pubkey = keyPair.publicKey.toString("hex");
   console.log("address : ", address)
   console.log("pubkey : ", pubkey)

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

        res.json({ status: 1, msg: "success", data: { wallet_address: address, allClientReflet, pubkey, user_id } });

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
          .then(result => {
            // console.log("wallet : ", result);
            // res.render('front/wallet/successfully-wallet-msg', { session: req.session, wallet_id: 1 })
            res.json({ status: 1, msg: "success", data: { wallet_address: address, allClientReflet, pubkey, user_id, wallet_id: result.wallet_id } });

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
  const reflect_id = req.body.reflect_id
  const certified = [];
  const doc_data_array = []


  console.log("1st  console___________________________________________________________________________________________")


  await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels  ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id where NOT tbl_client_verification_requests.request_status='pending' and tbl_client_verification_requests.deleted='0' and tbl_client_verification_requests.client_id=" + user_id + " AND tbl_client_verification_requests.reflect_id=" + reflect_id, { type: db.QueryTypes.SELECT }).then(async certified_data => {
    // console.log("certified_data 2",certified_data);
    if (certified_data.length > 0) {
      for (var b = 0; b < certified_data.length; b++) {

        await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id=" + certified_data[b].request_id + " and tbl_request_documents_files.docfile_status<>'pending' GROUP BY tbl_request_documents_files.request_doc_id", { type: db.QueryTypes.SELECT }).then(async certified_doc_data => {


          // console.log("certified_doc_data eldse ",certified_doc_data);


          certified.push({ certified_data: certified_data, certified_doc_data: certified_doc_data });

          // console.log(" certifiedcertifiedcertifiedcertifiedcertifiedcertifiedcertified : ",certified)


        })
      }
    } else {

      res.json({ status: 1, msg: "success", data: {success_msg :"No data found."} });


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


  res.json({ status: 1, msg: "success", data: { all_doc: doc_array } });

  // console.log("doc_array",doc_array);




  console.log("last  console___________________________________________________________________________________________")
}


/**import-btc-wallet-address Get MEthod Start **/
exports.import_btc_submit_private_key = (req, res, next) => {
  var private_key = req.body.private_key;
  var privkey = private_key.split(" ");


  const ecPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privkey[0], 'hex'), { network: bitcoin.networks.testnet })
  var pkey = ecPair.toWIF();
  const keyPair = bitcoin.ECPair.fromWIF(pkey, TESTNET);
  //var user_id = req.session.user_id;
  var user_id = req.body.user_id;
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: TESTNET });
  console.log("keypair:::", keyPair)
  const pubkey = keyPair.publicKey.toString("hex");
  console.log("address : ", address)
  console.log("pubkey : ", pubkey)




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

        res.json({ status: 1, msg: "success", data: { wallet_address: address, pubkey, user_id } });

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
                        res.json({ status: 1, msg: "success", data: { result, WalletModelImport_result, reflect_data } });

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
    for (wallet of btcWallet) {
      console.log('data', typeof (wallet.rep_btc_address));
      // balanceData = await getBalance(wallet.rep_btc_address)
      // console.log('balance----', balanceData.data.balance)
      // if (balanceData.data.balance) {
      //   wallet.balance = balanceData.data.balance;
              wallet.balance = 0;

      //   console.log('balance----', balanceData.data.balance)
      // }

    }
    // res.render('front/wallet/btc-wallet', {btcWallet, base64encode ,user_id});
    res.json({ status: 1, msg: "success", data: { btcWallet, base64encode, user_id } });


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

  return axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      //return JSON.stringify(response.data.data.balance);
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
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

    .then(SharedClientDataResult => {



      page_data = SharedClientDataResult


      console.log("tbl_shared_certified_docs : ", SharedClientDataResult)


      // const SharedClientData = paginate(page_data,page, perPage);

      console.log("tbl_shared_certified_docs : ", SharedClientDataResult)
      res.json({ status: 1, msg: "success", data: { reflect_id, SharedClientData: page_data } });

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

    .then(SharedClientDataResult => {
      // console.log('SharedClientData : ',SharedClientDataResult);

      page_data = SharedClientDataResult
      // const SharedClientData = paginate(page_data,page, perPage);

      //  res.render('front/my_send_doc/myreflect-client-all-doc',{ session:req.session,moment,SharedClientData,reflect_id});
      res.json({ status: 1, msg: "success", data: { SharedClientData: page_data, reflect_id } });


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

      // res.render('front/my_send_doc/client-all-doc-view',{ session:req.session,moment,reflect_id,SharedClientDocument});
      res.json({ status: 1, msg: "success", data: { reflect_id, SharedClientDocument: page_data } });



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

                res.json({ status: 1, msg: "success", data: doc });

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
            res.json({ status: 0, msg: "Something Went wrong", data: { err: "No data available" } });
          }
        });

      }
    }
    else {
      res.json({ status: 0, msg: "Something Went wrong", data: { err: "No data available" } });
    }


  })
    .catch(err => {
      res.json({ status: 0, msg: "Something Went wrong", data: { err: "No data available" } });
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
            console.log(notification)
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
      res.json({ status: 1, msg: "success", data: { success_msg: "Documents has been sent successfully." } });


    }

  })
    .catch(err => {
      console.log(err)
      res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong try again.', err } });
    })

}