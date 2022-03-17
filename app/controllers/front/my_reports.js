var os = require('os');

const nodemailer = require("nodemailer");
const express = require('express');
var app=express();
const ejs = require('ejs');
const formidable = require('formidable');
var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime')
var crypto = require('crypto');
var text_func=require('../../helpers/text');
const {
    VerifierRequestCategoryModel,VerifierCategoryReflectidModel,CategoryDocument,ManageCategoryDocument
}= require("../../models/verifier_category")
var {MyReflectIdModel, DocumentReflectIdModel} = require('../../models/reflect');
var {MarketPlace} = require('../../models/admin');
var {tbl_address_book} = require('../../models/address_book');
var {UserModel,LogDetailsModel}=require('../../models/user');
var {DocumentMasterModel}=require('../../models/master');
var {MarketPlaceMsg} = require('../../models/market_place')
var {NotificationModel} = require('../../models/notification');
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel} = require('../../models/request');
var {ReportMasterModel,ReportFilterModel,FilterColumnModel,ScheduleReportModel} = require('../../models/my_reports');
// var pdf = require("html-pdf");

var mail_func=require('../../helpers/mail');
const util = require('util');
const { base64encode, base64decode } = require('nodejs-base64');
var async = require('async');
var userData = require('../../helpers/profile')
const paginate   =  require("paginate-array");
var moment = require('moment'); 
const generateUniqueId = require('generate-unique-id');
 
const ipfsAPI = require('ipfs-api');
const fs = require('fs');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

/**my-reports-list Get method START**/
exports.my_report_list = async(req,res,next)=>{
    
    var reg_id= req.session.user_id 
    console.log('report list')
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")
   
    var user_type=req.session.user_type;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    
  //     var test = req.session.checked_array;
   

  // if(test===undefined)
  //       {
  //           // checked_array_con=1;
  //       }
  //       else{
  //          req.session.destroy(function (err) { })
        
        // }   
    db.query("SELECT * FROM `tbl_countries` WHERE  status='active'",{ type:db.QueryTypes.SELECT}).then(function(country_list){

        db.query("SELECT * FROM `tbl_master_reports` WHERE deleted='0' and status='active'",{ type:db.QueryTypes.SELECT}).then(function(master_report_list){

        db.query("SELECT *,tbl_report_filters.createdAt as 'report_created_date',tbl_report_filters.updatedAt as 'report_updated_date' FROM tbl_report_filters inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_report_filters.reflect_id where tbl_report_filters.deleted='0' and archive='0' and tbl_report_filters.reg_user_id="+reg_id+" and tbl_report_filters.user_type='"+user_type+"' and report_filter_id not in(SELECT report_filter_id FROM `tbl_report_schedules`) order by report_filter_id desc",{ type:db.QueryTypes.SELECT}).then(function(report_list_result){

            if (report_list_result.length > 0) {

                page_data=report_list_result
     
            }
    
        // console.log(' db hello : ',report_list_result)
    
    
    
        const report_list = paginate(page_data,page, perPage);
        res.render('front/my-reports/my-reports-list',{ success_msg,
            err_msg,master_report_list,report_list,
        //    market_list_result,
           session:req.session,user_type,moment,country_list,report_list_result
         

        });
        });
    });
    })
    
   
    }
/**my-reports-list Get method END**/


/**individual-delete-report Post method START**/
exports.individual_delete_report = async(req,res,next)=>{

    const report_filter_id = req.body.report_filter_id
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');

    console.log('*******************individual_delete_report ********************** ')

    console.log('report_id :',report_filter_id)
    var updateValues=
    {
        deleted_at:formatted,
        deleted:'1'
    }
    await ReportFilterModel.update(updateValues, { where: { report_filter_id: report_filter_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully deleted !');
            res.redirect('/my-reports-list')
         
    })
    

    }
/**individual-delete-report Post method END**/

// /**individual-saveas-report Post method START**/
// exports.individual_saveas_report = async(req,res,next)=>{

//     var report_filter_id = req.body.report_filter_id;
//     var report_name = req.body.report_name;
//     var description = req.body.description;

//     var dt = dateTime.create(); 
//     var formatted = dt.format('Y-m-d H:M:S');
    
//     console.log("report_id ",report_filter_id);
//     console.log("report_name ",report_name);
//     console.log("description ",description);
//     var updateValues=
//     {
//         updatedAt:formatted,
//         description:description,
//         report_name:report_name
//     }
//     await ReportFilterModel.update(updateValues, { where: { report_filter_id: report_filter_id } }).then((result) => 
//     {

//             req.flash('success_msg', 'Your Entry successfully save as !');
//             res.redirect('/my-reports-list')
         
//     })
    
            
        
//             }   
// /**individual-saveas-report Post method END**/

/**get-on-edit Post method START**/     
exports.get_on_edit = async (req,res,next) =>{
    var report_id = req.body.checked_value;
    var reg_user_id = req.session.user_id
    var user_type = req.session.user_type;

    console.log("report_type************* ",report_id , "user id ",reg_user_id);

    await db.query("SELECT * FROM `tbl_wallet_reflectid_rels` WHERE user_as='verifier' and reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(all_reflet_code){


    await db.query("SELECT * FROM tbl_master_reports WHERE deleted='0' and status='active' and report_id="+report_id,{ type:db.QueryTypes.SELECT}).then(async function(market_list_result){
        var report_type = market_list_result[0].report_name;
        console.log("market_list_result************* ",market_list_result, " ",report_type);
       
        db.query("SELECT * FROM `tbl_countries` WHERE  status='active'",{ type:db.QueryTypes.SELECT}).then(async function(country_list){
        var checked_array=[];
        if(report_id==1){
            db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE  tbl_user_registrations.reg_user_id<>"+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(my_client_user){
            await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){
                    res.render('front/my-reports/client-report-sub_verifier',{ all_reflet_code,my_client_user,success_msg,err_msg,country_list,session:req.session,sub_verifier_data,market_list_result});
            })})
        }
        else if(report_id==2){
            db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE  tbl_user_registrations.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(my_client_user){

            await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){


                if(reflet_id_data.length>0){
                for(var i=0;i<reflet_id_data.length;i++){
                    if(reflet_id_data[i].entity_company_country!=null){
                    await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                        reflet_id_data[i].country_name = country_data[0].country_name;
                        // console.log("reflet_id_data ",reflet_id_data); 
                        if(i==(reflet_id_data.length-1)){
                            res.render('front/my-reports/client-report-reflet_id',{ all_reflet_code,success_msg,err_msg,session:req.session,reflet_id_data,market_list_result,my_client_user,country_list,checked_array});
                        } 
                        
                    })
                }else{
                    reflet_id_data[i].country_name = '-';
                    if(i==(reflet_id_data.length-1)){
                        res.render('front/my-reports/client-report-reflet_id',{all_reflet_code, success_msg,err_msg,session:req.session,reflet_id_data,market_list_result,my_client_user,country_list,checked_array});
                    } 
                }
                }
                }else{
                    res.render('front/my-reports/client-report-reflet_id',{all_reflet_code, success_msg,err_msg,session:req.session,reflet_id_data:[],market_list_result,my_client_user,country_list,checked_array});
                }
            })})
        }
        else if(report_id==3){
            db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE user_as='verifier' and tbl_user_registrations.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_user){
                db.query("SELECT distinct category_name,tbl_verifier_category_reflectids.category_id as 'category_id' FROM `tbl_verifier_category_reflectids` inner join tbl_verifier_request_categories on tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id WHERE tbl_verifier_category_reflectids.reg_user_id="+reg_user_id+" and parent_category='0'",{ type:db.QueryTypes.SELECT}).then(async function(parent_category){
                    db.query("SELECT * FROM `tbl_verifier_request_categories` WHERE parent_category<>'0'",{ type:db.QueryTypes.SELECT}).then(async function(sub_category){
                db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE reflectid_by!='digitalWallet' and  user_as='client' and tbl_user_registrations.reg_user_id <>"+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(client_user){

            await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
                // console.log("ver_par_cat_data ",ver_par_cat_data);  
                if(ver_par_cat_data.length>0){
                for(var i=0;i<ver_par_cat_data.length;i++){
                    await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                        ver_par_cat_data[i].client_sub = client_sub_cat_data;
                        if(i==(ver_par_cat_data.length-1)){
                            console.log("ver_par_cat_data ",ver_par_cat_data[0].client_sub);  
                            console.log("ver_par_cat_data ",ver_par_cat_data);  
                            res.render('front/my-reports/client-report-on-boarding',{sub_category,client_user, parent_category,verifier_user,success_msg,err_msg,session:req.session,ver_par_cat_data,market_list_result,all_reflet_code}); 
                            
                        } 
                    })
                } 
            }else{
                res.render('front/my-reports/client-report-on-boarding',{all_reflet_code,client_user,parent_category,sub_category, verifier_user,success_msg,err_msg,session:req.session,ver_par_cat_data:[],market_list_result});
            }
            })})})})})
        }
        
        else if(report_id==5){
            if(user_type=='client')
            {
                console.log("client ");  

           

                db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE user_as='verifier'  and tbl_user_registrations.reg_user_id <>"+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_user){

                    db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE reflectid_by!='digitalWallet' and user_as='client' and tbl_user_registrations.reg_user_id ="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(my_client_user){
            await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id,entity_company_name from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
                // console.log("complaint_data ",complaint_data);  
   
    
                res.render('front/my-reports/client-report-complaint_data',{ verifier_user,my_client_user,all_reflet_code,market_list_result,success_msg,err_msg,session:req.session,complaint_data,user_type,moment});
            })})})
        }else{
            console.log("verifier ");  
            db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE user_as='verifier' and tbl_user_registrations.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_user){
    
                db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE reflectid_by!='digitalWallet' and user_as='client' and tbl_user_registrations.reg_user_id <>"+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(my_client_user){
            await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,entity_company_name,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
       
    
                console.log("complaint_data ",complaint_data);  
                res.render('front/my-reports/client-report-complaint_data',{my_client_user, market_list_result,all_reflet_code,success_msg,err_msg,session:req.session,complaint_data,user_type,moment,verifier_user});
                })
            })})
        }
        }
        else if(report_id==4)
        {
            await db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and reflectid_by!='digitalWallet' and user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_data){
              
                db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE reflectid_by!='digitalWallet' and user_as='client' and tbl_user_registrations.reg_user_id ="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(my_client_user){
                console.log("reflet_id_data ",client_data);  

                if(client_data.length>0){
                    for(var i=0;i<client_data.length;i++){
                        if(client_data[i].entity_company_country!=null){
                        await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                            client_data[i].country_name = country_data[0].country_name;
                            // console.log("reflet_id_data ",client_data); 
                            if(i==(client_data.length-1)){
                                res.render('front/my-reports/client-report-client_data',{ my_client_user,all_reflet_code,country_list,market_list_result,success_msg,err_msg,session:req.session,client_data,moment});
                            } 
                            
                        })
                    }else{
                        client_data[i].country_name = '-';
                        if(i==(client_data.length-1)){
                            // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                            res.render('front/my-reports/client-report-client_data',{ my_client_user,country_list,all_reflet_code,market_list_result,success_msg,err_msg,session:req.session,client_data,moment});
                        } 
                    }
                    }
                    }else{
                        // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                        res.render('front/my-reports/client-report-client_data',{my_client_user,all_reflet_code,country_list, market_list_result,success_msg,err_msg,session:req.session,client_data,moment});
                    }
                })
              
            })
        }
    })    })
})
}             
/**get-on-edit Post method END**/     

/**run-complaint Post method START**/     
exports.run_complaint = async (req,res,next) =>{
    var user_type = req.session.user_type;
    var reg_user_id = req.session.user_id; 
    var checked_array = req.body.checked_new;
    console.log("checked_array\\\\\\\\\\\\\\\\ ",checked_array);

    var checked_array_con;
  
        if(checked_array===undefined)
        {
            checked_array_con=1;
        }
        else{
            checked_array_con=0;
        
        }   
    if(user_type=='client')
    {
        console.log("client ");  

    await db.query("SELECT complain_id,created_at,entity_company_name,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
        console.log("reflet_id_data ",complaint_data);  
        res.render('front/my-reports/complaint_ajax',{ success_msg,err_msg,session:req.session,complaint_data,checked_array_con,checked_array,user_type});
    })
}else{
    console.log("verifier ");  

    await db.query("SELECT complain_id,created_at,rep_firstname,entity_company_name,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
        console.log("reflet_id_data ",complaint_data);  
        res.render('front/my-reports/complaint_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type});
    })

}
}
/**run-complaint Post method END**/     

/**run-client Post method START**/     
exports.run_client = async (req,res,next) =>{
    var user_type = req.session.user_type;
    var reg_user_id = req.session.user_id; 
    var checked_array = req.body.checked_new;

    console.log("checked_array\\\\\\\\\\\\\\\\ ",checked_array);
    var checked_array_con;
  
    if(checked_array===undefined)
    {
        checked_array_con=1;
    }
    else{
        checked_array_con=0;
    
    }   
    await db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and reflectid_by!='digitalWallet' and user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_data){
        // console.log("reflet_id_data ",client_data);  
        if(client_data.length>0){
            for(var i=0;i<client_data.length;i++){
                if(client_data[i].entity_company_country!=null){
                await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                    client_data[i].country_name = country_data[0].country_name;
                    // console.log("reflet_id_data ",client_data); 
                    if(i==(client_data.length-1)){
                        res.render('front/my-reports/client_ajax',{checked_array_con, success_msg,err_msg,session:req.session,client_data,checked_array});

                    } 
                    
                })
            }else{
                client_data[i].country_name = '-';
                if(i==(client_data.length-1)){
                    // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                    res.render('front/my-reports/client_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,client_data,checked_array});

                } 
            }
            }
            }else{
                // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                res.render('front/my-reports/client_ajax',{ success_msg,err_msg,session:req.session,client_data,checked_array_con,checked_array});

            }
    })
}
/**run-client Post method END**/     

/**run-myReflect Post method START**/     
exports.run_myreflet = async (req,res,next) =>{
    var user_type = req.session.user_type;
    var reg_user_id = req.session.user_id; 
    var checked_array = req.body.checked_new;

    var checked_array_con_reflet;
  
        if(checked_array===undefined)
        {
            checked_array_con_reflet=1;
        }
        else{
            checked_array_con_reflet=0;
        
        }   
    // console.log("checked_array\\\\\\\\\\\\\\\\ ",checked_array);
    await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){
        if(reflet_id_data.length>0){
        for(var i=0;i<reflet_id_data.length;i++){
            if(reflet_id_data[i].entity_company_country!=null){
            await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                reflet_id_data[i].country_name = country_data[0].country_name;
                // console.log("reflet_id_data ",reflet_id_data); 
                if(i==(reflet_id_data.length-1)){
                    res.render('front/my-reports/reflet_ajax',{checked_array_con_reflet, success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                } 
                
            })
        }else{
            reflet_id_data[i].country_name = '-';
            if(i==(reflet_id_data.length-1)){
                res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array_con_reflet,checked_array});
            } 
        }
        }
        }else{
            res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array_con,checked_array});
        }
    })
}
/**run-myReflect Post method END**/     

