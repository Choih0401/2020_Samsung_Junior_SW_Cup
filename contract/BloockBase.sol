pragma solidity ^0.5.1;
contract BloockBase {
    //every date field is timestamp
    struct BloodCertInfo { 
        uint donateDate;
        uint birth;
        uint gender;
        string name;
        string kind;
        bool used;
    }
    
    BloodCertInfo[] public BloodCerts;
    
    event CertCreated(string _name, uint birth);
    mapping (uint256 => address) public certToOwner;
    mapping (address => uint256) public ownerCertCount;
    
    function bloockUse(uint256 _tokenId) public {
        require(msg.sender == certToOwner[_tokenId]);
        BloodCerts[_tokenId].used = true;
    }
    
    function createCert(uint _donateDate,uint _birth, uint _gender, string memory _name, string memory _kind) public {
        BloodCertInfo memory _newCert = BloodCertInfo(_donateDate,_birth,_gender,_name,_kind,false);
        uint256 id = BloodCerts.push(_newCert) -1;
        certToOwner[id] = msg.sender;
        ownerCertCount[msg.sender]++;
        emit CertCreated(_name,_birth);
    }
    
}
