var Handshake = artifacts.require("./handshake.sol");

module.exports = function(deployer) {
  deployer.deploy(Handshake);
};
