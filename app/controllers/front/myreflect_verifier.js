var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel,FilesDocModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var { tbl_verifier_plan_master,tbl_verifier_doc_list} = require('../../models/admin');
var { tbl_verfier_purchase_details } =require("../../models/purchase_detaile")
let path = require("path")
var admin_notification = require('../../helpers/admin_notification.js')
var async = require('async');
var request= require('request');
var dataUriToBuffer = require('data-uri-to-buffer');

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
const formidable = require('formidable');

const ipfsAPI = require('ipfs-api');
const fs = require('fs');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})


/** submit_myreflect_verifier Post Method Start**/
exports.submitMyreflectVerifier = async(req,res,next )=> {
  console.log("----------------------------------submitMyreflectVerifier-----------------------------------------------------");
 
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
  var verifier_type                    = req.body.verifier_type
  var reflectid_by                     = req.body.o1
  var category_id                      = req.body.category_id
  var reflect_username                 = req.body.reflect_username
  var f_name                           = req.body.f_name
  var L_name                           = req.body.L_name
  var email                            = req.body.email
  var wallet_id                        = req.body.wallet_id  
  var reflect_code                     = req.body.reflect_code
  var wallet_name                      = req.body.wallet_name
  var verifier_type_name1              = req.body.verifier_type_name

  console.log("verifier_type_name1: ",verifier_type_name1)

  console.log("verifier_type: ",verifier_type)

  // MyReflectIdModel.create({
  //                           reflect_code   : reflect_code,
  //                           reflectid_by   : "representative",
  //                           reg_user_id    : req.session.user_id,
  //                           user_as        : req.session.user_type,
  //                           verifier_type  : verifier_type,
  //                           verifier_category_id : category_id,
  //                           wallet_id      : wallet_id,
  //                           rep_username   : reflect_username,
  //                           rep_firstname  : f_name,
  //                           rep_lastname   : L_name,
  //                           rep_emailid    : email,
  //                         }).then(result=>{
                           
  //                           res.redirect("/verifier_representative")
  //                               //  res.render('front/my-reflect-id-verifier',{
  //                               //                               success_msg,
  //                               //                               err_msg
  //                               //                          });

  //                         }).catch(err=>console.log("errrr",err))

             
                 var rep_name,entity_name;
                 if(reflectid_by==="entity")
                 {
                   rep_name=""
                   entity_name=f_name
                 }else
                 {
                   rep_name=f_name
                 }
                       
                 await   UserModel.findOne({where:{reg_user_id:req.session.user_id}}).then(async user_data => {
            


                            await   CountryModel.findOne({where:{country_name:decrypt(user_data.birthplace)}}).then(async country_data => {
                                              // console.log(" country_data.country_id : ",country_data.country_id)

                                                  await  DocumentMasterModel.findAll({where:{status:'active',deleted:'0',document_type:'master'}}).then(async(allDocs) =>{
                                                      // console.log("---------------",allDocs);
                                                              await  CountryModel.findAll().then(async(allCountries)=>{
                                                                
                                                                    MyReflectIdModel.create({
                                                                    reflect_code   : reflect_code,
                                                                    reflectid_by   : reflectid_by,
                                                                    reg_user_id    : req.session.user_id,
                                                                    user_as        : 'verifier',
                                                                    verifier_type  : verifier_type,
                                                                    verifier_category_id : category_id,
                                                                    wallet_id      : wallet_id,
                                                                    rep_username   : reflect_username,
                                                                    rep_firstname  : rep_name,
                                                                    entity_name    :  entity_name,
                                                                    rep_lastname   : L_name,
                                                                    rep_emailid    : email,
                                                                    wallet_name    :  wallet_name,
                                                                    entity_company_country:country_data.country_id,
                                                                    verifier_type_name:verifier_type_name1
                                                                    }).then(async(result)=>{
                                                                    //  await tbl_verfier_purchase_details.update({reflect_id:result.reflect_id},{where:{reg_user_id:req.session.user_id,reflect_id:"NULL"}})
                                                                    await db.query('UPDATE tbl_verfier_purchase_details SET reflect_id='+result.reflect_id+' WHERE reg_user_id='+req.session.user_id+' AND reflect_id IS NULL') 
                                                                    .then(puchasedResult=>{
                                                                        console.log("data dave of reflecct@@@@@@@@@@@@@@@",result.reflect_id)
                                                                        console.log("data dave of reflecct@@@@@@@@@@@@@@@",puchasedResult)
                                                                        DocumentMasterModel.hasMany(DocumentReflectIdModel, {foreignKey: 'doc_id'})
                                                                        DocumentReflectIdModel.belongsTo(DocumentMasterModel, {foreignKey: 'doc_id'})
                                                                        DocumentReflectIdModel.findAll({where:{reflect_id:result.reflect_id},include: [DocumentMasterModel]}).then(async document =>{
                                                                            var documents;
                                                                            console.log(document);
                                                                            if(document==""){
                                                                              documents = null;
                                                                            }else{
                                                                              documents = document;
                                                                            }
                                                                        var wall_id = result.wallet_id;
                                                                        var country_id = result.entity_company_country;
                                                                        var additional_info_array = [];
                                                                        if(result.additional_info!=null){
                                                                        additional_info_array.push(JSON.parse(result.additional_info));
                                                                        console.log("-----------------------------",additional_info_array);
                                                                        }else{
                                                                            additional_info_array.push(result.additional_info);
                                                                        console.log("-----------------------------",additional_info_array);
                                                                        }

                                                                        var u_data = await db.query("SELECT * FROM tbl_user_registrations where deleted='0' and reg_user_id="+req.session.user_id,{ type:db.QueryTypes.SELECT});
                                                                        var msg = `${decrypt(u_data[0].full_name)} has become a verifier as ${reflectid_by}.`
                                                                              
                                                                        admin_notification(msg,req.session.user_id,result.reflect_id,'4');
                                                                        if(country_id!=null){
                                                                            CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                                                                                UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                                                                                WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                                                                                WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                                                                                    
                                                                                    res.render('front/my-reflet-id-verifier/my-reflet-id-view',{session:req.session,result,additional_info_array,user,country:country.country_name,moment,allCountries,documents,allDocs});
                                                                            
                                                                              
                                                                                })
                                                                            })
                                                                        }else{
                                                                            var country = "";
                                                                            UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                                                                            WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                                                                            WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                                                                                
                                                                                res.render('front/my-reflet-id-verifier/my-reflet-id-view',{session:req.session,result,additional_info_array,user,country,moment,allCountries,documents,allDocs});
                                                                        
                                                                          
                                                                            })
                                                                        }
                                                                    })
                                                                    .catch(err =>{
                                                                        console.log(err);
                                                                    })
                                                                })

                                                              })
                                                                })
                                                
                                              })
                    }) 


  })

}
/** submit_myreflect_verifier Post Method End**/

