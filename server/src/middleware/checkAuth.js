require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const User = require('../models/User');

const generateToken = (user) => {
  const { userName, email } = user;
  const payload = {
    userName,
    email,
  };
  const token = jwt.sign(payload, process.env.APP_SECRET, {
    expiresIn: '14d',
  });
  return token;
};

const authenticate = (req, res, next) => {
  const token = req.cookies.token || req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // checking if the token starts with 'Bearer' and extract the actual token

  let actualToken;

  if (token.startsWith('Bearer')) {
    actualToken = token.split(' ')[1];
  } else {
    actualToken = token;
  }

  try {
    const decoded = jwt.verify(actualToken, process.env.APP_SECRET, {
      algorithms: ['HS256'],
    });
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Invalid Token' });
  }
};

module.exports = { generateToken, authenticate };