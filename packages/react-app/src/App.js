import { useQuery } from "@apollo/react-hooks";
import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import React, { useEffect, useState } from "react";

import {Header, WalletButton, RequestButton, WalletInfo, FaucetInfo} from "./components";
import { Container, Row, Col, Image, Button, Table, Breadcrumb, Alert } from 'react-bootstrap'


import logo from "./partysmall.png";
import useWeb3Modal from "./hooks/useWeb3Modal";

import { addresses, abis } from "@project/contracts";

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
        setRendered(account.substring(0, 6) + "..." + account.substring(36));

      } catch (err) {
        setAccount("");
        setRendered("");
        console.error(err);
      }
    }
    fetchAccount();
  }, [account, provider, setAccount, setRendered]);

  return (
    <WalletButton id="wallet_button"
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
    </WalletButton>
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
      console.log(error)
      var faucetInfoElement = document.getElementById("faucet_info")
      faucetInfoElement.innerText = ""
      faucetInfoElement.hidden = true
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
        if (balance != 0) {
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
  
  async function checkFaucet() {
    if (provider) {
      const networkInfo = await provider.getNetwork()
      const chainId = networkInfo["chainId"]
      if (chainId === 777) {
        const accounts = await provider.listAccounts();
        const userAddress = accounts[0];
        const faucetContract = new Contract(addresses.faucet, abis.faucet, provider);
        const allowedToWithdraw = await faucetContract.allowedToWithdraw(userAddress);
        return allowedToWithdraw;
      }
    }
  }

  async function requestPtyTokens() {
    if (provider) {
      const networkInfo = await provider.getNetwork()
      const chainId = networkInfo["chainId"]
      if (chainId === 777) {
        try {
          const allowedToWithdraw = await checkFaucet()
          if (true == allowedToWithdraw) {
            const signer = provider.getSigner()
            const faucetContract = new Contract(addresses.faucet, abis.faucet, signer);
            const requestTokens = await faucetContract.requestTokens();
            console.log(requestTokens);
            alert("Success! You claimed 10,000PTY.")
            getWalletPtyBalance()
            return requestTokens;
          } else {
            const accounts = await provider.listAccounts();
            const userAddress = accounts[0];
            const readableAddress = userAddress.substring(0, 6) + "..." + userAddress.substring(36)
            alert("Request failed! " + readableAddress + " can request PTY once every 45 minutes.")
          }
        } catch (error) {
          console.log(error)
          if (error.hasOwnProperty("message")) {
            alert("Error: " + error.message)
          } else {
            alert("Request failed with unknown error!")
            console.log(error)
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
  }, 10000);

  getWalletPtyBalance()
  setInterval(async () => {
    await getWalletPtyBalance()
  }, 5000);

  window.ethereum.on('networkChanged', function(networkId){
   window.location.reload()
  });

  return (
    <div>
      <Header>
        <FaucetInfo hidden id="faucet_info"></FaucetInfo>
        <WalletInfo hidden id="wallet_info"></WalletInfo>
        <RequestButton hidden id="request_button" onClick={requestPtyTokens}>Request free $PTY</RequestButton>
        <SetWalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      <Container style={{"paddingTop": "10px"}}>
        <Row>
          <Col>
            <Alert hidden variant="success" id="alert_success">
              This is a123  alert—check it out!
            </Alert>
            <Alert hidden variant="danger" id="alert_danger">
              This is a123  alert—check it out!
            </Alert>
          </Col>
        </Row>
        <Row style={{"paddingTop": "10px"}}>
          <Col sm={4} xs={12}>
            <Image src={logo} rounded center/>
          </Col>
        </Row>
        <Row style={{"paddingTop": "10px"}}>
          <Col>
            <h3>TF is Party Token (PTY)?</h3>
            <p>
                For me it was an awesome opportunity to learn to code my first ERC20 token 
                on the <a href="https://cheapeth.org" target="_blank">cheapETH</a> network (testing in prod FTW), 
                for anybody else it is a party token or yet another method to obtain some free cheapETH. 
                As the name says, it's a <b>party</b>, and not for speculating on. This token 
                is most likely NOT going to the moon and if it does it's the cheapETH moon 
                which is still down here on Earth.
            </p>
          </Col>
        </Row>

        <Row style={{"paddingTop": "10px"}}>
          <Col>
          <h3>Tokenomics?</h3>
          <Table size="xl">
            <tbody>
              <tr>
                <td><b>Contract address:</b> <a href="https://explore.cheapswap.io/account/0x4ac1242106601f70bfdc4731d4eeaf7f7501b5cd" target="_blank">
                  0x4AC1242106601F70BfDc4731D4EEAF7f7501B5Cd
                  </a>
                </td>
              </tr>
              <tr>
                <td><b>Total supply:</b> 276,338,660,057</td>
                <td></td>
              </tr>
              <tr>
                <td><b>Cheapswap liquidity:</b> 1,500 CTH/100,000,000 PTY 
                  (Initial $PTY price: 0.000015 CTH per PTY). <a href="https://explore.cheapswap.io/tx/0x6421ba72fdcaf4fd74e72e95246a19c549cd4c8c8cb67a4cc6d789feae32f418" target="_blank">
                      LP tokens Burned
                  </a>. <a href="https://cheapswap.io/#/swap?outputCurrency=0x4AC1242106601F70BfDc4731D4EEAF7f7501B5Cd" target="_blank">
                      Buy some on cheapswap.io!
                    </a>
                </td>
              </tr>
              <tr>
                <td><b>Faucet contract balance:</b> 260,000,000,000+. Faucet gives 10,000PTY/address/45min</td>
              </tr>
              <tr>
                <td><b>Other:</b> Kept around 15B for bragging rights, faucet replenish, drops, and potential future party projects.</td>
              </tr>
            </tbody>
          </Table>
          </Col>
        </Row>
        <Row style={{"paddingTop": "10px"}}>
          <Col>
            <h3>Who this for?</h3>
            <Table size="lx">
              <tbody>
                <tr>
                  <td>
                    <b>Everybody!</b> 
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>You broke af?</b> I got you. Grab your free PTY by connecting your metamask wallet at the top of the page and requesting your tokens. 
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>You da whale?</b> Please consider buying 1,2,5,10,100 CTH worth of PTY over
                    on <a href="https://cheapswap.io/#/swap?outputCurrency=0x4AC1242106601F70BfDc4731D4EEAF7f7501B5Cd" target="_blank">
                      cheapswap.io
                    </a>. You get some awesome Party tokens and it raises the price so that faucet 
                    users can get more cheapETH for their $PTY. It's like airdropping cheapETH through the Party.
                  </td>
                </tr>
                <tr>
                  <td>
                    Don't know what to do with the Party tokens your whale a** just bought? You can keep some for
                    party bragging rights, send some to your blockchain friends, and, for lolz, you can send some to 
                    the PartyFaucet contract address (0xfd1D23F823dA379a8AA7ADFAf02ed0ce624E1642), 
                    then faucet users can continue to collect 10,000 PTY/address/45min after my 260B dries up. 
                    Be a nice whale and pump the Party. Us paperhands love it when we see our cents double :).
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>

        <Row style={{"paddingTop": "10px"}}>
          <Col>
            <h3>Is there any good in this project?</h3>
            <Table size="xl">
              <tbody>
              <tr>
                  <td>Ofc it is, it's a party!</td>
                </tr>
                <tr>
                  <td>Faucet users use the cheapETH network to get their tokens.</td>
                </tr>
                <tr>
                  <td>
                    Users learn/get to use decentralized swapping services like <a href="https://cheapswap.io/#/swap?outputCurrency=0x4AC1242106601F70BfDc4731D4EEAF7f7501B5Cd" target="_blank">
                        cheapswap.io</a>.
                  </td>
                </tr>
                <tr>
                  <td>
                    Users learn the risks of holding for potential greater gains but on the cheap. 
                  </td>
                </tr>
                <tr>
                  <td>Whales of all sizes can pump the party just for the lolz.</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>

        <Row style={{"paddingTop": "50px", "fontSize": "10px"}}>
          <Col>
          <Breadcrumb>
            <Breadcrumb.Item>let's party!</Breadcrumb.Item>
            <Breadcrumb.Item>
              built on <a href="https://cheapeth.org" target="_blank">cheapETH</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item active>donate to this project: 0xf4fF887c1C1fca7E9D6cd1eAe967fB2534f35620</Breadcrumb.Item>
          </Breadcrumb>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
