// ********************* Complaints ******************
var { ComplaintModel,CommentModel} = require('../../models/complaint');

var admin_notification = require('../../helpers/admin_notification.js')

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
// var admin_notification = require('../../helpers/admin_notification.js')
/**complaint-list Get method Start**/
var {NotificationModel} = require('../../models/notification');
var {MyReflectIdModel, DocumentReflectIdModel,FilesDocModel} = require('../../models/reflect');
var {UserModel,LogDetailsModel}=require('../../models/user');

var { decrypt, encrypt } = require('../../helpers/encrypt-decrypt')

const paginate   =  require("paginate-array");

exports.complaint_list=(req,res,next) =>{
    var user_type = req.session.user_type;

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]


    var user_id=req.session.user_id;
    var verifier_array=[]
    if(user_id)
    {

        console.log("user type",user_type);

        if(user_type=='client')
        {

            console.log("client");

             db.query("SELECT reflectid_by,complain_id,created_at,rep_firstname,entity_company_name,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reg_user_id="+user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(function(all_complaint){

                console.log("all_complaint client",all_complaint);


                 db.query("SELECT DISTINCT reflect_code,user_as,rep_firstname,reflectid_by,profile_pic,entity_company_name,full_name from  tbl_user_registrations inner join tbl_wallet_reflectid_rels ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id  WHERE tbl_wallet_reflectid_rels.reflectid_by!='digitalWallet' and tbl_wallet_reflectid_rels.user_as='client' and tbl_user_registrations.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(all_reflect_codes){


                      db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE user_as='verifier' and  tbl_user_registrations.reg_user_id <>"+user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifiers){
    
                        for(var i=0;i<verifiers.length;i++){
                            await db.query('SELECT count(*) as total from tbl_myreflectid_doc_rels where reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_docs){
                                console.log("verifier_docs------------- ",verifier_docs)
                                await db.query('SELECT count(*) as verified from tbl_myreflectid_doc_rels where admin_status="verified" AND reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT}).then(function(verified_docs){
                                    console.log("verified_docs------------- ",verified_docs)
                                    if(verifier_docs[0].total==verified_docs[0].verified && verifier_docs[0].total != 0){
                                        verifier_array.push(verifiers[i]);
                                    }
                                })
                            })
                        }

                        if (all_complaint.length > 0) {

                                page_data=all_complaint
                     
                            }


                            const complaint_report_list = paginate(page_data,page, perPage);
                            console.log("complaint_report_list : ",complaint_report_list)
                         res.render('front/complaints/complaints-list',{
                                        success_msg,
                                        err_msg,
                                        session:req.session,verifier_user:verifier_array,all_complaint:complaint_report_list,moment,all_reflect_codes,user_type
                                        

                          });


                     });



             });

                  });
        }
        else 
        {
            console.log("verifier");

            db.query("SELECT complain_id,reflectid_by,created_at,entity_company_name,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where reg_user_id="+user_id+") order by tbl_complaints.complain_id desc",{ type:db.QueryTypes.SELECT}).then(function(all_complaint){



                 db.query("SELECT DISTINCT reflectid_by,reflect_code,user_as,rep_firstname,profile_pic,entity_company_name,full_name from  tbl_user_registrations inner join tbl_wallet_reflectid_rels ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id  WHERE  tbl_wallet_reflectid_rels.user_as='verifier' and tbl_user_registrations.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(all_reflect_codes){

               console.log("all_complaint verifier",all_reflect_codes);

                    db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE tbl_user_registrations.reg_user_id <>"+user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_user){
    
                        if (all_complaint.length > 0) {

                                page_data=all_complaint
                     
                            }


                            const complaint_report_list = paginate(page_data,page, perPage);

                         res.render('front/complaints/complaints-list',{
                                        success_msg,
                                        err_msg,
                                        session:req.session,verifier_user,all_complaint:complaint_report_list,moment,all_reflect_codes,user_type
                                        

                          });


                     });


                 });



             });

        }
   
       
    

        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

}
/**complaint-list Get method End**/

