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
    
    event PriceRequested(
        bytes32 requestId,
        uint256 blockNumber
    );
    
    event PriceUpdated(
        bytes32 requestId,
        uint256 blockNumber,
        int256 newPrice
    );
   
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
    
    constructor(address clientAddress, uint256 _blockBuffer, address _designatedWallet, uint256 _requesterInd, bytes32 _endpointId, bytes32 _providerId) public payable {
        oracle = OracleClient(clientAddress);
        blockBuffer = _blockBuffer;
        designatedWallet = _designatedWallet;
        requesterInd = _requesterInd;
        endpointId = _endpointId;
        providerId = _providerId;
    }
    
    function requestOraclePriceFulfillment() public {
        bytes memory parameters = abi.encode(
        typeBytes,
        bytes32("symbol"), 
        bytes32("TSLA")
        );
        bytes32 requestId = oracle.makeRequest(providerId, endpointId, requesterInd, designatedWallet, parameters);
        uint256 currentBlock = block.number;
        requests[requestId] = currentBlock;
        emit PriceRequested(requestId,currentBlock);
    }

    function requestOraclePriceUpdate(bytes32 requestId) public {
        uint256 currentBlock = block.number;
        require(requests[requestId] >= currentBlock - blockBuffer, "expired request");
        int256 newPrice = oracle.fulfilledData(requestId);
        // this assumes the price did not actually go to zero as a temporary solution
        require(newPrice > 0, "unfulfilled or error response");
        price = newPrice;
        priceBlock = requests[requestId];
        emit PriceUpdated(requestId,currentBlock, price);
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