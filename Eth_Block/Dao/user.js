const connectDB = require('../config/connectdb')



module.exports.getEmail = (email) => {
    return new Promise((resolved, reject) => {
        let qryString = "SELECT * FROM `user` WHERE `email`=?"
        connectDB.query(qryString, [email], (err, result) => {
            if (err) throw err
            resolved(result)
            console.log(result)
        });
    });
};


module.exports.StoreNewUserData = (id, utype, email, PRIVATEencryptedString, PUBLICencryptedString) => {
    return new Promise((resolved, reject) => {
        let qryString = "INSERT INTO user(id,utype, email,privatekey , publickey) VALUES(?,?,?,?,?)"
        connectDB.query(qryString, [id,utype, email, PRIVATEencryptedString, PUBLICencryptedString], (err, result) => {
            if (err) throw err
            resolved(result)
        });
    });
};


module.exports.StoreUserTxnDetails = (email, id, TransactionHash) => {
    return new Promise((resolved, reject) => {
        let qryString = "INSERT INTO transaction_data(email, id, transaction_hash) VALUES(?,?,?)"
        connectDB.query(qryString, [email, id, TransactionHash], (err, result) => {
            if (err) throw err
            resolved(result)
        });
    });
};
