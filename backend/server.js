const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/api/registros", (req, res) => {
  try {
    const registros = db
      .prepare("SELECT * FROM registros ORDER BY data DESC, id DESC")
      .all();
    res.json(registros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar registros." });
  }
});

app.get("/api/resumo", (req, res) => {
  try {
    const totalReceitas = db
      .prepare(
        `SELECT COALESCE(SUM(valor),0) AS total FROM registros WHERE tipo = 'receita'`,
      )
      .get().total;

    const totalDespesas = db
      .prepare(
        `SELECT COALESCE(SUM(valor),0) AS total FROM registros WHERE tipo = 'despesa'`,
      )
      .get().total;

    const saldo = totalReceitas - totalDespesas;

    const porCategoria = db
      .prepare(
        `SELECT categoria, tipo, SUM(valor) AS total
         FROM registros
         GROUP BY categoria, tipo
         ORDER BY total DESC`,
      )
      .all();

    const totalRegistros = db
      .prepare("SELECT COUNT(*) AS total FROM registros")
      .get().total;

    res.json({
      totalReceitas,
      totalDespesas,
      saldo,
      totalRegistros,
      porCategoria,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao calcular resumo." });
  }
});

app.post("/api/registros", (req, res) => {
  try {
    const { descricao, valor, tipo, categoria, data } = req.body;

    if (!descricao || !valor || !tipo || !categoria || !data) {
      return res
        .status(400)
        .json({ erro: "Todos os campos são obrigatórios." });
    }
    if (!["receita", "despesa"].includes(tipo)) {
      return res
        .status(400)
        .json({ erro: "O campo 'tipo' deve ser 'receita' ou 'despesa'." });
    }
    const valorNum = Number(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      return res
        .status(400)
        .json({ erro: "O valor deve ser um número maior que zero." });
    }

    const stmt = db.prepare(
      `INSERT INTO registros (descricao, valor, tipo, categoria, data)
       VALUES (?, ?, ?, ?, ?)`,
    );
    const info = stmt.run(
      descricao.trim(),
      valorNum,
      tipo,
      categoria.trim(),
      data,
    );

    const novoRegistro = db
      .prepare("SELECT * FROM registros WHERE id = ?")
      .get(info.lastInsertRowid);

    res.status(201).json(novoRegistro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar registro." });
  }
});

app.delete("/api/registros/:id", (req, res) => {
  try {
    const { id } = req.params;
    const existente = db
      .prepare("SELECT * FROM registros WHERE id = ?")
      .get(id);

    if (!existente) {
      return res.status(404).json({ erro: "Registro não encontrado." });
    }

    db.prepare("DELETE FROM registros WHERE id = ?").run(id);
    res.json({ mensagem: "Registro excluído com sucesso.", id: Number(id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao excluir registro." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
