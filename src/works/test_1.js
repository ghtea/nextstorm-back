
import axios from 'axios'


const test = async () => {
  try {
    const res = await axios.get("https://kr.battle.net/oauth/authorize?response_type=code&client_id=75414d25c06741f1a1def56885c27370&redirect_uri=https://ns.avantwing.com");
	  console.log(res.data);
  }
  catch(error) {console.log(error)}
}

test();