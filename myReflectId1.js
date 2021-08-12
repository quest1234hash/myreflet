var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel, FilesDocModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var {NotificationModel} = require('../../models/notification');


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


exports.create_reflect_id = (req,res,next)=>{
    var email = req.session.email; 
    var  wallet_id = req.query.address.trim();
    const reflect_code = generateUniqueId({
        length: 4,
        useLetters: false
      });
    // console.log(reflect_code);
  var type=  req.session.user_type 
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

}else{
    res.render('front/myReflect/create-my-refletid-code',{ session:req.session,wallet_id,reflect_code,email });

}
}



exports.view_myreflect_id = (req,res,next)=>{

    var reflect_code = req.query.id.trim();
    DocumentMasterModel.findAll().then(allDocs =>{
    CountryModel.findAll().then(allCountries=>{
        MyReflectIdModel.findOne({where:{reflect_code:reflect_code}}).then(result => {
          var reflect_id = result.reflect_id;
          db.query("SELECT * FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(document){
              var documents;
              if(document==""){
                documents = null;
              }else{
                  documents=document;
            //   console.log("---------doc_content----------123",documents);
               for(var i=0;i<document.length;i++){
                //    console.log(i);
                   var doc_id=document[i].user_doc_id;
                   console.log("doc_id",doc_id);
                   var all_doc_content =[];
                var doc_content = await db.query("SELECT * FROM tbl_files_docs where tbl_files_docs.user_doc_id="+doc_id,{ type:db.QueryTypes.SELECT});
                    // console.log("---------doc_content---------- ",doc_content);
                    doc_content.forEach(content =>{
                        all_doc_content.push(content.file_content);
                        
                        })
                        // var all_docs = all_doc_content.join(',');
                        documents[i].file_content = all_doc_content;
                
               }
               console.log("---------doc_content---------- ",documents);
              }
            var additional_info_array = [];
            if(result.additional_info!=null){
                additional_info_array =JSON.parse(result.additional_info);
                }else{
                    additional_info_array=result.additional_info;
                }
                // console.log("------------------------",additional_info_array);
            var wall_id = result.wallet_id;
            var country_id = result.entity_company_country;
            if(country_id!=null){
                await CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        // additional_info_array.push(JSON.parse(result.additional_info));
                         res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,additional_info_array,user,country:country.country_name,moment,allCountries,documents,allDocs});
                
                
                    })
                })
            }else{ 
                UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                await WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,additional_info_array,user,moment,allCountries,country:null,documents,allDocs});
                })
            
         
             }  
        
        })
        })
    
    })
})
}

// ********************Representative start********************
exports.submit_reflect_code = (req,res,next)=>{
    var user_type = req.session.user_type;
    var user_id = req.session.user_id;
    var wallet_id = req.body.wallet_id.trim();
    var reflectid_by = req.body.o1.trim();
    var reflect_code = req.body.reflect_code.trim();
    var reflect_username = req.body.reflect_username.trim();
    var firstname = req.body.firstname.trim();
    var lastname = req.body.lastname.trim();
    var wallet_name = req.body.wallet_name.trim();

    var mail_id = req.session.email;
    DocumentMasterModel.findAll().then(allDocs =>{
        console.log("---------------",allDocs);
    CountryModel.findAll().then(allCountries=>{
        MyReflectIdModel.create({reflectid_by:reflectid_by,reflect_code:reflect_code,wallet_id:wallet_id,reg_user_id:user_id,user_as:user_type,rep_username:reflect_username,rep_firstname:firstname,rep_lastname:lastname,rep_emailid:mail_id,wallet_name:wallet_name}).then(result=>{
            db.query("SELECT * FROM tbl_files_docs INNER JOIN tbl_myreflectid_doc_rels ON tbl_files_docs.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id inner join tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id",{ type:db.QueryTypes.SELECT}).then(function(document){
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
            if(country_id!=null){
                CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                        res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,additional_info_array,user,country:country.country_name,moment,allCountries,documents,allDocs});
                 
                   
                    })
                })
            }else{
                var country = "";
                UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                    
                    res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,additional_info_array,user,country,moment,allCountries,documents,allDocs});
             
               
                })
            }
        })
        .catch(err =>{
            console.log(err);
        })
    })
    })
   
})
}

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
    }else if(btc_wallet_address!=undefined){
    
        MyReflectIdModel.update({rep_btc_address:btc_wallet_address},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                res.redirect('/view-reflect-id?id='+result.reflect_code);
            })
        
        })

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


               res.redirect('/view-reflect-id?id='+result.reflect_code);
            })
         
        
        })
    
}
 
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

   let testFile = fs.readFileSync(files.document.path);
  let testBuffer = new Buffer(testFile);

  ipfs.files.add(testBuffer, function (err, file) {
    if (err) {
      console.log("err from ejs",err);
    }
    console.log("from ipfs ",file);
  

DocumentMasterModel.findAll().then(allDocs =>{
   DocumentReflectIdModel.create({doc_id:doc_id,doc_unique_code:id_number,reflect_id:reflect_id,expire_date:expiry_date}).then(doc =>{
    FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash}).then(doc_content =>{
        MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
            res.redirect('/view-reflect-id?id='+result.reflect_code);
        });
})
   })
})
})
});
}

