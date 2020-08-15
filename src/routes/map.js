import express from 'express';


import Map from '../models/Map';

var router = express.Router();



// GET ALL Map
router.get('/', (req, res) => {
  Map.find((err, listMap) => {
    if (err) return res.status(500).send({
      error: 'database failure'
    });
    res.json(listMap);
  })
});



module.exports = router;




