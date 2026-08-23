import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            process.env[key] = value;
        }
    });
}

async function findLondon() {
    try {
        const pool = mysql.createPool({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'menusnap',
            port: Number(process.env.MYSQL_PORT) || 3306,
        });

        const [sRows]: any = await pool.execute("SELECT id, title, content FROM summernote_docs WHERE id LIKE '%c47d6495%' OR title LIKE '%London%'");
        sRows.forEach((r: any) => {
            console.log('Summernote Doc -> ID:', r.id, 'Title:', r.title, 'Content Len:', r.content?.length);
            console.log('Content preview:', JSON.stringify(r.content));
        });

        await pool.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

findLondon();
