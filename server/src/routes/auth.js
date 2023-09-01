const express = require('express');
const routes = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { authenticate } = require('../middleware/checkAuth');

// google strategy config
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GAPP_CLIENT_ID,
      clientSecret: process.env.GAPP_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      // Find or create user
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = await new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
        }).save();
      }

      done(null, user);
    }
  )
);

routes.get(
  '/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }),
  (req, res) => {
    res.end();
  }
);

routes.get('/api/auth/me', authenticate, (req, res) => {
  res.json(req.auth);
});

routes.get(
  '/api/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      {
        userName: user.userName,
        email: user.email,
        providerId: `google-${user.providerId}`,
      },
      process.env.SECRET_KEY,
      { expiresIn: '14d' }
    );
    console.log(token, 'tokenn');
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    res.redirect('/');
  }
);

routes.get('/api/auth/logout', authenticate, (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true });
});

module.exports = routes;
