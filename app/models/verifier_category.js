'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var db = require('../services/database.js');
var Reflect = require('./reflect');
var Documentmaster = require('./master');
var User = require('./user');


// 1: The model schema.
var modelDefinition = {
    category_id:{
        type: Sequelize.INTEGER, 
        primaryKey:true,
        allowNull: false,
        autoIncrement:true 
    },
    category_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
    parent_category:{
        type: Sequelize.INTEGER,
        allowNull: true
    },
    // category_icon:{ 
    //     type: Sequelize.BLOB,
    //     default:'long',
    //     allowNull:true
    // },
    category_icon: {
        type: Sequelize.STRING,
        allowNull: true
     },
    status:{
        type: Sequelize.ENUM,
        values: ['active', 'inactive'],
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

var VerifierRequestCategoryModel = db.define('tbl_verifier_request_category',modelDefinition);

var modelDefinitionVerifierReflectId = {
    cat_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    reflect_id:{
       type:Sequelize.INTEGER,
       references:{
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        }
    },
    category_id: {
        type: Sequelize.INTEGER,
        references: {
            model: VerifierRequestCategoryModel,
            key: 'category_id'
        }
    },
    reg_user_id:{
        type:Sequelize.INTEGER,
        references:{
             model: User.UserModel,
             key: 'reg_user_id'
         }
     },
    status:{
        type: Sequelize.ENUM,
        values: ['active', 'inactive'],
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
var VerifierCategoryReflectidModel = db.define('tbl_verifier_category_reflectid',modelDefinitionVerifierReflectId);
var modelDefinitionCategoryDocument = {
    category_doc_id:{
         type: Sequelize.INTEGER,
         primaryKey:true,
         allowNull: false,
         autoIncrement:true
     },
     doc_id: {
         type: Sequelize.INTEGER,
         references:{
             model:Documentmaster.DocumentMasterModel,
             key: 'doc_id'
         }
     },
      reg_user_id:{
        type:Sequelize.INTEGER,
        references:{
             model: User.UserModel,
             key: 'reg_user_id'
         }
     },
     descriptions:{
         type: Sequelize.STRING,
         allowNull: false
     },
     doc_file: {
         type: Sequelize.STRING,
         allowNull: true
      },
      
      status:{
         type: Sequelize.ENUM,
         values: ['active', 'inactive'],
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
 var CategoryDocument = db.define('tbl_category_document',modelDefinitionCategoryDocument);
var modelDefinitionManageDocument = {
    manage_doc_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    category_doc_id: {
            type: Sequelize.INTEGER,
            references: {
                model: CategoryDocument.category_doc_id,
                key: 'category_doc_id'
            }
        },
    // doc_id: {
    //     type: Sequelize.INTEGER,
    //     references: {
    //         model: Documentmaster.DocumentMasterModel,
    //         key: 'doc_id'
    //     }
    // },
    category_id: {
        type: Sequelize.INTEGER,
        references: {
            model: VerifierRequestCategoryModel,
            key: 'category_id'
        }
    },
    include:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
    },
    self_certified: {
         type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
     },
     certified: {
      type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
     },
     sign: {
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
     },
     complete: {
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
     },
     video_proof: {
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
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

var ManageCategoryDocument = db.define('tbl_manage_category_document',modelDefinitionManageDocument);


var verifierTermsAndConditionSchema = {
    verifier_t_and_c_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    terms_and_condition: {
        type: Sequelize.STRING,
        allowNull: true
     },
     reflect_id:{
        type:Sequelize.INTEGER,
        references:{
             model: Reflect.MyReflectIdModel,
             key: 'reflect_id'
         }
     },
     reg_user_id:{
        type:Sequelize.INTEGER,
        references:{
             model: User.UserModel,
             key: 'reg_user_id'
         }
     },
    deleted:{
        type: Sequelize.ENUM, 
        values: ['0', '1'],
        defaultValue:'0'
    },

};

var VerifierTermsAndCondition = db.define('tbl_verifier_terms_and_conditions',verifierTermsAndConditionSchema);

module.exports ={
    VerifierRequestCategoryModel,VerifierCategoryReflectidModel,ManageCategoryDocument,CategoryDocument,VerifierTermsAndCondition
};