/**complaint-submit Post method Start**/
exports.complaint_submit=(req,res,next) =>{
    var client_reflect_code=req.body.client_reflect_id
    var verifier_reflect_id=req.body.verifier_reflect_id
    var client_reflect_name=req.body.client_reflect_name

    var complain_message=req.body.complain_message
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    var user_id=req.session.user_id;
     console.log('reflect_id : ',verifier_reflect_id)
     console.log('complain_message : ',complain_message)

    if(user_id)
    {
        /**get my all reflect code start**/
       
        ComplaintModel.create({client_reflect_code:client_reflect_code,client_reflect_name:client_reflect_name,reflect_id:verifier_reflect_id,complain_message:complain_message,created_at:formatted,updated_at:formatted,}).then(async result=>{
            var u_data = await db.query("SELECT * FROM tbl_user_registrations where deleted='0' and reg_user_id="+user_id,{ type:db.QueryTypes.SELECT});
            var ref_data = await db.query("SELECT * FROM tbl_wallet_reflectid_rels where deleted='0' and reflect_code="+client_reflect_code,{ type:db.QueryTypes.SELECT});

            var msg = `${decrypt(u_data[0].full_name)} has filed a complaint.`                           
            admin_notification(msg,user_id,ref_data[0].reflect_id,'5');
            
      await MyReflectIdModel.findOne({where:{reflect_id:verifier_reflect_id }}).then(async(myRefdata)=>
          {  
                await   UserModel.findOne({where:{reg_user_id:user_id}}).then(async user_data => {

             var msg = ` ${decrypt(user_data.full_name)} is create a new complaint for ${myRefdata.reflect_code}.`

                               await  NotificationModel.create({
                                                    notification_msg:msg,
                                                    sender_id:user_id,
                                                    receiver_id:myRefdata.reg_user_id,
                                                    notification_type:'5',
                                                    notification_date:new Date()
                                        }).then(async(notification) =>{
                                                   console.log(notification)
                                                   })
                                    })
               })
    var data='true';
           res.send(data)
   
        });
        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

}
/**complaint-submit Post method End**/

/**show-complaints-by-status Post method Start**/
exports.complaint_list_by_status=(req,res,next) =>{
    console.log('complain_list ********************')
 var status_list=[]
 status_list=JSON.parse(req.body.status_list);
    // var all_document_data_list=[]
    var result_code_array=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
       // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",status_list)

   
       var user_type=req.session.user_type;

    var user_id=req.session.user_id;
    if(user_id)
    {


       

        var complaint_status_list=status_list.join("','");
     
        if(user_type=='client')
        {


       console.log("join data",complaint_status_list);


        /**get my all reflect code start**/
       
       db.query("SELECT reflectid_by,entity_company_name,complain_id,created_at,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reg_user_id="+user_id+") AND tbl_complaints.complaint_status IN ('"+complaint_status_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(all_complaint){

                    console.log('users type : ',all_complaint)

       
         
             
            
                    res.render('front/complaints/ajax_complaint_filter',{
                        all_complaint,user_type,moment
                    })
             
              
        });
    }
    else{
        console.log("join data",complaint_status_list);


        /**get my all reflect code start**/
       
       db.query("SELECT complain_id,created_at,entity_company_name,reflectid_by,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where reg_user_id="+user_id+") AND tbl_complaints.complaint_status IN ('"+complaint_status_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(all_complaint){

                    console.log('users type : ',all_complaint)

       
         
            
                    res.render('front/complaints/ajax_complaint_filter',{
                        all_complaint,user_type,moment
                    })
             
              
        });
    }
       
        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

}
/**show-complaints-by-status Post method End**/

/**show-complaints-by-reflect-code Post method Start**/
exports.complaint_list_by_reflect_code=(req,res,next) =>{
    console.log('complain_list ********************')
 var reflect_code_list=[]
 reflect_code_list=JSON.parse(req.body.reflect_code_list);
    // var all_document_data_list=[]
    var result_code_array=[]
    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_code_list)
 
 

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;

    if(user_id)
    {
        /**get my all reflect code start**/
    
        var complaint_reflect_code_list=reflect_code_list.join("','");

       if(user_type=='client')
       {
                       console.log('users type : ',user_type)

        db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  inner join tbl_complaints ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_user_registrations.reg_user_id="+user_id+" AND tbl_complaints.client_reflect_code IN ('"+complaint_reflect_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(all_complaint){

            console.log('users type : ',all_complaint)


    
     
   
                    res.render('front/complaints/ajax_complaint_filter',{
                        all_complaint,user_type,moment
                    })
             
      
});

       }
      else{
        console.log('users type : ',user_type)
             
          db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  inner join tbl_complaints ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_user_registrations.reg_user_id="+user_id+" AND tbl_wallet_reflectid_rels.reflect_code IN ('"+complaint_reflect_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(all_complaint){

        // console.log('users type : ',all_complaint)



 

                    res.render('front/complaints/ajax_complaint_filter',{
                        all_complaint,user_type,moment
                    })
             
  
});
}
       
        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

}
/**show-complaints-by-reflect-code Post method Start**/

