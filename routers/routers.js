const express = require("express")
const router= express.Router();


const {createBook,approveOrRejectBook} = require("../controllers/createBook");
const {getApprovedBooks} = require("../controllers/getBook");

const {deleteBook} =  require("../controllers/deleteBook");
const {signup,sendotp,login,changePassword} = require("../controllers/Auth")
const {resetPasswordToken,resetPassword} = require("../controllers/ResetPassword")
const { auth } = require("../middlewares/auth")

  

router.post("/createBook",createBook);
router.post("/approveOrRejectBook/:id",approveOrRejectBook);
router.get("/getApprovedBooks",getApprovedBooks);
router.delete("/deleteBook/:id",deleteBook);


router.post("/signup", signup)
router.post("/sendotp", sendotp)
router.post("/login", login)
router.post("/changepassword",auth,changePassword)
router.post("/reset-password-token", resetPasswordToken)
router.post("/reset-password", resetPassword)



router.get("/", (req,res)=>{
    console.log("welcome to coding")
    res.json({
        status:true,
        message: " Welcome to node js APIs "
    })
});

module.exports = router;