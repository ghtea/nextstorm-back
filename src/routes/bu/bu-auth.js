import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';

var session = require('express-session');
var passport = require('passport');
var BnetStrategy = require('passport-bnet').Strategy;

var BNET_ID = process.env.BNET_ID
var BNET_SECRET = process.env.BNET_SECRET
 
 
var router = express.Router();

router.use(cors());
router.use(session({ secret: 'SECRET_CODE', resave: true, saveUninitialized: false }));
router.use(passport.initialize());
router.use(passport.session());
 
// Use the BnetStrategy within Passport.
passport.use(new BnetStrategy({
    clientID: BNET_ID,
    clientSecret: BNET_SECRET,
    callbackURL: "https://a-ns.avantwing.com/auth/bnet/callback",
    region: "us"
}, async function(accessToken, refreshToken, profile, done) {
    
    
    return done(null, profile);
}));


// https://velog.io/@cyranocoding/PASSPORT.js-%EB%A1%9C-%EC%86%8C%EC%85%9C-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});


router.get('/bnet',
    passport.authenticate('bnet'));
 
router.get('/bnet/callback',
    passport.authenticate('bnet', 
    
    {
      failureRedirect: '/auth/bnet/fail',
      successRedirect: '/auth/bnet/success'
    })
);


router.get('/bnet/success', ensureAuthenticated, function(req, res){
    
    req.session.valid = true;
    res.redirect('https://ns.avantwing.com')
    //res.send(req.user);
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) { return next(); }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect('/');
}


// https://www.zerocho.com/category/NodeJS/post/57b7101ecfbef617003bf457  <- 가장 좋다

// https://bcho.tistory.com/938
// https://burning-camp.tistory.com/22 <- 지금 공부중!!!
// https://zzdd1558.tistory.com/178 클라이언트에어 세션 정보 이용?!!



/*
router.get('/bnet/callback',
    passport.authenticate('bnet', { failureRedirect: '/' }),
    function(req, res){
        res.redirect('/');
    });
*/

/*
app.get('/login/google/callback',
	passport.authenticate('github', {
  	failureRedirect: '/login',
  	successRedirect: '/'
}));
*/

//https://github.com/auth0/passport-linkedin-oauth2/issues/43
// https://velog.io/@ground4ekd/nodejs-passport
// https://velog.io/@cyranocoding/PASSPORT.js-%EB%A1%9C-%EC%86%8C%EC%85%9C-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0

module.exports = router;