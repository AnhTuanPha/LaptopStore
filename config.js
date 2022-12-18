module.exports = {
  app: {
    port: 3000
  },
  database: {
    connection: 'mongodb://localhost:27017/shopping',
    option: {
      useMongoClient: true,
      autoIndex: false
    }
  },
  session: {
    key: '27bda112-99dd-4496-8015-ea20d1034228'
  }
};
