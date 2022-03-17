'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var db = require('../services/database.js');
var Reflect = require('./reflect');

// var modelDefinition = {

//     notification_id:{
//         type: Sequelize.INTEGER,
//         primaryKey:true,
//         allowNull: false,
//         autoIncrement:true
//     },
//     notification_msg: {
//         type: Sequelize.STRING,
//         allowNull: false
//      },
//     sender_id: {
//         type: Sequelize.INTEGER,
//         references: {
//             model: User.UserModel,
//             key: 'reg_user_id'
//         },
//         allowNull: true
//     },
//     receiver_id: {
//         type: Sequelize.INTEGER,
//         references: {
//             model: User.UserModel,
//             key: 'reg_user_id'
//         },
//         allowNull: false
//     },
//     request_id:{
//         type: Sequelize.INTEGER,
//         references: {
//             model:Request.ClientVerificationModel,
//             key:'request_id'
//         },
//         allowNull: true
//     },
//     notification_type:{
//         type: Sequelize.ENUM,
//         values: ['1','2','3','4','5','6']
       
//     },
//     notification_date:{
//         type: Sequelize.DATE,
//         allowNull:false
//     },
//     read_status:{
//         type: Sequelize.ENUM,
//         values: ['yes', 'no'],
//         defaultValue:'no'
//     },
//     status:{
//         type: Sequelize.ENUM,
//         values: ['active', 'inactive'],
//         defaultValue:'active'
//     },
//     deleted:{
//         type: Sequelize.ENUM,
//         values: ['0', '1'],
//         defaultValue:'0'
//     },
//     deleted_at:{
//         type: Sequelize.DATE,
//         allowNull: true
//     }
// };

// var NotificationModel = db.define('tbl_notifications',modelDefinition);
var reportDefinition = {

    report_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    report_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
    status:{
        type: Sequelize.ENUM,
        values: ['active', 'inactive'],
        defaultValue:'active'
    },
   user_type:{
        type: Sequelize.ENUM,
        values: ['client', 'verifier','both'],
        defaultValue:'both'
    },
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    deleted_at:{
        type: Sequelize.DATE,
        allowNull: true
    },
      updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var ReportMasterModel = db.define('tbl_master_report',reportDefinition);
var filterDefinition = {

    report_filter_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    report_id: {
        type: Sequelize.INTEGER,
        references: {
            model: ReportMasterModel,
            key: 'report_id'
        },
        allowNull: false
    },
    reg_user_id: {
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
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: true
    },
    report_name:{
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    description:{
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    user_type:{
        type: Sequelize.ENUM,
        values: ['client', 'verifier'],
        defaultValue:'client'
    },
    archive:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    archive_at:{
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
    },
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var ReportFilterModel = db.define('tbl_report_filter',filterDefinition);

var filterColumnDefinition = {

    report_column_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    report_filter_id: {
        type: Sequelize.INTEGER,
        references: {
            model: ReportFilterModel,
            key: 'report_filter_id'
        },
        allowNull: false
    },
    column_name:{
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    deleted_at:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var FilterColumnModel = db.define('tbl_report_filter_column',filterColumnDefinition);
var scheduleDefinition = {

    schedule_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    report_filter_id: {
        type: Sequelize.INTEGER,
        references: {
            model: ReportFilterModel,
            key: 'report_filter_id'
        },
        allowNull: false
    },
     daily:{
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
    },
    weekly:{
        type: Sequelize.STRING,
        allowNull: true
    },
    monthly:{
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
    },
    start_date:{
        type: Sequelize.DATE,
        allowNull: true
    },
    end_date:{
        type: Sequelize.DATE,
        allowNull: true
    },
    preferred_time:{
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var ScheduleReportModel = db.define('tbl_report_schedules',scheduleDefinition);

module.exports ={

    ReportMasterModel,FilterColumnModel,ReportFilterModel,ScheduleReportModel
};
