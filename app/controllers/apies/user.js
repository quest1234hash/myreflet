var {UserModel,LogDetailsModel,tbl_log_manage}         = require('../../models/user');
var {SecurityMasterModel,UserSecurityModel,
     CountryCodeModel}                                 = require('../../models/securityMaster');
var {tbl_verifier_plan_master,AdminModel,
     PlanFeatures,PlanFeatureRel,
     tbl_verifier_doc_list,MarketPlace,
     AllotMarketPlace,ContectUsModel,SubscriberModel
    }                                                  = require('../../models/admin');
var { tbl_verfier_purchase_details }                   = require("../../models/purchase_detaile")
var { tbl_plan_features }                              = require("../../models/tbl_plan_features")
var { tbl_plan_feature_rel }                           = require("../../models/tbl_plan_feature_rel")
// var {UserModel,LogDetailsModel}=require('../../models/user');
// var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var {WalletModel,WalletModelImport }                   = require('../../models/wallets');
var { MyReflectIdModel,DocumentReflectIdModel }        = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel
     ,DocumentMasterModel}                             = require('../../models/master');
var {MyReflectIdModel, DocumentReflectIdModel,
     FilesDocModel}                                    = require('../../models/reflect');
var {NotificationModel}                                = require('../../models/notification');
var dataUriToBuffer                                    = require('data-uri-to-buffer');
var {ClientVerificationModel,RequestDocumentsModel,
     RequestFilesModel}                                = require('../../models/request');
const request                                          = require('request');
var Jimp                                               = require('jimp');
var admin_notification                                 = require('../../helpers/admin_notification.js')
const formidable                                       = require('formidable');
var os                                                 = require('os');
const nodemailer                                       = require("nodemailer");
const express                                          = require('express');
var app                                                = express();
const ejs                                              = require('ejs');
var db                                                 = require('../../services/database');
var sequelize                                          = require('sequelize');
var dateTime                                           = require('node-datetime')
var crypto                                             = require('crypto');
var text_func                                          = require('../../helpers/text');
var mail_func                                          = require('../../helpers/mail');
const util                                             = require('util');
const { base64encode, base64decode }                   = require('nodejs-base64');
const generateUniqueId                                 = require('generate-unique-id');
var userData                                           = require('../../helpers/profile')
const Tx                                               = require('ethereumjs-tx')
const jwt                                              = require("jsonwebtoken");
const ipfsAPI                                          = require('ipfs-api');
const fs                                               = require('fs');
var async                                              = require('async');
const ipfs                                             = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
var token                                              = require('crypto').randomBytes(64).toString('hex')
// '09f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611'
const Web3                                             = require('web3');

var web3                                          = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/eda1216d6a374b3b861bf65556944cdb"));

function generateAccessToken(username) {

                                  // expires after half and hour (1800 seconds = 30 minutes)
                                  const tokenString = jwt.sign(username, "mySecretKey", { expiresIn: '1800s' });
                                  console.log(tokenString)
                                  return tokenString

}




exports.get_token =async (req,res,next )=> {

                const token = generateAccessToken({daata:"test"});
                                  res.json(token);

}

