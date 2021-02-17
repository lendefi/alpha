"use strict";

/**
 * Example JavaScript code that interacts with the page and Web3 wallets
 */

 // Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;


var web3;


/**
 * Setup the orchestra
 */
function init() {

  console.log("Initializing example");
  console.log("WalletConnectProvider is", WalletConnectProvider);
  console.log("Fortmatic is", Fortmatic);
//   console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);
  console.log("window.ethereum is", window.ethereum);

  // Check that the web page is run in a secure context,
  // as otherwise MetaMask won't be available
  if(location.protocol !== 'https:') {
    // https://ethereum.stackexchange.com/a/62217/620
    // const alert = document.querySelector("#alert-error-https");
    // alert.style.display = "block";
    // document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    return;
  }

  // Tell Web3modal what providers we have available.
  // Built-in web browser provider (only one can exist as a time)
  // like MetaMask, Brave or Opera is added automatically by Web3modal
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        // Mikko's test key - don't copy as your mileage may vary
        infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
      }
    }
  };

  web3Modal = new Web3Modal({
    cacheProvider: true, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });

  console.log("Web3Modal instance is", web3Modal);
}



function shortAddress(addr){
    return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
}

function toPrecisin(value, dec){
    if((value.toString()).indexOf(".") > -1){
        var valueA = (value.toString()).split(".");
        
        value = valueA[0]+"."+valueA[1].substring(0, dec);
    }
    return value;
}

function isEmpty(value){
    return (value == null || value.length === 0);
}

function decimal2Fixed(amount, decimals){
    var tDec = new BigNumber("10").exponentiatedBy(new BigNumber(decimals)).toFixed();
    return ((new BigNumber(amount)).multipliedBy(tDec)).toFixed();
}

function fixed2Decimals(amount, decimals){
    var tDec = new BigNumber("10").exponentiatedBy(new BigNumber(decimals)).toFixed();
    return ((new BigNumber(amount)).dividedBy(tDec)).toFixed();
}

function mul(amount1, amount2){
    return ((new BigNumber(amount1)).multipliedBy(new BigNumber(amount2))).toFixed();
}

function div(amount1, amount2){
    return ((new BigNumber(amount1)).dividedBy(new BigNumber(amount2))).toFixed();
}

function mulFixed(amount1, amount2){
    return ((new BigNumber(amount1)).multipliedBy(new BigNumber(amount2))).toFixed(0);
}

function divFixed(amount1, amount2){
    return ((new BigNumber(amount1)).dividedBy(new BigNumber(amount2))).toFixed(0);
}



/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
 
 
async function fetchAccountData() {

    // Get a Web3 instance for the wallet
    web3 = new Web3(provider);
    
    console.log("Web3 instance is", web3);
    
    // Get connected chain id from Ethereum node
    const chainId = await web3.eth.getChainId();
    // Load chain information over an HTTP API
    const chainData = evmChains.getChain(chainId);
    //   document.querySelector("#network-name").textContent = chainData.name;
    
    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();
    
    // MetaMask does not give you all accounts, only the selected account
    console.log("Got accounts", accounts);
    selectedAccount = accounts[0];
    
    
    $("#account").text(shortAddress(selectedAccount));
    
    
    $(".acc-box").css('display', 'inherit');
    $("#connect-wallet").hide();
  
    // if(provider){
    //     web3 = new Web3(provider);
    // }

//   document.querySelector("#selected-account").textContent = selectedAccount;

  // Get a handl
//   const template = document.querySelector("#template-balance");
//   const accountContainer = document.querySelector("#accounts");

  // Purge UI elements any previously loaded accounts
//   accountContainer.innerHTML = '';

  // Go through all accounts and get their ETH balance
//   const rowResolvers = accounts.map(async (address) => {
//     const balance = await web3.eth.getBalance(address);
//     // ethBalance is a BigNumber instance
//     // https://github.com/indutny/bn.js/
//     const ethBalance = web3.utils.fromWei(balance, "ether");
//     const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
//     // Fill in the templated row and put in the document
//     const clone = template.content.cloneNode(true);
//     clone.querySelector(".address").textContent = address;
//     clone.querySelector(".balance").textContent = humanFriendlyBalance;
//     accountContainer.appendChild(clone);
//   });

  // Because rendering account does its own RPC commucation
  // with Ethereum node, we do not want to display any results
  // until data for all accounts is loaded
//   await Promise.all(rowResolvers);

  // Display fully loaded UI for wallet data
//   document.querySelector("#prepare").style.display = "none";
//   document.querySelector("#connected").style.display = "block";
}



/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

  // If any current data is displayed when
  // the user is switching acounts in the wallet
  // immediate hide this data
//   document.querySelector("#connected").style.display = "none";
//   document.querySelector("#prepare").style.display = "block";

  // Disable button while UI is loading.
  // fetchAccountData() will take a while as it communicates
  // with Ethereum node via JSON-RPC and loads chain data
  // over an API call.
//   document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  await fetchAccountData(provider);
//   document.querySelector("#btn-connect").removeAttribute("disabled")
}

/**
 * Connect wallet button pressed.
 */
async function onConnect() {

  console.log("Opening a dialog", web3Modal);
  try {
    provider = await web3Modal.connect();
  } catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }

  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });

  // Subscribe to chainId change
  provider.on("chainChanged", (chainId) => {
    fetchAccountData();
  });

  // Subscribe to networkId change
  provider.on("networkChanged", (networkId) => {
    fetchAccountData();
  });

  await refreshAccountData();
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

  console.log("Killing the wallet connection", provider);
  
  web3Modal.clearCachedProvider();
    
  // TODO: Which providers have close method?
  if(provider.close) {
    await provider.close();

    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavir.
    await web3Modal.clearCachedProvider();
    provider = null;
  }

  selectedAccount = null;
  
  
  $(".acc-box").hide();
  $("#connect-wallet").show();
  
  onConnect();

  // Set the UI back to the initial state
//   document.querySelector("#prepare").style.display = "block";
//   document.querySelector("#connected").style.display = "none";
}


/**
 * Main entry point.
 */
 

