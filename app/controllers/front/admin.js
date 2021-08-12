var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var {AdminModel,DurationModel,tbl_verifier_plan_master,PlanFeatures,ContectUsModel,PlanFeatureRel,MarketPlace,AllotMarketPlace,adminNotificationModel,MasterLevelModel,
    AllotMasterLevelModel}=require('../../models/admin');
var {DocumentMasterModel,VerifierCategoryMasterModel,CountryModel}=require('../../models/master');
var {DocumentReflectIdModel}=require('../../models/reflect');
var {ReportMasterModel}=require('../../models/my_reports');
var {AccreditaionMasterModel,
    AccreditaionFeatureModel,
    AccreditaionFeatureRelModel,
    AccreditatiRelModel}=require('../../models/accreditation.js')
 var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel,AdminDocumentRequest} = require('../../models/request');
var {NotificationModel} = require('../../models/notification');
var {UserModel}=require('../../models/user');
var {MyReflectIdModel, DocumentReflectIdModel, FilesDocModel} = require('../../models/reflect');

var {AboutusModel,ConnectWithModel,WhyChooseUs, Features,FeaturesRelations,Benifits,KeyPillarsModel,TermsConditionModel}=require('../../models/general_page');

var moment = require('moment');
const paginate   =  require("paginate-array");

var { decrypt, encrypt } = require('../../helpers/encrypt-decrypt')

const nodemailer = require("nodemailer");
const express = require('express');
var app=express();
const ejs = require('ejs');
const bcrypt = require('bcryptjs')
 
var db = require('../../services/database'); 
var sequelize = require('sequelize'); 
var dateTime = require('node-datetime')
var crypto = require('crypto');
var text_func=require('../../helpers/text');

var mail_func=require('../../helpers/mail'); 
const util = require('util'); 
const { base64encode, base64decode } = require('nodejs-base64');

var userData = require('../../helpers/profile')
 

const ipfsAPI = require('ipfs-api');
const fs = require('fs');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

// exports.index = (req,res, next) => {
//     res.render('front/index');
// };

/** admin-dashboard get Method Start**/
exports.dashboard = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

        await db.query("SELECT count(*) as 'user_count' FROM `tbl_user_registrations`",{ type:db.QueryTypes.SELECT}).then(async function(count_user){     

            await db.query("SELECT count(*) as 'TOTAL' FROM tbl_user_registrations WHERE MONTH(createdAt) = (MONTH(CURRENT_DATE())-1) AND YEAR(createdAt) = YEAR(CURRENT_DATE())",{ type:db.QueryTypes.SELECT}).then(async function(PrevMonthUser){  

                await db.query("SELECT count(*)  as 'TOTAL' FROM tbl_user_registrations WHERE MONTH(createdAt) = MONTH(CURRENT_DATE()) AND YEAR(createdAt) = YEAR(CURRENT_DATE())",{ type:db.QueryTypes.SELECT}).then(async function(CurrMonthUser){  

                 await db.query("SELECT count(*) as 'count_monthly_user' FROM tbl_user_registrations WHERE MONTH(createdAt) = MONTH(CURRENT_DATE()) AND YEAR(createdAt) = YEAR(CURRENT_DATE())",{ type:db.QueryTypes.SELECT}).then(async function(monthly_count_user){

                    await db.query("SELECT count(*) as 'count_verifier' FROM `tbl_wallet_reflectid_rels` WHERE user_as='verifier'",{ type:db.QueryTypes.SELECT}).then(async function(count_verifier){

                       await db.query("SELECT count(*) as 'contactus_count' FROM `tbl_contact_us`",{ type:db.QueryTypes.SELECT}).then(async function(count_contactas){     

                       
                         await db.query("SELECT count(*) as 'count_client' FROM `tbl_wallet_reflectid_rels` WHERE reflectid_by!='digitalWallet' and  user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(count_client){

                                await db.query("SELECT count(*) as 'count_entity' FROM `tbl_wallet_reflectid_rels` WHERE reflectid_by='entity'",{ type:db.QueryTypes.SELECT}).then(async function(count_entity){

                                    await db.query("SELECT count(*) as 'count_rep' FROM `tbl_wallet_reflectid_rels` WHERE reflectid_by='representative'",{ type:db.QueryTypes.SELECT}).then(async function(count_rep){

                                        await db.query("SELECT count(*) as 'user_weekly_payment' FROM `tbl_user_registrations`",{ type:db.QueryTypes.SELECT}).then(async function(sum_weekly_payment){

                                            await db.query("SELECT sum(plan_price) as 'TOTAL' FROM `tbl_verfier_purchase_details` INNER join tbl_verifier_plan_masters on tbl_verifier_plan_masters.plan_id=tbl_verfier_purchase_details.plan_id WHERE MONTH(tbl_verfier_purchase_details.createdAt) = MONTH(CURRENT_DATE()) AND YEAR(tbl_verfier_purchase_details.createdAt) = YEAR(CURRENT_DATE())",{ type:db.QueryTypes.SELECT}).then(async function(CurrMonthPayment){

                                                  await db.query("SELECT sum(plan_price) as 'TOTAL' FROM `tbl_verfier_purchase_details` INNER join tbl_verifier_plan_masters on tbl_verifier_plan_masters.plan_id=tbl_verfier_purchase_details.plan_id WHERE MONTH(tbl_verfier_purchase_details.createdAt) = (MONTH(CURRENT_DATE())-1) AND YEAR(tbl_verfier_purchase_details.createdAt) = YEAR(CURRENT_DATE())",{ type:db.QueryTypes.SELECT}).then(async function(PrevMonthPayment){

                                                    await db.query("SELECT sum(plan_price) as 'total_payment' FROM `tbl_verfier_purchase_details` INNER join tbl_verifier_plan_masters on tbl_verifier_plan_masters.plan_id=tbl_verfier_purchase_details.plan_id",{ type:db.QueryTypes.SELECT}).then(async function(total_payment){

                                                            await db.query("SELECT count(*) as 'count_total_payment' FROM `tbl_verfier_purchase_details` INNER join tbl_verifier_plan_masters on tbl_verifier_plan_masters.plan_id=tbl_verfier_purchase_details.plan_id",{ type:db.QueryTypes.SELECT}).then(async function(count_total_payment) {


                                                                    await db.query("SELECT ThisMonth.MONTH, ThisMonth.YEAR, ThisMonth.TOTAL, PrevMonth.MONTH AS PREVIOUS_MONTH, PrevMonth.YEAR AS PREVIOUS_YEAR, PrevMonth.TOTAL AS PREVIOUS_TOTAL FROM ( SELECT MONTH(createdAt) AS `month`, YEAR(createdAt) AS `year`, EXTRACT(YEAR_MONTH FROM createdAt) AS YearMonth, count(*) AS total FROM tbl_user_registrations GROUP BY `month`, `year`, YearMonth ) ThisMonth LEFT OUTER JOIN ( SELECT MONTH(createdAt) AS `month`, YEAR(createdAt) AS `year`, EXTRACT(YEAR_MONTH FROM DATE_ADD(createdAt, INTERVAL 1 MONTH)) AS YearMonth, count(*) AS total FROM tbl_user_registrations GROUP BY `month`, `year`, YearMonth ) PrevMonth ON ThisMonth.YearMonth = PrevMonth.YearMonth ORDER BY MONTH desc",{ type:db.QueryTypes.SELECT}).then(async function(monthly_user_count){

                                                                   
                                                                    var user_growth,new_number,orignal_number,user_type,payment_growth,payment_growth_type;

                                                                    

                                                                   console.log("(monthly_user[0].TOTAL : ",PrevMonthUser[0].TOTAL," monthly_user[0].TOTAL :",CurrMonthUser[0].TOTAL)

                                                                        if(CurrMonthUser[0].TOTAL>PrevMonthUser[0].TOTAL)
                                                                        {
                                                                             new_number =  CurrMonthUser[0].TOTAL
                                                                             orignal_number = PrevMonthUser[0].TOTAL
                                                                             Increase   = new_number - orignal_number
                                                                             user_growth = ((Increase / orignal_number) * 100).toFixed(2)
                                                                             user_type = 'Increase'

                                                                        }else if(CurrMonthUser[0].TOTAL === PrevMonthUser[0].TOTAL){
                                                                            user_type = 'decrease or increase'
                                                                            user_growth = '0'
                                                                        }else{

                                                                             new_number = CurrMonthUser[0].TOTAL;
                                                                             orignal_number =  PrevMonthUser[0].TOTAL; 
                                                                             Decrease   =  orignal_number- new_number;
                                                                             user_growth = ((Decrease / orignal_number) * 100).toFixed(2)
                                                                             user_type = 'Decrease'

                                                                        }


                                                          console.log("(monthly_user[0].TOTAL : ",PrevMonthPayment[0].TOTAL," monthly_user[0].TOTAL :",CurrMonthPayment[0].TOTAL)

                                                        //   if(PrevMonthPayment[0].TOTAL == null)
                                                        //   {
                                                        //     new_number =  CurrMonthPayment[0].TOTAL
                                                        //     orignal_number = 0;
                                                        //     Increase   = new_number - orignal_number
                                                        //     payment_growth = ((Increase / orignal_number) * 100).toFixed(2)
                                                        //     payment_growth_type = 'Increase'

                                                        //   }
                                                                        if(CurrMonthPayment[0].TOTAL>PrevMonthPayment[0].TOTAL)
                                                                        {
                                                                             new_number =  CurrMonthPayment[0].TOTAL
                                                                             orignal_number = PrevMonthPayment[0].TOTAL
                                                                             Increase   = new_number - orignal_number
                                                                             payment_growth = ((Increase / orignal_number) * 100).toFixed(2)
                                                                             payment_growth_type = 'Increase'

                                                                        }else if(CurrMonthPayment[0].TOTAL === PrevMonthPayment[0].TOTAL){
                                                                            payment_growth_type = 'decrease or increase'
                                                                            payment_growth = '0'
                                                                        }else{

                                                                             new_number = CurrMonthPayment[0].TOTAL;
                                                                             orignal_number =  PrevMonthPayment[0].TOTAL; 
                                                                             Decrease   =  orignal_number- new_number;
                                                                             payment_growth = ((Decrease / orignal_number) * 100).toFixed(2)
                                                                             payment_growth_type = 'Decrease'

                                                                        }
                                                                 console.log("payment_growth : ",payment_growth,' payment_growth_type: ',payment_growth_type)

                                                                                 res.render('admin-views/admin-dashboard',{
                                                                                        profile_pic,
                                                                                        first_name,
                                                                                        count_user,
                                                                                        count_verifier,
                                                                                        count_entity,
                                                                                        count_rep,
                                                                                        sum_weekly_payment,
                                                                                        sum_monthly_payment:CurrMonthPayment,
                                                                                        total_payment,
                                                                                        count_total_payment,
                                                                                        user_growth,monthly_count_user,
                                                                                        user_type,payment_growth,payment_growth_type,count_client,count_contactas
                                                                               });  



                                                            })    
                                                        })                         
                                                    })

                                                })                     
                                             })

                                        })     
                                   })     

                                });
                            })
                           
                        });                    

                    });                         
                                       
                });

              });    
            })                

        });
}
/** admin-dashboard get Method End**/

/** log-out get method Start **/
exports.log_out = (req,res,next )=> {
  
    req.session.destroy(function (err) { })

res.redirect('/admin-login')

}
/** log-out get Method End **/

/** admin-login Get Method Start**/ 
exports.signIn = (req,res,next )=> {
    // console.log('admin')
  var  success_msg = req.flash('success_msg');
  var  err_msg = req.flash('error');
    res.render('admin-views/admin-login',{
        success_msg,
        err_msg
    });
}
/** admin-login Get Method End **/


/** admin-login-Post Method Start **/
exports.login_post =async (req,res,next )=> {
    const username = req.body.username
    const password = req.body.password

    const admin =  await AdminModel.findOne({ email:username })
    await AdminModel.findOne({ where:{email:username} }).then(async function(userDataResult) {

    const isMatch = await bcrypt.compare(password, admin.password) 
    console.log('IS match : ',isMatch)
        if (!userDataResult) {
            req.flash('error', 'Please enter correct credentials.');
                res.redirect('/admin-login')
        }
        if (!isMatch) {

            req.flash('error', 'Please enter correct credentials.');
            res.redirect('/admin-login')
        }
            req.session.islogin=true;
            req.session.admin_id=admin.email;
            req.session.profile_pic=admin.profile_pic;
            req.session.first_name=admin.first_name;


           console.log('true')
           res.redirect('/admin-dashboard')
            })        // res.redirect('/client-list')

        //    res.render('admin-views/admin-dashboard',{
        //     // success_msg,
        //     // err_msg
        // });
        
        
      
 }
/** admin-login-post Method End **/

/** admin-forgot-password get Method start**/
 exports.forgot_password = (req,res,next )=> {
     console.log('FORGOT')
    var success_msg = req.flash('success');
    var err_msg= req.flash('err_msg'); 

    res.render('admin-views/admin-forgot-password',{
        success_msg,
        err_msg
    });
}
/** admin-forgot-password get Method End**/


/** admin-forgot-post Method start**/
exports.submitForgetPassword =async (req,res,next )=> {
    console.log('FORGOT 1')

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var email =req.body.emailid;

 console.log(email)
  await AdminModel.findOne({ where:{email:email} }).then(function(userDataResult) {

         if(userDataResult==null)
         {
          req.flash('err_msg', 'This Email-Id is not registered.')
          res.redirect("/admin-forgot-password");

         }
         else
         {
            var url_data=`https://${req.headers.host}/admin-reset-password/?mail=`+base64encode(email);

            var mail_subject="MyReflect ResetPassword Link.";
                var mail_content='Hello '+userDataResult.first_name+',<p>Please check your verificaton code and reset password link.<br/><br/><a href="'+url_data+'">Click here</a> to reset password.</p>';
                var to_mail=email;
                var mailresult=mail_func.sendMail(to_mail,mail_subject,mail_content);
             
             }
             res.redirect("/continue");

                }).catch(err=>console.log(err))
     
                /**update vericication code to reset passsword end**/


             

         
            

    
}
/** admin-forgot-post Method End**/

 /** continue get Method Start**/
exports.continue =(req,res,next )=> {
    res.render('admin-views/continue',{
        // success_msg,
        // err_msg
    });
}
/** continue  get Method End**/

/** admin-reset-password get Method Start**/
exports.reset_password =(req,res,next )=> {
    var id=req.query.mail
    console.log(id)

    var admin_id = base64decode(id);
    console.log(admin_id)

    res.render('admin-views/admin-reset-password',{
        admin_id
        // success_msg,
        // err_msg
    });
}
/** admin-reset-password get Method End**/

/** admin-reset-post Method Start**/
exports.reset_post =async (req,res,next )=> {

    // console.log('myprofile post---- ')

   

    const new_pass = req.body.confirm_pass
    const admin_id = req.body.admin_id

    
            console.log('your password 3 not match!',admin_id)
            console.log('your password 3 not match!',new_pass)

    // const admin =  await AdminModel.findOne({ email:admin_id })
   
  
           const hashedPassword = await bcrypt.hash(new_pass,8)
           var updateValues=
           {
               password:hashedPassword
           }
           AdminModel.update(updateValues, { where: { email: admin_id } }).then((result) => 
           {

                   req.flash('success_msg', 'Your password changed successfully !');
                   res.redirect('/admin-login');
                
           })
          

           
}
/** admin-reset-post Method End**/




/** my-profile Get Method Start**/
exports.my_profile =async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    console.log('myprofile ---- ')
    var admin_id = req.session.admin_id;

    const admin =  await AdminModel.findOne({ email:admin_id })

    success_msg = req.flash('success');
    err_msg = req.flash('err_msg'); 
    res.render('admin-views/my-profile',{layout: false,admin,
        success_msg,
        err_msg,profile_pic,first_name
 });}
/** my-profile Get Method End**/

/**admin-profile-post Method Start**/
exports.profile_post =(req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    console.log('myprofile post---- ')
    
    var admin_id = req.session.admin_id;

    const first_name_1 = req.body.first_name
    const last_name = req.body.last_name
    const email = req.body.email
    var admin_pic=req.body.text_img_name;

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');


    var updateValues={
        first_name:first_name_1,
        last_name:last_name,
        email:email,
        profile_pic:admin_pic,
        updatedAt:formatted
       }
     AdminModel.update(updateValues, { where: { email: admin_id } }).then((result) => 
        {
            // res.render('admin-views/admin-dashboard',{
            //     // success_msg,
            //     // err_msg
            // });
            req.flash('success', 'Your profile updated successfully !');
            res.redirect('/my-profile');
        })



}
/**admin-profile-post Method End**/

/**admin-change-password Get Method Start**/
exports.change_password =(req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    success_msg = req.flash('success');
    err_msg = req.flash('error');
    res.render('admin-views/change-password',{
        success_msg,
        err_msg,profile_pic,first_name
    });
}
/**admin-change-password Get Method End**/

/**admin-change-password-post Method Start**/
exports.change_password_post =async (req,res,next )=> {

    // console.log('myprofile post---- ')
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;admin_

   
    var admin_id = req.session.admin_id;

    const old_pass = req.body.old_password
    const new_pass = req.body.new_password
    
            console.log('your password 1 not match!',admin_id)
            console.log('your password 2 not match!',old_pass)
            console.log('your password 3 not match!',new_pass)

    const admin =  await AdminModel.findOne({ email:admin_id })
    const isMatch = await bcrypt.compare(old_pass, admin.password)
   
    console.log(isMatch)
    if(!isMatch){
        // console.log('your password does not match!')

        req.flash('error', 'Please enter correct current password.');
   
     
         res.redirect('/admin-change-password');
      
            
       }
       else if(new_pass == old_pass){
           req.flash('error', 'New password should not be same as current password.');
           res.redirect('/admin-change-password');
        }
       else {
           const hashedPassword = await bcrypt.hash(new_pass,8)
           var updateValues=
           {
               password:hashedPassword
           }
           AdminModel.update(updateValues, { where: { email: admin_id } }).then((result) => 
           {
                     console.log('your password match!',result)

                   req.flash('success', 'Your password changed successfully !');
                   res.redirect('/admin-change-password');
                
           })
       }    

           
}
/**admin-change-password-post Method End**/

//*********** change password end*************** 

/**client-list get Method Start**/
exports.client_list_get = (req,res,next )=> {
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;


    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

    
    
   
   
    

    
    
    
    db.query("SELECT user_id,status,birthplace,full_name,dob,email,numReflect FROM tbl_user_registrations u INNER JOIN ( SELECT reg_user_id as user_id, count(reflect_id) as numReflect FROM tbl_wallet_reflectid_rels WHERE reflectid_by!='digitalWallet' and  user_as='client'  GROUP BY tbl_wallet_reflectid_rels.reg_user_id ) as r ON r.user_id = u.reg_user_id where deleted='0'  ORDER BY r.numReflect DESC",{ type:db.QueryTypes.SELECT}).then(function(count_client_result){
     
        if (about_us_data.length > 0) {

            page_data=count_client_result
    
        }
    
    
    
     
    const count_client_list = paginate(page_data,page, perPage);
                               
        res.render('admin-views/client-list',{ profile_pic,first_name,
            count_client_list,success_msg,err_msg
        });   
                      
                           
 
                  // 

        }); 

}
 /**client-list get Method End**/

/**verifier-list get Method Start**/
exports.verifier_list = (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    
    db.query("SELECT user_id,status,birthplace,full_name,dob,email,numReflect FROM tbl_user_registrations u INNER JOIN ( SELECT reg_user_id as user_id, count(reflect_id) as numReflect FROM tbl_wallet_reflectid_rels WHERE user_as='verifier' GROUP BY tbl_wallet_reflectid_rels.reg_user_id ) as r ON r.user_id = u.reg_user_id where deleted='0' ORDER BY r.numReflect DESC",{ type:db.QueryTypes.SELECT}).then(function(count_verifier_result){
     
        if (count_verifier_result.length > 0) { 

            page_data=count_verifier_result
    
        } 
    
    
    
     
    const count_verifier_list = paginate(page_data,page, perPage);
    
    res.render('admin-views/verifier-list',{profile_pic,first_name,count_verifier_list,
        success_msg,
        err_msg
    });});
}
/**verifier-list get Method End**/

