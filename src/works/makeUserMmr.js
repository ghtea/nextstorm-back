import axios from 'axios';
import dotenv from "dotenv";
import User from '../models/User';

// mbcat#1703

dotenv.config({ 
  path: './.env' 
});


const getMmrSlOneRegion = async (battletag, idRegion, nameRegion) => {
  try {
    
    let urlBattletag = encodeURIComponent(battletag);
    let url = `https://api.heroesprofile.com/api/Player/MMR?mode=json&battletag=${urlBattletag}&region=${idRegion}&game_type=Storm%20League&api_token=${process.env.TOKEN_HP}`
    
      
      
      
    const response = await axios.get(`${url}`);
    const objPlayerOriginal = response.data;
    
    const objSl = objPlayerOriginal[battletag]["Storm League"];
    
    return new Promise(function(resolve, reject) {
      console.log(`${nameRegion}: succeeded!`);
      resolve(objSl);
    });
    
  } catch (error) {
      console.log(`${nameRegion}: no data (or heroesprofile api isn't working)`);
  }
}; 





const makeUserMmr = async (battletag) => {
  
  try {
    
  // # => %23 
  const objRegion = {
    NA: "1",
    EU: "2",
    KR: "3",
    CN: "5"
  }
  
  const listRegionName = Object.keys(objRegion);
  const listRegionId = (Object.keys(objRegion)).map((key, i)=>objRegion[key])
  
  
  let objSlAll = {};
  
  objSlAll[listRegionName[0]] = await getMmrSlOneRegion(battletag, listRegionId[0], listRegionName[0]);
  objSlAll[listRegionName[1]] = await getMmrSlOneRegion(battletag, listRegionId[1], listRegionName[1]);
  objSlAll[listRegionName[2]] = await getMmrSlOneRegion(battletag, listRegionId[2], listRegionName[2]);
  objSlAll[listRegionName[3]] = await getMmrSlOneRegion(battletag, listRegionId[3], listRegionName[3]);
  /* 각각
    {
      "mmr": 2729,
      "games_played": 62,
      "league_tier": "diamond"
    }
  */
  
  const mmrDefault = 1800;
  const listRegion = ["NA", "EU", "KR", "CN"];
  let objMmr ={}
  
  
  for (const region of listRegion) {
    
    if (objSlAll[region]) {
      objMmr[region] = {
        mmr: objSlAll[region]["mmr"] || mmrDefault
        , tier: objSlAll[region]["league_tier"] || ""
        , games: objSlAll[region]["games_played"] || 0
      }
    }
    else {
      objMmr[region] = {
        mmr: mmrDefault
        , tier: ""
        , games: 0
      }
    }
    
  }
  
  const listRegionFiltered = listRegion.filter(region => objMmr[region]['games'] >= 50);
  const orderMainRegion = listRegionFiltered.sort( 
    (region1, region2) => {
      return (objMmr[region2]['games'] - objMmr[region1]['games']); // 큰게 앞으로
    }
  )
  objMmr["orderMainRegion"] = orderMainRegion;
  
  
  return new Promise( (resolve, reject) => {
    resolve(objMmr); 
  });
  
  } catch (e) {console.error("there is trouble with HeroesProfile API")}
}




/*
const battletag = "akr114#1438"

resolvePlayerMmr(battletag);
*/


export default makeUserMmr