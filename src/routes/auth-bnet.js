// 의존한 강의
// https://velog.io/@cyranocoding/PASSPORT.js-%EB%A1%9C-%EC%86%8C%EC%85%9C-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0

import express from 'express';
import dotenv from 'dotenv';
//import cors from 'cors';
import axios from 'axios';
import session from 'express-session';
import passport from 'passport';
import { uuid } from 'uuidv4'; // https://www.npmjs.com/package/uuidv4
import querystring from 'querystring';  

import User from '../models/User';

var BnetStrategy = require('passport-bnet').Strategy;

var BNET_ID = process.env.BNET_ID
var BNET_SECRET = process.env.BNET_SECRET
var SECRET_KEY = process.env.SECRET_KEY

var THIS_URL = process.env.THIS_URL
var FRONT_URL = process.env.FRONT_URL
 
const { generateToken, checkToken } = require('../works/auth/token');

var router = express.Router();

router.use(passport.initialize());
router.use(session({ secret: SECRET_KEY, resave: false, saveUninitialized: false, cookie: { maxAge:  60 * 1 } }));


//router.use(passport.session());

//router.use(cors());   // blizzard cors 설정 때문에 필요한듯 => 아니다, a 요소 링크로 들어가는 걸로 해결

passport.use(new BnetStrategy({
    clientID: BNET_ID,
    clientSecret: BNET_SECRET,
    callbackURL: `${THIS_URL}/auth-bnet/callback`,
    region: "us"
}, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));





// https://cheese10yun.github.io/Passport-part1/
// https://www.zerocho.com/category/NodeJS/post/57b7101ecfbef617003bf457
// done의 두번째 null에 profile 넣으면 되지만, 난 매번 재 로그인 하고 싶기에 null
passport.serializeUser((user, done) => {
  done(null, user); // tUser 혹은 mongoUser (실질적으로 같다)
});

// 
passport.deserializeUser((user, done) => {
  done(null, null);  // profile인지 User 인지 잘 모르겠지만...
});



 
// 처음 들어오는 곳
router.get('/',
  passport.authenticate('bnet'));


router.get('/callback',

  passport.authenticate('bnet', { failureRedirect: `${FRONT_URL}?reason=bnet-failure` } ),
  
  async function(req, res, next){
    
    try {
    
      //console.log(req.user);
      const profile = req.user;
      //const battletag = profile.battletag;
      
      
      const foundConfirmedUser = await User.findOne({ battletagConfirmed: profile.battletag});
          
      // 이미 등록하고 확인까지 받은 유저가 있다면!
      
      if (foundConfirmedUser) {
        const query = querystring.stringify({
          "code_situation": "abnet01"
        });
        res.redirect(`${FRONT_URL}/auth/apply-battletag?` + query);
        return;
      } 
    
      else {
      
      
      
     //{$lte: new Date().getTime()-(30*60*1000) } }
      const foundUser = await User.findOne({ battletagPending: profile.battletag});
      
      if (foundUser) {
        
        // 유저를 찾고, 배틀태그 등록한 시간도 최근 3분 안이면, 정상적으로 배틀태그 부여, 로그인.
        if (foundUser.whenBattletagPendingAdded >= (Date.now() - 3*60*1000) ) {
        
          const update = {battletagConfirmed: profile.battletag, battletagPending: ""};
          await User.updateOne({battletagPending: profile.battletag }, update);
          

          res.redirect(`${FRONT_URL}`);
          return;
          //res.redirect(`/auth-bnet/success`)
        }
        
        // 유저를 찾앗지만 배틀태그 등록 시간이 너무 예전인 경우, 로그인도 안하고 메시지만 전달
        else {
          const query = querystring.stringify({
              "code_situation": "abnet02"
          });
          res.redirect(`${FRONT_URL}/auth/apply-battletag?` + query);
          return;
        }
      } // if (foundUser)
      
      // 아예 못찾은 경우
      else { 
        const query = querystring.stringify({
          "code_situation": "abnet03"
        });
        res.redirect(`${FRONT_URL}/auth/apply-battletag?` + query);
        return;
      } //else (foundUser)

      
      } // else  (foundConfirmedUser)
    } // outer try
    catch (error) {
      console.log(error);
      const query = querystring.stringify({
        "code_situation": "abnet04"
      });
      res.redirect(`${FRONT_URL}/auth/apply-battletag?` + query);
      return;
    }
  
});


// (passport 이용해서 블리자드 계정 로그 아웃이 안된다) 블리자드 홈페이지 가서 로그아웃 해서 돌아오면 로그아웃 되어있다


module.exports = router;
