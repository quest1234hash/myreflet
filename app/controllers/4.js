var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var {AdminModel,tbl_verifier_plan_master,PlanFeatures,PlanFeatureRel}=require('../../models/admin');
var {DocumentMasterModel,VerifierCategoryMasterModel,CountryModel}=require('../../models/master');

var moment = require('moment');
const paginate   =  require("paginate-array");

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

// *********** Logout ***************
exports.log_out = (req,res,next )=> {
  
    req.session.destroy(function (err) { })

res.redirect('/admin-login')

}

// *********** Sign in start ***************

exports.signIn = (req,res,next )=> {
    // console.log('admin')
  var  success_msg = req.flash('success_msg');
  var  err_msg = req.flash('error');
    res.render('admin-views/admin-login',{
        success_msg,
        err_msg
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
            req.session.profile_pic=admin.profile_pic;
            req.session.first_name=admin.first_name;


           console.log('true')
           res.redirect('/admin-dashboard')
        // res.redirect('/client-list')

        //    res.render('admin-views/admin-dashboard',{
        //     // success_msg,
        //     // err_msg
        // });
        
        
      
 }

 //*********** SIGN in End ***************

  //*********** Forgot password start***************


 exports.forgot_password = (req,res,next )=> {
     console.log('FORGOT')
    var success_msg = req.flash('success');
    var err_msg= req.flash('err_msg'); 

    res.render('admin-views/admin-forgot-password',{
        success_msg,
        err_msg
    });
}


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
            var url_data='http://192.168.1.102:3001/admin-reset-password/?mail='+base64encode(email);

            var mail_subject="MyReflect ResetPassword Link.";
                var mail_content='Hello '+userDataResult.first_name+',<p>Please check your verificaton code and reset password link.<br/><br/><a href="'+url_data+'">Click here</a> to reset password.</p>';
                var to_mail=email;
                var mailresult=mail_func.sendMail(to_mail,mail_subject,mail_content);
             
             }
             res.redirect("/continue");

                }).catch(err=>console.log(err))
     
                /**update vericication code to reset passsword end**/


             

         
            

    
}

 exports.continue =(req,res,next )=> {
    res.render('admin-views/continue',{
        // success_msg,
        // err_msg
    });
}
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

//*********** Forgot password end***************

exports.dashboard = (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    res.render('admin-views/admin-dashboard',{profile_pic,first_name
        // success_msg,
        // err_msg
    });
}
exports.index=(req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    res.render('admin-views/index',{
        success_msg,
        err_msg,profile_pic,first_name
    }); 
}

//*********** profile start***************

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

//*********** profile end***************

//*********** change password start***************

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
exports.change_password_post =async (req,res,next )=> {

    // console.log('myprofile post---- ')
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;

   
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

//*********** change password end*************** 

exports.client_list_get = (req,res,next )=> {
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;


    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    
   
     var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    
    db.query("SELECT user_id,status,birthplace,full_name,dob,email,numReflect FROM tbl_user_registrations u INNER JOIN ( SELECT reg_user_id as user_id, count(reflect_id) as numReflect FROM tbl_wallet_reflectid_rels WHERE user_as='client' GROUP BY tbl_wallet_reflectid_rels.reg_user_id ) as r ON r.user_id = u.reg_user_id where deleted='0'  ORDER BY r.numReflect DESC",{ type:db.QueryTypes.SELECT}).then(function(count_client_result){
     
        if (count_client_result.length > 0) {

            page_data=count_client_result
    
        }
    
    
    
     
    const count_client_list = paginate(page_data,page, perPage);
                               
        res.render('admin-views/client-list',{ profile_pic,first_name,
            count_client_list
        });   
                      
                           
 
                  // 

        });

}
 
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
    
    res.render('admin-views/verifier-list',{profile_pic,first_name,count_verifier_list
        // success_msg,
        // err_msg
    });});
}
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
    else{
        status_value='block';

    }
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
    console.log(status_value)


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

            // req.flash('success', 'Your Entry successfully deleted !');
            res.redirect('/verifier-list');
         
    })

}
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
exports.manage_verifier= async (req,res,next)=>
{
    // var user_status='block'
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    const v_id = req.params.id
    var reg_user_id=v_id.replace(/:/g,"");

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    console.log(reg_user_id)

    // console.log(user_status)
    // console.log(plan_price)
    // db.query("SELECT * FROM `tbl_myreflectid_doc_rels` inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id WHERE tbl_wallet_reflectid_rels.reg_user_id=1 and tbl_wallet_reflectid_rels.reflect_id=2"+reg_user_id,+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(all_verifier_result){

    // db.query("SELECT reflectid_by,rep_firstname,reflectFROM `tbl_myreflectid_doc_rels` inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and user_as='verifier'",{ type:db.QueryTypes.SELECT}).then(async function(verifier_result){
        db.query("SELECT *FROM `tbl_myreflectid_doc_rels` inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and user_as='verifier'",{ type:db.QueryTypes.SELECT}).then(async function(all_verifier_result){

            // db.query("SELECT * FROM `tbl_myreflectid_doc_rels` inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and user_as='verifier'",{ type:db.QueryTypes.SELECT}).then(async function(verifier_list_1){

        if (all_verifier_result.length > 0) { 

            page_data=all_verifier_result
    
        }
    
        console.log('****************************')

        console.log('****************************',all_verifier_result)

    const verifier_list = paginate(page_data,page, perPage);
    res.render('admin-views/manage_request',{
        profile_pic,first_name,verifier_list,moment
        // success_msg,
        // err_msg
    // });
})});



}

