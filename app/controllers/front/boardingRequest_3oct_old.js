var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel,FilesDocModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel,verifierRequestModel,updatePrmRequestModel} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var { tbl_verifier_plan_master,tbl_verifier_doc_list} = require('../../models/admin');
var { InviteClientVerifierModel} = require('../../models/invite_client_verifier');

var { tbl_verfier_purchase_details } =require("../../models/purchase_detaile")
var { tbl_address_book } =require("../../models/address_book")
var {NotificationModel}=require('../../models/notification');
var {VerifierRequestCategoryModel,VerifierCategoryReflectidModel,ManageCategoryDocument,CategoryDocument} = require('../../models/verifier_category');
var dataUriToBuffer = require('data-uri-to-buffer');
var sizeOf = require('buffer-image-size');

const Op = require('sequelize').Op

const Tx = require('ethereumjs-tx')
const Web3 = require('web3');
// var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/eda1216d6a374b3b861bf65556944cdb"));
// var web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/f8a10cc5a2684f61b0de4bf632dd4f4b"));
var web3 = new Web3(new Web3.providers.HttpProvider("http://13.233.173.250:8501"));
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
var crypto = require('crypto'); 
var request = require('request');
var formidable = require('formidable');
var async = require('async');
var Jimp = require('jimp');
var toBuffer = require('blob-to-buffer')
//28-02-2020
const ipfsAPI = require('ipfs-api');
const fs = require('fs');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

var contractAddress = '0xf81F900EB4b36CEE20D743511d3074fE48aFCA84';

