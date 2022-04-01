const express = require('express');
const router = express.Router();
const userController = require('../controllers/front/user');
const path=require('path');
const paymentController = require('../controllers/front/payment');
const myreflectVerifierController = require('../controllers/front/myreflect_verifier');
const myRequestController =require("../controllers/front/myRequest")
const boardingRequestController =require("../controllers/front/boardingRequest")
const verifierListController = require("../controllers/front/verifier_list")
const myreflectVerifierCategory= require("../controllers/front/verifier_category")
const marketPlace= require("../controllers/front/market_place")
const myReportController= require("../controllers/front/my_reports")
const verifierMyreflect= require("../controllers/front/verfier_reflect")
const SubverifierController = require("../controllers/front/subVerifier.js")
const shareDocController = require("../controllers/front/shareDoc.js")

const DeshboardController = require("../controllers/front/deshboard")
const ManageClientMessage= require("../controllers/front/manage_message")

const walletController = require('../controllers/front/wallet');
const myReflectController = require('../controllers/front/myReflectId');
const notificationController = require('../controllers/front/notification');
const commentController = require('../controllers/front/complaint');
const addressBookController = require("../controllers/front/address_book");
const blockController = require('../controllers/front/explorer');
const DocumentController = require("../controllers/front/my_document")
const {userAuth} =require("../auth/user_auth")
const multer = require('multer');
var isUser =userAuth
const validatoreController = require('../controllers/front/validatore');
const DigitalWallet = require("../controllers/front/digital_wallet")
const IndexController = require("../controllers/front/index.js")
const SharedDocClients = require("../controllers/front/clients_shared_doc.js")

const shareFileController = require("../controllers/front/share_file_data.js");
const { isIP } = require('net');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, './app/uploads/documents')
    },
    filename: function (req, file, cb) {
    cb(null,file.fieldname + "_" + Date.now() + "_" + file.originalname)
    }
})
    
const upload = multer({ storage: storage }) 

//multer file uploading
var Storage1=multer.diskStorage({
    // destination:'../public/profilepic',
    destination:path.join(__dirname, "../public/profilepic"),
     filename:(req,file,cb)=>{
       console.log("Sttttttttttttttttttttttttttt");
       cb(null,req.session.user_id+file.originalname)
     }
   })
   //middleware
   const upload1=multer({
      storage:Storage1
   }).single('image');


// Index
router.get('/',IndexController.index);
router.get('/benifits-more-index',IndexController.benifits_more_index);
router.get('/feature-more-index',IndexController.feature_more_index);
router.get('/our-key-pillars-more-index',IndexController.our_key_pillars_more_index);

// router.post('/',IndexController.index);
router.get('/getprofileimage1/:name',isUser,userController.getImg);
router.get('/signup',userController.signup);
router.post('/contact_us',userController.contact_us);
router.post('/subscribe',userController.subscribe);

router.post('/submit_register',userController.submit_register);
router.get('/sequrity_question',userController.sequrityQuestion);
router.post('/submitQuestionAns',userController.submitQuestionAns);
router.post('/submitSetPin',userController.submitSetPin);
router.get('/set_pin',userController.setPinGet)
router.post('/submitOtp',userController.submitOtp);
router.get('/top_verification',userController.otpVerification);

router.post('/resend_otp',userController.resendOtp);
router.get('/terms-and-conditions',userController.termsAndCondition);
router.post('/terms-and-conditions-submit',userController.termsAndConditionSubmit);
router.post('/check_user_steps',userController.checkUserSteps);

router.get('/login',userController.login);
router.get('/logout',userController.logout);

router.post('/submit_login',userController.submitLogin);
router.get('/dashboard',isUser,userController.dashboard);
router.post('/dashboard/changeUesrType',isUser,userController.changeUserTypeSession);
router.get('/creat-new-wallet',isUser,userController.dashboardCreatNewWallet);
router.get('/myreflect-creat-wallet',isUser,myReflectController.myreflectCreatWallet);


router.get('/client',isUser,userController.dashboardCilent);

router.get('/verifier',userController.dashboardverifier);
router.post('/charge',isUser,paymentController.byPlane);
// router.get('/verifier_or_not_purches_plan',userController.verifier_or_not_purches_plan);



router.get('/forget-password',userController.forgetPassword);
router.post('/forgetPassword',userController.submitForgetPassword);

router.get('/reset-password',userController.successResetpassword);
router.get('/reset-password-link',userController.resetPasswordForm);
router.post('/reset-password-form',userController.resetPasswordFormPost);

router.get('/reset-pin-link',userController.resetPinForm);
router.post('/reset-pin-form',userController.resetPinFormPost);

router.get('/get-change-pass',isUser,userController.getChangePass);
router.post('/change-pass',isUser,userController.ChangePass);
router.post('/validate-pin',isUser,userController.validate_pin);
router.get('/change-email',isUser,userController.get_change_email);
router.post('/update-email',isUser,userController.post_change_email);
router.post('/validate-pin-for-email',isUser,userController.validate_pin_for_email);


router.get('/get-change-pin',isUser,userController.getChangePin); 
router.post('/post-change-pin',isUser,userController.postChangePin);


router.get('/profile',isUser,userController.showUserProfile);
router.post('/edit-profile',isUser,upload1,userController.updateProfile);

router.post('/send_otp_for_mobile_number_change',isUser,userController.sendOtpForMobileNumberChange);

