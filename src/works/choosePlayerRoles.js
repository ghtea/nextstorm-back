

const choosePlayerRoles = (objPlayerRoleGames) => {
  
	const listRolePublic = ["Tank", "Bruiser", "Melee Assassin", "Ranged Assassin", "Healer", "Support"];
	
	
	/// 히오스 전체 역할별 비율
	let objRolePublic = {
		Tank: {number: 13}
		,Bruiser: {number: 15}
		,"Melee Assassin": {number: 11}
		,"Ranged Assassin": {number: 30}
		,Healer: {number: 13}
		,Support: {number: 4}
	}
	
	let numberAllHeroes = 0;
	for (let role of listRolePublic) {
		numberAllHeroes += objRolePublic[role]["number"];
	}
	
	for (let role of listRolePublic) {
		objRolePublic[role]["ratio"] = objRolePublic[role]["number"] / numberAllHeroes;
		//console.log(objRolePublic[role]["ratio"] );
	}
	///// 
	
	
	/// 개인의 영웅별 비율
	let gamesEntirePersonal = 0;
	for (let role of listRolePublic) {
	  gamesEntirePersonal += objPlayerRoleGames[role];
	}
	
	let objPlayerRoleRatio ={};
	for (let role of listRolePublic) {
		objPlayerRoleRatio[role] = objPlayerRoleGames[role]/ gamesEntirePersonal;
	};
	
	
	/// 플레이 횟수 많은 순으로 정렬한 후에, 까다로운 조건을 만족하는 역할들만 추가
	const listRolePublicCopy = [...listRolePublic];
			  
	let orderRolePersonal = listRolePublicCopy.sort( (role1, role2) => { 
    	return (objPlayerRoleGames[role2] - objPlayerRoleGames[role1]);
		});
	
	let orderRolePersonalFinal = [];
	for (let role of orderRolePersonal) {
		if (objPlayerRoleGames[role] > 20 ) {
				
			if (objPlayerRoleRatio[role] > objRolePublic[role]["ratio"] * 1) {     // 평균 비율의 x 보다 커야 한다 (힐러전문 유저가 탱커 20판 했다고 탱커가 리스트에 추가되지 않도록...)
				orderRolePersonalFinal.push(role);
			}
			else if (objPlayerRoleGames[role] > 400 ){
				orderRolePersonalFinal.push(role);
			}
			
		}
	}
	
	return orderRolePersonalFinal;
}	
	

export default choosePlayerRoles;


/* test

const test = { Tank: 119,
  Bruiser: 109,
  'Melee Assassin': 217,
  'Ranged Assassin': 153,
  Healer: 173,
  Support: 0 };
  
 
 const resultTest = choosePlayerRoles(test);
 console.log(resultTest);
 */