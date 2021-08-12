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
var {DocumentMasterModel}=require('../../models/master');

var mail_func=require('../../helpers/mail');
const util = require('util');
const { base64encode, base64decode } = require('nodejs-base64');

var userData = require('../../helpers/profile')
const paginate   =  require("paginate-array");
var moment = require('moment');


const ipfsAPI = require('ipfs-api');
const fs = require('fs');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

/**manage-category Get Method Start**/

exports.manage_category = async(req,res,next)=>{
    console.log('....................................manage_category start.............................................')
    var reg_id= req.session.user_id
    
    console.log('reg_id........',reg_id)
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")
   await VerifierRequestCategoryModel.findAll({where:{deleted:"0",status:"active",parent_category:"0"}})
    .then(async(cat_data)=>{
        // console.log("catreflectdata[i].category_id************** ",cat_data);
       await MyReflectIdModel.findAll({where:{user_as:"verifier",reg_user_id:reg_id, deleted:"0"}}).then(async(myrefelctData)=>{

   var sun_cat_data=[]
   

    //1   await  db.query("SELECT * FROM tbl_verifier_category_reflectids INNER JOIN tbl_verifier_request_categories on tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id where tbl_verifier_category_reflectids.reg_user_id="+reg_id+" and tbl_verifier_category_reflectids.deleted='0' and tbl_verifier_request_categories.parent_category='0' GROUP BY tbl_verifier_category_reflectids.category_id",{type:db.QueryTypes.SELECT}).then(async(catreflectdata)=>{
        
        //2 await  db.query('SELECT * FROM tbl_verifier_category_reflectids INNER JOIN tbl_verifier_request_categories on tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_verifier_category_reflectids.reg_user_id where tbl_verifier_category_reflectids.reg_user_id IN(SELECT tbl_invite_sub_verifiers.sub_verifier_id FROM `tbl_invite_sub_verifiers` WHERE tbl_invite_sub_verifiers.reg_user_id="'+reg_id+'" OR "'+reg_id+'") and tbl_verifier_category_reflectids.deleted="0" and tbl_verifier_request_categories.parent_category="0" GROUP BY tbl_verifier_category_reflectids.category_id',{type:db.QueryTypes.SELECT}).then(async(catreflectdata)=>{
            



            // await  db.query('SELECT * FROM tbl_verifier_category_reflectids INNER JOIN tbl_verifier_request_categories on tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_verifier_category_reflectids.reg_user_id where tbl_verifier_category_reflectids.reg_user_id IN(SELECT tbl_invite_sub_verifiers.sub_verifier_id FROM `tbl_invite_sub_verifiers` WHERE (tbl_invite_sub_verifiers.invite_status="accept" AND tbl_invite_sub_verifiers.status="active" AND tbl_invite_sub_verifiers.reg_user_id="'+reg_id+'") OR "'+reg_id+'" ) and tbl_verifier_category_reflectids.deleted="0" and tbl_verifier_request_categories.parent_category="0" GROUP BY tbl_verifier_category_reflectids.category_id',{type:db.QueryTypes.SELECT}).then(async(catreflectdata)=>{
       /*Loop Start*/
       //26-08-20
    //    await  db.query('SELECT * FROM tbl_verifier_category_reflectids INNER JOIN tbl_verifier_request_categories on tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_verifier_category_reflectids.reg_user_id where ((tbl_verifier_category_reflectids.reg_user_id="'+reg_id+'") OR( tbl_verifier_category_reflectids.reg_user_id IN(SELECT tbl_invite_sub_verifiers.sub_verifier_id FROM `tbl_invite_sub_verifiers` WHERE (tbl_invite_sub_verifiers.invite_status="accept" AND tbl_invite_sub_verifiers.status="active" AND tbl_invite_sub_verifiers.reg_user_id="'+reg_id+'") ) )) and tbl_verifier_category_reflectids.deleted="0" and tbl_verifier_request_categories.parent_category="0" GROUP BY tbl_verifier_category_reflectids.category_id',{type:db.QueryTypes.SELECT}).then(async(catreflectdata)=>{

        await  db.query(`SELECT * FROM tbl_verifier_category_reflectids INNER JOIN tbl_verifier_request_categories on tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_verifier_category_reflectids.reg_user_id 
        where 
        (
            (tbl_verifier_category_reflectids.reg_user_id=${reg_id}) 
        
            OR 
               ( tbl_verifier_category_reflectids.reg_user_id IN(
                                                                  SELECT tbl_invite_sub_verifiers.sub_verifier_id FROM tbl_invite_sub_verifiers 
                                                                  WHERE (  
                                                                      tbl_invite_sub_verifiers.invite_status="accept" AND tbl_invite_sub_verifiers.status="active" AND tbl_invite_sub_verifiers.reg_user_id=${reg_id}
                                                                  ) 
                                                                ) 
                )  
        
            OR (  tbl_verifier_category_reflectids.reg_user_id IN(SELECT tbl_invite_sub_verifiers.reg_user_id FROM tbl_invite_sub_verifiers 
                                                                  WHERE(  
                                                                      tbl_invite_sub_verifiers.invite_status="accept" AND tbl_invite_sub_verifiers.status="active" AND tbl_invite_sub_verifiers.sub_verifier_id=${reg_id}
                                                                  )
        
                                                                 )
        
            )    
        ) and tbl_verifier_category_reflectids.deleted="0" and tbl_verifier_request_categories.parent_category="0" GROUP BY tbl_verifier_category_reflectids.category_id`,{type:db.QueryTypes.SELECT}).then(async(catreflectdata)=>{ 

       console.log("catreflectdata",catreflectdata)
        for(var i=0; i<catreflectdata.length ;i++){
            
        //1    await VerifierRequestCategoryModel.findAll({where:{parent_category:catreflectdata[i].category_id,deleted:"0"}}).then(async(P_S_data)=>{
            //2 await db.query('SELECT * FROM `tbl_verifier_request_categories` INNER JOIN tbl_verifier_category_reflectids ON tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id INNER JOIN tbl_user_registrations ON  tbl_user_registrations.reg_user_id=tbl_verifier_category_reflectids.reg_user_id WHERE tbl_verifier_request_categories.parent_category="'+catreflectdata[i].category_id+'" AND tbl_verifier_request_categories.deleted="0" GROUP BY tbl_verifier_category_reflectids.category_id',{type:db.QueryTypes.SELECT}).then(async(P_S_data)=>{
                await db.query('SELECT *,tbl_verifier_request_categories.createdAt as sub_createAt,tbl_verifier_request_categories.category_id as cat_id, COUNT(tbl_manage_category_documents.category_id) as total  FROM `tbl_verifier_request_categories` INNER JOIN tbl_verifier_category_reflectids ON tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id INNER JOIN tbl_user_registrations ON  tbl_user_registrations.reg_user_id=tbl_verifier_category_reflectids.reg_user_id LEFT JOIN tbl_manage_category_documents ON ((tbl_verifier_request_categories.category_id=tbl_manage_category_documents.category_id) AND (tbl_manage_category_documents.include="yes")) WHERE tbl_verifier_request_categories.parent_category="'+catreflectdata[i].category_id+'" AND tbl_verifier_request_categories.deleted="0" GROUP BY tbl_verifier_category_reflectids.category_id ,tbl_manage_category_documents.category_id',{type:db.QueryTypes.SELECT}).then(async(P_S_data)=>{
                console.log("c_p_dat",P_S_data)
                catreflectdata[i].sub_array=P_S_data
                sun_cat_data.push(P_S_data)
            })
        }
   /*Loop End*/
  

        console.log("sun_cat_data",catreflectdata)
        res.render('front/manage-category',{ success_msg,
            err_msg,
           cat_data,
           session:req.session,
           myrefelctData,
           catreflectdata,
           sun_cat_data,
           moment

         });
    })
    
  
        }).catch(err=>console.log("cat err2..",err))
                      
        })
    .catch(err=>console.log("cat err1..",err))
    
    }

