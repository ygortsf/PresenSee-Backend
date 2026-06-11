# 🧪 Guia de Execução dos Testes - PresenSee (PI4)

Este documento descreve como executar a suíte de testes automatizados do backend do PresenSee. Utilizamos o framework **Jest** para garantir a estabilidade das regras de negócio e simular as interações com o banco de dados.

## ⚙️ Pré-requisitos

Os testes exigem que as dependências de desenvolvimento estejam instaladas. Se ainda não o fez, abra o terminal na raiz do projeto e instale o Jest e o Supertest:

bash
npm install --save-dev jest supertest


---

## 🏃‍♂️ Como rodar os testes

**⚠️ IMPORTANTE:** Todos os comandos abaixo devem ser executados no terminal **na raiz do projeto** (e não dentro da pasta `tests`).

### 1. Testes Unitários (Regras de Negócio)
Garante que os cálculos matemáticos para prevenção de evasão (limite de 25% de faltas, alertas de faltas consecutivas) e as validações de autenticação estão funcionando perfeitamente.

bash
npx jest tests/unitarios.test.js


### 2. Testes de Integração (Mocks e Stubs)
Testa a integração sem "sujar" o banco de dados real. O Jest intercepta as chamadas para o Sequelize (Models `Aluno` e `User`) usando Mocks e injeta respostas pré-programadas (Stubs).

bash
npx jest tests/mocks.test.js


### 3. Relatório de Cobertura (Code Coverage)
Gera uma tabela de análise estática demonstrando que **100%** do código das `Services` foi testado, cobrindo todas as linhas, funções e possibilidades (Statements, Branches, Functions e Lines).

bash
npx jest tests/unitarios.test.js --coverage --collectCoverageFrom="src/services/frequenciaService.js" --collectCoverageFrom="src/services/authService.js"