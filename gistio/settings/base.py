import os
import urlparse

from unipath import FSPath as Path

from django.core.exceptions import ImproperlyConfigured

PROJECT_DIR = Path(__file__).absolute().ancestor(3)

def get_env_variable(var_name):
    """ Get the environment variable or return an exception """
    try:
        return os.environ[var_name]
    except KeyError:
        error_msg = "Set the {} environment variable".format(var_name)
        raise ImproperlyConfigured(error_msg)


DEBUG = False
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Idan Gazit', 'idan@gazit.me'),
)

DATABASES = {}


RETHINKDB_URL = urlparse.urlparse(get_env_variable('RETHINKDB_URL'))
urlparse.uses_netloc.append('rethinkdb')
RETHINK_CONNARGS = {}
rethink_argmap = {'hostname': 'host',
                  'port': 'port',
                  'username': 'db',
                  'password': 'auth_key'}
for k,v in rethink_argmap.items():
    p = getattr(RETHINKDB_URL, k, None)
    if p is not None:
        RETHINK_CONNARGS[v] = p


MANAGERS = ADMINS


ALLOWED_HOSTS = []
TIME_ZONE = 'Etc/UTC'
LANGUAGE_CODE = 'en-us'
SITE_ID = 1
USE_I18N = False
USE_L10N = True
USE_TZ = True


MEDIA_ROOT = PROJECT_DIR.child('media')
# the following line is a total lie except in production
# MEDIA_URL = 'http://{}.s3.amazonaws.com/media/'.format(AWS_STORAGE_BUCKET_NAME)

STATIC_ROOT = 'staticfiles'
STATIC_URL = '/static/'
STATICFILES_ROOT = PROJECT_DIR.child('static')
STATICFILES_DIRS = [
    (subdir, str(STATICFILES_ROOT.child(subdir))) for subdir in
    ['css', 'fonts', 'img', 'js']]
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

SECRET_KEY = get_env_variable('APP_SECRET_KEY')

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'gistio.urls'
WSGI_APPLICATION = 'gistio.wsgi.application'
TEMPLATE_DIRS = (
    PROJECT_DIR.child('templates')
)

INSTALLED_APPS = (
    # 'django.contrib.auth',
    # 'django.contrib.contenttypes',
    'django.contrib.sessions',
    # 'django.contrib.sites',
    # 'django.contrib.messages',
    'django.contrib.staticfiles',
    'publicsite',
    'githubauth',
    'gists',
)

SESSION_ENGINE = 'django.contrib.sessions.backends.signed_cookies'

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}


GITHUB_CLIENT_ID = get_env_variable('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = get_env_variable('GITHUB_CLIENT_SECRET')
GITHUB_AUTH_PARAMS = {'client_id': GITHUB_CLIENT_ID,
               'client_secret': GITHUB_CLIENT_SECRET}

GIST_PUBLIC_CACHE_SECONDS = 60