router.post('/check_otp_for_phone_number',isUser,userController.check_otp_for_phone_number);

router.post('/update_mobile_number',isUser,userController.updateMobileNumber);

router.post('/update_email',isUser,userController.updateEmail);


router.get('/create-wallet',isUser,walletController.create_wallet);
router.get('/get-create-wallet',isUser,walletController.get_create_wallet);

router.get('/submit-create-wallet',isUser,walletController.submit_create_wallet);

router.get('/import-wallet',isUser,walletController.import_wallet);
router.get('/wallet-balance',isUser,walletController.wallet_balance);

router.post('/import-wallet-address',isUser,walletController.import_wallet_address);
router.get('/submit-import-wallet',isUser,walletController.submit_import_wallet);

router.get('/my-wallets',isUser,walletController.show_my_wallet);

router.get('/create-my-refletid-code',isUser,myReflectController.create_reflect_id);
router.post('/submit-myreflect-code',isUser,myReflectController.submit_reflect_code);

router.post('/update-representative',isUser,myReflectController.update_representative);
router.post('/additional-info',isUser,myReflectController.additional_info);
// router.post('/add-new-doc-rep',upload.single('document'),myReflectController.add_new_doc_rep);
router.post('/add-new-doc-rep',isUser,myReflectController.add_new_doc_rep);
 
router.get('/view-reflect-id',isUser,myReflectController.view_myreflect_id);

router.get('/entity',isUser,myReflectController.Entity)
router.post('/submit_myreflect_entity',isUser,myReflectController.submitEntity)
router.post('/add_new_doc',isUser,myReflectController.AddNewDoc)

// router.post('/submit-myreflect-code',myReflectController.submit_reflect_code);


router.get('/send-ether',isUser,walletController.send_ethers)
router.post('/send-ether-transfer',isUser,walletController.send_ethers_transfer)

router.post('/check-private-key',isUser,walletController.check_private_key)

router.get('/get-verifier-list',isUser,myReflectController.get_verifier_list)
router.post('/get-checked-doc',isUser,myReflectController.get_checked_doc)
router.post('/request-doc',isUser,myReflectController.request_doc)
router.post('/request-check-pin',isUser,myReflectController.request_check_pin)

router.post('/self-attested',isUser,myReflectController.self_attested)
// router.post('/self-attested-entity',myReflectController.self_attested_entity);


//my-reflet-id-code.php
router.get('/my-reflet-id-code',isUser,myReflectController.my_reflect_code_id)
// Document list
// router.get('/document-list',isUser,myReflectController.document_list)
// router.get('/my-doc-license/:id',isUser,myReflectController.document_show)
// router.get('/document-data',myReflectController.document_data)

router.post('/get-category-list',isUser,myReflectController.get_category_list);
router.post('/get-sub-category-list',isUser,myReflectController.get_sub_category_list);
router.post('/get-requested-doc',isUser,myReflectController.get_requested_doc);

router.post('/reflect-code-data',isUser,myReflectController.reflect_code_data)

// router.post('/show-reflect-code-data',isUser,myReflectController.show_reflect_code_data)
// complaints
router.get('/complaint-list',isUser,commentController.complaint_list)
router.post('/complaint-submit',isUser,commentController.complaint_submit)
router.post('/show-complaints-by-status',isUser,commentController.complaint_list_by_status)
router.post('/show-complaints-by-reflect-code',isUser,commentController.complaint_list_by_reflect_code)
router.post('/show-complaints-by-complain-id',isUser,commentController.complaint_list_by_complain_id)
router.get('/complaint-details/:id',isUser,commentController.view_complaint_details)
router.post('/submit-comment',isUser,commentController.submit_comment)
router.post('/search-complaint',isUser,commentController.search_complaint)
router.get('/complaint-resolved-and-closed',isUser,commentController.complaint_resolved_and_closed)

 
router.get('/notification-list',isUser,notificationController.notification_list)
router.get('/unread-notification-list',isUser,notificationController.unreadnotification_list)
router.get('/delete-notification/:id',isUser,notificationController.delete_notification)
router.get('/notification-count',notificationController.count_notification)

router.post('/request-doc-individual',isUser,myReflectController.request_doc_individual);
router.post('/verifier-doc-checked',isUser,myReflectController.verifier_doc_checked); 
router.post('/request-doc-checked',isUser,myReflectController.request_doc_check);

router.get('/get-certified-doc-list',isUser,myReflectController.get_certified_doc_list);
router.post('/get-doc-list',isUser,myReflectController.get_doc_list);
router.post('/get-doc-imgs',isUser,myReflectController.get_doc_imgs);

//*****
router.post('/submit_myreflect_verifier',isUser,myreflectVerifierController.submitMyreflectVerifier);
router.get('/myreflect-verifier-view',isUser,myreflectVerifierController.myreflect_verifier_view);
router.post('/update-verifier-representative',isUser,myreflectVerifierController.update_representative);
router.post('/verifier-additional-info',isUser,myreflectVerifierController.additional_info);
router.post('/add-new-doc-ver-rep',isUser,myreflectVerifierController.add_new_doc_rep);
router.get('/address-book',isUser,addressBookController.AddressBook)
router.post('/submit-address-book',isUser,addressBookController.SubmitAddressBook)
router.get('/delete_addressBooke_verifier',isUser,addressBookController.DeleteAddressBookeVerifier)
router.post('/update-address-book',isUser,addressBookController.updateAddressBookeVerifier)
router.get('/edit-user',isUser,myreflectVerifierCategory.edit_category_user);