exports.get_verifier_list = (req,res,next) =>{
    db.query('select * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.user_as="verifier"',{ type:db.QueryTypes.SELECT}).then(function(verifiers){
        res.send(verifiers);
    });
}

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

exports.get_checked_doc = (req,res,next) =>{
    var id = req.body.user_doc_id;
    console.log("--------id",id);
    db.query("SELECT * FROM tbl_files_docs INNER JOIN tbl_myreflectid_doc_rels ON tbl_files_docs.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id inner join tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.user_doc_id="+id,{ type:db.QueryTypes.SELECT}).then(function(document){
    console.log("--------document",document);

        res.send(document);
    })
}

exports.request_doc = (req,res,next) =>{
    var client_id = req.session.user_id;

    var reflect_id = req.body.reflect_id;
    var verifier_id = req.body.verifier_id;
    var ver_ref_id = req.body.verifier_reflect_id;
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
    ClientVerificationModel.create({request_code:request_code,verifier_id:verifier_id,verifer_my_reflect_id:ver_ref_id,
        reflect_id:reflect_id,
        client_id:client_id}).then(verifyRequest =>{
            console.log("/////////////////////------",verifyRequest);
            
        var request_id = verifyRequest.request_id;
        UserModel.findOne({ where: {reg_user_id: client_id} }).then(userData =>{
            NotificationModel.create({
                notification_msg:`You have recieved a request from ${userData.full_name}.`,
                sender_id:client_id,
                receiver_id:verifier_id,
                request_id:request_id,
                notification_type:'1',
                notification_date:new Date()
            }).then(notification =>{
                for(var i=0;i<doc_id.length;i++){
                    console.log("/////////////////////",doc_id[i]);
                    RequestDocumentsModel.create({request_id:request_id,user_doc_id:doc_id[i],download:download[i],view:view[i],certified:certify[i]}).then(success =>{
                        res.send("success");
                    })
                }
        

            })
        })
        
    })    
}

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

exports.request_check_pin = (req,res,next) =>{
    var otp = req.body.pin;
    var user_id = req.session.user_id;
    console.log("-----------------------",user_id);
    UserModel.findOne({where:{reg_user_id:user_id}}).then(user =>{
        if(user.user_pin!=otp){
            res.send("");
        }else{
            var data ={
                success_data:"success"
            }
            res.send(data);
        }
    })
}

exports.self_attested = (req,res,next) =>{
   var user_doc_id = req.body.attested_doc_id;
   var blob_url = req.body.blob_url;

   console.log("sign",blob_url);
   console.log("user_doc_id",user_doc_id);
   DocumentReflectIdModel.update({self_assested:'yes',dig_signature:blob_url},{where:{ user_doc_id: user_doc_id} }).then(result =>{
    res.send(result);
   })
  
}

