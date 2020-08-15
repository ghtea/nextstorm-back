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
      failureRedirect: 'https://ns.avantwing.com/auth/failure',
      successRedirect: '/auth-bnet/success'
    })
);

// 
router.get('/success', ensureAuthenticated, function(req, res){
   console.log("bnet success!")
   // req.session.valid = true;
    res.redirect('https://ns.avantwing.com')
    //res.send(req.user);
});

function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) { return next(); }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect('/auth/login');
}


// https://velog.io/@parkoon/Passport.js-%EB%A1%9C-%EC%86%8C%EC%85%9C-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84%ED%95%98%EC%9D%B4
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    req.logout()
    res.redirect('/')
  })
})




module.exports = router;