var contractABI = [{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"documents","outputs":[{"name":"doc","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"doc","type":"string"},{"name":"verifier_email","type":"string"},{"name":"client_email","type":"string"},{"name":"doc_name","type":"string"},{"name":"verifier_myReflect_code","type":"string"},{"name":"client_myReflect_code","type":"string"},{"name":"request_status","type":"string"},{"name":"reason","type":"string"}],"name":"addDocument","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getDocumentsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getDocument","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}];
/**request_on_boarding Get method Start**/

exports.requestOnBoarding= async(req,res,next )=>{
  // console.log("check path   ",__dirname)
  // let testFile = fs.readFileSync(__dirname+'/../../uploads/documents/document_1582884940789_myw3schoolsimage.jpg');
  // let testBuffer = new Buffer(testFile);
  // ipfs.files.add(testBuffer, function (err, file) {
  //   if (err) {
  //     console.log("err from ejs",err);
  //   }
  //   console.log("from ipfs ",file)
  // })
    var userId =req.session.user_id 
    // console.log("user idv ", userId)
    var requestarray =[]

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    db.query("SELECT * FROM `tbl_wallet_reflectid_rels` WHERE user_as='client' and reg_user_id<>"+userId,{type:db.QueryTypes.SELECT}).then(allClients=>{
      db.query("SELECT * FROM `tbl_wallet_reflectid_rels` WHERE user_as='verifier' and reg_user_id="+userId,{type:db.QueryTypes.SELECT}).then(myVerifiers=>{
    db.query('SELECT * ,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name ,tbl_client_verification_requests.createdAt as request_createdAt FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id  WHERE tbl_client_verification_requests.verifier_id="'+userId+'" AND tbl_client_verification_requests.deleted="0" AND tbl_client_verification_requests.request_status="accept" AND tbl_client_verification_requests.removed_request="no" order by request_id desc',{type:db.QueryTypes.SELECT}).then(RequsetOnBoardingACCEPT=>{

        db.query('SELECT * ,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name, tbl_client_verification_requests.createdAt as request_createdAt FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id  WHERE tbl_client_verification_requests.verifier_id="'+userId+'" AND tbl_client_verification_requests.deleted="0" AND tbl_client_verification_requests.request_status="pending" AND tbl_client_verification_requests.removed_request="no" order by request_id desc',{type:db.QueryTypes.SELECT}).then(RequsetOnBoardingPending=>{
              
              db.query('SELECT *,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name ,tbl_client_verification_requests.createdAt as request_createdAt FROM `tbl_sub_verifier_clients` INNER JOIN tbl_client_verification_requests ON tbl_client_verification_requests.request_id=tbl_sub_verifier_clients.client_request_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id WHERE tbl_sub_verifier_clients.sub_verifier_reg_id="'+userId+'" AND tbl_sub_verifier_clients.deleted="0" AND tbl_sub_verifier_clients.sub_client_status="active" AND tbl_client_verification_requests.deleted="0" AND tbl_client_verification_requests.removed_request="no" order by request_id desc',{type:db.QueryTypes.SELECT}).then(subverifierAssignClient=>{

                     for (let i = 0; i < subverifierAssignClient.length; i++) {
                            if(subverifierAssignClient[i].request_status=="pending"){
                                  RequsetOnBoardingPending.push(subverifierAssignClient[i]) 
                            }
                            if(subverifierAssignClient[i].request_status=="accept"){
                                  RequsetOnBoardingACCEPT.push(subverifierAssignClient[i])
                            }
                       
                     }
                                         console.log("boarding request",RequsetOnBoardingPending)
                                         console.log("boarding request",RequsetOnBoardingACCEPT)

                                         res.render('front/user-on-boarding-request/boarding-request',{
                                                                                   RequsetOnBoardingACCEPT,
                                                                                   RequsetOnBoardingPending,
                                                                                   session : req.session,allClients,myVerifiers,
                                                                                    //ClientVerificationModelData :requestarray,
                                                                                   moment,success_msg
                                         })
                                  })
                            })
             })

       })

    })
 
 
  //   await ClientVerificationModel.findAll({where:{verifier_id: userId } }).then(async(data)=>{
  //        console.log(".......................................................")
  //        var count =1
  //        for(var i=0; i<data.length ;i++){
  //           count++
  //           await MyReflectIdModel.findOne({where:{reflect_id:data[i].reflect_id }}).then(async(myRefdata)=>
  //           {  
 
  //               UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
  //              MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
  //              await MyReflectIdModel.findOne({where:{reflect_id:data[i].verifer_my_reflect_id },include: [UserModel]}).then(async(v_myRefdata)=>
  //           {
  //            // console.log(v_myRefdata.tbl_user_registration)
 
  //            // console.log(".......................................................")
  //            // console.log(v_myRefdata.tbl_user_registration.dataValues)
  //           //  var match_to_client_or_veri ;
  //           //      if(data[i].verifier_id==userId){
  //           //        match_to_client_or_veri=data[i].verifier_id
  //           //      }else{
  //               //    match_to_client_or_veri=data[i].client_id
  //               //  }
 
  //            await UserModel.findOne({where:{reg_user_id:data[i].client_id }}).then(async(userdata)=>{

  //               await UserModel.findOne({where:{reg_user_id:data[i].verifier_id }}).then(async(ver_userdata)=>{

  //               var obj ={
  //                  ClientVerificationData : data[i].dataValues,
  //                  MyReflectIData :myRefdata.dataValues,
  //                  user : userdata.dataValues,
  //                  verifer_my_reflect_id_Data : v_myRefdata,
  //                  ver_userdata :ver_userdata
  //                 }

  //                 requestarray.push(obj)
  //               })
  //            })
 
 
  //           })
           
 
  //           })
  //        }
  //      //   console.log("user idvddsvdsvdsvdsvds<><> ", count)
 
  //        res.render('front/user-on-boarding-request/boarding-request',{
  //         session : req.session,
  //         ClientVerificationModelData :requestarray,
  //         moment
  //  })
 
    //  }).catch(err=>console.log("errr",err))
 

// res.render('front/user-on-boarding-request/boarding-request',{session:req.session})

}

/**request_on_boarding Get method End**/


/**request_status_change Get method Start**/
exports.RequestStatusChange=async(req,res,next)=>{
  console.log(".............................<><>RequestStatusChange<><.............................................")
    var status = req.query.status
   var user_id=  req.session.user_id 
   var request_id = req.query.request_id
   var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    
    var ntf_type ;
    if(status=="accept"){
      ntf_type=2;
    }else{
      ntf_type=3
    }
  //  console.log("123......................<><><><<<>.........................................................")
  //  console.log(status)
  //  console.log(request_id)

  //  console.log(".............................<><><><.............................................")

   await ClientVerificationModel.update({request_status:status}, { where: { request_id:request_id }}).then(async(result) =>{
        // console.log(result)
      var useradata =await UserModel.findOne({where:{reg_user_id:user_id}})
      
      await  ClientVerificationModel.findOne({where:{request_id:request_id}}).then(async(requestdata)=>{
        var msg= `Your request has been ${status}ed by verifier ${decrypt(useradata.full_name)}-${requestdata.request_code}.`
          await NotificationModel.create({
            notification_msg   :   msg,
            sender_id          :  user_id,
            receiver_id        :  requestdata.client_id,
            request_id         :  request_id,
            notification_type  :   ntf_type,
            notification_date  : formatted,
            read_status        : "no"
           }).then(data=>{
             res.redirect("/request_on_boarding")

           }).catch(err=>console.log("err",err))
        }).catch(err=>console.log("err",err))
  
    }).catch(err=>console.log("err",err))
}

/**request_status_change Get method End**/

/**accep_reject_request_check Post method Start**/
exports.changeStatusOfRequest=async (req,res,next)=>{
  console.log(".............................<><>changeStatusOfRequest<><........................................................")
  var status = req.body.status
 var user_id=  req.session.user_id 
 var request_id = req.body.request_ids
 var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');
  // var msg= `Your request has been ${status}ed by verifier.`
  var ntf_type ;
  if(status=="accept"){
    ntf_type=2;
  }else{
    ntf_type=3
  }
//  console.log("123......................<><><><<<>.........................................................")
//  console.log(status)
//  console.log(request_id)


var requestIDs = JSON.parse(request_id)
var requestIDs = JSON.parse(request_id)
// console.log(" requets type ",requestIDs)

// for(var i=0; i<requestIDs.length ; i++)
// {

   var result = await ClientVerificationModel.update({request_status:status}, { where: { request_id:requestIDs[0] }})
      // .then(async(result) =>{
      // console.log("inside fisrt")
      var useradata =await UserModel.findOne({where:{reg_user_id:user_id}})
      var msg= `Your request has been ${status}ed by verifier ${decrypt(useradata.full_name)}.`
         var requestdata =  await ClientVerificationModel.findOne({where:{request_id:requestIDs[0] }});
          
            console.log("inside 2nd")
            // console.log(" requets type ",requestIDs[0])

        //        await NotificationModel.create({
        //                                    notification_msg   :   msg,
        //                                    sender_id          :  user_id,
        //                                    receiver_id        :  requestdata.client_id,
        //                                    request_id         :  requestIDs[i],
        //                                    notification_type  :   ntf_type,
        //                                    notification_date  : formatted,
        //                                    read_status        : "no"
        //                                   }).then(data=>{
        //                                     console.log("inside 3red")


        //  }).catch(err=>console.log("err1",err))
      // }).catch(err=>console.log("err2",err))

  // }).catch(err=>console.log("err3",err))


// }
console.log(".............................<><>end<><........................................................")

res.redirect("/request_on_boarding")

}

/**accep_reject_request_check Post method End**/

/**pen_request_view_client_info Get method Start**/
exports.penRequestViewClientInfo=async (req,res,next)=>{
  var request_id = req.query.request_id
  var verifier_name = req.query.verifier_name;
  MyReflectIdModel.hasMany(ClientVerificationModel, {foreignKey: 'reflect_id'})
  ClientVerificationModel.belongsTo(MyReflectIdModel, {foreignKey: 'reflect_id'})
  await ClientVerificationModel.findOne({where:{request_id:request_id ,deleted:"0"},include: [MyReflectIdModel]}).then(async(requestData)=>{
    
      if(requestData){
        var user_id = requestData.dataValues.tbl_wallet_reflectid_rel.reg_user_id;
        // var country_id = requestData.dataValues.tbl_wallet_reflectid_rel.country_id;
        console.log("user_id************** ",user_id);
        // console.log("country_id************** ",country_id);
await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async contact_n_country =>{
 
 console.log("******country detail*********",contact_n_country);
 await db.query("SELECT * FROM tbl_request_documents INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_request_documents.request_id="+request_id+" AND tbl_myreflectid_doc_rels.deleted='0'",{ type:db.QueryTypes.SELECT}).then(async(requestDoc)=>{
  //  console.log("**********requestDoc******** ",requestDoc);
    /*outer loop Start*/

  for(var i=0; i<requestDoc.length; i++)
  {
   var final_hash_arr=[]
         /*inner loop Start-1*/

     for(var j=1; j<=requestDoc[i].version_count; j++)
          await db.query("SELECT * FROM tbl_request_documents_files WHERE request_doc_id="+requestDoc[i].request_doc_id+" AND deleted='0' AND version="+j,{ type:db.QueryTypes.SELECT}).then(async(requestDocFile)=>{
          // console.log("**********requestDocFile******** ",requestDocFile);

            var hash_arr=[]
         /*inner loop Start-2*/
     
          for(var k=0; k<requestDocFile.length; k++){
            // request.get('https://ipfs.io/ipfs/'+requestDocFile[k].request_file_hash)
            // hash_arr.push(requestDocFile[k].request_file_hash);
            hash_arr.push({request_file_hash:requestDocFile[k].request_file_hash,doc_type:requestDocFile[k].doc_type});
          }
          console.log("**********hash_arr******** ",hash_arr);
   /*inner loop End-2*/

         async function forPus(){
          requestDocFile[0].request_doc_file=hash_arr
          final_hash_arr.push(requestDocFile[0])
          
         }
          
        await forPus()
          })
    /*inner loop End*/

     async function forlatepush(){
      requestDoc[i].request_doc_data=final_hash_arr
      // requestDoc[i].doc_type=doc_type

   console.log("**********requestDoc******** ",requestDoc[i].request_doc_data[0].request_doc_file);
   
     }
await forlatepush()
  }
 async function forrender(){
  //  console.log("requset doc data*************",requestDoc)
  //  console.log("data.....",userdata)
      res.render("front/user-on-boarding-request/clients-manage-request",{
         session : req.session,
         documentsData:requestDoc,
         requestData :requestData,
         contact_n_country,
         verifier_name,
         moment
   })
    
  }
    /*outer loop End*/

 await forrender()
      
})
})
 
  }
 
 
  }).catch(err=>console.log("errr",err))
   
 
}
/**pen_request_view_client_info Get method End**/

/**pin-for-img Post method Start**/
exports.pin_for_img = async (req,res,next) =>{
  var request_id = req.body.request_id;
  var hash = req.body.hash;
  var otp = req.body.otp;
  var doc_type = req.body.doc_type;

  console.log("request_id",request_id);
  console.log("hash",hash);
  console.log("otp",otp);
  await db.query("SELECT * FROM tbl_client_verification_requests WHERE deleted='0' AND request_id="+request_id,{ type:db.QueryTypes.SELECT}).then(async function(request_data){
    console.log("***************request_data**********",request_data);
    var request_pin_db = request_data[0].request_pin;
    await db.query("SELECT * FROM tbl_wallet_reflectid_rels WHERE deleted='0' AND reflect_id="+request_data[0].verifer_my_reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(ver_data){
      var ver_ref_code = ver_data[0].reflect_code;
      console.log("***************ver_ref_code**********",ver_ref_code);
      await db.query("SELECT * FROM tbl_wallet_reflectid_rels WHERE deleted='0' AND reflect_id="+request_data[0].reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(client_data){
        var client_ref_code = client_data[0].reflect_code;
        console.log("***************client_ref_code**********",client_ref_code);
        var  request_pin =   ver_ref_code+client_ref_code+otp
         var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
        var mystr = mykey.update(request_pin, 'utf8', 'hex')
        mystr += mykey.final('hex');
        var cript_64_request_pin = mystr
        if(cript_64_request_pin!=request_pin_db){
    console.log("***************request_pin_db**********",request_pin_db);
          console.log("if ",cript_64_request_pin);
          res.send({fail:"true",success:"false"});
        }else{
          console.log("if");
          console.log("doc_type : ",doc_type)
          if(doc_type=='image'){
                  await request(`https://ipfs.io/ipfs/${hash}`, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                      console.log("*******body**********",body);
                      // const result = JSON.parse(body);
                      // console.log("*******result**********",result);

                    res.send({fail:"false",success:body});
                    }
                    
              })
          }else if(doc_type=='video'){
            console.log("*******result else**********",hash);

            res.send({fail:"false",success:hash});

          }
        }

      })
    })

  })
}
/**pin-for-img Post method End**/

