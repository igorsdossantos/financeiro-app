const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "financeiro.db");
const db = new Database(dbPath);

// Cria a tabela caso não exista
db.exec(`
  CREATE TABLE IF NOT EXISTS registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    valor REAL NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('receita', 'despesa')),
    categoria TEXT NOT NULL,
    data TEXT NOT NULL,
    criado_em TEXT DEFAULT (datetime('now', 'localtime'))
  );
`);

module.exports = db;
