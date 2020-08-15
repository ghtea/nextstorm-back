import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ 
  path: './.env' 
});

const getPlayerGeneralEachRegion = async (battletag, nameRegion) => {
	
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
	  	const listRole = ["Tank", "Bruiser", "Melee Assassin", "Ranged Assassin", "Healer", "Support"];
	  	
	  	
	  	// all
	  	
	  	const urlAll = `https://api.heroesprofile.com/api/Player/MMR?mode=json&battletag=${urlBattletag}&region=${idRegion}&api_token=${process.env.TOKEN_HP}`
	  	const resAll = await axios.get(urlAll);
	  	result["All"] = resAll['data'][battletag]
	  	
	  	// each role
	  	for (const role of listRole) {
	  		
		    const url = `https://api.heroesprofile.com/api/Player/MMR/Role?mode=json&battletag=${urlBattletag}&region=${idRegion}&role=${role}&api_token=${process.env.TOKEN_HP}`	
		    const res = await axios.get(url);
		    result[role] = res['data'][battletag]
		  }
	  	
	  	
	  	console.log(result)
			return 	result;
			
			
	  } catch(error) {
	  	console.error(error);
	  } 
		
  }
  
  
  
  //getPlayerGeneralEachRegion ("mbcat#1703", "NA")
  
	
	export default getPlayerGeneralEachRegion;