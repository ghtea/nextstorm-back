import express from 'express';

//import queryString from 'query-string';

import Comp from '../models/Comp';
import Comment from '../models/Comment';
import Video from '../models/Video';
import User from '../models/User';

var router = express.Router();



// READ Comp
router.get('/:idComp', async (req, res, next) => {
  
  try {
  
    const filter = { _id: req.params.idComp };
    
    Comp.findOne(filter, (err, foundComp) => {
      if(err) return res.status(500).json({error: err});
      else if(!foundComp) { return res.status(404).json({error: 'Comp not found'}); }
      else { res.json(foundComp); }
    });
    
  } catch(error) { next(error) }
  
});



router.get('/', (req, res) => {
  
  
  const query = req.query;
    
  const filterSize = (query.filterSize && query.filterSize.length !== 0 )? 
    { size: { $in: query.filterSize } }
    : {  };
    
  const filterTag = (query.filterTag && query.filterTag.length !== 0 )? 
    { listTag: { $all: query.filterTag } }
    : {  };
    
  const filterMap = (query.filterMap && query.filterMap.length !== 0 )? 
    { listIdMap: { $all: query.filterMap } }
    : {  };
    
  const filterHero = (query.filterHero && query.filterHero.length !== 0 )? 
    { listIdAllHero: { $all: query.filterHero } }
    : {  };
    
  const filter={
    
    $and : [
      
     filterSize
     , filterTag
     , filterMap
     , filterHero
     
    ]
    
  };
  
  //console.log(filter)
  
  Comp.find(filter, (err, listComp) => {
    if (err) return res.status(500).send({
      error: 'database failure'
    });
    res.json(listComp);
  })
  
});



router.post('/', async (req, res, next) => {
  
  try {
    
    const date =  Date.now();
    
    const compReq = req.body.comp;
    const listPosition = compReq.listPosition;
    
    const listIdMainHero = listPosition.map(element => element.listIdHero[0]);

    const listListIdHero = listPosition.map(element => element.listIdHero);
    
    // https://stackoverflow.com/questions/5080028/what-is-the-most-efficient-way-to-concatenate-n-arrays
    const listIdAllHero = [].concat.apply([], listListIdHero);
    
    let tComp = new Comp(
      { 
        _id: compReq._id
        , author: compReq.author
        
        , title: compReq.title
        
        
        , listPosition: compReq.listPosition
        , size: listPosition.length
        , listIdMainHero: listIdMainHero
        , listIdAllHero: listIdAllHero
        
        , listIdMap: compReq.listIdMap
        , listTag: compReq.listTag
        
        , listIdComment: compReq.listIdComment
        , listIdVideo: compReq.listIdVideo
        
        , listUserLike: compReq.listUserLike
        
        , created: date
        , updated: date
        //,version: compReq._id
        
        
      });
      
    await tComp.save();
    
    // 유저의 works 정보에 추가
    const update_works_comp = {
        $push: {
          "works.listIdComp": compReq._id
        }
      };
    await User.updateOne({ _id: compReq.author }, update_works_comp);
    
    
    
    if (req.body.comment) {
      const commentReq = req.body.comment;
    
      let tComment = new Comment(
        { 
           _id: commentReq._id
          , subject: commentReq.subject
          
          , author: commentReq.author
          
          , language: commentReq.language
          , content: commentReq.content
          
          , listUserLike: commentReq.listUserLike
          
          , created: date
          , updated: date
        });
        
      await tComment.save();
      
      // 유저의 works 정보에 추가
      const update_works_comment = {
          $push: {
            "works.listIdComment": commentReq._id
          }
        };
      await User.updateOne({ _id: commentReq.author }, update_works_comment);
    }
    
    
    
    if (req.body.video) {
      const videoReq = req.body.video;
    
      let tVideo = new Video(
        { 
          _id: videoReq._id
          , subject:  videoReq.subject
          
          , author:  videoReq.author
          
          , type: videoReq.type
          , urlContent:  videoReq.urlContent
          , idContent:  videoReq.idContent
          
          , listUserLike:  videoReq.listUserLike
          
          ,created: date
          ,updated: date
        });
        
      await tVideo.save();
      
      // 유저의 works 정보에 추가
      const update_works_video = {
          $push: {
            "works.listIdVideo": videoReq._id
          }
        };
      await User.updateOne({ _id: videoReq.author }, update_works_video);
    }
    
    
    res.send("new comp has been created!");
    
  } catch(error) { next(error) }
  
});








//UPDATE
router.put('/:idComp', async (req, res, next) => {
  
  try {
    
    const filter = { _id: req.params.idComp };
    
    const date =  Date.now();
    
    const compReq = req.body;
    
    let listPosition = compReq.listPosition;
    
    
    const listIdMainHero = listPosition.map(element => element.listIdHero[0]);

    const listListIdHero = listPosition.map(element => element.listIdHero);
    
    // https://stackoverflow.com/questions/5080028/what-is-the-most-efficient-way-to-concatenate-n-arrays
    const listIdAllHero = [].concat.apply([], listListIdHero);
    
    let update = 
      { 
        
        title: compReq.title
        
        
        , listPosition: listPosition
        , size: listPosition.length
        , listIdMainHero: listIdMainHero
        , listIdAllHero: listIdAllHero
        
        , listIdMap: compReq.listIdMap
        , listTag: compReq.listTag
        
        , updated: date
      };
    
      
    await Comp.updateOne( filter , update);
    
    res.send("comp has benn updated!");
    
  } catch(error) { next(error) }
  
});





router.put('/like/:idComp', async (req, res, next) => {
  try {
  
    const query = req.query;
    
    
    const idComp = req.params.idComp;
    const idUser = query.idUser;  
    const how = query.how;
    
    
    
    const filterUser = { _id:idUser};
    const filterComp = { _id:idComp};
    let updateUser = {};
    let updateComp = {};
    
    if (how !== 'false') {
      updateUser = {
        $addToSet: { "likes.listIdComp": idComp }
      }
      updateComp = {
        $addToSet: { "listUserLike": idUser }
      }
    }
    else {
      updateUser = {
        $pull: { "likes.listIdComp": idComp }
      }
      updateComp = {
        $pull: { "listUserLike": idUser }
      }
    }
    
    
    try {
      await User.updateOne(filterUser, updateUser);
      console.log("successfully updated user");
    } 
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    
    try {
      await Comp.updateOne(filterComp, updateComp);
      console.log("successfully updated comp");
    } 
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    
    res.send("successfully updated user and comp")
    
  } catch(error) {next(error)}
  
});
/*
router.put('/', async (req, res, next) => {
  try {
  
    if (req.body.filter && req.body.update) {
      
      const filter = req.body.filter;
      const update = req.body.update;
      
      await Comp.updateOne(filter, update);
      
      res.send("Comp has been updated!");  // res 에 아무것도 안주면 응답 없다고 에러 발생!
      
      
    } else { res.send('filter & update obj are necessary')  }
    
  } catch(error) {next(error)}
  
});
*/



// DELETE Comp
router.delete('/:idComp', async (req, res, next) => {
  
  try {
    
    try {
      const filter = { _id: req.params.idComp };
      await Comp.deleteOne(filter);
      
      
      
      const filterUser = {
        "works.listIdComp": req.params.idComp
      };
      const updateUser = {
        $pull: { "works.listIdComp": req.params.idComp }
      };
      
      await User.updateOne(filterUser, updateUser);
      
      res.send("The comp has been deleted");
      
    }
    
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    
  } catch(error) { next(error) }
  
});



module.exports = router;





