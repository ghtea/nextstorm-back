import express from 'express';

//import queryString from 'query-string';

import Video from '../models/Video';
import User from '../models/User';
import Comp from '../models/Comp';

var router = express.Router();



// READ Video
router.get('/:idVideo', async (req, res, next) => {
  
  try {
  
    const filter = { _id: req.params.idVideo };
    
    Video.findOne(filter, (err, foundVideo) => {
      if(err) return res.status(500).json({error: err});
      else if(!foundVideo) { return res.status(404).json({error: 'Video not found'}); }
      else { res.json(foundVideo); }
    });
    
  } catch(error) { next(error) }
  
});



router.get('/', (req, res) => {
  
  
  const query = req.query;
    
  const filterSubject = (query.modelSubject && query.idSubject)? 
    { 
      "subject._id": query.idSubject
      ,  "subject.model": query.modelSubject
    }
    : {  };
    
    
  const filter={
    
    $and : [
      
     filterSubject
     
    ]
    
  };
  
  //console.log(filterSubject)
  
  Video.find(filter, (err, listVideo) => {
    if (err) return res.status(500).send({
      error: 'database failure'
    });
    res.json(listVideo);
  })
  
});

  
// CREATE
router.post('/', async (req, res, next) => {
  
  try {
    
    try {
      let mongoVideo = new Video(
        { 
          _id: req.body._id
          , subject: req.body.subject
          
          , author: req.body.author
          
          , type: req.body.type
          , urlContent:  req.body.urlContent
          , idContent:  req.body.idContent
          
          , created: Date.now()
          , updated: Date.now()
        });
        
      
      await mongoVideo.save();
    
    
      const filterUser = {_id: req.body.author};
      const updateUser = {
        $push: { "works.listIdVideo": req.body._id }
      };
      
      await User.updateOne(filterUser, updateUser);
      
      
      if (req.body.subject.model === "Comp") {
        const filterComp = {_id: req.body.subject._id};
        const updateComp = {
          $push: { listIdVideo: req.body._id }
        };
        
        await Comp.updateOne(filterComp, updateComp);
      }
      
      
      res.send("new Video has been created!");
      
    }
    
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    
    
    
  } catch(error) { next(error) }
  
});


// UPDATE

router.put('/:idVideo', async (req, res, next) => {
  try {
  
    const filter = { _id: req.params.idVideo };
    
    
    const update = {
      subject: req.body.subject
          
      , author: req.body.author
      
      , type: req.body.type
      , urlContent: req.body.urlContent 
      , idContent: req.body.idContent 
      
      , updated: Date.now()
    }
    
    try {
      await Video.updateOne(filter, update);
      console.log("successfully updated video");
    } 
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    
    res.send("successfully updated the video");
    
  } catch(error) {next(error)}
  
});


router.put('/like', async (req, res, next) => {
  try {
  
    const query = req.query;
    
    const idVideo = query.idVideo; 
    const idUser = query.idUser;  
    const how = query.how;
    
    
    const filterUser = { _id:idUser};
    const filterVideo = { _id:idVideo};
    let updateUser = {};
    let updateVideo = {};
    
    if (how !== 'false') {
      updateUser = {
        $addToSet: { "likes.listidVideo": idVideo }
      }
      updateVideo = {
        $addToSet: { "listUserLike": idUser }
      }
    }
    else {
      updateUser = {
        $pull: { "likes.listidVideo": idVideo }
      }
      updateVideo = {
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
      await Video.updateOne(filterVideo, updateVideo);
      console.log("successfully updated video");
    } 
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    
    res.send("successfully updated user and video")
    
  } catch(error) {next(error)}
  
});




router.delete('/:idVideo', async (req, res, next) => {
  
  try {
    
    try {
      const filter = { _id: req.params.idVideo };
      await Video.deleteOne(filter);
      
      
      
      const filterUser = {
        "works.listIdVideo": req.params.idVideo
      };
      const updateUser = {
        $pull: { "works.listIdVideo": req.params.idVideo }
      };
      
      await User.updateOne(filterUser, updateUser);
      
      
      
      
      
      
        const filterComp = {
          listIdVideo: req.params.idVideo
        };
        const updateComp = {
          $pull: { listIdVideo: req.params.idVideo }
        };
        
        await Comp.updateOne(filterComp, updateComp);
      
      
      
      res.send("The video has been deleted");
      
    }
    
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    
    
    
  } catch(error) { next(error) }
  
});




module.exports = router;


