var cron = require('node-cron');
var request = require('request');
var {UserModel,LogDetailsModel}=require('../models/user');
// var {ScheduleReportModel}=require('../models/my_report');
const nodemailer = require("nodemailer");
const ejs = require('ejs');
const fs = require('fs');
var pdf = require("html-pdf");
var async = require('async');
var moment = require('moment'); 
var dateTime = require('node-datetime')
var {NotificationModel} = require('../models/notification');

const {  MAIL_SEND_ID,PASS_OF_MAIL
  }	= require('../config/config');
var db = require('../services/database');

   cron.schedule('* * * * *', () => {
    unblockUser();
    // testmail();
    // dailyScheduleReport();
    // weeklyScheduleReport();
    // monthlyScheduleReport();

    //console.log('running a task every minute');

   });

   cron.schedule('0 0 * * *', () => {
    monthlyScheduleReport();
    dailyScheduleReport();
    weeklyScheduleReport();
        expiryMail();

    console.log('running a task every 24 hours');
  
   });

  
async function unblockUser()
{
    console.log("..........................unblockStart.............................................")

    function toTimestamp(strDate){
                                 var datum = Date.parse(strDate);
                                 return datum/1000;
                                 }
    
   await UserModel.findAll({where:{status:"block"}}).then(async(blockedUserData)=>{
    // console.log("blockedUserData....",blockedUserData)

           if(blockedUserData[0]!=null){
            console.log("blockedUserData[0]....................")


            for(var i=0; i<blockedUserData.length ; i++){
                console.log("forloop....................")

            var now = new Date(blockedUserData[i].block_date);
            now.setMinutes(now.getMinutes() + 2880); // timestamp
            now = new Date(now); // Date object
            var user_block_endDate =now
            var timstampFormDb =parseInt(toTimestamp(user_block_endDate))
            var currentTimestamp =parseInt(toTimestamp(new Date()))
             console.log("timstampFormDb",timstampFormDb)
            console.log("currentTimestamp",currentTimestamp)
        
            
if(timstampFormDb<currentTimestamp){
          await  LogDetailsModel.update({status:"active", deleted:"0"},{where:{ reg_user_id: blockedUserData[i].reg_user_id }}).then( async(result) => {
            // console.log("use update..............",result)
           await UserModel.update({status:"active",},{where:{ reg_user_id: blockedUserData[i].reg_user_id }}).then( (result) => {
                // console.log("use update..............",result)
                            })
                     })
}
        }
        return true
    }else{
       return false
    }   
        
    }).catch(err=>console.log("errr...",err))
}