/**manage-category Get Method End**/

/**submit_manage_category Post Method Start**/
exports.submit_manage_category =async (req,res,next)=>{
        console.log('.//./././////////////////////////////submit_manage_category start////////////////////////////////////././././.....././../')
            // console.log('req.files for multer..',req.files)
        
            var reg_id= req.session.user_id
             console.log("reg_id",reg_id)
            var image_name;
            var form1 = new formidable.IncomingForm();
        
                form1.parse(req);
            
                form1.on('fileBegin', function (name, file){
                    console.log('file ' , file);
        
                    file.path = './app/uploads/documents/' + "catAddIcon" + "_" + Date.now() + "_" + file.name;
                    image_name = "catAddIcon" + "_" + Date.now() + "_" + file.name
                });
            
                form1.on('file', function (name, file){
                    console.log('Uploaded ' + file.name);
                });
            const form = formidable({ multiples: true });
            await  form.parse(req, async(err, fields, files) => {
                // console.log("formdata fields",fields)
                // console.log("formdata files",files)
        
                
        
            var parent_cat= fields.parent_cat
            var sub_cat= fields.sub_cat
            var s_p_id ;
        // console.log('req...',req.file)
        
        console.log('category..parent_cat.',parent_cat)
        // console.log('reflect_ids...',reflect_ids)
        // console.log('sub_cat...',sub_cat)
        // console.log('category...',parent_cat)
        // console.log('reflect_ids...',fields.reflect_id)
        // console.log('reflect_ids...',typeof fields.reflect_id)
        
            var reflect_ids= JSON.parse(fields.reflect_id) 
        if(parent_cat!=""){
            s_p_id =parent_cat
        }else{
            s_p_id = 0
        }
           await VerifierRequestCategoryModel.create({
                                                   category_name : sub_cat,
                                                   parent_category:s_p_id, 
                                                   category_icon  : image_name,
                                               })
            .then(async(cat_save)=>{
              await  reflect_ids.forEach(async(ref_id)=>{
                                            await VerifierCategoryReflectidModel.create({ 
                                                                                   reflect_id : ref_id,
                                                                                   category_id:cat_save.category_id,
                                                                                   reg_user_id:reg_id
                                            }).catch(err=>{
                                                console.log("cat err12..",err)
                                                
                                            })
                                  })
                                  req.flash("success_msg","Category has been added successfully.")
            
                                  res.redirect("/manage-category")
                
            }) .catch(err=>{
                console.log("cat err22..",err)
                req.flash("err_msg","Somthing went wrong try again.")
            
                res.redirect("/manage-category")
        }) 
        })                                 
                
        }

 /**submit_manage_category Post Method End**/

