var Ballot = artifacts.require("Ballot");

module.exports = function(deployer, network, accounts) {
  if(network == "testrpc") {
    let proposals = ["Name 1", "Name 2", "Name 3"];
    deployer.deploy(Ballot, proposals, {overwrite: false, from: accounts[0]});
  } else if(network == "rinkeby") {
    let proposals = ["Arni", "Alexa", "Siri"];
    deployer.deploy(Ballot, proposals, {overwrite: false});
  }
}
