from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^', include('gists.urls')),
    # url(r'^', include('githubauth.urls')),
    url(r'^', include('publicsite.urls')),
)
