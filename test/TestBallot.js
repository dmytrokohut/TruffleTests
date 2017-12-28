var Ballot = artifacts.require("Ballot");
var expectThrow = require("./helpers/expectThrow.js");
var constants = require("./helpers/constants.js");

contract('Ballot', accounts => {
  const FIRST_ACCOUNT = accounts[0];
  const SECOND_ACCOUNT = accounts[1];
  const WEIGHT = 1;
  const PROPOSAL = 0;

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
    let firstName = web3.toUtf8((await ballot.proposals.call(0))[0]);
    let secondName = web3.toUtf8((await ballot.proposals.call(1))[0]);
    let thirdName = web3.toUtf8((await ballot.proposals.call(2))[0]);

    assert.equal(firstName, constants.FIRST_PROPOSAL_NAME, "Incorrect first candidate name");
    assert.equal(secondName, constants.SECOND_PROPOSAL_NAME, "Incorrect second candidate name");
    assert.equal(thirdName, constants.THIRD_PROPOSAL_NAME, "Incorrect third candidate name");
  });

  it("should give rights to vote, part(1)", async () => {
    let ballot = await Ballot.deployed();

    // this must return error: "invalid opcode" such as account don't have permissions.
    await expectThrow(ballot.giveRightToVote(FIRST_ACCOUNT, {from: SECOND_ACCOUNT}));

    // this must give permission for voting.
    await ballot.giveRightToVote(SECOND_ACCOUNT, {from: FIRST_ACCOUNT});
    let voterWeight = (await ballot.voters.call(SECOND_ACCOUNT))[0].toNumber();

    // this must return error: "invalid opcode" such as account already has permission for voting.
    await expectThrow(ballot.giveRightToVote(SECOND_ACCOUNT, {from: FIRST_ACCOUNT}));

    assert.equal(voterWeight, WEIGHT, "The voter didn't get the permission to vote");
  });

  it("should vote for candidate", async () => {
    let ballot = await Ballot.deployed();
    let numberOfVotesBefore = (await ballot.proposals.call(0))[1].toNumber();
    await ballot.vote(PROPOSAL, {from: SECOND_ACCOUNT});

    let numberOfVotesAfter = (await ballot.proposals.call(0))[1].toNumber();
    let voter = await ballot.voters.call(SECOND_ACCOUNT);
    let voterWeight = voter[0].toNumber();
    let voterVoted = voter[1];
    let voterChosenProposal = voter[3].toNumber();

    // this must return exception such as account has already voted
    await expectThrow(ballot.vote(PROPOSAL, {from: SECOND_ACCOUNT}));

    assert.equal(numberOfVotesAfter - numberOfVotesBefore, voterWeight, "Incorrect number of weight");
    assert.isTrue(voterVoted, "The \"voted\" field has not changed");
    assert.equal(voterChosenProposal, PROPOSAL, "Incorrect number of proposal");
  });

  it("should give rights to vote, part(2)", async () => {
    let ballot = await Ballot.deployed();

    // this must return error: "invalid opcode" such as account already voted.
    await expectThrow(ballot.giveRightToVote(SECOND_ACCOUNT, {from: FIRST_ACCOUNT}));
  });

  it("should execute delegation", async () => {
    let ballot = await Ballot.deployed();

    // this must return exception such as account has already voted
    await expectThrow(ballot.delegate(FIRST_ACCOUNT, {from: SECOND_ACCOUNT}));

    // this must return exception such as account cannot delegate to itself
    await expectThrow(ballot.delegate(FIRST_ACCOUNT, {from: FIRST_ACCOUNT}));

    // this must delegate properly
    await ballot.delegate(SECOND_ACCOUNT, {from: FIRST_ACCOUNT});
    let voter = await ballot.voters.call(FIRST_ACCOUNT);
    let voterVoted = voter[1];
    let voterDelegateTo = voter[2];

    assert.isTrue(voterVoted, "After delegation \"voted\" field must become \"true\"");
    assert.equal(voterDelegateTo, SECOND_ACCOUNT, "Incorrect address in field \"delegate\"");
  });

  it("should display the proper winner", async () => {
    let ballot = await Ballot.deployed();
    let winnerProposalNumber = await ballot.winningProposal.call();
    let winnerProposalName = web3.toUtf8(await ballot.winnerName.call());

    assert.equal(winnerProposalNumber, PROPOSAL, "Incorrect winner's number");
    assert.equal(winnerProposalName, constants.FIRST_PROPOSAL_NAME, "Incorrect winner's name");
  });

});
