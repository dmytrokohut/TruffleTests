var Ballot = artifacts.require("Ballot");

contract('Ballot (testrpc network)', accounts => {
  it("should be deployed", () => {
    return Ballot.deployed().then(ballot => {
      let address = ballot.address;
      assert.isDefined(address, "The contract is not deployed");
    });
  });

  it("should have correct chairperson address", () => {
    return Ballot.deployed().then(ballot => {
      return ballot.chairperson.call();
    }).then(chairperson => {
      assert.equal(chairperson, accounts[0], "The chairperson address is not correct");
    });
  });

  it("should have 3 correct candidate names", () => {
    let ballot;
    let first_name;
    let second_name;
    let third_name;

    return Ballot.deployed().then(instance => {
        ballot = instance;
        return ballot.proposals.call(0);
    }).then(proposal => {
      first_name = web3.toUtf8(proposal[0]);
      return ballot.proposals.call(1);
    }).then(proposal => {
      second_name = web3.toUtf8(proposal[0]);
      return ballot.proposals.call(2);
    }).then(proposal => {
      third_name = web3.toUtf8(proposal[0]);

      assert.equal(first_name, "Name 1", "Incorrect first candidate name in list");
      assert.equal(second_name, "Name 2", "Incorrect second candidate name in list");
      assert.equal(third_name, "Name 3", "Incorrect third candidate name in list");
    });
  });

  it("should give rights to vote", () => {
    let ballot;

    return Ballot.deployed().then(instance => {
      ballot = instance;
      return ballot.giveRightToVote(accounts[1]);
    }).then(() => {
      return ballot.voters.call(accounts[1]);
    }).then(voter => {
      assert.equal(voter[0].toNumber(), 1, "The voter don't have the vote right");
    });
  });

  it("should correct execute delegation", () => {
    let ballot;

    return Ballot.deployed().then(instance => {
      ballot = instance;
      return ballot.delegate(accounts[0], {from: accounts[1]});
    }).then(() => {
      return ballot.voters.call(accounts[1]);
    }).then(voter => {
      let isVoted = voter[1];
      let delegateTo = voter[2];
      
      assert.isTrue(isVoted, "The delegation was not succeed");
      assert.equal(delegateTo, accounts[0], "The address of delegate is not correct");
    });
  });

  it("should vote for candidate", () => {
    let ballot;
    let numberOfVotesBefore, numberOfVotesAfter;
    let votedFor;
    let isVoted;
    let weight;

    return Ballot.deployed().then(instance => {
      ballot = instance;
      return ballot.proposals.call(0);
    }).then(proposal => {
      numberOfVotesBefore = proposal[1].toNumber();
      return ballot.vote(0);
    }).then(() => {
      return ballot.proposals.call(0);
    }).then(proposal => {
      numberOfVotesAfter = proposal[1].toNumber();
      return ballot.voters.call(accounts[0]);
    }).then(voter => {
      weight = voter[0];
      isVoted = voter[1];
      votedFor = voter[3];
      let difference = numberOfVotesAfter - numberOfVotesBefore;

      assert.isTrue(isVoted, "The voter was not voting");
      assert.equal(votedFor, 0, "The proposal's number is different");
      assert.equal(difference, weight, "The number of votes has not changed");
    });
  });

  it("should display correct winner canidate", () => {
    let ballot;

    return Ballot.deployed().then(instance => {
      ballot = instance;
      return ballot.winningProposal.call();
    }).then(winnerProposal => {
      assert.equal(winnerProposal, 0, "Incorrect winner's candidate number");
      return ballot.winnerName.call();
    }).then(proposal => {
      let winner = web3.toUtf8(proposal);
      assert.equal(winner, "Name 1", "Incorrect winner's name");
    });
  });

});
