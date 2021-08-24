var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel, FilesDocModel} = require('../../models/reflect');
const {ShareEntityModel}=require('../../models/shareentity');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel,AdminDocumentRequest} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var {NotificationModel} = require('../../models/notification');
var admin_notification = require('../../helpers/admin_notification.js')
const { DigitalWalletRelsModel } = require('../../models/wallet_digital_rels');
var {DocFolderModel} =require('../../models/doc_folder');
const record_rtc = require('recordrtc');
const formidable = require('formidable');
var { decrypt, encrypt,encrypt1,decrypt1 } = require('../../helpers/encrypt-decrypt')
const {pushnotification,updateNotification,btcbalance}=require('../apies/helper');
const nodemailer = require("nodemailer");
var db = require('../../services/database');
var sequelize = require('sequelize');
const {DocumentTransactionModel}=require('../../models/document_trans_his');
const Op = sequelize.Op;
const paginate   =  require("paginate-array");

var dateTime = require('node-datetime')
var crypto = require('crypto'); 
var text_func=require('../../helpers/text');
var mail_func=require('../../helpers/mail');
const util = require('util');
const { base64encode, base64decode } = require('nodejs-base64');
const generateUniqueId = require('generate-unique-id');
var moment = require('moment');
// const formidable = require('formidable');
var Jimp = require('jimp');
var toBuffer = require('blob-to-buffer')
const request = require('request');

const ipfsAPI = require('ipfs-api');
const fs = require('fs');
var async = require('async');

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://128.199.31.153:8501"));
const contractAddress= '0xB8bF5431D027f2Dbc58923E794d48e7bdE91c92E';
var contractABI = [
  {
    constant: true,
    inputs: [{ name: "", type: "uint256" }],
    name: "documents",
    outputs: [{ name: "doc", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "doc", type: "string" },
      { name: "verifier_email", type: "string" },
      { name: "client_email", type: "string" },
      { name: "doc_name", type: "string" },
      { name: "verifier_myReflect_code", type: "string" },
      { name: "client_myReflect_code", type: "string" },
      { name: "request_status", type: "string" },
      { name: "reason", type: "string" },
    ],
    name: "addDocument",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "getDocumentsCount",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "index", type: "uint256" }],
    name: "getDocument",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];
const InputDataDecoder = require("ethereum-input-data-decoder");

const decoder = new InputDataDecoder(contractABI);








/**document-list get Method Start  **/
exports.document_list=async(req,res,next) =>{
    var user_type=req.session.user_type;
    var userId=req.session.user_id

    var user_id=req.session.user_id;
    var reflect_code_array=[]
        console.log('hello')
  success_msg = req.flash('success_msg'); 
    err_msg = req.flash('err_msg');

  var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    //  function onlyUnique(value, index, self) { 
    //         return self.indexOf(value) === index;
    //     }
    if(user_id)
    {
        /**get my all reflect code start**/
        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",unique_reflect_code)
        console.log(' if hello')
      await  DocumentMasterModel.findAll({where:{status:'active',deleted:'0',document_type:'master'}}).then(async(allDocs) =>{
        
              await  MyReflectIdModel.findAll({where:{reg_user_id:user_id}}).then(async(allReflect) =>{

      for(var i=0;i<allReflect.length;i++)
{
      await db.query("SELECT *from (SELECT max(user_doc_id)  as 'user_doc_id',reflect_id,doc_id,expire_date,self_assested,certified_status,createdAt as 'created_doc' FROM `tbl_myreflectid_doc_rels` where reflect_id="+allReflect[i].reflect_id+" GROUP BY doc_id) as doc_table INNER JOIN tbl_documents_masters ON doc_table.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on doc_table.reflect_id=tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.user_as='client' and tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){

        
      for(var j=0;j<all_document_Data.length;j++)
      {
        reflect_code_array.push(all_document_Data[j])
      }

})}
                         console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",reflect_code_array)
                        console.log(' db hello')
                      await  db.query("SELECT DISTINCT reflect_code,user_as,profile_pic,reflect_id,entity_company_name,full_name from  tbl_user_registrations inner join tbl_wallet_reflectid_rels ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id  WHERE  user_as='client' and reflectid_by<>'digitalWallet' AND tbl_user_registrations.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(all_reflect_codes){
                            console.log('users type : ',all_reflect_codes)
                          await  db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id  WHERE   tbl_user_registrations.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_user){
                                // console.log("HHHHHHHHHHHHHHHHHHHHH : ",verifier_user)
                      
                       await db.query("SELECT DISTINCT user_as,reflect_code,rep_firstname,entity_company_name,full_name from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  inner join tbl_wallet_reflectid_rels on tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id  inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE   tbl_wallet_reflectid_rels .reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(unique_reflect_code){
                            //    unique_reflect_code = reflect_code.filter( onlyUnique );
                            // console.log("HHHHHHHHHHHHHHHHHHHHH : ",unique_reflect_code)   


                                    
                                      
        // console.log(' db hello : ',report_list_result)
       await db.query("SELECT * FROM tbl_wallet_reflectid_rels Where reflectid_by<>'digitalWallet' and user_as='client'  AND reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async(myids)=>{
               

                 for(var i=0;i< reflect_code_array.length;i++)
                {
                 var user_doc_id = reflect_code_array[i].user_doc_id;

                 console.log('user_doc_id : ',user_doc_id)
                          

                      await db.query("SELECT * FROM `tbl_request_documents` INNER JOIN tbl_client_verification_requests on tbl_client_verification_requests.request_id=tbl_request_documents.request_id INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_client_verification_requests.verifer_my_reflect_id WHERE user_doc_id="+user_doc_id+" order by request_doc_id desc",{ type:db.QueryTypes.SELECT}).then( async(user_doc)=>{


                               if(user_doc.length>0)
                               {
                                reflect_code_array[i].request_data = user_doc
                              

                                       }
                               else
                               {
                                             reflect_code_array[i].request_data = 'undefined'

                                }
                    
                         })


               }
                   console.log(reflect_code_array)
                          if (reflect_code_array.length > 0) {

                                   page_data=reflect_code_array
                                       
                          }
    
        const doc_report_list = paginate(page_data,page, perPage); 
                 res.render('front/my-document/my-document',{
                            success_msg,
                            err_msg,
                            session:req.session,
                            moment,
                            reflect_code_array:doc_report_list,unique_reflect_code,user_type,all_reflect_codes,verifier_user,allDocs,myids
                        

                        })   });});})
            })
        });
      })
        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

}