/**submit_register Post Method start**/
exports.submit_register =async (req,res,next )=> {

    success_msg          = req.flash('success_msg');
    err_msg              = req.flash('err_msg');

    console.log(req.body)

    var full_name        = req.body.full_name;
    var email            = req.body.email;
    var dob              = req.body.dob;
    var place_of_birth   = req.body.place_of_birth;
    var country_code_select = req.body.country_code_select;
    var mobile           = req.body.mobile;
    var last_name        = req.body.last_name;
    var now              = new Date();

     now.setMinutes(now.getMinutes() + 05); // timestamp
     now            = new Date(now); // Date object
     var otp_expire = now
     var otp        = generateOTP()
    

    function generateOTP() { 
         
        var digits = '0123456789'; 
        let OTP    = ''; 

        for (let i = 0; i < 4; i++ ) { 
            OTP += digits[Math.floor(Math.random() * 10)]; 
        } 

        return OTP; 
     } 


     var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
     var mystr = mykey.update(req.body.password, 'utf8', 'hex')
     mystr += mykey.final('hex');


   await UserModel.findOne({ where: {email: email} })
    
    .then(async function(userDataResult) {

                if(userDataResult){

                    res.send("User email is already registered.")

                }else{

                         await   UserModel.findOne({ where: {mobile_number:mobile} })
                            
                            .then(async function(userResult){

                                                if(userResult){

                                                  res.send("User email is already registered.")

                                                }else{

                                                       var steps=parseInt("5")

                                                    await    UserModel.create({
                                                                            full_name         :full_name,
                                                                            last_name         :last_name,
                                                                            email             :email,
                                                                            country_code_id   :country_code_select,
                                                                            mobile_number     :mobile,
                                                                            birthplace        :place_of_birth,
                                                                            dob               :dob,
                                                                            password          :mystr,
                                                                            otp,
                                                                            otp_expire,
                                                                            complete_steps    :steps,
                                                                            email_verification_status:"yes",
                                                                            type              :"same",
                                                                            user_pin          :otp
                                                         })

                                                          .then(async result=>{
            
                                                                                  console.log(result);
                                                                                  req.session.user_type  =  "client"
                                                                                  var user_id            = result.reg_user_id;
                                                                                  
                                                                                  var account            =await web3.eth.accounts.create();

                                                                                  var private_key        = account.privateKey  //private key
                                                                                //   let buff               = new Buffer(private_key);
                                                                                //   let query1             = buff.toString('base64');

                                                                                  var full_name          = result.full_name;

                                                                                //   var query2             = query1.trim();
                                                                                //   let buff1              = new Buffer(query2, 'base64');
                                                                                //   let private_key        = buff1.toString('ascii');

                                                                                  let account1            =await web3.eth.accounts.privateKeyToAccount(private_key)

                                                                                  const wallet_address   = account1.address;
                                                                                //   let buff2              = new Buffer(wallet_address);
                                                                                //   let address            = buff2.toString('base64');
                                                                                //   const query            = address.trim();
                                                                                //   let buff12             = new Buffer(query, 'base64');
                                                                                //   let wallet_address     = buff12.toString('ascii');

                                                                          await   web3.eth.getBalance(wallet_address, async (err,wei) => {

                                                                                  var balance = web3.utils.fromWei(wei, 'ether')

                                                                                    console.log("balance",balance);

                                                                                    const reflect_code = generateUniqueId({
                                                                                        length: 4,
                                                                                        useLetters: false
                                                                                      });

                                                                                   await   WalletModel.create({wallet_address:wallet_address,reg_user_id:user_id,balance:balance})

                                                                                      .then(async walletresult=>{



                                                                                     await   MyReflectIdModel.create({  reflect_code   : reflect_code,
                                                                                                                        reflectid_by  : "entity",
                                                                                                                        reg_user_id   : user_id,
                                                                                                                        user_as       : "client",
                                                                                                                        wallet_id     : walletresult.wallet_id 
                                                                                                                })
                                                                                            .then(async reflectData=>{

                                                                                               var obj={ privateKey     :  private_key,
                                                                                                         wallet_address  : wallet_address,
                                                                                                         reflect_id      : reflectData.reflect_id,
                                                                                                         reflect_code    :  reflectData.reflect_code
                                                                                                      }

                                                                                      const token = generateAccessToken({userDetails:result,walletDetails:obj});
                                                                                                      res.json(token);
                                                                                                // res.send({userDetails:result,walletDetails:obj})

                                                                                            })
                                                                                            .catch(err=>{
                                                                                                      console.log("errrrr 2st findOne",err)
                                                                                                      res.send(err)
                                            
                                                            
                                                                                              });



                                                                                                                })
                                                                                                                .catch(err=>{
                                                                                                                            console.log("errrrr 2st findOne",err)
                                                                                                                            res.send(err)
                                                                                                                                                
                                                                                                                   });
                                                                                                          

                                                                                  
                                                                                                                                             
                                                                 })
                                                                 .catch(err=>{

                                                                              console.log("update faunction err ",err)
                                                                              res.send(err)

                                                                  })
                                                           })
                                                    }
                  
                               })
                               .catch(err=>{
                                                  console.log("errrrr 2st findOne",err)
                                                  res.send(err)

                
                                 });
                     }
       
    })
    
    .catch(err=>{

        console.log("errrrr 1st findOne",err)
        res.send(err)

      
    });


    
}
/**submit_register Post Method End**/


