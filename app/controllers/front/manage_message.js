var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var { tbl_verifier_plan_master,tbl_verifier_doc_list} = require('../../models/admin');
var { tbl_verfier_purchase_details } =require("../../models/purchase_detaile")
var { tbl_address_book } =require("../../models/address_book")
var { RefletManageMessage,RequestRefletManageMessage } =require("../../models/manage_message")
var {NotificationModel} = require('../../models/notification');

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
const paginate   =  require("paginate-array");
var { decrypt, encrypt } = require('../../helpers/encrypt-decrypt')

var {
  MarketPlaceMsg
}=require('../../models/market_place')

// Create msg request
exports.create_message_request=async (req,res,next)=>
{
    var reflect_id= req.query.reflect_id

    var user_id= req.session.user_id

    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S'); 

console.log("reflect_id ************************* " ,reflect_id)

if(req.session.user_type=='client')
  {
       await RequestRefletManageMessage.findOne({where:{reflect_id:reflect_id,create_sender_id:user_id}}).then(async(reflect_data) =>{
        console.log("reflect_id ************************* " ,reflect_data)

      if(reflect_data)
      {
      var  request_msg_id = reflect_data.request_msg_id;

      var reflect_id_inner = reflect_data.reflect_id;

      res.redirect(`manage-client-to-verifier-message?request_msg_id=${request_msg_id}&reflect_id=${reflect_id_inner}`)


      }
      else
      {
      await  MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(async(reflet_result) => {


      var user_type;
        console.log("reflect_id ************************* " ,reflet_result)
        
          user_type = 'client'
      
      await RequestRefletManageMessage.create({create_sender_id:user_id,create_receiver_id:reflet_result.reg_user_id,reflect_id:reflect_id,request_date:formatted,createdAt:formatted,updatedAt:formatted}).then(async add_data =>{
                      console.log("reflect_id ************************* " ,add_data)

      await RequestRefletManageMessage.findOne({where:{reflect_id:reflect_id,create_sender_id:user_id}}).then(async(reflect_data_inner) =>{

      var  request_msg_id = reflect_data_inner.request_msg_id;

      var reflect_id_inner = reflect_data_inner.reflect_id;


      res.redirect(`manage-client-to-verifier-message?request_msg_id=${request_msg_id}&reflect_id=${reflect_id_inner}`)
          });
      }) 
      })
      }

      }); 
}else{

  var client_id = req.query.client_id
  console.log("client_id ************************* " ,client_id)
  await  MyReflectIdModel.findOne({where:{reflect_id:client_id}}).then(async(reflet_result) => {
    // console.log("reflet_result  KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK ************************* " ,reflet_result.reg_user_id)

  await RequestRefletManageMessage.findOne({where:{reflect_id:reflect_id,create_sender_id:reflet_result.reg_user_id}}).then(async(reflect_data) =>{
    // console.log("reflect_data  KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK ************************* " ,reflect_data)

  if(reflect_data)
  {
  var  request_msg_id = reflect_data.request_msg_id;

  var reflect_id_inner = reflect_data.reflect_id;

  res.redirect(`manage-client-to-verifier-message?request_msg_id=${request_msg_id}&reflect_id=${reflect_id_inner}`)


  }
  else
  {
        await  MyReflectIdModel.findOne({where:{reflect_id:client_id}}).then(async(reflet_result) => {


        // var user_type;
        console.log("reflect_id ************************* " ,reflet_result)
          
            // user_type = 'client'
        
        await RequestRefletManageMessage.create({create_sender_id:reflet_result.reg_user_id,create_receiver_id:req.session.user_id,reflect_id:reflect_id,request_date:formatted,createdAt:formatted,updatedAt:formatted}).then(async add_data =>{
                        console.log("reflect_id ************************* " ,reflet_result.reg_user_id)

        await RequestRefletManageMessage.findOne({where:{reflect_id:reflect_id,create_sender_id:reflet_result.reg_user_id}}).then(async(reflect_data_inner) =>{

        var  request_msg_id = reflect_data_inner.request_msg_id;

        var reflect_id_inner = reflect_data_inner.reflect_id;


        res.redirect(`manage-client-to-verifier-message?request_msg_id=${request_msg_id}&reflect_id=${reflect_id_inner}`)
            });
            
        }) 
   })
}
});
        });
}

}
// Create msg request

