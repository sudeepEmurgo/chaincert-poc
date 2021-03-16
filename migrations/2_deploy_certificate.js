var Certificate = artifacts.require("./EmurgoCertificate.sol");

module.exports = async function (deployer,network, accounts) {
	await deployer.deploy(Certificate);
	let certificate = await Certificate.deployed()
	await certificate.addManager(accounts[0]);
};
