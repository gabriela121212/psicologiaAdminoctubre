module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": "off", // Desactiva la regla de comillas dobles
    "object-curly-spacing": "off", // Permite espacios dentro de los objetos
    "max-len": "off", // No restringe la longitud de línea
    "@typescript-eslint/no-unused-vars": "off", // Desactiva advertencias por variables no usadas
    "valid-jsdoc": "off", // No requiere comentarios JSDoc
  },
};
