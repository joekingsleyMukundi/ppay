// jshint esversion:8
const crypto = require('crypto');
const User = require('../models/writter');
const { sendMail } = require('../utils/sendemail.js');
const Password = require('../utils/password');
const { clearCache } = require('ejs');

// @desc          register user
// @route         Get /api/v1/auth/register
// @access         public

exports.registeruser = async(req,res,next)=>{
  if(req.session.user){
    res.redirect('/dashboard')
  }
  if(req.method == 'POST'){
    const{username,email,phone,password,repassword} = req.body;
    console.log(password);
    if (email == "" || username == "" || phone == ""||password==""||repassword=="") {
      req.flash('error','empty values cannot be submited');
      return res.redirect('/register');
    }
    if(password != repassword){
      req.flash('error', 'Password should match');
      return res.redirect('/register');
    }
    const user = await User.findOne({phone:phone});
    console.log(user);
    if(user){
      req.flash('error', 'Phone already exists');
      return res.redirect('/register');
    }
    User.findOne({email:email})
    .then(userDocs=>{
      if(userDocs){
        req.flash('error', 'Email already exists');
        return res.redirect('/register');
      }
      console.log(password);
      const user = new User({username:username,email:email,password:password,phone:phone,});
      try {
        const subject = "Activate account"
        const message = `To activate your account use this link: 127.0.0.1:3000/activete/${user.id}`
        sendMail(username,email,subject,)
      } catch (error) {
        console.log(error);
      }
      return user.save()
      .then(newuser=>{
        req.flash('success', 'Registration successful. wait for approval and  login');
        return res.redirect('/login');
      });
    })
    .catch(error=>{
      console.log(error);
      req.flash('error', 'Error occured plese contact admin');
      return res.redirect('/register');
    });
  }else{
    res.render('register',{message:req.flash('error')})
  }
};

// @desc          login user
// @route         Get /loginuser
// @access         public

exports.loginuser = async(req,res,next)=>{
  if(req.session.user){
    console.log(req.session.user);
    return res.redirect('/')
  }
  if(req.method == 'POST'){
    if (req.body.email == "" || req.body.password == "") {
      req.flash('error','empty values cannot be submited');
      return res.redirect('/login');
    }
    const{email, password} = req.body;
    const existinguser = await User.findOne({email});
    if(!existinguser){
      req.flash('error', 'User does not exist');
      return res.redirect('/register')
    }
    const matchpassword = await  Password.compare(existinguser.password, password);
    if(!matchpassword){
      req.flash('error', 'Wrong password');
      return res.redirect('/login')
    }
    if(!existinguser.verified){
      req.flash('error', 'User is not verified');
      return res.redirect('/login')
    }
      req.session.user = existinguser;
      req.session.is_loggedin=true;
      return res.redirect('/')
  }else{
    res.render('login', {successmessage:req.flash('success'),errormessage:req.flash('error')})
  }
  
};

// @desc          Activate account
// @route         Get /activate/:id
// @access         public

exports.activateAccount=async(req,res,next)=>{
  const id = req.params.id;
  const writer = await User.findById(id);
  writer.verified = true;
  await writer.save();
  const message  = `Dear partner am happy to inform you that you have been approved  you can now access the dashboard`;
  const subj = "User approved";
  sendMail(writer.username,writer.email,subj,message);
  res.redirect('/admindashboard');
};

// @desc          logout user
// @route         Get /logout
// @access         public
exports.logout=(req,res,next)=>{
  console.log('hey');
  req.session.destroy(function(err) {
    if(err) {
        return next(err);
    } else {
        req.session = null;
        console.log(req.session);
        console.log("logout successful");
        return res.redirect('/');
    }
});
};

// @desc          forgotpassword user
// @route         Get /api/v1/auth/register
// @access         public

exports.forgotpass = async (req,res,next)=>{
  if(req.session.user){
    res.redirect('/')
  }
  if(req.method == 'POST'){
    if (req.body.email == "") {
      req.flash('error','empty values cannot be submited');
      return res.redirect('/forgotpassword');
    }
    const user = await User.findOne({email:req.body.email});
    if(!user){
      req.flash('error', 'User does not exist');
      return res.redirect('/register');
    }
    const resetToken = user.getResetPasswordToken();
    console.log(resetToken);
    const reseturl = `${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`;
    const message  = `You are receiving this email because you (or someone else) has requested a reset of password. Please click this link ${reseturl}`;
    const subj = "Password Renewal";
    try {
      await sendMail(user.username,user.email,subj,message);
      req.flash('success' , 'Instructiions were sent to your email');
      res.redirect('/forgotpassword');
    } catch (error) {
      console.log(error);
      user.resetPasswordToken = undefined;
      user.resetPassworExpire = undefined;
      await user.save({validateBeforeSave: false});
      req.flash('error' , 'something went wrong');
      res.redirect('/forgotpassword');
    }
    await user.save(
      {
        validateBeforeSave: false
      }
    );
  }else{
    
    res.render('forgot-password',{successmessage:req.flash('success'),errormessage:req.flash('error')});
  }
  
};

// @desc          reset password 
// @route         Get /resetpassword
// @access         public
exports.resetPassword = async (req,res,next)=>{
  // get hashed token
  const resetpassToken  = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
  console.log(resetpassToken);
  const user = await User.findOne({
    resetPasswordToken : resetpassToken,
  });

console.log(user);
  if(!user){
    req.flash('error', 'User does not exist');
    return res.redirect('/login')
  }
  if(req.method == 'POST'){
    if (req.body.password == "") {
      req.flash('error','empty values cannot be submited');
      return res.redirect('/login');
    }
    // set new pass
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPassworExpire= undefined;
    await user.save();
    req.session.user = user;
    req.session.is_loggedin = true
    req.flash('success', 'Password reset');
    res.redirect('/')
  }else{
    res.render('reset-password',{successmessage:req.flash('success'),errormessage:req.flash('error')})
  }
};
exports.dashboard=async (req,res,next)=>{
  const user=req.session.user;
  if(user.role=="admin"){
    return res.redirect('/admindashboard');
  }
  const currentuser = await User.findOne({email:user.email});
  var jobsno;
  var pendingjobs;
  const totalJobs = await Job.find({writerid:user._id});
  if(!totalJobs){
    jobsno = 0;
    pendingjobs=0;
  }else{
    jobsno= totalJobs.length;
    pendingjobs = await Job.find({writerid:user._id,status:'pending'});
    approvedJobs = await Job.find({writerid:user._id,status:'paid'});
    rejectedjobs = await Job.find({writerid:user._id,status:'rejected'});
  }
  context={
    user:currentuser,
    totaljobs:jobsno,
    pendingjobs:pendingjobs.length,
    jobs:totalJobs,
    paidjobs:approvedJobs.length,
    rejectedjobs:rejectedjobs.length,
    errormessage:req.flash('error'),
    successmessage:req.flash('success')
  };
  res.render('dashboard',context);
};