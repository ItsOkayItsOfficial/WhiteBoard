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

router.get('/new', function(req, res) {
  res.render('../views/partials/loading.handlebars')
})

//Route to create new User
router.post('/api/users', function(req, res) {
  db.Users.create({
    user_name:req.body.name,
    user_login: req.body.login,
    user_email: req.body.email,
    user_desc: req.body.bio,
    user_avatar: req.body.avatar_url
  })
  .then(function(result) {
    res.json(result);
  });
});

router.get('/user/:username/newCourse', function(req, res, next) {
  let username = req.params.username;
});



router.get('/user/:username', function(req, res, next) {
  let userName = req.params.username;
  db.Users.findOne({
    where: {
      user_login: userName
    }
  })
  .then((result) => {
    user = result.dataValues;
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
    let courses = [];
    for (let i = 0; i < result.length; i++) {
      courses.push(result[i].dataValues.Course)
    }
    return courses;
  })
  .then((courses) => {
    let object = {
      courses,
      user
    }
      res.render('../views/partials/profile.handlebars', object)
    })
  .catch(next);
});

router.post('/api/courses', function(req, res) {
  db.Courses.create({
    course_instructor: req.body.instructor,
    course_name:req.body.name,
    course_desc: req.body.description,
    course_time: req.body.time,
  })
  .then(function(result) {
    let courseId = result.dataValues.id;
    db.Users.findOne({
      where: {
        user_login: req.body.instructor
      }
    }).then(function(result) {
      let userId = result.id;
      db.Enrollment.create({
        CourseId: courseId,
        UserId: userId
      })
    })
  });
});


router.get('/courses/all', function(res, res) {
  db.Courses.findAll({
  })
  .then(function(result) {
    let courseObject = {
      courses: result
    }
    res.render('../views/partials/profile.handlebars', courseObject)
  })
})


module.exports = router;