/** myreflect-verifier-view Get Method Start**/
exports.myreflect_verifier_view = async (req,res,next) =>{
    var reflect_code = req.query.id.trim();;
    var allDocs = await DocumentMasterModel.findAll({where:{deleted:"0",status:"active",document_type:"master"}});
    var allCountries = await CountryModel.findAll();
    var result = await MyReflectIdModel.findOne({where:{reflect_code:reflect_code}});
    DocumentMasterModel.hasMany(DocumentReflectIdModel, {foreignKey: 'doc_id'});
    DocumentReflectIdModel.belongsTo(DocumentMasterModel, {foreignKey: 'doc_id'});
    await DocumentReflectIdModel.findAll({where:{reflect_id:result.reflect_id},include: [DocumentMasterModel]}).then(async document =>{
        console.log("-----------documents", document);       
        var documents;
                                      console.log(document);
                                      if(document==""){
                                        documents = null;
                                      }else{
                                         documents = document;
                                      }
for(var i=0;i<document.length;i++){
    //    console.log(i);
       var doc_id=document[i].user_doc_id;
       console.log("doc_id",doc_id);
       var all_doc_content =[];
       var all_video_content=[];
       var all_pdf_content=[];


    var doc_content = await db.query("SELECT * FROM tbl_files_docs where deleted='0' and user_doc_id="+doc_id,{ type:db.QueryTypes.SELECT});
        // console.log("---------doc_content---------- ",doc_content);
        doc_content.forEach(content =>{
            if(content.type=='image'){  
                all_doc_content.push(content.file_content);
              }else if(content.type =='pdf'){
                all_pdf_content.push(content.file_content);
                console.log("all_pdf_content : ",all_pdf_content)

            }
            else
            {

                all_video_content.push(content.file_content);
            }
          
            
            })
            // var all_docs = all_doc_content.join(',');
            documents[i].file_content = all_doc_content;
            documents[i].video_content = all_video_content;
            documents[i].pdf_content = all_pdf_content;

   }
                                  var wall_id = result.wallet_id;
                                  var country_id = result.entity_company_country;
                                  var additional_info_array = [];
                                  if(result.additional_info!=null){
                                  additional_info_array.push(JSON.parse(result.additional_info));
                                  console.log("-----------------------------",additional_info_array[0]);
                                  }else{
                                      additional_info_array.push(result.additional_info);
                                  console.log("-----------------------------",additional_info_array[0]);
                                  }
                                  if(country_id!=null){
                                      CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                                          UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                                          WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                                          WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                                               
                                              res.render('front/my-reflet-id-verifier/my-reflet-id-view',{session:req.session,result,additional_info_array,user,country:country.country_name,moment,allCountries,documents,allDocs});
                                       
                                         
                                           })
                                      })
                                  }else{
                                      var country = "";
                                      UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                                      WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                                      WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                                          
                                          res.render('front/my-reflet-id-verifier/my-reflet-id-view',{session:req.session,result,additional_info_array,user,country,moment,allCountries,documents,allDocs});
                                   
                                     
                                      })
                                  }                        
    })
}
/** myreflect-verifier-view Get Method End**/

