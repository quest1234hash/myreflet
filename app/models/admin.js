'use strict'; 

var Sequelize = require('sequelize');
var MyReflectIdModel = require('./reflect');

var User = require('./user');
var db = require('../services/database.js');
var  DocumentMasterModel = require('./master');

var schemaPlanMaster = {
    plan_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    plan_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
     plan_price: {
        type: Sequelize.DOUBLE,
        allowNull: false 
     },
     status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'], 
        defaultValue:'active'
    },
    createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    deleted_at:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var tbl_verifier_plan_master = db.define('tbl_verifier_plan_master',schemaPlanMaster);

var AdminModelDefinition = {
    admin_user_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    first_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
     last_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    mobile_number: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    profile_pic:{
        type: Sequelize.BLOB,
        default:'long',
        allowNull:true
    },
    status:{
        type: Sequelize.ENUM,
        values: ['active', 'inactive', 'block'],
        defaultValue:'active'
    },
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    deleted_at:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var AdminModel = db.define('tbl_admin_registration',AdminModelDefinition);

var schemaFeaturePlan = {
    plan_feature_id:{
        type: Sequelize.INTEGER,
        primaryKey:true, 
        allowNull: false,
        autoIncrement:true
    },
    feature_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
     
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    
};

var PlanFeatures = db.define('tbl_plan_features',schemaFeaturePlan);

var schemaFeaturePlanRel = {
    feature_rel_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    plan_id: {
        type: Sequelize.INTEGER,
        references: {
            model: tbl_verifier_plan_master,
            key: 'plan_id'
        },
        allowNull: false 
    },
    feature_id: {
        type: Sequelize.INTEGER,
        references: {
            model: PlanFeatures,
            key: 'plan_feature_id'
        },
        allowNull: false
    },
    feature_status: {
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'yes'
     }
};

var PlanFeatureRel = db.define('tbl_plan_feature_rel',schemaFeaturePlanRel);
var schemaVerfierDoc = {
    verifier_doc_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    document_id: {
        type: Sequelize.INTEGER,
        references: {
            model: DocumentMasterModel.DocumentMasterModel,
            key: 'doc_id'
        },
        allowNull: false
    },
    verifier_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    reflect_id: {
        type: Sequelize.INTEGER,
        references: {
            model: MyReflectIdModel.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: false
    },
    document_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
     
     status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    },
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    deleted_at:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var tbl_verifier_doc_list = db.define('tbl_verifier_doc_list',schemaVerfierDoc);

var schemaMarketPlace= {
    market_place_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    label: {
        type: Sequelize.STRING,
        allowNull: false
     },
     descriptions: {
        type: Sequelize.STRING,
        allowNull: false
     },
     
    icon: { 
        type: Sequelize.BLOB,
        default:'long',
        allowNull:true
     },
    
     status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    },
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    deleted_at:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var MarketPlace = db.define('tbl_market_place',schemaMarketPlace);
var schemaAllotMarketPlace= {
    mp_reflect_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    reflect_id: {
        type: Sequelize.INTEGER,
        references: {
            model: MyReflectIdModel.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: false
    },
    market_place_id: {
        type: Sequelize.INTEGER,
        references: {
            model: MarketPlace,
            key: 'market_place_id'
        },
        allowNull: false 
    },
     status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    },
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    deleted_at:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var AllotMarketPlace = db.define('tbl_market_place_reflectid_rel',schemaAllotMarketPlace);

var contectUs= {
    contact_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    co_name: {
        type: Sequelize.STRING,
        allowNull: true
     },
    co_email: {
        type: Sequelize.STRING,
        allowNull: true
     },
     co_msg: {
        type: Sequelize.STRING,
        allowNull: true
     },
      admin_message: {
        type: Sequelize.STRING,
        allowNull: true
     },
    response_status:{
        type: Sequelize.ENUM,
        values: ['responded', 'pending'],
        defaultValue:'pending'
    },
     responded_at:{
        type: Sequelize.DATE,
        allowNull: true
    },
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
      deleted_at:{
        type: Sequelize.DATE,
        allowNull: true
    }

    
};

var ContectUsModel = db.define('tbl_contact_us',contectUs);
var subscribeSchema= {
    subscriber_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
   
    subscriber_email: {
        type: Sequelize.STRING,
        allowNull: true
     },
     subscriber_status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    },
    
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    
};

var SubscriberModel = db.define('tbl_subscriber',subscribeSchema);

var durationSchema= {
    duration_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
     counting:{
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    duration: {
        type: Sequelize.STRING,
        allowNull: false
     },
     createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var DurationModel = db.define('tbl_admin_durations',durationSchema);

var modelDefinition = {

    notification_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    notification_msg: {
        type: Sequelize.STRING,
        allowNull: false
     },
    sender_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    receiver_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: true
    },
    reflect_id: {
        type: Sequelize.INTEGER,
        references: {
            model: MyReflectIdModel.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: true
    },
    notification_type:{
        type: Sequelize.ENUM,
        values: ['1','2','3','4','5','6'],
        allowNull: true
    },
    // notification_date:{
    //     type: Sequelize.DATE,
    //     allowNull:true
    // },
    read_status:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
    },
    // status:{
    //     type: Sequelize.ENUM,
    //     values: ['active', 'inactive'],
    //     defaultValue:'active'
    // },
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    // deleted_at:{
    //     type: Sequelize.DATE,
    //     allowNull: true
    // }
};

var adminNotificationModel = db.define('tbl_admin_notifications',modelDefinition);


var masterLevelSchema= {
    level_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
     
    level_name  : {
        type: Sequelize.STRING,
        allowNull: false
     },
     status:{
        type: Sequelize.ENUM,
        values: ['active', 'inactive'],
        defaultValue:'active'
    },
    deleted : {
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
     createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var MasterLevelModel = db.define('tbl_master_levels',masterLevelSchema);

var allotLevelSchema= {
    allot_level_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
     
    level_id: {
        type: Sequelize.INTEGER,
        references: {
            model: MasterLevelModel,
            key: 'level_id'
        },
        allowNull: false 
    },
    doc_id: {
        type: Sequelize.INTEGER,
        references: {
            model: DocumentMasterModel.DocumentMasterModel,
            key: 'doc_id'
        },
        allowNull: false 
    },
     status:{
        type: Sequelize.ENUM,
        values: ['active', 'inactive'],
        defaultValue:'active'
    },
    deleted : {
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
     createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var AllotMasterLevelModel = db.define('tbl_allot_levels',allotLevelSchema);

module.exports ={
    tbl_verifier_plan_master,
    AdminModel,PlanFeatures,
    PlanFeatureRel,
    tbl_verifier_doc_list,
    MarketPlace,
    AllotMarketPlace,
    ContectUsModel,
    SubscriberModel,
    DurationModel,
    adminNotificationModel,
    MasterLevelModel,
    AllotMasterLevelModel
};
