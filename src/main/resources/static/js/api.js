// Todas as chamadas ao backend ficam aqui.
// Se uma rota mudar, corrige-se só neste arquivo.

// Endereço vazio = mesmo servidor que entregou a página (o próprio Spring Boot).
const API_BASE = "";

// Função genérica: faz o GET e devolve o JSON já convertido em objeto JavaScript.
async function buscarJson(caminho) {
    const resposta = await fetch(API_BASE + caminho);

    // fetch não gera erro sozinho quando o servidor responde 404 ou 500,
    // então é preciso conferir o "ok" na mão.
    if (!resposta.ok) {
        throw new Error("Erro " + resposta.status + " ao acessar " + caminho);
    }

    return resposta.json();
}

function listarOrdensProducao() {
    return buscarJson("/ordens-producao");
}

function buscarOrdemProducao(id) {
    return buscarJson("/ordens-producao/" + id);
}

function buscarHistorico(ordemProducaoId) {
    return buscarJson("/movimentacoes/historico/" + ordemProducaoId);
}

// O backend guarda quantidade como Double (2.0). Na tela fica melhor "2".
// Para quantidades quebradas, mostra com vírgula: 2.5 → "2,5".
function formatarQuantidade(numero) {
    return Number(numero).toLocaleString("pt-BR");
}

// Textos amigáveis para os valores do enum StatusOP do backend.
const NOMES_STATUS = {
    AGUARDANDO_SEPARACAO: "Aguardando separação",
    EM_PRODUCAO: "Em produção",
    EM_EXPEDICAO: "Em expedição",
    CONCLUIDA: "Concluída"
};

// Converte "2026-10-09T13:00:00" em "09/10/2026 13:00".
function formatarDataHora(texto) {
    if (!texto) return "—";
    const data = new Date(texto);
    return data.toLocaleDateString("pt-BR") + " " +
           data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
