import time
import sys
import MySQLdb

DB_CONFIG = {
    "host": "db",
    "user": "root",
    "passwd": "root_password",
    "db": "fs",
}

while True:
    try:
        conn = MySQLdb.connect(**DB_CONFIG)
        conn.close()
        break
    except Exception:
        print("Waiting for database...")
        time.sleep(2)