/***manage_verifier_meassge Post method Start*/
exports.manage_client_meassge= async(req,res,next )=>{
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
   
    var reg_user_id   =req.session.user_id 
   
    console.log("us",reg_user_id)

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    // var verifiers=[]

    var verifier_array=[]

    if(req.session.user_type=='client')
    {
   db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE user_as='verifier' and  tbl_user_registrations.reg_user_id <>"+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifiers){

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
          await db.query("select *from tbl_msg_requests inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_msg_requests.reflect_id  WHERE tbl_msg_requests.create_sender_id="+reg_user_id+"  order by request_msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(verifiers)=>{

               for(var i=0;i< verifiers.length;i++)
               {
                 var request_msg_id = verifiers[i].request_msg_id;

                 console.log('request_msg_id : ',request_msg_id)


                      await db.query("SELECT * FROM tbl_verifier_to_client_msgs where msg_id in (SELECT max(msg_id) FROM tbl_verifier_to_client_msgs group by request_msg_id having request_msg_id="+request_msg_id+" ) order by msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(msg_verifiers)=>{


                               if(msg_verifiers.length>0)
                               {
                                 
                                verifiers[i].message_data = msg_verifiers
                              

                               }
                               else
                               {
                                             verifiers[i].message_data = 'undefined'

                                }
                    
                         })


               }



                 console.log("verifiers ",verifiers)
                        if (verifiers.length > 0) {

                                page_data=verifiers
                     
                            }


                    const client_message_list = paginate(page_data,page, perPage);

                        res.render("front/Manage-message/manage-client-message-list",{verifiers_message_list:client_message_list,user_id:reg_user_id,moment,verifier_array});

            })
        })
    }
    else
    {
      db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE user_as='client' and  tbl_user_registrations.reg_user_id <>"+reg_user_id,{ type:db.QueryTypes.SELECT}).then( async(all_client)=>{

        db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id WHERE user_as='verifier' and  tbl_user_registrations.reg_user_id ="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifiers){

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
            db.query("select DISTINCT tbl_msg_requests.reflect_id,reflect_code,rep_firstname,entity_company_name from tbl_msg_requests inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_msg_requests.reflect_id WHERE tbl_msg_requests.create_receiver_id="+reg_user_id+" order by request_msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(my_verifiers)=>{

          await db.query("select DISTINCT tbl_user_registrations.reg_user_id,full_name,last_name from tbl_msg_requests inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_msg_requests.reflect_id INNER join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_msg_requests.create_sender_id WHERE tbl_msg_requests.create_receiver_id="+reg_user_id+" order by request_msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(my_client)=>{

               await db.query("select *from tbl_msg_requests inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_msg_requests.reflect_id INNER join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_msg_requests.create_sender_id WHERE tbl_msg_requests.create_receiver_id="+reg_user_id+" order by request_msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(verifiers)=>{

               for(var i=0;i< verifiers.length;i++)
               {
                 var request_msg_id = verifiers[i].request_msg_id;

                 console.log('request_msg_id : ',request_msg_id)


                      await db.query("SELECT * FROM tbl_verifier_to_client_msgs where msg_id in (SELECT max(msg_id) FROM tbl_verifier_to_client_msgs group by request_msg_id having request_msg_id="+request_msg_id+" ) order by msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(msg_verifiers)=>{


                               if(msg_verifiers.length>0)
                               {
                                verifiers[i].message_data = msg_verifiers
                              

                               }
                               else
                               {
                                            verifiers[i].message_data = 'undefined'

                                }
                    
                         })


               }


 
                 // console.log("verifiers ",verifiers)
                        if (verifiers.length > 0) {

                                page_data=verifiers
                     
                            }


                    const verifiers_message_list = paginate(page_data,page, perPage);

                        res.render("front/Manage-message/manage-verifier-message-list",{verifiers_message_list,moment,user_id:reg_user_id,my_verifiers,my_client,verifier_array,all_client});
                      })
                })
             })
            })
          })
      }
             
    

    
}
/***manage_verifier_meassge Post method End*/