/**run-on-boarding Post method START**/     
exports.run_on_boarding = async (req,res,next) =>{
    // var user_type = req.session.user_type;
    var reg_user_id = req.session.user_id; 
    var checked_array = req.body.checked_new;

    var checked_array_con;
  
        if(checked_array===undefined)
        {
            checked_array_con=1;
        }
        else{
            checked_array_con=0;
        
        }   
    // console.log("checked_array\\\\\\\\\\\\\\\\ ",checked_array);
    await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
        // console.log("ver_par_cat_data ",ver_par_cat_data); 
        if(ver_par_cat_data.length>0){
        for(var i=0;i<ver_par_cat_data.length;i++){
            await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                ver_par_cat_data[i].client_sub = client_sub_cat_data;
                if(i==(ver_par_cat_data.length-1)){
                    console.log("ver_par_cat_data ",ver_par_cat_data[0].client_sub);  
                    console.log("ver_par_cat_data ",ver_par_cat_data);  
                    res.render('front/my-reports/on_boarding_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,ver_par_cat_data,checked_array}); 
                    
                } 
            })
        } 
        }else{
            res.render('front/my-reports/on_boarding_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,ver_par_cat_data:[],checked_array}); 
        }
    })
}
/**run-on-boarding Post method END**/  

/**run-sub_verifier Post method START**/     
exports.run_sub_verifier = async (req,res,next) =>{
    var user_type = req.session.user_type;
    var reg_user_id = req.session.user_id; 
    var checked_array = req.body.checked_new;
    var checked_array_con_sub;
  
        if(checked_array===undefined)
        {
            checked_array_con_sub=1;
        }
        else{
            checked_array_con_sub=0;
        
        }   
    console.log("checked_array\\\\\\\\\\\\\\\\ ",checked_array);
    await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){
        res.render('front/my-reports/sub_verifier_ajax',{ checked_array_con_sub,success_msg,err_msg,session:req.session,sub_verifier_data,checked_array});
    })
}
/**run-sub_verifier Post method END**/     

/**save-report Post method START**/     
exports.save_report = async (req,res,next) =>{
    var report_id = req.body.report_id;

        var checked_column_array_1 = req.body.checked_column_1;

          console.log("checked_column ",checked_column_array);


    var checked_column_array = req.body.checked_column;

     console.log("checked_column_array ",checked_column_array);

    var checked_column = checked_column_array.split(',');
    var report_name = req.body.report_name;
    var description = req.body.description;

    var reflect_id = req.body.reflect_id_report;

    var user_type=req.session.user_type;

    // console.log("report_id ",report_id);
    console.log("checked_column ",checked_column);
    // console.log("report_name ",report_name);
    // console.log("description ",description);
    await ReportFilterModel.create({report_id:report_id,reflect_id:reflect_id,user_type:user_type,reg_user_id:req.session.user_id,report_name:report_name,description:description}).then(async saved_report =>{
        console.log("saved_report ",saved_report);
        for(var i=0;i<checked_column.length;i++) {
            await FilterColumnModel.create({report_filter_id:saved_report.report_filter_id,column_name:checked_column[i]}).then(async success =>{
              console.log("success");
              if(i==(checked_column.length-1)){
                res.redirect('/my-reports-list');
              }
            })
        }
    })
}
/**save-report Post method END**/     

/**view-report-list Get method START**/     
exports.view_report_list = async(req,res,next)=>{

    var report_filter_id = req.query.id;
    var report_id = req.query.report_id;
    var user_type = req.session.user_type;

    var reg_user_id= req.session.user_id
    console.log('report list')
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")
   
    var column_name_array=[];
    console.log("************report_id************* ",report_id);

        db.query("SELECT * FROM `tbl_report_schedules` where report_filter_id="+report_filter_id,{ type:db.QueryTypes.SELECT}).then(function(schedule_list){

    db.query("SELECT * FROM `tbl_report_filters` where deleted='0' and  report_filter_id="+report_filter_id,{ type:db.QueryTypes.SELECT}).then(async function(report_data){
            
        console.log("************report_data************* ",report_data);
    db.query("SELECT * FROM tbl_report_filter_columns where deleted='0' and report_filter_id="+report_filter_id+" order by report_filter_id desc",{ type:db.QueryTypes.SELECT}).then(async function(view_column_list){
        for(var i=0;i<view_column_list.length;i++)
        {
            column_name_array[i]=view_column_list[i].column_name;
        }
        console.log("************column_name_array************* ",column_name_array);

   if(report_id==5){
         if(user_type=='client')
                    {
                        console.log("client ");  

                    await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
                        // console.log("reflet_id_data ",complaint_data);  
                        res.render('front/my-reports/view-complain',{ success_msg,err_msg,session:req.session,complaint_data,column_name_array,user_type,report_data,schedule_list});
                    })
                }else{
                    console.log("verifier ");  

                    await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
                        // console.log("reflet_id_data ",complaint_data);  
                        res.render('front/my-reports/view-complain',{ success_msg,err_msg,session:req.session,complaint_data,column_name_array,user_type,report_data,schedule_list});
                    })

                }
        }
    else if(report_id==4){
        await db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and reflectid_by!='digitalWallet' and  user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_data){
            console.log("reflet_id_data ",client_data);  
        
            if(client_data.length>0){
                for(var i=0;i<client_data.length;i++){
                    if(client_data[i].entity_company_country!=null){
                    await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                        client_data[i].country_name = country_data[0].country_name;
                        // console.log("reflet_id_data ",client_data); 
                        if(i==(client_data.length-1)){
                            // res.render('front/my-reports/client_ajax',{ success_msg,err_msg,session:req.session,client_data,checked_array});
                            res.render('front/my-reports/view-client',{ column_name_array,success_msg,err_msg,session:req.session,client_data,report_data,schedule_list});
                        } 
                        
                    })
                }else{
                    client_data[i].country_name = '-';
                    if(i==(client_data.length-1)){
                        // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                        res.render('front/my-reports/view-client',{ column_name_array,success_msg,err_msg,session:req.session,client_data,report_data,schedule_list});
    
                    } 
                }
                }
                }else{
                    // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                    res.render('front/my-reports/view-client',{ column_name_array,success_msg,err_msg,session:req.session,client_data,report_data,schedule_list});
    
                }
        })
    }
     else if(report_id==2){
        await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){

            if(reflet_id_data.length>0){
            for(var i=0;i<reflet_id_data.length;i++){
                if(reflet_id_data[i].entity_company_country!=null){
                await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                    reflet_id_data[i].country_name = country_data[0].country_name;
                    // console.log("reflet_id_data ",reflet_id_data); 
                    if(i==(reflet_id_data.length-1)){
                        res.render('front/my-reports/view-reflet',{ report_data,success_msg,err_msg,session:req.session,
                 user_type,column_name_array,report_filter_id,reflet_id_data});
                    } 
                    
                })
            }else{
                reflet_id_data[i].country_name = '-';
                if(i==(reflet_id_data.length-1)){
                    res.render('front/my-reports/view-reflet',{  report_data,success_msg,err_msg,session:req.session,
                        user_type,column_name_array,report_filter_id,reflet_id_data});
                } 
            }
            }
            }else{
                res.render('front/my-reports/view-reflet',{ report_data,success_msg,err_msg,session:req.session,
                    user_type,column_name_array,report_filter_id,reflet_id_data});
            }
        })
    }
    else if(report_id==3){
        await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
            // console.log("ver_par_cat_data ",ver_par_cat_data);  
            if(ver_par_cat_data.length>0){
            for(var i=0;i<ver_par_cat_data.length;i++){
                await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                    ver_par_cat_data[i].client_sub = client_sub_cat_data;
                    if(i==(ver_par_cat_data.length-1)){
                        console.log("ver_par_cat_data ",ver_par_cat_data[0].client_sub);  
                        console.log("ver_par_cat_data ",ver_par_cat_data);  
                        res.render('front/my-reports/view-report-on-boarding',{column_name_array,report_data,success_msg,err_msg,session:req.session,ver_par_cat_data}); 
                        
                    } 
                })
            } 
        }else{
            res.render('front/my-reports/view-report-on-boarding',{ column_name_array,report_data,success_msg,err_msg,session:req.session,ver_par_cat_data:[]});
        }
        })
    }
      
    if(report_id==1){
        await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){
            
            res.render('front/my-reports/view-sub_verifier',{ success_msg,err_msg,session:req.session,sub_verifier_data,column_name_array,user_type,report_data,schedule_list});
        })
    }       
                 
       
    })})})
    
   
}
/**view-report-list Get method END**/     

/**individual-saveas-report Post method START**/     
exports.individual_saveas_report = async(req,res,next)=>{ 

    var user_type = req.session.user_type;

    var report_filter_id = req.body.report_filter_id;
    var report_name = req.body.report_name;
    var description = req.body.description;
    var report_id=req.body.report_id;

    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');
        var reflect_id = req.body.reflect_id_report;

    var checked_column=[];
    console.log("report_id ",report_filter_id);
    console.log("report_name ",report_name);
    console.log("description ",description);

  await  FilterColumnModel.findAll({where:{report_filter_id:report_filter_id,deleted:1}}).then(async report_result => {
        // console.log("********* report_result *********",report_result);
       
        for(var i=0;i<report_result.length;i++)
        {
            checked_column[i]=report_result[i].column_name;
        }
        console.log("report_id ",report_id);

        // console.log("checked_column ",checked_column);

    await ReportFilterModel.create({user_type:user_type,report_id:report_id,reflect_id:reflect_id,reg_user_id:req.session.user_id,report_name:report_name,description:description}).then(async saved_report =>{

        // console.log("saved_report ",saved_report);
        console.log("checked_column ",checked_column);

        console.log("checked_column length ",checked_column.length);

        for(var i=0;i<checked_column.length;i++) {

            await FilterColumnModel.create({report_filter_id:saved_report.report_filter_id,column_name:checked_column[i]}).then(async success =>{

              console.log("success");
              
            })
        }
    })
})
    
req.flash('success_msg', 'Your Entry successfully save as !');
res.redirect('/my-reports-list');
            }   
/**individual-saveas-report Post method END**/     

/**individual-report-edit GET method START**/     
exports.individual_report_edit = async(req,res,next)=>{
    
    var report_filter_id = req.query.id;
    var report_id = req.query.report_id;
    var user_type = req.session.user_type;
    var column_name_array=[];
                var reg_user_id= req.session.user_id
                console.log('report list')
                success_msg=req.flash("success_msg")
                err_msg=req.flash("err_msg")

                // console.log('report_id : ',report_id)
                console.log('report_filter_id : ',report_filter_id)

                db.query("SELECT * FROM `tbl_countries` WHERE  status='active'",{ type:db.QueryTypes.SELECT}).then(function(country_list){

                db.query("SELECT * FROM `tbl_report_filters` where deleted='0' and  report_filter_id="+report_filter_id,{ type:db.QueryTypes.SELECT}).then(async function(report_data){
             
                    // console.log("************report_data************* ",report_data);

                db.query("SELECT * FROM tbl_report_filter_columns where deleted='0' and report_filter_id="+report_filter_id+" order by report_filter_id desc",{ type:db.QueryTypes.SELECT}).then(async function(view_column_list){
                    for(var i=0;i<view_column_list.length;i++)
                    {
                        column_name_array[i]=view_column_list[i].column_name;
                    }
                    console.log("************view_column_list************* ",view_column_list);

                    console.log("************column_name_array************* ",column_name_array);
                    
                // req.session.checked_array=column_name_array;  
                  
    await db.query("SELECT * FROM tbl_master_reports WHERE deleted='0' and status='active' and report_id="+report_id,{ type:db.QueryTypes.SELECT}).then(async function(market_list_result){
        var report_type = market_list_result[0].report_name;
        // console.log("market_list_result************* ",market_list_result, " ",report_type);

        if(report_id==1){
            db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE  tbl_user_registrations.reg_user_id<>"+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(my_client_user){
            await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){
                res.render('front/my-reports/individual-edit-report-sub_verifier',{  market_list_result,success_msg,err_msg,session:req.session,
                    user_type,column_name_array,report_filter_id,report_data,my_client_user,country_list,sub_verifier_data});
            })
        })
        }
       else if(report_id==2){
            db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE  tbl_user_registrations.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(my_client_user){

            await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){

                if(reflet_id_data.length>0){
                for(var i=0;i<reflet_id_data.length;i++){
                    if(reflet_id_data[i].entity_company_country!=null){
                    await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                        reflet_id_data[i].country_name = country_data[0].country_name;
                        // console.log("reflet_id_data ",reflet_id_data); 
                        if(i==(reflet_id_data.length-1)){
                            res.render('front/my-reports/individual-edit-report-reflet_data',{  market_list_result,success_msg,err_msg,session:req.session,
                     user_type,column_name_array,report_filter_id,report_data,my_client_user,country_list,reflet_id_data});
                        } 
                        
                    })
                }else{
                    reflet_id_data[i].country_name = '-';
                    if(i==(reflet_id_data.length-1)){
                        res.render('front/my-reports/individual-edit-report-reflet_data',{  market_list_result,success_msg,err_msg,session:req.session,
                            user_type,column_name_array,report_filter_id,report_data,my_client_user,country_list,reflet_id_data});
                    } 
                }
                }
                }else{
                    res.render('front/my-reports/individual-edit-report-reflet_data',{  market_list_result,success_msg,err_msg,session:req.session,
                        user_type,column_name_array,report_filter_id,report_data,my_client_user,country_list,reflet_id_data});
                }
            })})
        }
        else if(report_id==5){
            if(user_type=='client')
            {
                console.log("client ");  

            await db.query("SELECT complain_id,created_at,rep_firstname,entity_company_name,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
                console.log("complaint_data ",complaint_data);  

                db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE user_as='verifier'  and tbl_user_registrations.reg_user_id <>"+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_user){

                    db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE reflectid_by!='digitalWallet' and user_as='client' and tbl_user_registrations.reg_user_id ="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(my_client_user){
                res.render('front/my-reports/individual-edit-report-complaint_data',{
                     market_list_result,success_msg,err_msg,session:req.session,
                     complaint_data,user_type,column_name_array,report_filter_id,report_data,verifier_user,my_client_user,country_list});
            })
        })
    })
        }else{
            console.log("verifier ");  

            await db.query("SELECT complain_id,created_at,rep_firstname,entity_company_name,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){

                db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE user_as='verifier' and tbl_user_registrations.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_user){
    
                    db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE reflectid_by!='digitalWallet' and user_as='client' and tbl_user_registrations.reg_user_id <>"+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(my_client_user){
                        
                    res.render('front/my-reports/individual-edit-report-complaint_data',{
                         market_list_result,success_msg,err_msg,session:req.session,
                         complaint_data,user_type,column_name_array,report_filter_id,report_data,verifier_user,my_client_user});
                })
            })
        })
        }
        }
        else if(report_id==4)
        {
            await db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and reflectid_by!='digitalWallet' and  user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_data){


                db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE reflectid_by!='digitalWallet' and user_as='client' and tbl_user_registrations.reg_user_id ="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(my_client_user){
                    if(client_data.length>0){
                        for(var i=0;i<client_data.length;i++){
                            if(client_data[i].entity_company_country!=null){
                            await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                                client_data[i].country_name = country_data[0].country_name;
                                // console.log("reflet_id_data ",client_data); 
                                if(i==(client_data.length-1)){
                                    res.render('front/my-reports/individual-edit-report-client_data',{ column_name_array,market_list_result,success_msg,err_msg,session:req.session,client_data,report_filter_id,report_data,my_client_user,country_list})
                                } 
                                
                            })
                        }else{
                            client_data[i].country_name = '-';
                            if(i==(client_data.length-1)){
                                // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                                res.render('front/my-reports/individual-edit-report-client_data',{ column_name_array,market_list_result,success_msg,err_msg,session:req.session,client_data,report_filter_id,report_data,my_client_user,country_list})
                            } 
                        }
                        }
                        }else{
                            // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                            res.render('front/my-reports/individual-edit-report-client_data',{ column_name_array,market_list_result,success_msg,err_msg,session:req.session,client_data,report_filter_id,report_data,my_client_user,country_list})
                        }
                console.log("reflet_id_data ",client_data);  
           ;
            })
        })
        }
        else if(report_id==3){
            db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE user_as='verifier' and tbl_user_registrations.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_user){
                db.query("SELECT distinct category_name,tbl_verifier_category_reflectids.category_id as 'category_id' FROM `tbl_verifier_category_reflectids` inner join tbl_verifier_request_categories on tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id WHERE tbl_verifier_category_reflectids.reg_user_id="+reg_user_id+" and parent_category='0'",{ type:db.QueryTypes.SELECT}).then(async function(parent_category){
                    db.query("SELECT * FROM `tbl_verifier_request_categories` WHERE parent_category<>'0'",{ type:db.QueryTypes.SELECT}).then(async function(sub_category){
                db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE reflectid_by!='digitalWallet' and user_as='client' and tbl_user_registrations.reg_user_id <>"+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(client_user){
            await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
                // console.log("ver_par_cat_data ",ver_par_cat_data);  
                if(ver_par_cat_data.length>0){
                for(var i=0;i<ver_par_cat_data.length;i++){
                    await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                        ver_par_cat_data[i].client_sub = client_sub_cat_data;
                        if(i==(ver_par_cat_data.length-1)){
                            console.log("ver_par_cat_data ",ver_par_cat_data[0].client_sub);  
                            console.log("ver_par_cat_data ",ver_par_cat_data);  
                            res.render('front/my-reports/individual-edit-report-boarding',{client_user,column_name_array,report_data,verifier_user,success_msg,err_msg,session:req.session,ver_par_cat_data,sub_category,market_list_result,report_filter_id,parent_category}); 
                            
                        } 
                    })
                } 
            }else{
                res.render('front/my-reports/individual-edit-report-boarding',{client_user,verifier_user,sub_category,column_name_array,report_data,success_msg,err_msg,session:req.session,ver_par_cat_data:[],market_list_result,report_filter_id,parent_category});
            }
            })
            })
        })})})
        }
    })    
})          
})    
})  
}
/**individual-report-edit GET method END**/     

