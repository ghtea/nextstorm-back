
// have not test here yet

import mongoose from 'mongoose';
import dotenv from "dotenv"
import axios from 'axios'


let Map = require('../models/Map');

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





const addAllMaps = async () => {
  
  try {
    const res_HeroesProfile = await axios.get(`https://api.heroesprofile.com/api/Maps?mode=json&api_token=${process.env.TOKEN_HP}`)
    const listMap = res_HeroesProfile.data;

    
    for (const objMap of listMap) {
      
      console.log(objMap)
      
      let rankedRotation;
      if (objMap["ranked_rotation"] === 1) {rankedRotation=true}
      else if (objMap["ranked_rotation"] === 0) {rankedRotation=false}
      
      let playable;
      if (objMap["playable"] === 1) {playable=true}
      else if (objMap["playable"] === 0) {playable=false}
      
      
      let lines;
      
      let name = {
        en: {}
        ,ko: {}
        ,ja: {}
      };
      
      
      switch (objMap["map_id"]) {
        case 15:  // string이 아닌 int 임에 주의!
          lines = 3;
          //name.en.full = "Alterac Pass"
          name.en.full = objMap["name"]
          name.en.short = "AP"
          name.ko.full = "알터랙 고개"
          name.ko.short = "알터랙"
          name.ja.full = "Alterac Pass"
          name.ja.short = "AP"
          
          break;
          
          
        case 1:
          lines = 2;
          //name.en.full = "Battlefield of Eternity"
          name.en.full = objMap["name"]
          name.en.short = "BoE"
          name.ko.full = "영원의 전쟁터"
          name.ko.short = "영전"
          name.ja.full = "Battlefield of Eternity"
          name.ja.short = "BoE"
          
          break;
          
          
        case 2:
          lines = 3;
          //name.en.full = "Blackheart's Bay"
          name.en.full = objMap["name"]
          name.en.short = "BB"
          name.ko.full = "블랙하트 항만"
          name.ko.short = "항만"
          name.ja.full = "Blackheart's Bay"
          name.ja.short = "BB"
          
          break;
          
          
        case 3:
          lines = 2;
          //name.en.full = "Braxis Holdout"
          name.en.full = objMap["name"]
          name.en.short = "BH"
          name.ko.full = "브락시스 항전"
          name.ko.short = "브락"
          name.ja.full = "Braxis Holdout"
          name.ja.short = "BH"
          break;
          
          
        case 4:
          lines = 3;
          //name.en.full = "Cursed Hollow"
          name.en.full = objMap["name"]
          name.en.short = "CH"
          name.ko.full = "저주받은 골짜기"
          name.ko.short = "저골"
          name.ja.full = "Cursed Hollow"
          name.ja.short = "CH"
          break;
          
          
        case 5:
          lines = 3;
          //name.en.full = "Dragon Shire"
          name.en.full = objMap["name"]
          name.en.short = "DS"
          name.ko.full = "용의 둥지"
          name.ko.short = "용둥"
          name.ja.full = "Dragon Shire"
          name.ja.short = "DS"
          
          break;
          
          
        case 6:
          lines = 3;
          //name.en.full = "Garden of Terror"
          name.en.full = objMap["name"]
          name.en.short = "GoT"
          name.ko.full = "공포의 정원"
          name.ko.short = "정원"
          name.ja.full = "Garden of Terror"
          name.ja.short = "GoT"
          break;
          
          
        case 7:
          lines = 2;
          //name.en.full = "Hanamura Temple"
          name.en.full = objMap["name"]
          name.en.short = "HT"
          name.ko.full = "하나무라 사원"
          name.ko.short = "하나"
          name.ja.full = "Hanamura Temple"
          name.ja.short = "HT"
          
          break;
          
          
        case 8:
          lines = 2;
          //name.en.full = "Haunted Mines"
          name.en.full = objMap["name"]
          name.en.short = "HM"
          name.ko.full = "죽음의 광산"
          name.ko.short = "광산"
          name.ja.full = "Haunted Mines"
          name.ja.short = "HM"
          
          break;
          
          
        case 9:
          lines = 3;
          //name.en.full = "Infernal Shrines"
          name.en.full = objMap["name"]
          name.en.short = "IS"
          name.ko.full = "불지옥 신단"
          name.ko.short = "불지옥"
          name.ja.full = "Infernal Shrines"
          name.ja.short = "IS"
          
          break;
          
          
        case 10:
          lines = 3;
          //name.en.full = "Sky Temple"
          name.en.full = objMap["name"]
          name.en.short = "ST"
          name.ko.full = "하늘 사원"
          name.ko.short = "하늘"
          name.ja.full = "Sky Temple"
          name.ja.short = "ST"
          
          break;
          
          
        case 11:
          lines = 3;
          //name.en.full = "Tomb of the Spider Queen"
          name.en.full = objMap["name"]
          name.en.short = "ToSQ"
          name.ko.full = "거미 여왕의 무덤"
          name.ko.short = "거미"
          name.ja.full = "Tomb of the Spider Queen"
          name.ja.short = "ToSQ"
          
          break;
          
          
        case 12:
          lines = 3;
          //name.en.full = "Towers of Doom"
          name.en.full = objMap["name"]
          name.en.short = "ToD"
          name.ko.full = "파멸의 탑"
          name.ko.short = "파탑"
          name.ja.full = "Towers of Doom"
          name.ja.short = "ToD"
          
          break;
          
          
        case 13:
          lines = 3;
          //name.en.full = "Warhead Junction"
          name.en.full = objMap["name"]
          name.en.short = "WJ"
          name.ko.full = "핵탄두 격전지"
          name.ko.short = "핵탄두"
          name.ja.full = "Warhead Junction"
          name.ja.short = "WJ"
          
          break;
          
          
        case 14:
          lines = 3;
          //name.en.full = "Volskaya Foundry"
          name.en.full = objMap["name"]
          name.en.short = "VF"
          name.ko.full = "볼스카야 공장"
          name.ko.short = "볼스"
          name.ja.full = "Volskaya Foundry"
          name.ja.short = "VF"
          
          break;
          
          
        default:
          lines = undefined;
          name.en.full = objMap["name"]
          name.en.short = ""
          name.ko.full = ""
          name.ko.short = ""
          name.ja.full = ""
          name.ja.short = ""
      }
            
      
      
      
      
      
      
      
      
      
      
      let tMap = {
        
        _id: objMap["map_id"]
    
        ,name: {
          
          en: {
            full: name.en.full
            ,short: name.en.short
          }
          ,ko: {
            full: name.ko.full
            ,short: name.ko.short
          }
          ,ja: {
            full: name.ja.full
            ,short: name.ja.short
          }
          
        }
  
  
        ,lines: lines
        ,type: objMap["type"]
        
        ,rankedRotation: rankedRotation
        ,playable: playable
        
      }
      
 /*
   _id: Number
  ,name: String
  
  ,short_name: String
  ,type: String
  ,ranked_rotation: Boolean
  ,playable: Boolean
 */
 
 /*
 "map_id": 1,
    "name": "Battlefield of Eternity",
    "short_name": "BattlefieldOfEternity",
    "type": "standard",
    "ranked_rotation": 1,
    "playable": 1
 */
 
      
      const mongoMap = new Map(tMap);
    
      await mongoMap.save();
      
    }
    
    
     console.log("all Maps have benn saved successfully!");
     
  } catch (error) {
      //console.log("");
      console.error(error);
  }
  
};
    



addAllMaps();