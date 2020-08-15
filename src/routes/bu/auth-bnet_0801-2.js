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


// Use the BnetStrategy within Passport.
passport.use(new BnetStrategy({
  clientID: BNET_ID,
  clientSecret: BNET_SECRET,
  callbackURL: "https://a-ns.avantwing.com/auth-bnet/callback",
  region: "us"
}, async function(accessToken, refreshToken, profile, done) {
    
    //console.log(profile);
    
 //https://cheese10yun.github.io/Passport-part1/

  try {
  
    const foundConfirmedUser = await User.findOne({ battletagConfirmed: profile.battletag});
      // 이미 등록하고 확인까지 받은 유저가 있다면!
     
    if (foundConfirmedUser) {
      return done(null, false, { message: `'${profile.battletag}'is already in use` });
    } 
      
    else { 
   
      
     //{$lte: new Date().getTime()-(30*60*1000) } }
      await User.findOne({ battletagPending: profile.battletag}, async (err, foundUser) => {
          
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
              
              return done(null, updatedUser); // 잘모르겠지만, 우선...
              //return done(err,  {_id:foundUser._id, battletag: foundUser.battletag } );
            }
            
            // 유저를 찾앗지만 배틀태그 등록 시간이 너무 예전인 경우, 로그인도 안하고 메시지만 전달
            else {
              return done(null, false, { message: "more than 30 mins passed since user applied this battletag" });
            }
            
          } 
          
          else {
            
            return done(null, false, { message: 'no user applied this battletag before' });
            //return done(null,  {_id:mongoUser._id, battletag: mongoUser.battletag }); // 새로운 회원 생성 후 로그인
          } //else
        } // try
        catch(error) { console.log(error); return done(error, false); }
      }); //User.findOne
        
        //return done(null, profile);
        
    } //else
      
    } // try
    catch (error) {
      console.log(error);
      //throw new Error(error);
      return done(error, false);
    }
  }));


// https://cheese10yun.github.io/Passport-part1/
// https://www.zerocho.com/category/NodeJS/post/57b7101ecfbef617003bf457
// done의 두번째 null에 profile 넣으면 되지만, 난 매번 재 로그인 하고 싶기에 null
passport.serializeUser((user, done) => {
  done(null, user); 
});
passport.deserializeUser((user, done) => {
  done(null, user);  // profile인지 User 인지 잘 모르겠지만...
});

/*
// 처음에 들어가기 전에 배틀넷 로그아웃 먼저!
router.get('/', async (req, res, next) => {
  
  try {
    
    await req.session.destroy();
    await req.logout();
    res.redirect('/auth-bnet/check');
    
  } catch(error) { next(error) }
  
});
*/

 
// 처음 들어오는 곳
router.get('/',
  passport.authenticate('bnet'));

// new
router.get('/callback',
    passport.authenticate('bnet', 
    
    {
      failureRedirect: 'https://ns.avantwing.com/?reason=bnet-failure',
      successRedirect: 'https://ns.avantwing.com/?reason=bnet-success'
    })
);

/*
// 나대범 병장님 코드
router.get('/callback', passport.authenticate('bnet', { failureRedirect: `https://ns.avantwing.com/?reason=bnet-failure` }), (req, res, next) => {
  //req.user.password = undefined
  req.session.authUser = req.user
  let locale = req.cookies.i18n_redirected
  res.redirect(`../../${locale == 'en' ? '' : locale}`)
})
*/


router.get('/callback', (req, res, next) => {
  
  passport.authenticate('bnet', { failureRedirect: `https://ns.avantwing.com/?reason=bnet-failure` },
    
    (err, updatedUser, info) => {
      if (err) { return next(err); }
      else if (!updatedUser) { 
        res.redirect(`https://ns.avantwing.com?situation=error&message=${info.message}`);
        return;
      }
      else {
        res.redirect(`/auth-bnet/success`)
        return;
      }
    }
    
  ) (req, res, next);
  
  return;
  
});