exports.upload_new_doc_rep = (req,res,next) =>{

    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        if (err) {
         console.log(err);
        }

        var user_doc_id = fields.user_doc_id;
        var reflect_id = fields.reflect_id; 

        var type = fields.o1; 

   let testFile = fs.readFileSync(files.document.path);
  let testBuffer = new Buffer(testFile);

  ipfs.files.add(testBuffer, function (err, file) {
    if (err) {
      console.log("err from ejs",err);
    }
   
    FilesDocModel.create({user_doc_id:user_doc_id,file_content:file[0].hash,type:type}).then(doc_content =>{

    MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
        res.redirect('/view-reflect-id?id='+result.reflect_code);
    });    

    })
   

})
});
 }

//***********************entity start******************
// exports.Entity = (req,res,next )=> {

//     success_msg = req.flash('success_msg');
//     err_msg = req.flash('err_msg');
//    var wallet_id = req.query.wallet_id
//    var reflect_code = req.query.reflect_code
//    var reflectid_by="entity"
//    var  reg_user_id=req.session.user_id
//    var  user_as = req.session.user_type 
//    MyReflectIdModel.findOne({where:{reflect_code:reflect_code,
//     reflectid_by:reflectid_by,
//     reg_user_id:reg_user_id,
//     user_as:user_as,
//     wallet_id:wallet_id }}).then(data=>{
//         if(data==null){
//             MyReflectIdModel.create({reflect_code:reflect_code,
//                 reflectid_by:reflectid_by,
//                 reg_user_id:reg_user_id,
//                 user_as:user_as,
//                 wallet_id:wallet_id })
//                 .then(result=>{
//                   res.render('front/myReflect/my-reflet-id-view-for-entity',{
//                       success_msg,
//                       err_msg,
//                       session:req.session,
//                       myreflectEntityData :result,
//                       reflect_id:result.reflect_id
//                   })
// }).catch(err=>console.log("err",err));
//         }else{
//             res.render('front/myReflect/my-reflet-id-view-for-entity',{
//                 success_msg,
//                 err_msg,
//                 session:req.session,
//                 myreflectEntityData :data,
//                 reflect_id:data.reflect_id
//             })
//         }
//     })
       
// }
exports.Entity = (req,res,next )=> {
    var ref_id= req.query.reflect_id

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
   var wallet_id = req.query.wallet_id
   var reflect_code = req.query.reflect_code
   var reflectid_by="entity"
   var  reg_user_id=req.session.user_id
   var  user_as = req.session.user_type 
//    var doc_data = []
     DocumentMasterModel.findAll().then(allDocs =>{
   if(ref_id!=null){
    
    MyReflectIdModel.findOne({where:{reflect_id:ref_id}}).then(result => {
        DocumentMasterModel.hasMany(DocumentReflectIdModel, {foreignKey: 'doc_id'})
          DocumentReflectIdModel.belongsTo(DocumentMasterModel, {foreignKey: 'doc_id'})
          DocumentReflectIdModel.findAll({where:{reflect_id:ref_id},include: [DocumentMasterModel]}).then(doc_data=>{
              console.log("docccccccccccccccc ",doc_data);
            res.render('front/myReflect/my-reflet-id-view-for-entity',{
                success_msg,
                err_msg,
                session:req.session,
                myreflectEntityData :result,
                reflect_id:result.reflect_id,
                DocData: doc_data,
                moment,
                allDocs
            })
        })

    })


}else{
    DocumentMasterModel.hasMany(DocumentReflectIdModel, {foreignKey: 'doc_id'})
    DocumentReflectIdModel.belongsTo(DocumentMasterModel, {foreignKey: 'doc_id'})
    DocumentReflectIdModel.findAll({where:{reflect_id:ref_id},include: [DocumentMasterModel]}).then(doc_data=>{
        console.log("docccccccccccccccc ",doc_data);

    MyReflectIdModel.findOne({where:{reflect_code:reflect_code,
        reflectid_by:reflectid_by,
        reg_user_id:reg_user_id,
        user_as:user_as,
        wallet_id:wallet_id }}).then(data=>{
           
            if(data==null){
                MyReflectIdModel.create({reflect_code:reflect_code,
                    reflectid_by:reflectid_by,
                    reg_user_id:reg_user_id,
                    user_as:user_as,
                    wallet_id:wallet_id })
                    .then(result=>{
                      res.render('front/myReflect/my-reflet-id-view-for-entity',{
                          success_msg,
                          err_msg,
                          session:req.session,
                          myreflectEntityData :result,
                          reflect_id:result.reflect_id,
                          DocData: doc_data,
                          moment,
                          allDocs
                      })
    }).catch(err=>console.log("err",err));
            }else{
                res.render('front/myReflect/my-reflet-id-view-for-entity',{
                    success_msg,
                    err_msg,
                    session:req.session,
                    myreflectEntityData :data,
                    reflect_id:data.reflect_id,
                    DocData: doc_data,
                    moment,
                    allDocs
    
                })
            }
        })
    })
}
})
   
   
}

