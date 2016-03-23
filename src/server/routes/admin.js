import express from 'express';

const router = express.Router();

function authenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

router.get('/', authenticated, (req, res) => {
  res.render('admin', { title: 'Admin' });
});

export default router;
