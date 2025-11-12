const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const puzzleRoutes = require('./routes/puzzleRoutes')

dotenv.config()

const app = express()

const mongoUri = process.env.MONGO_URI
const port = process.env.PORT || 5000
const clientOrigin = process.env.CLIENT_ORIGIN

const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
})

app.use(helmet())
app.use(limiter)
app.use(express.json())

if (clientOrigin) {
    app.use(
        cors({
            origin: clientOrigin,
        }),
    )
} else {
    app.use(cors())
}

app.use('/api', puzzleRoutes)

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

if (!mongoUri || mongoUri === 'your_mongodb_uri_here') {
    console.warn('⚠️  No Mongo URI provided. Skipping DB connection. You can set it in .env later.')
    app.listen(port, () => console.log(`Server running without DB on port ${port}`))
} else {
    mongoose
        .connect(mongoUri)
        .then(() => {
            console.log('MongoDB connected')
            app.listen(port, () => console.log(`Server running on port ${port}`))
        })
        .catch((err) => {
            console.error('MongoDB connection failed:', err.message)
            app.listen(port, () => console.log(`Server running without DB on port ${port}`))
        })
}