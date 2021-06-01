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
        
}

contract PriceFeed {
   
    bytes32 private immutable providerId;
    bytes32 private immutable endpointId;
    uint256 private immutable requesterInd;
    address private immutable designatedWallet;
    uint256 private immutable blockBuffer;
    OracleClient private oracle;
    bytes32 assetBytes;
    bytes32 nameBytes;
    bytes32 paramBytes = bytes32("1b");
    uint256 public priceBlock;
    int256 public price;
    mapping(bytes32 => uint256) public requests;
    bytes memory private immutable parameters;
    
    
    constructor(address clientAddress, uint256 _blockBuffer, address _designatedWallet, uint256 _requesterInd, bytes32 _endpoointId, bytes32 _providerId, bytes32 _assetBytes, bytes32 _nameBytes ) public payable {
        oracle = OracleClient(clientAddress);
        blockBuffer = _blockBuffer;
        designatedWallet = _designatedWallet;
        requesterInd = _requesterInd;
        endpointId = _endpointId;
        providerId = _providerId;
        //do these need to cast
        assetBytes = bytes32(_assetBytes);
        nameBytes = bytes32(_nameBytes);
        parameters = abi.encode(
        paramBytes,
        nameBytes, 
        assetBytes
        );
    }
    
    function requestOraclePriceFulfillment() public {
        bytes32 requestId = oracle.makeRequest(providerId, endpointId, requesterInd, designatedWallet, parameters);
        requests[requestId] = block.number;    
    }
    
    function requestOraclePriceUpdate(bytes32 requestId) public {
        int256 newPrice = oracle.returnValue(requestId);
        price = newPrice;
        priceBlock = requests[requestId];
        
    }
    
    function currentOnChainOraclePrice(address tokenAddress) public view returns (int256){
        return price;
    }
    
    function isValidPrice(address tokenAddress) public view returns (bool){
        if (block.number >= priceBlock] + blockBuffer){
            return false;
        }
        else {
            return true;
        }
    }
}