/**edit-sub_cat_per Post Method Start**/
exports.edit_category_user = async(req,res,next)=>{ 
    console.log('....................................edit_category_userstart.............................................')
            var category_id=req.query.category_id
            var p_cat_name =req.query.p_cat_name
            //    console.log('category_id : ',category_id)
              var all_doc_new_arr=[]
           
              await db.query("SELECT tbl_category_documents.category_doc_id , tbl_category_documents.doc_id,tbl_category_documents.doc_file,tbl_manage_category_documents.manage_doc_id,tbl_manage_category_documents.category_id,tbl_manage_category_documents.include,tbl_manage_category_documents.self_certified,tbl_manage_category_documents.certified,tbl_manage_category_documents.sign,tbl_manage_category_documents.complete,tbl_manage_category_documents.video_proof FROM tbl_category_documents LEFT JOIN tbl_manage_category_documents ON tbl_category_documents.category_doc_id = tbl_manage_category_documents.category_doc_id AND tbl_manage_category_documents.category_id="+category_id+" WHERE tbl_category_documents.deleted='0'",{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data_yes){
                await DocumentMasterModel.findAll({where:{status:'active',deleted:'0',document_type:'master'}}).then(async(DocumentMasterData)=>{
        
                    
                    console.log('!!!!!!!all_document_Data_yes!!!!!! : ',all_document_Data_yes)
        
                    // console.log('!!!!!!!all_document_Data_not!!!!!! : ',all_document_Data_not)
        
                    // console.log('!!!!!!!all_doc_new_arr!!!!!! : ',all_doc_new_arr)
           
                    res.render('front/edit-user',
                    { all_document_Data:all_document_Data_yes,
                        DocumentMasterData,
                        category_id,
                        p_cat_name,
                })
                // })
                  
        
               
                   }).catch(err=>console.log("err..manage..err",err))
                 }).catch(err=>console.log("err..manage..err",err))
        }

