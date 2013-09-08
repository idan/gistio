from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^$', 'publicsite.views.home', name='home'),
)