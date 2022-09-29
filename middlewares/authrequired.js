// jshint esversion:6
const RequireAuth = (req,res,next)=>{
  if (!req.session.user){
    return res.redirect('/login')
  }
  next();
};

module.exports = RequireAuth;