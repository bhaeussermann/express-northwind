var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.redirect('employees');
});

router.get('/employees', function(req, res, next) {
  res.render('employees', { name: 'employees', title: 'Employees', pretty: true });
});

router.get('/employees/add', function(req, res, next) {
  res.render('edit-employee', { name: 'edit-employee', title: 'Add Employee', pretty: true });
});

router.all('/api/*', function(req, res) {
  request('http://23.96.23.19:8030' + req.url.substring(4), 
    { 
      method: req.method, 
      body: req.method === 'POST' ? JSON.stringify(req.body) : null
    }, 
    function(error, response, body) {
      if (error)
        res.status(500).send({ message: 'Error calling Northwind service: ' + (error.code ? error.code : error) });
      else
        res.status(response.statusCode).send(body);
    });
});

module.exports = router;
