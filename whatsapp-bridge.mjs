import 'dotenv/config';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
import { createServer } from 'http';
import { Server } from 'socket.io';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode';
const mysql = require('mysql2/promise');

const PORT = 9005;

// MySQL connection for reading settings & greetings
const db = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'menubldr',
    waitForConnections: true,
    connectionLimit: 5,
});

async function getGreetingFromDB() {
    try {
        // Check if WhatsApp and Greeting are enabled
        const [rows] = await db.query('SELECT is_enabled, is_greeting_enabled FROM whatsapp_settings WHERE id = 1 LIMIT 1');
        if (!rows || !rows[0]) return null;
        
        const settings = rows[0];
        console.log(`🔍 [Bridge] Settings fetched: is_enabled=${settings.is_enabled}, is_greeting_enabled=${settings.is_greeting_enabled}`);

        if (!settings.is_enabled || !settings.is_greeting_enabled) return null;

        // Get a random greeting
        const [greetings] = await db.query('SELECT content FROM greetings ORDER BY RAND() LIMIT 1');
        if (greetings && greetings[0]) return greetings[0].content;
        return null;
    } catch (err) {
        console.error('❌ [Bridge] Database error:', err.message);
        return null;
    }
}
const httpServer = createServer((req, res) => {
    // Debug logging for all incoming requests (useful for Proxy validation)
    console.log(`🌐 [Bridge] Incoming: ${req.method} ${req.url}`);
    
    // Basic REST endpoint for sending messages from Server Actions
    if ((req.url === '/send-message' || req.url === '/whatsapp-bridge/send-message') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { phoneNumber, message } = JSON.parse(body);
                if (!sock || connectionStatus !== 'connected') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: `WhatsApp not connected (Status: ${connectionStatus})` }));
                }

                const id = phoneNumber.includes('@s.whatsapp.net') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
                await sock.sendMessage(id, { text: message });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    } else if ((req.url === '/check-number' || req.url === '/whatsapp-bridge/check-number') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { phoneNumber } = JSON.parse(body);
                if (!sock || connectionStatus !== 'connected') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: `WhatsApp not connected (Status: ${connectionStatus})` }));
                }

                // Log availability check without showing full number
                console.log(`🔍 Checking availability for a number...`);
                const [result] = await sock.onWhatsApp(phoneNumber);
                const exists = !!(result && result.exists);
                
                console.log(`✅ Availability check result: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, exists }));
            } catch (err) {
                console.error(`❌ Check failed for a number:`, err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    } else if ((req.url === '/' || req.url === '/whatsapp-bridge' || req.url === '/whatsapp-bridge/') && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('WhatsApp Bridge is running (Prefix Active)');
    } else {
        res.writeHead(404);
        res.end();
    }
});

const io = new Server(httpServer, {
    path: "/socket.io",
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ['websocket'], // ONLY WEBSOCKET
    pingTimeout: 60000,
    pingInterval: 25000,
    allowEIO3: true
});

let sock;
let connectionStatus = 'connecting';
let lastQr = null;
let userInfoCache = null;

import fs from 'fs';
import { fileURLToPath } from 'url';
import pathModule from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);
const SETTINGS_FILE = pathModule.join(__dirname, '.whatsapp-settings.json');

async function startWhatsApp() {
    console.log('📦 Initializing WhatsApp Engine...');
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    // Fallback for version discovery
    let version = [2, 3000, 1015901307];
    try {
        const { version: v } = await fetchLatestBaileysVersion();
        version = v;
    } catch (e) {
        console.warn('⚠️ Could not fetch latest Baileys version, using fallback.');
    }

    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('⚡ New QR Generated');
            lastQr = await qrcode.toDataURL(qr);
            io.emit('qr', lastQr);
            connectionStatus = 'awaiting_qr';
            io.emit('status', connectionStatus);
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log('Connection closed. Reason Status:', statusCode);
            connectionStatus = 'disconnected';
            userInfoCache = null;
            io.emit('status', connectionStatus);
            
            if (statusCode === 401 || statusCode === DisconnectReason.loggedOut) {
                console.log('🗑️ Session expired/logged out. Clearing session files...');
                try {
                    fs.rmSync('auth_info_baileys', { recursive: true, force: true });
                } catch (e) {}
                console.log('🔄 Restarting clean engine...');
                startWhatsApp();
            } else if (statusCode !== DisconnectReason.loggedOut) {
                console.log('🔄 Reconnecting in 5 seconds...');
                setTimeout(startWhatsApp, 5000);
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp Bridge Connected');
            connectionStatus = 'connected';
            lastQr = null;
            
            let avatar = null;
            try {
                avatar = await sock.profilePictureUrl(sock.user.id, 'image');
            } catch (e) {
                console.warn('⚠️ Could not fetch user avatar.');
            }

            userInfoCache = {
                id: sock.user.id,
                name: sock.user.name,
                avatar
            };

            io.emit('status', connectionStatus);
            io.emit('user-info', userInfoCache);
        }
    });

    sock.ev.on('contacts.update', async (updates) => {
        for (const update of updates) {
            const normalizedUpdateId = update.id.split('@')[0].split(':')[0];
            const normalizedUserId = sock.user.id.split('@')[0].split(':')[0];
            
            if (normalizedUpdateId === normalizedUserId) {
                console.log('🔄 User Profile Update Detected, Refreshing info...');
                let avatar = userInfoCache?.avatar;
                try {
                    avatar = await sock.profilePictureUrl(sock.user.id, 'image');
                } catch (e) {}

                userInfoCache = {
                    ...userInfoCache,
                    ...update,
                    id: sock.user.id,
                    name: update.name || userInfoCache?.name,
                    avatar
                };
                io.emit('user-info', userInfoCache);
            }
        }
    });

    sock.ev.on('messages.upsert', async m => {
        if (m.type !== 'notify') return;
        try {
            const greetingMsg = await getGreetingFromDB();
            if (greetingMsg) {
                for (const msg of m.messages) {
                    if (!msg.key.fromMe && !msg.key.remoteJid.includes('@g.us')) {
                        const sender = msg.key.remoteJid;
                        console.log(`📩 New message from ${sender}. Sending auto-greeting...`);
                        await sock.sendMessage(sender, { text: greetingMsg });
                        console.log('✅ Greeting sent.');
                    }
                }
            } else {
                // Log why it wasn't sent
                // console.log('⏹️ Auto-greeting skipped (Disabled or no message)');
            }
        } catch (err) {
            console.error('❌ Error in auto-reply logic:', err.message);
        }
    });
}

io.on('connection', (socket) => {
    console.log('💻 New Bridge Client Connected:', socket.id);
    socket.emit('status', connectionStatus);
    if (lastQr) socket.emit('qr', lastQr);
    if (userInfoCache) {
        socket.emit('user-info', userInfoCache);
    }

    socket.on('sync-user-info', async () => {
        if (!sock || connectionStatus !== 'connected') return;
        
        console.log('🔄 Manual Sync Requested for User info...');
        try {
            const avatar = await sock.profilePictureUrl(sock.user.id, 'image').catch(() => null);
            userInfoCache = {
                id: sock.user.id,
                name: sock.user.name,
                avatar
            };
            io.emit('user-info', userInfoCache);
            console.log('✅ User Info Synced Successfully');
        } catch (e) {
            console.error('❌ Failed to sync user info:', e.message);
        }
    });

    socket.on('request-pairing-code', async (phoneNumber) => {
        const sanitizedNumber = phoneNumber.replace(/\D/g, '');
        console.log(`📱 Pairing code requested for: ${sanitizedNumber}`);
        if (!sock) {
            socket.emit('error', 'WhatsApp engine not initialized');
            return;
        }

        try {
            if (sock.authState.creds.registered) {
                socket.emit('error', 'Already registered');
                return;
            }

            const code = await sock.requestPairingCode(sanitizedNumber);
            console.log(`✅ Pairing code generated: ${code}`);
            socket.emit('pairing-code', code);
        } catch (err) {
            console.error('❌ Failed to request pairing code:', err.message);
            socket.emit('error', `Failed to request pairing code: ${err.message}`);
        }
    });

    socket.on('logout', async () => {
        console.log('🗑️ Manual logout requested. Clearing session...');
        if (sock) {
            try {
                await sock.logout();
            } catch (e) {
                console.error('❌ Logout error:', e.message);
            }
        }
        
        try {
            fs.rmSync('auth_info_baileys', { recursive: true, force: true });
        } catch (e) {
            console.error('❌ Error deleting session folder:', e.message);
        }

        connectionStatus = 'disconnected';
        userInfoCache = null;
        lastQr = null;
        io.emit('status', connectionStatus);
        io.emit('user-info', null);

        console.log('🔄 Restarting engine with clean state...');
        startWhatsApp();
    });

    socket.on('disconnect', () => {
        console.log('🔌 Client Disconnected from Bridge:', socket.id);
    });
});

httpServer.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 WhatsApp Bridge running at http://0.0.0.0:${PORT}`);
    try {
        await startWhatsApp();
    } catch (err) {
        console.error('FAILED TO START WHATSAPP:', err);
        process.exit(1);
    }
});