exports.submit_documents = async(req,res,next )=> {
  console.log(".........................................submit_documents..................................................................................")

  console.log(req.body);
      function decodeBase64Image(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
          response = {};

        if (matches.length !== 3) {
          return new Error('Invalid input string');
        }

        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');

        return response;
      }
                  var testBuffer1= decodeBase64Image(req.body.document)
                  var exp_date        = req.body.exp_date
                  var doc_name_id     = req.body.doc_name
                  var doc_id_number   = req.body.id_number
                  var reflect_id      = req.body.reflect_id
                  var issue_date      = req.body.issue_date;
                  var issue_place     = req.body.issue_place;
                  var proof_of_address= req.body.proof_of_address;
                  var document_name   = req.body.document_name;
                  var dt              = dateTime.create();
                  var formatted       = dt.format('Y-m-d H:M:S');



      await  ipfs.files.add(testBuffer1.data,async function (err, file) {

                  if (err) {
                    console.log("err from ejs",err);
                    res.send(err)
                  }

                if(document_name){

                      await DocumentMasterModel
                      
                      .create({document_name:document_name,document_type:"other",createdAt:formatted,updatedAt:formatted})
                      
                      .then(async doc_data =>{

                          console.log("from issue_date if",doc_data.doc_id);

                          await DocumentReflectIdModel
                          
                          .create({doc_id:doc_data.doc_id,doc_unique_code:doc_id_number,reflect_id:reflect_id,proof_of_address,issue_place,issue_date,expire_date:exp_date})
                          
                          .then(async(doc) =>{

                              await   FilesDocModel
                              
                              .create({user_doc_id:doc.user_doc_id,file_content:file[0].hash})
                              
                              .then(async(doc_content) =>{
        
     
                                      res.send({file,doc_data,doc_content,doc})

        
                                }).catch(err=>{
                                  
                                  console.log("errr1 DocumentReflectIdModel",err)
                                  res.send(err)

                                })

                          }).catch(err=>{
                            
                            console.log("errr1 FilesDocModel ",err)
                            res.send(err)

                          })
                      })

                  }  else  {

                            await DocumentReflectIdModel
                            
                            .create({doc_id:doc_name_id,doc_unique_code:doc_id_number,reflect_id:reflect_id,proof_of_address,issue_place,issue_date,expire_date:exp_date})
                            
                            .then(async(doc) =>{

                                    await   FilesDocModel
                                    
                                    .create({user_doc_id:doc.user_doc_id,file_content:file[0].hash})
                                    
                                    .then(async(doc_content) =>{
        
                                                // res.redirect(`/entity?reflect_id=${reflect_id}`)

                                                res.send({file,doc_content,doc})
        
                                      }).catch(err=>{
                                        
                                        console.log("errr1 DocumentReflectIdModel",err)
                                        res.send(err)

                                      })

                              }).catch(err=>{
                                
                                console.log("errr1 FilesDocModel ",err);
                                res.send(err)
                              
                              })
                    } 


        })
  

}

exports.get_doc_of_master =async (req,res,next )=> {

      await  DocumentMasterModel
      
      .findAll({where:{status:'active',deleted:'0',document_type:'master'}})
      
      .then(async(allDocs) =>{

            res.send({allDocs})

      })

      .catch(err=>res.send(err))

}


