var {UserModel,LogDetailsModel,tbl_log_manage,tokeModel}                   = require('../../models/user');
var {SecurityMasterModel,UserSecurityModel,CountryCodeModel}     = require('../../models/securityMaster');
var {     tbl_verifier_plan_master,AdminModel,PlanFeatures,PlanFeatureRel,tbl_verifier_doc_list,MarketPlace,AllotMarketPlace,ContectUsModel,SubscriberModel
}                                                                = require('../../models/admin');
var { tbl_verfier_purchase_details }                             = require("../../models/purchase_detaile")
var { tbl_plan_features }                                        = require("../../models/tbl_plan_features")
var { tbl_plan_feature_rel }                                     = require("../../models/tbl_plan_feature_rel")
var { decrypt, encrypt, encrypt1, decrypt1 ,encrypt2,decrypt2} = require('../../helpers/encrypt-decrypt')
var os                                                           = require('os');
const nodemailer                                                 = require("nodemailer");
const express                                                    = require('express');
var app                                                          = express();
const ejs                                                        = require('ejs');
var db                                                           = require('../../services/database');
var sequelize                                                    = require('sequelize');
var dateTime                                                     = require('node-datetime')
var crypto                                                       = require('crypto');
var text_func                                                    = require('../../helpers/text');
var mail_func                                                    = require('../../helpers/mail');
const util                                                       = require('util');
const { base64encode, base64decode }                             = require('nodejs-base64');
var CryptoJS                                                     = require("crypto-js");
var userData                                                     = require('../../helpers/profile')
var jwt                                                          = require('jsonwebtoken');
var path                                                         =require('path');
const {  MAIL_SEND_ID,
         PASS_OF_MAIL,
         TOKEN_SECRET,
}							                                                   = require('../../config/config')

const fs=require('fs');
//new apiiiiiiiiiiiiiiiiii
let csc = require('country-state-city').default;

function generateAccessToken(username) {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign(username, TOKEN_SECRET);
}
var dt              = dateTime.create();
var formatted       = dt.format('Y-m-d H:M:S');




/**signup Get Method start**/
  exports.signup = (req,res,next )=> {

    success_msg = req.flash('success_msg');
    err_msg     = req.flash('err_msg');
        
      db.query(' SELECT * FROM `tbl_countries` WHERE status="active" ORDER BY `country_id` ASC',{type:db.  QueryTypes.SELECT})
      .then(countryData=>{

          db.query('SELECT * FROM `tbl_country_codes` ORDER BY `iso` ASC',{type:db.QueryTypes.SELECT})
          .then(countryCode=>{
           var isShowCity='false';
                          res.render('front/register',{
                                                        success_msg,
                                                        err_msg,
                                                        countryData,countryCode,
                                                        isShowCity
                                                      });
          })
      })
  }
/**signup Get Method End**/

/**submit_register Post Method start**/
exports.submit_register = (req,res,next )=> {
console.log("Hello");
    success_msg         = req.flash('success_msg');
    err_msg             = req.flash('err_msg');
    var full_name       = encrypt(req.body.full_name);
    var email           = encrypt(req.body.email);
    var dob             = encrypt(req.body.dob);
    var country=req.body.place_of_birth;
  var city=req.body.city;
  var place_of_birth=city+","+country;
  place_of_birth=encrypt(place_of_birth);
  //  var place_of_birth  = encrypt(req.body.place_of_birth);
    var country_code_select = req.body.country_code_select;
    var mobile          = encrypt(req.body.mobile);
    var last_name       = encrypt(req.body.last_name);
    var now             = new Date();
    now.setMinutes(now.getMinutes() + 05); // timestamp
    now = new Date(now); // Date object
     var otp_expire =now
    var otp = encrypt(generateOTP());
    function generateOTP() { 
         
        // Declare a digits variable  
        // which stores all digits 
        var digits = '0123456789'; 
        let OTP = ''; 
        for (let i = 0; i < 4; i++ ) { 
            OTP += digits[Math.floor(Math.random() * 10)]; 
        } 
        console.log("OTPPPPPPPPPPPPPP",OTP);
        return OTP; 
     } 
    //  let test_pass = Buffer.from(req.body.password, 'base64').toString('ascii')
    //  var mystr = crypto.createHash('sha256').update(test_pass).digest('hex');
//generate randome client salt

            let randomeSalt=crypto.randomBytes(32).toString('base64');

    UserModel.findOne({ where: {email: email} }).then(function(userDataResult) {
        if(userDataResult){
               req.flash('err_msg', 'User email is already registered.')
               res.redirect('/signup');
        }else{
            UserModel.findOne({ where: {mobile_number:mobile} }).then(function(userResult){
                  if(userResult){
                               req.flash('err_msg', 'User mobile number is already registered.')
                               res.redirect('/signup');
                }else{
                    var steps=parseInt("1")
                        UserModel.create({full_name:full_name,last_name:last_name,email:email,country_code_id:country_code_select,mobile_number:mobile,birthplace:place_of_birth,dob:dob,otp,otp_expire,complete_steps:steps,client_salt:randomeSalt}).then(result=>{
            
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
                            UserModel.findOne({ where: {email: email,mobile_number:mobile} }).then(userdata=>{
                               
                                req.flash('success_msg', 'OTP has been sent to your email please check.')
                                res.redirect(`/top_verification?userid=${userdata.reg_user_id}`)
                            }).catch(err=>console.log("errrrr 2nd findOne",err))
                        }).catch(err=>{
                            console.log("update faunction err ",err)
                        })
                    }
                  
            }).catch(err=>{
                console.log("errrrr 2st findOne",err)
                
            });
        }
       
	}).catch(err=>{
        console.log("errrrr 1st findOne",err)
    });
}
/**submit_register Post Method End**/

/**top_verification Get Method start**/
exports.otpVerification = (req,res,next )=> {

    success_msg  = req.flash('success_msg');
    err_msg      = req.flash('err_msg');

           res.render('front/otp-for-verify',{
                success_msg,
                err_msg,
            });

  
}
/**top_verification Get Method End**/
exports.testSection=function(req,res){
  console.log("Testinggggggggggggggggg  calling");
  try{
    success_msg  = req.flash('success_msg');
    err_msg      = req.flash('err_msg');

           res.render('front/test',{
                  fs,
                 crypto,
                 encrypt,
                 encrypt1,
                success_msg,
                err_msg,
            });
  }catch(err){
        throw err;
  }
}
/**submitOtp Post Method Start**/
exports.submitOtp = (req,res,next )=> {

    var userid = req.body.user_id
    console.log("userrrrrrrrrrrrrrr id",userid);
    var otp1 = req.body.otp1
    var otp2 = req.body.otp2
    var otp3 = req.body.otp3
    var otp4 = req.body.otp4
    var otp1 = otp1+otp2+otp3+otp4
    var otp  = encrypt(otp1)

    
    function toTimestamp(strDate){
                                      var datum = Date.parse(strDate);
                                      return datum/1000;
                                  }
 
     UserModel.findOne({ where: { reg_user_id:userid }})
     .then(async(userdata)=>{
 
        var timstampFormDb =parseInt(toTimestamp(userdata.otp_expire)) 
        var currentTimestamp =parseInt(toTimestamp(new Date())) 
          
          if(userdata)
          {
                var user_otp = userdata.otp

               if(user_otp==otp && timstampFormDb>=currentTimestamp){
                               
                    var steps=parseInt("2")

                        await  UserModel.update({complete_steps:steps,email_verification_status:"yes",wrong_otp_count:"0"}, { where: { reg_user_id:userid }})
                        .then((result) =>{

                           // res.redirect(`/sequrity_question/?userid=${userid}`)
                           res.redirect(`/save-password/?userId=${userid}`);
                            
                        }).catch(err=>console.log("otp step err",err))
                                  
          }
         else{

          if (parseInt(userdata.wrong_otp_count) > 9) {

            req.flash('err_msg', 'You have tried so many invalid attempts, please contact to admin.')
            res.redirect("/signup")
  
           } else {
            wrong_otp_count = parseInt(userdata.wrong_otp_count)  + 1
            UserModel.update({wrong_otp_count},{ where: { reg_user_id:userid,deleted:"0",status:"active" }}).then(data=>{
            
             
              req.flash('err_msg', 'You entered wrong OTP.')
              res.redirect(`/top_verification?userid=${userid}`)
            }).catch(err=>{
                     console.log(err)
                     redirect("/login")
            })
           }

             err_msg  = 'You entered wrong OTP.'
            
         
         }
         
 }else{
     req.flash('err_msg', 'Record not found.')
     res.redirect("/signup")
 }
     }).catch(err=>console.log(err))
 }
 /**submitOtp Post Method End**/
 //write password
//  function writePass(encryptedd){
//   console.log("datattttttttttttt",encryptedd);
                  
//     let isWrite=fs.writeFileSync('myrefletpassword.txt',encryptedd);
           
