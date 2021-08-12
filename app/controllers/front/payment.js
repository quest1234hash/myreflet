var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var { tbl_verifier_plan_master} = require('../../models/admin');
var { tbl_verfier_purchase_details } =require("../../models/purchase_detaile")

var admin_notification = require('../../helpers/admin_notification.js')
var { decrypt, encrypt } = require('../../helpers/encrypt-decrypt')

const nodemailer = require("nodemailer");
var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime')
var crypto = require('crypto');
var text_func=require('../../helpers/text');
var mail_func=require('../../helpers/mail');
const util = require('util');
const { base64encode, base64decode } = require('nodejs-base64');
const generateUniqueId = require('generate-unique-id');
var moment = require('moment');
const paginate = require("paginate-array");

const stripe = require('stripe')('sk_test_8ogC8q5ciFVJ2G3oSwzYpORP00LaMUtpr8');

/** charge Post method Start**/
exports.byPlane = async(req,res,next )=> {
  var username;
    var err_msg= req.flash('err_msg');
    var success_msg= req.flash('success_msg');
    req.session.user_type ="verifier"
    var plan_id =req.body.plan_id
    var amount =req.body.amount
   var email = req.body.stripeEmail
   var plan_name = req.body.plan_name
    // console.log("amount",amount)
 var user_id=req.session.user_id
   await stripe.charges.create({ // charge the customer
                                   amount:amount,
                                   description: "select plan",
                                   source: req.body.stripeToken,
                                   currency: "inr",
                                   metadata: {'customer': req.session.user_id}
                                    // customer: req.session.user_id
                  }).then(result=>{
                                   console.log("data of respone pay.....",result)

            tbl_verfier_purchase_details.create({
                                                  plan_id:plan_id,
                                                  reg_user_id:req.session.user_id,
                                                  transaction_id:result.id
                                               })
               .then(data=>{console.log("data saved")})
               .catch(err=>console.log(err))
               tbl_verifier_plan_master.findAll({}).then(async(resultPlan)=>{
              await  UserModel.findOne({ where:{reg_user_id: user_id } }).then(async function(activeUser){
                  console.log("update pin  ",activeUser);
                  var activeEmail=decrypt(activeUser.email);
                   username = decrypt(activeUser.full_name)
            
//**email ho payment start */
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
                    subject: "MyReflet plan.",
              
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
                            <img src="https://165.22.209.72:3008/admin-assets/images/logo-white.png" style="width: 120px;">
                          </div>
                          <div style="padding: 30px;line-height: 32px; text-align: justify;">
                            <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${username}</h4>
                        
                            <p>Your are succssesfuly puchchased ${plan_name} plan</p>
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
    //**email ho payment start */

                                     })                     //  res.render('front/choose-plan',
                                        //                  {
                                        //                   success_msg,
                                        //                   err_msg,
                                        //                   resultPlan,
                                        //                   session:req.session
                                        //   });
                                        await db.query("SELECT * from tbl_verifier_plan_masters where plan_id="+plan_id,{ type:db.QueryTypes.SELECT}).then(plan_data=>{
            
                                          var msg = `${username} has purchased a ${plan_data[0].plan_name} plan.`
                                        
                                        admin_notification(msg,user_id,null,'2');
                                        res.redirect("/myreflect-creat-wallet")    

                                        })
                               })
                                        
             }).catch(err=>{
                      console.log("err of respone pay",err)
                      req.flash("err_msg","Somthing went wrong , Try again")
                      res.redirect("/verifier")


        })

    
    }
/** charge Post method End**/

//**payment History get mathod start */
exports.paymentHistory=(req,res,next)=>{
  var page = req.query.page || 1
    var perPage = 10
  var user_id=req.session.user_id

  db.query("SELECT * FROM tbl_verfier_purchase_details INNER JOIN tbl_verifier_plan_masters ON tbl_verfier_purchase_details.plan_id=tbl_verifier_plan_masters.plan_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_verfier_purchase_details.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_verfier_purchase_details.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(paymentHistory=>{
            
             const pay_array = paginate(paymentHistory, page, perPage);         
             res.render("front/payment-history/payment-history-page",{
                                                                        pay_history:pay_array,
                                                                        moment,
                                                                     })    
  })
}
//**payment History get mathod end */

//**payment Invoice get mathod start */

exports.paymentInvoice=(req,res,next)=>{
  // var page = req.query.page || 1
  //   var perPage = 10
  var user_id=req.session.user_id
  var purchase_id =req.query.purchase_id
  db.query("SELECT * FROM tbl_verfier_purchase_details INNER JOIN tbl_verifier_plan_masters ON tbl_verfier_purchase_details.plan_id=tbl_verifier_plan_masters.plan_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_verfier_purchase_details.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_verfier_purchase_details.purchase_id="+purchase_id,{ type:db.QueryTypes.SELECT}).then(paymentHistory=>{
            
            //  const pay_array = paginate(paymentHistory, page, perPage);    
            console.log("paymentHistory...",paymentHistory)     
             res.render("front/payment-history/history-invoice",{
                                                                        pay_history:paymentHistory,
                                                                        moment,
                                                                     })    
  })
}
//**payment Invoice get mathod end */

//**pay_history_filtere get mathod start */

exports.pay_history_filter=(req,res,next)=>{
  // var page = req.query.page || 1
  //   var perPage = 10
  var reflect_code_list =  JSON.parse(req.body.reflect_code_list);

  var page = req.query.page || 1
  var perPage = 10
var user_id=req.session.user_id

db.query("SELECT * FROM tbl_verfier_purchase_details INNER JOIN tbl_verifier_plan_masters ON tbl_verfier_purchase_details.plan_id=tbl_verifier_plan_masters.plan_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_verfier_purchase_details.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_verfier_purchase_details.reg_user_id="+user_id+" AND tbl_verfier_purchase_details.reflect_id IN ("+reflect_code_list+")",{ type:db.QueryTypes.SELECT}).then(paymentHistory=>{
          
           const pay_array = paginate(paymentHistory, page, perPage);         
           res.render("front/payment-history/paymentHistoryFilter",{
                                                                      pay_history:pay_array,
                                                                      moment,
                                                                   })    
})
}
//**pay_history_filtere get mathod end */