// router.post('/add-new-doc-rep-1',upload.single('document'),myReflectController.add_new_doc_rep);
//24-02-2020**********
router.get("/myrequest",isUser, myRequestController.myRequest)
router.get("/myrequest_view",isUser,myRequestController.myRequestView)


//25-2-2020
router.post("/show-filter-my-request",isUser,myRequestController.MyRequestFilter)
router.post("/show-filter-my-request-verfier-id",isUser,myRequestController.MyRequestVerfierIdFilter)

router.post('/upload-ver-req-doc',isUser,myRequestController.upload_ver_req_doc)
router.post('/upload-ver-req-doc-file',isUser,myRequestController.upload_ver_req_doc_file)
router.post('/check-user-doc-id',isUser,myRequestController.check_user_doc_id)

router.post('/update-request',isUser,myRequestController.update_request);
router.post('/update-request-rejected',isUser,myRequestController.update_request_rejected);

//26-02-2020  
router.get("/request_on_boarding",isUser, boardingRequestController.requestOnBoarding)
router.get("/request_status_change",isUser, boardingRequestController.RequestStatusChange)


//27-02-2020
router.post("/accep_reject_request_check",isUser, boardingRequestController.changeStatusOfRequest)
router.get("/pen_request_view_client_info",isUser, boardingRequestController.penRequestViewClientInfo)

router.post('/accept-request',isUser,boardingRequestController.accept_request);
router.post('/reject-request',isUser,boardingRequestController.reject_request);
router.post('/pin-for-img',isUser,boardingRequestController.pin_for_img);

router.get('/ver-req-doc',isUser,boardingRequestController.ver_req_doc);
router.post('/req-doc-to-client',isUser,boardingRequestController.req_doc_to_client);

router.post('/add-new-cat-doc',isUser,boardingRequestController.add_new_cat_doc);

router.post('/request-update-perm',isUser,boardingRequestController.request_update_perm);

router.post('/remove-requests',isUser,boardingRequestController.remove_requests);
router.post('/invite-client-by-refletid',isUser,boardingRequestController.invite_client_by_refletid);
router.post("/search-accept-onboarding",isUser, boardingRequestController.searchAcceptRequestOnBoarding)
router.post("/search-pending-onboarding",isUser, boardingRequestController.searchPendingRequestOnBoarding)
//2-03-2020
router.get("/otp_veri_aft_login", userController.otpAfterLogin)
router.get("/get-otp_veri_aft_login", userController.otpVerificationAfterLogin)

router.post("/submit-otp-of-login", userController.submitOtpAfterLogin)
router.get('/set_pin_aft_lgn',userController.setPinAfterLoginGet)
router.post('/set_pin_aft_lgn_submit',userController.submitSetPinAfterLogin)
router.post('/cookies_handler_encript',userController.cookies_handler_encript)
router.post('/cookies_handler_decript',userController.cookies_handler_decript)



// router.post('/upload-new-doc-entity',myReflectController.upload_new_doc_entity);http://192.168.1.137:3001
router.post('/upload-new-doc-rep',isUser,myReflectController.upload_new_doc_rep);
//03-03-20
router.get('/verifier_list',isUser,verifierListController.verifierList)
router.post('/verifier_add_to_ad_book',isUser,verifierListController.addVerifierToaddBokk)
router.post('/search-verifier-for-user',isUser,verifierListController.search_verifier_for_user)

router.get('/get-refletid-request',isUser,verifierListController.get_refletid_request);
router.post('/get-doc-from-myreflet',isUser,verifierListController.get_doc_from_myreflet);
router.post('/get-sub-category-list-no',isUser,verifierListController.get_sub_category_list_no);
router.get('/view-document-verifier',isUser,verifierListController.view_document_verifier)

router.post('/upload-new-doc-entity',isUser,myReflectController.upload_new_doc_entity);
router.get('/manage-category',upload.single('addCatIcon'),myreflectVerifierCategory.manage_category)
router.post('/submit_manage_category',isUser,myreflectVerifierCategory.submit_manage_category);

router.post('/upload-new-doc-verifier-rep',isUser,myReflectController.upload_new_doc_rep);


router.get('/manage-document',isUser,myreflectVerifierCategory.manage_document);
router.post('/add-manage-document',isUser,myreflectVerifierCategory.add_manage_document);
router.get('/delete-manage-document',isUser,myreflectVerifierCategory.delete_manage_document);
router.get('/edit-manage-document',isUser,myreflectVerifierCategory.edit_manage_document);
router.post('/edit-post-manage-document',isUser,myreflectVerifierCategory.edit_post_manage_document);


router.post('/submit_edit_mang_cat',isUser,myreflectVerifierCategory.submit_edit_mang_cat)
//11-032020
router.get('/edit-sub_cat_per',isUser,myreflectVerifierCategory.edit_category_user);
router.get('/delete_sub_cat',isUser,myreflectVerifierCategory.delete_sub_cat);


// ********* MARKET PLACE ***************
router.get('/market-place',marketPlace.show_market_place_list);
router.get('/access-marketplace',marketPlace.access_marketplace);

//19-03-20
router.post("/upload_version_request_doc",isUser, myRequestController.uploadVesionDoc)
// ********* MARKET PLACE ***************
router.get('/market-place',marketPlace.show_market_place_list);
router.get('/access-marketplace',marketPlace.access_marketplace);
router.post('/post-address-book',marketPlace.add_address_book);
router.get('/message-market',marketPlace.message_list);
router.post('/submit-market-msg-client',marketPlace.add_msg_for_client);
router.post('/submit-market-msg-verifier',marketPlace.add_msg_for_verifier);

