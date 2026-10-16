const API_URL = "/api";

const form = document.getElementById("formRegistro");
const corpoTabela = document.getElementById("corpoTabela");
const listaVazia = document.getElementById("listaVazia");
const mensagemErro = document.getElementById("mensagemErro");
const graficoCategorias = document.getElementById("graficoCategorias");
const tituloForm = document.getElementById("tituloForm");
const btnSalvar = document.getElementById("btnSalvar");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");

let registrosAtuais = [];
let idEmEdicao = null; // null = cadastrando um novo registro

const cores = [
  "#2d6ae0",
  "#1a9c6b",
  "#d9455f",
  "#9b59b6",
  "#e0a72d",
  "#17a2b8",
  "#e0642d",
];

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

async function carregarTudo() {
  await Promise.all([carregarRegistros(), carregarResumo()]);
}

async function carregarRegistros() {
  try {
    const resp = await fetch(`${API_URL}/registros`);
    const registros = await resp.json();
    renderizarTabela(registros);
  } catch (err) {
    console.error("Erro ao carregar registros:", err);
    corpoTabela.innerHTML = "";
    listaVazia.style.display = "block";
    listaVazia.textContent =
      "Erro ao conectar com o servidor. Verifique se o backend está rodando.";
  }
}

async function carregarResumo() {
  try {
    const resp = await fetch(`${API_URL}/resumo`);
    const resumo = await resp.json();
    renderizarDashboard(resumo);
  } catch (err) {
    console.error("Erro ao carregar resumo:", err);
  }
}

function renderizarTabela(registros) {
  registrosAtuais = registros;
  corpoTabela.innerHTML = "";

  if (registros.length === 0) {
    listaVazia.style.display = "block";
    listaVazia.textContent = "Nenhum registro cadastrado ainda.";
    return;
  }
  listaVazia.style.display = "none";

  registros.forEach((registro) => {
    const tr = document.createElement("tr");
    if (registro.id === idEmEdicao) tr.classList.add("em-edicao");
    tr.innerHTML = `
      <td>${formatarData(registro.data)}</td>
      <td>${escapeHTML(registro.descricao)}</td>
      <td>${escapeHTML(registro.categoria)}</td>
      <td><span class="tag tag-${registro.tipo}">${registro.tipo === "receita" ? "Receita" : "Despesa"}</span></td>
      <td class="valor-${registro.tipo}">${registro.tipo === "despesa" ? "- " : "+ "}${formatarMoeda(registro.valor)}</td>
      <td>
        <button class="btn-editar" data-id="${registro.id}">Editar</button>
        <button class="btn-excluir" data-id="${registro.id}">Excluir</button>
      </td>
    `;
    corpoTabela.appendChild(tr);
  });

  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => entrarModoEdicao(Number(btn.dataset.id)));
  });

  document.querySelectorAll(".btn-excluir").forEach((btn) => {
    btn.addEventListener("click", () => excluirRegistro(btn.dataset.id));
  });
}

function renderizarDashboard(resumo) {
  document.getElementById("totalReceitas").textContent = formatarMoeda(
    resumo.totalReceitas,
  );
  document.getElementById("totalDespesas").textContent = formatarMoeda(
    resumo.totalDespesas,
  );
  document.getElementById("saldo").textContent = formatarMoeda(resumo.saldo);
  document.getElementById("totalRegistros").textContent = resumo.totalRegistros;

  const saldoEl = document.getElementById("saldo");
  saldoEl.style.color =
    resumo.saldo >= 0 ? "var(--cor-receita)" : "var(--cor-despesa)";

  renderizarGrafico(resumo.porCategoria);
}

function renderizarGrafico(porCategoria) {
  graficoCategorias.innerHTML = "";

  if (!porCategoria || porCategoria.length === 0) {
    graficoCategorias.innerHTML =
      '<p class="lista-vazia">Sem dados suficientes para o gráfico.</p>';
    return;
  }

  const maiorValor = Math.max(...porCategoria.map((c) => c.total));

  porCategoria.forEach((item, i) => {
    const percentual = (item.total / maiorValor) * 100;
    const cor =
      item.tipo === "despesa" ? "var(--cor-despesa)" : "var(--cor-receita)";

    const div = document.createElement("div");
    div.className = "barra-item";
    div.innerHTML = `
      <span class="barra-label">${escapeHTML(item.categoria)} (${item.tipo === "receita" ? "receita" : "despesa"})</span>
      <div class="barra-fundo">
        <div class="barra-preenchida" style="width:${percentual}%; background:${cor};"></div>
      </div>
      <span class="barra-valor">${formatarMoeda(item.total)}</span>
    `;
    graficoCategorias.appendChild(div);
  });
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- AÇÕES ----------

function entrarModoEdicao(id) {
  const registro = registrosAtuais.find((r) => r.id === id);
  if (!registro) return;

  idEmEdicao = id;
  document.getElementById("descricao").value = registro.descricao;
  document.getElementById("valor").value = registro.valor;
  document.getElementById("tipo").value = registro.tipo;
  document.getElementById("categoria").value = registro.categoria;
  document.getElementById("data").value = registro.data;

  tituloForm.textContent = "Editar registro";
  btnSalvar.textContent = "Salvar alterações";
  btnCancelarEdicao.style.display = "block";
  mensagemErro.textContent = "";

  renderizarTabela(registrosAtuais);
  form.scrollIntoView({ behavior: "smooth" });
  document.getElementById("descricao").focus();
}

function sairModoEdicao() {
  idEmEdicao = null;
  form.reset();
  document.getElementById("data").valueAsDate = new Date();

  tituloForm.textContent = "Novo registro";
  btnSalvar.textContent = "Adicionar registro";
  btnCancelarEdicao.style.display = "none";
  mensagemErro.textContent = "";

  renderizarTabela(registrosAtuais);
}

btnCancelarEdicao.addEventListener("click", sairModoEdicao);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensagemErro.textContent = "";

  const registro = {
    descricao: document.getElementById("descricao").value.trim(),
    valor: document.getElementById("valor").value,
    tipo: document.getElementById("tipo").value,
    categoria: document.getElementById("categoria").value.trim(),
    data: document.getElementById("data").value,
  };

  const editando = idEmEdicao !== null;

  try {
    const resp = await fetch(
      editando ? `${API_URL}/registros/${idEmEdicao}` : `${API_URL}/registros`,
      {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registro),
      },
    );

    const dados = await resp.json();

    if (!resp.ok) {
      mensagemErro.textContent =
        dados.erro ||
        (editando ? "Erro ao salvar alterações." : "Erro ao cadastrar registro.");
      return;
    }

    sairModoEdicao();
    await carregarTudo();
  } catch (err) {
    console.error(err);
    mensagemErro.textContent = "Erro ao conectar com o servidor.";
  }
});

async function excluirRegistro(id) {
  if (!confirm("Tem certeza que deseja excluir este registro?")) return;

  try {
    const resp = await fetch(`${API_URL}/registros/${id}`, {
      method: "DELETE",
    });
    if (!resp.ok) {
      const dados = await resp.json();
      alert(dados.erro || "Erro ao excluir registro.");
      return;
    }
    if (Number(id) === idEmEdicao) sairModoEdicao();
    await carregarTudo();
  } catch (err) {
    console.error(err);
    alert("Erro ao conectar com o servidor.");
  }
}

document.getElementById("data").valueAsDate = new Date();
carregarTudo();
