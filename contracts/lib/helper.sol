pragma solidity ^0.5.8;


interface IERC20 {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);
}



interface CTokenInterface {
    function transfer(address dst, uint amount) external returns (bool);
    function transferFrom(address src, address dst, uint amount) external returns (bool);
    function approve(address spender, uint amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function balanceOfUnderlying(address owner) external returns (uint);
    function getAccountSnapshot(address account) external view returns (uint, uint, uint, uint);
    function borrowRatePerBlock() external view returns (uint);
    function supplyRatePerBlock() external view returns (uint);
    function totalBorrowsCurrent() external returns (uint);
    function borrowBalanceCurrent(address account) external returns (uint);
    function borrowBalanceStored(address account) external view returns (uint);
    function exchangeRateCurrent() external returns (uint);
    function exchangeRateStored() external view returns (uint);
    function getCash() external view returns (uint);
    function accrueInterest() external returns (uint);
    function seize(address liquidator, address borrower, uint seizeTokens) external returns (uint);
    
    function supplyRatePerBlockNerr() external view returns (uint);
}



contract Utils  {
    
    constructor() public {
        
    }
    
    
    function multiAllowanceAndBalance(address[] calldata _tokens, address _address, address[] calldata _for) external view returns (uint[] memory, uint[] memory){
        uint[] memory allowances = new uint[](_tokens.length);
        uint[] memory balances = new uint[](_tokens.length);
        
        for (uint i=0; i<_tokens.length; i++) {
            allowances[i] = IERC20(_tokens[i]).allowance(_address, _for[i]);
            balances[i] = IERC20(_tokens[i]).balanceOf(_address);
        }
        
        return (allowances, balances);
    }
    
    
    function multiGetAccountSnapshot(address[] calldata _tokens, address _address) external  
        returns (
            uint[] memory, 
            uint[] memory, 
            uint[] memory, 
            uint[] memory
        ){
        uint[] memory val1 = new uint[](_tokens.length);
        uint[] memory val2 = new uint[](_tokens.length);
        uint[] memory val3 = new uint[](_tokens.length);
        uint[] memory val4 = new uint[](_tokens.length);
        
        for (uint i=0; i<_tokens.length; i++) {
            val1[i] =  CTokenInterface(_tokens[i]).balanceOfUnderlying(_address);
            val2[i] =  CTokenInterface(_tokens[i]).borrowBalanceCurrent(_address);
            val3[i] =  CTokenInterface(_tokens[i]).supplyRatePerBlockNerr();
            val4[i] =  CTokenInterface(_tokens[i]).borrowRatePerBlock();
        }
        
        return (val1, val2, val3, val4);
    }
}