// **************************** CLIENt LISt *********************
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
    else{
        status_value='block';

    }
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
    console.log(status_value)


    db.query("SELECT user_id,status,birthplace,full_name,dob,email,numReflect FROM tbl_user_registrations u INNER JOIN ( SELECT reg_user_id as user_id, count(reflect_id) as numReflect FROM tbl_wallet_reflectid_rels WHERE user_as='client' GROUP BY tbl_wallet_reflectid_rels.reg_user_id ) as r ON r.user_id = u.reg_user_id where status='"+status_value+"' ORDER BY r.numReflect DESC",{ type:db.QueryTypes.SELECT}).then(function(count_verifier_result){
     
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

            // req.flash('success', 'Your Entry successfully deleted !');
            res.redirect('/client-list');
         
    })

}
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
//************************** PLAN LIST START **************************
exports.plan_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    // await tbl_verifier_plan_master.findAll({ where:{deleted:'0'} }).then(function(plan_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM `tbl_verifier_plan_masters` WHERE deleted='0' order by plan_id DESC",{ type:db.QueryTypes.SELECT}).then(function(plan_list_result){
    if (plan_list_result.length > 0) {

        page_data=plan_list_result

    }



 
const plan_list = paginate(page_data,page, perPage);

// console.log('Paginate **********  : ',features_list)
    res.render('admin-views/plan-list',{
        plan_list,moment,profile_pic,first_name

        // success_msg,
        // err_msg
    });
}); 
} 
exports.add_plan = (req,res,next )=> {
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

    tbl_verifier_plan_master.create({plan_name:plan_name,plan_price:plan_price,createdAt:formatted,updatedAt:formatted}).then(plan_data =>{
        console.log(plan_data)
       res.redirect('/plan-list')
        // err_msg
    });
}
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

            // req.flash('success', 'Your Entry successfully deleted !');
            res.redirect('/plan-list');
         
    })

}
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

            // req.flash('success', 'Your Entry successfully updated !');
            res.redirect('/plan-list');
         
    })

}
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
        console.log(result)

             console.log(result)
            res.redirect('/plan-list');
         
    })

}

//************************** PLAN LIST END **************************


//************************** SECURITY LIST START **************************
exports.security_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success');
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
       res.redirect('/security-questions-list')
        // err_msg
    });
}
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

            // req.flash('success', 'Your Entry successfully deleted !');
            res.redirect('/security-questions-list');
         
    })

}
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

//************************** Document LIST START **************************
exports.document_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM `tbl_documents_masters` WHERE deleted='0' order by doc_id DESC",{ type:db.QueryTypes.SELECT}).then(function(document_list_result){
    if (document_list_result.length > 0) {

        page_data=document_list_result

    }

// console.log(' db hello : ',page_data)



const document_list = paginate(page_data,page, perPage);

// console.log('Paginate **********  : ',features_list)
    res.render('admin-views/document-list',{
        document_list,moment,profile_pic,first_name

        // success_msg,
        // err_msg 
    });
}); 
} 
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
        console.log(plan_data)
       res.redirect('/document-master-list')
        // err_msg
    });
}
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

            // req.flash('success', 'Your Entry successfully updated !');
            res.redirect('/document-master-list')
         
    })
}
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

            // req.flash('success', 'Your Entry successfully deleted !');
            res.redirect('/document-master-list')
         
    })

}
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
        console.log(result)

             console.log(result)
             res.redirect('/document-master-list')
         
    })

}

//************************** DOCUMENT LIST END **************************