/**edit-sub_cat_per Post Method End**/

/**submit_edit_mang_cat Post Method Start**/
exports.submit_edit_mang_cat = async(req,res,next)=>{ 
            console.log('.././//./././/./././././////////submit_edit_mang_cat start////////////////////././././././/./././.')
                var category_id=req.body.cat_id
                   console.log('qurry category_id : ',category_id)
                   var all_doc_new_arr=[]
                   await db.query("SELECT tbl_category_documents.category_doc_id , tbl_category_documents.doc_id,tbl_category_documents.doc_file,tbl_manage_category_documents.manage_doc_id,tbl_manage_category_documents.category_id,tbl_manage_category_documents.include,tbl_manage_category_documents.self_certified,tbl_manage_category_documents.certified,tbl_manage_category_documents.sign,tbl_manage_category_documents.complete,tbl_manage_category_documents.video_proof FROM tbl_category_documents LEFT JOIN tbl_manage_category_documents ON tbl_category_documents.category_doc_id = tbl_manage_category_documents.category_doc_id AND tbl_manage_category_documents.category_id="+category_id+" WHERE tbl_category_documents.deleted='0'",{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data_yes){
        
                    
                    await DocumentMasterModel.findAll({where:{status:'active',deleted:'0',document_type:'master'}}).then(async(DocumentMasterData)=>{
                       
                        var bodyObj =req.body;
                    //   await  all_document_Data_yes.forEach(async(allDocData)=>{
                          for(var i=0; i<all_document_Data_yes.length; i++){
                            
                            var  category_doc_id="bodyObj"+""+"."+"category_doc_id"+i;
                            var  manage_doc_id="bodyObj"+""+"."+"manage_doc_id"+i;
                            var include = "bodyObj"+""+"."+"include"+i;
                            var self_certify = "bodyObj"+""+"."+"self_certify"+i;
                            var certify = "bodyObj"+""+"."+"certify"+i;
                            var sign = "bodyObj"+""+"."+"sign"+i;
                            var complete = "bodyObj"+""+"."+"complete"+i;
                            var video_proof = "bodyObj"+""+"."+"video_proof"+i;
                            // console.log('!!!!!!include!!!!!!! : ',eval(include) );
                            // console.log('!!!!!!!self_certify!!!!!! : ',eval(self_certify) )
                            // console.log('!!!!certify!!!!!!!!! : ',eval(certify) )
                            // console.log('!!!!!!!!!sign!!!! : ',eval(sign) )
                            // console.log('!!!!!complete!!!!!!!! : ',eval(complete) )
                            // console.log('!!!!!!!video_proof!!!!!! : ',eval(video_proof) )
                            // console.log('!!!!!!!manage_doc_id!!!!!! : ',eval(manage_doc_id) )
        
        
                            var f_include ;
                            var f_self_certify ;
                            var f_certify;
                            var f_sign ;
                            var f_complete; 
                            var f_video_proof;
                            if(eval(include)=="yes"){
                                f_include="yes"
                            }else{
                                f_include="no"
                            }
                            if(eval(self_certify)=="yes"){
                                f_self_certify="yes"
                            }else{
                                f_self_certify ="no"
                            }
                            if(eval(certify)=="yes"){
                                f_certify="yes"
                            }else{
                                f_certify="no"
                            }
                            if(eval(sign)=="yes"){
                                f_sign="yes"
                            }else{
                                f_sign="no"
                            }
                            if(eval(complete)=="yes"){
                                f_complete="yes"
                            }else{
                                f_complete="no"
                            }
                            if(eval(video_proof)=="yes"){
                                f_video_proof="yes"
                            }else{
                                f_video_proof="no"
                            }
         var objUdate ={
            include       :  f_include ,
            self_certified: f_self_certify, 
            certified    :  f_certify,
            sign         :  f_sign ,
            complete     : f_complete,
            video_proof  : f_video_proof,
         }
         var f_manage_doc_id =eval(manage_doc_id)
         var f_category_doc_id =eval(category_doc_id)
         console.log('!!!!!!!objUdate!!!!!! : ',objUdate )
         console.log('!!!!!!!f_category_doc_id!!!!!! : ',f_category_doc_id )
        
         console.log('!!!!!!!f_manage_doc_id!!!!!! : ',f_manage_doc_id )
                       if(f_manage_doc_id==''){
                                           await   ManageCategoryDocument.create({category_id:category_id,
                                                                           category_doc_id:f_category_doc_id,
                                                                            include       :  f_include ,
                                                                            self_certified: f_self_certify, 
                                                                            certified    :  f_certify,
                                                                            sign         :  f_sign ,
                                                                            complete     : f_complete,
                                                                           video_proof  : f_video_proof,
        
                                                                           })
                       }else{
                       
                        await  ManageCategoryDocument.update(objUdate,{where:{manage_doc_id:f_manage_doc_id,deleted:"0"}}).then(dataudate=>{
                                                         console.log("dataudate,,,,,",dataudate)
               }).catch(err=>console.log("udate cat errr...",err))
        
                       }
                          
        
                        }
                        // i++;})
                    //     res.render('front/edit-user',
                    //     { all_document_Data,
                    //         DocumentMasterData,
                    //         category_id
                    // })
                    res.redirect("/edit-user?category_id="+category_id)
            
                   
                       }).catch(err=>console.log("err..manage..err",err))
                     }).catch(err=>console.log("err..manage..err",err))
            }
