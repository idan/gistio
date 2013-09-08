from functools import wraps

import rethinkdb
# from rethinkdb.errors import RqlDriverError

from gistio.utils import get_setting


RETHINK_CONNARGS = get_setting('RETHINK_CONNARGS')

def get_connection():
    conn = rethinkdb.connect(**RETHINK_CONNARGS)
    return conn

def rethinkdb_connect(view):
    @wraps(view)
    def wrapper(request, *args, **kwargs):
        request.rdbconn = get_connection()
        retval = view(request, *args, **kwargs)
        try:
            request.rdbconn.close()
        except AttributeError:
            close
        finally:
            return retval
    return wrapper