/**edit-save-report Post method START**/     
exports.edit_save_report = async (req,res,next) =>{

    var report_id = req.body.report_id;
    var checked_column_array = req.body.checked_column;
    var checked_column = checked_column_array.split(',');
    var report_name = req.body.report_name;
    var description = req.body.description;
    var report_filter_id = req.body.report_filter_id;

    var filter_column_array=[];

    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');
    // console.log("report_filter_id ",report_filter_id);
    // console.log("report_id ",report_id);
    var loop_length;
    // console.log("checked_column_array ",checked_column);
    var complain_list_1=checked_column.join("','");

    //  console.log("report_name ",complain_list_1);
    // console.log("description ",description);

    var updateValues_filter=
    {
        report_id:report_id,
        reg_user_id:req.session.user_id,
        report_name:report_name,
        description:description,
        updatedAt:formatted
    }

    await ReportFilterModel.update(updateValues_filter, { where: { report_filter_id: report_filter_id } }).then(async (result) => 
    {    
        await FilterColumnModel.findAll({ where:{report_filter_id:report_filter_id} }).then(async function(filter_data) {
            /** If entry is already then delete START **/
            db.query("SELECT report_column_id,column_name,report_filter_id FROM `tbl_report_filter_columns` WHERE report_filter_id="+report_filter_id+" and deleted='0'and report_column_id not IN (SELECT report_column_id FROM tbl_report_filter_columns where column_name In ('"+complain_list_1+"') ) ",{ type:db.QueryTypes.SELECT}).then(async function(delete_complain){
                for(var i=0;i<delete_complain.length;i++)
                {
                console.log("delete_complain column_name : ",delete_complain[i].column_name,"delete_complain column_name  ",delete_complain[i].report_column_id)
            var updateValues=
            {
                deleted_at:formatted,
                deleted:'1'
            }
            await FilterColumnModel.update(updateValues, { where: { report_column_id: delete_complain[i].report_column_id } }).then((result) => 
             {
                      console.log(' ***DELETED***  ')
                  
             })
                }
            })

           /** If entry is already then delete END**/

            /** If entry is not then INSERT START **/
           for(var i=0;i<checked_column.length;i++) {
   
            await db.query("SELECT * FROM `tbl_report_filter_columns` WHERE report_filter_id="+report_filter_id+" and column_name='"+checked_column[i]+"' and deleted='0'",{ type:db.QueryTypes.SELECT}).then(async function(create_complain){
                console.log('********* create_complain &&&&&&&& : ',i,': ',create_complain)  

                  if(create_complain.length===0)
                    { 
            await FilterColumnModel.create({report_filter_id:report_filter_id,column_name:checked_column[i]}).then(async success =>{
         
         
               })
            
                    }
                    else{ 
                        console.log('if loop_length : ',i,': ',checked_column[i])  

                    }
               })
                       
                    }
        /** If entry is not then INSERT End **/
           req.flash('success_msg', 'Your Entry successfully updated!');
                    res.redirect('/my-reports-list');
        
        })
        
        })
   
}
/**edit-save-report Post method END**/     


/**export_individual_report START**/
exports.export_individual_report = async(req,res,next)=>{

    var report_filter_id = req.body.report_filter_id;
    var report_id = req.body.report_id;
    var user_type = req.session.user_type;
    var i_val = req.body.i_val;
    var checked_array_con;
  
  
    var checked_array=[];
                var reg_user_id= req.session.user_id
                console.log('report list')
                success_msg=req.flash("success_msg")
                err_msg=req.flash("err_msg")
                db.query("SELECT * FROM `tbl_report_filters` where deleted='0' and  report_filter_id="+report_filter_id,{ type:db.QueryTypes.SELECT}).then(async function(report_data){
            
                    console.log("************report_data************* ",report_data);

                db.query("SELECT * FROM tbl_report_filter_columns where deleted='0' and report_filter_id="+report_filter_id+" order by report_filter_id desc",{ type:db.QueryTypes.SELECT}).then(async function(view_column_list){
                    for(var i=0;i<view_column_list.length;i++)
                    {
                        checked_array[i]=view_column_list[i].column_name;
                    }
                    console.log("************column_name_array************* ",checked_array);
                        
                     if(checked_array===undefined)
    {
        checked_array_con=1;
    }
    else{
        checked_array_con=0;
    
    }  
                    await db.query("SELECT * FROM tbl_master_reports WHERE deleted='0' and status='active' and report_id="+report_id,{ type:db.QueryTypes.SELECT}).then(async function(market_list_result){
                        var report_type = market_list_result[0].report_name;
        // console.log("market_list_result************* ",market_list_result, " ",report_type);


                if(report_id==2){
                    await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){
                    var    checked_array_con_reflet=checked_array_con;
                        if(reflet_id_data.length>0){
                        for(var i=0;i<reflet_id_data.length;i++){
                            if(reflet_id_data[i].entity_company_country!=null){
                            await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                                reflet_id_data[i].country_name = country_data[0].country_name;
                                // console.log("reflet_id_data ",reflet_id_data); 
                                if(i==(reflet_id_data.length-1)){
                                    res.render('front/my-reports/reflet_ajax',{ report_data,checked_array_con_reflet,success_msg,err_msg,session:req.session,
                             user_type,checked_array,report_filter_id,reflet_id_data});
                                } 
                                
                            })
                        }else{
                            reflet_id_data[i].country_name = '-';
                            if(i==(reflet_id_data.length-1)){
                                res.render('front/my-reports/reflet_ajax',{  report_data,checked_array_con_reflet,success_msg,err_msg,session:req.session,
                                    user_type,checked_array,report_filter_id,reflet_id_data});
                            } 
                        }
                        }
                        }else{
                            console.log("reflet_id_data ",reflet_id_data);  
                            res.render('front/my-reports/reflet_ajax',{ i_val,checked_array_con_reflet,
                                market_list_result,success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                        }
                    })
                }
            
                else if(report_id==5){
                    if(user_type=='client')
                    {
                        console.log("client ");  

                    await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
                        console.log("complaint_data ",complaint_data);  
                        res.render('front/my-reports/complaint_ajax',{i_val,checked_array_con,
                            market_list_result,success_msg,err_msg,session:req.session,
                            complaint_data,user_type,checked_array,report_filter_id,report_data});
                    })
                }else{
                    console.log("verifier ");  

                    await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
                        console.log("complaint_data ",complaint_data);  
                        res.render('front/my-reports/complaint_ajax',{ i_val,checked_array_con,market_list_result,success_msg,err_msg,session:req.session,complaint_data,report_filter_id,user_type,report_data,checked_array});
                    })
                }
                }
                else if(report_id==4)
                {
                    await db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and reflectid_by!='digitalWallet' and user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_data){
                        
                        if(client_data.length>0){
                            for(var i=0;i<client_data.length;i++){
                                if(client_data[i].entity_company_country!=null){
                                await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                                    client_data[i].country_name = country_data[0].country_name;
                                    // console.log("reflet_id_data ",client_data); 
                                    if(i==(client_data.length-1)){
                                        res.render('front/my-reports/client_ajax',{ i_val,checked_array,market_list_result,success_msg,err_msg,session:req.session,client_data,report_filter_id,checked_array_con,report_data});
                                    } 
                                    
                                })
                            }else{
                                client_data[i].country_name = '-';
                                if(i==(client_data.length-1)){
                                    // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                                    res.render('front/my-reports/client_ajax',{ i_val,checked_array,market_list_result,success_msg,err_msg,checked_array_con,session:req.session,client_data,report_filter_id,report_data});
                                } 
                            }
                            }
                            }else{
                                // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                                res.render('front/my-reports/client_ajax',{ i_val,checked_array,market_list_result,success_msg,err_msg,session:req.session,checked_array_con,client_data,report_filter_id,report_data});
                            }
                    
                    })
                }
                else if(report_id==1)
                {
                    await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){
                        checked_array_con_sub=checked_array_con
                        res.render('front/my-reports/sub_verifier_ajax',{ success_msg,err_msg,checked_array_con_sub,session:req.session,sub_verifier_data,user_type,checked_array});    
                    })
                } 
                else if(report_id==3)
                {
                        await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
                            // console.log("ver_par_cat_data ",ver_par_cat_data);  
                            if(ver_par_cat_data.length>0){
                            for(var i=0;i<ver_par_cat_data.length;i++){
                                await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                                    ver_par_cat_data[i].client_sub = client_sub_cat_data;
                                    if(i==(ver_par_cat_data.length-1)){
                                        console.log("ver_par_cat_data ",ver_par_cat_data[0].client_sub);  
                                        console.log("ver_par_cat_data ",ver_par_cat_data);  
                                        res.render('front/my-reports/on_boarding_ajax',{checked_array,report_data,success_msg,err_msg,checked_array_con,checked_array_con,session:req.session,ver_par_cat_data}); 
                                        
                                    } 
                                })
                            } 
                        }else{
                            res.render('front/my-reports/on_boarding_ajax',{ checked_array,checked_array_con,checked_array_con,report_data,success_msg,err_msg,session:req.session,ver_par_cat_data:[]});
                        }
                        })
                    }
                
    })    
                
})    
})  
} 
/**export_individual_report END**/

/**individual_archive_report START**/
exports.individual_archive_report = async(req,res,next)=>{

    const report_filter_id = req.query.id
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');


    var updateValues=
    {
        archive_at:formatted,
        archive:'1'
    }
    await ReportFilterModel.update(updateValues, { where: {report_filter_id:report_filter_id} }).then((result) => 
    {
        console.log('result :',result)

            req.flash('success_msg', 'Your Entry successfully archive !');
            res.redirect('/my-reports-list')
         
    })
    

    }
/**individual_archive_report End**/

/**individual_archive_report START**/
exports.archive_list = async(req,res,next)=>{
    
    var reg_id= req.session.user_id 
    console.log('report list')
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")
   
    var user_type=req.session.user_type;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    

    db.query("SELECT * FROM `tbl_master_reports` WHERE deleted='0' and status='active'",{ type:db.QueryTypes.SELECT}).then(function(master_report_list){

    db.query("SELECT * FROM tbl_report_filters inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_report_filters.reflect_id where tbl_report_filters.deleted='0' and archive='1' and tbl_report_filters.reg_user_id="+reg_id+" and tbl_report_filters.user_type='"+user_type+"' order by report_filter_id desc",{ type:db.QueryTypes.SELECT}).then(function(report_list_result){

            if (report_list_result.length > 0) {

                page_data=report_list_result
     
            }
    
        // console.log(' db hello : ',page_data)
    
    
    
        const report_list = paginate(page_data,page, perPage);
        res.render('front/my-reports/archive-reports',{ success_msg,
            err_msg,master_report_list,report_list,
        //    market_list_result,
           session:req.session,user_type,moment
         

         });
        });
    })
    
   
    }
/**individual_archive_report End**/

/**individual_archive_report START**/
exports.individual_re_archive_report = async(req,res,next)=>{

    const report_filter_id = req.query.id
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');

    console.log('*******************individual_rearchive_report ********************** ')

    console.log('individual_rearchive_report :',report_filter_id)
    var updateValues=
    {
        archive_at:formatted,
        archive:'0'
    }
    await ReportFilterModel.update(updateValues, { where: {report_filter_id:report_filter_id} }).then((result) => 
    {
        console.log('result :',result)

            req.flash('success_msg', 'Your Entry successfully archive !');
            res.redirect('/archive-reports')
         
    })
    

    }
/**individual_archive_report End**/

