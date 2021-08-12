var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel, FilesDocModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
const {pushnotification,updateNotification,btcbalance}=require('../apies/btc_apies');
var { CryptoWalletModel}=require('../../models/crypto_wallet');
var {NotificationModel} = require('../../models/notification');
var {DigitalWalletRelsModel} = require('../../models/wallet_digital_rels');
var {childWalletModel} = require('../../models/childe_wallet');
const {ShareEntityModel}=require('../../models/shareentity');
var url = require('url');
var http = require('http');
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://128.199.31.153:8501"));
var sizeOf = require('buffer-image-size');
const nodemailer = require("nodemailer");
var db = require('../../services/database');
var sequelize = require('sequelize');
var bitcoin = require("bitcoinjs-lib")
var path = require("bitcoinjs-lib")
var path = require("path")
const { PDFDocument } = require('pdf-lib');
const request=require('request');

const Op = sequelize.Op;
var dataUriToBuffer = require('data-uri-to-buffer');

var { decrypt, encrypt,encrypt1,decrypt1 } = require('../../helpers/encrypt-decrypt')

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
//const request = require('request');
var admin_notification = require('../../helpers/admin_notification.js')

const ipfsAPI = require('ipfs-api');
const fs = require('fs');
var async = require('async');

const fetch = require('node-fetch');
const { DATE } = require('sequelize');

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
const web3jsAcc = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/fa42c8837a7b4155ba2ab5ba6fac9bd1"));

/** my-reflet-id-code get Method Start  **/
exports.my_reflect_code_id= async(req,res,next) =>{
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ")
    // var  user_type=req.session.user_type
    var user_id=req.session.user_id; 
    var user_type = req.session.user_type;
    var success_msg = req.flash('success_msg');
    var err_msg= req.flash('err_msg'); 
    var all_reflect_id=[]
    if(user_id)
    { 
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


//fetch all shared entity with user
let userData=await UserModel.findOne({where:{reg_user_id:user_id}});
let client_salt=userData.client_salt;
let sharedEntity=await ShareEntityModel.findAll({where:{receiver_id:user_id,isBlock:'no'}});
//console.log("Shared   dddddddddddddddddddddddddd",sharedEntity);

if(sharedEntity.length>0){
 let refletArr=[];
 let j=0;
  for(let i=0;i<sharedEntity.length;i++){
  
   try{
     var refletData =await MyReflectIdModel.findOne({where:{reflect_code:sharedEntity[i].shared_entity}});
      var naturalIdentity=await MyReflectIdModel.findOne({where:{reg_user_id:refletData.reg_user_id,reflectid_by:'representative'}});
      var walletInfo=await WalletModel.findOne({where:{wallet_id:refletData.wallet_id}});
     }catch(err){
       console.log(err);
       continue;
   //   res.json({ status: 0, msg: "Opps! sharing account got deleted ", data: { err_msg: 'Failed'} });
     }
       let pass='';
       if(sharedEntity[i].password==null||sharedEntity[i].password==''){
          pass='no'
       }else{
         pass='yes'
       }
       
       let entityObj={
       entity_company_name:decrypt(refletData.entity_company_name),
       entity_name:decrypt(refletData.entity_name),
       walletAddress:walletInfo.wallet_address,
       balance:walletInfo.balance.toString(),
       myrefletid:refletData.reflect_code,
       entity_company_regno:decrypt(refletData.entity_company_regno),
       entity_company_address:decrypt(refletData.entity_company_address),
       shared_by:'',
       passwordCreated:pass,
       client_salt:userData.client_salt
     }
     if(naturalIdentity==null){
        entityObj.shared_by='Identity has been deleted'
    }else{
        entityObj.shared_by=naturalIdentity.reflect_code
    }

     refletArr[j]=entityObj;
     j++;
    }

    res.render('front/myReflect/my-reflet-id-code',{
        success_msg,
        err_msg,
        session:req.session,
        all_reflect_id,
        refletArr,
        crypto,
        client_salt,
        encrypt
});
}else{
    res.render('front/myReflect/my-reflet-id-code',{
        success_msg,
        err_msg,
        session:req.session,
        all_reflect_id,
        refletArr,
        crypto,
        client_salt,
        encrypt
});
}
        }else{
            res.render('front/myReflect/my-reflet-id-code',{
                success_msg,
                err_msg,
                session:req.session,
                all_reflect_id,
                refletArr,
                crypto,
                client_salt,
                encrypt
  });
        }
   
        
        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

}

//generate public key for natural reflet id and submit form for natural id , user as a client
exports.genratePublicKey=async function(req,res){
    var user_id= req.session.user_id;
    let passphrase = process.env.Passphrase;
    let username=encrypt(req.body.username);  
    let firstName=encrypt(req.body.firstName);
    let lastName=encrypt(req.body.lastName); 
    let user_type=req.body.user_type;
    var success_msg = req.flash('success');
    var err_msg= req.flash('err_msg'); 
    var reflect_code = generateUniqueId({
      length: 4,
      useLetters: false,
      excludeSymbols: ['0']
    });
    try{
        var user_account='';
        let refletData=await MyReflectIdModel.findOne({where:{reg_user_id:user_id,reflectid_by:'representative',idCreated:'true'}});
        if(refletData==null){
            //  let public_key="0x24100e77a7389ec2bdd147732f04c99b4e6d79c7";
            let user_passphrase = crypto.createHash('sha256').update(passphrase).digest('base64');
            
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
                console.log("Bodyyyyyyyyyyyyyy:",body);
             
               console.log('response..................................................  : ', response);
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
                //res.json({ status: 0, msg: "Internal issue", data: { err_msg: 'Failed'} });
                req.flash('err_msg', 'Internal issue')
                res.redirect("/create-myrefletid"); 

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
                 //console.log("opppppppppppppssssssssssssssss errr");
                 //res.json({ status: 0, msg: "Internal issue", data: { err_msg: 'Failed'} });
                 req.flash('err_msg', 'Internal issue')
                 res.redirect("/create-myrefletid"); 
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
                      let userData= await UserModel.findOne({where:{reg_user_id:user_id}});
                      if(userData.email_verification_status=='yes'){
                        userData.email_verification_status='verified'
                      }else{
                        userData.email_verification_status='pending'
                      }
                      
                      let isCreatdWallt=await WalletModel.create({
                        wallet_address:user_account,
                        reg_user_id:user_id
                      })
                      req.session.walletAddress=user_account;
                      req.session.segment=lastSegment;
                      req.session.refletid=reflect_code;
                      req.session.type='natural';
                      let isCreated=await MyReflectIdModel.create({
                          reflect_code:reflect_code,
                          reg_user_id:user_id,
                          user_as:user_type,
                          rep_username:username,
                          rep_firstname:firstName,
                          rep_lastname:lastName,
                          rep_emailid:userData.email,
                          wallet_id:isCreatdWallt.wallet_id,
                          email_verification_status:userData.email_verification_status
                      }) ;
                      
                      if(isCreated){
                        // res.json({
                        //   status: 1, msg: "Successfully generated natural person MyRefletId", data: {
                        //     walletAddress:user_account,
                        //     user_id:user_id,
                        //     myrefletCode:reflect_code,
                        //     type:"Natural person",
                        //     name:decrypt(username),
                        //     segment:lastSegment
                        //   }
                        // });
                        console.log("reflet codddddddddddd generateddd",reflect_code);
                        res.render('front/wallet/backup-etherium-address',{
                            success_msg,
                            err_msg,
                            session:req.session,
                            user_id:user_id,
                            walletAddress:user_account,
                            type:"Natural",
                            myrefletCode:reflect_code,
                            name:decrypt(username),
                            segment:lastSegment
              });
                      
                      }else{
                        req.flash('err_msg', 'Failed to create NaturalId')
                         res.redirect("/create-myrefletid");  //redirect to myreflet id
                      }
                      
                     }
                   }
                 })
               })
                 
             })
            }
          }else{
          req.flash('err_msg', 'You have already created your Natural MyrelfetId');
        res.redirect("/create-myrefletid"); //redirect to myreflet id page
          }
    }catch(err){
        throw err;
    }
}

//genrate pvt key for natural and entity reflet id
exports.generatePvtKey=async function(req,res){
    console.log("generateddddddddddddddd pvt key")
    let lastSegment=req.body.segment;
    //let reflet_code=parseInt(req.body.reflet_id);
    let reflet_code=parseInt(req.session.refletid);
    console.log("reflet idddddddd",reflet_code)
    var user_pass=process.env.Passphrase;
    var success_msg = req.flash('success');
    var err_msg= req.flash('err_msg'); 
    let user_id=req.session.user_id;
    try{
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
     
        await request(options2, async function (error, response, body) {
         // console.log(body);
           try{
             var csv = JSON.parse(body);
              }catch(err){
                  console.log("It will take few seconds to generate pvt key, Please try again after 45 sec")
                req.flash('err_msg', 'It will take few seconds to generate pvt key, Please try again after 45 sec ');
                res.redirect("/backup-eth-address");
              }
          console.log("CSVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",csv);
          var c = web3.eth.accounts.decrypt(csv,user_pass);
          console.log("Private key::::::::::",c.privateKey);
          pk = c.privateKey;
          if(pk){
            let reflt_id=reflet_code.toString();
           let isUpdated= await MyReflectIdModel.update({idCreated:'true'},{where:{reg_user_id:user_id,reflect_code:reflet_code}})
           console.log("uspdatedddddddddddddddd trueeeeeeeeeee:",isUpdated);
          }

          res.render('front/wallet/backup-your-private-key',{
            private_key:pk,
            user_id:user_id
          })
        //   res.json({
        //     status: 1, msg: "Successfully generated private key", data: {
        //       privateKey:pk,
        //       user_id:user_id,
        //     }
        //   });
          //  sender_private_key = pk;
          // privateKey  = Buffer.from(sender_private_key, 'hex');
        })
       
      }catch(err){
        req.flash('err_msg', 'Internal error');
        res.redirect("/my-reflet-id-code");
      }
     
      }catch(err){
        req.flash('err_msg', 'Something went wrong');
        res.redirect("/my-reflet-id-code");
      }
}

//generate public key for entity
exports.generatePublicKeyForEntity=async function(req,res){
    try{
var user_id= req.session.user_id;
  let company_name=encrypt(req.body.company_name);  
  let company_country=req.body.company_country;
  let company_address=encrypt(req.body.company_address);
  let company_reg_no=encrypt(req.body.company_reg_no); 
  let entity_name=encrypt(req.body.user_name);
  let phone=encrypt(req.body.company_phone);
  //let entity_password=req.body.password;
  req.session.company_reg_no=encrypt(req.body.company_reg_no);
  let passphrase = process.env.Passphrase;
  var reflect_code = generateUniqueId({
    length: 4,
    useLetters: false,
    excludeSymbols: ['0']
  });
var user_account='';

let refletData=await MyReflectIdModel.findOne({where:{reg_user_id:user_id,reflectid_by:'entity',entity_company_regno:company_reg_no,idCreated:'true'}});
if(refletData==null){
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
        console.log("Bodyyyyyyyyyyyyyy:",body);
     
       console.log('response..................................................  : ', response);
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
        res.redirect("/create-myrefletid");  //redirect to myreflet id
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
        // res.json({ status: 0, msg: "Internal issue", data: { err_msg: 'Failed'} });
         req.flash('err_msg', 'Internal issue')
         res.redirect("/create-myrefletid"); 
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
              let userData= await UserModel.findOne({where:{reg_user_id:user_id}});
              if(userData.email_verification_status=='yes'){
                userData.email_verification_status='verified'
              }else{
                userData.email_verification_status='pending'
              }
              req.session.walletAddress=user_account;
              req.session.segment=lastSegment;
              req.session.refletid=reflect_code;
              req.session.type='entity';
              let isCreatdWallt=await WalletModel.create({
                wallet_address:user_account,
                reg_user_id:user_id
              })
            
              let isCreated=await MyReflectIdModel.create({
                  reflect_code:reflect_code,
                  reg_user_id:user_id,
                  user_as:'client',
                  entity_company_name:company_name,
                  entity_name:entity_name,
                  entity_company_address:company_address,
                  entity_company_regno:company_reg_no,
                  entity_company_phoneno:phone,
                  wallet_id:isCreatdWallt.wallet_id,
                  reflectid_by:'entity',
                  companyCountry:company_country,
                 // entity_password:entity_password,
                  email_verification_status:userData.email_verification_status
              }) ;
              
              if(isCreated){
                // res.json({
                //   status: 1, msg: "Successfully generated Entity MyRefletId", data: {
                //     walletAddress:user_account,
                //     user_id:user_id,
                //     myrefletCode:reflect_code,
                //     type:"Entity",
                //     name:decrypt(entity_name),
                //     segment:lastSegment
                //   }
                // });

                res.render('front/wallet/backup-etherium-address',{
                    walletAddress:user_account,
                    user_id:user_id,
                    myrefletCode:reflect_code,
                    type:"Entity",
                    name:decrypt(entity_name),
                    segment:lastSegment
                })
              
              }else{
                        req.flash('err_msg', 'Failed to create Entity Id')
                         res.redirect("/create-myrefletid");  //redirect to myreflet id
              }
              
             }
           }
         })
       })
         
      })
    }
  }else{
   // res.json({ status: 0, msg: "You have already created MyrefletID for this company, ", data: { err_msg: 'Failed'} });
    req.flash('err_msg', 'You have already created MyrefletID for this company');
        res.redirect("/create-myrefletid"); //redirect to myreflet id page
  }
    }catch(err){
        throw err;
    }
}



//share enity to other user
exports.shareEntity=async function(req,res){
    let sender_user_id= req.session.user_id;
    let reflet_id=parseInt(req.body.receiver_reflet_id);
    console.log("refletid",reflet_id);
    let entity_id=req.body.entity_reflet_id;
    console.log("entity iddddd",entity_id);
    var success_msg = req.flash('success_msg');
    var err_msg= req.flash('err_msg');  
    try{
        let isPresentReflet=await MyReflectIdModel.findOne({where:{reflect_code:reflet_id}});
        if(isPresentReflet!=null){
       // console.log("fetch data by reflet id",isPresentReflet);
        let alreadyShared= await ShareEntityModel.findOne({where:{shared_entity:entity_id,sender_id:sender_user_id,receiver_id:isPresentReflet.reg_user_id}})
       if(alreadyShared==null){
        let naturalId=await MyReflectIdModel.findOne({where:{reg_user_id:sender_user_id,reflectid_by:'representative',idCreated:'true'}});
       //  console.log(naturalId);
          
              let user_id=isPresentReflet.reg_user_id;
             // console.log("receiverrrrrrr iddddddddddd:",user_id);
                let isShared=await ShareEntityModel.create({
                               sender_id:sender_user_id,
                               receiver_id:user_id,
                               shared_entity:entity_id,
                               entity_owner:naturalId.reflect_code
                             })
                     let userDet=await UserModel.findOne({where:{reg_user_id:sender_user_id}});
                      var dt = dateTime.create();
                      var formatted = dt.format('Y-m-d H:M:S');
                      let msg=`${decrypt(userDet.full_name)} has shared a entityID ${entity_id} with you`;
                       //   msg=encrypt(msg);
                      if(userDet.profile_img_name==null){
                        userDet.profile_img_name=''
                      }
                        await NotificationModel.create({
                          notification_msg:encrypt(msg),
                          notification_type:1,
                          notification_date:formatted,
                          sender_id:sender_user_id,
                          receiver_id:user_id,
                          profile_pic:userDet.profile_img_name,
                          subject:"Sharing Entity"
                        })       
                        pushnotification(user_id,'Entity Sharing',msg);    
                             //res.json({ status: 1, msg: "You have shared your entity successfully ", data: { success_msg:'You have shared successfully your entity' } });
                             req.flash('success_msg', `You have shared your entity successfully`);
                           res.redirect("my-reflet-id-code");
                  
            
            }else{
              //res.json({ status: 0, msg: `You have already shared this entity with ${reflet_id}`, data: { err_msg: 'Failed' } });
                           req.flash('err_msg', `You have already shared this entity with ${reflet_id}`);
                          
                           res.redirect("my-reflet-id-code");
            }
        }else{
            //res.json({ status: 0, msg: "Entered reflet id is invalid!", data: { err_msg: 'Failed' } });
                         req.flash('err_msg', 'Entered reflet id is invalid!');
                         res.redirect("my-reflet-id-code");
           }
    }catch(err){
        console.log(err);
        throw err;
    }
}


//save entity password
exports.saveEntityPassword=async function(req,res){
    let user_id=parseInt(req.session.user_id);
  let entity_id=req.body.entity_id;
  let entityPassowrd=req.body.entityPassword;

    try{
   let isUser=await ShareEntityModel.findOne({where:{receiver_id:user_id}});
          // console.log(isUser);
           if(isUser){
                    let userDet=await UserModel.findOne({where:{reg_user_id:user_id}});
                    let tempPass=entityPassowrd+userDet.client_salt;
                    tempPass=crypto.createHash('sha256').update(tempPass).digest('hex');
                    await ShareEntityModel.update({password: tempPass},{where:{shared_entity:entity_id}});
                    res.redirect("my-reflet-id-code");
                   // res.json({ status: 1, msg: "Saved password", data: { success_msg:'Saved password' } });
           }else{
            //res.json({ status: 0, msg: "Invalid user id", data: { err_msg: 'Failed'} });
            res.redirect("my-reflet-id-code");
           }
    }catch(err){
        console.log(err);
        throw err;
    }
}


//validate entity password
exports.checkEntityPassword=async function(req,res){
    console.log("validatingggggggggggggggggggggggg passworddddddddddddddddddddddddddddd");
  let user_id=parseInt(req.session.user_id);
  let password=req.body.password;
 // password=password.replace(/ /g,'-');
 console.log("checkong passsssssssssss");
 //console.log("enterd password:",password);
  let entity_id=parseInt(req.body.entity_id);
  var success_msg = req.flash('success_msg');
    var err_msg= req.flash('err_msg');  
    try{
        let userDet=await UserModel.findOne({where:{reg_user_id:user_id}});
        if(userDet){
        var pass = crypto.pbkdf2Sync(password, userDet.client_salt,  1000, 128, 'SHA512').toString(`hex`);
         let tempPass=pass+userDet.client_salt;
         tempPass=crypto.createHash('sha256').update(tempPass).digest('hex');
         let isMatched=await ShareEntityModel.findOne({where:{shared_entity:entity_id,password:tempPass}});
         if(isMatched){
             //show all the linked wallets with this entity
             req.flash('success_msg', 'Successfully access entity! ');
             res.redirect("get-linked-wallets");
           //   res.json({ status: 1, msg: "Successfully access entity ", data: { success_msg: 'Successfully access entity'} });
         }else{
            req.flash('err_msg', 'Please enter valid password!');
            res.redirect("my-reflet-id-code");
           //res.json({ status: 0, msg: "Please enter valid password", data: { err_msg: 'Failed'} });
         }
        }else{
            req.flash('err_msg', 'Internal server error!');
            res.redirect("my-reflet-id-code");
         //res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
        }
    }catch(err){
        console.log(err);
        throw err;
    }
}


//get methods page after clicking over entity will get all linked wallets

