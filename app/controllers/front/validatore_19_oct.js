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

const { base64encode, base64decode } = require('nodejs-base64');
const Tx = require('ethereumjs-tx')
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/eda1216d6a374b3b861bf65556944cdb"));
// 
var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime')
var crypto = require('crypto');
var text_func=require('../../helpers/text');
var Jimp = require('jimp');

var mail_func=require('../../helpers/mail');
const util = require('util');

var userData = require('../../helpers/profile')

const paginate = require("paginate-array");
const fs = require('fs');
const ipfsAPI = require('ipfs-api');
var async = require('async');

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})


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
    var full_name = req.body.full_name;
    var email = req.body.email;
    var dob = req.body.dob;
    var pin = req.body.pin;
    var country_code_id = req.body.country_code_select;
    var place_of_birth = req.body.place_of_birth;
    var mobile = req.body.mobile;
    var last_name = req.body.last_name;
    var now = new Date();
    now.setMinutes(now.getMinutes() + 03); // timestamp
    now = new Date(now);                  // Date object
    var otp_expire =now                  //  Set Otp Expire date
    var otp = generateOTP()             //   call to OTP generate function
    
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

     var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
     var mystr = mykey.update(req.body.password, 'utf8', 'hex') //**crypt the password by crypt npm module */
     mystr += mykey.final('hex');

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
                             var smtpTransport = nodemailer.createTransport({
                                        service: 'gmail',
                                        auth   : {
                                         user: 'info.myreflet@gmail.com',
                                         pass: 'myquest321'
                                                }
                                    });
                              const mailOptions = {
                                to: email,
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
                                        <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${full_name}</h4>
                                        <p>The link to become validatore is here http://${req.headers.host}/val_invitation?email=${Buffer.from(email).toString('base64')}</p>
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
              await  db.query('SELECT *,GROUP_CONCAT(tbl_request_documents_files.request_file_hash) as hase_values FROM `tbl_validatore_requests` INNER JOIN tbl_documents_masters ON tbl_validatore_requests.doc_id=tbl_documents_masters.doc_id  INNER JOIN tbl_request_documents ON tbl_request_documents.request_id=tbl_validatore_requests.request_id INNER JOIN tbl_myreflectid_doc_rels ON ((tbl_myreflectid_doc_rels.user_doc_id=tbl_request_documents.user_doc_id) AND (tbl_myreflectid_doc_rels.doc_id=tbl_validatore_requests.doc_id)) INNER JOIN tbl_client_verification_requests ON tbl_client_verification_requests.request_id=tbl_validatore_requests.request_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id = tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id = tbl_wallet_reflectid_rels.reg_user_id LEFT JOIN tbl_request_documents_files ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id WHERE tbl_validatore_requests.request_id="'+request_id+'" AND tbl_validatore_requests.status="active" AND tbl_validatore_requests.deleted="0" AND tbl_validatore_requests.validatore_req_id='+validatore_req_id,{type:db.QueryTypes.SELECT})
              .then(async(requestData)=>{
                                            
                      var temp                    = requestData[0].hase_values
                      var hase_values             = temp.split(",")
                      requestData[0].hase_values  = hase_values
                      var ipfsData                =[];
                      var i=0;
                                // console.log("requestData : ",requestData)

                            async.each(requestData[0].hase_values,async function (content, cb) {
                               
                                         await request(`https://ipfs.io/ipfs/${content}`, function (error, response, body) {

                                               if (  !error && response.statusCode == 200  ) {
                                                      
                                                          ipfsData.push(body)
                                                          
                                                        if ( i == ( requestData[0].hase_values.length - 1 ) ) {
                                               

                                                                 requestData[0].ipfsData =  ipfsData
                                                              
                                                                 res.render('front/validatore/request_view',{user_id,
                                                            success_msg,err_msg,requestData,validatore_req_id,                    moment 
                                                                   });
      
                                                         }

                                                         i++;

                                                } else {
                                                           res.send(error)
                                                   }
                                   
                              
                                     })

                              }, function (err) { 
                           
                                   if (err) { console.log("err",err); }
                           
                            });


               })
}
/** self-attested Post Method Start  **/
exports.accept_reject_request = async (req,res,next) =>{
   var validatore_req_id = req.body.validatore_id;
   var validator_type = req.body.validator_type;
   var validatore_name = req.body.validatore_name;
   var status = req.body.validator_type;
   var request_id = req.body.request_id;

 var imgUri;
 var srcImage;
  var buffer;

    var hashes =[];
         await  db.query('SELECT *,GROUP_CONCAT(tbl_request_documents_files.request_file_hash) as hase_values FROM `tbl_validatore_requests` INNER JOIN tbl_documents_masters ON tbl_validatore_requests.doc_id=tbl_documents_masters.doc_id  INNER JOIN tbl_request_documents ON tbl_request_documents.request_id=tbl_validatore_requests.request_id INNER JOIN tbl_myreflectid_doc_rels ON ((tbl_myreflectid_doc_rels.user_doc_id=tbl_request_documents.user_doc_id) AND (tbl_myreflectid_doc_rels.doc_id=tbl_validatore_requests.doc_id)) INNER JOIN tbl_client_verification_requests ON tbl_client_verification_requests.request_id=tbl_validatore_requests.request_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id = tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id = tbl_wallet_reflectid_rels.reg_user_id LEFT JOIN tbl_request_documents_files ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id WHERE tbl_validatore_requests.request_id='+request_id+' AND tbl_validatore_requests.status="active" AND tbl_validatore_requests.deleted="0" AND tbl_validatore_requests.validatore_req_id='+validatore_req_id,{type:db.QueryTypes.SELECT})
              .then(async(requestData)=>{
                                         
                        // console.log("hashes hase_values: ",requestData[0].hase_values)
   
                      var temp                    = requestData[0].hase_values
                      var hase_values             = temp.split(",")
                      requestData[0].hase_values  = hase_values
                      var ipfsData                =[];
                      var i=0;
                      var request_id              =requestData[0].request_id
                      var doc_id                  =requestData[0].doc_id
                      var request_doc_id          =requestData[0].request_doc_id
      async.each(requestData[0].hase_values,async function (content, cb) {
      // for(var i=0;i<requestData[0].hase_values.length;i++){

                  console.log("-------request_doc_id---------" ,request_doc_id);
                  // console.log("-------hashes---------" ,requestData[0].hase_values[i]);

        // hashes.push(requestData[0].hase_values[i]);
                  // console.log("-------hashes---------" ,hashes);
                       
                  // await get_digi_hash(content,validatore_name,validatore_req_id,request_id,doc_id);
                 
                  // if ( i == ( requestData[0].hase_values.length - 1 ) ) {
                     
                  //             res.redirect("/success_status")
                  // }
                  // i++
               await request(`https://ipfs.io/ipfs/${content}`, async function (error, response, body) {

                                               if (  !error && response.statusCode == 200  ) {
                                                                                                      
                                         srcImage = new Buffer(body.split(",")[1], 'base64');

                                          // console.log("hello-----------efr2 ",srcImage);

                                          await get_digi_hash(srcImage,validatore_name,validatore_req_id,request_id,doc_id,status,request_doc_id);
                 
                                          if ( i == ( requestData[0].hase_values.length - 1 ) ) {
                                setTimeout(async function(){
                                
      await db.query('SELECT *from tbl_validatore_requests_doc_files where validatore_req_id='+validatore_req_id,{type:db.QueryTypes.SELECT}).then(async(requestData)=>{

                                                      
                                                   console.log('requestData : ',requestData);

                                                      res.send(requestData);
                                                    })
        },
                                                6000);
                                          }
                                          i++
                                                }
                                                 else {
                                                  res.send(error)
                                              }
                                   

                              
                                     })
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
const get_digi_hash = async function(fun_hash,validatore_name,validatore_req_id,request_id,doc_id,status,request_doc_id){
  console.log("detail----------- ",validatore_name,validatore_req_id,request_id,doc_id,status,request_doc_id);




    var today="validatore "+validatore_name;
    console.log("hello-----------1 ");

         
     await Jimp.create(500,500,'#ffffff').then(async nova_new =>{


          //  console.log("hello-----------fun_hash ",fun_hash);    
          //  console.log("hello-----------image ",fun_hash);
    // var buffer = new Buffer(dataUrl.split(",")[1], 'base64');

    
            // const buff = Buffer.from(fun_hash,'base64');
            // buff.toString();
        
        
     await Jimp.read(fun_hash).then(async newimage => {        
            await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(async font => {
            await  newimage.print(font,newimage.bitmap.width/2.5,newimage.bitmap.height/2.5,today);

                        
            });
        
            // nova_new.composite(image,0,0);
            nova_new.composite(newimage,-100,350);
            newimage.resize(500,500);
        
            // await newimage.resize(newimage.bitmap.width/4,newimage.bitmap.width/4);

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
                            await  tbl_validatore_requests_doc_files.create({
                                                    validatore_req_id:validatore_req_id,
                                                    doc_id:doc_id,
                                                    request_id:request_id,
                                                    file_hase:file[0].hash,
                                                    status :status
                                                  }).then(async (dataForReturn)=>{

                                                   await RequestDocumentsModel.update({validatore_status:status},{where:{request_doc_id:request_doc_id}})
                                                    .then(dataupdate=>{
                                                      console.log("hello-----------8 ");
                                                      return "dataForReturn"; 
                                                    })
                                                    .catch(err=>{ 
                                                                     console.log("error",err)
                                                     })
                                                      
                                                  })
                          }
                        
                    
                        })
                    });
            
            })
            .catch(err => {
                console.log('error',err);
            
            });
        
        });
  

          
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
     
     var account = web3.eth.accounts.create();
    //  var wallet_address = account.address
     var private_key = account.privateKey
     let buff = new Buffer(private_key);
     let query = buff.toString('base64');
    res.render('front/validatore/validatore_wallet/validatore-backup-your-private-key',{
        private_key,query,
        session:req.session
    });
}
/** backup-private-key Get MEthod End **/

