const express = require('express');
const routes = express.Router();
const passport = require('passport-google-oauth20');
const jwt = require('jsonwebtoken')

// You should ask for the scopes `profile email openid`.
routes.get('/api/auth/google', passport.authenticate("google", { scope: ['profile', 'email', 'openid'] }), (req, res) => {
  res.end();
});

routes.get('/api/auth/me', (req, res) => {
  res.json(req.auth);
});

routes.get('/api/auth/google/callback', passport.authenticate("google", { failureRedirect: "/login", session: false}), function (req, res) {
  const expiresIn = 14 * 24 * 3600;    
  const token = jwt.sign(
        { name, email, providerId, avatar: profilePicture },
        process.env.TOKEN_KEY,
        {
          expiresIn,
        }
      );

      // Save user token in a cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // true for https
        maxAge: expiresIn * 1000,
        signed: true,
      });
  res.redirect("/")
  res.end();
});

routes.get('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({success: true});
});

module.exports = routes;