/**individual_schedule_report START**/
exports.individual_schedule_report = async(req,res,next)=>{

    var user_id= req.session.user_id
    console.log('report list')
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")

    var report_filter_id= req.body.report_filter_id
    var report_name= req.body.report_name

    var start_date= req.body.start_date
    var end_date= req.body.end_date
    var preferred_time= req.body.preferred_time
    var frequency= req.body.frequency
    // var weekly_list= req.body.weekly_list
    // console.log('report_filter_id : ',report_filter_id)
    // console.log('frequency : ',frequency)
    // console.log('start_date : ',start_date)
    // console.log('end_date : ',end_date)
    // console.log('preferred_time : ',preferred_time)
    var dt = dateTime.create(); 
    var formatted = dt.format('Y-m-d H:M:S');

    var data;

    await  ScheduleReportModel.findAll({where:{report_filter_id:report_filter_id}}).then(async schedule_result => {
console.log(schedule_result);
console.log("length : ",schedule_result.length);

    if(schedule_result.length!=0)
    {
        data='update';
  
        if(frequency==='Weekly')
        {
            var weekly_list;
            weekly_list=req.body.weekly_list
            console.log('weekly_list : ',weekly_list)
            var updateValues_filter=
            {
                start_date:start_date,
                end_date:end_date,
                preferred_time:preferred_time,
                monthly:null,
                daily:null,           
                weekly:weekly_list
            }
        await ScheduleReportModel.update(updateValues_filter, { where: { report_filter_id: report_filter_id } }).then(async (result) => 
           { 
          await  UserModel.findOne({ where: { reg_user_id:user_id }}).then(userdata=>{

            data='update';
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
                subject: "MyReflet Schedule Report Update .",
          
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
                        <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${userdata.full_name}</h4>
                        <p><span style="color:red">Update!</span>Your <b>${report_name}</b> report schedule for Weekly.</p>
                        <p>Please Check the day : ${weekly_list}</p>
                        <p>Please Check the Date Range : ${start_date} - ${end_date}</p>

                        <p>Preffered Time : ${preferred_time}</p>

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
            })
            //    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')
            //    req.flash('success_msg', 'Your Entry successfully updated !');
            //    res.redirect('/my-reports-list');
   
           })
        }
        else if(frequency==='Monthly')
        { 
            var monthly_value= req.body.monthly_value
            console.log('monthly_value : ',monthly_value)
            var updateValues_filter=
            {
                start_date:start_date,
                end_date:end_date,
                preferred_time:preferred_time,
                monthly:monthly_value,
                daily:null,           
                weekly:null
                   }
        await ScheduleReportModel.update(updateValues_filter, { where: { report_filter_id: report_filter_id } }).then(async (result) => 
           { 
            await  UserModel.findOne({ where: { reg_user_id:user_id }}).then(userdata=>{

                data='update';
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
                    subject: "MyReflet Schedule Report Update.",
              
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
                            <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${userdata.full_name}</h4>
                            <p><span style="color:red">Update!</span>Your <b>${report_name}</b> report schedule for Monthly.</p>
                            <p>Please Check the report every month on  this date : ${monthly_value}<sup>th</sup></p>
                            <p>Please Check the Date Range : ${start_date} - ${end_date}</p>

                            <p>Preffered Time : ${preferred_time}</p>

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
                })
                // res.send("data")

            // console.log('&&&&&&&&&&&&&&&&&&&&&&')
            // req.flash('success_msg', 'Your Entry successfully updated !');
            // res.redirect('/my-reports-list');
            
                 
        })
    }
        else
        {
            console.log('daily : ',frequency)
            var updateValues_filter=
            {
                start_date:start_date,
                end_date:end_date,
                preferred_time:preferred_time,
                monthly:null   ,  
                daily:frequency,           
                weekly:null
                       }
        await ScheduleReportModel.update(updateValues_filter, { where: { report_filter_id: report_filter_id } }).then(async (result) => 
           { 
            await  UserModel.findOne({ where: { reg_user_id:user_id }}).then(userdata=>{

                data='update';
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
                    subject: "MyReflet Schedule Report Update.",
              
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
                            <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${userdata.full_name}</h4>
                            <p><span style="color:red">Update!</span> Your <b>${report_name}</b> report schedule for Daily.</p>
                            <p>Please Check the report Daily Between this date ${start_date} - ${end_date}</p>

                            <p>Preffered Time : ${preferred_time}</p>

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
                })
        })
        
        }
    }
   else
   {
    data='create';

    if(frequency==='Weekly')
    {
            var weekly_list;
        weekly_list=req.body.weekly_list
        console.log('weekly_list : ',weekly_list)
        await ScheduleReportModel.create({report_filter_id:report_filter_id,start_date:start_date,end_date:end_date,preferred_time:preferred_time,weekly:weekly_list
        }).then(async saved_report =>{
            data='create';
            await  UserModel.findOne({ where: { reg_user_id:user_id }}).then(userdata=>{

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
                    subject: "MyReflet Schedule Report.",
              
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
                            <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${userdata.full_name}</h4>
                            <p>Your <b>${report_name}</b> report schedule for weekly.</p>
                            <p>Please Check the day : ${weekly_list}</p>
                            <p>Please Check the Date Range : ${start_date} - ${end_date}</p>

                            <p>Preffered Time : ${preferred_time}</p>

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
                })
                // res.send("done")
            // req.flash('success_msg', 'Your Entry successfully created !');
            // res.redirect('/my-reports-list');
            
        })

    }
    else if(frequency==='Monthly')
    { 
        var monthly_value= req.body.monthly_value
        console.log('monthly_value : ',monthly_value)

        await ScheduleReportModel.create({report_filter_id:report_filter_id,start_date:start_date,end_date:end_date,preferred_time:preferred_time,monthly:monthly_value}).then(async saved_report =>{
            await  UserModel.findOne({ where: { reg_user_id:user_id }}).then(userdata=>{

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
                    subject: "MyReflet Schedule Report.",
              
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
                            <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${userdata.full_name}</h4>
                            <p>Your <b>${report_name}</b> report schedule for Monthly.</p>
                            <p>Please Check the report every month on  this date : ${monthly_value}<sup>th</sup></p>
                            <p>Please Check the Date Range : ${start_date} - ${end_date}</p>

                            <p>Preffered Time : ${preferred_time}</p>

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
                })
                // res.send("data")

            // req.flash('success_msg', 'Your Entry successfully created !');
            // res.redirect('/my-reports-list');

    
            
        })
     
    }
    else
    {
        console.log('daily : ',frequency)
        await ScheduleReportModel.create({report_filter_id:report_filter_id,start_date:start_date,end_date:end_date,preferred_time:preferred_time,daily:frequency}).then(async saved_report =>{
            await  UserModel.findOne({ where: { reg_user_id:user_id }}).then(userdata=>{

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
                    subject: "MyReflet Schedule Report.",
              
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
                            <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${userdata.full_name}</h4>
                            <p>Your <b>${report_name}</b> report schedule for Daily.</p>
                            <p>Please Check the report Daily Between this date ${start_date} - ${end_date}</p>

                            <p>Preffered Time : ${preferred_time}</p>

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
                })
                // res.send("data")


            // req.flash('success_msg', 'Your Entry successfully created !');
            // res.redirect('/my-reports-list');
            
    
        })
    }
}
})  
res.send(data)


}  
/**individual_schedule_report END**/

/**sechdule_data post START**/
exports.sechdule_data = async(req,res,next)=>{
    
    var report_filter_id = req.body.report_filter_id;
console.log(' sechdule_data : ',report_filter_id)
        db.query("SELECT * FROM `tbl_report_schedules` where report_filter_id="+report_filter_id,{ type:db.QueryTypes.SELECT}).then(function(sechdule_data){
            
            console.log(' sechdule_data : ',sechdule_data)
 res.send(sechdule_data)
        })
}
/**sechdule_data post  END**/
/** get_complaint_by_time Post method START**/     
exports.get_complaint_by_time = async (req,res,next) =>{
    var user_type = req.session.user_type;
    var reg_user_id = req.session.user_id; 
    // var checked_array_1 = req.body.checked_new;

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var checked_array = [];
    checked_array_1 = JSON.parse(req.body.date_list);

    var  StartDate = moment(startDate).format('YYYY-MM-DD');
    var  EndDate = moment(endDate).format('YYYY-MM-DD');

    console.log("startDate******************************* ",StartDate);  
    console.log("endDate******************************* ",EndDate);  
    console.log("checked_array******************************* ",checked_array_1[0]);  
    console.log("checked_array******************************* ",checked_array_1[1]);  

    var checked_array=req.body.checked_new;

    var checked_array_con;
  
        if(checked_array===undefined)
        {
            checked_array_con=1;
        }
        else{
            checked_array_con=0;
        
        }   
    console.log("checked_array\\\\\\\\\\\\\\\\ ",checked_array_1);
    if(checked_array_1[0]==='created'||checked_array_1[1]==='created'&& checked_array_1[0]==='updated'||checked_array_1[1]==='updated')
    {
        console.log("*******************************created ");  
                    if(user_type=='client')
            {
               

            await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE  tbl_complaints.created_at BETWEEN '"+StartDate+"' and '"+EndDate+"' and  tbl_complaints.updated_at BETWEEN '"+StartDate+"' and '"+EndDate+"'  and client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reflectid_by!='digitalWallet' and user_as='client' and  reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
                console.log("reflet_id_data ",complaint_data);  
                res.render('front/my-reports/complaint_ajax',{ checked_array_con,moment,success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type});
            })
        }else{
            console.log("verifier ");  

            await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.created_at BETWEEN '"+StartDate+"' and '"+EndDate+"' and  tbl_complaints.updated_at BETWEEN '"+StartDate+"' and '"+EndDate+"'  and tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where user_as='verifier' and reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
                console.log("reflet_id_data ",complaint_data);  
                res.render('front/my-reports/complaint_ajax',{checked_array_con, moment,success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type});
            })

              }
}
else if(checked_array_1[0]==='created'||checked_array_1[1]==='created')

{
    console.log("updated******************************* ");  
    console.log("*******************************created ");  
    if(user_type=='client')
    {
       

    await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE  tbl_complaints.created_at BETWEEN '"+StartDate+"' and '"+EndDate+"'  and client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reflectid_by!='digitalWallet' and user_as='client' and  reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
        console.log("reflet_id_data ",complaint_data);  
        res.render('front/my-reports/complaint_ajax',{ checked_array_con,moment,success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type});
    })
}else{
    console.log("verifier ");  

    await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.created_at BETWEEN '"+StartDate+"' and '"+EndDate+"'   and tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where user_as='verifier' and reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
        console.log("reflet_id_data ",complaint_data);  
        res.render('front/my-reports/complaint_ajax',{checked_array_con, moment,success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type});
    })

      }
}
else if(checked_array_1[0]==='updated'||checked_array_1[1]==='updated')
{
    console.log("updated******************************* ");  
    console.log("*******************************created ");  
    if(user_type=='client')
    {
       

    await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE   tbl_complaints.updated_at BETWEEN '"+StartDate+"' and '"+EndDate+"'  and client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reflectid_by!='digitalWallet' and  user_as='client' and  reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
        console.log("reflet_id_data ",complaint_data);  
        res.render('front/my-reports/complaint_ajax',{ checked_array_con,moment,success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type});
    })
}else{
    console.log("verifier ");  

    await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE   tbl_complaints.updated_at BETWEEN '"+StartDate+"' and '"+EndDate+"'  and tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where user_as='verifier' and reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
        console.log("reflet_id_data ",complaint_data);  
        res.render('front/my-reports/complaint_ajax',{checked_array_con, moment,success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type});
    })

      }
}
}
/** get_complaint_by_time Post method END**/     

/** get_complaint_by_time Post method START**/     
exports.get_client_by_time = async (req,res,next) =>{
    var user_type = req.session.user_type;
    var reg_user_id = req.session.user_id; 
   
    // var checked_array=req.session.checked_array;
    var checked_array_1 = req.body.checked_new;

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var checked_array = [];
    checked_array_1 = JSON.parse(req.body.date_list);

    var  StartDate = moment(startDate).format('YYYY-MM-DD');
    var  EndDate = moment(endDate).format('YYYY-MM-DD');

    var checked_array=req.body.checked_new;


    console.log("startDate******************************* ",StartDate);  
    // console.log("endDate******************************* ",EndDate);  
    // console.log("checked_array******************************* ",checked_array_1[0]);  
    // console.log("checked_array******************************* ",checked_array_1[1]);  
    var checked_array_con;
  
    if(checked_array===undefined)
    {
        checked_array_con=1;
    }
    else{
        checked_array_con=0;
    
    }
    console.log("checked_array\\\\\\\\\\\\\\\\ ",checked_array_1);
    if(checked_array_1[0]==='created'||checked_array_1[1]==='created'&& checked_array_1[0]==='updated'||checked_array_1[1]==='updated'){
        await db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id where tbl_wallet_reflectid_rels.createdAt BETWEEN '"+StartDate+"' and '"+EndDate+"' and tbl_wallet_reflectid_rels.updatedAt BETWEEN '"+StartDate+"' and '"+EndDate+"' and tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and reflectid_by!='digitalWallet' and  user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_data){
            console.log("reflet_id_data ",client_data);  
            if(client_data.length>0){
                for(var i=0;i<client_data.length;i++){
                    if(client_data[i].entity_company_country!=null){
                    await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                        client_data[i].country_name = country_data[0].country_name;
                        // console.log("reflet_id_data ",client_data); 
                        if(i==(client_data.length-1)){
                            // res.render('front/my-reports/client_ajax',{ success_msg,err_msg,session:req.session,client_data,checked_array});
                            res.render('front/my-reports/client_ajax',{checked_array_con, checked_array,success_msg,err_msg,session:req.session,client_data});
                        } 
                        
                    })
                }else{
                    client_data[i].country_name = '-';
                    if(i==(client_data.length-1)){
                        // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                        res.render('front/my-reports/client_ajax',{ checked_array_con,success_msg,checked_array,err_msg,session:req.session,client_data});
    
                    } 
                }
                }
                }else{
                    // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                    res.render('front/my-reports/client_ajax',{ checked_array_con,checked_array,success_msg,err_msg,session:req.session,client_data});
    
                }
        })
    }else if(checked_array_1[0]==='created'||checked_array_1[1]==='created')
        {
            await db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id where tbl_wallet_reflectid_rels.createdAt BETWEEN '"+StartDate+"' and '"+EndDate+"' and tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and reflectid_by!='digitalWallet' and  user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_data){
                console.log("reflet_id_data ",client_data);  
                if(client_data.length>0){
                    for(var i=0;i<client_data.length;i++){
                        if(client_data[i].entity_company_country!=null){
                        await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                            client_data[i].country_name = country_data[0].country_name;
                            // console.log("reflet_id_data ",client_data); 
                            if(i==(client_data.length-1)){
                                // res.render('front/my-reports/client_ajax',{ success_msg,err_msg,session:req.session,client_data,checked_array});
                                res.render('front/my-reports/client_ajax',{ checked_array,checked_array_con,success_msg,err_msg,session:req.session,client_data});
                            } 
                            
                        })
                    }else{
                        client_data[i].country_name = '-';
                        if(i==(client_data.length-1)){
                            // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                            res.render('front/my-reports/client_ajax',{checked_array_con,checked_array, success_msg,err_msg,session:req.session,client_data});
        
                        } 
                    }
                    }
                    }else{
                        // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                        res.render('front/my-reports/client_ajax',{ checked_array_con,checked_array,success_msg,err_msg,session:req.session,client_data,schedule_list});
        
                    }
            })
        }
else if(checked_array_1[0]==='updated'||checked_array_1[1]==='updated')
{
    await db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id where tbl_wallet_reflectid_rels.updatedAt BETWEEN '"+StartDate+"' and '"+EndDate+"' and tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and reflectid_by!='digitalWallet' and user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_data){
        console.log("reflet_id_data ",client_data);  
        if(client_data.length>0){
            for(var i=0;i<client_data.length;i++){
                if(client_data[i].entity_company_country!=null){
                await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                    client_data[i].country_name = country_data[0].country_name;
                    // console.log("reflet_id_data ",client_data); 
                    if(i==(client_data.length-1)){
                        // res.render('front/my-reports/client_ajax',{ success_msg,err_msg,session:req.session,client_data,checked_array});
                        res.render('front/my-reports/client_ajax',{checked_array_con,checked_array, success_msg,err_msg,session:req.session,client_data,schedule_list});
                    } 
                    
                })
            }else{
                client_data[i].country_name = '-';
                if(i==(client_data.length-1)){
                    // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                    res.render('front/my-reports/client_ajax',{checked_array,checked_array_con,success_msg,err_msg,session:req.session,client_data});

                } 
            }
            }
            }else{
                // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                res.render('front/my-reports/client_ajax',{ checked_array,checked_array_con,success_msg,err_msg,session:req.session,client_data});

            }
        })
}

}
/** get_complaint_by_time Post method END**/  

