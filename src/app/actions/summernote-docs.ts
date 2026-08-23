'use server';

import { revalidatePath } from 'next/cache';
import pool from '@/lib/mysql';
import { formatUtcDateTime } from '@/lib/dateUtils';

export interface GetSummernoteDocsOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'newest' | 'oldest' | 'title-asc' | 'title-desc';
}

function sanitizeDocRow(row: any) {
  if (!row) return null;
  
  let content = '';
  if (row.content !== null && row.content !== undefined) {
    if (Buffer.isBuffer(row.content)) {
      content = row.content.toString('utf-8');
    } else {
      content = String(row.content);
    }
  }

  const formatVal = (v: any) => {
    if (v === null || v === undefined) return null;
    if (v instanceof Date) return v.toISOString().replace('T', ' ').substring(0, 19);
    return String(v);
  };

  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    content,
    last_updated: formatVal(row.last_updated || row.lastUpdated) || '',
    lastUpdated: formatVal(row.lastUpdated || row.last_updated) || '',
    created_at: formatVal(row.created_at || row.createdAt) || '',
    createdAt: formatVal(row.createdAt || row.created_at) || '',
    deleted_at: formatVal(row.deleted_at || row.deletedAt),
    deletedAt: formatVal(row.deletedAt || row.deleted_at),
    created_by: String(row.created_by || row.createdBy || 'Admin'),
    createdBy: String(row.createdBy || row.created_by || 'Admin'),
    createdByUserId: row.createdByUserId !== undefined && row.createdByUserId !== null ? Number(row.createdByUserId) : (row.created_by_user_id !== undefined && row.created_by_user_id !== null ? Number(row.created_by_user_id) : null),
    creatorAvatarUrl: row.creatorAvatarUrl ? String(row.creatorAvatarUrl) : (row.avatar_url ? String(row.avatar_url) : null),
    is_deleted: Number(row.is_deleted || 0),
    isDeleted: !!row.is_deleted,
  };
}

