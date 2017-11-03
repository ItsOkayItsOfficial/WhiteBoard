$(function() {
const currentURL = window.location.origin;
let clientId = '51ec5a185abed21675e6';
let clientSecret = '38e3b69bbddbd7d9bc89d44935615578f96ff4cd';
let redirectUri = 'http://127.0.0.1:3000/new';

function gitHubRedirect () {
  return new Promise(function(reject, resolve) {
    window.location.replace('https://github.com/login/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirectUri + '&state=1234');
    resolve(window.onLoad(console.log('hello')));
  });
};


function userAuthentication() {
  function getAuthCode(url){
    var error = url.match(/[&\?]error=([^&]+)/);
    if (error) {
        throw 'Error getting authorization code: ' + error[1];
    }
    return url.match(/[&\?]code=([\w\/\-]+)/)[1];
  }

  let authCode = getAuthCode(window.location.href);
  $.post('https://github.com/login/oauth/access_token?&client_id=' + clientId + '&client_secret=' + clientSecret + '&code=' + authCode, function(data) {
    localStorage.setItem("accessToken", data);
    $.get('https://api.github.com/user?' + data, function(res, err) {
      let user = res;
      $.post('/api/users', user, function(data) {
        window.location.href = currentURL + '/user/' + data.user_login;
      });
    });
  }); 
}


function gitHubRedirect () {
    window.location.replace('https://github.com/login/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirectUri + '&state=1234');
};


$('#login').on('click', function(event) {
    event.preventDefault();
    gitHubRedirect();
});

$('#authenticatedUser').on('click', function(event) {
  event.preventDefault();
  userAuthentication();
})
$('#submitNewCourse').on('click', function(e) {
  e.preventDefault();
  let newCourse = {
    instructor: 'wcrozier12',
    name: $('#inputCourseName').val(),
    description: $('#inputCourseDescription').val(),
    time: $('#inputCourseTime').val()
  }
  $.ajax("/api/courses", {
    type: "POST",
    data: newCourse
  }).then(
    function(data) {
      res.redirect('./')
    }
  );
})


});