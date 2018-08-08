var express = require('express');
var router = express.Router();
const db = require('simple-postgres');

/* GET home page. */
// router.get('/', function (req, res, next) {
//     res.render('view', {rooms: []});
// });

router.get('/', async (req, res, next) => {
    const floor = req.query.floor || 1;

    const rooms = await db.rows`
     SELECT
        room as number,
        json_agg(json_build_object('id',id,'name', name, 'program', program)) as people
     FROM
        students
     WHERE 
        floor = ${floor}
     GROUP BY
        room
  `;

    const search = req.query.search ? req.query.search.trim().split(' ') : [];
    let filteredRooms = search.length == 0 ? rooms : rooms.map((room) => {
        return ({
            number: room.number,
            people: room.people.filter((person) => {
                let nameMatches = false;
                search.forEach((t) => {
                    nameMatches = nameMatches || person.name.includes(t);

                });
                let programMatches = false;
                search.forEach((t) => {
                    programMatches = programMatches || person.program.includes(t);
                })
                return nameMatches || programMatches;
            })
        })
    });
    filteredRooms = filteredRooms.filter((room) => room.people.length > 0);
    res.render('view', {floor: floor, search: req.query.search, rooms: filteredRooms});

});

module.exports = router;
