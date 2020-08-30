
const mongoose = require('mongoose');
const Schema = mongoose.Schema;




const schemaBuild = new Schema({
  _id: String
  
  , games_played: Number
  , win_rate: Number
  , listTalent: [String]
  
});




const schemaHeroStats = new Schema({
  _id: String // full main english name = key_HeroesProfile
  
  ,key_HeroesProfile: String // key of object in HeroesProfile, = name in HeroesProfile = name 
  
  ,listTopBuild: [schemaBuild]
  
  , updated : {
    listTopBuild: Date
  }
  
}, { collection: 'HeroStats_', versionKey: false, strict: false});

module.exports = mongoose.model('HeroStats', schemaHeroStats);


