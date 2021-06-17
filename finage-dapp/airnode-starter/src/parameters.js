const util = require('./util');

module.exports = {
  providerId:
    util.readFromReceipt('providerId') || '0x23722bcdd23e559d7151db284f290fadde9f3cb725859d476ef1f16ab315355e',
  endpointId: '0x7ebf803655fe8939d52fcfa18b5714c7d58c94399348f45070cde7871023d615',
};
