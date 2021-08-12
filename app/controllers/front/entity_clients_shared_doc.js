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

/**myreflect_all_client_doc Get method Start**/
exports.myreflect_all_client_doc = (req,res,next)=>{
    // var email = req.session.email; 
    var  reflect_id = req.query.reflect_id;

    
  var type=  req.session.user_type 

      console.log('type : ',type);

    

               await  db.query("SELECT * FROM tbl_shared_certified_doc inner join tbl_wallet_reflectid_rels on tbl_shared_certified_doc.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels WHERE receiver_my_reflect_id ="+reflect_id+" and deleted='0' ",{type:db.QueryTypes.SELECT})

                    .then(SharedClientData=>{

                                 res.render('front/myReflect/create-my-refletid-code',{ session:req.session,moment,SharedClientData});

                    })

                    .catch(err=>console.log("err",err))
                      

    
}
/**myreflect_all_client_doc Get method End**/


/**myreflect_all_client_view_doc Get method Start**/
exports.myreflect_all_client_view_doc = (req,res,next)=>{
    // var email = req.session.email; 
    var  reflect_id = req.query.reflect_id;

    
  var type=  req.session.user_type 

      console.log('type : ',type);

    

               await  db.query("SELECT * FROM tbl_shared_certified_doc inner join tbl_wallet_reflectid_rels on tbl_shared_certified_doc.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels WHERE receiver_my_reflect_id ="+reflect_id+" and deleted='0' ",{type:db.QueryTypes.SELECT})

                    .then(SharedClientData=>{

                                 res.render('front/myReflect/create-my-refletid-code',{ session:req.session,moment,SharedClientData});

                    })

                    .catch(err=>console.log("err",err))
                      

    
}
/**myreflect_all_client_view_doc Get method End**/