/**backup-eth-address Get MEthod Start **/
exports.backup_eth_address = (req,res,next) =>{
  
    var query = req.query.key.trim();
    // var private_key = decodeURI(query);
    let buff1 = new Buffer(query, 'base64');
let private_key = buff1.toString('ascii');
    let account = web3.eth.accounts.privateKeyToAccount(private_key)
    const wallet_address = account.address;
     let buff2 = new Buffer(wallet_address);
     let address = buff2.toString('base64');
 
        res.render('front/validatore/validatore_wallet/validatore-backup-etherium-address',{
            wallet_address,address,
            session:req.session
        })


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
  let ver_name;
  var ver_reg_id;
     var validatore_req_id = req.body.validatore_id;
     var verifer_my_reflect_id = req.body.verifer_my_reflect_id;

  // var request_file_id = req.body.request_file_id;
   var ver_reflect_id = req.body.ver_reflect_id;
   var client_reflect_id = req.body.client_reflect_id;
   console.log("ver_reflect_id------ ",ver_reflect_id);
      console.log("client_reflect_id------ ",client_reflect_id);

  var request_status = req.body.request_status;
  var reason = req.body.reason;

   var request_doc_id = req.body.request_doc_id;
      var doc_name =req.body.document_name;
      document_name =req.body.document_name;
      var request_file_id = req.body.request_file_id;
      var validatore_status = req.body.validatore_status;
    console.log('request_doc_id : ',request_doc_id)
  //  var count;
  //  var file_id = file_data.split("-")[1];
  //  console.log("file_id----------********------ ",file_id);
  await RequestDocumentsModel.update({approve_status:"approved",validatore_status:validatore_status},{where:{ request_doc_id: request_doc_id} }).then(async update_success =>{
  // await db.query('SELECT *,GROUP_CONCAT(tbl_request_documents_files.request_file_hash) as hase_values FROM `tbl_validatore_requests` INNER JOIN tbl_documents_masters ON tbl_validatore_requests.doc_id=tbl_documents_masters.doc_id  INNER JOIN tbl_request_documents ON tbl_request_documents.request_id=tbl_validatore_requests.request_id INNER JOIN tbl_myreflectid_doc_rels ON ((tbl_myreflectid_doc_rels.user_doc_id=tbl_request_documents.user_doc_id) AND (tbl_myreflectid_doc_rels.doc_id=tbl_validatore_requests.doc_id)) INNER JOIN tbl_client_verification_requests ON tbl_client_verification_requests.request_id=tbl_validatore_requests.request_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id = tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id = tbl_wallet_reflectid_rels.reg_user_id LEFT JOIN tbl_request_documents_files ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id WHERE tbl_validatore_requests.request_id="1" AND tbl_validatore_requests.status="active" AND tbl_validatore_requests.deleted="0" AND tbl_validatore_requests.validatore_req_id='+validatore_req_id,{type:db.QueryTypes.SELECT}).then(async(requestData)=>{
      await db.query('SELECT *from tbl_validatore_requests_doc_files where validatore_req_id='+validatore_req_id,{type:db.QueryTypes.SELECT}).then(async(requestData)=>{
    let count=0;
  /*outer loop Start*/

      
                    //  var temp                    = requestData[0].hase_values
                      //var hase_values             = temp.split(",")
                      //requestData[0].hase_values  = hase_values

        console.log("*****request_doc_data****** ",requestData);
        console.log("*****request_doc_data****** ",requestData.length);

    for(var k=0;k<requestData.length;k++){
     

    

        var doc =requestData[k].file_hase
    console.log("*****request_doc_dat file_hase****** ",doc);
 
  //  await db.query("SELECT * FROM tbl_files_docs INNER JOIN tbl_myreflectid_doc_rels ON tbl_files_docs.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id inner join tbl_documents_masters on tbl_documents_masters.doc_id=tbl_myreflectid_doc_rels.doc_id WHERE tbl_files_docs.file_id="+file_id,{ type:db.QueryTypes.SELECT}).then(async function(file_result){
  //     var doc = file_result[0].file_content;
  //     var doc_name = file_result[0].document_name;
  //     // console.log("file_result----------********------ ",file_result);
  //     var user_reflect_id = file_result[0].reflect_id;
      await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.deleted='0' AND tbl_wallet_reflectid_rels.reflect_id="+client_reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(client_data){
      // console.log("client_data----------********------ ",client_data);
           await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.deleted='0' AND tbl_wallet_reflectid_rels.reflect_id="+verifer_my_reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_reg_data){

            ver_reg_id  = verifier_reg_data[0].reg_user_id;
           client_id = client_data[0].reg_user_id;
          var client_email = client_data[0].email;
          var client_myReflect_code = client_data[0].reflect_code;
          await db.query("SELECT * FROM  tbl_user_registrations  WHERE reg_user_id="+ver_reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_data){

                 console.log("private_key1 : ",private_key1)
                 console.log("verifier_data : ",verifier_data)

            console.log("wallet_address : ",wallet_address)

            // console.log("verifier_data----------********------ ",verifier_data);
            var verifier_email = verifier_data[0].email;
            var verifier_myReflect_code = '5645'
            var wallet_id = verifier_data[0].wallet_id;
            // V_R_code = verifier_data[0].reflect_code;
            ver_name = verifier_data[0].full_name;

            // var wallet_address = web3.eth.accounts.privateKeyToAccount(private_key1);            
       
            // await db.query("SELECT * FROM tbl_user_wallets WHERE deleted='0' AND wallet_address="+wallet_address,{ type:db.QueryTypes.SELECT}).then(async function(wallet_data){


          //  var wallet_address='0x39c40B81acC1F06f3BDEb3A4fE36A8De9753313B';
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

              var contractABI =[{"constant":true,"inputs":[],"name":"getDocumentsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"doc","type":"string"},{"name":"verifier_email","type":"string"},{"name":"client_email","type":"string"},{"name":"doc_name","type":"string"},{"name":"verifier_myReflect_code","type":"string"},{"name":"client_myReflect_code","type":"string"},{"name":"request_status","type":"string"},{"name":"reason","type":"string"}],"name":"addDocument","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getDocument","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"documents","outputs":[{"name":"doc","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}];

              const user = contractABI;                       
              var contractAddress = '0xFd1d83E5959302Fb55b55F17533E931a4CE1cC83';
              var contract =  new web3.eth.Contract(user,contractAddress);
              // var private_key1 = '0x97d17cf1e4852e681fd778aa95b046b6f47989fb63ede2e7348682d4e14af8e9'
              var private_key = private_key1.slice(2);
              var privateKey = Buffer.from(private_key, 'hex');

             await web3.eth.getTransactionCount(wallet_address_new).then( async function(v){
                           console.log("***********v ",v)    
                           if(k==0){
                            count = v;
                           }else if(count==v){
                            count = v+1;
                           }else{
                             count=v;
                           }             
               verifier_myReflect_code:
                      console.log("*********count*********", count);
                        
          
                          var rawTransaction = {
                              "from": wallet_address,
                              "gasPrice": web3.utils.toHex(20 * 1e9),
                              "gasLimit": web3.utils.toHex(200000),
                              "to":contractAddress,                
                              "value": "0x0",
                              "data": contract.methods.addDocument(doc,verifier_email,client_email,doc_name,verifier_myReflect_code,client_myReflect_code,request_status,reason).encodeABI(),
                              "nonce": web3.utils.toHex(count)
                          }
          
                        
                          var transaction = new Tx(rawTransaction);
                          transaction.sign(privateKey);  
          
          
                         await web3.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'),(err,tx_hash)=>{
                            console.log("err ",err);
                            console.log("tx_hash ",tx_hash);
                            console.log("request_status ",request_status);
                            RequestFilesModel.update({transaction_hash:tx_hash,docfile_status:validatore_status,reason:reason},{where:{ request_file_id: request_file_id} }).then(success =>{
                                //  res.redirect('/pen_request_view_client_info?request_id='+request_id);
                                console.log("**************request_file_id********* ", request_file_id); 
                                console.log("**************success********* ", success); 
                            }).catch(err =>{
                              console.log("**************err********* ", err);
                            })
                              
                          })
                      })
                      // count++;
            }
          
          // })

          })
         
      })
})
}
  /*outer loop End*/

setTimeout(senddata,15000);
async function senddata(){
   msg = `Your ${document_name} has been ${validatore_status} by ${ver_name}`;
   console.log(msg+" id "+ver_reg_id)
         await NotificationModel.create({
                                           notification_msg   :   msg,
                                           sender_id          :  user_id,
                                           receiver_id        :  ver_reg_id,
                                           request_id         :  request_id,
                                           notification_type  :   1,
                                           notification_date  : formatted,
                                           read_status        : "no"
                                          }).then(data=>{
                                            console.log("inside 3red")

                res.send({fail:"false",success:"true"});
         }).catch(err=>console.log("err1",err))
  
 // }
}
   })
  }) 
}

/**accept-request Post method End**/