/**show-verifier-by-status post Method Start**/
exports.show_verifier_by_status = (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    var option=req.body.option_value
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

    var status_value;

    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
    console.log(option)

    
    if(option==1)
    {
        status_value='active';

    }
    else if(option==2)
    {
        status_value='inactive';

    }
    else if(option==3){
        status_value='block';

    }
    else
     {
       status_value='all' 
     }
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
    console.log(status_value)

    if(status_value==="all")
 {
    db.query("SELECT user_id,status,birthplace,full_name,dob,email,numReflect FROM tbl_user_registrations u INNER JOIN ( SELECT reg_user_id as user_id, count(reflect_id) as numReflect FROM tbl_wallet_reflectid_rels WHERE user_as='verifier' GROUP BY tbl_wallet_reflectid_rels.reg_user_id ) as r ON r.user_id = u.reg_user_id   ORDER BY r.numReflect DESC",{ type:db.QueryTypes.SELECT}).then(function(count_verifier_result){
     
        if (count_verifier_result.length > 0) {

            page_data=count_verifier_result
    
        }
    
    
    
    console.log('count_verifier_result : ',count_verifier_result)
    const count_verifier_list = paginate(page_data,page, perPage);
    // var obj=
    // {
    //     moment:moment,
    //     count_verifier_result:count_verifier_result

    // }
    res.send(count_verifier_result)
    // res.render('admin-views/verifier-list',{profile_pic,first_name,count_verifier_list
        // success_msg,
        // err_msg
    // });
});
}
else
{
    db.query("SELECT user_id,status,birthplace,full_name,dob,email,numReflect FROM tbl_user_registrations u INNER JOIN ( SELECT reg_user_id as user_id, count(reflect_id) as numReflect FROM tbl_wallet_reflectid_rels WHERE user_as='verifier' GROUP BY tbl_wallet_reflectid_rels.reg_user_id ) as r ON r.user_id = u.reg_user_id where status='"+status_value+"' ORDER BY r.numReflect DESC",{ type:db.QueryTypes.SELECT}).then(function(count_verifier_result){
     
        if (count_verifier_result.length > 0) {

            page_data=count_verifier_result
    
        }
    
    
    
    console.log('count_verifier_result : ',count_verifier_result)
    const count_verifier_list = paginate(page_data,page, perPage);
    // var obj=
    // {
    //     moment:moment,
    //     count_verifier_result:count_verifier_result

    // }
    res.send(count_verifier_result)
    // res.render('admin-views/verifier-list',{profile_pic,first_name,count_verifier_list
        // success_msg,
        // err_msg
    // });
});
}

}
/**show-verifier-by-status post Method End**/

/**delete-verifier get Method Start**/
exports.delete_verifier= async (req,res,next)=>
{
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    const v_id = req.params.id
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');

    var reg_user_id=v_id.replace(/:/g,"");
     
    console.log(reg_user_id)

    var updateValues=
    {
        deleted_at:formatted,
        deleted:'1'
    }
    await UserModel.update(updateValues, { where: { reg_user_id: reg_user_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully deleted !');
            res.redirect('/verifier-list');
         
    })

}
/**delete-verifier get Method End**/

/**block-verifier get Method Start**/
exports.block_verifier= async (req,res,next)=>
{
    var user_status='block'

    const v_id = req.params.id
    var user_id=v_id.replace(/:/g,"");

    console.log(user_id)

    console.log(user_status)
    // console.log(plan_price)

    var updateValues=
    {
        reg_user_id:user_id,
        status:user_status
    }
    await UserModel.update(updateValues, { where: { reg_user_id: user_id } }).then((result) => 
    {
        console.log(result)

            res.redirect('/verifier-list');
         
    })


}
/**block-verifier get Method End**/

// exports.manage_verifier= async (req,res,next)=>
// {
//     // var user_status='block'
//     var profile_pic = req.session.profile_pic;
//     var first_name = req.session.first_name;
//     const v_id = req.params.id
//     var reg_user_id=v_id.replace(/:/g,"");

//     var page = req.query.page || 1
//     var perPage = 10;
//     var page_data=[]
//     console.log(reg_user_id)

//     // console.log(user_status)
//     // console.log(plan_price)
//     // db.query("SELECT * FROM `tbl_myreflectid_doc_rels` inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id WHERE tbl_wallet_reflectid_rels.reg_user_id=1 and tbl_wallet_reflectid_rels.reflect_id=2"+reg_user_id,+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(all_verifier_result){

//     // db.query("SELECT reflectid_by,rep_firstname0,reflectFROM `tbl_myreflectid_doc_rels` inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and user_as='verifier'",{ type:db.QueryTypes.SELECT}).then(async function(verifier_result) {
//         db.query("SELECT *FROM `tbl_myreflectid_doc_rels` inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and user_as='verifier'",{ type:db.QueryTypes.SELECT}).then(async function(all_verifier_result){

//             // db.query("SELECT * FROM `tbl_myreflectid_doc_rels` inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and user_as='verifier'",{ type:db.QueryTypes.SELECT}).then(async function(verifier_list_1){

//         if (all_verifier_result.length > 0) { 

//             page_data=all_verifier_result
    
//         }
    
//         console.log('****************************')

//         console.log('****************************',all_verifier_result)

//     const verifier_list = paginate(page_data,page, perPage);
//     res.render('admin-views/manage_request',{
//         profile_pic,first_name,verifier_list,moment
//         // success_msg,
//         // err_msg 
//     // });
// })}); 



// }
/**manage-verifier get Method Start*/
exports.manage_verifier= async (req,res,next)=>

{
    console.log(' -----------------------          console.log(reg_user_id)    ')

    // var user_status='block'
    var first_name = req.session.first_name; 
    // const reflect_id = req.body.reflect_id
    const reg_user_id = req.query.id

    // var reg_user_id=v_id.replace(/:/g,"");
    var profile_pic = req.session.profile_pic;
    var page = req.query.page || 1
    var perPage = 30;
    var page_data=[]
    // console.log(reflect_id)

    console.log(reg_user_id)
    // console.log(plan_price)
    db.query("SELECT distinct full_name,reflect_id,rep_lastname,email,mobile_number,tbl_user_registrations.reg_user_id as user_id,reflect_id,reflectid_by,rep_firstname,reflect_code,rep_emailid,entity_company_name,country_name,birthplace FROM `tbl_wallet_reflectid_rels` inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and user_as='verifier'",{ type:db.QueryTypes.SELECT}).then(async function(all_verifier_result) {
   

        // 

          

        if (all_verifier_result.length > 0) { 

            page_data=all_verifier_result
    
        }
    
        console.log('****************************')

        console.log('****************************',all_verifier_result)

    const verifier_list = paginate(page_data,page, perPage);
        console.log('****************************',verifier_list)
    res.render('admin-views/all-verifier-by-userid',{
        profile_pic,first_name,verifier_list,moment,reg_user_id
        // success_msg,
        // err_msg 
    // });
})});
}
/**manage-verifier get Method End*/

/**mange-verifier-by-reflectid get Method Start*/
exports.manage_verifier_by_reflectid_new= async (req,res,next)=>
{
    console.log(' -----------------------manage')

    // var user_status='block'
    var first_name = req.session.first_name;
    const reflect_id = req.query.id
    var profile_pic = req.session.profile_pic;

    // var reg_user_id=v_id.replace(/:/g,"");

    // var page = req.query.page || 1
    // var perPage = 10;
    // var page_data=[]
    console.log(reflect_id)

    // console.log(plan_price)
   
   
 
    db.query("SELECT *FROM `tbl_myreflectid_doc_rels` inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id inner join tbl_user_registrations on  tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id  LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE user_as='verifier' and tbl_myreflectid_doc_rels.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(all_verifier_result){

          for(var i=0;i<all_verifier_result.length;i++){

            var user_doc_id = all_verifier_result[i].user_doc_id;

          await  db.query("SELECT *FROM tbl_files_docs where user_doc_id="+user_doc_id,{ type:db.QueryTypes.SELECT}).then(async function(file_doc_result){

                if(file_doc_result.length>0){
                    // all_verifier_result[i].file_data = {"file_content":file_doc_result[i].file_content,"type":file_doc_result[i].type}
                    all_verifier_result[i].file_data = file_doc_result
                }else{
                    all_verifier_result[i].file_data = 'undefined'

                }
            })
          }

      
        console.log('****************************')
 
        console.log('****************************',all_verifier_result)
        res.render('admin-views/all-verifier-request',{
            profile_pic,first_name,verifier_list:all_verifier_result,moment
            // success_msg,
            // err_msg 
        });
    // const verifier_list = paginate(page_data,page, perPage);
  });



}
/**mange-verifier-by-reflectid get Method End*/

/**approve-request-verifier get Method Start*/
exports.approve_verifier_document=async (req,res,next )=> {
    var user_doc_id=req.query.id
    var reflect_id=req.query.reflect_id


    console.log("user_doc_id &&&&&&&&&&&&&&&&& reflect_id ",user_doc_id)
    console.log("reflect_id &&&&&&&&&&&&&&&&& reflect_id ",reflect_id)


    var updateValues= 
    {
        admin_status:'verified'
    }
    await DocumentReflectIdModel.update(updateValues, { where: { user_doc_id: user_doc_id } }).then((result) => 
    {
       

              // await   UserModel.findOne({where:{reg_user_id:reg_user_id}}).then(async user_data => {

          
             // console.log(notification)

                               
         
                                
 db.query("SELECT *FROM `tbl_myreflectid_doc_rels` inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id inner join tbl_user_registrations on  tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_files_docs on tbl_files_docs.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE user_as='verifier' and tbl_myreflectid_doc_rels.reflect_id="+reflect_id+" and tbl_files_docs.user_doc_id="+user_doc_id,{ type:db.QueryTypes.SELECT}).then(async function(all_verifier_result){

     console.log("all_verifier_result[0].full_name")
     console.log(all_verifier_result[0].full_name)

                         // console.log(all_verifier_all_verifier_result[0].email)
                           var msg = `Dear ${decrypt(all_verifier_result[0].full_name)}, Admin approved Your ${all_verifier_result[0].document_name} document  of this ${all_verifier_result[0].reflect_code} reflet code.`

                               await  NotificationModel.create({
                                                    notification_msg:msg,
                                                    sender_id:'1',
                                                    receiver_id:all_verifier_result[0].reg_user_id,
                                                    notification_type:'8',
                                                    notification_date:new Date()
                                        }).then(async(notification) =>{

                          var smtpTransport = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                  user: 'info.myreflet@gmail.com',
                                  pass: 'myquest321'
                                }
                              });
                              const mailOptions = {
                                to: decrypt(all_verifier_result[0].email),
                                from: 'questtestmail@gmail.com',
                                subject: "MyReflet Admin Approved Verifier.",
                          
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
                                        <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(all_verifier_result[0].full_name)}</h4>
                                        <p>Congratulation! Your ${all_verifier_result[0].document_name} document  of this ${all_verifier_result[0].reflect_code} reflet code is approved. Now you are verifier.</p>
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
                               
                               console.log('Approved ')
                                    req.flash('success_msg', 'Document approve successfully!');

                                    res.redirect('/verifier-list')
                              });
                   
                          })
         })
    })

}
/**approve-request-verifier get Method End*/

/**reject-request-verifier post Method Start*/
exports.reject_verifier_document=async (req,res,next )=> {
    var user_doc_id=req.body.user_doc_id
    var admin_reason=req.body.reason
    var reflect_id=req.body.reflect_id


    console.log("reject &&&&&&&&&&&&&&&&& reflect_id ",user_doc_id)
    console.log("reject &&&&&&&&&&&&&&&&& reflect_id ",reflect_id)


    var updateValues= 
    {
        admin_reason:admin_reason,
        admin_status:'none'
    }
    await DocumentReflectIdModel.update(updateValues, { where: { user_doc_id: user_doc_id } }).then((result) => 
    {

             res.redirect('/verifier-list')
             db.query("SELECT *FROM `tbl_myreflectid_doc_rels` inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id inner join tbl_user_registrations on  tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_files_docs on tbl_files_docs.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE user_as='verifier' and tbl_myreflectid_doc_rels.reflect_id="+reflect_id+" and tbl_files_docs.user_doc_id="+user_doc_id,{ type:db.QueryTypes.SELECT}).then(async function(all_verifier_result){

     console.log("all_verifier_result.full_name")
     console.log(all_verifier_result[0].full_name)

                         console.log(all_verifier_result[0].full_name)
                          var smtpTransport = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: 'info.myreflet@gmail.com',
                                    pass: 'myquest321'
                                }
                              });
                              const mailOptions = {
                                to: decrypt(all_verifier_result[0].email),
                                from: 'questtestmail@gmail.com',
                                subject: "MyReflet Admin Rejected Verifier.",
                          
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
                                        <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(all_verifier_result[0].full_name)}</h4>
                                        <p>Sorry! Your ${all_verifier_result[0].document_name} document  of this ${all_verifier_result[0].reflect_code} reflet code is rejected. Because ${admin_reason}.</p>
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
                               
                               console.log('rejected ')
                            req.flash('err_msg', 'Document reject successfully!');

                                    res.redirect('/verifier-list')
                              });

         })

         
    })

}
/**reject-request-verifier post Method Start*/

/**show-client-by-status post Method Start*/
exports.show_client_by_status = (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    var option=req.body.option_value
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

    var status_value;

    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
    console.log(option)

    
    if(option==1)
    {
        status_value='active';

    }
    else if(option==2)
    {
        status_value='inactive';

    }
    else if(option==3){
        status_value='block';

    }
    else
     {
       status_value='all' 
     }
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
    console.log(status_value)

      if(status_value==="all")
      {
        db.query("SELECT user_id,status,birthplace,full_name,dob,email,numReflect FROM tbl_user_registrations u INNER JOIN ( SELECT reg_user_id as user_id, count(reflect_id) as numReflect FROM tbl_wallet_reflectid_rels WHERE reflectid_by!='digitalWallet' and  user_as='client' GROUP BY tbl_wallet_reflectid_rels.reg_user_id ) as r ON r.user_id = u.reg_user_id  ORDER BY r.numReflect DESC",{ type:db.QueryTypes.SELECT}).then(function(count_verifier_result){
     
            if (count_verifier_result.length > 0) {
    
                page_data=count_verifier_result
        
            }
        
        
        
        console.log('count_verifier_result : ',count_verifier_result)
        const count_verifier_list = paginate(page_data,page, perPage);
        // var obj=
        // {
        //     moment:moment,
        //     count_verifier_result:count_verifier_result
    
        // }
        res.send(count_verifier_result)
        })
      }
      else
      {
    db.query("SELECT user_id,status,birthplace,full_name,dob,email,numReflect FROM tbl_user_registrations u INNER JOIN ( SELECT reg_user_id as user_id, count(reflect_id) as numReflect FROM tbl_wallet_reflectid_rels WHERE reflectid_by!='digitalWallet' and user_as='client' GROUP BY tbl_wallet_reflectid_rels.reg_user_id ) as r ON r.user_id = u.reg_user_id where status='"+status_value+"' ORDER BY r.numReflect DESC",{ type:db.QueryTypes.SELECT}).then(function(count_verifier_result){
     
        if (count_verifier_result.length > 0) {

            page_data=count_verifier_result
    
        }
    
    
    
    console.log('count_verifier_result : ',count_verifier_result)
    const count_verifier_list = paginate(page_data,page, perPage);
    // var obj=
    // {
    //     moment:moment,
    //     count_verifier_result:count_verifier_result

    // }
    res.send(count_verifier_result)
  
});
}
    // res.render('admin-views/verifier-list',{profile_pic,first_name,count_verifier_list
        // success_msg,
        // err_msg
    // })

}
/**show-client-by-status post Method End**/

/**delete-client get Method Start**/
exports.delete_client= async (req,res,next)=>
{
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    const v_id = req.params.id
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');

    var reg_user_id=v_id.replace(/:/g,"");
    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')

    console.log(reg_user_id)

    var updateValues=
    {
        deleted_at:formatted,
        deleted:'1'
    }
    await UserModel.update(updateValues, { where: { reg_user_id: reg_user_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully deleted !');
            res.redirect('/client-list');
         
    })

}
/**delete-client get Method End**/

/**block-client get Method Start**/
exports.block_client= async (req,res,next)=>
{
    var user_status='block'

    const v_id = req.params.id
    var user_id=v_id.replace(/:/g,"");

    console.log(user_id)

    console.log(user_status)
    // console.log(plan_price)

    var updateValues=
    {
        reg_user_id:user_id,
        status:user_status
    }
    await UserModel.update(updateValues, { where: { reg_user_id: user_id } }).then((result) => 
    {
        console.log(result)

            res.redirect('/client-list');
         
    })


}
/**block-client get Method End**/

/**manage-client get Method Start**/
exports.manage_client= async (req,res,next)=>
{
    console.log(' -----------------------          console.log(reg_user_id)    ')

    // var user_status='block'
    var first_name = req.session.first_name; 
    // const reflect_id = req.body.reflect_id
    const reg_user_id = req.query.id

    // var reg_user_id=v_id.replace(/:/g,"");
    var profile_pic = req.session.profile_pic;
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    // console.log(reflect_id)

    console.log(reg_user_id)
    // console.log(plan_price)
    db.query("SELECT distinct full_name,reflect_id,rep_lastname,email,mobile_number,tbl_user_registrations.reg_user_id as user_id,reflect_id,reflectid_by,rep_firstname,reflect_code,rep_emailid,entity_company_name,country_name,birthplace FROM `tbl_wallet_reflectid_rels` inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and reflectid_by!='digitalWallet' and user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(all_verifier_result) {
   

        // 

          

        if (all_verifier_result.length > 0) { 

            page_data=all_verifier_result
    
        }
    
        console.log('****************************')

        console.log('****************************',all_verifier_result)

    const verifier_list = paginate(page_data,page, perPage);
    res.render('admin-views/all-client-by-userid',{
        profile_pic,first_name,verifier_list,moment
        // success_msg,
        // err_msg 
    // });
})});
}
/**manage-client get Method End**/

/**mange-client-by-reflectid get Method Start**/
exports.manage_client_by_reflectid_new= async (req,res,next)=>
{
    console.log(' -----------------------manage')

    // var user_status='block'
    var first_name = req.session.first_name;
    const reflect_id = req.query.id
    var profile_pic = req.session.profile_pic;

    // var reg_user_id=v_id.replace(/:/g,"");

    // var page = req.query.page || 1
    // var perPage = 10;
    // var page_data=[]
    console.log(reflect_id)

    // console.log(plan_price)
   
   

    db.query("SELECT *FROM `tbl_myreflectid_doc_rels` inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_files_docs on tbl_files_docs.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE reflectid_by!='digitalWallet' and user_as='client'  and tbl_myreflectid_doc_rels.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(all_verifier_result){

          

      
        console.log('****************************')
 
        console.log('****************************',all_verifier_result)
        res.render('admin-views/all-client-request',{
            profile_pic,first_name,verifier_list:all_verifier_result,moment
            // success_msg,
            // err_msg 
        });
    // const verifier_list = paginate(page_data,page, perPage);
  });


 
}
/**mange-client-by-reflectid get Method End**/

/**approve-request-client get Method Start**/
exports.approve_client_document=async (req,res,next )=> {
    var user_doc_id=req.query.id


    console.log("reject &&&&&&&&&&&&&&&&& reflect_id ",user_doc_id)


    var updateValues= 
    {
        admin_status:'verified'
    }
    await DocumentReflectIdModel.update(updateValues, { where: { user_doc_id: user_doc_id } }).then((result) => 
    {
        console.log(result)

        req.flash('success_msg', 'Document approve successfully!');

             res.redirect('/client-list')           
         
    })

}
/**approve-request-client get Method End**/

/**reject-request-client post Method Start**/
exports.reject_client_document=async (req,res,next )=> {
    var user_doc_id=req.body.reflect_id
    var admin_reason=req.body.reason


    console.log("reject &&&&&&&&&&&&&&&&& reflect_id ",user_doc_id)
    console.log("reject &&&&&&&&&&&&&&&&& reflect_id ",admin_reason)


    var updateValues= 
    {
        admin_reason:admin_reason,
        admin_status:'none'
    }
    await DocumentReflectIdModel.update(updateValues, { where: { user_doc_id: user_doc_id } }).then((result) => 
    {
        req.flash('err_msg', 'Document reject successfully!');

             res.redirect('/client-list')
         
    })

}
/**reject-request-client post Method End**/


/**plan-list get Method Start**/
exports.plan_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    // await tbl_verifier_plan_master.findAll({ where:{deleted:'0'} }).then(function(plan_list_result) {
    //   console.log(plan_list)
    db.query("SELECT distinct plan_name FROM `tbl_verifier_plan_masters` WHERE deleted='0' order by plan_id DESC",{ type:db.QueryTypes.SELECT}).then(function(plan_name){


                     db.query("SELECT * FROM `tbl_verifier_plan_masters` WHERE deleted='0' order by plan_id DESC",{ type:db.QueryTypes.SELECT}).then(function(plan_list_result){
 
   
        
    if (plan_list_result.length > 0) {

        page_data=plan_list_result

    }



 
const plan_list = paginate(page_data,page, perPage);

// console.log('Paginate **********  : ',features_list)
    res.render('admin-views/plan-list',{
        plan_list,moment,profile_pic,first_name,plan_name,

        success_msg,
        err_msg
         });
    });
}); 
} 
/**plan-list get Method End**/

/**add-plan post Method Start**/
exports.add_plan =async (req,res,next )=> {
    var plan_name=req.body.plan_name
    var plan_price=req.body.plan_price
   
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    console.log(plan_name)
    console.log(plan_price)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

  await  tbl_verifier_plan_master.create({plan_name:plan_name,plan_price:plan_price,createdAt:formatted,updatedAt:formatted}).then(async plan_data =>{

        var plan_id=plan_data.plan_id


        await PlanFeatures.findAll({deleted:'0'}).then(async feature_data =>{
            console.log('feature_data :::: ',feature_data)
            for(var i=0;i<feature_data.length;i++)
            {
                var feature_id=feature_data[i].plan_feature_id

                   console.log(feature_id)
    
                await PlanFeatureRel.create({plan_id:plan_id,feature_id:feature_id,createdAt:formatted,updatedAt:formatted}).then(feature_rel =>{
                    console.log(feature_rel)
                    // err_msg
                });
            }
        })

        console.log(plan_data)
        req.flash('success_msg', 'Your Entry successfully added!');

       res.redirect('/plan-list')
        // err_msg
    });
}
/**add-plan post Method End**/


