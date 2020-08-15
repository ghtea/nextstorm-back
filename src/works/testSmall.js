import axios from 'axios';

const test1 = async () => {
	
	const result1 = await axios.get('kk');
	console.log('ok');
	
}


const test2 = async () => {
	try {
		const result1 = await axios.get('kk');
		console.log('ok');
	}
	catch(error) {
		console.log('broken');
	}
}

const test3 = async () => {
	
	let status = {};
	
	try {
		const result1 = await axios.get('kk');
		
		status.first = "success"
	}
	catch(error) {
		status.first = "error"
	}
	
	console.log(status);
}

//test1();

//test2();

test3();