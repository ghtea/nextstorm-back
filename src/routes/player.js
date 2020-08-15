import express from 'express';
import Player from '../models/Player';
import dotenv from "dotenv";

import getRegions from '../works/getRegions';
import getPlayerGeneralEachRegion from '../works/getPlayerGeneralEachRegion';


dotenv.config({ 
  path: './.env' 
});

var router = express.Router();



router.get('/regions/:battletagEncoded', async (req, res, next) => {
  
  try {
  	
  	try {
  		
  		const battletag = decodeURIComponent(req.params.battletagEncoded);
  		
  		
	    const filter = { battletag: battletag };
	    
	    
	    const foundPlayer = await Player.findOne(filter);
	    
	    
	    
	    if (!foundPlayer) {
	    	// 없으면 그 자리에서 만든다.
	    	
				const regions = await getRegions(battletag);
				
				console.log('regions')
				console.log(regions)
				
				const updatedRegion = Date.now();
				
	    	const newPlayer = new Player({
	    			battletag: battletag
	    			, listNameRegion: regions
	    			, updatedRegion: updatedRegion
	    		})
	    		
	    	await newPlayer.save();
	    	
	    	return res.json({
	    		battletag: battletag
    			, listNameRegion: regions
    			, updatedRegion: updatedRegion
	    	});
	    }
	    
	    else if ( foundPlayer.updatedRegion <  ( new Date().getTime() - 1000 * 60 * 60 * 24 * 7) ) {
	    	// player 가 내 데이터 베이스에 이미 있고 비교적 최근에 지역을 확인 했으면 그냥 가져온다
	    	return res.json(foundPlayer);
	    }
	    else {
	    	
	    	const regions = await getRegions(battletag);
	    	const updatedRegion = Date.now();
				
	    	const update = {
    			regions: regions
    			, updatedRegion: updatedRegion
	    	}
	    	
	    	await Player.updateOne(filter, update);
	    	
	    	return res.json({
	    		battletag: battletag
    			, listNameRegion: regions
    			, updatedRegion: updatedRegion
	    	});
	    
	    }
	    
  	} catch(error) {
  		console.log(error)
  		return res.status(500).json({error: error});
  	} 
    
  } catch(error) { next(error) }
  
});







router.get('/general/:battletagEncoded', async (req, res, next) => {
  
  try {
    
    const battletag = decodeURIComponent(req.params.battletagEncoded);
    const listNameRegion = req.query.listNameRegion;
    

    
    let result = {};
    
    for (const nameRegion of listNameRegion) {
		  result[nameRegion] = await getPlayerGeneralEachRegion(battletag, nameRegion);
		}
    
    return res.json(result);
    
  } catch(error) { next(error) }
  
});





module.exports = router;