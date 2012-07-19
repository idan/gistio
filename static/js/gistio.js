var Gisted = (function($, undefined) {
    function gist(gist_id) {
        $.getJSON('/' + gist_id + '/content')
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
    function user(username) {
        $.getJSON('/' + username + '/gists')
            .done(function(data, textStatus, xhr) {
                $("#description").text('');

                var empty = true;
                var title;
                for (var i=0; i<data.length; i++) {
                    if(!data[i]['renderable'] || !data[i]['description']) continue;

                    empty = false;
                    title = $('<h2><a href="/' + data[i]['id'] + '"></a></h2>');
                    $('a', title).text(data[i]['description']);
                    $("#userbody").append(title);
                }

                if (empty) {
                    apologize("No Content Found");
                }
            })
            .fail(function(xhr, status, error) {
                if (xhr.status == 404) {
                    apologize("No User Found");
                } else {
                    apologize("Unable to Fetch User");
                }
            })
            .always(function() {
                $("#description").removeClass("loading");
                $(".content>footer").fadeIn();
            });
    }
    var apologize = function(errorText) {
        $("#description").text(errorText);
        var apology = $('<p>').attr('class', 'apology').text("Quite flummoxed. Terribly sorry.");
        $('#gistbody').append(apology);
    };
    return {
        gist: gist,
        user: user
    };
})(jQuery);