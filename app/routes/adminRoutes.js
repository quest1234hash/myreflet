const express = require('express');
const router = express.Router();
const adminController = require('../controllers/front/admin');
const validatoreController = require('../controllers/front/validatore');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, './app/uploads/addMPIcon')
    },
    filename: function (req, file, cb) {
    cb(null,file.fieldname + "_" + Date.now() + "_" + file.originalname)
    }
})

const upload = multer({ storage: storage }) 

const auth = (req, res, next) => {
        
    if(!req.session.islogin){
        
        res.redirect('/admin-login')
    }
    else {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

        next()
    }
}
// router.get('/',userController.index);

router.get('/admin-login',adminController.signIn);
router.post('/admin-login-post',adminController.login_post);
 
router.get('/admin-forgot-password',adminController.forgot_password);
router.post('/admin-forgot-post',adminController.submitForgetPassword);
router.get('/continue',adminController.continue);
router.get('/admin-reset-password',adminController.reset_password);
router.post('/admin-reset-post',adminController.reset_post);


router.get('/log-out',adminController.log_out);
 
 
// router.get('/',adminController.signIn);

router.get('/my-profile',auth,adminController.my_profile);

router.post('/admin-profile-post',adminController.profile_post);
router.post('/admin-change-password-post',adminController.change_password_post);

router.get('/admin-change-password',auth,adminController.change_password);
router.get('/admin-dashboard',auth,adminController.dashboard);

router.get('/client-list',auth,adminController.client_list_get);
// router.get('/client-list-post',auth,adminController.client_list_post);

router.get('/verifier_on_boarding',auth,adminController.verifier_on_boarding);

// ****************** PLAN LIST ************************
router.get('/plan-list',auth,adminController.plan_list);
router.post('/add-plan',adminController.add_plan);
router.post('/edit-plan',adminController.edit_plan);

router.get('/delete-plan/:id',adminController.delete_plan);
router.post('/change-status-plan',adminController.change_plan);

// ****************** Question LIST ************************

router.get('/security-questions-list',auth,adminController.security_list);
router.post('/add-question',adminController.add_question);
router.post('/edit-question',adminController.edit_question);

router.get('/delete-question/:id',adminController.delete_question);
router.post('/change-status-question',adminController.change_question);

// ****************** Document LIST ************************

router.get('/document-master-list',auth,adminController.document_list);
router.post('/add-document-type',adminController.add_document);
router.post('/edit-document',adminController.edit_document); 

router.get('/delete-document/:id',adminController.delete_document);
router.post('/change-status-document',adminController.change_document);
router.post('/search-document',adminController.search_document);

// ****************** VERIFIER CATEGORY LIST ************************

router.get('/verifier-category-list',auth,adminController.category_list);
router.post('/add-category-type',adminController.add_category);
router.post('/edit-category',adminController.edit_category);

router.get('/delete-category/:id',adminController.delete_category);
router.post('/change-status-category',adminController.change_category_status);

// ****************** PLAN FEATURES LIST ************************

router.get('/plan-features-list',auth,adminController.plan_features_list);
router.post('/add-plan-feature',adminController.add_plan_feature);
router.post('/edit-plan-feature',adminController.edit_plan_feature);

router.get('/delete-plan-feature/:id',adminController.delete_plan_feature);
router.post('/change-status-plan-feature',adminController.change_plan_feature);


router.get('/plan-features-rel-list',auth,adminController.plan_feature_rel);
router.post('/change-status-plan-feature-rel',adminController.change_status_plan_feature_rel);


// ****************** USER LIST ************************
router.get('/user-list',auth,adminController.user_list);
router.post('/change-status-user',auth,adminController.change_status_user);
router.post('/search-admin-user',auth,adminController.search_user);

// ****************** Country LIST ************************
router.get('/country-list',auth,adminController.country_list);
router.post('/change-status-country',auth,adminController.change_status_country);
router.post('/search-country',auth,adminController.search_country);
router.post('/search-admin-complaint',auth,adminController.search_complaint);
router.post('/search-admin-allot-reflect',auth,adminController.search_admin_allot_reflect);
router.post('/search-admin-allot-reflect-status',auth,adminController.search_admin_allot_reflect_status);

router.post('/search-admin-category',auth,adminController.search_admin_category);
router.post('/search-admin-category-status',auth,adminController.search_admin_category_status);


