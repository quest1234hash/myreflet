const router = require("express").Router()
const loginController = require("../controllers/add_on_appies/user.js")

router.post("/login",loginController.login)
router.post("/otp",loginController.otp)
router.post("/continues-server-connection",loginController.continue_connection)


module.exports = router;