exports.get_doc_by_myreflectis =async (req,res,next )=> {
    var reflect_id = req.body.reflect_id;
     var sub_cat_id = req.body.category_id;

   // await db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.deleted='0' and tbl_myreflectid_doc_rels.reflect_id="+reflect_id+" and tbl_myreflectid_doc_rels.doc_id IN (select DISTINCT doc_id from tbl_manage_category_documents INNER JOIN tbl_category_documents on tbl_manage_category_documents.category_doc_id=tbl_manage_category_documents.category_doc_id WHERE tbl_category_documents.deleted='0' and include='yes' AND tbl_manage_category_documents.deleted='0' and category_id="+sub_cat_id+")",{ type:db.QueryTypes.SELECT}).then(function(request_docs){

    await db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.deleted='0' and tbl_myreflectid_doc_rels.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(function(request_docs){

        console.log("-----------categories--------------",request_docs);
        res.render("front/verifiers-list/ajax_myreflect_doc",{request_docs,reflect_id});    
    }).catch(err=>console.log("err..verifier list.",err))
     
}


/**document-list get Method End  **/

/**add_new_doc Post Method Start  **/
exports.AddNewDoc = async(req,res,next )=> {
    // console.log(".........files1.......",req.file)


    const form = formidable({ multiples: true });
  await  form.parse(req, async(err, fields, files) => {
        if (err) {
         console.log(err);
        }
            console.log(".........files.......",files)

// res.send({fields:fields,files:files})
    var exp_date = fields.exp_date
    var doc_name_id= fields.doc_name
    // console.log(".........files.......",files)
   var doc_id_number =fields.id_number
   var reflect_id=fields.reflect_id


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
 
 await  ipfs.files.add(testBuffer,async function (err, file) {
     if (err) {
       console.log("err from ejs",err);
     }

    await DocumentReflectIdModel.create({doc_id:doc_name_id,doc_unique_code:doc_id_number,reflect_id:reflect_id,expire_date:exp_date}).then(async(doc) =>{
        // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&",doc)

        // console.log("logocvjdwsnvjknsdjvnsdfvjfkvh<><><<<sdf",doc.user_doc_id)
     await   FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash}).then(async(doc_content) =>{
        
          
            res.redirect(`/entity?reflect_id=${reflect_id}`)
        
    }).catch(err=>{console.log("errr1 DocumentReflectIdModel",err)})
       }).catch(err=>{console.log("errr1 FilesDocModel ",err)})

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
exports.document_show=(req,res,next) =>{
    var user_type=req.session.user_type;
    var doc_id=req.query.id;
    var reflect_id=req.query.reflect_id;

    var user_id=req.session.user_id;
    var reflect_code_array=[]
        console.log('hello :',doc_id)

//   var doc_id=d_id.replace(/:/g,"");

    if(user_id)
    {
        /**get my all reflect code start**/
        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",unique_reflect_code)
        // console.log(' if hello')
        DocumentMasterModel.findAll({where:{status:'active',deleted:'0',document_type:'master'}}).then(allDocs =>{
            // db.query("SELECT *from tbl_documents_masters where deleted='0' AND status='active' AND tbl_documents_masters.doc_id NOT IN (SELECT doc_id from tbl_category_documents)",{ type:db.QueryTypes.SELECT}).then(async function(allDocs){
           
       db.query("SELECT *from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  inner join tbl_wallet_reflectid_rels on  tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations  ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_files_docs on tbl_files_docs.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id  WHERE   tbl_wallet_reflectid_rels .reg_user_id="+user_id+" and tbl_wallet_reflectid_rels.reflect_id="+reflect_id+" and tbl_wallet_reflectid_rels.user_as='client' and tbl_myreflectid_doc_rels.doc_id="+doc_id+" and tbl_myreflectid_doc_rels.user_doc_id In (SELECT user_doc_id from tbl_myreflectid_doc_rels GROUP BY reflect_id ORDER BY user_doc_id DESC)",{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){
                         console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",all_document_Data)
                        console.log(' db hello : ',all_document_Data)
                        db.query("SELECT DISTINCT reflect_code,user_as,rep_firstname,profile_pic from  tbl_user_registrations inner join tbl_wallet_reflectid_rels ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id  WHERE   tbl_user_registrations.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(all_reflect_codes){
                            // console.log('users type : ',all_reflect_codes)
                            // db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id  WHERE   tbl_user_registrations.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_user){
                                // console.log("HHHHHHHHHHHHHHHHHHHHH : ",verifier_user)
                      
                        db.query("SELECT DISTINCT user_as,reflect_code,rep_firstname from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  inner join tbl_wallet_reflectid_rels on tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id  WHERE   tbl_wallet_reflectid_rels .reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(unique_reflect_code){
                            //    unique_reflect_code = reflect_code.filter( onlyUnique );
                    
                 res.render('front/my-document/my-document-view',{
                            success_msg,
                            err_msg,
                            session:req.session,moment,
                            all_document_Data,unique_reflect_code,user_type,all_reflect_codes,allDocs

              });});})
            })
        });
    // });
        
        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

}
/**my-doc-license Get Method End  **/
exports.add_new_document = async (req,res,next) =>{
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        if (err) {
         console.log(err);
        }
        var reflect_id = fields.reflect_id;
        var doc_id = fields.document_id;
        var expiry_date = fields.expiry_date;
        var id_number = fields.id_number;
        var issue_place = fields.issue_place;
        var issue_date = fields.issue_date;
        var proof_of_address = fields.proof_of_address;
        var document_name=fields.document_name;

        let testFile = fs.readFileSync(files.document.path);
        let testBuffer = new Buffer(testFile);

        
        ipfs.files.add(testBuffer, async function (err, file) {
            if (err) {
            console.log("err from ejs",err);
            }
            console.log("from reflect_id ",reflect_id);
            console.log("from doc_id ",doc_id);
            console.log("from expiry_date ",expiry_date);
            console.log("from id_number ",id_number);
                        console.log("from issue_place ",issue_place);
            console.log("from proof_of_address ",proof_of_address);
            console.log("from issue_date ",issue_date);

            console.log("from ipfs ",file[0].hash);


             var dt = dateTime.create();
             var formatted = dt.format('Y-m-d H:M:S');


                 if(proof_of_address)
                 {
                  issue_date = new Date();
                 }
                             console.log("from issue_date else",document_name);

               if(document_name)
                 {
         await DocumentMasterModel.create({document_name:document_name,document_type:"other",createdAt:formatted,updatedAt:formatted}).then(doc_data =>{

            console.log("from issue_date if",doc_data.doc_id);

                DocumentReflectIdModel.create({doc_id:doc_data.doc_id,issue_place:issue_place,issue_date:issue_date,proof_of_address:proof_of_address,doc_unique_code:id_number,reflect_id:reflect_id,expire_date:expiry_date}).then(doc =>{
                    FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash}).then(doc_content =>{
                        // MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                            res.redirect('/document-list');
                        // });
                            })
                        })
                    })
             }else{
            // DocumentMasterModel.findAll().then(allDocs =>{
            console.log("from issue_date else",);


                DocumentReflectIdModel.create({doc_id:doc_id,issue_place:issue_place,issue_date:issue_date,proof_of_address:proof_of_address,doc_unique_code:id_number,reflect_id:reflect_id,expire_date:expiry_date}).then(doc =>{
                    FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash}).then(doc_content =>{
                        // MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                            res.redirect('/document-list');
                        // });
                    })
                })
           }
        })
    });
}
// 
/**show-reflect-code-data Post Method Start  **/
exports.show_reflect_code_data=async (req,res,next) =>{
    var user_id=req.session.user_id;
    var reflect_list=[];
     reflect_list=JSON.parse(req.body.reflect_code_list);
  
  var reflect_code_array=[]
        var complaint_reflect_code_list=reflect_list.join("','");
       
      
                  await  MyReflectIdModel.findAll({where:{reg_user_id:user_id}}).then(async(allReflect) =>{

      for(var i=0;i<allReflect.length;i++)
{
      await db.query("SELECT *from (SELECT max(user_doc_id),reflect_id,doc_id,self_assested,certified_status,createdAt as 'created_doc' FROM `tbl_myreflectid_doc_rels` where reflect_id="+allReflect[i].reflect_id+" GROUP BY doc_id) as doc_table INNER JOIN tbl_documents_masters ON doc_table.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on doc_table.reflect_id=tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.user_as='client' and tbl_wallet_reflectid_rels.reg_user_id="+user_id+" AND tbl_wallet_reflectid_rels.reflect_code IN ('"+complaint_reflect_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){

          // console.log(all_document_Data)
        
      for(var j=0;j<all_document_Data.length;j++)
      {
        reflect_code_array.push(all_document_Data[j])
      }

})}
                               
     })                  
                    console.log("UUUUUUUUUUUUUUUUUUUUU",reflect_code_array)
            
        res.render('front/my-document/ajax_my_document',{
            success_msg,
            err_msg,
            session:req.session,
            moment,
            reflect_code_array
                        // 

        // });
        
        /**get my all reflect code end**/
 
    })

}
/**show-reflect-code-data Post Method End  **/
exports.search_user_document=async(req,res,next) =>{

    var user_type=req.session.user_type;

    var user_id=req.session.user_id;
    var reflect_code_array=[]
        console.log('hello')

        var query=req.body.query;

  var page = req.query.page || 1
    var perPage = 5;
    var page_data=[]
        
              await  MyReflectIdModel.findAll({where:{reg_user_id:user_id}}).then(async(allReflect) =>{

      for(var i=0;i<allReflect.length;i++)
     {
      await db.query("SELECT *from (SELECT max(user_doc_id),reflect_id,doc_id,expire_date,self_assested,certified_status,createdAt as 'created_doc' FROM `tbl_myreflectid_doc_rels` where reflect_id="+allReflect[i].reflect_id+" GROUP BY doc_id) as doc_table INNER JOIN tbl_documents_masters ON doc_table.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on doc_table.reflect_id=tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.user_as='client' and tbl_wallet_reflectid_rels.reg_user_id="+user_id+" and (tbl_documents_masters.document_name LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.reflect_code LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.rep_firstname LIKE '%"+query+"%'  or tbl_wallet_reflectid_rels.entity_company_name LIKE '%"+query+"%' or doc_table.expire_date LIKE '%"+query+"%' or doc_table.self_assested LIKE '%"+query+"%' or doc_table.created_doc LIKE '%"+query+"%' or doc_table.created_doc LIKE '%"+query+"%' or doc_table.certified_status LIKE '%"+query+"%' ) ",{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){

        
      for(var j=0;j<all_document_Data.length;j++)
      {
        reflect_code_array.push(all_document_Data[j])
      }

})
    }
})
                res.render('front/my-document/ajax_my_document',{ success_msg,
            err_msg,reflect_code_array,
        //    market_list_result,
           session:req.session,user_type,moment
         

       
    });
            }