async function dailyScheduleReport(req,res)
{
   

    

    await db.query("SELECT * FROM tbl_report_schedules inner join tbl_report_filters on tbl_report_filters.report_filter_id=tbl_report_schedules.report_filter_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_report_filters.reg_user_id WHERE tbl_report_schedules.daily='Daily'",{ type:db.QueryTypes.SELECT}).then(async function(email_schedule){

      async.each(email_schedule,async function (content, cb) {

     
        
        var dt = dateTime.create(); 
        var formatted = dt.format('Y-m-d H:M:S');

        var formatted1= dt.format('Y-m-d ');

       
        if(content.end_date>formatted&&content.start_date<formatted)

        {
            // console.log("start_date jjjjjj");  

        var reg_user_id,report_filter_id;
        var report_data_type=[];
        var checked_array=[];
        var report_data=[];
    
        var report_name,pdf_type,report_data_type,user_type,email,report_id; 
       reg_user_id =content.reg_user_id;
       user_type =content.user_type;
       email =content.email;

      // var report_id=2;
      // var report_filter_id=37;
      // var report_data_type=[];
      // var checked_array=[];
      report_data.push(content)

      console.log(report_data)
      db.query("SELECT * FROM tbl_report_filter_columns where deleted='0' and report_filter_id="+content.report_filter_id+" order by report_filter_id desc",{ type:db.QueryTypes.SELECT}).then(async function(view_column_list){
  
          for(var i=0;i<view_column_list.length;i++)
          {
              checked_array[i]=view_column_list[i].column_name;
          }
          // console.log("************column_name_array************* ",checked_array);
              
        
          // await db.query("SELECT * FROM tbl_master_reports WHERE deleted='0' and status='active' and report_id="+report_id,{ type:db.QueryTypes.SELECT}).then(async function(market_list_result){
              
          //     var report_type = market_list_result[0].report_name;
          // })
      })
  // })
      if(content.report_id==5){
          report_name='complaint_report';
          pdf_type='pdf_complaint.ejs';
  
          if(content.user_type=='client')
          {
              console.log("client ");  
  
          await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
  
  
              for(var i=0;i<complaint_data.length;i++)
              {
                  report_data_type.push(complaint_data[i]);
  
              }
            
          })
      }
      else{
          console.log("verifier ");  
  
          await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
  
              for(var i=0;i<complaint_data.length;i++)
              {
                  report_data_type.push(complaint_data[i]);
  
              }
          
          })
      }
      }
      // console.log("complaint_data ",complain_data_array);  
      if(content.report_id==2){
  
          report_name='reflet_report';
          pdf_type='pdf_reflet.ejs';
          
          await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){
  
              if(reflet_id_data.length>0){
              for(var i=0;i<reflet_id_data.length;i++){
                  if(reflet_id_data[i].entity_company_country!=null){
                  await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                      reflet_id_data[i].country_name = country_data[0].country_name;
                      // console.log("reflet_id_data ",reflet_id_data); 
                      if(i==(reflet_id_data.length-1)){
                         
                          for(var j=0;j<reflet_id_data.length;j++)
                          {
                              report_data_type.push(reflet_id_data[j]);
  
                          }
                      } 
                      
                  })
              }else{
                  reflet_id_data[i].country_name = '-';
                  if(i==(reflet_id_data.length-1)){
                      for(var j=0;j<reflet_id_data.length;j++)
                      {
                          report_data_type.push(reflet_id_data[j]);
                      }
                  } 
              }
              }
              }else{
                  console.log("reflet_id_data ",reflet_id_data);  
                  for(var j=0;j<reflet_id_data.length;j++)
                  {
                      report_data_type.push(reflet_id_data[j]);
                  }
              }
          })
      }
  
     else if(content.report_id==4)
      {
          report_name='client_report';
          pdf_type='pdf_client.ejs';
          
          await db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_data){
              
              if(client_data.length>0){
                  for(var i=0;i<client_data.length;i++){
                      if(client_data[i].entity_company_country!=null){
                      await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                          client_data[i].country_name = country_data[0].country_name;
                          // console.log("reflet_id_data ",client_data); 
                          if(i==(client_data.length-1)){
                        
                                  for(var j=0;j<client_data.length;j++)
                                  {
                                      report_data_type.push(client_data[j]);
  
                                  }
                          } 
                          
                      })
                  }else{
                      client_data[i].country_name = '-';
                      if(i==(client_data.length-1)){
                          for(var j=0;j<client_data.length;j++)
                          {
                              report_data_type.push(client_data[j]);
  
                          }
                      } 
                  }
                  }
                  }else{
                      for(var j=0;j<client_data.length;j++)
                      {
                          report_data_type.push(client_data[j]);
  
                      }
                  }
          
          })
      }
      else if(content.report_id==1)
      {
          report_name='sub_verifier_report';
          pdf_type='pdf_subverifier.ejs';
          
          await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){
  
              for(var i=0;i<sub_verifier_data.length;i++)
                                  {
                                      report_data_type.push(sub_verifier_data[i]);
  
                                  }    
          })
      } 
      else if(content.report_id==3)
      {
          report_name='on_boarding_report';
          pdf_type='pdf_onbording.ejs';
          
              await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
                  // console.log("ver_par_cat_data ",ver_par_cat_data);  
                  if(ver_par_cat_data.length>0){
                  for(var i=0;i<ver_par_cat_data.length;i++){
                      await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                          ver_par_cat_data[i].client_sub = client_sub_cat_data;
                          if(i==(ver_par_cat_data.length-1)){
  
                              for(var j=0;j<ver_par_cat_data.length;j++)
                              {
                                  report_data_type.push(ver_par_cat_data[j]);
  
                              }    
                              
                          } 
                      })
                  } 
              }else{
                  for(var j=0;j<ver_par_cat_data.length;j++)
                              {
                                  report_data_type.push(ver_par_cat_data[j]);
  
                              }    
              }
              })
          }
                      // console.log("EEEEEEEEEERRRRRRRRR     in  ",report_name,'report_filter_id ',email_schedule[k].report_filter_id)

      ejs.renderFile('app/views/front/my-reports/'+pdf_type, {moment,report_data,checked_array,report_data_type,user_type},async (err, data) => {
          // console.log("don1 "+data)
  
      if (err) {
          console.log("EEEEEEEEEERRRRRRRRR       1"+err)
      } else {
  
          let options = {
              "height": "11.25in",
              "width": "8.5in",
              "header": {
                  "height": "20mm"
              },
              "footer": {
                  "height": "20mm",
              },
          };
          console.log("EEEEEEEEEERRRRRRRRR out      ",content.report_name,'report_filter_id ',content.report_filter_id)

          // async function upload_file(){

          pdf.create(data, options).toFile("app/uploads/report_files/"+content.report_name+"_"+content.report_filter_id+".pdf",async function (err, data) {
              // console.log("don441 "+data)
              console.log("EEEEEEEEEERRRRRRRRR    in   ",content.report_name,'report_filter_id ',content.report_filter_id)

              if (err) {
                console.log("pdf create data       2"+err)

  
              } else {

                      // data='update';

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
                          subject: "MyReflet Schedule Report.",
                          attachments: [{
                              filename: 'report.pdf',
                              path: `app/uploads/report_files/${content.report_name}_${content.report_filter_id}.pdf`,
                              contentType: 'application/pdf'
                            }],
                       
                        };
                        smtpTransport.sendMail(mailOptions, function (err) {
                         console.log('done')
                        });
                      
                 
              console.log("File created successfully");
                  
              
                      }
             
          });
        // }
        // await upload_file();
        // async function finalRespone(){
        //             console.log("done -")

        // }
        // await finalRespone()

    
      }
  });
 
     
       
       
       }
     })
  
    
    })
}

