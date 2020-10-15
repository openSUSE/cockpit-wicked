module.exports = {
  roots: ['<rootDir>'],
  transform: {
    '\\.(js|jsx)?$': 'babel-jest'
  },
  testMatch: [
    '<rootDir>/src/**/*.test.{js, jsx}'
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    // avoid errors like "Unexpected token ." See https://stackoverflow.com/a/54646930
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: [
    '@testing-library/jest-dom/extend-expect',
  ]
}
