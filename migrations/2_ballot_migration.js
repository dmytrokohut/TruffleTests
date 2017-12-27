var Ballot = artifacts.require("Ballot");

module.exports = function(deployer, network, accounts) {
  let proposals = ["Arni", "Alexa", "Siri"];
  deployer.deploy(Ballot, proposals, {overwrite: false, from: accounts[0]});
}