exports.getClickingOverEntityPage=async function(req,res){
    let reflet_id=decrypt(req.query.reflet_id);
    console.log("reflet idddddddd",reflet_id);
    var success_msg = req.flash('success_msg');
    var err_msg= req.flash('err_msg');
     let user_id=req.session.user_id;
    try{
        //fetch reflet detail
         let reflet_det=await MyReflectIdModel.findOne({where:{reflect_code:reflet_id}});
          let wallet_det=await WalletModel.findOne({where:{wallet_id:reflet_det.wallet_id}});
          let refNaturalDet=await MyReflectIdModel.findOne({where:{reg_user_id:user_id,reflectid_by:'representative',idCreated:'true'}});
          let sharedDet=await ShareEntityModel.findAll({where:{shared_entity:reflet_id,entity_owner:refNaturalDet.reflect_code}});
           let sharedArr=[];
           if(sharedDet.length>0){
            for(let i=0;i<sharedDet.length;i++){
                        let empDet = await MyReflectIdModel.findOne({where:{reg_user_id:sharedDet[i].receiver_id,reflectid_by:'representative',idCreated:'true'}})
                     if(sharedDet[i].isBlock==null||sharedDet[i].isBlock=='no'){
                       sharedDet[i].isBlock='no'
                     }else{
                       sharedDet[i].isBlock='yes'
                     }
                     let dt = dateTime.create(sharedDet[i].createdAt);
                     let formatted = dt.format('m/d/Y');
                     let tim=dt.format('H:M:S');
                     let sharedObj={
                       employee_refletid:empDet.reflect_code,
                       block_status:sharedDet[i].isBlock,
                       date:formatted,
                       time:tim,
                       entity_refletid:reflet_id
                   }
                   sharedArr[i]=sharedObj;
            }
 
          } 
          let name="";
          if(reflet_det.reflectid_by=='representative'){
            reflet_det.reflectid_by='Natural Person'
            name=decrypt(reflet_det.rep_username);
          }else{
            name=decrypt(reflet_det.entity_name);
          }

          let reflet_obj={
              name:name,
              reflet_id:reflet_id,
              type:reflet_det.reflectid_by,
              wallet_id:wallet_det.wallet_address,
              balance:'0'
          }
        let digital_wallet=await DigitalWalletRelsModel.findAll({where:{parent_reflect_id:reflet_id}});
        let crypto_wallets=await CryptoWalletModel.findAll({where:{reflet_code:reflet_id}});
        let wallets=[]; 
        if(digital_wallet.length>0||crypto_wallets.length>0){
          let k=0;
              if(digital_wallet.length>0){
                for(let i=0;i<digital_wallet.length;i++){
                 if(digital_wallet[i].balance==null){
                   digital_wallet[i].balance='0'
                 }
                    let walletObj={
                      walletAddress:digital_wallet[i].wallet_address,
                      balance:digital_wallet[i].balance.toString(),
                      refletid:digital_wallet[i].parent_reflect_id,
                      walletid:digital_wallet[i].dig_wallet_rel.toString(),
                      wallet_type:'digital',
                      name:digital_wallet[i].digital_type
                    }
                    wallets[k]=walletObj;
                    k++;
                }
              }
              if(crypto_wallets.length>0){
               for(let i=0;i<crypto_wallets.length;i++){
                   
                   let walletObj={
                     walletAddress:decrypt1(crypto_wallets[i].public_key),
                     balance:'',
                     refletid:crypto_wallets[i].reflet_code.toString(),
                     walletid:decrypt1(crypto_wallets[i].wallet_address),
                     wallet_type:'crypto',
                     name:decrypt1(crypto_wallets[i].wallet_type)
                   }
                   if(decrypt1(crypto_wallets[i].wallet_type).toLowerCase()=='ethereum'){
                    let balanceObj=await web3jsAcc.eth.getBalance(respObj.walletId);
                    let balance_eth= web3jsAcc.utils.fromWei(balanceObj, "ether");
                    balance_eth=parseFloat(balance_eth).toFixed(8);
                    walletObj.balance=balance_eth.toString();
                  }else{
                    try{
                 let btcba =await btcbalance(respObj.walletId);
                 btcba=parseFloat(btcba).toFixed(8);
                 walletObj.balance=btcba.toString();
                    }catch(err){
                      walletObj.balance='0'
                      console.log(err);
                    }
                    
                  }


                
                   wallets[k]=walletObj;
                   k++;
               }
             }
             res.render('front/myReflect/all-linked-wallets',{
                wallets:wallets,
                reflet_obj:reflet_obj,
                sharedArr:sharedArr
             })
           //  res.json({ status: 1, msg: "Linked wallets", data: wallets });
       }else{
        res.render('front/myReflect/all-linked-wallets',{
            wallets:wallets,
            reflet_obj:reflet_obj,
            sharedArr:sharedArr,
            success_msg,
            err_msg
         })
         //res.json({ status: 0, msg: "No linked wallets with this refletID", data: { err_msg: 'Failed'} });
       }

          
    }catch(err){
        throw err;
    }
}
//block and unblock reflet id by owner
exports.blockAndUnblock=async function(req,res){
    let hint=req.body.isBlock;
    console.log("bloack:",hint);
    let o_user_id=req.session.user_id;
    let reflet_id=parseInt(req.body.emp_reflet_id);
    console.log("reflet_id",reflet_id);
    let entity_refletid=req.body.entity_refletid;
    console.log("entity ref:",entity_refletid);
    var success_msg = req.flash('success_msg');
    var err_msg= req.flash('err_msg');
    try{
        let refletDet=await MyReflectIdModel.findOne({where:{reflect_code:reflet_id,reflectid_by:'representative',idCreated:'true'}});
        let user_id=refletDet.reg_user_id;
          let owner_entity=await UserModel.findOne({where:{reg_user_id:o_user_id}});
          if(hint.toLowerCase()==='no'){
           await ShareEntityModel.update({isBlock:'yes'},{where:{receiver_id:user_id,shared_entity:entity_refletid}});
           let msg=`You are blocked from entity ${entity_refletid} by entity owner ${decrypt(owner_entity.full_name)}.`
           pushnotification(refletDet.reg_user_id,'Blocked',msg);
          let isSent= await updateNotification(user_id,user_id,encrypt(msg),'Blocked',owner_entity.profile_img_name);
          req.flash('success_msg', 'Blocked successfully');
          res.redirect('/get-linked-wallets?reflet_id='+encrypt(entity_refletid))
          // res.json({ status: 1, msg: "Blocked successfully", data: { success_msg: 'Blocked' } });
         
              
          }else{
           let msg=`Congratulations!, You are Unblocked from entity ${entity_refletid} by entity owner ${decrypt(owner_entity.full_name)}.`
           pushnotification(refletDet.reg_user_id,'Unblocked',msg);
          let isSent= await updateNotification(user_id,user_id,encrypt(msg),'UnBlocked',owner_entity.profile_img_name);
           await ShareEntityModel.update({isBlock:'no'},{where:{receiver_id:user_id,shared_entity:entity_refletid}});
           //res.json({ status: 1, msg: "Unblocked successfully", data: { success_msg: 'Unblocked' } });
           req.flash('success_msg', 'Unblocked successfully');
           res.redirect('/get-linked-wallets?reflet_id='+encrypt(entity_refletid));
           
          }

    }catch(err){
        console.log(err);
        throw err;
    }
}



// create my reflet id 

//get form of entity and natural id
exports.getRefletForm=async function(req,res){
    let user_id=parseInt(req.session.user_id);
    var success_msg = req.flash('success_msg');
    var err_msg= req.flash('err_msg'); 
    try{
        res.render('front/myReflect/refletid-form',{
            success_msg,
            err_msg,
            user_id
        })
    }catch(err){
        console.log(err);
        throw err;
    }
} 



/**create-my-refletid-code Get method Start**/
exports.create_reflect_id = (req,res,next)=>{
    var email = req.session.email; 
    var  wallet_id = req.query.address.trim();
    const reflect_code = generateUniqueId({
        length: 4,
        useLetters: false
      });

  var type=  req.session.user_type 

      console.log('type : ',type);

    if(type=="verifier"){
        VerifierCategoryMasterModel.findAll({}).then(result=>{
            res.render('front/my-reflet-id-verifier/create-my-refletid-code',
            { session:req.session,
                wallet_id,
                reflect_code,
                email,
                verifier_category : result
             });

        }).catch(err=>console.log(err))

    }   else    {

                    db.query('SELECT * FROM tbl_wallet_reflectid_rels WHERE deleted="0" AND reflectid_by!="digitalWallet" AND user_as="client"',{type:db.QueryTypes.SELECT})

                    .then(reflectCodesData=>{

                                 res.render('front/myReflect/create-my-refletid-code',{ session:req.session,wallet_id,reflect_code,email ,reflectCodesData});

                    })

                    .catch(err=>console.log("err",err))
                      

    }
}
/**create-my-refletid-code Get method End**/

async function getRoutes(self_attested_hash,callback){
    console.log("self_attested_hash inside: ",self_attested_hash)
    request('https://ipfs.io/ipfs/QmNfxDxeBd7FsrtTtmy8XyU7D4TXzpvSXyQyMwqskwp5ho', function(error, response, body) {
      
        // console.log('response',response);

        if(!error) {

            result = body;          
            return callback(false,result);
        } else {    

            console.log("err data",error);        
            return callback(null, error);;
        }
    });
}

/**view-reflect-id Get method Start**/
exports.view_myreflect_id = async(req,res,next)=>{
    var user_id= req.session.user_id;
    var certified =[];
        var reflect_code = req.query.id.trim();
        var didRequestOrNot=null;
        if(reflect_code!=undefined){
              await  db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.reflect_id=tbl_wallet_reflectid_rels.reflect_id where tbl_wallet_reflectid_rels.reflect_code="+reflect_code+" and tbl_client_verification_requests.deleted='0' and tbl_client_verification_requests.client_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async requestData=>{
                 didRequestOrNot=requestData
               

                 })
            }



    await   DocumentMasterModel.findAll({where:{status:'active',deleted:'0',document_type:'master'}}).then(allDocs =>{
        CountryModel.findAll().then(allCountries=>{
            MyReflectIdModel.findOne({where:{reflect_code:reflect_code}}).then(async result => {
              var reflect_id = result.reflect_id;
                
              var   digitalWalletData =    await  db.query("SELECT * FROM tbl_digital_wallet_rels INNER JOIN tbl_wallet_reflectid_rels ON tbl_digital_wallet_rels.dig_wal_reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE parent_reflect_id="+reflect_id+" AND tbl_digital_wallet_rels.deleted='0'",{type:db.QueryTypes.SELECT})

              db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.deleted='0' and tbl_myreflectid_doc_rels.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(document){
                  var documents;
                  if(document==""){
                    documents = null;
                    var additional_info_array = [];
                    if(result.additional_info!=null){
                        additional_info_array =JSON.parse(result.additional_info);
                        }else{
                            additional_info_array=result.additional_info;
                        }
                       
                    var wall_id = result.wallet_id;
                    var country_id = result.entity_company_country;
                  
                    // await db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id where NOT tbl_client_verification_requests.request_status='pending' and tbl_client_verification_requests.deleted='0' and tbl_client_verification_requests.client_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async certified_data=>{
                    //     // console.log("certified_data ",certified_data);
                    //     if(certified_data.length>0){
                    //         for(var b=0;b<certified_data.length;b++){
                    //             await db.query("SELECT * FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id,{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
                          db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels  ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id where NOT tbl_client_verification_requests.request_status='pending' and tbl_client_verification_requests.deleted='0' and tbl_client_verification_requests.client_id="+user_id+" AND tbl_client_verification_requests.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(async certified_data=>{
                            // console.log("certified_data 2",certified_data);
                            if(certified_data.length>0){
                                for(var b=0;b<certified_data.length;b++){
                                    // await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id+" and tbl_request_documents_files.docfile_status<>'pending'",{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
                                        await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id+" and tbl_request_documents_files.docfile_status<>'pending' GROUP BY tbl_request_documents_files.request_doc_id" ,{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
                                // console.log("certified_doc_data ",certified_doc_data);


                                certified.push({certified_data:certified_data,certified_doc_data:certified_doc_data});


                                
                                })
                            }
                        }
                    if(country_id!=null){
        
                         CountryModel.findOne({where:{country_id:country_id}}).then( async country =>{
                            UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                            WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                            WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(async function(user){
        
                            console.log("wallet model data not null");
                            await forsend();
        
        
                            // console.log("certified 1",certified);
                             async function forsend(){
                                res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,additional_info_array,user,country:country.country_name,moment,allCountries,documents,allDocs,certified,didRequestOrNot,digitalWalletData,reflect_id});
                             }
        
                               
                                // additional_info_array.push(JSON.parse(result.additional_info));
                                
                        
                        
                            })
                        });
        
                    }else{ 
                        console.log("certified 2",certified);
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                         WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                           
                            console.log("wallet model data");
                       
                        res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,additional_info_array,user,moment,allCountries,country:null,documents,allDocs,certified,didRequestOrNot,digitalWalletData,reflect_id});
                       
                        })
                    
                 
                     } 
                    }) 
                  }
                  else{
                      documents=document;
                //   console.log("---------doc_content----------123",documents);
                for(var i=0;i<document.length;i++){
                    //    console.log(i);
                       var doc_id=document[i].user_doc_id;
                       //console.log("doc_id",doc_id);
                       var all_doc_content =[];
                       var all_video_content=[];
                       let all_self_attested =[];
                       var all_pdf_content =[]
                       var counter=0;
    
                     await db.query("SELECT * FROM tbl_files_docs where deleted='0' and user_doc_id="+doc_id,{ type:db.QueryTypes.SELECT}).then(async doc_content=>{
                        
                        //await doc_content.forEach(async content =>{
                            async.each(doc_content,async function (content, cb) {
    
                            if(content.type=='image'){
    
                                //console.log("content.file_content",content.file_content);
    
                                all_doc_content.push(content.file_content);
                               
                if(content.self_attested_hash){
    
    
                    var url1='https://ipfs.io/ipfs/';
                    var url2=content.self_attested_hash;
                    var final_url=url1.concat(url2);
    
                    // console.log('final url',final_url);
    
    
                    // console.log("content.self",content.self_attested_hash);
    
                   // console.log('https://ipfs.io/ipfs/'+content.self_attested_hash);
                  
    
                    await request(final_url,callback);
    
    
                  function callback(error, response, body) {
                    
                    if(!error){
    
                        //return body;
    
                       all_self_attested.push({hash:body,type:"image"}); 
    
                    //    console.log("length",all_self_attested.length);
                                            
                     }
                                    
                 }
    
                //  console.log("self attested 1---",all_self_attested);
    
                
                                    
                                }
                            }else if(content.type =='pdf'){
                                all_pdf_content.push(content.file_content);
                                console.log("all_pdf_content : ",all_pdf_content)

                                    if(content.self_attested_hash){

                                        all_self_attested.push({hash:content.self_attested_hash,type:"pdf"}); 


                                    
                                                        
                              }

                            }
                            else
                            {
    
                                all_video_content.push(content.file_content);
                            }
                            
                            
                         
                               // cb(null);
                            //console.log(' ------------------------c b-----------fgdfg',res_data);
                            // all_self_attested.push(data);cb();
                            
                            }, function (err) { // called once all iteration callbacks have returned (or an error was thrown)
                            if (err) { console.log("err",err); }
                            console.log('all_self_attested')
                            console.log(all_self_attested); // Final version of eventList
                        });
                    })
                        console.log("---------doc_content---------- ",all_video_content);
    
    
                         documents[i].file_content = all_doc_content;
                         documents[i].video_content = all_video_content;
                         documents[i].self_attested_content = all_self_attested;
                         documents[i].pdf_content = all_pdf_content;

                            // var all_docs = all_doc_content.join(',');
                           
                    
                   }
    
    
                    setTimeout(fordocuments,10000);
    
                  async  function fordocuments(){
    
                              //console.log("---------doc_content--------- ",documents[i].self_attested_content);
    
                               var additional_info_array = [];
                if(result.additional_info!=null){
                    additional_info_array =JSON.parse(result.additional_info);
                    }else{
                        additional_info_array=result.additional_info;
                    }
                   
                var wall_id = result.wallet_id;
                var country_id = result.entity_company_country;
                //  db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id where NOT tbl_client_verification_requests.request_status='pending' and tbl_client_verification_requests.deleted='0' and tbl_client_verification_requests.client_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async certified_data=>{
                //     console.log("certified_data 2",certified_data);
                //     if(certified_data.length>0){
                //         for(var b=0;b<certified_data.length;b++){
                //             await db.query("SELECT * FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id,{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
                      db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels  ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id where NOT tbl_client_verification_requests.request_status='pending' and tbl_client_verification_requests.deleted='0' and tbl_client_verification_requests.client_id="+user_id+" AND tbl_client_verification_requests.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(async certified_data=>{
                        console.log("certified_data 2",certified_data);
                        if(certified_data.length>0){
                            for(var b=0;b<certified_data.length;b++){
                                // await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id+" and tbl_request_documents_files.docfile_status<>'pending'",{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
                                    await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id+" and tbl_request_documents_files.docfile_status<>'pending' GROUP BY tbl_request_documents_files.request_doc_id" ,{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
                            console.log("certified_doc_data eldse ",certified_doc_data);


                                certified.push({certified_data:certified_data,certified_doc_data:certified_doc_data});

                                console.log(" certifiedcertifiedcertifiedcertifiedcertifiedcertifiedcertified : ",certified)

                                //   })
                                
                            // certified.push({certified_data:certified_data,certified_doc_data:certified_doc_data});
                            })
                        }
                    }
                if(country_id!=null){
    
                     CountryModel.findOne({where:{country_id:country_id}}).then( async country =>{
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(async function(user){
                            // console.log("certified_data 4",certified[0].certified_data);
                            // console.log("certified_doc_data 4",certified[0].certified_doc_data);
                        console.log("wallet model data not null");
                        await forsend();
                        
    
           
                         async function forsend(){
                            res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,additional_info_array,user,country:country.country_name,moment,allCountries,documents,allDocs,certified,didRequestOrNot,digitalWalletData,reflect_id});
                         }
    
                           
                            // additional_info_array.push(JSON.parse(result.additional_info));
                            
                    
                    
                        })
                    });
    
                }else{ 
    
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                     WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        console.log("certified 4",certified);
                        console.log("wallet model data");
                   
                    res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,additional_info_array,user,moment,allCountries,country:null,documents,allDocs,certified,didRequestOrNot,digitalWalletData,reflect_id});
                   
                    })
                
             
                 }  
                })           
                         }
                     
                  }
    
               
            
            })
            })
        
        })
    })
    }
    /**view-reflect-id Get method End**/

// ********************Representative start********************

/**submit-myreflect-code Post method Start**/
exports.submit_reflect_code =async(req,res,next)=>{
    var user_type = req.session.user_type;
    var user_id = req.session.user_id;
    var wallet_id = req.body.wallet_id.trim();
    var reflectid_by = "representative"
    var reflect_code = req.body.reflect_code.trim();
    var reflect_username = req.body.reflect_username.trim();
    var firstname = req.body.firstname.trim();
    var lastname = req.body.lastname.trim();
    var wallet_name = req.body.wallet_name.trim();

    var mail_id = req.session.email;
   
     await   UserModel.findOne({where:{reg_user_id:user_id}}).then(async user_data => {
            
        await   CountryModel.findOne({where:{country_name:decrypt(user_data.birthplace)}}).then(async country_data => { 

          await  MyReflectIdModel.create({entity_company_country:country_data.country_id,reflectid_by:reflectid_by,reflect_code:reflect_code,wallet_id:wallet_id,reg_user_id:user_id,user_as:user_type,rep_username:reflect_username,rep_firstname:firstname,rep_lastname:lastname,rep_emailid:mail_id,wallet_name:wallet_name}).then(async(result)=>{
              await  admin_notification("Client  has been create new Reflect Id as representative.",user_id,result.reflect_id,"3")
               
            res.redirect('/view-reflect-id?id='+reflect_code);
          })
       })
    })
}
/**submit-myreflect-code Post method End**/