/**add_new_document_request post Method Start**/
exports.add_new_document_request =async (req,res,next )=> {
    // console.log('************ add_plan_feature ***********')

    var document_name=req.body.document_name 
    var descriptions=req.body.descriptions 
    var file_template = req.file.filename;

    var reflect_id = req.body.reflect_id;


    console.log('document_name : ',document_name)
    console.log('descriptions : ',descriptions)
    console.log('file_template : ',file_template)
    console.log('reflect_id : ',reflect_id)

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

     MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(async(result) => {

              await   UserModel.findOne({where:{reg_user_id:req.session.user_id}}).then(async user_data => {

             var msg = `${decrypt(user_data.full_name)}- ${result.reflect_code} has request to a create a new document.`

                                                                              
    admin_notification(msg,req.session.user_id,reflect_id,'4');


   await AdminDocumentRequest.create({document_name:document_name,reflect_id:reflect_id,descriptions:descriptions,file_template:file_template,createdAt:formatted,updatedAt:formatted}).then(mp_data =>{
   

     
    req.flash('success_msg', 'Your document request  successfully added!');
    // err_msg
                res.redirect('/document-list')
            });
        })
    })
     
}
/**add_new_document_request post Method End**/



/**add_new_document_request post Method Start**/
exports.get_entry_upload = async (req,res,next )=> {
   

    

    res.render('front/video_ipfs_upload_27bk')

     
}
/**add_new_document_request post Method End**/
/**add_new_document_request post Method Start**/
exports.get_entry_upload_show = async (req,res,next )=> {
   
console.log(req.body.photo);
    var blob = req.body.photo;
    // console.log(typeof(blob));
    var videoURLstring = JSON.stringify(req.body.photo);
    // console.log(typeof(videoURLstring));
    var videoURL = JSON.parse(videoURLstring);    
    // console.log(typeof(videoURL));

    res.render('pages/playvideo.ejs',{
        videoURL: videoURL
    })
    

    res.render('front/video_ipfs_upload_27bk')

     
}
/**add_new_document_request post Method End**/