// exports.myreflect_verifier_view = (req,res,next)=>{

//     var reflect_code = req.query.id.trim();
//     DocumentMasterModel.findAll().then(allDocs =>{
//     CountryModel.findAll().then(allCountries=>{
//         MyReflectIdModel.findOne({where:{reflect_code:reflect_code}}).then(result => {
//           var reflect_id = result.reflect_id;
//           db.query("SELECT * FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id INNER JOIN  tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id where tbl_wallet_reflectid_rels.user_as='verifier' and tbl_myreflectid_doc_rels.deleted='0' and tbl_myreflectid_doc_rels.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(document){
//               var documents;
//               if(document==""){
//                 documents = null;
//               }else{
//                   documents=document;
//             //   console.log("---------doc_content----------123",documents);
//                for(var i=0;i<document.length;i++){
//                 //    console.log(i);
//                    var doc_id=document[i].user_doc_id;
//                    console.log("doc_id",doc_id);
//                    var all_doc_content =[];
//                    var all_video_content=[];
//                 var doc_content = await db.query("SELECT * FROM tbl_files_docs where deleted='0' and user_doc_id="+doc_id,{ type:db.QueryTypes.SELECT});
//                     // console.log("---------doc_content---------- ",doc_content);
//                     doc_content.forEach(content =>{
//                         if(content.type=='image'){
//                             all_doc_content.push(content.file_content);
//                         }else{
//                             all_video_content.push(content.file_content);
//                         }
                        
                        
//                         })
//                         // var all_docs = all_doc_content.join(',');
//                         documents[i].file_content = all_doc_content;
//                         documents[i].video_content = all_video_content;
                
//                }
//                console.log("---------doc_content---------- ",documents);
//               }
//             var additional_info_array = [];
//             if(result.additional_info!=null){
//                 additional_info_array =JSON.parse(result.additional_info);
//                 }else{
//                     additional_info_array=result.additional_info;
//                 }
//                 // console.log("------------------------",additional_info_array);
//             var wall_id = result.wallet_id;
//             var country_id = result.entity_company_country;
//             if(country_id!=null){
//                 await CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
//                     UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
//                     WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
//                     WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
//                         // additional_info_array.push(JSON.parse(result.additional_info));
//                          res.render('front/my-reflet-id-verifier/my-reflet-id-view',{session:req.session,result,additional_info_array,user,country:country.country_name,moment,allCountries,documents,allDocs});
                
                
//                     })
//                 })
//             }else{ 
//                 UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
//                 WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
//                 await WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
//                 res.render('front/my-reflet-id-verifier/my-reflet-id-view',{session:req.session,result,additional_info_array,user,moment,allCountries,country:null,documents,allDocs});
//                 })
            
         
//              }  
        
//         })
//         })
     
//     }) 
// })
// }

/**upload-new-doc-verifier-rep Post Method Start**/
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
console.log("-----------reflect_id------------ ",reflect_id);

   let testFile = fs.readFileSync(files.staff_image.path);
  let testBuffer = new Buffer(testFile);

  ipfs.files.add(testBuffer, function (err, file) {
    if (err) {
      console.log("err from ejs",err);
    }
   
    FilesDocModel.create({user_doc_id:user_doc_id,file_content:file[0].hash,type:type}).then(doc_content =>{

    MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
        res.redirect('/myreflect-verifier-view?id='+result.reflect_code);
    });    

    })
   

})
});
 }
