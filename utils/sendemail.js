// jshint esversion:8
const transporter  = require('../settings/emailtransporter');
// async..await is not allowed in global scope, must use a wrapper
exports.sendMail= async (username,email,subject,message)=> {
  // Generate test SMTP service account from ethereal.email
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Info" info@platinumendwriters.com', // sender address
    to:`${username},${email}`, // list of receivers
    subject:subject, // Subject line
    text:message, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
};