"""
SQLite-based storage for shared reports with 7-day expiration.
"""

import sqlite3
import os
from datetime import datetime
from typing import Optional, Dict, Any


DB_PATH = os.environ.get("SHARE_DB_PATH", "shared_reports.db")


class ShareDB:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Create the shared_reports table if it doesn't exist."""
        conn = self._get_conn()
        try:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS shared_reports (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    share_id TEXT UNIQUE NOT NULL,
                    report_data TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    expires_at TEXT NOT NULL
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_share_id ON shared_reports (share_id)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_expires_at ON shared_reports (expires_at)
            """)
            conn.commit()
        finally:
            conn.close()

    def insert_report(self, share_id: str, report_data: str, created_at: str, expires_at: str):
        """Insert a new shared report."""
        conn = self._get_conn()
        try:
            conn.execute(
                "INSERT INTO shared_reports (share_id, report_data, created_at, expires_at) VALUES (?, ?, ?, ?)",
                (share_id, report_data, created_at, expires_at),
            )
            conn.commit()
        finally:
            conn.close()

    def get_report(self, share_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a report by share_id."""
        conn = self._get_conn()
        try:
            row = conn.execute(
                "SELECT share_id, report_data, created_at, expires_at FROM shared_reports WHERE share_id = ?",
                (share_id,),
            ).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def delete_report(self, share_id: str):
        """Delete a specific report."""
        conn = self._get_conn()
        try:
            conn.execute("DELETE FROM shared_reports WHERE share_id = ?", (share_id,))
            conn.commit()
        finally:
            conn.close()

    def cleanup_expired(self):
        """Remove all expired reports."""
        conn = self._get_conn()
        try:
            now = datetime.utcnow().isoformat()
            conn.execute("DELETE FROM shared_reports WHERE expires_at < ?", (now,))
            conn.commit()
        finally:
            conn.close()