/** get_complaint_by_time Post method START**/     
exports.get_reflet_by_time = async (req,res,next) =>{
    var user_type = req.session.user_type;
    var reg_user_id = req.session.user_id; 
    var checked_array_1 = req.body.checked_new;
   
    var checked_array=req.body.checked_new;

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    // var checked_array = [];
    checked_array_1 = JSON.parse(req.body.date_list);

    var  StartDate = moment(startDate).format('YYYY-MM-DD');
    var  EndDate = moment(endDate).format('YYYY-MM-DD');

    console.log("startDate******************************* ",StartDate);  
    // console.log("endDate******************************* ",EndDate);  
    // console.log("checked_array******************************* ",checked_array_1[0]);  
    // console.log("checked_array******************************* ",checked_array_1[1]);  

    var checked_array_con_reflet;
  
    if(checked_array===undefined)
    {
        checked_array_con_reflet=1;
    }
    else{
        checked_array_con_reflet=0;
    
    }
    console.log("checked_array\\\\\\\\\\\\\\\\ ",checked_array_1);
    if(checked_array_1[0]==='created'||checked_array_1[1]==='created'&& checked_array_1[0]==='updated'||checked_array_1[1]==='updated'){
        await db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id where tbl_wallet_reflectid_rels.createdAt BETWEEN '"+StartDate+"' and '"+EndDate+"' and  tbl_wallet_reflectid_rels.updatedAt BETWEEN '"+StartDate+"' and '"+EndDate+"' and tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){
            console.log("reflet_id_data ",reflet_id_data);  
            if(reflet_id_data.length>0){
                for(var i=0;i<reflet_id_data.length;i++){
                    if(reflet_id_data[i].entity_company_country!=null){
                    await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                        reflet_id_data[i].country_name = country_data[0].country_name;
                        // console.log("reflet_id_data ",reflet_id_data); 
                        if(i==(reflet_id_data.length-1)){
                            res.render('front/my-reports/reflet_ajax',{ checked_array_con_reflet,success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                        } 
                        
                    })
                }else{
                    reflet_id_data[i].country_name = '-';
                    if(i==(reflet_id_data.length-1)){
                        res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,checked_array_con_reflet,reflet_id_data,checked_array});
                    } 
                }
                }
                }else{
                    res.render('front/my-reports/reflet_ajax',{checked_array_con_reflet,success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                }
    });}
    else if(checked_array_1[0]==='created'||checked_array_1[1]==='created')
        {
            await db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id where tbl_wallet_reflectid_rels.createdAt BETWEEN '"+StartDate+"' and '"+EndDate+"' and tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){
                console.log("reflet_id_data ",reflet_id_data);  
               
                if(reflet_id_data.length>0){
                    for(var i=0;i<reflet_id_data.length;i++){
                        if(reflet_id_data[i].entity_company_country!=null){
                        await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                            reflet_id_data[i].country_name = country_data[0].country_name;
                            // console.log("reflet_id_data ",reflet_id_data); 
                            if(i==(reflet_id_data.length-1)){
                                res.render('front/my-reports/reflet_ajax',{ checked_array_con_reflet,success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                            } 
                            
                        })
                    }else{
                        reflet_id_data[i].country_name = '-';
                        if(i==(reflet_id_data.length-1)){
                            res.render('front/my-reports/reflet_ajax',{ checked_array_con_reflet,success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                        } 
                    }
                    }
                    }else{
                        res.render('front/my-reports/reflet_ajax',{checked_array_con_reflet, success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                    }
            })
        }
else if(checked_array_1[0]==='updated'||checked_array_1[1]==='updated')
{
    await db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id where tbl_wallet_reflectid_rels.updatedAt BETWEEN '"+StartDate+"' and '"+EndDate+"' and tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){
        if(reflet_id_data.length>0){
            for(var i=0;i<reflet_id_data.length;i++){
                if(reflet_id_data[i].entity_company_country!=null){
                await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                    reflet_id_data[i].country_name = country_data[0].country_name;
                    // console.log("reflet_id_data ",reflet_id_data); 
                    if(i==(reflet_id_data.length-1)){
                        res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,checked_array_con_reflet,reflet_id_data,checked_array});
                    } 
                    
                })
            }else{
                reflet_id_data[i].country_name = '-';
                if(i==(reflet_id_data.length-1)){
                    res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array_con_reflet,checked_array});
                } 
            }
            }
            }else{
                res.render('front/my-reports/reflet_ajax',{ checked_array_con_reflet,success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
            }
})
}
}
/** get_complaint_by_time Post method END**/  

/** show-report-by-complain-id Post method Start**/    
exports.show_report_by_complain_id=(req,res,next) =>{
    console.log('complain_list ********************')
 var complain_list=[]
 complain_list=JSON.parse(req.body.id_list);
    // var all_document_data_list=[]
    var result_code_array=[]
    var user_type=req.session.user_type;

    var checked_array=req.body.checked_new;

    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",checked_array)


        var checked_array_con;
  
        if(checked_array===undefined)
        {
            checked_array_con=1;
        }
        else{
            checked_array_con=0;
        
        }   
    var user_id=req.session.user_id;
    
        var complain_list_1=complain_list.join("','");

        /**get my all reflect code start**/
        if(user_type=='client')
       {
       db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  inner join tbl_complaints ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_user_registrations.reg_user_id="+user_id+" And tbl_complaints.complain_id IN ('"+complain_list_1+"')",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){

                    console.log('users type : ',complaint_data)
            
            res.render('front/my-reports/complaint_ajax',{checked_array_con, success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type,checked_array});

        
              
        });
    }
    else{
        db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  inner join tbl_complaints ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_user_registrations.reg_user_id="+user_id+" AND tbl_complaints.complain_id IN ('"+complain_list_1+"')",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
          
            console.log('users type : ',complaint_data)

            res.render('front/my-reports/complaint_ajax',{checked_array_con, success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type,checked_array});
 

    })
        /**get my all reflect code end**/
}

} 

/** show-report-by-status Post method Start**/    
exports.show_report_by_status=(req,res,next) =>{
    console.log('complain_list ********************')
 var reflect_code_list=[]
 reflect_code_list=JSON.parse(req.body.reflect_code_list);
    // var all_document_data_list=[]
    var result_code_array=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
 
 
    var checked_array=req.body.checked_new;
    console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",checked_array)

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;
    var checked_array_con;
  
    if(checked_array===undefined)
    {
        checked_array_con=1;
        console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",checked_array)

    }
    else{
        checked_array_con=0;
    
    }   
    if(user_id)
    {
        /**get my all reflect code start**/
    
        var complaint_status_list=reflect_code_list.join("','");

       if(user_type=='client')
       {
                       console.log('users type : ',user_type)

                       db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reg_user_id="+user_id+") AND tbl_complaints.complaint_status IN ('"+complaint_status_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){

                        console.log('users type : ',complaint_data)
    

            // console.log('users type : ',all_complaint)

            res.render('front/my-reports/complaint_ajax',{checked_array_con, success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type,checked_array});  
          
});

       }
      else{
        console.log(':::::::::::::::::::::::::::::::::::::::::::::::: ')

        console.log('users type : ',user_type)
             
        db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where reg_user_id="+user_id+") AND tbl_complaints.complaint_status IN ('"+complaint_status_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){

            res.render('front/my-reports/complaint_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type,checked_array});

});
}
       
        /**get my all reflect code end**/
    }
   

}
/** show-report-by-status Post method END**/    

/** show-report-by-client_code Post method Start**/    
exports.show_report_by_reflet_code=(req,res,next) =>{
    console.log('complain_list ********************')
 var reflect_code_list=[]
 reflect_code_list=JSON.parse(req.body.reflect_code_list);
    // var all_document_data_list=[]
    var result_code_array=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
 
 
        var checked_array=req.body.checked_new;
        console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",checked_array)
    
        var user_id=req.session.user_id;
        var user_type=req.session.user_type;
        var checked_array_con;
      
        if(checked_array===undefined)
        {
            checked_array_con=1;
            console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",checked_array)
    
        }
        else{
            checked_array_con=0;
        
        }   
    if(user_id)
    {
        /**get my all reflect code start**/
    
        var complaint_reflect_code_list=reflect_code_list.join("','");

       if(user_type=='client')
       {
                       console.log('users type : ',user_type)
                       db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  inner join tbl_complaints ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_user_registrations.reg_user_id="+user_id+" AND tbl_complaints.client_reflect_code IN ('"+complaint_reflect_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){

                        console.log('users type : ',complaint_data)
    

            // console.log('users type : ',all_complaint)

            res.render('front/my-reports/complaint_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type,checked_array});  
          
});

       }
      else{
        console.log(':::::::::::::::::::::::::::::::::::::::::::::::: ')

        console.log('users type : ',user_type)             
        db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  inner join tbl_complaints ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_user_registrations.reg_user_id="+user_id+" AND client_reflect_code IN ('"+complaint_reflect_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){


            res.render('front/my-reports/complaint_ajax',{checked_array_con, success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type,checked_array});

});
}
       
        /**get my all reflect code end**/
    }
   

}
/** show-report-by-client_code Post method END**/    

/** show-report-by-verifier_code Post method Start**/    
exports.show_report_by_verifier_code=(req,res,next) =>{ 

 var reflect_code_list=[]
 reflect_code_list=JSON.parse(req.body.reflect_code_list);
    // var all_document_data_list=[]
    var result_code_array=[]
    var checked_array=req.body.checked_new;
    console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",checked_array)

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;
    var checked_array_con;
  
    if(checked_array===undefined)
    {
        checked_array_con=1;
        console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",checked_array)

    }
    else{
        checked_array_con=0;
    
    }   
    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
    if(user_id)
    {
        /**get my all reflect code start**/
    
        var reflect_id_list=reflect_code_list.join("','");

       if(user_type=='client')
       {
                       console.log('users type : ',user_type)
                       db.query("SELECT reflect_code FROM tbl_wallet_reflectid_rels WHERE tbl_wallet_reflectid_rels.reg_user_id="+user_id+" and reflectid_by!='digitalWallet' and user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_reflet_code){

                      
                        for(var i=0;i< client_reflet_code.length;i++)
                        {
                            client_array[i]=client_reflet_code[i].reflect_code;
                        }
                        console.log('client_reflet_codclient_reflet_codee : ',client_array)

                        var complaint_reflect_code_list=client_array.join("','");

                        console.log('client_reflet_codclient_reflet_codee : ',complaint_reflect_code_list)

                       db.query("SELECT * FROM `tbl_complaints`  INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_complaints.reflect_id WHERE tbl_complaints.reflect_id IN ('"+reflect_id_list+"') and client_reflect_code IN ('"+complaint_reflect_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){

                        console.log('users type : ',complaint_data)
    

            // console.log('users type : ',all_complaint)

            res.render('front/my-reports/complaint_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type,checked_array});  
                       });       
});

       }
      else{
        console.log(':::::::::::::::::::::::::::::::::::::::::::::::: ')

        console.log('users type : ',user_type)
        console.log('users type : ',user_type)
             
        // db.query("SELECT reflect_code FROM tbl_wallet_reflectid_rels WHERE tbl_wallet_reflectid_rels.reg_user_id<>"+user_id+" and user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_reflet_code){

                      
        //     for(var i=0;i< client_reflet_code.length;i++)
        //     {
        //         client_array[i]=client_reflet_code[i].reflect_code;
        //     }
        //     console.log('client_reflet_codclient_reflet_codee : ',client_array)

        //     var complaint_reflect_code_list=client_array.join("','");

            console.log('client_reflet_codclient_reflet_codee : ',reflect_id_list)

        db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_complaints ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+user_id+" AND tbl_wallet_reflectid_rels.reflect_id IN ('"+reflect_id_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){


            res.render('front/my-reports/complaint_ajax',{checked_array_con, success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type,checked_array});
        // });
});
}
       
        /**get my all reflect code end**/
    }
   

}
/** show-report-by-verifier_code Post method END**/    

/** show-report-by-msg Post method Start**/    
exports.show_report_by_msg=(req,res,next) =>{
    console.log('complain_list ********************')
 var reflect_code_list=[]
 reflect_code_list=JSON.parse(req.body.reflect_code_list);
    // var all_document_data_list=[]
    var result_code_array=[]
    var checked_array=req.body.checked_new;
    console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",checked_array)

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;
    var checked_array_con;
  
    if(checked_array===undefined)
    {
        checked_array_con=1;
        console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",checked_array)

    }
    else{
        checked_array_con=0;
    
    }   

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
    if(user_id)
    {
        /**get my all reflect code start**/
    
        var msg_list=reflect_code_list.join("','");

       if(user_type=='client')
       {
                       console.log('users type : ',user_type)
                       db.query("SELECT reflect_code FROM tbl_wallet_reflectid_rels WHERE tbl_wallet_reflectid_rels.reg_user_id="+user_id+" and reflectid_by!='digitalWallet' and user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_reflet_code){

                      
                        for(var i=0;i< client_reflet_code.length;i++)
                        {
                            client_array[i]=client_reflet_code[i].reflect_code;
                        }
                        console.log('client_reflet_codclient_reflet_codee : ',client_array)

                        var complaint_reflect_code_list=client_array.join("','");

                        console.log('client_reflet_codclient_reflet_codee : ',complaint_reflect_code_list)

                       db.query("SELECT * FROM `tbl_complaints`  INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_complaints.reflect_id WHERE complain_message IN ('"+msg_list+"') and client_reflect_code IN ('"+complaint_reflect_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){

                        console.log('users type : ',complaint_data)
    

            // console.log('users type : ',all_complaint)

            res.render('front/my-reports/complaint_ajax',{checked_array_con, success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type,checked_array});  
                       });       
});

       }
      else{
        console.log(':::::::::::::::::::::::::::::::::::::::::::::::: ')

        console.log('users type : ',user_type)
        console.log('users type : ',user_type)
             
        console.log('users type : ',user_type)
        db.query("SELECT reflect_code FROM tbl_wallet_reflectid_rels WHERE tbl_wallet_reflectid_rels.reg_user_id<>"+user_id+" and reflectid_by!='digitalWallet' and user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_reflet_code){

       
         for(var i=0;i< client_reflet_code.length;i++)
         {
             client_array[i]=client_reflet_code[i].reflect_code;
         }
         console.log('client_reflet_codclient_reflet_codee : ',client_array)

         var complaint_reflect_code_list=client_array.join("','");

         console.log('client_reflet_codclient_reflet_codee : ',complaint_reflect_code_list)

        db.query("SELECT * FROM `tbl_complaints`  INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_complaints.reflect_id WHERE complain_message IN ('"+msg_list+"') and client_reflect_code IN ('"+complaint_reflect_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){

         console.log('users type : ',complaint_data)

            res.render('front/my-reports/complaint_ajax',{checked_array_con, success_msg,err_msg,session:req.session,complaint_data,checked_array,user_type,checked_array});
        })
});
}
       
        /**get my all reflect code end**/
    }
   

}
/** show-report-by-msg Post method END**/    

/** show-report-by-client-type Post method Start**/    
exports.show_report_by_client_type=async (req,res,next) =>{
    console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.client_list);
    // var all_document_data_list=[]
    var result_code_array=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var type_list=client_list_array.join("','");

 
    // var checked_array=req.session.checked_array;

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
    var checked_array=req.body.checked_new;

    var checked_array_con;
  
if(checked_array===undefined)
{
    checked_array_con=1;
}
else{
    checked_array_con=0;

}
         
    await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE reflectid_by!='digitalWallet' and user_as='client' and  reflectid_by IN ('"+type_list+"') and  tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(client_data){  

    if(client_data.length>0){
        for(var i=0;i<client_data.length;i++){
            if(client_data[i].entity_company_country!=null){
            await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                client_data[i].country_name = country_data[0].country_name;
                // console.log("reflet_id_data ",client_data); 
                if(i==(client_data.length-1)){
                    res.render('front/my-reports/client_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,client_data,user_type,checked_array});  
                } 
                
            })
        }else{
            client_data[i].country_name = '-';
            if(i==(client_data.length-1)){
                // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                res.render('front/my-reports/client_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,client_data,user_type,checked_array});  
            } 
        }
        }
        }else{
            // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
            res.render('front/my-reports/client_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,client_data,user_type,checked_array});  
        }                        


    })
   

}
/** show-report-by-client-type Post method END**/    

