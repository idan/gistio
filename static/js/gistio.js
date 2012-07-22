var Gisted = (function ($, undefined) {
    var gist = function (gist_id) {
            var gistxhr = $.ajax({
                url: 'https://api.github.com/gists/' + gist_id,
                dataType: 'jsonp',
                success: jsonpCallback
            }).fail(function (xhr, status, error) {
                if (xhr.status == 404) {
                    apologize("No Content Found");
                } else {
                    apologize("Unable to Fetch Gist");
                }
            }).always(function () {
                $("#description").removeClass("loading");
                $(".content>footer").fadeIn();
            })
        };
    var jsonpCallback = function (data, textStatus, xhr) {
            data = data['data']
            var description = data['description'];
            if (description) {
                $("#description").text(description);
            } else {
                $("#description").text('');
            }
            var files = data['files'];
            var keys = Object.keys(files);
            var empty = true;
            for (var i = 0; i < keys.length; i++) {
                var file = files[keys[i]];
                var content = file['content'];
                if (!content) continue;
                empty = false;
                var highlight = true;
                var html;
                switch (file['language']) {
                case "Markdown":
                    html = converter.makeHtml(content);
                    break;
                case "Text":
                    highlight = false;
                    html = "<p>" + content + "</p>";
                    break;
                default:
                    html = "<pre><code>" + content + "</pre></code>";
                }
                var filediv = $('<article>').attr('class', 'file').attr('data-filename', file['filename']);
                filediv.html("<h1>" + file['filename'] + "</h1>" + html);
		html = html_sanitize(html);
                $('#gistbody').append(filediv);
                if (highlight) hljs.initHighlighting();
            }

            if (empty) {
                apologize("No Content Found");
            }

        }
    var apologize = function (errorText) {
            $("#description").text(errorText);
            var apology = $('<p>').attr('class', 'apology').text("Quite flummoxed. Terribly sorry.");
            $('#gistbody').append(apology);
        };
    var converter = new Showdown.converter();
    return {
        gist: gist
    };
})(jQuery);