//get all docs folder page
exports.getAllDocsFolder=async function(req,res){
    let wallet_address1=decrypt(req.query.wallet_address);
    let wallet_type=decrypt(req.query.wallet_type);
   let wallet_address=encrypt1(wallet_address1);
    console.log("public keyyyyyyyyyyyyyyyyyyyyyyy: after encccccccccccccccc",wallet_address);
    console.log("wallet type:",wallet_type);
    success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
  req.session.wallet_address=wallet_address1;
  req.session.wallet_type=wallet_type;
    try{
      
              let folderList=await DocFolderModel.findAll({where:{wallet_address:wallet_address}});
              console.log("folder lisssssssssssssss",folderList);
              let folderDocList=[];
                  if(folderList.length>0){
                      for(let i=0;i<folderList.length;i++){
                      let allDocs= await FilesDocModel.findAll({where:{folder_id:folderList[i].folder_id}});
                      let num_of_doc=allDocs.length;
                            let folderObj={
                              folder_id:folderList[i].folder_id.toString(),
                              wallet_address:decrypt1(folderList[i].wallet_address),
                              folder_name:decrypt1(folderList[i].folder_name),
                              num_of_docs:num_of_doc.toString(),
                              wallet_type:wallet_type
                            }
                            folderDocList[i]=folderObj;
                      }
                      //res.json({ status: 1, msg: "All folder list", data:folderDocList });
                  }
                  res.render('front/my-document/all-documents',{
                    folderDocList,
                    encrypt,
                    success_msg,
                    err_msg,
                    wallet_address1,
                    wallet_type
                  })
    }catch(err){

    }
}


//create folders
exports.createFolder=async function(req,res){
    let user_id=req.session.user_id;
    let wallet_address=req.body.wallet_address;
    let folder_name=req.body.folder_name;
    let wallet_type=req.body.wallet_type;
    success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg');
    try{
       let isPresent=await DocFolderModel.findOne({where:{reg_user_id:user_id,wallet_address:encrypt1(wallet_address),folder_name:encrypt1(folder_name)}});
      if(isPresent){
       // res.json({ status: 0, msg: "This folder name is already present!", data: { err_msg: 'Failed'} });
       req.flash("err_msg","This folder name is already present!");
       res.redirect('all-docs-folder'+"?wallet_type="+encrypt(wallet_type)+"&wallet_address="+encrypt(wallet_address))
      }else{
           let isCreated=await DocFolderModel.create({
                    reg_user_id:user_id,
                    wallet_address:encrypt1(wallet_address),
                    folder_name:encrypt1(folder_name),
                    wallet_type:encrypt1(wallet_type)
                  })
                  if(isCreated){
                    //res.json({ status: 1, msg: "Successfully created folder", data: {success_msg:'Success'} });
                    req.flash("success_msg","Folder created successfully");
                    res.redirect('all-docs-folder'+"?wallet_type="+encrypt(wallet_type)+"&wallet_address="+encrypt(wallet_address))
                  }
      }
      }catch(err){
        console.log(err);
        throw err;
     // res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
    }
}


//get all docs from folder
exports.getAllDocsFromFolder=async function(req,res){
    let folder_id=parseInt(req.query.folder_id); 
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');  
    try{
        let allDocs=await FilesDocModel.findAll({where:{folder_id:folder_id}});             
        let docsArr=[];
        if(allDocs.length>0){
                 for(let i=0;i<allDocs.length;i++){
                let Ddata = await DocumentReflectIdModel.findOne({where:{user_doc_id:allDocs[i].user_doc_id}});
                // console.log("Datttttttttttttttttt",Ddata);
                if(Ddata.expire_date==null){
                  var formatted=''
                }else{
                  var dt = dateTime.create(Ddata.expire_date);
                  formatted = dt.format('m/d/Y');
                }
                
              
             let filed_det=   await ipfs.files.get(decrypt1(decrypt(allDocs[i].file_content)));
             console.log(filed_det);
        
                    let docObj={
                      uploaded_id:allDocs[i].file_id,
                      doc_id_num:decrypt1(Ddata.doc_unique_code),
                      doc_name:decrypt1(allDocs[i].doc_name),
                      expiresIn:formatted,
                      hash_code:encrypt1(filed_det[0].path),
                      status: Ddata.admin_status,
                      folder_id:folder_id
                    }
                   // console.log("Objjjjjjjj",docObj)
                    docsArr[i]=docObj;
                 }
                
        }


        //fectch verifier list
        let  allverifiers=await MyReflectIdModel.findAll({where:{user_as:'verifier',deleted:'0'}});
        let verifierArr=[];
         if(allverifiers.length>0){
                 for(let i=0;i<allverifiers.length;i++){
                let userInfo=await UserModel.findOne({where:{reg_user_id:allverifiers[i].reg_user_id}});
                   let verifierObj={
                     verifierName:decrypt(userInfo.full_name),
                     verifierRefletId:allverifiers[i].reflect_code,
                   }
                   verifierArr[i]=verifierObj;
                 }
        }
        res.render('front/my-document/doc-list',{
            docsArr,
            success_msg,
            err_msg,
            folder_id,
            verifierArr
        })
    }catch(err){
        console.log(err);
        throw err;
    }
}


