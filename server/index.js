require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public/images')));

let db;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(path.join(__dirname, 'db/pbl.db'));
  db = new SQL.Database(fileBuffer);
  return db;
}

getDb().then(() => {
  const dashboardRoutes = require('./routes/dashboard');
  const grantsRoutes = require('./routes/grants');
  const summaryRoutes = require('./routes/summary');

  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/grant', grantsRoutes);
  app.use('/api/summary', summaryRoutes);

  app.listen(5000, () => console.log('✅ Server running on http://localhost:5000'));
}).catch(console.error);

module.exports = { getDb };