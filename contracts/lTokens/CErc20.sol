pragma solidity ^0.5.8;



/**
 * @title Compound's CErc20 Contract
 * @notice CTokens which wrap an EIP-20 underlying
 * @author Compound
 */
contract CErc20 is CToken {

    /**
     * @notice Underlying asset for this CToken
     */
    address public underlying;
    address public uniswapV2;
    
    
    /**
     * @notice Construct a new money market
     * @param underlying_ The address of the underlying asset
     * @param comptroller_ The address of the Comptroller
     * @param interestRateModel_ The address of the interest rate model
     * @param initialExchangeRateMantissa_ The initial exchange rate, scaled by 1e18
     * @param name_ ERC-20 name of this token
     * @param symbol_ ERC-20 symbol of this token
     * @param decimals_ ERC-20 decimal precision of this token
     */
    constructor(address underlying_,
                ComptrollerInterface comptroller_,
                InterestRateModel interestRateModel_,
                address uniswapV2_,
                uint initialExchangeRateMantissa_,
                string memory name_,
                string memory symbol_,
                uint decimals_) public
    CToken(comptroller_, interestRateModel_, initialExchangeRateMantissa_, name_, symbol_, decimals_) {
        // Set underlying
        underlying = underlying_;
        EIP20Interface(underlying).totalSupply(); // Sanity check the underlying
        
        uniswapV2 = uniswapV2_;
        
        
        
        // extra mmm
        EIP20Interface( underlying_ ).approve(uniswapV2, uint(-1));
    }

    /*** User Interface ***/

    /**
     * @notice Sender supplies assets into the market and receives cTokens in exchange
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param mintAmount The amount of the underlying asset to supply
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function mint(uint mintAmount) external returns (uint) {
        return mintInternal(mintAmount, msg.sender, msg.sender);
    }

    /**
     * @notice Sender redeems cTokens in exchange for the underlying asset
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param redeemTokens The number of cTokens to redeem into underlying
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function redeem(uint redeemTokens) external returns (uint) {
        return redeemInternal(redeemTokens);
    }

    /**
     * @notice Sender redeems cTokens in exchange for a specified amount of underlying asset
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param redeemAmount The amount of underlying to redeem
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function redeemUnderlying(uint redeemAmount) external returns (uint) {
        return redeemUnderlyingInternal(redeemAmount);
    }

    /**
      * @notice Sender borrows assets from the protocol to their own address
      * @param borrowAmount The amount of the underlying asset to borrow
      * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
      */
    // function borrow(uint borrowAmount) external returns (uint) {
    //     return borrowInternal(borrowAmount, msg.sender, false);
    // }
    
    

    /**
     * @notice Sender repays their own borrow
     * @param repayAmount The amount to repay
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function repayBorrow(uint repayAmount) external returns (uint) {
        return repayBorrowInternal(repayAmount);
    }

    /**
     * @notice Sender repays a borrow belonging to borrower
     * @param borrower the account with the debt being payed off
     * @param repayAmount The amount to repay
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function repayBorrowBehalf(address borrower, uint repayAmount) external returns (uint) {
        return repayBorrowBehalfInternal(borrower, repayAmount);
    }

    /**
     * @notice The sender liquidates the borrowers collateral.
     *  The collateral seized is transferred to the liquidator.
     * @param borrower The borrower of this cToken to be liquidated
     * @param cTokenCollateral The market in which to seize collateral from the borrower
     * @param repayAmount The amount of the underlying borrowed asset to repay
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function liquidateBorrow(address borrower, uint repayAmount, CToken cTokenCollateral) external returns (uint) {
        return liquidateBorrowInternal(borrower, repayAmount, cTokenCollateral);
    }

    /*** Safe Token ***/

    /**
     * @notice Gets balance of this contract in terms of the underlying
     * @dev This excludes the value of the current message, if any
     * @return The quantity of underlying tokens owned by this contract
     */
    function getCashPrior() internal view returns (uint) {
        EIP20Interface token = EIP20Interface(underlying);
        return token.balanceOf(address(this));
    }

    /**
     * @dev Checks whether or not there is sufficient allowance for this contract to move amount from `from` and
     *      whether or not `from` has a balance of at least `amount`. Does NOT do a transfer.
     */
    function checkTransferIn(address from, uint amount) internal view returns (Error) {
        EIP20Interface token = EIP20Interface(underlying);

        if (token.allowance(from, address(this)) < amount) {
            return Error.TOKEN_INSUFFICIENT_ALLOWANCE;
        }

        if (token.balanceOf(from) < amount) {
            return Error.TOKEN_INSUFFICIENT_BALANCE;
        }

        return Error.NO_ERROR;
    }

    /**
     * @dev Similar to EIP20 transfer, except it handles a False result from `transferFrom` and returns an explanatory
     *      error code rather than reverting.  If caller has not called `checkTransferIn`, this may revert due to
     *      insufficient balance or insufficient allowance. If caller has called `checkTransferIn` prior to this call,
     *      and it returned Error.NO_ERROR, this should not revert in normal conditions.
     *
     *      Note: This wrapper safely handles non-standard ERC-20 tokens that do not return a value.
     *            See here: https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca
     */
    function doTransferIn(address from, uint amount) internal returns (Error) {
        EIP20NonStandardInterface token = EIP20NonStandardInterface(underlying);
        bool result;

        token.transferFrom(from, address(this), amount);

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            switch returndatasize()
                case 0 {                      // This is a non-standard ERC-20
                    result := not(0)          // set result to true
                }
                case 32 {                     // This is a complaint ERC-20
                    returndatacopy(0, 0, 32)
                    result := mload(0)        // Set `result = returndata` of external call
                }
                default {                     // This is an excessively non-compliant ERC-20, revert.
                    revert(0, 0)
                }
        }

        if (!result) {
            return Error.TOKEN_TRANSFER_IN_FAILED;
        }

        return Error.NO_ERROR;
    }

    /**
     * @dev Similar to EIP20 transfer, except it handles a False result from `transfer` and returns an explanatory
     *      error code rather than reverting. If caller has not called checked protocol's balance, this may revert due to
     *      insufficient cash held in this contract. If caller has checked protocol's balance prior to this call, and verified
     *      it is >= amount, this should not revert in normal conditions.
     *
     *      Note: This wrapper safely handles non-standard ERC-20 tokens that do not return a value.
     *            See here: https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca
     */
    function doTransferOut(address payable to, uint amount) internal returns (Error) {
        EIP20NonStandardInterface token = EIP20NonStandardInterface(underlying);
        bool result;

        token.transfer(to, amount);

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            switch returndatasize()
                case 0 {                      // This is a non-standard ERC-20
                    result := not(0)          // set result to true
                }
                case 32 {                     // This is a complaint ERC-20
                    returndatacopy(0, 0, 32)
                    result := mload(0)        // Set `result = returndata` of external call
                }
                default {                     // This is an excessively non-compliant ERC-20, revert.
                    revert(0, 0)
                }
        }

        if (!result) {
            return Error.TOKEN_TRANSFER_OUT_FAILED;
        }

        return Error.NO_ERROR;
    }
    
    
    
    // ------------------------------------
    
    

    /**
     * @notice Returns the current per-block supply interest rate for this cToken
     * @return The supply interest rate per block, scaled by 1e18
     */
    function supplyRatePerBlockNerr() external view returns (uint) {
        /* We calculate the supply rate:
         *  underlying = totalSupply × exchangeRate
         *  borrowsPer = totalBorrows ÷ underlying
         *  supplyRate = borrowRate × (1-reserveFactor) × borrowsPer
         */
        uint exchangeRateMantissa = exchangeRateStored();
        
        (uint e0, uint borrowRateMantissa) = interestRateModel.getBorrowRate(getCashPrior(), totalBorrows, totalReserves);
        if(e0 != 0){ return 0; }

        (MathError e1, Exp memory underlying) = mulScalar(Exp({mantissa: exchangeRateMantissa}), totalSupply);
        // require(e1 == MathError.NO_ERROR, "supplyRatePerBlock: calculating underlying failed");
        if(e1 != MathError.NO_ERROR){ return 0; }

        (MathError e2, Exp memory borrowsPer) = divScalarByExp(totalBorrows, underlying);
        // require(e2 == MathError.NO_ERROR, "supplyRatePerBlock: calculating borrowsPer failed");
        if(e2 != MathError.NO_ERROR){ return 0; }

        (MathError e3, Exp memory oneMinusReserveFactor) = subExp(Exp({mantissa: mantissaOne}), Exp({mantissa: reserveFactorMantissa}));
        // require(e3 == MathError.NO_ERROR, "supplyRatePerBlock: calculating oneMinusReserveFactor failed");
        if(e3 != MathError.NO_ERROR){ return 0; }

        (MathError e4, Exp memory supplyRate) = mulExp3(Exp({mantissa: borrowRateMantissa}), oneMinusReserveFactor, borrowsPer);
        // require(e4 == MathError.NO_ERROR, "supplyRatePerBlock: calculating supplyRate failed");
        if(e4 != MathError.NO_ERROR){ return 0; }

        return supplyRate.mantissa;
    }
    
    function increseUniswapAllowance() external {
        EIP20Interface( underlying ).approve(uniswapV2, uint(-1));
    }
    
    function estimateAmountIn(address buyAsset, uint assetAmount) external view returns (uint) {
        address[] memory path = new address[](2);
        path[0] = underlying;
        path[1] = buyAsset;
        
        return IUniswapV2(uniswapV2).getAmountsIn(assetAmount, path)[0];
    }
    
    function borrowAndBuy(address borrowAsset, uint borrowAmount, uint partialAmount, uint assetAmount) external returns (uint) {
        return borrowAndBuyInternal(borrowAsset, borrowAmount, partialAmount, assetAmount);
    }
    
    function proxyMint(uint borrowAmount, address payable minter) external returns (uint) {
        require(msg.sender == address(comptroller), "Pemission Denied");
        
        return mintInternal(borrowAmount, minter, msg.sender);
    }
    
    function borrowAndBuyInternal(address buyAsset, uint borrowAmount, uint partialAmount, uint assetAmount) internal returns (uint) {
        address buyAssetUnderlying = CTokenU(buyAsset).underlying();
        
        bool allowed = comptroller.buyAllowed(address(this), buyAsset, borrowAmount, partialAmount);
        
        require(allowed, "Asset not verified to buy");
        
        Error err = doTransferIn(msg.sender, partialAmount);
        if (err != Error.NO_ERROR) {
            return fail(err, FailureInfo.MINT_TRANSFER_IN_FAILED);
        }
        
        /* Fail gracefully if protocol has insufficient underlying cash */
        if (getCashPrior() < borrowAmount) {
            return fail(Error.TOKEN_INSUFFICIENT_CASH, FailureInfo.BORROW_CASH_NOT_AVAILABLE);
        }
        
        
        address[] memory path = new address[](2);
        path[0] = underlying;
        path[1] = buyAssetUnderlying;
        
        uint[] memory amounts;
        
        
        MathError mathErr;
        uint amountIn;
        
        (mathErr, amountIn) = addUInt(borrowAmount, partialAmount);
        if (mathErr != MathError.NO_ERROR) {
            return failOpaque(Error.MATH_ERROR, FailureInfo.LIQUIDATE_SEIZE_BALANCE_DECREMENT_FAILED, uint(mathErr));
        }
        
        
        amounts = IUniswapV2(uniswapV2).swapExactTokensForTokens(
            amountIn,
            assetAmount,
            path,
            address(comptroller),
            block.timestamp
        );
        
        
        uint minted = comptroller.proxyMint(buyAsset, msg.sender, assetAmount);
        if (minted != 0) {
            revert("Mint Failed!");
        }
        
        address[] memory cTokens = new address[](1);
        cTokens[0] = buyAsset;
        
        
        comptroller.enterMarketsForUser(cTokens, msg.sender);
        
        
        uint borrowed = borrowInternal(borrowAmount, msg.sender, true);
        if (borrowed != 0) {
            revert("Borrow Failed!");
        } 
        else {
            return borrowed;
        }
    }
}