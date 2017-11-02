$(function() {

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
      let currentURL = window.location.origin;

      let username = $('#inputEmail').val();

      $.ajax('/user/' + username, {
        type: 'GET',
      }).then(
        function(data) {
          console.log(data);
          window.location.replace(currentURL + '/user/' + username);
        }
      )
});



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