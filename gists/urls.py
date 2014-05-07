from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^(?P<id>[a-zA-Z0-9]+)$', 'gists.views.gist', name='gist'),
    url(r'^(?P<user>[a-zA-Z0-9]+)/(?P<id>[a-zA-Z0-9]+)$', 'gists.views.usergist', name='gist'),
)