/**update-representative Post method Start**/
exports.update_representative = async (req,res,next) =>{
    var reflect_id = req.body.reflect_id.trim();
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var middlename = req.body.middlename;
    var country_name = req.body.country_name;
    var company_address = req.body.company_address;
    var company_name = req.body.company_name;
    var btc_wallet_address = req.body.btc_wallet_address;
    var eth_wallet_address = req.body.eth_wallet_address;
    var rep_nationality = req.body.nationality;

    var emailID = req.body.emailID;

    var reflect_code;


   await MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result =>  reflect_code = result.reflect_code )

    if(firstname!=undefined){
     
       
        MyReflectIdModel.update({rep_firstname:firstname},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                res.redirect('/view-reflect-id?id='+result.reflect_code);
            })
        
        })
   
    
    }else if(lastname!=undefined){
        
        MyReflectIdModel.update({rep_lastname:lastname},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                res.redirect('/view-reflect-id?id='+result.reflect_code);
            })
        
        })

    }else if(middlename!=undefined){

        MyReflectIdModel.update({rep_lastname:lastname},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                res.redirect('/view-reflect-id?id='+result.reflect_code);
            })
        })

    }else if(country_name!=undefined){
      
            MyReflectIdModel.update({entity_company_country:country_name},{where:{ reflect_id: reflect_id} }).then( (success) => {
                MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                    res.redirect('/view-reflect-id?id='+result.reflect_code);
                })
        })
  
    }else if(company_address!=undefined){
    
        MyReflectIdModel.update({entity_company_address:company_address},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                res.redirect('/view-reflect-id?id='+result.reflect_code);
            })
        
        })
    }else if(company_name!=undefined){
       
        MyReflectIdModel.update({rep_company_name:company_name},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                res.redirect('/view-reflect-id?id='+result.reflect_code);
            })
        
        })
    }else if(emailID!=undefined){
       console.log("emailID ::: ",emailID)
 MyReflectIdModel.update({rep_emailid:encrypt(emailID)},{where:{ reflect_id: reflect_id} }).then(async (success) => {


           var smtpTransport = nodemailer.createTransport({
                      service: 'gmail',
                      auth: {
                               user: 'info.myreflet@gmail.com',
                               pass: 'myquest321'
                      }
              });
                      const mailOptions = {
                        to: emailID,
                        from: 'questtestmail@gmail.com',
                        subject: "Verifiy Email For Entity.",
                  
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
                                <p>The link is here to verified your entity email <br>
                                https://${req.headers.host}/verification-reflet-email?reflect_id=${reflect_id}&type=${Buffer.from('representative').toString('base64')}&email=${Buffer.from(emailID).toString('base64')}
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

                             MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                                      res.redirect('/view-reflect-id?id='+result.reflect_code);
                                  })
                              

                      })
             
        })
    }else if(btc_wallet_address!=undefined){

        var private_key = req.body.btc_wallet_address.trim();
        console.log("private_key : ",private_key)
      
        const keyPair = bitcoin.ECPair.fromWIF(private_key);
        // var user_id = req.session.user_id;
      
      
        const { address} = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
        const pubkey  = keyPair.publicKey.toString("hex");

        const user_id             = req.session.user_id;
        const wallet_address      = address.trim();
        // const {pubkey,reflect_id} = req.body
    
        WalletModel.findOne({where:{wallet_address:wallet_address,reg_user_id:user_id}})
        .then(data=>{
            if (data!= null) {
                
                console.log("if con... btc")

                MyReflectIdModel.update({rep_btc_address:btc_wallet_address},{where:{ reflect_id: reflect_id} }).then(async (success) => {
                    MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(async result => {
                     await   WalletModel.update({wallet_address:wallet_address,reg_user_id:user_id,public_key:pubkey},{where:{wallet_address:wallet_address,reg_user_id:user_id}})
                        res.redirect('/view-reflect-id?id='+result.reflect_code);
                    })
                
                })

            } else {

                WalletModel.create({wallet_address:wallet_address,reg_user_id:user_id,public_key:pubkey})
                .then(result=>{
                  var updateValues=
                  {
                    btc_wallet_id:result.wallet_id,
                    rep_btc_address:wallet_address
                  }
                  MyReflectIdModel.update(updateValues, { where: { reflect_id: reflect_id } }).then((resultwallet) => 
                  {
                      console.log("wallet reflect_id : ",result.reflect_id);
              
                      WalletModelImport.create({wallet_id:result.wallet_id,reg_user_id:user_id,wallet_type:'BTC'})
                      .then(result=>{
                        // console.log("wallet : ",result);
                        res.redirect('/view-reflect-id?id='+reflect_code);
                          })
                       })
                 })
                .catch(err =>{console.log(err)})
            }

        })
        .catch(err=>console.log("err",err))
       

    }else if(eth_wallet_address!=undefined){
      
        MyReflectIdModel.update({rep_eth_addess:eth_wallet_address},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                res.redirect('/view-reflect-id?id='+result.reflect_code);
            })
        
        })

    }else if(rep_nationality!=undefined){
      
        MyReflectIdModel.update({rep_nationality:rep_nationality},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                res.redirect('/view-reflect-id?id='+result.reflect_code);
            })
        
        })
 
    }
}
/**update-representative Post method End**/

/**additional-info Post method Start**/
exports.additional_info = (req,res) =>{

    console.log("additional info");

    var reflect_id = req.body.reflect_id.trim();
    var label = req.body.label.trim();
    var content = req.body.content.trim();
    var tempAddInfo = {
        label:label,
        content:content
    }
    var additional_info = JSON.stringify(tempAddInfo);
    var additional_info_array = [];
    

    MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {

    if(result.additional_info!=null){
        additional_info_array=JSON.parse(result.additional_info);
    }

        additional_info_array.push(JSON.parse(additional_info));

        console.log("additional info",additional_info_array);


        MyReflectIdModel.update({additional_info:JSON.stringify(additional_info_array)},{where:{ reflect_id: reflect_id} }).then(async (success) => {


               res.redirect('/view-reflect-id?id='+result.reflect_code);
            })
         
        
        })
    
}
/**additional-info Post method End**/
 
/**add-new-doc-rep Post method Start**/
exports.add_new_doc_rep = (req,res,next) =>{
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        if (err) {
         console.log(err);
        }
        var reflect_id = fields.reflect_id;
        var doc_id = fields.document_id;
        var expiry_date = fields.expiry_date;
        var id_number = fields.id_number;
        var issue_date = fields.issue_date;
        var issue_place = fields.issue_place;
        var proof_of_address= fields.proof_of_address;
        let testFile = fs.readFileSync(files.document.path);
        let testBuffer = new Buffer(testFile);
        var document_name=fields.document_name;
                     
        var ext = path.extname(files.document.name);
        let ext_type = (ext == ".pdf") ? "pdf" :"image";
console.log("***************22222222222222******************************************************* ext_type",{ext_type,ext})
       var dt = dateTime.create();
       var formatted = dt.format('Y-m-d H:M:S');


           function makeid(length) {
             var result           = '';
             var characters       = '1234567890';
             var charactersLength = characters.length;

                 for ( var i = 0; i < length; i++ ) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                 }
                           return result;

           }
             if (!id_number) {
                     
                     id_number = `AUTO${makeid(4)}MYREFLET`
             }

          console.log("id_number : ",id_number)

        ipfs.files.add(testBuffer,async function (err, file) {
            if (err) {
            console.log("err from ejs",err);
            }
            console.log("from ipfs ",file);

                    console.log("from issue_date document_name",document_name);

           if(document_name)
                 {
                await DocumentMasterModel.create({document_name:document_name,document_type:"other",createdAt:formatted,updatedAt:formatted}).then(doc_data =>{

            console.log("from issue_date if",doc_data.doc_id);
                  DocumentMasterModel.findAll({where:{deleted:"0",status:"active",document_type:"master"}}).then(allDocs =>{
                      DocumentReflectIdModel.create({doc_id:doc_data.doc_id,doc_unique_code:id_number,reflect_id:reflect_id,proof_of_address,issue_place,issue_date,expire_date:expiry_date}).then(doc =>{
                          FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash,type:ext_type}).then(doc_content =>{
                              MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                                  res.redirect('/view-reflect-id?id='+result.reflect_code);
                              });
                          })
                      })
                  })
               })
              }
            else
            {
               DocumentMasterModel.findAll({where:{deleted:"0",status:"active",document_type:"master"}}).then(allDocs =>{
                DocumentReflectIdModel.create({doc_id:doc_id,doc_unique_code:id_number,reflect_id:reflect_id,proof_of_address,issue_place,issue_date,expire_date:expiry_date}).then(doc =>{
                    FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash,type:ext_type}).then(doc_content =>{
                        MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                            res.redirect('/view-reflect-id?id='+result.reflect_code);
                        });
                    })
                })
            })
            }
        })
    });
}
/**add-new-doc-rep Post method End**/

/**get-verifier-list Get method Start**/
exports.get_verifier_list = async (req,res,next) =>{
    var verifier_array=[];
    var user_id = req.session.user_id;
    await db.query('select * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.user_as="verifier" and  tbl_wallet_reflectid_rels.reg_user_id!='+user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifiers){
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
        res.send(verifier_array);
    });
}
/**get-verifier-list Get method End**/

/**verifier-doc-checked Post method Start**/
exports.verifier_doc_checked = async (req,res,next) =>{
    var user_doc_id_array = JSON.parse(req.body.doc_ids);
    // console.log("---------------",user_doc_id_array);
    const doc_array=[];
    await db.query('select * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.user_as="verifier"',{ type:db.QueryTypes.SELECT}).then( async function(verifiers){
        
        for(var i=0;i<user_doc_id_array.length;i++){
            console.log(".................>>>",i);
            await db.query('select * from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_myreflectid_doc_rels.user_doc_id='+user_doc_id_array[i],{  type:db.QueryTypes.SELECT}).then(function(checked_docs){
                doc_array.push(checked_docs);
                // console.log(".................<<<>>>",doc_array);
            });
        }
        // console.log(".................>>>",doc_array);
        res.send({verifiers:verifiers,doc_array:doc_array});
    })
}
/**verifier-doc-checked Post method End**/

/**get-checked-doc Post method Start**/
exports.get_checked_doc = async (req,res,next) =>{

    var id = req.body.user_doc_id;

   await db.query("SELECT * FROM tbl_files_docs INNER JOIN tbl_myreflectid_doc_rels ON tbl_files_docs.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id inner join tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.user_doc_id="+id,{ type:db.QueryTypes.SELECT}).then(async function(document){

       await db.query("SELECT * FROM tbl_files_docs INNER JOIN tbl_myreflectid_doc_rels ON tbl_files_docs.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id inner join tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.user_doc_id="+id+" and type='video'",{ type:db.QueryTypes.SELECT}).then(function(video_type){

                   var video_type = (video_type.length>0) ? 'yes':'no'

                   var value = req.body.no?(req.body.no+req.body.value):req.body.value;

            console.log(" document : ",document)
            console.log(" idididid : ",value)

              res.render('front/myReflect/ajax_doc_perms',{document,value,video_type});
      })
    })
}
/**get-checked-doc Post method End**/

/**request-doc Post method Start**/


exports.request_doc = async(req,res,next) =>{

    console.log("...........................................request_doc start*******....................................");


       var client_id        = req.session.user_id;
       var reflect_id       = req.body.reflect_id;
       var verifier_id      = req.body.verifier_id;
       var ver_ref_id       = req.body.verifier_reflect_id;
       var sub_cat_id       = req.body.sub_cat_id
       var p_cat_id         = req.body.p_cat_id
       var note             = req.body.note

   
       const request_code  = generateUniqueId({
           length: 6,
           useLetters: false
         });

       var all_doc_length
       var array_of_water_mark =[]
       var doc_id              =[]; 
       var download            =[];
       var view                =[];
       var certify             =[];
       var self_certify             =[];
       var complete             =[];
       var video_proof             =[];
       var sign             =[];

       doc_id           = JSON.parse(req.body.total_doc);
       download         = JSON.parse(req.body.download);
       view             = JSON.parse(req.body.view);
       certify          = JSON.parse(req.body.certify);

       self_certify          = JSON.parse(req.body.self_certify);
       complete          = JSON.parse(req.body.complete);
       video_proof          = JSON.parse(req.body.video_proof);
       sign          = JSON.parse(req.body.sign);

       console.log(".....***   video_proofvideo_proofvideo_proof ****.....",video_proof); 
       console.log(".....*** self_certifyself_certifyself_certify  ****.....",self_certify); 

          
                    
        await db.query(`SELECT * FROM tbl_files_docs  WHERE tbl_files_docs.user_doc_id IN (${doc_id}) AND tbl_files_docs.deleted="0"`,{ type:db.QueryTypes.SELECT})
       
       .then(async(all_doc) =>{

             console.log("first step doc find query",all_doc);

             var i = 0
             all_doc_length = all_doc.length

             async.each(all_doc,async function (content, cb) {

                  if ( content.type == "video" ) {

                     file_id      = content.file_id
                     user_doc_id  = content.user_doc_id
                     await upload_water_mark(content.file_content,"null","null",user_doc_id,file_id,"video")

                  }else if(content.type == "pdf"){

                    file_id      = content.file_id
                      user_doc_id  = content.user_doc_id

                        if(content.self_attested_hash){
                       await upload_water_mark(content.self_attested_hash,"yes","null",user_doc_id,file_id,"pdf")
                                  
                        }
                          else{

                       await upload_water_mark(content.file_content,"no","null",user_doc_id,file_id,"pdf")
                        }
                     
                  }else    {
                  
                     if(content.self_attested_hash){

                        await request(`https://ipfs.io/ipfs/${content.self_attested_hash}`, async function (error, response, body) {
                        

                                if (  !error && response.statusCode == 200  ) {
                                            var self_att = "yes"                                          
                                            docImage     = dataUriToBuffer(body);
                                            end_value    = i
                                            user_doc_id  = content.user_doc_id
                                            file_id      = content.file_id
                                            await upload_water_mark(docImage,self_att,end_value,user_doc_id,file_id ,"image");
                                            i++
                                 } else {

                                     console.log("ipfs err",error)
                                     res.send(error)
                                 }

                         })

                        

                     }  else    {
                                            var self_att = "no"
                                            docImage     = `https://ipfs.io/ipfs/${content.file_content}`
                                            end_value    = i
                                            user_doc_id  = content.user_doc_id
                                            file_id      = content.file_id
                                            await upload_water_mark(docImage,self_att,end_value,user_doc_id,file_id ,"image");
                                            i++

                     }

                       
                  }     
                  
             })
            

                   
        })
        .catch(err=>console.log("file doc",err))



        async function upload_water_mark(file_hash,self_att,end_value,user_doc_id,file_id,type){
              console.log("inside water mark function,,,,,,,,,",end_value)


              if ( type == "video" ) {

                    array_of_water_mark.push({file_id,user_doc_id,request_file_hash:file_hash,doc_type:"video"})
                    
                    if( array_of_water_mark.length == (all_doc_length) ){

                        console.log("semiFinalRespone respone.",array_of_water_mark);

                        await semiFinalRespone()

                    } else {
                                    console.log("both array length not equle error")
                                
                    }

              } else if(type == "pdf"){
                        

                          const run = async (OldHash ,self_att) => {
                        
                     let promins = new Promise(async (resolve ,reject)=>{
                            console.log("hello 0")

                            const url = `https://ipfs.io/ipfs/${OldHash}`

                            const pdf1 = await fetch(url).then(res => res.arrayBuffer())
                            console.log("pdf1 : ",pdf1)
                            resolve(pdf1)    

                         
                     })

                   await  promins.then(async pdf1 =>{

                    // console.log("pdf1 ",pdf1)
                    // const fileUrl = new URL(`https://ipfs.io/ipfs/${hashes[j].hash}`);
                        
                       

            // const pdfDoc = await PDFDocument.load(pdf1)

                         console.log("hello 1")
                        const pdfDoc = await PDFDocument.load(pdf1);
                       
                        console.log("hello 2")

                        const img_icon = await pdfDoc.embedPng(fs.readFileSync(__dirname+'/../../public/assets/images/logo-white.png'));

                        console.log("hello 3")
                        // let icon_image =  await Jimp.read(__dirname+'/../../public/assets/images/logo-white.png')

                        // console.log(" pathToPDF ",fs.readFileSync(pathToImage))
                        // console.log(" pathToImage ",img)
                        
                       const imagePage = pdfDoc.insertPage(0);
                        console.log("hello 4")
                            
                        // date = date.toString()
                        // imagePage.drawText(date, { x:0, y: 90, size: 8 })


                        
                        console.log("hello 5")

                        
                        imagePage.drawImage(img_icon, {
                            x: 200,
                            y: 300,
                            width: imagePage.getWidth()/3,
                            height: imagePage.getHeight()/3
                            });
                        console.log("hello 6")

                        const pdfBytes = await pdfDoc.save();
                        console.log("hello 7")

                        
                        let testBuffer = new Buffer(pdfBytes);
                        
                        console.log(" pathToImage ",testBuffer)
                        console.log("hello 8")

                        await  ipfs.files.add(testBuffer, async function (err, file) {
                            if (err) {
                          //  console.log("err from ejs",err);
                            }

                            console.log("from ipfs self_attested_hash:file[0].hash text_img",file[0].hash);

                            if(self_att == 'yes'){
                              console.log("inner self_att  w/o attested: ",self_att," OldHash : ",OldHash);

                              array_of_water_mark.push({file_id,user_doc_id,request_file_hash:OldHash,doc_type:"pdf"})
                            }else{
                                      console.log("inner self_att attested : ",self_att," file[0].hash ",file[0].hash);

                               array_of_water_mark.push({file_id,user_doc_id,request_file_hash:file[0].hash,doc_type:"pdf"})
                            }

                     
                    
                                if( array_of_water_mark.length == (all_doc_length) ){

                                    console.log("semiFinalRespone respone.",array_of_water_mark);

                                    await semiFinalRespone()

                                } else {
                                                console.log("both array length not equle error")
                                            
                                }   
                    
                        })
                     })
                        
                        
                        }


                                         await  run(file_hash,self_att);


              }
              else {
              
                    var w_text     =  ""

                    let icon_image =  await Jimp.read(__dirname+'/../../public/assets/images/logo-white.png')

                    await Jimp.read(file_hash,async function(err, image) {

                                    if(err){
                                        console.log("jimp error",err);
                                        res.send(err)  
                                    }

                                    console.log("image.bitmap",image.bitmap)
                                    console.log("image-----------1 ");

                                    await Jimp
                                    .create(image.bitmap.width ,image.bitmap.height+((image.bitmap.width/4)+30),'#ffffff',async function(err, nova_new) {
                                    
                                            if(err){
                                                console.log("jimp2 error",err);
                                                res.send(err)  
                                            }
                            
                                            console.log("hello-----------2 ");
                                            await icon_image.resize((image.bitmap.width/4)/2,(image.bitmap.width/4)/2);

                                            await Jimp.loadFont(Jimp.FONT_SANS_12_BLACK ,async function(err, font) {
                                                    
                                                        if(err){
                                                            console.log("jimp3 error",err);
                                                            res.send(err)  
                                                        }
                                        
                                                        console.log("hello-----------3 ");
                                                    
                                                        if ( self_att != "yes" ) {
                                
                                                            nova_new.composite(icon_image,((image.bitmap.width)-(image.bitmap.width/4)),image.bitmap.height);
                                
                                                            }
                                
                                                        nova_new.print(font,(image.bitmap.width/4)/3,image.bitmap.height,w_text,)
                                                                            
                                                        nova_new.composite(image,0,0);
                                                    
                                                        console.log("nova_new.resize",nova_new)
                                
                                                        console.log("hello-----------4 ");
                                                        
                                                        var d= await  nova_new.getBase64Async(Jimp.MIME_PNG)
                                                
                                                        console.log("hello-----------5 ");
                                                        
                                                        let testBuffer = new Buffer(d);
                                                    
                                                        var  e = await  ipfs.files.add(testBuffer, async function (err, file) {

                                                                        if (err) {

                                                                        console.log("add ipfs error",err);
                                                                        res.send(err)
                                                                        
                                                                        }   else    {
                                                                    
                                                                                    console.log("hello-----------7 ");

                                                                                    array_of_water_mark.push({file_id,user_doc_id,request_file_hash:file[0].hash,doc_type:"image"})
                                                                                    console.log("hello-----------8 ");

                                                                                    if(array_of_water_mark.length==(all_doc_length)){

                                                                                        console.log("semiFinalRespone respone.",array_of_water_mark);

                                                                                        await semiFinalRespone()

                                                                                    } else {
                                                                                                    console.log("both array length not equle error")
                                                                                                
                                                                                    }
                                                                        
                                                                                                            
                                                                        }
                                                                                                
                                                                    })
                                                        
                                                                
                                            })
                            
                            
                            
                            

                                    })
                
                    });
                                
            
            }
         }
        
         async function semiFinalRespone(){
               console.log("inside semifinal function,,,,,,,,,,,,,,,,,,,,,,,");

               await db.query("select * from tbl_admin_durations",{ type:db.QueryTypes.SELECT})

              .then(async function(due_date_data){

                    var duration = due_date_data[0].counting;
                    var dt = new Date();

                    if(due_date_data[0].duration=="month"){

                        dt.setMonth( dt.getMonth() + parseInt(duration) );
                        
                    }

                    await MyReflectIdModel.findOne({where:{deleted:"0",reflect_id:reflect_id}})
                    .then(async(c_re_data)=>{
                               
                           UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
                           MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                           await MyReflectIdModel.findOne({where:{deleted:"0",reflect_id:ver_ref_id},include:[UserModel]})
                           .then(async(v_re_data)=>{

                                var  request_pin  =   v_re_data.reflect_code+c_re_data.reflect_code+decrypt(v_re_data.tbl_user_registration.user_pin)
                                var mykey         = crypto.createCipher('aes-128-cbc', 'mypass');
                                var mystr         = mykey.update(request_pin, 'utf8', 'hex')
                                mystr            += mykey.final('hex');
                                var cript_64_request_pin = mystr
                               
                              
                              
                                await ClientVerificationModel.create({
                                                                        request_code             :  request_code,
                                                                        verifier_id              :  verifier_id,
                                                                        verifer_my_reflect_id    :  ver_ref_id,
                                                                        reflect_id               :  reflect_id,
                                                                        client_id                :  client_id,
                                                                        request_pin              :  cript_64_request_pin,
                                                                        p_category_id            :  p_cat_id,
                                                                        sub_category_id          :  sub_cat_id,
                                                                        due_date                 :  dt
                                })
                                .then(async(verifyRequest) =>{

                                      var request_id = verifyRequest.request_id;
                                      await UserModel.findOne({ where: {reg_user_id: client_id} })
                                      .then( async (userData) => {

                                           await  NotificationModel.create({
                                                                     notification_msg:`You have recieved a request from ${decrypt(userData.full_name)}.`,
                                                                     sender_id      :   client_id,
                                                                     receiver_id    :   verifier_id,
                                                                     request_id     :   request_id,
                                                                     notification_type: '1',
                                                                     notification_date: new Date()
                                           })
                                           
                                          .then(async(notification) =>{
                                          
                                            console.log("notification done........");

                                                let k = 0
                                                // await a<sync.each(doc_id,async function (content, cb) {
                                          for (let i = 0;i<=doc_id.length; i++) {
                                         

                                      console.log(".....***   video_proofvideo_proofvideo_proof ****.....",i,' ------- ',video_proof[i]); 
                                      console.log(".....*** self_certifyself_certifyself_certify  ****.....",i,' ------- ',self_certify[i]);

                                      console.log(" doc_id :::: ",doc_id)


                                                           await RequestDocumentsModel
                                                           .create({request_id  :   request_id,
                                                                    user_doc_id :   doc_id[i],
                                                                    download    :   download[i],
                                                                    view        :   view[i],
                                                                    certified   :   certify[i],
                                                                    sign        :   sign[i],
                                                                    complete    :   complete[i],
                                                                    video_proof :   video_proof[i],
                                                                    self_certify:   self_certify[i],
                                                                    message     :   note
                                                            })

                                                           .then(async(success) =>{
                                                                    // k++;
                                                                console.log("outside if final respones call k length",i,"  doc id length",doc_id.length-1);

                                                                 if(i == (doc_id.length-1)){
                                                                    console.log("final response$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");


                                                                     await FinalRespone(request_id);

                                                                  }
                                                            // k++
                                                               
                                                            })
                                                            .catch(err=>console.log("RequestDocumentsModel err",err))

                                                         
                                                                
                                                // })
                                              }

                                          })

                                       }).catch(err=>{console.log(" UserModel",err),res.send(err)})

                                }).catch(err=>{console.log(" ClientVerificationModel",err),res.send(err)})


                           }).catch(err=>{console.log("MyReflectIdModel MyReflectIdModel",err),res.send(err)})
                    }).catch(err=>{console.log("MyReflectIdModel",err),res.send(err)})
              })
              .catch(err=>{console.log("semifinalERROR",err),res.send(err)})

         } 

         async function FinalRespone(request_id){

            console.log("inside FinalRespone........########################");


            await db
            .query('SELECT * FROM tbl_request_documents WHERE request_id='+request_id+' AND deleted="0"',{ type:db.QueryTypes.SELECT})

            .then(async(requestDocumentData)=>{
                var new_hash_array =[]
                var countForSend = 0

                console.log("out side loop ++++++++++++++++++++++");

                let z = 0
                // for(var z=0; z<requestDocumentData.length;z++)
                // {
                 await  async.each(requestDocumentData,async function (requestDocument, cb) {

                    await db
                    .query('SELECT * FROM tbl_request_documents INNER JOIN tbl_files_docs ON tbl_request_documents.user_doc_id=tbl_files_docs.user_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id= tbl_client_verification_requests.request_id WHERE tbl_request_documents.request_id='+request_id+' AND tbl_request_documents.deleted="0" AND tbl_files_docs.deleted="0" AND tbl_request_documents.user_doc_id='+requestDocument.user_doc_id,{ type:db.QueryTypes.SELECT})
                    .then(async(SortrequestDocumentData)=>{

                        console.log("inside side loop ________________________-------------",SortrequestDocumentData);

                        //  z = z==0 ? 0 : z
                        let  m = 0
                        await  async.each(SortrequestDocumentData,async function (content1, cb) {

                            console.log("inside side aysnc loop ________________________-------------",);
                           let x = 0
                           await  async.each(array_of_water_mark,async function (water_array, cb) {

                            console.log("inside side 2nd aysnc loop ________________________-------------",array_of_water_mark);

                            console.log("content1.file_id array_of_water_mark.file_id ",content1.file_id,water_array.file_id);

                            if(content1.file_id==water_array.file_id){

                                 console.log("if inside match",water_array.doc_type);

                                await  RequestFilesModel.create({
                                                               request_doc_id      : content1.request_doc_id,
                                                               request_file_hash   : water_array.request_file_hash,
                                                               doc_type            : water_array.doc_type
                                })
                                .then(async (dataForReturn)=>{

                                    console.log("outside succes z ",z,SortrequestDocumentData.length-1);

                                    if(z==(SortrequestDocumentData.length-1)){
                                        console.log("inside succes");

                                        res.send("success")

                                    }

                                    
                                }).catch(err=>console.log("RequestFilesModel err",err))

                            }

                                    if(x==(array_of_water_mark.length-1)){

                                        z++

                                    }   else    {

                                        x++

                                    }


                            })

                            

                          })
                    })

                // }
                 })

            })

         }
}


