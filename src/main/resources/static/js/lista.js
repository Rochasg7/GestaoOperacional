// Tela 1: lista de Ordens de Produção.

const corpoTabela = document.getElementById("corpo-tabela");
const tabela = document.getElementById("tabela-ops");
const mensagem = document.getElementById("mensagem");
const contador = document.getElementById("contador");

async function carregarLista() {
    try {
        const ops = await listarOrdensProducao();

        if (ops.length === 0) {
            mensagem.textContent = "Nenhuma Ordem de Produção cadastrada.";
            return;
        }

        // Mais recentes primeiro (maior id no topo).
        ops.sort((a, b) => b.id - a.id);

        for (const op of ops) {
            corpoTabela.appendChild(criarLinha(op));
        }

        contador.textContent = ops.length + (ops.length === 1 ? " OP" : " OPs");
        mensagem.hidden = true;
        tabela.hidden = false;

    } catch (erro) {
        // Cai aqui se o backend estiver desligado ou responder com erro.
        mensagem.textContent = "Não foi possível carregar as OPs. O backend está rodando?";
        mensagem.classList.add("erro");
        console.error(erro);
    }
}

// Monta uma linha <tr> da tabela a partir de uma OP.
function criarLinha(op) {
    const linha = document.createElement("tr");

    linha.appendChild(criarCelula(op.numero, "numero-op"));
    linha.appendChild(criarCelula(op.cliente));
    linha.appendChild(criarCelulaStatus(op.status));
    // setorAtual pode ser null (OP ainda aguardando separação).
    linha.appendChild(criarCelula(op.setorAtual ? op.setorAtual.nome : "—"));
    linha.appendChild(criarCelula(formatarDataHora(op.criadaEm)));

    // Clicar na linha abre o detalhe da OP (tela da próxima etapa).
    linha.addEventListener("click", () => {
        window.location.href = "op.html?id=" + op.id;
    });

    return linha;
}

function criarCelula(texto, classe) {
    const celula = document.createElement("td");
    // textContent (e não innerHTML) trata o valor como texto puro.
    // Assim, se alguém cadastrar um cliente com código HTML no nome,
    // ele aparece escrito na tela em vez de ser executado.
    celula.textContent = texto;
    if (classe) celula.className = classe;
    return celula;
}

function criarCelulaStatus(status) {
    const celula = document.createElement("td");
    const etiqueta = document.createElement("span");
    etiqueta.textContent = NOMES_STATUS[status] || status;
    // Ex.: "etiqueta status-em_producao", usada no CSS para a cor.
    etiqueta.className = "etiqueta status-" + String(status).toLowerCase();
    celula.appendChild(etiqueta);
    return celula;
}

carregarLista();