//view msg
exports.client_view_message_list=async (req,res,next)=>
{
    var reflect_id= req.query.reflect_id
    var request_msg_id= req.query.request_msg_id


    var reg_id= req.session.user_id
    // console.log('.................................................................................')
    console.log('request_msg_id........',request_msg_id)
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")

var  verifier_name;
              await  MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(async(reflet_result) => {

                         if(reflet_result.rep_firstname){

                              verifier_name = reflet_result.rep_firstname

                               }
                               else if(reflet_result.entity_company_name){

                              verifier_name =  reflet_result.entity_company_name 

                                         }else{

                                verifier_name = decrypt(reflet_result.full_name )
                               }
})
               console.log('verifier_name : ',verifier_name)
 if(req.session.user_type=='client')
    {

                       var updateValues=
                                 {
                                     seen_status:'read'
                                 }
                                 RefletManageMessage.update(updateValues, { where: { request_msg_id: request_msg_id,receiver_user_id:reg_id} }).then((result) => 
                                 {
                                  console.log('read : ',result)
                                 })
              db.query("SELECT * FROM `tbl_verifier_to_client_msgs` inner join tbl_msg_requests on tbl_msg_requests.request_msg_id=tbl_verifier_to_client_msgs.request_msg_id INNER join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_verifier_to_client_msgs.sender_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_msg_requests.reflect_id WHERE tbl_verifier_to_client_msgs.request_msg_id="+request_msg_id+"  and tbl_msg_requests.create_sender_id="+reg_id+" and tbl_msg_requests.reflect_id="+reflect_id+" ORDER BY `tbl_verifier_to_client_msgs`.`msg_id` ASC",{ type:db.QueryTypes.SELECT}).then(async function(view_details){

                    console.log('view_details : ',view_details)

                  var length_status;
                  var receiver_user_id

                 
                 await       db.query("SELECT * FROM `tbl_msg_requests` WHERE request_msg_id="+request_msg_id,{ type:db.QueryTypes.SELECT}).then(function(receiver_user_id_data){
                                                                      // console.log('receiver_user_id : ',receiver_user_id_data)

                                   receiver_user_id = receiver_user_id_data[0].create_receiver_id

                                                                      // console.log('receiver_user_id : ',receiver_user_id)

                                 })

          await UserModel.findOne({ where: {reg_user_id:reg_id} }).then(async(userData) =>{
               
               var session_user_name = decrypt(userData.full_name);
                                   console.log('view_details session_user_name: ',session_user_name)

              res.render('front/Manage-message/manage-client-to-verifier-message',{ success_msg,
                 err_msg,
                 view_details,
                 session:req.session,
                 user_id:reg_id,request_msg_id,reflect_id,receiver_user_id,length_status,session_user_name,verifier_name
               
                          });
               });
          }) 
    }
    else
    {


                    var updateValues=
                                 {
                                     seen_status:'read'
                                 }
                                 RefletManageMessage.update(updateValues, { where: { request_msg_id: request_msg_id,receiver_user_id:reg_id} }).then((result) => 
                                 {
                                  console.log('read : ',result)
                                 })
                   db.query("SELECT * FROM `tbl_verifier_to_client_msgs` inner join tbl_msg_requests on tbl_msg_requests.request_msg_id=tbl_verifier_to_client_msgs.request_msg_id INNER join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_verifier_to_client_msgs.sender_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_msg_requests.reflect_id WHERE tbl_verifier_to_client_msgs.request_msg_id="+request_msg_id+" and tbl_msg_requests.create_receiver_id="+reg_id+" and tbl_msg_requests.reflect_id="+reflect_id+" ORDER BY `tbl_verifier_to_client_msgs`.`msg_id` ASC",{ type:db.QueryTypes.SELECT}).then(async function(view_details){



              console.log('view_details : ',view_details)

                  var length_status;
                  var receiver_user_id

                      await    db.query("SELECT * FROM `tbl_msg_requests` WHERE request_msg_id="+request_msg_id,{ type:db.QueryTypes.SELECT}).then(function(receiver_user_id_data){

                                   receiver_user_id = receiver_user_id_data[0].create_sender_id
                                 })
                                                    console.log('view_detailsJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ : ')

                                   console.log('view_details : ',receiver_user_id)

                  await UserModel.findOne({ where: {reg_user_id:reg_id} }).then(async(userData) =>{
               
               var session_user_name = decrypt(userData.full_name);
                                   console.log('view_details session_user_name: ',session_user_name)

              res.render('front/Manage-message/manage-client-to-verifier-message',{ success_msg,
                 err_msg,
                 view_details,
                 session:req.session,
                 user_id:reg_id,request_msg_id,reflect_id,length_status,receiver_user_id,session_user_name,verifier_name
                      })

               });
          }) 
    }

}

 //view msg 

 //Add msg 
