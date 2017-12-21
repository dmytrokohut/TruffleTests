module.exports = {
  networks: {
    testrpc: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      from: "0x02122b77afce70cca792b1538aa8d89a70631338"
    }
  }
};
