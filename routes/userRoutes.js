const express = require('express');
const router = express.Router();
const mysqlConnection = require("../config/connectdb");
const UserController = require( '../controllers/userController');
const middleware = require('../middlewares/auth-middleware')
const transferFund = require('../controllers/AccountTransaction')

// Public Routes
// router.post('/register', UserController.userType)

router.get('/', (req, res)=>{
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

// router.post("/createUser", (req, res) => {
//     let qb = req.body;
//     const sql =
//    "INSERT INTO user (id,utype,email,privatekey,publickey)  VALUES ()"
//     mysqlConnection.query(
//       sql,qb,
//       (err, results, fields) => {
//         if (!err) {
//           console.log({msg:"userAdded",data: results})
//         } else {
//           console.log(err);
//         }
//       }
//     );
//   });


router.post('/CreateUsers',function(req,res){
    var id = req.body.id;
    var utype = req.body.utype;
    var email = req.body.email;
    var privatekey = req.body.privatekey;
    var publickey = req.body.publickey
    var data = {
    "error":1,
    "user":""
    };
    if(!!id && !!utype && !!email && !!privatekey && !!publickey){
     mysqlConnection.query("INSERT INTO user VALUES(?,?,?,?,?)",[id,utype,email,privatekey,publickey],function(err, rows, fields){
    if(!!err){
    data["user"] = console.log(err);
    }else{
    data["error"] = 0;
    data["user"] = "user Added Successfully";
    }
    res.json(data);
    });
    }else{
    data["user"] = "Please provide all required data (i.e : id, email, utype)";
    res.json(data);
    }
    });
 

 router.post('/verifyAndGenerateKeys',UserController.userController)
 router.post('/userVerification',UserController.Authentication)
 router.get("/getbalance", UserController.getbalance)
router.get('/transfer',transferFund.TransferBalance)

 module.exports = router;
