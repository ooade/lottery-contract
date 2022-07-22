import process from 'process';
import HDWalletProvider from '@truffle/hdwallet-provider';
import Web3 from 'web3';
import compiled from './compile.js';
import 'dotenv/config';

const provider = new HDWalletProvider(
	process.env.RECOVERY_PHRASE,
	'https://rinkeby.infura.io/v3/a77cde7adb3f45da90747954dddfa0dc'
);

const web3 = new Web3(provider);

const deploy = async () => {
	const accounts = await web3.eth.getAccounts();

	console.log('Attempting to deploy from', accounts[0]);
	const result = await new web3.eth.Contract(compiled.abi)
		.deploy({
			data: compiled.evm.bytecode.object
		})
		.send({ from: accounts[0], gas: 1000000 });
	console.log('Contract deployed to', result.options.address);
	provider.engine.stop();
};

deploy();
