var {UserModel,LogDetailsModel,tbl_log_manage}         = require('../../models/user');
var {SecurityMasterModel,UserSecurityModel,
     CountryCodeModel}                                 = require('../../models/securityMaster');
var {tbl_verifier_plan_master,AdminModel,
     PlanFeatures,PlanFeatureRel,
     tbl_verifier_doc_list,MarketPlace,
     AllotMarketPlace,ContectUsModel,SubscriberModel
    }                                                  = require('../../models/admin');
var { tbl_verfier_purchase_details }                   = require("../../models/purchase_detaile")
var { tbl_plan_features }                              = require("../../models/tbl_plan_features")
var { tbl_plan_feature_rel }                           = require("../../models/tbl_plan_feature_rel")
// var {UserModel,LogDetailsModel}=require('../../models/user');
var {tbl_add_on_token}=require('../../models/add-on');
var {WalletModel,WalletModelImport }                   = require('../../models/wallets');
var { MyReflectIdModel,DocumentReflectIdModel }        = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel
     ,DocumentMasterModel}                             = require('../../models/master');
var {MyReflectIdModel, DocumentReflectIdModel,
     FilesDocModel}                                    = require('../../models/reflect');
var {NotificationModel}                                = require('../../models/notification');
var dataUriToBuffer                                    = require('data-uri-to-buffer');
var {ClientVerificationModel,RequestDocumentsModel,
     RequestFilesModel}                                = require('../../models/request');

const express                                          = require('express');
var app                                                = express();
const ejs                                              = require('ejs');
var db                                                 = require('../../services/database');
var sequelize                                          = require('sequelize');
var dateTime                                           = require('node-datetime')

var text_func                                          = require('../../helpers/text');
var mail_func                                          = require('../../helpers/mail');
const util                                             = require('util');
const { base64encode, base64decode }                   = require('nodejs-base64');
const generateUniqueId                                 = require('generate-unique-id');
var userData                                           = require('../../helpers/profile')

const jwt                                              = require("jsonwebtoken");


var async                                              = require('async');

var token                                              = require('crypto').randomBytes(64).toString('hex')

var { decrypt, encrypt }                                         = require('../../helpers/encrypt-decrypt')

let nodemailer                                        = require("nodemailer")



const { MAIL_SEND_ID,
    PASS_OF_MAIL,
    TOKEN_SECRET,
  } = require('../../config/config');

const { result } = require('lodash');





exports.login = async (req ,res ,next )=>{

  console.log(".......",req.body)

    let email = encrypt((req.body.email).trim());
    var steps = parseInt("5")
    var otp = encrypt(generateOTP())

    function generateOTP() { 
      
        var digits = '0123456789'; 
        let OTP = ''; 
        for (let i = 0; i < 4; i++ ) { 
            OTP += digits[Math.floor(Math.random() * 10)]; 
        } 
        return OTP; 
     } 

     var now = new Date();
     now.setMinutes(now.getMinutes() + 05); // timestamp
     now = new Date(now); // Date object
     var otp_expire =now

   await UserModel.findOne({ where: { email: email, complete_steps: steps,deleted:"0",status:"active" } })
    .then(async function (userDataResult) {

        if (userDataResult) {
           console.log("otp  encr..db..."+otp+"..."+decrypt(otp)+userDataResult.reg_user_id)
            await  UserModel.update({otp:otp,otp_expire:otp_expire}, { where: { reg_user_id:userDataResult.reg_user_id ,deleted:"0",status:"active"}})
            .then(async(updateOtp) =>{
              console.log(updateOtp)
                var smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: MAIL_SEND_ID,
                      pass: PASS_OF_MAIL 
                    }
                  });
                  const mailOptions = {
                    to:decrypt(email),
                    from: 'questtestmail@gmail.com',
                    subject: "MyReflet OTP for login.",
              
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
                            <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(userDataResult.full_name)}</h4>
                            <p>Your OTP for MyReflet  is ${decrypt(otp)}</p>
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
    
                  res.json({ status: 1, msg: "success", data: { user_id: userDataResult.reg_user_id ,success_msg :"OTP has been sent to your registered email."  } });


            })    
            .catch(err=>{
                console.log(err)
                res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong' } });
        
            })


 

        } else {

            res.json({ status: 0, msg: "failed", data: { err_msg: 'The user is not registered.' } });

        }

    })
    .catch(err=>{
        console.log(err)
        res.json({ status: 0, msg: "failed", data: { err_msg: 'Somthing went wrong' } });

    })



}