//     console.log(isWrite);
//        console.log("Done writeeeeeeeeeeeeeeeee");   
//       exports.getPassword=async function(req,res){
//          let user_id=req.body.user_id;
//          try{
//            let ur=myrelfetpassword+user_id+".txt";
//            res.download(ur);
//          }catch(err){
//            throw err;
//          }
//        }  
//   }


//generate password get method
exports.savePassword=async function(req,res){
  success_msg  = req.flash('success_msg');
  err_msg      = req.flash('err_msg');
  console.log("Save password calllllllllllllllllll");
  let user_id=req.query.userId;
  console.log("user idddddddd",user_id);
  //let password=req.body.pass;
  try{
    let isLoadPass;
    let userDet= await UserModel.findOne({where:{reg_user_id:user_id}});
    if(userDet.complete_steps<3){
   // console.log("userDetttttt",userDet);
    console.log("saltttttttt:",userDet.client_salt)
     let client_salt=userDet.client_salt;
  // let client_salt="hello";
   //}
    res.render('front/save-password',{
      success_msg,
       err_msg,
       fs,
       crypto,
       encrypt,
       encrypt1,
       isLoadPass,
      // writePass,
       client_salt,
       user_id
  });
}else{
  res.redirect("login");
}

  }catch(err){
    throw err;
  }
}

exports.getEncryptPass=async function(req,res){
  let simpPass=req.body.password;
  try{
        let encPass=encrypt1(simpPass);
       encPass=encPass.replace(/ /g,'+');
       // console.log("encrypteeeeeeeeeeeeee pass",encPass);
        res.end(encPass);
  }catch(err){
    console.log(err);
    throw err;
      
  }
}



exports.getDecryptPass=async function(req,res){
  let encryptedPass=req.body.password;
  encryptedPass=encryptedPass.replace(/ /g,'+');
  // let temp=encryptedPass.split(' ');
  //   temp=temp.join('');
  console.log("decryptingggggggggggg from server",encryptedPass)
  try{
       let decryptPass=decrypt1(encryptedPass);
       console.log("decryptingggggggggggg from server",decryptPass)
       res.end(decryptPass);
  }catch(err){
    console.log(err);
    throw err;
  }
}

exports.getDecryptPass2=async function(req,res){
  let encryptedPass=req.body.password;
  encryptedPass=encryptedPass.replace(/ /g,'+');
  // let temp=encryptedPass.split(' ');
  //   temp=temp.join('');
  console.log("decryptingggggggggggg from server",encryptedPass)
  try{
       let decryptPass=decrypt1(encryptedPass);
       console.log("decryptingggggggggggg from server",decryptPass)
       res.end(decryptPass);
  }catch(err){
    console.log(err);
    throw err;
  }
}

exports.savePasswordSubmit=async function(req,res){
  let password=req.body.password;
  let user_id=req.body.user_id;
  success_msg  = req.flash('success_msg');
  err_msg      = req.flash('err_msg');
  console.log("Useriddddddddddddddd",user_id);
try{
console.log("passsssssssssssssssssss",password);
let serverSalt=await crypto.randomBytes(16).toString('base64');
console.log("Generated salt::::::::::::::::::::::",serverSalt);
password=password+serverSalt;
password=crypto.createHash('sha256').update(password).digest('hex');
password=encrypt1(password);
password=encrypt(password);
console.log("after hashing passworddddddddddddddd and encryption:",password);
serverSalt=encrypt(serverSalt);
let steps=3;
let isSavedPassword=await UserModel.update({password:password,server_salt:serverSalt,complete_steps:steps},{where:{reg_user_id:user_id}});
if(isSavedPassword){
  res.redirect(`/re-enter-password/?userId=${user_id}`)

}else{
  res.redirect(`/save-password/?userId=${user_id}`);
}
  }catch(err){
    throw err;
  }
}

//re-enter password get method
exports.getReenterPassword=async function(req,res){
  let user_id=req.query.userId;
  try{
   let userDet= await UserModel.findOne({where:{reg_user_id:user_id}});
   if(userDet.complete_steps<4){
    res.render('front/re-enter-password',{
      success_msg,
       err_msg,
       user_id
  });
}else{
  res.redirect('/login')
}
  }catch(err){
    throw err;
  }
}

//re-enter password
exports.reEnterPassword=async function(req,res){
  let password=req.body.password;
  let user_id=req.body.user_id;
  try{
    let userDet=await UserModel.findOne({where:{reg_user_id:user_id}});
    let salt=userDet.client_salt;
    password=crypto.pbkdf2Sync(password, salt,  1000, 128, 'SHA512').toString(`hex`);
 let steps=4;
     let serverSalt=decrypt(userDet.server_salt);
     password=password+serverSalt;
     password=crypto.createHash('sha256').update(password).digest('hex');
     password=encrypt1(password);
     password=encrypt(password);
     if(userDet.password===password){
      await UserModel.update({complete_steps:steps},{where:{reg_user_id:user_id}});
      res.redirect(`/set_pin/?userid=${user_id}`)
     }else{
      res.redirect(`/save-password/?userId=${user_id}`);
     }
  }catch(err){
    throw err;
  }
}

//miidleware for checking email verification
exports.checkEmailVerification=async function(req,res,next){
        let user_id=  req.query.userId;
        console.log("user verfication checkinnnnnnnnnnnnnnnnnnnnnnnnnn")
        console.log("user verfication checkinnnnnnnnnnnnnnnnnnnnnnnnnn",user_id);
        try{
           let isVerified=await UserModel.findOne({where:{reg_user_id:user_id,email_verification_status:'yes'}});
           if(isVerified){
             next();
           }else{
             res.redirect('/signup');
           }
        }catch(err){
          res.redirect('/signup')
          throw err;
        }
}



/**sequrity_question Get Method Start**/
 exports.sequrityQuestion = (req,res,next )=> {

    db.query("SELECT * FROM tbl_security_questions")
    .then(securityQuestionsData=>{

           res.render('front/sequrity-question',{
                                               securityQuestions:securityQuestionsData[0]
           });

    })
  
}
/**sequrity_question Get Method End**/

/**submitQuestionAns Post Method Start**/
exports.submitQuestionAns = (req,res,next )=> {
     
    var idUser          = req.body.userId
    var userID          = parseInt(req.body.userId);
    var question        = req.body.question
    var answer          = req.body.answer
    var dt              = dateTime.create();
    var formatted       = dt.format('Y-m-d H:M:S');
    
 
    for(var i=0 ; i<question.length; i++){
    
            UserSecurityModel.create({
                                      reg_user_id:userID,
                                      question_id:parseInt(question[i]),
                                      answer:encrypt(answer[i]),
                                      createdAt : formatted,
                                      updatedAt: formatted
            })
             .then(data=>{console.log("data saved")
              
              })
              .catch(err=>console.log(err))
 
    }
    var steps=parseInt("4")

    UserModel.update({complete_steps:steps}, { where: { reg_user_id:userID }})
    .then((result) =>{

        res.redirect(`/set_pin/?userid=${idUser}`)

    }).catch(err=>console.log("otp step err",err))
       
 }
 /**submitQuestionAns Post Method End**/

/**set_pin Get Method Start**/
 exports.setPinGet = (req,res,next )=> {
let user_id=req.query.userid;
    success_msg = req.flash('success_msg');
    err_msg     = req.flash('err_msg');

           res.render('front/set-a-pin',{
                  success_msg,
                  err_msg,
            });
  
}
/**set_pin Get Method End**/

/**submitSetPin Post Method Start**/
exports.submitSetPin = (req,res,next )=> {
    var userid = req.body.userid

    var userID =parseInt(req.body.userid);
    var otp1 =req.body.otp1
    var otp2 =req.body.otp2
    var otp3 =req.body.otp3
    var otp4 =req.body.otp4
    var steps=parseInt("5")
 
    var otp = otp1+otp2+otp3+otp4

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    
    var updateValues={
                      user_pin:encrypt(otp),
                      updatedAt:formatted,
                      complete_steps:steps
                    }

    UserModel.update(updateValues, { where: { reg_user_id: userID } }).then((result) => 
                {
                    res.redirect(`/terms-and-conditions?userId=${userID}`);
            
                }).catch(err=>console.log(err))
   
 }
 /**submitSetPin Post Method End**/

/**terms-and-conditions Get Method Start**/
exports.termsAndCondition =async (req,res,next )=> {

  await db.query("SELECT *FROM `tbl_front_terms_conditions`",{ type:db.QueryTypes.SELECT}).then(async  function(term_data){     

    res.render('front/signup-terms',{term_data});

  })
   
 }
 /**terms-and-conditions Get Method End**/

