var {UserModel,LogDetailsModel}=require('../../models/user');
var {KycModel}=require('../../models/kyc-verification');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel,FilesDocModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var { tbl_verifier_plan_master,tbl_verifier_doc_list} = require('../../models/admin');
var { tbl_verfier_purchase_details } =require("../../models/purchase_detaile")
var { tbl_address_book } =require("../../models/address_book")
var {NotificationModel}=require('../../models/notification');
var { CryptoWalletModel}=require('../../models/crypto_wallet');
const {DigitalWalletRelsModel}=require('../../models/wallet_digital_rels');
const {CryptoTransHistoryModel}=require('../../models/crypto_transaction_his');
const {DocumentTransactionModel}=require('../../models/document_trans_his');
const {pushnotification,updateNotification,btcbalance}=require('../apies/helper');
//btc wallet details
var bitcoin = require("bitcoinjs-lib");
const TESTNET = bitcoin.networks.testnet;
const MAINNET = bitcoin.networks.bitcoin;
//btc wallet details end
//..............................................
//eth wallet detaisl
const Tx = require('ethereumjs-tx')
let priceOfCrypto = require('crypto-price');
const Web3 = require('web3');
var EthUtil = require('ethereumjs-util');
var bip39 = require('bip39');
let eth_wallet=require('ethereumjs-wallet');
const { hdkey } = require('ethereumjs-wallet');
var etherHDkey=hdkey;
const web3jsAcc = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/fa42c8837a7b4155ba2ab5ba6fac9bd1"));


//eth end

var {
  MarketPlaceMsg
}=require('../../models/market_place')
const paginate = require("paginate-array");

var { decrypt, encrypt,encrypt1,decrypt1 } = require('../../helpers/encrypt-decrypt')

var qr_func=require('../../helpers/qrcode');
var QRCode = require('qrcode');

const Op = require('sequelize').Op
var stb = require("satoshi-bitcoin");

// var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/eda1216d6a374b3b861bf65556944cdb"));
// var web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/f8a10cc5a2684f61b0de4bf632dd4f4b"));
//var web3 = new Web3(new Web3.providers.HttpProvider("http://13.233.173.250:8501"));
var web3 = new Web3(new Web3.providers.HttpProvider("http://128.199.31.153:8501"));

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
const ejs = require('ejs');
var axios = require('axios');

//28-02-2020
const ipfsAPI = require('ipfs-api');
const fs = require('fs');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})




exports.verifierDeshboard= async(req,res,next )=>{
  // console.log("check path   ",__dirname)
  // let testFile = fs.readFileSync(__dirname+'/../../uploads/documents/document_1582884940789_myw3schoolsimage.jpg');
  // let testBuffer = new Buffer(testFile);
  // ipfs.files.add(testBuffer, function (err, file) {
  //   if (err) {
  //     console.log("err from ejs",err);
  //   }
  //   console.log("from ipfs ",file)
  // })
    var page = req.query.page || 1
    var perPage = 10
    var userId =req.session.user_id 
  db.query('SELECT *  ,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name,tbl_client_verification_requests.createdAt as request_created FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id LEFT JOIN tbl_countries ON c.companyCountry=tbl_countries.country_id WHERE tbl_client_verification_requests.verifier_id="'+userId+'" AND tbl_client_verification_requests.deleted="0"',{type:db.QueryTypes.SELECT}).then(requestToverifier=>{

        db.query('SELECT * FROM tbl_user_registrations WHERE reg_user_id='+userId,{type:db.QueryTypes.SELECT}).then(userData=>{
          
                    db.query('SELECT *,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_sub_verifier_clients` INNER JOIN tbl_client_verification_requests ON tbl_client_verification_requests.request_id=tbl_sub_verifier_clients.client_request_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.reflect_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id WHERE tbl_sub_verifier_clients.sub_verifier_reg_id="'+userId+'" AND tbl_sub_verifier_clients.deleted="0" AND tbl_sub_verifier_clients.sub_client_status="active" AND tbl_client_verification_requests.deleted="0"',{type:db.QueryTypes.SELECT}).then(subverifierAssignClient=>{

                             for (let i = 0; i < subverifierAssignClient.length; i++) {
                                                      requestToverifier.push(subverifierAssignClient[i])
                                            
                              }
                                const requestarray1 = paginate(requestToverifier, page, perPage); 
                                res.render('front/dashboard-verifier/v-deshboard',{
                                                                                   session : req.session,decrypt,
                                                                                    requestToverifierData :requestarray1,
                                                                                    verifierMyReflectId:requestToverifier,
                                                                                     moment,
                                                                                     userData
                                 })
                  })
      })
  })
//   console.log("......................verifierDeshboard start.................................")
//   var page = req.query.page || 1
//   var perPage = 10
//     var userId =req.session.user_id 
//     // console.log("user idv ", userId)
//     var requestarray =[]

//     await  CountryModel.findAll({where:{status:"active"}}).then(async(countryData)=>{

   
 
//     await ClientVerificationModel.findAll({where:{verifier_id: userId,deleted:"0",verifier_deleted :"0" } }).then(async(data)=>{
//       if(data!="" && data.length>0 && data!=undefined){
//          var count =1
//        /*outer loop Start*/
//          for(var i=0; i<data.length ;i++){
//             count++

//             UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
//             MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
//             await MyReflectIdModel.findOne({where:{reflect_id:data[i].reflect_id} ,include: [UserModel]}).then(async(myRefdata)=>
//             {  
 
//                 UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
//                MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
//                await MyReflectIdModel.findOne({where:{reflect_id:data[i].verifer_my_reflect_id },include: [UserModel]}).then(async(v_myRefdata)=>
//             {
//              // console.log(v_myRefdata.tbl_user_registration)
 
//              // console.log(".......................................................")
//              // console.log(v_myRefdata.tbl_user_registration.dataValues)
//             //  var match_to_client_or_veri ;
//             //      if(data[i].verifier_id==userId){
//             //        match_to_client_or_veri=data[i].verifier_id
//             //      }else{
//                 //    match_to_client_or_veri=data[i].client_id
//                 //  }
 
//              await UserModel.findOne({where:{reg_user_id:data[i].client_id }}).then(async(userdata)=>{

//                 await UserModel.findOne({where:{reg_user_id:data[i].verifier_id }}).then(async(ver_userdata)=>{
                

//                 var obj ={
//                    ClientVerificationData : data[i].dataValues,
//                    MyReflectIData :myRefdata.dataValues,
//                    user : userdata.dataValues,
//                    verifer_my_reflect_id_Data : v_myRefdata,
//                    ver_userdata :ver_userdata
//                   }

//                   requestarray.push(obj)
//                 })
//              })
 
 
//             })
           
 
//             })
//          }
//         /*outer loop End*/

//         //  console.log("requestarray***************** ", requestarray)
//          const requestarray1 = paginate(requestarray, page, perPage);         
//          console.log("requestarray***************** ", requestarray1)
//          res.render('front/dashboard-verifier/v-deshboard',{
//           session : req.session,
//           ClientVerificationModelData :requestarray1,
//           ClientVerificationModelforfilter: requestarray,
//           countryData,
//           moment
//    })
//     }else{
//       res.render('front/myReflect/my-reflet-id-code-new',{
//         success_msg:"",
//         err_msg:"",
//         session:req.session,
//         ejs
//        }); 
//     }
//      }).catch(err=>console.log("errr",err))
    
//     }).catch(err=>console.log("errr countryData",err))
// // res.render('front/user-on-boarding-request/boarding-request',{session:req.session})

}

  /**request_status_change Get method Start**/
exports.RequestAcceptReject=async(req,res,next)=>{

   var status = req.query.status
  var user_id=  req.session.user_id 
  var request_id = req.query.request_id
  var dt = dateTime.create();
   var formatted = dt.format('Y-m-d H:M:S');
  //  var msg= `Your request has been ${status}ed by verifier.`
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
 var useradata =await UserModel.findOne({where:{reg_user_id:user_id}})
  await ClientVerificationModel.update({request_status:status}, { where: { request_id:request_id }}).then(async(result) =>{
       // console.log(result)
       
       ClientVerificationModel.findOne({where:{request_id:request_id}}).then(async(requestdata)=>{
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
            res.redirect("/verifier_deshboard")

          }).catch(err=>console.log("err",err))
       }).catch(err=>console.log("err",err))
 
   }).catch(err=>console.log("err",err))
}
/**request_status_change Get method End**/


