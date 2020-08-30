import express from 'express';

//import queryString from 'query-string';

import HeroStats from '../models/HeroStats';

var router = express.Router();



// READ 
router.get('/:idHero', async(req, res, next) => {

  try {

    const filter = {
      _id: req.params.idHero
    };

    HeroStats.findOne(filter, (err, foundHeroStats) => {
      if (err) return res.status(500).json({
        error: err
      });
      else if (!foundHeroStats) {
        return res.status(404).json({
          error: 'HeroStats not found'
        });
      } else {
        res.json(foundHeroStats);
      }
    });

  } catch (error) {
    next(error)
  }

});




module.exports = router;