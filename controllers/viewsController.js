exports.getOverview = (req, res) => {
  res.status(200).render('overview');
};

exports.getSignup = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create your account',
  });
};

exports.getLogin = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getForgotPassword = (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'Reset your password',
  });
};

exports.getResetPassword = (req, res) => {
  const { token } = req.params;
  res.status(200).render('resetPassword', {
    title: 'Reset your password',
    token,
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'View your account',
  });
};

exports.getChangePassword = (req, res) => {
  res.status(200).render('updatePassword', {
    title: 'Update your password',
  });
};

exports.getDeleteAccount = (req, res) => {
  res.status(200).render('deleteAccount', {
    title: 'Delete your account',
  });
};

exports.getSearch = async (req, res) => {
  const games = null;
  res.status(200).render('search', {
    title: 'Games free search',
    games,
  });
};

exports.getSurvey = async (req, res) => {
  res.status(200).render('survey', {
    title: 'Gamer personality survey',
  });
};
