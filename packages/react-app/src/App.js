import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import React, { useEffect, useState } from "react";
import {Container, Button, Col, Row, Figure} from 'react-bootstrap'

import useWeb3Modal from "./hooks/useWeb3Modal";

import { addresses, abis } from "@project/contracts";


var overrideRequestButtonDisable = false

function SetWalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  const [account, setAccount] = useState("");
  const [rendered, setRendered] = useState("");

  useEffect(() => {
    async function fetchAccount() {
      try {
        if (!provider) {
          return;
        }

        // Load the user's accounts.
        const accounts = await provider.listAccounts();
        setAccount(accounts[0]);
        setRendered("Logout " + account.substring(0, 6) + "..." + account.substring(36));

      } catch (err) {
        setAccount("");
        setRendered("");
        console.error(err);
      }
    }
    fetchAccount();
  }, [account, provider, setAccount, setRendered]);
  let btnClass = "outline-primary"
  if (provider) {
    btnClass = "outline-warning"
  }
  return (
    <Button id="wallet_button" variant={btnClass}
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {rendered === "" && "Connect Metamask"}
      {rendered !== "" && rendered}
    </Button>
  );
}

function App() {
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  async function checkChain() {
    if (provider) {
      const networkInfo = await provider.getNetwork()
      const chainId = networkInfo["chainId"]
      if (chainId !== 777) {
        alert("Wrong network! Party Token is an ERC20 token on the cheapETH network. Visit cheapeth.org to get started!")
      }
    }
  }

  async function getFaucetPtyBalance() {
    try {
      const defaultProvider = new JsonRpcProvider("https://node.cheapeth.org/rpc")
      const ptyContract = new Contract(addresses.ptyErc20, abis.erc20, defaultProvider);
      const faucetBalance = await ptyContract.balanceOf("0xfd1D23F823dA379a8AA7ADFAf02ed0ce624E1642")
      const balance = faucetBalance.toString()
      const readableBalance = balance.substring(0, balance.length - 18) + "." + balance.substring(balance.length - 18, balance.length -15);
      var faucetInfoElement = document.getElementById("faucet_info")
      faucetInfoElement.innerText = "Faucet balance: " + readableBalance + " PTY"
      faucetInfoElement.hidden = false
    } catch (error) {
      console.error(error)
    }
  }

  async function getWalletPtyBalance() {
    if (provider) {
      const networkInfo = await provider.getNetwork()
      const chainId = networkInfo["chainId"]
      if (chainId === 777) {
        const accounts = await provider.listAccounts();
        const userAddress = accounts[0];
        const ptyContract = new Contract(addresses.ptyErc20, abis.erc20, provider);
        const userBalance = await ptyContract.balanceOf(userAddress)
        const balance = userBalance.toString()
        let readableBalance = "0.000"
        if (balance != 0) { // not strict comparison here
          readableBalance = balance.substring(0, balance.length - 18) + "." + balance.substring(balance.length - 18, balance.length -15);
        }
        var walletInfoElement = document.getElementById("wallet_info")
        if (null !== walletInfoElement) {
          walletInfoElement.innerText = "Your balance: " + readableBalance + " PTY"
          walletInfoElement.hidden = false
        }

        var requestButtonElement = document.getElementById("request_button")
        if (null !== requestButtonElement) {
          requestButtonElement.hidden = false
        }
      }
    }
  }
  
  async function checkAllowedToWithdraw() {
    if (provider) {
      const networkInfo = await provider.getNetwork()
      const chainId = networkInfo["chainId"]
      if (chainId === 777) {
        const accounts = await provider.listAccounts();
        const userAddress = accounts[0];
        const faucetContract = new Contract(addresses.faucet, abis.faucet, provider);
        const allowedToWithdraw = await faucetContract.allowedToWithdraw(userAddress);
        if (!allowedToWithdraw) {
          document.getElementById("request_button").disabled = true
        } else {
          document.getElementById("request_button").disabled = false || overrideRequestButtonDisable;
        }
        return allowedToWithdraw;
      }
    }
  }

  async function requestPtyTokens() {
    if (provider) {
      const requestButtonElement = document.getElementById("request_button")
      const networkInfo = await provider.getNetwork()
      const chainId = networkInfo["chainId"]
      if (chainId === 777) {
        try {
          const allowedToWithdraw = await checkAllowedToWithdraw()
          if (true === allowedToWithdraw) {
            requestButtonElement.disabled = true
            const signer = provider.getSigner()
            const faucetContract = new Contract(addresses.faucet, abis.faucet, signer);
            const requestTokens = await faucetContract.requestTokens();
            console.log(requestTokens);
            alert("Success! You claimed 10,000PTY.")
            getWalletPtyBalance()

            overrideRequestButtonDisable = true
            setTimeout(function () {
              overrideRequestButtonDisable = false
            }, 15000)
            return requestTokens;
          } else {
            const accounts = await provider.listAccounts();
            const userAddress = accounts[0];
            const readableAddress = userAddress.substring(0, 6) + "..." + userAddress.substring(36)
            alert("Request failed! " + readableAddress + " can request PTY once every 45 minutes.")
          }
        } catch (error) {
          console.error(error)
          if (error.hasOwnProperty("message")) {
            alert("Error: " + error.message)
          } else {
            alert("Request failed with unknown error!")
          }
        }
      }
    }
    return false;
  }
  
  checkChain()

  getFaucetPtyBalance()
  setInterval(async () => {
    await getFaucetPtyBalance()
  }, 15000);

  checkAllowedToWithdraw()
  setInterval(async () => {
    checkAllowedToWithdraw()
  }, 15000);

  getWalletPtyBalance()
  setInterval(async () => {
    await getWalletPtyBalance()
  }, 5000);

  setInterval(async () => {
    if (provider) {
      let accounts = await provider.listAccounts();
      const userAddress = accounts[0];
      const buttonName = "Logout " + userAddress.substring(0, 6) + "..." + userAddress.substring(36)
      const walletButtonElement = document.getElementById("wallet_button");
      if (walletButtonElement.innerHTML !== buttonName) {
        walletButtonElement.innerText = buttonName;
        getWalletPtyBalance()
        checkAllowedToWithdraw()
      }
    }
  }, 1500)

  if (window.ethereum) {
    window.ethereum.on('chainChanged', function(networkId){
      window.location.reload()
     });
  }

  return (
    <div>
      
      <Row>
         <Col xs={12} hidden id="faucet_info"  className="text-right">Faucet balance: PTY</Col>
         <Col xs={12} hidden id="wallet_info"  className="text-right"></Col>
      </Row>
      <Row>
        <Col>.</Col>
      </Row>
      <Row>
        <Col sm={4} xs={12}>
          <Figure>
            <Figure.Image
              width={150}
              height={150}
              alt="Party Token"
              src="https://msb111.github.io/party/party.png"
            />
          </Figure>
        </Col>
        <Col sm={8} xs={12} className>
          <Container>
            <Row className="justify-content-md-right">
              <Col className="text-right">
              <p className="h4">Claim free Party tokens every 45 minutes:
              </p>
              <Button hidden id="request_button" variant="primary" onClick={requestPtyTokens}>Request $PTY</Button> <SetWalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
              </Col>
            </Row>
          </Container>
        </Col> 
      </Row>
         
    </div>  
  );
}

export default App;