exports.add_msg_for_verifier =async (req,res,next )=> {

    var reflect_id=req.body.reflect_id
    var request_msg_id=req.body.request_msg_id
    var message=req.body.msg 

    var receiver_user_id=req.body.receiver_user_id

    console.log("request_msg_id : ",request_msg_id) 
    console.log("message : ",message)
    console.log("reflect_id :",reflect_id)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S'); 

    var reg_user_id= req.session.user_id

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');



       if(req.session.user_type=='client')
                            {

              await  RequestRefletManageMessage.findOne({where:{request_msg_id:request_msg_id}}).then(async(reflet_result) => {

              await MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(async(result) => {
                             var receiver_id_parse= parseInt(result.reg_user_id);

    RefletManageMessage.create({sender_user_id:reg_user_id,online_type:"client",receiver_user_id:receiver_id_parse,message:message,request_msg_id:request_msg_id,msg_date:formatted,createdAt:formatted}).then(async add_data =>{





                 await UserModel.findOne({ where: {reg_user_id:reg_user_id} }).then(async(userData) =>{

                    var msg=`You have recieved a message from ${decrypt(userData.full_name)} for  ${result.reflect_code}.`;

                       

                            
                             var receiver_id_parse= parseInt(result.reg_user_id);

                                    await  NotificationModel.create({
                                                                notification_msg:msg,
                                                                sender_id:reg_user_id,
                                                                receiver_id:receiver_id_parse,
                                                                notification_type:'4',
                                                                notification_date:new Date()
                      
                                                          }).then(async(notification) =>{ res.send(add_data)  })
                       
                               
                            
                                                                                   
                           })
                             
        })

           })

     
       
    });
                   }else{ 

              console.log('ESSSSSSSSSSSE receiver_user_id : ',receiver_user_id)

      await  RequestRefletManageMessage.findOne({where:{request_msg_id:request_msg_id}}).then(async(reflet_result) => {


                             var receiver_id_parse = parseInt(receiver_user_id);

    RefletManageMessage.create({sender_user_id:reg_user_id,online_type:"veriifer",receiver_user_id:receiver_id_parse,message:message,request_msg_id:request_msg_id,msg_date:formatted,createdAt:formatted}).then(async add_data =>{


              await MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(async(result) => {


                 await UserModel.findOne({ where: {reg_user_id:reg_user_id} }).then(async(userData) =>{

                    var msg=`You have recieved a message from ${decrypt(userData.full_name)} for  ${result.reflect_code}.`;

                       

                            
                             var receiver_id_parse= parseInt(result.reg_user_id);

                                 
                                           await  NotificationModel.create({
                                                                notification_msg:msg,
                                                                sender_id:reg_user_id,
                                                                receiver_id:reflet_result.create_sender_id,
                                                                notification_type:'4',
                                                                notification_date:new Date()
                      
                                                          }).then(async(notification) =>{ res.send(add_data)  })
                            
                                                                                   
                           })
                             
        })

           })

     
       
    });
                    } 
  

}  
 //Add msg


