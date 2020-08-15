import express from 'express';


import HeroBasic from '../models/HeroBasic';

var router = express.Router();



// GET ALL HeroBasic
router.get('/', (req, res) => {
  HeroBasic.find((err, listHeroBasic) => {
    if (err) return res.status(500).send({
      error: 'database failure'
    });
    res.json(listHeroBasic);
  })
});



module.exports = router;




