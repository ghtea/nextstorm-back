import express from 'express';

import User from '../models/User';
import makeUserMmr from '../works/makeUserMmr'

var router = express.Router();



// READ User
router.get('/public/:idUser', async (req, res, next) => {
  
  try {
  
    const filter = { _id: req.params.idUser };
    
    User.findOne(filter, (err, foundUser) => {
      if(err) return res.status(500).json({error: err});
      else if(!foundUser) { return res.status(404).json({error: 'User not found'}); }
      else { 
        
        //console.log(foundUser)
        
        const infoUser = {
          
          _id: foundUser._id
          , battletag: foundUser.battletagConfirmed
          
          , profile: foundUser.profile
          , works : foundUser.works
          , likes: foundUser.likes
        }
        
        res.json(infoUser); 
        
        
      }
    });
    
  } catch(error) { next(error) }
  
});





router.post('/update-mmr', async (req, res, next) => {
  
  try {
    
    const { _id, battletag } = req.body; 
    
    
    let foundUser = null;
    try {
      // 아이디로 계정 찾기
      foundUser = await User.findOne({ _id: _id }).exec();
    } 
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    if(!foundUser) {
      res.json({code_situation: "alocal04"});
      return;
    }
    
    
    // 해당 id의 유저를 찾으면 바로 진행
    else {
      
      let objMmr = null;
      try {
        objMmr = await makeUserMmr( battletag );
      } 
      catch (error) {
        console.log(error);
        res.json({code_situation: "basic02"});// error in Heroes Profile api
        return;
      }
      
      
      
      
      const update = {
        mmr: objMmr
        , updatedMmr: Date.now()
      };

      try {
        await User.updateOne({ _id: _id }, update);
      } 
      catch (error) {
        console.log(error);
        res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
        return;
      }
      
      console.log("successfully updated mmr!");
      res.json(objMmr); // mmr 정보로 응답합니다.
      //console.log(res)
  
    } // else

    
  } catch(error) { next(error) }
  
});





router.put('/profile/:idUser', async (req, res, next) => {
  try {
    
    const idUser = req.params.idUser;
    
    
    const query = req.query;
    
    const shape = query.shape; 
    const palette = query.palette; 
    const border = query.border; 
    
    
    const filter = { _id : idUser }
    
    let foundUser = {};
    try {
      foundUser = await User.findOne(filter);
    } 
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    
    const listIdShapeBefore = foundUser.profile.listIdShape;
    const listIdPaletteBefore = foundUser.profile.listIdPalette;
    const listIdBorderBefore = foundUser.profile.listIdBorder;
    
    let listIdShapeNew = listIdShapeBefore.filter(element => element !== shape);
    listIdShapeNew.unshift(shape);
    
    let listIdPaletteNew = listIdPaletteBefore.filter(element => element !== shape);
    listIdPaletteNew.unshift(palette);
    
    let listIdBorderNew = listIdBorderBefore.filter(element => element !== shape);
    listIdBorderNew.unshift(border);  
    
    
    const update = {
      
      profile: {
        listIdShape: listIdShapeNew
        , listIdPalette: listIdPaletteNew
        , listIdBorder: listIdBorderNew
      }
      
    };
    
    
    
    try {
      await User.updateOne(filter, update);
      console.log("successfully updated user's profile");
    } 
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    
    res.send("successfully updated user's profile")
    
  } catch(error) {next(error)}
  
});




// just get data from heroes profile
router.get('/player-hero-all/:battletag', async (req, res, next) => {
  
  try {
  
    const battletag = req.params.battletag;
    
    let urlBattletag = encodeURIComponent(battletag);
    let url = `https://api.heroesprofile.com/api/Player/Hero/All?mode=jso&battletag=${urlBattletag}&region=${idRegion}&game_type=Storm%20League&api_token=${process.env.TOKEN_HP}`
    
    // region=1&
      
    const response = await axios.get(`${url}`);
    const objPlayerOriginal = response.data;
    
      
    
  } catch(error) { next(error) }
  
});



module.exports = router;