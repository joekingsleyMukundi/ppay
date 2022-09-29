// jshint esversion:8
const nodemailer = require("nodemailer");

  // Generate test SMTP service account from ethereal.email

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "mail.novaluxicawriters.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "info@platinumendwriters.com", // generated ethereal user
      pass: "_Oe2@RDnK8V{", // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });

module.exports = transporter;