/**show-complaints-by-complain-id Post method Start**/
exports.complaint_list_by_complain_id=(req,res,next) =>{
    console.log('complain_list ********************')
 var complain_list=[]
 complain_list=JSON.parse(req.body.complain_list);
    // var all_document_data_list=[]
    var result_code_array=[]
    var user_type=req.session.user_type;

    // var array = req.body;
    // res.end(array[0]["QuestionText"].toString());
        console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",complain_list)



    var user_id=req.session.user_id;
    if(user_id)
    {
        var complain_list_1=complain_list.join("','");

        /**get my all reflect code start**/
        if(user_type=='client')
       {
       db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  inner join tbl_complaints ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_user_registrations.reg_user_id="+user_id+" And tbl_complaints.complain_id IN ('"+complain_list_1+"')",{ type:db.QueryTypes.SELECT}).then(async function(all_complaint){

                    // console.log('users type : ',all_complaint)

       
            // all_complaint.forEach(result_code => {
            //     //
                
            //     // console.log('daaaaaaaaaaaaa status List [i] : ',result_code.reflect_code)

            //         for(var i=0;i<complain_list.length;i++)
            //         {
            //     if(result_code.complain_id==complain_list[i])
            //     {
            //         // console.log('daaaaaaaaaaaaa reflect_code List [i] : ',result_code.complain_id)
            //         result_code_array[i]=result_code
                   
            //     }
            //    }
              
                // console.log('result_code_array : ',result_code_array)
                
             

            // 

            
             
           
                    res.render('front/complaints/ajax_complaint_filter',{
                        all_complaint,user_type,moment
                    })
             
              
        });
    }
    else{
        db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  inner join tbl_complaints ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_user_registrations.reg_user_id="+user_id+" AND tbl_complaints.complain_id IN ('"+complain_list_1+"')",{ type:db.QueryTypes.SELECT}).then(async function(all_complaint){
          
          
                    res.render('front/complaints/ajax_complaint_filter',{
                        all_complaint,user_type,moment
                    })
             
              
       
        })

    }
        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

}
/**show-complaints-by-complain-id Post method End**/

/**complaint-details Get method Start**/
exports.view_complaint_details=(req,res,next) =>{
    var c_id =req.params.id;
    var user_type=req.session.user_type;

    var user_id=req.session.user_id;
   var complain_id=c_id.replace(/:/g,"");
 
  
     console.log('complain_id :',complain_id)
    if(user_id)
    {
        /**get my all reflect code start**/
       
       db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_complaints ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id inner join tbl_complaint_comments ON tbl_complaint_comments.complain_id=tbl_complaints.complain_id inner join tbl_user_registrations ON tbl_complaint_comments.comment_user_id=tbl_user_registrations.reg_user_id  where tbl_complaint_comments.complain_id="+complain_id,{ type:db.QueryTypes.SELECT}).then(async function(view_details){
                                console.log('daaaaaaaaaaaaa view List [i] : ',view_details)
       

        
        db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id  inner join tbl_complaints ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id where tbl_complaints.complain_id="+complain_id,{ type:db.QueryTypes.SELECT}).then(async function(comment_list){
        
        //     view_details.forEach(result_code => {
                
                
        //          if(result_code.complain_id==complain_id)
        //          {
        //             // console.log('daaaaaaaaaaaaa view List [i] : ',result_code)
        //              all_view_list=result_code
        //          } 
                   
        //         // console.log('result_code_array : ',comment_list)
               
        //         })
                
        //         comment_list.forEach(result_code => {
                    
                    
        //              if(result_code.complain_id==complain_id)
        //              {
        //                 // console.log('daaaaaaaaaaaaa view List [i] : ',result_code)
        //                 all_comment_list.push(result_code)
        //              } 
        //             else{

        //             }
        //             console.log('result_comment list : ',all_comment_list.complain_id)
                   
        //             })
        console.log('userSSSSSSSSSSSSSSSSSSSSSSSSSSSS : ',comment_list)
             res.render('front/complaints/complaint-details',{
                            success_msg,
                            err_msg,
                            session:req.session,view_details,moment,user_id,user_type,comment_list
                            // myreflectData:all_reflect_codes

    });
       });});
        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

}
/**complaint-details Get method End**/

