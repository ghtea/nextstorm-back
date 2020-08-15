
// have not test here yet

import mongoose from 'mongoose';
import dotenv from "dotenv"
import axios from 'axios'


let HeroBasic = require('../models/HeroBasic');

dotenv.config({ 
  path: './.env' 
});




// HeroesTalents 에서 각 영웅별 tags 가져오기
// "tags": [ "Ganker","Helper","InstantTraveler","RoleSpecialist","TowerPusher","WaveClearer"],
const return_tags_each_hero = async (key_HeroesTalents) => {
  
  const res_HeroesTalents = await axios.get(`https://heroes-talents.avantwing.com/hero/${key_HeroesTalents}.json`);
  //const objHero_HeroesTalents = JSON.parse(res_HeroesTalents.data);
  const objHero_HeroesTalents = res_HeroesTalents.data;
  
  //console.log(typeof(objHero_HeroesTalents))
  console.log(objHero_HeroesTalents);
  
  
  const tags = objHero_HeroesTalents['tags']
  
  //const tags = Object.keys(tagsOriginal)
  
  console.log(typeof(tags[0]))
  
  return tags;
  
}

return_tags_each_hero("alarak");