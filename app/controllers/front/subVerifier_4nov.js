var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel, FilesDocModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var {NotificationModel} = require('../../models/notification');

var {InviteSubVerifier,SubVerifierClient} = require('../../models/sub_verifier');

const nodemailer = require("nodemailer");
var db = require('../../services/database');
var sequelize = require('sequelize');

const Op = sequelize.Op;

var dateTime = require('node-datetime')
var crypto = require('crypto'); 
var text_func=require('../../helpers/text');
var mail_func=require('../../helpers/mail');
const util = require('util');
const { base64encode, base64decode } = require('nodejs-base64');
const generateUniqueId = require('generate-unique-id');
var moment = require('moment');
const formidable = require('formidable');
var Jimp = require('jimp');
var toBuffer = require('blob-to-buffer')
const request = require('request');

var { decrypt, encrypt }                                         = require('../../helpers/encrypt-decrypt')

const ipfsAPI = require('ipfs-api');
const fs = require('fs');
var async = require('async');
const paginate = require("paginate-array");

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

exports.cilentInfoViewDetail=async (req,res,nest)=>{
  console.log("...................................cilentInfoViewDetail..............................")
       var request_id = req.query.request_id
       console.log("hellow .......1") 

   await db.query('SELECT * FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_manage_category_documents ON ((tbl_manage_category_documents.category_id=tbl_client_verification_requests.sub_category_id)  AND (tbl_manage_category_documents.include="yes")) INNER JOIN tbl_category_documents ON tbl_manage_category_documents.category_doc_id=tbl_category_documents.category_doc_id INNER JOIN tbl_documents_masters ON tbl_documents_masters.doc_id=tbl_category_documents.doc_id WHERE tbl_client_verification_requests.request_id='+request_id+' AND tbl_client_verification_requests.deleted="0"',{type:db.QueryTypes.SELECT}).then(async(clientANDrequestData) =>{
        //  console.log("clientANDrequestData.....1213....",clientANDrequestData[0])

                console.log("hellow .......2")   

               

                      await  db.query('SELECT * FROM `tbl_request_documents` INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id INNER JOIN tbl_request_documents_files ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id WHERE tbl_request_documents.request_id='+request_id+' AND tbl_request_documents.deleted="0" GROUP by tbl_request_documents_files.request_doc_id',{type:db.QueryTypes.SELECT}).then(async(requestUploadDoc) =>{

                      	  if(requestUploadDoc.length === 0){

                                    console.log("hellow .......no data") 
                                    res.render('front/sub-verifier/client-info-view-details',{
                                                                                                                    session:req.session,
                                                                                                                    requestUploadDoc:requestUploadDoc1,
                                                                                                                    clientANDrequestData,
                                                                                                                    moment,
                                                                                              })

                          } else  {

	                      	   // for(let j=0;j<requestUploadDoc.length;j++){
	                      	   	let j=0;
                                    async.each(requestUploadDoc,async function (req_content, cb) {

	                             let request_doc_id = req_content.request_doc_id
                                           var file_data = []
                                 
	                             await  db.query('SELECT * FROM tbl_request_documents WHERE request_doc_id='+request_doc_id,{type:db.QueryTypes.SELECT}).then(async(finalReqData) =>{
                                             file_data = []

                                                  var i=0;
                                    async.each(finalReqData,async function (content, cb) {
                                                                                                               
                                               if(content.doc_type == 'image'){

                                                                        request('https://ipfs.io/ipfs/'+content.request_file_hash, async function(error, response, body) {
                                                                          
                                                                                    if(error){console.log("ipfs error",error)}
                                                                                                    
                                                                                            console.log("hellow .......5")   
                                                                                                                          
                                                                                        // content.ipfsFileContain=response;
                                                                                        // requestUploadDoc1.push(content)
                                                                                        file_data.push({type:content.doc_type ,doc:body})
                                                                                  
                                                                                                                          //  res.send(file.content)
                                                                                        if(j==(finalReqData.length-1))
                                                                                          {

                                                                                            //  res.send(requestUploadDoc1)
                                                                                                  console.log("hellow .......6")   
                                                                                                    console.log("hellow .......i ", i)
                                                                                                  requestUploadDoc[i].request_file_hash_data =  file_data

                                                                                                   if ( j==(requestUploadDoc.length-1) ) {
                                                                                                               await final_call();
                                                                                                          
                                                                                                       }
                                                                                                   j++;

                                                                                          }
                                                                                          i++;
                                                                                    // })
                                                                                })

                                                                                  

                                                                              }else if(content.doc_type == 'pdf'){
                                     
                                                                                        file_data.push({type:content.doc_type ,doc:content.request_file_hash})

                                                                                        if ( j==(finalReqData.length-1) ) {
                                                                                           
                                                                               console.log(" image_count requestUploadDoc.length pdf - 1: ",requestUploadDoc.length - 1)
                                            
                                                                                                    console.log(" i iiimage_count : ",i)
                                            
                                                                                                             requestUploadDoc[i].request_file_hash_data =  file_data
                                                                                                             
                                                                                                           if ( j==(requestUploadDoc.length-1) ) {
                                                                                                               await final_call();
                                                                                                          
                                                                                                            }
                                                                                                   j++;
                                                                                                          
                                                                                                     }
                                                                                                     i++;
                                                                               }else{
                                            
                                                                                        file_data.push({type:content.doc_type ,doc:content.request_file_hash})

                                                                                      if ( i==(finalReqData.length-1) ) {
                                                                                           
                                                                                                    
                                                                                      console.log(" image_count requestUploadDoc.length -  video: ",requestUploadDoc.length - 1)
                                            
                                                                                                    console.log(" i iiimage_count : ",i)
                                            
                                                                                                             requestUploadDoc[i].request_file_hash_data =  file_data

                                                                                                            if ( j==(requestUploadDoc.length-1) ) {
                                                                                                               await final_call();
                                                                                                          
                                                                                                            }                                                                                                                 
                                                                                                   j++;
                                                                                                            
                                                  
                                                                                                     }
                                                                                                     i++;
                                                                                
                                                                               }
                                                         console.log("requestUploadDoc[i].request_file_hash_data : ",requestUploadDoc[i].request_file_hash_data)
                                                      }, function (err) { // called once all iteration callbacks have returned (or an error was thrown)
                                                          if (err) { console.log("err",err); }
                                                          
                                                      });
                                                
                                            async function final_call(){

                                              console.log(" final reasponse: ",requestUploadDoc)

                                              res.render('front/sub-verifier/client-info-view-details',{
                                                session:req.session,
                                                requestUploadDoc,
                                                clientANDrequestData,
                                                moment,
                                                request
                                                       })
                                              }
	                                   })
                                     
	                           })
                         }
  
                       })

                 

    })
    

}


