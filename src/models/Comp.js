const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { v4: uuidv4 } = require('uuid');
// https://www.npmjs.com/package/uuid



var schemaPosition = new Schema({
  _id: String
  ,index: Number
  ,explanation: String
  ,listIdHero: [String]
});



var schemaComp = new Schema({
  _id: { type: String, default: uuidv4() }
  , author: String
  
  , title: String
  
  , listPosition: [schemaPosition]
  , size: Number
  , listIdMainHero: [String]
  , listIdAllHero: [String]
  
  , listIdMap: [String]
  , listTag: [String]
  
  , listIdComment: [String]  // list of _id (Comment)
  , listIdVideo: [String] // list of _id (Video)
  //, listIdLink: [String] // list of _id (Link)
  
  , listUserLike: [String] 
  
  , created: Date
  , updated: Date
  , version: String
  
}, { collection: 'Comp_', versionKey: false, strict: false});



module.exports = mongoose.model('Comp', schemaComp);