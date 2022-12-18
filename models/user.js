const mongoose = require('mongoose');

const Model = new mongoose.Schema(
  {
    id: Number,
    fullname: String,
    email: String,
    password: String,
    photo: String,
    roles: Object,
    isDeleted: Boolean
  },{
    collection: 'user'
  }
);
    
Model.plugin(require('../modules/auto-increment').getInstance().plugin, {
  model: 'user',
  field: 'id'
});

module.exports = mongoose.model('user', Model);
