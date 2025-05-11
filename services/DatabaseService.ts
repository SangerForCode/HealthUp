import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

interface BPReading {
  id?: number;
  systolic: number;
  diastolic: number;
  pulse: number;
  timestamp: Date;
  userId: string;
}

class DatabaseService {
  private db: SQLite.WebSQLDatabase;

  constructor() {
    if (Platform.OS === "web") {
      // SQLite is not supported on web platform
      return;
    }
    this.db = SQLite.openDatabase('healthup.db');
    this.initDatabase();
  }

  private initDatabase() {
    this.db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS bp_readings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          systolic INTEGER NOT NULL,
          diastolic INTEGER NOT NULL,
          pulse INTEGER NOT NULL,
          timestamp DATETIME NOT NULL,
          userId TEXT NOT NULL
        );`
      );
    });
  }

  async addBPReading(reading: Omit<BPReading, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO bp_readings (systolic, diastolic, pulse, timestamp, userId)
           VALUES (?, ?, ?, ?, ?)`,
          [
            reading.systolic,
            reading.diastolic,
            reading.pulse,
            reading.timestamp.toISOString(),
            reading.userId
          ],
          (_, result) => {
            resolve(result.insertId || -1);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getBPReadings(userId: string): Promise<BPReading[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM bp_readings WHERE userId = ? ORDER BY timestamp DESC`,
          [userId],
          (_, { rows: { _array } }) => {
            const readings = _array.map(row => ({
              ...row,
              timestamp: new Date(row.timestamp)
            }));
            resolve(readings);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async updateBPReading(reading: BPReading): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `UPDATE bp_readings 
           SET systolic = ?, diastolic = ?, pulse = ?, timestamp = ?
           WHERE id = ? AND userId = ?`,
          [
            reading.systolic,
            reading.diastolic,
            reading.pulse,
            reading.timestamp.toISOString(),
            reading.id,
            reading.userId
          ],
          (_, result) => {
            resolve();
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async deleteBPReading(id: number, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM bp_readings WHERE id = ? AND userId = ?`,
          [id, userId],
          (_, result) => {
            resolve();
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
}

export const databaseService = new DatabaseService();
export type { BPReading };
