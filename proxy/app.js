require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_TARGET_URL = "https://cdn.privacy-mgmt.com";

app.use(express.json());
app.use(cors());

const DEFAULT_CALLBACK = "defaultCallback";

// JSONP Hilfsfunktion
const sendJsonp = (res, data, callback) => {
    callback = callback || DEFAULT_CALLBACK;
    res.type('text/javascript');
    res.send(`${callback}(${JSON.stringify(data)})`);
};

function reconstructBodyFromQuery(query) {
    if (query.body) {
        try {
            return JSON.parse(query.body);
        } catch (e) {
            console.error("Failed to parse body:", e);
            return {};
        }
    }
    return {};
}

// 1️⃣ GET → POST mit JSONP unter /post/*
app.get('/post/*', async (req, res) => {
    const callback = req.query.callback || DEFAULT_CALLBACK;
    const targetPath = req.params[0];
    const targetUrl = `${BASE_TARGET_URL}/${targetPath}`;
    const allowedQueryKeys = ['hasCsp', 'env', 'ch', 'scriptVersion', 'scriptType'];
    const queryParams = {};

    for (const key of allowedQueryKeys) {
        if (req.query[key] !== undefined) {
            queryParams[key] = req.query[key];
        }
    }

    const body = (req.query);

    try {
        const response = await axios.post(targetUrl, body, {
            params: queryParams,
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://native.message',
                'Referer': 'https://native.message/',
                'User-Agent': req.headers['user-agent'] || 'Node.js Proxy',
                'Accept': req.headers['accept'] || '*/*'
            }
        });

        sendJsonp(res, response.data, callback);
    } catch (error) {
        sendJsonp(res, {
            error: 'Request to ' + targetUrl + ' failed',
            details: error.response?.data || error.message
        }, callback);
    }
});

// 2️⃣ GET → GET mit JSONP unter /jsonp/*
app.get('/jsonp/*', async (req, res) => {
    const callback = req.query.callback || DEFAULT_CALLBACK;
    const targetPath = req.params[0];
    const queryParams = { ...req.query };
    delete queryParams.callback;



    const targetUrl = `${BASE_TARGET_URL}/${targetPath}`;


    try {
        const response = await axios.get(targetUrl, { params: queryParams });
        sendJsonp(res, response.data, callback);
    } catch (error) {
        sendJsonp(res, { error: 'Request failed', details: error.message }, callback);
    }
});

// 3️⃣ Fallback: GET → GET für alle anderen Pfade (JSON)
app.get('*', async (req, res, next) => {
    if (req.path.startsWith('/jsonp/') || req.path.startsWith('/post/')) return next();

    const targetPath = req.path.replace(/^\//, '');
    const targetUrl = `${BASE_TARGET_URL}/${targetPath}`;

    try {
        const response = await axios.get(targetUrl, {
            params: req.query,
            headers: {
                'User-Agent': req.headers['user-agent'] || 'Node.js Proxy',
                'Accept': req.headers['accept'] || '*/*'
            }
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: 'Proxy GET failed',
            details: error.response?.data || error.message
        });
    }
});

app.post('*', async (req, res, next) => {
    // Falls Pfad explizit für JSONP gedacht ist → weiterreichen
    if (req.path.startsWith('/jsonp/') || req.path.startsWith('/post/')) return next();

    try {
        // Zielpfad ohne führenden Slash
        const targetPath = req.path.replace(/^\//, '');
        const targetUrl = `${BASE_TARGET_URL}/${targetPath}`;

        const response = await axios.post(targetUrl, req.body, {
            params: req.query,
            headers: {
                'Content-Type': req.headers['content-type'] || 'application/json',
                'User-Agent': req.headers['user-agent'] || 'Node.js Proxy',
                'Accept': req.headers['accept'] || '*/*',
                'Origin': req.headers['origin'] || '',
                'Referer': req.headers['referer'] || '',
                'DNT': req.headers['dnt'] || '1',
                'Accept-Language': req.headers['accept-language'] || 'en'
            }
        });

        // Erfolgreiche Antwort weiterreichen
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: 'Proxy POST failed',
            status: error.response?.status,
            details: error.response?.data || error.message
        });
    }
});
// Start
app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}/`);
});
