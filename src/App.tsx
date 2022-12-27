import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
import "./App.css"
import { Web3Modal } from "@web3modal/react";

import { configureChains, createClient, WagmiConfig, useAccount } from "wagmi";

import { polygonMumbai } from "wagmi/chains";
import Header from "./components/Header";
import { Web3Button } from "@web3modal/react";
import ListComponent from "./components/ListComponent";
const chains = [polygonMumbai];

const projectId = String(process.env.REACT_APP_WC_PROJECT_ID)

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

export default function App() {
  const projectId = String(process.env.REACT_APP_WC_PROJECT_ID)
  const { address } = useAccount()

  return (
    <>
      <div className="App">
        <WagmiConfig client={wagmiClient}>
          <Header />
          <div className={address ? `button-container connected` : `button-container` } >
            <Web3Button />
          </div>
          <ListComponent address={address}/>
          <Web3Modal
            projectId={projectId}
            ethereumClient={ethereumClient}
          />
        </WagmiConfig>
      </div>
    </>
  );
}