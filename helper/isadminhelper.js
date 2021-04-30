module.exports = (req,res,next) =>{
    if(!req.session.isadmin){
      res.redirect('/login');
    }
    return next();
  }