/**accept-request Post method Start**/
exports.accept_request = async (req,res,next) =>{

  var request_id    = req.body.request_id;
  var blob_url      = req.body.blob_url;
  // var private_key2  = req.body.private_key.trim();
  var private_key2  = '0x6765c35c62e998f9de4a9a590c137c8a3845721a398289737beb8178c001faba';

  var private_key1;
  var msg;
  var document_name;
  var user_id      = req.session.user_id;
  let client_id;
  var dt           = dateTime.create();
  var formatted    = dt.format('Y-m-d H:M:S');
  let V_R_code;
  let ver_name;
  // var request_file_id = req.body.request_file_id;
  var ver_reflect_id    = req.body.ver_reflect_id;
  var client_reflect_id = req.body.client_reflect_id;
   console.log("ver_reflect_id------ ",ver_reflect_id);
  var request_status    = 'accepted';
  var reason = "NA";
   var request_doc_id   = req.body.request_doc_id;
  //  var count;
  //  var file_id = file_data.split("-")[1];
  //  console.log("file_id----------********------ ",file_id);
  await RequestDocumentsModel.update({approve_status:"approved"},{where:{ request_doc_id: request_doc_id} }).then(async update_success =>{

     await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_request_documents_files.docfile_status='pending' AND tbl_request_documents_files.request_doc_id="+request_doc_id,{type:db.QueryTypes.SELECT}).then(async request_doc_data =>{
    let count=0;
  /*outer loop Start*/
       
  var k=0;
    // for(var k=0;k<request_doc_data.length;k++){


    var array_of_doc_hash   =  []
    var string_array_of_doc_hash
      async.each(request_doc_data,async function (content, cb) {
                
        

    console.log("*****request_doc_data****** ",content.length);

    console.log("*****request_doc_data k ****** ",k);

    console.log("*****request_doc_data  ****** ",content);


    
      var self_assested     =   content.self_assested

      var doc               = content.request_file_hash;
     
      var doc_name          = content.document_name;
      document_name         = content.document_name;
      var request_file_id   = content.request_file_id;
      var request_doc_id    = content.request_doc_id
      var version           = content.version

      // var request_file_id =request_doc_data[k].request_file_id
    
  //  await db.query("SELECT * FROM tbl_files_docs INNER JOIN tbl_myreflectid_doc_rels ON tbl_files_docs.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id inner join tbl_documents_masters on tbl_documents_masters.doc_id=tbl_myreflectid_doc_rels.doc_id WHERE tbl_files_docs.file_id="+file_id,{ type:db.QueryTypes.SELECT}).then(async function(file_result){
  //     var doc = file_result[0].file_content;
  //     var doc_name = file_result[0].document_name;
  //     // console.log("file_result----------********------ ",file_result);
  //     var user_reflect_id = file_result[0].reflect_id;
      await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.deleted='0' AND tbl_wallet_reflectid_rels.reflect_id="+client_reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(client_data){
      // console.log("client_data----------********------ ",client_data);
           client_id = client_data[0].reg_user_id;
          var client_email = decrypt(client_data[0].email);
          var client_myReflect_code = client_data[0].reflect_code;
          
          await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.deleted='0' AND tbl_wallet_reflectid_rels.reflect_id="+ver_reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_data){
            // console.log("verifier_data----------********------ ",verifier_data);
            var verifier_email = decrypt(verifier_data[0].email);
            var verifier_myReflect_code = verifier_data[0].reflect_code;
            var wallet_id = verifier_data[0].wallet_id;
            V_R_code = verifier_data[0].reflect_code;
            ver_name = decrypt(verifier_data[0].full_name);


             var verifier_name;

              if(verifier_data[0].entity_company_name)
              {
                          verifier_name = verifier_data[0].entity_company_name;
              }
              else  if(verifier_data[0].rep_firstname)
              {
              	          verifier_name = verifier_data[0].rep_firstname;

              }
              else
              {
              	            verifier_name = verifier_data[0].full_name;

              }
            await db.query("SELECT * FROM tbl_user_wallets WHERE deleted='0' AND wallet_id="+wallet_id,{ type:db.QueryTypes.SELECT}).then(async function(wallet_data){
            // console.log("wallet_data----------********------ ",wallet_data);




                 const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration))

                 var jimp_doc,srcImage,ipfs_width,ipfs_height;
                                                        console.log("before await 1",self_assested);
                                                       	console.log("Doc-----2------ ",doc);

                                                       	 console.log("detail-----2------ ",doc,verifier_name,V_R_code);





                                                            async function wait_hash(){
                
								              //  if (self_assested==='yes') {

								                                         await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {

								                                               if (  !error && response.statusCode == 200  ) {    
								                                                                                                      
								                                                      srcImage = dataUriToBuffer(body);
								                                                    }


								                                   })
								                                        await delay(10000)


								                                      // }
												                    //  else
												                    //  {
												                                     
												                    //                     srcImage = `https://ipfs.io/ipfs/${doc}`

												                    //                      console.log("elseSSSSSSSSSSSSSSSSShello-----------1 ",srcImage);

												                    //  }  
								                            }     

								                      
                   console.log("before await1");
                   if ( content.doc_type == "image" ) {

                           await wait_hash();
                           await jimp_fun();
                           
                  } else {
                                 array_of_doc_hash.push(content.doc_type+'-'+doc)
               
                             if(array_of_doc_hash.length == request_doc_data.length){
                                   console.log("inside render if")
                              string_array_of_doc_hash = array_of_doc_hash.toString()
                              await TransactionFunction(string_array_of_doc_hash)
                               
                             }
                    async function TransactionFunction(string_array_of_doc_hash){

                      console.log("from ipfs self_attested_hash:file[0].hash text_img",string_array_of_doc_hash);

                                                                        // jimp_doc = file[0].hash;
                                                                        jimp_doc = string_array_of_doc_hash;


                                                                        var doc = jimp_doc
                                                                console.log("jimp_doc ejs",doc);
                                                                    

                                                                    console.log("ALLLLLLLLLLLLLLLLLLLLLLLLLL %$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ BLOCKCHAIN DATAAAAAAAAAAAAAAAAA");

                                                                  console.log("doc ejs",doc);

                                                                  // console.log("doc ejs",doc);
                                                                  console.log("verifier_email ejs",verifier_email);
                                                                  console.log("client_email ejs",client_email);
                                                                  console.log("doc_name ejs",doc_name);
                                                                  console.log("verifier_myReflect_code ejs",verifier_myReflect_code);
                                                                  console.log("client_myReflect_code ejs",client_myReflect_code);
                                                                  console.log("request_status ejs",request_status);
                                                                  console.log("request_status ejs",reason);



                                                                // var wallet_address = wallet_data[0].wallet_address;
                                                                // console.log("wallet_address :",wallet_address)

                                                         var wallet_address='0xe9da7cc15e416ab431917f88eddb7314bd709711';
                                                        let account;
                                                        var m = private_key2.indexOf("0x");
                                                        // if (m==0) {
                                                        //   private_key1=private_key2
                                                        //   account = web3.eth.accounts.privateKeyToAccount(private_key1);
                                                        //   if(!account){
                                                        //     console.log("inside account if 1")
                                                        //     res.send({fail:"true",success:"false"});
                                                        //   }
                                                        //   }else{
                                                        //     private_key1 ='0x'+private_key2;
                                                        //     console.log("*************private_key1 ",private_key1);
                                                        //     account = web3.eth.accounts.privateKeyToAccount(private_key1);            
                                                        //     if(!account){
                                                        //       console.log("inside account if 2")

                                                        //       res.send({fail:"true",success:"false"});
                                                        //     }
                                                        //   }
                                                          
                                                          // if(account.address != wallet_address){
                                                          //   console.log("inside account if 3")

                                                          //   res.send({fail:"true",success:"false"});
                                                          // }
                                                          // else
                                                          // {
                                                            console.log("inside account if 4")

                                                            
                                                           

                                                            const user = contractABI;                       
                                                           
                                                            var contract =  new web3.eth.Contract(user,contractAddress);
                                                            // var private_key1 = '0x97d17cf1e4852e681fd778aa95b046b6f47989fb63ede2e7348682d4e14af8e9'
                                                            var private_key = private_key1.slice(2);
                                                            var privateKey = Buffer.from(private_key, 'hex');

                                                          await web3.eth.getTransactionCount(wallet_address).then( async function(v){
                                                                        console.log("***********v ",v)    
                                                                        if(k==0){
                                                                          count = v;
                                                                        }else if(count==v){
                                                                          count = v+1;
                                                                        }else{
                                                                          count=v;
                                                                        }             
                                                            
                                                                    console.log("*********count*********", count);
                                                                      
                                                        
                                                                        var rawTransaction = {
                                                                            "from": '0xe9da7cc15e416ab431917f88eddb7314bd709711',
                                                                            "gasPrice":"0x0",
                                                                            "gasLimit": web3.utils.toHex(4600000),
                                                                            "to":contractAddress,                
                                                                            "value": "0x0",
                                                                            "data": contract.methods.addDocument(doc,verifier_email,client_email,doc_name,verifier_myReflect_code,client_myReflect_code,request_status,reason).encodeABI(),
                                                                            "nonce": web3.utils.toHex(count)
                                                                        }
                                                        
                                                                      console.log('rawTransaction : ',rawTransaction)
                                                                        var transaction = new Tx(rawTransaction);
                                                                        transaction.sign(privateKey);  
                                                        
                                                        
                                                                      await web3.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'),(err,tx_hash)=>{
                                                                          console.log("err ",err);
                                                                          console.log("tx_hash ",tx_hash," request_file_id : ",request_file_id);
                                                                          console.log("request_doc_id ",request_doc_id," version : ",version);  
                                                                          RequestFilesModel.update({transaction_hash:tx_hash,docfile_status:"accept",reason:reason},{where:{ request_doc_id: request_doc_id,version:version} }).then(success =>{

                                                                            console.log('request_file_id : ',request_file_id,"  ^^^^^^^^^^^^ transaction_hash :",tx_hash)
                                                                              //  res.redirect('/pen_request_view_client_info?request_id='+request_id);
                                                                              senddata()
                                                                          }).catch(err =>{
                                                                            console.log("**************err********* ", err);
                                                                          })
                                                                            
                                                                        })
                                                                    })
                                                                    // count++;
                                                          // }
                                                                        
                    }
            
                  }
                      
   
                  console.log("After await1");
             async function jimp_fun()
              {
        
                   // let message_date = moment(new Date()).format("h:mm:ssa,ddd,MM-D-YYYY")
                      let message_date = moment(new Date()).format("ddd,MM-D-YYYY")
                      let message_time = moment(new Date()).format("h:mm:ssa")
                      var segImeg=blob_url.split(',')[1];
                      
            const buff = Buffer.from(segImeg,'base64');
            buff.toString();
        

            await Jimp.read(buff).then(async newimage => {

            



        await Jimp.read(srcImage).then(async image => {
          await newimage.resize(image.bitmap.width/4,image.bitmap.width/4);
          console.log(newimage.bitmap)
          let approve_image =  await Jimp.read(__dirname+'/../../public/assets/images/approve.jpg')
          await approve_image.resize(image.bitmap.width/4,image.bitmap.width/4);
              await Jimp.create(image.bitmap.width ,((image.bitmap.height)+((image.bitmap.width/4)+30)),'#ffffff').then(async nova_new =>{

                               console.log("hello-----------3 3  ");


              await  Jimp.loadFont(Jimp.FONT_SANS_12_BLACK)
                  .then(async font => {

                    nova_new.print(
                      font,
                      (image.bitmap.width)-(image.bitmap.width/4),
                      image.bitmap.height+10,
                       verifier_name+'-'+V_R_code,
                      5,
                      (err, nova_new, { x, y }) => {
                        nova_new.print(font, x, y , message_date, 5,
                                      (err, nova_new, { x, y }) => {
                                                  nova_new.print(font, x, y , message_time, 5,);
                                    });
                      }
                    );

                      //  text_name_code.print(font, x,y,   verifier_name)
                           
 
                      //  text_date.print(font, x, y + 20,message_date  , 50);
              

                                                 console.log("hello-----------3 4  ");
                                              nova_new.composite(image,0,0)
                                              nova_new.composite(newimage,(image.bitmap.width)-(image.bitmap.width/4),image.bitmap.height);
                                              nova_new.composite(approve_image,0,image.bitmap.height);
                                              // nova_new.composite(image,0,text_height)
                                              // nova_new.composite(newimage,0,0);


                                      console.log("hello-----------55   ");

                      
                              let text_img = nova_new.getBase64Async(Jimp.MIME_PNG);
                      
                                  console.log("hello-----------3 ");
                      
                                await  text_img.then(async result => {
                                  let testBuffer = new Buffer(result);
                                    console.log("text_img after 3 ",testBuffer);

                                     

                                     await ipfs.files.add(testBuffer,async function (err, file) {

                                                                          console.log("from ipfs ",file);

                                                                              if (err) {

                                                                                       console.log("err",err);

                                                                              }  else {

                                                                                       array_of_doc_hash.push(content.doc_type+'-'+file[0].hash)
                                                                              console.log("array_of_doc_hash.length , request_doc_data.length ",array_of_doc_hash.length,request_doc_data.length);
                                                                                       if(array_of_doc_hash.length == request_doc_data.length){
                                                                                             console.log("inside render if")
                                                                                        string_array_of_doc_hash = array_of_doc_hash.toString()
                                                                                        await TransactionFunction(string_array_of_doc_hash)
                                                                                         
                                                                                       }

                                                                                       
                                    
                                                                              }

                                                                                await delay(10000)

																	                    
                                             })



                                        async function TransactionFunction(string_array_of_doc_hash){

                                          console.log("from ipfs self_attested_hash:file[0].hash text_img",string_array_of_doc_hash);

                                                                                            // jimp_doc = file[0].hash;
                                                                                            jimp_doc = string_array_of_doc_hash;


                                                                                            var doc = jimp_doc
                                                                                    console.log("jimp_doc ejs",doc);
                                                                                        

                                                                                        console.log("ALLLLLLLLLLLLLLLLLLLLLLLLLL %$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ BLOCKCHAIN DATAAAAAAAAAAAAAAAAA");

                                                                                      console.log("doc ejs",doc);

                                                                                      // console.log("doc ejs",doc);
                                                                                      console.log("verifier_email ejs",verifier_email);
                                                                                      console.log("client_email ejs",client_email);
                                                                                      console.log("doc_name ejs",doc_name);
                                                                                      console.log("verifier_myReflect_code ejs",verifier_myReflect_code);
                                                                                      console.log("client_myReflect_code ejs",client_myReflect_code);
                                                                                      console.log("request_status ejs",request_status);
                                                                                      console.log("request_status ejs",reason);



                                                                                    // var wallet_address = wallet_data[0].wallet_address;
                                                                             var wallet_address='0xe9da7cc15e416ab431917f88eddb7314bd709711';
                                                                            let account;
                                                                            var m = private_key2.indexOf("0x");
                                                                            if (m==0) {
                                                                              private_key1=private_key2
                                                                              account = web3.eth.accounts.privateKeyToAccount(private_key1);
                                                                              if(!account){
                                                                                console.log("inside account if 1")
                                                                                res.send({fail:"true",success:"false"});
                                                                              }
                                                                              }else{
                                                                                private_key1 ='0x'+private_key2;
                                                                                console.log("*************private_key1 ",private_key1);
                                                                                account = web3.eth.accounts.privateKeyToAccount(private_key1);            
                                                                                if(!account){
                                                                                  console.log("inside account if 2")

                                                                                  res.send({fail:"true",success:"false"});
                                                                                }
                                                                              }
                                                                              
                                                                            //   if(account.address != wallet_address){
                                                                            //     console.log("inside account if 3")

                                                                            //     res.send({fail:"true",success:"false"});
                                                                            //   }
                                                                            //   else
                                                                            //   {
                                                                                console.log("inside account if 4")

                                                                                
                                                                           

                                                                                const user = contractABI;                       
                                                                              
                                                                                var contract =  new web3.eth.Contract(user,contractAddress);
                                                                                // var private_key1 = '0x97d17cf1e4852e681fd778aa95b046b6f47989fb63ede2e7348682d4e14af8e9'
                                                                                var private_key = private_key1.slice(2);
                                                                                var privateKey = Buffer.from(private_key, 'hex');

                                                                              await web3.eth.getTransactionCount(wallet_address).then( async function(v){
                                                                                            console.log("***********v ",v)    
                                                                                            if(k==0){
                                                                                              count = v;
                                                                                            }else if(count==v){
                                                                                              count = v+1;
                                                                                            }else{
                                                                                              count=v;
                                                                                            }             
                                                                                
                                                                                        console.log("*********count*********", count);
                                                                                          
                                                                            
                                                                                            var rawTransaction = {
                                                                                                "from": wallet_address,
                                                                                                "gasPrice": '0x0',
                                                                                                "gasLimit": web3.utils.toHex(4600000),
                                                                                                "to":contractAddress,                
                                                                                                "value": "0x0",
                                                                                                "data": contract.methods.addDocument(doc,verifier_email,client_email,doc_name,verifier_myReflect_code,client_myReflect_code,request_status,reason).encodeABI(),
                                                                                                "nonce": web3.utils.toHex(count)
                                                                                            }
                                                                            
                                                                                          console.log('rawTransaction : ',rawTransaction)
                                                                                            var transaction = new Tx(rawTransaction);
                                                                                            transaction.sign(privateKey);  
                                                                            
                                                                            
                                                                                          await web3.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'),(err,tx_hash)=>{
                                                                                              console.log("err ",err);
                                                                                              console.log("tx_hash ",tx_hash," request_file_id : ",request_file_id);
                                                                                              console.log("request_doc_id ",request_doc_id," version : ",version);  
                                                                                              RequestFilesModel.update({transaction_hash:tx_hash,docfile_status:"accept",reason:reason},{where:{ request_doc_id: request_doc_id,version:version} }).then(success =>{

                                                                                                console.log('request_file_id : ',request_file_id,"  ^^^^^^^^^^^^ transaction_hash :",tx_hash)
                                                                                                  //  res.redirect('/pen_request_view_client_info?request_id='+request_id);
                                                                                                  senddata()
                                                                                              }).catch(err =>{
                                                                                                console.log("**************err********* ", err);
                                                                                              })
                                                                                                
                                                                                            })
                                                                                        })
                                                                                        // count++;
                                                                              // }
                                                                                            
                                        }



                                             

														    });
																	            
																	            })
																	            .catch(err => {
																	                console.log('error',err);
																	            
																	            });
																	        
																	        });
                              })

                            })		  	

              }

                                         console.log("before await");

                                         

                                        console.log("After await");

          
          
          })

          })
         
      })
      k++;
})
  /*outer loop End*/

