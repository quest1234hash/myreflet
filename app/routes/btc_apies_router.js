//*******************************************************BTC APPIES*********************************************** */
const express                  = require('express');
const router                   = express.Router();
const btcAppController         = require("../controllers/apies/btc_apies.js");
const btcAppNotificationController         = require("../controllers/apies/apies_notification.js");

const btcDetailsAppController  = require("../controllers/apies/btc_details_apies.js");
const { userAuth,
	authenticateToken
 }                             = require("../auth/user_auth")


router.get('/signup',btcAppController.signup);
router.get('/sequrity_question',btcAppController.sequrityQuestion);
router.get('/terms-and-conditions',btcAppController.termsAndCondition);
router.post('/terms-and-conditions-submit',btcAppController.termsAndConditionSubmit);
router.post('/submit_register',btcAppController.submit_register);
router.post('/submitOtp',btcAppController.submitOtp);
router.post('/submitQuestionAns',btcAppController.submitQuestionAns);
router.post('/submitSetPin',btcAppController.submitSetPin);
router.post('/resend_otp',btcAppController.resendOtp);
router.post('/check_user_steps',btcAppController.checkUserSteps);


//router.post('/forgetPassword',btcAppController.submitForgetPassword);
router.post('/forgetPassword',btcAppController.forgetPassword);
//router.post("/otp_veri_aft_login_check_ip",authenticateToken, btcAppController.otpAfterLogin) //
router.post("/otp_veri_aft_login_check_ip",btcAppController.otpAfterLogin) 
//router.post("/submit-otp-of-login",authenticateToken, btcAppController.submitOtpAfterLogin)
router.post("/submit-otp-of-login",btcAppController.submitOtpAfterLogin)
//router.post('/set_pin_aft_lgn_submit',authenticateToken,btcAppController.submitSetPinAfterLogin)
//pin varification
router.post('/varify_pin',btcAppController.submitSetPinAfterLogin)
router.post('/import-btc-wallet-address',authenticateToken,btcAppController.import_btc_wallet_address);
// router.post('/btc/submit-import-btc-wallet-address',btcAppController.submit_import_btc_wallet_address);

//router.post('/documents_list',authenticateToken,btcAppController.documents);
router.post('/documents_list',btcAppController.documents);
router.post('/import-btc-submit-private-key',authenticateToken,btcAppController.import_btc_submit_private_key);
router.post('/submit-btc-pub-pri-key',authenticateToken,btcAppController.submit_btc_pub_pri_key);
router.post('/btc-wallet-lists',authenticateToken,btcAppController.btc_wallet_lists);

router.post('/share-certify-doc',authenticateToken,btcAppController.share_certify_doc);

router.post('/shared-doc-client',authenticateToken,btcAppController.doc_sender_all_client);
router.post('/shared-all-client-view-doc',authenticateToken,btcAppController.sender_client_doc);
router.post('/shared-doc-view',authenticateToken,btcAppController.shared_doc_view);

router.post('/receivedoc-client-list',authenticateToken,btcAppController.receiver_all_client_doc);
router.post('/receive-doc-list',authenticateToken,btcAppController.receive_doc_list);

// router.post('/firebase/notification',btcAppNotificationController.apies_notification);


//btc details api routes
router.post('/balance',btcDetailsAppController.btcBalance);
router.post('/transfer',authenticateToken,btcDetailsAppController.btcTransfer);
//router.post('/transfer',btcDetailsAppController.btcTransfer);
router.post('/history',authenticateToken,btcDetailsAppController.btcHistory);

//by naveen
//by naveen
//router.post('/varifyEmail',btcAppController.varifyEmail);
router.post('/login',btcAppController.loginUser);
//otp after login and forgot password 
router.post('/otp-after-login',btcAppController.otpAfterLogin);
//get user's details
router.get('/getProfile/:user_id',btcAppController.getUserProfile);
router.post('/upload_profile_pic',btcAppController.upload,btcAppController.updateProfileImg);
router.get('/getprofileimage/:name',btcAppController.getImg);
router.get('/get_country_code',btcAppController.getCountryCode);
router.get('/country_list',btcAppController.getCountry);
router.post('/get_cities', btcAppController.getCity);
//saved password from client side
router.post('/save-password',btcAppController.savePassword);
//get client salt
router.post('/get_client_salt',btcAppController.getClientSalt);
router.post('/validate_pass_for_change_password',btcAppController.validateOldPassword);
router.post('/get_public_and_segment',btcAppController.generatePublicKey);
router.post('/create_pvt_key',btcAppController.createPrivateKey);
//generate public and segment for entity
router.post('/publickey_for_entity',btcAppController.generatePublicKeyForEntity);
router.get('/get_myrefletid/:user_id',btcAppController.getAllMyrefletId);
router.post('/share_entity',btcAppController.shareEntity);
router.post('/get_shared_entity',btcAppController.getEntityByEmployee);
router.post('/set_password_for_entity',btcAppController.savePasswordForEntity);
router.post('/verify_entity_pass',btcAppController.verifyEntityPass);
router.post('/entity_shared_employee',btcAppController.getSharedEmpDet);
router.post('/block_employee',btcAppController.blockEmployeFromEntity);
router.post('/get_notifications',btcAppController.getNotifications);
router.post('/delete_notification',btcAppController.deleteNotification);
router.post('/public_key_digital',btcAppController.generatePublicKeyDigitalWallet);
router.post('/pvt_key_digital',btcAppController.generatePvtKeyForDigitalWallet);
router.post('/all_digital_wallets',btcAppController.getAllDigitalWallets);
router.post('/linking_with_wallet',btcAppController.linkingWallet);
router.post('/all_unlink_wallets',btcAppController.getUnlinkedWallet);
router.post('/get_linked_wallet_by_refletid',btcAppController.getAllWalletLinkWithReflet);
router.post('/create_btc_wallet',btcAppController.createBtcWallet);
router.post('/dashboard_data',btcAppController.getRecentTenCryptoWallets);
router.post('/get_crypto_wallets',btcAppController.getCryptoWallets);
router.post('/create_eth_wallet',btcAppController.createEthereumWallet);
router.post('/import_eth',btcAppController.importEthereum);
router.post('/import_btc',btcAppController.importBtcWallet);
//document ......................
router.post('/create_folder',btcAppController.createFolder);
router.post('/get_folder_list',btcAppController.getFolderList);
router.post('/upload_doc',btcAppController.uploadDocument);
router.post('/get_folder_docs',btcAppController.getFolderDocuments);
router.post('/docs_deletion',btcAppController.deleteDocs);
router.post('/upload_kyc',btcAppController.uploadKyc);
router.get('/get_doc/:uploaded_id',btcAppController.showDocuments);
router.get('/doc_type_list',btcAppController.getDocTypeList);
router.post('/share_doc',btcAppController.shareDocuments);
router.post('/doc_shared_history',btcAppController.getSharedDocumentsHistory);
router.get('/all_verifier_list',btcAppController.getVerifierList);
router.post('/send_doc_to_verify',btcAppController.sendDocToVerifier);


//crypto transaction
router.post('/eth_transaction_fee',btcAppController.getTransactionFee);
router.post('/eth_transaction',btcAppController.sendEth);
router.post('/trans_per_wallet',btcAppController.getEachWalletTransactionHistory);
router.post('/get_trans_receipt',btcAppController.getTransactionRecieptForWallet);
router.post('/btc_transaction_fee',btcAppController.btcTransactionFees);
router.post('/btc_transaction',btcAppController.sendBtc);
module.exports = router; 
