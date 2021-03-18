const path = require("path");
// const HDWalletProvider = require("@truffle/hdwallet-provider");
// const mnemonic = require("./mnemonic.env");

module.exports = {
	// See <http://truffleframework.com/docs/advanced/configuration>
	// to customize your Truffle configuration!
	contracts_build_directory: path.join(__dirname, "client/src/contracts"),
	networks: {
		development: {
			host: "127.0.0.1", // Localhost (default: none)
			port: 7545, // Standard Ethereum port (default: none)
			network_id: "*", // Any network (default: none)
		},
		// rinkeby: {
		// 	provider: () =>
		// 		new HDWalletProvider(
		// 			mnemonic,
		// 			`https://rinkeby.infura.io/v3/76572308a2714058a90cddf49b651930`
		// 		),
		// 	network_id: 4, // Ropsten's id - 49.598 ETH
		// 	gas: 5500000, // Ropsten has a lower block limit than mainnet
		// 	confirmations: 2, // # of confs to wait between deployments. (default: 0)
		// 	timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
		// 	skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
		// },
	},
	compilers: {
		solc: {
			version: "0.5.6", // Fetch exact version from solc-bin (default: truffle's version)
			// docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
			// settings: {          // See the solidity docs for advice about optimization and evmVersion
			//  optimizer: {
			//    enabled: false,
			//    runs: 200
			//  },
			//  evmVersion: "byzantium"
			// }
		},
	},
};
