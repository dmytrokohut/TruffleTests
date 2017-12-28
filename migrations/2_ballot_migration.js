var Ballot = artifacts.require("Ballot");
var constants = require("../test/helpers/constants.js");

module.exports = function(deployer, network, accounts) {
  let proposals = [constants.FIRST_PROPOSAL_NAME, constants.SECOND_PROPOSAL_NAME, constants.THIRD_PROPOSAL_NAME];
  deployer.deploy(Ballot, proposals, {overwrite: false, from: accounts[0]});
}