/**delete-plan get Method Start**/
exports.delete_plan= async (req,res,next)=>
{
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    const p_id = req.params.id
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');

    var plan_id=p_id.replace(/:/g,"");

    console.log(plan_id)
    var updateValues=
    {
        deleted_at:formatted,
        deleted:'1'
    }
    await tbl_verifier_plan_master.update(updateValues, { where: { plan_id: plan_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully deleted!');
            res.redirect('/plan-list');
         
    })

}
/**delete-plan get Method End**/

/**edit-plan post Method Start**/
exports.edit_plan =async (req,res,next )=> {
    var plan_id=req.body.plan_id

    var plan_name=req.body.plan_name
    var plan_price=req.body.plan_price
     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    console.log(plan_id)

    console.log(plan_name)
    console.log(plan_price)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var updateValues=
    {
        plan_name:plan_name,
        plan_price:plan_price,
        updatedAt:formatted,
    }
    await tbl_verifier_plan_master.update(updateValues, { where: { plan_id: plan_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully updated !');

            res.redirect('/plan-list');
         
    })

}
/**edit-plan post Method End**/

/**change-status-plan post Method Start**/
exports.change_plan =async (req,res,next )=> {
    var plan_id=req.body.plan_id
    var plan_status=req.body.status

    console.log(plan_id)

    console.log(plan_status)
    // console.log(plan_price)

    var updateValues=
    {
        plan_id:plan_id,
        status:plan_status
    }
    await tbl_verifier_plan_master.update(updateValues, { where: { plan_id: plan_id } }).then((result) => 
    {
       
            res.redirect('/plan-list');
         
    })

}
/**change-status-plan post Method End**/

/**security-questions-list get Method Start**/
exports.security_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id; 
  
     var document_data_list=[];

        var page = req.query.page || 1 
        var perPage = 10;
        var page_data=[]
    // await SecurityMasterModel.findAll({ where:{deleted:'0'} }).then(function(question_list_result) {
        db.query("SELECT * FROM `tbl_security_questions` WHERE deleted='0' order by question_id DESC",{ type:db.QueryTypes.SELECT}).then(function(question_list_result){
    if (question_list_result.length > 0) {

        page_data=question_list_result

    }


 

const question_list = paginate(page_data,page, perPage);

// console.log('Paginate **********  : ',features_list)
    res.render('admin-views/security-questions-list',{
        question_list,moment,profile_pic,first_name

        // success_msg,
        // err_msg
    });
}); 
} 
/**security-questions-list get Method End**/

/**add-question post Method Start**/
exports.add_question = (req,res,next )=> {
    var question=req.body.question_name
   
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;


    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    SecurityMasterModel.create({question:question,createdAt:formatted,updatedAt:formatted}).then(question_data =>{
        // console.log(question_data)
        req.flash('success_msg', 'Your Entry successfully added!');

       res.redirect('/security-questions-list')
        // err_msg
    });
}
/**add-question post Method End**/

/**delete-question get Method Start**/
exports.delete_question= async (req,res,next)=>
{
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    const q_id = req.params.id
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');

    var question_id=q_id.replace(/:/g,"");

    // console.log(question_id)
    var updateValues=
    {
        deleted_at:formatted,
        deleted:'1'
    }
    await SecurityMasterModel.update(updateValues, { where: { question_id: question_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully deleted !');
            res.redirect('/security-questions-list');
         
    })

}
/**delete-question get Method End**/

/**edit-question post Method Start**/
exports.edit_question =async (req,res,next )=> {
    var question_id=req.body.question_id

    var question_name=req.body.question_name
    // var plan_price=req.body.plan_price
     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    console.log(question_id)

    console.log(question_name)
    // console.log(plan_price)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var updateValues=
    {
        question:question_name,
        updatedAt:formatted,
    }
    await SecurityMasterModel.update(updateValues, { where: { question_id: question_id } }).then((result) => 
    {

            req.flash('success', 'Your Entry successfully updated !');
            res.redirect('/security-questions-list');
         
    })

}
/**edit-question post Method End**/

/**change-status-question Method Start**/
exports.change_question =async (req,res,next )=> {
    var question_id=req.body.question_id
    var question_status=req.body.status

    // console.log(plan_id)

    // console.log(plan_status)
    // console.log(plan_price)

    var updateValues=
    {
        question_id:question_id,
        status:question_status
    }
    await SecurityMasterModel.update(updateValues, { where: { question_id: question_id } }).then((result) => 
    {
        console.log(result)

             console.log(result)
             res.redirect('/security-questions-list');
         
    })

}
/**change-status-question Method End**/


/**document-master-list get Method Start**/
exports.document_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
   db.query("SELECT distinct document_name,doc_id FROM `tbl_documents_masters` WHERE deleted='0' order by doc_id DESC",{ type:db.QueryTypes.SELECT}).then(function(document_name_data){

                db.query("SELECT * FROM `tbl_documents_masters` WHERE deleted='0' order by doc_id DESC",{ type:db.QueryTypes.SELECT}).then(function(document_list_result){

    if (document_list_result.length > 0) {

        page_data=document_list_result

    }

// console.log(' db hello : ',page_data)



const document_list = paginate(page_data,page, perPage);

// console.log('Paginate **********  : ',features_list)
    res.render('admin-views/document-list',{
        document_list,moment,profile_pic,first_name,document_name_data,

        success_msg,
        err_msg 

         });
    });
}); 
} 
/**document-master-list get Method End**/

/**add-document-type post Method Start**/
exports.add_document = (req,res,next )=> {
    var document_name=req.body.document_name
   
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    // console.log(plan_name)
    // console.log(plan_price)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    DocumentMasterModel.create({document_name:document_name,createdAt:formatted,updatedAt:formatted}).then(plan_data =>{
        req.flash('success_msg', 'Your Entry successfully added!');
        res.redirect('/document-master-list')
        // err_msg
    });
}
/**add-document-type post Method End**/

/**edit-document-type post Method Start**/
exports.edit_document= async (req,res,next)=>
{
    var doc_id=req.body.doc_id

    var document_name=req.body.document_name
    // var plan_price=req.body.plan_price
     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    // console.log(question_id)

    // console.log(question_name)
    // console.log(plan_price)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
      
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var updateValues=
    {
        document_name:document_name,
        updatedAt:formatted,
    }
    await DocumentMasterModel.update(updateValues, { where: { doc_id: doc_id } }).then((result) => 
    {

        req.flash('success_msg', 'Your Entry successfully updated!');
        res.redirect('/document-master-list')
         
    })
}
/**edit-document-type post Method Start**/

/**delete-document get Method Start**/
exports.delete_document= async (req,res,next)=>
{
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    const d_id = req.params.id
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');

    var doc_id=d_id.replace(/:/g,"");

    // console.log(question_id)
    var updateValues=
    {
        deleted_at:formatted,
        deleted:'1'
    }
    await DocumentMasterModel.update(updateValues, { where: { doc_id: doc_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully deleted !');
            res.redirect('/document-master-list')
         
    })

}
/**delete-document get Method End**/

/**change-status-document post Method Start**/
exports.change_document =async (req,res,next )=> {
    var doc_id=req.body.doc_id
    var doc_status=req.body.status

    // console.log(plan_price)

    var updateValues= 
    {
        doc_id:doc_id,
        status:doc_status
    }
    await DocumentMasterModel.update(updateValues, { where: { doc_id: doc_id } }).then((result) => 
    {
     
             res.redirect('/document-master-list')
         
    })

}
/**change-status-document post Method End**/


/**verifier-category-list Get Method Start**/
exports.category_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;
   

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
 db.query("SELECT DISTINCT category_name FROM `tbl_verifier_category_masters` WHERE deleted='0' order by category_id DESC",{ type:db.QueryTypes.SELECT}).then(function(category_name_data){

         db.query("SELECT * FROM `tbl_verifier_category_masters` WHERE deleted='0' order by category_id DESC",{ type:db.QueryTypes.SELECT}).then(function(category_list_result){

                    if (category_list_result.length > 0) {

                        page_data=category_list_result

                    }

// console.log(' db hello : ',page_data)



const category_list = paginate(page_data,page, perPage);

// console.log('Paginate **********  : ',features_list)
    res.render('admin-views/category-list',{
        category_list,moment,profile_pic,first_name,category_name_data,
 
        success_msg,
        err_msg 
         });
    }); 
}); 
} 
/**add-category-type Get Method End**/

/**add-category-type Post Method Start**/
exports.add_category = (req,res,next )=> {
    var category_name=req.body.category_name
   
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    // console.log(plan_name)
    // console.log(plan_price)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    VerifierCategoryMasterModel.create({category_name:category_name,createdAt:formatted,updatedAt:formatted}).then(plan_data =>{
        req.flash('success_msg', 'Your Entry successfully added!');
        res.redirect('/verifier-category-list')
        // err_msg
    });
}
/**add-category-type Post Method End**/

/**edit-category Post Method Start**/
exports.edit_category= async (req,res,next)=>
{
    var category_id=req.body.category_id

    var category_name=req.body.category_name
    // var plan_price=req.body.plan_price
     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    // console.log(question_id)

    // console.log(question_name)
    // console.log(plan_price)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
      
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var updateValues=
    {
        category_name:category_name,
        updatedAt:formatted,
    }
    await VerifierCategoryMasterModel.update(updateValues, { where: { category_id: category_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully updated !');
            res.redirect('/verifier-category-list')
         
    })
}
/**edit-category Post Method End**/

/**delete-category Get Method Start**/
exports.delete_category= async (req,res,next)=>
{
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    const c_id = req.params.id
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');

    var category_id=c_id.replace(/:/g,"");

    // console.log(question_id)
    var updateValues=
    {
        deleted_at:formatted,
        deleted:'1'
    }
    await VerifierCategoryMasterModel.update(updateValues, { where: { category_id: category_id } }).then((result) => 
    {

            req.flash('success', 'Your Entry successfully deleted !');
            res.redirect('/verifier-category-list')
         
    })

}
/**delete-category Get Method End**/

/**change-status-category Get Method Start**/
exports.change_category_status =async (req,res,next )=> {
    var category_id=req.body.category_id
    var category_status=req.body.status

    // console.log(plan_price)

    var updateValues= 
    {
        category_id:category_id,
        status:category_status
    }
    await VerifierCategoryMasterModel.update(updateValues, { where: { category_id: category_id } }).then((result) => 
    {
      
        res.redirect('/verifier-category-list')
         
    })

}
/**change-status-category Get Method End**/



/**plan-features-list Get Method Start**/
exports.plan_features_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg'); 
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

   
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    
        db.query("SELECT * FROM `tbl_plan_features` WHERE deleted='0' order by plan_feature_id DESC",{ type:db.QueryTypes.SELECT}).then(function(features_list_result){

                    db.query("SELECT distinct feature_name FROM `tbl_plan_features` WHERE deleted='0' order by plan_feature_id DESC",{ type:db.QueryTypes.SELECT}).then(function(feature_name){

                            if (features_list_result.length > 0) {

                                page_data=features_list_result
                     
                            }

    // console.log(' db hello : ',page_data)



    const features_list = paginate(page_data,page, perPage);

    // console.log('Paginate **********  : ',features_list)

        res.render('admin-views/plan-features-list',{
        features_list,moment,profile_pic,first_name,feature_name,
 
        success_msg,
        err_msg 

       });
    })
});  
} 
/**plan-features-list Get Method End**/

/**add-plan-feature Post Method Start**/
exports.add_plan_feature =async (req,res,next )=> {
    var feature_name=req.body.feature_name 
    
    var plan_id=req.body.plan_id

    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    var feature_id=req.body.feature_id
    console.log('************ add_plan_feature ***********')

    console.log(plan_id)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

   await PlanFeatures.create({feature_name:feature_name,createdAt:formatted,updatedAt:formatted}).then(plan_data =>{
    tbl_verifier_plan_master.findAll({ where:{deleted:'0'} }).then(function(plan_list) {

    var feature_id=plan_data.plan_feature_id


        for(var i=0;i<plan_list.length;i++)
        {
            var plan_id=plan_list[i].plan_id
               console.log(plan_id)

            PlanFeatureRel.create({plan_id:plan_id,feature_id:feature_id,createdAt:formatted,updatedAt:formatted}).then(feature_rel =>{
                console.log(feature_rel)
                // err_msg
            });
        }
        req.flash('success_msg', 'Your Entry successfully added!');

        res.redirect('/plan-features-list')
 
      });})
}
/**add-plan-feature Post Method End**/

/**edit-plan-feature Post Method Start**/
exports.edit_plan_feature= async (req,res,next)=>
{
    var plan_feature_id=req.body.plan_feature_id
 
    var feature_name=req.body.feature_name
    // var plan_price=req.body.plan_price
     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name; 

    // console.log(question_id)

    // console.log(question_name)
    // console.log(plan_price)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
      
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var updateValues=
    {
        feature_name:feature_name,
        updatedAt:formatted,
    }
    await PlanFeatures.update(updateValues, { where: { plan_feature_id: plan_feature_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully updated !');
            res.redirect('/plan-features-list')
         
    })
}
/**edit-plan-feature Post Method End**/

/**delete-plan-feature get Method Start**/
exports.delete_plan_feature= async (req,res,next)=>
{
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    const f_id = req.params.id
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');

    var plan_feature_id=f_id.replace(/:/g,"");

    // console.log(question_id)
    var updateValues=
    {
        deleted_at:formatted,
        deleted:'1'
    }
    await PlanFeatures.update(updateValues, { where: { plan_feature_id: plan_feature_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully deleted !');
            res.redirect('/plan-features-list')
         
    })

}
/**delete-plan-feature get Method End**/

/**change-status-plan-feature post Method Start**/
exports.change_plan_feature =async (req,res,next )=> {
    var plan_feature_id=req.body.plan_feature_id
    var feature_status=req.body.status

    console.log(plan_feature_id)

    var updateValues= 
    {
        plan_feature_id:plan_feature_id,
        status:feature_status
    }
    await PlanFeatures.update(updateValues, { where: { plan_feature_id: plan_feature_id } }).then((result) => 
    {
       
             res.redirect('/plan-features-list')
         
    })

} 
/**change-status-plan-feature post Method End**/

/**plan-features-rel-list get Method Start**/
exports.plan_feature_rel = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg'); 
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

   
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    //   console.log(plan_list) 
    db.query("SELECT feature_rel_id,plan_name,feature_name,tbl_plan_feature_rels.feature_status as status,tbl_plan_feature_rels.createdAt as created_at FROM tbl_plan_feature_rels INNER JOIN tbl_plan_features ON tbl_plan_feature_rels.feature_id=tbl_plan_features.plan_feature_id inner join tbl_verifier_plan_masters on tbl_plan_feature_rels.plan_id=tbl_verifier_plan_masters.plan_id WHERE tbl_plan_features.deleted='0' and tbl_verifier_plan_masters.deleted='0'",{ type:db.QueryTypes.SELECT}).then(function(features_list_result){

            
             db.query("SELECT distinct plan_name FROM `tbl_verifier_plan_masters` WHERE deleted='0' order by  plan_id DESC",{ type:db.QueryTypes.SELECT}).then(function(plan_name){

                  db.query("SELECT distinct feature_name FROM `tbl_plan_features` WHERE deleted='0' order by plan_feature_id DESC",{ type:db.QueryTypes.SELECT}).then(function(feature_name){

                            if (features_list_result.length > 0) {

                                page_data=features_list_result
                     
                            }




                        const features_list = paginate(page_data,page, perPage);

                        console.log('Paginate **********  : ',features_list)

                         res.render('admin-views/plan-features-rel-list',{
                            features_list,moment,profile_pic,first_name,
                     
                            success_msg,feature_name,plan_name,
                            err_msg  
                        })
            })
    });
});  
}
/**plan-features-rel-list get Method End**/

/**change-status-plan-feature-rel post Method Start**/
exports.change_status_plan_feature_rel=async (req,res,next )=> {
    var feature_rel_id=req.body.feature_rel_id
    var feature_status=req.body.status

    console.log("feature_rel_id &&&&&&&&&&&&&&&&&")

    console.log(feature_rel_id)

    var updateValues= 
    {
        feature_rel_id:feature_rel_id,
        feature_status:feature_status
    }
    await PlanFeatureRel.update(updateValues, { where: { feature_rel_id: feature_rel_id } }).then((result) => 
    {
        console.log(result)

             console.log(result)
             res.redirect('/plan-features-rel-list')
         
    })

}
/**change-status-plan-feature-rel post Method End**/

/**user-list get Method Start**/
exports.user_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg'); 
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

   
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    
        db.query("SELECT * FROM `tbl_user_registrations` order by reg_user_id DESC",{ type:db.QueryTypes.SELECT}).then(function(user_list_result){
          if (user_list_result.length > 0) {
    
                page_data=user_list_result
     
            }


    const user_list = paginate(page_data,page, perPage);

    // console.log('Paginate **********  : ',features_list)

    res.render('admin-views/user-list',{
        user_list,moment,profile_pic,first_name

    // success_msg,
    // err_msg 
})
});  
}


    exports.filter_user_list = async (req,res,next )=> {

        var profile_pic = req.session.profile_pic;
        var first_name = req.session.first_name;
        success_msg = req.flash('success_msg'); 
        err_msg = req.flash('err_msg');
        var admin_id = req.session.admin_id;
        var name = req.body.name
        // var status = req.body.status
        var page = req.query.page || 1
        var perPage = 10;
        var page_data=[]
        
            db.query('SELECT * FROM tbl_user_registrations WHERE status="'+name+'" OR  full_name="'+name+'" order by reg_user_id DESC',{ type:db.QueryTypes.SELECT}).then(function(user_list ){
            // if (user_list_result.length > 0) {
    
            //     page_data=user_list_result
     
            // }


    // const user_list = paginate(page_data,page, perPage);

    // console.log('Paginate **********  : ',features_list)

        res.render('admin-views/ajax_user',{
            user_list,moment,profile_pic,first_name
 
        // success_msg,
        // err_msg 
    })
});  
}
/**user-list get Method End**/

