var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('employees', { name: 'employees', title: 'Employees', pretty: true });
});

router.get('/api/*', function(req, res) {
  request('http://23.96.23.19:8030' + req.url.substring(4), function(error, response, body) {
    res.status(response.statusCode).send(body);
  });
});

module.exports = router;
