const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { v4: uuidv4 } = require('uuid');


var schemaRoleGames = new Schema({
  _id: { type: String, default: uuidv4() }
  
  , Tank: Number
  , Bruiser: Number
  , "Melee Assassin": Number
  , "Ranged Assassin": Number
  , Healer: Number
  , Support: Number

  , updated: Date
  
});


var schemaMmr = new Schema({
  _id: { type: String, default: uuidv4() }
  
  , standard: {
    NA: Number
    , EU: Number
    , KR: Number
    , CN: Number 
  }
  
  , manual: {
    NA: Number
    , EU: Number
    , KR: Number
    , CN: Number 
  }
  
  , updated: Date
  
});



var schemaPlayerEntry = new Schema({
  _id: { type: String, default: uuidv4() }
  , name: String
  
  , status: String
  
  , mmr: schemaMmr
  , regions:[String] // 특정 게임 이상 지역, 그 이하면 그나마 게임한 지역 1개
  
  , roles: [String]
  
  , groups: [String]
  
  , tags: [String]
  
});




var schemaTeamGenerated = new Schema({
  _id: { type: String, default: uuidv4() }
  , listPlayerBattletag: [String]
  , name: String
  , group: String
});

var schemaResultTeam = new Schema({
  _id: { type: String, default: uuidv4() }
  , title: String
  , added: Date
  , listGroup: [String]
  , listTeam: [schemaTeamGenerated]
});
 
 
 
 
var schemaOptionTeam = new Schema({
  _id: { type: String, default: uuidv4() }
  , region: String
  , numberTeams: Number
  
  , numberGroups: Number
  , listGroup: [String]
});


var schemaPlanTeam = new Schema({
  _id: { type: String, default: uuidv4() }
  , password: String
  
  , listAuthor: [String]
  
  , title: String
  
  , created: Date
  , accessed: Date
  
  , listPlayerEntry: [schemaPlayerEntry]
  
  , listResult: [schemaResultTeam]
  
  , option: schemaOptionTeam
  
}, { collection: 'PlanTeam_', versionKey: false, strict: false});



module.exports = mongoose.model('PlanTeam', schemaPlanTeam);