// setTimeout(senddata,20000);
 function senddata(){
   msg = `Your ${document_name} has been verified by ${ver_name}-${V_R_code}`;
          NotificationModel.create({
                                           notification_msg   :   msg,
                                           sender_id          :  user_id,
                                           receiver_id        :  client_id,
                                           request_id         :  request_id,
                                           notification_type  :   1,
                                           notification_date  : formatted,
                                           read_status        : "no"
                                          }).then(data=>{
                                            console.log("inside 3red")

                res.send({fail:"false",success:"true"});
         }).catch(err=>console.log("err1",err))
  
}

   })
  }) 
}

/**accept-request Post method End**/

/**reject-request Post method Start**/
exports.reject_request = async (req,res,next) =>{
       
  var request_id = req.body.request_id;
    var blob_url = req.body.blob_url;

  var private_key2 = req.body.private_key.trim();
  var private_key1;
  // var request_file_id = req.body.request_file_id;
   var msg;
   var document_name;
   let user_id = req.session.user_id;
   console.log("user_id",user_id);
   var client_id;
   var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');
  var V_R_code;
  var ver_name;

   var ver_reflect_id = req.body.ver_reflect_id;
   var client_reflect_id = req.body.client_reflect_id;
   console.log("ver_reflect_id------ ",ver_reflect_id);
  var request_status = 'rejected';
  var reason = req.body.reason;
   var request_doc_id = req.body.request_doc_id;
  await RequestDocumentsModel.update({approve_status:"rejected"},{where:{ request_doc_id: request_doc_id} }).then(async update_success =>{

     await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_request_documents_files.docfile_status='pending' AND tbl_request_documents_files.request_doc_id="+request_doc_id,{type:db.QueryTypes.SELECT}).then(async request_doc_data =>{
    let count=0;
  /*outer loop Start*/

    // for(var k=0;k<request_doc_data.length;k++){
      var k=0;
      var array_of_doc_hash   =  []
      var string_array_of_doc_hash
      async.each(request_doc_data,async function (content, cb) {

     
    console.log("*****request_doc_data****** ",content);
    
                  var self_assested = content.self_assested

      var doc = content.request_file_hash;
      var doc_name = content.document_name;
      document_name = content.document_name;
      var request_file_id = content.request_file_id;
      var request_doc_id = content.request_doc_id
      var version = content.version

  //  await db.query("SELECT * FROM tbl_files_docs INNER JOIN tbl_myreflectid_doc_rels ON tbl_files_docs.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id inner join tbl_documents_masters on tbl_documents_masters.doc_id=tbl_myreflectid_doc_rels.doc_id WHERE tbl_files_docs.file_id="+file_id,{ type:db.QueryTypes.SELECT}).then(async function(file_result){
  //     var doc = file_result[0].file_content;
  //     var doc_name = file_result[0].document_name;
  //     // console.log("file_result----------********------ ",file_result);
  //     var user_reflect_id = file_result[0].reflect_id;
      await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.deleted='0' AND tbl_wallet_reflectid_rels.reflect_id="+client_reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(client_data){
      // console.log("client_data----------********------ ",client_data);
           client_id = client_data[0].reg_user_id;
          var client_email = decrypt(client_data[0].email);
          var client_myReflect_code = client_data[0].reflect_code;
          
          await db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.deleted='0' AND tbl_wallet_reflectid_rels.reflect_id="+ver_reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_data){
            // console.log("verifier_data----------********------ ",verifier_data);
            var verifier_email = decrypt(verifier_data[0].email);
            var verifier_myReflect_code = verifier_data[0].reflect_code;
            var wallet_id = verifier_data[0].wallet_id;
            V_R_code = verifier_data[0].reflect_code;
            ver_name = decrypt(verifier_data[0].full_name);


             var verifier_name;

              if(verifier_data[0].entity_company_name)
              {
                          verifier_name = verifier_data[0].entity_company_name;
              }
              else  if(verifier_data[0].rep_firstname)
              {
                          verifier_name = verifier_data[0].rep_firstname;

              }
              else
              {
                            verifier_name = verifier_data[0].full_name;

              }
            await db.query("SELECT * FROM tbl_user_wallets WHERE deleted='0' AND wallet_id="+wallet_id,{ type:db.QueryTypes.SELECT}).then(async function(wallet_data){
            // console.log("wallet_data----------********------ ",wallet_data);




                 const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration))

                 var jimp_doc,srcImage,ipfs_width,ipfs_height;
                                                        console.log("before await 1",self_assested);
                                                        console.log("Doc-----2------ ",doc);

                                                         console.log("detail-----2------ ",doc,verifier_name,V_R_code);




                                                            async function wait_hash(){
                
                              //  if (self_assested==='yes') {

                                                         await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {

                                                               if (  !error && response.statusCode == 200  ) {    
                                                                                                                      
                                                                      srcImage = dataUriToBuffer(body);
                                                                    }


                                                   })
                                                        await delay(10000)


                                                      // }
                                            //  else
                                            //  {
                                                             
                                            //                     srcImage = `https://ipfs.io/ipfs/${doc}`

                                            //                      console.log("elseSSSSSSSSSSSSSSSSShello-----------1 ",srcImage);

                                            //  }  
                                            }     



                                            if ( content.doc_type == "image" ) {

                                              await wait_hash();
                                              await jimp_fun();
                                              
                                     } else {
                                                    array_of_doc_hash.push({doc_type:content.doc_type,hase:doc})
                                  
                                                if(array_of_doc_hash.length == request_doc_data.length){
                                                      console.log("inside render if")
                                                 string_array_of_doc_hash = array_of_doc_hash.toString()
                                                 await TransactionFunction(string_array_of_doc_hash)
                                                  
                                                }
                                                  async function TransactionFunction(string_array_of_doc_hash){
                                              

                                                    console.log("from ipfs self_attested_hash:file[0].hash text_img",string_array_of_doc_hash);
        
                                                    // jimp_doc = file[0].hash;
                                                    jimp_doc = string_array_of_doc_hash;
        
        
                                            console.log("jimp_doc ejs",doc);
                                                
        
                                                var doc = jimp_doc
                                                        
                                                        var doc = jimp_doc
                                                    console.log("ALLLLLLLLLLLLLLLLLLLLLLLLLL %$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ BLOCKCHAIN DATAAAAAAAAAAAAAAAAA");
                    
                                                    console.log("doc ejs",doc);
                    
                                                var wallet_address = wallet_data[0].wallet_address;
                                                //  var wallet_address='0x39c40B81acC1F06f3BDEb3A4fE36A8De9753313B';
                                                let account;
                                                var m = private_key2.indexOf("0x");
                                                if (m==0) {
                                                private_key1=private_key2
                                                account = web3.eth.accounts.privateKeyToAccount(private_key1);
                                                if(!account){
                                                res.send({fail:"true",success:"false"});
                                                }
                                                }else{
                                                private_key1 ='0x'+private_key2;
                                                console.log("*************private_key1 ",private_key1);
                                                account = web3.eth.accounts.privateKeyToAccount(private_key1);            
                                                if(!account){
                                                res.send({fail:"true",success:"false"});
                                                }
                                                }
                    
                                                if(account.address != wallet_address){
                                                res.send({fail:"true",success:"false"});
                                                }
                                                else
                                                {
                    
                                                var contractABI =[{"constant":true,"inputs":[],"name":"getDocumentsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"doc","type":"string"},{"name":"verifier_email","type":"string"},{"name":"client_email","type":"string"},{"name":"doc_name","type":"string"},{"name":"verifier_myReflect_code","type":"string"},{"name":"client_myReflect_code","type":"string"},{"name":"request_status","type":"string"},{"name":"reason","type":"string"}],"name":"addDocument","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getDocument","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"documents","outputs":[{"name":"doc","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}];
                    
                                                const user = contractABI;                       
                                                var contractAddress = '0xFd1d83E5959302Fb55b55F17533E931a4CE1cC83';
                                                var contract =  new web3.eth.Contract(user,contractAddress);
                                                // var private_key1 = '0x97d17cf1e4852e681fd778aa95b046b6f47989fb63ede2e7348682d4e14af8e9'
                                                var private_key = private_key1.slice(2);
                                                var privateKey = Buffer.from(private_key, 'hex');
                    
                                                await web3.eth.getTransactionCount(wallet_address).then( async function(v){
                                                        console.log("***********v ",v)    
                                                        if(k==0){
                                                            count = v;
                                                        }else if(count==v){
                                                            count = v+1;
                                                        }else{
                                                            count=v;
                                                        }             
                    
                                                    console.log("*********count*********", count);
                                                        
                    
                                                        var rawTransaction = {
                                                            "from": wallet_address,
                                                            "gasPrice": web3.utils.toHex(20 * 1e9),
                                                            "gasLimit": web3.utils.toHex(200000),
                                                            "to":contractAddress,                
                                                            "value": "0x0",
                                                            "data": contract.methods.addDocument(doc,verifier_email,client_email,doc_name,verifier_myReflect_code,client_myReflect_code,request_status,reason).encodeABI(),
                                                            "nonce": web3.utils.toHex(count)
                                                        }
                    
                                                        
                                                        var transaction = new Tx(rawTransaction);
                                                        transaction.sign(privateKey);  
                    
                    
                                                        await web3.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'),(err,tx_hash)=>{
                                                            console.log("err ",err);
                                                            console.log("tx_hash ",tx_hash);
                                                            RequestFilesModel.update({transaction_hash:tx_hash,docfile_status:"reject",reason:reason},{where:{ request_doc_id: request_doc_id,version:version} }).then(success =>{
                                                                //  res.redirect('/pen_request_view_client_info?request_id='+request_id);
                                                                
                                                            }).catch(err =>{
                                                            console.log("**************err********* ", err);
                                                            })
                                                            
                                                        })
                                                    })
                                                    // count++;
                                                }
                    
                    
                    
                                                  }
                               
                                     }
                                      
                  //  console.log("before await1");
                  //      await wait_hash();
   
                  console.log("After await1");
             async function jimp_fun()
              {
        
                   // let message_date = moment(new Date()).format("h:mm:ssa,ddd,MM-D-YYYY")
                      let message_date = moment(new Date()).format("ddd,MM-D-YYYY")
                      let message_time = moment(new Date()).format("h:mm:ssa")
                      var segImeg=blob_url.split(',')[1];
                      
            const buff = Buffer.from(segImeg,'base64');
            buff.toString();
        

            await Jimp.read(buff).then(async newimage => {

            



        await Jimp.read(srcImage).then(async image => {
          await newimage.resize(image.bitmap.width/4,image.bitmap.width/4);
          console.log(newimage.bitmap)
          let rejected_image =  await Jimp.read(__dirname+'/../../public/assets/images/rejected.jpg')
          await rejected_image.resize(image.bitmap.width/4,image.bitmap.width/4);
              await Jimp.create(image.bitmap.width ,((image.bitmap.height)+((image.bitmap.width/4)+30)),'#ffffff').then(async nova_new =>{

                               console.log("hello-----------3 3  ");


                Jimp.loadFont(Jimp.FONT_SANS_12_BLACK)
                  .then(async font => {

                            nova_new.print(
                                      font,
                                      (image.bitmap.width)-(image.bitmap.width/4),
                                      image.bitmap.height+10,
                                      verifier_name+'-'+V_R_code,
                                      5,
                                      (err, nova_new, { x, y }) => {
                                        nova_new.print(font, x, y , message_date, 5,
                                                      (err, nova_new, { x, y }) => {
                                                                  nova_new.print(font, x, y , message_time, 5,);
                                                    });
                                      }
                            );

                      //  text_name_code.print(font, x,y,   verifier_name)
                           
 
                      //  text_date.print(font, x, y + 20,message_date  , 50);
              

                                                 console.log("hello-----------3 4  ");
                                              nova_new.composite(image,0,0)
                                              nova_new.composite(newimage,(image.bitmap.width)-(image.bitmap.width/4),image.bitmap.height);
                                              nova_new.composite(rejected_image,0,image.bitmap.height);

                                              // nova_new.composite(image,0,text_height)
                                              // nova_new.composite(newimage,0,0);


                                      console.log("hello-----------55   ");

                      
                                  let text_img = nova_new.getBase64Async(Jimp.MIME_PNG);
                      
                                  console.log("hello-----------3 ");
                      
                                  text_img.then(result => {
                                     
                                      let testBuffer = new Buffer(result);

                                          ipfs.files.add(testBuffer,async function (err, file) {

                                            console.log("from ipfs ",file);

                                              if (err) {

                                                          

                                              } else  { 

                                                    array_of_doc_hash.push({doc_type:content.doc_type,hase:file[0].hash})

                                                    if(array_of_doc_hash.length == request_doc_data.length){

                                                            string_array_of_doc_hash = array_of_doc_hash.toString()
                                                            await TransactionFunction(string_array_of_doc_hash)
                                                      
                                                    }

                                              }
                                                                
                                              await delay(10000)

                                                          
                                          })
                                          async function TransactionFunction(string_array_of_doc_hash){
                                            

                                            console.log("from ipfs self_attested_hash:file[0].hash text_img",string_array_of_doc_hash);

                                            // jimp_doc = file[0].hash;
                                            jimp_doc = string_array_of_doc_hash;


                                    console.log("jimp_doc ejs",doc);
                                        

                                        var doc = jimp_doc
                                                
                                                var doc = jimp_doc
                                            console.log("ALLLLLLLLLLLLLLLLLLLLLLLLLL %$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ BLOCKCHAIN DATAAAAAAAAAAAAAAAAA");
            
                                            console.log("doc ejs",doc);
            
                                        var wallet_address = wallet_data[0].wallet_address;
                                        //  var wallet_address='0x39c40B81acC1F06f3BDEb3A4fE36A8De9753313B';
                                        let account;
                                        var m = private_key2.indexOf("0x");
                                        if (m==0) {
                                        private_key1=private_key2
                                        account = web3.eth.accounts.privateKeyToAccount(private_key1);
                                        if(!account){
                                        res.send({fail:"true",success:"false"});
                                        }
                                        }else{
                                        private_key1 ='0x'+private_key2;
                                        console.log("*************private_key1 ",private_key1);
                                        account = web3.eth.accounts.privateKeyToAccount(private_key1);            
                                        if(!account){
                                        res.send({fail:"true",success:"false"});
                                        }
                                        }
            
                                        if(account.address != wallet_address){
                                        res.send({fail:"true",success:"false"});
                                        }
                                        else
                                        {
            
                                        var contractABI =[{"constant":true,"inputs":[],"name":"getDocumentsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"doc","type":"string"},{"name":"verifier_email","type":"string"},{"name":"client_email","type":"string"},{"name":"doc_name","type":"string"},{"name":"verifier_myReflect_code","type":"string"},{"name":"client_myReflect_code","type":"string"},{"name":"request_status","type":"string"},{"name":"reason","type":"string"}],"name":"addDocument","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getDocument","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"documents","outputs":[{"name":"doc","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}];
            
                                        const user = contractABI;                       
                                        var contractAddress = '0xFd1d83E5959302Fb55b55F17533E931a4CE1cC83';
                                        var contract =  new web3.eth.Contract(user,contractAddress);
                                        // var private_key1 = '0x97d17cf1e4852e681fd778aa95b046b6f47989fb63ede2e7348682d4e14af8e9'
                                        var private_key = private_key1.slice(2);
                                        var privateKey = Buffer.from(private_key, 'hex');
            
                                        await web3.eth.getTransactionCount(wallet_address).then( async function(v){
                                                console.log("***********v ",v)    
                                                if(k==0){
                                                    count = v;
                                                }else if(count==v){
                                                    count = v+1;
                                                }else{
                                                    count=v;
                                                }             
            
                                            console.log("*********count*********", count);
                                                
            
                                                var rawTransaction = {
                                                    "from": wallet_address,
                                                    "gasPrice": web3.utils.toHex(20 * 1e9),
                                                    "gasLimit": web3.utils.toHex(200000),
                                                    "to":contractAddress,                
                                                    "value": "0x0",
                                                    "data": contract.methods.addDocument(doc,verifier_email,client_email,doc_name,verifier_myReflect_code,client_myReflect_code,request_status,reason).encodeABI(),
                                                    "nonce": web3.utils.toHex(count)
                                                }
            
                                                
                                                var transaction = new Tx(rawTransaction);
                                                transaction.sign(privateKey);  
            
            
                                                await web3.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'),(err,tx_hash)=>{
                                                    console.log("err ",err);
                                                    console.log("tx_hash ",tx_hash);
                                                    RequestFilesModel.update({transaction_hash:tx_hash,docfile_status:"reject",reason:reason},{where:{ request_doc_id: request_doc_id,version:version} }).then(success =>{
                                                        //  res.redirect('/pen_request_view_client_info?request_id='+request_id);
                                                        
                                                    }).catch(err =>{
                                                    console.log("**************err********* ", err);
                                                    })
                                                    
                                                })
                                            })
                                            // count++;
                                        }
            
            
            
            }

                                   });
                                              
                     })
                      .catch(err => {
                                                  console.log('error',err);
                                              
                       });
                                          
                       });
                              })

                            })        

              }

                                         console.log("before await");

                                         await jimp_fun();

                                        console.log("After await",jimp_doc);

          
          
          })

          })
         
      })
      k++;
})
  /*outer loop End*/

