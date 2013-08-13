var Gisted = (function($, undefined) {
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

                        // Due to the way Injector.js works (document.write is being overwritten)
                        // the executions have to be serialized and can not happen in parallel.
                        // Therefore the array of gists has to be traversed manually by using
                        // the Inspector.oncomplete event.
                        var codes = filediv.find('gist');
                        (function embed(idx) {
                            var inj = new Injector();
                            inj.oncomplete = function() {
                                if(idx < codes.length) {
                                    embed(idx+1);
                                }
                            };

                            var elem = codes.get(idx);
                            var filename = $(elem).text();
                            var container = document.createElement('div');
                            inj.setContainer(container);
                            $(elem).replaceWith(container);
                            // Yield to browser to force DOM update
                            // Otherwise `load` events won't fire which Injector.js uses for
                            // the oncomplete event.
                            setTimeout(function() {
                                inj.insert('<script src="https://gist.github.com/'+gist_id+'.js?file='+filename+'"></script>');
                            }, 1);
                        })(0);

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
