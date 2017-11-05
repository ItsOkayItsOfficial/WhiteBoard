$(function() {
const currentURL = window.location.origin;
let clientId = '51ec5a185abed21675e6';
let clientSecret = '38e3b69bbddbd7d9bc89d44935615578f96ff4cd';
let redirectUri = 'http://127.0.0.1:3000/new';
let usersLocalStorage = JSON.parse(localStorage.getItem('User'));
console.log(usersLocalStorage);



//Redirects user to github to be authenticated
function gitHubRedirect () {
    window.location.replace('https://github.com/login/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirectUri + '&state=1234');
};
// After redirect, posts the auth code, stores the returned access token, then gets the user data and posts it to our DB
function userAuthentication() {
  //parses the authentication code from the URL
  function getAuthCode(url){
    var error = url.match(/[&\?]error=([^&]+)/);
    if (error) {
        throw 'Error getting authorization code: ' + error[1];
    }
    return url.match(/[&\?]code=([\w\/\-]+)/)[1];
  }
  //defines the authentication code
  let authCode = getAuthCode(window.location.href);
  //posts to github to receive accesstoken
  $.post('https://github.com/login/oauth/access_token?&client_id=' + clientId + '&client_secret=' + clientSecret + '&code=' + authCode, function(data) {
    localStorage.setItem("accessToken", data);
    //get request from github to get user data
    $.get('https://api.github.com/user?' + data, function(res, err) {
      let user = res;
      //store user data locally
      localStorage.setItem('User', JSON.stringify(res));
      //stores user in database
      $.post('/api/users', user, function(data) {
        //if the response is a string (an existing user) redirect to that username profile page
        if (typeof(data) === 'string'){
          return window.location.href = currentURL + '/user/' + data;
        }
        //if new user then go to the new user's login page
          window.location.href = currentURL + '/user/' + data.user_login;
      });
    });
  }); 
};

//Initial log in button before authentication
$('#login').on('click', function(event) {
    event.preventDefault();
    gitHubRedirect();
});

//Login button that appears after authentication
$('#authenticatedUser').on('click', function(event) {
  event.preventDefault();
  userAuthentication();
});

  //When user submits a new course
$('#submitNewCourse').on('click', function(e) {
  const weekInMiliseconds = 604800000;
  const dayInMiliseconds = 86400000;
  //All dates in unix (ms)
  let startDate = moment($('#inputStartDate').val() + " " + $('#inputCourseTime').val()).valueOf();

  let endDate = moment($('#inputEndDate').val() + " " + $('#inputCourseTime').val()).valueOf();
  let courseLength = endDate - startDate;
  let numberOfWeeks = courseLength/weekInMiliseconds;
  console.log('Number of weeks: ' + numberOfWeeks);

  let sessionFrequency = $('#inputCourseFreq').val();

  let sessionDates = [];
  //MWF Class option class starts on monday

  if ($('#inputCourseFreq').val() === '3') {
    //Class every 2 days m/w/f
    for (let i =0; i < numberOfWeeks; i++) {
      let sessionInterval = dayInMiliseconds * 2;
      for (let j = 0; j < sessionFrequency; j ++) {
        sessionDates.push(startDate);

        if (sessionDates.length > 0 && sessionDates.length % 3 == 0) {
          sessionInterval = dayInMiliseconds * 3;
          startDate += sessionInterval;
        }
        else {
          startDate += sessionInterval;
        }
      }
    }
  }

  //Class every weekday
  if ($('#inputCourseFreq').val() === '5') {
      for (let i =0; i < numberOfWeeks; i++) {
        let sessionInterval = dayInMiliseconds;
      for (let j = 0; j < sessionFrequency; j ++) {
        sessionDates.push(startDate);

        if (sessionDates.length > 0 && sessionDates.length % 5 == 0) {
          sessionInterval = dayInMiliseconds * 3;
          startDate += sessionInterval;
        }
        else {
          startDate += sessionInterval;
        }
      }
    }
  }
  //Formats session dates before sending to server
  for (let i = 0; i < sessionDates.length; i++) {
    sessionDates[i] = (sessionDates[i]/1000);
    sessionDates[i] = moment.unix(sessionDates[i]).format('MM/DD/YY h:mmA')
  }
    e.preventDefault();
    let newCourse = {
      instructor: usersLocalStorage.login,
      name: $('#inputCourseName').val(),
      description: $('#inputCourseDescription').val(),
      time: $('#inputCourseTime').val(),
      sessions: sessionDates
    };

    //posts new course to server
    $.ajax("/api/courses", {
      type: "POST",
      data: newCourse
    }).then(
      //after response, sends user to profile page to see all courses
      function(data) {
        window.location.href = currentURL + '/user/' + usersLocalStorage.login;
      }
    );
});


 //When user clicks on one of their courses, redirects them to the sessions for that course
  $('.selectedCourse').on('click', ((e) => {
      e.preventDefault();
      let courseId = $(e.target)[0].id;
      console.log(courseId);
      window.location.href = currentURL + '/courses/' + courseId + '/sessions'
  }))

  //Posts a resource
  $('.resourceSubmit').on('click', function(e) {
    e.preventDefault();
    let sessionId = $(this).attr('id');
    let newResource = {
      courseId: $('#CourseId').html(),
      userName: usersLocalStorage.login,
      resourceUrl: $('#resourceUrl' + sessionId).val(),
      resourceDesc: $('#resourceDesc' + sessionId).val(),
      sessionId
    }

    $.post('/api/sessions/resources', newResource, ((data) => {
      console.log(data);
      window.location.reload();
    }))

  });

  $('.ratingSubmit').on('click', function(e) {
    e.preventDefault();

      let newRating = {
        SessionId: $(this).attr('id'),
        rating: $("#sessionRating" + $(this).attr('id')).val(),
        userName: usersLocalStorage.login,
      }

      $.post('/api/sessions/rating', newRating, ((data) => {
        console.log(data);
        window.location.reload();
      }))
  });
});
