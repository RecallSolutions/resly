var express = require('express');
var router = express.Router();
const db = require('simple-postgres');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('submit');
});
router.post('/', async (req, res, next) => {
    const {
        name,
        floor,
        room,
        password,
        facebook,
        instagram,
        snapchat,
        message,
        program,
        year
    } = req.body;
    await db.query`
    INSERT INTO
      students(
      name, 
      floor, 
      room, 
      password,
      facebook,
      instagram,
      snapchat,
      message,
      program,
      year)
    VALUES(
    ${name},
    ${floor},
    ${room},
    crypt(${password}, gen_salt('md5')),
    ${facebook},
    ${instagram},
    ${snapchat},
    ${message},
    ${program},
    ${year}
    )
  `;
    res.render('student_added');
})
module.exports = router;