/**submit-otp-of-login Post method Start**/
exports.otp = (req, res, next) => {

  console.log("otp start............................................................")

  var userid = req.body.user_id

  var otp_new = req.body.otp

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

      console.log("dcyrpt db otp ",decrypt(user_otp))
      console.log("dcyrpt enter ",decrypt(otp))

      if (user_otp == otp && timstampFormDb >= currentTimestamp) {

        UserModel.update({ wrong_otp_count: "0" }, { where: { reg_user_id: userid, deleted: "0", status: "active" } })
          .then(async data => {
            

            res.json({
              status: 1, msg: "success", data: {
                user_id: userid
              }
            });

          }).catch(err => {
            console.log("erros 121", err)
            res.json({ status: 0, msg: "failed", data: { err_msg: 'somthing went wrong', error: err } });


          })

      }
      else {

        if (parseInt(userdata.wrong_otp_count) > 9) {

    
          res.json({ status: 0, msg: "failed", data: { err_msg: 'You have tried so many invalid attempts, please try again to log in.' } });

       

        } else {
          wrong_otp_count = parseInt(userdata.wrong_otp_count) + 1
          UserModel.update({ wrong_otp_count }, { where: { reg_user_id: userid, deleted: "0", status: "active" } }).then(data => {
         
            res.json({ status: 0, msg: "failed", data: { err_msg: 'You entered wrong OTP.' } });

          }).catch(err => {
            console.log(err)
        
            res.json({ status: 0, msg: "failed", data: { err_msg: 'somthing went wrong', error: err } });


          })
        }



      }

    } else {
  
      res.json({ status: 0, msg: "failed", data: { err_msg: 'Record not found.' } });

    }
  }).catch(err => {
    console.log(err)
    res.json({ status: 0, msg: "failed", data: { err_msg: 'somthing went wrong', error: err } });

  })
}
/**submit-otp-of-login Post method End**/



async function generateAccessToken(data ,secret) {

  // expires after half and hour (1800 seconds = 30 minutes)
  const tokenString = jwt.sign(data,secret);
  // console.log("token gereat",{secret,tokenString})

  return tokenString

}

async function tokenVerfiyFun(token,SECRET){
  console.log(".......tokenVerfiyFun...............")

let result =await new Promise((resolve,reject)=>{

    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        console.log("jwt error",err)
        resolve({status:"false"})
      }else {
        resolve({status:"true"})
      }
      
    })

  }).then(data=>data)
  .catch(err=>{
    console.log("err",err)
    return err;
  })
 
  // console.log("token tokenVerfiyFun test",{SECRET,token})
    // console.log("tokenVerfiyFun result if111",result)
  
    return result;

}


exports.continue_connection = async (req ,res ,next )=>{

 const {jwt_token = null ,b_token = null ,ip_add = null}  =    req.body
//  console.log(req.body)

 let new_token;

 if ( b_token != null ) {

  new_token = await generateAccessToken({date:new Date()},b_token)

  await movefurther();

 } else {
   
  await toDeleteRecord()
  res.json({ status: 0, msg: "failed", data: { err_msg: 'Browser token is not present'} });


 }

 async function movefurther(){

  let tokeFromTbl = await tbl_add_on_token.findOne({where:{ip_add:ip_add}}).then(data=>data).catch(err=> res.json({ status: 0, msg: "failed", data: { err_msg: 'somthing went wrong'} }))
 
  if (tokeFromTbl) {

    if (!jwt_token) {

      await toDeleteRecord()
      res.json({ status: 0, msg: "failed", data: { err_msg: 'Jwt token is missing'} });
  
    } else {

    let result =  await tokenVerfiyFun(jwt_token,tokeFromTbl.b_token)
   
     if( result.status == "true" ){

      await tbl_add_on_token.update({b_token:b_token},{where:{ip_add:ip_add}}).then(data=>data).catch(err=> res.json({ status: 0, msg: "failed", data: { err_msg: 'somthing went wrong'} }))

      res.json({status: 1, msg: "success", data: {success_msg:"succes",jwt_token:new_token}});

     } else {
     await toDeleteRecord()
      res.json({ status: 0, msg: "failed", data: { err_msg: 'Jwt token invalide'} });
     } 
  
  
    }
  
  
  } else {
  
    await tbl_add_on_token.create({b_token: b_token, ip_add: ip_add ,date:new Date()}).then(data=>data).catch(err=> res.json({ status: 0, msg: "failed", data: { err_msg: 'somthing went wrong'} }))
    res.json({status: 1, msg: "success", data: {success_msg:"succes",jwt_token:new_token}});
  }
  

 }

 async function toDeleteRecord(){
  await tbl_add_on_token.destroy({where:{ip_add:ip_add}}).then(data=>data).catch(err=> res.json({ status: 0, msg: "failed", data: { err_msg: 'somthing went wrong'} }))

 }


}