/**submit_edit_mang_cat Post Method End**/

/**delete_sub_cat Get Method Start**/            
exports.delete_sub_cat = async(req,res,next)=>{ 
                var category_id=req.query.category_id
                  VerifierRequestCategoryModel.update({status:"inactive",deleted:"1"},{where:{category_id:category_id,deleted:"0"}}).then(dataudate=>{
                    console.log("delet_sub_cat,,,,,",dataudate)
                    res.redirect("/manage-category")
            }).catch(err=>console.log("delet_sub_cat cat errr...",err))
            }   
/**delete_sub_cat Get Method End**/

/**manage-document Get Method Start**/            
exports.manage_document = (req,res,next)=>{ 
   
                var reflect_id=req.query.reflect_id
                //    console.log('manage_document : ',reflect_id)
           
                   var page = req.query.page || 1
                   var perPage = 10;
                   var page_data=[]
                    db.query("SELECT *from tbl_documents_masters where deleted='0' AND status='active' and document_type='master' AND tbl_documents_masters.doc_id NOT IN (SELECT doc_id from tbl_category_documents)",{ type:db.QueryTypes.SELECT}).then(async function(all_docs){
           
                    db.query("SELECT tbl_documents_masters.doc_id as doc_id ,category_doc_id,descriptions,document_name,doc_file,tbl_category_documents.createdAt as 'createdAt',full_name from tbl_category_documents inner join tbl_documents_masters on tbl_documents_masters.doc_id=tbl_category_documents.doc_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_category_documents.reg_user_id where tbl_category_documents.deleted='0'",{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){
                       console.log('!!!!!!!!!!!!! : ',all_docs)
                       if (all_document_Data.length > 0) {
    
                        page_data=all_document_Data
             
                    }
            
                // console.log(' db hello : ',page_data) 
            
            
            
                const document_list = paginate(page_data,page, perPage);
            
                // console.log('Paginate **********  : ',document_list)
            
                  
                   res.render('front/manage-document',{all_docs,document_list,moment
                       });
                     })  
                    })  
                } 

/**manage-document Get Method End**/

