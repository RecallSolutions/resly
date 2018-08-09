var express = require('express');
var router = express.Router();
const jwt = require('jwt-simple');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { invalid: false, isLoggedIn: isLoggedIn(req)});
});

router.post('/', function(req, res, next) {
    if(req.body.password == process.env.PASSWORD){
        const token = jwt.encode({
            date: new Date().valueOf(),
            password: process.env.PASSWORD
        }, process.env.SECRET);
        res.cookie('token', token);
        res.redirect('view');
    }else{
        res.render('index', {invalid: true, isLoggedIn: false})
    }
});

function isLoggedIn(req) {
    if (req.cookies && req.cookies.token) {
        try {
            const decoded = jwt.decode(req.cookies.token, process.env.SECRET);
            if (decoded && decoded.password && decoded.password == process.env.password) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    } else {
        return false;
    }
}

module.exports = router;