router.post('/get-sub-category-list-mp',marketPlace.get_sub_category_list);
router.post('/get-category-list-mp',marketPlace.get_category_list);
router.post('/get-requested-doc-mp',marketPlace.get_requested_doc);
router.post('/existing-doc-client',marketPlace.get_client_existing_doc);
router.post('/request-doc-mp',marketPlace.request_doc);

//24-03-20
// router.get('/verifier_deshboard',DeshboardController.verifierDeshboard);
// router.get("/request_status_type",isUser, DeshboardController.RequestAcceptReject)
// router.post("/filter_requests",isUser,DeshboardController.filter_requests)

// //25-0320
// router.post("/reject_requests_vd",isUser,DeshboardController.multipalRequestReject)

// //27-0320
// router.get("/payment_history",isUser, paymentController.paymentHistory)
// router.get("/pay_invoice",isUser, paymentController.paymentInvoice)

//24-03-20
router.get('/verifier_deshboard',isUser,DeshboardController.verifierDeshboard);
router.get("/request_status_type",isUser, DeshboardController.RequestAcceptReject)
router.post("/filter_requests",isUser,DeshboardController.filter_requests)

//25-0320
router.post("/reject_requests_vd",isUser,DeshboardController.multipalRequestReject)

//27-0320
router.get("/payment_history",isUser, paymentController.paymentHistory)
router.get("/pay_invoice",isUser, paymentController.paymentInvoice)

//30-0320
router.post("/pay_history_filter",isUser,paymentController.pay_history_filter)

//31-0320
router.get('/cilent_deshboard',isUser,DeshboardController.clientDeshboard);
router.post('/client-deshboard-search-wallet',isUser,DeshboardController.client_deshboard_search);
/*Individual set permissions*/
router.post('/get-indi-category-list',isUser,myReflectController.get_category_indi_list);
router.post('/get-indi-sub-category-list',isUser,myReflectController.get_sub_category_indi_list);
router.post('/get-indi-requested-doc',isUser,myReflectController.get_requested_doc_indi);
router.post('/request-doc-indi',isUser,myReflectController.post_request_doc);


/*******explorer start*************/
router.get('/global-explorer',blockController.global_explorer);
router.post('/search-global',blockController.search_global);

router.get('/personal-explorer',isUser,blockController.personal_explorer);
router.post('/search-personal',isUser,blockController.search_personal);

router.get('/search-personal-from-wallet',isUser,blockController.search_personal_from_wallet);

router.post('/search-transactions-for-download',isUser,shareFileController.search_transactions_for_download);
router.post('/download-certified-pdf',isUser,shareFileController.download_certified_pdf);

router.get('/personal-explorer-ver',isUser,blockController.personal_explorer_ver);
router.post('/search-personal-ver',isUser,blockController.search_personal_ver);
/******* My Reports *******/
router.get('/my-reports-list',isUser,myReportController.my_report_list);
router.get('/archive-reports',isUser,myReportController.archive_list);
router.get('/expoler-child-wallet',isUser,blockController.expoler_child_wallet);

// router.get('/client-report-list',myReportController.client_report_list);
// router.get('/individual-edit-report-complaint_data',myReportController.individual_report_edit);
router.get('/individual-report-edit',isUser,myReportController.individual_report_edit);

// router.post('/create-report',myReportController.create_report);
router.post('/individual-delete-report',isUser,myReportController.individual_delete_report);//done
router.post('/sechdule-individual-report',isUser,myReportController.individual_schedule_report);
router.post('/individual-saveas-report',isUser,myReportController.individual_saveas_report);
router.get('/individual-archive-report',isUser,myReportController.individual_archive_report);
router.get('/individual-rearchive-report',isUser,myReportController.individual_re_archive_report);

router.post('/get-on-edit',isUser,myReportController.get_on_edit);
router.post('/run-complaint',isUser,myReportController.run_complaint);
router.post('/run-client',isUser,myReportController.run_client);
router.post('/run-myreflet',isUser,myReportController.run_myreflet);
router.post('/run-on-boarding',isUser,myReportController.run_on_boarding);
router.post('/run-sub_verifier',isUser,myReportController.run_sub_verifier);

router.post('/save-report',isUser,myReportController.save_report);
router.get('/view-report-list',myReportController.view_report_list);
router.post('/edit-save-report',isUser,myReportController.edit_save_report);
router.post('/export-individual-report',isUser,myReportController.export_individual_report);
router.post('/sechdule-data',isUser,myReportController.sechdule_data);

router.post('/get-complaint-by-time',isUser,myReportController.get_complaint_by_time);
router.post('/get-client-by-time',isUser,myReportController.get_client_by_time);
router.post('/get-reflet-by-time',isUser,myReportController.get_reflet_by_time);
router.post('/get-boarding-by-time',isUser,myReportController.get_boarding_by_time);
router.post('/get-sub_verifier-by-time',isUser,myReportController.get_sub_verifier_by_time);

