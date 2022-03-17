var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var{ MyReflectIdModel,DocumentReflectIdModel } = require('../../models/reflect');
var {DigitalWalletRelsModel} = require('../../models/wallet_digital_rels');

var {decrypt1,encrypt1,encrypt,decrypt}=require('../../helpers/encrypt-decrypt');
const nodemailer = require("nodemailer");
var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime')
var crypto = require('crypto');
var text_func=require('../../helpers/text');
var mail_func=require('../../helpers/mail');
var qr_func=require('../../helpers/qrcode');
var QRCode = require('qrcode');
const Tx = require('ethereumjs-tx')
var {childWalletModel} = require('../../models/childe_wallet');

const util = require('util');
const { base64encode, base64decode } = require('nodejs-base64');


const Web3 = require('web3');
// var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/eda1216d6a374b3b861bf65556944cdb"));
var web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/f8a10cc5a2684f61b0de4bf632dd4f4b"));


/** get_qr Get MEthod End **/

//get all digital wallets


/** my-wallets Get MEthod Start **/
exports.show_digital_wallet=async(req,res,next) =>{

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;
    try{
    try{
        var digitals=await DigitalWalletRelsModel.findAll({where:{reg_user_id:user_id,status:'active'},order: sequelize.literal('dig_wallet_rel DESC')});
    }catch(err){
      console.log(err);
    }
    let digitalArr=[];
    var cryptoWallet=[];
    let refletArr=[];
    if(digitals.length>0){
      let linkingStatus='';
           for(let i=0;i<digitals.length;i++){
               if(digitals[i].parent_reflect_id==null){
                 linkingStatus='no',
                 digitals[i].parent_reflect_id=''
               }else{
                 linkingStatus='yes'
               }
               if(digitals[i].balance==null){
                 digitals[i].balance='0'
               }

              let digitalObj={
                  walletAddress:digitals[i].wallet_address,
                  walletId:digitals[i].dig_wallet_rel.toString(),
                  balance:digitals[i].balance,
                  refletid:digitals[i].parent_reflect_id,
                  isLinked:linkingStatus,
                  wallet_type:digitals[i].digital_type,
                  wallet_name:''
              }
              digitalArr[i]=digitalObj;
            }
        }


                 res.render('front/digital_wallet/digital-wallets',{ web3,digitalArr,session:req.session,qr_func,base64encode, encrypt });
    }catch(err){
        console.log(err);
        throw err;
    }
 
                  

                   
    

}
/** my-wallets Get MEthod End **/



exports.get_add_digital_wallet_list=(req,res,next) =>{

    var user_id     =   req.session.user_id;
    var user_type   =   req.session.user_type;
    var reflect_id  =   req.body.reflect_id;

    //    var findQuery = "select * from tbl_wallet_reflectid_rels inner join tbl_user_wallets ON tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id WHERE tbl_wallet_reflectid_rels.reflectid_by='digitalWallet' AND tbl_wallet_reflectid_rels.user_as='"+user_type+"'  and tbl_wallet_reflectid_rels.reg_user_id="+user_id+" AND tbl_wallet_reflectid_rels.reflect_id NOT IN(SELECT tbl_child_wallets.child_reflect_id FROM tbl_child_wallets WHERE tbl_child_wallets.reg_user_id="+user_id+") AND tbl_wallet_reflectid_rels.reflect_id NOT IN(SELECT tbl_child_wallets.parent_reflect_id FROM tbl_child_wallets WHERE tbl_child_wallets.reg_user_id="+user_id+") AND tbl_wallet_reflectid_rels.reflect_id NOT IN(SELECT dig_wal_reflect_id FROM tbl_digital_wallet_rels WHERE reg_user_id="+user_id+" AND parent_reflect_id="+reflect_id+")"
    var findQuery = "select * from tbl_wallet_reflectid_rels inner join tbl_user_wallets ON tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id WHERE tbl_wallet_reflectid_rels.reflectid_by='digitalWallet' AND tbl_wallet_reflectid_rels.user_as='"+user_type+"'  and tbl_wallet_reflectid_rels.reg_user_id="+user_id+" AND tbl_wallet_reflectid_rels.reflect_id NOT IN(SELECT tbl_child_wallets.child_reflect_id FROM tbl_child_wallets WHERE tbl_child_wallets.reg_user_id="+user_id+") AND tbl_wallet_reflectid_rels.reflect_id NOT IN(SELECT dig_wal_reflect_id FROM tbl_digital_wallet_rels WHERE reg_user_id="+user_id+" AND parent_reflect_id="+reflect_id+")"

        db.query(findQuery,{ type:db.QueryTypes.SELECT})
       
             .then( function(walletdetails){

                   res.render('front/digital_wallet/ajax_get_digital_wallet_list',{ walletdetails,session:req.session })
        });

}

