module.exports = (req , res , next) =>{
    if(!req.session.isloggedin){
      res.redirect('/login');
    }
    return next();
}