/**add-manage-document Get Method Start**/                
exports.add_manage_document = (req,res,next) =>{
      
       var user_id= req.session.user_id
       var file_data = req.file

        console.log(file_data)
        if(file_data !== undefined){
                        const form = formidable({ multiples: true });
                        form.parse(req, (err, fields, files) => {
                            if (err) {
                                console.log(err);
                            }
                            var doc_id = fields.document_id;
                            var descriptions = fields.descriptions;
                            
                        let testFile = fs.readFileSync(files.manage_file.path);
                        let testBuffer = new Buffer(testFile);
                                
                            ipfs.files.add(testBuffer, function (err, file) {
                            if (err) {
                                console.log("err from ejs",err);
                            }
                            console.log("from ipfs ",file);
                            
                        
                        console.log("from doc_id ",doc_id);
                        console.log("from descriptions ",descriptions);
                    
                        
                                CategoryDocument.create({doc_id:doc_id,reg_user_id:user_id,descriptions:descriptions,doc_file:file[0].hash}).then(doc =>{
                                    // console.log("from ipfs ",doc);
                        
                                        res.redirect('/manage-document');      
                                    })
                            })
                        });
                    }else{
                        const form = formidable({ multiples: true });
                        form.parse(req, (err, fields, files) => {
                            if (err) {
                                console.log(err);
                            }
                            var doc_id = fields.document_id;
                            var descriptions = fields.descriptions;
                          CategoryDocument.create({doc_id:doc_id,reg_user_id:user_id,descriptions:descriptions}).then(doc =>{
                            // console.log("from ipfs ",doc);
                
                                res.redirect('/manage-document');      
                            })
                        })
                    }
      }
/**add-manage-document Get Method End**/

/**delete-manage-document Get Method Start**/

exports.delete_manage_document= async (req,res,next)=>
   {
   
       const category_doc_id = req.query.id
       var dt = dateTime.create(); 
       var formatted = dt.format('Y-m-d H:M:S');
   
           
       console.log(category_doc_id)
   
       var updateValues=
       {
           deleted_at:formatted,
           deleted:'1'
       }
       await CategoryDocument.update(updateValues, { where: { category_doc_id: category_doc_id } }).then((result) => 
       {
   
               // req.flash('success', 'Your Entry successfully deleted !');
               res.redirect('/manage-document');      
               
       })
   
   }  
   /**delete-manage-document Get Method End**/
    
/**edit-manage-document Get Method End**/   
exports.edit_manage_document= async (req,res,next)=> 
   {
   
       const doc_id = req.query.document_id
   
           
       console.log('category_doc_id : ',doc_id)
   
       db.query("SELECT manage_doc_id,cat_doc.category_doc_id as category_doc_id ,document_name,category_name,tbl_verifier_request_categories.category_id as cat_id,self_certified, certified,sign,complete,video_proof FROM `tbl_manage_category_documents` manage_cat_doc INNER join tbl_category_documents cat_doc on manage_cat_doc.category_doc_id=cat_doc.category_doc_id INNER join tbl_documents_masters doc_mas on doc_mas.doc_id=cat_doc.doc_id inner join tbl_verifier_request_categories on manage_cat_doc.category_id=tbl_verifier_request_categories.category_id where doc_mas.doc_id="+doc_id,{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){
   
               await DocumentMasterModel.findOne({doc_id:doc_id}).then(async(DocumentMasterData)=>{

               var document_name=DocumentMasterData.document_name

               console.log('!!!!!!!!!!!!! document_name : ',document_name)

           res.render('front/edit-document',{ all_document_Data,doc_id,document_name
               });});
            })    
      
   
   }  
 /**edit-manage-document Get Method End**/

