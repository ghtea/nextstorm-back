import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ 
  path: './.env' 
});


const getPlayerHeroesEachRegion = async (battletag, nameRegion) => {
	
	try { 
			
			let dictIdRegion = {
	  		NA: "1"
	  		, EU: "2"
	  		, KR: "3"
	  		, CN: "5"
	  	}
			const idRegion = dictIdRegion[nameRegion];
			
			
	  	const urlBattletag = encodeURIComponent(battletag);
	  	
	  	let result = {};
	  	const listMode = ["Tank", "Bruiser", "Melee Assassin", "Ranged Assassin", "Healer", "Support"];
	  	
	  	
	  	const url = `https://api.heroesprofile.com/api/Player/Hero/All?mode=json&battletag=${urlBattletag}&region=${idRegion}&api_token=${process.env.TOKEN_HP}`
	  	const res = await axios.get(url);
	  	let objResult = res.data;
	  	
	  	//const listModePlayed = Object.keys(res.data);
	  	
	  	delete objResult['Team League']
	  	delete objResult['Hero League']
	  	delete objResult['Unranked Draft']
	  	
	  	console.log(objResult);
	  	
			return 	objResult;
			
			
	  } catch(error) {
	  	console.error(error);
	  } 
		
  }
  
	
	export default getPlayerHeroesEachRegion;