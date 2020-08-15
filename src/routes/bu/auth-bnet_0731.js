// 의존한 강의
// https://velog.io/@cyranocoding/PASSPORT.js-%EB%A1%9C-%EC%86%8C%EC%85%9C-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0

import express from 'express';
import dotenv from 'dotenv';
//import cors from 'cors';
import axios from 'axios';
import session from 'express-session';
import passport from 'passport';
import { uuid } from 'uuidv4'; // https://www.npmjs.com/package/uuidv4

import User from '../models/User';

var BnetStrategy = require('passport-bnet').Strategy;

var BNET_ID = process.env.BNET_ID
var BNET_SECRET = process.env.BNET_SECRET
var SECRET_KEY = process.env.SECRET_KEY
 
const { generateToken, checkToken } = require('../works/auth/token');

var router = express.Router();


router.use(passport.initialize());
router.use(session({ secret: SECRET_KEY, resave: true, saveUninitialized: false, cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } }));

//router.use(passport.session());

//router.use(cors());   // blizzard cors 설정 때문에 필요한듯 => 아니다, a 요소 링크로 들어가는 걸로 해결

passport.use(new BnetStrategy({
    clientID: BNET_ID,
    clientSecret: BNET_SECRET,
    callbackURL: "https://a-ns.avantwing.com/auth-bnet/callback",
    region: "us"
}, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));





// https://cheese10yun.github.io/Passport-part1/
// https://www.zerocho.com/category/NodeJS/post/57b7101ecfbef617003bf457
// done의 두번째 null에 profile 넣으면 되지만, 난 매번 재 로그인 하고 싶기에 null
passport.serializeUser((updatedUser, done) => {
  done(null, updatedUser); // tUser 혹은 mongoUser (실질적으로 같다)
});

// 중복확인?
passport.deserializeUser((updatedUser, done) => {
  done(null, updatedUser);  // profile인지 User 인지 잘 모르겠지만...
});



 
// 처음 들어오는 곳
router.get('/',
  passport.authenticate('bnet'));


router.get('/callback',

  passport.authenticate('bnet', { failureRedirect: `https://ns.avantwing.com?reason=bnet-failure` } ),
  
  async function(req, res, next){
    
    try {
    
      //console.log(req.user);
      const profile = req.user;
      //const battletag = profile.battletag;
      
      
        await User.findOne({ battletagConfirmed: profile.battletag}, (err, foundConfirmedUser) => {
            
          // 이미 등록하고 확인까지 받은 유저가 있다면!
          
          if (foundConfirmedUser) {
            const message =  `'${profile.battletag}'is already in use`;
            res.redirect(`https://ns.avantwing.com?situation=error&message=${message}`);
          } 
          
        }) // User.findOne
      
      
      
     //{$lte: new Date().getTime()-(30*60*1000) } }
      await User.findOne({ battletagPending: profile.battletag}, async function (err, foundUser) {
          
        // battletagPending 에 같은 배틀태그의 유저가 있으면, 해당 유저에 battletagConfirmed 로서 부여
        // 단, 그냥 battletagPending 에 타인의 배틀태그를 적는 사람들도 있을 수 있으니, battletagPending 은 항상 조금만 유지시키고 얼마후 초기화하는 작업이 필요하다
        try {
          if (foundUser) {
            
            // 유저를 찾고, 배틀태그 등록한 시간도 최근 30분 안이면, 정상적으로 배틀태그 부여, 로그인.
            if (foundUser.whenBattletagPendingAdded >= (Date.now() - 30*60*1000) ) {
            
              const update = {battletagConfirmed: profile.battletag, battletagPending: ""};
              await User.updateOne({battletagPending: profile.battletag }, update);
              
              const updatedUser = {
                _id: foundUser._id
                , email: foundUser.email
                , battletagConfirmed: profile.battletag
              }
              res.redirect(`https://ns.avantwing.com`);
              //res.redirect(`/auth-bnet/success`)
            }
            
            // 유저를 찾앗지만 배틀태그 등록 시간이 너무 예전인 경우, 로그인도 안하고 메시지만 전달
            else {
              const message =  `more than 30 mins passed since user applied this battletag`;
              res.redirect(`https://ns.avantwing.com?situation=error&message=${message}`);
            }
            
          } // if (foundUser)
          // 아예 못찾은 경우
          else { 
            const message =  `no user applied this battletag before`;
            res.redirect(`https://ns.avantwing.com?situation=error&message=${message}`);
          } //else
        } // try
        catch(error) { 
          console.log(error); 
          res.redirect(`https://ns.avantwing.com?reason=bnet-failure`); 
        }
        
      } //async (err, foundUser)
       
        
      ); //User.findOne
        
      
      
    } // outer try
    catch (error) {
      console.log(error);
      next(error);
      //res.redirect(`https://ns.avantwing.com?reason=bnet-failure`); 
    }
  
});





// cors 문제때문에 배틀넷으로 로그인/로그아웃 시스템은 내 실력으로 못하겠다 (배틀태그 확인만 진행중)
// https://velog.io/@parkoon/Passport.js-%EB%A1%9C-%EC%86%8C%EC%85%9C-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84%ED%95%98%EC%9D%B4
router.get('/log-out', (req, res) => {

  req.logout();
  req.session.save( function(){
    res.redirect('https://ns.avantwing.com?reason=bnet-logged-out');
  })
})




module.exports = router;
