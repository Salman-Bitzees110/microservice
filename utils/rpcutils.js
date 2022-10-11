// var request = require("request");
// const reqURL=`https://eth.getblock.io/goerli/?api_key=f95df379-c65d-4cc2-90ea-9ca85a3a2350`;

//   module.exports.getData=(reqDataString, req, res)=>{
//     const headers = {
//         "content-type": "application/json"
//       };
//         var options = {
//         url: reqURL,
//         method: "POST",
//         headers: headers,
//         body: reqDataString
//       };
      
//       callback = (error, response, body) => {
//         if (response) {
//           const data = JSON.parse(body);
//           res.send(data);
//         }
//       };
//       request(options, callback);
    
//   }