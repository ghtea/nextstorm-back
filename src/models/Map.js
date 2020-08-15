const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { v4: uuidv4 } = require('uuid');




var schemaMap = new Schema({
  _id: String  // Heroes Profile API 에서의 id 가져옴
  
  ,name: {
    en: { full: String, short: String }
    , ko: { full: String, short: String }
    , ja: { full: String, short: String }
  }
  
  ,lines: Number
  ,type: String
  
  ,rankedRotation: Boolean
  ,playable: Boolean
  
}, { collection: 'Map_', versionKey: false, strict: false});



module.exports = mongoose.model('Map', schemaMap);