// ****************** VERIFIER LIST ************************
router.get('/verifier-list',auth,adminController.verifier_list);
router.post('/show-verifier-by-status',auth,adminController.show_verifier_by_status);
router.get('/delete-verifier/:id',adminController.delete_verifier);
router.get('/block-verifier/:id',adminController.block_verifier);
router.get('/manage-verifier',auth,adminController.manage_verifier);
// router.post('/manage-verifier-by-reflectid',adminController.manage_verifier_by_reflectid);
router.get('/mange-verifier-by-reflectid',adminController.manage_verifier_by_reflectid_new);
router.get('/reject-request',adminController.block_client);
router.post('/reject-request-verifier',auth,adminController.reject_verifier_document);
router.get('/approve-request-verifier',auth,adminController.approve_verifier_document);
router.post('/search-verifier',auth,adminController.search_verifier);

// ****************** CLIENT LIST ************************
router.get('/client-list',auth,adminController.client_list_get);
router.post('/show-client-by-status',auth,adminController.show_client_by_status);
router.get('/delete-client/:id',adminController.delete_client);
router.get('/block-client/:id',adminController.block_client);

router.get('/mange-client-by-reflectid',auth,adminController.manage_client_by_reflectid_new);

router.get('/manage-client',auth,adminController.manage_client);
router.post('/reject-request-client',auth,adminController.search_client);
router.get('/approve-request-client',auth,adminController.approve_client_document);
router.post('/search-client',auth,adminController.search_client);


// ****************** COMPLAINT LIST ************************
router.get('/admin-complaint-list',auth,adminController.complaint_list);

// ****************** MARKET PLACE LIST ************************
router.get('/market-place-list',auth,adminController.market_place);
router.post('/add-market-place',upload.single('icon'),adminController.add_market_place)
router.post('/edit-market-place',upload.single('icon'),adminController.edit_market_place);
router.get('/delete-market-place',auth,adminController.delete_market_place);
router.post('/change-status-market-place',auth,adminController.change_status_market_place);


// ****************** ALLOT MARKET PLACE LIST ************************
router.get('/allot-reflect-list',auth,adminController.allot_market_place);
router.post('/post-allot-reflect-list',auth,adminController.post_allot_market_place);
router.post('/change-status-allot-market-place',auth,adminController.change_status_allot_market_place);

// ****************** REPORTS LIST ************************
router.get('/master-report',auth,adminController.report_list);
router.post('/add-report',auth,adminController.add_report)
router.post('/edit-report',auth,adminController.edit_report);
router.get('/delete-report',auth,adminController.delete_report);
router.post('/change-status-report',auth,adminController.change_status_report);
router.post('/change-status-report-user_type',auth,adminController.change_status_report_user_type);


//140520
router.get('/admin-notification-list',auth,adminController.admin_notification_list);
router.get('/admin_header_notifications',auth,adminController.admin_header_notifications);
//11/05/20
router.get('/delete_admin_not',auth,adminController.delete_admin_not);

//130520
router.post('/active_inactive_features',auth,adminController.active_inactive_features);
// ****************** ACCREDATION-LEVEL LIST ************************
router.get('/basic-accredation-level',auth,adminController.basic_accredation_list);
router.get('/verifier-accredation-level',auth,adminController.verifier_accredation_list);
router.get('/validator-accredation-level',auth,adminController.validator_accredation_list);

router.post('/post-allot-accreation-features-list',auth,adminController.add_accredation)
router.post('/get-features-list',auth,adminController.get_features_list)

router.get('/accredatiation-level-list',auth,adminController.accredatiation_level_list)
router.post('/submit_acc_to_user',auth,adminController.submit_acc_to_user)
router.get('/view_acc_level',auth,adminController.view_acc_level)
router.post('/change_status_acc_level',auth,adminController.change_status_acc_level)
router.post('/indi_submit_acc_to_user',auth,adminController.submit_acc_to_user_indi)
router.post('/submit_acc_feature_rel',auth,adminController.submit_acc_feature_rel)

router.get('/manage-durations',auth,adminController.manage_durations);
router.post('/update-manage-durations',auth,adminController.update_manage_durations)
router.get('/all-uploaded-document',auth,adminController.all_uploaded_document)
router.post('/search-all-uploaded-document',auth,adminController.search_all_uploaded_document)


//200520
router.get('/validatore_signup',auth,validatoreController.validatore_signup);
router.post('/submit_validatore_registration',auth,validatoreController.submit_validatore_registration);
router.get('/val_invitation',validatoreController.val_invitation);
router.get('/submit_val_invitation',validatoreController.submit_val_invitation);
router.get('/validatores',auth,validatoreController.validatores);
router.post('/submit_doc_to_validatore',auth,validatoreController.submit_doc_to_validatore);
router.get('/validatore_doc_view',auth,validatoreController.validatore_doc_view);
router.post('/active_inactive_validatore_doc',auth,validatoreController.active_inactive_validatore_doc);
// request document
router.get('/all-document-request-list',auth,adminController.all_document_request_list);
router.post('/search-request-document',auth,adminController.search_request_document);
router.get('/document-request-action',auth,adminController.document_request_action);
router.get('/delete-document-request',auth,adminController.delete_document_request);