exports.filter_requests= async(req,res,next )=>{
 
  console.log("......................verifierDeshboard start.................................")
  var page = req.query.page || 1
  var perPage = 10
  var userId =req.session.user_id 
  var searchvalue = req.body.searchvalue
   console.log("searchvalue...",searchvalue)
   var qre;
  if(searchvalue!=undefined)
                          {
                             qre='SELECT * ,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.client_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id LEFT JOIN tbl_countries ON c.entity_company_country=tbl_countries.country_id WHERE  (((tbl_client_verification_requests.verifier_id="'+userId+'") AND (tbl_client_verification_requests.deleted="0")) AND ( (tbl_user_registrations.email LIKE "%'+searchvalue+'%") OR (c.reflect_code LIKE "%'+searchvalue+'%") OR (tbl_wallet_reflectid_rels.reflect_code LIKE "%'+searchvalue+'%") OR (tbl_user_registrations.full_name LIKE "%'+searchvalue+'%") ))'

                                    subverfierClientUrl='SELECT *,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_sub_verifier_clients` INNER JOIN tbl_client_verification_requests ON tbl_client_verification_requests.request_id=tbl_sub_verifier_clients.client_request_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.client_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id WHERE  (((tbl_sub_verifier_clients.sub_verifier_reg_id="'+userId+'") AND (tbl_client_verification_requests.deleted="0") AND (tbl_sub_verifier_clients.sub_client_status="active") AND (tbl_sub_verifier_clients.deleted="0")) AND ( (tbl_user_registrations.email LIKE "%'+searchvalue+'%") OR (c.reflect_code LIKE "%'+searchvalue+'%") OR (tbl_wallet_reflectid_rels.reflect_code LIKE "%'+searchvalue+'%") OR (tbl_user_registrations.full_name LIKE "%'+searchvalue+'%")))'

                           }
       else{
             reflect_code_list =  JSON.parse(req.body.reflect_code_list);
             var status_list   = JSON.parse(req.body.status_list);
                   if(status_list[0]!=null && reflect_code_list[0]!=null)
                            {      
                                   qre= 'SELECT * ,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.client_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id LEFT JOIN tbl_countries ON c.entity_company_country=tbl_countries.country_id WHERE tbl_client_verification_requests.verifier_id="'+userId+'" AND tbl_client_verification_requests.deleted="0" AND tbl_wallet_reflectid_rels.reflect_code IN ('+reflect_code_list+') AND tbl_client_verification_requests.request_status IN ('+status_list+')'

                                   

                                                          subverfierClientUrl ='SELECT *,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_sub_verifier_clients` INNER JOIN tbl_client_verification_requests ON tbl_client_verification_requests.request_id=tbl_sub_verifier_clients.client_request_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.client_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id WHERE tbl_sub_verifier_clients.sub_verifier_reg_id="'+userId+'" AND tbl_sub_verifier_clients.deleted="0" AND tbl_sub_verifier_clients.sub_client_status="active" AND tbl_client_verification_requests.deleted="0" AND tbl_wallet_reflectid_rels.reflect_code IN ('+reflect_code_list+') AND tbl_client_verification_requests.request_status IN ('+status_list+')'
                             }
                       else{
         if(status_list[0]==null)
         {

             qre= 'SELECT * ,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.client_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id LEFT JOIN tbl_countries ON c.entity_company_country=tbl_countries.country_id WHERE tbl_client_verification_requests.verifier_id="'+userId+'" AND tbl_client_verification_requests.deleted="0" AND tbl_wallet_reflectid_rels.reflect_code IN ('+reflect_code_list+')'

                        subverfierClientUrl ='SELECT *,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_sub_verifier_clients` INNER JOIN tbl_client_verification_requests ON tbl_client_verification_requests.request_id=tbl_sub_verifier_clients.client_request_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.client_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id WHERE tbl_sub_verifier_clients.sub_verifier_reg_id="'+userId+'" AND tbl_sub_verifier_clients.deleted="0" AND tbl_sub_verifier_clients.sub_client_status="active" AND tbl_client_verification_requests.deleted="0" AND tbl_wallet_reflectid_rels.reflect_code IN ('+reflect_code_list+')'
  
         }
         if(reflect_code_list[0]==null)
          {
   
            qre= 'SELECT * ,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_client_verification_requests` INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.client_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id LEFT JOIN tbl_countries ON c.entity_company_country=tbl_countries.country_id WHERE tbl_client_verification_requests.verifier_id="'+userId+'" AND tbl_client_verification_requests.deleted="0" AND tbl_client_verification_requests.request_status IN ('+status_list+')'

                                  subverfierClientUrl ='SELECT *,tbl_wallet_reflectid_rels.reflect_code as v_r_code ,tbl_wallet_reflectid_rels.reflectid_by as v_reflectid_by,tbl_wallet_reflectid_rels.rep_username as v_rep_username,tbl_wallet_reflectid_rels.entity_company_name as v_entity_company_name FROM `tbl_sub_verifier_clients` INNER JOIN tbl_client_verification_requests ON tbl_client_verification_requests.request_id=tbl_sub_verifier_clients.client_request_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id INNER JOIN tbl_wallet_reflectid_rels as c ON c.reflect_id=tbl_client_verification_requests.client_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_client_verification_requests.client_id WHERE tbl_sub_verifier_clients.sub_verifier_reg_id="'+userId+'" AND tbl_sub_verifier_clients.deleted="0" AND tbl_sub_verifier_clients.sub_client_status="active" AND tbl_client_verification_requests.deleted="0" AND tbl_client_verification_requests.request_status IN ('+status_list+')'

          }

       }
           }



            db.query(qre,{type:db.QueryTypes.SELECT}).then(requestToverifier =>{
                 db.query(subverfierClientUrl,{type:db.QueryTypes.SELECT}).then(subverifierAssignClient=>{

                              for (let i = 0; i < subverifierAssignClient.length; i++) {
                                                                                        requestToverifier.push(subverifierAssignClient[i])
                                             
                               }
                                 const requestarray1 = paginate(requestToverifier, page, perPage); 
                                 res.render('front/dashboard-verifier/verifierDeshboardFilter',{
                                                                                                 session : req.session,
                                                                                                 requestToverifierData :requestarray1,decrypt,
                                                                                                //  verifierMyReflectId:requestToverifier,
                                                                                                 moment,
                                                                                                //  userData
                                  })
                   })                
              })
//      // console.log("user idv ", userId)
//      var requestarray =[]

 

//    var reflect_code_list=[]
//    var filterArray =[]

//    reflect_code_list =  JSON.parse(req.body.reflect_code_list);
//    var status_list   = JSON.parse(req.body.status_list);
//    console.log("status_list.",status_list)
//    var objStatus;
//    if(status_list[0]==null){

//     objStatus= {verifier_id: userId ,
//                 deleted:"0" ,
//                 verifier_deleted :"0"
//               }
   
//    }else{
//     objStatus= {verifier_id: userId,
//                 deleted:"0",
//                 verifier_deleted :"0",
//                request_status: {
//                            [Op.or]: status_list
//                          },
//                }
   
//      }

//    await  CountryModel.findAll({where:{status:"active"}}).then(async(countryData)=>{

//      await ClientVerificationModel.findAll({where: objStatus }).then(async(data)=>{
//           var count =1
//         /*outer loop Start*/
//           for(var i=0; i<data.length ;i++){
//              count++


//              UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
//              MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
//              await MyReflectIdModel.findOne({where:{reflect_id:data[i].reflect_id },include: [UserModel]}).then(async(myRefdata)=>
//              {  
 
//                  UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
//                 MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
//                 await MyReflectIdModel.findOne({where:{reflect_id:data[i].verifer_my_reflect_id },include: [UserModel]}).then(async(v_myRefdata)=>
//              {
            
 
//               await UserModel.findOne({where:{reg_user_id:data[i].client_id }}).then(async(userdata)=>{

//                  await UserModel.findOne({where:{reg_user_id:data[i].verifier_id }}).then(async(ver_userdata)=>{

//                  var obj ={
//                     ClientVerificationData : data[i].dataValues,
//                     MyReflectIData :myRefdata.dataValues,
//                     user : userdata.dataValues,
//                     verifer_my_reflect_id_Data : v_myRefdata,
//                     ver_userdata :ver_userdata,
//                     countryData
//                    }

//                    requestarray.push(obj)
//                  })
//               })
 
 
//              })
           
 
//              })


//           }
//          /*outer loop End*/
        
//            /*loop-2 Start*/
//            var testCount = reflect_code_list.length
//           //  console.log("length...",testCount)
//            if(reflect_code_list[0]!=null){
//             for(var j=0; j<reflect_code_list.length ;j++)
//             {
//                   /*loop-3 Start*/
//                                  testCount--
//                          for(var k=0; k<requestarray.length ;k++){   
                  
//                                  if(requestarray[k].MyReflectIData.reflect_code==reflect_code_list[j]){
//                                                                                                      filterArray.push(requestarray[k])
//                                                   }
           
                
//                                }
//                   /*loop-3 Start*/
//                   if(testCount==0){
//                      console.log("j length...",j)
//                     //  console.log("testCount...",testCount)
//                      const requestarray1 = paginate(filterArray, page, perPage);         
//                      console.log("requestarray1***************** ", requestarray1)
//                      res.render('front/dashboard-verifier/verifierDeshboardFilter',{
//                       session : req.session,
//                       ClientVerificationModelData :requestarray1,
//                       // ClientVerificationModelforfilter: requestarray,
//                       countryData,
//                       moment
//                })
//                     //  res.send(filterArray)
//                     }
           
//             }
//            }else{
//             const requestarray1 = paginate(requestarray, page, perPage);         
//              console.log("requestarray***************** ", requestarray1)
//              res.render('front/dashboard-verifier/verifierDeshboardFilter',{
//               session : req.session,
//               ClientVerificationModelData :requestarray1,
//               // ClientVerificationModelforfilter: requestarray,
//               countryData,
//               moment
//        })
//               //  res.send(requestarray)
//            }

//  /*loop-2 Start*/
 
//    //        res.render('front/dashboard-verifier/v-deshboard',{
//    //         session : req.session,
//    //         ClientVerificationModelData :requestarray,
//    //         moment
//    //  })
 
//       }).catch(err=>console.log("errr",err))



//    })

// res.render('front/user-on-boarding-request/boarding-request',{session:req.session})

}

   /**request_status_change Get method Start**/
exports.multipalRequestReject=async(req,res,next)=>{

   var status = req.body.status
  var user_id=  req.session.user_id 
  // var request_id = req.query.request_id
  var request_ids =  JSON.parse(req.body.request_ids);

  var dt = dateTime.create();
   var formatted = dt.format('Y-m-d H:M:S');
  //  var msg= `Your request has been ${status} by verifier.`
   var ntf_type ;
   var updateObj
   if(status=="accept"){
    
     ntf_type=2;
   }
   if(status=="reject"){
     ntf_type=3
   }
   if(status=="delete"){
    ntf_type=5
  }
  if(status=="delete"){
    updateObj={ verifier_deleted :"1"}
  }else{
    
        updateObj={request_status:status}
  }
 //  console.log("123......................<><><><<<>.........................................................")
 //  console.log(status)
 //  console.log(request_id)

 //  console.log(".............................<><><><.............................................")
 var useradata =await UserModel.findOne({where:{reg_user_id:user_id}})

for(var i=0; i<request_ids.length; i++){
  await ClientVerificationModel.update(updateObj, { where: { request_id:request_ids[i] }}).then(async(result) =>{
       // console.log(result)
       ClientVerificationModel.findOne({where:{request_id:request_ids[i]}}).then(async(requestdata)=>{
        var msg= `Your request has been ${status}ed by verifier ${decrypt(useradata.full_name)}-${requestdata.request_code}.`

         await NotificationModel.create({
           notification_msg   :   msg,
           sender_id          :  user_id,
           receiver_id        :  requestdata.client_id,
           request_id         :  request_ids[i],
           notification_type  :   ntf_type,
           notification_date  : formatted,
           read_status        : "no"
          }).then(data=>{
            res.redirect("/verifier_deshboard")

          }).catch(err=>console.log("err",err))
       }).catch(err=>console.log("err",err))
 
   }).catch(err=>console.log("err",err))
  }

  if((request_ids.length-1)==i){
    res.send("done")
  }
}
/**request_status_change Get method End**/


//btc balance
// const btcbalance=async function(address){
//   //  var address="mhJhQGa5gecXjBMSyGuhWTg1ZTAWSqjmCE";
//    // var data = JSON.stringify({ "address": address });
//     //console.log("param ", data)
    
//     var config = {
//       method: 'get',
//       url: `https://api.blockcypher.com/v1/btc/test3/addrs/${address}`,
//       headers: {
//        'Content-Type': 'application/json',
//       },
//     };
//     return axios(config)
//        .then(function (response) {
   
//        //  console.log("BBBBBBBBBBBBBBBBBBBBBBB",response);
//          let balance=response.data.balance;
//          let actuaLBtc=stb.toBitcoin(balance);
//          console.log("BBBBBBBBBBBBBBBBBBBBBBB",actuaLBtc);
//          return actuaLBtc;
//        }) 
//      }

//fetch transaction history page
exports.getTransactionHistoryForIndividual=async function(req,res){
  console.log("******************Transaction history page******************************************************");
  var user_type = req.session.user_type;
  var user_id=req.session.user_id;
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
  let wallet_address=decrypt(req.query.wallet_id);
  let wallet_type=decrypt(req.query.wallet_type);
  console.log("wallet addresss:",wallet_address);
  console.log("wallet_type:",wallet_type);
  try{
    if(wallet_type=='ethereum'||wallet_type.toLowerCase()=='btc'){
          let balance='';
          let reflet_id='';
         let crypto_info=await CryptoWalletModel.findOne({where:{wallet_address:encrypt1(wallet_address),reg_user_id:user_id}});
         if(crypto_info.reflet_code!=null){
          reflet_id=crypto_info.reflet_code;
         }
         if(wallet_type.toLowerCase()=='ethereum'){
          let balanceObj=await web3jsAcc.eth.getBalance(wallet_address);
              let balance_eth= web3jsAcc.utils.fromWei(balanceObj, "ether");
              balance_eth=parseFloat(balance_eth).toFixed(8);
              balance=balance_eth.toString();
              balance=balance+"ETH";
         }else if(wallet_type.toLowerCase()=='btc'){
           try{
          let btcBa= await btcbalance(wallet_address);
          console.log("Balance::::::::::::::",btcBa);
          btcBa=parseFloat(btcBa).toFixed(8);
          btcBa=btcBa.toString();
           balance=btcBa+"BTC";
           }catch(err){
             console.log(err);
           }
         }
         let public_key=decrypt1(crypto_info.public_key);
       let wallet_id=encrypt1(wallet_address);
       let trans_history=await CryptoTransHistoryModel.findAll({where:sequelize.and({reg_user_id:user_id},sequelize.or({sender_wallet_id:wallet_id},{receiver_wallet_id:wallet_id})),order: sequelize.literal('transaction_id DESC')});
         let cryptoTransArr=[];
       if(trans_history.length>0){
                for(let i=0;i<trans_history.length;i++){
                  let coinName='';
                  if(wallet_type=='ethereum'){
                    coinName='ETH'
                  }else{
                   coinName='BTC'
                  }
             if(trans_history[i].amountIndollar!=null){
               trans_history[i].amountIndollar= parseFloat(trans_history[i].amountIndollar).toFixed(8)+'$';
             }else{
               trans_history[i].amountIndollar='0'+'$';
             }
                 let amount=parseFloat(trans_history[i].amount).toFixed(8);
                 amount=amount.toString();
                   var formatted=''
                   var dt = dateTime.create(trans_history[i].createdAt);
                   formatted = dt.format('m/d/Y');
                    let transObj={
                    action:trans_history[i].action,
                    date:formatted,
                    amount:amount+coinName,
                    amountInDollar:trans_history[i].amountIndollar,
                    transaction_id:trans_history[i].transaction_id.toString(),
                    user_id:trans_history[i].reg_user_id,
                    operation:trans_history[i].operation,
                    status:trans_history[i].status,
                    wallet_type:wallet_type
                  }

                  cryptoTransArr[i]=transObj;
                }
                console.log("ready to render crypto history:",cryptoTransArr);
                res.render('front/transaction_history',{        
                  cryptoTransArr,
                  wallet_address,
                  wallet_type,
                  user_id,
                  public_key,
                  balance,
                  reflet_id,
                  success_msg,
                  err_msg,
                  encrypt
                  })
         }else{
          console.log("ready to render crypto history:",cryptoTransArr);
          res.render('front/transaction_history',{        
            cryptoTransArr,
            wallet_address,
            wallet_type,
            user_id,
            public_key,
            balance,
            reflet_id,
            success_msg,
            err_msg,
            encrypt
})
         }
     }else{
       let balance='0ETH';
       let reflet_id='';
       console.log("Walllllllll ",wallet_address);
            let digitalInfo=await DigitalWalletRelsModel.findOne({where:{dig_wallet_rel:wallet_address}});
            if(digitalInfo.parent_reflect_id!=null){
              reflet_id=digitalInfo.parent_reflect_id;
            }
            let public_key=digitalInfo.wallet_address;
            let docs_history=  await DocumentTransactionModel.findAll({where:sequelize.and({reg_user_id:user_id},sequelize.or({sender_wallet_pubKey:encrypt1(digitalInfo.wallet_address)},{receiver_wallet_pubKey:encrypt1(digitalInfo.wallet_address)})),order: sequelize.literal('transaction_id DESC')});
              console.log("Docs History",docs_history);
              var cryptoTransArr=[];
              if(docs_history.length>0){
                for(let i=0;i<docs_history.length;i++){
                 let file_det=await FilesDocModel.findOne({where:{file_id:docs_history[i].file_id}});
            let refDoc=await DocumentReflectIdModel.findOne({where:{user_doc_id:file_det.user_doc_id}});
               var formatted=''
               var dt = dateTime.create(docs_history[i].createdAt);
               formatted = dt.format('m/d/Y');
                let transObj={
                action:docs_history[i].action,
                date:formatted,
                amount:decrypt1(file_det.doc_name),
                amountInDollar:decrypt1(refDoc.doc_unique_code),
                transaction_id:docs_history[i].transaction_id.toString(),
                user_id:docs_history[i].reg_user_id,
                operation:docs_history[i].action,
                status:'success',
                wallet_type:wallet_type
              }
              cryptoTransArr[i]=transObj;
             }
             
         console.log("ready to render doc history:",cryptoTransArr);
             res.render('front/transaction_history',{        
              cryptoTransArr,
              wallet_address,
              wallet_type,
              user_id,
              public_key,
              balance,
              reflet_id,
              success_msg,
              err_msg,
              encrypt
  })
              }else{
                res.render('front/transaction_history',{        
                  cryptoTransArr,
                  wallet_address,
                  wallet_type,
                  user_id,
                  public_key,
                  balance,
                  reflet_id,
                  success_msg,
                  err_msg,
                  encrypt
      })
              }
           }     


  }catch(err){
    console.log(err);
    throw err;
  }
}

