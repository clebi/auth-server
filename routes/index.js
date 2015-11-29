var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('params: ', req.query);
  console.log('body: ', req.body);
  res.json({ content: 'Hello world !' });
});

module.exports = router;
