# Sistema de Gestão Operacional

Sistema web para acompanhar **Ordens de Produção (OPs)** do pedido até a expedição em empresas de manufatura sob encomenda. Ele registra por quais setores a OP passou, quem a moveu e quando, e organiza os materiais de cada OP por setor de destino.

Projeto pessoal de estudo de engenharia de software e de portfólio, desenvolvido em ritmo próprio. Foi inspirado em desafios comuns de operações de produção, sem vínculo com nenhuma empresa específica. Todos os dados usados nos exemplos são fictícios.

---

## O problema

Em muitas fábricas que produzem sob encomenda, o controle da produção ainda é feito em papel e planilhas:

- A OP é uma folha física que circula entre os setores, e ninguém sabe ao certo **onde ela está**. Ela "some" ou demora a aparecer.
- A folha lista os materiais de **todos os setores misturados**, e quem separa os materiais perde tempo descobrindo o que vai para cada um.
- A entrega de material é confirmada com um "OK" escrito à mão, **sem registro de quem fez nem quando**.
- Não há histórico: depois que a OP termina, não dá para reconstruir o caminho que ela percorreu.

## A proposta

Uma aplicação em que cada perfil da operação enxerga e registra a sua parte do processo:

| Perfil | O que faz no sistema |
|---|---|
| **Engenharia** | Cadastra templates de materiais por tipo de pedido e cria a OP a partir deles, revisando os materiais antes de confirmar |
| **Líder de setor** | Consulta as OPs e avança a OP para o próximo setor; cada avanço fica registrado |
| **Almoxarifado** | Vê os materiais de cada OP já separados por setor de destino |
| **Expedição** | Confere a OP e a conclui |

## Escopo

O projeto é dividido em entregas incrementais para manter o MVP enxuto.

**MVP (em desenvolvimento)**
- Cadastro de setores, usuários, templates de materiais e ordens de produção
- Criação de OP a partir de template, com os itens copiados para a OP e revisáveis pela Engenharia
- Registro de material substituto quando o original está em falta
- Avanço da OP entre setores com histórico (setor de origem, destino, responsável e data/hora)
- Status da OP: `AGUARDANDO_SEPARACAO` → `EM_PRODUCAO` → `EM_EXPEDICAO` → `CONCLUIDA`
- Telas web: lista de OPs, detalhe com histórico, avanço de setor e separação de materiais por setor

**V2**
- Data de entrega estruturada, com alerta de atraso
- Confirmação item a item da entrega de material a cada setor
- Montagem do kit de instalação para a expedição
- Autenticação com senha criptografada (Spring Security + BCrypt)
- Tratamento de erros com respostas HTTP adequadas (404, 400)

**Futuro**
- Controle de estoque e entrada de notas fiscais
- Priorização de OPs urgentes
- Notificações e atualização em tempo real
- Dashboards e indicadores
- Leitura de OP por QR Code ou código de barras

## Arquitetura

Aplicação **Spring Boot** em camadas, com o front-end servido pelo próprio back-end.

```
Navegador (HTML/CSS/JS)
        │  fetch (JSON)
        ▼
Controller  →  Service  →  Repository  →  MySQL
 (rotas REST)   (regras)    (Spring Data JPA)
```

- **Controller:** recebe as requisições HTTP e devolve JSON
- **Service:** concentra as regras de negócio (status inicial da OP, registro de movimentação etc.)
- **Repository:** acesso ao banco via Spring Data JPA
- **Model:** entidades JPA mapeadas para as tabelas

Decisões principais:
- Injeção de dependência por construtor
- IDs do tipo `Long`
- Os itens da OP são **cópias** dos itens do template, para que uma alteração no template não mude OPs já criadas
- Em relações bidirecionais, o lado filho é ignorado na serialização JSON, para evitar recursão
- A senha do usuário é aceita na criação, mas nunca devolvida pela API

## Modelo de dados

Entidades: `Setor`, `Usuario`, `Template`, `ItemTemplate`, `OrdemProducao`, `ItemOP`, `Movimentacao`.

| Tabela | Conteúdo |
|---|---|
| `setor` | Setores da produção e a ordem padrão entre eles |
| `usuario` | Usuários e o setor a que pertencem |
| `template` / `item_template` | Modelos de pedido e seus materiais padrão |
| `ordem_producao` / `itemop` | OPs, status, setor atual e materiais |
| `movimentacao` | Histórico de passagens da OP entre setores |

Os diagramas de caso de uso, de classes e de estados estão na pasta [`Diagramas`](Diagramas).

## API

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/setores` | Cadastra um setor |
| `GET` | `/setores` | Lista os setores |
| `POST` | `/usuarios` | Cadastra um usuário |
| `GET` | `/usuarios` | Lista os usuários |
| `POST` | `/templates` | Cadastra um template com seus itens |
| `GET` | `/templates` | Lista os templates |
| `POST` | `/ordens-producao` | Cria uma OP com seus itens |
| `GET` | `/ordens-producao` | Lista as OPs |
| `GET` | `/ordens-producao/{id}` | Busca uma OP |
| `POST` | `/movimentacoes/avancar` | Avança a OP para outro setor |
| `POST` | `/movimentacoes/concluir/{id}` | Conclui a OP |
| `GET` | `/movimentacoes/historico/{id}` | Histórico de movimentações da OP |

Exemplo de corpo para avançar uma OP:

```json
{
  "ordemProducaoId": 3,
  "setorDestinoId": 2,
  "usuarioId": 1
}
```

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Back-end | Java 17, Spring Boot 4, Spring Data JPA, Hibernate |
| Banco de dados | MySQL 8 |
| Front-end | HTML, CSS e JavaScript |
| Testes de API | Postman |
| Modelagem | UML |
| Versionamento | Git / GitHub |

## Como rodar

**Pré-requisitos:** JDK 17 ou superior e MySQL 8.

1. Clone o repositório:
   ```bash
   git clone https://github.com/Rochasg7/GestaoOperacional.git
   cd Sistema-Gestao-Operacional
   ```
2. Crie o banco no MySQL:
   ```sql
   CREATE DATABASE gestao_operacional;
   ```
3. Copie `src/main/resources/application.properties.example` para `application.properties`, na mesma pasta, e preencha usuário e senha do seu MySQL. Esse arquivo não é versionado.
4. Suba a aplicação. As tabelas são criadas automaticamente na primeira execução:
   ```bash
   ./mvnw spring-boot:run
   ```
5. (Opcional) Para ter dados de exemplo, execute o script `scripts/dados-teste.sql` no MySQL **depois** da primeira execução.

A API fica disponível em `http://localhost:8080`.

## Status

| Fase | Situação |
|---|---|
| Levantamento do processo atual e definição do escopo | ✅ Concluída |
| Modelagem UML e do banco de dados | ✅ Concluída |
| Back-end do MVP | ✅ Concluído |
| Front-end do MVP | 🔄 Em andamento |
| Testes e implantação | ⏳ Planejada |

## Autores

Desenvolvido por **Gabriel de Souza Rocha** e **Jorge Ricardo de Carvalho Simões**, estudantes de Sistemas de Informação (UNIVAS).