//get reciept transaction
exports.getTransactionRecieptForWallet=async function(req,res){
  let transaction_id=req.body.transaction_id;
  let wallet_type=req.body.wallet_type;
  try{
    if(wallet_type.toLowerCase()=='btc'||wallet_type.toLowerCase()=='ethereum'){
         let transHist=await CryptoTransHistoryModel.findOne({where:{transaction_id:transaction_id}});
       
       //  let receiver_info_wallet=await CryptoWalletModel({where:{wallet_address:transDet.receiver_wallet_id}});
      //   let sender_info_wallet=await CryptoWalletModel({where:{wallet_address:transDet.}})
          let rec_name=''
          let receiver_address='';
          let receiver_reflet_id='';
          let kyc_doc='';
          let document_sent='';

          if(transHist.operation=='sent'){
          if(transHist.receiver_reg_user_id!=null||transHist.receiver_reg_user_id!=''){
               console.log("recccccccccccc id ",transHist.receiver_reg_user_id);
               let rec_info=await UserModel.findOne({where:{reg_user_id:transHist.receiver_reg_user_id}});
                let rec_ref= await MyReflectIdModel.findOne({where:{reg_user_id:transHist.receiver_reg_user_id,reflectid_by:'representative',idCreated:'true'}});
                let kycDet=await KycModel.findOne({where:{reg_user_id:transHist.receiver_reg_user_id}});
                if(kycDet){
                  kyc_doc=decrypt1(kycDet.doc_name);
                }else{
                  kyc_doc="Not uploaded";
                }
                if(rec_info){
            rec_name=decrypt(rec_info.full_name);
            receiver_address=decrypt(rec_info.birthplace);
                }
                if(rec_ref){
            receiver_reflet_id=rec_ref.reflect_code;
                }
          }else{
            rec_name='Unknown'
          }
        }else{
          if(transHist.sender_reg_user_id!=null||transHist.sender_reg_user_id!=''){
            let rec_info=await UserModel.findOne({where:{reg_user_id:transHist.sender_reg_user_id}});
            let kycDet=await KycModel.findOne({where:{reg_user_id:transHist.sender_reg_user_id}});
            if(kycDet){
              kyc_doc=decrypt1(kycDet.doc_name);
            }else{
              kyc_doc="Not uploaded";
            }
           
            receiver_reflet_id=transHist.sender_reflet_id;
            receiver_address=decrypt(rec_info.birthplace);
            receiver_reflet_id=transHist.sender_reflet_id;
            rec_name=decrypt(rec_info.full_name);
          }else{
            rec_name='Unknown'
          }
          
        }
         var respObj={
          sender_wallet_addr:decrypt1(transHist.sender_wallet_id),
          receiver_wallet_addr:decrypt1(transHist.receiver_wallet_id),
          name:rec_name,
          address:receiver_address,
          reflet_id:receiver_reflet_id,
          transaction_hash:transHist.transaction_hash,
          amount:transHist.amount,
          amountInDollar:transHist.amountIndollar,
          date:'',
          time:'',
          operation:transHist.operation,
          document_sent:document_sent,
          address_proof:kyc_doc
        }
        if(transHist.amount==null){
          respObj.amount='0'
        }else{
          respObj.amount= parseFloat(respObj.amount).toFixed(8);
        }
        var dt = dateTime.create(transHist.createdAt);
        var formatted = dt.format('m/d/Y');
        var tim=dt.format('H:M:S');
        respObj.date=formatted;
        respObj.time=tim;
       let respo=JSON.stringify(respObj);
       res.end(respo);
      //  res.json({ status: 1, msg: "Doc receipt", data:respObj });
    }else{
        let transDet=await DocumentTransactionModel.findOne({where:{transaction_id:transaction_id}});
        let rec_name=''
        let receiver_address='';
        let receiver_reflet_id='';
        let kyc_doc='';
        let document_sent='';
        if(transDet.action=='shared'){
          console.log("RECCCCCCCCCCCCCCCCCCCC NAMEEEEEEEEEEE",transDet.receiver_name);
          if(transDet.receiver_name!=null){
            try{
            rec_name=decrypt(transDet.receiver_name);
            }catch(err){
              rec_name='';
              console.log(err);
            }
          }else{
            rec_name='';
          }
          
          receiver_address=decrypt1(transDet.receiver_birth_address);
          receiver_reflet_id= transDet.receiver_refletid;
          let kycDet=await KycModel.findOne({where:{reg_user_id:transDet.reg_user_id}});
          if(kycDet){
            kyc_doc=decrypt1(kycDet.doc_name);
            
          }else{
            kyc_doc="Not uploaded";
          }
          let file_det=await FilesDocModel.findOne({where:{file_id:transDet.file_id}});
          document_sent=decrypt1(file_det.doc_name);
        }else{
              let digi_send_info=await DigitalWalletRelsModel.findOne({where:{wallet_address:decrypt1(transDet.sender_wallet_pubKey)}});  
              
              let sender_user_id=digi_send_info.reg_user_id;
                  let ref_id_info=await MyReflectIdModel.findOne({where:{reg_user_id:sender_user_id,reflectid_by:'representative',idCreated:'true'}});
                  let sender_info=await UserModel.findOne({where:{reg_user_id:sender_user_id}});
                  rec_name=decrypt(sender_info.full_name);
                  receiver_address=decrypt(sender_info.birthplace);
                  receiver_reflet_id=ref_id_info.reflect_code;
                  let kycDet=await KycModel.findOne({where:{reg_user_id:transDet.reg_user_id}});
                  if(kycDet){
                    kyc_doc=decrypt1(kycDet.doc_name);
                    
                  }else{
                    kyc_doc="Not uploaded";
                  }
                 
                  let file_det=await FilesDocModel.findOne({where:{file_id:transDet.file_id}});
                  document_sent=decrypt1(file_det.doc_name);
            }
        var respObj2={
          sender_wallet_addr:decrypt1(transDet.sender_wallet_pubKey),
          receiver_wallet_addr:decrypt1(transDet.receiver_wallet_pubKey),
           name:rec_name,
           address:receiver_address,
          reflet_id:receiver_reflet_id,
          transaction_hash:decrypt1(transDet.transaction_hash),
          amount:transDet.amount,
          date:'',
          time:'',
          action:transDet.action,
          document_sent:document_sent,
          address_proof:kyc_doc,
          operation:transDet.action

        }
        if(transDet.amount==null){
          respObj2.amount='0'
        }else{
          respObj2.amount= parseFloat(respObj2.amount).toFixed(8);
        }
        var dt = dateTime.create(transDet.createdAt);
        var formatted = dt.format('m/d/Y');
        var tim=dt.format('H:M:S');
        respObj2.date=formatted;
        respObj2.time=tim;
        let respo2=JSON.stringify(respObj2);
       res.end(respo2);
        //res.json({ status: 1, msg: "Doc receipt", data:respObj2 });
      }
      
  }catch(err){
    console.log(err);
    //res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}



/***************
 * *******************************************client deshboard start****************************************************************************/
exports.clientDeshboard= async(req,res,next )=>{
  console.log("******************cleint dashboard start******************************************************");
  console.log("Helooooooooooooooooooooooooooooooooooooooooooooooooo");
  var user_type = req.session.user_type;
  var user_id=req.session.user_id;
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
 // var userId =req.session.user_id 
  var all_reflect_id=[]
  var msgArray=[]
    // var qr_url='data';
    try{
//       var accounts = await web3.eth.getAccounts();
// console.log("acccccccccccccccccccccccccccccccccccccccccccc:",accounts);
  if(user_id)
    {
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    var verifier_array=[]
    //let userDet=await UserModel.findOne({where:{reg_user_id:user_id}});  
    //  console.log("detttttttttttttttttttt",userDet);   
       try{
       var allCypto =await CryptoWalletModel.findAll({where:{reg_user_id:user_id},limit:10,order: sequelize.literal('wallet_id DESC')})
       }catch(err){
       // res.json({ status: 0, msg: "Something went wrong", data: { err_msg: 'Failed'} });
       console.log(err);
       }

    var cryptoWallet=[];
    if(allCypto.length>0){ 
      for(let i=0;i<allCypto.length;i++){
        let isLinked='yes'
        if(allCypto[i].reflet_code==null||allCypto[i].reflet_code==''){
          allCypto[i].reflet_code='';
          isLinked='no'
        }
             let cryptoObj={
               walletId:decrypt1(allCypto[i].wallet_address),
               balance:allCypto[i].balance.toString(),
               wallet_type:decrypt1(allCypto[i].wallet_type),
               walletAddress:decrypt1(allCypto[i].public_key),
               refletId:allCypto[i].reflet_code.toString(),
               isLinked:isLinked
             }
             if(decrypt1(allCypto[i].wallet_type).toLowerCase()=='ethereum'){
              let balanceObj=await web3jsAcc.eth.getBalance(cryptoObj.walletId);
              let balance_eth= web3jsAcc.utils.fromWei(balanceObj, "ether");
              balance_eth=parseFloat(balance_eth).toFixed(8);
              cryptoObj.balance=balance_eth.toString();
              cryptoObj.balance=cryptoObj.balance+"ETH";

            }else{
              try{
               let btcBa= await btcbalance(cryptoObj.walletId);
               console.log("Balance::::::::::::::",btcBa);
               btcBa=parseFloat(btcBa).toFixed(8);
               btcBa=btcBa.toString();
              cryptoObj.balance=btcBa;
              cryptoObj.balance=cryptoObj.balance+"BTC";
              }catch(err){
                console.log("errrr",err);
                //throw err;
                //res.json({ status: 0, msg: "Something went wrong", data: { err_msg: 'Failed'} });
              }
            }
             cryptoWallet[i]=cryptoObj
      }
     
      }

           res.render('front/dashboard_client/dashboard_client',{        
                                                                       cryptoWallet,
                                                                       encrypt,
                                                                       success_msg,
                                                                       err_msg
                                                                          // web3,
                                                                          //walletdetails,
                                                                        //  session:req.session,qr_func,decrypt,
                                                                        //  base64encode,
                                                                        //  ClientVerificationModelData :requestarray,
                                                                        //  verifiers_message_list:client_message_list,user_id,moment,verifier_array
                                                                         // msgArray
                                 })
                                        }      // }).catch(err=>{console.log("msg err",err)})
       
                                      else
                                            {
                                            res.redirect('/login');
                                           }
                                          }catch(err){
                                            console.log(err);
                                          }
                   
  
}
// exports.clientDeshboard= async(req,res,next )=>{
 
//   var user_type = req.session.user_type;
//   var user_id=req.session.user_id;
//   var userId =req.session.user_id 
//   var all_reflect_id=[]
//  var msgArray=[]
//     // var qr_url='data';
//     if(user_id)
//     {

//         var user_type=req.session.user_type;
//         // console.log("user type"+user_type); SELECT * FROM tbl_market_place_msgs WHERE 1
//       //  await MarketPlaceMsg.findAll({where:{sender_id:"user_id"}}).then( async(msgData)=>{

//       //     var filtered = msgData.reduce((filtered, item) => {
//       //       if( !filtered.some(filteredItem => JSON.stringify(filteredItem.receiver_id) == JSON.stringify(item.receiver_id)) )
//       //         filtered.push(item)
//       //       return filtered
//       //       }, [])

//       //       for(var f=0 ;f<filtered.length;f++){
//       //         MarketPlaceMsg.findAll({where:{receiver_id:filtered[f]}}).then(msgDatalast=>{
//       //           msgArray.push(msgDatalast[msgDatalast.length-1])
//       //         })
//       //       }

//           db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_wallets ON tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id inner join tbl_user_registrations on     tbl_user_registrations.reg_user_id=tbl_user_wallets.reg_user_id    WHERE  tbl_wallet_reflectid_rels.reg_user_id="+user_id+" and user_as='"+user_type+"'",{type:db.QueryTypes.SELECT}).then(async function(myreflectData){

//           if(myreflectData.length>0){
//             await db.query("select * from tbl_wallet_reflectid_rels inner join tbl_user_wallets ON tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id WHERE tbl_wallet_reflectid_rels.user_as='"+user_type+"' and tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(walletdetails){
     
//               /*Loop Start*/
//                for(var i=0; i<walletdetails.length; i++){
     
                
//                  // var testbell ;
//                     await  web3.eth.getBalance(walletdetails[i].wallet_address).then((res_bal)=>{ 
//                          //  console.log("js balcnce test" ,res_bal)
//                          //  testbell=res_bal
//                          walletdetails[i].wal_balan =  res_bal    
//                        });
                      
//                }
//               /*Loop End*/
//               var requestarray =[]
     
//               await ClientVerificationModel.findAll({where:{ [Op.or]: [{verifier_id: userId} , {client_id: userId} ]} }).then(async(data)=>{
//                    console.log(".......................................................")
//                    var count =1
//                    /*loop-1 Start*/
//                    for(var i=0; i<data.length ;i++){
//                       count++
//                       await MyReflectIdModel.findOne({where:{reflect_id:data[i].reflect_id }}).then(async(myRefdata)=>
//                       {  
           
//                           UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
//                          MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
//                          await MyReflectIdModel.findOne({where:{reflect_id:data[i].verifer_my_reflect_id },include: [UserModel]}).then(async(v_myRefdata)=>
//                       {
//                        // console.log(v_myRefdata.tbl_user_registration)
           
//                        // console.log(".......................................................")
//                        // console.log(v_myRefdata.tbl_user_registration.dataValues)
//                        var match_to_client_or_veri ;
//                            if(data[i].verifier_id==userId){
//                              match_to_client_or_veri=data[i].verifier_id
//                            }else{
//                              match_to_client_or_veri=data[i].client_id
//                            }
           
//                        await UserModel.findOne({where:{reg_user_id:match_to_client_or_veri }}).then(userdata=>{
//                           var obj ={
//                              ClientVerificationData : data[i].dataValues,
//                              MyReflectIData :myRefdata.dataValues,
//                              user : userdata.dataValues,
//                              verifer_my_reflect_id_Data : v_myRefdata
//                             }
//                             requestarray.push(obj)
                         
//                        })
           
           
//                       })
                     
           
//                       })
//                    }
//                    /*loop-1 End*/
           
//                    //console.log("user idvddsvdsvdsvdsvds<><> ", verifer_my_reflect_id_Data)
           
//                   //  console.log("msg msgData",msgData)
//                   //  console.log("msg filtered",filtered)

//                   //  console.log("msg data",msgArray)

//                    res.render('front/dashboard_client/dashboard_client',{ web3,walletdetails,
//                                                                          session:req.session,qr_func,
//                                                                          base64encode,
//                                                                          ClientVerificationModelData :requestarray,
//                                                                          myreflectData,
//                                                                          moment ,
//                                                                          msgArray
//                                                                        })
           
//                }).catch(err=>console.log("errr",err))
     
//                  // res.render('front/dashboard_client/dashboard_client',{ web3,walletdetails,session:req.session,qr_func,base64encode,ClientVerificationModelData :requestarray,
//                  //   moment })
//              });
//             }else{
//               res.render('front/myReflect/my-reflet-id-code-new',{
//                 success_msg:"",
//                 err_msg:"",
//                 session:req.session,
//                 ejs
//                }); 
//             }
//             })
//         // }).catch(err=>{console.log("msg err",err)})
       
//     }
//     else
//     {
//         res.redirect('/login');
//     }
// // res.render('front/dashboard_client/dashboard_client',{session:req.session})

// }

exports.client_deshboard_search = async (req ,res ,next) =>{

  var user_type      = req.session.user_type;
  var user_id        = req.session.user_id;
  var reflect_code   = req.body.reflect_code;
  var session        = req.session
  console.log("reflect_code>>>>>>>>>>>>>>>>>>>>>>",reflect_code)

  await db
  
  .query("select * from tbl_wallet_reflectid_rels inner join tbl_user_wallets ON tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id WHERE reflectid_by!='digitalWallet' and tbl_wallet_reflectid_rels.user_as='"+user_type+"' and tbl_wallet_reflectid_rels.reg_user_id="+user_id+" AND tbl_wallet_reflectid_rels.reflect_code LIKE '%"+reflect_code+"%'",{ type:db.QueryTypes.SELECT})
  
  .then(async function(walletdetails){
                                 
     
         
        for(var i=0; i<walletdetails.length; i++){

        await  web3.eth.getBalance(walletdetails[i].wallet_address)

        .then((res_bal)=>{ 
    
                           const etherValue           =  web3.utils.fromWei(res_bal, 'ether')

                           walletdetails[i].wal_balan =  etherValue    
        });

        }

        res.render("front/dashboard_client/ajax_client_deshboard_search",{
                                                                                session,
                                                                                walletdetails,
                                                                                base64encode,decrypt
        })

   })

}


//link wallets: show all reflet id for link
exports.showRefletForLink=async function(req,res){
    var user_id=req.session.user_id; 
    var user_type = req.session.user_type;
    var success_msg = req.flash('success_msg');
    var err_msg= req.flash('err_msg'); 
    var all_reflect_id=[]
    try{
        let allData=await MyReflectIdModel.findAll({where:{reg_user_id:user_id,idCreated:'true'}});
        if(allData.length>0){
           
              let k=0;
        for(let i=0;i<allData.length;i++){
           
            let walletInfo=await WalletModel.findOne({where:{wallet_id:allData[i].wallet_id}});
              let userDetails=await UserModel.findOne({where:{reg_user_id:user_id}});
               if(allData[i].reflectid_by=='representative'){
                let naturalPerson={
                    myreflectid:'',
                    walletname:'',
                    balance:0.0,
                    type:'representative',
                    walletAddress:'',
                    mobile:'',
                    level_name:""
                  };
                //  console.log(walletInfo);
                 naturalPerson.myreflectid=allData[i].reflect_code;
                 naturalPerson.walletname=decrypt(allData[i].rep_username);
                 naturalPerson.walletAddress=walletInfo.wallet_address;
                 naturalPerson.balance=walletInfo.balance.toString();
                 naturalPerson.mobile=decrypt(userDetails.mobile_number);
                 all_reflect_id.unshift(naturalPerson);

               }
               if(allData[i].reflectid_by=='entity'){
               //  console.log("Entity:::::::::",allData[i]);
            
                 let entityObj={
                   entity_company_name:'',
                   entity_name:'',
                   walletAddress:'',
                   balance:0,
                   myreflectid:'',
                   entity_company_regno:"",
                   entity_company_address:"",
                   mobile:'',
                   type:"entity",
                   level_name:''
                 }
               //  console.log("mobileeeeeeeeeeeeeee",allData[i].entity_company_phoneno);
                 entityObj.myreflectid=allData[i].reflect_code;
                 entityObj.entity_name=decrypt(allData[i].entity_name);
                 entityObj.walletAddress=walletInfo.wallet_address;
                 entityObj.entity_company_regno=decrypt(allData[i].entity_company_regno);
                 entityObj.entity_company_address=decrypt(allData[i].entity_company_address);   
                 entityObj.entity_name=decrypt(allData[i].entity_name);
                 entityObj.entity_company_name=decrypt(allData[i].entity_company_name);
                 entityObj.balance=walletInfo.balance.toString();
                entityObj.mobile=decrypt(allData[i].entity_company_phoneno);
                 all_reflect_id.push(entityObj);
                //  entity[k]=entityObj;
                //  k++;
                }
              }
            }
          
              res.render('front/dashboard_client/reflet-id-link',{
                all_reflect_id,
                success_msg,
                err_msg,
                encrypt
              });
         }catch(err){
           throw err;
         }
}


//get unlinked wallets
exports.getUnlinkedWallets=async function(req,res){
  let reflet_id=req.query.reflet_id;
  console.log("reflet iddddddddddddddd:",reflet_id);
  reflet_id=decrypt(reflet_id);
  console.log("derccccccccc",reflet_id);
  let user_id=req.session.user_id;
  var success_msg = req.flash('success_msg');
    var err_msg= req.flash('err_msg');
  try{
    let allDegitalsUnlink=await DigitalWalletRelsModel.findAll({where:{reg_user_id:user_id,status:'active',parent_reflect_id:null}})
    let allCryptoUnlink=await CryptoWalletModel.findAll({where:{reg_user_id:user_id,status:'active',reflet_code:null}})
   let wallets=[]; 
    if(allDegitalsUnlink.length>0||allCryptoUnlink.length>0){
      let k=0;
          if(allDegitalsUnlink.length>0){
            for(let i=0;i<allDegitalsUnlink.length;i++){
             if(allDegitalsUnlink[i].balance==null){
               allDegitalsUnlink[i].balance='0'
             }
                let walletObj={
                  walletAddress:allDegitalsUnlink[i].wallet_address,
                  balance:allDegitalsUnlink[i].balance.toString(),
                  refletid:'',
                  walletid:allDegitalsUnlink[i].dig_wallet_rel.toString(),
                  wallet_type:'digital',
                  name:allDegitalsUnlink[i].digital_type
                }
                wallets[k]=walletObj;
                k++;
            }
          }
          if(allCryptoUnlink.length>0){
           for(let i=0;i<allCryptoUnlink.length;i++){
            
               let walletObj={
                 walletAddress:decrypt1(allCryptoUnlink[i].public_key),
                 balance:'',
                 refletid:'',
                 walletid:decrypt1(allCryptoUnlink[i].wallet_address),
                 wallet_type:'crypto',
                 name:decrypt1(allCryptoUnlink[i].wallet_type)
               }
               if(decrypt1(allCryptoUnlink[i].wallet_type).toLowerCase()=='ethereum'){
                let balanceObj=await web3jsAcc.eth.getBalance(decrypt1(allCryptoUnlink[i].wallet_address));
                let balance_eth= web3jsAcc.utils.fromWei(balanceObj, "ether");
                balance_eth=parseFloat(balance_eth).toFixed(8);
                walletObj.balance=balance_eth.toString();
              }else{
                try{
                 let btcBa= await btcbalance(decrypt1(allCryptoUnlink[i].wallet_address));
                 btcBa=btcBa.toString();
                 walletObj.balance=btcBa;
               
                }catch(err){
                  walletObj.balance='0'
                  console.log(err);
                  //throw err;
                  //res.json({ status: 0, msg: "Something went wrong", data: { err_msg: 'Failed'} });
                }
              }
              
               wallets[k]=walletObj;
               k++;
           }
         }
        }
        res.render('front/dashboard_client/unlinekd-wallet',{
          success_msg,
          err_msg,
          reflet_id,
          wallets,
          encrypt
        })
  }catch(err){
    console.log(err);
    throw err;
  }
}


//reflet id linking with wallets
exports.linkingWallet=async function(req,res){
  console.log("linkinggggggg");
  let reflet_id=req.body.reflet_id;
  let wallet_address=req.body.wallet_address;
  let user_id=req.session.user_id;
  let wallet_type=req.body.wallet_type;//digital or crypto
  console.log("refletid:",reflet_id);
  console.log("wallet_address",wallet_address);
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
  try{

    if(reflet_id==''||wallet_address==''||wallet_type==''){
      req.flash('err_msg',`Please choose one of the listed wallet`);
      res.redirect('/get-unlinked-wallets');
    }else{
    if(wallet_type.toLowerCase()=='digital'){
 let digitalDet= await DigitalWalletRelsModel.findOne({where:{reg_user_id:user_id,wallet_address:wallet_address,status:'active'}});
            if(digitalDet.parent_reflect_id==null||digitalDet.parent_reflect_id==''){
 await DigitalWalletRelsModel.update({parent_reflect_id:reflet_id},{where:{reg_user_id:user_id,wallet_address:wallet_address,status:'active'}})
            //  res.json({ status: 1, msg: `Wallet linking done successfully with MyrefletId ${reflet_id}`, data: { success_msg: 'Success' } });
                req.flash('success_msg',`Wallet linking done successfully with MyrefletId ${reflet_id}`);
                res.redirect('/cilent_deshboard');
            }else{
              req.flash('err_msg',`Wallet is already linked with ${digitalDet.parent_reflect_id} MyRefletId`);
                res.redirect('/cilent_deshboard');
              //res.json({ status: 0, msg: `Wallet is already linked with ${digitalDet.parent_reflect_id} MyRefletId`, data: { err_msg: 'Failed' } });
            }
          }else{
           let cryptoWallet=await CryptoWalletModel.findOne({where:{reg_user_id:user_id,public_key:encrypt1(wallet_address),status:'active'}});
            if(cryptoWallet.reflet_code==null||cryptoWallet.reflet_code==''){
                       await CryptoWalletModel.update({reflet_code:reflet_id.toString()},{where:{reg_user_id:user_id,public_key:encrypt1(wallet_address)}});
                      // res.json({ status: 1, msg: `Wallet linking done successfully with MyrefletId ${reflet_id}`, data: { success_msg: 'Success' } });
                      req.flash('success_msg',`Wallet linking done successfully with MyrefletId ${reflet_id}`);
                       res.redirect('/cilent_deshboard');
                    }else{
                      req.flash('err_msg',`Wallet is already linked with ${digitalDet.parent_reflect_id} MyRefletId`);
                res.redirect('/cilent_deshboard');
             // res.json({ status: 0, msg: `Wallet is already linked with ${cryptoWallet.reflet_code} MyRefletId`, data: { err_msg: 'Failed' } });
            }
          }
        }
            }catch(err){
              console.log(err);
              req.flash('err_msg',`Something went worng`);
              res.redirect('/cilent_deshboard');
  }
}

//get method:fetch all wallets: crypto, digital both
exports.getAllWallets=async function(req,res){
  let user_id=req.session.user_id;
  try{
    try{
    var digitals=await DigitalWalletRelsModel.findAll({where:{reg_user_id:user_id,status:'active'},order: sequelize.literal('dig_wallet_rel DESC')});
    }catch(err){
      console.log(err);
    }
    let digitalArr=[];
    var cryptoWallet=[];
    let refletArr=[];
    if(digitals.length>0){
      let linkingStatus='';
           for(let i=0;i<digitals.length;i++){
               if(digitals[i].parent_reflect_id==null){
                 linkingStatus='no',
                 digitals[i].parent_reflect_id=''
               }else{
                 linkingStatus='yes'
               }
               if(digitals[i].balance==null){
                 digitals[i].balance='0'
               }

              let digitalObj={
                  walletAddress:digitals[i].wallet_address,
                  walletId:digitals[i].dig_wallet_rel.toString(),
                  balance:digitals[i].balance,
                  refletid:digitals[i].parent_reflect_id,
                  isLinked:linkingStatus,
                  wallet_type:digitals[i].digital_type,
                  wallet_name:''
              }
              digitalArr[i]=digitalObj;
            }
            }
              
            try{
              var allCypto =await CryptoWalletModel.findAll({where:{reg_user_id:user_id},order: sequelize.literal('wallet_id DESC')})
              }catch(err){
              // res.json({ status: 0, msg: "Something went wrong", data: { err_msg: 'Failed'} });
              console.log(err);
              }
           if(allCypto.length>0){ 
             for(let i=0;i<allCypto.length;i++){
               let isLinked='yes'
               if(allCypto[i].reflet_code==null||allCypto[i].reflet_code==''){
                 allCypto[i].reflet_code='';
                 isLinked='no'
               }
                    let cryptoObj={
                      walletId:decrypt1(allCypto[i].wallet_address),
                      balance:allCypto[i].balance.toString(),
                      wallet_type:decrypt1(allCypto[i].wallet_type),
                      walletAddress:decrypt1(allCypto[i].public_key),
                      refletid:allCypto[i].reflet_code.toString(),
                      isLinked:isLinked
                    }
                    if(decrypt1(allCypto[i].wallet_type).toLowerCase()=='ethereum'){
                     let balanceObj=await web3jsAcc.eth.getBalance(cryptoObj.walletId);
                     let balance_eth= web3jsAcc.utils.fromWei(balanceObj, "ether");
                     balance_eth=parseFloat(balance_eth).toFixed(8);
                     cryptoObj.balance=balance_eth.toString();
                     cryptoObj.balance=cryptoObj.balance+"ETH";
       
                   }else{
                     try{
                      let btcBa= await btcbalance(cryptoObj.walletId);
                      console.log("Balance::::::::::::::",btcBa);
                      btcBa=parseFloat(btcBa).toFixed(8);
                      btcBa=btcBa.toString();
                     cryptoObj.balance=btcBa;
                     cryptoObj.balance=cryptoObj.balance+"BTC";
                     }catch(err){
                       console.log("errrr",err);
                       //throw err;
                       //res.json({ status: 0, msg: "Something went wrong", data: { err_msg: 'Failed'} });
                     }
                   }
                    cryptoWallet[i]=cryptoObj
             }
            
             }

             refletArr=cryptoWallet.concat(digitalArr);

        res.render('front/dashboard_client/all-wallets',{
          digitalArr,
          cryptoWallet,
          refletArr,
          encrypt
        })
  }catch(err){
    console.log(err);

  }
}

//get method for page create wallet
exports.getCreateWallets=async function(req,res){
  try{
       res.render('front/dashboard_client/create-wallets');
  }catch(err){
    console.log(err);
  }
}


//get digital selection page that come after getCreateWallets (choose digital type )
exports.getDigitlWalletSelection=async function(req,res){
  success_msg = req.flash('success');
  err_msg= req.flash('err_msg'); 
  try{
    res.render('front/dashboard_client/digital-wallet-selection',{
      success_msg,
      err_msg
    });
  }catch(err){
    console.log(err);
    throw err;
  }
}


//get method for create crypto wallet selection
exports.getCryptoWalletSelection=async function(req,res){
  success_msg = req.flash('success');
  err_msg= req.flash('err_msg');
  try{
    res.render('front/dashboard_client/crypto-wallet-selection',{
      success_msg,
      err_msg
    });
  }catch(err){
    throw err;
  }
}

//get method for import wallet selection
exports.getImportWalletSelection=async function(req,res){
  success_msg = req.flash('success');
  err_msg= req.flash('err_msg');
  try{
    res.render('front/dashboard_client/import-wallet-selection',{
      success_msg,
      err_msg
    });
  }catch(err){
    throw err;
  }
}

//get method 

exports.getPublickeyPage=async function(req,res){
  let user_id=req.session.user_id;
  let wallet_address=req.session.digital_wallet;
  let segment=req.session.segment;
  success_msg = req.flash('success');
  err_msg= req.flash('err_msg'); 
  try{
    res.render('front/digital_wallet/backup-digital-address',{
      success_msg,
      err_msg,
      session:req.session,
      user_id:user_id,
      walletAddress:wallet_address,
      wallet_type:"Civic",
      segment:segment
    })
  }catch(err){
    throw err;
  }
}


//create digital wallets -generate public key
exports.generatePublicKeyForDigitalWallet=async function(req,res){
  try{
    let user_id=req.session.user_id;
    let digital_type=req.query.digital_type;
     success_msg = req.flash('success');
    err_msg= req.flash('err_msg'); 
   // let walletname=encrypt(req.body.wallet_name);  
    let passphrase = process.env.Passphrase;
   

  var user_account='';

      var options = {
      //  url: "http://13.232.156.125:8503",
         url:"http://139.59.83.232:8503",
        method: 'POST',
        headers:
        {
          "content-type": "application/json"
        },
        body: JSON.stringify({ "jsonrpc": "2.0", "method": "personal_newAccount", "params": [passphrase], "id": 1 })
      };
    
      
      let promise = new Promise( async (resolve ,reject) => { 
    
        await request(options, async function (error, response, body) {
        //  console.log("Bodyyyyyyyyyyyyyy:",body);
       
        // console.log('response..................................................  : ', response);
          if ( error ) reject();
            console.log('  first request@@@@@@@@@ ',body);
            var JSONbody = JSON.parse(body);
           console.log('Account - - - - - -',JSONbody);
            account1 = JSONbody.result;
            user_account=account1;
            console.log('Account - - - - - .......................................................................-', account1);
            resolve(account1)
        })
    
      })
      
    var account ;
      promise.then((data)=>{
        account=data
        user_account=data;
       getSegment(account)
      })
      .catch(err=>{
          console.log(err);
          req.flash('err_msg', 'Internal issue')
                res.redirect("/digital-wallet-selection");
      })
      //  let lastSegment="UTC--2021-05-14T04-41-39.136759192Z--24100e77a7389ec2bdd147732f04c99b4e6d79c7";
      async function getSegment(user_account){
      var options = {
        // url: "http://13.232.156.125:8503",
         url:"http://139.59.83.232:8503",
         method: 'POST',
         headers:
         {
           "content-type": "application/json"
         },
         body: JSON.stringify({ "jsonrpc": "2.0", "method": "personal_listWallets", "params": [], "id": 1 })
       };
   
       request(options, async function (error, response, body) {
         // console.log(body.result);
         // console.log(JSON.parse(body).result);
         if(error){
           console.log("opppppppppppppssssssssssssssss errr");
           req.flash('err_msg', 'Internal issue')
                res.redirect("/digital-wallet-selection");
         }
         console.log('-------------second request--------');
         var lastSegment;
   
         var c = JSON.parse(body).result;
         // console.log(c);
         c.forEach(function (element) {
           // console.log(element.accounts);
           var accounts_details = element.accounts;
           accounts_details.forEach(async function (element1) {
             // console.log(element1.address);
             let address = user_account.toLowerCase();
             if (element1.address === address) {
               // console.log(element1.url)
               var parts = element1.url.split('/');
               lastSegment = parts.pop() || parts.pop();
               
               console.log("lastSegment:::::::::::::::::::::::::",lastSegment);
               if(lastSegment&&user_account){
            
                let isCreated=await DigitalWalletRelsModel.create({
                  reg_user_id:user_id,
                  status:"inactive",
                  wallet_address:user_account,
                  balance:'0',
                  digital_type:digital_type
                }) ;
                
                if(isCreated){
                
                  // res.json({
                  //   status: 1, msg: "Successfully generated public key for digital wallet", data: {
                  //     walletAddress:user_account,
                  //     user_id:user_id,
                  //     segment:lastSegment
                  //   }
                  // });
                 
            
              
                    req.session.digital_wallet=user_account;
                    req.session.segment=lastSegment;
                    res.render('front/digital_wallet/backup-digital-address',{
                      success_msg,
                      err_msg,
                      session:req.session,
                      user_id:user_id,
                      walletAddress:user_account,
                      wallet_type:"Civic",
                      segment:lastSegment
                    })
                   
                }else{
                  req.flash('err_msg', 'Failed to create Digital wallet')
                         res.redirect("/digital-wallet-selection");
                }
                
               }
             }
           })
         })
           
       })
      }
  }catch(err){
    console.log(err);
    throw err;
  }
}


//generate pvt key for digital wallets
exports.generatePvtKeyForDigitalWallet=async function(req,res){
  try{
    let lastSegment=req.body.segment;
    let wallet_address=req.body.wallet_address;
    var user_pass=process.env.Passphrase;
    var success_msg = req.flash('success');
    var err_msg= req.flash('err_msg'); 
    let user_id=req.session.user_id;

   console.log("segmenttttttttttttttttttttt",lastSegment);
   var options2 = {
   url:`http://139.59.83.232/devnetwork/node1/keystore/${lastSegment}`,
     method: 'GET',
     headers:
     {
       "content-type": "application/json"
     }
   };
   try{

   request(options2, async function (error, response, body) {
     // console.log('-----------------------', options2.url)
     console.log(body);
     // // })
     console.log('-------------3rd request--------');
     // await request.get(` http://34.194.223.110/devnetwork/node1/keystore/${lastSegment}`,function (error, response, body) {
      try{
        var csv = JSON.parse(body);
         }catch(err){
          //res.json({ status: 0, msg: "It takes few seconds to generate private key,Please try again after 20sec.", data: { err_msg: 'Failed'} });
          req.flash('err_msg', 'It will take few seconds to generate pvt key, Please try again after 45 sec ');
          res.redirect("/get-public-key");
         }
     console.log("CSVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",csv);
     var c = web3.eth.accounts.decrypt(csv,user_pass);
     console.log("Private key::::::::::",c.privateKey);
     pk = c.privateKey;
     if(pk){
       await DigitalWalletRelsModel.update({status:'active'},{where:{reg_user_id:user_id,wallet_address:wallet_address}})
     }
    //  res.json({
    //    status: 1, msg: "Successfully generated private key", data: {
    //      privateKey:pk,
    //      user_id:user_id,
    //    }
    //  });
     //  sender_private_key = pk;
     // privateKey  = Buffer.from(sender_private_key, 'hex');
     res.render('front/digital_wallet/backup-digital-private-key',{
      private_key:pk,
      user_id:user_id
    })
   })
  
  
  
 }catch(err){
   res.json({ status: 0, msg: "Internal error,Please try again.", data: { err_msg: 'Failed'} });
 }
  }catch(err){
    console.log(err);
    throw err;
  }
}


//successfully created digital wallet
exports.getSuccessdigital=async function(req,res){
  try{
         res.render('front/digital_wallet/digital-wallet-success.ejs');
  }catch(err){
    throw err;
  }
}


//create crypto wallet -generate walletd id=walleted address
exports.generateWalletIDForCrypto=async function(req,res){
  let wallet_type=req.query.wallet_type;
  let user_id=req.session.user_id;
  success_msg = req.flash('success');
  err_msg= req.flash('err_msg'); 
  try{
           if(wallet_type=='BTC'){
            var keyPair = bitcoin.ECPair.makeRandom({ network: TESTNET });
            var pkey = keyPair.toWIF();
         const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: TESTNET});
         const privkey = keyPair.privateKey.toString('hex');
         const pubkey = keyPair.publicKey.toString('hex');
         console.log("public key",pubkey);
          let isCreatedBtcWallet =await CryptoWalletModel.create({
             public_key:encrypt1(pubkey),
             reg_user_id:user_id,
             wallet_type:encrypt1('BTC'),
             reflectid_by:encrypt1('representive'),
             wallet_address:encrypt1(address)
           })
           //console.log("Created:::::::::::",isCreatedBtcWallet);
           if(isCreatedBtcWallet){
            //  res.json({
            //    status: 1, msg: "Successfully Created btc wallet", data: {
            //      publicKey:pubkey,
            //      user_id:user_id,
            //      privateKey:privkey,
            //      balance:isCreatedBtcWallet.balance.toString(),
            //      wallet_type:'BTC',
            //      wallet_id:address
            //    }})

            res.render('front/wallet/walletid-crypto',{
              wallet_id:address,
              wallet_type:'BTC',
              privateKey:privkey,
              balance:0
            })
              }else{
                req.flash('err_msg', 'Something went worng, please try again');
                  res.redirect('/crypto-wallet-selection')
              }


           }else if(wallet_type="ETH"){
                 var mnemonic = bip39.generateMnemonic();
     var seed = await bip39.mnemonicToSeed(mnemonic);
     var HDwallet = etherHDkey.fromMasterSeed(seed);
     var zeroWallet = HDwallet.derivePath("m/44'/60'/0'/0/0").getWallet();
     var addres = zeroWallet.getAddressString();
     console.log("Adressssssssssssssssssssssssssss:",addres)
     var privatekey = zeroWallet.getPrivateKeyString();
     console.log("Private keyyyyyyyyyyyyyyyyy:",privatekey);
    var publickey = zeroWallet.getPublicKeyString();
    console.log("public keyyyyyyyyyyyyy",publickey);
         let isCreated= await CryptoWalletModel.create({
             public_key:encrypt1(publickey),
             wallet_address:encrypt1(addres),
             reg_user_id:user_id,
             wallet_type:encrypt1('ethereum'),
             reflectid_by:encrypt1("Representative")
            })
            if(isCreated){
            //  res.json({ status: 1, msg: "wallet created successfully", data: {         
            //    address:addres,
            //    privateKey:privatekey,
            //    publicKey:publickey,
            //    passphrase:mnemonic} });
            res.render('front/wallet/walletid-crypto',{
              wallet_id:addres,
              wallet_type:'ETH',
              privateKey:privatekey,
              balance:0
            })

            }else{
            req.flash('err_msg', 'Something went worng, please try again');
                  res.redirect('/crypto-wallet-selection')
            }
 
           }else{
            req.flash('err_msg', 'Please select one of the listed wallet');
            res.redirect('/crypto-wallet-selection')
           }
  }catch(err){
    throw err;
  }
}


