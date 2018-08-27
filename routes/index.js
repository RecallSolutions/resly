var express = require('express');
var router = express.Router();
const jwt = require('jwt-simple');
const db = require('simple-postgres');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport(process.env.SMTP, {
    from: 'rezlysys@gmail.com'
})

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {invalid: false, isLoggedIn: isLoggedIn(req), conflict: false});
});

router.post('/', function (req, res, next) {
    const password = req.body.password;
    let email = req.body.email;

    if (email != 'jamohile@gmail.com') {
        email += '@mail.utoronto.ca';
    }
    if (req.body.submit == 'Register') {
        register(req, res, email, password);
    } else if (req.body.submit == 'Login') {
        login(req, res, email, password);
    }
});

const login = async (req, res, email, password) => {
    const status = await db.row`
        SELECT
            password = crypt(${password}, password) as valid,
            confirmed
        FROM users
        WHERE
            email = ${email}
    `;
    //No match with this email.
    if (!status || !status.valid) {
        res.render('index', {invalid: true, isLoggedIn: false, conflict: false});
    } else if (!status.confirmed) {
        res.render('register/register_email_sent');
    } else {
        const token = jwt.encode({
            email: email,
            date: new Date().valueOf(),
        }, process.env.SECRET);
        res.cookie('token', token);
        res.redirect('view');
    }


}

const register = async (req, res, email, password) => {
    const conflict = await db.row`
        SELECT
            id
        FROM
            users
        WHERE
            email = ${email}
    `;
    if (conflict && conflict.id) {
        res.render('index', {invalid: false, isLoggedIn: false, conflict: true})
    } else {
        const regID = await db.column`
            INSERT INTO
                users(
                    email,
                    password
                )
            VALUES(
                ${email},
                crypt(${password}, gen_salt('md5'))
                )
            RETURNING
                id
        `;

        const message = {
            to: email,
            subject: 'Rezly Email Confirmation',
            html: `
            Hi! Please click <a href="https://rezly.herokuapp.com/confirm/${regID}">here</a> to confirm your account.
            `
        }
        transporter.sendMail(message, (error, info) => {
            if (!error) {
                res.render('register/register_email_sent');
            }
        });
    }
}

router.get('/confirm/:id', async (req, res) => {
    const id = req.params.id;
    const confirm = await db.query`
        UPDATE
            users
        SET
            confirmed = true
        WHERE
            id = ${id}
   `;
    res.render(`register/register_email_confirmed`)
});

function isLoggedIn(req) {
    if (req.cookies && req.cookies.token) {
        try {
            const decoded = jwt.decode(req.cookies.token, process.env.SECRET);
            if (decoded && decoded.email) {
                return true;
            } else {
                return false;
                module.exports = router;
            }
        } catch (e) {
            return false
        }
    } else {
        return false
    }
}

module.exports = router;