setTimeout(senddata,20000);
async function senddata(){
   msg = `Your ${document_name} has been rejected by ${ver_name}-${V_R_code}`;
         await NotificationModel.create({
                                           notification_msg   :   msg,
                                           sender_id          :  user_id,
                                           receiver_id        :  client_id,
                                           request_id         :  request_id,
                                           notification_type  :   1,
                                           notification_date  : formatted,
                                           read_status        : "no"
                                          }).then(data=>{
                                            console.log("inside 3red")

                res.send({fail:"false",success:"true"});
         }).catch(err=>console.log("err1",err))
  
}

   })
  }) 
}
/**reject-request Post method End**/

/**ver_req_doc get method Start**/

exports.ver_req_doc = async (req,res,next) =>{
  var request_id = req.query.request_id;
  // console.log("request_id",request_id);
  await db.query('SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_verifier_request_categories ON tbl_client_verification_requests.sub_category_id=tbl_verifier_request_categories.category_id WHERE tbl_client_verification_requests.request_id='+request_id,{type:db.QueryTypes.SELECT}).then(async sub_request_data =>{
    var parent_cat = sub_request_data[0].p_category_id;
    // console.log("request_data****** ",sub_request_data);
    await db.query('SELECT * FROM tbl_verifier_request_categories WHERE category_id='+parent_cat,{type:db.QueryTypes.SELECT}).then(async parent_data =>{
      // console.log("parent_data****** ",parent_data);
      await db.query('SELECT * FROM tbl_request_documents INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id='+request_id,{type:db.QueryTypes.SELECT}).then(async doc_data =>{
      console.log("doc_data****** ",doc_data);
      await db.query('SELECT * from tbl_documents_masters where document_type="master" AND deleted="0" AND status="active" AND tbl_documents_masters.doc_id NOT IN (SELECT doc_id from tbl_category_documents)',{type:db.QueryTypes.SELECT}).then(async drop_down_doc_data =>{
      console.log("drop_down_doc_data****** ",drop_down_doc_data);


          res.render("front/user-on-boarding-request/request-document",{
            session:req.session,
            sub_request_data,
            parent_data,
            doc_data,
            drop_down_doc_data
          });
      })

      })
      
    })
    
  }).catch(err =>{
    console.log("err",err);
  })
  
}
/**ver_req_doc get method END**/

