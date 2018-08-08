var express = require('express');
var router = express.Router();
const db = require('simple-postgres');

/* GET home page. */
router.get('/:studentID', async (req, res, next) => {
    const sid = req.params.studentID;
    const student = await db.row`
    SELECT 
      s1.id,
      s1.floor,
      s1.room,
      s1.name,
      s1.facebook,
      s1.instagram,
      s1.snapchat,
      s1.message,
      s1.program,
      s1.year,
          (SELECT
            json_agg(json_build_object(
              'id',
              id,
              'name',
              name
            ))
            FROM
              students s2
            WHERE
              s2.room = s1.room
              AND s2.floor = s1.floor
              AND NOT s2.id = s1.id
      ) as roommates
    FROM 
      students s1
    WHERE
      id = ${sid}
    GROUP BY
      s1.floor,
      s1.room,
      s1.name,
      s1.id,
      s1.facebook,
      s1.instagram,
      s1.snapchat,
      s1.message,
      s1.program,
      s1.year
  `

    res.render('student', {student: student});
});

router.post('/:studentID/delete', async (req, res) => {
    const sid = req.params.studentID;
    const valid = await db.row`
    SELECT
        password = crypt(${req.body.password}, password) as valid
    FROM
        students
    WHERE
        id = ${sid}
   `;
    if (valid.valid) {
        await db.query`
        DELETE FROM students
        WHERE
            id = ${sid}
       `;
        res.render('student_deleted');
    } else {
        res.render('student_delete_failed');
    }
});

module.exports = router;
