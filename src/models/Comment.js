const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { v4: uuidv4 } = require('uuid');


var schemaComment = new Schema({
  _id: { type: String, default: uuidv4() }
  , subject: { _id:String, model:String} // where this comment belong to, ex:  "dfdfhefef-fdfd" , "Comp"
  
  , author: String
  
  , language: String
  , content: String
  
  , listUserLike: { type: [String], default: [] }
  , listUserReport: { type: [String], default: [] }
  
  ,created: Date
  ,updated: Date
  
}, { collection: 'Comment_', versionKey: false, strict: false});



module.exports = mongoose.model('Comment', schemaComment);