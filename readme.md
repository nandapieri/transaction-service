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
    docker run --rm -p 4566:4566 -p 4571:4571 localstack/localstack


2. Configure o AWS CLI para usar o LocalStack:
Configure seus comandos AWS CLI para apontar para o LocalStack:
    ```bash
    aws configure set aws_access_key_id dummy
    aws configure set aws_secret_access_key dummy
    aws configure set region us-east-1

## Subir a aplicação

1. **Empacotar para implantação:**
Crie um pacote zip para implantação na AWS Lambda:
    ```bash
    npm run build-and-package


2. **Provisionamento de Infraestrutura**
Inicialize o Terraform no diretório onde o arquivo main.tf está localizado:
    ```bash
    terraform init

3. **Aplique a infraestrutura:**
    ```bash
    terraform apply

4. **Confirme a aplicação das mudanças quando solicitado.**