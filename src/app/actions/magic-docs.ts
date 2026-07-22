
'use server';

import { revalidatePath } from 'next/cache';
import pool from '@/lib/mysql';
import { formatUtcDateTime } from '@/lib/dateUtils';

export interface GetMagicDocsOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'newest' | 'oldest' | 'title-asc' | 'title-desc';
}

export async function getMagicDocsFromMySql(options?: GetMagicDocsOptions) {
  try {
    await initMagicDocsTable();

    const page = options?.page && options.page > 0 ? Number(options.page) : 1;
    const limit = options?.limit && options.limit > 0 ? Number(options.limit) : 10;
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const safeOffset = Math.max(0, Math.floor((page - 1) * limit));

    const search = options?.search ? options.search.trim() : '';
    const sort = options?.sort || 'newest';

    let whereClause = 'WHERE is_deleted = 0';
    const queryParams: any[] = [];

    if (search) {
      whereClause += ' AND (title LIKE ? OR id LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    let orderBy = 'ORDER BY last_updated DESC';
    if (sort === 'newest') {
      orderBy = 'ORDER BY COALESCE(created_at, last_updated) DESC';
    } else if (sort === 'oldest') {
      orderBy = 'ORDER BY COALESCE(created_at, last_updated) ASC';
    } else if (sort === 'title-asc') {
      orderBy = 'ORDER BY title ASC';
    } else if (sort === 'title-desc') {
      orderBy = 'ORDER BY title DESC';
    }

    // Get total matching active documents count
    const countSql = `SELECT COUNT(*) as total FROM magic_docs ${whereClause}`;
    const [countRows]: any = await pool.execute(countSql, queryParams);
    const totalCount = countRows[0]?.total || 0;

    // Get paginated active documents
    const sql = `SELECT *, DATE_FORMAT(last_updated, '%Y-%m-%d %H:%i:%s') as last_updated,
       DATE_FORMAT(last_updated, '%Y-%m-%d %H:%i:%s') as lastUpdated,
       DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
       DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
       DATE_FORMAT(deleted_at, '%Y-%m-%d %H:%i:%s') as deleted_at,
       DATE_FORMAT(deleted_at, '%Y-%m-%d %H:%i:%s') as deletedAt
       FROM magic_docs ${whereClause} ${orderBy} LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const [rows]: any = await pool.execute(sql, queryParams);

    // Get trash documents
    const [trashRows]: any = await pool.execute(
      `SELECT *, DATE_FORMAT(last_updated, '%Y-%m-%d %H:%i:%s') as last_updated,
       DATE_FORMAT(last_updated, '%Y-%m-%d %H:%i:%s') as lastUpdated,
       DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
       DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
       DATE_FORMAT(deleted_at, '%Y-%m-%d %H:%i:%s') as deleted_at,
       DATE_FORMAT(deleted_at, '%Y-%m-%d %H:%i:%s') as deletedAt
       FROM magic_docs WHERE is_deleted = 1 ORDER BY deleted_at DESC`
    );

    const plainDocs = (rows as any[]).map((row: any) => ({ ...row }));
    const plainTrashDocs = (trashRows as any[]).map((row: any) => ({ ...row }));

    return { 
      success: true, 
      data: plainDocs, 
      totalCount, 
      trashDocs: plainTrashDocs 
    };
  } catch (error: any) {
    console.error('MySQL Magic Docs Fetch Error:', error);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return { success: true, data: [], totalCount: 0, trashDocs: [] };
    }
    return { success: false, message: error.message || 'Failed to fetch magic docs.' };
  }
}

export async function getMagicDocByIdFromMySql(id: string) {
  try {
    await initMagicDocsTable();
    const [rows]: any = await pool.execute(
      `SELECT *, DATE_FORMAT(last_updated, '%Y-%m-%d %H:%i:%s') as last_updated,
       DATE_FORMAT(last_updated, '%Y-%m-%d %H:%i:%s') as lastUpdated,
       DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
       DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt
       FROM magic_docs WHERE id = ? AND is_deleted = 0`,
      [id]
    );

    if (rows.length === 0) return { success: false, message: 'Document not found' };
    return { success: true, data: { ...rows[0] } };
  } catch (error: any) {
    console.error('MySQL Magic Doc Get Error:', error);
    return { success: false, message: error.message };
  }
}

export async function upsertMagicDocToMySql(doc: any) {
  try {
    await initMagicDocsTable();
    const { id, title, content, isDeleted, deletedAt } = doc;
    const now = formatUtcDateTime();
    const finalDeletedAt = deletedAt ? formatUtcDateTime(deletedAt) : null;

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
    await initMagicDocsTable();
    const now = formatUtcDateTime();
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
    await initMagicDocsTable();
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
