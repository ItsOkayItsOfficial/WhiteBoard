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

$('#submitNewCourse').on('click', function(e) {
  e.preventDefault();
  let newCourse = {
    instructor: usersLocalStorage.login,
    name: $('#inputCourseName').val(),
    description: $('#inputCourseDescription').val(),
    time: $('#inputCourseTime').val()
  }
  $.ajax("/api/courses", {
    type: "POST",
    data: newCourse
  }).then(
    function(data) {
      window.location.href = currentURL + '/user/' + usersLocalStorage.login;
    }
  );
})

});