/**terms-and-conditions-submit Post Method Start**/
 exports.termsAndConditionSubmit = (req,res,next )=> {

     var steps=parseInt("6")
     var userid=req.body.user_id
     var userID =parseInt(userid);

     var updateValues={
        complete_steps:steps
       }

     UserModel.update(updateValues, { where: { reg_user_id: userID } }).then((result) => 
          {
            UserModel.findOne({ where:{reg_user_id: userID } }).then(function(activeUser){

              var activeEmail=activeUser.email;
              var username = activeUser.full_name

            
            
              var mail_subject="Successfully Registrations.";
              var mail_content=`
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
              var to_mail=decrypt(activeEmail);
              var mailresult=mail_func.sendMail(to_mail,mail_subject,mail_content);

              res.redirect('/login');
              })
      }).catch(err=>console.log(err))
    
   
 }
 /**terms-and-conditions-submit Post Method End**/

/**check_user_steps Post Method Start**/
 exports.checkUserSteps = (req,res,next )=> {

    var email = encrypt(req.body.email)

    UserModel.findOne({where:{email:email}}).then(userdata=>{

      if(userdata==null){
          res.send("noAnyStep")
      }else{
              var userObj ={  

                  userid : userdata.reg_user_id,
                  steps :  userdata.complete_steps,
               }
              res.send(userObj)
      }
    }).catch(err=>console.log("err",err))
}
/**check_user_steps Post Method End**/

/**resend_otp Post Method Start**/
exports.resendOtp = async(req,res,next )=> {

   var userid = req.body.user_id
   var otp = encrypt(generateOTP());
   var now = new Date();

   now.setMinutes(now.getMinutes() + 05); // timestamp
   now = new Date(now); // Date object

   var otp_expire =now

  function generateOTP() { 
     
        var digits = '0123456789'; 
        let OTP = ''; 
        for (let i = 0; i < 4; i++ ) { 
            OTP += digits[Math.floor(Math.random() * 10)]; 
        } 
        return OTP; 
     } 

  var updateValuesObj={
    otp:otp,
    otp_expire:otp_expire
    }

  await UserModel.update(updateValuesObj, { where: { reg_user_id: userid } }).then(async(result) => 
             {
               await  UserModel.findOne({ where: { reg_user_id:userid }}).then(userdata=>{

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
                 res.send("done")

                 })

  }).catch(err=>console.log(err))
}
/**resend_otp Post Method End**/

/**dashboard Get Method Start**/
exports.dashboard = (req,res,next )=> {

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    console.log("cookies tes......................................................................",req.session);
        if(req.session.user_type == "client"){
                res.redirect("/cilent_deshboard")
        }else{
                res.redirect('/verifier_deshboard')
        }
     
}
/**dashboard Get Method End**/

exports.getClientSalt=async function(req,res){
  console.log("emaillllllllllllllllll colllllll",req.body.email);
 // console.log("cryptooooooooooo",crypto);
  try{
    let email= req.body.email;
    email=encrypt(email);
    let isPresent=await UserModel.findOne({where:{email:email}});
   // console.log("user det:",isPresent);
    if(isPresent){
          let client_salt=isPresent.client_salt;
          res.end(client_salt);
    }else{
      res.end("Invalid email");
    }
  }catch(err){
    console.log(err);
    throw err;
  }
}

/**login Get Method Start**/
    
exports.login = (req,res,next )=> {

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var test = req.session.is_user_logged_in;

        if (test == true) {
        res.redirect('/dashboard');
        } else 
        {
          
         
        res.render('front/login',{
            success_msg,
            err_msg,
         //   getClientSalt,
            crypto
          }); 
        
        

      }

}
/**login Get Method End**/

//*invailed login attempt mailing function
InvalidLoginAttempt = (email,req) => {

  var smtpTransport = nodemailer.createTransport({
                                                    service: 'gmail',
                                                    auth: {
                                                      user: MAIL_SEND_ID,
                                                      pass: PASS_OF_MAIL 
                                                    }
                       });

  const mailOptions = {
                          to     : decrypt(email),
                          from   : 'questtestmail@gmail.com',
                          subject: "invalid login attempt alert !!.",

                          html   : `<!DOCTYPE html>
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

                                  smtpTransport.sendMail(mailOptions, function (err) {});
   
                                                     

 }

/**submit_login Post Method Start**/
exports.submitLogin = async (req,res,next )=> {  // var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
// var pass = mykey.update(req.body.password, 'utf8', 'hex')
// pass += mykey.final('hex');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

  console.log("login password.................befor.....",req.body.password)
  console.log("login email.................befor.....",req.body.email)
    var email = encrypt((req.body.email).trim());
    console.log("entered emaiiiiiiiiiiii",email);

    let isPresent=await UserModel.findOne({where:{email:email}});
  let client_salt;
  let server_salt;
  if(isPresent){
    client_salt=isPresent.client_salt;
    server_salt=decrypt(isPresent.server_salt);
  }
 let pass= crypto.pbkdf2Sync(req.body.password, client_salt,  1000, 128, 'SHA512').toString(`hex`);
 pass=pass+server_salt
 pass=crypto.createHash('sha256').update(pass).digest('hex');
 pass=encrypt1(pass);
 pass=encrypt(pass);

//console.log("enteredddddddddddd password::::",pass);
    var dt = dateTime.create();
    var login_time = dt.format('Y-m-d H:M:S');
    var blocked_date = dt.format('Y-m-d H:M:S');
    var Ip_addr= req.body.Ip_add
    var steps=parseInt("6");
        let userD  =await UserModel.findOne({where:{email:email}});
        console.log("User infooooooooooooooooooooo:",userD);
    console.log("emailemailemailemail : ",email)

        UserModel.findOne({ where: {email: email,password:pass} }).then(async function(userDataResult) {
   
                    
          if(userDataResult==null){
                      

                  await UserModel.findOne({ where: {email: email} }).then(async(tryLogidata)=> {

                        if(tryLogidata!=null){

                                        var creatObj= {
                                                        reg_user_id:tryLogidata.reg_user_id,
                                                        login_time,
                                                        ip_address:Ip_addr,
                                                        deleted:"1",
                                                        status :"inactive"
                                                      }

                          await  LogDetailsModel.create(creatObj).then(async(data)=>{

                               await LogDetailsModel.findAll({ where: {reg_user_id: tryLogidata.reg_user_id,deleted:"1"} }).then(async(invalidUserLogindata)=>{
                                  
                                   if(invalidUserLogindata.length>4){

                                    console.log("inside the if ,user blocked")

                                       await UserModel.update({status:"block",block_date:blocked_date},{ where: {reg_user_id: invalidUserLogindata[0].reg_user_id} }).then(async(status_update)=>{

                                            console.log("status update status_update",status_update,invalidUserLogindata.length)
                                            req.flash('err_msg', 'You are block for 48 hours.')
                                            var full_name,email;
                                          
                                                await  UserModel.findOne({ where: { reg_user_id:invalidUserLogindata[0].reg_user_id }}).then(userdata=>{
                                        
                                                    full_name=userdata.full_name
                                                    email=userdata.email

                                                    console.log("emailemailemailemailemail : ",email)

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
                                            
                                            res.redirect("/login")
                                        }).catch(err=>console.log("status update err",err))
                                    }else{

                                      InvalidLoginAttempt(email,req)
                                        req.flash('err_msg', 'You entered wrong credentials.')
                                        res.redirect("/login")
                                    }
                                        //    console.log("invalidUserLogindata",invalidUserLogindata)
                                }).catch(err=>console.log("errr",err))

        
                            }).catch(err=>console.log("logomodel err....",err))
                        }else{
                            req.flash('err_msg', 'You entered wrong credentials.')
                                        res.redirect("/login")
                        }
                       
                    }).catch(err=>console.log("trylogin err..",err))
                    
                               
                    }else{

                      if(userDataResult.status=="inactive"){
                                req.flash('err_msg', 'Your ID is not active, Please accept invitation or contact to admin.')
                                res.redirect("/login")

                      }else{

                        if(userDataResult.status=="block"){
                          req.flash('err_msg', 'You are blocked for 48 hours, After 48 hours you will be able to login.')
                              res.redirect("/login")
                      }else{
                         await   LogDetailsModel.update({status:"active", deleted:"0"},{where:{ reg_user_id: userDataResult.reg_user_id }}).then( async(result) => {
                             console.log("unlock periveus entry done")
                         })


                        //  console.log("pic",userDataResult.profile_pic);
                        let text_img;
                         /**Imgae for ejs start**/
                         if(userDataResult.profile_img_name!=null||userDataResult.profile_img_name!=''){
                        //  let buff= new Buffer(userDataResult.profile_pic).toString('utf8');
                         text_img = userDataResult.profile_img_name;
                       }else{
                       text_img=""

                       }
                          
                         /**Image for ejs end**/
console.log("user nameeeeeeeeeeeeeeeeeeee",userDataResult.full_name);
              req.session.name = userDataResult.full_name;
              req.session.profile_pic=text_img;
              req.session.email= email;
              req.session.user_id   = userDataResult.reg_user_id;
              if(userDataResult.type=="validatore"){
                req.session.user_type = "validatore";
              }else{
                req.session.user_type = "client";
              }


                         // req.app.locals.userDetail=userDataResult.reg_user_id;
                          //successfully login
                          res.redirect('/otp_veri_aft_login');
                      }

                      }

                      
                    }
       
    })
  

}
/**submit_login Post Method End**/

/**logout Get Method Start**/
exports.logout = (req,res,next )=> {

    var test = req.session.is_user_logged_in;

    if (test == true) {

        req.session.destroy(function(err) {
            if (err) {
                // return err;
                 res.redirect('/');
            } else {

                delete app.locals.userDetail;
                 res.redirect('/');

                // return res.redirect('/login');
            }
        });

    } else {
      res.redirect('/');
    }
}
/**logout Get Method End**/

/**forget-password Get Method Start**/
exports.forgetPassword = (req,res,next )=> {

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    res.render('front/forgot-pass',{
        success_msg,
        err_msg
    });
}
/**forget-password Get Method End**/

/**forgetPassword Post Method Start**/
exports.submitForgetPassword = (req,res,next )=> {

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var email = encrypt(req.body.emailid);
    var request_type = req.body.request_type;

    console.log("email:::",email);
    console.log("type:::",request_type);
    
    UserModel.findOne({ where:{email:email,deleted:'0'} }).then(function(userDataResult) {
 
         if(userDataResult==null)
         {
          req.flash('err_msg', 'This Email-Id is not registered.')
          res.redirect("/forget-password");

         }
         else
         {
             UserModel.findOne({ where:{email:email,status:'active'} }).then(async function(activeUser){

              if(activeUser==null)
              {
                 req.flash('err_msg', 'Your account is inactive.Please contact to administrator.')
                 res.redirect("/forget-password");
              }
              else
              {
               
              
              let token_for_email = await jwt.sign({activeUser:activeUser.reg_user_id}, TOKEN_SECRET, { expiresIn: '10h' });
              console.log('token_for_email')
              console.log('token_for_email',activeUser.reg_user_id," email : ")
              
              await tokeModel.create({reg_user_id:activeUser.reg_user_id,token:token_for_email,updatedAt:formatted,createdAt:formatted})
              .then(data=>{

                  // console.log("token entrey done.",data)
             
                var activeEmail=activeUser.email;
                var username = text_func.ucFirst(activeUser.full_name);
                var verification_code=text_func.newOTP();
                var url_data,sub_type;
               

                if(request_type==='password'){

                   url_data='https://'+req.headers.host+'/reset-password-link/?mail='+base64encode(activeEmail)+'&token='+token_for_email
                  //  p_tag = ``
                    sub_type = "ResetPassword"
                }else{

                   url_data='https://'+req.headers.host+'/reset-pin-link/?mail='+base64encode(activeEmail)+'&token='+token_for_email
                   sub_type = "ResetPin"
                }
            
                  
                var verification_code_en = encrypt(verification_code)
                /**update vericication code to reset passsword start**/

                 var updateValues ={
                    otp:verification_code_en
                 };

            UserModel.update(updateValues,{where:{ reg_user_id: activeUser.reg_user_id } }).then(async (result) => {
            
              console.log("result : ",result)
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
          
           
                   
                   res.redirect("/reset-password");
                  /**send link to reset-password start**/
                })
                .catch(err =>{
                  // console.log(err)
                  res.send({message : "somthing went wrong try again"})})   
                
        
                }).catch(err=>console.log('err'))

                /**update vericication code to reset passsword end**/


                }

           });

         }
    });

    
}
/**forgetPassword Post Method End**/


/**reset-password Get Method Start**/
exports.successResetpassword = (req,res,next )=> {

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    res.render('front/reset-password',{
        success_msg,
        err_msg
    });
}
/**reset-password Get Method End**/

/**reset-password-link Get method start**/
exports.resetPasswordForm = (req,res,next )=> {

   var mailid=req.query.mail;
   var token=req.query.token;
   success_msg = req.flash('success_msg');
   err_msg = req.flash('err_msg');


   if (token == null) return res.sendStatus(401).send("this link is not correct.") // if there isn't any token
   jwt.verify(token, TOKEN_SECRET,async (err, user) => {
   console.log(err)
   if (err) return res.sendStatus(403).send({message:"the link has been expired."})

  console.log("user : ",user.activeUser)
  console.log("token : ",token)

   await tokeModel.findOne({where:{reg_user_id:user.activeUser,token:token,status_of_token:"active"}})
   .then(data=>{ 
     
    console.log("data : ",data)

    if (!data) {
          res.send({message:"This link has been already used. please use again forgot option."})
    }else{
      if(mailid)
      {
        var emailid=base64decode(mailid);
          
        console.log("  emailid  : ",emailid)
        res.render('front/enter-pin',{
            success_msg,
            err_msg,emailid,
            token
        });
  
      }
      else
      {
      res.sendStatus(401).send("this link is not correct.")
      }  
    }

          

   }).catch(err=>{
     console.log(err)
     })

  


   })



}
/**reset-password-link Get method End**/

/**reset-password-form Post Start**/
exports.resetPasswordFormPost = async (req,res,next )=> {
    
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var mailid=req.body.emailId;

    var pin1 = req.body.otp1.trim(); 
    var pin2 = req.body.otp2.trim();
    var pin3 = req.body.otp3.trim();
    var pin4 = req.body.otp4.trim();
    let token = req.body.token
    var user_pin1 = pin1+""+pin2+""+pin3+""+pin4;  
    var otp= encrypt(req.body.verification_code);
    var user_pin = encrypt(user_pin1)
       
    var newPass = crypto.createHash('sha256').update(req.body.user_pass).digest('hex');
      
    console.log("mailid : ",mailid)

    // console.log("mailid : ",encrypt(mailid))

    var updateValues={
        password:newPass
       }
    if(mailid)
    {
   await   UserModel.findOne({where:{email:mailid}}).then(async function(user){

        if(user.user_pin!= user_pin){

            console.log('pin is incorrect');

          await tokeModel.findOne({where:{reg_user_id:user.reg_user_id,token:token}})
          .then( async(data)=>{
        
            // console.log('pin is data',data);

            if(data.try_cout>=5){
            await  tokeModel.update({status_of_token:"expire"},{where:{reg_user_id:user.reg_user_id,token:token}})
            .then(updata =>{

                req.flash("err_msg","You have tried so many invalid attempts.This link has been blocked for password reset.")
                res.redirect("/login")

              })
         

            } else {
             
                 var count = parseInt(data.try_cout)+1
                 
                 console.log('pin is count',user.reg_user_id);
                 console.log('pin is count',token);

              await  tokeModel.update({try_cout:count},{where:{reg_user_id:user.reg_user_id,token:token}})
              .then(updata =>{
  
                  // req.flash("err_msg","You have tried so many invalid attempts. This link has been blocked for password reset.")
                  res.render('front/enter-pin',{err_msg:"Your pin is incorrect.",emailid:mailid,token});
  
                })

            }

          })
          .catch(err=>console.log(err))
      

        }
       else if(user.otp!= otp){
            console.log('otp is incorrect',otp);

             console.log('otp user is incorrect',user.otp);
             await tokeModel.findOne({where:{reg_user_id:user.reg_user_id,token:token}})
             .then(async data=>{
   
               if(data.try_cout>=5){
               await  tokeModel.update({status_of_token:"expire"},{where:{reg_user_id:user.reg_user_id,token:token}})
               .then(updata =>{
   
                   req.flash("err_msg","You have tried so many invalid attempts. This link has been blocked for password reset.")
                   res.redirect("/login")
   
                 })
            
   
               } else {
                    var count = parseInt(data.try_cout)+1
                 await  tokeModel.update({try_cout:count},{where:{reg_user_id:user.reg_user_id,token:token}})
                 .then(updata =>{
     
                     // req.flash("err_msg","You have tried so many invalid attempts. This link has been blocked for password reset.")
                     res.render('front/enter-pin',{err_msg:"Your otp is incorrect.",emailid:mailid,token});
     
                   })
   
               }
   
             })
             .catch(err=>console.log(err))
        }
        else{


            await  tokeModel.update({status_of_token:"inactive"},{where:{reg_user_id:user.reg_user_id,token:token}})
            .then(updata =>{

              UserModel.update(updateValues, { where: { email:mailid} }).then((result) => 
              {
                  console.log("updated result  ",result);
                 //  res.redirect('/login');
                  res.render('front/login',{success_msg:"Your password has been updated successfully."});
         
              }).catch(err=>{
              console.log(err)
              })

            })
            .catch(err=>{
            console.log(err)
            })

         
           

        }
      })
      
    
  
  }
  else
  {
    //
  }
  
  
  }
/**reset-password-form Post method End**/

/**reset-pin-link Get method start**/
exports.resetPinForm = (req,res,next )=> {

   var mailid=req.query.mail;
   success_msg = req.flash('success_msg');
   err_msg = req.flash('err_msg');
   var token=req.query.token;


   if (token == null) return res.sendStatus(401).send("this link is not correct.") // if there isn't any token
   jwt.verify(token, TOKEN_SECRET,async (err, user) => {
   console.log(err)
   if (err) return res.sendStatus(403).send({message:"the link has been expired."})

  console.log("user : ",user.activeUser)
  console.log("token : ",token)

   await tokeModel.findOne({where:{reg_user_id:user.activeUser,token:token,status_of_token:"active"}})
   .then(data=>{ 
     
    console.log("data : ",data)

    if(data === null){
          res.send({message:"This link has been already used. please use again forgot option."})
    }else{
          if(mailid)
          {
            var emailid=base64decode(mailid);
              
            res.render('front/reset-pin-link',{
              token,
                success_msg,
                err_msg,emailid
            });

          }
          
    }
  }).catch(err=>{
    console.log(err)
      
      res.sendStatus(401).send("this link is not correct.")
       
    })
  })
}
/**reset-pin-link Get method End**/

/**reset-pin-form Post Start**/
exports.resetPinFormPost =async (req,res,next )=> {

    var mailid = req.body.emailId;

    var pin1 = req.body.otp1.trim();
    var pin2 = req.body.otp2.trim();
    var pin3 = req.body.otp3.trim();
    var pin4 = req.body.otp4.trim();
    var user_pin1 = pin1+""+pin2+""+pin3+""+pin4;  

    var token = req.body.token

    console.log("user_pin1 : ",user_pin1)
    console.log("user_pin1 : ",req.body.verification_code)
    console.log("req.body.emailId : ",req.body.emailId)
    // console.log("encrypt(req.body.emailId) : ",encrypt(req.body.emailId))
    var string_pin = user_pin1.toString()
    console.log("string_pin : ",string_pin)

    var user_pin = encrypt(string_pin);  
    console.log("en user_pin : ",user_pin)
    
    var string_otp = (req.body.verification_code).toString()
    console.log("string_otp : ",string_otp)

    var otp= encrypt(string_otp);
    console.log("otp ENN : ",otp)

    // var newPass = crypto.createHash('sha256').update(req.body.user_pass).digest('hex');

    var updateValues={
      user_pin:user_pin
       }

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
   
    if(mailid)
    {
      UserModel.findOne({where:{email:mailid}}).then(async function(user){

          console.log('user ',user)
        
            if(user.otp!= otp){
                
              await tokeModel.findOne({where:{reg_user_id:user.reg_user_id,token:token}})
              .then( async(data)=>{
    
                if(data.try_cout>=5){
                await  tokeModel.update({status_of_token:"expire"},{where:{reg_user_id:user.reg_user_id,token:token}})
                .then(updata =>{
    
                    req.flash("err_msg","You have tried so many invalid attempts. This link has been blocked for password reset.")
                    res.redirect("/login")
    
                  })
             
    
                } else {
                     var count = parseInt(data.try_cout)+1
                  await tokeModel.update({try_cout:count},{where:{reg_user_id:user.reg_user_id,token:token}})
                  .then(updata =>{
      
                      // req.flash("err_msg","You have tried so many invalid attempts. This link has been blocked for password reset.")
                      res.render('front/reset-pin-link',{token:token,err_msg:"Veriffication code is incorrect.",emailid:mailid});
      
                    })
    
                }
    
              })
              .catch(err=>console.log(err))
            }
            else{
                UserModel.update(updateValues, { where: { email:mailid} }).then((result) => 
                {
                    console.log("updated result  ",result);
                    //  res.redirect('/login');
                    res.render('front/login',{success_msg:"Your pin is update."});
            
                }).catch(err=>{
                console.log(err)
                })
            }
      })  
    }
    else
    {
      //
    }
  
  
  }
/**reset-pin-form Post method End**/

/**get-change-pass Get method Start**/
exports.getChangePass = (req,res,next)=>{
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var user_id = req.session.user_id;
    // var user_id =20;

    
              SecurityMasterModel.hasMany(UserSecurityModel, {foreignKey: 'question_id'})
              UserSecurityModel.belongsTo(SecurityMasterModel, {foreignKey: 'question_id'})
              UserSecurityModel.findAll({where:{reg_user_id:user_id},include: [SecurityMasterModel]}).then(function(users){
                      // var question = user.tbl_security_question.dataValues.question;

                      // for(var i=0;i<users.length;i++){
                      // console.log(users[i].tbl_security_question.dataValues.question);}
                                            res.render('front/change-password',{
                                                success_msg,
                                                err_msg,
                                                users,
                                                session:req.session
                                            });
              
                
                  })

    
}
/**get-change-pass Get method End**/

/**change-pass Post method Start**/
exports.ChangePass = (req,res,next)=>
{
   var user_id = req.session.user_id;
    // var user_id = 20;
    var password = req.body.password.trim(); 
    var question_id = req.body.question
    var newPassword = req.body.newPassword.trim(); 
    var answer = req.body.answer 
    var user_answer1;
    var user_answer2;

    console.log("question_id",question_id);

    console.log("answer",answer);


    UserModel.findOne({ where:{reg_user_id:user_id} }).then(function(user){
        UserSecurityModel.findAll({ where:{reg_user_id:user_id} }).then(function(questions){
            
            for(var j=0;j<questions.length;j++){
                // console.log(questions[j].dataValues.secu_question_id);
                if(questions[j].dataValues.secu_question_id==question_id[0]){
                    user_answer1 = questions[j].dataValues.answer;
                }
                if(questions[j].dataValues.secu_question_id==question_id[1]){
                  user_answer2 = questions[j].dataValues.answer;
              }
            }
            
            console.log("old Pass",user.password);
            var mystr = crypto.createHash('sha256').update(password).digest('hex');

            // var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
            // var mystr = mykey.update(password, 'utf8', 'hex')
            // mystr += mykey.final('hex');
            

            // console.log("mystr",mystr);
            console.log("user_answer1 user_answer2",user_answer1,user_answer2);

            if(user.password!=mystr){
               req.flash('err_msg','Your old password is wrong.');
            // console.log('old pass is wrong');
                res.redirect('/get-change-pass');
            }else if(user_answer1!=encrypt(answer[0]) && user_answer2!=encrypt(answer[1]) ){
                   req.flash('err_msg','Your security answer is wrong.');
                // console.log('answer is wrong');
                res.redirect('/get-change-pass');
            }else if(password==newPassword){
                req.flash('err_msg','Old password and new password can not be same.');
                // console.log('answer is wrong');
                res.redirect('/get-change-pass');
            }else{

              if(user_answer1==encrypt(answer[0]) && user_answer2== encrypt(answer[1]) ){

                            //   var newmykey = crypto.createCipher('aes-128-cbc', 'mypass');
                            // var newmystr = newmykey.update(newPassword, 'utf8', 'hex')
                            // newmystr += newmykey.final('hex');

                            var newmystr = crypto.createHash('sha256').update(newPassword).digest('hex');

                          // console.log("mystr",newmystr);success_msg
                          req.flash('success_msg','');
                          req.flash('err_msg','');

                              res.render('front/validate_pin',{
                                  newmystr,session:req.session
                              });
                  }else{
                    req.flash('err_msg','Your security answer is wrong.');
                    // console.log('answer is wrong');
                    res.redirect('/get-change-pass');
                  }
            }
        })
         
    })
    
}
/**change-pass Post method End**/
/**validate-pin Post method Start**/
exports.validate_pin = (req,res,next)=>{
  var user_id = req.session.user_id;
// var user_id = 20;
var newPass = req.body.password.trim();
var pin1 = req.body.otp1.trim();
var pin2 = req.body.otp2.trim();
var pin3 = req.body.otp3.trim();
var pin4 = req.body.otp4.trim();
var pin_old = pin1+""+pin2+""+pin3+""+pin4;
// console.log("pin",pin);
var pin = encrypt(pin_old);

var updateValues={
   password:newPass
  }
UserModel.findOne({ where:{reg_user_id:user_id} }).then(function(user){
   if(user.user_pin!= pin){
       // console.log('pin is incorrect');
       res.render('front/validate_pin',{newmystr:newPass,err_msg:"Your pin is incorrect."});
   }else{
       UserModel.update(updateValues, { where: { reg_user_id: user_id } }).then((result) => 
        {
           // console.log("updated result  ",result);
           res.render('front/success-message',{session:req.session});
   
        }).catch(err=>{
        // console.log(err)
        })
   }
})
}
/**validate-pin Post method End**/

/**get_change_email Get method Start**/
exports.get_change_email = (req,res,next)=>{
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
  var user_id = req.session.user_id;
  // var user_id =20;

  
            SecurityMasterModel.hasMany(UserSecurityModel, {foreignKey: 'question_id'})
            UserSecurityModel.belongsTo(SecurityMasterModel, {foreignKey: 'question_id'})
            UserSecurityModel.findAll({where:{reg_user_id:user_id},include: [SecurityMasterModel]}).then(function(users){
                    // var question = user.tbl_security_question.dataValues.question;

                    // for(var i=0;i<users.length;i++){
                    // console.log(users[i].tbl_security_question.dataValues.question);}
                                          res.render('front/email_change',{
                                              success_msg,
                                              err_msg,
                                              users,
                                              session:req.session
                                          });
            
              
                })

  
}
/**get_change_email Get method End**/

/**post_change_email Post method Start**/
exports.post_change_email = (req,res,next)=>
{
    var user_id       = req.session.user_id;
    var password      = req.body.password.trim(); 
    var question_id   = req.body.question
    var neewEmail     = req.body.neewEmail.trim(); 
    var answer        = req.body.answer 
    var user_answer1;
    var user_answer2;

    console.log("question_id",question_id);

    console.log("answer",answer);
    

    UserModel.findOne({ where:{reg_user_id:user_id} })
    .then(function(user){
        UserSecurityModel.findAll({ where:{reg_user_id:user_id} })
        .then(function(questions){
            
            for(var j=0;j<questions.length;j++){
                // console.log(questions[j].dataValues.secu_question_id);
                if(questions[j].dataValues.secu_question_id==question_id[0]){
                    user_answer1 = questions[j].dataValues.answer;
                }
                if(questions[j].dataValues.secu_question_id==question_id[1]){
                  user_answer2 = questions[j].dataValues.answer;
              }
            }
            
            console.log("old Pass",user.password);
            var mystr = crypto.createHash('sha256').update(password).digest('hex');

            // var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
            // var mystr = mykey.update(password, 'utf8', 'hex')
            // mystr += mykey.final('hex');
            

            // console.log("mystr",mystr);
            console.log("user_answer1 user_answer2",user_answer1,user_answer2);

            if(user.password!=mystr){
               req.flash('err_msg','Your  password is wrong.');
            // console.log('old pass is wrong');
                res.redirect('/change-email');
            }else if(user_answer1!=encrypt(answer[0]) && user_answer2!=encrypt(answer[1]) ){
                   req.flash('err_msg','Your security answer is wrong.');
                // console.log('answer is wrong');
                res.redirect('/change-email');
            }else{

              if(user_answer1==encrypt(answer[0]) && user_answer2== encrypt(answer[1]) ){

                            //   var newmykey = crypto.createCipher('aes-128-cbc', 'mypass');
                            // var newmystr = newmykey.update(newPassword, 'utf8', 'hex')
                            // newmystr += newmykey.final('hex');
                           
                            var enc_email = encrypt(neewEmail)

                          // console.log("mystr",newmystr);success_msg
                          req.flash('success_msg','');
                          req.flash('err_msg','');

                              res.render('front/validate_pin_for_email',{
                                enc_email,session:req.session
                              });
                  }else{
                    req.flash('err_msg','Your security answer is wrong.');
                    // console.log('answer is wrong');
                    res.redirect('/change-email ');
                  }
            }
        })
         
    })
    
}
/**post_change_email Post method End**/

/**validate_pin_for_email Post method Start**/
exports.validate_pin_for_email = (req,res,next)=>{
  var user_id = req.session.user_id;
// var user_id = 20;
var newEmail = req.body.email.trim();
var pin1 = req.body.otp1.trim();
var pin2 = req.body.otp2.trim();
var pin3 = req.body.otp3.trim();
var pin4 = req.body.otp4.trim();
var pin_old = pin1+""+pin2+""+pin3+""+pin4;
// console.log("pin",pin);
var pin = encrypt(pin_old);

var updateValues={
   email:newEmail
  }
UserModel.findOne({ where:{reg_user_id:user_id} }).then(function(user){
   if(user.user_pin!= pin){
       // console.log('pin is incorrect');
       res.render('front/validate_pin_for_email',{enc_email:newEmail,err_msg:"Your pin is incorrect."});
   }else{
       UserModel.update(updateValues, { where: { reg_user_id: user_id } }).then((result) => 
        {
           // console.log("updated result  ",result);
           res.render('front/success-message-email-change',{session:req.session});
   
        }).catch(err=>{
        // console.log(err)
        })
   }
})
}
/**validate_pin_for_email Post method End**/



/**get-change-pin Get method Start**/
exports.getChangePin = (req,res,next) =>{
    var err_msg= req.flash('err_msg');
    var success_msg= req.flash('success_msg');
    res.render('front/change-pin',{success_msg,err_msg,session:req.session});
}
/**get-change-pin Get method End**/

/**post-change-pin Post method Start**/
exports.postChangePin = (req,res,next)=>{
        var user_id = req.session.user_id;
     // var user_id = 20;

    var pin1 = req.body.otp1.trim();
    var pin2 = req.body.otp2.trim();
    var pin3 = req.body.otp3.trim();
    var pin4 = req.body.otp4.trim();
    var pin_1 = pin1+""+pin2+""+pin3+""+pin4;
    
    var pin = encrypt(pin_1)

    var newpin1 = req.body.newotp1.trim();
    var newpin2 = req.body.newotp2.trim();
    var newpin3 = req.body.newotp3.trim();
    var newpin4 = req.body.newotp4.trim();
    var newpin_1 = newpin1+""+newpin2+""+newpin3+""+newpin4;

    var newpin = encrypt(newpin_1)

    var updateValues={
        user_pin:newpin
    }

    UserModel.findOne({ where:{reg_user_id:user_id} }).then(function(user){
        if(user.user_pin!= pin){
            console.log('pin is incorrect');
            req.flash('err_msg','Your pin is incorrect.');
            res.redirect('/get-change-pin');
        }else if(newpin==pin){
            console.log('New pin and old pin can not be same.');
            req.flash('err_msg','New pin and old pin can not be same.');
            res.redirect('/get-change-pin');
        }else{
            UserModel.update(updateValues, { where: { reg_user_id: user_id } }).then((result) => 
             {
                console.log("updated result  ",result);
                req.flash('success_msg','Pin updated successfully');
                res.redirect('/get-change-pin');
        
             }).catch(err=>console.log(err))
        }
    })
    
    
}
/**post-change-pin Post method End**/

/**changeUesrType Post  method Start**/
exports.changeUserTypeSession = (req,res,next )=> {
var type = req.body.usertype
    req.session.user_type =type
    // tbl_verfier_purchase_details.findOne({where:{reg_user_id:req.session.user_id,reflect_id:null}}).then(puchasedResult=>{
    //   if(puchasedResult){
    //     res.render('front/i_am_verfier-side-bar');    
    //   }else{

    //   }
    if(type=="verifier"){
      res.render('front/i_am_verfier-side-bar');
    }else{
      res.render('front/client-side-bar');
    }
    
}
/**changeUesrType Post Method End**/

/**creat-new-wallet Get Method  Start**/
exports.dashboardCreatNewWallet = (req,res,next )=> {
    var err_msg= req.flash('err_msg');
    var success_msg= req.flash('success_msg');
    res.render('front/set-up-code',
    {
        success_msg,
        err_msg,
    session:req.session
    });
    }
/**creat-new-wallet Get Method End**/

/**client Get Method  Start**/
exports.dashboardCilent = (req,res,next )=> {
        var err_msg= req.flash('err_msg');
        var success_msg= req.flash('success_msg');
        req. session.user_type ="client"
        
        res.render('front/wallet/create-wallet',
        {
            success_msg,
            err_msg,
        session:req.session
        });
        }
/**client Get Method End**/

/**verifier Get Method Start**/
exports.dashboardverifier = async(req,res,next )=> {
    var err_msg= req.flash('err_msg');
    var success_msg= req.flash('success_msg');
    req.session.user_type ="verifier";

    await tbl_plan_features.findAll({where:{deleted:"0"}}).then(async(featureNmaeData)=>{
        await  tbl_plan_feature_rel.findAll({}).then(async(plan_rel_data)=>{
             await    tbl_verifier_plan_master.findAll({where:{deleted:"0"}}).then(async(resultPlan)=>{
              await      tbl_verfier_purchase_details.findOne({where:{reg_user_id:req.session.user_id,reflect_id:null}}).then(puchasedResult=>{
                if(puchasedResult){
                res.redirect("/myreflect-creat-wallet")    
                }else{
                    res.render('front/choose-plan',
                    {
                        success_msg,
                        err_msg,
                        resultPlan,
                        plan_rel_data,
                        featureNmaeData,
                    session:req.session
                    });
                }
                
            })
            
        }).catch(err=>console.log(err))
            }).catch(err=>console.log("errrr",err))
    })

    
    
            }
/**verifier Get Method End**/

/**profile get Method start**/
exports.showUserProfile = (req,res,next)=>{


  var user_id=req.session.user_id;

  if(user_id)
  {

    db.query(' SELECT * FROM `tbl_countries` WHERE status="active" ORDER BY `country_id` ASC',{type:db.  QueryTypes.SELECT})
    .then(countryData=>{

        db.query('SELECT * FROM `tbl_country_codes` ORDER BY `iso` ASC',{type:db.QueryTypes.SELECT})
        .then(countryCode1=>{

                 
       
      UserModel.findOne({ where:{reg_user_id:user_id} }).then(function(user){
        console.log('user.country_code_id : ',user.country_code_id)
   db.query('SELECT * FROM tbl_country_codes where country_code_id='+user.country_code_id,{type:db.QueryTypes.SELECT}).then(countryCode=>{
                            console.log('user.country_code_id : ',countryCode)

         res.render('front/myprofile',{
            success_msg,
            err_msg,
            user,
            text_func,decrypt,
            session:req.session,countryCode
            ,countryData,
            countryCode1:countryCode1
        });

      });
   });
  })
})



  }
  else
  {

    
    res.redirect('/login');

  }

  // console.log("session");
  // console.log(req.session.user_id);


}
/**profile get Method End**/

/**edit-profile Post Method start**/
exports.updateProfile = (req,res,next)=>{

  var user_id=req.session.user_id;
  var full_name= encrypt(req.body.full_name);
    var last_name= encrypt(req.body.last_name);

  var birthplace= encrypt(req.body.birthplace);
  var dob= encrypt(req.body.dob);
  var user_pic=req.body.text_img_name;
  //console.log("oldddddddddddddddd file::::::::::",user_pic);
  let fileName= req.file.originalname;
  fileName=user_id+fileName;
  console.log("fileeeeeeeeeeeeeeeee name newwwwwwwwwwwww:",fileName);

  //console.log('user_pic'+user_pic);

  if(user_id)
  {

    if(user_pic)
    {
       var updateValues={
        full_name:full_name,
        last_name:last_name,
        birthplace:birthplace,
        dob:dob,
        profile_img_name:fileName
      }

    }
    else
    {
      var updateValues={
        full_name:full_name,
        birthplace:birthplace,
        dob:dob
       
      }

    }

      

      UserModel.update(updateValues, { where: { reg_user_id: user_id } }).then((result) => 
             {
                req.flash('success_msg','Profile updated successfully');
                res.redirect('/profile');
        
             }).catch(err=>console.log('err',err))

  }
  else
  {
    res.redirect('/login');
  }

  //console.log("user_id"+user_id+"full_name"+full_name+"birthplace"+birthplace+"dob"+dob);

}
/**edit-profile Post Method End**/


//get profile image
exports.getImg=async function(req,res){
  var user_id=req.session.user_id;
  var imgname=req.params.name;
  try{
    let userDet=await UserModel.findOne({where:{reg_user_id:user_id}});
    let filePath = path.join(__dirname, "../../public/profilepic/"+userDet.profile_img_name);
    console.log(filePath);
    res.sendFile(filePath);
  }catch(err){
    console.log(err);
    res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}




// send otp for mobile number chnage post method start

exports.sendOtpForMobileNumberChange = (req ,res , next) => {

  let user_id   =   req.session.user_id

  var otp = generateOTP()
  var enc_otp = encrypt(otp);
    

    function generateOTP() { 
         
        // Declare a digits variable  
        // which stores all digits 
        var digits = '0123456789'; 
        let OTP = ''; 
        for (let i = 0; i < 4; i++ ) { 
            OTP += digits[Math.floor(Math.random() * 10)]; 
        } 
        return OTP; 
     } 

  UserModel.findOne( { where :{ reg_user_id :user_id } } )
  .then( data => {
   let email = decrypt(data.email)

      UserModel.update({otp : enc_otp }, { where :{ reg_user_id :user_id } } )
      .then(newdata => {
            var smtpTransport = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: MAIL_SEND_ID,
                pass: PASS_OF_MAIL 
              }
            });
            const mailOptions = {
              to           :  email,
              from         : 'questtestmail@gmail.com',
              subject      : "MyReflet OTP for Mobile Number Update.",

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
                      <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(data.full_name)}</h4>
                      <p>Your OTP for mobile number update is ${otp}</p>
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
            res.send({type:"success"})
      })
      .catch(err=> {

        console.log(err)
        res.send({type:"faile"})

      })

     

  })
  .catch(err=> {

    console.log(err)
    res.send({type:"faile"})

  })



}

//send otp for mobile number chnage post method end

/**check_otp_for_phone_numberr start */
exports.check_otp_for_phone_number = (req,res,next) =>{
  
  let user_id   =   req.session.user_id
  let otp       =   req.body.otp

  UserModel.findOne( { where :{ reg_user_id :user_id } } )
  .then(userdata => {

    if ( userdata.otp == encrypt(otp)) {

      res.send({type:"success"})

    } else {

      res.send({type:"faile"})

    }

  })
  .catch(err=> {

    console.log(err)
    res.send({type:"faile"})

  })
}
/**check_otp_for_phone_number end */

/**update mobile number start */
exports.updateMobileNumber = (req,res,next) =>{
 
  let user_id            =   req.session.user_id
  let country_code       =   req.body.country_code_select
  let mobile             =    encrypt(req.body.mobile)
  console.log("country code############### ",country_code)
  db.query('SELECT * FROM tbl_country_codes where phonecode='+country_code,{type:db.QueryTypes.SELECT}).then(countryData=>{


    
        UserModel.update( { country_code_id : countryData.country_code_id , mobile_number : mobile }, { where :{ reg_user_id :user_id } } )
        .then(userdata => {


            res.redirect("/profile")


        })
        .catch(err=> {

          console.log(err)
          res.redirect("/profile")

        })
   })
}
/**update mobile number end */
/**otp_veri_aft_login get Method Start**/
exports.otpAfterLogin = async(req,res,next)=>{
   
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');

  var user_reg_id =req.session.user_id
 
  function toTimestamp(strDate){
    var datum = Date.parse(strDate);
    return datum/1000;
}
  
// var currentTimestamp =parseInt(toTimestamp(new Date())) 

var otp = encrypt(generateOTP())
    
      // console.log("session@@@@@@@@@@@@@@@@@@@@@@@@@ ",session)

function generateOTP() { 
     
    // Declare a digits variable  
    // which stores all digits 
    var digits = '0123456789'; 
    let OTP = ''; 
    for (let i = 0; i < 4; i++ ) { 
        OTP += digits[Math.floor(Math.random() * 10)]; 
    } 
    console.log("OTP::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::;",OTP);
    return OTP; 
 } 
 var ip;
 if (req.headers['x-forwarded-for']) {
     ip = req.headers['x-forwarded-for'].split(",")[0];
 } else if (req.connection && req.connection.remoteAddress) {
     ip = req.connection.remoteAddress;
 } else {
     ip = req.ip;
 }
 var ip55 =ip.split(":")
 
 console.log("client IP is *********************" + ip55[3]);

 var now = new Date();
 now.setMinutes(now.getMinutes() + 05); // timestamp
 now = new Date(now); // Date object
  var otp_expire =now


 await tbl_log_manage.findOne({where:{reg_user_id:user_reg_id,ip_address:ip55[3],deleted:"0"}}).then(async(result)=>{
  // console.log("check for opt and set pin",result)
    UserModel.findOne({where:{reg_user_id:user_reg_id,deleted:"0",status:"active"}}).then(async(userlogindata)=>{
      //console.log("userlogindata@@@@@@@@@@@@@@@@@@@@@@@@@",userlogindata)
     // console.log("user_reg_id@@@@@@@@@@@@@@@@@@@@@@@@@",user_reg_id)
     

    if(!result){
    
                await  UserModel.update({otp:otp,otp_expire:otp_expire}, { where: { reg_user_id:user_reg_id ,deleted:"0",status:"active"}}).then(async(updateOtp) =>{
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
                            <p>Your OTP for MyReflet login is ${decrypt(otp)}</p>
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
              
                           
                  res.redirect(`/get-otp_veri_aft_login?userid=${user_reg_id}`)

                          })
                            

    }else{
      res.redirect(`/set_pin_aft_lgn/?userid=${user_reg_id}`)
    }


  }).catch(err=>console.log("err",err))
  })
  
  
}
/**otp_veri_aft_login get Method End**/

/**get-otp_veri_aft_login Get method Start**/
exports.otpVerificationAfterLogin = (req,res,next )=> {
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
  res.render('front/otp-verify-after-login',{
    success_msg,
    err_msg
});


}
/**get-otp_veri_aft_login  Get method End**/

/**submit-otp-of-login Post method Start**/
exports.submitOtpAfterLogin = (req,res,next )=> {
  var userid = req.body.user_id
  console.log("user id id ...",req.body)
    console.log("user id id ...",req.session)


  var otp1 = req.body.otp1
  var otp2 = req.body.otp2
  var otp3 = req.body.otp3
  var otp4 = req.body.otp4
// var userid=base64decode(req.body.user_id);
  var otp_new =otp1+otp2+otp3+otp4
  var otp = encrypt(otp_new)
   console.log("user id......   ",userid)
   console.log("otp ........   ",otp)
function toTimestamp(strDate){
                                var datum = Date.parse(strDate);
                                return datum/1000;
                            }

   UserModel.findOne({ where: { reg_user_id:userid,deleted:"0",status:"active" }}).then(async(userdata)=>{
      //  console.log("userdata.otp_exp...",userdata)

      var timstampFormDb =parseInt(toTimestamp(userdata.otp_expire)) 
      var currentTimestamp =parseInt(toTimestamp(new Date())) 
           // console.log("userdata.otp_exp...",timstampFormDb)
           // console.log("old time1...",currentTimestamp)
       //    console.log("old time1...",toTimestamp(userdata.otp_expire))
       //    console.log("old time2...",toTimestamp(new Date(userdata.otp_expire)))
       //    console.log("old time2...",toTimestamp(new Date(userdata.otp_expire)))
       //    console.log("new time1...",toTimestamp(new Date()))

if(userdata)
{
            var user_otp = userdata.otp

            console.log("user_db_otp : ",user_otp)

            console.log("user_put_otp : ",otp)

           //  if(user_otp == otp && timstampFormDb>=currentTimestamp){   //you need to uncomment this
               if(otp_new=="2456"){         
                          //    var steps=parseInt("2")
                          //  await  UserModel.update({complete_steps:steps,email_verification_status:"yes"}, { where: { reg_user_id:userid }}).then((result) =>{
                            UserModel.update({wrong_otp_count:"0"},{ where: { reg_user_id:userid,deleted:"0",status:"active" }})
                            .then(data=>{
                              res.redirect(`/set_pin_aft_lgn/?userid=${userid}`)
                            }).catch(err => {
                              console.log("erros 121",err)
                             
                            })

                           


                            //  }).catch(err=>console.log("otp step err",err))
                                 }
       else{

         if (parseInt(userdata.wrong_otp_count) > 9) {

          req.flash('err_msg', 'You have tried so many invalid attempts, please try again to log in.')
          res.redirect(`/login`)

         } else {
          wrong_otp_count = parseInt(userdata.wrong_otp_count)  + 1
          UserModel.update({wrong_otp_count},{ where: { reg_user_id:userid,deleted:"0",status:"active" }}).then(data=>{
            err_msg  = 'You entered wrong OTP.'
            // res.render('front/otp-for-verify',{
            //                                     err_msg,
            //                                     userid:userid,
                                             
            //                                 });
            req.flash('err_msg', 'You entered wrong OTP.')
            res.redirect(`/get-otp_veri_aft_login?userid=${userid}`)
          }).catch(err=>{
                   console.log(err)
                   redirect("/login")
          })
         }
      
         
       
       }
       
}else{
   req.flash('err_msg', 'Record not found.')
   res.redirect("/signup")
}
   }).catch(err=>console.log(err))
}
/**submit-otp-of-login Post method End**/

/**get-set_pin_aft_lgn Get method Start**/
exports.setPinAfterLoginGet = (req,res,next )=> {
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
         res.render('front/set-a-pin-after-login',{
          success_msg,
          err_msg,
          });

}
/**get-set_pin_aft_lgn Get method End**/

/** set_pin_aft_lgn_submit Get method Start**/
exports.submitSetPinAfterLogin = (req,res,next )=> {
  var userid = req.body.userid
  console.log(".userid...submit pin......",userid)
 
  var userID =parseInt(req.body.userid);
  var otp1 =req.body.otp1
  var otp2 =req.body.otp2
  var otp3 =req.body.otp3
  var otp4 =req.body.otp4
  // var steps=parseInt("4")
  // console.log("1",otp1)
  // console.log("1",otp2)
  // console.log("1",otp3)
  // console.log("1",otp4)
  console.log("pinnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn:",otp1+otp2+otp3+otp4);
  var otp = encrypt(otp1+otp2+otp3+otp4)

  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');
  
  var ip;
  if (req.headers['x-forwarded-for']) {
      ip = req.headers['x-forwarded-for'].split(",")[0];
  } else if (req.connection && req.connection.remoteAddress) {
      ip = req.connection.remoteAddress;
  } else {
      ip = req.ip;
  }
  var ip55 =ip.split(":")
  
  console.log("client IP is *********************" + ip55[3]);


UserModel.findOne({ where: { reg_user_id: userID,deleted:"0",status:"active"}}).then(async(result) => 
           {

            console.log("check pin***********",result)

              if(result.user_pin != otp ){

                if (parseInt(result.wrong_otp_count) >=5) {

                  req.flash('err_msg', 'You have tried so many invalid attempts, please contact to admin.')
                  res.redirect("/login")
        
                 } else {
                 var wrong_otp_count = parseInt(result.wrong_otp_count)  + 1
                  console.log(" wrong_otp_count :  ",wrong_otp_count)
                  // var count_data = {
                  //   wrong_otp_count:wrong_otp_count
                  // }

                  
                    await  UserModel.update({wrong_otp_count:wrong_otp_count}, { where: {reg_user_id:userid,deleted:"0",status:"active"}})
                    .then(async(result) =>{
                     
                      console.log(" donedone :  ",wrong_otp_count)

                    req.flash('err_msg', 'You entered wrong OTP.')
                    res.redirect(`/set_pin_aft_lgn/?userid=${userID}`)
                  }).catch(err=>{
                           console.log(err)
                          res.redirect("/login")
                  })
                 }
                // req.flash('err_msg', 'You entered wrong pin.')

                // res.redirect(`/set_pin_aft_lgn/?userid=${userID}`)
              }else{
                 

                   
                  await  UserModel.update({wrong_otp_count:"0"}, { where: {reg_user_id:userid,deleted:"0",status:"active"}})
                  .then(async (result) =>{

                  
                  // console.log(" datadatadatadatadata : ",data)
                   
                  // req.flash('err_msg', 'You entered wrong OTP.')
                  // res.redirect(`/set_pin_aft_lgn/?userid=${userID}`)
                
             await tbl_log_manage.create({
                  reg_user_id : userid,
                  login_time  :new Date(),
                  ip_address  :ip55[3]
                  }).then(async(dataresult)=>{
                    
                    const accessToken = generateAccessToken({
                      "user" : ip55[3]
                    });
                    req.session.token = accessToken
                    // res.cookie("jwt", accessToken, {secure: true, httpOnly: true})

                    if(req.session.user_type=="validatore"){
                      req.session.is_user_logged_in = true;
                      res.redirect(`/validatore_dashboard`);
                    }else{
                      req.session.is_user_logged_in = true;
                      res.redirect(`/dashboard`);
  
                    }
                    
                  }).catch(err=>console.log("err",err))
                }).catch(err=>{
                  console.log(err)
                  res.redirect("/login")
         })
                
              }
              
      
           }).catch(err=>console.log(err))
 
}
/** set_pin_aft_lgn_submit Get method End**/

/** contact-us Post method End**/
exports.contact_us = (req,res, next) => {
    var name =req.body.name
    var email=req.body.email
    var msg =req.body.msg
    console.log("name",name)
    console.log("email",email)
    console.log("msg",msg)
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
                                      co_name:name,
                                      co_email:email,
                                      co_msg:msg,
                                      createdAt:formatted
                               })
                               .then(data=>res.send(data))
                                 .catch(err=>console.log("errr",err))
}; 
/** contact-us Post method End**/

/** subscribe Post method Start**/
exports.subscribe = (req,res, next) => {
 
  var email=(req.body.email).trim()
  
  
  console.log("email",email)
 
 
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
   SubscriberModel.findOne({where:{deleted:"0",subscriber_status:"active",subscriber_email:email}}).then(subcribedata=>{

                    if(!subcribedata){

                          SubscriberModel.create({
                                                 subscriber_email:email,
                                 
                                              })
                                                  // .then(data=>res.send("You have subscribe My Reflect successfilly."))
                                                  .then(data=>res.send("1"))
                                                  .catch(err=>console.log("err1r",err))
                      }else{
                            //  res.send("Already,You are My Reflect subscriber.")
                            res.send("2")
                      }                              
     }).catch(err=>console.log("errr2",err))                                 
}; 
/** subscribe Post method End**/

/**select-country-code Post method Start**/
exports.select_country_code_check = (req,res,next )=> {
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
  var country=req.body.country;
  var codeC=country.split(' ');
  let codeC1=codeC[1].split('');
  let countryCode='';
  for(let i=1;i<codeC1.length-1;i++){
  
    countryCode=countryCode+codeC1[i];
  }
 console.log("cccccccccccc:",countryCode);
 countryCode=countryCode.trim();
 let cities=csc.getCitiesOfCountry(countryCode);
 //console.log("City::::::::::::::::",cities)
var iso,country_code_id,phonecode;
        console.log(" countries : ",country)
 
            
                            res.render('front/city_filter',{
                                                          success_msg,
                                                          err_msg,
                                                          cities
                                                        });
          
     
        
    // })
}
/**select-country-code Post method Start**/

/**cookies_handler_encript Post method Start**/
exports.cookies_handler_encript = (req,res,next)=>{

      var otp1  = encrypt(req.body.otp1)
      var otp2  = encrypt(req.body.otp2)
      var otp3  = encrypt(req.body.otp3)
      var otp4  = encrypt(req.body.otp4)

      res.send({  otp1,
                  otp2,
                  otp3,
                  otp4
      })
} 
/***cookies_handler_encript Post method Start**/

/**cookies_handler_decript Post method Start**/
exports.cookies_handler_decript = (req,res,next)=>{

      var otp1  = decrypt(req.body.otp1)
      var otp2  = decrypt(req.body.otp2)
      var otp3  = decrypt(req.body.otp3)
      var otp4  = decrypt(req.body.otp4)

      res.send({  otp1,
                  otp2,
                  otp3,
                  otp4
      })
} 
/**cookies_handler_decript Post method Start**/