/**add_new_cat_doc post method start**/

exports.add_new_cat_doc = async (req,res,next) =>{
  console.log("req*************1234");
  console.log("req.files**********(((((((((((***");
  const form = new formidable.IncomingForm();
  var doc_file;
  var doc_id;
  var descriptions;
  var category_id;
  var request_id;
  var reg_user_id = req.session.user_id
  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');

    form.parse(req, async (err, fields, files) => {
      // console.log("fillllllllllleeeeeeessssssssss ",files.image);
       doc_id = fields.doc_id;
       descriptions = fields.description;
       category_id = fields.category_id;
       request_id = fields.request_id;
       console.log("doc_id ",doc_id);
       console.log("descriptions ",descriptions);
       console.log("category_id ",category_id);
       console.log("request_id ",request_id);
       if(!files.image && files.image==undefined){
        await CategoryDocument.create({doc_id:doc_id,descriptions:descriptions,reg_user_id:req.session.user_id}).then(async doc =>{
          console.log("doc reg_user_id",doc,reg_user_id);
          await ManageCategoryDocument.create({category_doc_id:doc.category_doc_id,category_id:category_id,include:'yes'}).then(async manage_cat =>{
            await verifierRequestModel.create({request_id:request_id,category_doc_id:doc.category_doc_id}).then(async ver_req =>{
              // console.log("*****************manage_cat**********",manage_cat);
              await db.query('SELECT * FROM tbl_manage_category_documents INNER JOIN tbl_category_documents ON tbl_manage_category_documents.category_doc_id=tbl_category_documents.category_doc_id INNER JOIN tbl_documents_masters ON tbl_category_documents.doc_id=tbl_documents_masters.doc_id WHERE tbl_manage_category_documents.manage_doc_id='+manage_cat.manage_doc_id,{type:db.QueryTypes.SELECT}).then(async final_doc =>{
              // console.log("final_doc**********",final_doc);
              await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_client_verification_requests.request_id="+request_id,{type:db.QueryTypes.SELECT}).then(async reflectData =>{
                console.log("reflectData**********",reflectData);

              msg = `Verifier has requested for ${final_doc[0].document_name} for request ${reflectData[0].request_code}`;
              
              console.log("err1",msg)

              await NotificationModel.create({
                                                notification_msg   :   msg,
                                                sender_id          :  reg_user_id,
                                                receiver_id        :  reflectData[0].client_id,
                                                request_id         :  request_id,
                                                notification_type  :   9,
                                                notification_date  : formatted,
                                                read_status        : "no"
                                               }).then(data=>{
                                                 console.log("inside  notification ",data)
                                                 }).catch(err=>console.log("err1",err))

                  res.render('front/user-on-boarding-request/ajax_data',{session:req.session,final_doc});


              })
            })
          })
        })
                    
      })
       }
    })
    
        form.on('file', async function(field, file) {
          console.log(".........files.......",field)
      
         let testFile = fs.readFileSync(file.path);
       
         let testBuffer = new Buffer(testFile);
        
          await  ipfs.files.add(testBuffer,async function (err, file) {
            if (err) {
              console.log("err from ejs",err);
            }
              console.log('&&&&&&&&&&&&&&& ',file);
              doc_file=file[0].hash;
           
            await CategoryDocument.create({doc_id:doc_id,descriptions:descriptions,doc_file:doc_file,reg_user_id:req.session.user_id}).then(async doc =>{
            console.log("doc ",doc);
            await ManageCategoryDocument.create({category_doc_id:doc.category_doc_id,category_id:category_id,include:'yes'}).then(async manage_cat =>{
              await verifierRequestModel.create({request_id:request_id,category_doc_id:doc.category_doc_id}).then(async ver_req =>{
                console.log("*****************manage_cat**********",manage_cat);
                await db.query('SELECT * FROM tbl_manage_category_documents INNER JOIN tbl_category_documents ON tbl_manage_category_documents.category_doc_id=tbl_category_documents.category_doc_id INNER JOIN tbl_documents_masters ON tbl_category_documents.doc_id=tbl_documents_masters.doc_id WHERE tbl_manage_category_documents.manage_doc_id='+manage_cat.manage_doc_id,{type:db.QueryTypes.SELECT}).then(async final_doc =>{
                console.log("final_doc**********",final_doc);
                await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_client_verification_requests.request_id="+request_id,{type:db.QueryTypes.SELECT}).then(async reflectData =>{
                  console.log("reflectData**********",reflectData);
  
                msg = `Verifier has requested for ${final_doc[0].document_name} for request ${reflectData[0].request_code}`;
                
                console.log("err1",msg)
  
                await NotificationModel.create({
                                                  notification_msg   :   msg,
                                                  sender_id          :  reg_user_id,
                                                  receiver_id        :  reflectData[0].client_id,
                                                  request_id         :  request_id,
                                                  notification_type  :   9,
                                                  notification_date  : formatted,
                                                  read_status        : "no"
                                                 }).then(data=>{
                                                   console.log("inside  notification ",data)
                                                   }).catch(err=>console.log("err1",err))
  
                    res.render('front/user-on-boarding-request/ajax_data',{session:req.session,final_doc});
  
  
                })
                    // res.render('front/user-on-boarding-request/ajax_data',{session:req.session,final_doc});
                })
              })
            })
            
                      
        })
      })
  });

}
/**add_new_cat_doc post method END**/

