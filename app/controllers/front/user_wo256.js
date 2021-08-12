var {UserModel,LogDetailsModel,tbl_log_manage}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel,CountryCodeModel}=require('../../models/securityMaster');
var {     tbl_verifier_plan_master,AdminModel,PlanFeatures,PlanFeatureRel,tbl_verifier_doc_list,MarketPlace,AllotMarketPlace,ContectUsModel,SubscriberModel
} = require('../../models/admin');
var { tbl_verfier_purchase_details } =require("../../models/purchase_detaile")
var { tbl_plan_features } =require("../../models/tbl_plan_features")
var { tbl_plan_feature_rel } =require("../../models/tbl_plan_feature_rel")


var os = require('os');

const nodemailer = require("nodemailer");
const express = require('express');
var app=express();
const ejs = require('ejs');

var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime')
var crypto = require('crypto');
var text_func=require('../../helpers/text');

var mail_func=require('../../helpers/mail');
const util = require('util');
const { base64encode, base64decode } = require('nodejs-base64');

var userData = require('../../helpers/profile')

/**index Get Method start**/
exports.index = (req,res, next) => {
    res.render('front/index',{
      session:req.session
    });
};
/**index Get Method End**/


/**signup Get Method start**/
exports.signup = (req,res,next )=> {
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');

  db.query(' SELECT * FROM `tbl_countries` WHERE status="active" ORDER BY `country_id` ASC',{type:db.QueryTypes.SELECT}).then(countryData=>{
    db.query('SELECT * FROM `tbl_country_codes` ORDER BY `iso` ASC',{type:db.QueryTypes.SELECT}).then(countryCode=>{

                        res.render('front/register',{
                                                      success_msg,
                                                      err_msg,
                                                      countryData,countryCode
                                                    });
    })
  })
}
/**signup Get Method End**/

/**submit_register Post Method start**/
exports.submit_register = (req,res,next )=> {

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var full_name = req.body.full_name;
    var email = req.body.email;
    var dob = req.body.dob;
    var place_of_birth = req.body.place_of_birth;
      var country_code_select = req.body.country_code_select;
  
    var mobile = req.body.mobile;
    var last_name = req.body.last_name;
      console.log('mobile : ',mobile)
            console.log('mobile : ',country_code_select)

    var now = new Date();
    now.setMinutes(now.getMinutes() + 05); // timestamp
    now = new Date(now); // Date object
     var otp_expire =now
    // console.log(now);

    var otp = generateOTP()
    

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


     var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
     var mystr = mykey.update(req.body.password, 'utf8', 'hex')
     mystr += mykey.final('hex');


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
                        UserModel.create({full_name:full_name,last_name:last_name,email:email,country_code_id:country_code_select,mobile_number:mobile,birthplace:place_of_birth,dob:dob,password:mystr,otp,otp_expire,complete_steps:steps}).then(result=>{
            
                            console.log(result);
                             var smtpTransport = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                  user: 'info.myreflet@gmail.com',
                                  pass: 'myquest321'
                                }
                              });
                              const mailOptions = {
                                to: email,
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
                                        <img src="http://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
                                      </div>
                                      <div style="padding: 30px;line-height: 32px; text-align: justify;">
                                        <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${full_name}</h4>
                                        <p>Your OTP for MyReflet registration is ${otp}</p>
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
                                // res.render('front/otp-for-verify',{
                                //   success_msg,
                                //   err_msg,
                                //   userid: userdata.reg_user_id,
                                 
                                // });
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
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
           res.render('front/otp-for-verify',{
            success_msg,
            err_msg,
            });

  
}
/**top_verification Get Method End**/

