pragma solidity ^0.5.8;


contract PriceOracle {
    mapping(address => uint) public prices;
    
    
    constructor () public {}
    
    
    function getUnderlyingPrice(address cToken) external view returns (uint){
        return prices[cToken];
    }
    
    function setUnderlyingPrice(address cToken, uint price) external {
        prices[cToken] = price;
    }
}