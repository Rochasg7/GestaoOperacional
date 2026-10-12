// Tela 2: detalhe da OP, com materiais e histórico.

const mensagem = document.getElementById("mensagem");
const detalhe = document.getElementById("detalhe");

// A lista abre esta página como "op.html?id=3".
// URLSearchParams lê o que vem depois do "?".
const parametros = new URLSearchParams(window.location.search);
const idOp = parametros.get("id");

async function carregarDetalhe() {
    if (!idOp) {
        mostrarErro("Nenhuma OP informada. Volte para a lista e escolha uma.");
        return;
    }

    try {
        // As duas chamadas não dependem uma da outra, então são feitas
        // ao mesmo tempo. Promise.all espera as duas terminarem.
        const [op, historico] = await Promise.all([
            buscarOrdemProducao(idOp),
            buscarHistorico(idOp)
        ]);

        preencherResumo(op);
        preencherMateriais(op.itens);
        preencherHistorico(historico);

        mensagem.hidden = true;
        detalhe.hidden = false;

    } catch (erro) {
        mostrarErro("Não foi possível carregar a OP. Ela existe e o backend está rodando?");
        console.error(erro);
    }
}

function preencherResumo(op) {
    // Muda também o título da aba do navegador.
    document.title = op.numero + " · Gestão Operacional";

    document.getElementById("op-numero").textContent = op.numero;
    document.getElementById("op-cliente").textContent = op.cliente;
    document.getElementById("op-setor").textContent = op.setorAtual ? op.setorAtual.nome : "—";
    document.getElementById("op-template").textContent = op.templateOrigem ? op.templateOrigem.nomePedido : "—";
    document.getElementById("op-criada").textContent = formatarDataHora(op.criadaEm);

    const etiqueta = document.getElementById("op-status");
    etiqueta.textContent = NOMES_STATUS[op.status] || op.status;
    etiqueta.className = "etiqueta status-" + String(op.status).toLowerCase();
}

function preencherMateriais(itens) {
    const corpo = document.getElementById("corpo-materiais");

    for (const item of itens) {
        const linha = document.createElement("tr");

        linha.appendChild(celula(item.materialCodigo));

        // Se houve substituição, mostra o material usado e, embaixo,
        // qual era o original.
        const celulaMaterial = document.createElement("td");
        if (item.materialSubstitutoCodigo) {
            celulaMaterial.textContent = item.materialSubstitutoNome + " (" + item.materialSubstitutoCodigo + ")";
            const original = document.createElement("div");
            original.className = "substituto";
            original.textContent = "Substitui: " + item.materialNome + " (" + item.materialCodigo + ")";
            celulaMaterial.appendChild(original);
        } else {
            celulaMaterial.textContent = item.materialNome;
        }
        linha.appendChild(celulaMaterial);

        linha.appendChild(celula(item.setorDestino ? item.setorDestino.nome : "—"));

        const quantidade = celula(formatarQuantidade(item.quantidade) + " " + item.unidade);
        quantidade.className = "direita";
        linha.appendChild(quantidade);

        corpo.appendChild(linha);
    }
}

function preencherHistorico(movimentacoes) {
    const lista = document.getElementById("lista-historico");

    if (movimentacoes.length === 0) {
        document.getElementById("historico-vazio").hidden = false;
        return;
    }

    for (const mov of movimentacoes) {
        const item = document.createElement("li");

        const quando = document.createElement("span");
        quando.className = "historico-data";
        quando.textContent = formatarDataHora(mov.dataHora);

        // setorOrigem é null na primeira movimentação (saída da separação).
        const origem = mov.setorOrigem ? mov.setorOrigem.nome : "Separação";
        const caminho = document.createElement("span");
        caminho.className = "historico-caminho";
        caminho.textContent = origem + " → " + mov.setorDestino.nome;

        const quem = document.createElement("span");
        quem.className = "historico-usuario";
        quem.textContent = mov.usuario ? mov.usuario.nome : "—";

        item.append(quando, caminho, quem);
        lista.appendChild(item);
    }
}

function celula(texto) {
    const td = document.createElement("td");
    td.textContent = texto;
    return td;
}

function mostrarErro(texto) {
    mensagem.textContent = texto;
    mensagem.classList.add("erro");
}

carregarDetalhe();
