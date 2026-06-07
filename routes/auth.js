const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const router = express.Router();

router.get('/signup', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('signup', { title: 'Sign Up', error: null });
});

router.get('/signin', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('signin', { title: 'Sign In', error: null, returnUrl: req.query.ReturnUrl || '/' });
});

router.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password) {
      return res.status(400).render('signup', { title: 'Sign Up', error: 'Email and password are required.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).render('signup', { title: 'Sign Up', error: 'Passwords do not match.' });
    }
    if (password.length < 8) {
      return res.status(400).render('signup', { title: 'Sign Up', error: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).render('signup', { title: 'Sign Up', error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password_hash });

    req.session.user = { id: user.id, email: user.email };
    res.redirect('/');
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).render('signup', { title: 'Sign Up', error: 'Something went wrong. Please try again.' });
  }
});

router.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password, returnUrl } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).render('signin', { title: 'Sign In', error: 'Invalid email or password.', returnUrl: returnUrl || '/' });
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res.status(401).render('signin', { title: 'Sign In', error: 'Invalid email or password.', returnUrl: returnUrl || '/' });
    }

    req.session.user = { id: user.id, email: user.email };
    res.redirect(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/');
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).render('signin', { title: 'Sign In', error: 'Something went wrong. Please try again.', returnUrl: '/' });
  }
});

router.post('/api/auth/signout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