exports.manage_client_msg_notifications = (req,res,next) =>{

    var reg_user_id= req.session.user_id

    db.query("SELECT count(*) as 'count_msg' FROM `tbl_msg_requests` INNER JOIN tbl_verifier_to_client_msgs on tbl_msg_requests.request_msg_id=tbl_verifier_to_client_msgs.request_msg_id WHERE   receiver_user_id="+reg_user_id+" and tbl_verifier_to_client_msgs.seen_status='unread' and create_sender_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(function(count){
        console.log("-----------notification_list--------------",count);


             res.send(count)
                 
    });
} 
exports.manage_verifier_msg_notifications = (req,res,next) =>{

    var reg_user_id= req.session.user_id

    db.query("SELECT count(*) as 'count_msg' FROM `tbl_msg_requests` INNER JOIN tbl_verifier_to_client_msgs on tbl_msg_requests.request_msg_id=tbl_verifier_to_client_msgs.request_msg_id WHERE receiver_user_id="+reg_user_id+" and tbl_verifier_to_client_msgs.seen_status='unread' and create_receiver_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(function(count){
        console.log("-----------notification_list--------------",count);


             res.send(count)
                 
    });
} 




/** search_client_msg_by_verifier Post method START**/     
exports.search_msg_by_date = async (req,res,next) =>{
    var user_type = req.session.user_type;
    var reg_user_id = req.session.user_id; 
    // var checked_list = req.body.checked_new;
   

    var startDate = req.body.startDate;
    var tomorrow = req.body.endDate;

    var  endDate= moment(tomorrow).add(1, 'days');

     var  StartDate = moment(startDate).format('YYYY-MM-DD');
    var  EndDate = moment(endDate).format('YYYY-MM-DD');
  

    console.log("startDate******************************* ",StartDate);  
    console.log("EndDate******************************* ",EndDate);  

  

    if(req.session.user_type=='client')
    {

 
          await db.query("select *from tbl_msg_requests inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_msg_requests.reflect_id  WHERE (tbl_msg_requests.createdAt BETWEEN '"+StartDate+"' and '"+EndDate+"') and tbl_msg_requests.create_sender_id="+reg_user_id+" order by request_msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(verifiers)=>{

               for(var i=0;i< verifiers.length;i++)
               {
                 var request_msg_id = verifiers[i].request_msg_id;

                 console.log('request_msg_id : ',request_msg_id)


                      await db.query("SELECT * FROM tbl_verifier_to_client_msgs  WHERE (tbl_verifier_to_client_msgs.createdAt BETWEEN '"+StartDate+"' and '"+EndDate+"') and msg_id in (SELECT max(msg_id) FROM tbl_verifier_to_client_msgs group by request_msg_id having request_msg_id="+request_msg_id+" ) order by msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(msg_verifiers)=>{


                               if(msg_verifiers.length>0)
                               {
                                verifiers[i].message_data = msg_verifiers
                              

                               }
                               else
                               {
                                             verifiers[i].message_data = 'undefined'

                                }
                    
                         })


               }



                 console.log("verifiers ",verifiers)
                      

                        res.render("front/Manage-message/ajax-filter-client",{verifiers_message_list:verifiers,user_id:reg_user_id,moment});

        })
    }
    else
    {


               await db.query("select *from tbl_msg_requests inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_msg_requests.reflect_id INNER join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_msg_requests.create_sender_id WHERE (tbl_msg_requests.createdAt BETWEEN '"+StartDate+"' and '"+EndDate+"') and tbl_msg_requests.create_receiver_id="+reg_user_id+" order by request_msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(verifiers)=>{

               for(var i=0;i< verifiers.length;i++)
               {
                 var request_msg_id = verifiers[i].request_msg_id;

                 console.log('request_msg_id : ',request_msg_id)


                      await db.query("SELECT * FROM tbl_verifier_to_client_msgs WHERE (tbl_verifier_to_client_msgs.createdAt BETWEEN '"+StartDate+"' and '"+EndDate+"') and msg_id in (SELECT max(msg_id) FROM tbl_verifier_to_client_msgs group by request_msg_id having request_msg_id="+request_msg_id+" ) order by msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(msg_verifiers)=>{


                               if(msg_verifiers.length>0)
                               {
                                verifiers[i].message_data = msg_verifiers
                              

                               }
                               else
                               {
                                            verifiers[i].message_data = 'undefined'

                                }
                    
                         })


               }


 
                 // console.log("verifiers ",verifiers)
                        

                        res.render("front/Manage-message/ajax-filter-verifier",{verifiers_message_list:verifiers,moment,user_id:reg_user_id});
                      })
      }
             
    
}
/**search_msg_data Get method START**/
exports.search_msg_data = async(req,res,next)=>{
    
    var reg_user_id= req.session.user_id 
    console.log('report list')
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")
   
    var user_type=req.session.user_type;

        var query=req.body.query;


 if(req.session.user_type=='client')
    {
    
              
          await db.query("select *from tbl_msg_requests inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_msg_requests.reflect_id  WHERE (tbl_wallet_reflectid_rels.reflect_code LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.rep_firstname LIKE '%"+query+"%'  or tbl_wallet_reflectid_rels.entity_company_name LIKE '%"+query+"%'  or tbl_msg_requests.createdAt LIKE '%"+query+"%' ) and tbl_msg_requests.create_sender_id="+reg_user_id+" order by request_msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(verifiers)=>{

               for(var i=0;i< verifiers.length;i++)
               {
                 var request_msg_id = verifiers[i].request_msg_id;

                 console.log('request_msg_id : ',request_msg_id)


                      await db.query("SELECT * FROM tbl_verifier_to_client_msgs  WHERE  msg_id in (SELECT max(msg_id) FROM tbl_verifier_to_client_msgs group by request_msg_id having request_msg_id="+request_msg_id+" ) order by msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(msg_verifiers)=>{


                               if(msg_verifiers.length>0)
                               {
                                verifiers[i].message_data = msg_verifiers
                              

                               }
                               else
                               {
                                             verifiers[i].message_data = 'undefined'

                                }
                    
                         })


               }



                 console.log("verifiers ",verifiers)
          
          
          
              res.render('front/Manage-message/ajax-filter-client',{
                        moment,verifiers_message_list:verifiers,user_id:reg_user_id
                    })
                 
              // console.log(' db hello : ',page_data)
          
          
          
             
          })
    }
    else
    {

             
 
          await db.query("select *from tbl_msg_requests inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_msg_requests.reflect_id INNER join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_msg_requests.create_sender_id WHERE (full_name LIKE '%"+query+"%' or last_name LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.reflect_code LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.rep_firstname LIKE '%"+query+"%'  or tbl_wallet_reflectid_rels.entity_company_name LIKE '%"+query+"%'  or tbl_msg_requests.createdAt LIKE '%"+query+"%' ) and tbl_msg_requests.create_receiver_id="+reg_user_id+" order by request_msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(verifiers)=>{

               for(var i=0;i< verifiers.length;i++)
               {
                 var request_msg_id = verifiers[i].request_msg_id;

                 console.log('request_msg_id : ',request_msg_id)


                      await db.query("SELECT * FROM tbl_verifier_to_client_msgs WHERE  msg_id in (SELECT max(msg_id) FROM tbl_verifier_to_client_msgs group by request_msg_id having request_msg_id="+request_msg_id+" ) order by msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(msg_verifiers)=>{



                               if(msg_verifiers.length>0)
                               {
                                verifiers[i].message_data = msg_verifiers
                              

                               }
                               else
                               {
                                             verifiers[i].message_data = 'undefined'

                                }
                    
                         })


               }



                 console.log("verifiers ",verifiers)
          
          
          
              res.render('front/Manage-message/ajax-filter-verifier',{
                        moment,verifiers_message_list:verifiers,user_id:reg_user_id
                    })
          })
    }
   
    }