exports.submitEntity = (req,res,next) =>{
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
console.log("country_name..",company_address)

console.log("country_name..",company_name)

console.log("country_name..",dateofInco)


DocumentMasterModel.findAll().then(allDocs =>{
    if(country_name!=undefined){
        CountryModel.findOne({where:{country_id:country_name}}).then(countryupdate =>{
            var country_id_new = countryupdate.country_id;
            MyReflectIdModel.update({entity_company_country:country_id_new},{where:{ reflect_id: reflect_id} }).then( (success) => {
                MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                    var wall_id = result.wallet_id;
                    var country_id = result.entity_company_country;
                    if(country_id!=null){
                        CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                            UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                            WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                            WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                                console.log("userdatatat.,.,.,.,.,.",user)
                                // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                                res.render('front/myReflect/my-reflet-id-view-for-entity',{
                                    success_msg,
                                    err_msg,
                                    session:req.session,
                                    myreflectEntityData :result,
                                    reflect_id:result.reflect_id,
                                    moment,allDocs
                                })
                            })
                        })
                    }else{
                        var country = "";
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                            // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                            res.render('front/myReflect/my-reflet-id-view-for-entity',{
                                success_msg,
                                err_msg,
                                session:req.session,
                                myreflectEntityData :result,
                                reflect_id:result.reflect_id,
                                moment,allDocs
                            })
                     
                       
                        })
                    }
                })
            
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
                            res.render('front/myReflect/my-reflet-id-view-for-entity',{
                                success_msg,
                                err_msg,
                                session:req.session,
                                myreflectEntityData :result,
                                reflect_id:result.reflect_id,
                                moment,allDocs
                            })
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                        // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                        res.render('front/myReflect/my-reflet-id-view-for-entity',{
                            success_msg,
                            err_msg,
                            session:req.session,
                            myreflectEntityData :result,
                            reflect_id:result.reflect_id,
                            moment,allDocs
                        })
                   
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
                            res.render('front/myReflect/my-reflet-id-view-for-entity',{
                                success_msg,
                                err_msg,
                                session:req.session,
                                myreflectEntityData :result,
                                reflect_id:result.reflect_id,
                                moment,allDocs
                            })
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                        // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                        res.render('front/myReflect/my-reflet-id-view-for-entity',{
                            success_msg,
                            err_msg,
                            session:req.session,
                            myreflectEntityData :result,
                            reflect_id:result.reflect_id,
                            moment,allDocs
                        })
                   
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
                            res.render('front/myReflect/my-reflet-id-view-for-entity',{
                                success_msg,
                                err_msg,
                                session:req.session,
                                myreflectEntityData :result,
                                reflect_id:result.reflect_id,
                                moment,allDocs
                            })
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                        // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                        res.render('front/myReflect/my-reflet-id-view-for-entity',{
                            success_msg,
                            err_msg,
                            session:req.session,
                            myreflectEntityData :result,
                            reflect_id:result.reflect_id,
                            moment,allDocs
                        })
                   
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
                            res.render('front/myReflect/my-reflet-id-view-for-entity',{
                                success_msg,
                                err_msg,
                                session:req.session,
                                myreflectEntityData :result,
                                reflect_id:result.reflect_id,
                                moment,allDocs
                            })
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                        // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                        res.render('front/myReflect/my-reflet-id-view-for-entity',{
                            success_msg,
                            err_msg,
                            session:req.session,
                            myreflectEntityData :result,
                            reflect_id:result.reflect_id,
                            moment,allDocs
                        })
                   
                    })
                }
            })
        
        })
    }else if(company_email!=undefined){
        MyReflectIdModel.update({entity_company_emailid:company_email},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                var wall_id = result.wallet_id;
                var country_id = result.entity_company_country;
                if(country_id!=null){
                    CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                            // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country:country.country_name});
                            res.render('front/myReflect/my-reflet-id-view-for-entity',{
                                success_msg,
                                err_msg,
                                session:req.session,
                                myreflectEntityData :result,
                                reflect_id:result.reflect_id,
                                moment,allDocs
                            })
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                        // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                        res.render('front/myReflect/my-reflet-id-view-for-entity',{
                            success_msg,
                            err_msg,
                            session:req.session,
                            myreflectEntityData :result,
                            reflect_id:result.reflect_id,
                            moment,allDocs
                        })
                   
                    })
                }
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
                            res.render('front/myReflect/my-reflet-id-view-for-entity',{
                                success_msg,
                                err_msg,
                                session:req.session,
                                myreflectEntityData :result,
                                reflect_id:result.reflect_id,
                                moment,allDocs
                            })
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                        // res.render('front/myReflect/my-reflet-id-view',{session:req.session,result,user,country});
                        res.render('front/myReflect/my-reflet-id-view-for-entity',{
                            success_msg,
                            err_msg,
                            session:req.session,
                            myreflectEntityData :result,
                            reflect_id:result.reflect_id,
                            moment,allDocs
                        })
                   
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
}) 
}
// ****************** Show Data by reflect  -id
exports.my_reflect_code_id=(req,res,next) =>{
    // var  user_type=req.session.user_type
    var user_id=req.session.user_id; 
    var user_type = req.session.user_type;

    var all_reflect_id=[]
    if(user_id)
    { 
        console.log("user_type : ",user_type);

        // if(user_type=='client')
        // {

        //     console.log("client");
 
        // } 
        // else{
          
        // }
        /**get my all reflect code start**/
        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",user_id)

       db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_wallets ON tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id inner join tbl_user_registrations on     tbl_user_registrations.reg_user_id=tbl_user_wallets.reg_user_id    WHERE  tbl_wallet_reflectid_rels.reg_user_id="+user_id+" and user_as='"+user_type+"'",{type:db.QueryTypes.SELECT}).then(async function(myreflectData){
                         console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",myreflectData)
                        // //  all_reflect_codes.forEach(result=>
                        // //     {
                        //         all_reflect_id.push(result)

                        //     })

             res.render('front/myReflect/my-reflet-id-code',{
                            success_msg,
                            err_msg,
                            session:req.session,
                            myreflectData

              });

        });
        
        /**get my all reflect code end**/
    }
    else
    {
        redirect('/login');
    }

}
// **************** Document List *******************

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
        console.log(' if hello')
        DocumentMasterModel.findAll().then(allDocs =>{
        
       db.query("SELECT *from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  inner join tbl_wallet_reflectid_rels on  tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations  ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id  WHERE   tbl_wallet_reflectid_rels .reg_user_id="+user_id+" ORDER BY tbl_myreflectid_doc_rels.user_doc_id DESC LIMIT 1",{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){
                        //  console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",all_document_Data)
                        console.log(' db hello')
                        db.query("SELECT DISTINCT reflect_code,user_as from  tbl_user_registrations inner join tbl_wallet_reflectid_rels ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id  WHERE   tbl_user_registrations.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(all_reflect_codes){
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
//***********add new doc -entity **************************/
//******add documents*****************************8 *
exports.AddNewDoc = async(req,res,next )=> {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        if (err) {
         console.log(err);
        }

    var exp_date = fields.exp_date
    var doc_name_id= fields.doc_name
    // console.log(".........req...",req)
   var doc_id_number =fields.id_number
   var reflect_id=fields.reflect_id

   let testFile = fs.readFileSync(files.document.path);
   let testBuffer = new Buffer(testFile);
 
   ipfs.files.add(testBuffer, function (err, file) {
     if (err) {
       console.log("err from ejs",err);
     }
   
 DocumentReflectIdModel.create({doc_id:doc_name_id,
                                       doc_unique_code:doc_id_number,
                                       document_filename:file[0].hash,
                                       reflect_id:reflect_id,
                                       expire_date:exp_date}).then(async(data)=>{
 MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(async(result) => {

  

    DocumentReflectIdModel.findAll({where:{reflect_id:reflect_id}}).then(doc_data=>{
        // console.log("documnet moelsbdfbfhdbhfbd.......",doc_data)
        res.redirect(`/entity?reflect_id=${reflect_id}`)
        // res.render('front/myReflect/my-reflet-id-view-for-entity',{
        //     success_msg,
        //     err_msg,
        //     session:req.session,
        //     myreflectEntityData :result,
        //     reflect_id:result.reflect_id,
        //     DocData: doc_data
        // })
    }).catch(err=>{console.log("errr1",err)})

   

}).catch(err=>{console.log("errr2",err)})
    }).catch(err=>{console.log("errr3",err)})
})
})
}
// **************** Document Show ********************
exports.document_show=(req,res,next) =>{
    var user_type=req.session.user_type;
    var d_id=req.params.id;

    var user_id=req.session.user_id;
    var reflect_code_array=[]
        console.log('hello :',d_id)

  var doc_id=d_id.replace(/:/g,"");

    if(user_id)
    {
        /**get my all reflect code start**/
        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",unique_reflect_code)
        // console.log(' if hello')
        DocumentMasterModel.findAll().then(allDocs =>{
        
       db.query("SELECT *from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  inner join tbl_wallet_reflectid_rels on  tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations  ON tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id  WHERE   tbl_wallet_reflectid_rels .reg_user_id="+user_id+" and tbl_myreflectid_doc_rels.doc_id="+doc_id+" and tbl_myreflectid_doc_rels.user_doc_id In (SELECT user_doc_id from tbl_myreflectid_doc_rels GROUP BY reflect_id ORDER BY user_doc_id DESC)",{ type:db.QueryTypes.SELECT}).then(async function(all_document_Data){
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
            // for(var i=0;i<result.reflect_code.length;i++){
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
// **************************** show_list by reflect code************************************
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

//*********18-02-2020******** */
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


 exports.upload_new_doc_entity = (req,res,next) =>{

    console.log('dATTTTTTTTTTTTAaaaaaaaaaaa : ',)

    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        if (err) {
         console.log(err);
        }

        var user_doc_id = fields.user_doc_id;
        var user_doc_id_1 = req.body.user_doc_id;

        var type = fields.o1; 
        console.log('dATTTTTTTTTTTTAaaaaaaaaaaa : ',user_doc_id)
        console.log('dATTTTTTTTTTTTAaaaaaaaaaaa  234: ',user_doc_id_1)


   let testFile = fs.readFileSync(files.document.path);
  let testBuffer = new Buffer(testFile);

  ipfs.files.add(testBuffer, function (err, file) {
    if (err) {
      console.log("err from ejs",err);
    }
    console.log("from ipfs ",file);
  

    FilesDocModel.create({user_doc_id:user_doc_id,file_content:file[0].hash,type:type}).then(doc_content =>{
    console.log('dATTTTTTTTTTTTAaaaaaaaaaaa : ')
    // console.log(doc_content)

    })
   

})
});
 }