/**req_doc_to_client post method start**/

exports.req_doc_to_client = async (req,res,next) =>{
 var manage_doc_id = req.body.manage_doc_id;
 var self_certified = req.body.self_certified;
 var certified = req.body.certified; 
 var sign = req.body.sign; 
 var complete = req.body.complete; 
 var video_proof = req.body.video_proof; 
 await ManageCategoryDocument.update({self_certified:self_certified,certified:certified,sign:sign,complete:complete,video_proof:video_proof},{where:{manage_doc_id:manage_doc_id}}).then(success =>{
    console.log("succefully updated");
    res.send("success");
 })
}
/**req_doc_to_client post method END**/


/**request_update_perm post method START**/

exports.request_update_perm = async (req,res,next) =>{

  console.log("******************body************* ",req.body); //updatePrmRequestModel

  var request_id = req.body.request_id_s;
  var checked_column =  req.body.user_doc_id;

  var user_doc_id_array = checked_column.split(',');
  var reg_user_id = req.session.user_id

  var view_status,permission_msg;
  
  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');

  if(req.body.view){
    view_status=req.body.view;
    permission_msg = 'view';
  }else{
    view_status="no";
  }
  var download_status;
  if(req.body.download){
    download_status=req.body.view;

     permission_msg = permission_msg+',download';
  }else{
    download_status="no";
  }
  var certify_status;
  if(req.body.certify){
    certify_status=req.body.view;
    permission_msg = permission_msg+',certify';

  }else{
    certify_status="no";
  }
         console.log("***********success*********"," ",user_doc_id_array);

        console.log("***********success*********"," ",user_doc_id_array.length);

        
//**outer loop start
  for(var i=0;i<user_doc_id_array.length;i++){

    await db.query('SELECT * FROM tbl_request_documents WHERE request_id="'+request_id+'" AND user_doc_id='+user_doc_id_array[i],{type:db.QueryTypes.SELECT}).then(async final_doc =>{
      var version_count = final_doc[0].version_count;

      await updatePrmRequestModel.create({request_id:request_id,user_doc_id:user_doc_id_array[i],version_count:version_count,view_status:view_status,download_status:download_status,certify_status:certify_status}).then(async success_result =>{

        console.log("***********success*********",i," ",user_doc_id_array.length);
        
               await db.query('SELECT * FROM `tbl_myreflectid_doc_rels` inner join tbl_documents_masters on tbl_documents_masters.doc_id = tbl_myreflectid_doc_rels.doc_id  WHERE `user_doc_id` = '+final_doc[0].user_doc_id+' ORDER BY user_doc_id desc',{type:db.QueryTypes.SELECT}).then(async doc_data =>{

                    console.log("***********doc_data*********",permission_msg," ",doc_data);

                        await db.query(`SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_client_verification_requests.request_id=`+request_id,{type:db.QueryTypes.SELECT}).then(async reflectData =>{

                             msg = `Verifier  requested  permissions ${permission_msg} for ${doc_data[0].document_name} in this request code ${reflectData[0].request_code}`;

                                  await NotificationModel.create({
                                                                    notification_msg   :   msg,
                                                                    sender_id          :  reg_user_id,
                                                                    receiver_id        :  reflectData[0].client_id,
                                                                    request_id         :  request_id,
                                                                    notification_type  :   9,
                                                                    notification_date  : formatted,
                                                                    read_status        : "no"
                                                                   }).then(data=>{
                                                                     console.log("inside 3red",data)
                                                                     }).catch(err=>console.log("err1",err))

                                          if(i==(user_doc_id_array.length-1)){
                                            res.redirect(`/ver-req-doc?request_id=${request_id}`);
                                          }
              })
         })
      })
    })
  }
//**outer loop END

}
/**request_update_perm post method END**/

