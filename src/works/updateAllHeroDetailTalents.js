import mongoose from 'mongoose';
import dotenv from "dotenv"
import axios from 'axios'
import sourceBuilds from './sourceBuilds'; // for test
import { v4 as uuidv4 } from 'uuid';
//const { v4: uuidv4 } = require('uuid');
import HeroDetail from '../models/HeroDetail';
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



/*
"talent_id": 2423,
      "title": "Pressurized Glands",
      "talent_name": "AbathurMasteryPressurizedGlands",
      "description": "Increases the range of Symbiote's Spike Burst by 25% and decreases the cooldown by 1 second.",
      "status": "playable",
      "hotkey": "Q1",
      "cooldown": "",
      "mana_cost": "",
      "sort": "1",
      "level": 1,
      "icon": "storm_ui_icon_abathur_spikeburst.png"
*/
  

const updateAllHeroDetailTalents = async () => {
  
  try {
    const res_HeroesProfile = await axios.get(`https://api.heroesprofile.com/api/Heroes/Talents?mode=json&api_token=${process.env.TOKEN_HP}`)
    
    
    const dictHeroDetailTalentsOriginal = res_HeroesProfile.data;
    
    
    const list_key_HeroesProfile = Object.keys(dictHeroDetailTalentsOriginal); // name 이자 key_HeroesProfile 이자 _id
   
   
    for (const keyHero of list_key_HeroesProfile) {
      
      const listAllTalentOriginal = dictHeroDetailTalentsOriginal[keyHero];
      
      
      // 'listTalent': 게임내 순서대로 정렬되어있지는 않고, 순서 정보는 오브젝트 안에 있음

      let seriesStageTalent = [
        { _id: uuidv4(), stage: '1', level: "1", listTalent:[] }      // 1
        , { _id: uuidv4(), stage: '4', level: "4", listTalent:[] }    // 4
        , { _id: uuidv4(), stage: '7', level: "7", listTalent:[] }    // 7
        , { _id: uuidv4(), stage: '10', level: "10", listTalent:[] }    // 10
        , { _id: uuidv4(), stage: '13', level: "13", listTalent:[] }    // 13
        , { _id: uuidv4(), stage: '16', level: "16", listTalent:[] }    // 16
        , { _id: uuidv4(), stage: '20', level: "20", listTalent:[] }    // 20
        ];
      
      if (keyHero === "Chromie") {
        seriesStageTalent[0]['level'] = '1';
        seriesStageTalent[1]['level'] = '2';
        seriesStageTalent[2]['level'] = '5';
        seriesStageTalent[3]['level'] = '8';
        seriesStageTalent[4]['level'] = '11';
        seriesStageTalent[5]['level'] = '14';
        seriesStageTalent[6]['level'] = '18';
      }
      
      
      
      for (const talentOriginal of listAllTalentOriginal) {
        if (talentOriginal['status'] === 'playable') {
          
          
          const stage = talentOriginal['level'].toString();
          let level = "";
          
          if (keyHero === "Chromie") {
            switch (stage) {
              case '1':
                level = '1';
                break;
              case '4':
                level = '2';
                break;
              case '7':
                level = '5';
                break;
              case '10':
                level = '8';
                break;
              case '13':
                level = '11';
                break;
              case '16':
                level = '14';
                break;
              case '20':
                level = '18';
                break;
            }
          }
          else {
            level = stage;
          }
          
          
          
          const talent = {
            _id: talentOriginal['talent_id']
            
            , stage: stage
            , level: level
            
            , sort: parseInt(talentOriginal['sort'])
            , hotkey: talentOriginal['hotkey']
            
            , title: talentOriginal['title']
            , description: talentOriginal['description']
            
            , icon: talentOriginal['icon']
          }
          
          switch(stage){
            case('1'): 
              seriesStageTalent[0]['listTalent'].push(talent);
              break;
            case('4'): 
              seriesStageTalent[1]['listTalent'].push(talent);
              break;
            case('7'): 
              seriesStageTalent[2]['listTalent'].push(talent);
              break;
            case('10'): 
              seriesStageTalent[3]['listTalent'].push(talent);
              break;
            case('13'): 
              seriesStageTalent[4]['listTalent'].push(talent);
              break;
            case('16'): 
              seriesStageTalent[5]['listTalent'].push(talent);
              break;
            case('20'): 
              seriesStageTalent[6]['listTalent'].push(talent);
              break;
              
          }
        
        }
        
      }
      
      const filter = {
        _id: keyHero
      }
      
      let update = {
        seriesStageTalent: seriesStageTalent
      }
      

      await HeroDetail.updateOne(filter, update);
      
      console.log(`${keyHero} has been updated`);
    }
    
    const dateCurrnet = Date.now();
    const filterVersion = { _id: 'one' };
    const updateVersion = { 
      $set: {
        'db.HeroDetail.updated': dateCurrnet
      }
    };
    await Version.updateOne(filterVersion, updateVersion);
     
    console.log("all HeroDetail have benn updated successfully!");
     
  } catch (error) {
      //console.log("");
      console.error(error);
  }
  
};
    



updateAllHeroDetailTalents();



/*


{
  "Abathur": [
    {
      "id": 1,
      "short_name": "abathur",
      "alt_name": null,
      "attribute_id": "Abat",
      "role": "Specialist",
      "new_role": "Support",
      "type": "Melee",
      "release_date": "2014-03-13 00:00:00",
      "rework_date": null,
      "talent_id": 2423,
      "title": "Pressurized Glands",
      "talent_name": "AbathurMasteryPressurizedGlands",
      "description": "Increases the range of Symbiote's Spike Burst by 25% and decreases the cooldown by 1 second.",
      "status": "playable",
      "hotkey": "Q1",
      "cooldown": "",
      "mana_cost": "",
      "sort": "1",
      "level": 1,
      "icon": "storm_ui_icon_abathur_spikeburst.png"
    },
    {
      "id": 1,
      "short_name": "abathur",
      "alt_name": null,
      "attribute_id": "Abat",
      "role": "Specialist",
      "new_role": "Support",
      "type": "Melee",
      "release_date": "2014-03-13 00:00:00",
      "rework_date": null,
      "talent_id": 2421,
      "title": "Envenomed Nest",
      "talent_name": "AbathurMasteryEnvenomedNestsToxicNest",
      "description": "Toxic Nests deal 75% more damage over 3 seconds and reduce the Armor of enemy Heroes hit by 10 for 4 seconds.",
      "status": "playable",
      "hotkey": "W1",
      "cooldown": "",
      "mana_cost": "",
      "sort": "2",
      "level": 1,
      "icon": "storm_ui_icon_abathur_toxicnest.png"
    },
    
    ... ]

*/