async function monthlyScheduleReport(req,res)
{
var date=new Date();  // Gets the current time


const day = date.getDate();
console.log(day )


    await db.query("SELECT * FROM tbl_report_schedules inner join tbl_report_filters on tbl_report_filters.report_filter_id=tbl_report_schedules.report_filter_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_report_filters.reg_user_id WHERE tbl_report_schedules.monthly="+day,{ type:db.QueryTypes.SELECT}).then(async function(email_schedule){

        async.each(email_schedule,async function (content, cb) {
            var dt = dateTime.create(); 
            var formatted = dt.format('Y-m-d H:M:S');
    
            var formatted1= dt.format('Y-m-d ');
    
         
            if(content.end_date>formatted&&content.start_date<formatted){
            // console.log("start_date ",tomorrow);  
            // console.log("end_date ",yesterday);  
            // console.log("c start_date ",content.start_date);  
            // console.log("c end_date ",content.end_date);  
    
            //   if(content.start_date<=tomorrow && content.start_date>=yesterday||content.end_date<=tomorrow && content.end_date>=yesterday)
            // if(content.start_date<=tomorrow)
    
            // {
                console.log("start_date jjjjjj");  
    
            var reg_user_id,report_filter_id;
            var report_data_type=[];
            var checked_array=[];
            var report_data=[];
        
            var report_name,pdf_type,report_data_type,user_type,email,report_id; 
           reg_user_id =content.reg_user_id;
           user_type =content.user_type;
           email =content.email;
    
          // var report_id=2;
          // var report_filter_id=37;
          // var report_data_type=[];
          // var checked_array=[];
          report_data.push(content)
    
          db.query("SELECT * FROM tbl_report_filter_columns where deleted='0' and report_filter_id="+content.report_filter_id+" order by report_filter_id desc",{ type:db.QueryTypes.SELECT}).then(async function(view_column_list){
      
              for(var i=0;i<view_column_list.length;i++)
              {
                  checked_array[i]=view_column_list[i].column_name;
              }
              // console.log("************column_name_array************* ",checked_array);
                  
            
              // await db.query("SELECT * FROM tbl_master_reports WHERE deleted='0' and status='active' and report_id="+report_id,{ type:db.QueryTypes.SELECT}).then(async function(market_list_result){
                  
              //     var report_type = market_list_result[0].report_name;
              // })
          })
      // })
          if(content.report_id==5){
              report_name='complaint_report';
              pdf_type='pdf_complaint.ejs';
      
              if(content.user_type=='client')
              {
                  console.log("client ");  
      
              await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
      
      
                  for(var i=0;i<complaint_data.length;i++)
                  {
                      report_data_type.push(complaint_data[i]);
      
                  }
                
              })
          }
          else{
              console.log("verifier ");  
      
              await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
      
                  for(var i=0;i<complaint_data.length;i++)
                  {
                      report_data_type.push(complaint_data[i]);
      
                  }
              
              })
          }
          }
          // console.log("complaint_data ",complain_data_array);  
          if(content.report_id==2){
      
              report_name='reflet_report';
              pdf_type='pdf_reflet.ejs';
              
              await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){
      
                  if(reflet_id_data.length>0){
                  for(var i=0;i<reflet_id_data.length;i++){
                      if(reflet_id_data[i].entity_company_country!=null){
                      await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                          reflet_id_data[i].country_name = country_data[0].country_name;
                          // console.log("reflet_id_data ",reflet_id_data); 
                          if(i==(reflet_id_data.length-1)){
                             
                              for(var j=0;j<reflet_id_data.length;j++)
                              {
                                  report_data_type.push(reflet_id_data[j]);
      
                              }
                          } 
                          
                      })
                  }else{
                      reflet_id_data[i].country_name = '-';
                      if(i==(reflet_id_data.length-1)){
                          for(var j=0;j<reflet_id_data.length;j++)
                          {
                              report_data_type.push(reflet_id_data[j]);
                          }
                      } 
                  }
                  }
                  }else{
                      console.log("reflet_id_data ",reflet_id_data);  
                      for(var j=0;j<reflet_id_data.length;j++)
                      {
                          report_data_type.push(reflet_id_data[j]);
                      }
                  }
              })
          }
      
         else if(content.report_id==4)
          {
              report_name='client_report';
              pdf_type='pdf_client.ejs';
              
              await db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_data){
                  
                  if(client_data.length>0){
                      for(var i=0;i<client_data.length;i++){
                          if(client_data[i].entity_company_country!=null){
                          await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                              client_data[i].country_name = country_data[0].country_name;
                              // console.log("reflet_id_data ",client_data); 
                              if(i==(client_data.length-1)){
                            
                                      for(var j=0;j<client_data.length;j++)
                                      {
                                          report_data_type.push(client_data[j]);
      
                                      }
                              } 
                              
                          })
                      }else{
                          client_data[i].country_name = '-';
                          if(i==(client_data.length-1)){
                              for(var j=0;j<client_data.length;j++)
                              {
                                  report_data_type.push(client_data[j]);
      
                              }
                          } 
                      }
                      }
                      }else{
                          for(var j=0;j<client_data.length;j++)
                          {
                              report_data_type.push(client_data[j]);
      
                          }
                      }
              
              })
          }
          else if(content.report_id==1)
          {
              report_name='sub_verifier_report';
              pdf_type='pdf_subverifier.ejs';
              
              await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){
      
                  for(var i=0;i<sub_verifier_data.length;i++)
                                      {
                                          report_data_type.push(sub_verifier_data[i]);
      
                                      }    
              })
          } 
          else if(content.report_id==3)
          {
              report_name='on_boarding_report';
              pdf_type='pdf_onbording.ejs';
              
                  await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
                      // console.log("ver_par_cat_data ",ver_par_cat_data);  
                      if(ver_par_cat_data.length>0){
                      for(var i=0;i<ver_par_cat_data.length;i++){
                          await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                              ver_par_cat_data[i].client_sub = client_sub_cat_data;
                              if(i==(ver_par_cat_data.length-1)){
      
                                  for(var j=0;j<ver_par_cat_data.length;j++)
                                  {
                                      report_data_type.push(ver_par_cat_data[j]);
      
                                  }    
                                  
                              } 
                          })
                      } 
                  }else{
                      for(var j=0;j<ver_par_cat_data.length;j++)
                                  {
                                      report_data_type.push(ver_par_cat_data[j]);
      
                                  }    
                  }
                  })
              }
                          // console.log("EEEEEEEEEERRRRRRRRR     in  ",report_name,'report_filter_id ',email_schedule[k].report_filter_id)
    
          ejs.renderFile('app/views/front/my-reports/'+pdf_type, {report_data,checked_array,report_data_type,moment,user_type},async (err, data) => {
              // console.log("don1 "+data)
      
          if (err) {
              console.log("EEEEEEEEEERRRRRRRRR       1"+err)
          } else {
      
              let options = {
                  "height": "11.25in",
                  "width": "8.5in",
                  "header": {
                      "height": "20mm"
                  },
                  "footer": {
                      "height": "20mm",
                  },
              };
              console.log("EEEEEEEEEERRRRRRRRR out      ",content.report_name,'report_filter_id ',content.report_filter_id)
    
              // async function upload_file(){
    
              pdf.create(data, options).toFile("app/uploads/report_files/"+content.report_name+"_"+content.report_filter_id+".pdf",async function (err, data) {
                  // console.log("don441 "+data)
                  console.log("EEEEEEEEEERRRRRRRRR    in   ",content.report_name,'report_filter_id ',content.report_filter_id)
    
                  if (err) {
                    console.log("pdf create data       2"+err)
    
      
                  } else {
    
                          // data='update';
    
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
                              subject: "MyReflet Schedule Report.",
                              attachments: [{
                                  filename: 'report.pdf',
                                  path: `app/uploads/report_files/${content.report_name}_${content.report_filter_id}.pdf`,
                                  contentType: 'application/pdf'
                                }],
                           
                            };
                            smtpTransport.sendMail(mailOptions, function (err) {
                             console.log('done')
                            });
                          
                     
                  console.log("File created successfully");
                      
                  
                          }
                 
              });
            // }
            // await upload_file();
            // async function finalRespone(){
            //             console.log("done -")
    
            // }
            // await finalRespone()
    
        
          }
      });
     
         
           
           
        //    }
         }
      })  })
}