exports.request_on_boarding_filter = async(req,res,next)=>{
  var userId =req.session.user_id 

 //  var reflect_code_list=[]
 //  var filterArray =[]
 var reflect_code_list=JSON.parse(req.body.reflect_code_list);

 // var userId =req.session.user_id 

db.query('SELECT * ,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name ,tbl_client_verification_requests.createdAt as request_createdAt FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id  WHERE tbl_client_verification_requests.verifier_id="'+userId+'" AND tbl_client_verification_requests.deleted="0" AND tbl_client_verification_requests.request_status="pending" AND tbl_wallet_reflectid_rels.reflect_code IN ('+reflect_code_list+')',{type:db.QueryTypes.SELECT}).then(RequsetOnBoardingPending=>{

           db.query('SELECT *,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name ,tbl_client_verification_requests.createdAt as request_createdAt FROM `tbl_sub_verifier_clients` INNER JOIN tbl_client_verification_requests ON tbl_client_verification_requests.request_id=tbl_sub_verifier_clients.client_request_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id WHERE tbl_sub_verifier_clients.sub_verifier_reg_id="'+userId+'" AND tbl_sub_verifier_clients.deleted="0" AND tbl_sub_verifier_clients.sub_client_status="active" AND tbl_client_verification_requests.deleted="0" AND tbl_client_verification_requests.request_status="pending" AND tbl_wallet_reflectid_rels.reflect_code IN ('+reflect_code_list+')',{type:db.QueryTypes.SELECT}).then(subverifierAssignClient=>{

                    for (let i = 0; i < subverifierAssignClient.length; i++) {
                          
                                 RequsetOnBoardingPending.push(subverifierAssignClient[i])
                           
                      }
         
                       res.render('front/user-on-boarding-request/boardingRequestPendingFilter.ejs',{
                                                                               //   RequsetOnBoardingACCEPT,
                                                                                  RequsetOnBoardingPending,
                                                                                  session : req.session,
                                                                                   //ClientVerificationModelData :requestarray,
                                                                                  moment
                      })
            }) 

  })
 

}

/**Remove requests post method START**/

exports.remove_requests = async (req,res,next) =>{
  var requests = JSON.parse(req.body.request_id_list);
  console.log("**************requests************** ",requests);
  for(var i=0;i<requests.length;i++){
    await ClientVerificationModel.update({removed_request:"yes"},{where:{request_id:requests[i]}}).then(success =>{
      console.log("succefully updated");
     
   })
  }
  res.send("success");
  }
  /**Remove requests post method END**/

  /**invite_client_by_refletid post method START**/

exports.invite_client_by_refletid = async (req,res,next) =>{
  var userId =req.session.user_id 
  var {sender_reflect_id,receiver_reflect_id,message} = req.body
  // var  = req.body.receiver_reflect_id 
  // var  =req.body.message 

  console.log("succefully client_reflect_id : ",sender_reflect_id);
  console.log("succefully verifier_reflect_id : ",receiver_reflect_id);
  console.log("succefully message: ",message);
  console.log("succefully message: ",req.body);

  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');


       await   InviteClientVerifierModel.create({sender_reflect_id:sender_reflect_id,receiver_reflect_id:receiver_reflect_id,descriptions:message,create_reg_user_id:userId,createdAt:formatted,updatedAt:formatted}).then(async data =>{


        await  db.query("SELECT * FROM `tbl_user_registrations` inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id where reflect_id="+receiver_reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(receiver_result){

          await db.query("SELECT * FROM `tbl_user_registrations` inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id where tbl_wallet_reflectid_rels.reg_user_id="+userId+" and tbl_wallet_reflectid_rels.reflect_id="+sender_reflect_id,{ type:db.QueryTypes.SELECT}).then(function( sender_result){


      var client_name,verifier_name;

      if(sender_result[0].rep_firstname){
        client_name = sender_result[0].rep_firstname
      }
      else if(sender_result[0].entity_company_name){
        client_name = sender_result[0].entity_company_name
           
      }
      else{
        client_name = sender_result[0].full_name

      }

      if(receiver_result[0].rep_firstname){
        verifier_name = receiver_result[0].rep_firstname
      }
      else if(receiver_result[0].entity_company_name){
        verifier_name = receiver_result[0].entity_company_name
           
      }
      else{
        verifier_name = receiver_result[0].full_name

      }

      var invitation_for  = (req.session.user_type == "client") ?'Verifier':'Client';

                console.log("invitation_for : ",invitation_for)
      
      var sender_reflet_code = sender_result[0].reflect_code
      var receiver_reflet_code = receiver_result[0].reflect_code

      var sender_name = decrypt(sender_result[0].full_name)
      var receiver_name =  decrypt(receiver_result[0].full_name)


    var smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'info.myreflet@gmail.com',
          pass: 'myquest321'
      }
    });
    const mailOptions = {
      to: decrypt(receiver_result[0].email),
      from: 'questtestmail@gmail.com',
      subject: `MyReflet Invitation for ${invitation_for}.`,

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
              <img src="http://${req.headers.host}/assets/images/logo-white.png" style="width: 120px;">
            </div>
            <div style="padding: 30px;line-height: 32px; text-align: justify;">
              <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${receiver_name},</h4>
              <p>You got a invitation from ${client_name} - ${sender_reflet_code} on  ${verifier_name} - ${receiver_reflet_code} reflet code.</p>
              <p>${message}</p>

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
          
          
              if(req.session.user_type == "client"){

                req.flash('success_msg', 'Your Entry successfully added!');
                res.redirect("/verifier_list")
                 
              }else{

                req.flash('success_msg', 'Your Entry successfully added!');
                res.redirect("/request_on_boarding")

              }
          });
        })
      })
    })
  }
  /**invite_client_by_refletid post method END**/