/**change-status-user post Method Start**/
exports.change_status_user=async (req,res,next )=> {
    var reg_user_id=req.body.reg_user_id
    var user_status=req.body.status

    console.log("feature_rel_id &&&&&&&&&&&&&&&&&")

    console.log(reg_user_id)
    console.log(user_status)

    var updateValues= 
    {
        reg_user_id:reg_user_id,
        status:user_status
    }
    await UserModel.update(updateValues, { where:{reg_user_id:reg_user_id } }).then((result) => 
    {

    db.query("SELECT * FROM `tbl_user_registrations` where reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(function(user_list_result){

     console.log("user_list_result[0].full_name")
     console.log(user_list_result[0].full_name)

                         console.log(user_list_result[0].email)
                          var smtpTransport = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: 'info.myreflet@gmail.com',
                                    pass: 'myquest321'
                                }
                              });
                              const mailOptions = {
                                to: decrypt(user_list_result[0].email),
                                from: 'questtestmail@gmail.com',
                                subject: "MyReflet Admin "+user_status+" User.",
                          
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
                                        <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${decrypt(user_list_result[0].full_name)}</h4>
                                        <p>Admin ${user_status} You.</p>
                                        <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                                        <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                                
                                       
                                      </div>
                                       <div style="background-color:  #88beda; color: #fff; padding: 20px 30px;">
                                         &copy; Copyright 2020 - My Reflet. All rights reserved.
                                        </div>
                                    </div>
                                  </body>
                                </html>  `
                                
                              };
                              smtpTransport.sendMail(mailOptions, function (err) {
                               
                               console.log('email sent ')

                                    // req.flash('success_msg', 'Document approve successfully!');

                                    res.redirect('/user-list')
                              });

         })
             

         
    })

}
/**change-status-user post Method End**/

/**country-list get Method Start**/
exports.country_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg'); 
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

   
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    
             db.query("SELECT * FROM `tbl_countries`",{ type:db.QueryTypes.SELECT}).then(function(country_name_data){
                        db.query("SELECT * FROM `tbl_countries`",{ type:db.QueryTypes.SELECT}).then(function(country_list_result){

        if (country_list_result.length > 0) {

            page_data=country_list_result
 
        }

    // console.log(' db hello : ',page_data)



    const country_list = paginate(page_data,page, perPage);

    // console.log('Paginate **********  : ',features_list)

        res.render('admin-views/country-list',{
            country_list,moment,profile_pic,first_name,country_name_data
 
        // success_msg,
        // err_msg 
      });
    })
});  
} 
/**country-list get Method End**/

/**change-status-country post Method Start**/
exports.change_status_country=async (req,res,next )=> {
    var country_id=req.body.country_id
    var country_status=req.body.status

    console.log("country_id &&&&&&&&&&&&&&&&&")

    console.log(country_id)

    var updateValues= 
    {
        country_id:country_id,
        status:country_status
    }
    await CountryModel.update(updateValues, { where: { country_id: country_id } }).then((result) => 
    {
        console.log(result)

             console.log(result)
             res.redirect('/country-list')
         
    })

}
/**change-status-country post Method End**/

/**verifier_on_boarding get Method Start**/
exports.verifier_on_boarding = (req,res,next )=> {

    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    res.render('admin-views/verifier_on_boarding',{profile_pic,first_name
        // success_msg,
        // err_msg
    });
}
/**verifier_on_boarding get Method End**/

/**admin-complaint-list get Method Start**/
exports.complaint_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg'); 
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

    console.log(' db hello : ',admin_id)

   
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    
        db.query("SELECT complain_id,rep_firstname,reflect_code,client_reflect_name,client_reflect_code,complain_message,complaint_status,tbl_complaints.createdAt as created_at FROM `tbl_complaints` inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_complaints.reflect_id order by complain_id DESC",{ type:db.QueryTypes.SELECT}).then(function(complaint_list_result){
        if (complaint_list_result.length > 0) {

            page_data=complaint_list_result
 
        }

    console.log(' db hello : ',page_data)



    const complaint_list = paginate(page_data,page, perPage);

    // console.log('Paginate **********  : ',features_list)

        res.render('admin-views/complaint-list',{
            complaint_list,moment,profile_pic,first_name
 
        // success_msg,
        // err_msg 
    })
});  
}
/**admin-complaint-list get Method End**/


/**market-place-list get Method Start**/
exports.market_place = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');  
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

   
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    
        db.query("SELECT * FROM `tbl_market_places` WHERE deleted='0' order by market_place_id DESC",{ type:db.QueryTypes.SELECT}).then(function(market_list_result){

            db.query("SELECT DISTINCT label FROM `tbl_market_places` WHERE deleted='0' order by market_place_id DESC",{ type:db.QueryTypes.SELECT}).then(function(label_name){

                    if (market_list_result.length > 0) {

                        page_data=market_list_result
              
                    }

    // console.log(' db hello : ',page_data)



                        const mp_list = paginate(page_data,page, perPage);

                       //console.log('Paginate **********  : ',mp_list)

                            res.render('admin-views/market-place',{
                                mp_list,moment,profile_pic,first_name,label_name,
                      
                            success_msg,
                            err_msg 
                          })
                            
                })
});  
} 
/**market-place-list get Method End**/

/**add-market-place post Method Start**/
exports.add_market_place =async (req,res,next )=> {
    console.log('************ add_plan_feature ***********')

    var label=req.body.label 
    var descriptions=req.body.descriptions 
    var icon = req.file.filename;


    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;



    //console.log('icon : ',icon)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

   await MarketPlace.create({label:label,descriptions:descriptions,icon:icon,createdAt:formatted,updatedAt:formatted}).then(mp_data =>{
   

     
    req.flash('success_msg', 'Your Entry successfully added!');
    // err_msg
                res.redirect('/market-place-list')
            });
     
}
/**add-market-place post Method End**/

/**Edit-market-place post Method Start**/
exports.edit_market_place= async (req,res,next)=>
{
    var mp_id=req.body.mp_id
     console.log('************ market place ***********')
    var label=req.body.label
    var descriptions=req.body.descriptions 
    var icon = req.file;

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name; 

    console.log(mp_id)
     console.log(descriptions)
     console.log(label)
     console.log(icon)

 var updateValues;
 if(icon===undefined)
{
 updateValues=
    {
        label:label,
        descriptions:descriptions,
        updatedAt:formatted,
        
    }
}
else
{
 updateValues=
    {
        label:label,
        descriptions:descriptions,
        icon:icon.filename,
        updatedAt:formatted,
        
    }
}
  
      
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

   
    await MarketPlace.update(updateValues, { where: { market_place_id: mp_id } }).then((result) => 
    {
     console.log(result)
            req.flash('success_msg', 'Your Entry successfully updated !');
            res.redirect('/market-place-list')
         
    })
}
/**Edit-market-place post Method End**/

/**delete-market-place get Method Start**/
exports.delete_market_place= async (req,res,next)=>
{
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    const mp_id = req.query.id
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');


    // console.log(question_id) 
    var updateValues=
    {
        deleted_at:formatted,
        deleted:'1'
    }
    await MarketPlace.update(updateValues, { where: { market_place_id: mp_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully deleted !');
            res.redirect('/market-place-list')
         
    })

}
/**delete-market-place get Method End**/

/**change-status-market-place post Method Start**/
exports.change_status_market_place =async (req,res,next )=> {
    var market_place_id=req.body.market_place_id
    var mp_status=req.body.status

    console.log(market_place_id)

    var updateValues= 
    {
        // mp_id:mp_id,
        status:mp_status
    }
    await MarketPlace.update(updateValues, { where: { market_place_id: market_place_id } }).then((result) => 
    {

             console.log(result)
             res.redirect('/market-place-list')
         
    })

} 
/**change-status-market-place post Method End**/


/**allot-reflect-list get Method Start**/
exports.allot_market_place = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg'); 
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

var reflect_code=[];
   
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    
        db.query("SELECT reflectid_by,rep_username,label,mp_reflect_id,tbl_market_place_reflectid_rels.createdAt as 'createdAt',tbl_market_place_reflectid_rels.status as 'status',icon FROM `tbl_market_place_reflectid_rels` inner join tbl_market_places on tbl_market_places.market_place_id=tbl_market_place_reflectid_rels.market_place_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_market_place_reflectid_rels.reflect_id order by mp_reflect_id desc",{ type:db.QueryTypes.SELECT}).then(async function(market_list_result){

            db.query("SELECT * FROM `tbl_wallet_reflectid_rels` WHERE user_as='verifier'",{ type:db.QueryTypes.SELECT}).then(async function(verifiers){
                    

             db.query("SELECT DISTINCT label FROM `tbl_market_place_reflectid_rels` inner join tbl_market_places on tbl_market_places.market_place_id=tbl_market_place_reflectid_rels.market_place_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_market_place_reflectid_rels.reflect_id order by mp_reflect_id desc",{ type:db.QueryTypes.SELECT}).then(async function(label_name){

                   for(var i=0;i<verifiers.length;i++){
                            await db.query('SELECT count(*) as total from tbl_myreflectid_doc_rels where reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_docs){
                                console.log("verifier_docs------------- ",verifier_docs)
                                await db.query('SELECT count(*) as verified from tbl_myreflectid_doc_rels where admin_status="verified" AND reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT}).then(function(verified_docs){
                                    console.log("verified_docs------------- ",verified_docs)
                                    if(verifier_docs[0].total==verified_docs[0].verified && verifier_docs[0].total != 0){
                                        reflect_code.push(verifiers[i]);
                                    }
                                })
                            })
                        }
                db.query("SELECT * FROM `tbl_market_places` WHERE deleted='0' order by market_place_id DESC",{ type:db.QueryTypes.SELECT}).then(function(market_list_data){

        if (market_list_result.length > 0) {

            page_data=market_list_result
  
        }

    // console.log(' db hello : ',page_data)



    const mp_list = paginate(page_data,page, perPage);

    // console.log('Paginate **********  : ',features_list)

        res.render('admin-views/allot-reflect-list',{
            mp_list,moment,profile_pic,first_name,reflect_code,market_list_data,label_name,
  
        success_msg,
        err_msg 
                    })
                })
            })
      })
  });  
} 
/**allot-reflect-list get Method End**/

/**post-allot-reflect-list post Method Start**/
exports.post_allot_market_place = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success'); 
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

    var mp_id=req.body.mp_id  

    var reflect_id_list=[]

    reflect_id_list=JSON.parse(req.body.reflect_id_list);

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    console.log('mp_list mp_id: ',mp_id)

    for(var i=0;i<reflect_id_list.length;i++)
    {
        console.log('mp_list : ',reflect_id_list[i])

    AllotMarketPlace.create({reflect_id:reflect_id_list[i],market_place_id:mp_id,created_at:formatted}).then(result=>{
            
        var data='true';
         db.query("SELECT * FROM `tbl_market_places` WHERE deleted='0' and market_place_id="+mp_id,{ type:db.QueryTypes.SELECT}).then(function(market_list_data){
                var reflect_id=result.reflect_id;
                    console.log('reflet_id : ',reflect_id)
             
 db.query("SELECT * FROM `tbl_user_registrations` inner join tbl_wallet_reflectid_rels on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id where reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(function(user_list_result){

     console.log("user_list_result[0].full_name")
     console.log(user_list_result[0].full_name)

                         console.log(user_list_result[0].email)
                          var smtpTransport = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                 user: 'info.myreflet@gmail.com',
                                  pass: 'myquest321'
                                }
                              });
                              const mailOptions = {
                                to: decrypt(user_list_result[0].email),
                                from: 'questtestmail@gmail.com',
                                subject: "MyReflet Admin Allocate MarketPlace.",
                          
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
                                        <h4 style="font-size: 20px; margin-bottom: 0;">Dear, ${decrypt(user_list_result[0].full_name)}</h4>
                                        <p>Admin allocated your  ${user_list_result[0].reflect_code} reflet code  in this  ${market_list_data[0].label} market place.</p>
                                        <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                                        <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                                
                                       
                                      </div>
                                       <div style="background-color:  #88beda; color: #fff; padding: 20px 30px;">
                                         &copy; Copyright 2020 - My Reflet. All rights reserved.
                                        </div>
                                    </div>
                                  </body>
                                </html>  `
                                
                              };
                              smtpTransport.sendMail(mailOptions, function (err) {
                               
                               console.log('email sent ')
                                    // req.flash('success_msg', 'Document approve successfully!');

                                    res.send(data)
                              });

         })})

        console.log('comment users : ',result)

    });  
}

    
} 
/**post-allot-reflect-list post Method End**/

/**change-status-allot-reflect-list post Method End**/
exports.change_status_allot_market_place =async (req,res,next )=> {
    var mp_reflect_id=req.body.mp_reflect_id
    var mp_status=req.body.status

    // console.log(market_place_id)

    var updateValues= 
    {
        // mp_id:mp_id,
        status:mp_status
    }
    await AllotMarketPlace.update(updateValues, { where: { mp_reflect_id: mp_reflect_id } }).then((result) => 
    {

             console.log(result)
             res.redirect('/allot-reflect-list')
         
    })

} 
/**change-status-allot-reflect-list post Method End**/

/**report-list get Method Start**/
exports.report_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id; 
  
     var document_data_list=[];

        var page = req.query.page || 1 
        var perPage = 10;
        var page_data=[]
    // await SecurityMasterModel.findAll({ where:{deleted:'0'} }).then(function(question_list_result) {
        db.query("SELECT * FROM `tbl_master_reports` WHERE deleted='0' order by report_id DESC",{ type:db.QueryTypes.SELECT}).then(function(report_list_result){
    if (report_list_result.length > 0) {

        page_data=report_list_result

    }


 

const report_list = paginate(page_data,page, perPage);

// console.log('Paginate **********  : ',features_list)
    res.render('admin-views/master-report',{
        report_list,moment,profile_pic,first_name,
        success_msg,
        // err_msg
    });
}); 
} 
/**repport-list get Method End**/

/**add-repport-list post Method Start**/
exports.add_report = (req,res,next )=> {
    console.log('ADD Report')
    var report_name=req.body.report_name
       var user_type=req.body.type
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
        console.log(user_type)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    ReportMasterModel.create({report_name:report_name,user_type:user_type,createdAt:formatted,updatedt:formatted}).then(report_data =>{
        console.log(report_data)
        req.flash('success_msg', 'Your Entry successfully added!');

       res.redirect('/master-report')
        // err_msg
    });
}
/**add-repport-list post Method End**/

/**delete-repport-list post Method Start**/
exports.delete_report= async (req,res,next)=>
{
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    const report_id = req.query.id
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');


    console.log('report_id :',report_id)
    var updateValues=
    {
        deleted_at:formatted,
        deleted:'1'
    }
    await ReportMasterModel.update(updateValues, { where: { report_id: report_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully deleted !');
            res.redirect('/master-report')
         
    })

}
/**delete-repport-list post Method End**/

/**Edit-repport-list post Method start**/
exports.edit_report =async (req,res,next )=> {
    var report_id=req.body.report_id

    var report_name=req.body.report_name
    // var plan_price=req.body.plan_price
     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    console.log(report_id)

    console.log(report_name)
    // console.log(plan_price)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var updateValues=
    {
        report_name:report_name,
        updatedAt:formatted,
    }
    await ReportMasterModel.update(updateValues, { where: { report_id: report_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully updated !');
            res.redirect('/master-report')
         
    })

}
/**Edit-repport-list post Method End**/

/**change-status-repport-list post Method Start**/
exports.change_status_report =async (req,res,next )=> {
    var report_id=req.body.report_id
    var status=req.body.status

    // console.log(plan_id)

    // console.log(plan_status)
    // console.log(plan_price)

    var updateValues=
    {
        report_id:report_id,
        status:status
    }
    await ReportMasterModel.update(updateValues, { where: { report_id: report_id } }).then((result) => 
    {
        console.log(result)

             
             res.redirect('/master-report')
         
    })

}
/**change-status-repport-list post Method End**/

/**change-status-user_type-repport-list post Method End**/
exports.change_status_report_user_type =async (req,res,next )=> {
    console.log('**********************************************8')
    var report_id=req.body.report_id
    var user_type=req.body.user_type

     console.log(report_id)

     console.log(user_type)
    // console.log(plan_price)

    var updateValues=
    {
        report_id:report_id,
        user_type:user_type
    }
    await ReportMasterModel.update(updateValues, { where: { report_id: report_id } }).then((result) => 
    {
        console.log(result)

            var data='true';
res.send(data)
         
    })

}
/**change-status-user_type-repport-list post Method End**/

/*
exports.edit_allot_market_place = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success'); 
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

    var mp_id=req.body.mp_id  



    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    console.log('mp_list : ',reflect_id_list)

   var updateValues=
    {
        reflect_id:reflect_id,
        market_place_id:mp_id,
        updatedAt:formatted,
        created_at:formatted,
    }

   await AllotMarketPlace..update(updateValues, { where: { plan_id: plan_id } }).then((result) => 
    {

        console.log('comment users : ',result)

    });  
}
    var data='true';

   res.send(data)
    
} */


exports.accredation_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id; 
    var accreditation_id = req.params.id; 

    //  var document_data_list=[];

        var page = req.query.page || 1 
        var perPage = 10;
        var page_data=[]

        if(accreditation_id==1)
        {
            db.query("SELECT * FROM `tbl_accreditation_masters` WHERE deleted='0' order by accreditation_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_master){
            
                db.query("SELECT * FROM `tbl_accreditation_features` WHERE deleted='0' order by acc_feature_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_features){ 
                    
                    db.query("SELECT * FROM `tbl_acc_features_rels` inner join tbl_accreditation_features on tbl_acc_features_rels.acc_feature_id=tbl_accreditation_features.acc_feature_id inner join tbl_accreditation_masters on tbl_acc_features_rels.accreditation_id=tbl_accreditation_masters.accreditation_id WHERE tbl_acc_features_rels.accreditation_id='1' and tbl_acc_features_rels.deleted='0' order by acc_rel_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_list_result){
                        
    
        if (accredation_list_result.length > 0) {
    
            page_data=accredation_list_result
    
        }
    const accredation_list= paginate(page_data,page, perPage);
    
    // console.log('Paginate **********  : ',features_list)
        res.render('admin-views/basic-accredation-level',{
            accredation_list,moment,profile_pic,first_name,accredation_master,accredation_features,
            success_msg,
            // err_msg
        });})})
    }); 
        }
        else if(accreditation_id==2)
        {  db.query("SELECT * FROM `tbl_accreditation_masters` WHERE deleted='0' order by accreditation_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_master){
            
            db.query("SELECT * FROM `tbl_accreditation_features` WHERE deleted='0' order by acc_feature_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_features){ 
                
                db.query("SELECT * FROM `tbl_acc_features_rels` inner join tbl_accreditation_features on tbl_acc_features_rels.acc_feature_id=tbl_accreditation_features.acc_feature_id inner join tbl_accreditation_masters on tbl_acc_features_rels.accreditation_id=tbl_accreditation_masters.accreditation_id WHERE tbl_acc_features_rels.accreditation_id='1' andtbl_acc_features_rels.deleted='0' order by acc_rel_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_list_result){
                    

    if (accredation_list_result.length > 0) {

        page_data=accredation_list_result

    }
const accredation_list= paginate(page_data,page, perPage);

// console.log('Paginate **********  : ',features_list)
    res.render('admin-views/verifier-accredation-level',{
        accredation_list,moment,profile_pic,first_name,accredation_master,accredation_features,
        success_msg,
        // err_msg
    });})})
}); 
        }
        else if(accreditation_id==3)
        {
            db.query("SELECT * FROM `tbl_accreditation_masters` WHERE deleted='0' order by accreditation_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_master){
            
                db.query("SELECT * FROM `tbl_accreditation_features` WHERE deleted='0' order by acc_feature_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_features){ 
                    
                    db.query("SELECT * FROM `tbl_acc_features_rels` inner join tbl_accreditation_features on tbl_acc_features_rels.acc_feature_id=tbl_accreditation_features.acc_feature_id inner join tbl_accreditation_masters on tbl_acc_features_rels.accreditation_id=tbl_accreditation_masters.accreditation_id WHERE tbl_acc_features_rels.accreditation_id='1' andtbl_acc_features_rels.deleted='0' order by acc_rel_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_list_result){
                        
    
        if (accredation_list_result.length > 0) {
    
            page_data=accredation_list_result
    
        }
    const accredation_list= paginate(page_data,page, perPage);
    
    // console.log('Paginate **********  : ',features_list)
        res.render('admin-views/validator-accredation-level',{
            accredation_list,moment,profile_pic,first_name,accredation_master,accredation_features,
            success_msg,
            // err_msg
        });})})
    }); 
        }
    // await SecurityMasterModel.findAll({ where:{deleted:'0'} }).then(function(question_list_result) {
      
} 
/**repport-list get Method End**/

/**add-repport-list post Method Start**/
exports.add_accredation = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success'); 
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

    var accreditation_id=req.body.accreditation_id  

    var feature_id_list=[]

    acc_feature_id_list=JSON.parse(req.body.feature_id_list);

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    console.log('mp_list : ',acc_feature_id_list)

    for(var i=0;i<acc_feature_id_list.length;i++)
    {
        console.log('mp_list : ',acc_feature_id_list[i])

       await AccreditaionFeatureRelModel.create({acc_feature_id:acc_feature_id_list[i],accreditation_id:accreditation_id,createdAt:formatted}).then(result=>{
            
    

        console.log('comment users : ',result)

    });  
}
    var data='true';

   res.send(data)
    
} 
/**add-repport-list post Method End**/

