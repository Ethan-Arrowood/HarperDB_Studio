var isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.logout();
    ref = req.originalUrl.substr(1, req.originalUrl.length);
    var isAjaxRequest = req.xhr;
    if (isAjaxRequest) return res.status(401).send();
    else return res.redirect("/login?ref=" + ref);
  }
};

var isSuperUser = function(req, res, next) {
  if (req.user.super_user) return next();
  else {
    let ref = req.originalUrl.substr(1, req.originalUrl.length);
    return res.redirect("/login?ref=" + ref);
  }
};

module.exports = {
  isAuthenticated: isAuthenticated,
  isSuperAdmin: isSuperUser
};
