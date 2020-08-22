import express from 'express';
import Player from '../models/Player';
import dotenv from "dotenv";
import {
	v4 as uuidv4
}
from 'uuid';

import getRegions from '../works/getRegions';
import getPlayerGeneralEachRegion from '../works/getPlayerGeneralEachRegion';
import getPlayerHeroesEachRegion from '../works/getPlayerHeroesEachRegion';


dotenv.config({
	path: './.env'
});

var router = express.Router();



// 1. 일단 해당 배틀태그의 플레이어가 있는지 확인한다 -> 없는/오래된/최신게있는 3가지 어떠한 경우든 지역 리스트 반환
// 2. 지역 리스트랑 같이 내가 원하는 stats 요청 -> 없는/오래된/최신게 어떠한 경우는 원하는 stats 정보 얻기
// 없으면   a.지역리스트 + b.내가 원하는 stat 새로 만든다



router.get('/regions/:battletagEncoded', async(req, res, next) => {

	try {

		try {

			const battletag = decodeURIComponent(req.params.battletagEncoded);
			const filter = {
				battletag: battletag
			};
			const foundPlayer = await Player.findOne(filter);

			if (!foundPlayer) {
				// 없으면 그 자리에서 만든다.

				try {
					const orderNameRegion = await getRegions(battletag);
				} catch (error) {
					return res.status(500).json({
						error: error
					});
					/*console.log("should be here")    // // 여기로 오긴하는데 아래거 실행은 안한다... 우선 사이트가 돌아가는데 지장은 없음...
					res.json({code_situation: "basic05"});
					return;*/
				}

				const newPlayer = new Player({
					_id: uuidv4(),
					battletag: battletag,
					orderNameRegion: orderNameRegion,
					updated: {
						orderNameRegion: Date.now()
					}
				})

				await newPlayer.save();

				// 'new 모델명' 으로 만든것 바로 일반 데이터만 들은 object 으로 이용 가능 
				console.log(newPlayer)
				return res.json(newPlayer);

			}

			// 
			else if (foundPlayer.updated && (new Date(foundPlayer.updated.orderNameRegion) > (new Date().getTime() - 1000 * 60 * 60 * 24 * 7))) {

				// player 가 내 데이터 베이스에 이미 있고 비교적 최근에 지역을 확인 했으면 그냥 가져온다
				console.log('you dont need to get new region list');
				return res.json(foundPlayer);
			} else { // 특정기간 지나서 업데이트 해봐야하면

				const orderNameRegion = await getRegions(battletag);
				const updatedRegion = Date.now();

				const update = {
					orderNameRegion: orderNameRegion,
					$set: {
						"updated.orderNameRegion": Date.now()
					}
				}

				// https://stackoverflow.com/questions/35626040/findoneandupdate-used-with-returnnewdocumenttrue-returns-the-original-document
				// returnNewDocument  설정은 nodejs 에서 안된다!, 대신 returnOriginal 를 false로 하면 새로운 걸 반환!
				const updatedPlayer = await Player.findOneAndUpdate(filter, update, {
					returnOriginal: false
				});
				return res.json(updatedPlayer);

			}

		} catch (error) {
			console.log(error)
			return res.status(500).json({
				error: error
			});
		}

	} catch (error) {
		next(error)
	}

});




router.get('/general/:battletagEncoded', async(req, res, next) => {

	try {

		try {

			const battletag = decodeURIComponent(req.params.battletagEncoded);

			// list element 가 하나이면 list가 아닌 그 element 하나로서 된다!
			const orderNameRegion = JSON.parse(req.query.orderNameRegion);

			const filter = {
				battletag: battletag
			};
			const foundPlayer = await Player.findOne(filter);

			if (!foundPlayer.stats || !foundPlayer.stats.general_String) {
				// 해당 stats이 없으면 해당 stats 을 그 자리에서 만든다.
				console.log("you should get new general stats because there's none")
				let result = {};
				for (const nameRegion of orderNameRegion) {
					result[nameRegion] = await getPlayerGeneralEachRegion(battletag, nameRegion);
				}

				const update = {
					$set: {
						"stats.general_String": JSON.stringify(result)
					},
					"updated.general": Date.now()
				};

				try {
					// findOne 은 업데이트된 문서를 반환 못한다!
					const updatedPlayer = await Player.findOneAndUpdate(filter, update, {
						returnOriginal: false
					});
					console.log(updatedPlayer)
					return res.json(updatedPlayer);
				} catch (error) {
					console.log(error);
					res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
					return;
				}

			} else if (foundPlayer.updated && (new Date(foundPlayer.updated.general) > (new Date().getTime() - 1000 * 60 * 60 * 24 * 1))) {
				// player 가 내 데이터 베이스에 이미 있고 비교적 최근에 지역을 확인 했으면 그냥 가져온다
				console.log('you dont need to get new general stats')
				return res.json(foundPlayer);
			} else { // 특정기간 지나서 업데이트 해봐야하면
				console.log("you should update general stats because it's old")

				let result = {};
				for (const nameRegion of orderNameRegion) {
					result[nameRegion] = await getPlayerGeneralEachRegion(battletag, nameRegion);
				}

				const update = {
					$set: {
						"stats.general_String": JSON.stringify(result)
					},
					"updated.general": Date.now()
				};


				try {
					const updatedPlayer = await Player.findOneAndUpdate(filter, update, {
						returnOriginal: false
					});
					//console.log(updatedPlayer)
					return res.json(updatedPlayer);
				} catch (error) {
					console.log(error);
					res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
					return;
				}

			}

		} catch (error) {
			console.log(error)
			return res.status(500).json({
				error: error
			});
		}

	} catch (error) {
		next(error)
	}

});