exports.get_features_list =async (req,res,next )=> {

 var accreditation_id=req.body.accreditation_id
    console.log('accreditation_id : ',accreditation_id)

    if(accreditation_id==1)
    {
        db.query("SELECT * FROM `tbl_accreditation_features` WHERE acc_type='client' and deleted='0' order by acc_feature_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_features){ 
            console.log('accreditation_id : ',accredation_features)

            res.render('admin-views/acrre_feature_ajax',{accredation_features });
        })
    }
    else if(accreditation_id==2)
    {
        db.query("SELECT * FROM `tbl_accreditation_features` WHERE acc_type='verifier' and deleted='0' order by acc_feature_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_features){ 
            console.log('accreditation_id : ',accredation_features)

            res.render('admin-views/acrre_feature_ajax',{accredation_features });
        })
    }
    else if(accreditation_id==3)
    {
        db.query("SELECT * FROM `tbl_accreditation_features` WHERE acc_type='validator' and deleted='0' order by acc_feature_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_features){ 
            console.log('accreditation_id : ',accredation_features)

            res.render('admin-views/acrre_feature_ajax',{accredation_features });
        })
    }
    // console.log(plan_status)
    // console.log(plan_price)

 

}
exports.basic_accredation_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    // var admin_id = req.session.admin_id; 
    // var accreditation_id = req.params.id; 

    //  var document_data_list=[];

        var page = req.query.page || 1 
        var perPage = 10;
        var page_data=[]

            // db.query("SELECT * FROM `tbl_accreditation_masters` WHERE deleted='0' order by accreditation_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_master){
            
            //     db.query("SELECT * FROM `tbl_accreditation_features` WHERE acc_type='client' and  deleted='0' order by acc_feature_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_features){ 
                
                    // db.query("SELECT * FROM `tbl_acc_features_rels` inner join tbl_accreditation_features on tbl_acc_features_rels.acc_feature_id=tbl_accreditation_features.acc_feature_id inner join tbl_accreditation_masters on tbl_acc_features_rels.accreditation_id=tbl_accreditation_masters.accreditation_id WHERE tbl_acc_features_rels.accreditation_id='1' and tbl_acc_features_rels.deleted='0' order by acc_rel_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_list_result){
                        
                        db.query('SELECT * FROM `tbl_accreditation_features` WHERE tbl_accreditation_features.acc_type="client"',{ type:db.QueryTypes.SELECT}).then(function(accredation_list_result){
        // if (accredation_list_result.length > 0) {
    
        //     page_data=accredation_list_result
    
        // }
    const accredation_list = paginate(accredation_list_result,page, perPage);
    
    // console.log('Paginate **********  : ',features_list)
        res.render('admin-views/basic-accredation-level',{
            accredation_list:accredation_list,
            moment,profile_pic,first_name,
            // accredation_master,
            // accredation_features,
            success_msg,
            // err_msg
        });
    // })
    // })
    }); 
        
       
     
    // await SecurityMasterModel.findAll({ where:{deleted:'0'} }).then(function(question_list_result) {
      
} 
exports.verifier_accredation_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    // var admin_id = req.session.admin_id; 
    // var accreditation_id = req.params.id; 

    //  var document_data_list=[];

        var page = req.query.page || 1 
        var perPage = 10;
        var page_data=[]

            // db.query("SELECT * FROM `tbl_accreditation_masters` WHERE deleted='0' order by accreditation_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_master){
            
            //     db.query("SELECT * FROM `tbl_accreditation_features` WHERE acc_type='verifier' and deleted='0' order by acc_feature_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_features){ 
                    
            //         db.query("SELECT * FROM `tbl_acc_features_rels` inner join tbl_accreditation_features on tbl_acc_features_rels.acc_feature_id=tbl_accreditation_features.acc_feature_id inner join tbl_accreditation_masters on tbl_acc_features_rels.accreditation_id=tbl_accreditation_masters.accreditation_id WHERE tbl_acc_features_rels.accreditation_id='2' and tbl_acc_features_rels.deleted='0' order by acc_rel_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_list_result){
                        
                        db.query('SELECT * FROM `tbl_accreditation_features` WHERE tbl_accreditation_features.acc_type="verifier" AND tbl_accreditation_features.deleted="0"',{ type:db.QueryTypes.SELECT}).then(function(accredation_features){ 
    
        // if (accredation_list_result.length > 0) {
    
        //     page_data=accredation_list_result
    
        // }
    const accredation_list= paginate(accredation_features,page, perPage);
    
    // console.log('Paginate **********  : ',features_list)
        res.render('admin-views/verifier-accredation-level',{
            accredation_list:accredation_list,moment,profile_pic,first_name,
            // accredation_master,accredation_features,
            success_msg,
            // err_msg
        // });})})
    })
    }); 
        
       
     
    // await SecurityMasterModel.findAll({ where:{deleted:'0'} }).then(function(question_list_result) {
      
} 
exports.validator_accredation_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id; 
    var accreditation_id = req.params.id; 

    //  var document_data_list=[];

        var page = req.query.page || 1 
        var perPage = 10;
        var page_data=[]

            // db.query("SELECT * FROM `tbl_accreditation_masters` WHERE deleted='0' order by accreditation_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_master){
            
            //     db.query("SELECT * FROM `tbl_accreditation_features` WHERE acc_type='validator' and deleted='0' order by acc_feature_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_features){ 
                    
            //         db.query("SELECT * FROM `tbl_acc_features_rels` inner join tbl_accreditation_features on tbl_acc_features_rels.acc_feature_id=tbl_accreditation_features.acc_feature_id inner join tbl_accreditation_masters on tbl_acc_features_rels.accreditation_id=tbl_accreditation_masters.accreditation_id WHERE tbl_acc_features_rels.accreditation_id='3' and tbl_acc_features_rels.deleted='0' order by acc_rel_id DESC",{ type:db.QueryTypes.SELECT}).then(function(accredation_list_result){
                        db.query('SELECT * FROM `tbl_accreditation_features` WHERE tbl_accreditation_features.acc_type="validator" AND tbl_accreditation_features.deleted="0"',{ type:db.QueryTypes.SELECT}).then(function(accredation_features){ 
    
        // if (accredation_list_result.length > 0) {
    
        //     page_data=accredation_list_result
    
        // }
    const accredation_list= paginate(accredation_features,page, perPage);
    
    // console.log('Paginate **********  : ',features_list)
        res.render('admin-views/validator-accredation-level',{
            accredation_list:accredation_list,moment,profile_pic,first_name,
            // accredation_master,accredation_features,
            // success_msg,
            // err_msg
        // });})})
    }); 
})  
       
     
    // await SecurityMasterModel.findAll({ where:{deleted:'0'} }).then(function(question_list_result) {
      
} 
// accredation
exports.accredatiation_level_list = async(req,res,next)=>{
    
   var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id; 
    var user_type=req.session.user_type;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    // var user_id=req.session.user_id;

    db.query('SELECT * FROM `tbl_accreditation_masters` WHERE accreditation_status="active" AND deleted="0"',{ type:db.QueryTypes.SELECT}).then((acc_levels)=>{

    db.query("SELECT * FROM `tbl_wallet_reflectid_rels` INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE  tbl_wallet_reflectid_rels.deleted='0'",{ type:db.QueryTypes.SELECT}).then(function(reflet_list){

        

        // db.query("SELECT * FROM tbl_report_filters where deleted='0' and archive='0' and reg_user_id="+reg_id+" and user_type='"+user_type+"' order by report_filter_id desc",{ type:db.QueryTypes.SELECT}).then(function(report_list_result){

          
    
        const reflet_id_data = paginate(reflet_list,page, perPage);
        res.render('admin-views/accredatiation-level-list',{ success_msg,
                                                            err_msg,
                                                            reflet_id_data,
                                                           session:req.session,
                                                            moment,
                                                            acc_levels,
                                                            profile_pic,
                                                            first_name
                                                          
                        });
    })
    
})
    }


exports.submit_acc_to_user = async(req,res,next)=>{
    console.log(".............submit_acc_to_user................")
 var acc_id=JSON.parse(req.body.acc_ids) 
 var reflect_ids=JSON.parse(req.body.reflect_ids) 
 console.log(acc_id)
 console.log(reflect_ids)
 var typeAcc;

 for(var i=0 ;i<acc_id.length ; i++){
      for(var j=0 ;j<reflect_ids.length; j++){
      await  AccreditatiRelModel.findOne({where:{user_reflect_id:reflect_ids[j],accreditation_id:acc_id[i],deleted:"0",acc_rel_status:"active"}}).then(async(findData)=>{
            // console.log("find data",reflect_ids[j])
            if(acc_id[i]=="1"){
                typeAcc="client"
             }
             if(acc_id[i]=="2"){
                console.log("acc_id[i]eacc_type",acc_id[i])
                typeAcc="verifier"
            }
            if(acc_id[i]=="3"){
                typeAcc="validator"
            }
                   if(!findData){
                    console.log("acc_typeacc_type",typeAcc)
                              await  AccreditatiRelModel.create({
                                                          user_reflect_id:reflect_ids[j],
                                                          accreditation_id:acc_id[i],
                                                          acc_type:typeAcc
                                     }).then(datasave=>{

                                        })
                   }

        })  
       
      }
 }
 res.send("done")
}

exports.view_acc_level = async(req,res,next)=>{
    console.log("update...........................view_acc_level................................................")
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var reflect_id = req.query.reflect_id

     
    // AccreditatiRelModel.findAll({user_reflect_id:reflect_id,deleted:"0"})
    db.query('SELECT * FROM `tbl_accreditation_rels` INNER JOIN tbl_accreditation_masters ON tbl_accreditation_masters.accreditation_id=tbl_accreditation_rels.accreditation_id WHERE tbl_accreditation_rels.deleted="0" AND tbl_accreditation_rels.user_reflect_id='+reflect_id,{ type:db.QueryTypes.SELECT}).then((acc_data)=>{
          db.query('SELECT * FROM `tbl_accreditation_masters` WHERE accreditation_status="active" AND deleted="0"',{ type:db.QueryTypes.SELECT}).then((acc_levels)=>{
            
            // db.query('SELECT * FROM `tbl_acc_features_rels` WHERE deleted="0" AND user_reflect_id='+reflect_id,{ type:db.QueryTypes.SELECT}).then((acc_fe_rel_data)=>{
                
            // db.query('SELECT * FROM `tbl_accreditation_features` WHERE tbl_accreditation_features.acc_status="active" AND tbl_accreditation_features.deleted="0"',{ type:db.QueryTypes.SELECT}).then((acc_features)=>{
                db.query('SELECT * , tbl_accreditation_features.acc_feature_id as acc_f_id FROM `tbl_accreditation_features` LEFT JOIN tbl_acc_features_rels ON ((tbl_acc_features_rels.acc_feature_id=tbl_accreditation_features.acc_feature_id) AND (tbl_acc_features_rels.user_reflect_id="'+reflect_id+'") AND (tbl_acc_features_rels.deleted="0")) WHERE tbl_accreditation_features.acc_status="active" AND tbl_accreditation_features.deleted="0"',{ type:db.QueryTypes.SELECT}).then((acc_features)=>{
                 res.render('admin-views/view_of_alloted_acc.ejs',{ success_msg,
                        err_msg,
                       acc_data,
                       session:req.session,
                        moment,
                       acc_levels,
                       profile_pic,
                       first_name,
                        reflect_id,
                        acc_features,
                        // acc_fe_rel_data
                    });
                })   

            // })
        })
     })
  
   }
   

 exports.change_status_acc_level = async(req,res,next)=>{
    var acc_rel_id = req.body.acc_rel_id;
    var status = req.body.status;
    var reflect_id= req.body.reflect_id
    console.log("update...........................................................................")
    console.log(acc_rel_id)
    console.log(status)
    console.log(reflect_id)
    // success_msg = req.flash('success_msg');
    // err_msg = req.flash('err_msg');
    // var reflect_id = req.query.reflect_id

    AccreditatiRelModel.update({acc_rel_status:status},{where:{acc_rel_id:acc_rel_id}}).then(dataUpdate=>{
        console.log("update",dataUpdate)
        res.redirect('/view_acc_level/?reflect_id='+reflect_id)
    })
    
  
   }   

exports.submit_acc_to_user_indi = async(req,res,next)=>{
    console.log("update...........................submit_acc_to_user_indi................................................")
    var reflect_id= req.body.reflect_id
    var acc_id=JSON.parse(req.body.acc_ids) 
    // var reflect_ids=JSON.parse(req.body.reflect_ids) 
    // console.log(acc_id)
    // console.log(reflect_id)
    var typeAcc;
   
    for(var i=0 ;i<acc_id.length ; i++){
        
        //  for(var j=0 ;j<reflect_ids.length; j++){
             var accDataId =acc_id[i]
          await AccreditatiRelModel.findOne({where:{user_reflect_id:reflect_id,accreditation_id:acc_id[i],deleted:"0",acc_rel_status:"active"}}).then((findData)=>{
            // console.log("acc_id[i]1...",acc_id[i])
            // console.log("2...",reflect_id)
            // console.log("find data",findData)
            if(accDataId=="1"){
                typeAcc="client"
             }
             if(accDataId=="2"){
                typeAcc="verifier"
            }
            if(accDataId=="3"){
                typeAcc="validator"
            }
                      if(!findData){
                        console.log("acc_typeacc_type",typeAcc)
                                   AccreditatiRelModel.create({
                                                             user_reflect_id:reflect_id,
                                                             accreditation_id:accDataId,
                                                             acc_type:typeAcc
                                        }).then(datasave=>{
   
                                           })
                      }
   
           })  
          
        //  }
       
         if(i<acc_id.length){
           
           // res.redirect('/view_acc_level/?reflect_id='+reflect_id)
            res.send("done")
         }
    }
    
   }   

 exports.submit_acc_feature_rel = async(req,res,next)=>{
    console.log("update...........................submit_acc_feature_rel................................................")
    var reflectid= req.body.reflectid
    var acc_id=req.body.acc_id
    var featureid=req.body.featureid
    var checkOrNot=req.body.checkOrNot


    if(checkOrNot=="yes"){
        AccreditaionFeatureRelModel.findOne({where:{ acc_feature_id     :   featureid, accreditation_id   :   acc_id,user_reflect_id    :   reflectid, deleted            :     "0"}}).then(accFerData=>{
            if(!accFerData){

            
                    AccreditaionFeatureRelModel.create({ acc_feature_id     :   featureid,
                                                         accreditation_id   :   acc_id,
                                                         user_reflect_id    :   reflectid
                    }).then(data=>res.send("done")).catch(err=>console.log("save err",err))
                }
            })       
    }else
    {
                AccreditaionFeatureRelModel.update({deleted:"1"},{where:{ acc_feature_id     :   featureid,
                                                     accreditation_id   :   acc_id,
                                                     user_reflect_id    :   reflectid,
                                                     deleted            :     "0"
                                    }}).then(data=>res.send("done")).catch(err=>console.log("save err",err))
    }
  
    
   } 


exports.admin_header_notifications = (req,res,next) =>{
    console.log("-----------admin_header_notification--------------");
    db.query('SELECT * FROM `tbl_admin_notifications` INNER JOIN tbl_user_registrations ON tbl_admin_notifications.sender_id=tbl_user_registrations.reg_user_id LEFT JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_admin_notifications.reflect_id WHERE tbl_admin_notifications.read_status="no" ORDER BY `notification_id` DESC',{ type:db.QueryTypes.SELECT}).then(function(notification_list){
        // console.log("-----------categories--------------",sub_categories);
        db.query('SELECT *,count(tbl_admin_notifications.notification_id) as total_count FROM `tbl_admin_notifications` INNER JOIN tbl_user_registrations ON tbl_admin_notifications.sender_id=tbl_user_registrations.reg_user_id LEFT JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_admin_notifications.reflect_id WHERE tbl_admin_notifications.read_status="no" AND tbl_admin_notifications.deleted="0"',{ type:db.QueryTypes.SELECT}).then(function(total_count){
             res.render('admin-views/notification-ajax',{
                  notification_list,
                  total_count:total_count[0].total_count
            
                  });
        })
    });
}

/** continue get Method Start**/
exports.admin_notification_list =(req,res,next )=> {
    console.log("-----------admin_notification_list--------------");
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    
    db.query('SELECT * FROM `tbl_admin_notifications` INNER JOIN tbl_user_registrations ON tbl_admin_notifications.sender_id=tbl_user_registrations.reg_user_id LEFT JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_admin_notifications.reflect_id WHERE tbl_admin_notifications.read_status="no" AND tbl_admin_notifications.deleted="0"',{ type:db.QueryTypes.SELECT}).then(function(notification_list){
        // console.log("-----------categories--------------",sub_categories);
        db.query('SELECT *,count(tbl_admin_notifications.notification_id) as total_count FROM `tbl_admin_notifications` INNER JOIN tbl_user_registrations ON tbl_admin_notifications.sender_id=tbl_user_registrations.reg_user_id LEFT JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_admin_notifications.reflect_id WHERE tbl_admin_notifications.read_status="no" AND tbl_admin_notifications.deleted="0"',{ type:db.QueryTypes.SELECT}).then(function(total_count){
                                 res.render('admin-views/admin-notification-list',{
                                                                                      profile_pic,first_name,
                                                                                       notification_list,
                                                                                       total_count:total_count[0].total_count
                                      });                                                 

            })
    });
    
}
/** continue  get Method End**/

/** continue get Method Start**/
exports.delete_admin_not =(req,res,next )=> {
    console.log("-----------admin_notification_list--------------");
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    var notId =req.query.noteId
    console.log("notefication id ",notId)
    adminNotificationModel.update({deleted:"1"},{where:{notification_id:notId}}).then(updateDta=>{

   res.redirect("/admin-notification-list")
    // db.query('SELECT * FROM `tbl_admin_notifications` INNER JOIN tbl_user_registrations ON tbl_admin_notifications.sender_id=tbl_user_registrations.reg_user_id LEFT JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_admin_notifications.reflect_id WHERE tbl_admin_notifications.read_status="no" AND tbl_admin_notifications.deleted="0"',{ type:db.QueryTypes.SELECT}).then(function(notification_list){
    //            res.render('admin-views/admin-notification-list',{
    //                                                              profile_pic,
    //                                                              first_name,
    //                                                            notification_list,
    //             });
       
    // });
})
    
}
/** continue  get Method End**/

exports.active_inactive_features =async (req,res,next )=> {
    var mp_reflect_id=req.body.mp_reflect_id
    var mp_status=req.body.status
    var levelType=req.body.levelType
    // console.log(market_place_id)  

    var updateValues= 
    {
        // mp_id:mp_id,
        acc_status:mp_status
    }
    await AccreditaionFeatureModel.update(updateValues, { where: { acc_feature_id: mp_reflect_id } }).then((result) => 
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
// manage durations
exports.manage_durations = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id; 
  
    
    // await SecurityMasterModel.findAll({ where:{deleted:'0'} }).then(function(question_list_result) {
        db.query("SELECT * FROM `tbl_admin_durations`",{ type:db.QueryTypes.SELECT}).then(function(manage_duration){
 

 // console.log('Paginate **********  : ',features_list)
    res.render('admin-views/manage-durations',{
        manage_duration,moment,profile_pic,first_name,
        success_msg,
        // err_msg
    });
}); 
} 
/**repport-list get Method End**/
/**edit-plan post Method Start**/
exports.update_manage_durations =async (req,res,next )=> {
    var duration_id=req.body.duration_id

    var counting_week=req.body.counting_week
        var counting_month=req.body.counting_month

    var durations=req.body.durations
     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    console.log(duration_id)

    console.log(counting_week)
    console.log(durations)
var counting;
if(durations=="month")
{
counting=counting_month;
}
else if(durations=="weekly")
{
counting=counting_week;

}

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var updateValues=
    {
        duration:durations,
        counting:counting,
        updatedAt:formatted,
    }

    console.log(updateValues)

    //  DurationModel.update(updateValues, { where: { duration_id:duration_id } }).then((result) => 
    //        {
    // req.flash('success_msg', 'Your Entry successfully updated !');

    //         res.redirect('/manage-durations');
                
    //        })
    await DurationModel.update(updateValues,{ where:{ duration_id: duration_id }}).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully updated !');

            res.redirect('/manage-durations');
         
    })

}
/**edit-plan post Method End**/
// document search

/**document-master-list get Method Start**/
exports.search_document = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM `tbl_documents_masters` WHERE deleted='0' and (document_type LIKE '%"+query+"%' or doc_id LIKE '%"+query+"%' or  document_name LIKE '%"+query+"%' or status LIKE '%"+query+"%' or createdAt LIKE '%"+query+"%')",{ type:db.QueryTypes.SELECT}).then(function(document_list_result){


        res.render('admin-views/ajax_document',{
        document_list:document_list_result,moment

        
    });
}); 
} 
exports.search_document_type = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM `tbl_documents_masters` WHERE deleted='0' and document_type ='"+query+"'",{ type:db.QueryTypes.SELECT}).then(function(document_list_result){


        res.render('admin-views/ajax_document',{
        document_list:document_list_result,moment

        
    });
}); 
} 
exports.search_document_status = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM `tbl_documents_masters` WHERE deleted='0' and status='"+query+"'",{ type:db.QueryTypes.SELECT}).then(function(document_list_result){


        res.render('admin-views/ajax_document',{
        document_list:document_list_result,moment

        
    });
}); 
} 
exports.search_client = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT user_id,status,birthplace,full_name,dob,email,numReflect FROM tbl_user_registrations u INNER JOIN ( SELECT reg_user_id as user_id, count(reflect_id) as numReflect FROM tbl_wallet_reflectid_rels WHERE reflectid_by!='digitalWallet' and user_as='client' GROUP BY tbl_wallet_reflectid_rels.reg_user_id ) as r ON r.user_id = u.reg_user_id and (user_id LIKE '%"+query+"%' or  birthplace LIKE '%"+query+"%' or email LIKE '%"+query+"%' or full_name LIKE '%"+query+"%' or numReflect LIKE '%"+query+"%' or dob LIKE '%"+query+"%' or status LIKE '%"+query+"%')",{ type:db.QueryTypes.SELECT}).then(function(count_client_list){


        res.render('admin-views/ajax_client',{
        count_client_list:count_client_list,moment

        
    });
}); 
} 
 exports.search_country = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM tbl_countries where createdAt LIKE '%"+query+"%' or  country_id LIKE '%"+query+"%' or country_name LIKE '%"+query+"%' or status LIKE '%"+query+"%'",{ type:db.QueryTypes.SELECT}).then(function(count_country_list){


        res.render('admin-views/ajax_country',{
     country_list:count_country_list,moment

        
    });
}); 
} 
 exports.search_complaint = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;
     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT complain_id,rep_firstname,reflect_code,client_reflect_name,client_reflect_code,complain_message,complaint_status,tbl_complaints.createdAt as created_at FROM `tbl_complaints` inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_complaints.reflect_id WHERE complain_id LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.reflect_code LIKE '%"+query+"%' or complaint_status LIKE '%"+query+"%'  or client_reflect_name LIKE '%"+query+"%'  or client_reflect_code LIKE '%"+query+"%' or complain_message LIKE '%"+query+"%' or tbl_complaints.createdAt LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.rep_firstname LIKE '%"+query+"%'",{ type:db.QueryTypes.SELECT}).then(function(complaint_list){


        res.render('admin-views/ajax_complaint',{
     complaint_list,moment

        
    });
}); 
} 
exports.search_user = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM `tbl_user_registrations` where reg_user_id LIKE '%"+query+"%'  or  birthplace LIKE '%"+query+"%' or email LIKE '%"+query+"%' or full_name LIKE '%"+query+"%' or mobile_number LIKE '%"+query+"%' or dob LIKE '%"+query+"%' or status LIKE '%"+query+"%' or createdAt  LIKE '%"+query+"%'",{ type:db.QueryTypes.SELECT}).then(function(user_list){


        res.render('admin-views/ajax_user',{
     user_list,moment

        
    });
}); 
} 
 
