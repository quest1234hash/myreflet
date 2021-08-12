var {UserModel,LogDetailsModel,tbl_log_manage}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var {     tbl_verifier_plan_master,AdminModel,PlanFeatures,PlanFeatureRel,tbl_verifier_doc_list,MarketPlace,AllotMarketPlace,ContectUsModel,SubscriberModel
} = require('../../models/admin');
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel,verifierRequestModel,updatePrmRequestModel} = require('../../models/request');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');

var { tbl_verfier_purchase_details } =require("../../models/purchase_detaile")
var { validatoreModel,tbl_validatore_requests,tbl_validatore_requests_doc_files, ValidatorNotificationModel} =require("../../models/validetore")
var { tbl_plan_features } =require("../../models/tbl_plan_features")
var { tbl_plan_feature_rel } =require("../../models/tbl_plan_feature_rel")
var admin_notification = require('../../helpers/admin_notification.js')
// admin_notification("msg","2","3","5")NotificationModel
var {NotificationModel} = require('../../models/notification');
var os = require('os');
var moment = require('moment');
var request= require('request');
const nodemailer = require("nodemailer");
const express = require('express');
var app=express();
const ejs = require('ejs');
var async = require('async');
// var imageDataURI = require('image-data-uri');
var { decrypt, encrypt }                                         = require('../../helpers/encrypt-decrypt')

const { base64encode, base64decode } = require('nodejs-base64');
const Tx = require('ethereumjs-tx')
const Web3 = require('web3');

// var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/eda1216d6a374b3b861bf65556944cdb"));
//var web3 = new Web3(new Web3.providers.HttpProvider("http://13.233.173.250:8501"));
var web3 = new Web3(new Web3.providers.HttpProvider("http://128.199.31.153:8501"));

var dataUriToBuffer = require('data-uri-to-buffer');

var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime')
var crypto = require('crypto');
var text_func=require('../../helpers/text');
var Jimp = require('jimp');
const fetch = require('node-fetch');
const { PDFDocument } = require('pdf-lib');
// const fs = require('fs');
var mail_func=require('../../helpers/mail');
const util = require('util');

var userData = require('../../helpers/profile')

const paginate = require("paginate-array");
const fs = require('fs');
const ipfsAPI = require('ipfs-api');
var async = require('async');
const { Promise, resolve, reject } = require('bluebird');

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

var contractAddress = '0xf81F900EB4b36CEE20D743511d3074fE48aFCA84';

