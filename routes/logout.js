var express = require('express');
var router = express.Router();
const jwt = require('jwt-simple');

/* GET home page. */
router.post('/', function(req, res, next) {
  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;