/** show-report-by-client-name Post method Start**/    
exports.show_report_by_client_name=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.client_list);
    // var all_document_data_list=[]
    var result_code_array=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var name_list=client_list_array.join("','");

 
        var checked_array=req.body.checked_new;
    console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",checked_array)
 var name_type = req.body.name_type;
        console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",name_type)

     if(name_type=="entity")
     {
                console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : entity ")

     type='entity_company_name'
     }else{
                        console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : rep ")

     type='rep_firstname'

     }

             console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",type)
    var user_id=req.session.user_id;
    var user_type=req.session.user_type;
    var checked_array_con;
  
    if(checked_array===undefined)
    {
        checked_array_con=1;
        console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",checked_array)

    }
    else{
        checked_array_con=0;
    
    }       

                       db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE "+type+" IN ('"+name_list+"') and reflectid_by!='digitalWallet' and user_as='client' and tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(client_data){
                        if(client_data.length>0){
                            for(var i=0;i<client_data.length;i++){
                                if(client_data[i].entity_company_country!=null){
                                await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                                    client_data[i].country_name = country_data[0].country_name;
                                    // console.log("reflet_id_data ",client_data); 
                                    if(i==(client_data.length-1)){
                                        res.render('front/my-reports/client_ajax',{checked_array_con, success_msg,err_msg,session:req.session,client_data,user_type,checked_array});  
                                    } 
                                    
                                })
                            }else{
                                client_data[i].country_name = '-';
                                if(i==(client_data.length-1)){
                                    // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                                    res.render('front/my-reports/client_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,client_data,user_type,checked_array});  
                                } 
                            }
                            }
                            }else{
                                // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                                res.render('front/my-reports/client_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,client_data,user_type,checked_array});  
                            }
            

         
                           
});

    
   

}
/** show-report-by-client-name Post method END**/   

/** show-report-by-client_reflect_code Post method Start**/    
exports.show_report_by_client_reflect_code=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.client_list);
    // var all_document_data_list=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var reflect_code_list=client_list_array.join("','");

 
        var checked_array=req.body.checked_new;

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
  
    var checked_array_con;
  
if(checked_array===undefined)
{
    checked_array_con=1;
}
else{
    checked_array_con=0;

}
    db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE reflect_code IN ('"+reflect_code_list+"') andreflectid_by!='digitalWallet' and user_as='client' and tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(client_data){
                        console.log('users type : ',client_data)
                        if(client_data.length>0){
                            for(var i=0;i<client_data.length;i++){
                                if(client_data[i].entity_company_country!=null){
                                await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                                    client_data[i].country_name = country_data[0].country_name;
                                    // console.log("reflet_id_data ",client_data); 
                                    if(i==(client_data.length-1)){
                                        res.render('front/my-reports/client_ajax',{ checked_array_con,checked_array_con,success_msg,err_msg,session:req.session,client_data,user_type,checked_array});  
                                    } 
                                    
                                })
                            }else{
                                client_data[i].country_name = '-';
                                if(i==(client_data.length-1)){
                                    // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                                    res.render('front/my-reports/client_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,client_data,user_type,checked_array});  
                                } 
                            }
                            }
                            }else{
                                // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                                res.render('front/my-reports/client_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,client_data,user_type,checked_array});  
                            }
            

            // console.log('users type : ',all_complaint)

            
                           
});

    
   

}
/** show-report-by-client-client_reflect_code Post method END**/    

/** show-report-by-client_status Post method Start**/    
exports.show_report_by_client_status=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.client_list);
    // var all_document_data_list=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var reflect_code_list=client_list_array.join("','");

 
        var checked_array=req.body.checked_new;

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
  
      
    var checked_array_con;
  
    if(checked_array===undefined)
    {
        checked_array_con=1;
    }
    else{
        checked_array_con=0;
    
    }     

                       db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE STATUS IN ('"+reflect_code_list+"') and reflectid_by!='digitalWallet' and  user_as='client' and tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(client_data){

                        if(client_data.length>0){
                            for(var i=0;i<client_data.length;i++){
                                if(client_data[i].entity_company_country!=null){
                                await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                                    client_data[i].country_name = country_data[0].country_name;
                                    // console.log("reflet_id_data ",client_data); 
                                    if(i==(client_data.length-1)){
                                        res.render('front/my-reports/client_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,client_data,user_type,checked_array});  
                                    } 
                                    
                                })
                            }else{
                                client_data[i].country_name = '-';
                                if(i==(client_data.length-1)){
                                    // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                                    res.render('front/my-reports/client_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,client_data,user_type,checked_array});  
                                } 
                            }
                            }
                            }else{
                                // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                                res.render('front/my-reports/client_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,client_data,user_type,checked_array});  
                            }
            
                           
});

    
   

}
/** show-report-by-client-status Post method END**/    

/** show-report-by-client-country Post method Start**/    
exports.show_report_by_client_country=(req,res,next) =>{
    // console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.client_list);
    // var all_document_data_list=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var reflect_code_list=client_list_array.join("','");

 
        var checked_array=req.body.checked_new;

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
  
        
    var checked_array_con;
  
    if(checked_array===undefined)
    {
        checked_array_con=1;
    }
    else{
        checked_array_con=0;
    
    }   

                       db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE entity_company_country IN ('"+reflect_code_list+"') and reflectid_by!='digitalWallet' and user_as='client' and tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(client_data){

                        console.log('users type : ',client_data)
    

                        if(client_data.length>0){
                            for(var i=0;i<client_data.length;i++){
                                if(client_data[i].entity_company_country!=null){
                                await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                                    client_data[i].country_name = country_data[0].country_name;
                                    console.log("reflet_id_data ",client_data); 
                                    if(i==(client_data.length-1)){
                                        res.render('front/my-reports/client_ajax',{ checked_array_con,success_msg,err_msg,session:req.session,client_data,user_type,checked_array});  
                                    } 
                                    
                                })
                            }else{
                                client_data[i].country_name = '-';
                                if(i==(client_data.length-1)){
                                    // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                                    res.render('front/my-reports/client_ajax',{ success_msg,err_msg,session:req.session,checked_array_con,client_data,user_type,checked_array});  
                                } 
                            }
                            }
                            }else{
                                // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                                res.render('front/my-reports/client_ajax',{ success_msg,err_msg,session:req.session,checked_array_con,client_data,user_type,checked_array});  
                            }
            
                           
});

    
   

}
/** show-report-by-client-country Post method END**/    

/** show-report-by-client-type Post method Start**/    
exports.show_report_by_reflet_type=async (req,res,next) =>{
    console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.client_list);
    // var all_document_data_list=[]
    var result_code_array=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        var type_list=client_list_array.join("','");

 
        var checked_array=req.body.checked_new;
        
        console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",checked_array)

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var checked_array_con_reflet;
  
if(checked_array===undefined)
{
    checked_array_con_reflet=1;
    console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",checked_array_con_reflet)

}
else{
    checked_array_con_reflet=0;
    console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",checked_array_con_reflet)


}
    await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE reflectid_by IN ('"+type_list+"') and  tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){
                        if(reflet_id_data.length>0){
                            for(var i=0;i<reflet_id_data.length;i++){
                                if(reflet_id_data[i].entity_company_country!=null){
                                await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                                    reflet_id_data[i].country_name = country_data[0].country_name;
                                    // console.log("reflet_id_data ",client_data); 
                                    if(i==(reflet_id_data.length-1)){
                                        res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array,checked_array_con_reflet});  
                                    } 
                                    
                                })
                            }else{
                                reflet_id_data[i].country_name = '-';
                                if(i==(reflet_id_data.length-1)){
                                    // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                                    res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array,checked_array_con_reflet});  
                                } 
                            }
                            }
                            }else{
                                // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                                res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array,checked_array_con_reflet});  
                            }
            
                           
});

    
   

}
/** show-report-by-client-type Post method END**/    

/** show-report-by-client-name Post method Start**/    
exports.show_report_by_reflet_name=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.client_list);
    // var all_document_data_list=[]
    var result_code_array=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        var name_list=client_list_array.join("','");

 
        var checked_array = req.body.checked_new;
        var name_type = req.body.name_type;
        console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",name_type)

     if(name_type=="entity")
     {
                console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : entity ")

     type='entity_company_name'
     }else{
                        console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : rep ")

     type='rep_firstname'

     }

             console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",type)

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
    var checked_array_con_reflet;
  
    if(checked_array===undefined)
    {
        checked_array_con_reflet=1;
    }
    else{
        checked_array_con_reflet=0;
    
    }
    await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE "+type+" IN ('"+name_list+"') and  tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){

                        if(reflet_id_data.length>0){
                            for(var i=0;i<reflet_id_data.length;i++){
                                if(reflet_id_data[i].entity_company_country!=null){
                                await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                                    reflet_id_data[i].country_name = country_data[0].country_name;
                                    // console.log("reflet_id_data ",client_data); 
                                    if(i==(reflet_id_data.length-1)){
                                        res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array,checked_array_con_reflet});  
                                    } 
                                    
                                })
                            }else{
                                reflet_id_data[i].country_name = '-';
                                if(i==(reflet_id_data.length-1)){
                                    // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                                    res.render('front/my-reports/reflet_ajax',{ checked_array_con_reflet,success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array});  
                                } 
                            }
                            }
                            }else{
                                // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                                res.render('front/my-reports/reflet_ajax',{checked_array_con_reflet, success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array});  
                            }
            
                           
});

    
   

}
/** show-report-by-client-name Post method END**/   

/** show-report-by-client_reflect_code Post method Start**/    
exports.show_report_by_reflet_reflect_code=async (req,res,next) =>{7
    // console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.client_list);
    // var all_document_data_list=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var reflect_code_list=client_list_array.join("','");

 
        var checked_array = req.body.checked_new;

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
  
    var checked_array_con_reflet;
  
    if(checked_array===undefined)
    {
        checked_array_con_reflet=1;
    }
    else{
        checked_array_con_reflet=0;
    
    }
           
    await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE reflect_code IN ('"+reflect_code_list+"') and  tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){
                        console.log('users type : ',reflet_id_data)
    

                        if(reflet_id_data.length>0){
                            for(var i=0;i<reflet_id_data.length;i++){
                                if(reflet_id_data[i].entity_company_country!=null){
                                await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                                    reflet_id_data[i].country_name = country_data[0].country_name;
                                    // console.log("reflet_id_data ",client_data); 
                                    if(i==(reflet_id_data.length-1)){
                                        res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array,checked_array_con_reflet});  
                                    } 
                                    
                                })
                            }else{
                                reflet_id_data[i].country_name = '-';
                                if(i==(reflet_id_data.length-1)){
                                    // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                                    res.render('front/my-reports/reflet_ajax',{ checked_array_con_reflet,success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array});  
                                } 
                            }
                            }
                            }else{
                                // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                                res.render('front/my-reports/reflet_ajax',{checked_array_con_reflet, success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array});  
                            }
            
});

    
   

}
/** show-report-by-client-client_reflect_code Post method END**/    

/** show-report-by-client_status Post method Start**/    
exports.show_report_by_reflet_status=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.client_list);
    // var all_document_data_list=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var reflect_code_list=client_list_array.join("','");

 
        var checked_array = req.body.checked_new;

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
    var checked_array_con_reflet;
  
    if(checked_array===undefined)
    {
        checked_array_con_reflet=1;
    }
    else{
        checked_array_con_reflet=0;
    
    }
           
    await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE status IN ('"+reflect_code_list+"') and  tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){
        console.log('users type : ',reflet_id_data)

                        console.log('users type : ',reflet_id_data)
    

                        if(reflet_id_data.length>0){
                            for(var i=0;i<reflet_id_data.length;i++){
                                if(reflet_id_data[i].entity_company_country!=null){
                                await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                                    reflet_id_data[i].country_name = country_data[0].country_name;
                                    // console.log("reflet_id_data ",client_data); 
                                    if(i==(reflet_id_data.length-1)){
                                        res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array,checked_array_con_reflet});  
                                    } 
                                    
                                })
                            }else{
                                reflet_id_data[i].country_name = '-';
                                if(i==(reflet_id_data.length-1)){
                                    // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                                    res.render('front/my-reports/reflet_ajax',{checked_array_con_reflet,success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array});  
                                } 
                            }
                            }
                            }else{
                                // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                                res.render('front/my-reports/reflet_ajax',{checked_array_con_reflet, success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array});  
                            }
             
                           
});

    
   

}
/** show-report-by-client-status Post method END**/    

/** show-report-by-client-country Post method Start**/    
exports.show_report_by_reflet_country=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.client_list);
 var checked_array = req.body.checked_new;

        var reflect_code_list=client_list_array.join("','");

 
    // var checked_array=req.session.checked_array;

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
  
    var checked_array_con_reflet;
  
    if(checked_array===undefined)
    {
        checked_array_con_reflet=1;
    }
    else{
        checked_array_con_reflet=0;
    
    }
    await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE entity_company_country IN ('"+reflect_code_list+"') and  tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){
        console.log('users type : ',reflet_id_data)

                        console.log('users type : ',reflet_id_data)
    

                        if(reflet_id_data.length>0){
                            for(var i=0;i<reflet_id_data.length;i++){
                                if(reflet_id_data[i].entity_company_country!=null){
                                await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                                    reflet_id_data[i].country_name = country_data[0].country_name;
                                    // console.log("reflet_id_data ",client_data); 
                                    if(i==(reflet_id_data.length-1)){
                                        res.render('front/my-reports/reflet_ajax',{ checked_array_con_reflet,success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array});  
                                    } 
                                    
                                })
                            }else{
                                reflet_id_data[i].country_name = '-';
                                if(i==(reflet_id_data.length-1)){
                                    // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data,checked_array});
                                    res.render('front/my-reports/reflet_ajax',{checked_array_con_reflet, success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array});  
                                } 
                            }
                            }
                            }else{
                                // res.render('front/my-reports/reflet_ajax',{ success_msg,err_msg,session:req.session,reflet_id_data:[],checked_array});
                                res.render('front/my-reports/reflet_ajax',{ checked_array_con_reflet,success_msg,err_msg,session:req.session,reflet_id_data,user_type,checked_array});  
                            }
            
                           
});

    
   

}
/** show-report-by-client-country Post method END**/    

/** show_report_by_boarding_request Post method Start**/    
exports.show_report_by_boarding_request_code=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var request_list_array=[]
 request_list_array=JSON.parse(req.body.request_list);
    // var all_document_data_list=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var request_code_list=request_list_array.join("','");

 
        var checked_array = req.body.checked_new;

    var reg_user_id=req.session.user_id;
    var user_type=req.session.user_type;
    var checked_array_con;
  
    if(checked_array===undefined)
    {
        checked_array_con=1;
    }
    else{
        checked_array_con=0;
    
    }   
   
        await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id+" and tbl_client_verification_requests.request_code in ('"+request_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
            // console.log("ver_par_cat_data ",ver_par_cat_data);  
            if(ver_par_cat_data.length>0){
            for(var i=0;i<ver_par_cat_data.length;i++){
                await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                    ver_par_cat_data[i].client_sub = client_sub_cat_data;

                    if(i==(ver_par_cat_data.length-1)){
                        console.log("ver_par_cat_data ",ver_par_cat_data[0].client_sub);  
                        console.log("ver_par_cat_data ",ver_par_cat_data);  
                        res.render('front/my-reports/on_boarding_ajax',{checked_array,success_msg,err_msg,checked_array_con,session:req.session,ver_par_cat_data}); 
                        
                    } 
                })
            } 
        }else{
            res.render('front/my-reports/on_boarding_ajax',{checked_array,success_msg,err_msg,session:req.session,checked_array_con,ver_par_cat_data:[]});
        }
        })
    
   

}
/** show_report_by_boarding_request Post method END**/    

