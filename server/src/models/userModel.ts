import { getDb } from '../database/db.js';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | undefined> {
    const db = await getDb();
    return db.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  static async findById(id: string): Promise<User | undefined> {
    const db = await getDb();
    return db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', [id]);
  }

  static async create(id: string, name: string, email: string, passwordHash: string): Promise<User> {
    const db = await getDb();
    await db.run(
      'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [id, name, email, passwordHash]
    );
    return (await this.findById(id))!;
  }

  static async updateName(id: string, name: string): Promise<void> {
    const db = await getDb();
    await db.run('UPDATE users SET name = ? WHERE id = ?', [name, id]);
  }

  static async updatePassword(id: string, passwordHash: string): Promise<void> {
    const db = await getDb();
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
  }
}