//view doc 
exports.showDocuments=async function(req,res){
    let file_id=parseInt(req.body.uploaded_id);
  try{
       let file_det=await FilesDocModel.findOne({where:{file_id:file_id}});
     if(file_det){
     // var fileContents;
     let hashCode=decrypt1(decrypt(file_det.file_content));
    //   let hashcode="QmYmzsfz58t21XeH7cL6kw9S5J7t6wNpBGpBdJ4ZMjs1tF";
        await ipfs.files.get(hashCode,async (err,files)=>{       
          files.forEach((file) => {
          //  console.log("pathhhhhhhhhhhhhhhhhhh:",file); 
            filename=file.path;
            let fileContents=file.content.toString();
            let d1=decrypt1(fileContents);
           // console.log("First decryptttttttttt",d1);
         //   res.json({ status: 1, msg: "File sent", data: { file_in_base64:d1} });
               res.end(d1);
            })
        })
       
       }
  }catch(err){
    console.log(err);
    throw err;
   // res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
  }

  //delete documents
exports.deleteDocs=async function(req,res){
  console.log("reqqqqqqqqqqqqq",req.body);
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg'); 
  let uploaded_id=req.body.uploaded_id_arr;
  console.log("uploaded iddddddddddddddd",uploaded_id);
  // uploaded_id=JSON.parse(uploaded_id);
  uploaded_id=uploaded_id.split(",");
  console.log("after  splitttttting:",uploaded_id);
  let folder_id=parseInt(req.body.folder_id);
  let user_id=parseInt(req.session.user_id);
  try{
    let unDeletedNum=0;
    let deletedNum=0;
       let folderDet=await DocFolderModel.findOne({where:{folder_id:folder_id}});
       let pulbic_key=decrypt1(folderDet.wallet_address);
       console.log("pulbic_key:::::::::;",pulbic_key);
       let walletDet= await DigitalWalletRelsModel.findOne({where:{wallet_address:pulbic_key}});
   if(walletDet.reg_user_id==user_id){
          for(let i=0;i<uploaded_id.length;i++){
            let isSharedDoc=await FilesDocModel.findOne({where:{folder_id:folder_id,file_id:parseInt(uploaded_id[i]),isShared:'yes'}})
                console.log("Doc details:::::::::",isSharedDoc);
            if(isSharedDoc){
                  unDeletedNum++;
                  continue;
                }else{
                 let noShared= await FilesDocModel.findOne({where:{folder_id:folder_id,file_id:parseInt(uploaded_id[i]),isShared:'no'}})
                let user_doc_id=noShared.user_doc_id;
                 var isDeleted1= await FilesDocModel.destroy({where:{folder_id:folder_id,file_id:parseInt(uploaded_id[i]),isShared:'no'}})
                 var isDeleted2=await DocumentReflectIdModel.destroy({where:{user_doc_id:user_doc_id}});
                  deletedNum++;
                }
          }
          if(unDeletedNum>0&&deletedNum>0){
           // res.json({ status: 1, msg: "Some documents failed to delete due to documents have sent to verifier", data: { success_msg: 'Success'} });
           req.flash("success_msg","Some documents failed to delete due to documents have sent to verifier");
           res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
          }else if(unDeletedNum==0&&deletedNum>0){
            //res.json({ status: 1, msg: "Selected documents deleted successfully", data: { success_msg: 'success'} });
            req.flash("success_msg","Selected documents deleted successfully");
           res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
          }else if(unDeletedNum>0&&deletedNum==0){
           // res.json({ status: 0, msg: "Deletion operation failed due to selected documents have sent to verifier", data: { success_msg: 'Success'} });
           req.flash("success_msg","Deletion operation failed due to selected documents have sent to verifier");
           res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
          }else{
            //res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed'} });
            req.flash("err_msg","Something went wrong try again.");
           res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
          }
       
        }else{
          //res.json({ status: 0, msg: "You are not authorized to delete this file! ", data: { err_msg: 'Failed'} });
          req.flash("err_msg","You are not authorized to delete this file!");
           res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
        }        
  }catch(err){
    console.log(err);
    throw err;
   // res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}


//upload document
exports.uploadDocument=async function(req,res){
  success_msg = req.flash('success_msg');
  err_msg = req.flash('err_msg'); 
  try{
  const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      if (err) {
       console.log(err);
      }
      var user_id=req.session.user_id;
      var doc_id=fields.id_number;
      var doc_name=encrypt1(fields.document_name);
      var doc_folder=fields.folder_id;
      var exp_date = fields.exp_date;
      let isOwnerOfFolder=await DocFolderModel.findOne({where:{reg_user_id:user_id,folder_id:doc_folder}});
      if(isOwnerOfFolder){
         //............................. 
      function makeid(length) {
        var result           = '';
        var characters       = '1234567890';
        var charactersLength = characters.length;
 
            for ( var i = 0; i < length; i++ ) {
               result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
               return result;
      }
        if (!doc_id) {
                doc_id = `AUTO${makeid(4)}MYREFLET`
              }
              //.....................
    let testFile = fs.readFileSync(files.file.path);
    testFile=encrypt1(testFile.toString('base64'));
    let testBuffer = Buffer.from(testFile);
    // let fileBuffer=encrypt(encrypt1(testBuffer));               
      await  ipfs.files.add(testBuffer,async function (err, file) {
        if (err) {
          console.log("err from ejs",err);
          //res.json({ status: 0, msg: "Failed to upload document", data: { err_msg: 'Failed' } });
          req.flash("err_msg","Failed to upload document!");
          res.redirect('/all-docs-in-folder'+"?folder_id="+doc_folder);
          }else{
            try{
          var isCreated1=await DocumentReflectIdModel.create({doc_unique_code:encrypt1(doc_id),expire_date:exp_date})
            }catch(err){
               console.log(err)
              //res.json({ status: 0, msg: "Failed to upload document", data: { err_msg: 'Failed'} });
              req.flash("err_msg","Failed to upload document!");
           res.redirect('/all-docs-in-folder'+"?folder_id="+doc_folder);
            }
              try{
                console.log("doc hashhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",file[0].hash);
          var isCreated2= await FilesDocModel.create({user_doc_id:isCreated1.user_doc_id,
                file_content:encrypt(encrypt1(file[0].hash)),
                folder_id:doc_folder,
                doc_name:doc_name
              })
                   //send notification to all associate employee......................
               
        let wallet_address=isOwnerOfFolder.wallet_address;
        console.log("Wallet addresssssssssssssss",wallet_address);
       let wallet_type=decrypt1(isOwnerOfFolder.wallet_type);
        if(wallet_type.toLowerCase()=='btc'||wallet_type.toLowerCase()=='ethereum'){
            let crypto_wallet_info= await CryptoWalletModel.findOne({where:{public_key:wallet_address}});
            if(crypto_wallet_info.reflet_code!==null||crypto_wallet_info.reflet_code!==''){
                      let shared_entity_info=await ShareEntityModel.findAll({where:{shared_entity:crypto_wallet_info.reflet_code,isBlock:'no'}});
                      let uploader_user=await UserModel.findOne({where:{reg_user_id:user_id}});
                       for(let i=0;i<shared_entity_info.length;i++){
                         //to whome with shared 
                           //  let user_Info_for_receiver=await UserModel.findOne({where:{reg_user_id:shared_entity_info[i].receiver_id}});
                             //for owner 
                            // let user_Info_for_owner=await UserModel.findOne({where:{reg_user_id:shared_entity_info[i].sender_id}});

                              // if(user_id==shared_entity_info[i].receiver_id||user_id==shared_entity_info[i].sender_id){
                              //   uploader_user.full_name=encrypt("you");
                              // }
                                                    
                              let msg=`Document ${decrypt1(doc_name)} has been uploaded in wallet ID ${crypto_wallet_info.wallet_address} by ${decrypt(uploader_user.full_name)}`
                              let sentNotificatioToreceiver=  await updateNotification(user_id,shared_entity_info[i].receiver_id,encrypt(msg),'Document uploaded',uploader_user.profile_img_name);
                              let sentNotificatioToOwner=  await updateNotification(user_id,shared_entity_info[i].sender_id,encrypt(msg),'Document uploaded',uploader_user.profile_img_name);
                              pushnotification(shared_entity_info[i].receiver_id,'Uploaded document',msg); 
                              pushnotification(shared_entity_info[i].sender_id,'Uploaded document',msg); 
                            }
                      

            }
        }else{
                let digitalInfo= await DigitalWalletRelsModel.findOne({where:{wallet_address:decrypt1(wallet_address)}});
             //   console.log("Digital walllll",digitalInfo);
                if(digitalInfo.parent_reflect_id!==null||digitalInfo.parent_reflect_id!==''){
                  let shared_entity_info=await ShareEntityModel.findAll({where:{shared_entity:digitalInfo.parent_reflect_id,isBlock:'no'}});
                      var uploader_user=await UserModel.findOne({where:{reg_user_id:user_id}});
                    //  console.log("Uploaderrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",uploader_user);
                       for(let i=0;i<shared_entity_info.length;i++){
                         //to whome with shared 
                           //  let user_Info_for_receiver=await UserModel.findOne({where:{reg_user_id:shared_entity_info[i].receiver_id}});
                             //for owner 
                            // let user_Info_for_owner=await UserModel.findOne({where:{reg_user_id:shared_entity_info[i].sender_id}});

                              // if(user_id==shared_entity_info[i].receiver_id||user_id==shared_entity_info[i].sender_id){
                              //   uploader_user.full_name=encrypt("you");
                              // }
                                                    
                              let msg=`Document ${decrypt1(doc_name)} has been uploaded in wallet ID ${digitalInfo.dig_wallet_rel} by ${decrypt(uploader_user.full_name)}`;
                              try{
                              let sentNotificatioToreceiver=  await updateNotification(user_id,shared_entity_info[i].receiver_id,encrypt(msg),'Document uploaded',uploader_user.profile_img_name);
                              console.log("Sennnnnnnnnnnnnnnnnnnnntttttttttttttt notificationnnnnnnnnnn");
                              let sentNotificatioToOwner=  await updateNotification(user_id,shared_entity_info[i].sender_id,encrypt(msg),'Document uploaded',uploader_user.profile_img_name);
                              pushnotification(shared_entity_info[i].receiver_id,'Uploaded document',msg); 
                              pushnotification(shared_entity_info[i].sender_id,'Uploaded document',msg); 
                              }catch(err){
                                console.log(err);
                              }
                            }
                        
                }
        }
              //res.json({ status: 1, msg: "Successfully uploaded document", data: { success_msg:'Success'} });
              req.flash("success_msg","Successfully uploaded document");
              res.redirect('/all-docs-in-folder'+"?folder_id="+doc_folder);
            }catch(err){
              console.log(err);
             // res.json({ status: 0, msg: "Failed to upload document", data: { err_msg: 'Failed'} });
             req.flash("err_msg","Failed to upload document!");
              res.redirect('/all-docs-in-folder'+"?folder_id="+doc_folder);
              }
          }
     })
       
    }else{
    //  res.json({ status: 0, msg: "You're not owner of this folder!!,Please create new folder.", data: { err_msg: 'Failed'} });
      req.flash("err_msg","You're not owner of this folder!!,Please create new folder.");
              res.redirect('/all-docs-in-folder'+"?folder_id="+doc_folder);
    }
    })
 
  }catch(err){
    console.log(err);
    throw err;
    //res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}




//send doc to verifier
exports.sendDocToVerifier=async function(req,res){
 // let sender_public_key=req.body.sender_public_key;
 let folder_id=req.body.folder_id;
 let sender_user_id=req.session.user_id;
  let veri_reflet_id=req.body.veri_reflet_id;
  let veri_name=req.body.veri_name;
  let uploaded_id=req.body.uploaded_id;
  let sender_private_key=req.body.natural_reflet_privatekey;
  success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg'); 
  console.log("entereddddddddddddddd private keyyyyyyyyyyyyyy",sender_private_key);
  // let senders_pvt="0x75accf5af81d589302e90d652553a3a4b17cbb65cf9b2d73336959f9e21cbfda";
   let pvt_key=sender_private_key.substring(2);
    //console.log("Sender private key",senders_pvt_key);
  try{
  
  //  var sender_user_id='';
    // if(wallet_type.toLowerCase()=='btc'||wallet_type.toLowerCase()=='ethereum'){
    //   //fetching sender info
    //     let  walletInfo=await CryptoWalletModel.findOne({where:{public_key:encrypt1(sender_public_key)}});
    //     sender_user_id=walletInfo.reg_user_id;
    // }else{
    //   let digital_info=await DigitalWalletRelsModel.findOne({where:{wallet_address:sender_public_key}});
    //     sender_user_id=digital_info.reg_user_id;
    // }
      //fetching sender info.............................
      console.log("Reggggggggggg user iddddddddd",sender_user_id);
          let sender_reflet_info=await MyReflectIdModel.findOne({where:{reg_user_id:sender_user_id,reflectid_by:'representative',idCreated:'true'}});
          console.log("REFLETTTTTTTTTTTT",sender_reflet_info);
          let sender_reflet_id=sender_reflet_info.reflect_code;
          let wallet_info=await WalletModel.findOne({where:{wallet_id:sender_reflet_info.wallet_id}});
          let sender_natural_reflet_wallet_address=wallet_info.wallet_address;
          let sender_userinfo= await UserModel.findOne({where:{reg_user_id:sender_user_id}});
          var sender_email=sender_userinfo.email;
          var sender_profile_pic=sender_userinfo.profile_img_name;
          var sender_name=decrypt(sender_userinfo.full_name);
          try{
            var accnt_det=await web3.eth.accounts.privateKeyToAccount(sender_private_key);
            //console.log("Accnttttttttt",accnt_det);
           var send_add= accnt_det.address;
           console.log("Generated wallet addressssssssss",send_add);
            if(sender_natural_reflet_wallet_address!=send_add.toLowerCase()){
              //res.json({ status: 0, msg: "You entered invalid private key", data: { err_msg: 'Failed' } });
              req.flash("err_msg","You entered invalid private key!");
           res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
            }
          }catch(err){
            console.log(err);
           // res.json({ status: 0, msg: "You entered invalid private key", data: { err_msg: 'Failed' } });
           req.flash("err_msg","You entered invalid private key!");
           res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
          }

            //fetching verifier details
             let reflet_veri_info= await MyReflectIdModel.findOne({where:{reflect_code:veri_reflet_id,reflectid_by:'representative'}});
             let veri_user_info=await UserModel.findOne({where:{reg_user_id:reflet_veri_info.reg_user_id}});
             let verifier_email=veri_user_info.email;
             let wallet_info_veri=await WalletModel.findOne({where:{wallet_id:reflet_veri_info.wallet_id}});
             let verifier_address=wallet_info_veri.wallet_address;
             let verifier_birth_add=veri_user_info.birthplace;
             let veri_info=await VerifierModel.findOne({where:{natural_reflet_id:veri_reflet_id}});
             let verifier_id=veri_info.verifier_id;
 
          //fetching file details.............................
          let fileDet=await FilesDocModel.findOne({where:{file_id:uploaded_id}});
          let imgContent= await ipfs.files.get(decrypt1(decrypt(fileDet.file_content)));
          let docHash=imgContent[0].path.toString();
          let doc_names=fileDet.doc_name;
          let request_status='pending';
          let reason="Sending for verification";
          const user = contractABI;
          var contract =  new web3.eth.Contract(user,contractAddress);


          let txCount= await web3.eth.getTransactionCount(sender_natural_reflet_wallet_address);
          console.log("Processinggggggggggggggggg",txCount);
          var estimates_gas = await web3.eth.estimateGas({from: verifier_address, to: sender_natural_reflet_wallet_address,  data:contract.methods.addDocument(docHash, verifier_email, sender_email, doc_names, veri_reflet_id, sender_reflet_id,request_status,reason).encodeABI() })
           console.log("estimateedddddddd gas",estimates_gas);
             // var gasPrice=web3js.utils.toHex(web3js.utils.toWei('50','gwei'));
    var gasPrice_bal = await web3.eth.getGasPrice();
    var gasPrice = web3.utils.toHex(gasPrice_bal)*2;
   var gasLimit = web3.utils.toHex(estimates_gas * 2*2);
   var transactionFee_wei = gasPrice * gasLimit;
   var transactionFee = web3.utils.fromWei(web3.utils.toBN(transactionFee_wei), 'ether');
   var nonce = web3.utils.toHex(txCount);
   var nonceHex = web3.utils.toHex(nonce);
console.log("nonce,,,,,,,,,,,,,",nonceHex);
   const txObject = {
     nonce: nonceHex,
     to: contractAddress,
     data:contract.methods.addDocument(docHash, verifier_email, sender_email, doc_names, veri_reflet_id, sender_reflet_id,request_status,reason).encodeABI(),
     //value:'0x1',
     gasLimit: gasLimit,
     gasPrice: gasPrice,
     // gas:estimates_gas,
   }

   //  const tx = new Tx(txObject,{chain:'ropsten', hardfork: 'petersburg'});

   const tx = new Tx(txObject);
   let pvtKey = Buffer.from(pvt_key,'hex');
   tx.sign(pvtKey)

   const serializedTx = tx.serialize();
   const raw = '0x' + serializedTx.toString('hex');

   serializedTx.toString('hex')

   // Broadcast the transaction
   web3.eth.sendSignedTransaction(raw, async (err, txHash) => {
     //if failed
       if (err) {
         //res.json({ status: 0, msg: "Document send failed", data: { err_msg: 'Failed'} });
         req.flash("err_msg","Document send failed!");
         res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
       }
       else {
           console.log('txHash:', txHash, 'transfess', transactionFee);
            //upload transaction history for sender
           await DocumentTransactionModel.create({
             transaction_hash:encrypt1(txHash),
             sender_wallet_pubKey:encrypt1(sender_natural_reflet_wallet_address),
             receiver_wallet_pubKey:encrypt1(verifier_address),
             receiver_refletid:veri_reflet_id,
             reg_user_id:sender_user_id,
             receiver_birth_address:verifier_birth_add,
             amount:"0",
             receiver_name:encrypt1(veri_name),
             action:"sent",
            })
           
            //sending main notification to sender
            let msg=`Successfully you sent document ${decrypt1(doc_names)} to verifier ${veri_name} for verification.`;
           await updateNotification(sender_user_id,sender_user_id,encrypt(msg),'Document sent for verification',sender_profile_pic);
           pushnotification(sender_user_id,'Sent for verification',msg);
           
          //verifier side transaction
             await DocReqForVerificarionModel.create({
              verifier_id:verifier_id,
              doc_file_hash:docHash,
              trans_hash:txHash,
              reason:'For verificatin',
              sender_reflet_id:sender_reflet_id
             })
      
             console.log("Sendingnnngggggggggggggggggggggg notiiiiiiiiiiiiiiiiiiiiiii");
          //sending main notification to verifier
          let msg2=`Received documents ${decrypt1(doc_names)} from ${sender_name} for verification`;
        let isUpdated=  await updateNotification(sender_user_id,reflet_veri_info.reg_user_id,encrypt(msg2),'For verification',sender_profile_pic);
          pushnotification(reflet_veri_info.reg_user_id,'for verification',msg2);


          let respObj={
           txHash: txHash,
           transactionFee: transactionFee
          }
          console.log("Sendingnnngggggggggggggggggggggg");
          // res.json({ status: 1, msg: "Successfully sent document to verifier", data: respObj  });
          req.flash("success_msg","Successfully sent document to verifier");
          res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
       }
       // Now go check etherscan to see the transaction!
   })
          
    
          
  }catch(err){
    console.log(err);
    req.flash("err_msg","Something went wrong!");
          res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
  
    //res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
  }
}


////share documents to other user
exports.shareDocuments=async function(req,res){
  let sender_user_id=req.session.user_id;
  let receiver_refletid=req.body.receiver_refletid;
  let uploaded_id=req.body.uploaded_id;
  let folder_id=req.body.folder_id;
 //uploaded_id=JSON.parse(uploaded_id);
 let senders_pvt=req.body.sender_pvt_key;
// let senders_pvt="0x75accf5af81d589302e90d652553a3a4b17cbb65cf9b2d73336959f9e21cbfda";
 let senders_pvt_key=senders_pvt.substring(2);
  console.log("Sender private key",senders_pvt_key);
 console.log("Wallletttttttttt typeeeeeee");
  var dt           = dateTime.create();
  var formatted    = dt.format('Y-m-d H:M:S');
  let wallet_type=req.session.wallet_type;
  var sender_wallet_address=req.session.wallet_address;
  try{
    if(wallet_type.toLowerCase()=='btc'||wallet_type.toLowerCase()=='ethereum'){
      
   //   res.json({ status: 0, msg: "In present, cannot send document from crypto wallets", data: { err_msg: 'Failed' } });
   req.flash("err_msg","In present, cannot send document from crypto wallets!");
    res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
    }else{
   // checking receiver prsent or not....................
    let isReceiverPresent=await MyReflectIdModel.findOne({where:{reflect_code:receiver_refletid,reflectid_by:'representative'}});
    if(isReceiverPresent){
      //fetching receiver wallet address
     let receiver_wallet_det=await WalletModel.findOne({where:{wallet_id:isReceiverPresent.wallet_id}}); 
     var rec_wallet_address=receiver_wallet_det.wallet_address;          
    //fetching receiver email id..............
        let recPersDet=await UserModel.findOne({where:{reg_user_id:isReceiverPresent.reg_user_id}});
        var receiver_email=encrypt1(recPersDet.email);
        var receiver_birth_address=recPersDet.birthplace;
        var receiver_name=recPersDet.full_name;
        var receiver_profile=recPersDet.profile_img_name;
    //verify entered private key...........................................................
 
    try{
      var accnt_det=await web3.eth.accounts.privateKeyToAccount(senders_pvt);
      console.log("Accnttttttttt",accnt_det);

     let send_add= accnt_det.address;
     console.log("Generated wallet addressssssssss",send_add);
      if(sender_wallet_address!=send_add.toLowerCase()){
       // res.json({ status: 0, msg: "You entered invalid private key", data: { err_msg: 'Failed' } });
       req.flash("err_msg","You entered invalid private key!");
       res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
      }else{
          //private key verification end...............

    let senderUserDet=await MyReflectIdModel.findOne({where:{reg_user_id:sender_user_id,reflectid_by:'representative',idCreated:'true'}})
    let sender_reflet_id=senderUserDet.reflect_code.toString();
    

    //fetch sender email id
     let senderPersDet= await UserModel.findOne({where:{reg_user_id:sender_user_id}});
     var sender_email=encrypt1(senderPersDet.email);
      var sender_profile_pic=senderPersDet.profile_img_name;
      var sender_name=decrypt(senderPersDet.full_name);

    const user = contractABI;
    var contract =  new web3.eth.Contract(user,contractAddress);
   // console.log("Contractttttttttttttt",contract);
 
  
    let fileDet=await FilesDocModel.findOne({where:{file_id:uploaded_id}});
    let imgContent= await ipfs.files.get(decrypt1(decrypt(fileDet.file_content)));
    let docHash=imgContent[0].path.toString();
    let doc_names=fileDet.doc_name;
  
console.log("doccccccccccccccc nameeee",doc_names);
    let request_status='pending';
    let reason="Sharing";
 let txCount= await web3.eth.getTransactionCount(sender_wallet_address);
console.log("Processinggggggggggggggggg",txCount);


    var estimates_gas = await web3.eth.estimateGas({from: sender_wallet_address, to: rec_wallet_address,  data:contract.methods.addDocument(docHash, receiver_email, sender_email, doc_names, receiver_refletid, sender_reflet_id,request_status,reason).encodeABI() })
    console.log("Processinggggggggggggggggg2222222");
 console.log("estimateedddddddd gas",estimates_gas);

    // var gasPrice=web3js.utils.toHex(web3js.utils.toWei('50','gwei'));
    var gasPrice_bal = await web3.eth.getGasPrice();
     var gasPrice = web3.utils.toHex(gasPrice_bal)*2;
   // var gasPrice = web3.utils.toHex(100000000000000000);
    console.log("gasPrice", gasPrice);
    var gasLimit = web3.utils.toHex(estimates_gas * 2*2);
     console.log("Gas limitttttttt",gasLimit);
    var transactionFee_wei = gasPrice * gasLimit;
    var transactionFee = web3.utils.fromWei(web3.utils.toBN(transactionFee_wei), 'ether');
    console.log("Transaction feeeeeeeeeee",transactionFee);
    var nonce = web3.utils.toHex(txCount);
    var nonceHex = web3.utils.toHex(nonce);
 console.log("nonce,,,,,,,,,,,,,",nonceHex);
    const txObject = {
      nonce: nonceHex,
      to: contractAddress,
      data:contract.methods.addDocument(docHash, receiver_email, sender_email, doc_names, receiver_refletid, sender_reflet_id,request_status,reason).encodeABI(),
      //value:'0x1',
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      // gas:estimates_gas,
    }

    //  const tx = new Tx(txObject,{chain:'ropsten', hardfork: 'petersburg'});

    const tx = new Tx(txObject);
    console.log("Private key::::::",senders_pvt_key);
    let pvtKey = Buffer.from(senders_pvt_key,'hex');
    tx.sign(pvtKey)

    const serializedTx = tx.serialize();
    const raw = '0x' + serializedTx.toString('hex');

    serializedTx.toString('hex')

    // Broadcast the transaction
    web3.eth.sendSignedTransaction(raw, async (err, txHash) => {
      //if failed
        if (err) {
          res.json({ status: 0, msg: "Sharing Document failed!", data: { err_msg: 'Failed'} });
        }
        else {
            console.log('txHash:', txHash, 'transfess', transactionFee);
             //upload transaction history for sender
            await DocumentTransactionModel.create({
              transaction_hash:encrypt1(txHash),
              sender_wallet_pubKey:encrypt1(sender_wallet_address),
              receiver_wallet_pubKey:encrypt1(rec_wallet_address),
              receiver_refletid:receiver_refletid,
              reg_user_id:sender_user_id,
              receiver_birth_address:receiver_birth_address,
              file_id:uploaded_id,
              amount:"0",
              receiver_name:receiver_name,
              action:"shared",
             })
            
             //sending main notification to sender
             let msg=`Successfully you shared document ${decrypt1(doc_names)} with ${decrypt(receiver_name)}`;
            await updateNotification(sender_user_id,sender_user_id,encrypt(msg),'Document sharing',sender_profile_pic);
            pushnotification(sender_user_id,'Shared document',msg);
            
           //receiver side transaction history
           await DocumentTransactionModel.create({
            transaction_hash:encrypt1(txHash),
            sender_wallet_pubKey:encrypt1(sender_wallet_address),
            receiver_wallet_pubKey:encrypt1(rec_wallet_address),
            receiver_refletid:receiver_refletid,
            reg_user_id:isReceiverPresent.reg_user_id,
            receiver_birth_address:receiver_birth_address,
            file_id:uploaded_id,
            amount:"0",
            receiver_name:receiver_name,
            action:"received",
           })

           //sending main notification to receiver
           let msg2=`Received documents ${decrypt1(doc_names)} from ${sender_name}`;
           await updateNotification(sender_user_id,isReceiverPresent.reg_user_id,encrypt(msg2),'Document received',sender_profile_pic);
           pushnotification(isReceiverPresent.reg_user_id,'Document received',msg2);
                
           await FilesDocModel.update({isShared:'true'},{where:{file_id:uploaded_id}});

           let respObj={
            txHash: txHash,
            transactionFee: transactionFee
           }
            //res.json({ status: 1, msg: "Successfully shared document", data: respObj  });
            req.flash("success_msg","Successfully shared document.");
            res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
        }
        // Now go check etherscan to see the transaction!
    })
      }
    }catch(err){
      //res.json({ status: 0, msg: "You entered invalid private key", data: { err_msg: 'Failed' } });
      req.flash("err_msg","You entered invalid private key!");
          res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
    }
    
    
}else{
  //res.json({ status: 0, msg: "Please enter valid natural person MyRefletID!", data: { err_msg: 'Failed'} });
  req.flash("err_msg","Please enter valid natural person MyRefletID!");
  res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
}
    }
  }catch(err){
    console.log(err);
   // res.json({ status: 0, msg: "Something went wrong try again.", data: { err_msg: 'Failed', err } });
   req.flash("err_msg","Something went wrong,Please try again.");
  res.redirect('/all-docs-in-folder'+"?folder_id="+folder_id);
  }
}