// Filter of complaint report
router.post('/show-report-by-complain-id',isUser,myReportController.show_report_by_complain_id);
router.post('/show-report-by-status',isUser,myReportController.show_report_by_status);
router.post('/show-report-by-client_code',isUser,myReportController.show_report_by_reflet_code);
router.post('/show-report-by-verifier_code',isUser,myReportController.show_report_by_verifier_code);
router.post('/show-report-by-msg',isUser,myReportController.show_report_by_msg);
// Filter of client report 
router.post('/show-report-by-client-type',isUser,myReportController.show_report_by_client_type);
router.post('/show-report-by-client_name',isUser,myReportController.show_report_by_client_name);
router.post('/show-report-by-client_reflect_code',isUser,myReportController.show_report_by_client_reflect_code);
router.post('/show-report-by-client-status',isUser,myReportController.show_report_by_client_status);
router.post('/show-report-by-client-country',isUser,myReportController.show_report_by_client_country);
// Filter of reflet report 
router.post('/show-report-by-reflet-type',isUser,myReportController.show_report_by_reflet_type);
router.post('/show-report-by-reflet_name',isUser,myReportController.show_report_by_reflet_name);
router.post('/show-report-by-reflet_reflect_code',isUser,myReportController.show_report_by_reflet_reflect_code);
router.post('/show-report-by-reflet-status',isUser,myReportController.show_report_by_reflet_status);
router.post('/show-report-by-reflet-country',isUser,myReportController.show_report_by_reflet_country);
// Filter of reflet report 
router.post('/show-report-by-boarding-request-code',isUser,myReportController.show_report_by_boarding_request_code);
router.post('/show-report-by-boardng-reflect_code',isUser,myReportController.show_report_by_boardng_reflect_code);
router.post('/show-report-by-boarding-client_code',isUser,myReportController.show_report_by_boardng_client_code);
router.post('/show-report-by-boarding-parent',isUser,myReportController.show_report_by_boardng_parent);
router.post('/show-report-by-boarding-status',isUser,myReportController.show_report_by_boardng_status);
router.post('/show-report-by-boarding-sub_cat',isUser,myReportController.show_report_by_boardng_sub_category);
// Filter of Sub-verifier report 
router.post('/show-report-by-sub_verifier-type',isUser,myReportController.show_report_by_sub_verifier_type);
router.post('/show-report-by-sub_verifier-name',isUser,myReportController.show_report_by_sub_verifier_name);
router.post('/show-report-by-sub_verifier-reflect_code',isUser,myReportController.show_report_by_sub_verifier_reflect_code);
router.post('/show-report-by-sub_verifier-status',isUser,myReportController.show_report_by_sub_verifier_status);
router.post('/show-report-by-sub_verifier-country',isUser,myReportController.show_report_by_sub_verifier_country);
router.post('/show-report-by-sub_verifier-email',isUser,myReportController.show_report_by_sub_verifier_email);

router.post('/search-my-report',isUser,myReportController.search_my_report);
router.post('/search-archive-report',isUser,myReportController.search_archive_report);
router.post('/search-schedule-report',isUser,myReportController.search_schedule_report);

// *********** End f my-reports *****************

//01-04-20 
router.get('/sub_client_info',isUser,SubverifierController.cilentInfoViewDetail);
router.get('/sub_client_info_view',isUser,SubverifierController.cilentInfoView);

router.get('/sub_edit_doc',isUser,SubverifierController.editDocument);

router.get('/sub_manage_doc',isUser,SubverifierController.managedefaultdoc);

router.get('/sub_magage_verifier',isUser,SubverifierController.manageSubVerifier);
router.get('/sub_verifier_client',isUser,SubverifierController.subverifierclients);
//030420
router.post('/submit_add_sub_verfier',isUser,SubverifierController.submit_add_sub_verfier);
//060420
router.post('/delete_sub_verifier',isUser,SubverifierController.delete_sub_verifier);
router.get('/delete_indi_sub_veri',isUser,SubverifierController.delete_indi_sub_veri);
router.post('/subverifer_filter',isUser,SubverifierController.subverifer_filter);

router.get('/sub_verfier_invitation',isUser,SubverifierController.sub_verfier_invitation);
router.get('/submit_sub_verfier_invitation',isUser,SubverifierController.submit_sub_verfier_invitation);
//070420
router.get('/sub_verfier_my_client',isUser,SubverifierController.sub_verfier_my_client);
router.post('/submit_add_client_to_sub',isUser,SubverifierController.submit_add_client_to_sub);
//080420
router.get('/delete_indi_sub_veri_client',isUser,SubverifierController.delete_indi_sub_veri_client);
router.post('/delete_mult_client_sub_verifier',isUser,SubverifierController.delete_mult_client_sub_verifier);
router.post('/sub_verifier_client_filter',isUser,SubverifierController.sub_verifier_client_filter);
//09042020
router.get('/delete_sub_ver_client',isUser,SubverifierController.delete_sub_ver_client);
//100420
router.post('/sub_client_list_filter',isUser,SubverifierController.sub_client_list_filter);
//130420
router.post('/subverifer_search_filter',isUser,SubverifierController.subverifer_filter);
router.post('/sub_client_list_search_filter',isUser,SubverifierController.sub_client_list_filter);
//140420
router.get('/message_sub_verifier',isUser,SubverifierController.message_list);
router.post('/submit_message_sub_verifier',isUser,SubverifierController.add_msg);
//150420
router.post('/request_on_boarding_filter',isUser,boardingRequestController.request_on_boarding_filter);

