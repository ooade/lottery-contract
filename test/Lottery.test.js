import assert from 'assert';
import ganache from 'ganache';
import Web3 from 'web3';
import compiled from '../compile.js';

const web3 = new Web3(ganache.provider({ logging: { quiet: true } }));

describe('Lottery', () => {
	let accounts, lottery;

	beforeEach(async () => {
		accounts = await web3.eth.getAccounts();

		lottery = await new web3.eth.Contract(compiled.abi)
			.deploy({
				data: compiled.evm.bytecode.object
			})
			.send({ from: accounts[0], gas: 1000000 });
	});

	it('deploys a contract', () => {
		assert.ok(lottery.options.address);
	});

	it('allows a player to enter contest', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether'),
		});

		const players = await lottery.methods.getPlayers().call({ from: accounts[0] });
		assert.equal(accounts[0], players[0]);
		assert.equal(1, players.length);
	});

	it('allows multiple players to enter contest', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether'),
		});
		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei('0.02', 'ether'),
		});
		await lottery.methods.enter().send({
			from: accounts[2],
			value: web3.utils.toWei('0.02', 'ether'),
		});

		const players = await lottery.methods.getPlayers().call({ from: accounts[0] });
		assert.equal(accounts[0], players[0]);
		assert.equal(accounts[1], players[1]);
		assert.equal(accounts[2], players[2]);
		assert.equal(3, players.length);
	});

	it('requires a minimum amount of ether', async () => {
		try {
			await lottery.methods.enter().send({
				from: accounts[0],
				value: web3.utils.toWei('0.01', 'ether'),
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});

	it('only allows managers to pick a winner', async () => {
		try {
			await lottery.methods.pickWinner().send({
				from: accounts[1]
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});

	it('sends money to the winner and resets players', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('2', 'ether'),
		});
		const initialBalance = await web3.eth.getBalance(accounts[0]);
		await lottery.methods.pickWinner().send({
			from: accounts[0],
		});
		const finalBalance = await web3.eth.getBalance(accounts[0]);
		const difference = finalBalance - initialBalance;
		assert.ok(
			difference > web3.utils.toWei('1.8', 'ether') &&
			difference < web3.utils.toWei('2', 'ether')
		);
		const players = await lottery.methods.getPlayers().call({ from: accounts[0] });
		assert.equal(0, players.length);
	});
});
