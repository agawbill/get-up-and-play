export const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};

// this will check to see if a local email is present, because we want a local account linked to a users account whether they signup with a social media account or not

export const checkLocal = (req, res, next) => {
  if (req.user.local.email) {
    return next();
  }
  res.redirect("connect/local");
};