/**submitOtp Post Method Start**/
exports.submitOtp = (req,res,next )=> {
    var userid = req.body.user_id
    console.log("user id id ...",userid)
 
    var otp1 = req.body.otp1
    var otp2 = req.body.otp2
    var otp3 = req.body.otp3
    var otp4 = req.body.otp4
 // var userid=base64decode(req.body.user_id);
 var otp =otp1+otp2+otp3+otp4
 //    console.log("user id......   ",userid)
 //    console.log("otp ........   ",otp)
 function toTimestamp(strDate){
                                  var datum = Date.parse(strDate);
                                  return datum/1000;
                              }
 
     UserModel.findOne({ where: { reg_user_id:userid }}).then(async(userdata)=>{
         console.log("userdata.otp_exp...",userdata)
 
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
               if(userdata.otp==otp && timstampFormDb>=currentTimestamp){
                               
                               var steps=parseInt("2")
                             await  UserModel.update({complete_steps:steps,email_verification_status:"yes"}, { where: { reg_user_id:userid }}).then((result) =>{
                                 res.redirect(`/sequrity_question/?userid=${userid}`)
                               }).catch(err=>console.log("otp step err",err))
                                   }
         else{
             err_msg  = 'You entered wrong OTP.'
             // res.render('front/otp-for-verify',{
             //                                     err_msg,
             //                                     userid:userid,
                                              
             //                                 });
             req.flash('err_msg', 'You entered wrong OTP.')
             res.redirect(`/top_verification?userid=${userid}`)
         
         }
         
 }else{
     req.flash('err_msg', 'Record not found.')
     res.redirect("/signup")
 }
     }).catch(err=>console.log(err))
 }
 /**submitOtp Post Method End**/
 
/**sequrity_question Get Method Start**/
 exports.sequrityQuestion = (req,res,next )=> {
    db.query("SELECT * FROM tbl_security_questions").then(securityQuestionsData=>{
        //    console.log("sequrityQuestion",securityQuestionsData)
           res.render('front/sequrity-question',{
                                               securityQuestions:securityQuestionsData[0]
                                                 });

    })
  
}
/**sequrity_question Get Method End**/

/**submitQuestionAns Post Method Start**/
exports.submitQuestionAns = (req,res,next )=> {
  console.log("--------------------------------------------submitQuestionAns--------------------------------------------")
   
    var idUser =req.body.userId
    var userID =parseInt(req.body.userId);
    var question =req.body.question
    var answer =req.body.answer
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    console.log(question)
    console.log(answer)
    console.log(question.length)
    console.log(answer.length)
 
 
    for(var i=0 ; i<question.length; i++){
     // var sql = "INSERT INTO tbl_user_security_question_rels (reg_user_id, question_id,answer,createdAt,updatedAt) VALUES ('"+userID+"','"+parseInt(question[i])+"','"+answer[i]+"','"+formatted+"','"+formatted+"')";
     // db.query(sql).then(result=>{
     UserSecurityModel.create({
                              reg_user_id:userID,
                              question_id:parseInt(question[i]),
                              answer:answer[i],
                              createdAt : formatted,
                              updatedAt: formatted
                            }).then(data=>{console.log("data saved")
      
     }).catch(err=>console.log(err))
 
    }
                        var steps=parseInt("3")
                               UserModel.update({complete_steps:steps}, { where: { reg_user_id:userID }}).then((result) =>{
                                 // res.render('front/set-a-pin',{
                                 //     idUser
                                 //  });
                                 res.redirect(`/set_pin/?userid=${idUser}`)
                               }).catch(err=>console.log("otp step err",err))
       
 }
 /**submitQuestionAns Post Method End**/

/**set_pin Get Method Start**/
 exports.setPinGet = (req,res,next )=> {
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
           res.render('front/set-a-pin',{
            success_msg,
            err_msg,
            });
  
}
/**set_pin Get Method End**/

/**submitSetPin Post Method Start**/
exports.submitSetPin = (req,res,next )=> {
    var userid = req.body.userid
    // console.log(".userid.........",userid)
    var userID =parseInt(req.body.userid);
    var otp1 =req.body.otp1
    var otp2 =req.body.otp2
    var otp3 =req.body.otp3
    var otp4 =req.body.otp4
    var steps=parseInt("4")
    // console.log("1",otp1)
    // console.log("1",otp2)
    // console.log("1",otp3)
    // console.log("1",otp4)
    var otp =parseInt(otp1+otp2+otp3+otp4)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    
var updateValues={
                  user_pin:otp,
                  updatedAt:formatted,
                  complete_steps:steps
                 }

UserModel.update(updateValues, { where: { reg_user_id: userID } }).then((result) => 
             {
                // console.log("update pin  ",result);
                res.redirect(`/terms-and-conditions?userId=${userID}`);
        
             }).catch(err=>console.log(err))
   
 }
 /**submitSetPin Post Method End**/

