import express from 'express';


import HeroDetail from '../models/HeroDetail';

var router = express.Router();




router.get('/', (req, res) => {
  HeroDetail.find((err, listHeroDetail) => {
    if (err) return res.status(500).send({
      error: 'database failure'
    });
    res.json(listHeroDetail);
  })
});



module.exports = router;




