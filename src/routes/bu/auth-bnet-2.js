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
 
const { generateToken, checkToken } = require('../works/auth/token');

var router = express.Router();

/*
app.use(session({
  secret: SECRET_CODE,
  cookie: { maxAge: 60 * 60 * 1000 }
  resave: true,
  saveUninitialized: false
}));
*/

router.use(session({ secret: 'SECRET_CODE', resave: true, saveUninitialized: false, cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } }));
router.use(passport.initialize());
router.use(passport.session());

//router.use(cors());   // blizzard cors 설정 때문에 필요한듯 => 아니다, a 요소 링크로 들어가는 걸로 해결

// Use the BnetStrategy within Passport.
passport.use(new BnetStrategy({
    clientID: BNET_ID,
    clientSecret: BNET_SECRET,
    callbackURL: "https://a-ns.avantwing.com/auth-bnet/callback",
    region: "us"
}, async function(accessToken, refreshToken, profile, done) {
    
    //console.log(profile);
    
 //https://cheese10yun.github.io/Passport-part1/
    User.findOne({ battletag: profile.battletag }, (err, tUser) => {
        
        if (tUser) {
            return done(err,  {_id:tUser._id, battletag: tUser.battletag } );
        } // 회원 정보가 있으면 로그인
        
        else {
          const mongoUser = new User({ // 없으면 회원 생성
              _id: uuid()
              , battletag: profile.battletag
          });
          
          mongoUser.save();
          
          return done(null,  {_id:mongoUser._id, battletag: mongoUser.battletag }); // 새로운 회원 생성 후 로그인
        } //else
        
    }); //User.findOne
    
    //return done(null, profile);
}));

// https://cheese10yun.github.io/Passport-part1/
// https://www.zerocho.com/category/NodeJS/post/57b7101ecfbef617003bf457
passport.serializeUser((User, done) => {
  done(null, User); // tUser 혹은 mongoUser (실질적으로 같다)
});
passport.deserializeUser((User, done) => {
  done(null, User);
});



router.get('/login',
    passport.authenticate('bnet'));
 
router.get('/callback',
    passport.authenticate('bnet', 
    
    {
      failureRedirect: 'https://ns.avantwing.com/logged-out',
      successRedirect: '/auth-bnet/success'
    })
);

// 
router.get('/success', ensureAuthenticated, function(req, res){
   console.log("bnet success!")
   // req.session.valid = true;
   
   const payload = {
        _id: this._id,
        battletag: this.battletag
    };

    const token = generateToken(payload, 'User');
   
   
    res.redirect(`https://ns.avantwing.com?token=${token}`)
    //res.send(req.user);
});

function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) { return next(); }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect('https://ns.avantwing.com/logged-out');
}




// 우선 배틀넷 통해서 내가 만든 토큰 얻고, 그 토큰 이용해서 내 서버에서 정보 찾아서 res 으로 프론트로 주기
router.get('/check', checkToken, async (req, res) => {
  
  try {
    
    const { tokenUser } = req;
    
    
    if(!tokenUser) {
      console.log("there is no User from token")
      res.status(403); // forbidden
      return;
    }

    User.findOne({ battletag: tokenUser.battletag, _id: tokenUser._id }, (err, foundUser) => {
        
      if (foundUser) {
        res.json({
          _id: foundUser._id
          ,battletag: foundUser.battletag
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




// https://velog.io/@parkoon/Passport.js-%EB%A1%9C-%EC%86%8C%EC%85%9C-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84%ED%95%98%EC%9D%B4
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    req.logout()
    res.redirect('/')
  })
})







module.exports = router;
