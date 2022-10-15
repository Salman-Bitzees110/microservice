const express = require('express');
const router = express.Router();
const mysqlConnection = require("../config/connectdb");
const UserController = require( '../controllers/userController');
const middleware = require('../middlewares/auth-middleware')


router.get('/GetAllUsers', (req, res)=>{
    mysqlConnection.query("SELECT * from user", (err, rows, fields)=>{
        if(!err)
        {
            res.send(rows);
        }
        else
        {
            console.log(err);
        }
    })
})


 
 router.post('/verifyAndGenerateKeys',UserController.userController)
 router.post('/login',middleware.Login)
 router.post("/getbalance",middleware.Authorization, UserController.getbalance)
router.post('/transfer',middleware.Authorization, UserController.TransferBalance)

 module.exports = router;
