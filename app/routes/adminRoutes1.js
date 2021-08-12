const express = require('express');
const router = express.Router();
const adminController = require('../controllers/front/admin');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, './app/uploads/documents')
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
router.get('/log-out',adminController.log_out);


// router.get('/',adminController.signIn);

router.get('/my-profile',auth,adminController.my_profile);
router.post('/admin-profile-post',adminController.profile_post);
router.post('/admin-change-password-post',adminController.change_password_post);

router.get('/admin-change-password',auth,adminController.change_password);
router.get('/admin-dashboard',auth,adminController.dashboard);
router.get('/client-list',auth,adminController.client_list);
router.get('/verifier-list',auth,adminController.verifier_list);
router.get('/verifier_on_boarding',auth,adminController.verifier_on_boarding);



module.exports = router;