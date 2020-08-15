import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ 
  path: './.env' 
});



const getRegions = async (battletag) => {
	
	try { 
		
	  	const urlBattletag = encodeURIComponent(battletag);
	  	
	  	let dictIdRegion = {
	  		NA: "1"
	  		, EU: "2"
	  		, KR: "3"
	  		, CN: "5"
	  	};
	  	
	  	let dictUrl = {
	  		NA: ""
	  		, EU: ""
	  		, KR: ""
	  		, CN: ""
	  	};
	  	
	  	let dictRes = { };
	  	
	  	
			dictUrl["NA"] = `https://api.heroesprofile.com/api/Player/MMR?mode=json&battletag=${urlBattletag}&region=${ dictIdRegion["NA"] }&api_token=${process.env.TOKEN_HP}`
	  	dictUrl["EU"] = `https://api.heroesprofile.com/api/Player/MMR?mode=json&battletag=${urlBattletag}&region=${dictIdRegion["EU"]}&api_token=${process.env.TOKEN_HP}`
	  	dictUrl["KR"] = `https://api.heroesprofile.com/api/Player/MMR?mode=json&battletag=${urlBattletag}&region=${dictIdRegion["KR"]}&api_token=${process.env.TOKEN_HP}`
	  	dictUrl["CN"] = `https://api.heroesprofile.com/api/Player/MMR?mode=json&battletag=${urlBattletag}&region=${dictIdRegion["CN"]}&api_token=${process.env.TOKEN_HP}`
	  	
	  	try {
	  		dictRes["NA"] = await axios.get(dictUrl["NA"]);
	  	} catch (error) {
	  		console.log("error in NA");
	  	}
	  	try {
	  		dictRes["EU"] = await axios.get(dictUrl["EU"]);
	  	} catch (error) {
	  		console.log("error in EU");
	  	}
	  	try {
	  		dictRes["KR"] = await axios.get(dictUrl["KR"]);
	  	} catch (error) {
	  		console.log("error in KR");
	  	}
	  	try {
	  		dictRes["CN"] = await axios.get(dictUrl["CN"]);
	  	} catch (error) {
	  		console.log("error in CN");
	  	}
	  	
	  	
	  
	  	let listNameRegionPlayed = Object.keys(dictRes);
	  	
	  	//console.log(listNameRegionPlayed)
	  	
			listNameRegionPlayed = listNameRegionPlayed.filter( 
				element => (dictRes[element]['data'][battletag]["Quick Match"] || dictRes[element]['data'][battletag]["Storm League"] ) ); // filter
			
			let dictGamesPlayedEachRegion = {};
			for (const naemRegion of listNameRegionPlayed){
				
				const gamesQM = dictRes[naemRegion]['data'][battletag]["Quick Match"] || 0;
				const gamesSL = dictRes[naemRegion]['data'][battletag]["Storm League"] || 0;
				
				dictGamesPlayedEachRegion[naemRegion] = gamesQM + gamesSL;
			}
			// {NA: 11, KR: 33}
			
			// 뒤로 갈수록 작아지게
			const listNameRegionPlayedSorted = listNameRegionPlayed.sort((a, b) => dictGamesPlayedEachRegion[b] - dictGamesPlayedEachRegion[a]);
			
			
			
			console.log(listNameRegionPlayedSorted);
			return 	listNameRegionPlayedSorted;
			
			
	  } catch(error) {
	  	console.error(error);
	  } 
		
  }
  
  //getRegions("mbcat#1703")
	
	export default getRegions;