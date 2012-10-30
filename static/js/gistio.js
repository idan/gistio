var Gisted = (function($, undefined) {
    var gist = function(gist_id) {
        var gistxhr = $.getJSON('/' + gist_id + '/content')
            .done(function(data, textStatus, xhr) {
                console.log(data);
                var description = data['description'];
                if (description) {
                    $("#description").text(description);
                } else {
                    $("#description").text('');
                }
                var user = data['user'];
                if (user) {
                    $("<a/>", {
                        id: 'gistuser-url',
                        href: 'https://github.com/' + user['login'],
                        target: '_blank'
                    }).appendTo("#gistuser");
                    $("<img/>", {
                        src: user['avatar_url'],
                        title: user['login']
                    }).appendTo("#gistuser-url");
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
        gist: gist
    };
})(jQuery);