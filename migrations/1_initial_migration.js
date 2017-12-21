var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, accounts) {
  if(network == "testrpc") {
    deployer.deploy(Migrations, {overwrite: false, from: accounts[0]});
  }
};