/**terms-and-conditions Get Method Start**/
exports.termsAndCondition =async (req,res,next )=> {

  await db.query("SELECT *FROM `tbl_front_terms_conditions`",{ type:db.QueryTypes.SELECT}).then(async function(term_data){     

    res.render('front/signup-terms',{term_data});

  })
   
 }
 /**terms-and-conditions Get Method End**/

/**terms-and-conditions-submit Post Method Start**/
 exports.termsAndConditionSubmit = (req,res,next )=> {
    var steps=parseInt("5")
     var userid=req.body.user_id
     var userID =parseInt(userid);
     var updateValues={
       
        complete_steps:steps
       }

UserModel.update(updateValues, { where: { reg_user_id: userID } }).then((result) => 
   {
    UserModel.findOne({ where:{reg_user_id: userID } }).then(function(activeUser){
      console.log("update pin  ",result);
      var activeEmail=activeUser.email;
      var username = activeUser.full_name

      console.log("update pin  ",activeEmail);
      console.log("update pin  ",username);
     
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
               <img src="http://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
            </div>
            <div style="padding: 30px;line-height: 32px; text-align: justify;">
              <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${username}</h4>
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
      var to_mail=activeEmail;
      var mailresult=mail_func.sendMail(to_mail,mail_subject,mail_content);

      res.redirect('/login');
      })
   }).catch(err=>console.log(err))
    
   
 }
 /**terms-and-conditions-submit Post Method End**/

