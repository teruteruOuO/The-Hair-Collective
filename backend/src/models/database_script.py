from __future__ import annotations

from typing import List, Any, Optional, Dict
from mysql.connector import pooling, Error

from src.config.application import ApplicationConfig
from src.types.types import ITransactionQuery, AppError


class DatabaseScript:
    """
    Static-style helper for MySQL access using a connection pool.
    """

    _pool: Optional[pooling.MySQLConnectionPool] = None
    _POOL_NAME = "thc_pool"
    _POOL_SIZE = 10  

    def __init__(self) -> None:
        # Prevent instantiation (like your private constructor in TS)
        raise RuntimeError("DatabaseScript is a static utility class and cannot be instantiated.")

    # ---------- internal helpers ----------

    @classmethod
    def _ensure_pool(cls) -> None:
        if cls._pool is None:
            db = ApplicationConfig.DATABASE
            cls._pool = pooling.MySQLConnectionPool(
                pool_name=cls._POOL_NAME,
                pool_size=cls._POOL_SIZE,
                host=db["host"],
                user=db["user"],
                password=db["password"],
                database=db["database"],
                port=db["port"],
                connection_timeout=db["connection_timeout"],  # seconds
            )

    @classmethod
    def _get_connection(cls):
        cls._ensure_pool()
        assert cls._pool is not None
        return cls._pool.get_connection()

    # ---------- public API ----------

    @classmethod
    def execute_read_query(cls, query: str, params: Optional[List[Any]] = None) -> List[Dict[str, Any]]:
        """
        SELECT queries. Returns list of dict rows.
        """
        conn = cls._get_connection()
        try:
            with conn.cursor(dictionary=True) as cur:
                cur.execute(query, params or [])
                rows = cur.fetchall()
                return rows
        except Error as e:
            raise
        finally:
            conn.close()

    @classmethod
    def execute_write_query(cls, query: str, params: Optional[List[Any]] = None) -> Dict[str, Any]:
        """
        INSERT/UPDATE/DELETE queries. Returns affected rows & lastrowid.
        """
        conn = cls._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(query, params or [])
                conn.commit()
                return {"affected": cur.rowcount, "lastrowid": cur.lastrowid}
        except Error as e:
            conn.rollback()
            raise
        finally:
            conn.close()

    @classmethod
    def execute_transaction(cls, queries: List[ITransactionQuery]) -> List[Any]:
        """
        Runs multiple queries in a single transaction.
        Each item in `queries` is: {"query": str, "params": Optional[List[Any]]}
        Returns a list of results in order. SELECTs return rows; writes return {affected, lastrowid}.
        """
        conn = cls._get_connection()
        try:
            conn.start_transaction()
            results: List[Any] = []

            for q in queries:
                qtext = q["query"]
                qparams = q.get("params") or []

                # Use dictionary cursor so SELECT results are dicts
                with conn.cursor(dictionary=True) as cur:
                    cur.execute(qtext, qparams)

                    if cur.with_rows:  # SELECT
                        results.append(cur.fetchall())
                    else:  # write
                        results.append({"affected": cur.rowcount, "lastrowid": cur.lastrowid})

            conn.commit()
            return results

        except Error as e:
            conn.rollback()
            raise
        finally:
            conn.close()