// exports.request_doc = async(req,res,next) =>{

//     console.log("...........................................request_doc start*******....................................");

//     // console.log(req.body,typeof req.body.download);

//        var client_id        = req.session.user_id;
//        var reflect_id       = req.body.reflect_id;
//        var verifier_id      = req.body.verifier_id;
//        var ver_ref_id       = req.body.verifier_reflect_id;
//        var sub_cat_id       = req.body.sub_cat_id
//        var p_cat_id         = req.body.p_cat_id
//        var note             = req.body.note

//     //    console.log(".....***sub_cat_id****.....",sub_cat_id);
//     //    console.log(".....***p_cat_id****.....",p_cat_id);
   
//        const request_code = generateUniqueId({
//            length: 6,
//            useLetters: false
//          });

//        var doc_id   =[]; 
//        var download =[];
//        var view     =[];
//        var certify  =[];
   
//        doc_id           = JSON.parse(req.body.total_doc);
//        download         = JSON.parse(req.body.download);
//        view             = JSON.parse(req.body.view);
//        certify          = JSON.parse(req.body.certify);
//        console.log(".....*******.....",doc_id);  

//        await db.query("select * from tbl_admin_durations",{ type:db.QueryTypes.SELECT})

//              .then(async function(due_date_data){
//                     // console.log("-----------categories--------------",due_date_data);
//                     var duration = due_date_data[0].counting;
//                     var dt = new Date();

//                     if(due_date_data[0].duration=="month"){
//                         dt.setMonth( dt.getMonth() + parseInt(duration) );
//                         // console.log("Due Date "+dt);
//                     }
                    
//                     await MyReflectIdModel.findOne({where:{deleted:"0",reflect_id:reflect_id}})
//                          .then(async(c_re_data)=>{
            
//                            UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
//                            MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
//                            await MyReflectIdModel.findOne({where:{deleted:"0",reflect_id:ver_ref_id},include:[UserModel]})
//                                .then(async(v_re_data)=>{
            
//                                 //    console.log("my reflect c $ v data",v_re_data,c_re_data)
                            
//                                     var  request_pin =   v_re_data.reflect_code+c_re_data.reflect_code+v_re_data.tbl_user_registration.user_pin
//                                     var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
//                                     var mystr = mykey.update(request_pin, 'utf8', 'hex')
//                                     mystr += mykey.final('hex');
//                                     var cript_64_request_pin = mystr
//                                 //   console.log("cript_64_request_pin",cript_64_request_pin)
            
            
            
//                                    await ClientVerificationModel.create({
//                                                     request_code:request_code,
//                                                     verifier_id:verifier_id,
//                                                     verifer_my_reflect_id:ver_ref_id,
//                                                     reflect_id:reflect_id,
//                                                     client_id:client_id,
//                                                     request_pin:cript_64_request_pin,
//                                                     p_category_id: p_cat_id,
//                                                     sub_category_id:sub_cat_id,
//                                                     due_date:dt
//                                                 })
//                                         .then(async(verifyRequest) =>{
//                                            // console.log("/////////////////////------",verifyRequest);
            
//                                            var request_id = verifyRequest.request_id;
//                                            await UserModel.findOne({ where: {reg_user_id: client_id} })
//                                            .then(async(userData) =>{
//                                                 await  NotificationModel.create({
//                                                                             notification_msg:`You have recieved a request from ${userData.full_name}.`,
//                                                                             sender_id:client_id,
//                                                                             receiver_id:verifier_id,
//                                                                             request_id:request_id,
//                                                                             notification_type:'1',
//                                                                             notification_date:new Date()
//                                                                 })
//                                                         .then(async(notification) =>{
//             // for(var i=0;i<doc_id.length;i++){
//                      var i=0;
//                 async.each(doc_id,async function (content, cb) {
                    
//                                 //   console.log("/////////////////////",doc_id[i]);
//                 await RequestDocumentsModel.create({request_id:request_id,user_doc_id:content,download:download[i],view:view[i],certified:certify[i],message:note}).then(async(success) =>{
//                                                 if(i==(doc_id.length-1)){
//                                                     await upload_water_mark();
//                                                 }
//                                                 // res.send("success");
//                                                 }).catch(err=>console.log("RequestDocumentsModel err",err))
//                                                 i++;
//                                         })
            
//            async function upload_water_mark(){
                        
//                             await db.query('SELECT * FROM tbl_request_documents WHERE request_id='+request_id+' AND deleted="0"',{ type:db.QueryTypes.SELECT}).then(async(requestDocumentData)=>{
//                                 var new_hash_array =[]
//                                 var countForSend = 0
//                                 for(var z=0; z<requestDocumentData.length;z++)
//                                 {
//                                     await db.query('SELECT * FROM tbl_request_documents INNER JOIN tbl_files_docs ON tbl_request_documents.user_doc_id=tbl_files_docs.user_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id= tbl_client_verification_requests.request_id WHERE tbl_request_documents.request_id='+request_id+' AND tbl_request_documents.deleted="0" AND tbl_files_docs.deleted="0" AND tbl_request_documents.user_doc_id='+requestDocumentData[z].user_doc_id,{ type:db.QueryTypes.SELECT}).then(async(SortrequestDocumentData)=>{
//                                     // console.log("/////////SortrequestDocumentData////////////",SortrequestDocumentData);
//                                         // new_hash_array.push(SortrequestDocumentData[0])
//                                     //    for(var k=0; k<SortrequestDocumentData.length; k++){
//                                         async.each(SortrequestDocumentData,async function (content1, cb) {
                        
//                                         //   var w_text="MY_reflect_"+content1.request_code;
//                                         var w_text="MY_reflect_"+c_re_data.reflect_code
//                                     //    var fun_hash =SortrequestDocumentData[k].file_content
//                                         var self_attested_hash =content1.self_attested_hash
                                        
//                                         var fun_hash;

//                                             if (self_attested_hash) {
//                                             fun_hash = content1.self_attested_hash
                                                
//                                                                 // console.log("IIIIIIIIIIIIIIIIIIIIIIIhello-----------1 ",fun_hash);

//                                             }
//                                             else
//                                             {
//                                                             fun_hash  = content1.file_content

//                                                                 // console.log("elseSSSSSSSSSSSSSSSSShello-----------1 ",fun_hash);

//                                             }
                                        
//                                         console.log("hello-----------1 ");
//                                             // await Jimp.create(720,520,'#ffffff',async function(err, nova_new) {
//                                         //  .then(async nova_new =>{
                                        

//                                             console.log("hello-----------2 ");
//                                             var a;


//                                 const delay = (duration) =>
//                                 new Promise(resolve => setTimeout(resolve, duration))
//                                     var srcImage;

//                             async function wait_hash(){
//                                     if (self_attested_hash) {
                                        
                            
//                                         await request(`https://ipfs.io/ipfs/${fun_hash}`, async function (error, response, body) {
//                                                                 // console.log("image-----------1 ",body);

//                                                                     if (  !error && response.statusCode == 200  ) {
                                                                                                                            
//                                                                 srcImage = dataUriToBuffer(body);
//                                                             }

//                                                                 // console.log("image-------srcImage----1 ",srcImage);

//                                                         })
//                                                                                                                 await delay(10000)

//                                                                 // console.log("image--------srcImage---1 ",srcImage);

                                                                
//                                                                 // console.log("image-----------1 ",srcImage);
//                                             }
//                                             else
//                                             {
//                                                             // fun_hash  = content1.file_content

//                                                                 srcImage = `https://ipfs.io/ipfs/${fun_hash}`

//                                                                 // console.log("elseSSSSSSSSSSSSSSSSShello-----------1 ",srcImage);

//                                             }  
//                                         }
//                                             console.log("before await");
//                                                                     await wait_hash();
                        
//                                                                     console.log("After await");
//                                                                 console.log("aer image-----------1 ",);
//                                             let icon_image =  await Jimp.read(__dirname+'/../../public/assets/images/logo-white.png')

//                                             console.log("icon_image.bitmap",icon_image.bitmap)

//                                                 a= await Jimp.read(srcImage,async function(err, image) {
//                                                     console.log("image.bitmap",image.bitmap)

//                                             // await Jimp.create(720,520,'#ffffff',async function(err, nova_new) {
//                                                 await Jimp.create(image.bitmap.width ,image.bitmap.height+((image.bitmap.width/4)+30),'#ffffff',async function(err, nova_new) {
//                                                     // await Jimp.create(400,1000,'green',async function(err, nova_new) {

//                                                     console.log("nova_new.bitmap",nova_new.bitmap)
//                                             //  .then(async image => {
//                                                 // var srcImage=blob_url.split(',')[1];
//                                                     console.log("image-----------1 ");

//                                                         // await image.resize(720, 520);

//                                                 console.log("hello-----------3 ");
//                                                 await icon_image.resize((image.bitmap.width/4)/2,(image.bitmap.width/4)/2);
//                                                 console.log("icon_image.resize",icon_image)
//                                                 var b;
//                                                 b=  await Jimp.loadFont(Jimp.FONT_SANS_12_BLACK ,async function(err, font) {
//                                             //    .then(async (font) => {
//                                                 console.log("hello-----------4 ");
//                                                 var c;
//                                                     // image.print(font,image.bitmap.width/2.5,image.bitmap.height,"image")
//                                                     // image.print(font,5,image.bitmap.height,"image")

//                                                     // nova_new.print(font,5,image.bitmap.height,w_text)
//                                                     if (!self_attested_hash) {

//                                                         nova_new.composite(icon_image,((image.bitmap.width)-(image.bitmap.width/4)),image.bitmap.height);
                        
//                                                         }

//                                                     nova_new.print(font,(image.bitmap.width/4)/3,image.bitmap.height,w_text,)
//                                                     // image.print(font,40,40,w_text,)

//                                                 nova_new.composite(image,0,0);
                                                
//                                                 //    nova_new.composite(icon_image,0,0);
//                                                 //    image.composite(icon_image,((image.bitmap.width)-(image.bitmap.width/4)/2),image.bitmap.height);

//                                                 //    nova_new.composite(image,-100,350);
//                                                 //    image.resize(200,200);
//                                                 console.log("nova_new.resize",nova_new)

                                            
//                                                 //   nova_new.composite(image,0,0);
                                                
//                                                 //   image.resize(200,200);
                                            
                                            
//                                                 //    let text_img = nova_new.getBase64Async(Jimp.MIME_PNG);
                                            
//                                                         console.log("hello-----------5 ");
//                                                         console.log("Jimp.MIME_PNG",Jimp.MIME_PNG);
//                                                     var d  = await   nova_new.getBase64Async(Jimp.MIME_PNG)
//                                                     // .exec(async function(err, result) {
//                                                     // .then(async(result) => {
//                                                             console.log("hello-----------6 ");
//                                                         //    let testBuffer = new Buffer(result);
//                                                             let testBuffer = new Buffer(d);
//                         /**---------------------------------------------------------------------------------------------------------*/                                  





//                         console.log("testBuffer===========>");



                        
                                                                
//                                     var e;
//                                                             e = await  ipfs.files.add(testBuffer, async function (err, file) {
//                                                                 if (err) {
//                                                                 console.log("err from ejs",err);
//                                                                 }else{
//                                                                 //    console.log("from ipfs ",file);
//                                                                     console.log("hello-----------7 ",file[0].hash);
//                                                                         await  RequestFilesModel.create({
//                                                                     request_doc_id:content1.request_doc_id,
//                                                                     request_file_hash:file[0].hash
//                                                                     }).then(async (dataForReturn)=>{
//                                                                     console.log("hello-----------8 ");
//                                                                     if(countForSend==(requestDocumentData.length-1)){
//                                                                         await finalRespone()
//                                                                     }
//                                                                     countForSend++
                                
//                                                                     return "dataForReturn"; 
//                                                                     })
                                
//                                                                 }
                                                                                            
//                                                             })
                                                    
                                                            
//                                     }) 
                                    
//                                             })
                                            
//                                         });//
                        
                        
//                                     })
                        
                        
                                        
//                                     })
//                                 }
                                    
//                                 })
//             }
            
//             async function finalRespone(){
//                 res.send("success")
//             }
            
            
//                                                          })
//                                                          .catch(err=>console.log("notification err",err))
//                                             })
//                                             .catch(err=>console.log("notification err err",err))
            
//                                          })
//                                          .catch(err=>console.log("notification err err ",err))
//                                 })
//                                 .catch(err=>console.log("err client",err))
//                           })
//                           .catch(err => console.log("err v_code",err))
//               });  

//    }
/**request-doc Post method End**/

/** request-doc-checked Post Method Start  **/
exports.request_doc_check = (req,res,next) =>{
    var client_id = req.session.user_id;

    var reflect_id = req.body.reflect_id;
    var verifier_id = req.body.verifier_id;
    var doc_id =[];
    var download =[];
    var view =[];
    var certify =[];

    doc_id = JSON.parse(req.body.total_doc);
    download = JSON.parse(req.body.download);
    view = JSON.parse(req.body.view);
    certify = JSON.parse(req.body.certify);
    console.log(".....*******.....",doc_id);
    ClientVerificationModel.create({verifier_id:verifier_id,
        reflect_id:reflect_id,
        client_id:client_id}).then(verifyRequest =>{
            console.log("/////////////////////------",verifyRequest);
            
        var request_id = verifyRequest.request_id;
        
        for(var i=0;i<doc_id.length;i++){
            console.log("/////////////////////",doc_id[i][0].user_doc_id);
            RequestDocumentsModel.create({request_id:request_id,user_doc_id:doc_id[i][0].user_doc_id,download:download[i],view:view[i],certified:certify[i]}).then(success =>{
                res.send("success");
            })
        }
    })    
}
/** request-doc-checked Post Method End  **/

