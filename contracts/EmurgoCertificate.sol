pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;

contract EmurgoCertificate {
    //owner
    address public owner;
    //managers
    mapping(address=>bool) public managers;
    //certificate type
    struct certificateClassification {
        string name;
        string description;
        string[] skills;
        string[] earningCriteria;
        bool isActive;
    }
    mapping(string=>certificateClassification) public certificateType;
    //project struct
    struct project {
        string title;
        string technology;
        string description;
        string url;
    }
    //certificate details
    struct learnerCertificate {
        string issuedBy;
        string issuedTo;
        string issuedOn;
        string updatedOn;
        string certificateTypeId;
        bool isActive;
        project[] projectsByLearner;
    }
    //certificate id to certificate mapping
    mapping(string=>learnerCertificate) public certificatesIssued;
    //events
    event certificateTypeAddedOrModified(string Id,string name,string description);
    event certificateIssuedOrModified(string Id,string certificateTypeId,string issuedTo);
    event projectAddedtoCertificate(string certificateId,string projectName,string learnerName);
    //constructor
    constructor() public {
        owner = msg.sender;
    }
    //modifiers
    modifier onlyOwner() {
        require(msg.sender==owner);
        _;
    }
    modifier onlyOwnerOrManager() {
        require(managers[msg.sender] || msg.sender==owner);
        _;
    }
    //f-add manager
    function addManager(address _manager) public onlyOwner {
        managers[_manager]=true;
    }
    //f-remove manager
    function removeManager(address _manager) public onlyOwner {
        managers[_manager]=false;
    }
    //f-change owner
    function changeOwner(address _newOwner) public onlyOwner {
        owner=_newOwner;
    }
    //f-add certificate type
    function addCertificateType(string memory certTypeId, string memory _name, string memory _description, string[] memory _skills,string[] memory _earningCriteria) public onlyOwnerOrManager {
        certificateClassification memory tempCert;
        tempCert.name=_name;
        tempCert.description=_description;
        tempCert.skills=_skills;
        tempCert.earningCriteria=_earningCriteria;
        tempCert.isActive=true;
        certificateType[certTypeId] = tempCert;
        emit certificateTypeAddedOrModified(certTypeId,_name,_description);
    }
    //f-add certificate
    function issueCertificate(string memory certId,string memory certTypeId, string memory _issuedBy, string memory _issuedTo, string memory _issuedOn) public onlyOwnerOrManager {
        require(certificateType[certTypeId].isActive,'Certificate type does not exist');
        certificatesIssued[certId].issuedTo=_issuedTo;
        certificatesIssued[certId].issuedBy=_issuedBy;
        certificatesIssued[certId].certificateTypeId=certTypeId;
        
        if(certificatesIssued[certId].isActive){
        certificatesIssued[certId].updatedOn=_issuedOn;
        }
        else{
            certificatesIssued[certId].isActive=true;
            certificatesIssued[certId].issuedOn=_issuedOn;
        certificatesIssued[certId].updatedOn=_issuedOn;
        }
        //add event
        emit certificateIssuedOrModified(certId,certTypeId,_issuedTo);
    }
    //projects,updated on
    //update projects in certificate
    function addProjectToCertificate(string memory certId, string memory _title, string memory _description, string memory _url,string memory _technology,string memory _updatedOn) public onlyOwnerOrManager {
        project memory tempProject;
        tempProject.title=_title;
        tempProject.description=_description;
        tempProject.url=_url;
        tempProject.technology=_technology;
        certificatesIssued[certId].updatedOn=_updatedOn;
        require(certificatesIssued[certId].isActive,'Certificate does not exist');
        certificatesIssued[certId].projectsByLearner.push(tempProject);
        //add event
        emit projectAddedtoCertificate(certId,_title,certificatesIssued[certId].issuedTo);
    }
    function returnCertificate(string memory certId) public view returns(string memory learnerName, string memory name,string memory description,string[] memory skills,string[] memory earningCriteria,address contractAddress,project[] memory projectsByLearner,string memory issuedBy, string memory issuedOn,string memory updatedOn) {
        learnerCertificate memory tempCert=certificatesIssued[certId];
        learnerName = tempCert.issuedTo;
        issuedBy = tempCert.issuedBy;
        issuedOn = tempCert.issuedOn;
        updatedOn = tempCert.updatedOn;
        certificateClassification memory tempType=certificateType[tempCert.certificateTypeId];
        name = tempType.name;
        description=tempType.description;
        skills=tempType.skills;
        earningCriteria=tempType.earningCriteria;
        contractAddress=address(this);
        projectsByLearner=tempCert.projectsByLearner;
    }
}