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
    
    struct Request {
        address tokenRequested;
        uint256 blockNumberAtRequest;
    }
   
    bytes32 private immutable providerId;
    bytes32 private immutable endpointId;
    uint256 private immutable requiesterInd;
    address private immutable designatedWallet;
    uint256 private immutable blockBuffer;
    OracleClient private coinGecko;
    address public immutable ethAddress = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address public immutable uniswapAddress = 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984;
    bytes32 uniswapBytes = bytes32("uniswap");
    bytes32 ethBytes = bytes32("ethereum");
    bytes32 coinIdBytes = bytes32("coinId");
    bytes32 paramBytes = bytes32("1b");
    mapping(address => string) public coinIds;
    mapping(address => uint256) public validPrices;
    mapping(address => int256) public prices;
    mapping(bytes32 => Request) public requests;
    
    
    constructor(address clientAddress, _blockBuffer, _designatedWallet, _requesterInd, _endpoointId, _providerId) public payable {
        coinGecko = OracleClient(clientAddress);
        blockBuffer = _blockBuffer;
        designatedWallet = _designatedWallet;
        requiesterInd = _requesterInd;
        endpointId = _endpointId;
        providerId = _providerId;
    }
    
    function requestEthOraclePriceFulfillment() public {
        bytes memory parameters = abi.encode(
        paramBytes,
        coinIdBytes, 
        ethBytes
        );
        bytes32 requestId = coinGecko.makeRequest(providerId, endpointId, requiesterInd, designatedWallet, parameters);
        Request memory newRequest = Request(ethAddress, block.number);
        requests[requestId] = newRequest;
    }
    
    function requestUniswapOraclePriceFulfillment() public {
        bytes memory parameters = abi.encode(
        paramBytes,
        coinIdBytes, 
        uniswapBytes
        );
        bytes32 requestId = coinGecko.makeRequest(providerId, endpointId, requiesterInd, designatedWallet, parameters);
        Request memory newRequest = Request(uniswapAddress, block.number);
        requests[requestId] = newRequest;    
    }
    
   // function requestOraclePriceFulfillment(address tokenAddress) public {
        //string memory coinId = coinIds[tokenAddress];
        //bytes32 id = bytes32(coinId); 
    //    bytes memory parameters = abi.encode(
    //    bytes32("1b"),
    //    bytes32("coinId"), bytes32("ethereum")
     //   );
    //    bytes32 requestId = coinGecko.makeRequest(providerId, endpointId, requiesterInd, designatedWallet, parameters);
    //    requests[requestId] = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;    
   // }
    
    function requestOraclePriceUpdate(bytes32 requestId) public {
        //require(requests[requestId] = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, 'invalid');
        int256 ethPrice = coinGecko.returnValue(requestId);
        prices[requests[requestId].tokenRequested] = ethPrice;
        validPrices[requests[requestId].tokenRequested] = requests[requestId].blockNumberAtRequest;
        
    }
    
    function currentOnChainOraclePrice(address tokenAddress) public view returns (int256){
        return prices[tokenAddress];
    }
    
    function isValidPrice(address tokenAddress) public view returns (bool){
        if (block.number >= validPrices[tokenAddress] + blockBuffer){
            return false;
        }
        else {
            return true;
        }
    }
}