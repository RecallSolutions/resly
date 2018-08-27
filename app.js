var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const jwt = require('jwt-simple');
const db = require('simple-postgres')

var indexRouter = require('./routes/index');
var logoutRouter = require('./routes/logout');
var joinRouter = require('./routes/join');
var studentsRouter = require('./routes/students');
var submitRouter = require('./routes/submit');
var viewRouter = require('./routes/view');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/logout', logoutRouter);
app.use('/join', protection, joinRouter);
app.use('/submit', protection, submitRouter);
app.use('/view', protection, viewRouter);
app.use('/students', protection, studentsRouter);


async function protection(req, res, next) {
    if (isLoggedIn(req)) {
        const status = await db.row`
            SELECT
                confirmed,
                joined
            FROM
                users
            WHERE
                email = ${req.user.email}
        `;
        if (status.confirmed && status.joined) {
            next();
        } else if (status.confirmed) {
            if (req.baseUrl != '/join') {
                res.redirect('join');
            } else {
                next()
            }
        } else {
            res.render('register/register_email_sent');
        }
    } else {
        res.clearCookie('token');
        res.redirect('/');
    }
}

function isLoggedIn(req) {
    if (req.cookies && req.cookies.token) {
        try {
            const decoded = jwt.decode(req.cookies.token, process.env.SECRET);
            if (decoded && decoded.email) {
                req['user'] = {email: decoded.email}
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

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
