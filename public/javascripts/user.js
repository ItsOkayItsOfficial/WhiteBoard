$(function() {
  const currentURL = window.location.origin;
  let clientId = '51ec5a185abed21675e6';
  let clientSecret = '38e3b69bbddbd7d9bc89d44935615578f96ff4cd';
  let redirectUri = 'http://127.0.0.1:3000/new';

  $('#newUser').on('click', function(event) {
    event.preventDefault();
    let newUser = {
      name: $('#inputName').val(),
      username: $('#inputEmail').val(),
      password: $('#inputPassword').val()
    };
    console.log(newUser);

    $.ajax("/api/users", {
      type: "POST",
      data: newUser
    }).then(
      function(data) {
        res.redirect('./')
      }
    );
  });

  $('#login').on('click', function(event) {
    event.preventDefault();

      let username = $('#inputEmail').val();

      // $.ajax('/user/' + username, {
      //   type: 'GET',
      // }).then(
      //   function(data) {
      //     console.log(data);
      //     window.location.replace(currentURL + '/user/' + username);
      //   }
      // )

      gitHubRedirect();
});

function gitHubRedirect () {
  window.location.replace('https://github.com/login/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirectUri + '&state=1234');
}


  $('#newCourse').on('click', function(e) {
    e.preventDefault();
    let newCourse = {
      email: $('#inputInstructorEmail').val(),
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