async function weeklyScheduleReport(req,res)
{
   
var date=new Date();  // Gets the current time

 var dt = dateTime.create(); 
 var formatted = dt.format('Y-m-d H:M:S');

const day = date.getDay();
console.log(day )

var week_day;
var weekday=new Array(7);
weekday[1]="monday";
weekday[2]="tuesday";
weekday[3]="wednesday";
weekday[4]="thursday";
weekday[5]="friday";
weekday[6]="saturday";
weekday[7]="sunday";
for(var p=1;p<= 7;p++)
{
    if(p===day)
    {
     week_day=weekday[p];   
    }
}
console.log("Today is " + weekday[3]);
    await db.query("SELECT * FROM tbl_report_schedules inner join tbl_report_filters on tbl_report_filters.report_filter_id=tbl_report_schedules.report_filter_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_report_filters.reg_user_id WHERE tbl_report_schedules.weekly='"+week_day+"'",{ type:db.QueryTypes.SELECT}).then(async function(email_schedule){


        async.each(email_schedule,async function (content, cb) {

console.log("start_date jjjjjj",content.start_date);  
                     console.log("start_date jjjjjj",content.end_date); 
               
                         
                         console.log("start_date jjjjjj",formatted);  
                if(content.end_date>formatted&&content.start_date<formatted){
    
            var reg_user_id,report_filter_id;
            var report_data_type=[];
            var checked_array=[];
            var report_data=[];
        
            var report_name,pdf_type,report_data_type,user_type,email,report_id; 
           reg_user_id =content.reg_user_id;
           user_type =content.user_type;
           email =content.email;
    
          // var report_id=2;
          // var report_filter_id=37;
          // var report_data_type=[];
          // var checked_array=[];
          report_data.push(content)
    
          db.query("SELECT * FROM tbl_report_filter_columns where deleted='0' and report_filter_id="+content.report_filter_id+" order by report_filter_id desc",{ type:db.QueryTypes.SELECT}).then(async function(view_column_list){
      
              for(var i=0;i<view_column_list.length;i++)
              {
                  checked_array[i]=view_column_list[i].column_name;
              }
              // console.log("************column_name_array************* ",checked_array);
                  
            
              // await db.query("SELECT * FROM tbl_master_reports WHERE deleted='0' and status='active' and report_id="+report_id,{ type:db.QueryTypes.SELECT}).then(async function(market_list_result){
                  
              //     var report_type = market_list_result[0].report_name;
              // })
          })
      // })
          if(content.report_id==5){
              report_name='complaint_report';
              pdf_type='pdf_complaint.ejs';
      
              if(content.user_type=='client')
              {
                  console.log("client ");  
      
              await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
      
      
                  for(var i=0;i<complaint_data.length;i++)
                  {
                      report_data_type.push(complaint_data[i]);
      
                  }
                
              })
          }
          else{
              console.log("verifier ");  
      
              await db.query("SELECT complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where reg_user_id="+reg_user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(async function(complaint_data){
      
                  for(var i=0;i<complaint_data.length;i++)
                  {
                      report_data_type.push(complaint_data[i]);
      
                  }
              
              })
          }
          }
          // console.log("complaint_data ",complain_data_array);  
          if(content.report_id==2){
      
              report_name='reflet_report';
              pdf_type='pdf_reflet.ejs';
              
              await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(reflet_id_data){
      
                  if(reflet_id_data.length>0){
                  for(var i=0;i<reflet_id_data.length;i++){
                      if(reflet_id_data[i].entity_company_country!=null){
                      await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+reflet_id_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                          reflet_id_data[i].country_name = country_data[0].country_name;
                          // console.log("reflet_id_data ",reflet_id_data); 
                          if(i==(reflet_id_data.length-1)){
                             
                              for(var j=0;j<reflet_id_data.length;j++)
                              {
                                  report_data_type.push(reflet_id_data[j]);
      
                              }
                          } 
                          
                      })
                  }else{
                      reflet_id_data[i].country_name = '-';
                      if(i==(reflet_id_data.length-1)){
                          for(var j=0;j<reflet_id_data.length;j++)
                          {
                              report_data_type.push(reflet_id_data[j]);
                          }
                      } 
                  }
                  }
                  }else{
                      console.log("reflet_id_data ",reflet_id_data);  
                      for(var j=0;j<reflet_id_data.length;j++)
                      {
                          report_data_type.push(reflet_id_data[j]);
                      }
                  }
              })
          }
      
         else if(content.report_id==4)
          {
              report_name='client_report';
              pdf_type='pdf_client.ejs';
              
              await db.query("SELECT * FROM tbl_wallet_reflectid_rels inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id+" and user_as='client'",{ type:db.QueryTypes.SELECT}).then(async function(client_data){
                  
                  if(client_data.length>0){
                      for(var i=0;i<client_data.length;i++){
                          if(client_data[i].entity_company_country!=null){
                          await db.query("SELECT * FROM tbl_countries WHERE status='active' AND country_id="+client_data[i].entity_company_country,{ type:db.QueryTypes.SELECT}).then(async function(country_data){
                              client_data[i].country_name = country_data[0].country_name;
                              // console.log("reflet_id_data ",client_data); 
                              if(i==(client_data.length-1)){
                            
                                      for(var j=0;j<client_data.length;j++)
                                      {
                                          report_data_type.push(client_data[j]);
      
                                      }
                              } 
                              
                          })
                      }else{
                          client_data[i].country_name = '-';
                          if(i==(client_data.length-1)){
                              for(var j=0;j<client_data.length;j++)
                              {
                                  report_data_type.push(client_data[j]);
      
                              }
                          } 
                      }
                      }
                      }else{
                          for(var j=0;j<client_data.length;j++)
                          {
                              report_data_type.push(client_data[j]);
      
                          }
                      }
              
              })
          }
          else if(content.report_id==1)
          {
              report_name='sub_verifier_report';
              pdf_type='pdf_subverifier.ejs';
              
              await db.query("SELECT *,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.deleted='0'and tbl_invite_sub_verifiers.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(sub_verifier_data){
      
                  for(var i=0;i<sub_verifier_data.length;i++)
                                      {
                                          report_data_type.push(sub_verifier_data[i]);
      
                                      }    
              })
          } 
          else if(content.report_id==3)
          {
              report_name='on_boarding_report';
              pdf_type='pdf_onbording.ejs';
              
                  await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.p_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.verifier_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(ver_par_cat_data){
                      // console.log("ver_par_cat_data ",ver_par_cat_data);  
                      if(ver_par_cat_data.length>0){
                      for(var i=0;i<ver_par_cat_data.length;i++){
                          await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id="+ver_par_cat_data[i].request_id,{ type:db.QueryTypes.SELECT}).then(async function(client_sub_cat_data){
                              ver_par_cat_data[i].client_sub = client_sub_cat_data;
                              if(i==(ver_par_cat_data.length-1)){
      
                                  for(var j=0;j<ver_par_cat_data.length;j++)
                                  {
                                      report_data_type.push(ver_par_cat_data[j]);
      
                                  }    
                                  
                              } 
                          })
                      } 
                  }else{
                      for(var j=0;j<ver_par_cat_data.length;j++)
                                  {
                                      report_data_type.push(ver_par_cat_data[j]);
      
                                  }    
                  }
                  })
              }
                          // console.log("EEEEEEEEEERRRRRRRRR     in  ",report_name,'report_filter_id ',email_schedule[k].report_filter_id)
    
          ejs.renderFile('app/views/front/my-reports/'+pdf_type, {report_data,checked_array,report_data_type,moment,user_type},async (err, data) => {
              // console.log("don1 "+data)
      
          if (err) {
              console.log("EEEEEEEEEERRRRRRRRR       1"+err)
          } else {
      
              let options = {
                  "height": "11.25in",
                  "width": "8.5in",
                  "header": {
                      "height": "20mm"
                  },
                  "footer": {
                      "height": "20mm",
                  },
              };
              console.log("EEEEEEEEEERRRRRRRRR out      ",content.report_name,'report_filter_id ',content.report_filter_id)
    
              // async function upload_file(){
    
              pdf.create(data, options).toFile("app/uploads/report_files/"+content.report_name+"_"+content.report_filter_id+".pdf",async function (err, data) {
                  // console.log("don441 "+data)
                  console.log("EEEEEEEEEERRRRRRRRR    in   ",content.report_name,'report_filter_id ',content.report_filter_id)
    
                  if (err) {
                    console.log("pdf create data       2"+err)
    
      
                  } else {
    
                          // data='update';
    
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
                              subject: "MyReflet Schedule Report.",
                              attachments: [{
                                  filename: 'report.pdf',
                                  path: `app/uploads/report_files/${content.report_name}_${content.report_filter_id}.pdf`,
                                  contentType: 'application/pdf'
                                }],
                           
                            };
                            smtpTransport.sendMail(mailOptions, function (err) {
                             console.log('done')
                            });
                          
                     
                  console.log("File created successfully");
                      
                  
                          }
                 
              });
         
        
          }
      });
     
         
           
           
           }
         })
    })
}
// expiry mail
async function expiryMail(req,res)
{
// var dt = dateTime.create(); 
// var date=new Date(formatted);
// console.log(date)

// date.setDate(date.getDate() - 3);
// var  three_day = moment().subtract(3,'d').format('Y-m-d H:M:S');
// console.log(three_day)

// var dt = dateTime.create(); 
// var formatted = dt.format('Y-m-d H:M:S');
// var  three_day =   proposedDate + "T00:00:00.000Z";

var date = new Date();
date.setDate(date.getDate() - 3);

var finalDate = date.getFullYear()+'-'+ (date.getMonth()+1) +'-'+date.getDate();
    console.log(finalDate)

   await db.query("SELECT * FROM `tbl_myreflectid_doc_rels` INNER JOIN tbl_documents_masters on tbl_documents_masters.doc_id=tbl_myreflectid_doc_rels.doc_id INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id INNER JOIN tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id",{ type:db.QueryTypes.SELECT}).then(async function(expiry_mail){

        async.each(expiry_mail,async function (content, cb) {
         
         var email=content.email
         var full_name=content.full_name

         var last_name=content.last_name
         var reflect_code=content.reflect_code

         var document_name=content.document_name
         var expire_date=content.expire_date
         var reg_user_id=content.reg_user_id

var finalDate12= expire_date.getFullYear()+'-'+ (expire_date.getMonth()+1) +'-'+expire_date.getDate();
    // console.log(finalDate12)

    // ["29", "1", "2016"]

                      // console.log('inside if',email,' reflect_code : ',reflect_code,' expire_date: ',expire_date)

                    if(finalDate12===finalDate){

                      console.log(' %%%%%%%%%%%%%%%%  ')
                        await  NotificationModel.create({
                                                    notification_msg:`Your ${document_name} of reflect code ${reflect_code} is going to be expire in less than 2 days`,
                                                    sender_id:'1',
                                                    receiver_id:reg_user_id,
                                                    notification_type:'6',
                                                    notification_date:new Date()
                                        }).then(async(notification) =>{
                      console.log('inside if  ',notification)

                                            console.log('notification if  ',notification)

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
                              subject: "My Reflect Document Expired !!..",
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
                                        <img src="https://ipfs.io/ipfs/QmXbeEe9GitwBAcprF9qPSWwLHdNJ2Hp9Vtur8QBmqDxkY" style="width: 120px;">
                                      </div>
                                      <div style="padding: 30px;line-height: 32px; text-align: justify;">
                                        <h4 style="font-size: 20px; margin-bottom: 0;">Dear, ${full_name} ${last_name}</h4>
                                        <p><span style="color:red">Alert</span>!Your ${document_name} of reflect code ${reflect_code} is going to be expire in less than 2 days.

                                        </p>
                                        <p>Please check it. </p>

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
                                                  console.log(' %%%%%%%wery67u8%%%%%%%%%  ')

                            smtpTransport.sendMail(mailOptions, function (err) {
                             console.log('done oru',err)
                                                          // console.log('done',mailOptions)

                                                   console.log(' %%%%%%%%% sdfgy%%%%%%%  ')

                            });
                          
                     })

                    }
                  
       })
   })

}
