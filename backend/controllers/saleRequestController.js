const tradeIn = require('./tradeInController');
exports.getAll = tradeIn.list;
exports.getById = tradeIn.getById;
exports.create = tradeIn.create;
exports.update = tradeIn.update;
exports.remove = tradeIn.remove;
