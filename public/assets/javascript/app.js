
// scrape button function
$("#scrape").on("click", function () {
    console.log("button worked");
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {
        console.log(data)
        window.location ="/"
    })

});

// save article button function
$(".save").on("click", function () {
    console.log("button worked");
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId,
    }).done(function(data) {
        console.log(data)
        window.location ="/"
    })
});

// delete article button function
$(".delete",).on("click", function () {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/delete/" + thisId,
    }).done(function(data) {
        console.log(data)
        window.location ="/saved"
    })
});

//saved note button function
$(".saveNote").on("click", function () {
    var thisId = $(this).attr("data-id");
    if (!$("#noteText" + thisId).val()) {
        alert("please enter a note")
    } else {
    $.ajax({
        method: "POST",
        url: "/notes/save/" + thisId,
        data: {
            text: $("#noteText" + thisId).val()
        }
        }).done(function(data) {
            console.log(data);
            $("#noteText" +thisId).val("");
            $(".modalNote").modal("hide");
            window.location = "/saved"
        
        });
    }

});

$(".deleteNote").on("click", function () {
    var noteId = $(this).attr("data-note-id");
    var articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/notes/delete/" + noteId + "/" + articleId
    }).done(function (data) {
        console.log(data);
        $(".modalNote").modal("hide");
        window.location = "/saved"
    })
 
});


// $.getJSON("/articles", function (data) {
//     for (var i = 0; i <data.length; i++) {
//         $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].summary + "<br />" + data[i].url + "</p>");

//     }
// });

// $(document).on("click", "p", function () {
//     $("#notes").empty();
//     var thisId = $(this).attr("data-id");

//     $.ajax({
//         method: "GET",
//         url: "/articles" + thisId
//     }).then(function(data) {
//         console.log(data);

//         //title of article 
//         $("#notes").append("<h2" + data.title + "</h2");

//         //input to enter new title
//         $("#notes").append("<input id= 'titleinput' name= 'title'>");

//         $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");

//         $("#notes").append("button data-id='" + data._id + "' id='savenote'>Save Note</button>");

//         if (data.note) {
//             $("#titleinput").val(data.note.title);
//             $("#bodyinput").val(data.note.body);

//         }
//     });
// });

// $(document).on("click", "#savenote", function () {
//     var thisId = $(this).attr("data-id");

//     $.ajax({
//         method: "POST",
//         url: "/articles/" + thisId,
//         data: {
//             title: $("#title-note").val(),
//             body: $("#body-note").val()
//         }
//     })
//     .then(function(data){
//         console.log(data);
//         window.location.replace("/articles/" + data._id);

//         $("#notes").empty();

//     });

//     $("#titleinput").val("");
//     $("#bodyinput").val("");
// });

// $(document).on("click", "#delete-note", function () {
//     var thisId = $(this).attr("data-id");
//     $.ajax({
//         method: "DELETE",
//         url: "/articles/" + thisId
//     })
//     .then(function(data) {
//         console.log(data);
//         location.reload();
//     });

// });