exports.search_verifier = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT user_id,status,birthplace,full_name,dob,email,numReflect FROM tbl_user_registrations u INNER JOIN ( SELECT reg_user_id as user_id, count(reflect_id) as numReflect FROM tbl_wallet_reflectid_rels WHERE user_as='verifier' GROUP BY tbl_wallet_reflectid_rels.reg_user_id ) as r ON r.user_id = u.reg_user_id where deleted='0' and  (user_id LIKE '%"+query+"%' or  birthplace LIKE '%"+query+"%' or email LIKE '%"+query+"%' or full_name LIKE '%"+query+"%' or mobile_number LIKE '%"+query+"%' or dob LIKE '%"+query+"%' or status LIKE '%"+query+"%' or numReflect LIKE '%"+query+"%')",{ type:db.QueryTypes.SELECT}).then(function(verifier_list){


        res.render('admin-views/ajax_verifier',{
     verifier_list,moment

        
    });
}); 
} 


exports.search_admin_allot_reflect = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT rep_username,label,mp_reflect_id,tbl_market_place_reflectid_rels.createdAt as 'createdAt',tbl_market_place_reflectid_rels.status as 'status',icon FROM `tbl_market_place_reflectid_rels` inner join tbl_market_places on tbl_market_places.market_place_id=tbl_market_place_reflectid_rels.market_place_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_market_place_reflectid_rels.reflect_id where label LIKE '%"+query+"%' or  rep_username LIKE '%"+query+"%' or mp_reflect_id LIKE '%"+query+"%' or tbl_market_place_reflectid_rels.createdAt LIKE '%"+query+"%' or tbl_market_place_reflectid_rels.status LIKE '%"+query+"%'",{ type:db.QueryTypes.SELECT}).then(function(mp_list){


        res.render('admin-views/ajax_allot_reflet_mp',{
     mp_list,moment

        
    });
}); 
} 

exports.search_admin_allot_reflect_status = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT rep_username,label,mp_reflect_id,tbl_market_place_reflectid_rels.createdAt as 'createdAt',tbl_market_place_reflectid_rels.status as 'status',icon FROM `tbl_market_place_reflectid_rels` inner join tbl_market_places on tbl_market_places.market_place_id=tbl_market_place_reflectid_rels.market_place_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_market_place_reflectid_rels.reflect_id where tbl_market_place_reflectid_rels.status = '"+query+"'",{ type:db.QueryTypes.SELECT}).then(function(mp_list){


        res.render('admin-views/ajax_allot_reflet_mp',{
     mp_list,moment

        
    });
}); 
} 
exports.search_admin_category = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM `tbl_verifier_category_masters` WHERE deleted='0' and (category_id LIKE '%"+query+"%' or category_name LIKE '%"+query+"%' or createdAt LIKE '%"+query+"%' or status LIKE '%"+query+"%')",{ type:db.QueryTypes.SELECT}).then(function(category_list){


        res.render('admin-views/ajax_admin_category',{
     category_list,moment

        
    });
}); 
} 
exports.search_admin_category_status= async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
      console.log(query)
    db.query("SELECT * FROM `tbl_verifier_category_masters` WHERE deleted='0' and  status = '"+query+"'",{ type:db.QueryTypes.SELECT}).then(function(category_list){


        res.render('admin-views/ajax_admin_category',{
     category_list,moment

        
    });
}); 
} 
/**all_uploaded_document get Method Start**/
exports.all_uploaded_document = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id; 
  
     // var document_data_list=[];

        var page = req.query.page || 1 
        var perPage = 10;
        var page_data=[]

 db.query("SELECT distinct document_name FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id where tbl_myreflectid_doc_rels.deleted='0'",{ type:db.QueryTypes.SELECT}).then(async function(document_name){
                      

 db.query("SELECT distinct entity_company_name,reflect_code,rep_firstname FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id where tbl_myreflectid_doc_rels.deleted='0'",{ type:db.QueryTypes.SELECT}).then(async function(reflect_code){ 
          
 db.query("SELECT distinct doc_unique_code FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id where tbl_myreflectid_doc_rels.deleted='0'",{ type:db.QueryTypes.SELECT}).then(async function(unique_code){ 
            db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id where tbl_myreflectid_doc_rels.deleted='0'",{ type:db.QueryTypes.SELECT}).then(async function(document_data){

                            if (document_data.length > 0) {

                                page_data=document_data

                            }


 

const document_data_list = paginate(page_data,page, perPage);

    res.render('admin-views/all-uploaded-document',{
        document_list:document_data_list,moment,profile_pic,first_name,document_name,reflect_code,unique_code,
        success_msg,
        // err_msg
           });
         });
    });
  });
}); 
} 
/**all_uploaded_document get Method End**/

exports.search_all_uploaded_document = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id where tbl_myreflectid_doc_rels.deleted='0' and (document_name LIKE '%"+query+"%' or  rep_username LIKE '%"+query+"%' or entity_company_name LIKE '%"+query+"%' or reflect_code LIKE '%"+query+"%' or expire_date LIKE '%"+query+"%' or  doc_unique_code LIKE '%"+query+"%'  or tbl_myreflectid_doc_rels.createdAt LIKE '%"+query+"%')",{ type:db.QueryTypes.SELECT}).then(function(document_list){


        res.render('admin-views/ajax_all_uploaded_document',{
     document_list,moment

        
    });
}); 
} 



/**all_document_request_listget Method Start**/
exports.all_document_request_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
  

   db.query("SELECT DISTINCT rep_firstname,entity_company_name,reflect_code,tbl_wallet_reflectid_rels.reflect_id as 'reflect_id' FROM `tbl_admin_document_requests` INNER join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_admin_document_requests.reflect_id inner join tbl_user_registrations on tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_admin_document_requests.deleted='0' ORDER BY `admin_request_id` DESC",{ type:db.QueryTypes.SELECT}).then(function(reflect_data){


   db.query("SELECT DISTINCT  document_name FROM `tbl_admin_document_requests` INNER join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_admin_document_requests.reflect_id inner join tbl_user_registrations on tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_admin_document_requests.deleted='0' ORDER BY `admin_request_id` DESC",{ type:db.QueryTypes.SELECT}).then(function(document_name_data){

                db.query("SELECT *, tbl_admin_document_requests.createdAt as 'request_date' FROM `tbl_admin_document_requests` INNER join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_admin_document_requests.reflect_id inner join tbl_user_registrations on tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_admin_document_requests.deleted='0' ORDER BY `admin_request_id` DESC",{ type:db.QueryTypes.SELECT}).then(function(document_list_result){

                                if (document_list_result.length > 0) {

                                    page_data=document_list_result

                                }

                            console.log(' db hello : ',page_data)



                            const request_document_list = paginate(page_data,page, perPage);

                            // console.log('Paginate **********  : ',features_list)
                                res.render('admin-views/all-document-request-list',{
                                    document_list:request_document_list,moment,profile_pic,first_name,
                                    reflect_data,document_name_data,

                                    success_msg,
                                    err_msg 
                                });
                            });
            });
}); 
} 
/**all_document_request_list get Method End**/


/**document-master-list get Method Start**/
exports.search_request_document = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM `tbl_admin_document_requests` INNER join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_admin_document_requests.reflect_id inner join tbl_user_registrations on tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_admin_document_requests.deleted='0' and (admin_request_id LIKE '%"+query+"%' or  document_name LIKE '%"+query+"%' or  descriptions LIKE '%"+query+"%'  or request_status LIKE '%"+query+"%' or tbl_admin_document_requests.createdAt LIKE '%"+query+"%' or  rep_firstname LIKE '%"+query+"%' or entity_company_name LIKE '%"+query+"%' or reflect_code LIKE '%"+query+"%')  ORDER BY `admin_request_id`",{ type:db.QueryTypes.SELECT}).then(function(document_list_result){


        res.render('admin-views/ajax_request_document',{
        document_list:document_list_result,moment

        
    });
});  
} 
/**document_request_actionpost Method Start**/
exports.document_request_action=async (req,res,next )=> {

        var request_status = req.query.request_status

        var admin_request_id = req.query.admin_request_id

        var reg_user_id = req.query.user_id

        var document_name = req.query.document_name

        // var reflet_id = req.query.reflet_id


    console.log("admin_request_id : ",admin_request_id)
    console.log("reg_user_id : ",reg_user_id)
    console.log("request_status : ",request_status)
    console.log("document_name : ",document_name)

    // console.log("reflet_id : ",reflet_id)
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    var updateValues= 
    {
        request_status:request_status,
    }
    await AdminDocumentRequest.update(updateValues, { where: { admin_request_id: admin_request_id } }).then(async (admin_result) => 
    {
        // MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(async(result) => {
            await    DocumentMasterModel.create({document_name:document_name,createdAt:formatted,updatedAt:formatted}).then(async plan_data =>{
        
              await   UserModel.findOne({where:{reg_user_id:reg_user_id}}).then(async user_data => {

             var msg = `Dear ${decrypt(user_data.full_name)}, Your request  for create a ${document_name} is ${request_status}ed by Admin.`

                               await  NotificationModel.create({
                                                    notification_msg:msg,
                                                    sender_id:'7',
                                                    receiver_id:reg_user_id,
                                                    notification_type:'',
                                                    notification_date:new Date()
                                        }).then(async(notification) =>{
             // console.log(notification)

                                req.flash('success_msg', 'You status successfully updated !');

             res.redirect('/all-document-request-list')
         
                                 })
                          })
                  })
          })

}
/**document_request_action Method End**/

