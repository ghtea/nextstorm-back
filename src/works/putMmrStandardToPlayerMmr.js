//sample
const playerMmr =  {
 
  "_id": "mbcat#1703",
  
  "NA": {
    "QM": {
      "mmr": 2750,
      "games_played": 399
    },
    "SL": {
      "mmr": 2357,
      "games_played": 15
    }
  },
  
  "EU": null,
  
  "KR": {
    "QM": {
      "mmr": 2037,
      "games_played": 18
    },
    "SL": {
      "mmr": 2061,
      "games_played": 112
    }
  },
  
  "CN": null
    
}

/*
// findIndex is not stabley supported, so I created one
const findIndex = (array, value) => {
	var indexFound;
	var isFound = array.some( (element, index) => { indexFound = index; return (element === value) });
	
	if (!isFound) {
	    return false;
	}

	return indexFound;
}
*/

const moveCertainElementToFront = (array, value) => {
    
    const indexToDelete = array.indexOf(value)
    
    const newArray = JSON.parse(JSON.stringify( array )); //참조없는 복사 https://programmingsummaries.tistory.com/143
    
    newArray.splice(indexToDelete, 1); // delete element
    
    newArray.unshift(value);
    
    // unshift, splice change original array (unlike splice)
    
    return newArray;
  }


const makeOrderRegion = (playerMmr) => {
  
	let listRegion = ["NA", "KR", "EU", "CN"];
	//const listMode = ["SL", "QM"];
	const listMode = ["SL", "QM", "HL", "TL", "UD" ];
	
	let numGames = {
	  "NA": 0,
	  "EU": 0,
	  "KR": 0,
	  "CN": 0
	}
	
	// check number of games (SL + QM) of each region
	loopEntire: 
	for (var iRegion = 0; iRegion < listRegion.length; iRegion++) {
	  for (var iMode = 0; iMode < listMode.length; iMode++) {
	        
	    const cRegion = listRegion[iRegion];
	    const cMode = listMode[iMode];
	    
	    if (playerMmr[cRegion] && 
				playerMmr[cRegion][cMode] ) {
						
					numGames[cRegion] += playerMmr[cRegion][cMode]['games_played'];
						
				}
	
	  }
	}
	
	
	//  .sort changes original array (listRegion)
	let orderRegion = listRegion.sort( (region1, region2) => { 
    return (numGames[region2] - numGames[region1]);
   
  });
  
	console.log(`number of games (SL + QM): (below)`)
	console.log(numGames)
	console.log(`order of regions: ${orderRegion}`)
	
	
	// 활동지역 알아내기!!! (기준 게임수 100개 이상)
	let listRegionMain = [];
	
	for (var iRegion = 0; iRegion < orderRegion.length; iRegion++) {
	  const cRegion = orderRegion[iRegion];
    if (numGames[cRegion] >= 50 ) {
		  listRegionMain.push(cRegion)
    }
	}
	if (listRegionMain === []) {  // 50개 이상 지역 없으면 그나마 제일 게임수 많은 지역 반환
	  listRegionMain.push(orderRegion[0])
	}
	
	const result = {
	  listRegionMain
	  , orderRegion
	}
	
	return result;
}




// mmr standard means mmr that we should expect from player in certain region.
const returnMmrStandardInEachRegion = (playerMmr, orderRegionPersonal, regionStandard, mmrDefault) => {
  
  const listRegion = ["NA", "KR", "EU", "CN"];
  
  const orderMode = ["SL", "QM"];
  const orderMinGames = [100, 40, 10];
  
  let mmrStandard;
  
  const orderRegionFinal = moveCertainElementToFront(orderRegionPersonal, regionStandard)
  
  console.log(orderRegionFinal);
  
	// map 에서는 break 가 사용 불가능하다, label 사용해서 loop 한 것에 주의! https://stackoverflow.com/questions/183161/whats-the-best-way-to-break-from-nested-loops-in-javascript
	loopMinGames: for (var iMinGames = 0; iMinGames < orderMinGames.length; iMinGames++) {
    loopRegion: for (var iRegion = 0; iRegion < orderRegionFinal.length; iRegion++) {
      loopMode: for (var iMode = 0; iMode < orderMode.length; iMode++) {
        
        const minGames = orderMinGames[iMinGames];
        const region = orderRegionFinal[iRegion];
        const mode = orderMode[iMode];
        
        if (playerMmr[region]) { // 1st if
					
					if (playerMmr[region][mode])  { // 2nd if
						if (playerMmr[region][mode]['games_played'] >= minGames) { // final if
							
							console.log(`mmrStandard for ${regionStandard}: ${playerMmr[region][mode]['mmr']} (used mmr of ${region}, ${mode})`);
							
							mmrStandard = playerMmr[region][mode]['mmr'];
							break loopMinGames; // 일단 정해지면 다른 것들 볼 필요가 없으니 중지
						} // final if 
						else { 
						  // mode exist but not meet number of games
						}
					} // 2nd if
					else { continue loopMode;}
        } // 1st if
        else { continue loopRegion;}
      }
    }
  }
	
	if (!mmrStandard) {
	  mmrStandard = mmrDefault
	  console.log("there is no mmr");
	}
	
	return mmrStandard;
	
}


export const returnListRegionMain = (playerMmr) => {
  const result1 = makeOrderRegion(playerMmr);
  const listRegionMain = result1.listRegionMain;
  //console.log(listRegionMain);
  return listRegionMain;
}

export const putMmrStandardToPlayerMmr = (playerMmr, mmrDefault) => {
  
  const listRegion = ["NA", "EU", "KR", "CN"];
  
  // order is based on number of games of certain Player on each region
  const result1 = makeOrderRegion(playerMmr);
  
  const listRegionMain = result1.listRegionMain;
  const orderRegionPersonal = result1.orderRegion;
  
  //const orderRegionPersonal = ["NA", "KR", "EU", "CN"];  // use sample first
  
  for (var iRegion = 0; iRegion < listRegion.length; iRegion++) {
  	
  	const cRegion = listRegion[iRegion];
  	if (!playerMmr[cRegion]) { playerMmr[cRegion] = {} }; // 해당 지역의 object가 null 일때
  	
  	playerMmr[cRegion]["STANDARD"] = returnMmrStandardInEachRegion(playerMmr, orderRegionPersonal, cRegion, mmrDefault);
  
  }
  return playerMmr;
}

//returnListRegionMain(playerMmr);
//console.log(newPlayerMmr)
