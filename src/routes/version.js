import express from 'express';
import Version from '../models/Version';
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';

//import updatePatch from '../works/updatePatch'; 

dotenv.config({
	path: './.env'
});

var router = express.Router();



router.get('/', async(req, res, next) => {

  try {

    const filter = {
      _id: 'one'
    };

    Version.findOne(filter, (err, foundVersion) => {
      if (err) return res.status(500).json({
        error: err
      });
      else if (!foundVersion) {
        return res.status(404).json({
          error: 'Version not found'
        });
      } else {
        res.json(foundVersion);
      }
    });

  } catch (error) {
    next(error)
  }

});



// 
router.get('/check', async(req, res, next) => {

  try {

		const result = await updatePatch();

		/*
			{
				minor: patchNameMinorLatest
			  , major: patchNameMajorLatest
			 
			  , checkedFirst: dateCurrent
			  , checkedLast: dateCurrent
			}
		*/
		
		const checkedFirst = new Date (result['checkedFirst']);
		const checkedLast = new Date (result['checkedLast']);
		
		console.log(checkedFirst);
		console.log(checkedLast);
		console.log(checkedLast-checkedFirst);
		
  } catch (error) {
    next(error)
  }

});




module.exports = router;


/*

{
  "2.44": [
    "2.44.0.73016",
    "2.44.1.73493"
  ],
  "2.45": [
    "2.45.0.73662",
    "2.45.1.74238"
  ],
  "2.46": [
    "2.46.0.74739",
    "2.46.1.75132"
  ],
  "2.47": [
    "2.47.0.75589",
    "2.47.1.75792",
    "2.47.2.76003",
    "2.47.3.76124"
  ],
  "2.48": [
    "2.48.0.76389",
    "2.48.0.76437",
    "2.48.1.76517",
    "2.48.2.76753",
    "2.48.2.76781",
    "2.48.2.76893",
    "2.48.3.77205",
    "2.48.4.77406"
  ],
  "2.49": [
    "2.49.0.77525",
    "2.49.0.77548",
    "2.49.1.77662",
    "2.49.1.77692",
    "2.49.2.77981",
    "2.49.3.78256",
    "2.49.4.78679",
    "2.49.4.78725"
  ],
  "2.50": [
    "2.50.0.79155",
    "2.50.1.79515",
    "2.50.2.79999",
    "2.50.2.80046"
  ],
  "2.51": [
    "2.51.0.80333",
    "2.51.1.80702",
    "2.51.2.81376"
  ]
}

*/