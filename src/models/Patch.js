const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { v4: uuidv4 } = require('uuid');
// https://www.npmjs.com/package/uuid




var schemaPatch = new Schema({
  _id: String
  
  , minor: String
  , major: String
  
  
  , checkedFirst: Date
  , checkedLast: Date
  
}, { collection: 'Patch_', versionKey: false, strict: false});



module.exports = mongoose.model('Patch', schemaPatch);