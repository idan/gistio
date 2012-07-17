var Gisted = (function($, undefined) {
    var gist = function(gist_id) {
        $.getJSON('https://api.github.com/gists/' + gist_id, function(data) {
            var description = data['description'];
            if (description) {
                $("#description").text(description);
            }
            var files = data['files'];
            keys = Object.keys(files);
            for (var i=0; i<keys.length; i++) {
                var file = files[keys[i]];
                if (file['language'] == 'Markdown') {
                    var filediv = $('<article>')
                        .attr('class', 'file')
                        .attr('data-filename', file['filename']);
                    filediv.html(marked(file['content']));
                    $('.content').append(filediv);
                }
            }
        });
    };
    return {
        gist: gist
    };
})(jQuery);