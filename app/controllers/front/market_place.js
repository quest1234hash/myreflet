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

exports.show_market_place_list = async(req,res,next)=>{
    
    var reg_id= req.session.user_id
    console.log('.................................................................................')
    console.log('reg_id........',reg_id)
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")
   
      
    db.query("SELECT * FROM `tbl_market_places` WHERE deleted='0' and status='active'",{ type:db.QueryTypes.SELECT}).then(function(market_list_result){

        res.render('front/market-place-1/market-place',{ success_msg,
            err_msg,
           market_list_result,
           session:req.session,
         

         });
    })
    
   
    }
exports.access_marketplace = async(req,res,next)=>{

    var market_place_id= req.query.market_place_id
 
    var sesion_id= req.session.user_id
    // console.log('.................................................................................')
    // console.log('reg_id........',market_place_id)

    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")
    
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
        
    var market_list_result_1=[];
    db.query("SELECT  tbl_wallet_reflectid_rels.reg_user_id as 'reg_user_id',tbl_market_place_reflectid_rels.reflect_id as 'reflect_id',entity_company_country,rep_username,rep_emailid,email,reflect_code,profile_pic,user_as,verifier_type,rep_firstname,entity_company_name,birthplace,verifier_type,wallet_address,country_name FROM tbl_market_place_reflectid_rels INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_market_place_reflectid_rels.reflect_id INNER JOIN tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id INNER JOIN tbl_user_wallets on tbl_user_wallets.wallet_id=tbl_wallet_reflectid_rels.wallet_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_market_place_reflectid_rels.deleted='0' and tbl_market_place_reflectid_rels.status='active' and market_place_id="+market_place_id,{ type:db.QueryTypes.SELECT}).then(async function(verifiers){

   for(var i=0;i<verifiers.length;i++){
            await db.query('SELECT count(*) as total from tbl_myreflectid_doc_rels where reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_docs){
                console.log("verifier_docs------------- ",verifier_docs)
                await db.query('SELECT count(*) as verified from tbl_myreflectid_doc_rels where admin_status="verified" AND reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT}).then(function(verified_docs){
                    console.log("verified_docs------------- ",verified_docs)
                    if(verifier_docs[0].total==verified_docs[0].verified && verifier_docs[0].total != 0){
                        market_list_result_1.push(verifiers[i]);
                    }
                })
            })
        }
        // db.query("select * from tbl_verifier_category_reflectids inner join tbl_verifier_request_categories ON tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id WHERE tbl_verifier_request_categories.deleted='0' and tbl_verifier_request_categories.parent_category='0'",{ type:db.QueryTypes.SELECT}).then(function(categories){
        //     console.log("-----------categories--------------",parent_categories);

    db.query("SELECT label,market_place_id,icon FROM `tbl_market_places` WHERE market_place_id="+market_place_id,{ type:db.QueryTypes.SELECT}).then(function(label){

        db.query("SELECT * FROM `tbl_documents_masters` WHERE deleted='0' and status='active' and document_type='master'",{ type:db.QueryTypes.SELECT}).then(function(allDocs){

            db.query("SELECT * FROM `tbl_address_books`",{ type:db.QueryTypes.SELECT}).then(function(add_book){

        db.query("SELECT * FROM `tbl_wallet_reflectid_rels` INNER JOIN tbl_market_place_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_market_place_reflectid_rels.reflect_id WHERE tbl_wallet_reflectid_rels.user_as='verifier' and market_place_id="+market_place_id,{ type:db.QueryTypes.SELECT}).then(function(reflect_code){
        // console.log('reg_id........',add_book)
 

        db.query("SELECT * FROM `tbl_wallet_reflectid_rels` WHERE tbl_wallet_reflectid_rels.reflectid_by!='digitalWallet' and user_as='client' and reg_user_id="+sesion_id,{ type:db.QueryTypes.SELECT}).then(function(client_reflect_code){
            db.query("SELECT *FROM `tbl_myreflectid_doc_rels` INNER join tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id",{ type:db.QueryTypes.SELECT}).then(function(existing_doc){
            
                console.log(' db hello : ',existing_doc) 
       for(var i=0;i< market_list_result_1.length; i++)
       {

       
        if (market_list_result_1.length > 0) {

            market_list_result_1[i].label=label[0].label;
            page_data=market_list_result_1

        }
    }
    // console.log(' db hello : ',page_data) 



    const market_list_result = paginate(page_data,page, perPage);

    // console.log('Paginate **********  : ',market_list_result)

        res.render('front/market-place-1/access-marketplace',{ success_msg,
            err_msg,
            market_list_result,
            session:req.session,label,reflect_code,success_msg,allDocs,add_book,sesion_id,client_reflect_code,existing_doc
             
        });
            });})});})     
           })
        });
    }) 
    
    
    }
  
