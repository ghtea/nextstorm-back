
// have not test here yet

import mongoose from 'mongoose';
import dotenv from "dotenv"
import axios from 'axios'


const HeroStats = require('../models/HeroStats');
const HeroDetail = require('../models/HeroDetail');

dotenv.config({ 
  path: './.env' 
});



// mongo db 와 연결
mongoose
.connect(process.env.DB_URL, {
useUnifiedTopology: true,
useNewUrlParser: true,
})
.then(() => console.log('DB Connected!'))
.catch(err => {
console.log(`DB Connection Error: ${err.message}`);
});


const createAllHero = async () => {
  
  try {
    const res = await axios.get(`https://api.heroesprofile.com/api/Heroes?mode=json&api_token=${process.env.TOKEN_HP}`)
    const dictHeroOriginal = res.data;
    
    const list_key_HeroesProfile = Object.keys(dictHeroOriginal); // name 이자 key_HeroesProfile 이자 _id
   
    for (const key_HeroesProfile of list_key_HeroesProfile) {
      
      
      const tHeroStats = {
        
        _id: key_HeroesProfile
    
        ,key_HeroesProfile: key_HeroesProfile
        
        
      }
      
      const tHeroDetail = {
        
        _id: key_HeroesProfile
    
        ,key_HeroesProfile: key_HeroesProfile
        
        
      }
      
      const mongoHeroStats = new HeroStats(tHeroStats);
    
      //await mongoHeroStats.save();
      
      
      const mongoHeroDetail = new HeroDetail(tHeroDetail);
    
      //await mongoHeroDetail.save();
     
    }
    
     console.log("all HeroStats/HeroDetail have benn saved successfully!");
     
  } catch (error) {
      //console.log("");
      console.error(error);
  }
  
};
    



createAllHero();