var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel, FilesDocModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var {NotificationModel} = require('../../models/notification');
var {DigitalWalletRelsModel} = require('../../models/wallet_digital_rels');
var {childWalletModel} = require('../../models/childe_wallet');
var url = require('url');
var http = require('http');
var sizeOf = require('buffer-image-size');
const nodemailer = require("nodemailer");
var db = require('../../services/database');
var sequelize = require('sequelize');

const Op = sequelize.Op;
var dataUriToBuffer = require('data-uri-to-buffer');

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
var admin_notification = require('../../helpers/admin_notification.js')

const ipfsAPI = require('ipfs-api');
const fs = require('fs');
var async = require('async');

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

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
                            console.log("certified_data 2",certified_data);
                            if(certified_data.length>0){
                                for(var b=0;b<certified_data.length;b++){
                                    await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id+" and tbl_request_documents_files.docfile_status<>'pending'",{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
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
                        // console.log("---------doc_content---------- ",doc_content);
    
    
                         documents[i].file_content = all_doc_content;
                         documents[i].video_content = all_video_content;
                         documents[i].self_attested_content = all_self_attested;
                        
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
                                await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id+" and tbl_request_documents_files.docfile_status<>'pending'",{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
                            console.log("certified_doc_data ",certified_doc_data);
                            certified.push({certified_data:certified_data,certified_doc_data:certified_doc_data});
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
            
        await   CountryModel.findOne({where:{country_name:user_data.birthplace}}).then(async country_data => { 

          await  MyReflectIdModel.create({entity_company_country:country_data.country_id,reflectid_by:reflectid_by,reflect_code:reflect_code,wallet_id:wallet_id,reg_user_id:user_id,user_as:user_type,rep_username:reflect_username,rep_firstname:firstname,rep_lastname:lastname,rep_emailid:mail_id,wallet_name:wallet_name}).then(async(result)=>{
              await  admin_notification("Client  has been create new Reflect Id as representative.",user_id,result.reflect_id,"3")
               
            res.redirect('/view-reflect-id?id='+reflect_code);
          })
       })
    })
}
/**submit-myreflect-code Post method End**/

/**update-representative Post method Start**/
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
/**update-representative Post method End**/

/**additional-info Post method Start**/
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
                     

       var dt = dateTime.create();
       var formatted = dt.format('Y-m-d H:M:S');

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
                          FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash}).then(doc_content =>{
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
                    FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash}).then(doc_content =>{
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
exports.get_checked_doc = (req,res,next) =>{
    var id = req.body.user_doc_id;
    console.log("--------id",id);
    db.query("SELECT * FROM tbl_files_docs INNER JOIN tbl_myreflectid_doc_rels ON tbl_files_docs.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id inner join tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.user_doc_id="+id,{ type:db.QueryTypes.SELECT}).then(function(document){
    console.log("--------document",document);

        res.send(document);
    })
}
/**get-checked-doc Post method End**/

/**request-doc Post method Start**/
exports.request_doc = async(req,res,next) =>{

    console.log("...........................................request_doc start*******....................................");

    // console.log(req.body,typeof req.body.download);

       var client_id        = req.session.user_id;
       var reflect_id       = req.body.reflect_id;
       var verifier_id      = req.body.verifier_id;
       var ver_ref_id       = req.body.verifier_reflect_id;
       var sub_cat_id       = req.body.sub_cat_id
       var p_cat_id         = req.body.p_cat_id
       var note             = req.body.note

    //    console.log(".....***sub_cat_id****.....",sub_cat_id);
    //    console.log(".....***p_cat_id****.....",p_cat_id);
   
       const request_code = generateUniqueId({
           length: 6,
           useLetters: false
         });

       var doc_id   =[]; 
       var download =[];
       var view     =[];
       var certify  =[];
   
       doc_id           = JSON.parse(req.body.total_doc);
       download         = JSON.parse(req.body.download);
       view             = JSON.parse(req.body.view);
       certify          = JSON.parse(req.body.certify);
       // console.log(".....*******.....",doc_id);  

       await db.query("select * from tbl_admin_durations",{ type:db.QueryTypes.SELECT})

               .then(async function(due_date_data){
                    console.log("-----------categories--------------",due_date_data);
                    var duration = due_date_data[0].counting;
                    var dt = new Date();
                    if(due_date_data[0].duration=="month"){
                        dt.setMonth( dt.getMonth() + parseInt(duration) );
                        // console.log("Due Date "+dt);
                    }
                    
                    await MyReflectIdModel.findOne({where:{deleted:"0",reflect_id:reflect_id}}).then(async(c_re_data)=>{
            
                UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
                MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                await MyReflectIdModel.findOne({where:{deleted:"0",reflect_id:ver_ref_id},include:[UserModel]}).then(async(v_re_data)=>{
            
                //    console.log("my reflect c $ v data",v_re_data,c_re_data)
            
                    var  request_pin =   v_re_data.reflect_code+c_re_data.reflect_code+v_re_data.tbl_user_registration.user_pin
                    var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
                    var mystr = mykey.update(request_pin, 'utf8', 'hex')
                    mystr += mykey.final('hex');
                    var cript_64_request_pin = mystr
                //   console.log("cript_64_request_pin",cript_64_request_pin)
            
            
            
                    await ClientVerificationModel.create({
                                                    request_code:request_code,
                                                    verifier_id:verifier_id,
                                                    verifer_my_reflect_id:ver_ref_id,
                                                    reflect_id:reflect_id,
                                                    client_id:client_id,
                                                    request_pin:cript_64_request_pin,
                                                    p_category_id: p_cat_id,
                                                    sub_category_id:sub_cat_id,
                                                due_date:dt
                                                }).then(async(verifyRequest) =>{
            // console.log("/////////////////////------",verifyRequest);
            
            var request_id = verifyRequest.request_id;
                await UserModel.findOne({ where: {reg_user_id: client_id} }).then(async(userData) =>{
                                    await  NotificationModel.create({
                                                                notification_msg:`You have recieved a request from ${userData.full_name}.`,
                                                                sender_id:client_id,
                                                                receiver_id:verifier_id,
                                                                request_id:request_id,
                                                                notification_type:'1',
                                                                notification_date:new Date()
                                                    }).then(async(notification) =>{
            for(var i=0;i<doc_id.length;i++){

                
                                //   console.log("/////////////////////",doc_id[i]);
                await RequestDocumentsModel.create({request_id:request_id,user_doc_id:doc_id[i],download:download[i],view:view[i],certified:certify[i],message:note}).then(async(success) =>{
                                        if(i==(doc_id.length-1)){
                                            await upload_water_mark();
                                        }
                                        // res.send("success");
                                        }).catch(err=>console.log("RequestDocumentsModel err",err))
                                        }
            
                async function upload_water_mark(){
            
                await db.query('SELECT * FROM tbl_request_documents WHERE request_id='+request_id+' AND deleted="0"',{ type:db.QueryTypes.SELECT}).then(async(requestDocumentData)=>{
                    var new_hash_array =[]
                    var countForSend = 0
                    for(var z=0; z<requestDocumentData.length;z++)
                    {
                        await db.query('SELECT * FROM tbl_request_documents INNER JOIN tbl_files_docs ON tbl_request_documents.user_doc_id=tbl_files_docs.user_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id= tbl_client_verification_requests.request_id WHERE tbl_request_documents.request_id='+request_id+' AND tbl_request_documents.deleted="0" AND tbl_files_docs.deleted="0" AND tbl_request_documents.user_doc_id='+requestDocumentData[z].user_doc_id,{ type:db.QueryTypes.SELECT}).then(async(SortrequestDocumentData)=>{
                        // console.log("/////////SortrequestDocumentData////////////",SortrequestDocumentData);
                            // new_hash_array.push(SortrequestDocumentData[0])
                        //    for(var k=0; k<SortrequestDocumentData.length; k++){
                            async.each(SortrequestDocumentData,async function (content1, cb) {
            
                            //   var w_text="MY_reflect_"+content1.request_code;
                            var w_text="MY_reflect_"+c_re_data.reflect_code
                        //    var fun_hash =SortrequestDocumentData[k].file_content
                            var self_attested_hash =content1.self_attested_hash
                            
                            var fun_hash;

                                if (self_attested_hash) {
                                fun_hash = content1.self_attested_hash
                                    
                                                    // console.log("IIIIIIIIIIIIIIIIIIIIIIIhello-----------1 ",fun_hash);

                                }
                                else
                                {
                                                fun_hash  = content1.file_content

                                                    // console.log("elseSSSSSSSSSSSSSSSSShello-----------1 ",fun_hash);

                                }
                            
                            console.log("hello-----------1 ");
                                // await Jimp.create(720,520,'#ffffff',async function(err, nova_new) {
                            //  .then(async nova_new =>{
                            

                                console.log("hello-----------2 ");
                                var a;


                    const delay = (duration) =>
                    new Promise(resolve => setTimeout(resolve, duration))
                        var srcImage;

                async function wait_hash(){
                        if (self_attested_hash) {
                            
                
                            await request(`https://ipfs.io/ipfs/${fun_hash}`, async function (error, response, body) {
                                                    // console.log("image-----------1 ",body);

                                                        if (  !error && response.statusCode == 200  ) {
                                                                                                                
                                                    srcImage = dataUriToBuffer(body);
                                                }

                                                    // console.log("image-------srcImage----1 ",srcImage);

                                            })
                                                                                                    await delay(10000)

                                                    console.log("image--------srcImage---1 ",srcImage);

                                                    
                                                    // console.log("image-----------1 ",srcImage);
                                }
                                else
                                {
                                                // fun_hash  = content1.file_content

                                                    srcImage = `https://ipfs.io/ipfs/${fun_hash}`

                                                    console.log("elseSSSSSSSSSSSSSSSSShello-----------1 ",srcImage);

                                }  
                            }
                                console.log("before await");
                                                        await wait_hash();
            
                                                        console.log("After await");
                                                    console.log("aer image-----------1 ",srcImage);
                                let icon_image =  await Jimp.read(__dirname+'/../../public/assets/images/logo-white.png')

                                console.log("icon_image.bitmap",icon_image.bitmap)

                                    a= await Jimp.read(srcImage,async function(err, image) {
                                        console.log("image.bitmap",image.bitmap)

                                // await Jimp.create(720,520,'#ffffff',async function(err, nova_new) {
                                    await Jimp.create(image.bitmap.width ,image.bitmap.height+((image.bitmap.width/4)+30),'#ffffff',async function(err, nova_new) {
                                        // await Jimp.create(400,1000,'green',async function(err, nova_new) {

                                        console.log("nova_new.bitmap",nova_new.bitmap)
                                //  .then(async image => {
                                    // var srcImage=blob_url.split(',')[1];
                                        console.log("image-----------1 ");

                                            // await image.resize(720, 520);

                                    console.log("hello-----------3 ");
                                    await icon_image.resize((image.bitmap.width/4)/2,(image.bitmap.width/4)/2);
                                    console.log("icon_image.resize",icon_image)
                                    var b;
                                    b=  await Jimp.loadFont(Jimp.FONT_SANS_12_BLACK ,async function(err, font) {
                                //    .then(async (font) => {
                                    console.log("hello-----------4 ");
                                    var c;
                                        // image.print(font,image.bitmap.width/2.5,image.bitmap.height,"image")
                                        // image.print(font,5,image.bitmap.height,"image")

                                        // nova_new.print(font,5,image.bitmap.height,w_text)
                                        if (!self_attested_hash) {

                                            nova_new.composite(icon_image,((image.bitmap.width)-(image.bitmap.width/4)),image.bitmap.height);
            
                                            }

                                        nova_new.print(font,(image.bitmap.width/4)/3,image.bitmap.height,w_text,)
                                        // image.print(font,40,40,w_text,)

                                    nova_new.composite(image,0,0);
                                    
                                    //    nova_new.composite(icon_image,0,0);
                                    //    image.composite(icon_image,((image.bitmap.width)-(image.bitmap.width/4)/2),image.bitmap.height);

                                    //    nova_new.composite(image,-100,350);
                                    //    image.resize(200,200);
                                    console.log("nova_new.resize",nova_new)

                                
                                    //   nova_new.composite(image,0,0);
                                    
                                    //   image.resize(200,200);
                                
                                
                                    //    let text_img = nova_new.getBase64Async(Jimp.MIME_PNG);
                                
                                            console.log("hello-----------5 ");
                                            console.log("Jimp.MIME_PNG",Jimp.MIME_PNG);
                                        var d  = await   nova_new.getBase64Async(Jimp.MIME_PNG)
                                        // .exec(async function(err, result) {
                                        // .then(async(result) => {
                                                console.log("hello-----------6 ",d);
                                            //    let testBuffer = new Buffer(result);
                                                let testBuffer = new Buffer(d);
            /**---------------------------------------------------------------------------------------------------------*/                                  





            console.log("testBuffer===========>",testBuffer);



            
                                                    
                        var e;
                                                e = await  ipfs.files.add(testBuffer, async function (err, file) {
                                                    if (err) {
                                                    console.log("err from ejs",err);
                                                    }else{
                                                    //    console.log("from ipfs ",file);
                                                        console.log("hello-----------7 ",file[0].hash);
                                                            await  RequestFilesModel.create({
                                                        request_doc_id:content1.request_doc_id,
                                                        request_file_hash:file[0].hash
                                                        }).then(async (dataForReturn)=>{
                                                        console.log("hello-----------8 ");
                                                        if(countForSend==(requestDocumentData.length-1)){
                                                            await finalRespone()
                                                        }
                                                        countForSend++
                    
                                                        return "dataForReturn"; 
                                                        })
                    
                                                    }
                                                                                
                                                })
                                        
                                                
                        }) 
                        
                                })
                                
                            });//
            
            
                        })
            
            
                            
                        })
                    }
                        
                    })
            }
            
            async function finalRespone(){
                res.send("success")
            }
            
            
            }).catch(err=>console.log("notification err",err))
            }).catch(err=>console.log("notification err err",err))
            
            }).catch(err=>console.log("notification err err ",err))
            }).catch(err=>console.log("err client",err))
                    }).catch(err => console.log("err v_code",err))
                });  

   }
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
/** request-check-pin Post Method End  **/

/** self-attested Post Method Start  **/
exports.self_attested = async (req,res,next) =>{
   var user_doc_id = req.body.attested_doc_id;
   var blob_url = req.body.blob_url;
   var reflect_id = req.body.reflect_id;
   var text_for_signature = req.body.text_for_signature;
       var user_id = req.session.user_id;
       console.log('&&&&&&&&&&&&&&&&&&&&& text_for_signature',text_for_signature)
 let attachments=[];
   // console.log("sign",blob_url);
   // console.log("user_doc_id",user_doc_id);
  var hashes =[];
   await FilesDocModel.findAll({where:{user_doc_id:user_doc_id,type:"image",deleted:'0'}}).then(async all_doc_hash =>{
      
      for(var i=0;i<all_doc_hash.length;i++){

        hashes.push(all_doc_hash[i].file_content);
          
       }

     //  console.log("-------hashes---------" ,hashes);
        await DocumentReflectIdModel.update({self_assested:'yes',dig_signature:blob_url},{where:{ user_doc_id: user_doc_id} }).then(async results =>{
            
            
            for(var j=0;j<hashes.length;j++){

                fun_hash = hashes[j];
                var j_val,hashes_length;
                hashes_length=hashes.length;
                j_val=j+1;
                          console.log('&&&&&&&&&&&&&&&&&&&&& j_val : ',j_val,' hashes_length : ',hashes.length,text_for_signature)

                var data_img=await get_digi_hash(fun_hash,blob_url,user_doc_id,user_id,j_val,hashes_length ,text_for_signature);
                                // console.log('8888888888888888888888888888888888888888888888888888888888888')

                // console.log('&&&&&&&&&&&&&&&&&&&&&',data_img)

            }


    

      // setTimeout(db_data,20000);

     
            /**send email start**/
           // async function db_data()
           // {
       
            /**send email end**/
                        res.send("success");

        })
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

const get_digi_hash= async function(fun_hash,blob_url,user_doc_id,user_id,j_val,hashes_length,text_for_signature){
    
    var sign_note;

    if(text_for_signature!=undefined &&text_for_signature!=null&&text_for_signature!=""){

        sign_note   =   text_for_signature

    }   else    {

        sign_note   =   " "

    }
   
  
      let icon_image =  await Jimp.read(__dirname+'/../../public/assets/images/logo-white.png')
     
    
        await Jimp.read(`https://ipfs.io/ipfs/${fun_hash}`).then(async image => {

        await Jimp.create(image.bitmap.width ,((image.bitmap.height)+((image.bitmap.width/4)+30)) ,'#ffffff').then(async nova_new =>{
 
        // await Jimp.read(`https://ipfs.io/ipfs/${fun_hash}`).then(async image => {
 console.log("############################################################################################################")
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
                   
                      await  nova_new.print(font,(image.bitmap.width/4)/3,((image.bitmap.height)+((image.bitmap.width/4))),sign_note);
                    //   await  nova_new.print(
                    //     font,
                    //     0,
                    //     image.bitmap.height,
                    //     {
                    //       text: sign_note,
                    //       alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    //       alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                    //     },
                    //     5,
                    //     5
                    //   ); 
                        
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

    MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
        res.redirect('/view-reflect-id?id='+result.reflect_code);
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
        var new_test_array=[];
        var requested_doc_array=[];
        await db.query("select * from tbl_manage_category_documents WHERE include='yes' AND deleted='0' and category_id="+category_id,{ type:db.QueryTypes.SELECT}).then(async function(cat_docs){
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
                res.render("front/myReflect/ajax_category_docs",{
                    requested_docs:new_test_array
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

                   all_self_attested.push(body); 

                //    console.log("length",all_self_attested.length);
                                        
                 }
                                
             }

            //  console.log("self attested 1---",all_self_attested);

            
                                
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
                        // console.log(all_self_attested); // Final version of eventList
                    });
                })
                    // console.log("---------doc_content---------- ",all_self_attested);


                     documents[i].file_content = all_doc_content;
                     documents[i].video_content = all_video_content;
                     documents[i].self_attested_content = all_self_attested;
                    
                        // var all_docs = all_doc_content.join(',');
                       
                
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
                                await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id+" and tbl_request_documents_files.docfile_status<>'pending'",{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
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
                     function   sendrender(){


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
                                                        await db.query("SELECT * ,tbl_documents_masters.document_name as doc_name FROM tbl_request_documents INNER JOIN tbl_request_documents_files ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_request_documents.request_id="+certified_data[b].request_id,{ type:db.QueryTypes.SELECT}).then(async certified_doc_data=>{
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
        CountryModel.findOne({where:{country_id:country_name}}).then(async(countryupdate) =>{
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

/** my-reflet-id-code get Method Start  **/
exports.my_reflect_code_id= async(req,res,next) =>{
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ")
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

      await db.query("SELECT * from tbl_wallet_reflectid_rels inner join tbl_user_wallets ON tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_user_wallets.reg_user_id WHERE tbl_wallet_reflectid_rels.reflectid_by!='digitalWallet' AND tbl_wallet_reflectid_rels.reg_user_id="+user_id+" and user_as='"+user_type+"'",{type:db.QueryTypes.SELECT}).then(async function(myreflectData){
                         console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ : ",myreflectData)
                         for(var i=0; i<myreflectData.length ; i++){

              await  db.query("SELECT * FROM tbl_digital_wallet_rels INNER JOIN tbl_wallet_reflectid_rels ON tbl_digital_wallet_rels.dig_wal_reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE parent_reflect_id="+myreflectData[i].reflect_id+" AND tbl_digital_wallet_rels.deleted='0'",{type:db.QueryTypes.SELECT}).then(async function(digitalWalletData){


                    myreflectData[i].digitalWallet = digitalWalletData
                })


                         }

                        // //  all_reflect_codes.forEach(result=>
                        // //     {
                        //         all_reflect_id.push(result)

                        //     })
                        console.log("######### : ",myreflectData)

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
   var issue_date = fields.issue_date;
   var issue_place = fields.issue_place;
   var proof_of_address= fields.proof_of_address;
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
     await   FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash}).then(async(doc_content) =>{
        
          
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
     await   FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash}).then(async(doc_content) =>{
        
          
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
                                                    notification_msg:`You have recieved a request from ${userData.full_name}.`,
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
                          <p>Label          : ${data[0].document_name}</p>
                        <p>ID Number      : ${doc_unique_code}</p>
                        <p>Expiry Date    : ${moment(expire_date).format('MMM DD, YYYY')}</p>
                        <p>Create Date    : ${moment(data[0].doc_create_date).format('MMM DD, YYYY')}</p>
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

                  var email = userData.email;
          //var email ='surabhivinchurkar@questglt.com';
          var full_name = userData.full_name;
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
            
                  await   CountryModel.findOne({where:{country_name:user_data.birthplace}})

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