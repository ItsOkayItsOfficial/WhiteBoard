// Variables - Dependencies & Reqs
var express = require('express');
var router = express.Router();
const db = require('../models');
let user = {};


// GET - Landing page (login)
router.get('/', function(request, response, next) {
  response.render('../views/partials/login');
});

//Get new user sign up page
router.get('/user/new', function(req, res) {
  res.render('../views/partials/newUser.handlebars')
})
//Callback URL for github Oauth
router.get('/new', function(req, res) {
  let newObject = {
    message: 'Authentication complete, click sign in'
  }
  res.render('../views/partials/login.handlebars', newObject);
})

// //Get request for sessions when user clicks on course
router.get('/courses/:courseId/sessions', function(req, res) {
  let CourseId = req.params.courseId;
    return db.Sessions.findAll({
      where: {
        CourseId
      },
      order: [['session_date', 'ASC']],
      include: [{
        model: db.Resources,
      }]
    })
    .then((sessions) => {
      let hbsObject = {
        CourseId,
        sessions
      };
      res.render('../views/partials/session_card.handlebars', hbsObject)
    })
});


//Route users are sent to for user creation
router.post('/api/users', function(req, res) {
  //query to see if user exists
  db.Users.findAll({
    where: {
      user_login: req.body.login
    }
  })
  .then((result) => {
    //if the user does not exist, create the user in the database
    if (result[0] === undefined) {
      return db.Users.create({
        user_name:req.body.name,
        user_login: req.body.login,
        user_email: req.body.email,
        user_desc: req.body.bio,
        user_avatar: req.body.avatar_url
      })
    }
    // if the user exists, send back the user login information
    if (result[0].dataValues.id) {
      return result[0].dataValues.user_login;
    }
  })
  .then((result) => {
    res.json(result);
  })
});

//gets users profile page
router.get('/user/:username', function(req, res, next) {
  let userName = req.params.username;
  //finds user where username matches url parameter
  db.Users.findOne({
    where: {
      user_login: userName
    }
  })
  .then((result) => {
    //sets user to the user that logged in
    user = result.dataValues;
    //returns the logged in users courses
    return db.Enrollment.findAll({
      where: {
        userId: user.id
      },
      include: [{
          model: db.Courses,
      }]
    })
  })
  .then((result) => {
    console.log(result);
    //loops through the query result to place each courses information into the courses array
    let courses = [];
    for (let i = 0; i < result.length; i++) {
      courses.push(result[i].dataValues.Course)
    }
    return courses;
  })
  .then((courses) => {
    //sends the object with the courses and user information to handelbars to render the profile page
    let object = {
      courses,
      user
    }
      res.render('../views/partials/profileAdmin.handlebars', object)
    })
  .catch(next);
});

//Accepts post when user creates a course
router.post('/api/courses', function(req, res) {
  db.Courses.create({
    course_instructor: req.body.instructor,
    course_name:req.body.name,
    course_desc: req.body.description,
    course_time: req.body.time,
  })
  .then((result) => {
    //finds course ID
    let courseId = result.dataValues.id;
    //finds user that created the course
    return db.Users.findOne({
      where: {
        user_login: req.body.instructor
      }
    })
    .then((result) => {
      //stores the user that created the course
      let userId = result.id;
      //links the user and the course into the enrollment table
      return db.Enrollment.create({
        CourseId: courseId,
        UserId: userId
      })
    })
    .then((result) => {
      console.log(result.dataValues.CourseId);
      for (let i = 0; i < req.body.sessions.length; i ++) {
        db.Sessions.create({
          session_date: req.body.sessions[i],
          CourseId: result.dataValues.CourseId
        })
      }
      //this result gives courseID, WE WILL INSERT SESSIONS HERE USING COURSEID AS A FOREIGN KEY
    })
    .then((result) => {
      res.json('Successfully created course');
    })
  });
});

//route to create new resource
router.post('/api/sessions/resources', function(req, res) {
    return db.Sessions.findAll({
      where: {
        CourseId: req.body.courseId
      }
    })
    .then((result) => {
      return db.Users.findOne({
        where: {
          user_login: req.body.userName
        }
      })
    })
    .then((result) => {
      let userId = result.dataValues.id;
      return db.Resources.create({
        CourseId: req.body.courseId,
        UserId: userId,
        user_login: req.body.userName,
        SessionId: req.body.sessionId,
        resource_url: req.body.resourceUrl,
        resource_desc: req.body.resourceDesc
      })
    })
    .then((result) => {
      res.json('created resource');
    })
})

//Route when user submits a rating
router.post('/api/sessions/rating', function(req, res) {
  //finds user from username
  return db.Users.findOne({
      where: {
        user_login: req.body.userName
      }
  })
  .then((result) => {
  let userId= result.dataValues.id;
  //creates a rating associated with user
  return db.Ratings.create({
    SessionId: req.body.SessionId,
    rating: req.body.rating,
    UserId: userId
  })
  .then((result) => {
    //finds all ratings for the session the user rated
  return db.Ratings.findAll({
    where: {
      SessionId: req.body.SessionId
    }
    })
  })
  .then((result) => {
  //finds the average of all the ratings
  let allSessionRatings = [];
  let ratingSum = 0;
    for (let i = 0; i < result.length; i ++) {
      allSessionRatings.push(result[i].dataValues.rating);
    }
    for (let j = 0; j < allSessionRatings.length; j++) {
      ratingSum += allSessionRatings[j];
    }
    console.log(allSessionRatings);
    console.log(ratingSum);
    return ratingSum/allSessionRatings.length;
  })
  .then((session_rating) => {
    //updates the average rating in the session table
    let values = { session_rating: session_rating };
    let selector = { where: { Id: req.body.SessionId }}
    return db.Sessions.update(values, selector)
  })
  .then((result) => {
    console.log(result);
    res.json('Rating submitted')
  })
})

});

module.exports = router;
