import mongoose from 'mongoose';
import dotenv from "dotenv"
import axios from 'axios'
import sourceBuilds from './sourceBuilds'; // for test

import HeroStats from '../models/HeroStats';
import Version from '../models/Version';


dotenv.config({ 
  path: './.env' 
});



// mongo db 와 연결
mongoose
.connect(process.env.DB_URL, {
useUnifiedTopology: true,
useNewUrlParser: true,
})
.then(() => console.log('DB Connected!'))
.catch(err => {
console.log(`DB Connection Error: ${err.message}`);
});


  // ex) version = '2.51'

const updateAllHeroListTopBuild = async (version) => {
  
  try {
    const res_HeroesProfile = await axios.get(`https://api.heroesprofile.com/api/Heroes/Talents/Builds?mode=json&timeframe_type=major&timeframe=${version}&game_type=Storm%20League&api_token=${process.env.TOKEN_HP}`)
    
  
    
    const dictHeroListTopBuildOriginal = res_HeroesProfile.data;
    
    // testing
    //const dictHeroListTopBuildOriginal = sourceBuilds;
    
    const list_key_HeroesProfile = Object.keys(dictHeroListTopBuildOriginal); // name 이자 key_HeroesProfile 이자 _id
   
   
    for (const keyHero of list_key_HeroesProfile) {
      
      const listTopBuildOriginal = dictHeroListTopBuildOriginal[keyHero];
      
      let listTopBuild = [];
      for (const buildOriginal of listTopBuildOriginal) {
        
        const build = {
          games_played: buildOriginal['calculated_games_played']
          , win_rate: buildOriginal['win_rate']
          , listTalent: buildOriginal['build_talents']
        }
        
        listTopBuild.push(build);
        
      }
      
      const filter = {
        _id: keyHero
      }
      
      let update = {
        listTopBuild: listTopBuild
        //, "updated.listTopBuild": Date.now()
      }
      
      await HeroStats.updateOne(filter, update);
      
      
      console.log(`${keyHero} has been updated`);
    }
    
    const dateCurrnet = Date.now();
    const filterVersion = {_id: 'one'};
    const updateVersion = {
      $set: {
        'db.HeroStats.updated': dateCurrnet
        , 'db.HeroStats.version': version
      }
    };
    await Version.updateOne(filterVersion, updateVersion);
    
    console.log("all HeroStats have benn updated successfully!");
     
  } catch (error) {
      //console.log("");
      console.error(error);
  }
  
};
    



updateAllHeroListTopBuild('2.51');