//generate pvt key for crypto wallets
exports.getPvtKeyForCryptoPage=async function(req,res){
  let pvtKey=req.body.pvtKey;
  let wallet_type=req.body.wallet_type;
  res.render('front/wallet/pvt-key-crypto',{
    private_key:pvtKey,
    wallet_type:wallet_type
  })
}

//get page of enter pvt key for import wallet
exports.getImportCryptoPage=async function(req,res){
  success_msg = req.flash('success');
  err_msg= req.flash('err_msg');
  let user_id=req.session.user_id;
  let wallet_type=req.query.wallet_type;
  if(wallet_type=="BTC"||wallet_type=="ETH"){
    req.session.crypto_type=wallet_type;
    res.render('front/wallet/import-crypto',{
      wallet_type:wallet_type,
      success_msg:success_msg,
      err_msg:err_msg
    })
  }else{
    req.flash('err_msg',"Please select one of the listed wallet");
    res.redirect('/import-wallet-selection')
  }
 
}

exports.importCryptoWallet=async function(req,res){
  success_msg = req.flash('success');
  err_msg= req.flash('err_msg');
  //let wallet_type=req.body.wallet_type;
  let wallet_type=req.session.crypto_type;
  console.log("wallet type:::::::::",wallet_type);
  let pvtKey=req.body.pvt_key;
  let user_id=req.session.user_id;
  try{
            if(wallet_type=='BTC'){
              try{
                let private_key=pvtKey;
                var privkey = private_key.split(" ");
                const ecPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privkey[0], 'hex'), { network: bitcoin.networks.testnet })
                
                var pkey = ecPair.toWIF();
                const keyPair = bitcoin.ECPair.fromWIF(pkey, TESTNET);
                //var user_id = req.session.user_id;
                var { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: TESTNET });
                console.log("keypair:::", keyPair)
                var pubkey = keyPair.publicKey.toString("hex");
                console.log("address:::::::::::::::::: : ", address)
                console.log("pubkey :::::::::::::::::::: ", pubkey)
                }catch(err){
                  console.log("err1:",err);
                 // res.json({ status: 0, msg: "Invalid private key", data: { err_msg: 'Failed'} });
                 req.flash('err_msg',"Invalid private key");
                res.redirect('/import-crypto'+'?wallet_type=BTC')
                }
                /////,,,,,,,,,,,,,,,,,,,,,,,,,
                //..............................
                let isPresentWallet=await CryptoWalletModel.findOne({where:{reg_user_id:user_id,wallet_address:encrypt1(address)}});
              if(isPresentWallet){
                console.log("already present btc")
                //res.json({ status: 0, msg: "This  Wallet address is already imported", data: { err_msg: 'Failed'} });
                req.flash('err_msg',"This  Wallet address is already imported");
                res.redirect('/import-crypto'+'?wallet_type=BTC')
              }else{
                 let isCreated= await CryptoWalletModel.create({
                        public_key:encrypt1(pubkey),
                        reg_user_id:user_id,
                        wallet_type:encrypt1('BTC'),
                        reflectid_by:encrypt1('representative'),
                        wallet_address:encrypt1(address)
                       })
                       if(isCreated){
                        //res.json({ status: 1, msg: "BTC wallet imported successfully", data: { success_msg: 'success'} });
                        res.render('front/wallet/import-crypto-successfull',{
                          wallet_type:"BTC"
                        })
                       }else{
                        //res.json({ status: 0, msg: "Failed to import", data: { err_msg: 'Failed'} });
                        req.flash('err_msg',"Failed to import");
                        res.redirect('/import-crypto'+'?wallet_type=BTC')
                       }
              }


            }else if(wallet_type=="ETH"){
              try{
              let privateKey=pvtKey;
              var buffPr=EthUtil.toBuffer(privateKey,"utf-8");
              try{
             var wallet=eth_wallet.default.fromPrivateKey(buffPr);
              }catch(err){
                console.log("indjj",err);
                req.flash('err_msg',"Invalid private key");
                res.redirect('/import-crypto'+"?wallet_type=ETH")
           //  res.json({ status: 0, msg: "Invalid private key!!", data: { err_msg: 'Failed'} });
              }
             var publicKey=wallet.getPublicKeyString();
             console.log("pkkkkkkkkkkkkkkkk",publicKey);
             var wallet_address=wallet.getAddressString();
             console.log("waaaaaaaaaaaaaaaaaaa",wallet_address);
             //balance
             let balanceObj=await web3jsAcc.eth.getBalance(wallet_address);
             let balance_eth= web3jsAcc.utils.fromWei(balanceObj, "ether");
             //creating crypto into db
                 var isPresent= await CryptoWalletModel.findOne({where:{reg_user_id:parseInt(user_id),wallet_address:encrypt1(wallet_address)}});
                if(isPresent){
                  console.log("already present")
                // res.json({ status: 0, msg: "This wallet is already present!!", data: { err_msg: 'Failed'} });
                req.flash('err_msg',"This  Wallet address is already imported");
                res.redirect('/import-crypto'+"?wallet_type=ETH")
                }else{
                 let isCreated=await CryptoWalletModel.create({
                   public_key:encrypt1(publicKey),
                   wallet_address:encrypt1(wallet_address),
                   reg_user_id:parseInt(user_id),
                   balance:balance_eth,
                   wallet_type:encrypt1('ethereum'),
                    })
                    if(isCreated){
                      res.render('front/wallet/import-crypto-successfull',{
                        wallet_type:"ETH"
                      })
                  //  res.json({ status: 1, msg: "Successfully imported ethereum wallet", data: { success_msg: 'Success'} });
                    }else{
                      req.flash('err_msg',"Failed to import");
                      res.redirect('/import-crypto'+"?wallet_type=ETH")
                 //  res.json({ status: 0, msg: "Failed to import wallet, please try again", data: { err_msg: 'Failed'} });
                    }
                   }
                  }catch(err){
                    req.flash('err_msg',"Invalid private key!");
                      res.redirect('/import-crypto'+"?wallet_type=ETH")
                  }
            }else{
              req.flash('err_msg',"Please select one of the listed wallet");
              res.redirect('/import-wallet-selection')
            }
  }catch(err){
    req.flash('err_msg',"OOps something went worng");
    res.redirect('/import-wallet-selection')
  }
}


