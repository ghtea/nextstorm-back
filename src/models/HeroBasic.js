var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaHeroBasic = new Schema({
  _id: String // full main english name = key_HeroesProfile
  
  ,key_HeroesProfile: String // key of object in HeroesProfile, = name in HeroesProfile = name 
  ,short_name_HeroesProfile: String // = short_name in HeroesProfile
  
  ,key_HeroesTalents: String // = key of object in HeroesTalents, = shortName in HeroesProfile
  
  ,name: String // = key_HeroesProfile
  ,role: String
  ,type: String
  
  ,translations: {
    ko: String
    , ja: String
    , en: String
    , zh: String
  }
  
  ,tags: [String]
  
}, { collection: 'HeroBasic_', versionKey: false, strict: false});

module.exports = mongoose.model('HeroBasic', schemaHeroBasic);



/* ex) HeroesProfile
{
  "Abathur": {
    "id": 1,
    "name": "Abathur",
    "short_name": "abathur",
    "alt_name": null,
    "role": "Specialist",
    "new_role": "Support",
    "type": "Melee",
    "release_date": "2014-03-13 00:00:00",
    "rework_date": null,
    "attribute_id": "Abat",
    "build_copy_name": "Abathur",
    "translations": [
      "abathur",
      "abatur",
      "абатур",
      "阿巴瑟",
      "아바투르"
    ]
  }, ...
}
  */
  
  
  /* ex) HeroesTalents
  
  {
  "id": 1,
  "shortName": "abathur",
  "hyperlinkId": "Abathur",
  "attributeId": "Abat",
  "cHeroId": "Abathur",
  "cUnitId": "HeroAbathur",
  "name": "Abathur",
  "icon": "abathur.png",
  "role": "Specialist",
  "expandedRole": "Support",
  "type": "Melee",
  "releaseDate": "2014-03-13",
  "releasePatch": "0.1.1.00000",
  "tags": [
    "Ganker",
    "Helper",
    "InstantTraveler",
    "RoleSpecialist",
    "TowerPusher",
    "WaveClearer"
  ],
  "abilities": {...}
  }
  
  */
  