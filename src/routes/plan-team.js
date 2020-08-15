import express from 'express';

import PlanTeam from '../models/PlanTeam';
import User from '../models/User';

var router = express.Router();


// READ PlanTeam
router.get('/:idPlanTeam', async (req, res, next) => {
  
  try {
  
    const filter = { _id: req.params.idPlanTeam };
    
    PlanTeam.findOne(filter, (err, planTeam) => {
      if(err) return res.status(500).json({error: err});
      else if(!planTeam) { return res.status(404).json({error: 'PlanTeam not found'}); }
      else { res.json(planTeam); }
    });

    
  } catch(error) { next(error) }
  
});



// many
router.get('/', (req, res) => {
  
  
  const query = req.query;
    
  const filterAuthor = (query.author)? 
    { 
      "listAuthor": query.author
    }
    : {  };
    
    
  const filter={
    
    $and : [
      
     filterAuthor
     
    ]
    
  };
  
  PlanTeam.find(filter, (err, listPlanTeam) => {
    if (err) return res.status(500).send({
      error: 'database failure'
    });
    res.json(listPlanTeam);
  })
  
});

  


// CREATE PlanTeam   항상 배틀태그와 함께 시작함에 주의 or 배틀태그 없이 시작해도?
// new PlanTeam 이 가능해진다 (쉬워진다)
router.post('/', async (req, res, next) => {
  
  try {
    
    let planTeam = new PlanTeam(
      { 
        _id: req.body._id
        , password: req.body.password
        
        , listAuthor: req.body.listAuthor
        
        , title: req.body.title
        , option: {
          region: req.body.region
          , numberTeams: 0
          , numberGroups: 0
        }
        
        , created: Date.now()
        , accessed: Date.now()
      });
      
    //planTeam.option.region = req.body.region;
    
    //planTeam.markModified('option.region'); // https://stackoverflow.com/questions/24054552/mongoose-not-saving-nested-object
    
    await planTeam.save();
    
    
    
    // 유저의 works 정보에 추가
    const update_works_plan = {
        $push: {
          "works.listIdPlanTeam": req.body._id
        }
      };
    await User.updateOne({ _id: (req.body.listAuthor)[0] }, update_works_plan);
    
    
    
    res.send("new plan has been created!");
    
  } catch(error) { next(error) }
  
});









//UPDATE
// ?: promise 반환할 필요없이 response 만 반환하면 될듯?
// 이미 존재 확실한, planTeam, player(battletag) 에 대해서 업데이트
// 예: 특정 플레이어 mmr planTeam 에 넣기
router.put('/', async (req, res, next) => {
  try {
  
    if (req.body.filter && req.body.update) {
      
      const filter = req.body.filter;
      const update = req.body.update;
      
      await PlanTeam.updateOne(filter, update);
      
      res.send("plan has been updated!");  // res 에 아무것도 안주면 응답 없다고 에러 발생!
      
      
    } else { res.send('filter & update obj are necessary')  }
    
  } catch(error) {next(error)}
  
});


/*
예를 들어, planteam 에 player 추가 할때!
유력 한 방법
PlanTeam.updateOne(
   { _id: idPlanTeam, "listPlayerEntry._id": battletag },
   { $set: { "listPlayerEntry.$.mmr" : 6 } }
)
*/



// DELETE
// DELETE Comp
router.delete('/:idPlan', async (req, res, next) => {
  
  try {
    
    try {
      
      const filter = { _id: req.params.idPlan };
      await PlanTeam.deleteOne(filter);
      
      
      const filterUser = {
        "works.listIdPlanTeam": req.params.idPlan
      };
      const updateUser = {
        $pull: { "works.listIdPlanTeam": req.params.idPlan }
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









/*
// ADD OR UPDATE PlanTeam   없을 때 생성해야 하는 가능성을 포함

// 그냥 생성과 수정 나눠서 하는게 나을듯? upsert가 생각보다 좋지만은 않은듯...  
router.put('/', async (req, res, next) => {
  try {
  
    if (req.body.filter && req.body.update) {
      
      const filter = req.body.filter;
      const update = req.body.update;
      const option = {returnNewDocument: true, upsert: true };
      
      const result = await PlanTeam.findOneAndUpdate(filter, update, option);
      
      res.send("ahr working");  // res 에 아무것도 안주면 응답 없다고 에러 발생!
      
      return new Promise((resolve, reject)=> {
        if (!result) { console.log('already exists or error'); return;}
        else { console.log('sucessfully updated'); resolve(result); }
      })
      
    } else { res.json( { error: 'filter & update obj are necessary' }) }
    
  } catch(error) {next(error)}
  
});

*/








/*

let planTeam = await PlanTeam.findOne({_id : idPlanTeam});
const playerEntry = planTeam.listPlayerEntry.id(battletag); // ? 이거는 그냥 promise 반환하는게 아니라 비동기로 해도 되는듯?
playerEntry.set({mmrStandard: newMmrStandard});
await planTeam.save();

        .then((home) => {
          
            const tes=home.post.id("5a3fe65546c99208b8cc75b1");
            tes.set({"title" : "it workssdfg"});
            home.save();
        })
        .catch((err)=>{
            console.log("error");
        });
        
*/

/*
HomeModel.findOne({name : "tiger"})
        .then((home) => {
            console.log("findone")
            const tes=home.post.id("5a3fe65546c99208b8cc75b1");
            tes.set({"title" : "it workssdfg"});
            home.save();
        })
        .catch((err)=>{
            console.log("error");
        });
        */