/** request-doc-individual Post Method Start  **/
exports.request_doc_individual = async (req,res,next) =>{
    var client_id = req.session.user_id;
    const request_code = generateUniqueId({
        length: 6,
        useLetters: false
      });
    var reflect_id = req.body.reflect_id;
    var verifier_id = req.body.verifier_id;
    var ver_ref_id = req.body.verifier_reflect_id;
    var doc_id =req.body.doc_id;
    var download =req.body.download;
    var view =req.body.view;
    var certify =req.body.certify;
    var msg = req.body.msg;
    console.log("------------------msg ",msg);

    await ClientVerificationModel.create({request_code:request_code,verifier_id:verifier_id,verifer_my_reflect_id:ver_ref_id,
        reflect_id:reflect_id,
        client_id:client_id}).then(verifyRequest =>{
        var request_id = verifyRequest.request_id;
            RequestDocumentsModel.create({request_id:request_id,user_doc_id:doc_id,download:download,view:view,certified:certify,message:msg}).then(success =>{
                console.log("sssssssssssssss",success);
                res.send("success");
            })
    })    
}
/** request-doc-individual Post Method End  **/

/** request-check-pin Post Method Start  **/
exports.request_check_pin = (req,res,next) =>{
    var otp = req.body.pin;
    var user_id = req.session.user_id;
    console.log("-----------------------",user_id);
    UserModel.findOne({where:{reg_user_id:user_id}}).then(user =>{
        if(decrypt(user.user_pin)!=otp){
            res.send("");
        }else{
            var data ={
                success_data:"success"
            }
            res.send(data);
        }
    })
}
/** request-check-pin Post Method End  **/

/** self-attested Post Method Start  **/
exports.self_attested = async (req,res,next) =>{
    console.log("*****************************************************self_attested start******************************************")

   var user_doc_id = req.body.attested_doc_id;
   var blob_url = req.body.blob_url;
   var reflect_id = req.body.reflect_id;
   var text_for_signature = req.body.text_for_signature;
   let name_details = " ";
   var user_id = req.session.user_id;
   let date = new Date()
    //    text_for_signature =  text_for_signature+" - "+new Date()
    //    console.log('&&&&&&&&&&&&&&&&&&&&& text_for_signature',text_for_signature)
   let attachments=[];
   // console.log("sign",blob_url);
   // console.log("user_doc_id",user_doc_id);
   var hashes =[];
   console.log("reflect_id.....",reflect_id)

  await MyReflectIdModel.findOne({where:{reflect_id:reflect_id}})
  .then( async dataOfReflect=>{

      console.log("data",dataOfReflect)
      let reflect_code = dataOfReflect.reflect_code

    if(dataOfReflect.entity_company_name)
    {
        name_details = dataOfReflect.entity_company_name;
    }
    else  if(dataOfReflect.rep_firstname)
    {
        name_details = dataOfReflect.rep_firstname;

    }
    else
    {
        name_details = dataOfReflect.full_name;

    }
  let  objOFNames ={
                reflect_code,
                name_details,
                text_for_signature

  }

   await FilesDocModel.findAll({where:{user_doc_id:user_doc_id,type:{ [sequelize.Op.not]: 'video'},deleted:'0'}}).then(async all_doc_hash =>{
       
    console.log("all_doc_hash",all_doc_hash)
      
      for(var i=0;i<all_doc_hash.length;i++){

        hashes.push({hash : all_doc_hash[i].file_content, type:all_doc_hash[i].type});
          
       }

     //  console.log("-------hashes---------" ,hashes);
        await DocumentReflectIdModel.update({self_assested:'yes',dig_signature:blob_url},{where:{ user_doc_id: user_doc_id} })
        .then(async results =>{
            
            
            for(var j=0;j<hashes.length;j++){

                fun_hash = hashes[j].hash;
                var j_val,hashes_length;
                hashes_length=hashes.length;
                j_val=j+1;

                if (hashes[j].type == "image") {
                
                    console.log('&&&&&&&&&&&&&&&&&&&&& j_val : ',j_val,' hashes_length : ',hashes.length,text_for_signature)
    
                    var data_img=await get_digi_hash(fun_hash,blob_url,user_doc_id,user_id,j_val,hashes_length ,objOFNames);
    
    
                } else {
    
                    console.log("this is the pdf=============================================")

                    var srcImage=blob_url.split(',')[1];
                    const buff = Buffer.from(srcImage,'base64');
                    buff.toString();

                    const run = async (OldHash ,j_val,hashes_length) => {
                        
                     let promins = new Promise(async (resolve ,reject)=>{
                            console.log("hello 0")

                            const url = `https://ipfs.io/ipfs/${hashes[j].hash}`

                            const pdf1 = await fetch(url).then(res => res.arrayBuffer())
                            console.log("pdf1 : ",pdf1)
                            resolve(pdf1)    

                         
                     })

                   await  promins.then(async pdf1 =>{

                    // console.log("pdf1 ",pdf1)
                    // const fileUrl = new URL(`https://ipfs.io/ipfs/${hashes[j].hash}`);
                        
                       

            // const pdfDoc = await PDFDocument.load(pdf1)

                         console.log("hello 1")
                        const pdfDoc = await PDFDocument.load(pdf1);
                       
                        console.log("hello 2")

                        const img = await pdfDoc.embedPng(buff);
                        const img_icon = await pdfDoc.embedPng(fs.readFileSync(__dirname+'/../../public/assets/images/logo-white.png'));

                        console.log("hello 3")
                        // let icon_image =  await Jimp.read(__dirname+'/../../public/assets/images/logo-white.png')

                        // console.log(" pathToPDF ",fs.readFileSync(pathToImage))
                        // console.log(" pathToImage ",img)
                        
                        var name_text = objOFNames.name_details+"- "+objOFNames.reflect_code
                       const imagePage = pdfDoc.insertPage(0);
                        console.log("hello 4")
                            
                       date = date.toString()
                        imagePage.drawText(date, { x:0, y: 75, size: 8 })

                        imagePage.drawText(name_text, { x:10, y: 95, size: 10 })

                        if(objOFNames.text_for_signature){
                            imagePage.drawText(objOFNames.text_for_signature, { x:10, y: 80, size: 10 })
                        }

                        console.log("hello 5")

                        imagePage.drawImage(img, {
                        x: 0,
                        y: 105,
                        width: imagePage.getWidth()/5,
                        height: imagePage.getHeight()/5
                        });
                        imagePage.drawImage(img_icon, {
                            x: 200,
                            y: 300,
                            width: imagePage.getWidth()/3,
                            height: imagePage.getHeight()/3
                            });
                        console.log("hello 6")

                        const pdfBytes = await pdfDoc.save();
                        console.log("hello 7")

                        
                        let testBuffer = new Buffer(pdfBytes);
                        
                        console.log(" pathToImage ",testBuffer)
                        console.log("hello 8")

                        await  ipfs.files.add(testBuffer, async function (err, file) {
                            if (err) {
                          //  console.log("err from ejs",err);
                            }

                            console.log("from ipfs self_attested_hash:file[0].hash text_img",file[0].hash);

                      await  FilesDocModel.update({self_attested_hash:file[0].hash},{where:{ file_content: OldHash} })
                      .then(async (success) => {
                                    // console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& user_doc_id &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& : ')

                        //   console.log('&&&&&&&&&&&&&&&&&&&&& j_val : ',j_val,' hashes_length : ',hashes_length)


                            // console.log("hello-----------4333333333 success.user_doc_id result ",user_doc_id);  
                            if(j_val == hashes_length)
                            {
                            //  console.log('INNER  j_val : ',j_val,' hashes_length : ',hashes_length)

                              await  selfAttestedMail(user_doc_id,user_id);
                            }
                          
                            // return new Promise(resolve => {
                            //    resolve(result);  
                            // });
                         })
                    
                        })
                     })
                        
                        
                        }


                    await  run(hashes[j].hash ,j_val,hashes_length);
    
                }


                if ( j == hashes.length-1) res.send("success");
               
           
           
            }


                        // res.send("success");

        })
   })

   
})
.catch(err =>{
    console.log("errr",err)
})

  
}
/** self-attested Post Method End  **/

const example = async function(fun_hash,blob_url){
    var fun_hash=fun_hash;
    var blob_url=blob_url;
   var data=await get_digi_hash(fun_hash,blob_url);
   console.log("data",data);
    return "Barkha";
}

const get_digi_hash= async function(fun_hash,blob_url,user_doc_id,user_id,j_val,hashes_length,obj_for_text){
    
    var sign_note;
    let reflect_code;
    let  reflect_name;

    if(obj_for_text!=undefined &&obj_for_text!=null&&obj_for_text!=""){

        sign_note    =   obj_for_text.text_for_signature;
        reflect_code =   obj_for_text.reflect_code;
        reflect_name =   obj_for_text.name_details;

    }  
   
  
      let icon_image =  await Jimp.read(__dirname+'/../../public/assets/images/logo-white.png')
     
    
        await Jimp.read(`https://ipfs.io/ipfs/${fun_hash}`).then(async image => {

        await Jimp.create(image.bitmap.width ,((image.bitmap.height)+((image.bitmap.width/4)+30)) ,'#ffffff').then(async nova_new =>{
 
        // await Jimp.read(`https://ipfs.io/ipfs/${fun_hash}`).then(async image => {
 console.log("############################################################################################################",obj_for_text)
 console.log(image.bitmap) 
 console.log("############################################################################################################")                                 
 

   
            var srcImage=blob_url.split(',')[1];

        console.log("hello-----------self attested 2 ",image);
    
            //  await image.resize(720, 520);

            const buff = Buffer.from(srcImage,'base64');
            buff.toString();
        

            await Jimp.read(buff).then(async newimage => {

                console.log("2222############################################################################################################")
                
                await newimage.resize(image.bitmap.width/4,image.bitmap.width/4);
                await icon_image.resize((image.bitmap.width/4)/2,(image.bitmap.width/4)/2);
                console.log(newimage.bitmap) 
                console.log("2222############################################################################################################",image.bitmap.height) 
                // var hightOftext = image.bitmap.height
            await Jimp.loadFont(Jimp.FONT_SANS_12_BLACK).then(async font => {
                // console.log("@@@@@@@@@",hightOftext)
                    //   await  newimage.print(font,newimage.bitmap.width/2.5,newimage.bitmap.height/2.5,sign_note);
                    let temp =  reflect_name+'-'+reflect_code 
                    let tempDate =sign_note+"-"+new Date()  
                    await  nova_new.print(font,(image.bitmap.width/4)/3,((image.bitmap.height)+((image.bitmap.width/4))),tempDate);

                      await  nova_new.print(font,(image.bitmap.width/4)/3,(((image.bitmap.height)+(image.bitmap.width/4))+15),temp);

                 
                    
                        
            });
        
            nova_new.composite(image,0,0);
            // nova_new.composite(newimage,-100,350);
            nova_new.composite(newimage,0,image.bitmap.height);
            nova_new.composite(icon_image,((image.bitmap.width)-(image.bitmap.width/4)/2),image.bitmap.height);
            // newimage.resize(200,200);
            // newimage.resize(500,500);

            //       nova_new.composite(image,0,0,{
            //   mode: Jimp.BLEND_SOURCE_OVER,
            //   opacityDest: 1,
            //   opacitySource: 0.5
            // })
  //        newimage.resize(1024, 768, Jimp.RESIZE_BEZIER, function(err){ 
  //     if (err) throw err; 
  // })
        
                let text_img = nova_new.getBase64Async(Jimp.MIME_PNG);
        
                    console.log("hello-----------3 ");
        
                    text_img.then(async result => {
                        // let testFile = fs.readFileSync(result);
                        
                        let testBuffer = new Buffer(result);

                     await  ipfs.files.add(testBuffer, function (err, file) {
                            if (err) {
                          //  console.log("err from ejs",err);
                            }
                                            console.log("hello-----------self attested 34");

                            console.log("from ipfs self_attested_hash:file[0].hash text_img",file[0].hash);

                        FilesDocModel.update({self_attested_hash:file[0].hash},{where:{ file_content: fun_hash} }).then(async (success) => {
                                    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& user_doc_id &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& : ')

                          console.log('&&&&&&&&&&&&&&&&&&&&& j_val : ',j_val,' hashes_length : ',hashes_length)


                            console.log("hello-----------4333333333 success.user_doc_id result ",user_doc_id);  
                            if(j_val===hashes_length)
                            {
                             console.log('INNER  j_val : ',j_val,' hashes_length : ',hashes_length)

                              await  selfAttestedMail(user_doc_id,user_id);
                            }
                          
                            return new Promise(resolve => {
                               resolve(result);  
                            });
                         })
                    
                        })
                    });
            
            })
            .catch(err => {
                console.log('error',err);
            
            });
        
        });
    });

          
}

/** upload-new-doc-rep Post Method Start  **/
exports.upload_new_doc_rep = (req,res,next) =>{

    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        if (err) {
         console.log(err);
        }

        var user_doc_id = fields.user_doc_id;
        var reflect_id = fields.reflect_id; 

        var type = fields.value_o1; 
console.log("-----------files------------ ",files);
console.log("-----------user_doc_id------------ ",user_doc_id);
console.log("-----------type------------ ",type);

   let testFile = fs.readFileSync(files.staff_image.path);
  let testBuffer = new Buffer(testFile);

  ipfs.files.add(testBuffer, function (err, file) {
    if (err) {
      console.log("err from ejs",err);
    }
   
    FilesDocModel.create({user_doc_id:user_doc_id,file_content:file[0].hash,type:type}).then(doc_content =>{
        console.log("-----------new video added------------ ",file[0]);

    MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
        console.log("-----------type------------ ",req.session.user_type);

       if(req.session.user_type=='client'){
        if ( result.reflectid_by == "entity" ) {
           
            res.redirect('/entity?reflect_id='+result.reflect_id);

        } else {

            res.redirect('/view-reflect-id?id='+result.reflect_code);

        }
       }else{
        res.redirect('/myreflect-verifier-view?id='+result.reflect_code);

       }
       
        
    });    

    })
   

}) 
}); 
 }
/** upload-new-doc-rep Post Method End  **/

/** get-category-list Post Method Start  **/
exports.get_category_list = (req,res,next) =>{
    var reflect_id = req.body.reflect_id;
    db.query("select * from tbl_verifier_category_reflectids inner join tbl_verifier_request_categories ON tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id WHERE tbl_verifier_request_categories.deleted='0' and tbl_verifier_request_categories.parent_category='0' and tbl_verifier_category_reflectids.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(function(categories){
        console.log("-----------categories--------------",categories);
        res.render("front/myReflect/ajax_category",{
            categories:categories
        });
    });
} 
/** get-category-list Post Method End  **/ 

/** get-sub-category-list Post Method Start  **/
exports.get_sub_category_list = (req,res,next) =>{
    var category_id = req.body.category_id;
    db.query("select * from tbl_verifier_request_categories WHERE deleted='0' and parent_category="+category_id,{ type:db.QueryTypes.SELECT}).then(function(sub_categories){
        console.log("-----------categories--------------",sub_categories);
        res.render("front/myReflect/ajax_sub_category",{
            sub_categories:sub_categories
        });
    });
}
/** get-sub-category-list Post Method End  **/

// db.query("select * from tbl_manage_category_documents inner join tbl_documents_masters ON tbl_manage_category_documents.doc_id=tbl_documents_masters.doc_id WHERE tbl_manage_category_documents.deleted='0' and tbl_manage_category_documents.category_id="+category_id,{ type:db.QueryTypes.SELECT}).then(function(requested_docs){

/** get-requested-doc Post Method Start  **/
exports.get_requested_doc = async (req,res,next) =>{
        console.log("./././.---------------get_requested_doc start------------------------------------------------./././/. ");
        var category_id = req.body.category_id;
        var reflect_id = req.body.reflect_id;
       
       console.log(" reflect_idreflect_idreflect_id : ",reflect_id)

        var new_test_array=[];
        var requested_doc_array=[];
        var documents;
        await db.query("select * from tbl_manage_category_documents WHERE include='yes' AND deleted='0' and category_id="+category_id,{ type:db.QueryTypes.SELECT}).then(async function(cat_docs){
            console.log("---------------cat_docs 1-------------- ",cat_docs);
            requested_doc_array=cat_docs;
    
              if(req.body.verifier_data === 'yes'){
                    documents = ''
              }else{
                     // await db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.deleted='0' and tbl_myreflectid_doc_rels.reflect_id="+reflect_id+" and tbl_myreflectid_doc_rels.doc_id IN (select DISTINCT doc_id from tbl_manage_category_documents INNER JOIN tbl_category_documents on tbl_manage_category_documents.category_doc_id=tbl_manage_category_documents.category_doc_id WHERE tbl_category_documents.deleted='0' and include='yes' AND tbl_manage_category_documents.deleted='0' and category_id="+category_id+")",{ type:db.QueryTypes.SELECT}).then(async function(documents1){
                      await db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.deleted='0' and tbl_myreflectid_doc_rels.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(documents1){

                         documents = documents1
                        })
              }
                
            for(var i=0;i<cat_docs.length;i++){
                var category_doc_id = cat_docs[i].category_doc_id;
                console.log("---------------cat_docs_id-------------- ",cat_docs[i].category_doc_id);
             await  db.query("select * from tbl_category_documents inner join tbl_documents_masters ON tbl_category_documents.doc_id=tbl_documents_masters.doc_id WHERE tbl_category_documents.deleted='0' and tbl_category_documents.category_doc_id="+category_doc_id,{ type:db.QueryTypes.SELECT})
              .then(async function(requested_docs){
                        console.log("---------------requested_docs-------------- ",requested_docs);
                        console.log("---------------cat_docs[i]-------------- ",cat_docs[i]);
                        console.log("---------------cat_docs_iner_id-------------- ",cat_docs[i].category_doc_id);
                // console.log("---------------cat_docs[i]-------------- ",cat_docs[i]);
             if(requested_docs[0]!=null){
                requested_doc_array[i].document_name = requested_docs[0].document_name
                new_test_array.push(requested_doc_array[i]) ;
                console.log("-----------categories_inner--------------",requested_doc_array);
             }
                      
                    })
             
            }
             console.log("-----------categories_outer--------------",new_test_array);
           
           
        async function forsend(){
                res.render("front/myReflect/ajax_category_docs",{
                    requested_docs:new_test_array,
                    documents
                });
            }
            await forsend();
          
        });
}
 /** get-requested-doc Post Method End  **/   

//***********************entity start******************

