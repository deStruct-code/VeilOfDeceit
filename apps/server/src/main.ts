import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'
import fs from 'fs'
import http from 'http'
import { WebSocketServer } from 'ws'

import { env } from './config/env'
import { db, runMigration } from './config/db'
import { authRouter } from './modules/auth/auth.router'
import { roomRouter } from './modules/room/room.router'
import { gameRouter } from './modules/game/game.router'
import { setupLobbyWS } from './modules/lobby/lobby.ws'
import { startTurnTimer } from './modules/turn/turn.timer'
import { startRoomCleanup } from './modules/room/room.cleanup'

// ─── App ──────────────────────────────────────────────────────────────────────

const app = express()

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', env.CLIENT_URL)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    if (req.method === 'OPTIONS') { res.sendStatus(204); return }
    next()
})

app.use(express.json())
app.use(cookieParser() as any)

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/auth', authRouter)
app.use('/api/rooms', roomRouter)
app.use('/api/game', gameRouter)

app.get('/api/health', async (_req, res) => {
    try {
        await db.query('SELECT 1')
        res.json({ status: 'ok', env: env.NODE_ENV, db: 'connected' })
    } catch {
        res.status(503).json({ status: 'error', db: 'disconnected' })
    }
})

// ─── Static ───────────────────────────────────────────────────────────────────

const clientDistPath = path.resolve(__dirname, '../../client/dist')
const hasClientBuild = fs.existsSync(clientDistPath)

if (hasClientBuild) {
    app.use(express.static(clientDistPath))
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            res.status(404).json({ error: 'API route not found' })
            return
        }
        res.sendFile(path.join(clientDistPath, 'index.html'))
    })
} else {
    app.get('/', (_req, res) => {
        res.json({ status: 'ok', message: 'Client build not found.' })
    })
}

// ─── Server ───────────────────────────────────────────────────────────────────

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })

setupLobbyWS(wss)

// ─── Background jobs ──────────────────────────────────────────────────────────

startTurnTimer(1000)
startRoomCleanup(30 * 60 * 1000)

// ─── Start ────────────────────────────────────────────────────────────────────

async function start() {
    try {
        await runMigration()
    } catch (err) {
        console.error('[db] Migration failed:', err)
        process.exit(1)
    }

    server.listen(env.PORT, () => {
        console.log(`Server started on port ${env.PORT}`)
        console.log(`CORS allowed for: ${env.CLIENT_URL}`)
    })
}

start()
