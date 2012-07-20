var Gisted = (function($, undefined) {
    var comments = function(gist_id) {
      var gistxhr = $.getJSON('/' + gist_id + '/comments')
          .done(function(data, textStatus, xhr) {
              for (var i = 0; i < data.length; i++) {
                  var comment = data[i];
                  var author_url = '<a class="author_url" href="' + comment.user.url + '">' + comment.user.login + '</a>';
                  var body = "<p>" + comment.body + "</p>";
                  var avatar_image = '<img height=60 width=60 src="' + comment.user.avatar_url + '" />';
                  var comment = '<div class="comment"><br />' + avatar_image + author_url + body + '</div>';
                  $('#comments').append(comment);
              }
          })
          .fail(function(xhr, status, error) {
              apologize("Unable to fetch comments");
          });
    }
    var gist = function(gist_id) {
        var gistxhr = $.getJSON('/' + gist_id + '/content')
            .done(function(data, textStatus, xhr) {
                var description = data['description'];
                if (description) {
                    $("#description").text(description);
                } else {
                    $("#description").text('');
                }
                var files = data['files'];
                var keys = Object.keys(files);
                var empty = true;
                for (var i=0; i<keys.length; i++) {
                    var file = files[keys[i]];
                    if (file['rendered']) {
                        empty = false;
                        var filediv = $('<article>')
                            .attr('class', 'file')
                            .attr('data-filename', file['filename']);
                        filediv.html("<h1>" + file['filename'] + "</h1>" + file['rendered']);
                        $('#gistbody').append(filediv);
                    }
                }
                if (empty) {
                    apologize("No Content Found");
                }

                if (xhr.getResponseHeader("X-Cache-Hit") == "True") {
                    mixpanel.track("Cache Hit");
                } else {
                    mixpanel.track("Cache Miss");
                }
            })
            .fail(function(xhr, status, error) {
                if (xhr.status == 404) {
                    apologize("No Content Found");
                } else {
                    apologize("Unable to Fetch Gist");
                }
            })
            .always(function() {
                $("#description").removeClass("loading");
                $(".content>footer").fadeIn();
            });
    };
    var apologize = function(errorText) {
        $("#description").text(errorText);
        var apology = $('<p>').attr('class', 'apology').text("Quite flummoxed. Terribly sorry.");
        $('#gistbody').append(apology);
    };
    return {
        gist: gist,
        comments: comments
    };
})(jQuery);
