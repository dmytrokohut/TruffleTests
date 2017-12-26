var Ballot = artifacts.require("Ballot");

contract('Ballot (testrpc network)', accounts => {
  it("should be deployed", async () => {
    let ballot = await Ballot.deployed();
    assert.isDefined(ballot, "The contract is not deployed");
  });

  it("should have correct chairperson address", async () => {
    let ballot = await Ballot.deployed();
    let chairperson = await ballot.chairperson.call();
    assert.equal(chairperson, accounts[0], "The chainperson address is not correct");
  });

  it("should have correct candidate names", async () => {
    let ballot = await Ballot.deployed();
    let firstName = await ballot.proposals.call(0);
    let secondName = await ballot.proposals.call(1);
    let thirdName = await ballot.proposals.call(2);

    assert.equal(web3.toUtf8(firstName[0]), "Name 1", "Incorrect first candidate name");
    assert.equal(web3.toUtf8(secondName[0]), "Name 2", "Incorrect second candidate name");
    assert.equal(web3.toUtf8(thirdName[0]), "Name 3", "Incorrect third candidate name");
  });

  it("should give rights to vote", async () => {
    let ballot = await Ballot.deployed();

    // this must return error: "invalid opcode" such as accounts[1] don't have permissions.
    await ballot.giveRightToVote(accounts[0], {from: accounts[1]}).then(() => {
      console.log("\tWrong behavior of contract, \"accounts[1]\" should not have permissions for this operation such as it is not a chainperson");
    }).catch(exception => { });

    // this must give permission for voting.
    await ballot.giveRightToVote(accounts[1], {from: accounts[0]});
    let voter = await ballot.voters.call(accounts[1]);

    // this must return error: "invalid opcode" such as accounts[1] already has permission for voting.
    await ballot.giveRightToVote(accounts[1], {from: accounts[0]}).then(() => {
      console.log("\tWrong behavior of contract, accounts[1] should already has permission for voting");
    }).catch(exception => { });

    assert.equal(voter[0].toNumber(), 1, "The voter didn't get the permission to vote");
  });

  it("should vote for candidate", async () => {
    let ballot = await Ballot.deployed();
    let numberOfVotesBefore = (await ballot.proposals.call(0))[1].toNumber();
    await ballot.vote(0, {from: accounts[1]});

    let numberOfVotesAfter = (await ballot.proposals.call(0))[1].toNumber();
    let voter = await ballot.voters.call(accounts[1]);

    // this must return exception such as "accounts[1]" has already voted
    await ballot.vote(0, {from: accounts[1]}).then(() => {
      console.log("\tWrong behavior of contract, \"accounts[1]\" has already voted");
    }).catch(exception => { });

    assert.equal(numberOfVotesAfter - numberOfVotesBefore, voter[0].toNumber(), "Incorrect number of weight");
    assert.isTrue(voter[1], "The \"voted\" field has not changed");
    assert.equal(voter[3].toNumber(), 0, "Incorrect number of proposal");
  });

  it("should execute delegation", async () => {
    let ballot = await Ballot.deployed();

    // this must return exception such as "accounts[1]" has already voted
    await ballot.delegate(accounts[0], {from: accounts[1]}).then(() => {
      console.log("\tWrong behavior of contract, \"accounts[1]\" has already voted so it can't delegete voted another person");
    }).catch(exception => { });

    // this must return exception such as account cannot delegate to itself
    await ballot.delegate(accounts[0], {from: accounts[0]}).then(() => {
      console.log("\tWrong behavior, account can't delegate to itself");
    }).catch(exception => { });

    // this must delegate properly
    await ballot.delegate(accounts[1], {from: accounts[0]});
    let voter = await ballot.voters.call(accounts[0]);

    assert.isTrue(voter[1], "After delegation \"voted\" field must become \"true\"");
    assert.equal(voter[2], accounts[1], "Incorrect address in field \"delegate\"");
  });

  it("should display the proper winner", async () => {
    let ballot = await Ballot.deployed();
    let winnerProposalNumber = await ballot.winningProposal.call();
    let winnerProposalName = await ballot.winnerName.call();

    assert.equal(winnerProposalNumber, 0, "Incorrect winner's number");
    assert.equal(web3.toUtf8(winnerProposalName), "Name 1", "Incorrect winner's name");
  });

});