/**upload-new-doc-verifier-rep Post Method End**/

/**update-verifier-representative Post Method Start**/
exports.update_representative = (req,res,next) =>{
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
   var reflectid_by = req.body.reflectid_by;


  
                
                     
  if(firstname!=undefined){
    MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                 if(result.reflectid_by=="entity")
                 {
         
                   MyReflectIdModel.update({entity_name:firstname},{where:{ reflect_id: reflect_id} }).then(async (success) => {
         
                    res.redirect('/myreflect-verifier-view?id='+result.reflect_code);
                       }); 
                }
               else
               {
                    MyReflectIdModel.update({rep_firstname:firstname},{where:{ reflect_id: reflect_id} }).then(async (success) => {

                        res.redirect('/myreflect-verifier-view?id='+result.reflect_code);
                        }); 
                 }
 
  })
  }else if(lastname!=undefined){
      MyReflectIdModel.update({rep_lastname:lastname},{where:{ reflect_id: reflect_id} }).then(async (success) => {
          MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
            res.redirect('/myreflect-verifier-view?id='+result.reflect_code);
          })
})
  }else if(middlename!=undefined){
     
      MyReflectIdModel.update({rep_lastname:lastname},{where:{ reflect_id: reflect_id} }).then(async (success) => {
          MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
            res.redirect('/myreflect-verifier-view?id='+result.reflect_code);
          })
      
    
})
  }else if(country_name!=undefined){
          MyReflectIdModel.update({entity_company_country:country_name},{where:{ reflect_id: reflect_id} }).then( (success) => {
              MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                res.redirect('/myreflect-verifier-view?id='+result.reflect_code);
              })
          
          
    
})
  }else if(company_address!=undefined){
      
      MyReflectIdModel.update({entity_company_address:company_address},{where:{ reflect_id: reflect_id} }).then(async (success) => {
          MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
            res.redirect('/myreflect-verifier-view?id='+result.reflect_code);
          })
      
     
})
  }else if(company_name!=undefined){
     
      MyReflectIdModel.update({rep_company_name:company_name,entity_company_name:company_name},{where:{ reflect_id: reflect_id} }).then(async (success) => {
          MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
            res.redirect('/myreflect-verifier-view?id='+result.reflect_code);
          })
      
     
})
  }else if(btc_wallet_address!=undefined){
    
      MyReflectIdModel.update({rep_btc_address:btc_wallet_address},{where:{ reflect_id: reflect_id} }).then(async (success) => {
          MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
            res.redirect('/myreflect-verifier-view?id='+result.reflect_code);
          })
      
      
})
  }else if(eth_wallet_address!=undefined){
    
      MyReflectIdModel.update({rep_eth_addess:eth_wallet_address},{where:{ reflect_id: reflect_id} }).then(async (success) => {
          MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
            res.redirect('/myreflect-verifier-view?id='+result.reflect_code);
          })
      
    
})
  }else if(rep_nationality!=undefined){
   
      MyReflectIdModel.update({rep_nationality:rep_nationality},{where:{ reflect_id: reflect_id} }).then(async (success) => {
          MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
            res.redirect('/myreflect-verifier-view?id='+result.reflect_code);
          })
      
   
})
  }
}
/**update-verifier-representative Post Method End**/

/**verifier-additional-info Post Method Start**/
exports.additional_info = (req,res) =>{
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

        res.redirect('/myreflect-verifier-view?id='+result.reflect_code);
             // additional_info_array.push(JSON.parse(result.additional_info));
              
          })
      })
      
      
  
}
/**verifier-additional-info Post Method End**/

