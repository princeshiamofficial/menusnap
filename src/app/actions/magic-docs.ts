
'use server';

import { revalidatePath } from 'next/cache';
import pool from '@/lib/mysql';
import { formatLocalDateTime } from '@/lib/dateUtils';

export async function getMagicDocsFromMySql() {
  try {
    const [rows]: any = await pool.execute(
      `SELECT *, DATE_FORMAT(last_updated, '%Y-%m-%d %H:%i:%s') as lastUpdated,
       DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
       DATE_FORMAT(deleted_at, '%Y-%m-%d %H:%i:%s') as deletedAt
       FROM magic_docs ORDER BY last_updated DESC`
    );

    return { success: true, data: rows };
  } catch (error: any) {
    console.error('MySQL Magic Docs Fetch Error:', error);
    // If table doesn't exist, return empty
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return { success: true, data: [] };
    }
    return { success: false, message: error.message || 'Failed to fetch magic docs.' };
  }
}

export async function getMagicDocByIdFromMySql(id: string) {
  try {
    const [rows]: any = await pool.execute(
      `SELECT *, DATE_FORMAT(last_updated, '%Y-%m-%d %H:%i:%s') as lastUpdated,
       DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt 
       FROM magic_docs WHERE id = ? AND is_deleted = 0`,
      [id]
    );

    if (rows.length === 0) return { success: false, message: 'Document not found' };
    return { success: true, data: rows[0] };
  } catch (error: any) {
    console.error('MySQL Magic Doc Get Error:', error);
    return { success: false, message: error.message };
  }
}

export async function upsertMagicDocToMySql(doc: any) {
  try {
    const { id, title, content, isDeleted, deletedAt } = doc;
    const now = formatLocalDateTime();
    const finalDeletedAt = deletedAt ? formatLocalDateTime(new Date(deletedAt)) : null;

    await pool.execute(
      `INSERT INTO magic_docs (id, title, content, last_updated, created_at, is_deleted, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       title = VALUES(title), content = VALUES(content), last_updated = VALUES(last_updated),
       is_deleted = VALUES(is_deleted), deleted_at = VALUES(deleted_at)`,
      [id, title, content, now, now, isDeleted ? 1 : 0, finalDeletedAt]
    );

    revalidatePath('/m-admin/magic-docs');
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Magic Doc Upsert Error:', error);
    return { success: false, message: error.message };
  }
}

export async function deleteMagicDocFromMySql(id: string) {
  try {
    const now = formatLocalDateTime();
    await pool.execute('UPDATE magic_docs SET is_deleted = 1, deleted_at = ? WHERE id = ?', [now, id]);
    revalidatePath('/m-admin/magic-docs');
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Magic Doc Delete Error:', error);
    return { success: false, message: error.message };
  }
}

export async function permanentDeleteMagicDocFromMySql(id: string) {
  try {
    await pool.execute('DELETE FROM magic_docs WHERE id = ?', [id]);
    revalidatePath('/m-admin/magic-docs');
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Magic Doc Permanent Delete Error:', error);
    return { success: false, message: error.message };
  }
}

export async function initMagicDocsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS magic_docs (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT,
        last_updated DATETIME,
        created_at DATETIME,
        is_deleted TINYINT(1) DEFAULT 0,
        deleted_at DATETIME
      )
    `);
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Init Table Error:', error);
    return { success: false, message: error.message };
  }
}