//send crypto
exports.sendCrypto=async function(req,res){
  let wallet_type=req.body.wallet_type;
  let pvtKey=req.body.pvtKey;
  let sender_user_id=req.session.user_id;
  let receiver_wallet_address=req.body.rec_wallet_id;
  let ammount=req.body.amount;
  let sender_wallet_address=req.body.sender_wallet_id;
  success_msg = req.flash('success');
  err_msg= req.flash('err_msg');
  try{
      if(wallet_type=="BTC"){
        try{
          var receiver_user_id="";
  var receiver_reflet_id='';
  var receiver_name="";
  var sender_name='';
    let amount=ammount;
          //fetch receiver info
          var receiver_info=await CryptoWalletModel.findOne({where:{wallet_address:encrypt1(receiver_wallet_address)}});
          if(receiver_info){
            console.log("Feteching receiverrrrrrrrrrrrrrrrrrrrrrrrr");
            receiver_user_id=receiver_info.reg_user_id;
            console.log("Recccccccccccccc id",receiver_user_id);
             var rec_det=await UserModel.findOne({where:{reg_user_id:receiver_user_id}});
            if(rec_det){
             receiver_name=decrypt(rec_det.full_name);
            }else{
             receiver_name='';
            }
            
               
             
             
             console.log("Recccccccccccccc name",receiver_name);
          var rec_info=await MyReflectIdModel.findOne({where:{reg_user_id:receiver_user_id,reflectid_by:'representative',idCreated:'true'}});
          if(rec_info){
           receiver_reflet_id=rec_info.reflect_code;
          }else{
           receiver_reflet_id='';
          }
         }
       
         //sender infooooooooo
         try{
           var senderDet=await UserModel.findOne({where:{reg_user_id:sender_user_id}});
           sender_name=decrypt(senderDet.full_name);
          var senderInfo=await MyReflectIdModel.findOne({where:{reg_user_id:sender_user_id,reflectid_by:'representative',idCreated:'true'}})
          console.log("sender infffffffffffffffffffff",senderInfo);
          var sender_reflet_id=senderInfo.reflect_code;
          }catch(err){
            console.log(err);
          }
       
           var privateKey = Buffer.from(pvtKey,'hex');
            var privKeyWIF = wif.encode(239,privateKey,true);
           //var privKeyWIF = wif.encode(128,privateKey,true);
               let balanceInBTC= await btcbalance(sender_wallet_address);
       
              console.log("balance:::::::::::::::::::::::::;;",balanceInBTC);
       
             if(balanceInBTC<=amount)
             {
             //	let trans_msg={success:0,msg:"You do not have enough in your wallet to send that much."};
              //	res.json({trans_msg);
             // res.json({ status: 0, msg: "You do not have enough in your wallet to send that much.", data: { err_msg: 'Failed'} });
             req.flash('err_msg',"You do not have enough in your wallet to send that much.");
           res.redirect('get_trans_history'+"?wallet_type="+encrypt(wallet_type)+"&wallet_id="+encrypt(sender_wallet_address));
             }
             else
             {
           var btc_trans=await bitcoinTransaction.sendTransaction({
             from: sender_wallet_address,
             to: receiver_wallet_address,
             privKeyWIF:privKeyWIF,
             btc:amount,
             network: "testnet"
           }).catch((err) =>{
       
             console.log("error catch",err);
       
             let trans_msg={success:0,msg:err};
              
           //  res.json({ status: 0, msg: "Transaction failed", data: { err_msg: 'Failed'} });
           req.flash('err_msg',"Transaction failed");
           res.redirect('get_trans_history'+"?wallet_type="+encrypt(wallet_type)+"&wallet_id="+encrypt(sender_wallet_address));
            
           }).then( async (result)  => {
       
         // console.log("body",res.body);
         // console.log("---------------------------------------------------------");
         // console.log("Hash: ",res.body.tx.hash,"fees",res.body.tx.fees);
       
           if(result)
           {
       
            // console.log("result::::::::::::::::::::::::",result);
             console.log("-------*** transactionnnnnnnnnnn ",result.body.tx)
             console.log("-------*** transaction hashhhhhhhhhhhhhhhh",result.body.tx.hash)
       
             var haash=JSON.stringify(result);
       
             var dataString = '{"tx":'+haash+'}';
       
             var options = {
                // url: 'https://api.blockcypher.com/v1/btc/main/txs/push?token=b5310fa6b2464f5fac9947fb9e82a283',
               //  url:'https://api.blockcypher.com/v1/btc/main/txs/push?token=8454213607a34a1a90f7c9993d3de833',
                 url:'https://api.blockcypher.com/v1/btc/test3/txs/push?token=8454213607a34a1a90f7c9993d3de833',
                 method: 'POST',
                 body: dataString
             };
       
            async function callback(error, response, body) {
                    // console.log("func response",body);
       
                    
       
                 if (!error) {
                   // console.log("body::::::::::::::::::::::",body);
                    //console.log("stringggggggggggggggggggggggg",JSON.stringify(body));
       console.log("brodcastingggggggggggggg")
                   var result_data=JSON.parse(body);
                 
                   // console.log("result::::::::::::::::::::::::::",result_data);
       
                    console.log("feeeeeeeeeeeees",result.body.tx.fees);
                    var bitcoin_salt_mult=Math.pow(10,8);
                 //  console.log("hash",result.body.tx.fees);
                //   let trans_fees=result.body.tx.fees;
                   let rec_amount_in_satoshi=result.body.tx.outputs[0].value;
                    let rec_am_btc=rec_amount_in_satoshi/bitcoin_salt_mult;
                  console.log("receiver will received amountttttttttttttttttttt",rec_am_btc);
                    
                 //  var fees_btc=result_data.tx.fees/bitcoin_salt_mult;
       //             // console.log("feeeeeeeeeeeeeeeeeeeesssssssssssss",fees_btc);
       
       // //amount in dollar
        let currentPriceInUsd=await priceOfCrypto.getCryptoPrice('USD','BTC');
       
       var senderAmountInDollar=(parseFloat(amount)*parseFloat(currentPriceInUsd.price)).toFixed(8);
       senderAmountInDollar= senderAmountInDollar.toString();
       
       var receiverAmountInDollar=(rec_am_btc*parseFloat(currentPriceInUsd.price)).toFixed(8);
       receiverAmountInDollar=receiverAmountInDollar.toString();
       
       
       //   //add to transaction history for sender
         await CryptoTransHistoryModel.create({
           sender_wallet_id:encrypt1(sender_wallet_address),
           sender_reg_user_id:sender_user_id,
           transaction_hash:result.body.tx.hash,
           sender_reflet_id:sender_reflet_id,
           receiver_wallet_id:encrypt1(receiver_wallet_address),
           receiver_reg_user_id:receiver_user_id,
           receiver_reflect_id:receiver_reflet_id,
           amount:amount,
           wallet_type:"BTC",
           status:"Success",
           reg_user_id:sender_user_id,
           operation:"sent",
           amountIndollar:senderAmountInDollar
          })
       
          
       //    //add transaction history for receiver
          await CryptoTransHistoryModel.create({
           sender_wallet_id:encrypt1(sender_wallet_address),
           sender_reg_user_id:sender_user_id,
           transaction_hash:result.body.tx.hash,
           sender_reflet_id:sender_reflet_id,
           receiver_wallet_id:encrypt1(receiver_wallet_address),
           receiver_reg_user_id:receiver_user_id,
           receiver_reflect_id:receiver_reflet_id,
           amount:rec_am_btc.toString(),
           wallet_type:"BTC",
           status:"Success",
           reg_user_id:receiver_user_id,
           operation:"received",
           amountInDollar:receiverAmountInDollar
          })
       
       
       //          //send main notifcation for success(sender)
                if(receiver_name==''){
                 receiver_name=receiver_wallet_address
                }
                let mesg1=`Successfully sent ${amount} BTC to ${receiver_name}`
                
                await updateNotification(sender_user_id,sender_user_id,encrypt(mesg1),'BTC transaction',senderDet.profile_img_name)
                //push for transaction success(sender)
                pushnotification(sender_user_id,'BTC Transaction',mesg1);
                //push for debited(sender)
                let msg2=`${amount} BTC has been debited from your wallet ID ${sender_wallet_address}`;
                pushnotification(sender_user_id,'BTC Transaction',msg2);
                
                 //receiver notification
                 if(receiver_user_id!=''){
                   var msg3=`You have received amount ${rec_am_btc} BTC from ${sender_name}.`
                   await updateNotification(sender_user_id,receiver_user_id,encrypt(msg3),'BTC received',senderDet.profile_img_name);
                   pushnotification(receiver_user_id,'BTC received',msg3);
                 }
       
                 //   let trans_msg={success:1,msg:"Transaction done successfully.",txHash:result_data.tx.hash,fees:fees_btc};
                 //   res.json({status:1,msg:'Transaction done successfully',data:{}});
                 req.flash('success_msg',"Your transaction is done successfully.");
                 res.redirect('get_trans_history'+"?wallet_type="+encrypt(wallet_type)+"&wallet_id="+encrypt(sender_wallet_address));

      
                 }
                 else
                 {
                   console.log("error tran",error);
       
                   //  let trans_msg={success:0,msg:error};
                    // res.json({ status: 0, msg: "Transaction failed", data: { err_msg: 'Failed' } });
                    req.flash('err_msg',"Transaction failed");
                    res.redirect('get_trans_history'+"?wallet_type="+encrypt(wallet_type)+"&wallet_id="+encrypt(sender_wallet_address));
                    
                 }
             }
       
            await request(options, callback);
           }
         });
       
           }
                 
         }catch(err){
           console.log(err);
          // res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
          req.flash('err_msg',"Transaction failed");
          res.redirect('get_trans_history'+"?wallet_type="+encrypt(wallet_type)+"&wallet_id="+encrypt(sender_wallet_address));
         }



      }else{
  var receiver_user_id="";
  var receiver_reflet_id='';
  var receiver_name="";
  var sender_name='';
            try{
              try{
                console.log("private key:::::::::::::",pvtKey);
                console.log("rec addresss:",receiver_wallet_address);
                console.log("sender addressssssssssss",sender_wallet_address);
                var senderDet=await UserModel.findOne({where:{reg_user_id:sender_user_id}});
                sender_name=decrypt(senderDet.full_name);
               var senderInfo=await MyReflectIdModel.findOne({where:{reg_user_id:sender_user_id,reflectid_by:'representative',idCreated:true}})
               var sender_reflet_id=senderInfo.reflect_code;
               }catch(err){
                 console.log(err);
               }
               var buffPr=EthUtil.toBuffer(pvtKey,"utf-8");
               console.log("buffffffffffffffff",buffPr);
               try{
              var wallet=eth_wallet.default.fromPrivateKey(buffPr);
              console.log("wallllllllllllllllll",wallet);
               }catch(err){
                 console.log(err);
                 req.flash('err_msg',"Invalid private key");
                  res.redirect('get_trans_history'+"?wallet_type="+encrypt(wallet_type)+"&wallet_id="+encrypt(sender_wallet_address));
               }
              var wallet_address=wallet.getAddressString();
              console.log("wallllet addddddddddddd",wallet_address);
              if(wallet_address!==sender_wallet_address){
                req.flash('err_msg',"Invalid private key");
                res.redirect('get_trans_history'+"?wallet_type="+encrypt(wallet_type)+"&wallet_id="+encrypt(sender_wallet_address));
              }
           
           
           //fetching receiver reg_user_id
                 
                 var receiver_info=await CryptoWalletModel.findOne({where:{wallet_address:encrypt1(receiver_wallet_address)}});
                  if(receiver_info){
                    console.log("Feteching receiverrrrrrrrrrrrrrrrrrrrrrrrr");
                    receiver_user_id=receiver_info.reg_user_id;
                    console.log("Recccccccccccccc id",receiver_user_id);
                     var rec_det=await UserModel.findOne({where:{reg_user_id:receiver_user_id}});
                     receiver_name=decrypt(rec_det.full_name);
                     console.log("Recccccccccccccc name",receiver_name);
                  var rec_info=await MyReflectIdModel.findOne({where:{reg_user_id:receiver_user_id,reflectid_by:'representative',idCreated:'true'}})
                   receiver_reflet_id=rec_info.reflect_code;
                 }
                 console.log("Transaction starttttttttttttttttttttt")
           
              //transactionnnnnnnnnnnnn
             await  web3jsAcc.eth.getTransactionCount(sender_wallet_address, 'pending', async (err, txCount) => {
               if(err){
                 console.log(err);
               }
                 console.log("Counting strtttttttttttttttt");
                       var estimates_gas = await web3jsAcc.eth.estimateGas({ from: sender_wallet_address, to: receiver_wallet_address, amount: web3jsAcc.utils.toWei(ammount, 'ether') })
                             console.log("gass priceeeeeeeeeeeeeeeeeeeeee");
                       console.log("estimateedddddddd gas",estimates_gas);
                 
                                 // var gasPrice=web3js.utils.toHex(web3js.utils.toWei('50','gwei'));
                                 var gasPrice_bal = await web3jsAcc.eth.getGasPrice();
                                 var gasPrice = web3jsAcc.utils.toHex(gasPrice_bal);
                 
                                 console.log("gasPrice", gasPrice);
                                 var gasLimit = web3jsAcc.utils.toHex(estimates_gas * 2);
                                  console.log("Gas limitttttttt",gasLimit);
                                 var transactionFee_wei = gasPrice * gasLimit;
                                 var transactionFee = web3jsAcc.utils.fromWei(web3jsAcc.utils.toBN(transactionFee_wei), 'ether');
                                 console.log("Transaction feeeeeeeeeee",transactionFee);
                                 var nonce = web3jsAcc.utils.toHex(txCount)
                                 var nonceHex = web3.utils.toHex(nonce);
                                 var receiver_get_amount=parseFloat(ammount)-parseFloat(transactionFee);
                                 
           //amount in dollar
           let currentPriceInUsd=await priceOfCrypto.getCryptoPrice('USD','ETH');
           
           var senderAmountInDollar=parseFloat(ammount)*parseFloat(currentPriceInUsd.price).toFixed(8);
           senderAmountInDollar= senderAmountInDollar.toString();
           var receiverAmountInDollar=receiver_get_amount*parseFloat(currentPriceInUsd.price).toFixed(8);
           receiverAmountInDollar=receiverAmountInDollar.toString();
           receiver_get_amount=receiver_get_amount.toFixed(8);
                                 const txObject = {
                                     nonce: nonceHex,
                                     to: receiver_wallet_address,
                                     value: web3jsAcc.utils.toHex(web3jsAcc.utils.toWei(ammount, 'ether')),
                                     gasLimit: gasLimit,
                                     gasPrice: gasPrice
                                 }
                 
                                 //  const tx = new Tx(txObject,{chain:'ropsten', hardfork: 'petersburg'});
                                 pvtKey=pvtKey.substring(2);
                                 const tx = new Tx(txObject, { chain: 'ropsten'});
                                 console.log("Private key::::::",pvtKey);
                                 pvtKey = Buffer.from(pvtKey,'hex');
                                 tx.sign(pvtKey)
                 
                                 const serializedTx = tx.serialize();
                                 const raw = '0x' + serializedTx.toString('hex');
                 
                                 serializedTx.toString('hex')
                 
                                 // Broadcast the transaction
                                 web3jsAcc.eth.sendSignedTransaction(raw, async (err, txHash) => {
                                   console.log("Signedddddddddddddddd transaction starteddddddddddddddddd");
                                   
                                     if (err) {
                                         console.log("err", err);
                                        await CryptoTransHistoryModel.create({
                                         sender_wallet_id:encrypt1(sender_wallet_address),
                                         sender_reg_user_id:sender_user_id,
                                         sender_reflet_id:sender_reflet_id,
                                         receiver_wallet_id:receiver_wallet_address,
                                         receiver_reg_user_id:receiver_reg_user_id,
                                         receiver_reflect_id:receiver_reflet_id,
                                         amount:ammount,
                                         wallet_type:"ETH",
                                         status:"Failed",
                                         reg_user_id:sender_user_id,
                                         operation:"sent",
                                         amountIndollar:senderAmountInDollar
                                        })
                                        //send main notification for failed 
                                        let msg=`Your transaction failed for amount ${ammount} eth`;
                                        await updateNotification(sender_user_id,sender_user_id,encrypt(msg),"ETH Transaction",senderDet.profile_img_name);
                                       //send push notification for failed
                                          pushnotification(sender_user_id,'ETH transaction',msg);
                                        // res.json({ status: 0, msg: "Transaction failed,insufficient balance", data: { err_msg: 'Failed'} });
                                        req.flash('err_msg',"Transaction failed,insufficient balance");
                                        res.redirect('get_trans_history'+"?wallet_type="+encrypt(wallet_type)+"&wallet_id="+encrypt(sender_wallet_address));
                                     }
                                     else {
                                         console.log('txHash:', txHash, 'transfess', transactionFee);
                                                //update balance of sender
                                         let balanceObjsend=await web3jsAcc.eth.getBalance(sender_wallet_address);
                                         var balance_eth_send= web3jsAcc.utils.fromWei(balanceObjsend, "ether");   
                                         await CryptoWalletModel.update({balance:balance_eth_send},{where:{wallet_address:encrypt1(sender_wallet_address)}});
                                          //update balance of receiver
                                          let balanceObjrec=await web3jsAcc.eth.getBalance(receiver_wallet_address);
                                          var balance_eth_rec= web3jsAcc.utils.fromWei(balanceObjrec, "ether");   
                                          await CryptoWalletModel.update({balance:balance_eth_rec},{where:{wallet_address:encrypt1(receiver_wallet_address)}});
                                        
                                          //add to transaction history for sender
                                          await CryptoTransHistoryModel.create({
                                           sender_wallet_id:encrypt1(sender_wallet_address),
                                           sender_reg_user_id:sender_user_id,
                                           transaction_hash:txHash,
                                           sender_reflet_id:sender_reflet_id,
                                           receiver_wallet_id:encrypt1(receiver_wallet_address),
                                           receiver_reg_user_id:receiver_user_id,
                                           receiver_reflect_id:receiver_reflet_id,
                                           amount:ammount,
                                           wallet_type:"ETH",
                                           status:"Success",
                                           reg_user_id:sender_user_id,
                                           operation:"sent",
                                           amountIndollar:senderAmountInDollar
                                          })
                                          //add transaction history for receiver
                                          await CryptoTransHistoryModel.create({
                                           sender_wallet_id:encrypt1(sender_wallet_address),
                                           sender_reg_user_id:sender_user_id,
                                           transaction_hash:txHash,
                                           sender_reflet_id:sender_reflet_id,
                                           receiver_wallet_id:encrypt1(receiver_wallet_address),
                                           receiver_reg_user_id:receiver_user_id,
                                           receiver_reflect_id:receiver_reflet_id,
                                           amount:receiver_get_amount.toString(),
                                           wallet_type:"ETH",
                                           status:"Success",
                                           reg_user_id:receiver_user_id,
                                           operation:"received",
                                           amountInDollar:receiverAmountInDollar
                                          })
           
                                          //send main notifcation for success(sender)
                                          if(receiver_name==''){
                                           receiver_name=receiver_wallet_address
                                          }
                                          let mesg1=`Successfully sent ${ammount} ETH to ${receiver_name}`
                                          
                                          await updateNotification(sender_user_id,sender_user_id,encrypt(mesg1),'ETH transaction',senderDet.profile_img_name)
                                          //push for transaction success(sender)
                                          pushnotification(sender_user_id,'ETH Transaction',mesg1);
                                          //push for debited(sender)
                                          let msg2=`${ammount} ETH has been debited from your wallet ID ${sender_wallet_address}`;
                                          pushnotification(sender_user_id,'ETH Transaction',msg2);
                                          
                                           //receiver notification
                                           if(receiver_user_id!=''){
                                             var msg3=`You have received amount ${receiver_get_amount} ETH from ${sender_name}.`
                                             await updateNotification(sender_user_id,receiver_user_id,encrypt(msg3),'ETH received',senderDet.profile_img_name);
                                             pushnotification(receiver_user_id,'ETH received',msg3);
                                           }
                                           
           
           
                                        // res.json({ status: 1, msg: 'Your transaction is done successfully.',data:{ txHash: txHash, transactionFee: transactionFee }});
                                        req.flash('success_msg',"Your transaction is done successfully.");
                                        res.redirect('get_trans_history'+"?wallet_type="+encrypt(wallet_type)+"&wallet_id="+encrypt(sender_wallet_address));
                                     }
                                     // Now go check etherscan to see the transaction!
                                 })
                             })       
           


            }catch(err){
              throw err;
            }

      }
  }catch(err){
    throw err;
  }
}