/** show_report_by_boardng_reflect_code Post method Start**/    
exports.show_report_by_boardng_reflect_code=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var request_list_array=[]
 request_list_array=JSON.parse(req.body.boarding_list);
    // var all_document_data_list=[]
    // var array = req.body;oarding
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var reflect_code_list=request_list_array.join("','");

 
        var checked_array = req.body.checked_new;

    var reg_user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var checked_array_con;
  
        if(checked_array===undefined)
        {
            checked_array_con=1;
        }
        else{
            checked_array_con=0;
        
        }   
        await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id+" and tbl_wallet_reflectid_rels.reflect_code in ('"+reflect_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
            // console.log("ver_par_cat_data ",ver_par_cat_data);  
            if(ver_par_cat_data.length>0){
            for(var i=0;i<ver_par_cat_data.length;i++){
                await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                    ver_par_cat_data[i].client_sub = client_sub_cat_data;

                    if(i==(ver_par_cat_data.length-1)){
                        console.log("ver_par_cat_data ",ver_par_cat_data[0].client_sub);  
                        console.log("ver_par_cat_data ",ver_par_cat_data);  
                        res.render('front/my-reports/on_boarding_ajax',{checked_array,success_msg,err_msg,checked_array_con,session:req.session,ver_par_cat_data}); 
                        
                    } 
                })
            } 
        }else{
            res.render('front/my-reports/on_boarding_ajax',{checked_array,success_msg,err_msg,session:req.session,checked_array_con,ver_par_cat_data:[]});
        }
        })
    
   

}
/** show_report_by_boardng_reflect_code Post method END**/    

/** show_report_by_boardng_reflect_code Post method Start**/    
exports.show_report_by_boardng_client_code=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var request_list_array=[]
 request_list_array=JSON.parse(req.body.boarding_list);
    // var all_document_data_list=[]
    // var array = req.body;oarding
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var reflect_code_list=request_list_array.join("','");

 
        var checked_array = req.body.checked_new;

    var reg_user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var checked_array_con;
  
        if(checked_array===undefined)
        {
            checked_array_con=1;
        }
        else{
            checked_array_con=0;
        
        }   
        await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
            // console.log("ver_par_cat_data ",ver_par_cat_data);  
            if(ver_par_cat_data.length>0){
            for(var i=0;i<ver_par_cat_data.length;i++){
                await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id+" and tbl_wallet_reflectid_rels.reflect_code in ('"+reflect_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                    // var client_sub=0;
                    if(client_sub_cat_data.length===0)
                    {
                        // client_sub=1;
                        ver_par_cat_data[i].client_sub=1;
                     console.log('**************if client_sub_cat_data null******************')
                    }
                    else{
                        console.log('**************else client_sub_cat_data null******************')

                        ver_par_cat_data[i].client_sub = client_sub_cat_data;

                    }

                    if(i==(ver_par_cat_data.length-1)){
                        // console.log("ver_par_cat_data ",ver_par_cat_data[0].client_sub);  
                        console.log("ver_par_cat_data ",ver_par_cat_data);  
                        res.render('front/my-reports/on_boarding_ajax',{checked_array,checked_array_con,success_msg,err_msg,session:req.session,ver_par_cat_data}); 
                        
                    } 
                })
            } 
        }else{
            res.render('front/my-reports/on_boarding_ajax',{checked_array,success_msg,err_msg,session:req.session,checked_array_con,ver_par_cat_data:[]});
        }
        })
    
   

}
/** show_report_by_boardng_reflect_code Post method END**/    

/** show_report_by_boardng_parent Post method Start**/    
exports.show_report_by_boardng_parent=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var request_list_array=[]
 request_list_array=JSON.parse(req.body.boarding_list);
    // var all_document_data_list=[]
    // var array = req.body;oarding
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var reflect_code_list=request_list_array.join("','");

 
        var checked_array=req.body.checked_new;

    var reg_user_id=req.session.user_id;
    var user_type=req.session.user_type;
    var checked_array_con;
  
    if(checked_array===undefined)
    {
        checked_array_con=1;
    }
    else{
        checked_array_con=0;
    
    }   
   
        await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id+" and tbl_verifier_request_categories.category_name in ('"+reflect_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
            // console.log("ver_par_cat_data ",ver_par_cat_data);  
            if(ver_par_cat_data.length>0){
            for(var i=0;i<ver_par_cat_data.length;i++){
                await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                    ver_par_cat_data[i].client_sub = client_sub_cat_data;

                    if(i==(ver_par_cat_data.length-1)){
                        console.log("ver_par_cat_data ",ver_par_cat_data[0].client_sub);  
                        console.log("ver_par_cat_data ",ver_par_cat_data);  
                        res.render('front/my-reports/on_boarding_ajax',{checked_array_con,checked_array,success_msg,err_msg,session:req.session,ver_par_cat_data}); 
                        
                    } 
                })
            } 
        }else{
            res.render('front/my-reports/on_boarding_ajax',{checked_array,success_msg,err_msg,session:req.session,checked_array_con,ver_par_cat_data:[]});
        }
        })
    
   

}
/** show_report_by_boardng_parent Post method END**/    


/** show_report_by_boardng_status Post method Start**/    
exports.show_report_by_boardng_status=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var request_list_array=[]
 request_list_array=JSON.parse(req.body.boarding_list);
    // var all_document_data_list=[]
    // var array = req.body;oarding
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var reflect_code_list=request_list_array.join("','");

 
        var checked_array=req.body.checked_new;

    var reg_user_id=req.session.user_id;
    var user_type=req.session.user_type;
console.log(checked_array)
    var checked_array_con;
  
        if(checked_array===undefined)
        {
            checked_array_con=1;
        }
        else{
            checked_array_con=0;
        
        }   
        console.log(checked_array_con)

        await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id+" and request_status in ('"+reflect_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
            // console.log("ver_par_cat_data ",ver_par_cat_data);  
            if(ver_par_cat_data.length>0){
            for(var i=0;i<ver_par_cat_data.length;i++){
                await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                    ver_par_cat_data[i].client_sub = client_sub_cat_data;

                    if(i==(ver_par_cat_data.length-1)){
                        console.log("ver_par_cat_data ",ver_par_cat_data[0].client_sub);  
                        console.log("ver_par_cat_data ",ver_par_cat_data);  
                        res.render('front/my-reports/on_boarding_ajax',{checked_array_con,checked_array,success_msg,err_msg,session:req.session,ver_par_cat_data}); 
                        
                    } 
                })
            } 
        }else{
            res.render('front/my-reports/on_boarding_ajax',{checked_array,success_msg,err_msg,session:req.session,checked_array_con,ver_par_cat_data:[]});
        }
        })
    
   

}
/** show_report_by_boardng_status Post method END**/    

/** show_report_by_boardng_sub_category Post method Start**/    
exports.show_report_by_boardng_sub_category=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var request_list_array=[]
 request_list_array=JSON.parse(req.body.boarding_list);
    // var all_document_data_list=[]
    // var array = req.body;oarding
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var reflect_code_list=request_list_array.join("','");

 
        var checked_array=req.body.checked_new;

    var reg_user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var checked_array_con;
  
        if(checked_array===undefined)
        {
            checked_array_con=1;
        }
        else{
            checked_array_con=0;
        
        }   
        await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
            // console.log("ver_par_cat_data ",ver_par_cat_data);  
            if(ver_par_cat_data.length>0){
            for(var i=0;i<ver_par_cat_data.length;i++){
                await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id+" and category_name in ('"+reflect_code_list+"') and parent_category <>'0'",{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                    // var client_sub=0;
                    if(client_sub_cat_data.length===0)
                    {
                        // client_sub=1;
                        ver_par_cat_data[i].client_sub=1;
                     console.log('**************if client_sub_cat_data null******************')
                    }
                    else{
                        console.log('**************else client_sub_cat_data null******************')

                        ver_par_cat_data[i].client_sub = client_sub_cat_data;

                    }

                    if(i==(ver_par_cat_data.length-1)){
                        // console.log("ver_par_cat_data ",ver_par_cat_data[0].client_sub);  
                        console.log("ver_par_cat_data ",ver_par_cat_data);  
                        res.render('front/my-reports/on_boarding_ajax',{checked_array,checked_array_con,success_msg,err_msg,session:req.session,ver_par_cat_data}); 
                        
                    } 
                })
            } 
        }else{
            res.render('front/my-reports/on_boarding_ajax',{checked_array,success_msg,err_msg,session:req.session,checked_array_con,ver_par_cat_data:[]});
        }
        })
    
   

}
/** show_report_by_boardng_sub_category Post method END**/    

/** get_boarding_by_time Post method START**/     
exports.get_boarding_by_time = async (req,res,next) =>{
    var user_type = req.session.user_type;
    var reg_user_id = req.session.user_id; 
    var checked_array_1 = req.body.checked_new;
   
    var checked_array=req.body.checked_new;

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    // var checked_array = [];
    checked_array_1 = JSON.parse(req.body.date_list);

    var  StartDate = moment(startDate).format('YYYY-MM-DD');
    var  EndDate = moment(endDate).format('YYYY-MM-DD');
    var checked_array_con;
  
    if(checked_array===undefined)
    {
        checked_array_con=1;
    }
    else{
        checked_array_con=0;
    
    }   
    console.log("startDate******************************* ",StartDate);  
    // console.log("endDate******************************* ",EndDate);  
    // console.log("checked_array******************************* ",checked_array_1[0]);  
    // console.log("checked_array******************************* ",checked_array_1[1]);  

    console.log("checked_array\\\\\\\\\\\\\\\\ ",checked_array_1);
    if(checked_array_1[0]==='created'||checked_array_1[1]==='created'&& checked_array_1[0]==='updated'||checked_array_1[1]==='updated'){

        await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id+" and   tbl_client_verification_requests.createdAt BETWEEN '"+StartDate+"' and '"+EndDate+"' and tbl_client_verification_requests.updatedAt BETWEEN '"+StartDate+"' and '"+EndDate+"'",{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
            // console.log("ver_par_cat_data ",ver_par_cat_data);  
            if(ver_par_cat_data.length>0){
            for(var i=0;i<ver_par_cat_data.length;i++){
                await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                    ver_par_cat_data[i].client_sub = client_sub_cat_data;
                    if(client_sub_cat_data.length===0)
                    {
                        // client_sub=1;
                        ver_par_cat_data[i].client_sub=1;
                     console.log('**************if client_sub_cat_data null******************')
                    }
                    else{
                        console.log('**************else client_sub_cat_data null******************')

                        ver_par_cat_data[i].client_sub = client_sub_cat_data;

                    }
                    if(i==(ver_par_cat_data.length-1)){
                        console.log("ver_par_cat_data ",ver_par_cat_data[0].client_sub);  
                        console.log("ver_par_cat_data ",ver_par_cat_data);  
                        res.render('front/my-reports/on_boarding_ajax',{checked_array_con,checked_array,success_msg,err_msg,session:req.session,ver_par_cat_data}); 
                        
                    } 
                })
            } 
        }else{
            res.render('front/my-reports/on_boarding_ajax',{checked_array_con,checked_array,success_msg,err_msg,session:req.session,ver_par_cat_data:[]});
        }
        })
}
    else if(checked_array_1[0]==='created'||checked_array_1[1]==='created')
        {
            await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id+" and   tbl_client_verification_requests.createdAt BETWEEN '"+StartDate+"' and '"+EndDate+"'",{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
                // console.log("ver_par_cat_data ",ver_par_cat_data);  
                if(ver_par_cat_data.length>0){
                for(var i=0;i<ver_par_cat_data.length;i++){
                    await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                        ver_par_cat_data[i].client_sub = client_sub_cat_data;
                        if(client_sub_cat_data.length===0)
                        {
                            // client_sub=1;
                            ver_par_cat_data[i].client_sub=1;
                         console.log('**************if client_sub_cat_data null******************')
                        }
                        else{
                            console.log('**************else client_sub_cat_data null******************')
    
                            ver_par_cat_data[i].client_sub = client_sub_cat_data;
    
                        }
                        if(i==(ver_par_cat_data.length-1)){
                            console.log("ver_par_cat_data ",ver_par_cat_data[0].client_sub);  
                            console.log("ver_par_cat_data ",ver_par_cat_data);  
                            res.render('front/my-reports/on_boarding_ajax',{checked_array_con,checked_array,success_msg,err_msg,session:req.session,ver_par_cat_data}); 
                            
                        } 
                    })
                } 
            }else{
                res.render('front/my-reports/on_boarding_ajax',{checked_array,checked_array_con,success_msg,err_msg,session:req.session,ver_par_cat_data:[]});
            }
            })
        }
else if(checked_array_1[0]==='updated'||checked_array_1[1]==='updated')
{
    await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id+" and   tbl_client_verification_requests.updatedAt BETWEEN '"+StartDate+"' and '"+EndDate+"'",{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
        // console.log("ver_par_cat_data ",ver_par_cat_data);  
        if(ver_par_cat_data.length>0){
        for(var i=0;i<ver_par_cat_data.length;i++){
            await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                ver_par_cat_data[i].client_sub = client_sub_cat_data;
                if(client_sub_cat_data.length===0)
                {
                    // client_sub=1;
                    ver_par_cat_data[i].client_sub=1;
                 console.log('**************if client_sub_cat_data null******************')
                }
                else{
                    console.log('**************else client_sub_cat_data null******************')

                    ver_par_cat_data[i].client_sub = client_sub_cat_data;

                }
                if(i==(ver_par_cat_data.length-1)){
                    console.log("ver_par_cat_data ",ver_par_cat_data[0].client_sub);  
                    console.log("ver_par_cat_data ",ver_par_cat_data);  
                    res.render('front/my-reports/on_boarding_ajax',{checked_array,checked_array_con,success_msg,err_msg,session:req.session,ver_par_cat_data}); 
                    
                } 
            })
        } 
    }else{
        res.render('front/my-reports/on_boarding_ajax',{checked_array,success_msg,err_msg,session:req.session,checked_array_con,ver_par_cat_data:[]});
    }
    })
}
}
/** get_boarding_by_time Post method END**/  

/** show_report_by_sub_verifier_type Post method Start**/    
exports.show_report_by_sub_verifier_type=async (req,res,next) =>{
    console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.sub_list);
    // var all_document_data_list=[]
    var result_code_array=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var type_list=client_list_array.join("','");
        var checked_array=req.body.checked_new;

        var checked_array_con_sub;
  
        if(checked_array===undefined)
        {
            checked_array_con_sub=1;
        }
        else{
            checked_array_con_sub=0;
        
        }   

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
    await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE  reflectid_by IN ('"+type_list+"') and tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){
        res.render('front/my-reports/sub_verifier_ajax',{ success_msg,checked_array_con_sub,err_msg,session:req.session,sub_verifier_data,user_type,checked_array});     
   
    })
   

}
/** show_report_by_sub_verifier_type Post method END**/    

/** show_report_by_sub_verifier_name Post method Start**/    
exports.show_report_by_sub_verifier_name=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.sub_list);
    // var all_document_data_list=[]
    var result_code_array=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var name_list=client_list_array.join("','");
 var name_type = req.body.name_type;
        console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",name_type)

     if(name_type=="entity")
     {
                console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : entity ")

     type='entity_company_name'
     }else{
                        console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : rep ")

     type='rep_firstname'

     }

             console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",type)

 
        var checked_array=req.body.checked_new;

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
  
    var checked_array_con_sub;
  
    if(checked_array===undefined)
    {
        checked_array_con_sub=1;
    }
    else{
        checked_array_con_sub=0;
    
    }   
    await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE   "+type+" IN ('"+name_list+"') and tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){
        res.render('front/my-reports/sub_verifier_ajax',{ success_msg,err_msg,session:req.session,sub_verifier_data,checked_array_con_sub,user_type,checked_array});     
   
    })   
   

}
/** show_report_by_sub_verifier_name Post method END**/   

