var {UserModel,LogDetailsModel,tbl_log_manage}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel,CountryCodeModel}=require('../../models/securityMaster');
var {     tbl_verifier_plan_master,AdminModel,PlanFeatures,PlanFeatureRel,tbl_verifier_doc_list,MarketPlace,AllotMarketPlace,ContectUsModel,SubscriberModel
} = require('../../models/admin');
var { tbl_verfier_purchase_details } =require("../../models/purchase_detaile")
var { tbl_plan_features } =require("../../models/tbl_plan_features")
var { tbl_plan_feature_rel } =require("../../models/tbl_plan_feature_rel")


var os = require('os');

const nodemailer = require("nodemailer");
const express = require('express');
var app=express();
const ejs = require('ejs');

var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime')
var crypto = require('crypto');
var text_func=require('../../helpers/text');

var mail_func=require('../../helpers/mail');
const util = require('util');
const { base64encode, base64decode } = require('nodejs-base64');
var {AboutusModel,ConnectWithModel,WhyChooseUs, 
  Features,FeaturesRelations,Benifits} = require('../../models/general_page');
var userData = require('../../helpers/profile')

/**index Get Method start**/
exports.index =async (req,res, next) => {
  // console.log("request",req)
  // console.log("request.............................")
  // console.log("request", req.connection.remoteAddress)

  db.query('SELECT *FROM tbl_our_key_pillars',{type:db.QueryTypes.SELECT}).then(async our_key_pillars_data => {

   db.query('SELECT *FROM tbl_front_about_us',{type:db.QueryTypes.SELECT}).then(async about_us_data => {
      
      db.query('SELECT *FROM tbl_front_connect_with_us',{type:db.QueryTypes.SELECT}).then(async front_connect_with_us_data => {

        db.query('SELECT *FROM tbl_why_choose_us',{type:db.QueryTypes.SELECT}).then(async why_choose_us_data => {
          
          db.query('SELECT *FROM tbl_benifits',{type:db.QueryTypes.SELECT}).then(async benifit_data => {

              db.query('SELECT *FROM tbl_features ',{type:db.QueryTypes.SELECT}).then(async feature_data => {
                 
                  for(var i=0;i< feature_data.length;i++)
                     {
                       var feature_id = feature_data[i].feature_id;

                      //  console.log('feature_id : ',feature_id)

                                 var length_data;

                            await db.query("SELECT * FROM `tbl_features_relations` WHERE feature_id="+feature_id+"  order by feature_rel_id desc",{ type:db.QueryTypes.SELECT}).then( async(features_relations)=>{


                                     if(features_relations.length>0)
                                     {
                                         feature_data[i].features_relations_data = features_relations
                                         length_data                            =  features_relations.length

                                     }
                                     else
                                     {
                                         feature_data[i].features_relations_data = 'undefined'
                                         length_data = 0;
                                      }
                          
                               })


                     }
                  res.render('front/index',{
                                session:req.session,
                                about_us_data,
                                front_connect_with_us_data,
                                why_choose_us_data,
                                feature_data,
                                benifit_data,length_data,our_key_pillars_data
                        });    
           



              });
          });

        });
      });
    })
   })
};
/**index Get Method End**/

// exports.index =async (req,res, next) => {
//   res.render('front/beta');
// }

exports.benifits_more_index =async (req,res, next) => {

    // var benifit_id = req.query.benifit_id;
    
        db.query('SELECT *FROM tbl_benifits',{type:db.QueryTypes.SELECT}).then(async benifit_data => {

                  db.query('SELECT *FROM tbl_front_connect_with_us',{type:db.QueryTypes.SELECT}).then(async front_connect_with_us_data => {

                  res.render('front/benifits-more-index',{
                                session:req.session,
                                data:benifit_data,front_connect_with_us_data
                        });    
           

          })

                        
    })
};
/**index Get Method End**/

exports.feature_more_index =async (req,res, next) => {

    var feature_id = req.query.feature_id;
          db.query('SELECT *FROM tbl_front_connect_with_us',{type:db.QueryTypes.SELECT}).then(async front_connect_with_us_data => {

             db.query('SELECT *FROM tbl_features WHERE feature_id='+feature_id,{type:db.QueryTypes.SELECT}).then(async feature_data => {
                 
                  for(var i=0;i< feature_data.length;i++)
                     {
                       var feature_id = feature_data[i].feature_id;

                       console.log('feature_id : ',feature_id)

                                 var length_data;

                            await db.query("SELECT * FROM `tbl_features_relations` WHERE feature_id="+feature_id+"  order by feature_rel_id desc",{ type:db.QueryTypes.SELECT}).then( async(features_relations)=>{


                                     if(features_relations.length>0)
                                     {
                                         feature_data[i].features_relations_data = features_relations
                                         length_data                            =  features_relations.length

                                     }
                                     else
                                     {
                                         feature_data[i].features_relations_data = 'undefined'
                                         length_data = 0;
                                      }
                          
                               })


                     } 
                  res.render('front/feature-more-index',{
                                session:req.session,
                                data:feature_data,length_data,front_connect_with_us_data
                        });    
           

          })

                        
    })
};
/**index Get Method End**/

exports.our_key_pillars_more_index =async (req,res, next) => {

    // var benifit_id = req.query.benifit_id;
    
        db.query('SELECT *FROM tbl_our_key_pillars',{type:db.QueryTypes.SELECT}).then(async key_pillars_data => {

            db.query('SELECT *FROM tbl_front_connect_with_us',{type:db.QueryTypes.SELECT}).then(async front_connect_with_us_data => {

                  res.render('front/our-key-pillars-more-index',{
                                session:req.session,
                                data:key_pillars_data,front_connect_with_us_data
                        });    
           

                })

                        
    })
};
// bhavna