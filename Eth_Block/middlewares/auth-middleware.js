const jwt = require('jsonwebtoken')
const db = require('../Dao/user')
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotallySecretKey');

exports.Login = async function (req, res) {
    try {
        let data = req.body;
        const { email, publickey } = data;
         if(!email || !publickey) return res.status(400).send({ status_code: 400, msg: "please enter email & publickey!!" })
        const DBresult = await db.getEmail(email)
        const Publickey = DBresult.map(a => a.publickey)
        const decryptedString = cryptr.decrypt(Publickey);

        console.log(Publickey)
        if (!DBresult) return res.status(400).send({ status_code: 400, msg: "Invalid Email-id !!" })      
        if (publickey!==decryptedString) return res.status(400).send({ status_code: 400, msg: "Invalid Publickey!!" })      


        // After validation of user creating a toke
        let token = jwt.sign({
           email:email ,publickey:Publickey
        },
           process.env.JWT_SECRET_KEY
        );
        res.send({ status: true, msg: "login Successful!!", data:token });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
};



// User Validation through user's JWT and Pulbickey
exports.Authorization = async (Request, Response,next) => {
    try{
    const token = Request.headers["token"]
 
    if (!token) return Response.status(403).send({ status: false, message: "Authentication failed!! Please enter Token" })
  
    let decodedToken = jwt.verify(token, `${process.env.JWT_SECRET_KEY}`)
    if (!decodedToken) return Response.status(400).send({ status: false, message: "Token is invalid" });
  
     next()
  }catch(err){
    return Response.status(500).send({ status_code: 500, msg: err.message })
  }
  }