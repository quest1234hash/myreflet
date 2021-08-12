var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var {AdminModel}=require('../../models/admin');

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
 
// exports.index = (req,res, next) => {
//     res.render('front/index');
// };

exports.log_out = (req,res,next )=> {

    req.session.destroy(function (err) { })

res.redirect('/admin-login')

}
exports.signIn = (req,res,next )=> {
    // console.log('admin')
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    res.render('admin-views/admin-login',{
        // success_msg,
        // err_msg
    });
}
exports.login_post =async (req,res,next )=> {
    const username = req.body.username
    const password = req.body.password

    const admin =  await AdminModel.findOne({ email:username })
    const isMatch = await bcrypt.compare(password, admin.password)
    console.log('IS match : ',isMatch)
        if (!admin) {
            req.flash('error', 'Please enter correct credentials.');
                res.redirect('/admin-login')
        }
        if (!isMatch) {

            req.flash('error', 'Please enter correct credentials.');
            res.redirect('/admin-login')
        }
            req.session.islogin=true;
            req.session.admin_id=admin.email;
           console.log('true')
           res.redirect('/admin-dashboard')
        // res.redirect('/client-list')

        //    res.render('admin-views/admin-dashboard',{
        //     // success_msg,
        //     // err_msg
        // });
        
        
      
 }

//  exports.forget_pass =(req,res,next )=> {
//     success_msg = req.flash('success_msg');
//     err_msg = req.flash('err_msg');
//     res.render('admin-views/change-password',{
//         // success_msg,
//         // err_msg
//     });
// }
exports.dashboard = (req,res,next )=> {
    console.log('dashnboard ---- ')
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    res.render('admin-views/admin-dashboard',{
        // success_msg,
        // err_msg
    });
}
exports.index=(req,res,next )=> {
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    res.render('admin-views/index',{
        success_msg,
        err_msg
    }); 
}


exports.my_profile =async (req,res,next )=> {
    console.log('myprofile ---- ')
    var admin_id = req.session.admin_id;

    const admin =  await AdminModel.findOne({ email:admin_id })

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg'); 
    res.render('admin-views/my-profile',{layout: false,admin,
        success_msg,
        err_msg
 });}

exports.profile_post =(req,res,next )=> {

    console.log('myprofile post---- ')
    
    var admin_id = req.session.admin_id;

    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const email = req.body.email
    
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');


    var updateValues={
        first_name:first_name,
        last_name:last_name,
        email:email,
        updatedAt:formatted
       }
     AdminModel.update(updateValues, { where: { email: admin_id } }).then((result) => 
        {
            res.render('admin-views/admin-dashboard',{
                // success_msg,
                // err_msg
            });
        })



}
exports.change_password_post =async (req,res,next )=> {

    console.log('myprofile post---- ')

   
    var admin_id = req.session.admin_id;

    const old_pass = req.body.old_password
    const new_pass = req.body.new_password
    
    
    const admin =  await AdminModel.findOne({ email:admin_id })
    const isMatch = await bcrypt.compare(old_pass, admin.password)

    if(!isMatch){
        req.flash('error', 'Please enter correct current password.');
   
     
         res.redirect('/change_password');
      
           
       }
       else if(new_pass == old_pass){
           req.flash('error', 'New password should not be same as current password.');
           // res.send('your password does not match!')
           res.redirect('/change_password');
       }
       else {
           const hashedPassword = await bcrypt.hash(new_pass,8)
            AdminModel.update({email:admin_id}, {$set: {password: hashedPassword}}, {upsert: true}, function(err)
           {
               if (err){
               } else 
               { 
                   req.flash('success', 'Your password changed successfully !');
                   res.redirect('/get_change_password');
               }
           })
       }    

           
}
exports.change_password =(req,res,next )=> {
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    res.render('admin-views/change-password',{
        success_msg,
        err_msg
    });
}

exports.client_list = (req,res,next )=> {
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    res.render('admin-views/client-list',{ 
        // success_msg,
        // err_msg
    });
}
 
exports.verifier_list = (req,res,next )=> {
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    res.render('admin-views/verifier-list',{
        // success_msg,
        // err_msg
    });
}

exports.verifier_on_boarding = (req,res,next )=> {
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    res.render('admin-views/verifier_on_boarding',{
        // success_msg,
        // err_msg
    });
}