exports.cilentInfoView=(req,res,nest)=>{
  console.log("...................................cilentInfoView..............................")

  var request_id = req.query.request_id
     db.query('SELECT *,COUNT(tbl_manage_category_documents.category_id) as cat_count , tbl_client_verification_requests.request_status as req_status FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id INNER JOIN tbl_manage_category_documents ON ((tbl_manage_category_documents.category_id=tbl_client_verification_requests.sub_category_id)  AND (tbl_manage_category_documents.include="yes")) WHERE tbl_client_verification_requests.request_id='+request_id+' AND tbl_client_verification_requests.deleted="0"',{type:db.QueryTypes.SELECT}).then(clintDetaile=>{
                              // console.log("request_id....",clintDetaile)               
        db.query('SELECT *,COUNT(tbl_request_documents.request_id) as rec_count FROM `tbl_request_documents` WHERE request_id='+request_id+' AND deleted="0"',{type:db.QueryTypes.SELECT}).then(request_recive_count=>{
                    res.render('front/sub-verifier/client-info-view',{
                                                                      session:req.session,
                                                                     clintDetaile,
                                                                       rec_count:request_recive_count[0].rec_count
                                                                        })
               })
    })  

}
exports.editDocument=(req,res,nest)=>{
  console.log("...................................editDocument..............................")

    res.render('front/sub-verifier/edit-document',{
        session:req.session
    })

}
exports.managedefaultdoc=(req,res,nest)=>{
  console.log("...................................managedefaultdoc..............................")

    res.render('front/sub-verifier/manage-default-doc',{
        session:req.session
    })

}
exports.manageSubVerifier=(req,res,nest)=>{
  console.log("...................................manageSubVerifier..............................")

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var page = req.query.page || 1
    var perPage = 10
    var userId =req.session.user_id
    var verifier_array=[]
    // db.query('SELECT * ,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.deleted="0" AND tbl_invite_sub_verifiers.reg_user_id='+userId,{ type:db.QueryTypes.SELECT}).then(sub_verifiers_list=>{
      db.query('SELECT * ,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt ,tbl_invite_sub_verifiers.email AS invite_email FROM tbl_invite_sub_verifiers LEFT JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id LEFT JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.deleted="0" AND tbl_invite_sub_verifiers.reg_user_id='+userId,{ type:db.QueryTypes.SELECT}).then(sub_verifiers_list=>{

    db.query('SELECT * FROM `tbl_wallet_reflectid_rels` INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.user_as="verifier" AND tbl_wallet_reflectid_rels.deleted="0" AND tbl_user_registrations.status="active" AND tbl_wallet_reflectid_rels.reg_user_id!='+userId+' AND tbl_wallet_reflectid_rels.reflect_id NOT IN (SELECT sub_verifier_reflectId FROM `tbl_invite_sub_verifiers` WHERE ((invite_status="accept" OR invite_status="pending") AND (status="active") AND (sub_verifier_id IS NOT NULL)))',{ type:db.QueryTypes.SELECT}).then(async verifiers=>{

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
  
      // db.query('SELECT sub_verifier_reflectId FROM `tbl_invite_sub_verifiers` WHERE ((invite_status="accept" OR invite_status="pending") AND(status="active"))',{ type:db.QueryTypes.SELECT}).then(invitedSubverifier=>{
      // console.log("sub ver from js",verifiersList)
      const pagedarray = paginate(sub_verifiers_list, page, perPage);  
      console.log(".....................................................................")       
      // console.log("sub ver from js pagedarray ",pagedarray)
        res.render('front/sub-verifier/manage-sub-verifier',{
            session:req.session,
            verifiersList:verifier_array,
            success_msg,
            sub_verifiers_list:pagedarray,
            // invitedSubverifier,
            moment
        })
    // })
  })
})

}

exports.subverifierclients=(req,res,nest)=>{
  console.log("...................................subverifierclients..............................")

  var invite_sub_id = req.query.invite_sub_id 
  var page = req.query.page || 1
  var perPage = 10
  db.query('SELECT * ,tbl_wallet_reflectid_rels.reflect_code as p_r_code FROM `tbl_invite_sub_verifiers` INNER JOIN tbl_sub_verifier_clients ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_sub_verifier_clients.sub_verifier_reflect_id INNER JOIN tbl_client_verification_requests ON tbl_sub_verifier_clients.client_request_id=tbl_client_verification_requests.request_id INNER JOIN tbl_wallet_reflectid_rels  ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_client_verification_requests.client_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels as p ON tbl_client_verification_requests.reflect_id=p.reflect_id LEFT JOIN tbl_countries ON p.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.invite_sub_id='+invite_sub_id+' AND tbl_invite_sub_verifiers.deleted="0" AND tbl_sub_verifier_clients.deleted="0"',{type:db.QueryTypes.SELECT}).then(clientOfSubVerData =>{
    const clientsArray = paginate(clientOfSubVerData, page, perPage);         
    
    res.render('front/sub-verifier/sub-verifier-clients',{
      session:req.session,
      clientOfSubVer:clientsArray,
      myreflectId:clientOfSubVerData,
      invite_sub_id
  })
  })
  

}
//100420
exports.sub_client_list_filter=(req,res,nest)=>{
 console.log("...................................sub_client_list_filter..............................")
  var searchvalue = req.body.searchvalue 
  var invite_sub_id = req.body.invite_sub_id 
  var page = req.query.page || 1
  var perPage = 10
  
  
  console.log("searchvalue...",searchvalue)
  var qre;
   if(searchvalue!=undefined)
                           {
                             console.log("inside if....",searchvalue)
                              qre='SELECT * ,tbl_wallet_reflectid_rels.reflect_code as p_r_code FROM `tbl_invite_sub_verifiers` INNER JOIN tbl_sub_verifier_clients ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_sub_verifier_clients.sub_verifier_reflect_id INNER JOIN tbl_client_verification_requests ON tbl_sub_verifier_clients.client_request_id=tbl_client_verification_requests.request_id INNER JOIN tbl_wallet_reflectid_rels  ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_client_verification_requests.client_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels as p ON tbl_client_verification_requests.reflect_id=p.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id  WHERE (((tbl_invite_sub_verifiers.invite_sub_id='+invite_sub_id+') AND (tbl_invite_sub_verifiers.deleted="0") AND (tbl_sub_verifier_clients.deleted="0")) AND ( (tbl_user_registrations.email LIKE "%'+searchvalue+'%") OR (p.reflect_code LIKE "%'+searchvalue+'%") OR (tbl_client_verification_requests.request_code LIKE "%'+searchvalue+'%") OR (tbl_wallet_reflectid_rels.reflect_code LIKE "%'+searchvalue+'%") OR (tbl_user_registrations.full_name LIKE "%'+searchvalue+'%") ))'
                            }
        else{
              reflect_code_list =  JSON.parse(req.body.reflect_code_list);
              var status_list   = JSON.parse(req.body.status_list);
                    if(status_list[0]!=null && reflect_code_list[0]!=null)
                             {

                                    qre= 'SELECT * ,tbl_wallet_reflectid_rels.reflect_code as p_r_code FROM `tbl_invite_sub_verifiers` INNER JOIN tbl_sub_verifier_clients ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_sub_verifier_clients.sub_verifier_reflect_id INNER JOIN tbl_client_verification_requests ON tbl_sub_verifier_clients.client_request_id=tbl_client_verification_requests.request_id INNER JOIN tbl_wallet_reflectid_rels  ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_client_verification_requests.client_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels as p ON tbl_client_verification_requests.reflect_id=p.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.invite_sub_id='+invite_sub_id+' AND tbl_invite_sub_verifiers.deleted="0" AND tbl_sub_verifier_clients.deleted="0" AND tbl_wallet_reflectid_rels.reflect_code IN('+reflect_code_list+') AND tbl_sub_verifier_clients.sub_client_status IN('+status_list+')'

                              }
                        else{
          if(status_list[0]==null)
          {

             qre= 'SELECT * ,tbl_wallet_reflectid_rels.reflect_code as p_r_code FROM `tbl_invite_sub_verifiers` INNER JOIN tbl_sub_verifier_clients ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_sub_verifier_clients.sub_verifier_reflect_id INNER JOIN tbl_client_verification_requests ON tbl_sub_verifier_clients.client_request_id=tbl_client_verification_requests.request_id INNER JOIN tbl_wallet_reflectid_rels  ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_client_verification_requests.client_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels as p ON tbl_client_verification_requests.reflect_id=p.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.invite_sub_id='+invite_sub_id+' AND tbl_invite_sub_verifiers.deleted="0" AND tbl_sub_verifier_clients.deleted="0" AND tbl_wallet_reflectid_rels.reflect_code IN('+reflect_code_list+')'
   
          }
          if(reflect_code_list[0]==null)
           {
    
             qre= 'SELECT * ,tbl_wallet_reflectid_rels.reflect_code as p_r_code FROM `tbl_invite_sub_verifiers` INNER JOIN tbl_sub_verifier_clients ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_sub_verifier_clients.sub_verifier_reflect_id INNER JOIN tbl_client_verification_requests ON tbl_sub_verifier_clients.client_request_id=tbl_client_verification_requests.request_id INNER JOIN tbl_wallet_reflectid_rels  ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_client_verification_requests.client_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels as p ON tbl_client_verification_requests.reflect_id=p.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.invite_sub_id='+invite_sub_id+' AND tbl_invite_sub_verifiers.deleted="0" AND tbl_sub_verifier_clients.deleted="0" AND tbl_sub_verifier_clients.sub_client_status IN('+status_list+')'

           }

        }
            }

 

             db.query(qre,{type:db.QueryTypes.SELECT}).then(clientOfSubVerData =>{
                            const clientsArray = paginate(clientOfSubVerData, page, perPage);         
    
                           res.render('front/sub-verifier/subVerifierClientListFilter',{
                                                                                       session:req.session,
                                                                                       clientOfSubVer:clientsArray,
                                                                                       // myreflectId:clientOfSubVerData,
                                                                                        invite_sub_id
                             })
               })
  

}