router.get('/heroes/:battletagEncoded', async(req, res, next) => {

	try {

		try {

			const battletag = decodeURIComponent(req.params.battletagEncoded);

			// list element 가 하나이면 list가 아닌 그 element 하나로서 된다!
			const orderNameRegion = JSON.parse(req.query.orderNameRegion);

			const filter = {
				battletag: battletag
			};
			const foundPlayer = await Player.findOne(filter);

			if (!foundPlayer.stats || !foundPlayer.stats.heroes_String) {
				// 해당 stats이 없으면 해당 stats 을 그 자리에서 만든다.
				console.log("you should get new heroes stats because there's none")
				let result = {};

				for (const nameRegion of orderNameRegion) {
					result[nameRegion] = await getPlayerHeroesEachRegion(battletag, nameRegion);
				}

				const update = {
					$set: {
						"stats.heroes_String": JSON.stringify(result)
					},
					"updated.heroes": Date.now()
				};

				try {
					// findOne 은 업데이트된 문서를 반환 못한다!
					const updatedPlayer = await Player.findOneAndUpdate(filter, update, {
						returnOriginal: false
					});
					//console.log(updatedPlayer)
					return res.json(updatedPlayer);
				} catch (error) {
					console.log(error);
					res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
					return;
				}

			} else if (foundPlayer.updated && (new Date(foundPlayer.updated.heroes) > (new Date().getTime() - 1000 * 60 * 60 * 24 * 1))) {
				// player 가 내 데이터 베이스에 이미 있고 비교적 최근에 지역을 확인 했으면 그냥 가져온다
				console.log('you dont need to get new heroes stats')
				return res.json(foundPlayer);
			} else { // 특정기간 지나서 업데이트 해봐야하면
				console.log("you should update heroes stats because it's old")

				let result = {};
				for (const nameRegion of orderNameRegion) {
					result[nameRegion] = await getPlayerHeroesEachRegion(battletag, nameRegion);
				}

				const update = {
					$set: {
						"stats.heroes_String": JSON.stringify(result)
					},
					"updated.heroes": Date.now()
				};


				try {
					const updatedPlayer = await Player.findOneAndUpdate(filter, update, {
						returnOriginal: false
					});
					//console.log(updatedPlayer)
					return res.json(updatedPlayer);
				} catch (error) {
					console.log(error);
					res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
					return;
				}

			}

		} catch (error) {
			console.log(error)
			return res.status(500).json({
				error: error
			});
		}

	} catch (error) {
		next(error)
	}

});














/*


router.get('/general/:battletagEncoded', async (req, res, next) => {
  
  try {
    
    const battletag = decodeURIComponent(req.params.battletagEncoded);
    const orderNameRegion = req.query.orderNameRegion;
    
		console.log(orderNameRegion)
    
    let result = {};
    for (const nameRegion of orderNameRegion) {
		  result[nameRegion] = await getPlayerGeneralEachRegion(battletag, nameRegion);
		}
		

		const update = {
      stats: { general: JSON.stringify(result) }
      , updated: { general : Date.now() } 
    };

    try {
      await Player.updateOne({ battletag: battletag }, update);
    } 
    catch (error) {
      console.log(error);
      res.status(500).send(error); // 여기선 내가 잘 모르는 에러라 뭘 할수가...   나중에 알수없는 에러라고 표시하자...
      return;
    }
    
    
    
    return res.json(result);
    
  } catch(error) { next(error) }
  
});

*/



module.exports = router;