/** show_report_by_sub_verifier_reflect_code Post method Start**/    
exports.show_report_by_sub_verifier_reflect_code=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.sub_list);
    // var all_document_data_list=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var reflect_code_list=client_list_array.join("','");

 
        var checked_array=req.body.checked_new;

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;
    var checked_array_con_sub;
  
    if(checked_array===undefined)
    {
        checked_array_con_sub=1;
    }
    else{
        checked_array_con_sub=0;
    
    }   
    var client_array=[];
    await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE  reflect_code IN ('"+reflect_code_list+"') and tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){
        res.render('front/my-reports/sub_verifier_ajax',{ checked_array_con_sub,success_msg,err_msg,session:req.session,sub_verifier_data,user_type,checked_array});     
   
    })   
       
   

}
/** show_report_by_sub_verifier_reflect_code Post method END**/    

/** show_report_by_sub_verifier_status Post method Start**/    
exports.show_report_by_sub_verifier_status=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.sub_list);
    // var all_document_data_list=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var status_list=client_list_array.join("','");

        
        var checked_array=req.body.checked_new;

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
    var checked_array_con_sub;
  
    if(checked_array===undefined)
    {
        checked_array_con_sub=1;
    }
    else{
        checked_array_con_sub=0;
    
    }   
    await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE  invite_status IN ('"+status_list+"') and tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){
        res.render('front/my-reports/sub_verifier_ajax',{ checked_array_con_sub,success_msg,err_msg,session:req.session,sub_verifier_data,user_type,checked_array});     
   
    })     

   

}
/** show_report_by_sub_verifier_status Post method END**/    

/**show_report_by_sub_verifier_countryy Post method Start**/    
exports.show_report_by_sub_verifier_country=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.sub_list);
    // var all_document_data_list=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var country_list=client_list_array.join("','");

 
        var checked_array=req.body.checked_new;

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
    var checked_array_con_sub;
  
    if(checked_array===undefined)
    {
        checked_array_con_sub=1;
    }
    else{
        checked_array_con_sub=0;
    
    }   
       await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE  entity_company_country IN ('"+country_list+"') and tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){
        res.render('front/my-reports/sub_verifier_ajax',{ checked_array_con_sub,success_msg,err_msg,session:req.session,sub_verifier_data,user_type,checked_array});     
   
    })         

      
   

}
/** show_report_by_sub_verifier_country Post method END**/    
/**show_report_by_sub_verifier_email Post method Start**/    
exports.show_report_by_sub_verifier_email=async (req,res,next) =>{
    // console.log('complain_list ********************')
 var client_list_array=[]
 client_list_array=JSON.parse(req.body.sub_list);
    // var all_document_data_list=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
        var email_list=client_list_array.join("','");

 
        var checked_array=req.body.checked_new;

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    var client_array=[];
    var checked_array_con_sub;
  
    if(checked_array===undefined)
    {
        checked_array_con_sub=1;
    }
    else{
        checked_array_con_sub=0;
    
    }   
       await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_user_registrations.email IN ('"+email_list+"') and tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){
        res.render('front/my-reports/sub_verifier_ajax',{checked_array_con_sub, success_msg,err_msg,session:req.session,sub_verifier_data,user_type,checked_array});     
   
    })         

      
   

}
/** show_report_by_sub_verifier_email Post method END**/    
/** get_sub_verifier_by_time Post method START**/     
exports.get_sub_verifier_by_time = async (req,res,next) =>{
    var user_type = req.session.user_type;
    var reg_user_id = req.session.user_id; 
    // var checked_list = req.body.checked_new;
   
    var checked_array=req.body.checked_new;

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var checked_array_1 = [];
    checked_array_1 = JSON.parse(req.body.date_list);

    var  StartDate = moment(startDate).format('YYYY-MM-DD');
    var  EndDate = moment(endDate).format('YYYY-MM-DD');
    var checked_array_con_sub;
  
    if(checked_array===undefined)
    {
        checked_array_con_sub=1;
    }
    else{
        checked_array_con_sub=0;
    
    }   
    console.log("startDate******************************* ",StartDate);  
    console.log("checked_array******************************* ",checked_array);  
    console.log("checked_array******************************* ",checked_array_1[0]);  
    console.log("checked_array******************************* ",checked_array_1[1]);  

    console.log("checked_array\\\\\\\\\\\\\\\\ ",checked_array_1);
    if(checked_array_1[0]==='created'||checked_array_1[1]==='created'&& checked_array_1[0]==='updated'||checked_array_1[1]==='updated'){
        await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.createdAt BETWEEN '"+StartDate+"' and '"+EndDate+"' or tbl_invite_sub_verifiers.updatedAt BETWEEN '"+StartDate+"' and '"+EndDate+"' and tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+reg_user_id,{type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){ 

            console.log("sub_verifier_data     \\\\\\\\\\\\\\\\ ",sub_verifier_data);

                res.render('front/my-reports/sub_verifier_ajax',{ checked_array_con_sub,success_msg,err_msg,session:req.session,sub_verifier_data,user_type,checked_array});    
             })
    }else if(checked_array_1[0]==='created'||checked_array_1[1]==='created')
        {
            await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.createdAt BETWEEN '"+StartDate+"' and '"+EndDate+"' and  tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){

                console.log("sub_verifier_data     \\\\\\\\\\\\\\\\ ",sub_verifier_data);

                res.render('front/my-reports/sub_verifier_ajax',{ checked_array_con_sub,success_msg,err_msg,session:req.session,sub_verifier_data,user_type,checked_array});    
            })
        }
else if(checked_array_1[0]==='updated'||checked_array_1[1]==='updated')
{
    await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE  tbl_invite_sub_verifiers.updatedAt BETWEEN '"+StartDate+"' and '"+EndDate+"' and tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){

        console.log("sub_verifier_data     \\\\\\\\\\\\\\\\ ",sub_verifier_data);

        res.render('front/my-reports/sub_verifier_ajax',{ success_msg,err_msg,checked_array_con_sub,session:req.session,sub_verifier_data,user_type,checked_array});    
    })
}

}
/** get_sub_verifier_by_time Post method END**/  



//  exports.daily_mail_schedule = async (req,res,next) =>{
//             var reg_user_id = req.session.user_id; 
//             // var checked_list = req.body.checked_new;
           
//             var dt = dateTime.create(); 
          
//             await db.query("SELECT * FROM tbl_report_schedules inner join tbl_report_filters on tbl_report_filters.report_filter_id=tbl_report_schedules.report_filter_id WHERE tbl_report_schedules.daily='Daily' and tbl_report_filters.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(email_schedule){
//             //  console.log(email_schedule)
//              console.log(email_schedule.length)
        
//              for(var i=0;i<email_schedule.length; i++)
//              {
//              await  UserModel.findOne({ where: { reg_user_id:reg_user_id }}).then(userdata=>{
//                 var smtpTransport = nodemailer.createTransport({
//                     service: 'gmail',
//                     auth: {
//                       user: 'navajsheikh@questglt.com',
//                       pass: 'n9926408218'
//                     }
//                   });
//                   const mailOptions = {
//                     to: userdata.email,
//                     from: 'questtestmail@gmail.com',
//                     subject: "MyReflet Schedule Report Update.",
              
//                     html: `<!DOCTYPE html>
//                     <html>
//                       <head>
//                         <title>My Reflet</title>
//                         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//                         <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
//                          <style>
//                         @media only screen and (max-width: 600px) {
//                         .inner-body {
//                         width: 100% !important;
//                         }
//                         .footer {
//                         width: 100% !important;
//                         }
//                         }
//                         @media only screen and (max-width: 500px) {
//                         .button {
//                         width: 100% !important;
//                         }
//                         }
//                         </style> 
//                       </head>
//                       <body>
//                         <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
//                           <div style="background-color: #88beda;padding: 10px 30px 5px;">
//                             <img src="http://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
//                           </div>
//                           <div style="padding: 30px;line-height: 32px; text-align: justify;">
//                             <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${userdata.full_name}</h4>
//                             <p> Your <b>${email_schedule[i].report_name}</b> report schedule for Daily.</p>
//                             <p>Please Check the report Daily Between this date ${email_schedule[i].start_date} - ${email_schedule[i].end_date}</p>
        
//                             <p>Preffered Time : ${email_schedule[i].preferred_time}</p>
        
//                             <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
//                             <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                    
                           
//                           </div>
//                            <div style="background-color:  #88beda; color: #fff; padding: 20px 30px;">
//                              &copy; Copyright 2020 - My Reflet. All rights reserved.
//                             </div>
//                         </div>
//                       </body>
//                     </html>  
//                     `
//                   };
//                   smtpTransport.sendMail(mailOptions, function (err) {
                   
//                   });
//                 })
//             }
//             })
        
//             }

// exports.daily_mail_schedule = async (req,res,next) =>{
//     var reg_user_id = req.session.user_id; 
//     // var checked_list = req.body.checked_new;

//     var dt = dateTime.create(); 

//     if(user_type=='client')
//     {
//         console.log("client ");  

//     await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
//         console.log("complaint_data ",complaint_data);  

//         var contents = fs.readFileSync('front/my-reports/complaint_pdf_ajax.ejs', 'utf8');
//         /*
//          * It will convert into HTML with the value according to the
//          * contents and appointMentObj.
//          */
//         var html = ejs.render(contents, appointMentObj);
//         /*
//          * Call a user define method to generate PDF.
//          */
//         global.createPDFFile(html, req.params.id + '.pdf', function (err, result) {
//             if (err) {
//                   console.log(err);
//               } else { 
//                   console.log("PDF URL ADDED.");
//                   res.send(result);
//               }
//            });
//         res.render('front/my-reports/complaint_ajax',{i_val,checked_array_con,
//             market_list_result,success_msg,err_msg,session:req.session,
//             complaint_data,user_type,checked_array,report_filter_id,report_data});
//     })
// }else{
//     console.log("verifier ");  

//     await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
//         console.log("complaint_data ",complaint_data);  
//         res.render('front/my-reports/complaint_ajax',{ i_val,checked_array_con,market_list_result,success_msg,err_msg,session:req.session,complaint_data,report_filter_id,user_type,report_data,checked_array});
//     })
// }
  
 
      
// }


/**schedule_reports_list START**/
exports.schedule_reports_list = async(req,res,next)=>{
    
    var reg_id= req.session.user_id 
    console.log('report list')
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")
   
    var user_type=req.session.user_type;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    

    db.query("SELECT * FROM `tbl_master_reports` WHERE deleted='0' and status='active'",{ type:db.QueryTypes.SELECT}).then(function(master_report_list){

        db.query("SELECT * FROM tbl_report_filters inner join tbl_report_schedules on tbl_report_schedules.report_filter_id=tbl_report_filters.report_filter_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_report_filters.reflect_id where tbl_report_filters.deleted='0' and tbl_report_filters.reg_user_id="+reg_id+" and tbl_report_filters.user_type='"+user_type+"' order by tbl_report_schedules.report_filter_id desc ",{ type:db.QueryTypes.SELECT}).then(function(report_list_result){

            if (report_list_result.length > 0) {

                page_data=report_list_result
     
            }
    
        console.log(' db hello : ',report_list_result)
    
    
    
        const report_list = paginate(page_data,page, perPage);
        res.render('front/my-reports/schedule-reports',{ success_msg,
            err_msg,master_report_list,report_list,
        //    market_list_result,
           session:req.session,user_type,moment
         

         });
        });
    })
    
   
    }
/**schedule_reports_list End**/
/**my-reports-list Get method START**/
exports.search_my_report = async(req,res,next)=>{
    
    var reg_id= req.session.user_id 
    console.log('report list')
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")
   
    var user_type=req.session.user_type;

        var query=req.body.query;



    
        db.query("SELECT * FROM tbl_report_filters inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_report_filters.reflect_id where tbl_report_filters.deleted='0' and archive='0' and tbl_report_filters.reg_user_id="+reg_id+" and tbl_report_filters.user_type='"+user_type+"' and report_filter_id not in(SELECT report_filter_id FROM `tbl_report_schedules`) and (tbl_report_filters.report_name LIKE '%"+query+"%' or tbl_report_filters.description LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.reflect_code LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.rep_firstname LIKE '%"+query+"%'  or tbl_wallet_reflectid_rels.entity_company_name LIKE '%"+query+"%'  or tbl_report_filters.createdAt LIKE '%"+query+"%' )" ,{ type:db.QueryTypes.SELECT}).then(function(report_list_result){

           
        // console.log(' db hello : ',page_data)
    
    
    
        res.render('front/my-reports/ajax_my_report',{ success_msg,
            err_msg,report_list:report_list_result,
        //    market_list_result,
           session:req.session,user_type,moment
         

       
    });
    })
    
   
    }
/**my-reports-list Get method END**/
/**my-reports-list Get method START**/
exports.search_archive_report = async(req,res,next)=>{
    
    var reg_id= req.session.user_id 
    console.log('report list')
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")
   
    var user_type=req.session.user_type;

        var query=req.body.query;



    
        db.query("SELECT * FROM tbl_report_filters inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_report_filters.reflect_id where tbl_report_filters.deleted='0' and archive='0' and tbl_report_filters.reg_user_id="+reg_id+" and tbl_report_filters.user_type='"+user_type+"' and (tbl_report_filters.report_name LIKE '%"+query+"%' or tbl_report_filters.description LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.reflect_code LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.rep_firstname LIKE '%"+query+"%'  or tbl_wallet_reflectid_rels.entity_company_name LIKE '%"+query+"%'  or tbl_report_filters.createdAt LIKE '%"+query+"%' )" ,{ type:db.QueryTypes.SELECT}).then(function(report_list_result){

           
        // console.log(' db hello : ',page_data)
    
    
    
        res.render('front/my-reports/ajax_archive_report',{ success_msg,
            err_msg,report_list:report_list_result,
        //    market_list_result,
           session:req.session,user_type,moment
         

       
    });
    })
    
   
    }
/**my-reports-list Get method END**/
/**my-reports-list Get method START**/
exports.search_schedule_report = async(req,res,next)=>{
    
    var reg_id= req.session.user_id 
    console.log('report list')
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")
   
    var user_type=req.session.user_type;

        var query=req.body.query;



    
        db.query("SELECT * FROM tbl_report_filters inner join tbl_report_schedules on tbl_report_schedules.report_filter_id=tbl_report_filters.report_filter_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_report_filters.reflect_id where tbl_report_filters.deleted='0' and tbl_report_filters.reg_user_id="+reg_id+" and tbl_report_filters.user_type='"+user_type+"' and (tbl_report_filters.report_name LIKE '%"+query+"%' or daily LIKE '%"+query+"%' or weekly LIKE '%"+query+"%' or monthly LIKE '%"+query+"%' or tbl_report_filters.description LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.reflect_code LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.rep_firstname LIKE '%"+query+"%'  or tbl_wallet_reflectid_rels.entity_company_name LIKE '%"+query+"%'  or tbl_report_filters.createdAt LIKE '%"+query+"%' )" ,{ type:db.QueryTypes.SELECT}).then(function(report_list_result){

           
        console.log(' db hello : ',query)
    
    
    
        res.render('front/my-reports/ajax_schedule_report',{ success_msg,
            err_msg,report_list:report_list_result,
        //    market_list_result,
           session:req.session,user_type,moment
         

       
    });
    })
    
   
    }
/**my-reports-list Get method END**/
