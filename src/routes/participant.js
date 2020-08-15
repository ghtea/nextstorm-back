import express from 'express';

//import PlayerMmr from '../models/PlayerMmr';
import PlanTeam from '../models/PlanTeam';

import readPlayerMmr from '../works/readPlayerMmr'
import readPlayerRoleGames from '../works/readPlayerRoleGames'
import choosePlayerRoles from '../works/choosePlayerRoles'

import {returnListRegionMain, putMmrStandardToPlayerMmr} from '../works/putMmrStandardToPlayerMmr'

var router = express.Router();



/*
// GET SINGLE PlayerMmr
router.get('/', (req, res) => {
  PlayerMmr.findOne({_id: req.params.idPlanTeam}, (err, planTeam) => {
    if(err) return res.status(500).json({error: err});
    if(!planTeam) return res.status(404).json({error: 'planTeam not found'});
    res.json(planTeam);
  })
});
*/

/*
// READ PlayerMmr
router.get('/read-mmr', async (req, res, next) => {
  
  try {
    const battletag = req.body.battletag;
    const filter = { _id: battletag };
    
    PlayerMmr.findOne(filter, (err, playerMmr) => {
      if(err) return res.status(500).json({error: err});
      else if(!playerMmr) { return res.status(404).json({error: 'PlayerMmr not found'}); }
      else { res.json(playerMmr); }
    });

    
  } catch(error) { next(error) }
  
});
*/

// 우선 add 버튼 누를 때 할 작업 모두 다...
// first add to planTeam (only Name, Battletag, idPlanTeam + status)
// heroesprofile api 에서 battletag 확인

//ex: ahr.avantwing.com/plan-team/1234465646313/addPlayer
router.put('/add', async (req, res, next) => {
  try {
    
    
    const idPlanTeam = req.body.idPlanTeam;
    const battletag = req.body.battletag;
    //const name = req.body.name;
    const status = req.body.status;
    

    
    // add/replace to cPlayerMmr
    const filter1 = {_id: battletag};
    
    const dateUpdated = Date.now();
    
    let objPlayerMmr;
    
    //console.log("1111")
    objPlayerMmr = await readPlayerMmr( battletag ); // read from heroesprofile
    
    //console.log("2222")
    const listRegionMain = returnListRegionMain(objPlayerMmr); // 이건 더 아래에서 데이터 베이스에 넣자
    
    //console.log("3333")
    const newPlayerMmr = putMmrStandardToPlayerMmr(objPlayerMmr, 0); // including mmr standard
    newPlayerMmr['updated'] = dateUpdated;
    //console.log("4444")
    /*
    const update1 = newPlayerMmr // including update date
      
    console.log(update1)
    const option1 = {upsert: true }; // upser -> add if not exist
    
    
    await PlayerMmr.findOneAndUpdate(filter1, update1, option1);   // add to cPlayerMmr
    */
    
    ////////////////
    
    console.log("check here")
    console.log(idPlanTeam)
    
    const filter2 = {
      _id: idPlanTeam
      , "listPlayerEntry._id" : {$ne: battletag}  // 이미 목록에 있는 상태라면 건디리지 않는다.
    };
    
    const update2 = {
      $push: {
        listPlayerEntry: 
        {
          _id : battletag 
          //, name : name 
          , status : status 
        }
      }
    }
  	// 더 공부하자
  	// https://docs.mongodb.com/manual/reference/method/db.collection.updateOne/
  	
    await PlanTeam.updateOne(filter2, update2);
      
    
    //////////////
    
    
    let mmrForPlayerEntry = {
      standard: {}
      ,manual: {}
    };
    
    mmrForPlayerEntry["standard"]["NA"] = newPlayerMmr["NA"]["STANDARD"]; // newPlayerMmr["NA"]["STANDARD"]
    mmrForPlayerEntry["standard"]["EU"] = newPlayerMmr["EU"]["STANDARD"];
    mmrForPlayerEntry["standard"]["KR"] = newPlayerMmr["KR"]["STANDARD"];
    mmrForPlayerEntry["standard"]["CN"] = newPlayerMmr["CN"]["STANDARD"];
    
    
    const filter3 = {
      _id: idPlanTeam
      ,"listPlayerEntry._id" : battletag
    };
    
    const update3 = { 
      $set: { 
        "listPlayerEntry.$.mmr" : mmrForPlayerEntry 
        ,"listPlayerEntry.$.regions" : listRegionMain
      } 
    }
    
    await PlanTeam.updateOne(filter3, update3);  
   
    console.log("player has been added successfully")
    
    //console.log("listRegionMain: ")
    //console.log(listRegionMain)
    
    res.json(listRegionMain)
    
  } catch(error) { next(error) }
})
      
// refs
// https://stackoverflow.com/questions/26328891/push-value-to-array-if-key-does-not-exist-mongoose
// https://stackoverflow.com/questions/15921700/mongoose-unique-values-in-nested-array-of-objects



// 작업중
// role mmr, 게임수 

//ex: ahr.avantwing.com/plan-team/1234465646313/addPlayer
router.put('/add-roles', async (req, res, next) => {
  try {
    
    const idPlanTeam = req.body.idPlanTeam;
    const battletag = req.body.battletag;
    const listRegionMain = req.body.listRegionMain;
    
    // add/replace to cPlayerMmr
    
    //const dateUpdated = Date.now();
    
    let objPlayerRoleGames={};
    objPlayerRoleGames = await readPlayerRoleGames( battletag,  listRegionMain); // read from heroesprofile
    
    console.log('objPlayerRoleGames');
    console.log(objPlayerRoleGames);
    
    const listPlayerRole = choosePlayerRoles(objPlayerRoleGames);
    console.log('listPlayerRole');
    console.log(listPlayerRole);
    
    
    
    const filter = {
      _id: idPlanTeam
      ,"listPlayerEntry._id" : battletag
    };
    
    const update = { 
      $set: { 
        "listPlayerEntry.$.roles" : listPlayerRole 
      } 
    }
    
    await PlanTeam.updateOne(filter, update);  
    
    console.log("successfully updated");
    res.send("successfully updated");
    
  } catch(error) { next(error) }
})




router.put('/update-tags', async (req, res, next) => {
  try {
    
    const idPlanTeam = req.body.idPlanTeam;
    const battletag = req.body.battletag;
    const tag = req.body.tag;
    const true_false = req.body.true_false;
    
    
    const filter = {
      _id: idPlanTeam
      ,"listPlayerEntry._id" : battletag
    };
    
    let update;
    
    if (!true_false) {
      update = { 
        $pull: { 
          "listPlayerEntry.$.tags" : tag 
        } 
      };
    }
    else {
      update = { 
        $addToSet: { 
          "listPlayerEntry.$.tags" : tag 
        } 
      };
    }
    
    await PlanTeam.updateOne(filter, update);  
    
    
    res.send("successfully updated")
    
  } catch(error) { next(error) }
})


router.put('/update-status', async (req, res, next) => {
  try {
    
    const idPlanTeam = req.body.idPlanTeam;
    const battletag = req.body.battletag;
    const status = req.body.status;
    
    
    const filter = {
      _id: idPlanTeam
      ,"listPlayerEntry._id" : battletag
    };
    
    let update = {
      $set : {
        "listPlayerEntry.$.status" : status 
      }
    };
    
    await PlanTeam.updateOne(filter, update);  
    
    
    res.send("successfully updated")
    
  } catch(error) { next(error) }
})



module.exports = router;