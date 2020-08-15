const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');



const schemaStat = new Schema({
  
  _id: { type: String, default: uuidv4() }
  , updated: { type: Date, default: Date.now }
  
  
  , which1: String // entire, role, hero
  , which2: String // entire, tanker,...    , Alarak, ...
  
  , QM: {
    mmr: Number
    , games_played : Number
    , tier: String
    
    , wins:  Number
    , losses: Number
    , win_rate: Number
  }
  
  , SL: {
    mmr: Number
    , games_played : Number
    , tier: String
    
    , wins:  Number
    , losses: Number
    , win_rate: Number
  }
  
});



// 지역이 다르면, 우선 플레이어 별도로!
const Player = new Schema({
	
   _id: { type: String, default: uuidv4() }
  , battletag: String
  
  , region: String // NA, EU, KR, CN
  
  
  , stats: {
    
    entire: schemaStat    // entire, roles, heroes 구조 다 다르니 주의!
    
    , roles: {
      
      "Tanker" : schemaStat
      , "Bruiser": schemaStat
      , "Melee Assassin": schemaStat
      , "Ranged Assassin": schemaStat
      , "Healer": schemaStat
      , "Support": schemaStat
      
    }
    
    , heroes: [schemaStat] // 요청할 때마다 하나씩 추가
    
  }
  
  /*
  , heroes:{
    QM: 
    , UD: 
    , SL:  
  }
  */
  
  , started: { type: Date, default: Date.now }
  
    
}, { collection: 'Player_', versionKey: false, strict: false} );




module.exports = mongoose.model('Player', Player);