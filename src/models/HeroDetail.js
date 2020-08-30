
const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const schemaTalent = new Schema({
  
  _id: String
  
  , stage: String
  , level: String
  
  
  , sort: Number
  , hotkey: String
  
  
  , title: String
  , description: String
  
  
  , icon: String
  
  // , status: String 
  
})



const schemaStageTalent = new Schema({
  _id: String
  
  // because of Chromie!!
  , stage: String
  , level: String
  
  // 게임내 순서대로 정렬되어있지는 않고, 순서 정보는 오브젝트 안에 있음
  , listTalent: [schemaTalent]
});




const schemaHeroDetail = new Schema({
  _id: String // full main english name = key_HeroesProfile
  
  , key_HeroesProfile: String // key of object in HeroesProfile, = name in HeroesProfile = name 
  
  , seriesStageTalent: [ schemaStageTalent ]
  
  , updated : {
    seriesStageTalent: Date
  }
  
}, { collection: 'HeroDetail_', versionKey: false, strict: false});

module.exports = mongoose.model('HeroDetail', schemaHeroDetail);





/*

Heroes Profile /Heroes/Talents

"Abathur": [
  {
      "id": 1, "short_name": "abathur", "alt_name": null, "attribute_id": "Abat", "role": "Specialist", "new_role": "Support", "type": "Melee", "release_date": "2014-03-13 00:00:00", "rework_date": null,
      
      
      "talent_id": 2423,
      "title": "Pressurized Glands",
      "talent_name": "AbathurMasteryPressurizedGlands",
      "description": "Increases the range of Symbiote's Spike Burst by 25% and decreases the cooldown by 1 second.",
      "status": "playable",
      "level": 1,
      "icon": "storm_ui_icon_abathur_spikeburst.png"
      "sort": "1",
      "hotkey": "Q1",
      
      
      
      "cooldown": "", "mana_cost": "",
      
      
      
    },
  ... ]
    
*/