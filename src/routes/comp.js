import express from 'express';

//import queryString from 'query-string';

import Comp from '../models/Comp';
import Comment from '../models/Comment';
import Video from '../models/Video';
import User from '../models/User';

var router = express.Router();



// READ Comp
router.get('/:idComp', async(req, res, next) => {

  try {

    const filter = {
      _id: req.params.idComp
    };

    Comp.findOne(filter, (err, foundComp) => {
      if (err) return res.status(500).json({
        error: err
      });
      else if (!foundComp) {
        return res.status(404).json({
          error: 'Comp not found'
        });
      } else {
        res.json(foundComp);
      }
    });

  } catch (error) {
    next(error)
  }

});



router.get('/', (req, res) => {


  const query = req.query;


  const listSort = query.listSort || []; // 
  let limitEach = 0; //  매번 한번에 가져올 갯수
  let skipEntire = 0; // 이미 프론트가 받은 총량  300

  if (query.limitEach) {
    limitEach = parseInt(query.limitEach)
  }
  if (query.skipEntire) {
    skipEntire = parseInt(query.skipEntire)
  }

  //console.log(query.idUser)
  const filterReport = (query.idUser) ? {
    listUserReport: {
      $nin: [query.idUser]
    }
  } : {};

  const filterAuthor = (query.idAuthor) ? {
    author: query.idAuthor
  } : {};

  const filterUserLike = (query.idUserLike) ? {
    listUserLike: query.idUserLike
  } : {};
  
  
  const filterSize = (query.filterSize && JSON.parse(query.filterSize).length !== 0) ? {
    size: {
      $in: JSON.parse(query.filterSize).map(element => parseInt(element))
    }
  } : {};
  
  const filterTag = (query.filterTag && JSON.parse(query.filterTag).length !== 0) ? {
    listTag: {
      $all: JSON.parse(query.filterTag)
    }
  } : {};

  const filterMap = (query.filterMap && JSON.parse(query.filterMap).length !== 0) ? {
    listIdMap: {
      $all: JSON.parse(query.filterMap)
    }
  } : {};

  const filterHero = (query.filterHero && JSON.parse(query.filterHero).length !== 0) ? {
    listIdAllHero: {
      $all: JSON.parse(query.filterHero)
    }
  } : {};

  const filter = {

    $and: [

      filterReport, filterSize, filterTag, filterMap, filterHero

      , filterAuthor, filterUserLike
    ]

  };
  
  console.log(limitEach)
  console.log(skipEntire)
  // https://stackoverflow.com/questions/4421207/how-to-get-the-last-n-records-in-mongodb
  // https://docs.mongodb.com/manual/reference/operator/aggregation/sort/
  // https://stackoverflow.com/questions/24160037/skip-and-limit-in-aggregation-framework
  let pipeline = [{
    "$match": filter
  }]

  if (listSort.length > 0) {
    let objAddFields = {};
    let objSort = {};


    if (listSort.includes("numberLike")) { // [ ] 안에 "numberLike", "createdNew", "createdOld"
      objAddFields['numberLike'] = {
        $size: "$listUserLike"
      }
      objSort['numberLike'] = -1;

    } // if "numberLike"

    if (listSort.includes("updatedNew")) { // [ ] 안에 "numberLike", "createdNew", "createdOld"
      objSort['updated'] = -1;
    } // if "createdNew"

    if (listSort.includes("createdNew")) { // [ ] 안에 "numberLike", "createdNew", "createdOld"
      objSort['created'] = -1;
    } // if "createdNew"

    if (listSort.includes("createdOld")) { // [ ] 안에 "numberLike", "createdNew", "createdOld"
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
      $sort: {
        created: -1
      }
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



  //const pipelineTest = [ pipeline[1] ]
  //console.log(pipelineTest[0]['$match']['$and'][0]['size']['$in'])

  Comp.aggregate(pipeline, (err, listComp) => {
    if (err) return res.status(500).send({
      error: 'database failure'
    });
    res.json(listComp);
  })

});





router.post('/', async(req, res, next) => {

  try {

    const date = Date.now();

    const compReq = req.body.comp;
    const listPosition = compReq.listPosition;

    const listIdMainHero = listPosition.map(element => element.listIdHero[0]);

    const listListIdHero = listPosition.map(element => element.listIdHero);

    // https://stackoverflow.com/questions/5080028/what-is-the-most-efficient-way-to-concatenate-n-arrays
    const listIdAllHero = [].concat.apply([], listListIdHero);

    let tComp = new Comp({
      _id: compReq._id,
      author: compReq.author

      ,
      title: compReq.title


      ,
      listPosition: compReq.listPosition,
      size: listPosition.length,
      listIdMainHero: listIdMainHero,
      listIdAllHero: listIdAllHero

      ,
      listIdMap: compReq.listIdMap,
      listTag: compReq.listTag

      ,
      listIdComment: compReq.listIdComment,
      listIdVideo: compReq.listIdVideo

      ,
      listUserLike: compReq.listUserLike

      ,
      created: date,
      updated: date
        //,version: compReq._id


    });

    await tComp.save();


    if (req.body.comment) {
      const commentReq = req.body.comment;

      let tComment = new Comment({
        _id: commentReq._id,
        subject: commentReq.subject

        ,
        author: commentReq.author

        ,
        language: commentReq.language,
        content: commentReq.content

        ,
        listUserLike: commentReq.listUserLike

        ,
        created: date,
        updated: date
      });

      await tComment.save();

      
    }



    if (req.body.video) {
      const videoReq = req.body.video;

      let tVideo = new Video({
        _id: videoReq._id,
        subject: videoReq.subject

        ,
        author: videoReq.author

        ,
        type: videoReq.type,
        urlContent: videoReq.urlContent,
        idContent: videoReq.idContent

        ,
        listUserLike: videoReq.listUserLike

        ,
        created: date,
        updated: date
      });

      await tVideo.save();

      
    }


    res.send("new comp has been created!");

  } catch (error) {
    next(error)
  }

});








//UPDATE
router.put('/:idComp', async(req, res, next) => {

  try {

    const filter = {
      _id: req.params.idComp
    };

    const date = Date.now();

    const compReq = req.body;

    let listPosition = compReq.listPosition;


    const listIdMainHero = listPosition.map(element => element.listIdHero[0]);

    const listListIdHero = listPosition.map(element => element.listIdHero);

    // https://stackoverflow.com/questions/5080028/what-is-the-most-efficient-way-to-concatenate-n-arrays
    const listIdAllHero = [].concat.apply([], listListIdHero);

    let update = {

      title: compReq.title


      ,
      listPosition: listPosition,
      size: listPosition.length,
      listIdMainHero: listIdMainHero,
      listIdAllHero: listIdAllHero

      ,
      listIdMap: compReq.listIdMap,
      listTag: compReq.listTag

      ,
      updated: date
    };


    await Comp.updateOne(filter, update);

    res.send("comp has benn updated!");

  } catch (error) {
    next(error)
  }

});





router.put('/like/:idComp', async(req, res, next) => {
  try {

    const query = req.query;


    const idComp = req.params.idComp;
    const idUser = query.idUser;
    const how = query.how;



    const filterComp = {
      _id: idComp
    };
    let updateComp = {};

    if (how !== 'false') {
      updateComp = {
        $addToSet: {
          "listUserLike": idUser
        }
      }
    } else {
      updateComp = {
        $pull: {
          "listUserLike": idUser
        }
      }
    }

    try {
      await Comp.updateOne(filterComp, updateComp);
      console.log("successfully updated comp");
    } catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }

    res.send("successfully updated user and comp")

  } catch (error) {
    next(error)
  }

});



router.put('/report/:idComp', async(req, res, next) => {
  try {

    const query = req.query;


    const idComp = req.params.idComp;
    const idUser = query.idUser;
    const typeUser = query.typeUser;


    const filterComp = {
      _id: idComp
    };
    let updateComp = {
      $addToSet: {
        "listUserReport": idUser
      }
    };


    try {
      const foundComp = await Comp.findOne(filterComp);
      console.log(foundComp);
      let lengthReportAlready = 0;
      if (foundComp.listUserReport) {
        lengthReportAlready = foundComp.listUserReport.length;
      }

      let lengthLike = 0;
      if (foundComp.listUserLike) {
        lengthLike = foundComp.listUserLike.length;
      }

      console.log(lengthReportAlready);
      console.log(lengthLike);
      if (lengthReportAlready >= lengthLike * 5 + 5 || typeUser === 'administrator') {
        // 리포트 수가 좋아요 대비해서 너무 많으면 삭제 or 관리자이면
        await Comp.deleteOne(filterComp);


        const filterUser = {
          "works.listIdComp": idComp
        };
        const updateUser = {
          $pull: {
            "works.listIdComp": idComp
          }
        };
        await User.updateOne(filterUser, updateUser);

        console.log("successfully delete comp");
        
      } else {
        // 너무 많지 않으면 그냥 리스트에 추가
        await Comp.updateOne(filterComp, updateComp);
        console.log("successfully updated comp");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }

    res.send("successfully applied report");

  } catch (error) {
    next(error)
  }

});





// DELETE Comp
router.delete('/:idComp', async(req, res, next) => {

  try {

    try {
      const filter = {
        _id: req.params.idComp
      };
      await Comp.deleteOne(filter);


      res.send("The comp has been deleted");

    } catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }

  } catch (error) {
    next(error)
  }

});

/*


  const filterUser = {
    "works.listIdComp": req.params.idComp
  };
  const updateUser = {
    $pull: {
      "works.listIdComp": req.params.idComp
    }
  };

  await User.updateOne(filterUser, updateUser);


*/



module.exports = router;