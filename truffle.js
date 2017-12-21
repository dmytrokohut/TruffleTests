module.exports = {
  networks: {
    testrpc: {
      host: "localhost",
      port: 8545,
      network_id: "*",     // Match any network id
      gas: 4700000         // Necessary parameter such as with the default value it throws the "Exceeds block gas limit" error
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      from: "0x02122b77afce70cca792b1538aa8d89a70631338"
    }
  }
};
