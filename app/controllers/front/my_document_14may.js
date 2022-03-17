var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel, FilesDocModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var {NotificationModel} = require('../../models/notification');


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

const ipfsAPI = require('ipfs-api');
const fs = require('fs');
var async = require('async');

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})


/**document-list get Method Start  **/
exports.document_list=(req,res,next) =>{
    var user_type=req.session.user_type;

    var user_id=req.session.user_id;
    var reflect_code_array=[]
        console.log('hello')

    //  function onlyUnique(value, index, self) { 
    //         return self.indexOf(value) === index;
    //     }
    if(user_id)
    {
        /**get my all reflect code start**/
        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",unique_reflect_code)
    DocumentMasterModel.findAll({where:{status:'active',deleted:'0'}}).then(allDocs =>{
                console.log(' if hello',allDocs)

       db.query("SELECT *from (SELECT max(user_doc_id),reflect_id,doc_id,self_assested,certified_status,createdAt as 'created_doc' FROM `tbl_myreflectid_doc_rels` GROUP BY doc_id) as doc_table INNER JOIN tbl_documents_masters ON doc_table.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on doc_table.reflect_id=tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.user_as='client' and tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){
                        //  console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",all_document_Data)
                        console.log(' db hello')
                        db.query("SELECT DISTINCT reflect_code,user_as,profile_pic,reflect_id from  tbl_user_registrations inner join tbl_wallet_reflectid_rels ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id  WHERE   tbl_user_registrations.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(all_reflect_codes){
                            // console.log('users type : ',all_reflect_codes)
                            db.query("SELECT *from tbl_wallet_reflectid_rels inner join tbl_user_registrations  ON tbl_wallet_reflectid_rels.reg_user_id= tbl_user_registrations.reg_user_id  WHERE   tbl_user_registrations.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_user){
                                // console.log("HHHHHHHHHHHHHHHHHHHHH : ",verifier_user)
                      
                        db.query("SELECT DISTINCT user_as,reflect_code,rep_firstname from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  inner join tbl_wallet_reflectid_rels on tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id  WHERE   tbl_wallet_reflectid_rels .reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(unique_reflect_code){
                            //    unique_reflect_code = reflect_code.filter( onlyUnique );
                    
                 res.render('front/my-document/my-document',{
                            success_msg,
                            err_msg,
                            session:req.session,
                            moment,
                            all_document_Data,unique_reflect_code,user_type,all_reflect_codes,verifier_user,allDocs

              });});})
            })
        });});
        
        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

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

    var user_id=req.session.user_id;
    var reflect_code_array=[]
        console.log('hello :',doc_id)

//   var doc_id=d_id.replace(/:/g,"");

    if(user_id)
    {
        /**get my all reflect code start**/
        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",unique_reflect_code)
        // console.log(' if hello')
        DocumentMasterModel.findAll({where:{status:'active',deleted:'0'}}).then(allDocs =>{
            // db.query("SELECT *from tbl_documents_masters where deleted='0' AND status='active' AND tbl_documents_masters.doc_id NOT IN (SELECT doc_id from tbl_category_documents)",{ type:db.QueryTypes.SELECT}).then(async function(allDocs){
           
       db.query("SELECT *from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  inner join tbl_wallet_reflectid_rels on  tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations  ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_files_docs on tbl_files_docs.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id  WHERE   tbl_wallet_reflectid_rels .reg_user_id="+user_id+" and tbl_wallet_reflectid_rels.user_as='client' and tbl_myreflectid_doc_rels.doc_id="+doc_id+" and tbl_myreflectid_doc_rels.user_doc_id In (SELECT user_doc_id from tbl_myreflectid_doc_rels GROUP BY reflect_id ORDER BY user_doc_id DESC)",{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){
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
exports.add_new_document = (req,res,next) =>{
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        if (err) {
         console.log(err);
        }
        var reflect_id = fields.reflect_id;
        var doc_id = fields.document_id;
        var expiry_date = fields.expiry_date;
        var id_number = fields.id_number;

        let testFile = fs.readFileSync(files.document.path);
        let testBuffer = new Buffer(testFile);

        ipfs.files.add(testBuffer, function (err, file) {
            if (err) {
            console.log("err from ejs",err);
            }
            console.log("from reflect_id ",reflect_id);
            console.log("from doc_id ",doc_id);
            console.log("from expiry_date ",expiry_date);
            console.log("from id_number ",id_number);
            console.log("from ipfs ",file[0].hash);


            // DocumentMasterModel.findAll().then(allDocs =>{
                DocumentReflectIdModel.create({doc_id:doc_id,doc_unique_code:id_number,reflect_id:reflect_id,expire_date:expiry_date}).then(doc =>{
                    FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash}).then(doc_content =>{
                        // MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                            res.redirect('/document-list');
                        // });
                    })
                })
            // })
        })
    });
}
// 
/**show-reflect-code-data Post Method Start  **/
exports.show_reflect_code_data=(req,res,next) =>{
    var user_id=req.session.user_id;
    var reflect_list=[];
     reflect_list=JSON.parse(req.body.reflect_code_list);
    // var result_code_array=[]

        // console.log("$$$$$$$$$$$$$$$$$$$ reflect_list $$$$$$$$$$$$$$$$$$$$ : ",reflect_list)



    // if(user_id)
    // {
        
        /**get my all reflect code start**/
        var complaint_reflect_code_list=reflect_list.join("','");
       
      
       db.query("SELECT *from (SELECT max(user_doc_id),reflect_id,doc_id,self_assested,certified_status,createdAt as 'created_doc' FROM `tbl_myreflectid_doc_rels` GROUP BY doc_id) as doc_table INNER JOIN tbl_documents_masters ON doc_table.doc_id=tbl_documents_masters.doc_id inner join tbl_wallet_reflectid_rels on doc_table.reflect_id=tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_wallet_reflectid_rels.reg_user_id="+user_id+" AND tbl_wallet_reflectid_rels.reflect_code IN ('"+complaint_reflect_code_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){


        console.log('!!!!!!!!!!!!! : ',all_document_Data)

                               
                       
                      
        res.render('front/my-document/ajax_my_document',{
            success_msg,
            err_msg,
            session:req.session,
            moment,
            all_document_Data
                        // 

        });
        
        /**get my all reflect code end**/
 
    })

}
/**show-reflect-code-data Post Method End  **/