exports.add_address_book = async (req,res,next )=> {
    var label=req.body.label
    var reflect_code=req.body.reflect_code
    var market_place_id=req.body.market_place_id

    console.log(label) 
    console.log(reflect_code)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    var reg_id= req.session.user_id

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    // var check=0;

    // const add_book =  await tbl_address_book.findOne({ reflect_code:reflect_code })

    await tbl_address_book.findOne({ where:{verifier_code:reflect_code,lable_name:label} }).then(function(add_book) {
        // check=1;
        console.log("dfrxg : ",add_book)
        if (add_book) {
            console.log('iffffffffffffffff')
            req.flash('err_msg', 'Address book of this reflect code is already exit');
                res.redirect('/access-marketplace?market_place_id='+market_place_id)
        }
        else
        {
            console.log('elsssssssssssssssssssssssssseee')

            tbl_address_book.create({verifier_code:reflect_code,lable_name:label,reg_user_id:reg_id,createdAt:formatted,updatedAt:formatted}).then(add_data =>{
                console.log(add_data)
                req.flash('success_msg', 'Successfully! Your data is added')
           
                res.redirect('/address-book');
                // err_msg
            });
        
        }
    })

       
       
    
}  
exports.message_list=(req,res,next)=>
{
    var reflect_id= req.query.reflect_id
    var label= req.query.label

    var reg_id= req.session.user_id
    // console.log('.................................................................................')
    // console.log('reg_id........',reflect_id)
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")
   
    // db.query("SELECT * FROM `tbl_market_place_msgs` INNER join tbl_user_registrations on tbl_market_place_msgs.sender_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_market_place_msgs.receiver_id WHERE tbl_market_place_msgs.status='active' and tbl_market_place_msgs.receiver_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(function(view_details){
        db.query("SELECT *from tbl_market_place_msgs inner join tbl_user_registrations ON tbl_market_place_msgs.sender_id=tbl_user_registrations.reg_user_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_market_place_msgs.receiver_id WHERE tbl_market_place_msgs.receiver_id="+reflect_id+" order by msg_id ASC",{ type:db.QueryTypes.SELECT}).then(function(view_details){
            console.log('view_details : ',view_details)
        res.render('front/market-place-1/message-market',{ success_msg,
           err_msg,
           view_details,
           session:req.session,
           user_id:reg_id,reflect_id
         

         });
    }) 
}
exports.add_msg_for_verifier = (req,res,next )=> {

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

    MyReflectIdModel.findOne({where:{reflect_id:receiver_id}}).then(async(result) => {

         await UserModel.findOne({ where: {reg_user_id: sender_id} }).then(async(userData) =>{
            var msg=`You have recieved a message from ${userData.full_name} for  ${result.reflect_code}.`;
            console.log(msg)
                        console.log('receiver_id : ',result)
            console.log("receiver_id : ",receiver_id)
                 var receiver_id_parse= parseInt(result.reg_user_id);
            console.log("receiver_id : ",receiver_id_parse)

                        await  NotificationModel.create({
                                                    notification_msg:msg,
                                                    sender_id:sender_id,
                                                    receiver_id:result.reg_user_id,
                                                    notification_type:'6',
                                                    notification_date:new Date()
          
                                              }).then(async(notification) =>{


        console.log(notification)
        res.send(add_data)
                                                 })
                          })
     })
        // req.flash('success_msg', 'Successfully! Your message is added')
   
        // res.redirect('/address-book');
        // err_msg
    });
}  
exports.get_sub_category_list = (req,res,next) =>{
    var category_id = req.body.category_id;
    var reflect_id = req.body.reflect_id;
    // var j = req.body.j;

    db.query("select * from tbl_verifier_request_categories WHERE deleted='0' and parent_category="+category_id,{ type:db.QueryTypes.SELECT}).then(function(sub_categories){
        // console.log("-----------sub categories--------------",sub_categories);
        var j = req.body.j;

        res.render("front/market-place-1/ajax-sub-category",{
            sub_categories:sub_categories,j
        });
    });
}
exports.get_category_list = (req,res,next) =>{
    var reflect_id = req.body.reflect_id;
    var j = req.body.j;
 
    db.query("select * from tbl_verifier_category_reflectids inner join tbl_verifier_request_categories ON tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id WHERE tbl_verifier_request_categories.deleted='0' and tbl_verifier_request_categories.parent_category='0' and tbl_verifier_category_reflectids.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(function(categories){
        // console.log("-----------categories--------------",categories);
        res.render("front/market-place-1/ajax-category",{
            categories:categories,j
        });
    });
}  
exports.get_requested_doc = async (req,res,next) =>{
    // console.log("./././.---------------get_requested_doc start------------------------------------------------./././/. ");
    var category_id = req.body.category_id;
    var j = req.body.j;


    var new_test_array=[];
    var requested_doc_array=[];
    await db.query("select * from tbl_manage_category_documents WHERE deleted='0' and category_id="+category_id,{ type:db.QueryTypes.SELECT}).then(async function(cat_docs){
        // console.log("---------------cat_docs 1-------------- ",cat_docs);
        requested_doc_array=cat_docs;

        for(var i=0;i<cat_docs.length;i++){
            var category_doc_id = cat_docs[i].category_doc_id;
            console.log("---------------cat_docs_id-------------- ",cat_docs[i].category_doc_id);
         await  db.query("select * from tbl_category_documents inner join tbl_documents_masters ON tbl_category_documents.doc_id=tbl_documents_masters.doc_id WHERE tbl_category_documents.deleted='0' and tbl_category_documents.category_doc_id="+category_doc_id,{ type:db.QueryTypes.SELECT})
          .then(async function(requested_docs){
                    // console.log("---------------requested_docs-------------- ",requested_docs);
                    // console.log("---------------cat_docs[i]-------------- ",cat_docs[i]);
                    // console.log("---------------cat_docs_iner_id-------------- ",cat_docs[i].category_doc_id);
            // console.log("---------------cat_docs[i]-------------- ",cat_docs[i]);
         if(requested_docs[0]!=null){
            requested_doc_array[i].document_name = requested_docs[0].document_name
            new_test_array.push(requested_doc_array[i]) ;
            // console.log("-----------categories_inner--------------",requested_doc_array);
         }
                  
                })
         
        }
        //  console.log("-----------categories_outer--------------",new_test_array);
       
       
    async function forsend(){
            res.render("front/market-place-1/ajax-doc",{
                requested_docs:new_test_array,j
            });
        }
        await forsend();
        
    });
}
exports.get_client_existing_doc = (req,res,next) =>{
    // var category_id = req.body.category_id;
    var reflect_id = req.body.reflect_id;
    // var j = req.body.j;
    console.log("-----------existing_doc categories--------------",reflect_id);
    db.query("SELECT *FROM `tbl_myreflectid_doc_rels` INNER join tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(function(existing_doc){

        // console.log("-----------sub categories--------------",existing_doc);

        res.send(existing_doc)
    });
}
exports.request_doc = async(req,res,next) =>{
    console.log("...........................................request_doc start*******....................................");
       var client_id = req.session.user_id;
   
       var reflect_id = req.body.reflect_id;
       var verifier_id = req.body.verifier_id;
       var ver_ref_id = req.body.verifier_reflect_id;
       var sub_cat_id =req.body.sub_cat_id
       var p_cat_id =req.body.p_cat_id

       console.log(".....***sub_cat_id****.....",sub_cat_id);
       console.log(".....***p_cat_id****.....",p_cat_id);
       console.log(".....***reflect_id****.....",reflect_id);
       console.log(".....***ver_ref_id****.....",ver_ref_id);
       console.log(".....***p_cat_id****.....",p_cat_id);

       const request_code = generateUniqueId({
           length: 6,
           useLetters: false
         });
       var doc_id =[]; 
       var download =[];
       var view =[];
       var certify =[];
   
       doc_id = JSON.parse(req.body.total_doc);
       download = JSON.parse(req.body.download);
       view = JSON.parse(req.body.view);
       certify = JSON.parse(req.body.certify);
       console.log(".....*******.....",doc_id);   
   
      await MyReflectIdModel.findOne({where:{deleted:"0",reflect_id:reflect_id}}).then(async(c_re_data)=>{
   
       UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
       MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
       await MyReflectIdModel.findOne({where:{deleted:"0",reflect_id:ver_ref_id},include:[UserModel]}).then(async(v_re_data)=>{
   
        //   console.log("my reflect c $ v data",v_re_data,c_re_data)
   
         var  request_pin =   v_re_data.reflect_code+c_re_data.reflect_code+v_re_data.tbl_user_registration.user_pin
         var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
        var mystr = mykey.update(request_pin, 'utf8', 'hex')
        mystr += mykey.final('hex');
        var cript_64_request_pin = mystr
         console.log("cript_64_request_pin",cript_64_request_pin)
   
   
   
        await ClientVerificationModel.create({
                                        request_code:request_code,
                                        verifier_id:verifier_id,
                                        verifer_my_reflect_id:ver_ref_id,
                                        reflect_id:reflect_id,
                                        client_id:client_id,
                                        request_pin:cript_64_request_pin,
                                        p_category_id: p_cat_id,
                                       sub_category_id:sub_cat_id,
                                    }).then(async(verifyRequest) =>{
   console.log("/////////////////////------",verifyRequest);
   
   var request_id = verifyRequest.request_id;
       await UserModel.findOne({ where: {reg_user_id: client_id} }).then(async(userData) =>{
                        await  NotificationModel.create({
                                                    notification_msg:`You have recieved a request from ${userData.full_name}.`,
                                                    sender_id:client_id,
                                                    receiver_id:verifier_id,
                                                    request_id:request_id,
                                                    notification_type:'1',
                                                    notification_date:new Date()
          
                                              }).then(async(notification) =>{
     /* loop-1 Start */                                               
   for(var i=0;i<doc_id.length;i++){
                       //   console.log("/////////////////////",doc_id[i]);
    await RequestDocumentsModel.create({request_id:request_id,user_doc_id:doc_id[i],download:download[i],view:view[i],                        certified:certify[i]}).then(async(success) =>{
                               // res.send("success");
                             }).catch(err=>console.log("RequestDocumentsModel err",err))
                            }
     /* loop-1 End */
    async function upload_water_mark(){
   
       await db.query('SELECT * FROM tbl_request_documents WHERE request_id='+request_id+' AND deleted="0"',{ type:db.QueryTypes.SELECT}).then(async(requestDocumentData)=>{
           var new_hash_array =[]
           
        /* loop-2 Start */
          for(var z=0; z<requestDocumentData.length;z++)
          {
              await db.query('SELECT * FROM tbl_request_documents INNER JOIN tbl_files_docs ON tbl_request_documents.user_doc_id=tbl_files_docs.user_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id= tbl_client_verification_requests.request_id WHERE tbl_request_documents.request_id='+request_id+' AND tbl_request_documents.deleted="0" AND tbl_files_docs.deleted="0" AND tbl_request_documents.user_doc_id='+requestDocumentData[z].user_doc_id,{ type:db.QueryTypes.SELECT}).then(async(SortrequestDocumentData)=>{
            //    console.log("/////////SortrequestDocumentData////////////",SortrequestDocumentData);
                  // new_hash_array.push(SortrequestDocumentData[0])
               //    for(var k=0; k<SortrequestDocumentData.length; k++){
                   async.each(SortrequestDocumentData,async function (content1, cb) {
   
                  var w_text="MY_reflect"+content1.request_code;
               //    var fun_hash =SortrequestDocumentData[k].file_content
                  var fun_hash =content1.file_content
   
                  console.log("hello-----------1 ");
                    await Jimp.create(500,500,'#ffffff',async function(err, nova_new) {
                   //  .then(async nova_new =>{
                       console.log("hello-----------2 ");
                       var a;
                        a= await Jimp.read(`https://ipfs.io/ipfs/${fun_hash}`,async function(err, image) {
                       //  .then(async image => {
                          // var srcImage=blob_url.split(',')[1];
                          console.log("hello-----------3 ");
                          var b;
                           b=  await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK ,async function(err, font) {
                       //    .then(async (font) => {
                           console.log("hello-----------4 ");
                           var c;
                            image.print(font,image.bitmap.width/2.5,image.bitmap.height/2.5,w_text
                           //     ,async function(err, font1) {
                           // }
                           )
   
                           
                      
                          nova_new.composite(image,0,0);
                         
                          image.resize(200,200);
                      
                      
                           //    let text_img = nova_new.getBase64Async(Jimp.MIME_PNG);
                      
                                  console.log("hello-----------5 ");
                      var d;
                                   d= await   nova_new.getBase64Async(Jimp.MIME_PNG)
                               // .exec(async function(err, result) {
                               // .then(async(result) => {
                                       console.log("hello-----------6 ");
                                   //    let testBuffer = new Buffer(result);
                                    let testBuffer = new Buffer(d);
   
              var e;
                                       e = await  ipfs.files.add(testBuffer, async function (err, file) {
                                          if (err) {
                                          console.log("err from ejs",err);
                                          }else{
                                           //    console.log("from ipfs ",file);
                                              console.log("hello-----------7 ");
                                              var z;
                                               z =  await  RequestFilesModel.create({
                                               request_doc_id:content1.request_doc_id,
                                               request_file_hash:file[0].hash
                                              }
                                           //    ,async function (err, dataForReturn) {
                                           //     console.log("hello-----------8 ");
                                           //     return dataForReturn; 
                                           //    }
                                              ).then(async (dataForReturn)=>{
                                               console.log("hello-----------8 ");
                                               return "dataForReturn"; 
                                              })
                                              
                                           //    var obj ={
                                           //        hash : file[0].hash
                                           //    }
                                           //    new_hash_array.push(obj)
          
                                          }
                                                                      
                                      })
                              
                                      
               }) 
               
                      })
                      
                  });
   
   
              })//
   
   
                  
              })
          }
        /* loop-2 End */


       //    async function back_to_back(){
       //        console.log("new_hash_array array",new_hash_array)
          
       //    }
       //    await back_to_back()
             
          })
   }
   await upload_water_mark();
   async function finalRespone(){
       res.send("success")
   }
   await finalRespone()
   
   }).catch(err=>console.log("notification err",err))
   }).catch(err=>console.log("notification err err",err))
   
   }).catch(err=>console.log("notification err err ",err))
   }).catch(err=>console.log("err client",err))
   }).catch(err => console.log("err v_code",err))
       
   }
/**request-doc Post method End**/

exports.add_msg_for_client = (req,res,next )=> {

    var receiver_id=req.body.receiver_id
    var not_receiver_id=req.body.sender_id

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

    MyReflectIdModel.findOne({where:{reflect_id:receiver_id}}).then(async(result) => {

         await UserModel.findOne({ where: {reg_user_id: sender_id} }).then(async(userData) =>{
            var msg=`You have recieved a message from ${userData.full_name} for  ${result.reflect_code}.`;
            console.log(msg)
                        console.log('receiver_id : ',result)
            console.log("receiver_id : ",receiver_id)
                 var receiver_id_parse= parseInt(result.reg_user_id);
            console.log("receiver_id : ",receiver_id_parse)

                        await  NotificationModel.create({
                                                    notification_msg:msg,
                                                    sender_id:sender_id,
                                                    receiver_id:not_receiver_id,
                                                    notification_type:'6',
                                                    notification_date:new Date()
          
                                              }).then(async(notification) =>{


        console.log(notification)
        res.send(add_data)
                                                 })
                          })
     })
        // req.flash('success_msg', 'Successfully! Your message is added')
   
        // res.redirect('/address-book');
        // err_msg
    });
}  
