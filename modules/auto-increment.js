// thư viện cho id tự tăng 
const Instance = require('mongoose-auto-increment');

module.exports.getInstance = () => {
  return Instance;
};

module.exports.init = (connection) => {
  Instance.initialize(connection);
};
