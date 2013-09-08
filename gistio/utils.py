from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


def get_setting(setting):
    try:
        return getattr(settings, setting)
    except AttributeError:
        raise ImproperlyConfigured('No setting named "{0}" was found in settings.py.'.format(setting))
