# Sistema de Registro Financeiro

Trabalho de faculdade — sistema completo (frontend + backend + banco de dados) para controle de receitas e despesas.

## Tecnologias usadas

- **Backend:** Node.js + Express
- **Banco de dados:** SQLite (via `better-sqlite3`) — arquivo local, não precisa instalar servidor de banco
- **Frontend:** HTML, CSS e JavaScript

## Funcionalidades

- Dashboard com total de receitas, despesas, saldo e quantidade de registros
- Gráfico de barras simples por categoria
- Cadastro de novos registros (descrição, valor, tipo, categoria, data)
- Edição de registros
- Exclusão de registros
- Validações no backend (campos obrigatórios, tipo válido, valor positivo)

## Estrutura de pastas

```
financeiro-app/
├── backend/
│   ├── server.js        -> servidor Express e rotas da API
│   ├── database.js      -> conexão e criação da tabela SQLite
│   └── package.json
└── frontend/
    ├── index.html        -> estrutura da página (dashboard + formulário + tabela)
    ├── style.css          -> estilos
    └── app.js             -> lógica que consome a API (fetch)
```

### Passo a passo

1. Abra um terminal na pasta `backend`:
   ```
   cd financeiro-app/backend
   ```
2. Instale as dependências:
   ```
   npm install
   ```
3. Inicie o servidor:
   ```
   npm start
   ```
4. Abra o navegador em:
   ```
   http://localhost:3000
   ```