window.addEventListener('load', async () => {
    init();
    document.querySelector("#connect-wallet").addEventListener("click", onConnect);
    document.querySelector("#account").addEventListener("click", onDisconnect);

    if (web3Modal.cachedProvider) {
        onConnect();
    } 
    
    $('body').click(function (event){
        if(!$(event.target).closest('.container').length && !$(event.target).is('.container')) {
            $(".modal").hide();
        }     
    });
    
    
    
    
    
    
    
    
    
    // var controllerAddress = "0x20eF52654FE61F8507FdBC51080fe97AC95b53F2";
    
    var libAddress = "0x1B1566d0421f9873cD9B185f010B0B9b0F3dBEd7";
    
    
    var infuraAPI = "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
    
    
    web3 = new Web3(new Web3.providers.HttpProvider(infuraAPI));
    
    
    
    var lendAssets = [
        {
            "name": "USD Coin",
            "symbol": "USDC",
            "address": "0x3E5b0c8aB5b81f2B8009DCe18C96F665E33097Aa",
            "laddress": "0x67DF8a155Fd67f89B1D1c93A0f3488B9659D6452",
            "decimals":18,
            "logo": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
        }
    ];
    
    var lendedAssets = [
        {
            "name": "USD Coin",
            "symbol": "USDC",
            "address": "0x67DF8a155Fd67f89B1D1c93A0f3488B9659D6452",
            "uaddress": "0x3E5b0c8aB5b81f2B8009DCe18C96F665E33097Aa",
            "decimals": 8,
            "logo": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
        },
        {
            "name": "Ethereum",
            "symbol": "ETH",
            "address": "0x7599eBF0Bd8f06E3eb1EC4682E15f76A5db05acB",
            "uaddress": "0xc778417E063141139Fce010982780140Aa0cD5Ab",
            "decimals": 8,
            "logo": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
        }
    ];
    
    var buyAssets = [
        {
            "name": "Ethereum",
            "symbol": "wETH",
            "address": "0xc778417E063141139Fce010982780140Aa0cD5Ab",
            "laddress": "0x7599eBF0Bd8f06E3eb1EC4682E15f76A5db05acB",
            "decimals": 18,
            "logo": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
        },
        {
            "name": "Wrapped BTC",
            "symbol": "wBTC",
            "address": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            "laddress": "0xEa9cdFDD63161217C33414992B5Dc40F08c4F8c4",
            "decimals": 8,
            "logo": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png"
        }
    ];
    
    
    // function assetLogo(address){
    //     return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/"+address+"/logo.png";
    // }
    
    
    
    
    var tokenMeta = {};
    var lTokenMeta = {};
    var BTokenMeta = {};
    var allowance = {};
    var balance = {};
    var lendBalance = {};
    var lendBalanceBase = {};
    
    var borrowBalance = {};
    var borrowBalanceBase = {};
    
    
    var lendAPY = {};
    var borrowAPY = {};
    
    var buyPerc = {};
    
    if(lendedAssets.length){
        lendedAssets.forEach(function(asset){
            if(!lTokenMeta[asset.address]){ lTokenMeta[asset.address] = {}; }
            lTokenMeta[asset.address] = asset;
        });
    }
    
    if(buyAssets.length){
        buyAssets.forEach(function(asset){
            if(!BTokenMeta[asset.laddress]){ BTokenMeta[asset.laddress] = {}; }
            BTokenMeta[asset.laddress] = asset;
        });
    }
    
    
    if(lendAssets.length){
        
        $(".supply-box .assets").html('');
        
        lendAssets.forEach(function(asset){
            
            // $(".supply-box .assets").append(`<a class="asset">
            //     <div class="col-xs-4 col-sm-4 identity">
            //         <span class="icon"><img src="'+ assetLogo(asset.address) +'" style="width: 35px; height: 35px; border-radius: 50%;"></span>
            //         <div class="balance">
            //             <div>'+ asset.name +'</div>
            //             <span class="subtitle mobile-only">2.78%</span>
            //         </div>
            //     </div>
            //     <div class="col-xs-0 col-sm-3 text-right mobile-hide">
            //         <div class="balance"><div>2.78%</div></div>
            //     </div>
            //     <div class="col-xs-4 col-sm-3 text-right">
            //         <div class="balance"><div>0 BAT</div></div>
            //     </div>
            //     <div class="col-xs-4 col-sm-2 text-right">
            //         <div class="mdc-switch">
            //             <div class="mdc-switch__track"></div>
            //             <div class="mdc-switch__thumb-underlay">
            //                 <div class="mdc-switch__thumb">
            //                     <input id="basic-switch" class="mdc-switch__native-control" type="checkbox" role="checkbox">
            //                 </div>
            //             </div>
            //         </div>
            //     </div>
            // </a>`);
            
            var cLogo = asset.logo;
            
            $(".supply-box .assets").append(`<a class="asset _lendAst_${asset.address}">
                <div class="col-xs-4 col-sm-4 identity">
                    <span class="icon"><img src="${cLogo}" style="width: 35px; height: 35px; border-radius: 50%;"></span>
                    <div class="balance">
                        <div>${asset.name}</div>
                        <span class="subtitle mobile-only">2.78%</span>
                    </div>
                </div>
                <div class="col-xs-4 col-sm-3 text-right">
                    <div class="balance"><div class="_bal_${asset.address}"><span class="_amount" data-balance="0">0</span> ${asset.symbol}</div></div>
                </div>
                <div class="col-xs-0 col-sm-3 text-right mobile-hide">
                    <div class="apy">0</div>
                </div>
                <div class="col-xs-4 col-sm-2 text-right">
                    <button class="submit-button button main btn-sml lendAction init" data-contract="${asset.address}" data-lcontract="${asset.laddress}" data-symbol="${asset.symbol}" data-decimals="${asset.decimals}" disabled><i class="fas fa-circle-notch fa-spin fa-fw"></i></button>
                </div>
            </a>`);
            
            
            if(!tokenMeta[asset.address]){ tokenMeta[asset.address] = {}; }
            tokenMeta[asset.address] = asset;
        });
    }
    
    
    
    if(buyAssets.length){
        
        $(".borrow-box .assets").html('');
        
        buyAssets.forEach(function(asset){
            
            var cLogo = asset.logo;
            
            $(".borrow-box .assets").append(`<a class="asset _buyAst_${lendAssets[0].laddress}">
                <div class="col-xs-4 col-sm-4 identity">
                    <span class="icon"><img src="${cLogo}" style="width: 35px; height: 35px; border-radius: 50%;"></span>
                    <div class="balance">
                        <div>${asset.name}</div>
                        <span class="subtitle mobile-only">2.78%</span>
                    </div>
                </div>
                <div class="col-xs-4 col-sm-4 text-right">
                    <div class="apy">0</div>
                </div>
                <div class="col-xs-0 col-sm-4 text-right mobile-hide">
                    <button class="submit-button button main btn-sml buyAction init" data-contract="${asset.address}" data-lcontract="${asset.laddress}" data-symbol="${asset.symbol}" data-decimals="${asset.decimals}">Borrow & Buy</button>
                </div>
            </a>`);
            
            
            if(!tokenMeta[asset.address]){ tokenMeta[asset.address] = {}; }
            tokenMeta[asset.address] = asset;
            
        });
    }
    
    
    
    // -----------------------
    
    
    
    
    
    
    
    function updateLendingBtns(){
        var aTokens = $('.lendAction').map(function() {
            return $(this).data('contract');
        }).get();
        
        
        var lTokensList = Object.keys(lTokenMeta);
        
        aTokens.forEach(function(address){
            if(!$(".lendAction[data-contract='"+address+"']").prop("disabled") || $(".lendAction[data-contract='"+address+"']").hasClass('init')){
                if($(".lendAction[data-contract='"+address+"']").hasClass('init')){
                    $(".lendAction[data-contract='"+address+"']").removeClass('init');
                }
                
                
                $(".lendAction[data-contract='"+address+"']").prop("disabled", false);
                
                if(allowance[address] && allowance[address] != 0){
                    $(".lendAction[data-contract='"+address+"']").text('Lend');
                } 
                else {
                    $(".lendAction[data-contract='"+address+"']").text('Approve');
                }
            }
            
            
            var decimals = $(".lendAction[data-contract='"+address+"']").data('decimals');
            
            if(balance[address] && balance[address] != 0){
                var tmpAmount = fixed2Decimals(balance[address], decimals);
                
                $("._bal_"+address+" ._amount").text( toPrecisin(tmpAmount, 4) );
                $("._bal_"+address+" ._amount").attr('data-balance', tmpAmount);
                
                // console.log("----------------", lendAssets[0].laddress, address, toPrecisin(tmpAmount, 4));
                // if(lendAssets[0].laddress == address){
                //     $(".buy__modal").find("._modal_balance").text( toPrecisin(tmpAmount, 4) );
                //     $(".buy__modal").find(".max").attr('data-val', tmpAmount);
                // }
            } 
            else {
                $("._bal_"+address+" ._amount").text('0');
                $("._bal_"+address+" ._amount").attr('data-balance', '0');
            }
            
            
            
            
            if(lendAPY[address] && lendAPY[address] != 0){
                var tmpApy = toPrecisin(lendAPY[address], 4);
                $("._lendAst_"+address+" .apy").text( tmpApy +"%" );
            } 
            else {
                $("._lendAst_"+address+" .apy").text('0%');
            }
            
            
            
            
            var address = lendAssets[0].laddress;
            if(buyPerc[address] && buyPerc[address] != 0){
                var tmpApy = toPrecisin(buyPerc[address], 4);
                $("._buyAst_"+address+" .apy").text( tmpApy +"%" );
            } 
            else {
                $("._buyAst_"+address+" .apy").text('0%');
            }
        });
        
        
        
        
        
        
        // Object.keys(BTokenMeta).forEach(function(address){
        //     console.log(address, buyPerc, buyPerc[address]);
            
        //     if(buyPerc[address] && buyPerc[address] != 0){
        //         var tmpApy = toPrecisin(buyPerc[address], 4);
        //         $("._buyAst_"+address+" .apy").text( tmpApy +"%" );
        //     } 
        //     else {
        //         $("._buyAst_"+address+" .apy").text('0%');
        //     }
        // });
        
        
        
        
        
        
        lTokensList.forEach(function(address){
            
            
            if(lendBalance[address] && lendBalance[address] != 0){
                
                if($(".supplyed-box .asset--loading").length){
                    $(".supplyed-box .assets").html('');
                }
                
                
                if(!$(".redeemAction[data-contract='"+address+"']").length){
                    
                    var assetMt = lTokenMeta[address];
                    
                    // var tmpAmount = fixed2Decimals(lendBalance[address], assetMt.decimals);
                    var tmpAmount = toPrecisin( lendBalance[address], 18 );
                    
                    var assetMt = lTokenMeta[address];
                    var cLogo = assetMt.logo;
                    
                    $(".supplyed-box .assets").append(`<a class="asset _eld_${assetMt.address}">
                        <div class="col-xs-4 col-sm-4 identity">
                            <span class="icon"><img src="${cLogo}" style="width: 35px; height: 35px; border-radius: 50%;"></span>
                            <div class="balance">
                                <div>${assetMt.name}</div>
                                <span class="subtitle mobile-only">2.78%</span>
                            </div>
                        </div>
                        <div class="col-xs-4 col-sm-6 text-right">
                            <div class="balance"><div class="_bal_${assetMt.address}"><span class="_amount">${tmpAmount}</span> ${assetMt.symbol}</div></div>
                        </div>
                        <div class="col-xs-4 col-sm-2 text-right">
                            <button class="submit-button button main btn-sml redeemAction init" data-contract="${assetMt.address}" data-symbol="${assetMt.symbol}" data-decimals="${assetMt.decimals}">Redeem</button>
                        </div>
                    </a>`);
                    
                    if($(".nildt-supplyed").length){
                        $(".nildt-supplyed").remove();
                    }
                }
            }
            
            
            
            
            
            var decimals = $(".redeemAction[data-contract='"+address+"']").data('decimals');
            
            
                // console.log("sest --- ", lendBalance);
            
            if(lendBalance[address] && lendBalance[address] != 0){
                // var tmpAmount = fixed2Decimals(lendBalance[address], decimals);
                var tmpAmount = lendBalance[address];
                var tmpAmountS = toPrecisin( tmpAmount, 8 );
                
                // console.log("set --- ", tmpAmount, tmpAmountS);
                
                $("._bal_"+address+" ._amount").text( tmpAmountS );
                $("._bal_"+address+" ._amount").attr('data-balance', tmpAmount);
                
                // $(".redeemAction[data-contract='"+address+"']").prop("disabled", false);
                
                
                if(!$(".redeemAction[data-contract='"+address+"']").prop("disabled") || $(".redeemAction[data-contract='"+address+"']").hasClass('init')){
                    if($(".redeemAction[data-contract='"+address+"']").hasClass('init')){
                        $(".redeemAction[data-contract='"+address+"']").removeClass('init');
                    }
                    
                    $(".redeemAction[data-contract='"+address+"']").prop("disabled", false);
                }
                
            } 
            else {
                $("._bal_"+address+" ._amount").text('0');
                $("._bal_"+address+" ._amount").attr('data-balance', '0');
                
                $(".redeemAction[data-contract='"+address+"']").prop("disabled", true);
                
                if($("._eld_"+address).length){
                    $("._eld_"+address).remove();
                    
                    if(!$(".supplyed-box .asset").length){
                        $(".supplyed-box .asset").html('<div class="asset nildt-supplyed">No Lent Token Found</div>');
                    }
                }
            }
            
            
            
            
            
            
            // ---------
            
            
            
            
            
            
            if(borrowBalance[address] && borrowBalance[address] != 0){
                
                if($(".borrowed-box .asset--loading").length){
                    $(".borrowed-box .assets").html('');
                }
                
                
                if(!$(".repayAction[data-contract='"+address+"']").length){
                    
                    var assetMt = lTokenMeta[address];
                    
                    // var tmpAmount = fixed2Decimals(lendBalance[address], assetMt.decimals);
                    var tmpAmount = toPrecisin( borrowBalance[address], 8 );
                    
                    var assetMt = lTokenMeta[address];
                    var cLogo = assetMt.logo;
                    
                    $(".borrowed-box .assets").append(`<a class="asset _emb_${assetMt.address}">
                        <div class="col-xs-4 col-sm-4 identity">
                            <span class="icon"><img src="${cLogo}" style="width: 35px; height: 35px; border-radius: 50%;"></span>
                            <div class="balance">
                                <div>${assetMt.name}</div>
                                <span class="subtitle mobile-only">2.78%</span>
                            </div>
                        </div>
                        <div class="col-xs-4 col-sm-3 text-right">
                            <div class="balance"><div class="_bal_rp_${assetMt.address}"><span class="_amount">${tmpAmount}</span> ${assetMt.symbol}</div></div>
                        </div>
                        <div class="col-xs-0 col-sm-3 text-right mobile-hide">
                            <div class="apy"><div>0</div></div>
                        </div>
                        <div class="col-xs-4 col-sm-2 text-right">
                            <button class="submit-button button main btn-sml repayAction init" data-contract="${assetMt.address}" data-symbol="${assetMt.symbol}" data-decimals="${assetMt.decimals}">Repay</button>
                        </div>
                    </a>`);
                    
                    
                    if($(".nildt-borrowed").length){
                        $(".nildt-borrowed").remove();
                    }
                }
            }
            
            
            
            
            
            var decimals = $(".repayAction[data-contract='"+address+"']").data('decimals');
            
            if(borrowBalance[address] && borrowBalance[address] != 0){
                // var tmpAmount = fixed2Decimals(lendBalance[address], decimals);
                var tmpAmount = borrowBalance[address];
                var tmpAmountS = toPrecisin( tmpAmount, 8 );
                
                $("._bal_rp_"+address+" ._amount").text( tmpAmountS );
                $("._bal_rp_"+address+" ._amount").attr('data-balance', tmpAmount);
                
                
                if(!$(".repayAction[data-contract='"+address+"']").prop("disabled") || $(".repayAction[data-contract='"+address+"']").hasClass('init')){
                    if($(".repayAction[data-contract='"+address+"']").hasClass('init')){
                        $(".repayAction[data-contract='"+address+"']").removeClass('init');
                    }
                    
                    $(".repayAction[data-contract='"+address+"']").prop("disabled", false);
                }
            } 
            else {
                $("._bal_rp_"+address+" ._amount").text('0');
                $("._bal_rp_"+address+" ._amount").attr('data-balance', '0');
                
                $(".repayAction[data-contract='"+address+"']").prop("disabled", true);
                
                
                if($("._emb_"+address).length){
                    $("._emb_"+address).remove();
                    
                    if(!$(".borrowed-box .asset").length){
                        $(".borrowed-box .asset").html('<div class="asset nildt-borrowed">No Borrowed Token Found</div>');
                    }
                }
            }
            
            
            
            
            
            // console.log("borrowAPY", borrowAPY, address);
            if(borrowAPY[address] && borrowAPY[address] != 0){
                var tmpApy = toPrecisin(borrowAPY[address], 4);
                $("._emb_"+address+" .apy").text( tmpApy +"%" );
            } 
            else {
                $("._emb_"+address+" .apy").text('0%');
            }
        });
        
        
        
        if($(".borrowed-box .asset--loading").length){
            $(".borrowed-box .assets").html('<div class="asset nildt-borrowed">No Borrowed Token Found</div>');
        }
        
        if($(".supplyed-box .asset--loading").length){
            $(".supplyed-box .assets").html('<div class="asset nildt-supplyed">No Lent Token Found</div>');
        }
    }
    
    
    
    
    
    function checkBorrowLendStatus(){
        if(selectedAccount){
            
            // var tmpp = new web3.eth.Contract(lTokenABI, "0xD07211cae156891da16F59a7eba9da1d23fe3b5d");
            
            // tmpp.methods.borrowBalanceCurrent(selectedAccount).call((error, result) => {
            //     console.log("borrowBalanceCurrent", error, result);
            // });
            
            
            
            var LIB = new web3.eth.Contract(libABI, libAddress);
            
            var lTokensList = Object.keys(lTokenMeta);
            // var BTokensList = Object.keys(BTokenMeta);
            
            
            // var fullListAddr = $.merge(lTokensList, BTokensList);
            var fullListAddr = lTokensList;
            
            LIB.methods.multiGetAccountSnapshot(fullListAddr, selectedAccount).call((error, result) => {
                // console.log("multiGetAccountSnapshot", lTokensList, selectedAccount, result);
                // console.log("multiGetAccountSnapshot", result, lTokensList);
                
                
                if(isEmpty(error) && result){
                    
                    // var er = result[0];
                    // var cTokenBalance = result[1];
                    // var cborrowBalance = result[2];
                    // var exchangeRateMantissa = result[3];
                    
                    var underlyingBalance = result[0];
                    var borrowBalances = result[1];
                    var supplyRPBlock = result[2];
                    var borrowRPBlock = result[3];
                    var buyPercAll = result[4];
                    
                    
                    
                    if(underlyingBalance.length){
                        underlyingBalance.forEach(function(rs, i){
                            
                            // if( new BigNumber(cTokBal).isGreaterThan(0) ){
                                
                                var lTokenAddress = fullListAddr[i];
                                
                                var decimals = lTokenMeta[lTokenAddress].decimals;
                                
                                var uAddress = lTokenMeta[lTokenAddress].uaddress;
                                var uDecimals = tokenMeta[uAddress].decimals;
                                
                                
                                
                                // console.log("lendingBalanceDecimal", uDecimals, underlyingBalance);
                                
                                var lendingBalance = underlyingBalance[i];
                                var lendingBalanceDecimal = fixed2Decimals(lendingBalance, uDecimals);
                                
                                // console.log("lendingBalanceDecimal", lendingBalance, lendingBalanceDecimal);
                                
                                
                                if(!lendBalanceBase[lTokenAddress]){ lendBalanceBase[lTokenAddress] = 0; }
                                if(!lendBalance[lTokenAddress]){ lendBalance[lTokenAddress] = 0; }
                                
                                lendBalanceBase[lTokenAddress] = lendingBalance;
                                lendBalance[lTokenAddress] = lendingBalanceDecimal;
                                
                                
                                
                                
                                var borrowingBalance = borrowBalances[i];
                                var borrowingBalanceDecimal = fixed2Decimals(borrowingBalance, uDecimals);
                                
                                
                                if(!borrowBalanceBase[lTokenAddress]){ borrowBalanceBase[lTokenAddress] = 0; }
                                if(!borrowBalance[lTokenAddress]){ borrowBalance[lTokenAddress] = 0; }
                                
                                borrowBalanceBase[lTokenAddress] = borrowingBalance;
                                borrowBalance[lTokenAddress] = borrowingBalanceDecimal;
                                
                                
                                
                                
                                // ----------
                                
                                var tmpLendAPY = (((Math.pow(( supplyRPBlock[i] / decimal2Fixed(1, uDecimals) * 5760) + 1, 365))) - 1) * 100;
                                var tmpBorrowAPY = (((Math.pow(( borrowRPBlock[i] / decimal2Fixed(1, uDecimals) * 5760) + 1, 365))) - 1) * 100;
                                
                                if(!lendAPY[uAddress]){ lendAPY[uAddress] = 0; }
                                if(!borrowAPY[lTokenAddress]){ borrowAPY[lTokenAddress] = 0; }
                                
                                lendAPY[uAddress] = tmpLendAPY;
                                borrowAPY[lTokenAddress] = tmpBorrowAPY;
                                
                                
                                
                                // -------
                                
                                if(!buyPerc[lTokenAddress]){ buyPerc[lTokenAddress] = 0; }
                                buyPerc[lTokenAddress] = fixed2Decimals(buyPercAll[i], 16);
                                
                            // }
                            
                        });
                    }
                    
                    updateLendingBtns();
                }
                
                setTimeout(function() { checkBorrowLendStatus(); }, 4000);
            });
        } else {
            setTimeout(function() { checkBorrowLendStatus(); }, 4000);
        }
    }
    checkBorrowLendStatus();
    
    
    
    function checkAllowance(){
        if(selectedAccount){
            var LIB = new web3.eth.Contract(libABI, libAddress);
            
            var aTokens = $('.lendAction').map(function() {
                return $(this).data('contract');
            }).get();
            
            var laTokens = $('.lendAction').map(function() {
                return $(this).data('lcontract');
            }).get();
            
            
            var lTokensList = Object.keys(lTokenMeta);
            
            aTokens = $.merge(aTokens, lTokensList);
            laTokens = $.merge(laTokens, lTokensList);
            
            
            LIB.methods.multiAllowanceAndBalance(aTokens, selectedAccount, laTokens).call((error, result) => {
                // console.log("mAllowance", result);
                
                
                if(isEmpty(error) && result){
                    
                    var mAllowance = result[0];
                    var mBalance = result[1];
                    
                    // console.log("mAllowance1", aTokens, laTokens );
                    // console.log("mAllowance", mAllowance, mBalance );
                    
                    if(mAllowance.length){
                        mAllowance.forEach(function(cAllowance, i){
                            if(lTokensList.indexOf(aTokens[i]) === -1){
                                allowance[aTokens[i]] = cAllowance;
                            }
                        });
                    }
                    
                    if(mBalance.length){
                        mBalance.forEach(function(cBalance, i){
                            balance[aTokens[i]] = cBalance;
                        });
                    }
                    
                    
                    
                    
                    updateLendingBtns();
                }
                
                setTimeout(function() { checkAllowance(); }, 4000);
            });
        } else {
            setTimeout(function() { checkAllowance(); }, 4000);
        }
    }
    
    
    function approveToken(tokenContract, ltokenContract, typ, elm){
        
        
        
        elm.html('<i class="fas fa-circle-notch fa-spin fa-fw"></i>');
        elm.prop('disabled', true);
        
        var ERC20 = new web3.eth.Contract(erc20ABI, tokenContract);
        var maxAllow = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
        
        console.log("approveToken1", tokenContract, ltokenContract);
        ERC20.methods.approve(ltokenContract, maxAllow).send({from: selectedAccount})
        .on('transactionHash', (dData) => {
            console.log(dData); 
            
            checkTxnStatus(dData, typ, elm);
        })
        .on('error', function(error){
            console.log(error);
            
            // _rbtnLoader(".createPool", "");
            // _validateCBoxpool();
            
            btnElem.html('Approve');
            btnElem.prop('disabled', false);
        });
    }
    
    
    
    function lendAction(tokenContract, ltokenContract){
        
        if(allowance[tokenContract] && allowance[tokenContract] != 0){
            
            var cElem = $(".lend__modal");
            
            var tMeta = tokenMeta[tokenContract];
            cElem.find(".title").html('Lend <img src="'+tMeta.logo+'" style="width: 20px; height: 20px; border-radius: 50%; vertical-align: bottom;"> '+tMeta.symbol);
            
            cElem.find(".modelinp").val('');
            
            // cElem.find(".modelinp").attr('data-type', 'lend');
            // cElem.find(".max").attr('data-type', 'lend');
            
            cElem.data('address', tokenContract);
            cElem.css('display', 'flex');
            cElem.find("._modal_balance").text( $("._bal_"+tokenContract).text() );
            
            // cElem.find(".model-action-btn").attr('data-type', 'lend');
            cElem.find(".model-action-btn").html('LEND');
            
            cElem.find(".max").attr('data-val', $("._bal_"+tokenContract+" ._amount").attr('data-balance'));
            
            cElem.find(".modelinp[data-type='lend']").keyup();
            
            // console.log("------ssss", "._bal_"+tokenContract+" ._amount", $("._bal_"+tokenContract+" ._amount").attr('data-balance'));
            
        } 
        
        else {
            var elm = $(".lendAction[data-contract='"+tokenContract+"']");
            
            // elm.html('<i class="fas fa-circle-notch fa-spin fa-fw"></i>');
            // elm.prop('disabled', true);
            
            // var ERC20 = new web3.eth.Contract(erc20ABI, tokenContract);
            // var maxAllow = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
            
            // console.log("tokenContract", tokenContract);
            // ERC20.methods.approve(ltokenContract, maxAllow).send({from: selectedAccount})
            // .on('transactionHash', (dData) => {
            //     console.log(dData); 
                
            //     checkTxnStatus(dData, 'approve', elm);
            // })
            // .on('error', function(error){
            //     console.log(error);
                
            //     // _rbtnLoader(".createPool", "");
            //     // _validateCBoxpool();
                
            //     btnElem.html('Approve');
            //     btnElem.prop('disabled', false);
            // });
            
            
            approveToken(tokenContract, ltokenContract, 'approve', elm);
            
        }
    }
    
    
    $(document).on('click', '.lendAction', function(){
        var tokenContract = $(this).data('contract');
        var ltokenContract = $(this).data('lcontract');
        
        
        if(!$(this).prop('disabled')){
            console.log("lendAction...");
            lendAction(tokenContract, ltokenContract);
        }
    });
    
    
    
    function redeemAction(tokenContract){
        var cElem = $(".redeem__modal");
        
        var tMeta = lTokenMeta[tokenContract];
        cElem.find(".title").html('Redeem <img src="'+tMeta.logo+'" style="width: 20px; height: 20px; border-radius: 50%; vertical-align: bottom;"> '+tMeta.symbol);
        
        
        cElem.find(".modelinp").val('');
        
        // cElem.find(".modelinp").attr('data-type', 'redeem');
        // cElem.find(".max").attr('data-type', 'redeem');
        
        // var availBal = sub($("._bal_"+tokenContract+" ._amount").attr('data-balance'), $("._bal_b_"+tokenContract+" ._amount").attr('data-balance'));
        
        cElem.data('address', tokenContract);
        cElem.css('display', 'flex');
        cElem.find("._modal_balance").text( $("._bal_"+tokenContract).text() );
        
        cElem.find(".model-action-btn").attr('data-type', 'redeem');
        cElem.find(".model-action-btn").html('REDEEM');
        
        cElem.find(".max").attr('data-val', $("._bal_"+tokenContract+" ._amount").attr('data-balance'));
        
        cElem.find(".modelinp[data-type='redeem']").keyup();
    }
    
    
    $(document).on('click', '.redeemAction', function(){
        var tokenContract = $(this).data('contract');
        
        if(!$(this).prop('disabled')){
            console.log("redeemAction...");
            redeemAction(tokenContract);
        }
    });
    
    
    
    function buyAction(tokenContract, ltokenContract){
        // console.log("buyAction", tokenContract);
        
        
        var cElem = $(".buy__modal");
        
        var tMeta = tokenMeta[tokenContract];
        cElem.find(".title").html('Buy <img src="'+tMeta.logo+'" style="width: 20px; height: 20px; border-radius: 50%; vertical-align: bottom;"> '+tMeta.symbol);
        
        cElem.find(".modelinp").val('');
        
        cElem.data('address', tokenContract);
        cElem.data('laddress', ltokenContract);
        cElem.css('display', 'flex');
        // cElem.find("._modal_balance").text( $("._bal_"+lendAssets[0].address).text() );
        
        cElem.find(".model-action-btn").attr('data-type', 'buy');
        cElem.find(".model-action-btn").html('BORROW & BUY');
        
        // cElem.find(".max").attr('data-val', $("._bal_"+lendAssets[0].address+" ._amount").attr('data-balance'));
        
        
        cElem.find(".modelinp[data-type='buy']").keyup();
    }
    
    
    $(document).on('click', '.buyAction', function(){
        var tokenContract = $(this).data('contract');
        var ltokenContract = $(this).data('lcontract');
        
        if(!$(this).prop('disabled')){
            buyAction(tokenContract, ltokenContract);
        }
    });
    
    
    
    
    
    function repayAction(tokenContract, ltokenContract){
        // console.log("buyAction", tokenContract);
        
        var cElem = $(".repay__modal");
        
        var tMeta = lTokenMeta[tokenContract];
        cElem.find(".title").html('Repay <img src="'+tMeta.logo+'" style="width: 20px; height: 20px; border-radius: 50%; vertical-align: bottom;"> '+tMeta.symbol);
        
        
        cElem.find(".modelinp").val('');
        
        cElem.data('address', tokenContract);
        cElem.data('laddress', ltokenContract);
        cElem.css('display', 'flex');
        cElem.find("._modal_balance").text( $("._bal_rp_"+tokenContract).text() );
        
        cElem.find(".model-action-btn").attr('data-type', 'repay');
        cElem.find(".model-action-btn").html('REPAY');
        
        console.log("._bal_rp_"+tokenContract+" ._amount", $("._bal_rp_"+tokenContract+" ._amount").attr('data-balance'));
        
        cElem.find(".max").attr('data-val', $("._bal_rp_"+tokenContract+" ._amount").attr('data-balance'));
        
        cElem.find(".modelinp[data-type='repay']").keyup();
    }
    
    
    $(document).on('click', '.repayAction', function(){
        var tokenContract = $(this).data('contract');
        var ltokenContract = $(this).data('lcontract');
        
        if(!$(this).prop('disabled')){
            repayAction(tokenContract, ltokenContract);
        }
    });
    
    
    
    
    $("body").on("click", ".max", function() {
        var tokenContract = $(".modal").data('address');
        var decimalBalance = $(this).attr('data-val');
        var type = $(this).attr('data-type');
        
        console.log("decimalBalance", $(this), decimalBalance, type);
        
        $(".modelinp[data-type='"+type+"']").val(decimalBalance).keyup();
        
    });
    
    $("body").on("blur keyup", ".modelinp[data-type='lend']", function() {
        var amount = this.value;
        
        var tokenContract = $(".lend__modal").data('address');
        var decimalBalance = $("._bal_"+tokenContract+" ._amount").attr('data-balance');
        
        
        var cElem = $(".lend__modal");
        
        console.log("111", amount, decimalBalance);
        
        if(!new BigNumber(amount).isGreaterThan(0)){
            cElem.find(".model-action-btn").prop("disabled", true);
            return false;
        }
        
        if(new BigNumber(amount).isGreaterThan(decimalBalance)){
            cElem.find(".model-action-btn").prop("disabled", true);
            return false;
        }
        
        cElem.find(".model-action-btn").prop("disabled", false);
        cElem.find(".model-action-btn").text("LEND");
    });
    
    $("body").on("blur keyup", ".modelinp[data-type='redeem']", function() {
        var amount = this.value;
        
        var tokenContract = $(".redeem__modal").data('address');
        var decimalBalance = $("._bal_"+tokenContract+" ._amount").attr('data-balance');
        
        
        var cElem = $(".redeem__modal");
        
        if(!new BigNumber(amount).isGreaterThan(0)){
            cElem.find(".model-action-btn").prop("disabled", true);
            return false;
        }
        
        if(new BigNumber(amount).isGreaterThan(decimalBalance)){
            $(".model-action-btn").prop("disabled", true);
            return false;
        }
        
        cElem.find(".model-action-btn").prop("disabled", false);
        cElem.find(".model-action-btn").text("REDEEM");
    });
    
    $("body").on("blur keyup", ".modelinp[data-type='buy']", function() {
        var amount = this.value;
        
        var tokenContract = $(".buy__modal").data('address');
        var decimalBalance = $("._bal_"+tokenContract+" ._amount").attr('data-balance');
        
        // console.log("111", amount, decimalBalance);
        
        
        var cElem = $(".buy__modal");
        
        // console.log(allowance[lendAssets[0].address], lendAssets[0].address);
        if(allowance[lendAssets[0].address] == 0){
            cElem.find(".model-action-btn").prop("disabled", false);
            cElem.find(".model-action-btn").text("Approve");
            
            return false;
        }
        
        
        if(new BigNumber(amount).isGreaterThanOrEqualTo(0)){
            var tokenContract = $(".buy__modal").data('address');
            var amountFixed = decimal2Fixed(amount, tokenMeta[tokenContract].decimals);
            
            
            var LToken = new web3.eth.Contract(lTokenABI, lendAssets[0].laddress);
            
            console.log("lendAssets[0].laddress", lendAssets[0].laddress, tokenContract, amountFixed);
            
            
            // LToken.methods.getCash().call((error, totCash) => {
            //     console.log("getCash", error, totCash); 
                
            //     if(new BigNumber(totCash).isGreaterThanOrEqualTo(amountFixed)){
                    
            LToken.methods.estimateAmountIn(tokenContract, amountFixed).call((error1, result1) => {
                console.log("result1", error1, result1); 
                
                if(result1){
                    
                    LToken.methods.getCash().call((error, totCash) => {
                        console.log("getCash", error, totCash); 
                        
                        var liqPick = div(result1, 2);
                        
                        if(new BigNumber(totCash).isGreaterThanOrEqualTo(liqPick)){
                            
                            
                            
                            if(!new BigNumber( balance[lendAssets[0].laddress] ).isGreaterThan( decimal2Fixed( decimalBalance,  tokenMeta[tokenContract].decimals) )){
                                cElem.find(".model-action-btn").text("Not Enough USDC Balance");
                                cElem.find(".model-action-btn").prop("disabled", true);
                                return false;
                            } 
                            
                            else {
                                $(".buy__modal ._modal_balance").text( toPrecisin( fixed2Decimals(liqPick, tokenMeta[tokenContract].decimals) , 8)  + " USDC");
                            }
                            
                        } 
                        else {
                            cElem.find(".model-action-btn").prop("disabled", true);
                            cElem.find(".model-action-btn").text("Not Enough Liquidity");
                            
                            $(".buy__modal ._modal_balance").text("0/0 USDC");
                        }
                    });
                    
                    
                    
                } 
                else {
                    cElem.find(".model-action-btn").prop("disabled", true);
                    cElem.find(".model-action-btn").text("Not Enough Uniswap Liquidity");
                    
                    $(".buy__modal ._modal_balance").text("0/0 USDC");
                }
            });
                    
            //     } 
            //     else {
            //         $(".model-action-btn").prop("disabled", true);
            //         $(".model-action-btn").text("Not Enough Liquidity");
                    
            //         $(".buy__modal ._modal_balance").text("0/0");
            //     }
            // });
        }
        else {
            $(".model-action-btn").prop("disabled", true);
            $(".model-action-btn").text("Not Enough Liquidity");
            
            $(".buy__modal ._modal_balance").text("0/0 USDC");
        }
        
        
        
        if(!new BigNumber(amount).isGreaterThan(0)){
            cElem.find(".model-action-btn").prop("disabled", true);
            return false;
        }
        
        if(new BigNumber(amount).isGreaterThan(decimalBalance)){
            cElem.find(".model-action-btn").prop("disabled", true);
            return false;
        }
        
        cElem.find(".model-action-btn").prop("disabled", false);
        cElem.find(".model-action-btn").text("BORROW & BUY");
    });
    
    $("body").on("blur keyup", ".modelinp[data-type='repay']", function() {
        var amount = this.value;
        
        var tokenContract = $(".repay__modal").data('address');
        var decimalBalance = $("._bal_rp_"+tokenContract+" ._amount").attr('data-balance');
        
        
        
        // console.log("111", amount, decimalBalance);
        
        if(!new BigNumber(amount).isGreaterThan(0)){
            $(".model-action-btn").prop("disabled", true);
            return false;
        }
        
        if(new BigNumber(amount).isGreaterThan(decimalBalance)){
            $(".model-action-btn").prop("disabled", true);
            return false;
        }
        
        $(".model-action-btn").prop("disabled", false);
        $(".model-action-btn").text("REPAY");
    });
    
    
    
    function lendFunc(elm){
        var tokenContract = $(".lend__modal").data('address');
        var ltokenContract = tokenMeta[tokenContract].laddress;
        var amount = $(".lend__modal").find(".modelinp").val();
        
        var decimalBalance = $("._bal_"+tokenContract+" ._amount").data('balance');
        
        console.log("amount", amount, decimalBalance);
        
        if(!new BigNumber(amount).isGreaterThan(0)){
            $(".model-action-btn").prop("disabled", true);
            return false;
        }
        
        if(new BigNumber(amount).isGreaterThan(decimalBalance)){
            $(".model-action-btn").prop("disabled", true);
            return false;
        }
        
        var amountFixed = decimal2Fixed(amount, tokenMeta[tokenContract].decimals);
        
        
        var LToken = new web3.eth.Contract(lTokenABI, ltokenContract);
        
        console.log("mint", amountFixed);
        
        
        elm.html('<i class="fas fa-circle-notch fa-spin fa-fw"></i>');
        elm.prop('disabled', true);
        
        
        LToken.methods.mint(amountFixed).send({from: selectedAccount})
        .on('transactionHash', (dData) => {
            console.log(dData); 
            
            elm.html('LEND');
            $(".lend__modal").hide();
            
            var btnElem = $(".lendAction[data-contract='"+tokenContract+"']");
            
            btnElem.html('<i class="fas fa-circle-notch fa-spin fa-fw"></i>');
            btnElem.prop('disabled', true);
            
            // $(this).addClass(dData);
            // $(this).attr("data-text", 'deposit');
            
            checkTxnStatus(dData, 'lend', btnElem);
        })
        .on('error', function(error){
            console.log(error);
            
            elm.html('LEND');
            
            // _rbtnLoader(".createPool", "");
            // _validateCBoxpool();
        });
    }
    
    
    function redeemFunc(elm){
        var ltokenContract = $(".redeem__modal").data('address');
        var tokenContract = lTokenMeta[ltokenContract].uaddress;
        var amount = $(".redeem__modal").find(".modelinp").val();
        
        
        
        var decimalBalance = $("._bal_"+tokenContract+" ._amount").data('balance');
        
        console.log("amount", amount, decimalBalance);
        
        if(!new BigNumber(amount).isGreaterThan(0)){
            $(".model-action-btn").prop("disabled", true);
            return false;
        }
        
        if(new BigNumber(amount).isGreaterThan(decimalBalance)){
            $(".model-action-btn").prop("disabled", true);
            return false;
        }
        
        var balFixed = decimal2Fixed(decimalBalance, tokenMeta[tokenContract].decimals);
        var amountFixed = decimal2Fixed(amount, tokenMeta[tokenContract].decimals);
        
        console.log("redeem", amount, amountFixed, tokenMeta[tokenContract].decimals);
        
        
        // var lTokAmount = mul( amountFixed, div(balance[tokenContract], balFixed));
        
        
        // console.log("redeem", amount, amountFixed, balFixed, balance[tokenContract], lTokAmount);
        
        
        elm.html('<i class="fas fa-circle-notch fa-spin fa-fw"></i>');
        elm.prop('disabled', true);
        
        
        var LToken = new web3.eth.Contract(lTokenABI, ltokenContract);
        
        
        
        LToken.methods.getCash().call((error, totCash) => {
            console.log("getCash", error, totCash); 
            
            
            if(new BigNumber(totCash).isGreaterThanOrEqualTo(amountFixed)){
                
                // LToken.methods.redeem(lTokAmount).send({from: selectedAccount})
                LToken.methods.redeemUnderlying(amountFixed).send({from: selectedAccount})
                .on('transactionHash', (dData) => {
                    console.log(dData); 
                    
                    elm.html('REDEEM');
                    
                    $(".redeem__modal").hide();
                    
                    var btnElem = $(".redeemAction[data-contract='"+ltokenContract+"']");
                    
                    btnElem.html('<i class="fas fa-circle-notch fa-spin fa-fw"></i>');
                    btnElem.prop('disabled', true);
                    
                    // $(this).addClass(dData);
                    // $(this).attr("data-text", 'deposit');
                    
                    checkTxnStatus(dData, 'redeem', btnElem);
                })
                .on('error', function(error){
                    console.log(error);
                    
                    elm.html('REDEEM');
                    
                    // _rbtnLoader(".createPool", "");
                    // _validateCBoxpool();
                });
                
                
            } 
            else {
                
                elm.html('Not enough Liquidity');
                
            }
        });
    }
    
    
    
    
    function buyFunc(elm){
        var tokenContract = $(".buy__modal").data('address');
        var ltokenContract = $(".buy__modal").data('laddress');
        
        // console.log("--", tokenContract, lTokenMeta);
        
        var ltokenContract = ltokenContract;
        var utokenContract = tokenContract;
        var amount = $(".buy__modal").find(".modelinp").val();
        
        
        
        var amountFixed = decimal2Fixed(amount, tokenMeta[tokenContract].decimals);
        
        
        
        var LToken = new web3.eth.Contract(lTokenABI, lendAssets[0].laddress);
        
        
        
        
        if(allowance[lendAssets[0].address] == 0){
            var elm = $(".model-action-btn[data-type='buy']");
            
            
            console.log("approveToken", lendAssets[0].address, lendAssets[0].laddress);
            approveToken(lendAssets[0].address, lendAssets[0].laddress, 'buy', elm);
            
            return false;
        }
        
        
        elm.html('<i class="fas fa-circle-notch fa-spin fa-fw"></i>');
        elm.prop('disabled', true);
        
        
        
        
        
        console.log("lendAssets[0].laddress", lendAssets[0].laddress, tokenContract, amountFixed);
        
        
        // LToken.methods.getCash().call((error, totCash) => {
        //     console.log("getCash", error, totCash); 
            
        //     if(new BigNumber(totCash).isGreaterThanOrEqualTo(amountFixed)){
                
                LToken.methods.estimateAmountIn(tokenContract, amountFixed).call((error1, result1) => {
                    console.log("result1", error1, result1); 
                    
                    if(error1){
                        
                        elm.html('Not enough Uniswap Liquidity');
                        
                    } 
                    else {
                        
                        var partialAmount = mulFixed(result1, (50/100));
                        console.log("partialAmount", partialAmount); 
                        
                        
                        
            
                        LToken.methods.getCash().call((error, totCash) => {
                            console.log("getCash", error, totCash); 
                            
                            if(new BigNumber(totCash).isGreaterThanOrEqualTo(amountFixed)){
                                        
                            
                                console.log("borrowAndBuy", ltokenContract, partialAmount, partialAmount, amountFixed); 
                                
                                LToken.methods.borrowAndBuy(ltokenContract, partialAmount, partialAmount, amountFixed).send({from: selectedAccount})
                                .on('transactionHash', (dData) => {
                                    console.log(dData); 
                                    
                                    elm.html('BORROW & BUY');
                                
                                    $(".buy__modal").hide();
                                    
                                    var btnElem = $(".buyAction[data-contract='"+tokenContract+"']");
                                    
                                    btnElem.html('<i class="fas fa-circle-notch fa-spin fa-fw"></i>');
                                    btnElem.prop('disabled', true);
                                    
                                    // $(this).addClass(dData);
                                    // $(this).attr("data-text", 'deposit');
                                    
                                    checkTxnStatus(dData, 'buy', btnElem);
                                })
                                .on('error', function(error){
                                    console.log(error);
                                    
                                    elm.html('BORROW & BUY');
                                    
                                    // _rbtnLoader(".createPool", "");
                                    // _validateCBoxpool();
                                });
                            } 
                            else {
                                
                                elm.html('Not enough Liquidity');
                                
                            }
                        });
                    }
                    
                });
                
                
        //     } 
        //     else {
                
        //         elm.html('Not enough Liquidity');
                
        //     }
        // });
        
    }
    
    
    
    
    function repayFunc(elm){
        var tokenContract = $(".repay__modal").data('address');
        // var ltokenContract = $(".repay__modal").data('laddress');
        
        // console.log("--", tokenContract, lTokenMeta);
        
        var ltokenContract = ltokenContract;
        var utokenContract =lTokenMeta[tokenContract].uaddress;
        var amount = $(".repay__modal").find(".modelinp").val();
        
         var decimalBalance = $("._bal_rp_"+tokenContract+" ._amount").attr('data-balance');
        
        
        // var decimalBalance = $("._bal_"+tokenContract+" ._amount").data('balance');
        
        // console.log("amount", amount, decimalBalance);
        
        // if(!new BigNumber(amount).isGreaterThan(0)){
        //     $(".model-action-btn").prop("disabled", true);
        //     return false;
        // }
        
        // if(new BigNumber(amount).isGreaterThan(decimalBalance)){
        //     $(".model-action-btn").prop("disabled", true);
        //     return false;
        // }
        
        // var balFixed = decimal2Fixed(decimalBalance, lTokenMeta[tokenContract].decimals);
        
        // console.log("repayFunc--", amount, aaaaaaaaaaa);
        
        
        var amountFixed = decimal2Fixed(amount, tokenMeta[utokenContract].decimals);
        if(new BigNumber(amount).isEqualTo(decimalBalance)){
            var amountFixed = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
        }
        
        
        
        console.log("repayFunc--", amountFixed, amount, tokenMeta[utokenContract].decimals);
        
        
        // var lTokAmount = mul( amountFixed, div(balance[tokenContract], balFixed));
        
        
        
        elm.html('<i class="fas fa-circle-notch fa-spin fa-fw"></i>');
        elm.prop('disabled', true);
        
        
        
        var LToken = new web3.eth.Contract(lTokenABI, tokenContract);
        
        
        LToken.methods.repayBorrow(amountFixed).send({from: selectedAccount})
        .on('transactionHash', (dData) => {
            console.log(dData); 
            
            elm.html('REPAY');
            
            $(".repay__modal").hide();
            
            var btnElem = $(".repayAction[data-contract='"+tokenContract+"']");
            
            btnElem.html('<i class="fas fa-circle-notch fa-spin fa-fw"></i>');
            btnElem.prop('disabled', true);
            
            // $(this).addClass(dData);
            // $(this).attr("data-text", 'deposit');
            
            checkTxnStatus(dData, 'repay', btnElem);
        })
        .on('error', function(error){
            console.log(error);
            
            elm.html('REPAY');
            
            // _rbtnLoader(".createPool", "");
            // _validateCBoxpool();
        });
    }
    
    
    
    
    $("body").on("click", ".model-action-btn", function() {
        var type = $(this).attr('data-type');
        
        console.log("action --", type);
        
        if(type == "lend"){
            lendFunc($(this));
        } 
        else if(type == "redeem"){
            redeemFunc($(this));
        }
        else if(type == "buy"){
            buyFunc($(this));
        }
        else if(type == "repay"){
            repayFunc($(this));
        }
    });
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    checkAllowance();
});