/**check_user_steps Post Method Start**/
 exports.checkUserSteps = (req,res,next )=> {
    var email =req.body.email
    console.log("email",email)
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
  console.log("userid ",req.body);

   var userid = req.body.user_id
   console.log("userid ",userid);
   var otp = generateOTP()
   var now = new Date();
   console.log("date now ",now);
   now.setMinutes(now.getMinutes() + 05); // timestamp
   now = new Date(now); // Date object
   console.log("date after 3 min ",now);

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
                 // console.log(result);
               await  UserModel.findOne({ where: { reg_user_id:userid }}).then(userdata=>{

                                                    var smtpTransport = nodemailer.createTransport({
                                                      service: 'gmail',
                                                      auth: {
                                                        user: 'info.myreflet@gmail.com',
                                                        pass: 'myquest321'
                                                      }
                                                    });
                                                    const mailOptions = {
                                                      to: userdata.email,
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
                                                              <img src="http://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
                                                            </div>
                                                            <div style="padding: 30px;line-height: 32px; text-align: justify;">
                                                              <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${userdata.full_name}</h4>
                                                              <p>Your OTP for MyReflet verification is ${otp}</p>
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
    // success_msg = req.flash('success_msg');
    // err_msg = req.flash('err_msg');
    if(req.session.user_type == "client"){
res.redirect("/cilent_deshboard")
    }else{
      res.redirect('/verifier_deshboard')

    }
      //    res.render('front/myReflect/my-reflet-id-code-new',{
      //   success_msg,
      //   err_msg,
      //   session:req.session,
      //   userData,
      //   ejs
      //  }); 
    }
/**dashboard Get Method End**/

/**login Get Method Start**/
    
exports.login = (req,res,next )=> {
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var test = req.session.is_user_logged_in;

    console.log(test)
    if (test == true) {
    res.redirect('/dashboard');
    } else 
    {
     
     res.render('front/login',{
        success_msg,
        err_msg,
       }); 
    }

   }
/**login Get Method End**/

//*invailed login attempt mailing function
InvalidLoginAttempt = (email,req) => {

  var smtpTransport = nodemailer.createTransport({
                                                    service: 'gmail',
                                                    auth: {
                                                            user: 'info.myreflet@gmail.com',
                                                            pass: 'myquest321'
                                                          }
                       });

  const mailOptions = {
                          to     : email,
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
                                            <img src="http://${req.headers.host}/admin-assets/images/logo-white.png" style="width: 120px;">
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

  smtpTransport.sendMail(mailOptions, function (err) {
   
                                                     });

 }

/**submit_login Post Method Start**/
exports.submitLogin = (req,res,next )=> {

   console.log('...................................submit login.............................................................')

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
    var pass = mykey.update(req.body.password, 'utf8', 'hex')
    pass += mykey.final('hex');
    var email =(req.body.email).trim();
    var dt = dateTime.create();
    var login_time = dt.format('Y-m-d H:M:S');
    var blocked_date = dt.format('Y-m-d H:M:S');
    var Ip_addr= req.body.Ip_add
    var steps=parseInt("5")

        UserModel.findOne({ where: {email: email,password:pass,complete_steps:steps} }).then(async function(userDataResult) {
   
                    
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
                                                    var smtpTransport = nodemailer.createTransport({
                                                        service: 'gmail',
                                                        auth: {
                                                          user: 'info.myreflet@gmail.com',
                                                          pass: 'myquest321'
                                                        }
                                                      });
                                                      const mailOptions = {
                                                        to: email,
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
                                                                <img src="http://${req.headers.host}/admin-assets/images/logo-white.png" style="width: 120px;">
                                                              </div>
                                                              <div style="padding: 30px;line-height: 32px; text-align: justify;">
                                                                <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${full_name}</h4>
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
                         if(userDataResult.profile_pic!=null){
                          let buff= new Buffer(userDataResult.profile_pic).toString('utf8');
                         text_img = buff.toString('ascii');
                       }else{
                       text_img=""

                       }
                          
                         /**Image for ejs end**/

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

    var email =req.body.emailid;
    var request_type =req.body.request_type;

   console.log('request_type : ',request_type)
    UserModel.findOne({ where:{email:email,deleted:'0'} }).then(function(userDataResult) {

         if(userDataResult==null)
         {
          req.flash('err_msg', 'This Email-Id is not registered.')
          res.redirect("/forget-password");

         }
         else
         {
             UserModel.findOne({ where:{email:email,status:'active'} }).then(function(activeUser){

              if(activeUser==null)
              {
                 req.flash('err_msg', 'Your account is inactive.Please contact to administrator.')
                 res.redirect("/forget-password");
              }
              else
              {


                var activeEmail=activeUser.email;
                var username = text_func.ucFirst(activeUser.full_name);
                var verification_code=text_func.newOTP();
                var url_data,sub_type;
                if(request_type==='password'){

                   url_data='http://'+req.headers.host+'/reset-password-link/?mail='+base64encode(activeEmail);
                  //  p_tag = ``
                    sub_type = "ResetPassword"
                }else{

                   url_data='http://'+req.headers.host+'/reset-pin-link/?mail='+base64encode(activeEmail);
                   sub_type = "ResetPin"
                }


                /**update vericication code to reset passsword start**/

                 var updateValues={
                    otp:verification_code
                 };

      UserModel.update(updateValues,{where:{ reg_user_id: activeUser.reg_user_id } }).then(async (result) => {
      
        var smtpTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'info.myreflet@gmail.com',
              pass: 'myquest321'
            }
          });
          const mailOptions = {
            to: activeEmail,
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
                    <img src="http://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
                  </div>
                  <div style="padding: 30px;line-height: 32px; text-align: justify;">
                    <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${username}</h4>
                    <p>Please check your verificaton code and reset ${request_type} link.<br/><b>Verification code:</b>${verification_code}<br/><a href="${url_data}">Click here</a> to reset password.</p>
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
                   /**send link to resetnavajsheikh@-password start**/
          
                // mailresult.then(function(result_m) {
                //   console.log(result_m); // "Some User token"
                // });

                // console.log("result",mailresult);

                //   if(mailresult==1)
                //   {
                   
                //      res.redirect("/reset-password");
                //   }
                //   else
                //   {
                //     req.flash('err_msg',mailresult);
                //     res.redirect("/forget-password");
                //   }
                   
                   res.redirect("/reset-password");
                  /**send link to reset-password start**/
               
                
        
                }).catch(err=>console.log(err))

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
   success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

  if(mailid)
  {
    var emailid=base64decode(mailid);
      
     res.render('front/enter-pin',{
        success_msg,
        err_msg,emailid
     });

  }
  else
  {
    //
  }


}
/**reset-password-link Get method End**/

/**reset-password-form Post Start**/
exports.resetPasswordFormPost = (req,res,next )=> {
    var mailid=req.body.emailId;
  var pin1 = req.body.otp1.trim();
    var pin2 = req.body.otp2.trim();
    var pin3 = req.body.otp3.trim();
    var pin4 = req.body.otp4.trim();
    var user_pin = pin1+""+pin2+""+pin3+""+pin4;    var otp=req.body.verification_code;
    var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
    var newPass = mykey.update(req.body.user_pass, 'utf8', 'hex')
    newPass += mykey.final('hex');

    var updateValues={
        password:newPass
       }

     success_msg = req.flash('success_msg');
      err_msg = req.flash('err_msg');
   
    if(mailid)
    {
        console.log(mailid)
      UserModel.findOne({where:{email:mailid}}).then(function(user){
          console.log('user ',user)
        if(user.user_pin!= user_pin){
            console.log('pin is incorrect');
            res.render('front/enter-pin',{err_msg:"Your pin is incorrect.",emailid:mailid});
        }
        if(user.otp!= otp){
            console.log('otp is incorrect',otp);

             console.log('otp user is incorrect',user.otp);
            res.render('front/enter-pin',{err_msg:"Your otp is incorrect.",emailid:mailid});
        }
        else{
            UserModel.update(updateValues, { where: { email:mailid} }).then((result) => 
             {
                 console.log("updated result  ",result);
                //  res.redirect('/login');
                 res.render('front/login',{success_msg:"Your password is update."});
        
             }).catch(err=>{
             console.log(err)
             })
        }
    })
      
    //    render('front/enter-pin',{
    //       success_msg,
    //       err_msg
    //    });
  
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

  if(mailid)
  {
    var emailid=base64decode(mailid);
      
     res.render('front/reset-pin-link',{
        success_msg,
        err_msg,emailid
     });

  }
  else
  {
    //
  }


}
/**reset-pin-link Get method End**/

/**reset-pin-form Post Start**/
exports.resetPinFormPost = (req,res,next )=> {
    var mailid=req.body.emailId;
    var pin1 = req.body.otp1.trim();
    var pin2 = req.body.otp2.trim();
    var pin3 = req.body.otp3.trim();
    var pin4 = req.body.otp4.trim();
    var user_pin = pin1+""+pin2+""+pin3+""+pin4;  
    var otp=req.body.verification_code;
    // var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
    // var newPass = mykey.update(req.body.user_pass, 'utf8', 'hex')
    // newPass += mykey.final('hex');

    var updateValues={
      user_pin:user_pin
       }

     success_msg = req.flash('success_msg');
      err_msg = req.flash('err_msg');
   
    if(mailid)
    {
        console.log(mailid)
      UserModel.findOne({where:{email:mailid}}).then(function(user){
          console.log('user ',user)
        
        if(user.otp!= otp){
            console.log('Veriffication code is incorrect',otp);

             console.log('otppassword user is incorrect',user.otp);
            res.render('front/reset-pin-link',{err_msg:"Veriffication code is incorrect.",emailid:mailid});
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
      
    //    render('front/enter-pin',{
    //       success_msg,
    //       err_msg
    //    });
  
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
            var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
            var mystr = mykey.update(password, 'utf8', 'hex')
            mystr += mykey.final('hex');
            // console.log("mystr",mystr);
            console.log("user_answer1 user_answer2",user_answer1,user_answer2);

            if(user.password!=mystr){
               req.flash('err_msg','Your old password is wrong.');
            // console.log('old pass is wrong');
                res.redirect('/get-change-pass');
            }else if(user_answer1!=answer[0] && user_answer2!=answer[1] ){
                   req.flash('err_msg','Your security answer is wrong.');
                // console.log('answer is wrong');
                res.redirect('/get-change-pass');
            }else if(password==newPassword){
                req.flash('err_msg','Old password and new password can not be same.');
                // console.log('answer is wrong');
                res.redirect('/get-change-pass');
            }else{

              if(user_answer1==answer[0] && user_answer2==answer[1] ){
                              var newmykey = crypto.createCipher('aes-128-cbc', 'mypass');
                            var newmystr = newmykey.update(newPassword, 'utf8', 'hex')
                            newmystr += newmykey.final('hex');
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
    var pin = pin1+""+pin2+""+pin3+""+pin4;
    // console.log("pin",pin);
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
    var pin = pin1+""+pin2+""+pin3+""+pin4;
    
    var newpin1 = req.body.newotp1.trim();
    var newpin2 = req.body.newotp2.trim();
    var newpin3 = req.body.newotp3.trim();
    var newpin4 = req.body.newotp4.trim();
    var newpin = newpin1+""+newpin2+""+newpin3+""+newpin4;

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
    // console.log("...type....",type)
    // res.send("done")

    // var type = req.body.usertype
    
    // console.log("type",type)
    // if(type=="verifier"){
    //   tbl_verfier_purchase_details.findOne({where:{reg_user_id:req.session.user_id,reflect_id:null}}).then(puchasedResult=>{
    //     console.log("puchasedResult",puchasedResult)
    //     if(puchasedResult){
    //       console.log("inner if")
    //       req.session.user_type =type
    //       res.render('front/i_am_verfier-side-bar');    
    //     }else{
    //       console.log("inner erlse")
    //       res.redirect("/verifier_or_not_purches_plan")
    //     }
    //   })
    // }else{
    //   console.log("outer else")
    //   req.session.user_type =type
    //   res.render('front/client-side-bar');
    // }
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
        req.session.user_type ="client"
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


// exports.verifier_or_not_purches_plan = async(req,res,next )=> {
//   var err_msg= req.flash('err_msg');
//   var success_msg= req.flash('success_msg');
//   req.session.user_type ="verifier";

//   await tbl_plan_features.findAll({where:{deleted:"0"}}).then(async(featureNmaeData)=>{
//       await  tbl_plan_feature_rel.findAll({}).then(async(plan_rel_data)=>{
//            await    tbl_verifier_plan_master.findAll({where:{deleted:"0"}}).then(async(resultPlan)=>{
          
//                   res.render('front/choose-plan',
//                   {
//                       success_msg,
//                       err_msg,
//                       resultPlan,
//                       plan_rel_data,
//                       featureNmaeData,
//                   session:req.session
//                   });
             
              
//           })
          
//       }).catch(err=>console.log(err))
//           }).catch(err=>console.log("errrr",err))
  

  
  
//           }

/**profile get Method start**/
exports.showUserProfile = (req,res,next)=>{


  var user_id=req.session.user_id;

  if(user_id)
  {
      UserModel.findOne({ where:{reg_user_id:user_id} }).then(function(user){
        console.log('user.country_code_id : ',user.country_code_id)
   db.query('SELECT * FROM tbl_country_codes where country_code_id='+user.country_code_id,{type:db.QueryTypes.SELECT}).then(countryCode=>{
                            console.log('user.country_code_id : ',countryCode)

         res.render('front/myprofile',{
            success_msg,
            err_msg,
            user,
            text_func,
            session:req.session,countryCode
        });

      });
   });

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
  var full_name=req.body.full_name;
    var last_name=req.body.last_name;

  var birthplace=req.body.birthplace;
  var dob=req.body.dob;
  var user_pic=req.body.text_img_name;


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
        profile_pic:user_pic
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
  {assets/images/logo-white.png
    res.redirect('/login');assets/images/logo-white.png
assets/images/logo-white.png
  }

  //console.log("user_id"+user_id+"full_name"+full_name+"birthplace"+birthplace+"dob"+dob);

}
/**edit-profile Post Method End**/



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
var otp = generateOTP()
    
      // console.log("session@@@@@@@@@@@@@@@@@@@@@@@@@ ",session)

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
   console.log("check for opt and set pin",result)
    UserModel.findOne({where:{reg_user_id:user_reg_id,deleted:"0",status:"active"}}).then(async(userlogindata)=>{
      console.log("userlogindata@@@@@@@@@@@@@@@@@@@@@@@@@",userlogindata)
      console.log("user_reg_id@@@@@@@@@@@@@@@@@@@@@@@@@",user_reg_id)
     

    if(!result){
    
                await  UserModel.update({otp:otp,otp_expire:otp_expire}, { where: { reg_user_id:user_reg_id ,deleted:"0",status:"active"}}).then(async(updateOtp) =>{
                  var smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'info.myreflet@gmail.com',
                      pass: 'myquest321'
                    }
                  });
                  const mailOptions = {
                    to: userlogindata.email,
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
                            <img src="http://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
                          </div>
                          <div style="padding: 30px;line-height: 32px; text-align: justify;">
                            <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${userlogindata.full_name}</h4>
                            <p>Your OTP for MyReflet registration is ${otp}</p>
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
var otp =otp1+otp2+otp3+otp4

   console.log("user id......   ",userid)
   console.log("otp ........   ",otp)
function toTimestamp(strDate){
                                var datum = Date.parse(strDate);
                                return datum/1000;
                            }

   UserModel.findOne({ where: { reg_user_id:userid,deleted:"0",status:"active" }}).then(async(userdata)=>{
       console.log("userdata.otp_exp...",userdata)

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
             if(userdata.otp==otp && timstampFormDb>=currentTimestamp){
                             
                          //    var steps=parseInt("2")
                          //  await  UserModel.update({complete_steps:steps,email_verification_status:"yes"}, { where: { reg_user_id:userid }}).then((result) =>{
                            
                            res.redirect(`/set_pin_aft_lgn/?userid=${userid}`)


                            //  }).catch(err=>console.log("otp step err",err))
                                 }
       else{
           err_msg  = 'You entered wrong OTP.'
           // res.render('front/otp-for-verify',{
           //                                     err_msg,
           //                                     userid:userid,
                                            
           //                                 });
           req.flash('err_msg', 'You entered wrong OTP.')
           res.redirect(`/get-otp_veri_aft_login?userid=${userid}`)
       
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
  var otp =parseInt(otp1+otp2+otp3+otp4)

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


UserModel.findOne({ where: { reg_user_id: userID,deleted:"0",status:"active",user_pin:otp } }).then(async(result) => 
           {

            console.log("check pin***********",result)
              if(!result){
                req.flash('err_msg', 'You entered wrong pin.')

                res.redirect(`/set_pin_aft_lgn/?userid=${userID}`)
              }else{
    await tbl_log_manage.create({
                  reg_user_id : userid,
                  login_time  :new Date(),
                  ip_address  :ip55[3]
                  }).then(async(dataresult)=>{
                    
                    if(req.session.user_type=="validatore"){
                      req.session.is_user_logged_in = true;
                      res.redirect(`/validatore_dashboard`);
                    }else{
                      req.session.is_user_logged_in = true;
                      res.redirect(`/dashboard`);
  
                    }
                    
                  }).catch(err=>console.log("err",err))
                
              }
              
      
           }).catch(err=>console.log(err))
 
}
/** set_pin_aft_lgn_submit Get method End**/

//contact us post method start***
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
          user: 'info.myreflet@gmail.com',
          pass: 'myquest321'
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
              <img src="http://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
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

exports.subscribe = (req,res, next) => {
 
  var email=(req.body.email).trim()
  
  
  console.log("email",email)
 
 
  var smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'info.myreflet@gmail.com',
      pass: 'myquest321'
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
            <img src="http://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
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
// 
exports.select_country_code_check = (req,res,next )=> {
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
  var country=req.body.country;

var iso,country_code_id,phonecode;
        console.log("scfdgtyyooouj777777y78sdrgthyujiko099999999999999999999999999999999999999888888888888888888888888 : ",country)

     db.query('SELECT * FROM `tbl_country_codes`  ORDER BY `iso` ASC',{type:db.QueryTypes.SELECT}).then(countryCode=>{
      countryCode.forEach(codes=>{
        // console.log(codes.name)
        if(codes.name==country)
        {
          phonecode=codes.phonecode
          country_code_id=codes.country_code_id
          iso=codes.iso
        }
      })
        console.log(iso,country_code_id,phonecode)
         res.render('front/register_filter',{
                    countryCode,iso,country_code_id,phonecode,selected_country:country
          });
    })
}