export async function getSummernoteDocsFromMySql(options?: GetSummernoteDocsOptions) {
  try {
    await initSummernoteDocsTable();

    const page = options?.page && options.page > 0 ? Number(options.page) : 1;
    const limit = options?.limit && options.limit > 0 ? Number(options.limit) : 10;
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const safeOffset = Math.max(0, Math.floor((page - 1) * limit));

    const search = options?.search ? options.search.trim() : '';
    const sort = options?.sort || 'newest';

    let whereClause = 'WHERE s.is_deleted = 0';
    const queryParams: any[] = [];

    if (search) {
      whereClause += ' AND (s.title LIKE ? OR s.id LIKE ? OR s.created_by LIKE ? OR a.name LIKE ? OR a.email LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    let orderBy = 'ORDER BY s.last_updated DESC';
    if (sort === 'newest') {
      orderBy = 'ORDER BY COALESCE(s.created_at, s.last_updated) DESC';
    } else if (sort === 'oldest') {
      orderBy = 'ORDER BY COALESCE(s.created_at, s.last_updated) ASC';
    } else if (sort === 'title-asc') {
      orderBy = 'ORDER BY s.title ASC';
    } else if (sort === 'title-desc') {
      orderBy = 'ORDER BY s.title DESC';
    }

    // Get total matching active documents count
    const countSql = `SELECT COUNT(*) as total FROM summernote_docs s 
       LEFT JOIN admins a ON (s.created_by_user_id = a.id OR (s.created_by_user_id IS NULL AND (s.created_by = a.email OR s.created_by = a.name))) 
       ${whereClause}`;
    const [countRows]: any = await pool.execute(countSql, queryParams);
    const totalCount = countRows[0]?.total || 0;

    // Get paginated active documents joined with creator admin details
    const sql = `SELECT s.*, 
       DATE_FORMAT(s.last_updated, '%Y-%m-%d %H:%i:%s') as last_updated,
       DATE_FORMAT(s.last_updated, '%Y-%m-%d %H:%i:%s') as lastUpdated,
       DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
       DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
       DATE_FORMAT(s.deleted_at, '%Y-%m-%d %H:%i:%s') as deleted_at,
       DATE_FORMAT(s.deleted_at, '%Y-%m-%d %H:%i:%s') as deletedAt,
       s.created_by_user_id as createdByUserId,
       COALESCE(a.name, a.email, s.created_by, 'Admin') as createdBy,
       a.avatar_url as creatorAvatarUrl
       FROM summernote_docs s
       LEFT JOIN admins a ON (s.created_by_user_id = a.id OR (s.created_by_user_id IS NULL AND (s.created_by = a.email OR s.created_by = a.name)))
       ${whereClause} ${orderBy} LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const [rows]: any = await pool.execute(sql, queryParams);

    // Get trash documents
    const [trashRows]: any = await pool.execute(
      `SELECT s.*, 
       DATE_FORMAT(s.last_updated, '%Y-%m-%d %H:%i:%s') as last_updated,
       DATE_FORMAT(s.last_updated, '%Y-%m-%d %H:%i:%s') as lastUpdated,
       DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
       DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
       DATE_FORMAT(s.deleted_at, '%Y-%m-%d %H:%i:%s') as deleted_at,
       DATE_FORMAT(s.deleted_at, '%Y-%m-%d %H:%i:%s') as deletedAt,
       s.created_by_user_id as createdByUserId,
       COALESCE(a.name, a.email, s.created_by, 'Admin') as createdBy,
       a.avatar_url as creatorAvatarUrl
       FROM summernote_docs s
       LEFT JOIN admins a ON (s.created_by_user_id = a.id OR (s.created_by_user_id IS NULL AND (s.created_by = a.email OR s.created_by = a.name)))
       WHERE s.is_deleted = 1 ORDER BY s.deleted_at DESC`
    );

    const plainDocs = (rows as any[]).map((row: any) => sanitizeDocRow(row));
    const plainTrashDocs = (trashRows as any[]).map((row: any) => sanitizeDocRow(row));

    return { 
      success: true, 
      data: plainDocs, 
      totalCount, 
      trashDocs: plainTrashDocs 
    };
  } catch (error: any) {
    console.error('MySQL Summernote Docs Fetch Error:', error);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return { success: true, data: [], totalCount: 0, trashDocs: [] };
    }
    return { success: false, message: error.message || 'Failed to fetch summernote docs.' };
  }
}

export async function getSummernoteDocByIdFromMySql(id: string) {
  try {
    await initSummernoteDocsTable();
    const [rows]: any = await pool.execute(
      `SELECT s.*, 
       DATE_FORMAT(s.last_updated, '%Y-%m-%d %H:%i:%s') as last_updated,
       DATE_FORMAT(s.last_updated, '%Y-%m-%d %H:%i:%s') as lastUpdated,
       DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
       DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
       s.created_by_user_id as createdByUserId,
       COALESCE(a.name, a.email, s.created_by, 'Admin') as createdBy,
       a.avatar_url as creatorAvatarUrl
       FROM summernote_docs s
       LEFT JOIN admins a ON (s.created_by_user_id = a.id OR (s.created_by_user_id IS NULL AND (s.created_by = a.email OR s.created_by = a.name)))
       WHERE s.id = ? AND s.is_deleted = 0`,
      [id]
    );

    if (rows.length === 0) return { success: false, message: 'Document not found' };
    return { success: true, data: sanitizeDocRow(rows[0]) };
  } catch (error: any) {
    console.error('MySQL Summernote Doc Get Error:', error);
    return { success: false, message: error.message };
  }
}

export async function upsertSummernoteDocToMySql(doc: any) {
  try {
    await initSummernoteDocsTable();
    const { id, title, content, createdBy, created_by, createdByUserId, created_by_user_id, isDeleted, deletedAt } = doc;
    const author = createdBy || created_by || 'Admin';
    const authorUserId = createdByUserId !== undefined ? createdByUserId : (created_by_user_id !== undefined ? created_by_user_id : null);
    const now = formatUtcDateTime();
    const finalDeletedAt = deletedAt ? formatUtcDateTime(deletedAt) : null;

    await pool.execute(
      `INSERT INTO summernote_docs (id, title, content, created_by_user_id, created_by, last_updated, created_at, is_deleted, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       title = VALUES(title), content = VALUES(content),
       created_by_user_id = COALESCE(VALUES(created_by_user_id), created_by_user_id),
       created_by = VALUES(created_by), last_updated = VALUES(last_updated),
       is_deleted = VALUES(is_deleted), deleted_at = VALUES(deleted_at)`,
      [id, title, content, authorUserId, author, now, now, isDeleted ? 1 : 0, finalDeletedAt]
    );

    revalidatePath('/m-admin/summernote-docs');
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Summernote Doc Upsert Error:', error);
    return { success: false, message: error.message };
  }
}

export async function deleteSummernoteDocFromMySql(id: string) {
  try {
    await initSummernoteDocsTable();
    const now = formatUtcDateTime();
    await pool.execute('UPDATE summernote_docs SET is_deleted = 1, deleted_at = ? WHERE id = ?', [now, id]);
    revalidatePath('/m-admin/summernote-docs');
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Summernote Doc Delete Error:', error);
    return { success: false, message: error.message };
  }
}

export async function permanentDeleteSummernoteDocFromMySql(id: string) {
  try {
    await initSummernoteDocsTable();
    await pool.execute('DELETE FROM summernote_docs WHERE id = ?', [id]);
    revalidatePath('/m-admin/summernote-docs');
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Summernote Doc Permanent Delete Error:', error);
    return { success: false, message: error.message };
  }
}

export async function initSummernoteDocsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS summernote_docs (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT,
        created_by_user_id INT NULL,
        created_by VARCHAR(255) DEFAULT 'Admin',
        last_updated DATETIME,
        created_at DATETIME,
        is_deleted TINYINT(1) DEFAULT 0,
        deleted_at DATETIME
      )
    `);

    const [cols]: any = await pool.execute("SHOW COLUMNS FROM summernote_docs LIKE 'created_by'");
    if (cols.length === 0) {
      await pool.execute("ALTER TABLE summernote_docs ADD COLUMN created_by VARCHAR(255) DEFAULT 'Admin' AFTER content");
    }

    const [userIdCols]: any = await pool.execute("SHOW COLUMNS FROM summernote_docs LIKE 'created_by_user_id'");
    if (userIdCols.length === 0) {
      await pool.execute("ALTER TABLE summernote_docs ADD COLUMN created_by_user_id INT NULL AFTER content");
    }

    return { success: true };
  } catch (error: any) {
    console.error('MySQL Init Summernote Table Error:', error);
    return { success: false, message: error.message };
  }
}
