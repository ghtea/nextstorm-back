import mongoose from 'mongoose';

//import express from 'express';
import Version from '../models/Version';
import dotenv from "dotenv";
import axios from 'axios'

import {
	v4 as uuidv4
}
from 'uuid';


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

//var router = express.Router();

const updatePatch = async () => { 
	
	try {
		const res_HeroesProfile = await axios.get(`https://api.heroesprofile.com/api/Patches?api_token=${process.env.TOKEN_HP}`);
    const dictPatchMajor = res_HeroesProfile.data;
		
		const listPatchNameMajor = Object.keys(dictPatchMajor);
		const seriesPatchNameMajor = listPatchNameMajor.sort();
		const patchNameMajorLatest = seriesPatchNameMajor[seriesPatchNameMajor.length - 1];
		console.log(patchNameMajorLatest); // example '2.51'
		
		
		const listPatchNameMinor = Object.keys(dictPatchMajor[patchNameMajorLatest]);
		const seriesPatchNameMinor = listPatchNameMinor.sort();
		const patchNameMinorLatest = dictPatchMajor[patchNameMajorLatest][seriesPatchNameMinor.length - 1];
		console.log(patchNameMinorLatest);
		
		
		
		//const patchMajorLatest = Object.keys(dictPatchMajor);
		const filter = { _id: "one" };
		const dateCurrent = Date.now();
		
		const foundVersion = await Version.findOne(filter);
		
		
		if (foundVersion && foundVersion['patch']) {
			
			console.log('updating patch of version');
			
			let updatePatch = {};
			
			const patchNameMinorLatestBefore = foundVersion['patch']['minor'];
			const checkedFirstBefore = foundVersion['patch']['checkedFirst'];
			const checkedLastBefore = foundVersion['patch']['checkedLast'];
			
			if (patchNameMinorLatestBefore === patchNameMinorLatest) {
				
				const update = {
					$set: { "patch.checkedLast": dateCurrent }
				}
				await Version.updateOne(filter, update );
				
			
				console.log('we are using latest version');
				
				return ({
					minor: foundVersion['patch']['minor']
				  , major: foundVersion['patch']['major']
				 
				  , checkedFirst: foundVersion['patch']['checkedFirst']
				  , checkedLast: dateCurrent
				})
			
			}
			else { // 최신 패치 생겼을 때
				
				updatePatch = {

				  minor: patchNameMinorLatest
				  , major: patchNameMajorLatest
				 
				  , checkedFirst: dateCurrent
				  , checkedLast: dateCurrent
				}
	
			
				const update = {
					patch: updatePatch	
				}
				await Version.updateOne(filter, update );
				
				
				console.log('successfully updated patch in version');
				
				return ({
					minor: foundVersion['patch']['minor']
				  , major: foundVersion['patch']['major']
				 
				  , checkedFirst: foundVersion['patch']['checkedFirst']
				  , checkedLast: dateCurrent
				})
			}
		
		}
		// version 은 있고 patch 만없을때
		else if (foundVersion)  {
			
			console.log('creating patch in version');
			
			const newPatch = {

			  minor: patchNameMinorLatest
			  , major: patchNameMajorLatest
			 
			  , checkedFirst: dateCurrent
			  , checkedLast: dateCurrent
			}
			
			const update = {
				patch: newPatch	
			}
			
			await Version.updateOne(filter, update );
			
			console.log('successfully created patch in version');
			
			return ({
				minor: patchNameMinorLatest
			  , major: patchNameMajorLatest
			 
			  , checkedFirst: dateCurrent
			  , checkedLast: dateCurrent
			})
		}

// 아예 version 이 없을때		
		else { 
			console.log('creating version');

			let tVersion = new Version({
				_id: 'one'
				
				, patch: {
					minor: patchNameMinorLatest
				  , major: patchNameMajorLatest
				 
				  , checkedFirst: dateCurrent
				  , checkedLast: dateCurrent
				}
			}); 
			
			
			
			await tVersion.save();
			
			console.log('successfully created version');
			
			return ({
				minor: patchNameMinorLatest
			  , major: patchNameMajorLatest
			 
			  , checkedFirst: dateCurrent
			  , checkedLast: dateCurrent
			})
		}
		
		
	}
	catch(error) {
		console.log(error)
	}
}

updatePatch();
/*
const result = updatePatch();

const checkedFirst = new Date (result['checkedFirst']);
const checkedLast = new Date (result['checkedLast']);

console.log(checkedFirst);
console.log(checkedLast);
console.log(checkedLast-checkedFirst);
*/

export default updatePatch;