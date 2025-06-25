import { Sequelize } from "sequelize";

const isTest = process.env.NODE_ENV === "test";

const sequelize = new Sequelize(
  (isTest ? process.env.DB_NAME_TEST : process.env.DB_NAME)!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST!,
    dialect: "mysql",
    logging: !isTest,
  }
);

const maxRetries = 10;
const retryInterval = 5000; // 5 segundos

async function connectWithRetry(retries = maxRetries) {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    return true;
  } catch (error) {
    console.error(`Tentativa de conexão falhou (${maxRetries - retries + 1}/${maxRetries}):`, error);
    
    if (retries <= 0) {
      console.error('Número máximo de tentativas atingido. Falha na conexão com o banco.');
      return false;
    }
    
    console.log(`Tentando novamente em ${retryInterval/1000} segundos...`);
    await new Promise(resolve => setTimeout(resolve, retryInterval));
    return connectWithRetry(retries - 1);
  }
}

// Inicializar banco de dados com retry
if (process.env.NODE_ENV !== "test") {
  (async () => {
    if (await connectWithRetry()) {
      try {
        await sequelize.sync({ alter: { drop: false } });
        console.log("Banco de dados sincronizado.");
      } catch (error) {
        console.error("Erro ao sincronizar o banco de dados.", error);
      }
    }
  })();
}

export default sequelize;