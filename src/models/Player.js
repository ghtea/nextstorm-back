const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');




// Heroes Profile 이용하기 편하게 해주는 데이터 만 저장 
// 예: battletag 별로 활동 region list 기록
// 예: update 날짜

const Player = new Schema({
	  
	 // _id: { type: String, default: uuidv4() } 하면  E11000 duplicate key error collection 가 발생한다...
   _id: String
  , battletag: String
  
  , orderNameRegion: [String] // NA, EU, KR, CN
  
  , stats: {
    general_String: String
    , heroes_String: String
  }
  
  , updated: {
    orderNameRegion: Date
    , general: Date
    , heroes: Date
  }
    
}, { collection: 'Player_', versionKey: false, strict: false} );




module.exports = mongoose.model('Player', Player);