//verfier entity start 0203020
router.get('/verifier_entity',isUser,isUser,verifierMyreflect.Entity)
router.post('/submit_verifier_entity',isUser,verifierMyreflect.submitEntity)
router.post('/verifier_add_new_doc',isUser,verifierMyreflect.AddNewDoc)
router.post('/verifier_request-doc',isUser,verifierMyreflect.request_doc)
router.post('/verifier_request-check-pin',isUser,verifierMyreflect.request_check_pin)
router.post('/verifier_request-doc-individual',isUser,verifierMyreflect.request_doc_individual);
router.post('/verifier_self-attested',isUser,verifierMyreflect.self_attested)
router.get('/verifier_get-verifier-list',isUser,verifierMyreflect.get_verifier_list)
router.get('/verifier-terms-and-condition',isUser,verifierMyreflect.terms_and_condition)
router.post('/submit-terms-and-condition',isUser,verifierMyreflect.submit_terms_and_condition)
router.post('/edit-submt-terms-and-condition',isUser,verifierMyreflect.edit_submit_terms_and_condition)
router.get('/verifier_terms_and_conditions',isUser,verifierMyreflect.verifier_terms_and_conditions)
router.post('/terms-reflect-filter',isUser,verifierMyreflect.terms_reflect_filter)
router.post('/search-verifier-terms',isUser,verifierMyreflect.search_terms_reflect_filter)

router.post('/verfier_get-category-list',isUser,verifierMyreflect.get_category_list);
router.post('/verifier_get-sub-category-list',isUser,verifierMyreflect.get_sub_category_list);
router.post('/verifier_get-requested-doc',isUser,verifierMyreflect.get_requested_doc);

router.get('/verification-reflet-email',myReflectController.reflet_email_verifications)
router.get('/update-representative-email',myReflectController.update_representative_email)


//070520
router.post('/submit_ver_to_add_book',isUser,addressBookController.submit_add_client_to_sub)
router.get('/get-verifier-list-request',isUser,myRequestController.get_verifier_list_request);
router.post('/get-requested-doc-for-request',isUser,myRequestController.get_requested_doc_for_request);
router.post('/get-doc-from-myreflet-for-request',isUser,myRequestController.get_doc_from_myreflet_for_request);
router.post('/show-verifier-by-addbook',isUser,commentController.show_verifier_by_addbook);
// Document list
router.get('/document-list',isUser,DocumentController.document_list)
router.get('/my-doc-license',isUser,DocumentController.document_show)
router.post('/show-reflect-code-data',isUser,DocumentController.show_reflect_code_data)
router.post('/add-new-document',isUser,DocumentController.add_new_document);
router.post('/change_p_name_manage_category',isUser,myreflectVerifierCategory.change_p_name_manage_category)
router.get('/schedule-reports',myReportController.schedule_reports_list);
router.post('/search-user-document',isUser,DocumentController.search_user_document)
router.post('/add-new-document-request',isUser,upload.single('icon'),DocumentController.add_new_document_request)
router.post('/get-doc-by-myreflectis',isUser,DocumentController.get_doc_by_myreflectis)
router.get('/entry-video',isUser,DocumentController.get_entry_upload);
router.post('/entry-video-post',isUser,DocumentController.get_entry_upload_show);


//040620
router.post('/email-check-user',isUser,SubverifierController.email_check_user)
router.post('/share-rep-document',isUser,shareFileController.share_rep_document)
router.post('/share-verifier-document',isUser,shareFileController.share_verifier_document)
router.post('/share-entity-document',isUser,shareFileController.share_entity_document)

//230520
router.post('/assign_request_to_validatore',isUser,validatoreController.assign_request_to_validatore)
router.get('/validator_request',isUser,validatoreController.validator_request)
router.post('/show-validator-doc-filter-request',isUser,validatoreController.show_validator_doc_filter_request)

//270520
router.get('/validator_request_info',isUser,validatoreController.validator_request_info)
router.post('/accept-reject-request',isUser,validatoreController.accept_reject_request)

//010620
router.get('/validatore_dashboard',isUser,validatoreController.validatore_deashboard)

router.get('/success_status',isUser,validatoreController.success_status)
router.get('/validator-wallet-list',isUser,validatoreController.validator_wallet_list)

router.get('/validatore-create-wallet',isUser,validatoreController.create_wallet);
router.get('/validatore-get-create-wallet',isUser,validatoreController.get_create_wallet);
router.get('/validatore-backup-private-key',isUser,validatoreController.backup_private_key);
router.get('/validatore-backup-eth-address',isUser,validatoreController.backup_eth_address);
router.post('/validatore-submit-create-wallet',isUser,validatoreController.submit_create_wallet);

router.get('/import-wallet-validatore',isUser,validatoreController.import_wallet);
// router.get('/wallet-balance',isUser,walletController.wallet_balance);

router.post('/import-wallet-address-validatore',isUser,validatoreController.import_wallet_address);
router.get('/submit-import-wallet-validatore',isUser,validatoreController.submit_import_wallet);
router.post('/accept-reject-request-validator',isUser,validatoreController.accept_request_validator);


router.post('/check-balance-ether',isUser,walletController.check_wallet_balance);
router.get('/manage-verifier-message-list',isUser,verifierListController.manage_verifier_meassge);
router.get('/manage-verifier-message',isUser,verifierListController.verifier_message_list);
router.post('/verfier-type-filter',isUser,verifierListController.ajax_verfier_type_filter);