/*search_msg_data Get method END**/


/**search_msg_by_my_verifier Post method Start**/
exports.search_msg_by_my_verifier=async(req,res,next) =>{

    console.log('msg list`` ********************')

 var reflect_list=[]
 reflect_list=JSON.parse(req.body.reflect_list);
  
   
 var user_type=req.session.user_type;

 var reg_user_id=req.session.user_id;
   

       

        var msg_reflect_list=reflect_list.join("','");
     
        
if(req.session.user_type=='client')
    {
    
       console.log("join data",msg_reflect_list); 
      
   
       /**get my all reflect code start**/
       
       
 
await db.query("select *from tbl_msg_requests inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_msg_requests.reflect_id  WHERE tbl_msg_requests.reflect_id  IN ('"+msg_reflect_list+"') AND tbl_msg_requests.create_sender_id="+reg_user_id+" order by request_msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(verifiers)=>{

               for(var i=0;i< verifiers.length;i++)
               {
                 var request_msg_id = verifiers[i].request_msg_id;

                 console.log('request_msg_id : ',request_msg_id)


                      await db.query("SELECT * FROM tbl_verifier_to_client_msgs where msg_id in (SELECT max(msg_id) FROM tbl_verifier_to_client_msgs group by request_msg_id having request_msg_id="+request_msg_id+" ) order by msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(msg_verifiers)=>{


                               if(msg_verifiers.length>0)
                               {
                                verifiers[i].message_data = msg_verifiers
                              

                               }
                               else
                               {
                                             verifiers[i].message_data = 'undefined'

                                }
                    
                         })


               }



                 console.log("verifiers ",verifiers)
                     

               res.render('front/Manage-message/ajax-filter-client',{
                        moment,verifiers_message_list:verifiers,user_id:reg_user_id
                    })
              
        });
      }
        else
         {
             
       console.log("join data",msg_reflect_list); 
      
   
       /**get my all reflect code start**/
       
        await db.query("select *from tbl_msg_requests inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_msg_requests.reflect_id INNER join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_msg_requests.create_sender_id WHERE tbl_msg_requests.reflect_id  IN ('"+msg_reflect_list+"') and tbl_msg_requests.create_receiver_id="+reg_user_id+" order by request_msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(verifiers)=>{

               for(var i=0;i< verifiers.length;i++)
               {
                 var request_msg_id = verifiers[i].request_msg_id;

                 console.log('request_msg_id : ',request_msg_id)


                      await db.query("SELECT * FROM tbl_verifier_to_client_msgs where msg_id in (SELECT max(msg_id) FROM tbl_verifier_to_client_msgs group by request_msg_id having request_msg_id="+request_msg_id+" ) order by msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(msg_verifiers)=>{


                               if(msg_verifiers.length>0)
                               {
                                verifiers[i].message_data = msg_verifiers
                              

                               }
                               else
                               {
                                            verifiers[i].message_data = 'undefined'

                                }
                    
                         })


               }


 
                 console.log("verifiers ",verifiers)
                     

               res.render('front/Manage-message/ajax-filter-verifier',{
                        moment,verifiers_message_list:verifiers,user_id:reg_user_id
                    })
              
        });
         }

       
    
        /**get my all reflect code end**/
   
   

}
/**search_msg_by_my_verifier Post method End**/