/**add-new-doc-ver-rep Post Method Start**/
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
//   var doc_filename = req.file.filename;
  let testFile = fs.readFileSync(files.document.path);
  let testBuffer = new Buffer(testFile);
  var ext = path.extname(files.document.name);

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


  let ext_type = (ext == ".pdf") ? "pdf" :"image";
    ipfs.files.add(testBuffer,async function (err, file) {
    if (err) {
      console.log("err from ejs",err);
    }
            var dt = dateTime.create();
             var formatted = dt.format('Y-m-d H:M:S');

   var document_name=fields.document_name;
                            
                             console.log("from issue_date document_name",document_name);

       if(document_name)
         {
         await DocumentMasterModel.create({document_name:document_name,document_type:"other",createdAt:formatted,updatedAt:formatted}).then(doc_data =>{

            console.log("from issue_date if",doc_data.doc_id);

               


    DocumentReflectIdModel.create({doc_id:doc_data.doc_id,doc_unique_code:id_number,document_filename:file[0].hash,reflect_id:reflect_id,issue_place,proof_of_address,issue_date,expire_date:expiry_date,admin_status:"pending"}).then(doc =>{
        FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash,type:ext_type}).then(doc_content =>{
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(async(result) => {
              await   UserModel.findOne({where:{reg_user_id:req.session.user_id}}).then(user_data => {

             var msg = `${decrypt(user_data.full_name)}- ${result.reflect_code} has request to verify document.`   
              admin_notification(msg,req.session.user_id,reflect_id,'4');
                res.redirect('/myreflect-verifier-view?id='+result.reflect_code);

              })
            });  
            // console.log('doc_content : ',doc_content)
      
                               })
                          })
                })
       }

else
      {

       

       DocumentReflectIdModel.create({doc_id:doc_id,doc_unique_code:id_number,document_filename:file[0].hash,reflect_id:reflect_id,issue_place,proof_of_address,issue_date,expire_date:expiry_date,admin_status:"pending"}).then(doc =>{
        FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash,type:ext_type}).then(doc_content =>{
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(async(result) => {
              await   UserModel.findOne({where:{reg_user_id:req.session.user_id}}).then(user_data => {

             var msg = `${decrypt(user_data.full_name)}- ${result.reflect_code} has request to verify document.`   
              admin_notification(msg,req.session.user_id,reflect_id,'4');
                res.redirect('/myreflect-verifier-view?id='+result.reflect_code);
                       })
                          })
              })
            });  
   }
  
})
})
}
/**add-new-doc-ver-rep Post Method End**/





 exports.unique_code_check_user = async (req,res,next) =>{

    var unique_code = req.body.unique_code;
    var user_id=req.session.user_id;
    var reflect_id=req.body.reflect_id;

    var data;
    var match_data;

              await     DocumentReflectIdModel.findAll({where:{doc_unique_code : unique_code}}).then(async doc_content =>{

                    if(doc_content.length>0)
                          {
                             console.log('doc_content.length : ',doc_content.length)

                             // for(var i=0;i<doc_content.length;i++){

                            async.each(doc_content,async function (doc_ontent, cb) {

                                 var doc_reflect_id = doc_ontent.reflect_id

                                                                         

                             console.log('doc_content.reflect_id : ',doc_reflect_id)

                                    await MyReflectIdModel.findOne({where:{reflect_id:doc_reflect_id}}).then(async(result) => {

                           
                                              var doc_reflect_id_user = result.reg_user_id

                                         // console.log('result.reflect_id : ',doc_reflect_id_user)
                                         

                                       await  db.query("SELECT * FROM `tbl_wallet_reflectid_rels` WHERE reg_user_id<>"+user_id,{ type:db.QueryTypes.SELECT}).then(function(reflet_data){

                                            var reflet_data_length = reflet_data.length;

                                               async.each(reflet_data,async function (ref_ontent, cb) {
                                          
                                               var reflect_id_user = ref_ontent.reg_user_id


                                                // console.log('reflet_data_length : ',reflet_data_length)

                                            if(doc_reflect_id_user==reflect_id_user)
                                            {

                                             // console.log('match: ')

                                                data = "match"
                                               match_data=1;
                                                res.send("match")

                                               // return false;
                                            }
                                            else
                                            {
                                                // console.log('NOT match')
                                                         
                                                 data = "not-match"
                                                       

                                                            if(reflet_data_length==1)
                                                            {
                                                              if(match_data!==1)      
                                                               {

                                                             console.log('reflet_data_length : ',reflet_data_length)
                                                                var n_data = "not-match"
                                                              res.send(n_data)
 
                                                               }
                                                           
                                                       }
                                              
                                                  
                                                              
                                            } 
                                                
                                        reflet_data_length = reflet_data_length-1;

                                          })

                                    })

                
                               }) 
                          })
                                  

                       }
                       else
                       {

                                                console.log('Outer NOT match')

                                                  var data = "not-match"
                                                  res.send(data)

                                           
                       }
              })
                     
}