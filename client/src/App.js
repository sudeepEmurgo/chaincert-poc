import React, { Component } from "react";
import EmurgoCertificate from "./contracts/EmurgoCertificate.json";
// import getWeb3 from "./getWeb3";
import Web3 from "web3";

// import mnemonic from "./mnemonic.env";

import {
	Container,
	Navbar,
	Nav,
	Form,
	FormControl,
	Button,
	Row,
	Col,
	Table,
	Badge,
	ListGroup,
	Tabs,
	Tab,
	Modal,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import "./App.css";
// const HDWalletProvider = require("@truffle/hdwallet-provider");
// const dotenv = require("dotenv");
// const env = dotenv.config().parsed;

class App extends Component {
	state = {
		nameOfCertificate: "",
		nameOfLearner: "",
		description: "",
		skills: [],
		eligibility: [],
		projects: [],
		issuedBy: "",
		issuedOn: "",
		updatedOn: "",
		contractAddress: "",
		skillsToAdd: [],
		criteriaToAdd: [],
		certificateTypeLatest: {
			Id: "",
			name: "",
			description: "",
			certificateTypeId: "",
			issuedTo: "",
			certificateId: "",
			projectName: "",
			learnerName: "",
		},
		certificateTypeAddedStream: [],
		projectAdded: [],
		modalType: "",
		isOwner: false,
		isManager: false,
		showModal: false,
		web3: null,
		accounts: null,
		contract: null,
	};

	componentDidMount = async () => {
		try {
			let web3, accounts;
			if (window.ethereum) {
				web3 = new Web3(window.ethereum);
				try {
				  // Request account access if needed
				  await window.ethereum.enable();
				  // Acccounts now exposed
				//   resolve(web3);
				} catch (error) {
				  console.log(error);
				}
			}
			// try {
			// 	web3 = await new Web3(window.ethereum);
			// 	if (web3 != undefined) {
			// 		console.log(web3.version)
			// 		accounts = await web3.eth.getAccounts();
			// 		console.log("waiting 1", accounts);
			// 	}
			// } catch (err) {
			// 	web3 = new Web3(
			// 		new HDWalletProvider(
			// 			"myth like bonus scare over problem client lizard pioneer submit female collect",
			// 			"https://rinkeby.infura.io/v3/76572308a2714058a90cddf49b651930"
			// 		)
			// 	);
			// 	accounts = await ["0x0000000000000000000000000000000000000000"];
			// }
			accounts = await web3.eth.getAccounts();
			console.log("Accounts" + accounts);
			const networkId = await web3.eth.net.getId();
			console.log("Network" + networkId);
			const deployedNetwork = EmurgoCertificate.networks[networkId];
			console.log("deployedNetwork" + deployedNetwork);
			const instance = new web3.eth.Contract(
				EmurgoCertificate.abi,
				deployedNetwork && deployedNetwork.address
			);
			const addedCertTypes = await instance.getPastEvents(
				"certificateTypeAddedOrModified",
				{
					fromBlock: 0,
					toBlock: "latest",
				}
			);
			const addedCerts = await instance.getPastEvents(
				"certificateIssuedOrModified",
				{
					fromBlock: 0,
					toBlock: "latest",
				}
			);
			console.log("instance" + instance);
			this.setState({
				web3,
				accounts,
				contract: instance,
				contractAddress: deployedNetwork.address,
				certificateTypeAddedStream: addedCertTypes,
				certificatesIssuedStream: addedCerts,
			});
			this.findOwners();
		} catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				`Failed to load web3, accounts, or contract. Check console for details.`
			);
			console.error(error);
		}
	};
	handleSubmit = async (event) => {
		event.preventDefault();
		const { accounts, contract } = this.state;
		const form = document.getElementById("certId").value;
		const response = await contract.methods.returnCertificate(form).call();
		console.log(response);
		// Update state with the result.
		this.setState({
			nameOfCertificate: response.name,
			nameOfLearner: response.learnerName,
			description: response.description,
			skills: response.skills,
			projects: response.projectsByLearner,
			eligibility: response.earningCriteria,
			issuedBy: response.issuedBy,
			issuedOn: response.issuedOn,
			updatedOn: response.updatedOn,
			contractAddress: response.contractAddress,
		});
	};
	getCertificateDetails = async (value) => {
		const { accounts, contract } = this.state;
		const form = value;
		const response = await contract.methods.returnCertificate(form).call();
		// Update state with the result.
		this.setState({
			nameOfCertificate: response.name,
			nameOfLearner: response.learnerName,
			description: response.description,
			skills: response.skills,
			projects: response.projectsByLearner,
			eligibility: response.earningCriteria,
			issuedBy: response.issuedBy,
			issuedOn: response.issuedOn,
			updatedOn: response.updatedOn,
			contractAddress: response.contractAddress,
		});
	};
	addCertificateType = async (event) => {
		event.preventDefault();
		const { accounts, contract } = this.state;
		const certTypeId = document.getElementById("certTypeAddId").value;
		const certTypeAddName = document.getElementById("certTypeAddName").value;
		const certTypeAddDescription = document.getElementById(
			"certTypeAddDescription"
		).value;
		const certTypeAddSkills = this.state.skillsToAdd;
		const certTypeAddCriteria = this.state.criteriaToAdd;
		try {
			await contract.methods
				.addCertificateType(
					certTypeId,
					certTypeAddName,
					certTypeAddDescription,
					certTypeAddSkills,
					certTypeAddCriteria
				)
				.send({ from: accounts[0] });
		} catch (err) {
			// catches errors both in fetch and response.json
			alert(err);
			return false;
		}
		const addedCertTypes = await contract.getPastEvents(
			"certificateTypeAddedOrModified",
			{
				fromBlock: 0,
				toBlock: "latest",
			}
		);

		// addedCertTypes.map(event => event.returnValues)

		document.getElementById("certiticateAddForm").reset();
		this.setState({
			skillsToAdd: [],
			criteriaToAdd: [],
			certificateTypeAddedStream: addedCertTypes,
			certificateTypeLatest:
				addedCertTypes[addedCertTypes.length - 1].returnValues,
			showModal: true,
			modalType: "certTypeAdded",
		});
	};

	issueCertificate = async (event) => {
		event.preventDefault();
		const { accounts, contract } = this.state;
		const certificateIssueId = document.getElementById("certificateIssueId")
			.value;
		const certificateIssueTypeId = document.getElementById(
			"certificateIssueTypeId"
		).value;
		const certificateIssueByName = document.getElementById(
			"certificateIssueByName"
		).value;
		const certificateIssueLearnerName = document.getElementById(
			"certificateIssueLearnerName"
		).value;
		const certificateIssueDate = new Intl.DateTimeFormat("en-IN", {
			year: "numeric",
			month: "long",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		}).format(Date.now());
		try {
			await contract.methods
				.issueCertificate(
					certificateIssueId,
					certificateIssueTypeId,
					certificateIssueByName,
					certificateIssueLearnerName,
					certificateIssueDate
				)
				.send({ from: accounts[0] });
		} catch (err) {
			// catches errors both in fetch and response.json
			alert(err);
			return false;
		}
		const addedCerts = await contract.getPastEvents(
			"certificateIssuedOrModified",
			{
				fromBlock: 0,
				toBlock: "latest",
			}
		);
		// addedCertTypes.map(event => event.returnValues)
		this.setState({
			certificatesIssuedStream: addedCerts,
			certificateTypeLatest: addedCerts[addedCerts.length - 1].returnValues,
			showModal: true,
			modalType: "certIssued",
		});

		document.getElementById("certiticateIssueForm").reset();
	};
	addProjectToCertificate = async (event) => {
		event.preventDefault();
		const { accounts, contract } = this.state;
		const projectAddCertId = document.getElementById("projectAddCertId").value;
		const projectAddCertTechnology = document.getElementById(
			"projectAddTechnology"
		).value;
		const projectAddTitle = document.getElementById("projectAddTitle").value;
		const projectAddDescription = document.getElementById(
			"projectAddDescription"
		).value;
		const projectAddURL = document.getElementById("projectAddURL").value;
		const certificateUpdateDate = new Intl.DateTimeFormat("en-IN", {
			year: "numeric",
			month: "long",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		}).format(Date.now());

		try {
			await contract.methods
				.addProjectToCertificate(
					projectAddCertId,
					projectAddTitle,
					projectAddDescription,
					projectAddURL,
					projectAddCertTechnology,
					certificateUpdateDate
				)
				.send({ from: accounts[0] });
		} catch (err) {
			// catches errors both in fetch and response.json
			console.log(err.message);
			// alert(err);
			return false;
		}
		const projectAdded = await contract.getPastEvents(
			"projectAddedtoCertificate",
			{
				fromBlock: 0,
				toBlock: "latest",
			}
		);
		this.setState({
			certificateTypeLatest: projectAdded[projectAdded.length - 1].returnValues,
			showModal: true,
			modalType: "projectAdded",
		});
		document.getElementById("projectAddForm").reset();
	};
	displayCertTypeDetails = async (value) => {
		document.getElementById("certTypeAddId").value = value.Id;
		document.getElementById("certTypeAddName").value = value.name;
		document.getElementById("certTypeAddDescription").value = value.description;
	};
	findOwners = async () => {
		const { contract, web3, accounts } = this.state;
		// const accounts = await web3.eth.getAccounts();
		this.setState({ accounts });
		const isOwner = await contract.methods.owner().call();
		const isManager = await contract.methods.managers(accounts[0]).call();
		console.log(accounts[0], isManager);
		if (accounts[0] == isOwner) {
			this.setState({
				isOwner: true,
				isManager,
			});
		} else {
			this.setState({
				isOwner: false,
				isManager,
			});
		}
	};
	changeOwner = async (event) => {
		event.preventDefault();
		const web3 = this.state.web3;
		const accounts = await web3.eth.getAccounts();
		this.setState({ accounts });
		const { contract } = this.state;
		const form = document.getElementById("newOwner").value;
		await contract.methods.changeOwner(form).send({ from: accounts[0] });
		this.findOwners();
	};
	removeManager = async (event) => {
		event.preventDefault();
		const { accounts, contract } = this.state;
		const form = document.getElementById("removeManagerAddress").value;
		await contract.methods.removeManager(form).send({ from: accounts[0] });
		this.findOwners();
	};
	addManager = async (event) => {
		event.preventDefault();
		const web3 = this.state.web3;
		const accounts = await web3.eth.getAccounts();
		this.setState({ accounts });
		const { contract } = this.state;
		const form = document.getElementById("addManagerAddress").value;
		await contract.methods.addManager(form).send({ from: accounts[0] });
		this.findOwners();
	};

	onSKillAdd = (event) => {
		// event.preventDefault();
		var skill = document.getElementById("skillAdd").value;
		// console.log("1" + skill.value);
		if (event.keyCode === 13) {
			document.getElementById("skillAdd").value = "";
			this.setState({
				skillsToAdd: [...this.state.skillsToAdd, skill],
			});
		}
	};
	onCriteriaAdd = (event) => {
		// event.preventDefault();
		var criteria = document.getElementById("criteriaAdd").value;
		// console.log("1" + skill.value);
		if (event.keyCode === 13) {
			document.getElementById("criteriaAdd").value = "";
			this.setState({
				criteriaToAdd: [...this.state.criteriaToAdd, criteria],
			});
		}
	};
	handleCloseModal = () => {
		// event.preventDefault();
		this.setState({
			showModal: false,
		});
	};

	render() {
		if (!this.state.web3) {
			return <div>Loading Web3, accounts, and contract...</div>;
		}

		return (
			<div>
				<Navbar bg="dark" variant="dark">
					<Navbar.Brand href="#home">Emurgo</Navbar.Brand>
					<Nav className="mr-auto">
						<Nav.Link href="https://www.emurgo.in">Home</Nav.Link>
					</Nav>
				</Navbar>
				<Container className="container">
					<h1 className="centerAlign">Emurgo Certificate Verification</h1>
					<br></br>
					<Form onSubmit={this.handleSubmit}>
						<Form.Row className="centerAlign">
							<Col>
								<Form.Control
									size="lg"
									type="text"
									placeholder="Enter Certificate Id"
									id="certId"
									sm={10}
								/>
							</Col>
						</Form.Row>
						<br></br>
						<div className="centerAlign">
							<Button variant="primary" size="lg" type="submit">
								Verify
							</Button>
						</div>
					</Form>
					{this.state.nameOfLearner != "" ? (
						<React.Fragment>
							<br></br>
							<Row>
								<Col sm={4}>
									{this.state.nameOfCertificate.includes("Full Stack") ? (
										<img
											src="https://images.youracclaim.com/size/680x680/images/d578a11b-dd59-419b-817f-823068167a1f/Emurgo%2BStamp-02.png"
											width="340px"
										></img>
									) : (
										<img
											src="https://images.youracclaim.com/size/680x680/images/3111f942-45f5-41b4-a187-16830bbc0696/Stamp_IL_-_2_PNG.png"
											width="340px"
										></img>
									)}
								</Col>
								<Col sm={8} className="centerAlign">
									<h1>{this.state.nameOfCertificate}</h1>
								</Col>
							</Row>

							<div style={{ clear: "left" }} />

							<Table responsive>
								<tbody>
									<tr>
										<td className="rightAlign">
											Contract Address in Ethereum:
										</td>
										<td>
											<a
												href={
													"https://rinkeby.etherscan.io/address/" +
													this.state.contractAddress
												}
												target="_blank"
											>
												{this.state.contractAddress}
											</a>
										</td>
									</tr>
									<tr>
										<td className="rightAlign">Name of the Learner:</td>
										<td>{this.state.nameOfLearner}</td>
									</tr>
									<tr>
										<td className="rightAlign">Issued By:</td>
										<td>
											<a href="https://www.emurgo.in" target="_blank">
												{this.state.issuedBy}
											</a>
										</td>
									</tr>
									<tr>
										<td className="rightAlign">Issued On:</td>
										<td>{this.state.issuedOn}</td>
									</tr>
									<tr>
										<td className="rightAlign">Updated On:</td>
										<td>{this.state.updatedOn}</td>
									</tr>
									<tr>
										<td className="rightAlign">Certificate Description:</td>
										<td>{this.state.description}</td>
									</tr>
									<tr>
										<td className="rightAlign">
											<ListGroup variant="flush">Skills:</ListGroup>
										</td>
										<td>
											<h5>
												{this.state.skills.map((skill) => (
													<React.Fragment>
														<Badge pill variant="primary">
															{skill}
														</Badge>
														<t> </t>
													</React.Fragment>
												))}
											</h5>
										</td>
									</tr>
									<tr>
										<td className="rightAlign">
											<ListGroup variant="flush">
												Eligibility Criteria:
											</ListGroup>
										</td>
										<td>
											<ListGroup variant="flush">
												{this.state.eligibility.map((el) => (
													<React.Fragment>
														<ListGroup.Item>
															- {el}
															<br></br>
														</ListGroup.Item>
													</React.Fragment>
												))}
											</ListGroup>
										</td>
									</tr>
									<tr>
										<td className="rightAlign">Projects:</td>
										<td>
											<ListGroup variant="flush">
												{this.state.projects.map(
													(p) => (
														// p.map((project) => (
														<React.Fragment>
															<ListGroup.Item>
																<h4>
																	<u>{p.technology}</u>
																</h4>
																<b>Title:</b> {p.title}
																<br></br>
																<b>Description:</b> {p.description}
																<br></br>
																<b>URL:</b>{" "}
																<a href={p.url} target="_blank">
																	{p.url}
																</a>
															</ListGroup.Item>
														</React.Fragment>
													)
													// ))
												)}
											</ListGroup>
										</td>
									</tr>
								</tbody>
							</Table>
							<div style={{ textAlign: "center" }}>
								<Button
									variant="outline-success"
									href="https://emurgo.in/course-outline"
									target="_blank"
								>
									Know more about the course
								</Button>
							</div>
							<br></br>
							<br></br>
						</React.Fragment>
					) : (
						<Row>
							<Col sm={4}>
								<img
									src="https://static2.clutch.co/s3fs-public/logos/8ef64ef1c4e433a508c5ec7d3055974b.jpeg?u4WtNsyaFv2gtX.kizGZd66iHuL_iNHS"
									width="340px"
								></img>
							</Col>
							<Col sm={8} className="centerAlign">
								<h1>
									Please enter a valid certificate ID above to get details of
									certificate
								</h1>
							</Col>
						</Row>
					)}
					{this.state.isOwner ? (
						<React.Fragment>
							<h1 className="centerAlign">Owner Console</h1>
							<br></br>
							<Form onSubmit={this.addManager}>
								<Form.Row className="centerAlign">
									<Col>
										<Form.Control
											size="lg"
											type="text"
											placeholder="Enter new manager address"
											id="addManagerAddress"
											sm={10}
										/>
									</Col>
								</Form.Row>
								<div>
									<Button variant="primary" size="lg" type="submit">
										Add Manager
									</Button>
								</div>
							</Form>
							<br></br>
							<Form onSubmit={this.removeManager}>
								<Form.Row className="centerAlign">
									<Col>
										<Form.Control
											size="lg"
											type="text"
											placeholder="Enter manager address to remove"
											id="removeManagerAddress"
											sm={10}
										/>
									</Col>
								</Form.Row>
								<div>
									<Button variant="danger" size="lg" type="submit">
										Remove Manager
									</Button>
								</div>
							</Form>
							<br></br>
							<Form onSubmit={this.changeOwner}>
								<Form.Row className="centerAlign">
									<Col>
										<Form.Control
											size="lg"
											type="text"
											placeholder="Enter new owner address to change"
											id="newOwner"
											sm={10}
										/>
									</Col>
								</Form.Row>
								<div>
									<Button variant="danger" size="lg" type="submit">
										Change Owner
									</Button>
								</div>
							</Form>
							<br></br>
						</React.Fragment>
					) : (
						""
					)}
					{this.state.isManager || this.state.isOwner ? (
						<React.Fragment>
							<h1 className="centerAlign">Manager Console</h1>
							<br></br>
							<Tabs
								defaultActiveKey="issueCertificate"
								id="uncontrolled-tab-example"
							>
								<Tab eventKey="issueCertificate" title="Issue Certificate">
									<Form id="certiticateIssueForm">
										<Form.Group>
											<Form.Label>Certificate Id</Form.Label>
											<Form.Control
												type="text"
												placeholder="Add Id"
												id="certificateIssueId"
											/>
										</Form.Group>
										<Form.Group>
											<Form.Label>Certificate Type Id</Form.Label>
											<Form.Control
												type="text"
												placeholder="Add Name"
												id="certificateIssueTypeId"
											/>
										</Form.Group>
										<Form.Group>
											<Form.Label>Issued By</Form.Label>
											<Form.Control
												type="text"
												placeholder="Issuing Institution"
												id="certificateIssueByName"
											/>
										</Form.Group>
										<Form.Group>
											<Form.Label>Issued To</Form.Label>
											<Form.Control
												type="text"
												placeholder="Name of learner"
												id="certificateIssueLearnerName"
											/>
										</Form.Group>

										<div>
											<Button
												variant="primary"
												size="lg"
												onClick={this.issueCertificate}
											>
												Issue Certificate
											</Button>
										</div>
										<br></br>
									</Form>
									<h1>Issued Certificates</h1>
									<ListGroup>
										{this.state.certificatesIssuedStream.map((certs) => (
											<React.Fragment>
												<ListGroup.Item
													onClick={() =>
														this.getCertificateDetails(certs.returnValues.Id)
													}
												>
													{certs.returnValues.Id} -{" "}
													{certs.returnValues.issuedTo} -{" "}
													{certs.returnValues.certificateTypeId}
												</ListGroup.Item>
											</React.Fragment>
										))}
									</ListGroup>
									<br></br>
								</Tab>

								<Tab
									eventKey="addProjectToCertificate"
									title="Add Project to Certificate"
								>
									<Form id="projectAddForm">
										<Form.Group>
											<Form.Label>Certificate Id</Form.Label>
											<Form.Control
												type="text"
												placeholder="Choose Id"
												id="projectAddCertId"
											/>
										</Form.Group>
										<Form.Group>
											<Form.Label>Technology</Form.Label>
											<Form.Control
												type="text"
												placeholder="Choose Technology"
												id="projectAddTechnology"
											/>
										</Form.Group>
										<Form.Group>
											<Form.Label>Project Title</Form.Label>
											<Form.Control
												type="text"
												placeholder="Add Project title"
												id="projectAddTitle"
											/>
										</Form.Group>
										<Form.Group>
											<Form.Label>Description</Form.Label>
											<Form.Control
												as="textarea"
												rows="4"
												id="projectAddDescription"
											/>
										</Form.Group>
										<Form.Group>
											<Form.Label>Project URL</Form.Label>
											<Form.Control
												type="text"
												placeholder="github"
												id="projectAddURL"
											/>
										</Form.Group>

										<div>
											<Button
												variant="primary"
												size="lg"
												onClick={this.addProjectToCertificate}
											>
												Add Project to Certificate
											</Button>
										</div>
										<br></br>
									</Form>
								</Tab>
								<Tab eventKey="addCertificateType" title="Add Certificate Type">
									<Form id="certiticateAddForm">
										<Form.Group>
											<Form.Label>Certificate Type Id</Form.Label>
											<Form.Control
												id="certTypeAddId"
												type="text"
												placeholder="Add Id"
											/>
										</Form.Group>
										<Form.Group>
											<Form.Label>Certificate Type Name</Form.Label>
											<Form.Control
												id="certTypeAddName"
												type="text"
												placeholder="Add Name"
											/>
										</Form.Group>

										<Form.Group>
											<Form.Label>Description</Form.Label>
											<Form.Control
												id="certTypeAddDescription"
												as="textarea"
												rows="4"
											/>
										</Form.Group>
										<Form.Group>
											<Form.Label>Skills</Form.Label>
											<Form.Control
												type="text"
												id="skillAdd"
												placeholder="Add Skills one by one - press enter"
												onKeyDown={this.onSKillAdd}
											/>
										</Form.Group>
										<h5>
											{this.state.skillsToAdd.map((skill) => (
												<React.Fragment>
													<Badge pill variant="primary">
														{skill}
													</Badge>
													<t> </t>
												</React.Fragment>
											))}
										</h5>
										<Form.Group>
											<Form.Label>Earning Criteria</Form.Label>
											<Form.Control
												type="text"
												id="criteriaAdd"
												onKeyDown={this.onCriteriaAdd}
												placeholder="Add Criteria one by one - press enter"
											/>
										</Form.Group>
										<h5>
											{this.state.criteriaToAdd.map((criteria) => (
												<React.Fragment>
													<Badge pill variant="success">
														{criteria}
													</Badge>
													<t> </t>
												</React.Fragment>
											))}
										</h5>
										<div>
											<Button
												variant="primary"
												size="lg"
												onClick={this.addCertificateType}
											>
												Add Certificate Type
											</Button>
										</div>
										<br></br>
									</Form>
									<h1>Exisiting Certificate Types</h1>
									<ListGroup>
										{this.state.certificateTypeAddedStream.map((certType) => (
											<React.Fragment>
												<ListGroup.Item
													onClick={() =>
														this.displayCertTypeDetails(certType.returnValues)
													}
												>
													{certType.returnValues.Id} -{" "}
													{certType.returnValues.name}
												</ListGroup.Item>
											</React.Fragment>
										))}
									</ListGroup>
									<br></br>
								</Tab>
							</Tabs>
						</React.Fragment>
					) : (
						""
					)}
					<Modal
						show={this.state.showModal}
						onHide={this.handleCloseModal}
						size="lg"
						aria-labelledby="contained-modal-title-vcenter"
						centered
					>
						<Modal.Header closeButton>
							<Modal.Title style={{ color: "green" }}>
								{this.state.certificateTypeLatest.Id} created
							</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							{this.state.modalType == "certTypeAdded" ? (
								<React.Fragment>
									<b>Name:</b> {this.state.certificateTypeLatest.name}
									<br></br>
									<b>Description:</b>{" "}
									{this.state.certificateTypeLatest.description}
								</React.Fragment>
							) : (
								""
							)}
							{this.state.modalType == "certIssued" ? (
								<React.Fragment>
									<b>Name:</b> {this.state.certificateTypeLatest.issuedTo}
									<br></br>
									<b>Certificate Type:</b>{" "}
									{this.state.certificateTypeLatest.certificateTypeId}
								</React.Fragment>
							) : (
								""
							)}
							{this.state.modalType == "projectAdded" ? (
								<React.Fragment>
									<b>Project Added to Certificate</b>
									<br></br>
									<b>Certificate Id:</b>{" "}
									{this.state.certificateTypeLatest.certificateId}
									<br></br>
									<b>Project Name:</b>{" "}
									{this.state.certificateTypeLatest.projectName}
									<br></br>
									<b>Learner Name:</b>{" "}
									{this.state.certificateTypeLatest.learnerName}
								</React.Fragment>
							) : (
								""
							)}
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={this.handleCloseModal}>
								Close
							</Button>
						</Modal.Footer>
					</Modal>
				</Container>
			</div>
		);
	}
}

export default App;