/**delete-verifier get Method Start**/
exports.delete_document_request= async (req,res,next)=>
{
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    const admin_request_id = req.query.admin_request_id
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');

    // var reg_user_id=v_id.replace(/:/g,"");
     
    // console.log(reg_user_id)

    var updateValues=
    {
        deleted_at:formatted,
        deleted:'1'
    }
    await AdminDocumentRequest.update(updateValues, { where: { admin_request_id: admin_request_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully deleted !');
             res.redirect('/all-document-request-list')
         
    })

}
/**SubverifierList get Method End**/

exports.SubverifierList = (req,res,next) => {

    var reg_user_id     =   req.query.reg_user_id

    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
  
           db.query('SELECT * ,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt ,tbl_invite_sub_verifiers.email AS invite_email FROM tbl_invite_sub_verifiers LEFT JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id LEFT JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.deleted="0" AND tbl_invite_sub_verifiers.invite_status="accept" AND tbl_invite_sub_verifiers.reg_user_id='+reg_user_id,{type:db.QueryTypes.SELECT})



           .then(SubverifierListData => {

                  if (SubverifierListData.length > 0) {

                        page_data=SubverifierListData

                    }

                console.log(' db hello : ',page_data)



           const sub_verifier_list = paginate(page_data,page, perPage);
                 res.render('admin-views/sub-verifier-list',{

                               count_verifier_list     :   sub_verifier_list,moment,profile_pic,first_name, success_msg,err_msg,reg_user_id

       
                 })

           })

}


/**SubverifierList get Method End**/


/**SubverifierList get Method End**/

exports.Search_SubverifierList = (req,res,next) => {

     var query = req.body.query;
    var reg_user_id     =   req.body.reg_user_id

    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
  
           db.query('SELECT * ,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt ,tbl_invite_sub_verifiers.email AS invite_email FROM tbl_invite_sub_verifiers LEFT JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id LEFT JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.deleted="0" AND tbl_invite_sub_verifiers.invite_status="accept" AND tbl_invite_sub_verifiers.reg_user_id='+reg_user_id+" and  (invite_sub_id LIKE '%"+query+"%' or  birthplace LIKE '%"+query+"%' or tbl_invite_sub_verifiers.email LIKE '%"+query+"%' or full_name LIKE '%"+query+"%' or rep_firstname LIKE '%"+query+"%' or entity_company_name LIKE '%"+query+"%' or rep_lastname LIKE '%"+query+"%' or mobile_number LIKE '%"+query+"%' or reflectid_by LIKE '%"+query+"%' or reflect_code LIKE '%"+query+"%' or  invite_status LIKE '%"+query+"%')",{type:db.QueryTypes.SELECT})



           .then(SubverifierListData => {

                       
                //   if (SubverifierListData.length > 0) {

                //         page_data=SubverifierListData

                //     }

                // console.log(' db hello : ',page_data)



           // const sub_verifier_list = paginate(page_data,page, perPage);
               res.render('admin-views/ajax_sub_verifier',{
                    count_client_list:SubverifierListData,moment

                    
              
           })


           })

}


/**SubverifierList get Method End**/
exports.VerifierBySubVerifier = (req,res,next) => {

    var sub_verifier_reflectId     =   req.query.sub_verifier_reflectId
    var sub_verifier_id     =   req.query.sub_verifier_id
    // var reg_user_id     =   req.query.user_id

    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
  console.log('sub_verifier_id  ',sub_verifier_id)
    console.log('sub_verifier_reflectId  ',sub_verifier_reflectId)

           db.query('SELECT * ,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt ,tbl_invite_sub_verifiers.email AS invite_email FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_invite_sub_verifiers.deleted="0" AND tbl_invite_sub_verifiers.sub_verifier_reflectId='+sub_verifier_reflectId+' AND tbl_invite_sub_verifiers.sub_verifier_id='+sub_verifier_id,{type:db.QueryTypes.SELECT})



           .then(SubverifierListData => {

                  if (SubverifierListData.length > 0) {

                        page_data=SubverifierListData

                    }

                console.log(' db hello : ',page_data)



             const sub_verifier_list = paginate(page_data,page, perPage);
                 res.render('admin-views/verifiers-of-sub-verifiers',{

                               count_verifier_list     :   sub_verifier_list,sub_verifier_reflectId,sub_verifier_id,moment,profile_pic,first_name, success_msg,err_msg 

       
                 })

           })

}

// 
// 

// exports.parentOfSubverifier = (req,res,next) => {

//     var reg_user_id     =   req.query.reg_user_id

     
//        db.query('SELECT * ,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt ,tbl_invite_sub_verifiers.email AS invite_email FROM tbl_invite_sub_verifiers LEFT JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id LEFT JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.deleted="0" AND tbl_invite_sub_verifiers.invite_status="accept" AND tbl_invite_sub_verifiers.reg_user_id='+reg_user_id,{type:db.QueryTypes.SELECT})

//        .then(SubverifierListData => {

//              res.render('admin-views/sub-verifier-list',{
                 
//                            list     :   SubverifierListData
//              })

//        })

// }


exports.walletList = (req,res,next) => {

    var profile_pic  = req.session.profile_pic;
    var first_name   = req.session.first_name;

    success_msg      = req.flash('success_msg');
    err_msg          = req.flash('err_msg');
    var admin_id     = req.session.admin_id;

    var page         = req.query.page || 1
    var perPage      = 10;
    var page_data    = []

    var reg_user_id  = req.query.reg_user_id

     
       db.query('SELECT *,tbl_user_wallets.status as wallet_status FROM tbl_user_wallets INNER JOIN tbl_wallet_reflectid_rels ON tbl_user_wallets.wallet_id = tbl_wallet_reflectid_rels.wallet_id WHERE tbl_user_wallets.status="active" AND tbl_user_wallets.deleted="0" AND tbl_user_wallets.reg_user_id='+reg_user_id,{type:db.QueryTypes.SELECT})

       .then(walletListData => {

            const WALLET_LIST_DATA = paginate(walletListData,page, perPage);

                        res.render('admin-views/wallet_list',{
                            
                                    wallet_list     :   WALLET_LIST_DATA,
                                    moment,
                                    profile_pic,
                                    first_name,
                                    success_msg,
                                    err_msg ,
                                    reg_user_id
                        })

       })

}



exports.searchWalletList = (req,res,next) => {

    // var profile_pic  = req.session.profile_pic;
    // var first_name   = req.session.first_name;
    // success_msg      = req.flash('success_msg');
    // err_msg          = req.flash('err_msg');
    // var admin_id     = req.session.admin_id;
    // var page         = req.query.page || 1
    // var perPage      = 10;
    // var page_data    = []
    var reg_user_id  = req.body.reg_user_id
    var valueForSearch  = req.body.query

     
       db.query('SELECT *,tbl_user_wallets.status as wallet_status FROM tbl_user_wallets INNER JOIN tbl_wallet_reflectid_rels ON tbl_user_wallets.wallet_id = tbl_wallet_reflectid_rels.wallet_id WHERE (tbl_user_wallets.status="active" AND tbl_user_wallets.deleted="0" AND tbl_user_wallets.reg_user_id='+reg_user_id+' AND (tbl_wallet_reflectid_rels.reflect_code LIKE "%'+valueForSearch+'%" OR tbl_user_wallets.wallet_address LIKE "%'+valueForSearch+'%" OR tbl_wallet_reflectid_rels.rep_firstname LIKE "%'+valueForSearch+'%" OR tbl_wallet_reflectid_rels.entity_company_name LIKE "%'+valueForSearch+'%" OR tbl_wallet_reflectid_rels.rep_firstname LIKE "%'+valueForSearch+'%" OR tbl_wallet_reflectid_rels.user_as LIKE "%'+valueForSearch+'%" OR tbl_user_wallets.status LIKE "%'+valueForSearch+'%"))',{type:db.QueryTypes.SELECT})

       .then(walletListData => {

            // const WALLET_LIST_DATA = paginate(walletListData,page, perPage);

                        res.render('admin-views/ajax_filter_wallet_list',{
                            
                                      wallet_list   :   walletListData,
                                    moment,
                                    // profile_pic,
                                    // first_name,
                                    // success_msg,
                                    // err_msg ,
                                    // reg_user_id
                        })

       })

}

exports.search_verifier_by_subverifier = (req,res,next) => {

    // var profile_pic  = req.session.profile_pic;
    // var first_name   = req.session.first_name;
    // success_msg      = req.flash('success_msg');
    // err_msg          = req.flash('err_msg');
    // var admin_id     = req.session.admin_id;
    // var page         = req.query.page || 1
    // var perPage      = 10;
    // var page_data    = []
    var reg_user_id  = req.body.reg_user_id
    var query  = req.body.query

    var sub_verifier_reflectId     =   req.body.sub_verifier_reflectId
    var sub_verifier_id     =   req.body.sub_verifier_id

     
       db.query("SELECT * ,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt ,tbl_invite_sub_verifiers.email AS invite_email FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.reg_user_id=tbl_user_registrations.reg_user_id  WHERE tbl_invite_sub_verifiers.deleted='0' AND tbl_invite_sub_verifiers.sub_verifier_reflectId="+sub_verifier_reflectId+" AND tbl_invite_sub_verifiers.sub_verifier_id="+sub_verifier_id+" AND (birthplace LIKE '%"+query+"%' or tbl_user_registrations.email LIKE '%"+query+"%' or full_name LIKE '%"+query+"%' or last_name LIKE '%"+query+"%')",{type:db.QueryTypes.SELECT})
       .then(walletListData => {           // const WALLET_LIST_DATA = paginate(walletListData,page, perPage);

                        res.render('admin-views/ajax_filter_verifier_by_subverifier',{
                            
                                    wallet_list     :   walletListData,
                                    moment,
                                    // profile_pic,
                                    // first_name,
                                    // success_msg,
                                    // err_msg ,
                                    // reg_user_id
                        })

       })

}
// General pages
// About Us
exports.about_us = (req,res,next) => {

    var profile_pic  = req.session.profile_pic;
    var first_name   = req.session.first_name;
    var admin_id     = req.session.admin_id;

    success_msg      = req.flash('success_msg');
    err_msg          = req.flash('err_msg');


     
       db.query('SELECT *FROM tbl_front_about_us',{type:db.QueryTypes.SELECT})

       .then(about_us_data => {

                        res.render('admin-views/about-us',{
                            
                                    // wallet_list     :   WALLET_LIST_DATA,
                                    about_us_data,
                                    moment,
                                    profile_pic,
                                    first_name,
                                    success_msg,
                                    err_msg                                     
                        })

       })

}
exports.edit_about_us =async (req,res,next )=> {
    var about_id=req.body.about_id
    var descriptions=req.body.descriptions
     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    console.log(about_id)

    console.log(descriptions)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var updateValues=
    {
        descriptions:descriptions,
        updatedAt:formatted,
    }
    await AboutusModel.update(updateValues, { where: { about_id: about_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully updated !');

            res.redirect('/about-us');
         
    })

}

// Connect With Us
 exports.connect_with_us = (req,res,next) => {

    var profile_pic  = req.session.profile_pic;
    var first_name   = req.session.first_name;
    var admin_id     = req.session.admin_id;

    success_msg      = req.flash('success_msg');
    err_msg          = req.flash('err_msg');


     
       db.query('SELECT *FROM tbl_front_connect_with_us',{type:db.QueryTypes.SELECT})

       .then(connect_with_us_data => {

                        res.render('admin-views/connect-with-us',{
                            
                                    // wallet_list     :   WALLET_LIST_DATA,
                                    connect_with_us_data,
                                    moment,
                                    profile_pic,
                                    first_name,
                                    success_msg,
                                    err_msg                                     
                        })

       })

}
exports.edit_connect_with_us =async (req,res,next )=> {
    var connect_id=req.body.connect_id
    var connect_email=req.body.connect_email
    var address=req.body.address

    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    console.log(connect_id)

    console.log(address)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var updateValues=
    {
        connect_email:connect_email,
        updatedAt:formatted,
    }
    await ConnectWithModel.update(updateValues, { where: { connect_id: connect_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully updated !');

            res.redirect('/connect-with-us');
         
    })

}

// get_in_touch_list start
exports.get_in_touch_list = (req,res,next) => {

    var profile_pic  = req.session.profile_pic;
    var first_name   = req.session.first_name;
    var admin_id     = req.session.admin_id;

    success_msg      = req.flash('success_msg');
    err_msg          = req.flash('err_msg');

    var page         = req.query.page || 1
    var perPage      = 10;
    var page_data    = []
    
     
       db.query("SELECT *FROM tbl_contact_us where deleted='0'",{type:db.QueryTypes.SELECT})

       .then(contact_with_us_data_db => {

        if (contact_with_us_data_db.length > 0) {

            page_data=contact_with_us_data_db
    
        }
    
    
    
     
    const contact_with_us_data = paginate(page_data,page, perPage);
               
                        res.render('admin-views/get-in-touch-list',{
                            
                                    // wallet_list     :   WALLET_LIST_DATA,
                                    contact_with_us_data,
                                    moment,
                                    profile_pic,
                                    first_name,
                                    success_msg,
                                    err_msg                                     
                        })

       })

}
// get_in_touch_list End

/**delete-any contact get Method Start**/
exports.delete_any_contact= async (req,res,next)=>
{
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    const contact_id = req.query.contact_id

    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');

     
    console.log(contact_id)

    var updateValues=
    {
        deleted_at:formatted,
        deleted:'1'
    }
    await ContectUsModel.update(updateValues, { where: { contact_id: contact_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully deleted !');
            res.redirect('/get-in-touch-list');
         
    })

}
/**delete-any contact get Method End**/
/**respond-any contact get Method Start**/
exports.respond_to_any_contact= async (req,res,next)=>
{
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    const contact_id = req.body.contact_id
    const message = req.body.message

    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');

     
    console.log(message)

    var updateValues=
    {
        response_status:'responded',
        admin_message:message,
        responded_at:formatted
    }
    await ContectUsModel.update(updateValues, { where: { contact_id: contact_id } }).then(async(result) => 
    {
      await ContectUsModel.findOne({ where:{contact_id:contact_id} }).then(async function(userDataResult) {

          
           var email = userDataResult.co_email
            var name = userDataResult.co_name      

          console.log(email)

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
                                subject: "MyReflet Admin Respond Your Message.",
                          
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
                                        <h4 style="font-size: 20px; margin-bottom: 0;">Dear, ${name}</h4>
                                        <p>${message}</p>
                                        <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                                        <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                                
                                       
                                      </div>
                                       <div style="background-color:  #88beda; color: #fff; padding: 20px 30px;">
                                         &copy; Copyright 2020 - My Reflet. All rights reserved.
                                        </div>
                                    </div>
                                  </body>
                                </html>  `
                                
                              };
                              smtpTransport.sendMail(mailOptions, function (err) {
                               
                               console.log('EMMMmail sent ')
                                      req.flash('success_msg', 'Your Entry successfully responded to user!');
                                      res.redirect('/get-in-touch-list');
                              
         })
      })
    })

}
/**respond-any contact get Method End**/

/**search_any_contact get Method Start**/
exports.search_any_contact = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM `tbl_contact_us` WHERE deleted='0' and (co_name LIKE '%"+query+"%' or co_email LIKE '%"+query+"%' or  admin_message LIKE '%"+query+"%' or response_status LIKE '%"+query+"%' or createdAt LIKE '%"+query+"%')",{ type:db.QueryTypes.SELECT}).then(function(contact_with_us_data){


        res.render('admin-views/ajax_get_in_touch',{
        contact_with_us_data,moment

        
    });
}); 
} 
/**search_any_contact get Method End**/


// why_choose_us start
exports.why_choose_us = (req,res,next) => {

    var profile_pic  = req.session.profile_pic;
    var first_name   = req.session.first_name;
    var admin_id     = req.session.admin_id;

    success_msg      = req.flash('success_msg');
    err_msg          = req.flash('err_msg');
     
       db.query("SELECT *FROM tbl_why_choose_us ",{type:db.QueryTypes.SELECT})

       .then(why_choose_us_data => {

        
               
                        res.render('admin-views/why-choose-us',{
                            
                                    why_choose_us_data,
                                    moment,
                                    profile_pic,
                                    first_name,
                                    success_msg,
                                    err_msg                                     
                        })

       })

}
// why_choose_us End

/**add-market-place post Method Start**/
exports.add_why_choose_us =async (req,res,next )=> {
    console.log('************ add_plan_feature ***********')

    var label=req.body.label 
    var descriptions=req.body.descriptions 
    var icon = req.file.filename;


    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;



    //console.log('icon : ',icon)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

   await WhyChooseUs.create({why_label:label,why_descriptions:descriptions,icon:icon,createdAt:formatted,updatedAt:formatted}).then(mp_data =>{
   

     
    req.flash('success_msg', 'Your Entry successfully added!');
    // err_msg
                res.redirect('/why-choose-us')
            });
     
}
/**add-market-place post Method End**/

/**Edit-market-place post Method Start**/
exports.edit_why_choose_us= async (req,res,next)=>
{
    var why_choose_id=req.body.why_choose_id
     console.log('************ market place ***********')
    var label=req.body.label
    var descriptions=req.body.descriptions 
    var icon = req.file;

     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name; 

    console.log(why_choose_id)
     console.log(descriptions)
     console.log(label)
     console.log(icon)
 var updateValues;
 if(icon===undefined)
{
 updateValues=
    {
       why_label:label,
        why_descriptions:descriptions,
        updatedAt:formatted,
        
    }
}
else
{
 updateValues=
    {
        why_label:label,
        why_descriptions:descriptions,
        icon:icon.filename,
        updatedAt:formatted,
        
    }
}
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
      
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

   
    await WhyChooseUs.update(updateValues, { where: { why_choose_id: why_choose_id } }).then((result) => 
    {
     console.log(result)
            req.flash('success_msg', 'Your Entry successfully updated !');
            res.redirect('/why-choose-us')
         
    })
}
/**Edit-market-place post Method End**/

// why_choose_us start
exports.front_feature = async(req,res,next) => {

    var profile_pic  = req.session.profile_pic;
    var first_name   = req.session.first_name;
    var admin_id     = req.session.admin_id;

    success_msg      = req.flash('success_msg');
    err_msg          = req.flash('err_msg');
     
       db.query("SELECT *FROM tbl_features ",{type:db.QueryTypes.SELECT})

       .then(async feature_data => {

        for(var i=0;i< feature_data.length;i++)
               {
                 var feature_id = feature_data[i].feature_id;

                 console.log('user_doc_id : ',feature_id)

                           var length_data;

                      await db.query("SELECT * FROM `tbl_features_relations` WHERE feature_id="+feature_id+"  order by feature_rel_id desc",{ type:db.QueryTypes.SELECT}).then( async(features_relations)=>{


                               if(features_relations.length>0)
                               {
                                 feature_data[i].features_relations_data = features_relations
                                 length_data                            =  features_relations.length

                               }
                               else
                               {
                                             feature_data[i].features_relations_data = 'undefined'
                                            length_data = 0;
                                }
                    
                         })


               }
               
                        res.render('admin-views/front-feature',{
                            
                                    feature_data,
                                    moment,
                                    profile_pic,
                                    first_name,
                                    success_msg,
                                    err_msg,length_data                                  
                        })

       })

}
// why_choose_us End

/**add-market-place post Method Start**/
exports.add_front_feature =async (req,res,next )=> {
    console.log('************ add_front_feature ***********')

    var label=req.body.label 
    var descriptions=req.body.descriptions 
    var icon = req.file.filename;


    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;



    //console.log('icon : ',icon)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

   await Features.create({feature_label:label,feature_descriptions:descriptions,icon:icon,createdAt:formatted,updatedAt:formatted}).then(mp_data =>{
   

     
    req.flash('success_msg', 'Your Entry successfully added!');
    // err_msg
                res.redirect('/front-feature')
            });
     
}
/**add-market-place post Method End**/

/**Edit-edit_front_featuree post Method Start**/
exports.edit_front_feature= async (req,res,next)=>
{
    var feature_id=req.body.feature_id
    //  console.log('************ market place ***********')
    var label=req.body.label
    var descriptions=req.body.descriptions 
    var icon = req.file;

     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name; 

    console.log(feature_id)
     console.log(descriptions)
     console.log(label)
     console.log(icon)
 var updateValues;
 if(icon===undefined)
{
 updateValues=
    {
        feature_label:label,
        feature_descriptions:descriptions,
        updatedAt:formatted,
        
    }
}
else
{
 updateValues=
    {
        feature_label:label,
        feature_descriptions:descriptions,
        icon:icon.filename,
        updatedAt:formatted,
        
    }
}
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
      
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

   
    await Features.update(updateValues, { where: { feature_id: feature_id } }).then((result) => 
    {
     console.log(result)
            req.flash('success_msg', 'Your Entry successfully updated !');
                res.redirect('/front-feature')
         
    })
}
/**Edit-edit_front_feature post Method End**/


/**Edit-allot edit_front_featuree post Method Start**/
exports.edit_allot_front_feature= async (req,res,next)=>
{
    var feature_rel_id=req.body.feature_rel_id
     console.log('************ market place ***********')
    var feature = req.body.feature
   
     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name; 

   
 updateValues=
    {
        feature:feature,
        updatedAt:formatted,
        
    }
    console.log('feature : ',feature,feature_rel_id)
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
      
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

   
    await FeaturesRelations.update(updateValues, { where: { feature_rel_id: feature_rel_id } }).then((result) => 
    {
     console.log(result)
            req.flash('success_msg', 'Your Entry successfully updated !');
                res.redirect('/front-feature')
         
    })
}
/**Edit-allot edit_front_feature post Method End**/

/**add-allot_front_featurepost Method Start**/
exports.allot_front_feature =async (req,res,next )=> {
    console.log('************ add_front_feature ***********')

    var feature_id=req.body.feature_id 
    var feature=req.body.feature 


    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;



    //console.log('icon : ',icon)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

   await FeaturesRelations.create({feature_id:feature_id,feature:feature,createdAt:formatted,updatedAt:formatted}).then(mp_data =>{
   

     
    req.flash('success_msg', 'Your Entry successfully added!');
    // err_msg
                res.redirect('/front-feature')
            });
     
}
/**add-allot_front_featurepost Method End**/

// benefits start
exports.benefits = (req,res,next) => {

    var profile_pic  = req.session.profile_pic;
    var first_name   = req.session.first_name;
    var admin_id     = req.session.admin_id;

    success_msg      = req.flash('success_msg');
    err_msg          = req.flash('err_msg');
     
       db.query("SELECT *FROM tbl_benifits ",{type:db.QueryTypes.SELECT})

       .then(benefit_data => {

        
               
                        res.render('admin-views/benefits',{
                            
                                    benefit_data,
                                    moment,
                                    profile_pic,
                                    first_name,
                                    success_msg,
                                    err_msg                                     
                        })

       })

}
// benefits End

/**add-market-place post Method Start**/
exports.add_benefits =async (req,res,next )=> {
    console.log('************ add_front_feature ***********')

    var label=req.body.label 
    var descriptions=req.body.descriptions 
    var icon = req.file.filename;


    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;



    //console.log('icon : ',icon)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

   await Benifits.create({benifit_label:label,benifit_descriptions:descriptions,icon:icon,createdAt:formatted,updatedAt:formatted}).then(mp_data =>{
   

     
    req.flash('success_msg', 'Your Entry successfully added!');
    // err_msg
                res.redirect('/benefits')
            });
     
}
/**add-market-place post Method End**/

/**Edit-edit_front_featuree post Method Start**/
exports.edit_benefits= async (req,res,next)=>
{
    var benifit_id=req.body.benifit_id
     console.log('************ market place ***********')
    var label=req.body.label
    var descriptions=req.body.descriptions 
    var icon = req.file;

     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name; 

    console.log(benifit_id)
     console.log(descriptions)
     console.log(label)
     console.log(icon)
 var updateValues;
 if(icon===undefined)
{
 updateValues=
    {
        benifit_label:label,
        benifit_descriptions:descriptions,
        updatedAt:formatted,
        
    }
}
else
{
 updateValues=
    {
        benifit_label:label,
        benifit_descriptions:descriptions,
        icon:icon.filename,
        updatedAt:formatted,
        
    }
}
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
      
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

   
    await Benifits.update(updateValues, { where: { benifit_id: benifit_id } }).then((result) => 
    {
     console.log(result)
            req.flash('success_msg', 'Your Entry successfully updated !');
                res.redirect('/benefits')
         
    })
}
/**Edit-edit_front_feature post Method End**/


/**verifier-list get Method Start**/
exports.entity_client_verifier_report = (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    
    db.query("SELECT * FROM `tbl_wallet_reflectid_rels` WHERE  reflectid_by='entity' ORDER BY reflect_id DESC",{ type:db.QueryTypes.SELECT}).then(function(count_entity_result){
     
        if (count_entity_result.length > 0) { 

            page_data=count_entity_result
    
        } 
    
    
    
     
    const count_entity_list = paginate(page_data,page, perPage);
    
    res.render('admin-views/entity-client-verifier-report',{
        profile_pic,first_name,
        count_verifier_list:count_entity_list,
        success_msg,
        err_msg
    });});
}
/**verifier-list get Method End**/

/**verifier-list get Method Start**/
exports.entity_client_verifier_report_view = (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    var reflect_id = req.query.reflect_id;
    var user_as = req.query.user_as;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    
    db.query("SELECT *from (SELECT max(user_doc_id),admin_status,reflect_id,doc_id,expire_date,self_assested,certified_status,createdAt as 'created_doc' FROM `tbl_myreflectid_doc_rels` where reflect_id="+reflect_id+" GROUP BY doc_id) as doc_table INNER JOIN tbl_documents_masters ON doc_table.doc_id=tbl_documents_masters.doc_id  ORDER BY reflect_id DESC",{ type:db.QueryTypes.SELECT}).then(async function(count_entity_result){
     

        for(var i=0;i< count_entity_result.length;i++)
        {
          var doc_id = count_entity_result[i].doc_id;

          console.log('doc_id : ',doc_id)


               await db.query("SELECT * FROM `tbl_request_documents` inner join tbl_request_documents_files on tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id inner join tbl_myreflectid_doc_rels on  tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_myreflectid_doc_rels.doc_id="+doc_id+" and docfile_status='accept' limit 1",{ type:db.QueryTypes.SELECT}).then( async(user_doc)=>{

                console.log('user_doc : ',user_doc)

                        if(user_doc.length>0)
                        {
                         count_entity_result[i].kyc_status = user_doc[0].docfile_status
                       

                        }
                        else
                        {
                                      count_entity_result[i].kyc_status = 'undefined'

                         }
             
                  })


        }
        console.log('count_entity_result : ',count_entity_result)
        if (count_entity_result.length > 0) { 

            page_data=count_entity_result
    
        } 
    
      
    
     
    const count_entity_list = paginate(page_data,page, perPage);
    
    res.render('admin-views/entity-client-verifier-report-view',{
        profile_pic,first_name,
        count_verifier_list:count_entity_list,
        success_msg,
        err_msg,moment,user_as
    });});
}
/**verifier-list get Method End**/

/**search_entity post Method Start**/
exports.search_entity = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM `tbl_wallet_reflectid_rels` WHERE  reflectid_by='entity' and (entity_company_name LIKE '%"+query+"%' or   reflect_code LIKE '%"+query+"%' or user_as LIKE '%"+query+"%' or createdAt LIKE '%"+query+"%')",{ type:db.QueryTypes.SELECT}).then(function(count_verifier_list){


        res.render('admin-views/ajax_entity',{
        count_verifier_list,moment

        
    });
}); 
} 
/**search_entity post Method End**/

/**verifier-list get Method Start**/
exports.entity_client_verifier_report_view_document = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    var reflect_id = req.query.reflect_id;
    var doc_id = req.query.doc_id;
    var user_as = req.query.user_as;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    
    db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as 'created_doc' from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_myreflectid_doc_rels.reflect_id="+reflect_id+" and tbl_myreflectid_doc_rels.doc_id="+doc_id+" and tbl_myreflectid_doc_rels.user_doc_id In (SELECT user_doc_id from tbl_myreflectid_doc_rels GROUP BY reflect_id ORDER BY user_doc_id DESC)",{ type:db.QueryTypes.SELECT}).then(async function(count_entity_result){
     


               for(var i=0;i< count_entity_result.length;i++)
               {
                 var user_doc_id = count_entity_result[i].user_doc_id;

                 console.log('user_doc_id : ',user_doc_id)


                      await db.query("SELECT * FROM `tbl_request_documents` WHERE user_doc_id="+user_doc_id+"  order by request_doc_id desc",{ type:db.QueryTypes.SELECT}).then( async(user_doc)=>{


                               if(user_doc.length>0)
                               {
                                count_entity_result[i].request_data = user_doc
                              

                               }
                               else
                               {
                                             count_entity_result[i].request_data = 'undefined'

                                }
                    
                         })


               }
        if (count_entity_result.length > 0) { 

            page_data=count_entity_result
    
        } 
    
      
     console.log('user_doc_id : ',page_data)
     
    const count_entity_list = paginate(page_data,page, perPage);
    
    res.render('admin-views/entity-client-verifier-report-view-document',{
        profile_pic,first_name,
        count_verifier_list:count_entity_list,
        success_msg,
        err_msg,moment,user_as
    });});
}
/**verifier-list get Method End**/

exports.our_key_pillar_list = (req,res,next) => {

    var profile_pic  = req.session.profile_pic;
    var first_name   = req.session.first_name;
    var admin_id     = req.session.admin_id;

    success_msg      = req.flash('success_msg');
    err_msg          = req.flash('err_msg');


     
       db.query('SELECT *FROM tbl_our_key_pillars',{type:db.QueryTypes.SELECT})

       .then(our_key_pillars_data => {

                        res.render('admin-views/our-key-pillar-list',{
                            
                                    // wallet_list     :   WALLET_LIST_DATA,
                                    about_us_data:our_key_pillars_data,
                                    moment,
                                    profile_pic,
                                    first_name,
                                    success_msg,
                                    err_msg                                     
                        })

       })

}
exports.edit_our_key_pillar_list =async (req,res,next )=> {

    var key_pillar_id=req.body.key_pillar_id
    var descriptions=req.body.descriptions
    var label=req.body.label

    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    console.log(key_pillar_id)

    console.log(descriptions)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var updateValues=
    {
        descriptions:descriptions,
        updatedAt:formatted,
        label:label
    }
    await KeyPillarsModel.update(updateValues, { where: { key_pillar_id: key_pillar_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully updated !');

            res.redirect('/our-key-pillar-list');
         
    })

}

// view user levels by user id
exports.view_reflet_by_userid =async (req,res,next )=> {

   var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    var reg_user_id = req.query.reg_user_id;
  
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

    var obj_data = [];

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    
  await  db.query("SELECT * FROM `tbl_wallet_reflectid_rels` WHERE reflectid_by!='digitalWallet' and  `reg_user_id`="+reg_user_id+"  ORDER BY reflect_id DESC",{ type:db.QueryTypes.SELECT}).then(async function(reflet_result){


 for(var j=0;j< reflet_result.length;j++)

            {

          var reflect_id = reflet_result[j].reflect_id;

          var user_as = reflet_result[j].user_as;


        await db.query("SELECT  * FROM `tbl_master_levels` WHERE deleted='0' order by level_id DESC",{ type:db.QueryTypes.SELECT}).then(async function(level_list_result){
              
            
         obj_data = [];  

           for(var k=0;k< level_list_result.length;k++)
            {
              
              

              var level_id = level_list_result[k].level_id;

              var level_name = level_list_result[k].level_name;

              console.log('level_id : ',level_id)

              console.log('level_name : ',level_name)

               await   db.query("SELECT * FROM `tbl_allot_levels` inner join tbl_documents_masters on tbl_documents_masters.doc_id = tbl_allot_levels.doc_id WHERE level_id="+level_id+"  order by allot_level_id desc",{ type:db.QueryTypes.SELECT}).then( async(user_allot)=>{


                      var level_length = user_allot.length;
                      var count_data = 0;
                      
                       

                                   for(var i=0;i< user_allot.length;i++)
                                   {
                                     var doc_id = user_allot[i].doc_id;

                                     console.log('user_doc_id : ',doc_id)

                                        if(user_as =='client')
                                        {
                                            
                                            await db.query("SELECT * FROM `tbl_request_documents` inner join tbl_myreflectid_doc_rels on tbl_request_documents.user_doc_id = tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_request_documents_files ON tbl_request_documents_files.request_doc_id =tbl_request_documents.request_doc_id WHERE doc_id = "+doc_id+" and  reflect_id = "+reflect_id+" and docfile_status = 'accept'",{ type:db.QueryTypes.SELECT}).then( async(user_doc)=>{
                                                  // console.log('user_doc : ',user_doc)
                                                  if(user_doc.length>0)
                                                  {
                                                       // console.log('user_doc : ',user_doc)
                                                      count_data = count_data+1;

                                                      // console.log('count_data : ',count_data)
                                                  }

                                               
                                                   if(count_data === level_length)
                                                   {
                                                        // console.log('(user_doc.count_data : ',count_data,' level_length : ',level_length)

                            
                                                               obj_data[k] = level_name     
                                                  
                                                           // console.log('inner : k ',k," k : ",obj_data[k])
                                                   }
                                                   
                                        
                                             })
                                        }else if(user_as =='verifier'){

                                            await db.query("SELECT * FROM `tbl_myreflectid_doc_rels`  WHERE doc_id = "+doc_id+" and  reflect_id = "+reflect_id+" and admin_status = 'verified'",{ type:db.QueryTypes.SELECT}).then( async(user_doc)=>{
                                                  // console.log('user_doc : ',user_doc)
                                                  if(user_doc.length>0)
                                                  {
                                                       console.log('user_doc : ',user_doc)
                                                      count_data = count_data+1;

                                                      console.log('count_data : ',count_data)
                                                  }

                                               
                                                   if(count_data === level_length)
                                                   {
                                                        console.log('(user_doc.count_data : ',count_data,' level_length : ',level_length)

                            
                                                               obj_data[k] = level_name     
                                                  
                                                           console.log('inner : k ',k," k : ",obj_data[k])
                                                   }
                                                   
                                        
                                             })
                                        }

                                          


                                   }
                     
                           //
                            console.log('oooooooooooooooooooooouuuuuuuuuuuttttttttttttt : ',obj_data)
                          

                        })
                        // 
                       
                       
                
                         }
                  })
                
                   if(obj_data.length>0)
                    {
                      reflet_result[j].level_name = obj_data    
                    }
                    else
                    {
                        reflet_result[j].level_name = 'undefined'

                    } 

                    
           }

            console.log('oooooooooooooooooooooo : ',reflet_result)
                    
        if (reflet_result.length > 0) { 

            page_data=reflet_result
    
        } 
    
    // var reg_user_id

    // if(reflet_result.reg_user_id)
    // {
    //          reg_user_id = reflet_result.reg_user_id

    // }else
    // {
    //         reg_user_id = undefined
    
    // }
      
     // console.log('page_data : ',page_data)
     
    const count_reflet_list = paginate(page_data,page, perPage);
    
    res.render('admin-views/view-reflet-by-userid',{
        profile_pic,first_name,
        count_verifier_list:count_reflet_list,
        success_msg,reg_user_id,
        err_msg,moment,
    });
});
}
// view user levels by user id


// view user levels by user id
exports.view_levels_by_userid =async (req,res,next )=> {

   var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    var reflect_id = req.query.reflect_id;
    var user_as = req.query.user_as;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    
     var obj_data = [];
   
    


 
   // await  db.query("SELECT * FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  where user_doc_id in (SELECT max(user_doc_id) FROM tbl_myreflectid_doc_rels group by reflect_id,doc_id HAVING reflect_id="+reflect_id+") order by user_doc_id desc",{ type:db.QueryTypes.SELECT}).then(async function(count_entity_result){


       // for(var j=0;j< count_entity_result.length;j++)
       //      {
   
      
               
         // 
         //       count_entity_result[j].user_level_data = obj_data;

            // }     
            
         console.log('oooooooooooooooooooooo : ',level_list_result)

                if (count_entity_result.length > 0) { 

                    page_data=count_entity_result
            
                } 
    
      
     console.log('user_doc_id : ',page_data)
     
    const count_entity_list = paginate(page_data,page, perPage);
    
    res.render('admin-views/view-user-levels',{
        profile_pic,first_name,
        count_verifier_list:obj_data,
        success_msg,
        err_msg,moment,user_as
    // });
});
}
// view user levels by user id

// Search reflet
exports.search_reflet = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;
     var reg_user_id = req.body.reg_user_id;


    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
   await db.query("SELECT * FROM `tbl_wallet_reflectid_rels` WHERE reg_user_id="+reg_user_id+" and (entity_company_name LIKE '%"+query+"%' or  rep_firstname LIKE '%"+query+"%' or   reflect_code LIKE '%"+query+"%' or user_as LIKE '%"+query+"%' or createdAt LIKE '%"+query+"%')",{ type:db.QueryTypes.SELECT}).then(async function(reflet_result){

         for(var j=0;j< reflet_result.length;j++)

            {

          var reflect_id = reflet_result[j].reflect_id;

          var user_as = reflet_result[j].user_as;


        await db.query("SELECT  * FROM `tbl_master_levels` WHERE deleted='0' order by level_id DESC",{ type:db.QueryTypes.SELECT}).then(async function(level_list_result){
              
            
         obj_data = [];  

           for(var k=0;k< level_list_result.length;k++)
            {
              
              

              var level_id = level_list_result[k].level_id;

              var level_name = level_list_result[k].level_name;

              console.log('level_id : ',level_id)

              console.log('level_name : ',level_name)

               await   db.query("SELECT * FROM `tbl_allot_levels` inner join tbl_documents_masters on tbl_documents_masters.doc_id = tbl_allot_levels.doc_id WHERE level_id="+level_id+"  order by allot_level_id desc",{ type:db.QueryTypes.SELECT}).then( async(user_allot)=>{


                      var level_length = user_allot.length;
                      var count_data = 0;
                      
                         for(var i=0;i< user_allot.length;i++)
                                   {
                                     var doc_id = user_allot[i].doc_id;

                                     console.log('user_doc_id : ',doc_id)

                                        if(user_as =='client')
                                        {
                                            
                                            await db.query("SELECT * FROM `tbl_request_documents` inner join tbl_myreflectid_doc_rels on tbl_request_documents.user_doc_id = tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_request_documents_files ON tbl_request_documents_files.request_doc_id =tbl_request_documents.request_doc_id WHERE doc_id = "+doc_id+" and  reflect_id = "+reflect_id+" and docfile_status = 'accept'",{ type:db.QueryTypes.SELECT}).then( async(user_doc)=>{
                                                  // console.log('user_doc : ',user_doc)
                                                  if(user_doc.length>0)
                                                  {
                                                       // console.log('user_doc : ',user_doc)
                                                      count_data = count_data+1;

                                                      // console.log('count_data : ',count_data)
                                                  }

                                               
                                                   if(count_data === level_length)
                                                   {
                                                        // console.log('(user_doc.count_data : ',count_data,' level_length : ',level_length)

                            
                                                               obj_data[k] = level_name     
                                                  
                                                           // console.log('inner : k ',k," k : ",obj_data[k])
                                                   }
                                                   
                                        
                                             })
                                        }else if(user_as =='verifier'){

                                            await db.query("SELECT * FROM `tbl_myreflectid_doc_rels`  WHERE doc_id = "+doc_id+" and  reflect_id = "+reflect_id+" and admin_status = 'verified'",{ type:db.QueryTypes.SELECT}).then( async(user_doc)=>{
                                                  // console.log('user_doc : ',user_doc)
                                                  if(user_doc.length>0)
                                                  {
                                                       console.log('user_doc : ',user_doc)
                                                      count_data = count_data+1;

                                                      console.log('count_data : ',count_data)
                                                  }

                                               
                                                   if(count_data === level_length)
                                                   {
                                                        console.log('(user_doc.count_data : ',count_data,' level_length : ',level_length)

                            
                                                               obj_data[k] = level_name     
                                                  
                                                           console.log('inner : k ',k," k : ",obj_data[k])
                                                   }
                                                   
                                        
                                             })
                                        }

                                          


                                   }
                     

                                 
                           //
                              })
                        // 
                       
                       
                
                         }
                  })
                
                   if(obj_data.length>0)
                    {
                      reflet_result[j].level_name = obj_data    
                    }
                    else
                    {
                        reflet_result[j].level_name = 'undefined'

                    } 

                    
           }

        res.render('admin-views/ajax_reflet',{
        count_verifier_list:reflet_result,moment

        
    });
}); 
} 
// Search reflet
// allot levels
/**master_levels get Method Start**/
exports.master_levels = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]


   await db.query("SELECT  * FROM `tbl_master_levels` WHERE deleted='0' order by level_id DESC",{ type:db.QueryTypes.SELECT}).then(function(level_list_result){

            db.query("SELECT distinct level_name,level_id FROM `tbl_master_levels` WHERE deleted='0' order by level_id DESC",{ type:db.QueryTypes.SELECT}).then(function(level_name){
                           
                              db.query("SELECT distinct document_name,doc_id FROM `tbl_documents_masters` WHERE deleted='0' order by doc_id DESC",{ type:db.QueryTypes.SELECT}).then(function(document_name_data){

                                     db.query("SELECT * FROM `tbl_documents_masters` WHERE document_type = 'master' and deleted='0' order by doc_id DESC",{ type:db.QueryTypes.SELECT}).then(async function(document_list){
                                                                                        
                                                   for(var i=0;i< level_list_result.length;i++)
                                                           {
                                                             var level_id = level_list_result[i].level_id;

                                                             console.log('user_doc_id : ',level_id)


                                                              await   db.query("SELECT * FROM `tbl_allot_levels` inner join tbl_documents_masters on tbl_documents_masters.doc_id = tbl_allot_levels.doc_id WHERE level_id="+level_id+"  order by allot_level_id desc",{ type:db.QueryTypes.SELECT}).then( async(user_doc)=>{


                                                                           if(user_doc.length>0)
                                                                           {
                                                                            
                                                                            level_list_result[i].allot_data = user_doc
                                                                          

                                                                           }
                                                                           else
                                                                           {
                                                                             level_list_result[i].allot_data = 'undefined'

                                                                            }
                                                                
                                                                     })


                                                           }

                                                if (level_list_result.length > 0) {

                                                    page_data=level_list_result

                                                }

// console.log(' db hello : ',page_data)



const level_list = paginate(page_data,page, perPage);

// console.log('Paginate **********  : ',features_list)
    res.render('admin-views/master-user-levels',{
        level_list,moment,
        profile_pic,first_name,level_name,document_name_data,document_list,

        success_msg,
        err_msg 
               })
            })
         })
    });
}); 
} 
/**document-master-list get Method End**/

/**add-document-type post Method Start**/
exports.add_master_levels = (req,res,next )=> {

       var level_name=req.body.level_name
       var doc_id=req.body.doc_id

        var profile_pic = req.session.profile_pic;
        var first_name = req.session.first_name;

    // console.log(plan_data)
    // console.log(plan_price)

     console.log("checked_column_array ",doc_id);

    var doc_id_array = doc_id.split(',');

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');


    

    MasterLevelModel.create({level_name:level_name,createdAt:formatted,updatedAt:formatted}).then(level_data =>{

               console.log(level_data.level_id)

               var level_id = level_data.level_id;

                 for(var i=0;i<doc_id_array.length;i++)
                  {
                            console.log('doc_id_array  : ',doc_id_array[i])

                     AllotMasterLevelModel.create({doc_id:doc_id_array[i],level_id:level_id,createdAt:formatted,updatedAt:formatted}).then(plan_data =>{

                         console.log('i value  : ',i)
                     })
                  }

        req.flash('success_msg', 'Your Entry successfully added!');
        res.redirect('/master-levels')
        // err_msg
    });
}
/**add-document-type post Method End**/

/**edit-document-type post Method Start**/
exports.edit_master_levels= async (req,res,next)=>
{
    var level_id=req.body.level_id

    var level_name=req.body.level_name
    // var plan_price=req.body.plan_price
     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    // console.log(question_id)

    // console.log(question_name)
    // console.log(plan_price)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
      
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var updateValues=
    {
        level_name:level_name,
        updatedAt:formatted,
    }
    await MasterLevelModel.update(updateValues, { where: { level_id: level_id } }).then((result) => 
    {

        req.flash('success_msg', 'Your Entry successfully updated!');
        res.redirect('/master-levels')
         
    })
}
/**edit-document-type post Method Start**/

/**delete-document get Method Start**/
exports.delete_master_levels= async (req,res,next)=>
{
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    const level_id = req.query.level_id
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');

    // var doc_id=d_id.replace(/:/g,"");

    // console.log(question_id)
    var updateValues=
    {
        deleted_at:formatted,
        deleted:'1'
    }
    await MasterLevelModel.update(updateValues, { where: { level_id: level_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully deleted !');
            res.redirect('/master-levels')
         
    })

}
/**delete-document get Method End**/


/**change-status-plan post Method Start**/
exports.change_master_levels =async (req,res,next )=> {

    var level_id = req.body.level_id
    var status = req.body.status

    console.log(level_id)

    console.log(status)
    // console.log(plan_price)

    var updateValues=
    {
        status:status
    }
    await MasterLevelModel.update(updateValues, { where: { level_id: level_id } }).then((result) => 
    {
       
             res.redirect('/master-levels')         
    })

}
/**change-status-plan post Method End**/

// search_master_levels
exports.search_master_levels = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;
     var reg_user_id = req.body.reg_user_id;

    var page = req.query.page || 1
    var perPage = 2;
    var page_data=[]

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT  * FROM `tbl_master_levels` WHERE deleted='0'  and  (level_name LIKE '%"+query+"%' or   status LIKE '%"+query+"%' or createdAt LIKE '%"+query+"%' or updatedAt LIKE '%"+query+"%') order by level_id DESC",{ type:db.QueryTypes.SELECT}).then(async function(level_list_result){


                                                   for(var i=0;i< level_list_result.length;i++)
                                                           {
                                                             var level_id = level_list_result[i].level_id;

                                                             console.log('user_doc_id : ',level_id)


                                                              await   db.query("SELECT * FROM `tbl_allot_levels` inner join tbl_documents_masters on tbl_documents_masters.doc_id = tbl_allot_levels.doc_id WHERE level_id="+level_id+" order by allot_level_id desc",{ type:db.QueryTypes.SELECT}).then( async(user_doc)=>{
                                                                   
                                                                    // console.log('user_doc_id : ',user_doc)

                                                                           if(user_doc.length>0)
                                                                           {
                                                                            
                                                                            level_list_result[i].allot_data = user_doc
                                                                          

                                                                           }
                                                                           else
                                                                           {
                                                                             level_list_result[i].allot_data = 'undefined'

                                                                            }
                                                                
                                                                     })


                                                           }

                                                if (level_list_result.length > 0) {

                                                    page_data=level_list_result

                                                }

// console.log(' db hello : ',page_data)



const level_list = paginate(page_data,page, perPage);



        res.render('admin-views/ajax_master_levels',{
        level_list:level_list_result,moment

        
    });
}); 
} 
exports.search_master_levels_status = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;
     var reg_user_id = req.body.reg_user_id;

    var page = req.query.page || 1
    var perPage = 2;
    var page_data=[]

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT  * FROM `tbl_master_levels` WHERE deleted='0'  and  status = '"+query+"'  order by level_id DESC",{ type:db.QueryTypes.SELECT}).then(async function(level_list_result){


                                                   for(var i=0;i< level_list_result.length;i++)
                                                           {
                                                             var level_id = level_list_result[i].level_id;

                                                             console.log('user_doc_id : ',level_id)


                                                              await   db.query("SELECT * FROM `tbl_allot_levels` inner join tbl_documents_masters on tbl_documents_masters.doc_id = tbl_allot_levels.doc_id WHERE level_id="+level_id+" order by allot_level_id desc",{ type:db.QueryTypes.SELECT}).then( async(user_doc)=>{
                                                                   
                                                                    // console.log('user_doc_id : ',user_doc)

                                                                           if(user_doc.length>0)
                                                                           {
                                                                            
                                                                            level_list_result[i].allot_data = user_doc
                                                                          

                                                                           }
                                                                           else
                                                                           {
                                                                             level_list_result[i].allot_data = 'undefined'

                                                                            }
                                                                
                                                                     })


                                                           }

                                                if (level_list_result.length > 0) {

                                                    page_data=level_list_result

                                                }

// console.log(' db hello : ',page_data)



const level_list = paginate(page_data,page, perPage);



        res.render('admin-views/ajax_master_levels',{
        level_list:level_list_result,moment

        
    });
}); 
} 
// search_master_levels


/**search_master_report get Method Start**/
exports.search_master_report = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM `tbl_master_reports` WHERE deleted='0' and (report_name LIKE '%"+query+"%' or report_id LIKE '%"+query+"%' or  user_type LIKE '%"+query+"%' or status LIKE '%"+query+"%' or createdAt LIKE '%"+query+"%') order by report_id DESC",{ type:db.QueryTypes.SELECT}).then(function(report_list){


        res.render('admin-views/ajax_master_report',{
        report_list,moment

        
    });
}); 
} 
/**search_master_report get Method End**/


/**search_security_question get Method Start**/
exports.search_security_question = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM `tbl_security_questions` WHERE deleted='0' and (question LIKE '%"+query+"%' or question_id LIKE '%"+query+"%' or  updatedAt LIKE '%"+query+"%' or status LIKE '%"+query+"%' or createdAt LIKE '%"+query+"%') order by question_id DESC",{ type:db.QueryTypes.SELECT}).then(function(question_list){


        res.render('admin-views/ajax_security_question',{
        question_list,moment

        
    });
}); 
} 
/**search_security_question get Method End**/

/**search_master_plan get Method Start**/
exports.search_master_plan = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM `tbl_verifier_plan_masters` WHERE deleted='0' and (plan_name LIKE '%"+query+"%' or plan_id LIKE '%"+query+"%' or  updatedAt LIKE '%"+query+"%' or status LIKE '%"+query+"%' or createdAt LIKE '%"+query+"%')",{ type:db.QueryTypes.SELECT}).then(function(plan_list){


        res.render('admin-views/ajax_plan',{
        plan_list,moment

        
    });
}); 
} 

exports.search_master_plan_status = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM `tbl_verifier_plan_masters` WHERE deleted='0' and  status = '"+query+"'",{ type:db.QueryTypes.SELECT}).then(function(plan_list){


        res.render('admin-views/ajax_plan',{
        plan_list,moment

        
    });
}); 
} 
/**search_master_plan get Method End**/

/**search_master_plan get Method Start**/
exports.search_master_plan_feature = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;


    db.query("SELECT * FROM `tbl_plan_features` WHERE deleted='0' and (feature_name LIKE '%"+query+"%' or plan_feature_id LIKE '%"+query+"%' or  updatedAt LIKE '%"+query+"%' or  createdAt LIKE '%"+query+"%')",{ type:db.QueryTypes.SELECT}).then(function(features_list){


        res.render('admin-views/ajax_plan_feature',{
        features_list,moment

        
            });
        }); 
} 

exports.search_master_plan_feature_rel = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;


    db.query("SELECT feature_rel_id,plan_name,feature_name,tbl_plan_feature_rels.feature_status as status,tbl_plan_feature_rels.createdAt as created_at FROM tbl_plan_feature_rels INNER JOIN tbl_plan_features ON tbl_plan_feature_rels.feature_id=tbl_plan_features.plan_feature_id inner join tbl_verifier_plan_masters on tbl_plan_feature_rels.plan_id=tbl_verifier_plan_masters.plan_id WHERE tbl_plan_features.deleted='0' and tbl_verifier_plan_masters.deleted='0' and (feature_name LIKE '%"+query+"%' or plan_name LIKE '%"+query+"%' or status LIKE '%"+query+"%' or feature_status LIKE '%"+query+"%' or  tbl_plan_feature_rels.updatedAt LIKE '%"+query+"%' or  tbl_plan_feature_rels.createdAt LIKE '%"+query+"%')",{ type:db.QueryTypes.SELECT}).then(function(features_list){


        res.render('admin-views/ajax_plan_feature_rel',{
        features_list,moment 

        
            });
        }); 
} 
exports.search_market_place = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;


    db.query("SELECT * FROM `tbl_market_places` WHERE deleted='0' and (label LIKE '%"+query+"%' or descriptions LIKE '%"+query+"%' or status LIKE '%"+query+"%'  or  updatedAt LIKE '%"+query+"%' or  createdAt LIKE '%"+query+"%')",{ type:db.QueryTypes.SELECT}).then(function(mp_list){


        res.render('admin-views/ajax_master_mp',{
        mp_list,moment 

        
            });
        }); 
} 
exports.search_market_place_status = async (req,res,next )=> {
   
    
    var admin_id = req.query.admin_id;

     var query = req.body.query;


    db.query("SELECT * FROM `tbl_market_places` WHERE deleted='0' and  status LIKE '"+query+"'",{ type:db.QueryTypes.SELECT}).then(function(mp_list){


        res.render('admin-views/ajax_master_mp',{
        mp_list,moment 

        
            });
        }); 
} 
// General pages terms and conditions
exports.terms_and_conditions = (req,res,next) => {

    var profile_pic  = req.session.profile_pic;
    var first_name   = req.session.first_name;
    var admin_id     = req.session.admin_id;

    success_msg      = req.flash('success_msg');
    err_msg          = req.flash('err_msg');


     
       db.query('SELECT *FROM tbl_front_terms_conditions',{type:db.QueryTypes.SELECT})

       .then(terms_data => {

                        res.render('admin-views/terms-and-condiions',{
                            
                                    // wallet_list     :   WALLET_LIST_DATA,
                                    terms_data,
                                    moment,
                                    profile_pic,
                                    first_name,
                                    success_msg,
                                    err_msg                                     
                        })

       })

}
exports.edit_terms_and_conditions =async (req,res,next )=> {
    var terms_id=req.body.terms_id
    var descriptions=req.body.descriptions
     
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    console.log(terms_id)

    console.log(terms_id)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var updateValues=
    {
        descriptions:descriptions,
        updatedAt:formatted,
    }
    await TermsConditionModel.update(updateValues, { where: { terms_id: terms_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully updated !');

            res.redirect('/create-terms-and-conditions');
         
    })

}