var contractABI = [{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"documents","outputs":[{"name":"doc","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"doc","type":"string"},{"name":"verifier_email","type":"string"},{"name":"client_email","type":"string"},{"name":"doc_name","type":"string"},{"name":"verifier_myReflect_code","type":"string"},{"name":"client_myReflect_code","type":"string"},{"name":"request_status","type":"string"},{"name":"reason","type":"string"}],"name":"addDocument","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getDocumentsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getDocument","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}];


exports.validatore_deashboard = (req,res,next )=> {
//   success_msg = req.flash('success_msg');   // for success flash msg
//   err_msg = req.flash('err_msg');          // for error flash msg
// //**fatch the country list from master tble start */
//       db.query('SELECT * FROM `tbl_country_codes` ORDER BY `iso` ASC',{type:db.QueryTypes.SELECT}).then(countryCode=>{
//             db.query('SELECT * FROM tbl_countries WHERE status="active"',{type:db.QueryTypes.SELECT}).then(countryData=>{
//                    //**Render the signup page */
                                      //  res.render('front/validatore/validator_dasboard',{
                                      //                                          success_msg,
                                      //                                          err_msg,     
                                      //                                         //  countryData,  //country list
                                      //                                         //  countryCode
                                      //    });
                                      res.redirect("/validator-wallet-list")

        //       })
        // })
}

/**signup Get Method start**/
exports.validatore_signup = (req,res,next )=> {
    success_msg = req.flash('success_msg');   // for success flash msg
    err_msg = req.flash('err_msg');          // for error flash msg
//**fatch the country list from master tble start */
        db.query('SELECT * FROM `tbl_country_codes` ORDER BY `iso` ASC',{type:db.QueryTypes.SELECT}).then(countryCode=>{
              db.query('SELECT * FROM tbl_countries WHERE status="active"',{type:db.QueryTypes.SELECT}).then(countryData=>{
                     //**Render the signup page */
                                         res.render('front/validatore/register',{
                                                                                 success_msg,
                                                                                 err_msg,     
                                                                                 countryData,  //country list
                                                                                 countryCode
                                           });
                })
          })
}
/**signup Get Method End**/


/**submit_register Post Method start**/
exports.submit_validatore_registration = (req,res,next )=> {

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var full_name = encrypt(req.body.full_name);
    var email = encrypt(req.body.email);
    var dob = encrypt(req.body.dob);
    var pin = encrypt(req.body.pin);
    var country_code_id = req.body.country_code_select;
    var place_of_birth = encrypt(req.body.place_of_birth);
    var mobile = encrypt(req.body.mobile);
    var last_name = encrypt(req.body.last_name);
    
    var now = new Date();
    now.setMinutes(now.getMinutes() + 03); // timestamp
    now = new Date(now);                  // Date object
    var otp_expire =now                  //  Set Otp Expire date
    var otp = encrypt(generateOTP());
    
    //**OTP generate function defination start */
    function generateOTP() { 
                            var digits = '0123456789'; // Declare a digits variable   which stores all digits
                            let OTP = ''; 
                                    //**For loop start for generate 4 digit OTP */
                                  for (let i = 0; i < 4; i++ ) { 
                                         OTP += digits[Math.floor(Math.random() * 10)]; //use of random function for random digit
                                         } 
                            return OTP; //return otp to caller function
     } 

     var mystr = crypto.createHash('sha256').update(req.body.password).digest('hex');


     //**query for check this user is already register or not? */
    UserModel.findOne({ where: {email: email} }).then(function(userDataResult) {
        if(userDataResult){
                                req.flash('err_msg', 'User email is already registered.')    // send error msg
                                res.redirect('/validatore_signup');
          }else{
              //**query for check this mobile number is already register or not? */
               UserModel.findOne({ where: {mobile_number:mobile} }).then(function(userResult){
                  if(userResult){
                                 req.flash('err_msg', 'User mobile number is already registered.')    // send error msg
                                 res.redirect('/validatore_signup');
                }else{
                    var steps=parseInt("5")
                    //**Register the user(enter the entry into database) */
                        UserModel.create({full_name:full_name,last_name:last_name,email:email,mobile_number:mobile,birthplace:place_of_birth,dob:dob,password:mystr,otp,otp_expire,complete_steps:steps,user_pin:pin,country_code_id,type:"validatore",status:"inactive"}).then(result=>{
                             //**OTP mailing Functionality start */

                             console.log("email : ",email)

                             var smtpTransport = nodemailer.createTransport({
                                        service: 'gmail',
                                        auth   : {
                                         user: 'info.myreflet@gmail.com',
                                         pass: 'myquest321'
                                                }
                                    });
                              const mailOptions = {
                                to: decrypt(email),
                                from: 'questtestmail@gmail.com',
                                subject: "Invitation to become Validatore.",
                          
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
                                        <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(full_name)}</h4>
                                        <p>The link to become validatore is here https://${req.headers.host}/val_invitation?email=${Buffer.from(email).toString('base64')}</p>
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
                              //**mailing Functionality end */
                              //**send user to the OTP screen */
                            UserModel.findOne({ where: {email: email,mobile_number:mobile} }).then(userdata=>{
                                        req.flash('success_msg', 'Invitation has been sent on this email please check.')
                                 res.redirect(`/validatores`)
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


exports.val_invitation = (req,res,next )=> {
    success_msg = req.flash('success_msg');   // for success flash msg
    err_msg = req.flash('err_msg'); 
    var email =req.query.email 
           // for error flash msg
if(email!=undefined){


             res.render('front/validatore/invitaionPage',{
                                           success_msg,
                                           err_msg,     
                                           email, 
                                            //country list
                                        });

     }else{
         console.log("data is missing from url")
     }
}

exports.submit_val_invitation = (req,res,next )=> {
    success_msg = req.flash('success_msg');   // for success flash msg
    err_msg = req.flash('err_msg'); 
    var email =req.query.email 
    var status =req.query.status 
        console.log("out side")
    var emailID = Buffer.from(req.query.email, 'base64').toString('ascii');

    console.log("email id : : : : ",emailID)

        console.log("encrypt(emailID) id : : : : ",encrypt(emailID))

if(email!=undefined & status!=undefined  ){
    console.log("inside side1")
    if(status=="accept"){
          UserModel.update({email_verification_status:"yes",status:"active"},{where:{email:emailID}}).then(updata=>{
            req.flash("success_msg","Congratulations , You become validatore.")
            res.redirect('/login');
          }).catch(err=>console.log("inviation err",err))
        

    }else{
        req.flash("succerr_msgess_msg","You has been rejected the invitaion.")
        res.redirect(`/val_invitation?email=${email}`)
    }
    


     }else{
         console.log("data is missing from url 2")
     }
}


exports.validatores = (req,res,next )=> {
    success_msg = req.flash('success_msg');   // for success flash msg
    err_msg = req.flash('err_msg'); 
    var page = req.query.page || 1
    var perPage = 10
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    db.query('SELECT * FROM `tbl_user_registrations` WHERE deleted="0" AND type="validatore"',{ type:db.QueryTypes.SELECT}).then( async(validatore_list)=>{
        
        db.query("SELECT *  FROM tbl_documents_masters WHERE status = 'active' AND `deleted` = '0' AND doc_id NOT IN(SELECT doc_id FROM `tbl_validatore_rels` WHERE status='active' AND deleted = '0')",{ type:db.QueryTypes.SELECT}).then( async(doc_list)=>{
        const requestarray1 = paginate(validatore_list, page, perPage); 
             res.render('front/validatore/validatore_list',{
                                           success_msg,
                                           err_msg,     
                                           validatore_list:requestarray1, 
                                           doc_list,
                                           profile_pic,
                                           first_name,
                                           moment,
                                            //country list
                                        });
    })
    
    })
}


exports.submit_doc_to_validatore = async(req,res,next )=> {
  success_msg = req.flash('success_msg');   // for success flash msg
  err_msg = req.flash('err_msg'); 
  var reg_user_id=JSON.parse(req.body.reg_user_id) 
  var doc_id=JSON.parse(req.body.doc_id) 
// console.log("???????????????????????????????????????????????????????????????????????????????")
  for(var i=0;i<reg_user_id.length;i++){
    // console.log("inside")
    for(var j=0;j<doc_id.length;j++){
      // console.log("inside2")
    await  validatoreModel.findOne({where:{reg_user_id:reg_user_id[i],doc_id:doc_id[j],deleted:"0"}}).then(async(vaildata)=>{
        if(vaildata){
          //  console.log("if")
          }else{
          await  validatoreModel.create({reg_user_id:reg_user_id[i],doc_id:doc_id[j]}).catch(err=>console.log("validatore creation err ",err))
          }
      })
      
    }
    if(i==(reg_user_id.length-1)){
res.send("done")
    }
  }
  
}

exports.validatore_doc_view = async(req,res,next )=> {
  success_msg = req.flash('success_msg');   // for success flash msg
  err_msg = req.flash('err_msg'); 
  var profile_pic = req.session.profile_pic;
  var first_name = req.session.first_name;
  var page = req.query.page || 1
  var perPage = 10
  var reg_user_id=req.query.reg_user_id
  db.query("SELECT * ,tbl_validatore_rels.status as validatore_status FROM `tbl_validatore_rels` INNER JOIN tbl_documents_masters ON tbl_validatore_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_validatore_rels.reg_user_id = "+reg_user_id+" AND tbl_validatore_rels.deleted = '0'",{ type:db.QueryTypes.SELECT}).then( async(doc_list)=>{
    const requestarray1 = paginate(doc_list, page, perPage);
         res.render('front/validatore/validatore_doc_view',{
                                       success_msg,
                                       err_msg,     
                                     
                                       doc_list:requestarray1,
                                       profile_pic,
                                       first_name,
                                       moment,
                                        //country list
                                    });
})
}


exports.active_inactive_validatore_doc =async (req,res,next )=> {
  var validatore_id=req.body.validatore_id
  var status=req.body.status

  // console.log(market_place_id)  

  var updateValues= 
  {
      // mp_id:mp_id,
      status:status
  }
  await validatoreModel.update(updateValues, { where: { validatore_id: validatore_id } }).then((result) => 
  {
      // if(){
      //     res.redirect('/allot-reflect-list')
      // }
      // if(){
      //     res.redirect('/allot-reflect-list')
      // }
      // if(){
      //     res.redirect('/allot-reflect-list')
      // }
          //  console.log(result)
          //  res.redirect('/allot-reflect-list')
          res.send("done")
       
  })

} 

exports.assign_request_to_validatore =async (req,res,next )=> {
  
  var request_id      = req.body.request_id
  var doc_id          = req.body.doc_id
  var request_doc_id  = req.body.request_doc_id
  var reflect_id      = req.body.reflect_id
  var verifier_name      = req.body.verifier_name
  var document_name      = req.body.document_name

  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');
  var user_id   = req.session.user_id

console.log('verifier_name : ',verifier_name)
        await db.query('SELECT * FROM `tbl_client_verification_requests` WHERE tbl_client_verification_requests.request_id='+request_id+' AND tbl_client_verification_requests.deleted="0"',{ type:db.QueryTypes.SELECT})
        .then(async(requstdata) => 
            {
                 await db.query('SELECT * FROM `tbl_validatore_rels` WHERE doc_id='+doc_id+' AND status="active" AND deleted="0"',{ type:db.QueryTypes.SELECT})
                 .then(async(validatorerel) => 
                 {
                              if (validatorerel[0] != null ) {

                                    await db.query('SELECT * FROM `tbl_validatore_requests` WHERE validatore_id='+validatorerel[0].validatore_id+' AND doc_id='+doc_id+' AND reflect_id='+ requstdata[0].verifer_my_reflect_id+' AND request_id='+request_id+' AND status="active" AND deleted="0"',{ type:db.QueryTypes.SELECT})
                                    .then(async(validatoreRequsetData) =>{

                                          if (  validatoreRequsetData[0] == null ) {
                   console.log("********** for notification for notification for notification 1**********",validatoreRequsetData)
                                                   await tbl_validatore_requests.create({
                                                                
                                                                                         validatore_id   :   validatorerel[0].validatore_id,
                                                                                         doc_id          :   doc_id,
                                                                                         reflect_id      :   requstdata[0].verifer_my_reflect_id,
                                                                                         request_id      :   request_id
                                                               
                                                                               })
                                                                               .then(data=>{
                                                                                           // for notification 
var msg=`You have recieved a request from ${verifier_name} for verify  ${document_name}`
   console.log("********** for notification for notification for notification********* 45467*")
      console.log(msg)

                                                                                           ValidatorNotificationModel.create({notification_msg:msg,sender_id:user_id,receiver_id:validatorerel[0].reg_user_id,reflect_id:reflect_id,notification_type:"1",notification_date:formatted})
                                                                                           .then(create=>{
                                                                                            console.log("********************",create)
                                                                                           })
                                                                                           RequestDocumentsModel.update({validatore_status:"assigned"},{where:{request_doc_id:request_doc_id}})
                                                                                           .then(dataupdate=>{

                                                                                                             res.send("done")
                                                                                           })
                                                                                           .catch(err=>{ 
                                                                                                            console.log("error",err)
                                                                                            })
                                                                                           
                                                                                })
                                                                               .catch(err=>{ 
                                                                                             console.log("error",err)
                                                                                             res.send("notdone")
                                                                                      })

                                               }else{
                                                       res.send("alreadyAssigned")
                                               }

                                       })

                                }else{
                                  res.send("validatoreIsNotTheir")
                                }                                       
                   })
             })

} 
exports.validator_request = (req,res,next )=> {

    success_msg   = req.flash('success_msg');   // for success flash msg
    err_msg       = req.flash('err_msg');          // for error flash msg
    var page      = req.query.page || 1
    var perPage   = 10
    var user_id   = req.session.user_id
           //**fatch the validatore list  */
           db.query('SELECT * FROM `tbl_validatore_requests` INNER JOIN tbl_client_verification_requests ON tbl_validatore_requests.request_id=tbl_client_verification_requests.request_id  INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id  INNER JOIN tbl_documents_masters ON tbl_validatore_requests.doc_id=tbl_documents_masters.doc_id WHERE tbl_validatore_requests.deleted="0" ORDER BY `validatore_req_id` DESC',{type:db.QueryTypes.SELECT}).then(async(validatoreRequestData)=>{

                     await db.query('SELECT * FROM `tbl_validatore_rels` INNER JOIN tbl_documents_masters ON tbl_validatore_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_validatore_rels.reg_user_id='+user_id+' AND tbl_validatore_rels.status="active" AND tbl_validatore_rels.deleted="0"',{ type:db.QueryTypes.SELECT})
                     .then(async(ValidatoreDocs) =>{
                             
                              const pagedData = paginate(validatoreRequestData, page, perPage);

                               res.render('front/validatore/validator-request',{
                                                                                 success_msg,
                                                                                 err_msg, 
                                                                                 validatoreRequestData:pagedData,  
                                                                                 moment,  
                                                                                 ValidatoreDocs,
                                                                               });


                       })  


              })

}
exports.show_validator_doc_filter_request = (req,res,next )=> {

    success_msg = req.flash('success_msg');   // for success flash msg
    err_msg = req.flash('err_msg');          // for error flash msg
    var page = req.query.page || 1
    var perPage = 10
    var user_id=req.session.user_id



    var check_doc_list=[]
 check_doc_list=JSON.parse(req.body.check_doc_list);
    // var all_document_data_list=[
    var result_code_array=[]
   
    


       

        var check_doc_id=check_doc_list.join("','");
           //**fatch the validatore list  */
           db.query("SELECT * FROM `tbl_validatore_requests` INNER JOIN tbl_client_verification_requests ON tbl_validatore_requests.request_id=tbl_client_verification_requests.request_id  INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id  INNER JOIN tbl_documents_masters ON tbl_validatore_requests.doc_id=tbl_documents_masters.doc_id WHERE tbl_validatore_requests.deleted='0' AND tbl_validatore_requests.doc_id IN ('"+check_doc_id+"')",{type:db.QueryTypes.SELECT}).then(async(validatoreRequestData)=>{

                     // await db.query('SELECT * FROM `tbl_validatore_rels` INNER JOIN tbl_documents_masters ON tbl_validatore_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_validatore_rels.reg_user_id='+user_id+' AND tbl_validatore_rels.status="active" AND tbl_validatore_rels.deleted="0"',{ type:db.QueryTypes.SELECT})
                     // .then(async(ValidatoreDocs) =>{
                             // console.log(validatoreRequestData);

                              // const pagedData = paginate(validatoreRequestData, page, perPage);

                               res.render('front/validatore/ajax_validatore_request_filter',{
                                                                                 success_msg,
                                                                                 err_msg, 
                                                                                 validatoreRequestData,
                                                                                 moment,  
                                                                                
                                                                               });


                       // })  


              })

}


exports.validator_request_info =  async(req,res,next )=> {
  console.log(".................................................validator_request_info..........................................")

        var validatore_req_id  = req.query.val_id
        var user_id   = req.session.user_id
        var request_id  = req.query.request_id

              await  db.query('SELECT * FROM `tbl_validatore_requests` INNER JOIN tbl_documents_masters ON tbl_validatore_requests.doc_id=tbl_documents_masters.doc_id  INNER JOIN tbl_request_documents ON tbl_request_documents.request_id=tbl_validatore_requests.request_id INNER JOIN tbl_myreflectid_doc_rels ON ((tbl_myreflectid_doc_rels.user_doc_id=tbl_request_documents.user_doc_id) AND (tbl_myreflectid_doc_rels.doc_id=tbl_validatore_requests.doc_id)) INNER JOIN tbl_client_verification_requests ON tbl_client_verification_requests.request_id=tbl_validatore_requests.request_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id = tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id = tbl_wallet_reflectid_rels.reg_user_id LEFT JOIN tbl_request_documents_files ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id WHERE tbl_validatore_requests.request_id="'+request_id+'" AND tbl_validatore_requests.status="active" AND tbl_validatore_requests.deleted="0" AND tbl_validatore_requests.validatore_req_id='+validatore_req_id,{type:db.QueryTypes.SELECT})
              .then(async(requestData)=>{
                                      
                console.log("requestData : ",requestData)

                      // var temp                    = requestData[0].hase_values
                      // var hase_values            = temp.split(",")

                      // console.log("requestData : ",hase_values_type)
                      
                      // for(let i=0;i<=hase_values_type.length;i++){

                      // hase_values             = hase_values_type.split("-")

                      // }
                      // var hase_values             = hase_values.split("-")

                      // requestData[0].hase_values  = hase_values
                      var ipfsData                =[];
                      var i=0;
                        

                            async.each(requestData,async function (content, cb) {
                                      
                              // var temp                    = requestData[0].hase_values
                                        
                           if(content.doc_type == 'image'){
                                                   
                                                    await request(`https://ipfs.io/ipfs/${content.request_file_hash}`,async function (error, response, body) {

                                               if (  !error && response.statusCode == 200  ) {
                                                      
                                                          ipfsData.push({type:content.doc_type ,doc:body})
                                                        

                                                       
                                    // console.log(" image_count requestData.length - 1 image: ",requestData.length - 1)

                                                        console.log(" i iiimage_count : ",i)
                                                        if ( i == (requestData.length - 1) ) {
                                               
                                                      
                                                                 requestData[i].request_file_hash_image =  ipfsData
                                                                   await final_call();
                                                              
                                                                
      
                                                         }

                                                         i++;

                                                }else {
                                                           res.send(error)
                                                }
                                   
                              
                                            })
                                           

                                      
                                   }else if(content.doc_type == 'pdf'){
                                     
                                    ipfsData.push({type:content.doc_type ,doc:content.request_file_hash})

                                            if ( i == (requestData.length - 1) ) {
                                               
                console.log(" image_count requestData.length pdf - 1: ",requestData.length - 1)

                                                        console.log(" i iiimage_count : ",i)

                                                                 requestData[i].request_file_hash_image =  ipfsData
                                                                   await final_call();
                                                              
                                                                
      
                                                         }
                                                         i++;
                                   }else{
                                    ipfsData.push({type:content.doc_type ,doc:content.request_file_hash})


                                          if ( i == (requestData.length - 1) ) {
                                               
                                                        
                                          console.log(" image_count requestData.length -  video: ",requestData.length - 1)

                                                        console.log(" i iiimage_count : ",i)

                                                                 requestData[i].request_file_hash_image =  ipfsData
                                                                   await final_call();
                                                              
                                                                
      
                                                         }
                                                         i++;
                                    
                                   }

                                   
                              },function (err) { 
                           
                                   if (err) { console.log("err",err); }
                           
                            });
                          
                      // }

                    async function final_call(){

                                                        console.log(" final reasponse: ")

                       res.render('front/validatore/request_view',{user_id,
                                                                     success_msg,err_msg,requestData,validatore_req_id,moment 
                                                                    });
                    }
               })
}
/** self-attested Post Method Start  **/
exports.accept_reject_request = async (req,res,next) =>{
   var validatore_req_id = req.body.validatore_id;
   var validator_type = req.body.validator_type;
   var validatore_name = req.body.validatore_name;
   var status = req.body.validator_type;
   var request_id = req.body.request_id;
   var blob_url = req.body.blob_url;

   var validatore_status = req.body.validatore_status;

 var imgUri;
 var srcImage;
  var buffer;

    var hashes =[];
         await  db.query('SELECT *,GROUP_CONCAT(tbl_request_documents_files.doc_type,"-",tbl_request_documents_files.request_file_hash) as hase_values FROM tbl_validatore_requests INNER JOIN tbl_documents_masters ON tbl_validatore_requests.doc_id=tbl_documents_masters.doc_id  INNER JOIN tbl_request_documents ON tbl_request_documents.request_id=tbl_validatore_requests.request_id INNER JOIN tbl_myreflectid_doc_rels ON ((tbl_myreflectid_doc_rels.user_doc_id=tbl_request_documents.user_doc_id) AND (tbl_myreflectid_doc_rels.doc_id=tbl_validatore_requests.doc_id)) INNER JOIN tbl_client_verification_requests ON tbl_client_verification_requests.request_id=tbl_validatore_requests.request_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id = tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id = tbl_wallet_reflectid_rels.reg_user_id LEFT JOIN tbl_request_documents_files ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id WHERE tbl_validatore_requests.request_id='+request_id+' AND tbl_validatore_requests.status="active" AND tbl_validatore_requests.deleted="0" AND tbl_validatore_requests.validatore_req_id='+validatore_req_id,{type:db.QueryTypes.SELECT})
              .then(async(requestData)=>{
                                         
                        // console.log("hashes hase_values: ",requestData[0].hase_values)
   
                      var temp                    = requestData[0].hase_values
                      var hase_values             = temp.split(",")
                      requestData[0].hase_values  = hase_values
                      var ipfsData                =[];
                      var i=1;
                      var request_id              =requestData[0].request_id
                      var doc_id                  =requestData[0].doc_id
                      var request_doc_id          =requestData[0].request_doc_id
                      var verifer_my_reflect_id    =requestData[0].verifer_my_reflect_id
                      
                      var verifier_name_data, verifier_reflet_code

                      await  db.query("SELECT * FROM `tbl_wallet_reflectid_rels` INNER JOIN tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE `reflect_id` = "+verifer_my_reflect_id,{type:db.QueryTypes.SELECT})
                      .then(async(verifier_reg_data)=>{
                        
                        if(verifier_reg_data[0].entity_company_name)
                        {
                                    verifier_name_data = verifier_reg_data[0].entity_company_name;
                        }
                        else  if(verifier_reg_data[0].rep_firstname)
                        {
                                    verifier_name_data = verifier_reg_data[0].rep_firstname;
            
                        }
                        else
                        {
                                    verifier_name_data = decrypt(verifier_reg_data[0].full_name);
            
                        }

                        verifier_reflet_code = verifier_reg_data[0].reflect_code;

                      })

      async.each(requestData[0].hase_values,async function (content, cb) {
      // for(var i=0;i<requestData[0].hase_values.length;i++){
                      let tempForType = content.split("-")
                        
                      if (tempForType[0] == "image") {

                        new Promise (async (resolve,reject)=>{


                          await request(`https://ipfs.io/ipfs/${tempForType[1]}`, async function (error, response, body) {

                            if (  !error && response.statusCode == 200  ) {

                              srcImage = dataUriToBuffer(body);
                
                                      //  srcImage = new Buffer(body.split(",")[1], 'base64');
  
                               resolve(srcImage)
                                 
                            } else {
                              reject()
                            }
                            
                          })

                        }).then(async srcImage=>{

                          await get_digi_hash(validatore_status,blob_url,verifier_name_data,verifier_reflet_code,srcImage,validatore_name,validatore_req_id,request_id,doc_id,status,request_doc_id ,"image" ,i)
                          .then(responsValue => {
                            if ( responsValue == (requestData[0].hase_values.length-1)) {
                              res.send("done");
                            }
                            i++;
                          });

                        }).catch(err => console.log("err",err))


                    //  if ( i == ( requestData[0].hase_values.length - 1 ) ) {
//            setTimeout(async function(){
           
// await db.query('SELECT *from tbl_validatore_requests_doc_files where validatore_req_id='+validatore_req_id,{type:db.QueryTypes.SELECT})
// .then(async(requestData)=>{

                                 
//                               console.log('requestData : ',requestData);

//                                  res.send(requestData);
//                                })
// },
//                            6000);
                    //  }
                    //  i++
                    //        }
                    //         else {
                    //          res.send(error)
                    //      }
              

         

                      } else if (tempForType[0] == "video") {

                          await get_digi_hash(validatore_status,blob_url,verifier_name_data,verifier_reflet_code,tempForType[1],validatore_name,validatore_req_id,request_id,doc_id,status,request_doc_id ,"video",i)
                          .then(responsValue => {
                            if ( responsValue == (requestData[0].hase_values.length-1)) {
                              res.send("done");
                            }
                            i++;
                          });

                      } else {

                        await get_digi_hash(validatore_status,blob_url,verifier_name_data,verifier_reflet_code,tempForType[1],validatore_name,validatore_req_id,request_id,doc_id,status,request_doc_id ,"pdf",i)
                        .then(responsValue => {
                          if ( responsValue == (requestData[0].hase_values.length-1)) {
                            res.send("done");
                          }
                          i++;
                        });

                      }
                  // console.log("-------request_doc_id---------" ,request_doc_id);
                  // console.log("-------hashes---------" ,requestData[0].hase_values[i]);

        // hashes.push(requestData[0].hase_values[i]);
                  // console.log("-------hashes---------" ,hashes);
                       
                  // await get_digi_hash(content,validatore_name,validatore_req_id,request_id,doc_id);
                 
                  // if ( i == ( requestData[0].hase_values.length - 1 ) ) {
                     
                  //             res.redirect("/success_status")
                  // }
                  // i++
             
            // var data_img=await get_digi_hash(srcImage,validatore_name);

                  // console.log("-------hashes ert---------" ,data_img);

      //  }

      // console.log("-------hashes sdrft buffer---------" ,buffer);

    }, function (err) { 
                           
      if (err) { console.log("err",err); }

});
 
        
        // })
   })

   


  
}
/** self-attested Post Method End  **/
const get_digi_hash = async (validatore_status,blob_url,verifier_name_data,verifier_reflet_code,fun_hash,validatore_name,validatore_req_id,request_id,doc_id,status,request_doc_id ,doc_type ,count) => {

  const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration))

  console.log("detail----------- ",validatore_name,validatore_req_id,request_id,doc_id,status,request_doc_id,doc_type);
  var today="validatore "+validatore_name;
   console.log("hello-----------1 ");
       let i = count;
   return await new Promise( async (resolve, reject) => {

          if (doc_type == "image") {
            

            var segImeg = blob_url.split(',')[1];
           
            const buff = Buffer.from(segImeg,'base64');
            buff.toString();

            await Jimp.read(buff).then(async newimage => {
              
              let message_date = moment(new Date()).format("ddd,MM-D-YYYY")
              let message_time = moment(new Date()).format("h:mm:ssa")
              
                await Jimp.read(fun_hash).then(async image => {
                await newimage.resize(image.bitmap.width/4,image.bitmap.width/4);
                console.log(newimage.bitmap)

                let approve_image;

                if(validatore_status=='accept'){
                  approve_image =  await Jimp.read(__dirname+'/../../public/assets/images/approve.jpg')
                }else{
                  approve_image =  await Jimp.read(__dirname+'/../../public/assets/images/rejected.jpg')
                }
                

                await approve_image.resize(image.bitmap.width/4,image.bitmap.width/4);
                    await Jimp.create(image.bitmap.width ,((image.bitmap.height)+((image.bitmap.width/4)+30)),'#ffffff').then(async nova_new =>{
      
                                     console.log("hello-----------3 3  ");
      
      
                    await  Jimp.loadFont(Jimp.FONT_SANS_12_BLACK)
                        .then(async font => {
      
                          nova_new.print(
                            font,
                            (image.bitmap.width)-(image.bitmap.width/4),
                            image.bitmap.height+10,
                            verifier_name_data+'-'+verifier_reflet_code,
                            5,
                            (err, nova_new, { x, y }) => {
                              nova_new.print(font, x, y , message_date, 5,
                                            (err, nova_new, { x, y }) => {
                                                        nova_new.print(font, x, y , message_time, 5,);
                                          });
                            }
                          );
      
                            //  text_name_code.print(font, x,y,   verifier_name)
                                 
       
                            //  text_date.print(font, x, y + 20,message_date  , 50);
                    
      
                                                       console.log("hello-----------3 4  ");
                                                    nova_new.composite(image,0,0)
                                                    // nova_new.composite(newimage,(image.bitmap.width)-(image.bitmap.width/4),image.bitmap.height);
                                                    nova_new.composite(approve_image,0,image.bitmap.height);
                                                    // nova_new.composite(image,0,text_height)
                                                    // nova_new.composite(newimage,0,0);
                                                    let text_img = nova_new.getBase64Async(Jimp.MIME_PNG);
                
                                                    console.log("hello-----------3 ");
                                        
                                                    text_img.then(result => {
                                                        // let testFile = fs.readFileSync(result);
                                                        
                                                        let testBuffer = new Buffer(result);
                                
                                                        ipfs.files.add(testBuffer,async function (err, file) {
                                                            if (err) {
                                                          //  console.log("err from ejs",err);
                                                            }
                                                            //console.log("from ipfs ",file);
                                                            else{
                                
                                                          await  finalsave(file[0].hash,doc_type)
                                                          }
                                                        
                                                    
                                                        })
                                                    });

                          })
                        })
                      
                      })
                    })

            // await Jimp.create(500,500,'#ffffff').then(async nova_new =>{

            //   await Jimp.read(fun_hash).then(async newimage => {        
            //         await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(async font => {
            //         await  newimage.print(font,newimage.bitmap.width/2.5,newimage.bitmap.height/2.5,today);
        
                                
            //         });
                
            //         // nova_new.composite(image,0,0);
            //         nova_new.composite(newimage,-100,350);
            //         newimage.resize(500,500);
                
            //         // await newimage.resize(newimage.bitmap.width/4,newimage.bitmap.width/4);
        
            //             let text_img = nova_new.getBase64Async(Jimp.MIME_PNG);
                
            //                 console.log("hello-----------3 ");
                
            //                 text_img.then(result => {
            //                     // let testFile = fs.readFileSync(result);
                                
            //                     let testBuffer = new Buffer(result);
        
            //                     ipfs.files.add(testBuffer,async function (err, file) {
            //                         if (err) {
            //                       //  console.log("err from ejs",err);
            //                         }
            //                         //console.log("from ipfs ",file);
            //                         else{
        
            //                       await  finalsave(file[0].hash,doc_type)
            //                       }
                                
                            
            //                     })
            //                 });
                    
            //         })
            //         .catch(err => {
            //             console.log('error',err);
                    
            //         });
                
            //     });

          } else if (doc_type == "video") {

            await  finalsave(fun_hash,"video")

          } else{
        

            const run = async (OldHash ) => {

          let promins = new Promise(async (resolve ,reject)=>{
                 console.log("hello 0")

                 const url = `https://ipfs.io/ipfs/${OldHash}`

                 const pdf1 = await fetch(url).then(res => res.arrayBuffer())
                 console.log("pdf1 : ",pdf1)
                 resolve(pdf1)    

              
          })

        await  promins.then(async pdf1 =>{




             const pdfDoc = await PDFDocument.load(pdf1);
              

             // const approve_img_icon = await pdfDoc.embedPng(fs.readFileSync(__dirname+'/../../public/assets/images/approve.jpg'));
             var approve_img_icon;

             if(validatore_status=='accept'){
              approve_img_icon = await pdfDoc.embedPng(fs.readFileSync(__dirname+'/../../public/assets/images/approve.png')); 
             }else{
              approve_img_icon = await pdfDoc.embedPng(fs.readFileSync(__dirname+'/../../public/assets/images/rejected.png')); 

            }
            
             console.log("hello 2")


             console.log("hello 3")
             

            const pages = pdfDoc.getPages();
            const imagePage = pages[0];

             console.log("hello 4")

           let message_date = moment(new Date()).format("ddd,MM-D-YYYY")
           let message_time = moment(new Date()).format("h:mm:ssa")

           var segImeg = blob_url.split(',')[1];
           
               const buff = Buffer.from(segImeg,'base64');
               buff.toString();
           
           const sign_img =  await pdfDoc.embedPng(buff);
            
            let date_time = message_date+" "+message_time
            let ver_text = verifier_name_data+'-'+verifier_reflet_code

             imagePage.drawText(date_time, { x:450, y: 95, size: 8 })
             imagePage.drawText(ver_text, { x:450, y: 105, size: 10 })

             // console.log("hello 5 ",imagePage.getWidth()," height : ",imagePage.getHeight())

             
             // console.log("hello 5 ",imagePage.getWidth()/9," height : ",imagePage.getHeight()/9)

             
             imagePage.drawImage(sign_img, {
                 x: 450,
                 y: 110,
                 width: imagePage.getWidth()/5,
                 height: imagePage.getHeight()/5
                 });
             imagePage.drawImage(approve_img_icon, {
                 x: 450,
                 y: 700,
                 width: imagePage.getWidth()/8,
                 height: imagePage.getHeight()/8
                 });
             console.log("hello 6")

             const pdfBytes = await pdfDoc.save();
             console.log("hello 7")

             
             let testBuffer = new Buffer(pdfBytes);
             
             console.log(" pathToImage ",testBuffer)
             console.log("hello 8")

             await  ipfs.files.add(testBuffer, async function (err, file) {
                 if (err) {
               //  console.log("err from ejs",err);
                 }
                 await delay(10000)
                 await  finalsave(file[0].hash,"pdf")

             })
          })
         
          }
                                                             
            await  run(fun_hash);
                               
       }


                async function finalsave(hash,type){

                  await  tbl_validatore_requests_doc_files.create({
                    validatore_req_id:validatore_req_id,
                    doc_id:doc_id,
                    request_id:request_id,
                    file_hase:hash,
                    doc_type:type,
                    status :status
                  }).then(async (dataForReturn)=>{

                  await RequestDocumentsModel.update({validatore_status:status},{where:{request_doc_id:request_doc_id}})
                    .then(dataupdate=>{

                      console.log("hello-----------8 ");
                      resolve(i);
                    })
                    .catch(err=>{ 
                                    console.log("error",err)
                                    reject()
                    })
                      
                  })

                }

    })

          
}


exports.success_status = (req,res,next )=> {
  success_msg = req.flash('success_msg');   // for success flash msg
  err_msg = req.flash('err_msg');          // for error flash msg

           res.render('front/validatore/success_requst_page',{
                                         success_msg,
                                         err_msg,     
                                      
                                      });

}

/** my-wallets Get MEthod Start **/
exports.validator_wallet_list=async(req,res,next) =>{

    var user_id=req.session.user_id;
    // var qr_url='data';
    if(user_id)
    {

        // var user_type=req.session.user_type;
        // console.log("user type"+user_type);
        
       await db.query("select * from  tbl_user_wallets  WHERE reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(walletdetails){
          for(var i=0; i<walletdetails.length; i++){

           
            var testbell ;
               await  web3.eth.getBalance(walletdetails[i].wallet_address).then((res_bal)=>{ 
                     console.log("js balcnce test" ,res_bal)
                    //  testbell=res_bal
                    // web3.fromWei(res_bal,"ether")
                    const etherValue = web3.utils.fromWei(res_bal, 'ether')
                    walletdetails[i].wal_balan =  etherValue    
                  });
                
          // var walletdetails=['1','2','3']
          // console.log("js balcnce test" ,walletdetails)
             }
            res.render('front/validatore/validatore_wallet/validator_wallet_list',{ 
              web3,walletdetails,
              session:req.session,
              // qr_func,
              base64encode
               })
          
        });

    }
    else
    {
        redirect('/login');
    }
}
/** my-wallets Get MEthod End **/

/**create-wallet Get MEthod Start **/
exports.create_wallet = (req,res,next) =>{
    res.render('front/validatore/validatore_wallet/validatore-create-wallet',{session:req.session});
}
/** get-create-wallet Get MEthod End **/

/** get-create-wallet Get MEthod Start **/
exports.get_create_wallet = (req,res,next) =>{
    res.render('front/validatore/validatore_wallet/validatore-protact-your-wallet',{session:req.session});
}
/** get-create-wallet Get MEthod End **/

/**backup-private-key Get MEthod Start **/
exports.backup_private_key = (req,res,next) =>{
  console.log('------------------------------------------- - - -backup_private_key - - ----------------------------------------------------');
  var user_id = req.session.user_id;
  //  var account        = web3.eth.accounts.create();                                //creation  of account 
  //  var private_key    = account.privateKey                                        // private  key of account
  //  let buff           = new Buffer(private_key);
  //  let query          = buff.toString('base64');                                 //encoding private key by base64 buffer 
  let privateKey;
  let pk;
  let passphrase = 'hkjggh';
  let account1;
  var sender_private_key
  let user_passphrase = crypto.createHash('sha256').update(passphrase).digest('base64');

  var options = {
    url: "http://13.232.156.125:8503",
    method: 'POST',
    headers:
    {
      "content-type": "application/json"
    },
    body: JSON.stringify({ "jsonrpc": "2.0", "method": "personal_newAccount", "params": [passphrase], "id": 1 })
  };


  let promise = new Promise( async (resolve ,reject) => { 

    await request(options, async function (error, response, body) {
      // console.log('response  : ', response);
      if ( error ) reject();
        console.log('  first request@@@@@@@@@ ',body);
        var JSONbody = JSON.parse(body);
       // console.log('Account - - - - - -',JSONbody);
        account1 = JSONbody.result;
        console.log('Account - - - - - -', account1);
        resolve(account1)
    })

  })

let account ;
  promise.then((data)=>{
    account=data
    setTimeout(async () => { await waitForReadFile(account,passphrase) }, 60000)
  })
  .catch(err=>{

  })
 


  async function waitForReadFile(user_account,user_pass) {

    // let account1 = '0xc7f673d74208cb1af5864d0b85893ecb1aa8771d';

    console.log('-------------waitForReadFile--------');

    var options = {
      url: "http://13.232.156.125:8503",
      method: 'POST',
      headers:
      {
        "content-type": "application/json"
      },
      body: JSON.stringify({ "jsonrpc": "2.0", "method": "personal_listWallets", "params": [], "id": 1 })
    };

    await request(options, async function (error, response, body) {
      // console.log(body.result);
      // console.log(JSON.parse(body).result);
      console.log('-------------second request--------');
      let lastSegment;

      var c = JSON.parse(body).result;
      // console.log(c);
      c.forEach(function (element) {
        // console.log(element.accounts);
        var accounts_details = element.accounts;
        accounts_details.forEach(function (element1) {
          // console.log(element1.address);
          let address = user_account.toLowerCase();
          if (element1.address === address) {
            // console.log(element1.url)
            var parts = element1.url.split('/');
            lastSegment = parts.pop() || parts.pop();
            // console.log("lastSegment",lastSegment);
          }
        })
      })

     
      async function delayOfmint(){
        var options2 = {
          url: `http://13.232.156.125/devnetwork/node1/keystore/${lastSegment}`,
          method: 'GET',
          headers:
          {
            "content-type": "application/json"
          }
        };
  
        await request(options2, async function (error, response, body) {
          // console.log('-----------------------', options2.url)
          console.log(body);
          // // })
          console.log('-------------3rd request--------');
  
          // await request.get(` http://34.194.223.110/devnetwork/node1/keystore/${lastSegment}`,function (error, response, body) {
  
          var csv = JSON.parse(body);
          // console.log(csv);
          var c = web3.eth.accounts.decrypt(csv,user_pass);
          console.log(c.privateKey);
          pk = c.privateKey;
          //  sender_private_key = pk;
          // privateKey  = Buffer.from(sender_private_key, 'hex');
        })
  

      }
      await  setTimeout( async () => {await delayOfmint()}, 5000);
    })

  await  setTimeout( async () => {await waitForFinalRes()}, 60000);

   async function waitForFinalRes(){
    console.log('-------------waitForFinalRes  --------');

      console.log('---------------------Account', account);
      console.log('------------private key-----------', pk)
      let buff = new Buffer(pk);
      let query = buff.toString('base64');
  
  
  
  
      await UserModel.findOne({ where: { reg_user_id: user_id } })                        // finding the user in db
        .then(async user_data => {
  
          var full_name = user_data.full_name;
          res.render('front/validatore/validatore_wallet/validatore-backup-your-private-key',{          // rendring the date on browser
            private_key: pk,
            query,
            session: req.session,
            full_name
          });
        });
    }
   
  }
    //  var account = web3.eth.accounts.create();
    // //  var wallet_address = account.address
    //  var private_key = account.privateKey
    //  let buff = new Buffer(private_key);
    //  let query = buff.toString('base64');
    // res.render('front/validatore/validatore_wallet/validatore-backup-your-private-key',{
    //     private_key,query,
    //     session:req.session
    // });
}
/** backup-private-key Get MEthod End **/

/**backup-eth-address Get MEthod Start **/
exports.backup_eth_address = (req,res,next) =>{

  var query = req.query.key.trim();
  let buff1 = new Buffer(query, 'base64');
  let private_key = buff1.toString('ascii');
  let account = web3.eth.accounts.privateKeyToAccount(private_key)                 /*geting account adress by private key */
  const wallet_address = account.address;
  let buff2 = new Buffer(wallet_address);
  let address = buff2.toString('base64');                                          /*converting buffer into buffer base64*/

  res.render('front/validatore/validatore_wallet/validatore-backup-etherium-address',{                              /**rendering the data */
    wallet_address, address,
    session: req.session
  })
  
//     var query = req.query.key.trim();
//     // var private_key = decodeURI(query);
//     let buff1 = new Buffer(query, 'base64');
// let private_key = buff1.toString('ascii');
//     let account = web3.eth.accounts.privateKeyToAccount(private_key)
//     const wallet_address = account.address;
//      let buff2 = new Buffer(wallet_address);
//      let address = buff2.toString('base64');
 
//         res.render('front/validatore/validatore_wallet/validatore-backup-etherium-address',{
//             wallet_address,address,
//             session:req.session
//         })


}
/**backup-eth-address Get MEthod End **/

/**submit-create-wallet Post MEthod Start **/
exports.submit_create_wallet = (req,res,next) =>{
    var user_id = req.session.user_id;
        var wallet_name = req.body.wallet_name;
    const wallet_address = req.body.wallet_address

    console.log(wallet_name)
        console.log(wallet_address)

// let wallet_address = buff1.toString('ascii');
    web3.eth.getBalance(wallet_address, (err,wei) => {
        var balance = web3.utils.fromWei(wei, 'ether')
        console.log("balance",balance);
        WalletModel.create({wallet_address:wallet_address,reg_user_id:user_id,validator_wallet_name:wallet_name,balance:balance}).then(result=>{
            console.log("wallet",result);
            res.render('front/validatore/validatore_wallet/validatore-successfully-wallet-create',{ session:req.session,wallet_id:result.wallet_id })
        })
        .catch(err =>{console.log(err)})
    })
}

/**import-wallet Get MEthod Start **/
exports.import_wallet = (req,res,next) =>{
    res.render('front/validatore/validatore_wallet/import-wallet-validatore',{session:req.session});
}
/** import-wallet Get MEthod End **/

/**import-wallet-address Post MEthod Start **/
exports.import_wallet_address = (req,res,next) =>{
    var private_key = req.body.private_key.trim();
    let account = web3.eth.accounts.privateKeyToAccount(private_key)
    const wallet_address = account.address;
    var query = wallet_address;
    // let buff = new Buffer(wallet_address);
    // let query = buff.toString('base64');
    res.render('front/validatore/validatore_wallet/validatore-import-wallet-address',{session:req.session,wallet_address,query});
}
/**import-wallet-address Post MEthod End **/

/**submit-import-wallet Post MEthod Start **/
exports.submit_import_wallet = (req,res,next)=>{
    var user_id = req.session.user_id;
    var wallet_address = req.query.wallet_address.trim();
    // let buff1 = new Buffer(query, 'base64');
    // let wallet_address = buff1.toString('ascii');

    WalletModel.findOne({ where:{wallet_address:wallet_address}}).then(function(walletdetails){
        if(walletdetails){
            var wallet_user_id = walletdetails.reg_user_id
            var wallet_id = walletdetails.wallet_id;
            if(wallet_user_id == user_id){
                req.flash('success_msg',"Wallet already exist.");
                res.redirect('/validator-wallet-list');
            }
            // else{
            //     WalletModelImport.create({wallet_id:wallet_id,reg_user_id:user_id}).then(result=>{
            //         // console.log("wallet",result);
            //         res.redirect(`/create-my-refletid-code?address=${wallet_id}`);
            //     })
            //     .catch(err =>{console.log(err)})
            // }
        }
        // else{
        //     console.log("else----------------");
        //     web3.eth.getBalance(wallet_address, (err,wei) => {
        //         console.log("----------",err);
        //         var balance = web3.utils.fromWei(wei, 'ether')
        //         console.log("balance",balance);
        //         WalletModel.create({wallet_address:wallet_address,reg_user_id:user_id,balance:balance}).then(result=>{
        //             // console.log("wallet",result);
        //             res.redirect(`/create-my-refletid-code?address=${result.wallet_id}`);
        //         })
        //         .catch(err =>{console.log(err)})
        //     })
        // }
        // res.render('front/wallet/my-wallets',{ walletdetails,session:req.session })
  });
    
}
/**submit-import-wallet Post MEthod End **/

/**accept-request Post method Start**/
exports.accept_request_validator = async (req,res,next) =>{
  var request_id = req.body.request_id;
  var private_key2 = req.body.private_key.trim();
  var private_key1;
  var msg;
   var document_name;
   var user_id = req.session.user_id;
   let client_id;
   var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');
  let V_R_code;
  var ver_name,validator_name,client_user_id;
  var ver_reg_id;
     var validatore_req_id = req.body.validatore_id;
     var verifer_my_reflect_id = req.body.verifer_my_reflect_id;


     var version = 1;

     const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration))

  // var request_file_id = req.body.request_file_id;
   var ver_reflect_id = req.body.ver_reflect_id;
   var client_reflect_id = req.body.client_reflect_id;
   console.log("ver_reflect_id------ ",ver_reflect_id);
      console.log("client_reflect_id------ ",client_reflect_id);

  var request_status = req.body.request_status;
  var reason = req.body.reason;

    var string_array_of_doc_hash
        var array_of_doc_hash   =  []


   var request_doc_id = req.body.request_doc_id;
      var doc_name =req.body.document_name;
      document_name =req.body.document_name;
      var request_file_id = req.body.request_file_id;
      var validatore_status = req.body.validatore_status;
    console.log('request_doc_id : ',request_doc_id)
  
 
    await delay(20000);
    
      await db.query("SELECT *from tbl_validatore_requests_doc_files where validatore_req_id="+validatore_req_id,{type:db.QueryTypes.SELECT}).then(async(requestData)=>{

    let count=0;
  /*outer loop Start*/

      
                    //  var temp                    = requestData[0].hase_values
                      //var hase_values             = temp.split(",")
                      //requestData[0].hase_values  = hase_values

        console.log("*****request_doc_data****** ",requestData);
        console.log("*****request_doc_data****** ",requestData.length);
           
            var doc;
        var array_of_doc_hash   =  []
        
    for(var k=0;k<requestData.length;k++){
     
      array_of_doc_hash.push(requestData[k].doc_type+'-'+requestData[k].file_hase	)

      console.log(" k ",k," request data length : ",requestData.length-1)

                                   if(k === (requestData.length-1)){
                                   console.log("inside render if")

                                    doc = array_of_doc_hash.toString()



                                    console.log("*****request_doc_dat file_hase****** ",doc);
 
  
      await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.deleted='0' AND tbl_wallet_reflectid_rels.reflect_id="+client_reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(client_data){

      // console.log("client_data----------********------ ",client_data);
           await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.deleted='0' AND tbl_wallet_reflectid_rels.reflect_id="+verifer_my_reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_reg_data){
                     

            if(verifier_reg_data[0].entity_company_name)
            {
                        ver_name = verifier_reg_data[0].entity_company_name;
            }
            else  if(verifier_reg_data[0].rep_firstname)
            {
                        ver_name = verifier_reg_data[0].rep_firstname;

            }
            else
            {
                        ver_name = decrypt(verifier_reg_data[0].full_name);

            }

            ver_reg_id  = verifier_reg_data[0].reg_user_id;

           client_id = client_data[0].reg_user_id;
          var client_email = client_data[0].email;
          var client_myReflect_code = client_data[0].reflect_code;
          await db.query("SELECT * FROM  tbl_user_registrations  WHERE reg_user_id="+ver_reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_data){

                 console.log("private_key1 : ",private_key1)
                 console.log("verifier_data : ",verifier_data)

            console.log("wallet_address : ",wallet_address)

            // console.log("verifier_data----------********------ ",verifier_data);
            var verifier_email = verifier_reg_data[0].email;
            var f_validator_name = decrypt(verifier_data[0].full_name);
            var l_validator_name = decrypt(verifier_data[0].last_name);
            validator_name = f_validator_name+'-'+l_validator_name

            var verifier_myReflect_code = verifier_reg_data[0].reflect_code
            var wallet_id = verifier_data[0].wallet_id;
            // V_R_code = verifier_data[0].reflect_code;

          
          let account;
          var m = private_key2.indexOf("0x");
          if (m==0) {
            private_key1=private_key2
             account = web3.eth.accounts.privateKeyToAccount(private_key1);
            if(!account){
              res.send({fail:"true",success:"false"});
             }
            }else{
               private_key1 ='0x'+private_key2;
               console.log("*************private_key1 ",private_key1);
              account = web3.eth.accounts.privateKeyToAccount(private_key1);            
              if(!account){
                res.send({fail:"true",success:"false"});
              }
            }
             var wallet_address = web3.eth.accounts.privateKeyToAccount(private_key1);   

        // console.log("wallet_data----------********------ ",wallet_address[0].address);
             
             var wallet_address_data=wallet_address.address;
             var wallet_address_new;

        //console.log("wallet_data----------address********------ ",wallet_address_data);

            await db.query("SELECT * FROM tbl_user_wallets WHERE deleted='0' AND wallet_address='"+wallet_address_data+"'",{ type:db.QueryTypes.SELECT}).then(async function(wallet_data){
                           wallet_address_new = wallet_data[0].wallet_address;

          // console.log("wallet_data----------********------ ",wallet_data);


            })
        console.log("wallet_data----------********------ ",wallet_address_new);
        console.log("wallet_data 678----------********------ ",account.address);

            if(account.address != wallet_address_new){
              res.send({fail:"true",success:"false"});
            }
            else
            {
                      console.log("wallet_data 678----------********------ ",account.address);
                                        // const user = contractABI;                       
          //  async function transaction(){
                          
            var contract =  new web3.eth.Contract(contractABI,contractAddress);
            // var private_key1 = '0x97d17cf1e4852e681fd778aa95b046b6f47989fb63ede2e7348682d4e14af8e9'
            var private_key = private_key1.slice(2);
            var privateKey = Buffer.from(private_key, 'hex');

           await web3.eth.getTransactionCount(wallet_address_new).then( async function(v){
                         console.log("***********v ",v)    
                              
                              count=v;
        
             
                    console.log("*********count*********", count);
                      
        
                        var rawTransaction = {
                             "from":wallet_address ,
                            "gasPrice":"0x0",
                            "gasLimit": web3.utils.toHex(4600000),
                            "to":contractAddress,                
                            "value": "0x0",
                            "data": contract.methods.addDocument(doc,decrypt(verifier_email),decrypt(client_email),doc_name,verifier_myReflect_code,client_myReflect_code,request_status,reason).encodeABI(),
                            "nonce": web3.utils.toHex(count)
                        }
        
                      
                        var transaction = new Tx(rawTransaction);
                        transaction.sign(privateKey);  
        
        
                       await web3.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'),(err,tx_hash)=>{
                          console.log("err ",err);
                          console.log("tx_hash ",tx_hash);
                          console.log("request_status ",request_status);

                          RequestFilesModel.update({transaction_hash:tx_hash,docfile_status:validatore_status,reason:reason},{where:{ request_doc_id: request_doc_id} }).then(async success =>{
                              //  res.redirect('/pen_request_view_client_info?request_id='+request_id);
                              console.log("**************request_file_id********* ", request_file_id); 





                              await RequestDocumentsModel.update({approve_status:"approved",validatore_status:validatore_status},{where:{ request_doc_id: request_doc_id} }).then(async update_success =>{
                                    
                                console.log("**************update_success********* ", update_success); 

                              }) 
                          }).catch(err =>{
                            console.log("**************err********* ", err);
                          })
                            
                        })
                    })
          //  }
              
                      // count++;
            }
          
          // })

          })
         
      })
})
                               
                             }
    }
    

    
// }
  /*outer loop End*/

setTimeout(senddata,15000);
async function senddata(){
   msg = `Your client ${document_name} has been ${validatore_status} by validator ${validator_name}`;
   console.log(msg+" id "+ver_reg_id)
         await NotificationModel.create({
                                           notification_msg   :   msg,
                                           sender_id          :  user_id,
                                           receiver_id        :  ver_reg_id,
                                           request_id         :  request_id,
                                           notification_type  :   1,
                                           notification_date  : formatted,
                                           read_status        : "no"
                                          }).then(async data=>{
                                            console.log("inside 3red")

                                           let client_msg = `Your ${document_name} has been ${validatore_status} by ${ver_name}`;

                                                  await NotificationModel.create({
                                                    notification_msg   :   client_msg,
                                                    sender_id          :   ver_reg_id,
                                                    receiver_id        :  client_id,
                                                    request_id         :  request_id,
                                                    notification_type  :   1,
                                                    notification_date  : formatted,
                                                    read_status        : "no"
                                                  }).then(data=>{

                                                  })
                res.send({fail:"false",success:"true"});
         }).catch(err=>console.log("err1",err))
  
 // }
}
   })
  // }) 
}

/**accept-request Post method End**/


