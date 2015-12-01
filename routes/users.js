var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send(res.json({
    username: req.user.username,
    createdAt: req.user.createdAt
  }));
});

module.exports = router;