router.post('/export-individual-document',isUser,shareFileController.export_individual_document);
router.post('/select-country-code',userController.select_country_code_check);
router.get('/side-bar-new-msg-alert',isUser,notificationController.sideBarMsgAlert)

// Digital wallet
router.get('/digital-wallet',isUser,DigitalWallet.show_digital_wallet);
router.post('/submit-create-digital-wallet',isUser,myReflectController.submitCreateDigitalWallet);

// manage -client message

//030720

router.post('/unique_code-check-user',isUser,myreflectVerifierController.unique_code_check_user);

// Manage-message
router.get('/manage-message-list',isUser,ManageClientMessage.manage_client_meassge);
router.get('/manage-client-to-verifier-message',ManageClientMessage.client_view_message_list);
router.post('/submit-client-msg-verifier',ManageClientMessage.add_msg_for_verifier);
router.get('/create-message-request-by-reflectId',ManageClientMessage.create_message_request);
router.get('/manage-client-message-notification-count',ManageClientMessage.manage_client_msg_notifications);
router.get('/manage-verifier-message-notification-count',ManageClientMessage.manage_verifier_msg_notifications);

router.post('/search-msg-data',ManageClientMessage.search_msg_data);
router.post('/search-msg-by-date',ManageClientMessage.search_msg_by_date);
router.post('/search-msg-by-my-verifier',ManageClientMessage.search_msg_by_my_verifier);
router.post('/search-msg-by-my-client',ManageClientMessage.search_msg_by_my_client);


//070720
router.post('/get-add-digital-wallet-list',DigitalWallet.get_add_digital_wallet_list);
router.post('/get_add_digital_wallet_list_at_rep',DigitalWallet.get_add_digital_wallet_list_at_rep);

router.post('/add-new-wallet-digital',isUser,DigitalWallet.add_new_wallet_digital);
router.post('/get-inner-digital-wallet-list',isUser,DigitalWallet.get_inner_digital_wallet_list);
router.post('/check-private-key-for-digital-wallet',isUser,DigitalWallet.check_private_key_of_digital_wallet);
router.post('/check-private-key-for-digital-wallet',isUser,DigitalWallet.check_private_key_of_digital_wallet);
router.post('/add-digitalId-with-wallet',isUser,DigitalWallet.add_digitalId_with_wallet);

router.post('/check-verifier-balance-ether',isUser,walletController.check_wallet_balance_verifier);


router.get('/myreflect-client-all-doc',isUser,shareDocController.receiver_all_client_doc);
router.get('/myreflect-all-client-view-doc',isUser,shareDocController.receiver_all_client_view_doc);
router.get('/all-reflet-list',isUser,shareDocController.all_reflect_list);
router.post('/share-certify-doc',isUser,shareDocController.share_certify_doc);

router.get('/shared-all-client-view-doc',shareDocController.sender_all_client_view_doc);

router.get('/shared-doc-client',isUser,shareDocController.sender_all_client_doc);
router.post('/shared-doc-view',isUser,shareDocController.shared_doc_view);

router.post('/search_client_at_receiver_side',isUser,shareDocController.search_client_at_receiver_side);
router.post('/search_client_at_sender_side',isUser,shareDocController.search_client_at_sender_side);

// IMPORt BtC Wallet
router.get('/BTC-wallets',isUser,walletController.btc_wallet);
router.get('/import-btc-wallet',isUser,walletController.import_btc_wallet);
router.post('/import-btc-wallet-address',isUser,walletController.import_btc_wallet_address);
router.post('/submit-import-btc-wallet-address',isUser,walletController.submit_import_btc_wallet_address);

router.get('/create-btc-wallet',walletController.create_btc_wallet);

router.get('/video_entry',isUser,myReflectController.video_entry);

// router.get('/test-google-form',userController.test_google_form);
// router.get('/v3',userController.test_google_form);



//*******************************************************BTC APPIES*********************************************** */
// const btcAppController        = require("../controllers/apies/btc_apies.js");
// const btcDetailsAppController = require("../controllers/apies/btc_details_apies.js");


// router.get('/btc/signup',btcAppController.signup);
// router.get('/btc/sequrity_question',btcAppController.sequrityQuestion);
// router.get('/btc/terms-and-conditions',btcAppController.termsAndCondition);
// router.post('/btc/terms-and-conditions-submit',btcAppController.termsAndConditionSubmit);
// router.post('/btc/submit_register',btcAppController.submit_register);
// router.post('/btc/submitOtp',btcAppController.submitOtp);
// router.post('/btc/submitQuestionAns',btcAppController.submitQuestionAns);
// router.post('/btc/submitSetPin',btcAppController.submitSetPin);
// router.post('/btc/resend_otp',btcAppController.resendOtp);
// router.post('/btc/check_user_steps',btcAppController.checkUserSteps);
// router.post('/btc/submit_login',btcAppController.submitLogin);

// router.post('/btc/forgetPassword',btcAppController.submitForgetPassword);

// router.post("/btc/otp_veri_aft_login_check_ip", btcAppController.otpAfterLogin) //
// router.post("/btc/submit-otp-of-login", btcAppController.submitOtpAfterLogin)

// router.post('/btc/set_pin_aft_lgn_submit',btcAppController.submitSetPinAfterLogin)

// router.post('/btc/import-btc-wallet-address',btcAppController.import_btc_wallet_address);
// // router.post('/btc/submit-import-btc-wallet-address',btcAppController.submit_import_btc_wallet_address);

