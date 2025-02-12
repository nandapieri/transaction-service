provider "aws" {
  region                      = "us-east-1"
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  endpoints {
    dynamodb = "http://localhost:4566"
    lambda   = "http://localhost:4566"
    apigateway = "http://localhost:4566"
    secretsmanager = "http://localhost:4566"
  }
}

data "aws_secretsmanager_secret_version" "my_secrets" {
  secret_id = "MyApp/EnvironmentVariables"
}

locals {
  secret_values = jsondecode(data.aws_secretsmanager_secret_version.my_secrets.secret_string)
}

resource "aws_dynamodb_table" "transactions" {
  name           = "Transactions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "Id"

  attribute {
    name = "Id"
    type = "S"
  }

  attribute {
    name = "UserId"
    type = "S"
  }

  attribute {
    name = "CreatedAt"
    type = "S"
  }

  global_secondary_index {
    name            = "UserIdIndex"
    hash_key        = "UserId"
    range_key       = "CreatedAt"
    projection_type = "ALL"
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  role = aws_iam_role.lambda_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
          "dynamodb:*"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

resource "aws_lambda_function" "transaction_handler" {
  function_name = "transactionHandler"
  handler       = "dist/handlers/transactionHandler.handler"
  runtime       = "nodejs18.x"
  filename      = "${path.module}/../deployment/package.zip"
  role          = aws_iam_role.lambda_role.arn

  environment {
    variables = {
      DYNAMODB_TABLE        = aws_dynamodb_table.transactions.name
      AWS_ENDPOINT_URL      = "http://host.docker.internal:4566"
      AWS_ACCESS_KEY_ID     = local.secret_values.AWS_ACCESS_KEY_ID
      AWS_SECRET_ACCESS_KEY = local.secret_values.AWS_SECRET_ACCESS_KEY
    }
  }
}

resource "aws_api_gateway_rest_api" "transactions_api" {
  name        = "TransactionsAPI"
  description = "API Gateway for Transactions"
}

resource "aws_api_gateway_resource" "transactions" {
  rest_api_id = aws_api_gateway_rest_api.transactions_api.id
  parent_id   = aws_api_gateway_rest_api.transactions_api.root_resource_id
  path_part   = "transactions"
}

resource "aws_api_gateway_method" "post_transactions" {
  rest_api_id   = aws_api_gateway_rest_api.transactions_api.id
  resource_id   = aws_api_gateway_resource.transactions.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_post_transactions" {
  rest_api_id = aws_api_gateway_rest_api.transactions_api.id
  resource_id = aws_api_gateway_resource.transactions.id
  http_method = aws_api_gateway_method.post_transactions.http_method
  integration_http_method = "POST"
  type                     = "AWS_PROXY"
  uri                      = aws_lambda_function.transaction_handler.invoke_arn
}

resource "aws_api_gateway_method" "get_transactions" {
  rest_api_id   = aws_api_gateway_rest_api.transactions_api.id
  resource_id   = aws_api_gateway_resource.transactions.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_get_transactions" {
  rest_api_id = aws_api_gateway_rest_api.transactions_api.id
  resource_id = aws_api_gateway_resource.transactions.id
  http_method = aws_api_gateway_method.get_transactions.http_method
  integration_http_method = "POST"
  type                     = "AWS_PROXY"
  uri                      = aws_lambda_function.transaction_handler.invoke_arn
}

resource "aws_api_gateway_resource" "balance" {
  rest_api_id = aws_api_gateway_rest_api.transactions_api.id
  parent_id   = aws_api_gateway_rest_api.transactions_api.root_resource_id
  path_part   = "balance"
}

resource "aws_api_gateway_method" "get_balance" {
  rest_api_id   = aws_api_gateway_rest_api.transactions_api.id
  resource_id   = aws_api_gateway_resource.balance.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_get_balance" {
  rest_api_id = aws_api_gateway_rest_api.transactions_api.id
  resource_id = aws_api_gateway_resource.balance.id
  http_method = aws_api_gateway_method.get_balance.http_method
  integration_http_method = "POST"
  type                     = "AWS_PROXY"
  uri                      = aws_lambda_function.transaction_handler.invoke_arn
}

resource "aws_api_gateway_deployment" "transactions_deployment" {
  rest_api_id = aws_api_gateway_rest_api.transactions_api.id

  depends_on = [
    aws_api_gateway_method.post_transactions,
    aws_api_gateway_method.get_transactions,
    aws_api_gateway_method.get_balance,
    aws_api_gateway_integration.lambda_post_transactions,
    aws_api_gateway_integration.lambda_get_transactions,
    aws_api_gateway_integration.lambda_get_balance
  ]
}

resource "aws_api_gateway_stage" "dev_stage" {
  deployment_id = aws_api_gateway_deployment.transactions_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.transactions_api.id
  stage_name    = "dev"
  cache_cluster_enabled = false
}