/**request-doc Post method Start**/
exports.request_doc = async(req,res,next) =>{
  console.log("...........................................request_doc start*******....................................");
  
  
     var client_id       = req.body.user_id;
     var reflect_id      = req.body.reflect_id;
     var verifier_id     = req.body.verifier_id;
     var ver_ref_id      = req.body.verifier_reflect_id;
     var sub_cat_id      = req.body.sub_cat_id
     var p_cat_id        = req.body.p_cat_id

 
     const request_code  = generateUniqueId({
                          length: 6,
                          useLetters: false
       });

     var doc_id         =[]; 
     var download       =[];
     var view           =[];
     var certify        =[];
 
     doc_id             = JSON.parse(JSON.stringify(req.body.total_doc));
     download           = JSON.parse(JSON.stringify(req.body.download));
     view               = JSON.parse(JSON.stringify(req.body.view));
     certify            = JSON.parse(JSON.stringify(req.body.certify));
   

      
        await db.query("select * from tbl_admin_durations",{ type:db.QueryTypes.SELECT})
        
        .then(async function(due_date_data){
    
                            var duration = due_date_data[0].counting;
                            var dt       = new Date();

          if(due_date_data[0].duration=="month"){

              dt.setMonth( dt.getMonth() + parseInt(duration) );
              

          }
      
          await MyReflectIdModel.findOne({where:{deleted:"0",reflect_id:reflect_id}})
          
          .then(async(c_re_data)=>{
 
              UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
              MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
              await MyReflectIdModel.findOne({where:{deleted:"0",reflect_id:ver_ref_id},include:[UserModel]})
              
              .then(async(v_re_data)=>{
 
 
                  var  request_pin =   v_re_data.reflect_code+c_re_data.reflect_code+v_re_data.tbl_user_registration.user_pin
                  var mykey        = crypto.createCipher('aes-128-cbc', 'mypass');
                  var mystr        = mykey.update(request_pin, 'utf8', 'hex')
                  mystr += mykey.final('hex');
                  var cript_64_request_pin = mystr
     
 
 
                    await ClientVerificationModel
                    
                    .create({
                               request_code           : request_code,
                               verifier_id            : verifier_id,
                               verifer_my_reflect_id  : ver_ref_id,
                               reflect_id             : reflect_id,
                               client_id              : client_id,
                               request_pin            : cript_64_request_pin,
                               p_category_id          : p_cat_id,
                               sub_category_id        : sub_cat_id,
                               due_date               : dt
                        })
                        
                        .then(async(verifyRequest) =>{

 
                               var request_id = verifyRequest.request_id;

                               await UserModel

                               .findOne({ where: {reg_user_id: client_id} })
                               
                               .then(async(userData) =>{

                                  await  NotificationModel
                                  
                                  .create({
                                                  notification_msg   : `You have recieved a request from ${userData.full_name}.`,
                                                  sender_id          : client_id,
                                                  receiver_id        : verifier_id,
                                                  request_id         : request_id,
                                                  notification_type  : '1',
                                                  notification_date  : new Date()
                                    })
                                    
                                    .then(async(notification) =>{

                                           for(var i=0;i<doc_id.length;i++){
                     
                                               await RequestDocumentsModel
                                                    
                                              .create({request_id:request_id,user_doc_id:doc_id[i],download:download[i],view:view[i],certified:certify[i]})
                                                    
                                              .then(async(success) =>{

                                                    if( i == (doc_id.length-1) ) {

                                                            await upload_water_mark();
                                                      
                                                    }
                            
                                              })
                                              
                                              .catch(err=>console.log("RequestDocumentsModel err",err, res.send(err)))
                                           }
 
                  async function upload_water_mark(){
 
                                      await db
                                            
                                      .query('SELECT * FROM tbl_request_documents WHERE request_id='+request_id+' AND deleted="0"',{ type:db.QueryTypes.SELECT})
                                            
                                      .then(async(requestDocumentData)=>{

                                          var new_hash_array  = []
                                          var countForSend    = 0

                                         for(var z=0; z<requestDocumentData.length;z++){

                                           await db
                                           
                                           .query('SELECT * FROM tbl_request_documents INNER JOIN tbl_files_docs ON tbl_request_documents.user_doc_id=tbl_files_docs.user_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id= tbl_client_verification_requests.request_id WHERE tbl_request_documents.request_id='+request_id+' AND tbl_request_documents.deleted="0" AND tbl_files_docs.deleted="0" AND tbl_request_documents.user_doc_id='+requestDocumentData[z].user_doc_id,{ type:db.QueryTypes.SELECT})
                                           
                                           .then(async(SortrequestDocumentData)=>{

                                                 async.each(SortrequestDocumentData,async function (content1, cb) {
 
                                                   var w_text             =  "MY_reflect"+content1.request_code;
                                                   var self_attested_hash =  content1.self_attested_hash
                                                   var fun_hash;

                                                  if ( self_attested_hash ) {

                                                      fun_hash    = content1.self_attested_hash
                                                        
                                                   } else  {

                                                      fun_hash    = content1.file_content

                                                    }

                                                  console.log("hello-----------1 ");
                                                  await Jimp.create(720,520,'#ffffff',async function(err, nova_new) {
                                                    console.log("hello-----------2 ");
                                                        var a;

                                                        const delay = (duration) =>
                                          
                                                        new Promise(resolve => setTimeout(resolve, duration))

                                                        var srcImage;

                                                        async function wait_hash(){

                                                          if (self_attested_hash) {
              
                                                             await request(`https://ipfs.io/ipfs/${fun_hash}`, async function (error, response, body) {
                                  
                                                                 if (  !error && response.statusCode == 200  ) {
                                                                                                    
                                                                          srcImage = dataUriToBuffer(body);

                                                                  }
                                       
                                                              })
                                                                                      
                                                              await delay(10000)

                                                          } else {
                                    
                                                                 srcImage = `https://ipfs.io/ipfs/${fun_hash}`

                                                          }  
                                                       }
                   
                                                         await wait_hash();

                                                         console.log("aer image-----------1 ",srcImage);

 
                                                         a= await Jimp.read(srcImage,async function(err, image) {

                                                            await image.resize(720, 520);

                                                         var b;
                                                         
                                                         b=  await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK ,async function(err, font) {
                    
                                                         var c;

                                                         image.print(font,image.bitmap.width/2.5,image.bitmap.height/2.5,w_text)
                                                         nova_new.composite(image,0,0);
                                                         nova_new.composite(image,-100,350);
                                                         image.resize(200,200);
                         

                                                         var d  = await   image.getBase64Async(Jimp.MIME_PNG)
                          
                                                         let testBuffer = new Buffer(d);

                                                         var e;

                                                         e = await  ipfs.files.add(testBuffer, async function (err, file) {

                                                          if (err) {

                                                                     console.log("err from ejs",err,res.send(err));
                                                                     
                                                          } else {

                                                                 await  RequestFilesModel
                                                                 
                                                                 .create({
                                                                          request_doc_id   :content1.request_doc_id,
                                                                          request_file_hash:file[0].hash
                                                                   })
                                                                   
                                                                   .then(async (dataForReturn)=>{
                                        
                                                                        if( countForSend == (requestDocumentData.length-1) ) {
    
                                                                          await finalRespone()

                                                                        }

                                                                          countForSend++
            
                                                                        return "dataForReturn"; 
                                                                     })
        
                                                          }
                                                                    
                                    })
                            
                                    
             }) 
             
                    })
                    
                });
 
 
            })
 
 
                
            })
        }
           
        })
 }
 
 async function finalRespone(){
     res.send({done:"success"})
 }

 
                                     })
                                     
                                     .catch(err=>console.log("notification err",err,res.send(err)))
                               })
                               
                               .catch(err=>console.log("notification err err",err,res.send(err)))
 
                         })
                         
                         .catch(err=>console.log("notification err err ",err,res.send(err)))
              })
              
              .catch(err=>console.log("err client",err,res.send(err)))
          })
          
          .catch(err => console.log("err v_code",err,res.send(err)))
         })
         
         .catch(err => console.log("err v_code",err,res.send(err)))

 }
