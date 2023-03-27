import "./App.css"
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createClient, WagmiConfig, useAccount } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { Web3Button } from "@web3modal/react";
import ReactGA from 'react-ga';
import Web3 from "web3";
import axios from "axios";

import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, ApolloLink } from '@apollo/client';

import Header from "./components/Header";
import ListComponent from "./components/ListComponent";
import Footer from "./components/Footer";
import React, { useEffect } from "react";
const chains = [polygonMumbai];

const projectId = String(process.env.REACT_APP_WC_PROJECT_ID)
const TRACKING_ID = String(process.env.REACT_APP_TRACKING_ID)


// Wagmi client
const { provider } = configureChains(chains, [
  walletConnectProvider({ projectId: projectId }),
]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: "web3Modal", chains }),
  provider,
});

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiClient, chains);

const web3Provider = new Web3(Web3.givenProvider);

export default function App() {
  const projectId = String(process.env.REACT_APP_WC_PROJECT_ID)
  const [ready, setReady] = React.useState(false);
  const { address } = useAccount()
  ReactGA.initialize(TRACKING_ID);



  async function getNonce() {
    const url = `${process.env.REACT_APP_GRAPHQL_GATEWAY_BASE_URL}/auth`
    const response = await axios.post(
      url
    )
    return response.data.nonce
  }

  async function getToken(nonce: string, address: string) {
    const message = "TODO"
    const messageToSign = message + nonce

    const signature = await web3Provider.eth.personal.sign(messageToSign, address, "");

    const url = `${process.env.REACT_APP_GRAPHQL_GATEWAY_BASE_URL}/auth/verify`
    const payload = {
      "message": message,
      "account": address,
      nonce,
      "signature": signature.slice(2)
    }

    const response = await axios.post(
      url, payload
    )
    return response.data.token
  }

  const httpLink = new HttpLink({ uri: String(process.env.REACT_APP_GRAPHQL_ENDPOINT) });
  const authLink = new ApolloLink((operation, forward) => {
    // Retrieve the authorization token from local storage.
    const token = localStorage.getItem('auth_token');

    // Use the setContext method to set the HTTP headers.
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : ''
      }
    });

    // Call the next link in the middleware chain.
    return forward(operation);
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink), // Chain it with the HttpLink
    cache: new InMemoryCache({
      addTypename: false, //TODO this must be removed
    })
  });

  useEffect(() => {
    if (address !== undefined) {
      authorize(address)
    }
  }, [address])

  async function authorize(address: string) {
    const nonce = await getNonce()
    const token = await getToken(nonce, address)
    localStorage.setItem('auth_token', token)
    setReady(true)
  }

  return (
    <>
      <ApolloProvider client={client}>
        <div className="App">
          <WagmiConfig client={wagmiClient}>
            <Header />
            <div className={address ? `button-container connected` : `button-container`} >
              <Web3Button />
            </div>
            <div className="gif-container" style={address ? { display: 'none' } : { display: 'flex' }} >
              <div className="web">
                <img className="gif" src="home-gif.gif" alt="explained gif" />
              </div>
            </div>
            {ready ? <ListComponent address={address} /> : null}
            <Web3Modal
              projectId={projectId}
              ethereumClient={ethereumClient}
            />
            <Footer />
          </WagmiConfig>
        </div>
      </ApolloProvider>
    </>
  );
}