/** entity Get Method Start  **/
exports.Entity = async(req,res,next )=> {
    
    var certified =[];
    var user_id = req.session.user_id;
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var ref_id= req.query.reflect_id
    var wallet_id = req.query.wallet_id
    var reflect_code = req.query.reflect_code
    var reflectid_by="entity"
    var  reg_user_id=req.session.user_id
    var  user_as = req.session.user_type 
    var doc_data = []
    if(ref_id!=null){
        console.log(".........................@@@@@@entity@@@@..................")
    //    MyReflectIdModel.findOne({where:{reflect_id:ref_id,deleted:"0"}})
     await  db.query('SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id where tbl_wallet_reflectid_rels.deleted="0" AND tbl_wallet_reflectid_rels.reflect_id='+ref_id,{ type:db.QueryTypes.SELECT})
       .then(async(result) => {
         await  DocumentReflectIdModel.findAll({where:{reflect_id:ref_id}}).then(async(doc_data)=>{
 
           await  db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.reflect_id="+ref_id,{ type:db.QueryTypes.SELECT}).then(async function(document){
                 var documents;
                //  if(document==""){
                   documents = null;
                //  }else{
                     documents=document;
               //   console.log("---------doc_content----------123",documents);
               for(var i=0;i<document.length;i++){
                //    console.log(i);
                   var doc_id=document[i].user_doc_id;
                   //console.log("doc_id",doc_id);
                   var all_doc_content =[];
                   var all_video_content=[];
                   let all_self_attested =[];
                   var all_pdf_content = [];

                   var counter=0;

                 await db.query("SELECT * FROM tbl_files_docs where deleted='0' and user_doc_id="+doc_id,{ type:db.QueryTypes.SELECT}).then(async doc_content=>{
                    
                    //await doc_content.forEach(async content =>{
                        async.each(doc_content,async function (content, cb) {

                        if(content.type=='image'){


                            all_doc_content.push(content.file_content);
                           

                           
                                    if(content.self_attested_hash){

                                        // console.log("content.file_content",content.self_attested_hash);
                                        var url1='https://ipfs.io/ipfs/';
                                        var url2=content.self_attested_hash;
                                        var final_url=url1.concat(url2);
                        // 
                                        // console.log('final url',final_url);


                                        // console.log("content.self",content.self_attested_hash);

                                    // console.log('https://ipfs.io/ipfs/'+content.self_attested_hash);
                                    

                                        await request(final_url,callback);


                                    function callback(error, response, body) {
                                        
                                        if(!error){

                                            //return body;

                                        all_self_attested.push({hash:body,type:"image"}); 

                                        //    console.log("length",all_self_attested.length);
                                                                
                                        }
                                                        
                                    }

                                    //  console.log("self attested 1---",all_self_attested);

                                    
                                                        
                                                    }
                        }
                        else if(content.type=='pdf')
                        {

                            all_pdf_content.push(content.file_content);

                             if(content.self_attested_hash){

                                        all_self_attested.push({hash:content.self_attested_hash,type:"pdf"}); 


                                    
                                                        
                              }

                        }else{
                            all_video_content.push(content.file_content);

                        }
                        
                        
                     
                           // cb(null);
                        //console.log(' ------------------------c b-----------fgdfg',res_data);
                        // all_self_attested.push(data);cb();
                        
                        }, function (err) { // called once all iteration callbacks have returned (or an error was thrown)
                        if (err) { console.log("err",err); }
                        // console.log('all_self_attested')
                        // console.log(all_self_attested); // Final version of eventList
                    });
                })
                    // console.log("---------doc_content---------- ",all_self_attested);


                     documents[i].file_content = all_doc_content;
                     documents[i].video_content = all_video_content;
                     documents[i].self_attested_content = all_self_attested;
                     documents[i].all_pdf_content = all_pdf_content;
                       
                        // var all_docs = all_doc_content.join(',');
                       
                        console.log("---------all_pdf_content---------- ",i," all doc data ",all_pdf_content);

               }
                //   console.log("---------doc_content---------- ",documents);
                  setTimeout(fordocuments,10000);
                 
                  function fordocuments(){
                 CountryModel.findAll().then(async (allCountries)=>{
                 DocumentMasterModel.findAll({where:{deleted:"0",status:"active",document_type:"master"}}).then(async(docMasterData)=>{
 
                //   await  db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id where NOT tbl_client_verification_requests.request_status='pending' and tbl_client_verification_requests.deleted='0' and tbl_client_verification_requests.client_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async certified_data=>{
                    await  db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels  ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id where NOT tbl_client_verification_requests.request_status='pending' and tbl_client_verification_requests.deleted='0' and tbl_client_verification_requests.client_id="+user_id+" AND tbl_client_verification_requests.reflect_id="+ref_id,{ type:db.QueryTypes.SELECT}).then(async certified_data=>{
                        // console.log("certified_data 2",certified_data);
                        if(certified_data.length>0){
                            for(var b=0;b<certified_data.length;b++){
                                // await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id+" and tbl_request_documents_files.docfile_status<>'pending'",{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
                                     // await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id+" and tbl_request_documents_files.docfile_status<>'pending'",{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
                                        await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id+" and tbl_request_documents_files.docfile_status<>'pending' GROUP BY tbl_request_documents_files.request_doc_id" ,{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{


                                        //   console.log("certified_doc_data entity",certified_doc_data);
                               
                                           
                                certified.push({certified_data:certified_data,certified_doc_data:certified_doc_data});

                                            if(b==(certified_data.length-1)){

                                                sendrender()

                                            }

                                })
                            }
                        }  else    {  
                            sendrender()
                          }
                     function   sendrender(){

                        // console.log("certified  %%%%%%%%%%%%%%%%%%%%%%%%%",certified);

                        res.render('front/myReflect/my-reflet-id-view-for-entity',{
                            success_msg,
                            err_msg,
                            session:req.session,
                            myreflectEntityData :result[0],
                            reflect_id:result[0].reflect_id,
                            DocData: document,
                            allCountries,
                            docMasterData,
                            moment,
                            documents,
                            certified
                        })

                    }

                    })
 
                 })
             })
            }
        // }
         })
     })
 
     })
 
 
 }else{
    
                 MyReflectIdModel.create({reflect_code:reflect_code,
                     reflectid_by:reflectid_by,
                     reg_user_id:reg_user_id,
                     user_as:user_as,
                     wallet_id:wallet_id })
                     .then(result=>{
                        admin_notification("Client  has been create new Reflect Id as entity.",reg_user_id,result.reflect_id,"3")
                        //  MyReflectIdModel.findOne({where:{reflect_id:result.reflect_id,deleted:"0"}})
                        db.query('SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id where tbl_wallet_reflectid_rels.deleted="0" AND tbl_wallet_reflectid_rels.reflect_id='+result.reflect_id,{ type:db.QueryTypes.SELECT})
                         .then(result => {
                             DocumentReflectIdModel.findAll({where:{reflect_id:result[0].reflect_id}}).then(doc_data=>{
                     
                                 db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.reflect_id="+result[0].reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(document){
                                     var documents;
                                     if(document==""){
                                       documents = null;
                                     }else{
                                         documents=document;
                                   //   console.log("---------doc_content----------123",documents);
                                      for(var i=0;i<document.length;i++){
                                       //    console.log(i);
                                          var doc_id=document[i].user_doc_id;
                                        //   console.log("doc_id",doc_id);
                                          var all_doc_content =[];
                                       var doc_content = await db.query("SELECT * FROM tbl_files_docs where tbl_files_docs.user_doc_id="+doc_id,{ type:db.QueryTypes.SELECT});
                                           // console.log("---------doc_content---------- ",doc_content);
                                           doc_content.forEach(content =>{
                                               all_doc_content.push(content.file_content);
                                               
                                               })
                                               // var all_docs = all_doc_content.join(',');
                                               documents[i].file_content = all_doc_content;
                                       
                                      }
                                    //   console.log("---------doc_content---------- ",documents);
                                     }
                                     CountryModel.findAll().then(allCountries=>{
                                         DocumentMasterModel.findAll({where:{deleted:"0",status:"active",document_type:"master"}}).then(async(docMasterData)=>{
                                        //     db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id where NOT tbl_client_verification_requests.request_status='pending' and tbl_client_verification_requests.deleted='0' and tbl_client_verification_requests.client_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async certified_data=>{
                                        //         console.log("certified_data 2",certified_data);
                                        //         if(certified_data.length>0){
                                        //             for(var b=0;b<certified_data.length;b++){
                                        //                 await db.query("SELECT * FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id,{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
                                            await  db.query("SELECT * FROM tbl_client_verification_requests INNER JOIN tbl_wallet_reflectid_rels  ON tbl_client_verification_requests.verifer_my_reflect_id=tbl_wallet_reflectid_rels.reflect_id where NOT tbl_client_verification_requests.request_status='pending' and tbl_client_verification_requests.deleted='0' and tbl_client_verification_requests.client_id="+user_id+" AND tbl_client_verification_requests.reflect_id="+result[0].reflect_id,{ type:db.QueryTypes.SELECT}).then(async certified_data=>{
                                                // console.log("certified_data 2",certified_data);
                                                if(certified_data.length>0){
                                                    for(var b=0;b<certified_data.length;b++){
                                                        // await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id,{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
                                                            await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id+" and tbl_request_documents_files.docfile_status<>'pending' GROUP BY tbl_request_documents_files.request_doc_id" ,{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
                                                        // console.log("certified_doc_data ",certified_doc_data);
                                                        certified.push({certified_data:certified_data,certified_doc_data:certified_doc_data});
                                                        if(b==(certified_data.length-1)){

                                                            sendrender()
            
                                                        }
                                                        })
                                                    }
                                                }  else    {  
                                                    sendrender()
                                                  }
                 
function sendrender(){
                                             res.render('front/myReflect/my-reflet-id-view-for-entity',{
                                                 success_msg,
                                                 err_msg,
                                                 session:req.session,
                                                 myreflectEntityData :result[0],
                                                 reflect_id:result[0].reflect_id,
                                                 DocData: document,
                                                 allCountries,
                                                 docMasterData,
                                                 documents,
                                                 moment,
                                                 certified
                                             })
                  }


                                            })
                                         })
                             })
                         })
                         })
                     
                         })
 
                       
     }).catch(err=>{
        console.log("err",err)
        res.redirect(`/entity?reflect_id=${ref_id}`)
     });
 
          
 }
  
 
    
 }
/** entity Get Method End  **/

/** submit_myreflect_entity Post Method Start  **/
exports.submitEntity = async(req,res,next) =>{
    var reflect_id = req.body.reflect_id.trim();
     var phone_no = req.body.phone_no;
    var company_email = req.body.company_email;
    var registration_No = req.body.registration_No;
    var country_name = req.body.country_name;
    var company_address = req.body.company_address;
    var company_name = req.body.company_name;
    // var btc_wallet_address = req.body.btc_wallet_address;
    // var eth_wallet_address = req.body.eth_wallet_address;
    // var rep_nationality = req.body.nationality;
    var dateofInco = req.body.date;
console.log("country_name..",country_name)
console.log("reflect_id..",reflect_id)

console.log("country_name..",company_name)

console.log("country_name..",dateofInco)


   
    if(country_name!=undefined){
        CountryModel.findOne({where:{country_name:country_name}}).then(async(countryupdate) =>{
            var country_id_new = countryupdate.country_id;
            console.log("country_id_new..",country_id_new)
           var con_id = parseInt(country_id_new)

           await MyReflectIdModel.update({entity_company_country:con_id},{where:{ reflect_id: reflect_id} }).then( (success) => {
            //   console.log("country_name..",success)

            //     MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
            //         var wall_id = result.wallet_id;
            //         var country_id = result.entity_company_country;
                    // if(country_id!=null){
                    //     CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                    //         UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    //         WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    //         WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                    //             console.log("userdatatat.,.,.,.,.,.",user)
                                // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                                // res.render('front/myReflect/my-reflet-id-view-for-entity',{
                                //     success_msg,
                                //     err_msg,
                                //     session:req.session,
                                //     myreflectEntityData :result,
                                //     reflect_id:result.reflect_id,
                                //     moment
                                // })
                                res.redirect(`/entity?reflect_id=${reflect_id}`)
                        //     })
                        // })
                    // }else{
                        // var country = "";
                        // UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        // WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        // WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                            // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                            // res.render('front/myReflect/my-reflet-id-view-for-entity',{
                            //     success_msg,
                            //     err_msg,
                            //     session:req.session,
                            //     myreflectEntityData :result,
                            //     reflect_id:result.reflect_id,
                            //     moment
                            // })
                            // res.redirect(`/entity?reflect_id=${reflect_id}`)
                     
                       
                    //     })
                    // }
                // })
            
            })
        })
    } else if(dateofInco!=undefined){
        MyReflectIdModel.update({entity_dateof_incorporation:dateofInco},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                var wall_id = result.wallet_id;
                var country_id = result.entity_company_country;
                if(country_id!=null){
                    CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                            // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                            // res.render('front/myReflect/my-reflet-id-view-for-entity',{
                            //     success_msg,
                            //     err_msg,
                            //     session:req.session,
                            //     myreflectEntityData :result,
                            //     reflect_id:result.reflect_id,
                            //     moment
                            // })
                            res.redirect(`/entity?reflect_id=${reflect_id}`)
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                        // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                        // res.render('front/myReflect/my-reflet-id-view-for-entity',{
                        //     success_msg,
                        //     err_msg,
                        //     session:req.session,
                        //     myreflectEntityData :result,
                        //     reflect_id:result.reflect_id,
                        //     moment
                        // })
                        res.redirect(`/entity?reflect_id=${reflect_id}`)
                   
                    })
                }
            })
        
        })
    }else if(company_name!=undefined){
        MyReflectIdModel.update({entity_company_name:company_name},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                var wall_id = result.wallet_id;
                var country_id = result.entity_company_country;
                if(country_id!=null){
                    CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                            // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                            // res.render('front/myReflect/my-reflet-id-view-for-entity',{
                            //     success_msg,
                            //     err_msg,
                            //     session:req.session,
                            //     myreflectEntityData :result,
                            //     reflect_id:result.reflect_id,
                            //     moment
                            // })
                            res.redirect(`/entity?reflect_id=${reflect_id}`)
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                        // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                        // res.render('front/myReflect/my-reflet-id-view-for-entity',{
                        //     success_msg,
                        //     err_msg,
                        //     session:req.session,
                        //     myreflectEntityData :result,
                        //     reflect_id:result.reflect_id,
                        //     moment
                        // })
                        res.redirect(`/entity?reflect_id=${reflect_id}`)
                   
                    })
                }
            })
        
        })
    }else if(company_address!=undefined){
        MyReflectIdModel.update({entity_company_address:company_address},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                var wall_id = result.wallet_id;
                var country_id = result.entity_company_country;
                if(country_id!=null){
                    CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                            // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                            // res.render('front/myReflect/my-reflet-id-view-for-entity',{
                            //     success_msg,
                            //     err_msg,
                            //     session:req.session,
                            //     myreflectEntityData :result,
                            //     reflect_id:result.reflect_id,
                            //     moment
                            // })
                            res.redirect(`/entity?reflect_id=${reflect_id}`)
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                        // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                        // res.render('front/myReflect/my-reflet-id-view-for-entity',{
                        //     success_msg,
                        //     err_msg,
                        //     session:req.session,
                        //     myreflectEntityData :result,
                        //     reflect_id:result.reflect_id,
                        //     moment
                        // })
                        res.redirect(`/entity?reflect_id=${reflect_id}`)
                   
                    })
                }
            })
        
        })
    }else if(registration_No!=undefined){
        MyReflectIdModel.update({entity_company_regno:registration_No},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                var wall_id = result.wallet_id;
                var country_id = result.entity_company_country;
                if(country_id!=null){
                    CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                            // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                            // res.render('front/myReflect/my-reflet-id-view-for-entity',{
                            //     success_msg,
                            //     err_msg,
                            //     session:req.session,
                            //     myreflectEntityData :result,
                            //     reflect_id:result.reflect_id,
                            //     moment
                            // })
                            res.redirect(`/entity?reflect_id=${reflect_id}`)
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                        // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                        // res.render('front/myReflect/my-reflet-id-view-for-entity',{
                        //     success_msg,
                        //     err_msg,
                        //     session:req.session,
                        //     myreflectEntityData :result,
                        //     reflect_id:result.reflect_id,
                        //     moment
                        // })
                        res.redirect(`/entity?reflect_id=${reflect_id}`)
                   
                    })
                }
            })
        
        })
    }else if(company_email!=undefined){


        MyReflectIdModel.update({entity_company_emailid:encrypt(company_email),},{where:{ reflect_id: reflect_id} }).then(async (success) => {


           var smtpTransport = nodemailer.createTransport({
                      service: 'gmail',
                      auth: {
                               user: 'info.myreflet@gmail.com',
                               pass: 'myquest321'
                      }
              });
                      const mailOptions = {
                        to: company_email,
                        from: 'questtestmail@gmail.com',
                        subject: "Verifiy Email For Entity.",
                  
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
                                <p>The link is here to verified your entity email <br>
                                https://${req.headers.host}/verification-reflet-email?reflect_id=${reflect_id}&type=${Buffer.from('entity').toString('base64')}&email=${Buffer.from(company_email).toString('base64')}
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
                       
                     
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                var wall_id = result.wallet_id;
                var country_id = result.entity_company_country;
                if(country_id!=null){
                    CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                            // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                            // res.render('front/myReflect/my-reflet-id-view-for-entity',{
                            //     success_msg,
                            //     err_msg,
                            //     session:req.session,
                            //     myreflectEntityData :result,
                            //     reflect_id:result.reflect_id,
                            //     moment
                            // })
                            res.redirect(`/entity?reflect_id=${reflect_id}`)
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                        // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                        // res.render('front/myReflect/my-reflet-id-view-for-entity',{
                        //     success_msg,
                        //     err_msg,
                        //     session:req.session,
                        //     myreflectEntityData :result,
                        //     reflect_id:result.reflect_id,
                        //     moment
                        // })
                        res.redirect(`/entity?reflect_id=${reflect_id}`)
                    })
                }
                 });
            })
        
        })
    
    }else if(phone_no!=undefined){
        MyReflectIdModel.update({entity_company_phoneno:phone_no},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                var wall_id = result.wallet_id;
                var country_id = result.entity_company_country;
                if(country_id!=null){
                    CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                            // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                            // res.render('front/myReflect/my-reflet-id-view-for-entity',{
                            //     success_msg,
                            //     err_msg,
                            //     session:req.session,
                            //     myreflectEntityData :result,
                            //     reflect_id:result.reflect_id,
                            //     moment
                            // })
                            res.redirect(`/entity?reflect_id=${reflect_id}`)
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                        // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                        // res.render('front/myReflect/my-reflet-id-view-for-entity',{
                        //     success_msg,
                        //     err_msg,
                        //     session:req.session,
                        //     myreflectEntityData :result,
                        //     reflect_id:result.reflect_id,
                        //     moment
                        // })
                        res.redirect(`/entity?reflect_id=${reflect_id}`)
                    })
                }
            })
        
        })
    
    }

    






    // if(firstname!=undefined){
    //     MyReflectIdModel.update({rep_firstname:firstname},{where:{ reflect_id: reflect_id} }).then(async (success) => {
    //         MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
    //             var wall_id = result.wallet_id;
    //             var country_id = result.entity_company_country;
    //             if(country_id!=null){
    //                 CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
    //                     UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
    //                         res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                            
                     
                       
    //                     }).catch(err=>console.log("err",err));
    //                 })
    //             }else{
    //                 var country = "";
    //                 UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
    //                     res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                 
                   
    //                 })
    //             }
    //         })
        
    //     })
    // }
    // else if(lastname!=undefined){
    //     MyReflectIdModel.update({rep_lastname:lastname},{where:{ reflect_id: reflect_id} }).then(async (success) => {
    //         MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
    //             var wall_id = result.wallet_id;
    //             var country_id = result.entity_company_country;
    //             if(country_id!=null){
    //                 CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
    //                     UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
    //                         res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                     
                       
    //                     })
    //                 })
    //             }else{
    //                 var country = "";
    //                 UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
    //                     res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                 
                   
    //                 })
    //             }
    //         })
        
    //     })
    // }
    // else if(middlename!=undefined){
    //     MyReflectIdModel.update({rep_lastname:lastname},{where:{ reflect_id: reflect_id} }).then(async (success) => {
    //         MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
    //             var wall_id = result.wallet_id;
    //             var country_id = result.entity_company_country;
    //             if(country_id!=null){
    //                 CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
    //                     UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
    //                         // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
    //                         res.render('front/myReflect/my-reflet-id-view-for-entity',{
    //                             success_msg,
    //                             err_msg,
    //                             session:req.session,
    //                             myreflectEntityData :result,
    //                             reflect_id:result.reflect_id
    //                         })
                       
    //                     })
    //                 })
    //             }else{
    //                 var country = "";
    //                 UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
    //                     res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                 
                   
    //                 })
    //             }
    //         })
        
    //     })
    // }
    
    // else if(company_address!=undefined){
    //     MyReflectIdModel.update({entity_company_address:company_address},{where:{ reflect_id: reflect_id} }).then(async (success) => {
    //         MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
    //             var wall_id = result.wallet_id;
    //             var country_id = result.entity_company_country;
    //             if(country_id!=null){
    //                 CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
    //                     UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
    //                         res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                     
                       
    //                     })
    //                 })
    //             }else{
    //                 var country = "";
    //                 UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
    //                     res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                 
                   
    //                 })
    //             }
    //         })
        
    //     })
    // }
    // else if(company_name!=undefined){
    //     MyReflectIdModel.update({rep_company_name:company_name},{where:{ reflect_id: reflect_id} }).then(async (success) => {
    //         MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
    //             var wall_id = result.wallet_id;
    //             var country_id = result.entity_company_country;
    //             if(country_id!=null){
    //                 CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
    //                     UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
    //                         res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                     
                       
    //                     })
    //                 })
    //             }else{
    //                 var country = "";
    //                 UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
    //                     res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                 
                   
    //                 })
    //             }
    //         })
        
    //     })
    // }
    // else if(btc_wallet_address!=undefined){
    //     MyReflectIdModel.update({rep_btc_address:btc_wallet_address},{where:{ reflect_id: reflect_id} }).then(async (success) => {
    //         MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
    //             var wall_id = result.wallet_id;
    //             var country_id = result.entity_company_country;
    //             if(country_id!=null){
    //                 CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
    //                     UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
    //                         res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                     
                       
    //                     })
    //                 })
    //             }else{
    //                 var country = "";
    //                 UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
    //                     res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                 
                   
    //                 })
    //             }
    //         })
        
    //     })
    // }
    // else if(eth_wallet_address!=undefined){
    //     MyReflectIdModel.update({rep_eth_addess:eth_wallet_address},{where:{ reflect_id: reflect_id} }).then(async (success) => {
    //         MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
    //             var wall_id = result.wallet_id;
    //             var country_id = result.entity_company_country;
    //             if(country_id!=null){
    //                 CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
    //                     UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
    //                         res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                     
                       
    //                     })
    //                 })
    //             }else{
    //                 var country = "";
    //                 UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
    //                     res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                 
                   
    //                 })
    //             }
    //         })
        
    //     })
    // }
    // else if(rep_nationality!=undefined){
    //     MyReflectIdModel.update({rep_nationality:rep_nationality},{where:{ reflect_id: reflect_id} }).then(async (success) => {
    //         MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
    //             var wall_id = result.wallet_id;
    //             var country_id = result.entity_company_country;
    //             if(country_id!=null){
    //                 CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
    //                     UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                     WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
    //                         res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                     
                       
    //                     })
    //                 })
    //             }else{
    //                 var country = "";
    //                 UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
    //                 WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
    //                     res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                 
                   
    //                 })
    //             }
    //         })
        
    //     })
    // } 
   
}
/** submit_myreflect_entity Post Method End  **/


