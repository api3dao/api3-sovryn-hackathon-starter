//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface OracleClient{
    function returnValue(bytes32 requestId) external returns (int256);
    function makeRequest(
        bytes32 providerId,
        bytes32 endpointId,
        uint256 requesterInd,
        address designatedWallet,
        bytes calldata parameters
        )
        external 
        returns (bytes32);
    function fulfilledData(bytes32 requestId) external returns (int256);
        
}

contract PriceFeed {
   
    bytes32 public immutable providerId;
    bytes32 public immutable endpointId;
    uint256 public immutable requesterInd;
    address public immutable designatedWallet;
    uint256 public immutable blockBuffer;
    OracleClient public oracle;
    bytes32 public assetBytes;
    bytes32 public nameBytes;
    bytes32 public constant typeBytes = bytes32("1b");
    uint256 public priceBlock;
    int256 public price;
    mapping(bytes32 => uint256) public requests;
    bytes public parameters;
    
    
    constructor(address clientAddress, uint256 _blockBuffer, address _designatedWallet, uint256 _requesterInd, bytes32 _endpointId, bytes32 _providerId, string memory _assetBytes, string memory _nameBytes) public payable {
        oracle = OracleClient(clientAddress);
        blockBuffer = _blockBuffer;
        designatedWallet = _designatedWallet;
        requesterInd = _requesterInd;
        endpointId = _endpointId;
        providerId = _providerId;
        assetBytes = keccak256(abi.encodePacked(_assetBytes));
        nameBytes = keccak256(abi.encodePacked(_nameBytes));
        //parameters = abi.encode(
        //typeBytes,
        //nameBytes, 
        //assetBytes
        //);
    }
    
    function requestOraclePriceFulfillment() public {
        bytes memory parameters = abi.encode(
        typeBytes,
        bytes32("symbol"), 
        bytes32("TSLA")
        );
        bytes32 requestId = oracle.makeRequest(providerId, endpointId, requesterInd, designatedWallet, parameters);
        requests[requestId] = block.number;    
        //emit event with requestId here and block
    }

    function requestOraclePriceUpdate(bytes32 requestId) public {
        require(requests[requestId] >= block.number - blockBuffer, "expired request");
        int256 newPrice = oracle.fulfilledData(requestId);
        // not perfect fulfillment check
        require(newPrice > 0, "unfulfilled request");
        price = newPrice;
        priceBlock = requests[requestId];
        //emit event here with price and block.number
    }
    
    function getOraclePrice() public view returns (int256){
        return price;
    }
    
    function isValidPrice() public view returns (bool){
        //this should use safeMath
        if (block.number >= priceBlock + blockBuffer){
            return false;
        }
        return true;
    }
}