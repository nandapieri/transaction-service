module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.ts', // Testes unitários
    '**/__integration_tests__/**/*.test.ts' // Testes de integração
  ],
};