/** my-reflet-id-code get Method End  **/

/**document-list get Method Start  **/
// exports.document_list=(req,res,next) =>{
//     var user_type=req.session.user_type;

//     var user_id=req.session.user_id;
//     var reflect_code_array=[]
//         console.log('hello')

//     //  function onlyUnique(value, index, self) { 
//     //         return self.indexOf(value) === index;
//     //     }
//     if(user_id)
//     {
//         /**get my all reflect code start**/
//         // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",unique_reflect_code)
//         console.log(' if hello')
//         DocumentMasterModel.findAll({where:{deleted:"0",status:"active"}}).then(allDocs =>{
        
//        db.query("SELECT *from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  inner join tbl_wallet_reflectid_rels on  tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations  ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id  WHERE   tbl_wallet_reflectid_rels .reg_user_id="+user_id+" ORDER BY tbl_myreflectid_doc_rels.user_doc_id DESC LIMIT 1",{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){
//                         //  console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",all_document_Data)
//                         console.log(' db hello')
//                         db.query("SELECT DISTINCT reflect_code,user_as,profile_picss from  tbl_user_registrations inner join tbl_wallet_reflectid_rels ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id  WHERE   tbl_user_registrations.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(all_reflect_codes){
//                             // console.log('users type : ',all_reflect_codes)
//                             db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id  WHERE   tbl_user_registrations.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_user){
//                                 // console.log("HHHHHHHHHHHHHHHHHHHHH : ",verifier_user)
                      
//                         db.query("SELECT DISTINCT user_as,reflect_code,rep_firstname from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  inner join tbl_wallet_reflectid_rels on tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id  WHERE   tbl_wallet_reflectid_rels .reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(unique_reflect_code){
//                             //    unique_reflect_code = reflect_code.filter( onlyUnique );
                    
//                  res.render('front/my-document/my-document',{
//                             success_msg,
//                             err_msg,
//                             session:req.session,
//                             moment,
//                             all_document_Data,unique_reflect_code,user_type,all_reflect_codes,verifier_user,allDocs

//               });});})
//             })
//         });});
        
//         /**get my all reflect code end**/
//     }
//     else
//     {
//         redirect('/login');
//     }

// }
/**document-list get Method End  **/

/**add_new_doc Post Method Start  **/
exports.AddNewDoc = async(req,res,next )=> {
   // console.log(".........files1.......",req)

    //console.log("**************************************************************************1111111111111*******************************************************")

    const form = formidable({ multiples: true });
  await  form.parse(req, async(err, fields, files) => {
        if (err) {
         console.log(err);
        }
            console.log(".........files.......",files)
            var ext = path.extname(files.document.name);
            let ext_type = (ext == ".pdf") ? "pdf" :"image";
console.log("***************22222222222222******************************************************* ext_type",{ext_type,ext})
          

// res.send({fields:fields,files:files})
    var exp_date = fields.exp_date
    var doc_name_id= fields.doc_name
    // console.log(".........files.......",files)
   var doc_id_number =fields.id_number
   var reflect_id=fields.reflect_id
   var issue_date = fields.issue_date;
   var issue_place = fields.issue_place;
   var proof_of_address= fields.proof_of_address;


   function makeid(length) {
   var result           = '';
   var characters       = '1234567890';
   var charactersLength = characters.length;

       for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
       }
          return result;
 }
   if (!doc_id_number) {
           
          
           doc_id_number = `AUTO${makeid(4)}MYREFLET`
   }

console.log("doc_id_number : ",doc_id_number)
//     var exp_date = req.body.exp_date
//     var doc_name_id= parseInt(req.body.doc_name) 
//     // console.log(".........req...",req)
//     var doc= req.file.filename
//    var doc_id_number =parseInt( req.body.id_number)
//    var reflect_id=parseInt(req.body.reflect_id) 
// //    console.log(".........req...",exp_date)

   let testFile = fs.readFileSync(files.document.path);
   let testBuffer = new Buffer(testFile);
 


             var dt = dateTime.create();
             var formatted = dt.format('Y-m-d H:M:S');


        var document_name=fields.document_name;
console.log("test of ipfs buffer",testBuffer)
 await  ipfs.files.add(testBuffer,async function (err, file) {
     if (err) {
       console.log("err from ejs",err);
     }

     if(document_name)
                 {
         await DocumentMasterModel.create({document_name:document_name,document_type:"other",createdAt:formatted,updatedAt:formatted}).then(async doc_data =>{

            console.log("from issue_date if",doc_data.doc_id);

    await DocumentReflectIdModel.create({doc_id:doc_data.doc_id,doc_unique_code:doc_id_number,reflect_id:reflect_id,proof_of_address,issue_place,issue_date,expire_date:exp_date}).then(async(doc) =>{
        // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&",doc)

        // console.log("logocvjdwsnvjknsdjvnsdfvjfkvh<><><<<sdf",doc.user_doc_id)
     await   FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash,type:ext_type}).then(async(doc_content) =>{
        
          
            res.redirect(`/entity?reflect_id=${reflect_id}`)
        
    }).catch(err=>{console.log("errr1 DocumentReflectIdModel",err)})
       }).catch(err=>{console.log("errr1 FilesDocModel ",err)})
                     })
       }
    else
    {
            await DocumentReflectIdModel.create({doc_id:doc_name_id,doc_unique_code:doc_id_number,reflect_id:reflect_id,proof_of_address,issue_place,issue_date,expire_date:exp_date}).then(async(doc) =>{
        // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&",doc)

        // console.log("logocvjdwsnvjknsdjvnsdfvjfkvh<><><<<sdf",doc.user_doc_id)
     await   FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash,type:ext_type}).then(async(doc_content) =>{
        
          
            res.redirect(`/entity?reflect_id=${reflect_id}`)
        
    }).catch(err=>{console.log("errr1 DocumentReflectIdModel",err)})
       }).catch(err=>{console.log("errr1 FilesDocModel ",err)})
    }
  

    })
})



//     var exp_date = req.body.exp_date
//     var doc_name_id= parseInt(req.body.doc_name) 
//     // console.log(".........req...",req)
//     var doc= req.file.filename
//    var doc_id_number =parseInt( req.body.id_number)
//    var reflect_id=parseInt(req.body.reflect_id) 
//    console.log(".........req...",exp_date)
//    console.log(".........doc_name_id...",doc_name_id)

//    console.log(".........doc_id_number...",doc_id_number)

//    console.log(".........reflect_id...",reflect_id)

//    console.log(".........doc...",doc)

   
//   await DocumentReflectIdModel.create({doc_id:doc_name_id,
//                                        doc_unique_code:doc_id_number,
//                                        document_filename:doc,
//                                        reflect_id:reflect_id,
//                                        expire_date:exp_date}).then(async(data)=>{
// await MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(async(result) => {

  

//   await  DocumentReflectIdModel.findAll({where:{reflect_id:reflect_id}}).then(doc_data=>{
//         // console.log("documnet moelsbdfbfhdbhfbd.......",doc_data)
//         res.redirect(`/entity?reflect_id=${reflect_id}`)
//         // res.render('front/myReflect/my-reflet-id-view-for-entity',{
//         //     success_msg,
//         //     err_msg,
//         //     session:req.session,
//         //     myreflectEntityData :result,
//         //     reflect_id:result.reflect_id,
//         //     DocData: doc_data
//         // })
//     }).catch(err=>{console.log("errr1",err)})

   

// }).catch(err=>{console.log("errr2",err)})
//     }).catch(err=>{console.log("errr3",err)})





 
   
}
/**add_new_doc Post Method End  **/

/**my-doc-license Get Method Start  **/
// exports.document_show=(req,res,next) =>{
//     var user_type=req.session.user_type;
//     var d_id=req.params.id;

//     var user_id=req.session.user_id;
//     var reflect_code_array=[]
//         console.log('hello :',d_id)

//   var doc_id=d_id.replace(/:/g,"");

//     if(user_id)
//     {
//         /**get my all reflect code start**/
//         // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",unique_reflect_code)
//         // console.log(' if hello')
//         DocumentMasterModel.findAll({where:{deleted:"0",status:"active"}}).then(allDocs =>{
        
//        db.query("SELECT *from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  inner join tbl_wallet_reflectid_rels on  tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations  ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id  WHERE   tbl_wallet_reflectid_rels .reg_user_id="+user_id+" and tbl_myreflectid_doc_rels.doc_id="+doc_id+" and tbl_myreflectid_doc_rels.user_doc_id In (SELECT user_doc_id from tbl_myreflectid_doc_rels GROUP BY reflect_id ORDER BY user_doc_id DESC)",{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){
//                          console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",all_document_Data)
//                         console.log(' db hello : ',all_document_Data)
//                         db.query("SELECT DISTINCT reflect_code,user_as,rep_firstname,profile_pic from  tbl_user_registrations inner join tbl_wallet_reflectid_rels ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id  WHERE   tbl_user_registrations.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(all_reflect_codes){
//                             // console.log('users type : ',all_reflect_codes)
//                             // db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id  WHERE   tbl_user_registrations.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_user){
//                                 // console.log("HHHHHHHHHHHHHHHHHHHHH : ",verifier_user)
                      
//                         db.query("SELECT DISTINCT user_as,reflect_code,rep_firstname from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  inner join tbl_wallet_reflectid_rels on tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id  WHERE   tbl_wallet_reflectid_rels .reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(unique_reflect_code){
//                             //    unique_reflect_code = reflect_code.filter( onlyUnique );
                    
//                  res.render('front/my-document/my-document-view',{
//                             success_msg,
//                             err_msg,
//                             session:req.session,moment,
//                             all_document_Data,unique_reflect_code,user_type,all_reflect_codes,allDocs

//               });});})
//             })
//         });
//     // });
        
//         /**get my all reflect code end**/
//     }
//     else
//     {
//         redirect('/login');
//     }

// }
/**my-doc-license Get Method End  **/

/**reflect-code-data Post Method Start  **/
exports.reflect_code_data=(req,res,next) =>{
    // var userid=req.body.userid;
    var user_id=req.body.userid;
    // console.log("reflect %%%%%%%%%%% : ",user_id)
     var reflect_code_array=[];
     var unique
    if(user_id)
    {
        /**get my all reflect code start**/
        console.log("reflect %%%%%%%%%%% : ",user_id)
        // function onlyUnique(value, index, self) { 
        //     return self.indexOf(value) === index;
        // }
       db.query("SELECT DISTINCT reflect_code from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  inner join tbl_wallet_reflectid_rels on                  tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id  WHERE   tbl_wallet_reflectid_rels .reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){
        // all_document_Data.forEach(result => { 
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",all_document_Data)
            // for(var i=0;i<result.reflect_code.dlength;i++){
            //     console.log("success part",result.reflect_code[i])
            //     }
            // reflect_code_array.push(result)
            //  unique = reflect_code.filter( onlyUnique );
            // var result = JSON.parse(reflect_code_array)

                    res.send(all_document_Data)


          
                         
                        //  if(!all_document_Data){
                        //     for(var i=0;i<all_document_Data.data.length;i++){
                        //     console.log("success part",all_document_Data[i].reflect_code)
                        //     }
                        //  
                         
                        //    }else{
                             
                        //      console.log("error part",result) 
                        //      res.send(all_document_Data)
                        //    }


        });

    

        /**get my all reflect code end**/
    }
    else 
    {
        redirect('/login');
    }


}
/**reflect-code-data Post Method End  **/

/**show-reflect-code-data Post Method Start  **/
exports.show_reflect_code_data=(req,res,next) =>{
    var user_id=req.session.user_id;
    var reflect_list=[];
     reflect_list=JSON.parse(req.body.reflect_code_list);
    // var result_code_array=[]

        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_list)



    if(user_id)
    {
        
        /**get my all reflect code start**/
        var complaint_reflect_code_list=reflect_list.join("','");
       
      
       db.query("SELECT *from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  inner join tbl_wallet_reflectid_rels on  tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations  ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id  WHERE   tbl_wallet_reflectid_rels .reg_user_id="+user_id+" AND tbl_wallet_reflectid_rels.reflect_code IN ('"+complaint_reflect_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){


        console.log('!!!!!!!!!!!!! : ',all_document_Data)

                               
                       
                      
                             var obj={
                                result_code_array:all_document_Data,
                                moment:moment
                             }
                            res.send(obj)

                        // 

        });
        
        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

}
/**show-reflect-code-data Post Method End  **/

/**myreflect-creat-wallet Get Method Start  **/
exports.myreflectCreatWallet = (req,res,next)=>{
    // var email = req.session.email;
    // var  wallet_id = req.query.address.trim();
    // const reflect_code = generateUniqueId({
    //     length: 4,
    //     useLetters: false
    //   });
    // console.log(reflect_code);
    res.render('front/wallet/create-wallet',{ session:req.session });
}
/**myreflect-creat-wallet Get Method End  **/

/**upload-new-doc-entity Post Method Start  **/
exports.upload_new_doc_entity = (req,res,next) =>{

    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        if (err) {
         console.log(err);
        }

        var user_doc_id = fields.user_doc_id;
        var reflect_id = fields.reflect_id; 
 
        var type = fields.value_o1; 
        console.log("-----------files------------ ",files); 
console.log("-----------user_doc_id------------ ",user_doc_id);
console.log("-----------reflect_id------------ ",reflect_id);

   let testFile = fs.readFileSync(files.entity_image.path);
  let testBuffer = new Buffer(testFile);

  ipfs.files.add(testBuffer, function (err, file) {
    if (err) {
      console.log("err from ejs",err);
    }
   
    FilesDocModel.create({user_doc_id:user_doc_id,file_content:file[0].hash,type:type}).then(doc_content =>{

    MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
        res.redirect(`/entity?reflect_id=${reflect_id}`)
    });    
    })
   

})
});
 }
/**upload-new-doc-entity Post Method End  **/

/**Get Category List For Individual request Method Start  **/
 exports.get_category_indi_list = (req,res,next) =>{
    var reflect_id = req.body.reflect_id;
    db.query("select * from tbl_verifier_category_reflectids inner join tbl_verifier_request_categories ON tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id WHERE tbl_verifier_request_categories.deleted='0' and tbl_verifier_request_categories.parent_category='0' and tbl_verifier_category_reflectids.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(function(categories){
        // console.log("-----------categories--------------",categories);
        res.render("front/myReflect/ajax_category_individual",{
            categories:categories
        });
    });
} 
/**Get Category List For Individual request Method End  **/

/**Get Sub-Category List For Individual request Method Start  **/
exports.get_sub_category_indi_list = (req,res,next) =>{
    var category_id = req.body.category_id;
    db.query("select * from tbl_verifier_request_categories WHERE deleted='0' and parent_category="+category_id,{ type:db.QueryTypes.SELECT}).then(function(sub_categories){
        // console.log("-----------categories--------------",sub_categories);
        res.render("front/myReflect/ajax_sub_category_individual",{
            sub_categories:sub_categories
        });
    });
}
/**Get Sub-Category List For Individual request Method End  **/

/**Requested Individual Document Get Method Start  **/
exports.get_requested_doc_indi = async (req,res,next) =>{
    console.log("./././.---------------get_requested_doc start------------------------------------------------./././/. ");
    var category_id = req.body.category_id;
    var new_test_array=[];
    var requested_doc_array=[];
    await db.query("select * from tbl_manage_category_documents WHERE deleted='0' and category_id="+category_id,{ type:db.QueryTypes.SELECT}).then(async function(cat_docs){
        console.log("---------------cat_docs 1-------------- ",cat_docs);
        requested_doc_array=cat_docs;

        for(var i=0;i<cat_docs.length;i++){
            var category_doc_id = cat_docs[i].category_doc_id;
            console.log("---------------cat_docs_id-------------- ",cat_docs[i].category_doc_id);
         await  db.query("select * from tbl_category_documents inner join tbl_documents_masters ON tbl_category_documents.doc_id=tbl_documents_masters.doc_id WHERE tbl_category_documents.deleted='0' and tbl_category_documents.category_doc_id="+category_doc_id,{ type:db.QueryTypes.SELECT})
          .then(async function(requested_docs){
                    console.log("---------------requested_docs-------------- ",requested_docs);
                    console.log("---------------cat_docs[i]-------------- ",cat_docs[i]);
                    console.log("---------------cat_docs_iner_id-------------- ",cat_docs[i].category_doc_id);
            // console.log("---------------cat_docs[i]-------------- ",cat_docs[i]);
         if(requested_docs[0]!=null){
            requested_doc_array[i].document_name = requested_docs[0].document_name
            new_test_array.push(requested_doc_array[i]) ;
            console.log("-----------categories_inner--------------",requested_doc_array);
         }
                  
                })
         
        }
         console.log("-----------categories_outer--------------",new_test_array);
       
       
    async function forsend(){
            res.render("front/myReflect/ajax_category_docs_individual",{
                requested_docs:new_test_array
            });
        }
        await forsend();
        
});
}
/**Requested Individual Document Get Method End  **/