/*

router.get('/callback', (req, res, next) => {
  
  passport.authenticate('bnet',
    
    (err, updatedUser, info) => {
      if (err) { return next(err); }
      else if (!updatedUser) { 
        res.redirect(`https://ns.avantwing.com?situation=error&message=${info.message}`);
        return;
      }
      else {
        res.redirect(`/auth-bnet/success`)
        return;
      }
    }
    
  ) (req, res, next);
  
  return;
  
});
*/

// 로그인 시도 후 이동하는 곳 
/*
passport.authenticate('bnet', 
  {
    failureRedirect: 'https://ns.avantwing.com?reason=bnet-failure',
    successRedirect: '/auth-bnet/success'
  }
)
*/


/*
router.get('/callback',  async (req, res, next) => {
  
  try {
    
    await passport.authenticate('bnet', {successRedirect: '/auth-bnet/success', failureRedirect: 'https://ns.avantwing.com?reason=bnet-failure'},
      
      (err, updatedUser, info) => {
        if (err) { return next(err); }
        else if (!updatedUser) { 
          res.redirect(`https://ns.avantwing.com?situation=error&message=${info.message}`);
          return;
        }
        else {
          res.redirect(`/auth-bnet/success`)
          return;
        }
      }
      
    ) (req, res, next);
    
    return;
    
  } catch(error) { next(error) }
  
});
*/

/*
// 임시방편
//https://www.zerocho.com/category/NodeJS/post/57c68e7359bbe115004f7282
router.get('/callback', passport.authenticate('bnet', { failureRedirect: `https://ns.avantwing.com?reason=bnet-failure` }), function(req, res) {
  res.redirect('/auth-bnet/success');
});
*/






/*
// null 은 옵션
router.get('/callback', 
  
  (req, res, next ) => {
    passport.authenticate('bnet', null,
      
      (err, profile, info) => {
        if (err) { return next(err); }
        else if (!profile) { 
          res.redirect(`https://ns.avantwing.com?situation=error&message=${info.message}`)
          return;
        }
        else {
          res.redirect(`/auth-bnet/success`)
          return;
        }
      }
      
    ) (req, res, next);  // passport.authenticate
  } // function(req, res, next )
    
);
*/




/*
// cors 문제때문에 배틀넷으로 로그인/로그아웃 시스템은 내 실력으로 못하겠다 (배틀태그 확인만 진행중)
// ((우선 배틀넷 통해서 내가 만든 토큰 얻고, 그 토큰 이용해서 내 서버에서 정보 찾아서 res 으로 프론트로 주기))
router.get('/check', checkToken, async (req, res) => {
  
  try {
    
    const { tokenUser } = req;
    
    
    if(!tokenUser) {
      console.log("there is no User from token")
      res.status(403); // forbidden
      return;
    }

    User.findOne({ _id: tokenUser._id }, (err, foundUser) => {
        
      if (foundUser) {
        res.json({
          _id: foundUser._id
          ,email: foundUser.email
          ,battletagConfirmed: foundUser.battletagConfirmed
        });
      } // 회원 정보가 있으면 그 정보 res 으로 프론트로 전달
      else {
        console.log("there is no User from server");
        res.status(403); // forbidden
        return;
      }
    });
    
  } catch(error) { next(error) }
  
});
*/



/*
// cors 문제때문에 배틀넷으로 로그인/로그아웃 시스템은 내 실력으로 못하겠다 (배틀태그 확인만 진행중)
// https://velog.io/@parkoon/Passport.js-%EB%A1%9C-%EC%86%8C%EC%85%9C-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84%ED%95%98%EC%9D%B4
router.get('/log-out', (req, res) => {

  req.logout();
  req.session.save( function(){
    res.redirect('https://ns.avantwing.com?reason=bnet-logged-out');
  })
})
*/



module.exports = router;
