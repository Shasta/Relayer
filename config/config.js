const Joi = require('joi');

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  PORT: Joi.number()
    .default(4040),
  MONGOOSE_DEBUG: Joi.boolean()
    .when('NODE_ENV', {
      is: Joi.string().equal('development'),
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false)
    }),
  JWT_SECRET: Joi.string().required()
    .description('JWT Secret required to sign'),
  MONGO_HOST: Joi.string().required()
    .description('Mongo DB host url'),
  MONGO_PORT: Joi.number()
    .default(27017),
  WEB3_PROVIDER: Joi.string()
    .default("ws://localhost:8545"),
  ACCOUNT_PRIVATE_KEY: Joi.string().required()
    .description("Account private key with ether funds"),
  STAMP_TIME_MS: Joi.number().required()
    .description("The stamping time in ms"),
  NETWORK_ID: Joi.number().required()
    .description("The truffle configured network identifier")

}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  jwtSecret: envVars.JWT_SECRET,
  mongo: {
    host: envVars.MONGO_HOST,
    port: envVars.MONGO_PORT
  },
  web3Provider: envVars.WEB3_PROVIDER,
  accountPrivateKey: envVars.ACCOUNT_PRIVATE_KEY,
  stampingTime: envVars.STAMP_TIME_MS,
  networkId: envVars.NETWORK_ID
};

module.exports = config;
