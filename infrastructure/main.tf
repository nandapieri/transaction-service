provider "aws" {
  region                      = "us-east-1"
  access_key                  = "dummy"
  secret_key                  = "dummy"
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  endpoints {
    dynamodb = "http://localhost:4566"
    lambda   = "http://localhost:4566"
    apigateway = "http://localhost:4566"
  }
}

resource "aws_dynamodb_table" "transactions" {
  name           = "Transactions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "UserIdIndex"
    hash_key        = "userId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }
}

resource "aws_lambda_function" "transaction_handler" {
  function_name = "transactionHandler"
  handler       = "dist/handlers/transactionHandler.handler"
  runtime       = "nodejs18.x"
  filename      = "${path.module}/../deployment/package.zip"
  role          = "arn:aws:iam::123456789012:role/service-role/your-role-name"

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.transactions.name
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

resource "aws_api_gateway_method" "get_transactions" {
  rest_api_id   = aws_api_gateway_rest_api.transactions_api.id
  resource_id   = aws_api_gateway_resource.transactions.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_transactions" {
  rest_api_id = aws_api_gateway_rest_api.transactions_api.id
  resource_id = aws_api_gateway_resource.transactions.id
  http_method = aws_api_gateway_method.get_transactions.http_method
  integration_http_method = "POST"
  type                     = "AWS_PROXY"
  uri                      = aws_lambda_function.transaction_handler.invoke_arn
}

resource "aws_api_gateway_deployment" "transactions_deployment" {
  rest_api_id = aws_api_gateway_rest_api.transactions_api.id

  depends_on = [
    aws_api_gateway_method.get_transactions,
    aws_api_gateway_integration.lambda_transactions
  ]
}

resource "aws_api_gateway_stage" "dev_stage" {
  deployment_id = aws_api_gateway_deployment.transactions_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.transactions_api.id
  stage_name    = "dev"
  cache_cluster_enabled = false
}