exports.get_add_digital_wallet_list_at_rep=(req,res,next) =>{

    var user_id     =   req.session.user_id;
    var user_type   =   req.session.user_type;
    var reflect_id  =   req.body.reflect_id;

       var findQuery = "select * from tbl_wallet_reflectid_rels inner join tbl_user_wallets ON tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id WHERE tbl_wallet_reflectid_rels.reflectid_by='digitalWallet' AND tbl_wallet_reflectid_rels.user_as='"+user_type+"'  and tbl_wallet_reflectid_rels.reg_user_id="+user_id+" AND tbl_wallet_reflectid_rels.reflect_id !="+reflect_id+" AND tbl_wallet_reflectid_rels.reflect_id NOT IN(SELECT tbl_child_wallets.child_reflect_id FROM tbl_child_wallets WHERE tbl_child_wallets.reg_user_id="+user_id+") AND tbl_wallet_reflectid_rels.reflect_id NOT IN(SELECT tbl_child_wallets.parent_reflect_id FROM tbl_child_wallets WHERE tbl_child_wallets.reg_user_id="+user_id+") AND tbl_wallet_reflectid_rels.reflect_id NOT IN(SELECT dig_wal_reflect_id FROM tbl_digital_wallet_rels WHERE reg_user_id="+user_id+" AND parent_reflect_id="+reflect_id+")"

        db.query(findQuery,{ type:db.QueryTypes.SELECT})
       
             .then( function(walletdetails){

                   res.render('front/digital_wallet/ajax_get_digital_wallet_list',{ walletdetails,session:req.session })
        });

}

exports.add_new_wallet_digital=(req,res,next) =>{
    console.log("......................................add_new_wallet_digital...................................................................")


    var user_id                  =   req.session.user_id;
    var user_type                =   req.session.user_type;
    var reflect_id               =   req.body.reflect_id;
    var digitalWalletReflectId   =   req.body.digital_reflect_id;


    
        childWalletModel.create({
                                   parent_reflect_id    :   reflect_id,
                                   child_reflect_id     :   digitalWalletReflectId,
                                   reg_user_id          :   user_id
        })  

        .then(dataSave=>{


            var findQuery = "select * from tbl_wallet_reflectid_rels WHERE reflect_id="+reflect_id

            db.query(findQuery,{ type:db.QueryTypes.SELECT})

            .then(reflectdata=>{

                res.redirect("/view-reflect-id?id="+reflectdata[0].reflect_code)

            })

                           

        })

        .catch(err=>console.log("error",err))

}



exports.get_inner_digital_wallet_list=(req,res,next) =>{

    var user_id=req.session.user_id;
    var user_type=req.session.user_type;
    var reflect_code   = req.body.reflect_code


       var qury = 'SELECT * FROM `tbl_wallet_reflectid_rels` WHERE reflect_code='+reflect_code 

      
       db.query(qury,{ type:db.QueryTypes.SELECT})
       .then(data=>{
                var findQuery = 'SELECT * FROM tbl_child_wallets INNER JOIN tbl_wallet_reflectid_rels ON tbl_wallet_reflectid_rels.reflect_id=tbl_child_wallets.child_reflect_id INNER JOIN tbl_user_wallets ON tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id WHERE tbl_child_wallets.parent_reflect_id='+data[0].reflect_id+' AND tbl_child_wallets.reg_user_id='+user_id+' AND tbl_child_wallets.status="active"'
            

                db.query(findQuery,{ type:db.QueryTypes.SELECT})
            
                    .then( function(walletdetails){

                        res.render('front/digital_wallet/ajax_inner_wallet_list',{ walletdetails,session:req.session })
                });
    })

}



exports.check_private_key_of_digital_wallet=(req,res,next) =>{

 var user_id=req.session.user_id;

    var wallet_address=req.body.wallet_address;
    var reflect_code   = req.body.reflect_code

  var private_key2 = req.body.private_key.trim();
  var private_key1;


         var m = private_key2.indexOf("0x");
          if (m==0) {
            private_key1=private_key2
             account = web3.eth.accounts.privateKeyToAccount(private_key1);
            if(!account){
              res.send({fail:"true",success:"false"});
             }
            }else{
               private_key1 ='0x'+private_key2;
               console.log("*************private_key1 ",private_key1);
              account = web3.eth.accounts.privateKeyToAccount(private_key1);            
              if(!account){
                res.send({fail:"true",success:"false"});
              }
            }
                         account = web3.eth.accounts.privateKeyToAccount(private_key1);  

                      console.log("wallet_data 678----------********------ ",account.address);
                      console.log("wallet_data 678----------********------ ",wallet_address);

                          if(account.address === wallet_address){

                            res.send({fail:"true",success:"true"});

                      console.log("wallet_data 678----------********------ ",account.address);
                                    }
                                    else
                                    {
                                                     res.send({fail:"true",success:"false"});
                                       
                                   }

}


exports.add_digitalId_with_wallet=(req,res,next) =>{
    console.log("......................................add_new_wallet_digital...................................................................")


    var user_id                  =   req.session.user_id;
    var user_type                =   req.session.user_type;
    var reflect_id               =   req.body.reflect_id;
    var digitalWalletReflectId   =   req.body.digital_reflect_id;


    
       DigitalWalletRelsModel.create({
                                                                                 parent_reflect_id     :  reflect_id,
                                                                                 dig_wal_reflect_id    :  digitalWalletReflectId,
                                                                                 reg_user_id           :   user_id

                                                })

                                                .then(async dataUpdate=>{


            // var findQuery = "select * from tbl_wallet_reflectid_rels WHERE reflect_id="+reflect_id

            // db.query(findQuery,{ type:db.QueryTypes.SELECT})

            // .then(reflectdata=>{

                res.redirect("/my-reflet-id-code")

            // })

                           

        })

        .catch(err=>console.log("error",err))

}