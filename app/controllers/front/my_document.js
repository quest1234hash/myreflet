var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel, FilesDocModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel,AdminDocumentRequest} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var {NotificationModel} = require('../../models/notification');
var admin_notification = require('../../helpers/admin_notification.js')
const record_rtc = require('recordrtc');

var { decrypt, encrypt } = require('../../helpers/encrypt-decrypt')

const nodemailer = require("nodemailer");
var db = require('../../services/database');
var sequelize = require('sequelize');

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
const formidable = require('formidable');
var Jimp = require('jimp');
var toBuffer = require('blob-to-buffer')
const request = require('request');

const ipfsAPI = require('ipfs-api');
const fs = require('fs');
var async = require('async');

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})


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