exports.validatePvt=async function(req,res){
  let pvtKey=req.body.pvtkey;
  let sender_address=req.body.sender_add;
  let wallet_type=req.body.wallet_type;
  try{
        if(wallet_type=='BTC'){
          try{
          let private_key=pvtKey;
          var privkey = private_key.split(" ");
          const ecPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privkey[0], 'hex'), { network: bitcoin.networks.testnet })
          
          var pkey = ecPair.toWIF();
          const keyPair = bitcoin.ECPair.fromWIF(pkey, TESTNET);
          //var user_id = req.session.user_id;
          var { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: TESTNET });
          if(address!==sender_address){
            res.end("Invalid private key!")
          }
          }catch(err){
            res.end("Invalid private key!")
          }
        }else{
          try{
            let privateKey=pvtKey;
            var buffPr=EthUtil.toBuffer(privateKey,"utf-8");
            try{
           var wallet=eth_wallet.default.fromPrivateKey(buffPr);
            }catch(err){
              console.log("indjj",err);
              res.end("Invalid private key!")
         //  res.json({ status: 0, msg: "Invalid private key!!", data: { err_msg: 'Failed'} });
            }
           var wallet_address=wallet.getAddressString();
           if(wallet_address!=sender_address){
             res.end("Invalied private key!");
           }
          }catch(err){
            res.end("Invalid private key!")
          }
        }

  }catch(err){
    throw err;
  }
}

