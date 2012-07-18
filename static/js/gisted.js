var Gisted = (function($, undefined) {
    var gist = function(gist_id) {
        var gistxhr = $.getJSON('/' + gist_id + '/content')
            .done(function(data) {
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
                    if (file['language'] == 'Markdown') {
                        empty = false;
                        var filediv = $('<article>')
                            .attr('class', 'file')
                            .attr('data-filename', file['filename']);
                        filediv.html("<h1>" + file['filename'] + "</h1>" + file['rendered']);
                        $('.content').append(filediv);
                    }
                }
                if (empty) {
                    apologize("No Content Found");
                }
            })
            .fail(function(xhr, status, error) {
                if (xhr.status == 404) {
                    apologize("No Content Found");
                } else {
                    apologize("Unable to Fetch Gist");
                }
            })
            .always(function() { $("#description").removeClass("loading"); });
    };
    var apologize = function(errorText) {
        $("#description").text(errorText);
        var apology = $('<p>').attr('class', 'apology').text("Quite flummoxed. Terribly sorry.");
        $('.content').append(apology);
    };
    return {
        gist: gist
    };
})(jQuery);