/**request-doc Post method End**/


/**get-verifier-list Get method Start**/
exports.get_verifier_list = async (req,res,next) =>{

  var verifier_array  = [];
  var user_id         = req.params.id;

  await db
  
  .query('select * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.user_as="verifier" and  tbl_wallet_reflectid_rels.reg_user_id!='+user_id,{ type:db.QueryTypes.SELECT})
  
  .then(async function(verifiers){

      for(var i=0;i<verifiers.length;i++){

          await db
          
          .query('SELECT count(*) as total from tbl_myreflectid_doc_rels where reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT})
          
          .then(async function(verifier_docs){

              await db
              
              .query('SELECT count(*) as verified from tbl_myreflectid_doc_rels where admin_status="verified" AND reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT})
              
              .then(function(verified_docs){

                  if(verifier_docs[0].total == verified_docs[0].verified && verifier_docs[0].total != 0) {

                      verifier_array.push(verifiers[i]);
                  }

               })

               .catch(err=>res.send(err))

           })

           .catch(err=>res.send(err))
      }

        res.send(verifier_array);

   })

   .catch(err=>res.send(err))
}
/**get-verifier-list Get method End**/


/** get-category-list Post Method Start  **/
exports.get_category_list = (req,res,next) =>{

    var reflect_id = req.params.id;

    db

    .query("select * from tbl_verifier_category_reflectids inner join tbl_verifier_request_categories ON tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id WHERE tbl_verifier_request_categories.deleted='0' and tbl_verifier_request_categories.parent_category='0' and tbl_verifier_category_reflectids.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT})
    
    .then(function(categories){
      
        res.send(categories)

    })

    .catch(err=>res.send(err))
} 
/** get-category-list Post Method End  **/ 

/** get-sub-category-list Post Method Start  **/
exports.get_sub_category_list = (req,res,next) =>{

  var category_id = req.params.id;

  db
  
  .query("select * from tbl_verifier_request_categories WHERE deleted='0' and parent_category="+category_id,{ type:db.QueryTypes.SELECT})
  
  .then(function(sub_categories){

          res.send(sub_categories)

  })

  .catch(err=>res.send(err))

}



exports.get_added_doc= async(req,res,next) =>{

  var reflect_id =req.params.id

  await  DocumentReflectIdModel.findAll({where:{reflect_id:reflect_id}}).then(async(doc_data)=>{
 
    await  db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(document){
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

            var counter=0;

          await db.query("SELECT * FROM tbl_files_docs where deleted='0' and user_doc_id="+doc_id,{ type:db.QueryTypes.SELECT})
          .then(async doc_content=>{
             
             //await doc_content.forEach(async content =>{
                 async.each(doc_content,async function (content, cb) {

                 if(content.type=='image'){


                     all_doc_content.push(content.file_content);
                    

                    
     if(content.self_attested_hash){

         console.log("content.file_content",content.self_attested_hash);
         var url1='https://ipfs.io/ipfs/';
         var url2=content.self_attested_hash;
         var final_url=url1.concat(url2);

         console.log('final url',final_url);


         console.log("content.self",content.self_attested_hash);

        // console.log('https://ipfs.io/ipfs/'+content.self_attested_hash);
       

         await request(final_url,callback);


       function callback(error, response, body) {
         
         if(!error){

             //return body; 

            all_self_attested.push(body); 

            console.log("length",all_self_attested.length);
                                 
          }
                         
      }

      console.log("self attested 1---",all_self_attested);

     
                         
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
             // console.log("---------doc_content---------- ",all_self_attested);


              documents[i].file_content = all_doc_content;
              documents[i].video_content = all_video_content;
              documents[i].self_attested_content = all_self_attested;
             
                 // var all_docs = all_doc_content.join(',');
                
         
        }
         //   console.log("---------doc_content---------- ",documents);
       res.send(documents)
 // }
  })
}) 

}