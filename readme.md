# Transaction Service

Este projeto é um microsserviço para gerenciar transações financeiras. Ele utiliza Node.js, TypeScript, AWS Lambda, DynamoDB e Terraform para provisionamento de infraestrutura.

## Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas no seu ambiente de desenvolvimento:

- [Node.js](https://nodejs.org/) (versão 18.x ou superior)
- [npm](https://www.npmjs.com/) (geralmente incluído com o Node.js)
- [AWS CLI](https://aws.amazon.com/cli/) configurado com suas credenciais
- [Terraform](https://www.terraform.io/downloads.html) (versão 1.0 ou superior)
- [LocalStack](https://localstack.cloud/) para simulação dos serviços AWS localmente
- [Docker](https://www.docker.com/) para executar o LocalStack

## Configuração do Ambiente

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/nandapieri/transaction-service.git
   cd transaction-service


2. **Instale as dependências do Node.js:**
    ```bash
    npm install


## Executar o LocalStack

1. Suba o LocalStack usando Docker:
Certifique-se de que o Docker está em execução e depois execute:
    ```bash
    localstack start


2. Configure o AWS CLI para usar o LocalStack:
Configure seus comandos AWS CLI para apontar para o LocalStack:
    ```bash
    aws configure set aws_access_key_id dummy
    aws configure set aws_secret_access_key dummy
    aws configure set region us-east-1
    export AWS_ENDPOINT_URL="http://localhost:4566"

2. Crie os secrets no AWS Secrets Manager.
Precisaremos deles para aplicar a infraestrutura:
    ```bash
    aws secretsmanager create-secret --name MyApp/EnvironmentVariables --secret-string '{"AWS_ACCESS_KEY_ID":"dummy","AWS_SECRET_ACCESS_KEY":"dummy"}' --endpoint-url http://localhost:4566

## Subir a aplicação e testar

1. **Empacotar para implantação:**
Crie um pacote zip para implantação na AWS Lambda:
    ```bash
    npm run build-and-package


2. **Provisionamento de Infraestrutura**
Inicialize o Terraform no diretório infrastructure:
    ```bash
    cd infrastructure
    terraform init

3. **Aplique a infraestrutura:**
    ```bash
    terraform apply

4. **Rode o script para inserir dados na tabela (na raiz do projeto).**
    ```bash
    cd ..
    node seed.js

5. **Pegue o id da api para podermos fazer testes das rotas.**
    ```bash
    aws --endpoint-url=http://localhost:4566 apigateway get-rest-apis

- A resposta será algo como o exemplo abaixo. O id que queremos está na propriedade `id` (no exemplo, `fbcf5neikk`):

   ```json
   {
     "items": [
       {
         "id": "fbcf5neikk",
         "name": "TransactionsAPI",
         "description": "API Gateway for Transactions",
         "createdDate": "2025-02-11T15:17:36-03:00",
         "apiKeySource": "HEADER",
         "endpointConfiguration": {
           "types": [
             "EDGE"
           ]
         }
       }
     ]
   }
  ```

6. **Testes das rotas da api usando cURL.**
- Listar transações
    ```bash
    curl -X GET "http://localhost:4566/restapis/<ID-DA-API-DO-PASSO-6>/dev/_user_request_/transactions?userId=user-123&limit=10"

- Criar transação
    ```bash
    curl -v -X POST "http://localhost:4566/restapis/<ID-DA-API-DO-PASSO-6>/dev/_user_request_/transactions" \
    -H "Content-Type: application/json" \
    -d '{
    "userId": "user-123",
    "amount": 100,
    "description": "Test transaction"
    }'

- Calcular saldo do mês de referencia
    ```bash
    curl -X GET "http://localhost:4566/restapis/<ID-DA-API-DO-PASSO-6>/dev/_user_request_/balance?userId=user-123&month=2025-02"

## Planejamento do streaming para RDS

[Diagrama arquitetural](https://drive.google.com/file/d/1ohVz54OL07eXW73-VvQErK242YSZHXmB/view)

[Descrição textual dos serviços](https://drive.google.com/file/d/15c_m3PdJHmEkrjEueLn0ONxvjiOXwRCj/view?usp=drive_link).

