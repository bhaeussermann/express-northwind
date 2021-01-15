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

router.get('/employees/*', function(req, res, next) {
  res.render('edit-employee', { name: 'edit-employee', title: 'Edit Employee', pretty: true });
});

router.all('/api/*', function(req, res) {
  console.log(req.url.replace(/^\/api\/northwind/, ''));
  request('https://northwind-express-api.herokuapp.com' + req.url.replace(/^\/api\/northwind/, ''),
    { 
      method: req.method, 
      body: (req.method === 'POST' || req.method === 'PUT') ? JSON.stringify(req.body) : null
    }, 
    function(error, response, body) {
      if (error)
        res.status(500).send({ message: 'Error calling Northwind service: ' + (error.code ? error.code : error) });
      else
        res.status(response.statusCode).send(body);
    });
});

module.exports = router;