/**search_msg_by_my_client Post method Start**/
exports.search_msg_by_my_client=async(req,res,next) =>{

    console.log('msg list`` ********************')

 var reflect_list=[]
 reflect_list=JSON.parse(req.body.reflect_list);
  
   
 var user_type=req.session.user_type;

 var reg_user_id=req.session.user_id;
   

       

        var msg_reflect_list=reflect_list.join("','");
     
        

       console.log("join data",msg_reflect_list); 
      
   
       /**get my all reflect code start**/
       
        await db.query("select *from tbl_msg_requests inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_msg_requests.reflect_id INNER join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_msg_requests.create_sender_id WHERE tbl_msg_requests.create_sender_id  IN ('"+msg_reflect_list+"') and tbl_msg_requests.create_receiver_id="+reg_user_id+" order by request_msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(verifiers)=>{

               for(var i=0;i< verifiers.length;i++)
               {
                 var request_msg_id = verifiers[i].request_msg_id;

                 console.log('request_msg_id : ',request_msg_id)


                      await db.query("SELECT * FROM tbl_verifier_to_client_msgs where msg_id in (SELECT max(msg_id) FROM tbl_verifier_to_client_msgs group by request_msg_id having request_msg_id="+request_msg_id+" ) order by msg_id desc",{ type:db.QueryTypes.SELECT}).then( async(msg_verifiers)=>{


                               if(msg_verifiers.length>0)
                               {
                                verifiers[i].message_data = msg_verifiers
                              

                               }
                               else
                               {
                                            verifiers[i].message_data = 'undefined'

                                }
                    
                         })


               }


 
                 console.log("verifiers ",verifiers)
                     

               res.render('front/Manage-message/ajax-filter-verifier',{
                        moment,verifiers_message_list:verifiers,user_id:reg_user_id
                    })
              
        });
    
        /**get my all reflect code end**/
   
   

}
/**search_msg_by_my_client Post method End**/
