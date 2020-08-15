import axios from 'axios';
import dotenv from "dotenv";


// mbcat#1703

dotenv.config({ 
  path: './.env' 
});


const getOneRoleOneRegion = async (battletag, nameRegion, role) => {
  try {
    
    const urlBattletag = encodeURIComponent(battletag);
    const urlRole = encodeURIComponent(role);
    
    let idRegion;
    
    switch(nameRegion) {
      case "NA":
        idRegion = "1";
        break;
      case "EU":
        idRegion = "2";
        break;
      case "KR":
        idRegion = "3";
        break;
      case "CN":
        idRegion = "5";
        break;
    }
    
    let url = `https://api.heroesprofile.com/api/Player/MMR/Role?mode=json&battletag=${urlBattletag}&region=${idRegion}&role=${urlRole}&api_token=${process.env.TOKEN_HP}`
    
    
    const response = await axios.get(`${url}`);
    const objPlayerThisRoleThisRegionOriginal = response.data;
  
    
    console.log("hi")
    
    const listGameModeShort = ["SL", "TL", "HL", "UD", "QM"];
    const listGameModeFull = ["Storm League", "Team League", "Hero League", "Unranked Draft", "Quick Match"];
    
    
    let objPlayerThisRoleThisRegion = {};
    let numberPlayerThisRoleThisRegion = 0;
    
    for (let iMode=0; iMode < listGameModeFull.length; iMode++) {
      
      const cGameModeShort = listGameModeShort[iMode];
      const cGameModeFull = listGameModeFull[iMode];
      
      if (objPlayerThisRoleThisRegionOriginal[battletag][cGameModeFull]) { // 데이터가 있는지 먼저 확인하고, 있으면 합계에 추가
        objPlayerThisRoleThisRegion[cGameModeShort] = objPlayerThisRoleThisRegionOriginal[battletag][cGameModeFull]["games_played"];
        
        numberPlayerThisRoleThisRegion += objPlayerThisRoleThisRegionOriginal[battletag][cGameModeFull]["games_played"];;
      }

    }
    
    console.log(`number of games as ${role} in ${nameRegion}`);
    console.log(numberPlayerThisRoleThisRegion);
    
    return new Promise(function(resolve, reject) {
      resolve(numberPlayerThisRoleThisRegion);
    });

  } 
  
  catch (error) {
      console.log(error)
      console.log(`${battletag} has no data in ${nameRegion} with ${role}`)
  }
}; 





const readPlayerRoleGames = async (battletag, listRegionMain) => {
  
  try {
    
  // # => %23 
  const listRole = [
      "Tank", "Bruiser", "Melee Assassin", "Ranged Assassin", "Healer", "Support"
    ]
  
  const objRegion = {
    NA: "1",
    EU: "2",
    KR: "3",
    CN: "5"
  }
  
  
  //const listRegionName = Object.keys(objRegion);
  //const listRegionId = (Object.keys(objRegion)).map((key, i)=>objRegion[key])
  
  const listRegionName = ["NA", "EU", "KR", "CN"];
  const listRegionId = ["1", "2", "3", "5"];
  
  let objPlayerRoleNumbers = {};
  
   
  // https://lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795/
  const regionMain = listRegionMain[0];
  
  for (const role of listRole) {
    
    //objPlayerRoleNumbers[role] = {};
    
    objPlayerRoleNumbers[role] = await getOneRoleOneRegion(battletag, regionMain, role);
    if (!objPlayerRoleNumbers[role] ) {objPlayerRoleNumbers[role] = 0;} 
  }
       
  console.log(objPlayerRoleNumbers);
  
  return new Promise( (resolve, reject) => {
    if ( objPlayerRoleNumbers ) { resolve(objPlayerRoleNumbers); }
    else { reject( new Error("battletag is wrong") );}

  });
  
  } catch (e) {console.log(error)}
}


//getOneRoleOneRegion("akr114#1438", 5, "CN", "Melee Assassin");
//readPlayerRoles("Madosan#1234")


/*

const battletag = "akr114#1438"

resolvePlayerMmr(battletag);
*/


export default readPlayerRoleGames





 /*
 아래처럼 하면 차례대로 안된다 // https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
 
  await Promise.all(
    listRole.map(async (role) => {
      
      
      objPlayerRoleNumbers[role] = {};
      
      try {
        objPlayerRoleNumbers[role][listRegionName[0]] = await getRoleOneRegion(battletag, listRegionId[0], listRegionName[0], role);
      } catch (e) {objPlayerRoleNumbers[role][listRegionName[0]] = 0;}
      try {
        objPlayerRoleNumbers[role][listRegionName[1]] = await getRoleOneRegion(battletag, listRegionId[1], listRegionName[1], role);
      } catch (e) {objPlayerRoleNumbers[role][listRegionName[1]] = 0;}
      try {
        objPlayerRoleNumbers[role][listRegionName[2]] = await getRoleOneRegion(battletag, listRegionId[2], listRegionName[2], role);
      } catch (e) {objPlayerRoleNumbers[role][listRegionName[2]] = 0;}
      try {
        objPlayerRoleNumbers[role][listRegionName[3]] = await getRoleOneRegion(battletag, listRegionId[3], listRegionName[3], role);
      } catch (e) {objPlayerRoleNumbers[role][listRegionName[3]] = 0;}
      
      
      objPlayerRoleNumbersAll[role] = 
        objPlayerRoleNumbers[listRegionName[0]] 
        + objPlayerRoleNumbers[listRegionName[1]] 
        + objPlayerRoleNumbers[listRegionName[2]]  
        + objPlayerRoleNumbers[listRegionName[3]];
  }));
  */