// grab articles as json
$.getJSON("/articles", function (data) {
    for (var i = 0; i <data.length; i++) {
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].summary + "<br />" + data[i].url + "</p>");

    }
});

$(document).on("click", "p", function () {
    $("#notes").empty();
    var thisId = $(this).attr("data-id");

    $.ajax({
        method: "GET",
        url: "/articles" + thisId
    }).then(function(data) {
        console.log(data);

        //title of article 
        $("#notes").append("<h2" + data.title + "</h2");

        //input to enter new title
        $("#notes").append("<input id= 'titleinput' name= 'title'>");

        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");

        $("#notes").append("button data-id='" + data._id + "' id='savenote'>Save Note</button>");

        if (data.note) {
            $("#titleinput").val(data.note.title);
            $("#bodyinput").val(data.note.body);

        }
    });
});

$(document).on("click", "#savenote", function () {
    var thisId = $(this).attr("data-id");

    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            title: $("#title-note").val(),
            body: $("#body-note").val()
        }
    })
    .then(function(data){
        console.log(data);
        window.location.replace("/articles/" + data._id);

        $("#notes").empty();

    });

    $("#titleinput").val("");
    $("#bodyinput").val("");
});

$(document).on("click", "#delete-note", function () {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "DELETE",
        url: "/articles/" + thisId
    })
    .then(function(data) {
        console.log(data);
        location.reload();
    });

});

