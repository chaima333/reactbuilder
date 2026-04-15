require('dotenv').config();

module.exports = {
  development: {
    username: "postgres",
    password: "PtWYWImdutAsGglMknYLefISsvqBbWbf",
    database: "railway",
    host: "junction.proxy.rlwy.net",
    port: 58389,
    dialect: "postgres"
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres"
  }
};