// jshint esversion:9
const express = require('express');
const bodyParser = require('body-parser');
const session =require('express-session');
const mongoose = require('mongoose');
const axios = require("axios")
const moment = require("moment")
const flash = require('connect-flash');
const app = express();

const writersUrls = require('./routes/writters');

//middelwares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static("public/"));//start of force https
// app.enable('trust proxy');

// // Add a handler to inspect the req.secure flag (see 
// // http://expressjs.com/api#req.secure). This allows us 
// // to know whether the request was via http or https.
// app.use (function (req, res, next) {
//         if (req.secure) {
//                 // request was via https, so do no special handling
//                 next();
//         } else {
//                 // request was via http, so redirect to https
//                 res.redirect('https://' + req.headers.host + req.url);
//         }
// });
// //end of force https

app.use(session({
  secret:'this is our litle secret',
  resave:true,
  saveUninitialized: false
})
);
app.use(flash());

// routes
app.use(writersUrls);


const accessToken = (req,res,next)=>{
  const consumer_key = "G7XKsAzdMoXEnRZtjNbt04yZXO37KGVv"
  const consumer_secret = "4SQVwO5JwuZvxkmR"
  const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
  const auth = "Basic " + new Buffer.from(consumer_key + ":" + consumer_secret).toString("base64");
  axios.get( url,
      {
        headers : {
          "Authorization":auth
       }
      })
      .then((response)=>{
          req.access_token = response.data.access_token
          next()
       })
      .catch((error)=>{
          console.log(error)
      })
}

app.get('/accesstoken',accessToken,(req,res)=>{
//access token
res.status(200).send({access_token:req.access_token}) 
  
})

app.get("/registerurl",accessToken,(req,res)=>{
  let url="https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
  let auth = "Bearer " + req.access_token

  axios({
      url:url,
      method:'POST',
      headers:{
          "Authorization" : auth
      },
      data : {
          "ShortCode": "603021",
          "ResponseType": "complete",
          "ConfirmationURL": "https://salty-fortress-71604.herokuapp.com/confirmation",
          "ValidationURL": "https://salty-fortress-71604.herokuapp.com/validation"
        }
  })
  .then((response)=>{
       res.status(200).json(response.data)
  })
  .catch((error)=>{
      console.log(error)
  })
})

app.post("/confirmation",(req,res)=>{
  console.log('.....confirmation ......')
  console.log(req.body)
  
})

app.post("/validation",(req,res)=>{
  console.log('.....validation ......')
  console.log(req.body)
 
})

app.get("/simulate",accessToken,(req,res)=>{
  let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate"
  let auth = "Bearer " + req.access_token;
  axios ({
      url:url,
      method:"POST",
      headers:{
          "Authorization" : auth
      },
      data:{
          "ShortCode":"603021",
          "CommandID":"CustomerPayBillOnline",
          "Amount":"100",
          "Msisdn":"254708374149",
          "BillRefNumber":"TestApi"
      },
  })
  .then((response)=>{
      res.status(200).json(response.data)
  })
  .catch((error)=>{
      console.log(error)
  })
})

app.get("/balance",accessToken,(req,res)=>{
  let url= "https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query"
  let auth =  "Bearer " + req.access_token;
  axios({
      url:url,
      method:"POST",
      headers:{
          "Authorization" : auth
      },
      data:{
          "Initiator":"apiop37",
          "SecurityCredential":"SOTcbwJvrcsUgITi5uX8MIZCEXTUSdFQSgEJJN+a4CNGnq9YW+xTceVNuwLRyFaveilBwpCeh3cDXRCRszIe0idsySX3vtx8LSrg6xKki5Dkgsj3K/Ljf9n/WhAgCwOdYeCKiLidSHS2ppuP7cmNPSR2ErGDOzwmEeABfrbOXbzRB1b4glJ69NT+keRwz7H/eLcshFeili5eKZIily30TQfZB5L9PDDCHlG6JK4y/gYm1sz+cgQLe0HDoS2o66FxK5Rz5EzIeQf0J8xriWgkwVGS9sPmgsP/oABB/P6Xwg+qPWr3d9SSuTn/G4SE2McUvcN0AhPrXjYDhIPsKU07BA==",
          "CommandID":"AccountBalance",
          "PartyA":"603021",
          "IdentifierType":"4",
          "Remarks":"Remarks",
          "QueueTimeOutURL":"https://salty-fortress-71604.herokuapp.com/timeout_url",
          "ResultURL":"https://salty-fortress-71604.herokuapp.com/result_url"
      },
  })
  .then((response)=>{
      res.status(200).json(response.data)
  })
  .catch((error)=>{
      console.log(error)
  })
})

app.post("/timeout_url",(req,res)=>{
  console.log("......balance timeout responce......")
  console.log(req.body)
})
app.post("/result_url",(req,res)=>{
  console.log("......balance responce......")
  console.log(req.body)
})

app.get("/stk",accessToken,(req,res)=>{
  let url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
  let auth =  "Bearer " + req.access_token;
  let Timestamp = moment().format('YYYYMMDDHHmmss')
  let password = new Buffer.from("174379"+ "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" + Timestamp).toString('base64')
  axios({
      url:url,
      method:"POST",
      headers:{
          "Authorization" : auth
      },
      data:{
          "BusinessShortCode": "174379",
          "Password":password,
          "Timestamp":Timestamp,
          "TransactionType": "CustomerPayBillOnline",
          "Amount": "17",
          "PartyA": "254758623068",
          "PartyB": "174379",
          "PhoneNumber": "254758623068",
          "CallBackURL": "https://salty-fortress-71604.herokuapp.com/callback",
          "AccountReference": "123test",
          "TransactionDesc": "proccess payment"
      }
  })
  .then((response)=>{
      res.status(200).json(response.data)
  })
  .catch((error)=>{
      console.log(error)
  })
})

app.post("/callback",(req,res)=>{
  console.log("......sts......")
  console.log(req.body)
})

const port = process.env.PORT || 3000;

const mongoUrl = 'mongodb+srv://admin-joe:Mukundijoe254@cluster0.czws1.mongodb.net/iwrite';
const dbConn = async()=>{
  try {
    await mongoose.connect(mongoUrl,{
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(port,()=>{
      console.log(`server live at port ${port}`);
    });
    console.log('db active');
  } catch (error) {
    console.error(error);
  }
};
dbConn();