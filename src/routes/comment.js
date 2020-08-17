import express from 'express';

//import queryString from 'query-string';

import Comment from '../models/Comment';
import User from '../models/User';
import Comp from '../models/Comp';

var router = express.Router();





// READ Comment
router.get('/:idComment', async (req, res, next) => {
  
  try {
  
    const filter = { _id: req.params.idComment };
    
    Comment.findOne(filter, (err, foundComment) => {
      if(err) return res.status(500).json({error: err});
      else if(!foundComment) { return res.status(404).json({error: 'Comment not found'}); }
      else { res.json(foundComment); }
    });
    
  } catch(error) { next(error) }
  
});


router.get('/', (req, res) => {
  
  const query = req.query;
  
  const listSort = query.listSort || []; // 
  let limitEach = 0; //  매번 한번에 가져올 갯수
  let skipEntire = 0; // 이미 프론트가 받은 총량  300
  
  if (query.limitEach) { limitEach = parseInt(query.limitEach) }
  if (query.skipEntire) { skipEntire = parseInt(query.skipEntire) }
  
  
  const filterSubject = (query.modelSubject && query.idSubject)? 
    { 
      "subject._id": query.idSubject
      ,  "subject.model": query.modelSubject
    }
    : {  };
    
  const filterAuthor = (query.idAuthor)? 
    { 
      author: query.idAuthor
    }
    : {  };
    
  const filterUserLike = (query.idUserLike)? 
    { 
      listUserLike: query.idUserLike
    }
    : {  };
    
    
  const filter={
    
    $and : [
      
     filterSubject
     , filterAuthor
     , filterUserLike
     
    ]
    
  };
  
  let pipeline = [ {"$match": filter} ]
    
  if (listSort.length >0 ) {
    let objAddFields ={};
    let objSort = {};
 
    
    if ( listSort.includes("numberLike") ) { // [ ] 안에 "numberLike", "createdNew", "createdOld"
    
      objAddFields['numberLike'] = { $size: "$listUserLike" }
      objSort['numberLike'] = -1;
      
    } // if "numberLike"
    
    if ( listSort.includes("updatedNew") ) { // [ ] 안에 "numberLike", "createdNew", "createdOld"
      objSort['updated'] = -1;
    } // if "createdNew"
    
    if ( listSort.includes("createdNew") ) { // [ ] 안에 "numberLike", "createdNew", "createdOld"
      objSort['created'] = -1;
    } // if "createdNew"
    
    if ( listSort.includes("createdOld") ) { // [ ] 안에 "numberLike", "createdNew", "createdOld"
      objSort['created'] = 1;
    } // if "createdNew"
      
      // 여러 묶기
      if (listSort.includes("numberLike")) {
        pipeline.push({
          $addFields: objAddFields
        })
      }
      
      pipeline.push({
        $sort: objSort
      })
      
      
  } // if listSort.length >0  
  else { // default sorting
    pipeline.push({
        $sort: {created: -1}
      })
  }
      
  if (limitEach !== 0) {
    pipeline.push({
      "$limit": skipEntire + limitEach
    })
  }
  if (skipEntire !== 0) {
    pipeline.push({
      "$skip": skipEntire
    })
  }
  
      
  Comment.aggregate(pipeline, (err, listComment) => {
    if (err) return res.status(500).send({
      error: 'database failure'
    });
    res.json(listComment);
  })
  
});




// CREATE
router.post('/', async (req, res, next) => {
  
  try {
    
    try {
      
      
      let mongoComment = new Comment(
        { 
          _id: req.body._id
          , subject: req.body.subject
          
          , author: req.body.author
          
          // , language: String
          , content:  req.body.content
          
          , created: Date.now()
          , updated: Date.now()
        });
        
      
      
      await mongoComment.save();
  
  
  
      const filterUser = {_id: req.body.author};
      const updateUser = {
        $push: { "works.listIdComment": req.body._id }
      };
      
      await User.updateOne(filterUser, updateUser);
      
      
      
      if (req.body.subject.model === "Comp") {
        const filterComp = {_id: req.body.subject._id};
        const updateComp = {
          $push: { listIdComment: req.body._id }
        };
        
        await Comp.updateOne(filterComp, updateComp);
      }
      
      
      res.send("new Comment has been created!");
      
    }
    
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    
  } catch(error) { next(error) }
  
});





router.put('/:idComment', async (req, res, next) => {
  try {
  
    const filter = {
      _id: req.params.idComment
    }
    
    const update = {
      subject: req.body.subject
          
      , author: req.body.author
      , content: req.body.content
      , updated: Date.now()
    }
    
    try {
      await Comment.updateOne(filter, update);
      console.log("successfully updated comment");
    } 
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    
    res.send("successfully updated the comment");
    
  } catch(error) {next(error)}
  
});





router.put('/like', async (req, res, next) => {
  try {
  
    const query = req.query;
    
    const idComment = query.idComment; 
    const idUser = query.idUser;  
    const how = query.how;
    
    
    const filterUser = { _id:idUser};
    const filterComment = { _id:idComment};
    let updateUser = {};
    let updateComment = {};
    
    if (how !== 'false') {
      updateUser = {
        $addToSet: { "likes.listIdComment": idComment }
      }
      updateComment = {
        $addToSet: { "listUserLike": idUser }
      }
    }
    else {
      updateUser = {
        $pull: { "likes.listIdComment": idComment }
      }
      updateComment = {
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
      await Comment.updateOne(filterComment, updateComment);
      console.log("successfully updated comment");
    } 
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    
    res.send("successfully updated comment");
    
  } catch(error) {next(error)}
  
});






router.delete('/:idComment', async (req, res, next) => {
  
  try {
    
    try {
      const filter = { _id: req.params.idComment };
      await Comment.deleteOne(filter);
      
      
      
      const filterUser = {
        "works.listIdComment": req.params.idComment
      };
      const updateUser = {
        $pull: { "works.listIdComment": req.params.idComment }
      };
      
      await User.updateOne(filterUser, updateUser);
      
      
      
      
      const filterComp = {
        listIdComment: req.params.idComment
      };
      const updateComp = {
        $pull: { listIdComment: req.params.idComment }
      };
      
      await Comp.updateOne(filterComp, updateComp);
      
      
      
      res.send("The comment has been deleted");
      
    }
    
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    
    
  } catch(error) { next(error) }
  
});




module.exports = router;