//************************** CATEGORY LIST START **************************
exports.category_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success');
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;
   

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    // await VerifierCategoryMasterModel.findAll({ where:{deleted:'0'} }).then(function(category_list_result) {
        db.query("SELECT * FROM `tbl_verifier_category_masters` WHERE deleted='0' order by category_id DESC",{ type:db.QueryTypes.SELECT}).then(function(category_list_result){
    //   console.log(plan_list)
    if (category_list_result.length > 0) {

        page_data=category_list_result

    }

// console.log(' db hello : ',page_data)



const category_list = paginate(page_data,page, perPage);

// console.log('Paginate **********  : ',features_list)
    res.render('admin-views/category-list',{
        category_list,moment,profile_pic,first_name
 
        // success_msg,
        // err_msg 
    }); 
}); 
} 
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
        console.log(plan_data)
       res.redirect('/verifier-category-list')
        // err_msg
    });
}
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

            // req.flash('success', 'Your Entry successfully updated !');
            res.redirect('/verifier-category-list')
         
    })
}
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

            // req.flash('success', 'Your Entry successfully deleted !');
            res.redirect('/verifier-category-list')
         
    })

}
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
        console.log(result)

             console.log(result)
             res.redirect('/verifier-category-list')
         
    })

}


//************************** CATEgory LIST END **************************

//************************** PLAN-FEATURE LIST START **************************
exports.plan_features_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success'); 
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

   
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    
        db.query("SELECT * FROM `tbl_plan_features` WHERE deleted='0' order by plan_feature_id DESC",{ type:db.QueryTypes.SELECT}).then(function(features_list_result){
        if (features_list_result.length > 0) {

            page_data=features_list_result
 
        }

    // console.log(' db hello : ',page_data)



    const features_list = paginate(page_data,page, perPage);

    // console.log('Paginate **********  : ',features_list)

        res.render('admin-views/plan-features-list',{
        features_list,moment,profile_pic,first_name
 
        // success_msg,
        // err_msg 
    })
});  
} 
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
        res.redirect('/plan-features-list')

      });})
}
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

            // req.flash('success', 'Your Entry successfully updated !');
            res.redirect('/plan-features-list')
         
    })
}
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

            // req.flash('success', 'Your Entry successfully deleted !');
            res.redirect('/plan-features-list')
         
    })

}
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
        console.log(result)

             console.log(result)
             res.redirect('/plan-features-list')
         
    })

} 

//************************** PLAN-FEATURE LIST END **************************

exports.plan_feature_rel = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success'); 
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

   
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    //   console.log(plan_list) 
    db.query("SELECT feature_rel_id,plan_name,feature_name,tbl_plan_feature_rels.feature_status as status,tbl_plan_feature_rels.createdAt as created_at FROM tbl_plan_feature_rels INNER JOIN tbl_plan_features ON tbl_plan_feature_rels.feature_id=tbl_plan_features.plan_feature_id inner join tbl_verifier_plan_masters on tbl_plan_feature_rels.plan_id=tbl_verifier_plan_masters.plan_id",{ type:db.QueryTypes.SELECT}).then(function(features_list_result){

        if (features_list_result.length > 0) {

            page_data=features_list_result
 
        }

    // console.log(' db hello : ',page_data)



    const features_list = paginate(page_data,page, perPage);

    console.log('Paginate **********  : ',features_list)

     res.render('admin-views/plan-features-rel-list',{
        features_list,moment,profile_pic,first_name
 
        // success_msg,
        // err_msg  
    });
});  
}

// ************************ USER LIST ***********************************
exports.user_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success'); 
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

   
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    
        db.query("SELECT * FROM `tbl_user_registrations` order by reg_user_id DESC",{ type:db.QueryTypes.SELECT}).then(function(user_list_result){
        if (user_list_result.length > 0) {

            page_data=user_list_result
 
        }

    // console.log(' db hello : ',page_data)



    const user_list = paginate(page_data,page, perPage);

    // console.log('Paginate **********  : ',features_list)

        res.render('admin-views/user-list',{
            user_list,moment,profile_pic,first_name
 
        // success_msg,
        // err_msg 
    })
});  
}
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
             res.redirect('/user-list')
         
    })

}
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
exports.country_list = async (req,res,next )=> {
    var profile_pic = req.session.profile_pic;
    var first_name = req.session.first_name;
    success_msg = req.flash('success'); 
    err_msg = req.flash('err_msg');
    var admin_id = req.session.admin_id;

   
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    
        db.query("SELECT * FROM `tbl_countries`",{ type:db.QueryTypes.SELECT}).then(function(country_list_result){
        if (country_list_result.length > 0) {

            page_data=country_list_result
 
        }

    // console.log(' db hello : ',page_data)



    const country_list = paginate(page_data,page, perPage);

    // console.log('Paginate **********  : ',features_list)

        res.render('admin-views/country-list',{
            country_list,moment,profile_pic,first_name
 
        // success_msg,
        // err_msg 
    })
});  
} 

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




 