//transaction fee
exports.cryptoTransactionFee=async function(req,res){
  console.log("fetchinggggggggggggggggggggggg transaction feeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
  let sender_wallet_address=req.body.sender_wallet_id;
  let receiver_wallet_address=req.body.receiver_wallet_id;
  let amount=req.body.amount;
  let wallet_type=req.body.wallet_type;
  let rec_amount=parseFloat(req.body.rec_amount);
  let trans_fee=parseFloat(req.body.trans_fee);
  success_msg = req.flash('success');
  err_msg= req.flash('err_msg');
  try{
    if(wallet_type.toLowerCase()=='ethereum'){
      //check balance
      let balanceObj=await web3jsAcc.eth.getBalance(sender_wallet_address);
      let balance_eth= web3jsAcc.utils.fromWei(balanceObj, "ether");
      balance_eth=parseFloat(balance_eth);
     if(amount>balance_eth){
       res.end("3")//insufficient balance!
     }
      
    var estimates_gas = await web3jsAcc.eth.estimateGas({ from: sender_wallet_address, to: receiver_wallet_address, amount: web3jsAcc.utils.toWei(amount, 'ether') })
    var gasPrice_bal = await web3jsAcc.eth.getGasPrice();
    var gasPrice = web3jsAcc.utils.toHex(gasPrice_bal);

    console.log("gasPrice", gasPrice);
    var gasLimit = web3jsAcc.utils.toHex(estimates_gas * 2);
     console.log("Gas limitttttttt",gasLimit);
    var transactionFee_wei = gasPrice * gasLimit;
    var transactionFee = web3jsAcc.utils.fromWei(web3jsAcc.utils.toBN(transactionFee_wei), 'ether');
    transactionFee=parseFloat(transactionFee).toFixed(8);
    console.log("Transaction feeeeeeeeeee",transactionFee);
    let afterFeeAmount=parseFloat(amount)-parseFloat(transactionFee);
    afterFeeAmount=afterFeeAmount.toFixed(8);
    if(afterFeeAmount>0){
    //res.json({ status: 1, msg: "Transaction fee", data: {transactionFee:transactionFee.toString(),receivingAmount:afterFeeAmount.toString()} });
         let respObj={
          transactionFee:transactionFee.toString(),
          receivingAmount:afterFeeAmount.toString()
         }
    let respStrg=JSON.stringify(respObj);
    res.end(respStrg);
    }else{
      let msg="1";//1 : Amount should be more than transaction fees!
      res.end(msg);
      //res.json({ status: 0, msg: "You entered very less amount!", data: {err_msg:'Failed'} });
    }
  }else{

    //for btc transaction feesssssssssssssss
    await bitcoinTransaction.getBalance(sender_wallet_address,{ network:"testnet"}).then(async (balanceInBTC)  => {

      if(balanceInBTC<=amount)
      {
       var fee_rate=await bitcoinTransaction.getFees(bitcoinTransaction.providers.fees.mainnet.default,'hour');
       console.log("fee rate",fee_rate);
       var inputs=1;
       var outputs=2;
       var fee = bitcoinTransaction.getTransactionSize(inputs,outputs)*fee_rate;
      console.log("fees",fee);
       var bitcoin_salt_mult=Math.pow(10,8);
       var accurate_fees=fee/bitcoin_salt_mult;
        res.end("3")//insufficient balance!
    //res.json({ status: 0, msg: "Amount should be more than transaction fees!", data: {err_msg:'Failed'} });;
      }
      else
      {
       var btc_fees=await bitcoinTransaction.feeTransaction({
        from: sender_wallet_address,
        btc:amount,
        network: "testnet"
      });

        var bitcoin_salt_mult=Math.pow(10,8);
        var accurate_fees=btc_fees/bitcoin_salt_mult;
       var afterFeeAmount=parseFloat(amount)-parseFloat(accurate_fees);
       afterFeeAmount=afterFeeAmount.toFixed(8);
       accurate_fees=accurate_fees.toFixed(8);
       if(afterFeeAmount<=0){
      //  res.json({ status: 1, msg: "Amount should be more than transaction fees!", data: {transactionFee:accurate_fees,receivingAmount:'0'} });
      let msg1="2"  //Amount should be more than transaction fees!;
    res.end(msg1);
       }else{
        //res.json({ status: 1, msg: "Transaction fee", data: {transactionFee:accurate_fees,receivingAmount:afterFeeAmount.toString()} });
        let respObj={
          transactionFee:accurate_fees.toString(),
          receivingAmount:afterFeeAmount.toString()
         }
    let respStrg=JSON.stringify(respObj);
    res.end(respStrg);
       }
    //   let fees_msg={success:1,msg:"Success.",fees:accurate_fees };
    
      }
      });
  }
  }catch(err){
    throw err;
  }
}