//030420
exports.submit_add_sub_verfier=(req,res,nest)=>{
  console.log("...................................submit_add_sub_verfier..............................")

   var name= req.body.name
   var verifier_email= (req.body.verifier_email).trim()
   var verifier_email_array =verifier_email.split("-")
   var verifier_email_id = (verifier_email_array[0]).trim()
   var email =(req.body.email).trim()
   var reflect_code = (req.body.reflect_id).trim()
   var user_id =req.session.user_id
   console.log("verifier_email code...",verifier_email)
     if(verifier_email!=undefined){
              console.log("first if condition.....")
                              MyReflectIdModel.findOne({where:{reflect_code:reflect_code,deleted:"0"}}).then(reflectdata=>{

  // console.log("reflectdata code...",reflectdata)
  if(reflectdata==null){
    console.log("refelct code not found")
    console.log(" inner if condition.....")
    InviteSubVerifier.create({
      invite_name:name,
        reg_user_id :user_id,
      
        email:email,
    }).then(async savedata=>{

      

      await    MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(async(result) => {
    
        await   UserModel.findOne({where:{reg_user_id:reg_user_id}}).then(async user_data => {
          var receiver_id_parse= parseInt(result.reg_user_id);

       var msg = `${user_data.full_name} send you invitation on email to become a sub verifier.`

                         await  NotificationModel.create({
                                              notification_msg:msg,
                                              // sender_id:'10',
                                              receiver_id:receiver_id_parse,
                                              sender_id:reg_user_id,
                                              notification_type:'10',
                                              notification_date:new Date()
                                  }).then(async(notification) =>{
        console.log("save  new data")
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
          subject: "Invitation to become sub-verifier.",
    
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
                <div style="background-color: #3A3183;padding: 10px 30px 5px;">
                  <img src="https://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
                </div>
                <div style="padding: 30px;line-height: 32px; text-align: justify;">
                  <h4 style="font-size: 20px; margin-bottom: 0;">Hello ${name} </h4>
                  <p>the link is here to become sub verifier 
                https://${req.headers.host}/sub_verfier_invitation?email=${Buffer.from(req.body.email).toString('base64')}</p>
                  <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                  <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
          
                 
                </div>
                 <div style="background-color:  #3A3183; color: #fff; padding: 20px 30px;">
                   &copy; Copyright 2020 - My Reflet. All rights reserved.
                  </div>
              </div>
            </body>
          </html>  
          `
        };
        smtpTransport.sendMail(mailOptions, function (err) {
         
        });
      req.flash('success_msg', 'Your invitaion has been sent successfuly.')
      console.log("new verfier email")
      res.redirect("/sub_magage_verifier")
                                  })})})
    }).catch(err=>console.log("error",err))
    

  }else{
    console.log("inner else condition.....")
    InviteSubVerifier.create({ reg_user_id :user_id,
      sub_verifier_id:reflectdata.reg_user_id,
      sub_verifier_reflectId : reflectdata.reflect_id,
      email:verifier_email_id,
  }).then(savedata=>{
      console.log("save data")



      var smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
                 user: 'info.myreflet@gmail.com',
                 pass: 'myquest321'
        }
      });
      const mailOptions = {
        to: verifier_email,
        from: 'questtestmail@gmail.com',
        subject: "Invitation to become sub-verifier.",
  
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
              <div style="background-color: #3A3183;padding: 10px 30px 5px;">
                <img src="https://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
              </div>
              <div style="padding: 30px;line-height: 32px; text-align: justify;">
                <h4 style="font-size: 20px; margin-bottom: 0;">Hello </h4>
                <p>The link is here to become sub verifier <br>
                https://${req.headers.host}/sub_verfier_invitation?ref_id=${reflectdata.reflect_id}&email=${Buffer.from(verifier_email_id).toString('base64')}
                </p>
                <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
        
               
              </div>
               <div style="background-color:  #3A3183; color: #fff; padding: 20px 30px;">
                 &copy; Copyright 2020 - My Reflet. All rights reserved.
                </div>
            </div>
          </body>
        </html>  
        `
      };
      smtpTransport.sendMail(mailOptions, function (err) {
       
      });
    req.flash('success_msg', 'Your invitaion has been sent successfuly.')
        console.log("verfier email")
        res.redirect("/sub_magage_verifier")
   
       }).catch(err=>console.log("error",err))
  }
    

    })

   
    }else{
      // console.log(" else condition.....")
      //   InviteSubVerifier.create({

      //       reg_user_id :user_id,
          
      //       email:email,
      //   }).then(savedata=>{
      //       console.log("save  new data")

         
      //       const mailOptions = {
      //         to: email,
      //         from: 'questtestmail@gmail.com',
      //         subject: "MyReflet OTP for registration.",
        
      //         html: `<!DOCTYPE html>
      //         <html>
      //           <head>
      //             <title>My Reflet</title>
      //             <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      //             <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      //              <style>
      //             @media only screen and (max-width: 600px) {
      //             .inner-body {
      //             width: 100% !important;
      //             }
      //             .footer {
      //             width: 100% !important;
      //             }
      //             }
      //             @media only screen and (max-width: 500px) {
      //             .button {
      //             width: 100% !important;
      //             }
      //             }
      //             </style> 
      //           </head>
      //           <body>
      //             <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
      //               <div style="background-color: #3A3183;padding: 10px 30px 5px;">
      //                 <img src="http://165.22.209.72:3008/assets/images/logo-white.png" style="width: 120px;">
      //               </div>
      //               <div style="padding: 30px;line-height: 32px; text-align: justify;">
      //                 <h4 style="font-size: 20px; margin-bottom: 0;">Hello ${name} </h4>
      //                 <p>the link is here to become sub verifier 
      //               http://${req.headers.host}/sub_verfier_invitation?email=${Buffer.from(req.body.email).toString('base64')}</p>
      //                 <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
      //                 <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
              
                     
      //               </div>
      //                <div style="background-color:  #3A3183; color: #fff; padding: 20px 30px;">
      //                  &copy; Copyright 2020 - My Reflet. All rights reserved.
      //                 </div>
      //             </div>
      //           </body>
      //         </html>  
      //         `
      //       };
      //       smtpTransport.sendMail(mailOptions, function (err) {
             
      //       });
      //     req.flash('success_msg', 'Your invitaion has been sent successfuly.')
      //     console.log("new verfier email")
      //     res.redirect("/sub_magage_verifier")
      //   }).catch(err=>console.log("error",err))
        
    

    }

}

  /**request_status_change Get method Start**/
exports.delete_sub_verifier=async(req,res,next)=>{
   console.log("123......................<><><><<<>..........delete_sub_verifier123...............................................")

    var status = req.body.status
   var user_id=  req.session.user_id 
   // var request_id = req.query.request_id
   var invite_sub_id =  JSON.parse(req.body.invite_sub_id);
   console.log("............invite_sub_id..............",invite_sub_id)

  //  var dt = dateTime.create();
  //   var formatted = dt.format('Y-m-d H:M:S');
    // var msg= `Your request has been ${status} by verifier.`
    // var ntf_type ;
    var updateObj
  //   if(status=="accept"){
     
  //     ntf_type=2;
  //   }
  //   if(status=="reject"){
  //     ntf_type=3
  //   }
  //   if(status=="delete"){
  //    ntf_type=5
  //  }
   if(status=="deactivate"){
     updateObj={ status :"inactive"}
   }else{
     
         updateObj={deleted:"1"}
   }
  //  console.log("123......................<><><><<<>.........................................................")
  //  console.log(status)
  //  console.log(request_id)
 
  //  console.log(".............................<><><><.............................................")
   for(var i=0; i<invite_sub_id.length; i++){
   await InviteSubVerifier.update(updateObj, { where: { invite_sub_id:invite_sub_id[i] }}).then(async(result) =>{
        // console.log(result)
        // ClientVerificationModel.findOne({where:{request_id:request_ids[i]}}).then(async(requestdata)=>{
        //   await NotificationModel.create({
        //     notification_msg   :   msg,
        //     sender_id          :  user_id,
        //     receiver_id        :  requestdata.client_id,
        //     request_id         :  request_ids[i],
        //     notification_type  :   ntf_type,
        //     notification_date  : formatted,
        //     read_status        : "no"
        //    }).then(data=>{
        //      res.redirect("/verifier_deshboard")
 
        //    }).catch(err=>console.log("err",err))
        // }).catch(err=>console.log("err",err))
      
    }).catch(err=>console.log("err",err))
    console.log("..i..",i)
    if((invite_sub_id.length-1)==i){
      res.send("done")
    }
   }
   
 }
 /**request_status_change Get method End**/

 exports.delete_indi_sub_veri=async(req,res,next)=>{
  console.log("123......................<><><><<<>..........delete_indi_sub_veri...............................................")

   var status = req.query.status
  var user_id=  req.session.user_id 
  var invite_sub_id = req.query.invite_sub_id
  // var invite_sub_id =  JSON.parse(req.body.invite_sub_id);
  console.log("............invite_sub_id..............",invite_sub_id)

 //  var dt = dateTime.create();
 //   var formatted = dt.format('Y-m-d H:M:S');
   // var msg= `Your request has been ${status} by verifier.`
   // var ntf_type ;
   var updateObj
 //   if(status=="accept"){
    
 //     ntf_type=2;
 //   }
 //   if(status=="reject"){
 //     ntf_type=3
 //   }
 //   if(status=="delete"){
 //    ntf_type=5
 //  }
  if(status=="deactivate"){
    updateObj={ status :"inactive"}
  }else{
    
        updateObj={deleted:"1"}
  }
 //  console.log("123......................<><><><<<>.........................................................")
 //  console.log(status)
 //  console.log(request_id)

 //  console.log(".............................<><><><.............................................")
// for(var i=0; i<invite_sub_id.length; i++){
  await InviteSubVerifier.update(updateObj, { where: { invite_sub_id:invite_sub_id }}).then(async(result) =>{
       // console.log(result)
       // ClientVerificationModel.findOne({where:{request_id:request_ids[i]}}).then(async(requestdata)=>{
       //   await NotificationModel.create({
       //     notification_msg   :   msg,
       //     sender_id          :  user_id,
       //     receiver_id        :  requestdata.client_id,
       //     request_id         :  request_ids[i],
       //     notification_type  :   ntf_type,
       //     notification_date  : formatted,
       //     read_status        : "no"
       //    }).then(data=>{
       //      res.redirect("/verifier_deshboard")

       //    }).catch(err=>console.log("err",err))
       // }).catch(err=>console.log("err",err))
       res.redirect("/sub_magage_verifier")

   }).catch(err=>console.log("err",err))
  //  console.log("..i..",i)
  //  if((invite_sub_id.length-1)==i){
  //  }
  // }
  
}

exports.subverifer_filter=async(req,res,next)=>{
  console.log("123......................<><><><<<>..........subverifer_filter...............................................")

   var searchvalue = req.body.searchvalue
  var user_id=  req.session.user_id 
  
 console.log("kdlkljkds searchvalue",searchvalue)
  var page = req.query.page || 1
    var perPage = 10
var userid=req.session.user_id
  var qry;
  if(searchvalue==undefined){
          console.log("kdlkljkds if condition")
      
     var status_list =  JSON.parse(req.body.status_list);
     console.log("kdlkljkds status_list",status_list)
         qry='SELECT * ,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_invite_sub_verifiers.deleted="0" AND tbl_invite_sub_verifiers.status IN('+status_list+') AND tbl_invite_sub_verifiers.reg_user_id='+userid
  }
  else{
          console.log("kdlkljkds else condition")

      console.log("kdlkljkds searchvalue",searchvalue)
     

      qry='SELECT * ,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt ,tbl_invite_sub_verifiers.email AS invite_email FROM tbl_invite_sub_verifiers LEFT JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id LEFT JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE (tbl_invite_sub_verifiers.reg_user_id='+userid+') AND ((tbl_invite_sub_verifiers.deleted="0") AND ( (tbl_user_registrations.email LIKE "%'+searchvalue+'%") OR (tbl_wallet_reflectid_rels.reflect_code LIKE "%'+searchvalue+'%") OR (tbl_invite_sub_verifiers.invite_name LIKE "%'+searchvalue+'%") OR (tbl_invite_sub_verifiers.email LIKE "%'+searchvalue+'%") OR (tbl_user_registrations.full_name LIKE "%'+searchvalue+'%") ))'

  //  qry='SELECT * ,tbl_invite_sub_verifiers.status as sub_veri_status ,tbl_invite_sub_verifiers.createdAt as sub_createdAt FROM tbl_invite_sub_verifiers INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE (tbl_invite_sub_verifiers.reg_user_id='+userid+') AND ((tbl_invite_sub_verifiers.deleted="0") AND ( (tbl_user_registrations.email LIKE "%'+searchvalue+'%") OR (tbl_wallet_reflectid_rels.reflect_code LIKE "%'+searchvalue+'%") OR (tbl_user_registrations.full_name LIKE "%'+searchvalue+'%") ))'
  }
  db.query(qry,{ type:db.QueryTypes.SELECT}).then(sub_verifiers_list=>{
 db.query('SELECT * FROM `tbl_wallet_reflectid_rels` INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.user_as="verifier" AND tbl_wallet_reflectid_rels.deleted="0" AND tbl_user_registrations.status="active"',{ type:db.QueryTypes.SELECT}).then(verifiersList=>{
      // console.log("sub ver from js",verifiersList)
      const pagedarray = paginate(sub_verifiers_list, page, perPage);  
      console.log(".....................................................................")       
      // console.log("sub ver from js pagedarray ",pagedarray)
        res.render('front/sub-verifier/manageSubVerifierFilter',{
            session:req.session,
            verifiersList,
            success_msg,
            sub_verifiers_list:pagedarray,
            moment
        })
    })
  })
 

}

// exports.sub_verfier_invitation=async(req,res,next)=>{
//   success_msg = req.flash('success_msg');
//     err_msg = req.flash('err_msg');
//   var reflect_id= req.query.ref_id
//   var email= req.query.email
//   console.log("dnfhlsdalk",reflect_id)
//   if(reflect_id==undefined){
//     res.render('front/sub-verifier/invitaionPage',{
//       session:req.session,
//       err_msg,
//       success_msg,
//       email,
//       reflect_id
     
//   })
//   }else{
//     console.log("sub_verfier_invitation else")
//     res.render('front/sub-verifier/invitaionPage',{
//       session:req.session,
//       success_msg,
//       email,
//       reflect_id
     
//   })
//   }
 
// }

exports.sub_verfier_invitation=async(req,res,next)=>{
  console.log("123......................<><><><<<>..........sub_verfier_invitation...............................................")

  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');

  var reflect_id= req.query.ref_id
  var email= req.query.email
  var emailID = Buffer.from(req.query.email, 'base64').toString('ascii');


  console.log("dnfhlsdalk",reflect_id,emailID)
    
  InviteSubVerifier.findOne({where:{email:emailID}})
  .then(result=>{
                    if(reflect_id==undefined){
                        res.render('front/sub-verifier/invitaionPage',{
                        session:req.session,
                        err_msg,
                        success_msg,
                        email,
                        reflect_id,
                        result
                        
                    })
                    }else{
                        console.log("sub_verfier_invitation else")
                        res.render('front/sub-verifier/invitaionPage',{
                        session:req.session,
                        success_msg,
                        email,
                        reflect_id,result
                        
                    })
                    }
                })
 
}

exports.submit_sub_verfier_invitation=async(req,res,next)=>{
  console.log("123......................<><><><<<>..........submit_sub_verfier_invitation...............................................")

  var reflect_id= req.query.ref_id
  var email= req.query.email
  var status = (req.query.status).trim()
 
  
  

  if(reflect_id==undefined){
    req.flash("err_msg","You are not registered/verifier.")
    
    res.redirect("/sub_verfier_invitation?email="+email)

  }else{
    var emailID = Buffer.from(req.query.email, 'base64').toString('ascii');
    var re_id= (req.query.ref_id).trim()
    var email_id =(emailID).trim()

    console.log("dnfhlsreflect_id dalk",reflect_id)
    console.log("dnfhlsreflect_id dalk",email)
    console.log("dnfhlsreflect_id dalk",email_id)

    console.log("dnfhlsreflect_id dalk",status)


    if(status=="accept"){
      req.flash("success_msg","Congratulation , You have become sub verifier successfully.")
      // var update_status = 
    }else{
      req.flash("err_msg","You has been reject the invitation to become sub verifier.")
      // var update_status = 
    }
    // db.query("UPDATE `tbl_invite_sub_verifiers` SET `invite_status` = 'accept' WHERE `tbl_invite_sub_verifiers`.`invite_sub_id` = 15")
    InviteSubVerifier.update({invite_status:status},{where:{sub_verifier_reflectId:re_id,email:email_id}})
    .then(updateData=>{
      
      console.log("updateData",updateData)
      res.redirect("/sub_verfier_invitation?ref_id="+re_id+"&email="+req.query.email+"&status="+status)
      
    //   res.render('front/sub-verifier/invitaionPage',{
    //     session:req.session,
    //     success_msg,
    //     email,
    //     reflect_id
       
    // })
    }).catch(err=>console.log("errr from email verifiaction side",err))
  
  }
 
}

exports.sub_verfier_my_client=async(req,res,next)=>{
  console.log("123......................<><><><<<>..........sub_verfier_my_client...............................................")

  success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var userId =req.session.user_id 
    var page = req.query.page || 1
    var perPage = 10

    // db.query('SELECT * FROM `tbl_invite_sub_verifiers` INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_invite_sub_verifiers.invite_status="accept" AND tbl_invite_sub_verifiers.deleted="0" AND tbl_invite_sub_verifiers.status="active"',{ type:db.QueryTypes.SELECT}).then( async(sub_verifiers_list)=>{
    db.query('SELECT * FROM `tbl_invite_sub_verifiers` INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_reflectId=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_user_registrations.reg_user_id WHERE tbl_invite_sub_verifiers.invite_status="accept" AND tbl_invite_sub_verifiers.deleted="0" AND tbl_invite_sub_verifiers.status="active" AND tbl_invite_sub_verifiers.reg_user_id='+userId,{ type:db.QueryTypes.SELECT}).then( async(sub_verifiers_list)=>{
     
      db.query('SELECT client_request_id FROM `tbl_sub_verifier_clients` where reg_user_id='+userId,{ type:db.QueryTypes.SELECT}).then( async(allot_request_id)=>{
        
        var query_request;
        var request_array= [];
        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& ")

        console.log("allot_request_id : ",allot_request_id)
        
        if(allot_request_id.length>0){
          for(var u=0;u< allot_request_id.length;u++){
            request_array[u] = allot_request_id[u].client_request_id
          }
          console.log("request_array : ",request_array)

          var request_id_list = request_array.join("','");
          
          console.log("request_id_list : ",request_id_list)

          query_request = "SELECT * ,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id LEFT JOIN tbl_countries ON c.entity_company_country=tbl_countries.country_id WHERE((tbl_client_verification_requests.verifier_id='"+userId+"' AND tbl_client_verification_requests.deleted='0') AND (tbl_client_verification_requests.request_status!='accept' AND tbl_client_verification_requests.request_status!='reject' and tbl_client_verification_requests.request_id Not IN ('"+request_id_list+"')))"
        
        }else{
          query_request = 'SELECT * ,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id LEFT JOIN tbl_countries ON c.entity_company_country=tbl_countries.country_id WHERE((tbl_client_verification_requests.verifier_id="'+userId+'" AND tbl_client_verification_requests.deleted="0") AND (tbl_client_verification_requests.request_status!="accept" AND tbl_client_verification_requests.request_status!="reject"))'
        
        }
      db.query(query_request,{type:db.QueryTypes.SELECT}).then(clientRequsetdata=>{


                   const requestarray1 = paginate(clientRequsetdata, page, perPage); 
                               res.render('front/sub-verifier/my_clients',{
                                                                           session:req.session,
                                                                           success_msg,
                                                                           clients:requestarray1,
                                                                           moment,
                                                                            myrelectIdData:clientRequsetdata,
                                                                           sub_verifiers_list,
                                                                           
                                  })

     
    })
  })
        // var requestarray =[]
        // await ClientVerificationModel.findAll({where:{verifier_id: userId,deleted:"0"}}).then(async(data)=>{
        //      console.log(".......................................................")
        //      var count =1
        //      for(var i=0; i<data.length ;i++){
        //         count++
        //         await MyReflectIdModel.findOne({where:{reflect_id:data[i].reflect_id }}).then(async(myRefdata)=>
        //         {  
     
        //             UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
        //            MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
        //            await MyReflectIdModel.findOne({where:{reflect_id:data[i].verifer_my_reflect_id },include: [UserModel]}).then(async(v_myRefdata)=>
        //         {
                 
     
        //          await UserModel.findOne({where:{reg_user_id:data[i].client_id }}).then(async(userdata)=>{
    
        //             await UserModel.findOne({where:{reg_user_id:data[i].verifier_id }}).then(async(ver_userdata)=>{
    
        //             var obj ={
        //                ClientVerificationData : data[i].dataValues,
        //                MyReflectIData :myRefdata.dataValues,
        //                user : userdata.dataValues,
        //                verifer_my_reflect_id_Data : v_myRefdata,
        //                ver_userdata :ver_userdata,
                       
        //               }
    
        //               requestarray.push(obj)
        //             })
        //          })
     
     
        //         })
               
     
        //         })
        //      }
        //      const requestarray1 = paginate(requestarray, page, perPage);         

        //      res.render('front/sub-verifier/my_clients',{
        //       session:req.session,
        //       success_msg,
        //       clients:requestarray1,
        //       moment,
        //       myrelectIdData:requestarray,
        //       sub_verifiers_list
        //        })
     
        //  }).catch(err=>console.log("errr",err))
   
   
   
    })
}

exports.submit_add_client_to_sub=async(req,res,next)=>{
  console.log("123......................<><><><<<>..........submit_add_client_to_sub...............................................")
 var sub_verfier_reflect_ids = []
 
 var clients_ids = []
 
  sub_verfier_reflect_ids = JSON.parse(req.body.sub_verfiers_reflect_ids) 
  clients_ids = JSON.parse(req.body.clients_ids) 

    console.log("clients_ids",clients_ids)
    console.log("clients_ids",sub_verfier_reflect_ids)

    // var reg_id= req.session.user_id

 for(var i=0; i<sub_verfier_reflect_ids.length;i++){
  
  await db.query('SELECT * FROM tbl_wallet_reflectid_rels WHERE tbl_wallet_reflectid_rels.reflect_id='+sub_verfier_reflect_ids[i],{type:db.QueryTypes.SELECT}).then(async reflectData=>{ 
          // console.log("sub_verfier_reflect_ids[i]",sub_verfier_reflect_ids[i])
  for(var j=0; j<clients_ids.length;j++){
    
    let temp;

    temp = clients_ids[j]
     
     await   SubVerifierClient.create({
                                   sub_verifier_reflect_id:reflectData[0].reflect_id,
                                   reg_user_id:req.session.user_id,
                                   sub_verifier_reg_id: reflectData[0].reg_user_id,
                                   client_request_id:clients_ids[j],
                                  
         }).then(async clientsave=>{
                    
          console.log("clients_ids[j] : ",temp)
          // await    MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(async(result) => {
            var request_id = clients_ids[j]

         await   db.query('SELECT * FROM `tbl_client_verification_requests` WHERE `request_id`='+temp,{type:db.QueryTypes.SELECT}).then(async requestData=>{ 

            await   UserModel.findOne({where:{reg_user_id:req.session.user_id}}).then(async user_data => {

              var request_code = requestData[0].request_code
    
           var msg = `${decrypt(user_data.full_name)}  is allot a ${request_code} request to verify a document.`
    
                             await  NotificationModel.create({
                                                  notification_msg:msg,
                                                  sender_id:req.session.user_id,
                                                  receiver_id:reflectData[0].reg_user_id,
                                                  notification_type:'1',
                                                  notification_date:new Date()
                                      }).then(async(notification) =>{
                    
                              console.log("data save")
                                      // })
                                    })
                                })
                              })
                            }).catch(err=>console.log("err",err))
  }

   
 })
 }
 res.send("done")
}


exports.delete_indi_sub_veri_client=async(req,res,next)=>{
  console.log("123......................<><><><<<>..........delete_indi_sub_veri_client...............................................")

   var status = req.query.status
  var user_id=  req.session.user_id 
  var invite_client_id = req.query.invite_client_id
  // var invite_sub_id =  JSON.parse(req.body.invite_sub_id);
  console.log("............invite_sub_id..............",invite_client_id)

 //  var dt = dateTime.create();
 //   var formatted = dt.format('Y-m-d H:M:S');
   // var msg= `Your request has been ${status} by verifier.`
   // var ntf_type ;
   var updateObj
 //   if(status=="accept"){
    
 //     ntf_type=2;
 //   }
 //   if(status=="reject"){
 //     ntf_type=3
 //   }
 //   if(status=="delete"){
 //    ntf_type=5
 //  }
  if(status=="reject"){
    updateObj={ request_status :"reject"}
  }else{
    
        updateObj={deleted:"1"}
  }
 //  console.log("123......................<><><><<<>.........................................................")
 //  console.log(status)
 //  console.log(request_id)

 //  console.log(".............................<><><><.............................................")
// for(var i=0; i<invite_sub_id.length; i++){
  await ClientVerificationModel.update(updateObj, { where: {request_id:invite_client_id }}).then(async(result) =>{
       // console.log(result)
       // ClientVerificationModel.findOne({where:{request_id:request_ids[i]}}).then(async(requestdata)=>{
       //   await NotificationModel.create({
       //     notification_msg   :   msg,
       //     sender_id          :  user_id,
       //     receiver_id        :  requestdata.client_id,
       //     request_id         :  request_ids[i],
       //     notification_type  :   ntf_type,
       //     notification_date  : formatted,
       //     read_status        : "no"
       //    }).then(data=>{
       //      res.redirect("/verifier_deshboard")

       //    }).catch(err=>console.log("err",err))
       // }).catch(err=>console.log("err",err))
       res.redirect("/sub_verfier_my_client")

   }).catch(err=>console.log("err",err))
  //  console.log("..i..",i)
  //  if((invite_sub_id.length-1)==i){
  //  }
  // }
  
}

exports.delete_mult_client_sub_verifier=async(req,res,next)=>{
  console.log("123......................<><><><<<>..........delete_mult_client_sub_verifier...............................................")

   var status = req.body.status
  var user_id=  req.session.user_id 
  // var request_id = req.query.request_id
  var invite_client_id =  JSON.parse(req.body.invite_client_id);
  console.log("............invite_sub_id..............",invite_client_id)

 //  var dt = dateTime.create();
 //   var formatted = dt.format('Y-m-d H:M:S');
   // var msg= `Your request has been ${status} by verifier.`
   // var ntf_type ;
   var updateObj
 //   if(status=="accept"){
    
 //     ntf_type=2;
 //   }
 //   if(status=="reject"){
 //     ntf_type=3
 //   }
 //   if(status=="delete"){
 //    ntf_type=5
 //  }
  if(status=="reject"){
    updateObj={ request_status :"reject"}
  }else{
    
        updateObj={deleted:"1"}
  }
 //  console.log("123......................<><><><<<>.........................................................")
 //  console.log(status)
 //  console.log(request_id)

 //  console.log(".............................<><><><.............................................")
for(var i=0; i<invite_client_id.length; i++){
  await ClientVerificationModel.update(updateObj, { where: { request_id:invite_client_id[i] }}).then(async(result) =>{
       // console.log(result)
       // ClientVerificationModel.findOne({where:{request_id:request_ids[i]}}).then(async(requestdata)=>{
       //   await NotificationModel.create({
       //     notification_msg   :   msg,
       //     sender_id          :  user_id,
       //     receiver_id        :  requestdata.client_id,
       //     request_id         :  request_ids[i],
       //     notification_type  :   ntf_type,
       //     notification_date  : formatted,
       //     read_status        : "no"
       //    }).then(data=>{
       //      res.redirect("/verifier_deshboard")

       //    }).catch(err=>console.log("err",err))
       // }).catch(err=>console.log("err",err))
     
   }).catch(err=>console.log("err",err))
   console.log("..i..",i)
   if((invite_client_id.length-1)==i){
     res.send("done")
   }
  }
  
}
exports.sub_verifier_client_filter= async(req,res,next )=>{
 
  console.log("......................sub_verifier_client_filter start.................................")
  var page = req.query.page || 1
  var perPage = 10

   var searchvalue =req.body.searchvalue
    var userId =req.session.user_id 
    // console.log("user idv ", userId)
    var requestarray =[]

  

  var reflect_code_list=[]
  var filterArray =[]

  // reflect_code_list =  JSON.parse(req.body.reflect_code_list);
  // var status_list   = JSON.parse(req.body.status_list);
  console.log("searchvalue.",searchvalue)
  // var objStatus;
  // if(status_list[0]==null){

  //  objStatus= {verifier_id: userId ,
  //              deleted:"0" ,
  //              verifier_deleted :"0"
  //            }
   
  // }else{
  //  objStatus= {verifier_id: userId,
  //              deleted:"0",
  //              verifier_deleted :"0",
  //             request_status: {
  //                         [Op.or]: status_list
  //                       },
  //             }
   
  //   }

var qre;
       if(searchvalue!=undefined)
         {
                    console.log("if condition",searchvalue)
                  qre='SELECT * ,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id LEFT JOIN tbl_countries ON c.entity_company_country=tbl_countries.country_id WHERE (((tbl_client_verification_requests.verifier_id="'+userId+'") AND (tbl_client_verification_requests.deleted="0")) AND ((tbl_wallet_reflectid_rels.reflect_code LIKE "%'+searchvalue+'%") OR(tbl_user_registrations.full_name LIKE "%'+searchvalue+'%")  OR (tbl_client_verification_requests.request_code LIKE "%'+searchvalue+'%") OR (c.reflect_code LIKE "%'+searchvalue+'%") OR (tbl_user_registrations.email LIKE "%'+searchvalue+'%")))'
         }
      else{  
                     reflect_code_list =  JSON.parse(req.body.reflect_code_list);
                     var status_list   = JSON.parse(req.body.status_list);
                   if(status_list[0]!=null && reflect_code_list[0]!=null)
                  {
                                    qre='SELECT * ,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id LEFT JOIN tbl_countries ON c.entity_company_country=tbl_countries.country_id WHERE tbl_client_verification_requests.verifier_id="'+userId+'" AND tbl_client_verification_requests.deleted="0" AND tbl_wallet_reflectid_rels.reflect_code IN ('+reflect_code_list+') AND tbl_client_verification_requests.request_status IN ('+status_list+')'
                   }
                  else{
                            if(status_list[0]==null)
                            {
                                    qre='SELECT * ,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id  WHERE tbl_client_verification_requests.verifier_id="'+userId+'" AND tbl_client_verification_requests.deleted="0" AND tbl_wallet_reflectid_rels.reflect_code IN ('+reflect_code_list+')'
                            }
                            if(reflect_code_list[0]==null)
                            {
                                    qre='SELECT * ,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id  WHERE tbl_client_verification_requests.verifier_id="'+userId+'" AND tbl_client_verification_requests.deleted="0" AND tbl_client_verification_requests.request_status IN ('+status_list+')'
                            }
                       }
          }

    db.query('SELECT * FROM `tbl_invite_sub_verifiers` INNER JOIN tbl_wallet_reflectid_rels ON tbl_invite_sub_verifiers.sub_verifier_id=tbl_wallet_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_invite_sub_verifiers.invite_status="accept" AND tbl_invite_sub_verifiers.deleted="0" AND tbl_invite_sub_verifiers.status="active"',{ type:db.QueryTypes.SELECT}).then( async(sub_verifiers_list)=>{

      db.query(qre,{type:db.QueryTypes.SELECT}).then(clientRequsetdata=>{
         const requestarray1 = paginate(clientRequsetdata, page, perPage);
                //  console.log(requestarray1)

                       res.render('front/sub-verifier/myclientSubVerifierFilter',{
                                                                                   session : req.session,
                                                                                   clients :requestarray1,
                                                                                  // ClientVerificationModelforfilter: requestarray,
                                                                                  //  countryData,
                                                                                    moment,
                                                                                    sub_verifiers_list
                              })
        
      })
//   await  CountryModel.findAll({where:{status:"active"}}).then(async(countryData)=>{

//     await ClientVerificationModel.findAll({where: objStatus }).then(async(data)=>{
//          var count =1
//        /*outer loop Start*/
//          for(var i=0; i<data.length ;i++){
//             count++


//             UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
//             MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
//             await MyReflectIdModel.findOne({where:{reflect_id:data[i].reflect_id },include: [UserModel]}).then(async(myRefdata)=>
//             {  
 
//                 UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
//                MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
//                await MyReflectIdModel.findOne({where:{reflect_id:data[i].verifer_my_reflect_id },include: [UserModel]}).then(async(v_myRefdata)=>
//             {
            
 
//              await UserModel.findOne({where:{reg_user_id:data[i].client_id }}).then(async(userdata)=>{

//                 await UserModel.findOne({where:{reg_user_id:data[i].verifier_id }}).then(async(ver_userdata)=>{

//                 var obj ={
//                    ClientVerificationData : data[i].dataValues,
//                    MyReflectIData :myRefdata.dataValues,
//                    user : userdata.dataValues,
//                    verifer_my_reflect_id_Data : v_myRefdata,
//                    ver_userdata :ver_userdata,
//                    countryData,
                   
//                   }

//                   requestarray.push(obj)
//                 })
//              })
 
 
//             })
           
 
//             })


//          }
//         /*outer loop End*/
        
//           /*loop-2 Start*/
//           var testCount = reflect_code_list.length
//          //  console.log("length...",testCount)
//           if(reflect_code_list[0]!=null){
//            for(var j=0; j<reflect_code_list.length ;j++)
//            {
//                  /*loop-3 Start*/
//                                 testCount--
//                         for(var k=0; k<requestarray.length ;k++){   
                  
//                                 if(requestarray[k].MyReflectIData.reflect_code==reflect_code_list[j]){
//                                                                                                     filterArray.push(requestarray[k])
//                                                  }
           
                
//                               }
//                  /*loop-3 Start*/
//                  if(testCount==0){
//                     console.log("j length...",j)
//                    //  console.log("testCount...",testCount)
//                     const requestarray1 = paginate(filterArray, page, perPage);         
//                     console.log("requestarray1***************** ", requestarray1)
//                     res.render('front/dashboard-verifier/myclientSubVerifierFilter',{
//                      session : req.session,
//                      clients :requestarray1,
//                      // ClientVerificationModelforfilter: requestarray,
//                      countryData,
//                      moment
//               })
//                    //  res.send(filterArray)
//                    }
           
//            }
//           }else{
//            const requestarray1 = paginate(requestarray, page, perPage);         
//             console.log("requestarray***************** ", requestarray1)
//             res.render('front/sub-verifier/myclientSubVerifierFilter',{
//              session : req.session,
//              clients :requestarray1,
//              // ClientVerificationModelforfilter: requestarray,
//              countryData,
//              moment,
//              sub_verifiers_list
//       })
//              //  res.send(requestarray)
//           }

// /*loop-2 Start*/
 
//   //        res.render('front/dashboard-verifier/v-deshboard',{
//   //         session : req.session,
//   //         ClientVerificationModelData :requestarray,
//   //         moment
//   //  })
 
//      }).catch(err=>console.log("errr",err))



//   })
})
// res.render('front/user-on-boarding-request/boarding-request',{session:req.session})

}

exports.delete_sub_ver_client=async(req,res,next)=>{
  console.log("......................<><><><<<>..........delete_sub_ver_client...............................................")

  
  var status = req.query.status
  var user_id=  req.session.user_id 
  var sub_client_id = req.query.sub_client_id
  var invite_sub_id = req.query.invite_sub_id

  // var invite_sub_id =  JSON.parse(req.body.invite_sub_id);
  console.log("............sub_client_id..............",sub_client_id)

 //  var dt = dateTime.create();
 //   var formatted = dt.format('Y-m-d H:M:S');
   // var msg= `Your request has been ${status} by verifier.`
   // var ntf_type ;
   var updateObj
 //   if(status=="accept"){
    
 //     ntf_type=2;
 //   }
 //   if(status=="reject"){
 //     ntf_type=3
 //   }
 //   if(status=="delete"){
 //    ntf_type=5
 //  }
  if(status=="deactive"){
    updateObj={ sub_client_status :"inactive"}
  }else{
    
        updateObj={deleted:"1"}
  }
 //  console.log("123......................<><><><<<>.........................................................")
 //  console.log(status)
 //  console.log(request_id)

 //  console.log(".............................<><><><.............................................")
     // for(var i=0; i<invite_sub_id.length; i++){
       await SubVerifierClient.update(updateObj, { where: {sub_client_id:sub_client_id }}).then(async(result) =>{
       // console.log(result)
       // ClientVerificationModel.findOne({where:{request_id:request_ids[i]}}).then(async(requestdata)=>{
       //   await NotificationModel.create({
       //     notification_msg   :   msg,
       //     sender_id          :  user_id,
       //     receiver_id        :  requestdata.client_id,
       //     request_id         :  request_ids[i],
       //     notification_type  :   ntf_type,
       //     notification_date  : formatted,
       //     read_status        : "no"
       //    }).then(data=>{
       //      res.redirect("/verifier_deshboard")

       //    }).catch(err=>console.log("err",err))
       // }).catch(err=>console.log("err",err))
       res.redirect(`/sub_verifier_client?invite_sub_id=${invite_sub_id}`)

   }).catch(err=>console.log("err",err))
  //  console.log("..i..",i)
  //  if((invite_sub_id.length-1)==i){
  //  }
  // }
  
  
}

exports.message_list=(req,res,next)=>
{
    var reflect_id= req.query.reflect_id
    // var label= req.query.label

    var reg_id= req.session.user_id
    // console.log('.................................................................................')
    // console.log('reg_id........',reflect_id)
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")
   
    // db.query("SELECT * FROM `tbl_market_place_msgs` INNER join tbl_user_registrations on tbl_market_place_msgs.sender_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_market_place_msgs.receiver_id WHERE tbl_market_place_msgs.status='active' and tbl_market_place_msgs.receiver_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(function(view_details){
        db.query("SELECT *from tbl_market_place_msgs inner join tbl_user_registrations ON tbl_market_place_msgs.sender_id=tbl_user_registrations.reg_user_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_market_place_msgs.receiver_id WHERE tbl_market_place_msgs.receiver_id="+reflect_id+" order by msg_id ASC",{ type:db.QueryTypes.SELECT}).then(function(view_details){
            // console.log('view_details : ',view_details)
        res.render('front/market-place-1/message-market',{ success_msg,
           err_msg,
           view_details,
           session:req.session,
           user_id:reg_id,
           reflect_id
         

         });
    }) 
}
exports.add_msg = (req,res,next )=> {

  var receiver_id=req.body.receiver_id
  var message=req.body.msg 
  // var market_place_id=req.body.market_place_id

  console.log(receiver_id) 
  console.log(message)

  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S'); 
  var sender_id= req.session.user_id

  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');

  MarketPlaceMsg.create({sender_id:sender_id,message:message,receiver_id:receiver_id,msg_date:formatted,createdAt:formatted,updatedAt:formatted}).then(add_data =>{
      console.log(add_data)
      res.send(add_data)
      // req.flash('success_msg', 'Successfully! Your message is added')
 
      // res.redirect('/address-book');
      // err_msg
  });
}  


exports.email_check_user=async(req,res,next)=>{
    success_msg     = req.flash('success_msg');
    err_msg         = req.flash('err_msg');
    var user_id     = req.session.user_id
    var email       = (req.body.email).trim()

    UserModel.findOne({where:{email:email}})
    .then(result=>{
                    if( result != null ){
                                 res.send("userExist")
                    }else{
                                 res.send("userNotExist")
                    }
    })
    .catch(err>console.log(err))
  
  }