/**submit-comment Post method Start**/
exports.submit_comment=(req,res,next) =>{
    var user_id=req.session.user_id;
    var comment=req.body.comment
    var complain_id=req.body.complain_id
    // var reflect_id=req.body.complain_id
    var user_type=req.session.user_type;

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

     console.log('reflect_id : ',comment)
     console.log('complain_message : ',complain_id)

    if(user_id)
    {
        /**get my all reflect code start**/
        // if(user_type=='client')
        // {
    CommentModel.create({comment:comment,complain_id:complain_id,comment_user_id:user_id,comment_date:formatted,created_at:formatted,updated_at:formatted,}).then(async result=>{
    if(user_type=='verifier')
    {
        console.log("ifffffffff")
     await ComplaintModel.findOne({where:{complain_id:complain_id }}).then(async(complaint_data)=>
          {       
                    console.log("complaint_data : ",complaint_data.client_reflect_code)

         await MyReflectIdModel.findOne({where:{reflect_code:complaint_data.client_reflect_code }}).then(async(myRefdata)=>
              {  
                                    console.log("complaint_data : ",myRefdata)

                await   UserModel.findOne({where:{reg_user_id:user_id}}).then(async user_data => {

             var msg = ` ${decrypt(user_data.full_name)} is comment on C-${complain_id} complaint Id.`

                               await  NotificationModel.create({
                                                    notification_msg:msg,
                                                    sender_id:user_id,
                                                    receiver_id:myRefdata.reg_user_id,
                                                    notification_type:'5',
                                                    notification_date:new Date()
                                        }).then(async(notification) =>{
                                                   console.log(notification)
                                                   })
                                    })
               })
     })

     }
     else{
         await ComplaintModel.findOne({where:{complain_id:complain_id }}).then(async(complaint_data)=>
          {       
         await MyReflectIdModel.findOne({where:{reflect_id:complaint_data.reflect_id }}).then(async(myRefdata)=>
              {  
                await   UserModel.findOne({where:{reg_user_id:user_id}}).then(async user_data => {

             var msg = ` ${decrypt(user_data.full_name)} is comment on C-${complain_id} complaint Id.`

                               await  NotificationModel.create({
                                                    notification_msg:msg,
                                                    sender_id:user_id,
                                                    receiver_id:myRefdata.reg_user_id,
                                                    notification_type:'5',
                                                    notification_date:new Date()
                                        }).then(async(notification) =>{
                                                   console.log(notification)
                                                   })
                                    })
               })
     })

     }           console.log('comment users : ',result)

             var comment_data='true';

           res.send(comment_data)
    
        });
        // }
        // else
        // {
           
        // }
        
        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

}
/**submit-comment Post method End**/

/**submit-comment Post method Start**/
exports.submit_comment1=(req,res,next) =>{
    var user_id=req.session.user_id;
    var comment=req.body.comment
    var complain_id=req.body.complain_id
     
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    var user_id=req.session.user_id;
     console.log('reflect_id : ',comment)
     console.log('complain_message : ',complain_id)


    if(user_id)
    {
        /**get my all reflect code start**/
        if(user_type=='client')
        {
            CommentModel.create({comment:comment,complain_id:complain_id,comment_user_id:user_id,comment_date:formatted,created_at:formatted,updated_at:formatted,}).then(result=>{
            
    

                console.log('comment users : ',result)

             var comment_data='true';

           res.send(comment_data)
    
        });
        }
        else
        {
           
        }
        
        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

}
/**submit-comment Post method End**/
exports.show_verifier_by_addbook=async(req,res,next) =>
{
    var user_type = req.session.user_type;

    var user_id=req.session.user_id;
    var userId=req.session.user_id
    var verifier_array=[]
    await  db.query('SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id where tbl_wallet_reflectid_rels.reflect_code IN (SELECT verifier_code FROM `tbl_address_books` WHERE reg_user_id='+userId+' AND deleted="0" AND status="active")',{ type:db.QueryTypes.SELECT}).then(async(verifiers)=>{
 
         for(var i=0;i<verifiers.length;i++){
             await db.query('SELECT count(*) as total from tbl_myreflectid_doc_rels where reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_docs){
                 console.log("verifier_docs------------- ",verifier_docs)
                 await db.query('SELECT count(*) as verified from tbl_myreflectid_doc_rels where admin_status="verified" AND reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT}).then(function(verified_docs){
                     console.log("verified_docs------------- ",verified_docs)
                     if(verifier_docs[0].total==verified_docs[0].verified && verifier_docs[0].total != 0){
                         verifier_array.push(verifiers[i]);
                     }
                 })
             })
         }
 
 
         // console.log("userdata verfier list",verifierListData)
         res.render('front/complaints/ajax_verifier_addbook',{verifier_user:verifier_array,
                })
     }).catch(err=>console.log("err..verifier list.",err))
// var verifier_array=[]
//     db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.user_as='verifier' and tbl_user_registrations.reg_user_id <> "+user_id+" and tbl_wallet_reflectid_rels.reg_user_id In (SELECT reg_user_id FROM `tbl_address_books` )",{ type:db.QueryTypes.SELECT}).then(async function(verifiers){
//         for(var i=0;i<verifiers.length;i++){
//             await db.query('SELECT count(*) as total from tbl_myreflectid_doc_rels where reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_docs){
//                 console.log("verifier_docs------------- ",verifier_docs)
//                 await db.query('SELECT count(*) as verified from tbl_myreflectid_doc_rels where admin_status="verified" AND reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT}).then(function(verified_docs){
//                     console.log("verified_docs------------- ",verified_docs)
//                     if(verifier_docs[0].total==verified_docs[0].verified && verifier_docs[0].total != 0){
//                         verifier_array.push(verifiers[i]);
//                     }
//                 })
//             })
//         }

//     res.render('front/complaints/ajax_verifier_addbook',{verifier_user:verifier_array,
//     })
//     })
}
// complaint search
exports.search_complaint=(req,res,next) =>{
    var user_type = req.session.user_type;

    var user_id=req.session.user_id;

    var query=req.body.query;
    var verifier_array=[]
    if(user_id)
    {

        console.log("user type",user_type);

        if(user_type=='client')
        {

            console.log("client");

             db.query("SELECT complain_id,created_at,rep_firstname,entity_company_name,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE client_reflect_code IN(SELECT reflect_code FROM tbl_wallet_reflectid_rels where reg_user_id="+user_id+") and (complain_id LIKE '%"+query+"%' or tbl_complaints.created_at LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.reflect_code LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.rep_firstname LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.entity_company_name LIKE '%"+query+"%' or tbl_complaints.client_reflect_name LIKE '%"+query+"%' or tbl_complaints.client_reflect_code LIKE '%"+query+"%' or tbl_complaints.complaint_status LIKE '%"+query+"%' or tbl_complaints.complain_message LIKE '%"+query+"%') ",{ type:db.QueryTypes.SELECT}).then(function(all_complaint){

                console.log("all_complaint client",all_complaint);


         
    
                         res.render('front/complaints/ajax_complaint_filter',{
                                        success_msg,
                                        err_msg,
                                        session:req.session,all_complaint,moment,user_type
                                        

                       



             });

                  });
        }
        else 
        {
            console.log("verifier");

            db.query("SELECT complain_id,created_at,entity_company_name,rep_firstname,reflect_code,client_reflect_code,client_reflect_name,complaint_status,complain_message,user_as,complain_id from tbl_complaints INNER JOIN  tbl_wallet_reflectid_rels ON tbl_complaints.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_complaints.reflect_id IN(SELECT reflect_id FROM tbl_wallet_reflectid_rels where reg_user_id="+user_id+") and (complain_id LIKE '%"+query+"%' or tbl_complaints.created_at LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.reflect_code LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.rep_firstname LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.entity_company_name LIKE '%"+query+"%' or tbl_complaints.client_reflect_name LIKE '%"+query+"%' or tbl_complaints.client_reflect_code LIKE '%"+query+"%' or tbl_complaints.complaint_status LIKE '%"+query+"%' or tbl_complaints.complain_message LIKE '%"+query+"%') ",{ type:db.QueryTypes.SELECT}).then(function(all_complaint){


 
               


                         res.render('front/complaints/ajax_complaint_filter',{
                                        success_msg,
                                        err_msg,
                                        session:req.session,all_complaint,moment,user_type
                                        

                       


                 });



             });

        }
   
       
    

        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

}
// Complaint search

// resolve and closed complaint
exports.complaint_resolved_and_closed=(req,res,next) =>{
    var user_type = req.session.user_type;

    var user_id=req.session.user_id;

    var complain_id=req.query.complain_id;
     var updateValues=
           {
               complaint_status:"responded"
           }
           ComplaintModel.update(updateValues, { where: { complain_id: complain_id } }).then((result) => 
           {

                   // req.flash('success_msg', 'Your password changed successfully !');
                   res.redirect('/complaint-list');
                
           })
          
}
   
 