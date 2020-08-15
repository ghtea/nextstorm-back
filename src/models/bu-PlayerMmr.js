const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { v4: uuidv4 } = require('uuid');



var schemaModeMmr = new Schema({
  mmr: Number,
  games_played: Number,
  league_tier: String
});


var schemaRegionMmr = new Schema({
  QM: schemaModeMmr,
  UD: schemaModeMmr,
  HL: schemaModeMmr,
  TL: schemaModeMmr,
  SL: schemaModeMmr, 
  STANDARD: Number
});


var schemaPlayerMmr = new Schema({
  _id: { type: String, default: uuid.v4() },
  updated: Date,
  NA: schemaRegionMmr,
  EU: schemaRegionMmr,
  KR: schemaRegionMmr,
  CN: schemaRegionMmr
}, { collection: 'PlayerMmr_', versionKey: false, strict: false});

module.exports = mongoose.model('PlayerMmr', schemaPlayerMmr);