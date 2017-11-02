// Variables - Dependencies & Reqs
var express = require('express');
var router = express.Router();
const db = require('../models');


// GET - Landing page (login)
router.get('/', function(request, response, next) {
  response.render('../views/partials/login');
});

//Get new user sign up page
router.get('/user/new', function(req, res) {
  res.render('../views/partials/newUser.handlebars')
})

router.get('/courses/new', function(req, res) {
  res.render('../views/partials/newCourse.handlebars')
})

//Route to create new User
router.post('/api/users', function(req, res) {
  db.Users.create({
    name:req.body.name,
    username: req.body.username,
    password: req.body.password,
  })
  .then(function(result) {
    res.json(result);
  });
});

router.get('/user/:username', function(req, res, next) {
  let userName = req.params.username;
  console.log(userName);
  db.Users.findOne({
    where: {
      name: userName
    }
  })
  .then((result) => {
    const currentUserId = result.id;
    return db.Enrollment.findAll({
      where: {
        userId: currentUserId
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
      courses
    }
      res.render('../views/partials/profile.handlebars', object)
    })
  .catch(next);
});

router.post('/api/courses', function(req, res) {
  db.Courses.create({
    instructor: req.body.email,
    name:req.body.name,
    description: req.body.description,
    time: req.body.time,
  })
  .then(function(result) {
    let courseId = result.id
    db.Users.findOne({
      where: {
        username: req.body.email
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