//24/06/20
router.get('/sub-verifier-list',auth,adminController.SubverifierList);
router.get('/view-verifier-by-subverifier',auth,adminController.VerifierBySubVerifier);
router.post('/search-sub-verifier',auth,adminController.Search_SubverifierList)
router.get('/view-wallet-by-userid',auth,adminController.walletList);
router.post('/search-wallet-by-userid',auth,adminController.searchWalletList);
router.post('/search-verifier-by-sub-verifier',auth,adminController.search_verifier_by_subverifier);
router.post('/user-list-filter',auth,adminController.filter_user_list);

// General pages
router.get('/about-us',auth,adminController.about_us);
router.post('/edit-about-us',auth,adminController.edit_about_us);

router.get('/create-terms-and-conditions',auth,adminController.terms_and_conditions);
router.post('/edit-terms-and-conditions',auth,adminController.edit_terms_and_conditions);

router.get('/connect-with-us',auth,adminController.connect_with_us);
router.post('/edit-connect-with-us',auth,adminController.edit_connect_with_us);

router.get('/get-in-touch-list',auth,adminController.get_in_touch_list);
router.get('/delete-any-contact',auth,adminController.delete_any_contact);
router.post('/respond-to-any-contact',auth,adminController.respond_to_any_contact);
router.post('/search-any-contact',auth,adminController.search_any_contact);

router.get('/why-choose-us',auth,adminController.why_choose_us);
router.post('/edit-choose-us',upload.single('icon'),adminController.edit_why_choose_us)
router.post('/add-choose-us',upload.single('icon'),adminController.add_why_choose_us)

router.get('/benefits',auth,adminController.benefits);
router.post('/edit-benefits',upload.single('benefit_icon'),adminController.edit_benefits)
router.post('/add-benefits',upload.single('benefit_icon'),adminController.add_benefits)

router.get('/front-feature',auth,adminController.front_feature);
router.post('/edit-front-feature',upload.single('feature_icon'),adminController.edit_front_feature)
router.post('/add-front-feature',upload.single('feature_icon'),adminController.add_front_feature)
router.post('/allot-front-feature',auth,adminController.allot_front_feature);
router.post('/edit-allot-front-feature',auth,adminController.edit_allot_front_feature);

router.get('/our-key-pillar-list',auth,adminController.our_key_pillar_list);
router.post('/edit-our-key-pillar-list',auth,adminController.edit_our_key_pillar_list);

// router.get('/sub-verifier-list',auth,adminController.SubverifierList);
// router.get('/sub-verifier-list',auth,adminController.SubverifierList);

// REPORtS 14 juy 20
router.get('/entity-client-verifier-report',auth,adminController.entity_client_verifier_report);
router.get('/entity-client-verifier-report-view',auth,adminController.entity_client_verifier_report_view);
router.get('/entity-client-verifier-report-view-document',auth,adminController.entity_client_verifier_report_view_document);
router.post('/search-entity',auth,adminController.search_entity)
// 20 july
router.get('/view-levels-by-userid',auth,adminController.view_levels_by_userid);
router.get('/view-reflet-by-userid',auth,adminController.view_reflet_by_userid);
router.post('/search-reflet',auth,adminController.search_reflet)
router.post('/search-document-type',auth,adminController.search_document_type)
router.post('/search-document-status',auth,adminController.search_document_status)

// allot levels
// allot levels
router.get('/master-levels',auth,adminController.master_levels);
router.post('/add-master-levels',auth,adminController.add_master_levels)
router.get('/delete-master-levels',auth,adminController.delete_master_levels)
router.post('/edit-master-levels',auth,adminController.edit_master_levels)
router.post('/change-status-level',auth,adminController.change_master_levels)
router.post('/search-master-levels',auth,adminController.search_master_levels)
router.post('/search-master-levels-status',auth,adminController.search_master_levels_status)


router.post('/search-master-report',auth,adminController.search_master_report);
router.post('/search-security-questions',auth,adminController.search_security_question);
router.post('/search-master-plan',auth,adminController.search_master_plan);
router.post('/search-master-plan-status',auth,adminController.search_master_plan_status);

router.post('/search-feature-plan',auth,adminController.search_master_plan_feature);
router.post('/search-feature-plan-rel',auth,adminController.search_master_plan_feature_rel);
router.post('/search-market-place',auth,adminController.search_market_place);
router.post('/search-market-place-status',auth,adminController.search_market_place_status);


module.exports = router;

