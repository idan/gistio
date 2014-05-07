from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^(?P<id>[A-Fa-f0-9]+)$', 'gists.views.gist', name='gist'),
    url(r'^(?P<user>[A-Fa-f0-9]+)/(?P<id>[A-Fa-f0-9]+)$', 'gists.views.usergist', name='gist'),
)