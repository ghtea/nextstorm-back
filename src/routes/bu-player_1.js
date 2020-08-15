import express from 'express';
import Player from '../models/Player';
import dotenv from "dotenv";

dotenv.config({ 
  path: './.env' 
});

var router = express.Router();


// READ PlayerGeneral or CRAETE !!
router.get('/general/:battletag', async (req, res, next) => {
  
  try {
  	
  	try {
  		
  		
	    const filter = { battletag: req.params.battletag };
	    
	    const foundPlayer = await Player.findOne(filter);
	    
	    if ( foundPlayer && foundPlayer.stats.entire.updated > new Date( ISODate().getTime() - 1000 * 60 * 60 ) ) {
	    	// player 가 내 데이터 베시으에 이미 있고 비교적 최근 데이터일때만 그냥 내 데이터 베이스에서 읽어온다
	    	return res.json(foundPlayer);
	    }
	    else if (!foundPlayer){
	    	
	    	// 없으면 이때 미리 만들어 놓는다. 그리고 나서 에러 반환해서 업데이트 필요하다고 알려주기
	    	// 여기서 
	    	
	    	const newPlayer = new Player();
	    	await newPlayer.save();
	    	
	    	
				return res.status(404).json({error: 'should update/create'});
	    }
	    else {
	    	// 업데이트 필요하다고 알려주기
	    	return res.status(404).json({error: 'should update/create'});
	    }
	    
	    
  	} catch(error) {
  		return res.status(500).json({error: error});
  	} 
    
  } catch(error) { next(error) }
  
});







// UPDATE  // 위의 get에서 create 도 겸한다
router.put('/general/:battletag', async (req, res, next) => {
  
  try {
    
    const filter = { battletag: req.params.battletag };
    const foundPlayer = Player.findOne(filter);
    
    let urlBattletag = encodeURIComponent(battletag);
    
    
    
    let url = `https://api.heroesprofile.com/api/Player/MMR?mode=json&battletag=${urlBattletag}&region=${idRegion}&api_token=${process.env.TOKEN_HP}`
    
    
    
    // 지역 1/4 전체 stat (qm + sl)
    // 지역 1/4 전체 stat (qm + sl)
    // 지역 1/4 전체 stat (qm + sl)
    // 지역 1/4 전체 stat (qm + sl)
    
    
    // 플레이 기록 있는 지역 파악
		   
		   
		   /// 아래를 지역별로 
    // tanker 전체 stat (qm + sl)
    // bruiser 전체 stat (qm + sl)
    // melee 전체 stat (qm + sl)
    // ranged 전체 stat (qm + sl)
    // healer 전체 stat (qm + sl)
    // support 전체 stat (qm + sl)
      
    const response = await axios.get(`${url}`);
    
    
    if (foundPlayer) { // 읽어온 정보로 Player 를 만들어야 한다
    	
    }
    
    else {  // 읽어온 정보로 Player 를 업데이트 해야 한다
    	
    }
    const date =  Date.now();
    
    const compReq = req.body;
    
    let listPosition = compReq.listPosition;
    
    
    const listIdMainHero = listPosition.map(element => element.listIdHero[0]);

    const listListIdHero = listPosition.map(element => element.listIdHero);
    
    // https://stackoverflow.com/questions/5080028/what-is-the-most-efficient-way-to-concatenate-n-arrays
    const listIdAllHero = [].concat.apply([], listListIdHero);
    
    let update = 
      { 
        
        title: compReq.title
        
        
        , listPosition: listPosition
        , size: listPosition.length
        , listIdMainHero: listIdMainHero
        , listIdAllHero: listIdAllHero
        
        , listIdMap: compReq.listIdMap
        , listTag: compReq.listTag
        
        , updated: date
      };
    
      
    await Comp.updateOne( filter , update);
    
    res.send("comp has benn updated!");
    
  } catch(error) { next(error) }
  
});





module.exports = router;