// router.post('/btc/documents_list',btcAppController.documents);
// router.post('/btc/import-btc-submit-private-key',btcAppController.import_btc_submit_private_key);
// router.post('/btc/submit-btc-pub-pri-key',btcAppController.submit_btc_pub_pri_key);
// router.post('/btc/btc-wallet-lists',btcAppController.btc_wallet_lists);

// router.post('/btc/share-certify-doc',btcAppController.share_certify_doc);

// router.post('/btc/shared-doc-client',btcAppController.doc_sender_all_client);
// router.post('/btc/shared-all-client-view-doc',btcAppController.sender_client_doc);
// router.post('/btc/shared-doc-view',btcAppController.shared_doc_view);

// router.post('/btc/receivedoc-client-list',btcAppController.receiver_all_client_doc);
// router.post('/btc/receive-doc-list',btcAppController.receive_doc_list);



// //btc details api routes
// router.post('/btc/balance',btcDetailsAppController.btcBalance);
// router.post('/btc/transfer',btcDetailsAppController.btcTransfer);
// router.post('/btc/history',btcDetailsAppController.btcHistory);


//testing
router.get('/test',userController.testSection);
router.get('/save-password',userController.checkEmailVerification,userController.savePassword);
//router.get('/save-password',userController.savePassword);
router.post('/password-save',userController.savePasswordSubmit);
router.get('/re-enter-password',userController.checkEmailVerification,userController.getReenterPassword);
router.post('/password-match',userController.reEnterPassword);
router.post('/get_client_salt',userController.getClientSalt);
router.post('/save-password/get_encrypt_pass',userController.getEncryptPass);
router.post('/get_decrypt_pass',userController.getDecryptPass);
router.post('/re-enter-password/get_decrypt_pass2',userController.getDecryptPass2);

//trans history individual wallet
router.get('/get_trans_history',isUser,DeshboardController.getTransactionHistoryForIndividual);
router.post('/submit_natural_form',isUser,myReflectController.genratePublicKey);
router.post('/share_entity',isUser,myReflectController.shareEntity);
router.post('/save-entity-password',isUser,myReflectController.saveEntityPassword);
router.post('/validate-entity-pass',isUser,myReflectController.checkEntityPassword);
router.get('/create-myrefletid',isUser,myReflectController.getRefletForm);
router.get('/backup-private-key',isUser,walletController.backup_private_key);
router.post('/submit-entity',isUser,myReflectController.generatePublicKeyForEntity);
router.post('/submit-natural',isUser,myReflectController.genratePublicKey);
router.get('/backup-eth-address',isUser,walletController.backup_eth_address);
router.post('/generate_pvt_key',isUser,myReflectController.generatePvtKey);
router.get('/get-linked-wallets',isUser,myReflectController.getClickingOverEntityPage);
router.post('/block-unblock',isUser,myReflectController.blockAndUnblock);
router.get('/reflet-ids',isUser,DeshboardController.showRefletForLink);
router.get('/get-unlinked-wallets',isUser,DeshboardController.getUnlinkedWallets);
router.post('/submit-linked-wallets',isUser,DeshboardController.linkingWallet);
router.get('/all-wallets',isUser,DeshboardController.getAllWallets);
router.get('/create-wallets',isUser,DeshboardController.getCreateWallets);
router.get('/digital-wallet-selection',isUser,DeshboardController.getDigitlWalletSelection);
router.get('/crypto-wallet-selection',isUser,DeshboardController.getCryptoWalletSelection);
router.get('/import-wallet-selection',isUser,DeshboardController.getImportWalletSelection);
router.get('/digital-public-key',isUser, DeshboardController.generatePublicKeyForDigitalWallet);
router.post('/digital-pvt-key',isUser,DeshboardController.generatePvtKeyForDigitalWallet);
router.get('/wallet-created-successfully',isUser,DeshboardController.getSuccessdigital);
router.get('/get-public-key',isUser,DeshboardController.getPublickeyPage);

//generate wallet id for crypto wallets
router.get('/create-crypto',isUser,DeshboardController.generateWalletIDForCrypto);
router.post('/generate-pvt-key-crypto',isUser,DeshboardController.getPvtKeyForCryptoPage);
router.get('/import-crypto',isUser,DeshboardController.getImportCryptoPage);
router.post('/import-crypto-wallet',isUser,DeshboardController.importCryptoWallet);
router.post('/crypto-transaction-fee',isUser,DeshboardController.cryptoTransactionFee);
router.post('/send-crypto',isUser,DeshboardController.sendCrypto);
router.post('/check-pvt-key',isUser,DeshboardController.validatePvt);
router.get('/all-docs-folder',isUser,DocumentController.getAllDocsFolder);
router.post('/create-folder',isUser,DocumentController.createFolder);
router.get('/all-docs-in-folder',isUser,DocumentController.getAllDocsFromFolder);
router.post('/show-doc',isUser,DocumentController.showDocuments);
router.post('/delete-doc',isUser,DocumentController.deleteDocs);
router.post('/upload-doc',isUser,DocumentController.uploadDocument);
router.post('/send-to-verifier',isUser,DocumentController.sendDocToVerifier);
router.post('/share-doc',isUser,DocumentController.shareDocuments);
router.post('/download-doc',isUser,DocumentController.downloadDoc);
router.post('/view-receipt',isUser,DeshboardController.getTransactionRecieptForWallet);
router.get('/doc-history',isUser,DocumentController.getSharedDocumentsHistory);
module.exports = router; 
