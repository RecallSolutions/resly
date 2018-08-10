var express = require('express');
var router = express.Router();
const jwt = require('jwt-simple');
const db = require('simple-postgres');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('join/join', {invalid: false})
});

router.post('/', async (req, res) => {
    const password = req.body.password;
    if (password == process.env.PASSWORD) {
        const join = await db.query`
      UPDATE
        users
      SET
        joined = true
      WHERE
        email = ${req.user.email}
    `;
        res.redirect('view');
    } else {
        res.render('join/join', {invalid: true})
    }
})

module.exports = router;