/**edit-post-manage-document Post Method End**/  
exports.edit_post_manage_document = async(req,res,next)=>{ 
    console.log('.././//./././/./././././////////////////////////////././././././/./././.')
        // var category_id=req.body.cat_id

        const doc_id = req.body.document_id

           console.log('qurry category_id : ',doc_id)

 
           var all_doc_new_arr=[]
           await db.query("SELECT manage_doc_id,cat_doc.category_doc_id as category_doc_id ,document_name,category_name,tbl_verifier_request_categories.category_id as cat_id,self_certified, certified,sign,complete,video_proof FROM `tbl_manage_category_documents` manage_cat_doc INNER join tbl_category_documents cat_doc on manage_cat_doc.category_doc_id=cat_doc.category_doc_id INNER join tbl_documents_masters doc_mas on doc_mas.doc_id=cat_doc.doc_id inner join tbl_verifier_request_categories on manage_cat_doc.category_id=tbl_verifier_request_categories.category_id where doc_mas.doc_id="+doc_id,{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data_yes){

            
            await DocumentMasterModel.findAll({where:{status:'active',deleted:'0',document_type:'master'}}).then(async(DocumentMasterData)=>{
               
                var bodyObj =req.body;
            //   await  all_document_Data_yes.forEach(async(allDocData)=>{
                  for(var i=0; i<all_document_Data_yes.length; i++){
                    
                    var  category_doc_id="bodyObj"+""+"."+"category_doc_id"+i;
                  var  manage_doc_id="bodyObj"+""+"."+"manage_doc_id"+i;
                    var self_certify = "bodyObj"+""+"."+"self_certify"+i;
                    var certify = "bodyObj"+""+"."+"certify"+i;
                    var sign = "bodyObj"+""+"."+"sign"+i;
                    var complete = "bodyObj"+""+"."+"complete"+i;
                    var video_proof = "bodyObj"+""+"."+"video_proof"+i;


                
                    var f_self_certify ;
                    var f_certify;
                    var f_sign ;
                    var f_complete; 
                    var f_video_proof;
                   
                    if(eval(self_certify)=="yes"){
                        f_self_certify="yes"
                    }else{
                        f_self_certify ="no"
                    }
                    if(eval(certify)=="yes"){
                        f_certify="yes"
                    }else{
                        f_certify="no"
                    }
                    if(eval(sign)=="yes"){
                        f_sign="yes"
                    }else{
                        f_sign="no"
                    }
                    if(eval(complete)=="yes"){
                        f_complete="yes"
                    }else{
                        f_complete="no"
                    }
                    if(eval(video_proof)=="yes"){
                        f_video_proof="yes"
                    }else{
                        f_video_proof="no"
                    }
 var objUdate ={
    self_certified: f_self_certify, 
    certified    :  f_certify,
    sign         :  f_sign ,
    complete     : f_complete,
    video_proof  : f_video_proof,
 }
 var f_manage_doc_id =eval(manage_doc_id)
 var f_category_doc_id =eval(category_doc_id)
 console.log('!!!!!!!objUdate!!!!!! : ',objUdate )
 console.log('!!!!!!!f_category_doc_id!!!!!! : ',f_category_doc_id )

 console.log('!!!!!!!f_manage_doc_id!!!!!! : ',f_manage_doc_id )
               if(f_manage_doc_id==''){
                                   await   ManageCategoryDocument.create({category_id:category_id,
                                                                   category_doc_id:f_category_doc_id,
                                                                    self_certified: f_self_certify, 
                                                                    certified    :  f_certify,
                                                                    sign         :  f_sign ,
                                                                    complete     : f_complete,
                                                                   video_proof  : f_video_proof,

                                                                   })
               }else{
               
                await  ManageCategoryDocument.update(objUdate,{where:{manage_doc_id:f_manage_doc_id,deleted:"0"}}).then(dataudate=>{
                                                 console.log("dataudate,,,,,",dataudate)
       }).catch(err=>console.log("udate cat errr...",err))

               }
                  

                }
                // i++;})
            //     res.render('front/edit-user',
            //     { all_document_Data,
            //         DocumentMasterData,
            //         category_id
            // })
            res.redirect("/edit-manage-document?document_id="+doc_id)
    
           
               }).catch(err=>console.log("err..manage..err",err))
             }).catch(err=>console.log("err..manage..err",err))
    }
  /**edit-post-manage-document Post Method End**/

 exports.change_p_name_manage_category=(req,res,next)=>{
    console.log("..................................................change_p_name_manage_category....................................................")
     var category_name=req.body.p_name_cat
     var catagoryId=req.body.pName
     console.log(category_name)
     console.log(catagoryId)
     VerifierRequestCategoryModel.update({category_name:category_name},{where:{category_id:catagoryId}}).then(data=>{
            res.redirect("/manage-category")
     }).catch(err=>console.log("upateerr",err))
 }