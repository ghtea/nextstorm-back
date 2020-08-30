const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { v4: uuidv4 } = require('uuid');
// https://www.npmjs.com/package/uuid



/*
, msg: {
    
    type: String
    
    , content: {
      
      ko: String
      , ja: String
      , en: String
    }
*/


var schemaVersion = new Schema({
  _id: String
  
  
  , game: {
    
    minor: String
    , major: String
    
    , checkedFirst: Date
    , checkedLast: Date
    
  }

  
  , db: {
    
    HeroBasic: { updated: Date, version: String }   // minor patch name
    , HeroDetail: { updated: Date, version: String }  // minor patch name
    
    , HeroStats: { updated: Date, version: String }  // 
    , Map: { updated: Date, version: String }
  }
  
  
  , NextStorm : {
    
    published: {
      date: String
      , version: String 
      , message: {
        situation: String 
        , content: {
          ko: String
          , ja: String
          , en: String
        }
      }
    }
    
    , developing: {
      date: String
      , version: String 
      , message: {
        situation: String 
        , content: {
          ko: String
          , ja: String
          , en: String
        }
      }
    }
    
  }
  
  
}, { collection: 'Version_', versionKey: false, strict: false});



module.exports = mongoose.model('Version', schemaVersion);