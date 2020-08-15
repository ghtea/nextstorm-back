import axios from 'axios'
import dotenv from "dotenv"
import mongoose from 'mongoose';

import PlanTeam  from '../models/PlanTeam';

// mbcat#1703

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



//example
/*
const newPlayer = {
  _id: "akr114#1438"  
};
const update =  {
  $push: { listPlayerEntry: newPlayer } 
}
*/


//_id, update
const updatePlanTeam = async (filter, update) => {
  try {
  
    
    const option = {returnNewDocument: true};
    const result = await PlanTeam.findOneAndUpdate(filter, update, option);
    
    return new Promise((resolve, reject)=> {
      if (!result) { console.log('already exists or error'); return;}
      else { console.log('sucessfully updated'); resolve(result); }
    })
  
  } // try
  catch (e) {console.log(e)}
}




export default updatePlanTeam



/*
return new Promise(function(resolve, reject) {
    if (result) {
      resolve();
    } else { reject() 
    }
  }).catch(error=> console.log(error))
*/