/**Requested Individual Document Post Method Start  **/
exports.post_request_doc = async(req,res,next) =>{
    console.log("...........................................request_doc start*******....................................");
       var client_id = req.session.user_id;
   
       var reflect_id = req.body.reflect_id;
       var verifier_id = req.body.verifier_id;
       var ver_ref_id = req.body.verifier_reflect_id;
       var sub_cat_id =req.body.sub_cat_id
       var p_cat_id =req.body.p_cat_id
       var message =req.body.msg

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
                                                    notification_msg:`You have recieved a request from ${decrypt(userData.full_name)}.`,
                                                    sender_id:client_id,
                                                    receiver_id:verifier_id,
                                                    request_id:request_id,
                                                    notification_type:'1', 
                                                    notification_date:new Date()
          
                                              }).then(async(notification) =>{
    //  / loop-1 Start /                                               
   for(var i=0;i<doc_id.length;i++){
                       //   console.log("/////////////////////",doc_id[i]);
    await RequestDocumentsModel.create({request_id:request_id,user_doc_id:doc_id[i],download:download[i],view:view[i],certified:certify[i],message:message,}).then(async(success) =>{
                               // res.send("success");
                             }).catch(err=>console.log("RequestDocumentsModel err",err))
                            }
    //  / loop-1 End /
    async function upload_water_mark(){
   
       await db.query('SELECT * FROM tbl_request_documents WHERE request_id='+request_id+' AND deleted="0"',{ type:db.QueryTypes.SELECT}).then(async(requestDocumentData)=>{
           var new_hash_array =[]
           
        // / loop-2 Start /
          for(var z=0; z<requestDocumentData.length;z++)
          {
              await db.query('SELECT * FROM tbl_request_documents INNER JOIN tbl_files_docs ON tbl_request_documents.user_doc_id=tbl_files_docs.user_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id= tbl_client_verification_requests.request_id WHERE tbl_request_documents.request_id='+request_id+' AND tbl_request_documents.deleted="0" AND tbl_files_docs.deleted="0" AND tbl_request_documents.user_doc_id='+requestDocumentData[z].user_doc_id,{ type:db.QueryTypes.SELECT}).then(async(SortrequestDocumentData)=>{
            //    console.log("/////////SortrequestDocumentData////////////",SortrequestDocumentData);
                  // new_hash_array.push(SortrequestDocumentData[0])
               //    for(var k=0; k<SortrequestDocumentData.length; k++){
                   async.each(SortrequestDocumentData,async function (content1, cb) {

                    fun_hash

                  var w_text="MY_reflect"+content1.request_code;
               //    var fun_hash =SortrequestDocumentData[k].file_content
                                 console.log("hello-----------111......111111 ");
                  var self_attested_hash = content1.self_attested_hash

                if (self_attested_hash) {
                   fun_hash = content1.self_attested_hash
                                     console.log("IIIIIIIIIIIIIIIIIIIIIIIhello-----------1 ",fun_hash);

                }
                 else
                 {
                                   fun_hash  = content1.file_content

                                     console.log("elseSSSSSSSSSSSSSSSSShello-----------1 ",fun_hash);

                 }
   
                  console.log("hello-----------111111111 ");
                  var a;
                  a= await Jimp.read(`https://ipfs.io/ipfs/${fun_hash}`,async function(err, image) {

                    // await Jimp.create(720,520,'#ffffff',async function(err, nova_new) {
                        await Jimp.create(image.bitmap.width ,((image.bitmap.height)+((image.bitmap.width/4)+30)) ,'#ffffff',async function(err, nova_new) {
                        // ,async function(err, nova_new) {
                   //  .then(async nova_new =>{
                       console.log("hello-----------2 ",image.bitmap);
                      
                       //  .then(async image => {
                          // var srcImage=blob_url.split(',')[1];

                        //  await image.resize(720, 520);

                          console.log("hello-----------3 ");
                          var b;
                           b=  await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK ,async function(err, font) {
                       //    .then(async (font) => {
                           console.log("hello-----------4 ");
                           var c;
                            // image.print(font,image.bitmap.width/2.5,image.bitmap.height/2.5,w_text
                            nova_new.print(font,10,image.bitmap.height,w_text

                           //     ,async function(err, font1) {
                           // }
                           )
   
                           
                      
                        //   nova_new.composite(image,0,0);
                          nova_new.composite(image,0,0);

                        //   image.resize(200,200);
                      
                      
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
        // / loop-2 End /


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
/**Requested Individual Document Post Method End  **/

/**Get self certified doc list Start  **/
exports.get_certified_doc_list = async(req,res,next) =>{
    var user_id = req.session.user_id; 
    // var certified_docs=[];
    await db.query("select * from tbl_wallet_reflectid_rels where user_as='client' and deleted='0' and reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(refletIds){
    await db.query("select * from tbl_wallet_reflectid_rels inner join tbl_myreflectid_doc_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_myreflectid_doc_rels.reflect_id inner join tbl_files_docs ON tbl_myreflectid_doc_rels.user_doc_id=tbl_files_docs.user_doc_id inner join tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_myreflectid_doc_rels.deleted='0' and tbl_myreflectid_doc_rels.self_assested='yes' and tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(certified){
        async.each(certified,async function (content, cb) {
            var url1='https://ipfs.io/ipfs/';
            var url2=content.self_attested_hash;
            var final_url=url1.concat(url2);
            console.log("1");
            await request(final_url,callback);
            console.log("2");


              function callback(error, response, body) {
                
                if(!error){
                    console.log("3");

                    //return body;

                    content.self_certified= body;   
                                        
                 }
                                
             }
        
    }, function (err) { // called once all iteration callbacks have returned (or an error was thrown)
        if (err) { console.log("err",err); }
        console.log("4");

    })
    setTimeout(forrender,10000);
    function forrender(){
        res.render("front/certified-doc-list",{certified_docs:certified,refletIds,moment});
        // console.log("-----------certified_docs--------------",certified_docs);
        console.log("5");
    }
    
        
    });
    })
} 
/**Get self certified doc list End  **/ 

/**Get reflet id list Start  **/
exports.get_doc_list = async(req,res,next) =>{
    var reflet_id = req.body.reflet_id; 
    // var certified_docs=[];
    await db.query("select * from tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_myreflectid_doc_rels.self_assested='no' and tbl_myreflectid_doc_rels.reflect_id="+reflet_id,{ type:db.QueryTypes.SELECT}).then(async function(refletIds){
        res.render("front/doc-list-ajax",{refletIds});
    })
} 
/**Get reflet id list End  **/

/**Get doc list Start  **/
exports.get_doc_imgs = async(req,res,next) =>{
    var user_doc_id = req.body.user_doc_id; 
    // var certified_docs=[];
    await db.query("select * from tbl_files_docs where user_doc_id="+user_doc_id,{ type:db.QueryTypes.SELECT}).then(async function(doc_data){
        res.render("front/doc-img-ajax",{doc_data});
    })

} 
/**Get doc list End  **/

/**Get share_rep_document List For Individual request Method Start  **/
 exports.share_rep_document = (req,res,next) =>{
    var reflect_id = req.body.reflect_id;
   var expire_date = req.body.expire_date;
    var doc_unique_code = req.body.doc_unique_code;
    var doc_create_date = req.body.doc_create_date;
    var reflect_id = req.body.reflect_id;
    var label = req.body.document_name;
    var user_doc_id = req.body.user_doc_id;
    var user_email = req.body.user_email;
    var reflect_code = req.body.reflect_code;
    var name = req.body.share_name;


    db.query("SELECT * FROM `tbl_files_docs` inner join tbl_myreflectid_doc_rels on tbl_myreflectid_doc_rels.user_doc_id=tbl_files_docs.user_doc_id where tbl_files_docs.user_doc_id="+user_doc_id+" and reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(function(data){

      console.log(data[0].file_content)

            var smtpTransport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                 user: 'info.myreflet@gmail.com',
                 pass: 'myquest321'
                }
              });
              const mailOptions = {
                to: user_email,
                from: 'questtestmail@gmail.com',
                subject: "Document Shared Details.",
          
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
                      <h4 style="font-size: 20px; margin-bottom: 0;">Dear, ${name} is share document details with you.</h4>
                        <h4>Details of documents</h4>
                        <p>Label          : ${label}</p>
                        <p>ID Number      : ${doc_unique_code}</p>
                        <p>Expiry Date    : ${moment(expire_date).format('MMM DD, YYYY')}</p>
                        <p>Create Date    : ${moment(doc_create_date).format('MMM DD, YYYY')}</p>
                        <p>Content Documents</p>
                      <img width="450"height="350" src="https://ipfs.io/ipfs/${data[0].file_content}">

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
               console.log('done')
              });
               res.redirect('/view-reflect-id?id='+reflect_code);

    });
} 
/**Get share_rep_documentFor Individual request Method End  **/

/**Get share_rep_document List For Individual request Method Start  **/
 exports.share_entity_document = (req,res,next) =>{
    var reflect_id = req.body.reflect_id;
   var expire_date = req.body.expire_date;
    var doc_unique_code = req.body.doc_unique_code;
    var doc_create_date = req.body.doc_create_date;
    var reflect_id = req.body.reflect_id;
    var label = req.body.document_name;
    var user_doc_id = req.body.user_doc_id;
    var user_email = req.body.user_email;
    var reflect_code = req.body.reflect_code;
    var name = req.body.share_name;


    db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date  FROM `tbl_files_docs` inner join tbl_myreflectid_doc_rels on tbl_myreflectid_doc_rels.user_doc_id=tbl_files_docs.user_doc_id INNER join tbl_documents_masters on tbl_documents_masters.doc_id=tbl_myreflectid_doc_rels.doc_id where tbl_files_docs.user_doc_id="+user_doc_id+" and reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(function(data){

        var attachments=[];

      console.log(data[0].file_content)

      ejs.renderFile('app/views/front/myreflet/share-byMail.ejs', {data,moment,doc_unique_code},async (err, data) => {
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
        console.log("EEEEEEEEEERRRRRRRRR out      ")
    
        // async function upload_file(){
    
        pdf.create(data, options).toFile("app/uploads/report_files/"+data[0].document_name+"_"+doc_unique_code+".pdf",async function (err, data) {
            // console.log("don441 "+data)
            // console.log("EEEEEEEEEERRRRRRRRR    in   ",content.report_name,'report_filter_id ',content.report_filter_id)
    
            if (err) {
              console.log("pdf create data       2"+err)
    
    
            } else {
    
                    // data='update';
    
                    var smtpTransport = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                          user: 'navajsheikh@questglt.com',
                          pass: 'n9926408218'
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
        res.redirect(`/entity?reflect_id=${reflect_id}`)

    });
} 
/**Get share_rep_documentFor Individual request Method End  **/

// const get_digi_hashtest =asfunction(fun_hash,blob_url){
//     var today=new Date();
//     // console.log("hello-----------1 ");
//     // await Jimp.create(920,1920,'#ffffff').then(async nova_new =>{

//         await Jimp.read(`https://ipfs.io/ipfs/${fun_hash}`).then(async image => {
//             var srcImage=blob_url.split(',')[1];

//         console.log("hello-----------self attested 2 ");
    
    
//             const buff = Buffer.from(srcImage,'base64');
//             buff.toString();
        
        
//             await Jimp.read(buff).then(async newimage => {
        
//             await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(async font => {
//                       await  newimage.print(font,newimage.bitmap.width/2.5,newimage.bitmap.height/2.5,today);
                        
//             });
        
//             // image.composite(image,0,0);
//             image.composite(newimage,-100,350);
//             newimage.resize(200,200);

//             //       nova_new.composite(image,0,0,{
//             //   mode: Jimp.BLEND_SOURCE_OVER,
//             //   opacityDest: 1,
//             //   opacitySource: 0.5
//             // })
//   //        newimage.resize(1024, 768, Jimp.RESIZE_BEZIER, function(err){ 
//   //     if (err) throw err; 
//   // })
        
//                 let text_img = image.getBase64Async(Jimp.MIME_PNG);
        
//                     console.log("hello-----------3 ");
        
//                     text_img.then(result => {
//                         // let testFile = fs.readFileSync(result);
                        
//                         let testBuffer = new Buffer(result);

//                         ipfs.files.add(testBuffer, function (err, file) {
//                             if (err) {
//                           //  console.log("err from ejs",err);
//                             }
//                             // console.log("from ipfs  text_img",text_img);
//                         FilesDocModel.update({self_attested_hash:file[0].hash},{where:{ file_content: fun_hash} }).then(async (success) => {
//                             //console.log("hello-----------4 result ");  
//                             return new Promise(resolve => {
//                                resolve(result);  
//                             });
//                          })
                    
//                         })
//                     });
            
//             })
//             .catch(err => {
//                 console.log('error',err);
            
//             });
        
//         });
//     // });

          
// }
async function  selfAttestedMail(user_doc_id,userid)
{
   let attachments=[];

    var all_attested_images=await FilesDocModel.findAll({where:{user_doc_id:user_doc_id,type:"image",deleted:'0'}});

const delay = (duration) =>
  new Promise(resolve => setTimeout(resolve, duration))
           
async function attested()
{
   if(all_attested_images.length>0)
           {
                for(j=0;j<all_attested_images.length;j++)
                {
                    var final_url="https://ipfs.io/ipfs/".concat(all_attested_images[j].self_attested_hash);


                    console.log("final_url inner",final_url);

                    await request(final_url,callback);


                       async function callback(error, response, body) {
                            
                            if(!error){

                                //return body;
                            var img_obj={
                             filename:'Attachment'.concat(j).concat('.png'),
                             content: body.split("base64,")[1],
                             encoding: 'base64'
                            }
                            
                               // new_imgs[j]['filename']='Attachment'.concate(j);

                             attachments.push(img_obj); 
                                
                                  await delay(10000)

                               console.log("attachments inner");
                                                    
                             }
                                            
                         }
                }
           }
}
          
                                         console.log("before await");
await attested();
     // await attested();
// async function main() {
//   let res = 
//                                            console.log("inner await");

//   console.log(res);
// }

// await main();
        console.log("After await");

        setTimeout(send_mail,15000);

            async function send_mail()
           {

            // /o9/self_attested_hash start
           // console.log("images",new_imgs);
            //self_attested_hash end

       await UserModel.findOne({ where: {reg_user_id: userid} }).then(async(userData) =>{

                  var email = decrypt(userData.email);
          //var email ='surabhivinchurkar@questglt.com';
          var full_name = decrypt(userData.full_name);
            var smtpTransport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                 user: 'info.myreflet@gmail.com',
                 pass: 'myquest321'
                }
              });


              var html_data_part1=`<!DOCTYPE html>
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
                        <img src="http://165.22.209.72:3008/admin-assets/images/logo-white.png" style="width: 120px;">
                      </div>
                      <div style="padding: 30px;line-height: 32px; text-align: justify;">
                        <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${full_name},</h4>
                        <p>Please find your attested document : </p>`;


             var html_data_part2='';

             // if(new_imgs.length>0)
             // {
             //    for(j=0;j<new_imgs.length;j++)
             //    {
             //      // console.log("--hash--",`https://ipfs.io/ipfs/${all_attested_images[j].self_attested_hash}`);

             //         // var buffer_image = new Buffer(new_imgs[j],"base64");
             //         // buffer_image.toString();

             //         var buffer_image = new Buffer(new_imgs[j].split("base64,")[1], "base64");

             //            console.log("buffer img",buffer_image);

             //         html_data_part2+=`<p><img src="${buffer_image}" width="100" height="100" ></p>`;
             //    }
             // }


             var html_data_part3=`<p>Please contact to administrator for more details.</p>
                        <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                        <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                
                       
                      </div>
                       <div style="background-color:  #fff; color: #fff; padding: 20px 30px;">
                         &copy; Copyright 2020 - My Reflet. All rights reserved.
                        </div>
                    </div>
                  </body>
                </html>`;
                               console.log("attachments outer");


                var part1 = html_data_part1.concat(html_data_part2);
                var html_final=part1.concat(html_data_part3);
              const mailOptions = {
                to: email,
                from: 'questtestmail@gmail.com',
                subject: "My Reflect self attested documents.",
                html:html_final,
                   // attachments: attachments 
                    
              };
              smtpTransport.sendMail(mailOptions, function (err) {
                               console.log("***************EMAI SENTTTTTTTTTT?************");

              });
                console.log("***************when will you be here?************");
    })
            }

                // console.log("***************when will you be here outer?************");

            


                   

            
}

//030720

exports.submitCreateDigitalWallet =async(req,res,next)=>{
    console.log("......................................................submitCreateDigitalWallet start............................................")

    var user_type       = req.session.user_type;
    var user_id         = req.session.user_id;
    var wallet_id       = req.body.wallet_id.trim();
    var reflectid_by    = "digitalWallet"
    var reflect_code    = req.body.reflect_code.trim();
    var property_name   = req.body.property_name.trim();
    var wallet_name     = req.body.wallet_name.trim();
    var mail_id         = req.session.email;
    // var p_reflect_id    = req.body.parentReflectId;
  
     await UserModel.findOne({where:{reg_user_id:user_id}})

            .then(async user_data => {
            
                  await   CountryModel.findOne({where:{country_name:decrypt(user_data.birthplace)}})

                            .then(async country_data => { 

                                 await  MyReflectIdModel.create({
                                                                  entity_company_country  : country_data.country_id,             
                                                                  reflectid_by            : reflectid_by,
                                                                  reflect_code            : reflect_code,
                                                                  wallet_id               : wallet_id,
                                                                  reg_user_id             : user_id,
                                                                  user_as                 : user_type,
                                                                  property_name           : property_name,
                                                                  rep_emailid             : mail_id,
                                                                  wallet_name             : wallet_name
                                         })

                                          .then(async(result)=>{
                                            
                                                // DigitalWalletRelsModel.create({
                                                //                                  parent_reflect_id     :  p_reflect_id,
                                                //                                  dig_wal_reflect_id    :  result.reflect_id
                                                // })

                                                // .then(async dataUpdate=>{
                                               
                                                    var msg     =   "Client  has been create new Reflect Id as Digital Wallet."

                                                    await  admin_notification(msg,user_id,result.reflect_id,"3")
                   
                                                          res.redirect('/view-reflect-id?id='+reflect_code);

                                                // })

                                                // .catch(err=>console.log("err",err))


                                            })

                                             .catch(err=>console.log("err",err))

                             })
             })
}

exports.video_entry = (req,res,next) =>{

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
   
    var user_doc_id = req.query.user_doc_id
    var reflect_id = req.query.reflect_id
    var value_o1 = req.query.file_type
   console.log("reflect_id : ",reflect_id)
   console.log("user_doc_id : ",user_doc_id)
   console.log("value_o1 : ",value_o1)

   db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.deleted='0' and tbl_myreflectid_doc_rels.reflect_id="+reflect_id+" and tbl_myreflectid_doc_rels.user_doc_id="+user_doc_id,{ type:db.QueryTypes.SELECT}).then(async function(document){

            res.render('front/video_entry',{session:req.session,err_msg,each_data:document,value_o1,user_doc_id,reflect_id,moment});
   })
   
  }


  exports.update_representative_email = (req,res,next) =>{

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
   
    var user_doc_id = req.query.user_doc_id
    var reflect_id = req.query.reflect_id
    var value_o1 = req.query.file_type

    
           MyReflectIdModel.update({entity_company_emailid:encrypt(company_email),},{where:{ reflect_id: reflect_id} }).then(async (success) => {


           var smtpTransport = nodemailer.createTransport({
                      service: 'gmail',
                      auth: {
                               user: 'info.myreflet@gmail.com',
                               pass: 'myquest321'
                      }
              });
                      const mailOptions = {
                        to: company_email,
                        from: 'questtestmail@gmail.com',
                        subject: "Verifiy Email For Entity.",
                  
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
                                <p>The link is here to verified your entity email <br>
                                https://${req.headers.host}/verification-reflet-email?reflect_id=${reflect_id}&type=${Buffer.from('entity').toString('base64')}&email=${Buffer.from(company_email).toString('base64')}
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
                      })
              })
   
  }
  exports.reflet_email_verifications=async(req,res,next)=>{

  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');

  var reflect_id= req.query.reflect_id
  var email= req.query.email
  var emailID = Buffer.from(req.query.email, 'base64').toString('ascii');
  var type = Buffer.from(req.query.type, 'base64').toString('ascii');


  console.log("dnfhlsdalk",reflect_id,emailID)
    
      if (type === 'entity') {

        MyReflectIdModel.update({email_verification_status:'verified'},{where:{ reflect_id: reflect_id} }).then(async (success) => {

           MyReflectIdModel.findOne({where:{entity_company_emailid:emailID}})
            .then(result=>{
                       
                            res.render('front/myReflect/reflet_verification_email',{
                            session:req.session,
                            success_msg,
                            email,
                            reflect_id,result,type
                            
                        
                        })
                    })
          })
      }else if (type === 'representative'){

        MyReflectIdModel.update({email_verification_status:'verified'},{where:{ reflect_id: reflect_id} }).then(async (success) => {

          MyReflectIdModel.findOne({where:{rep_emailid:emailID}})
            .then(result=>{
                       
                            res.render('front/myReflect/reflet_verification_email',{
                            session:req.session,
                            success_msg,
                            email,
                            reflect_id,result,type
                            
                        
                        })
                    })
               })
      }

 
}