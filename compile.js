import fs from 'fs';
import solc from 'solc';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const lotteryContractSource = fs.readFileSync(
	path.resolve(__dirname, 'contracts', 'Lottery.sol'),
	'utf-8'
);

const lotteryContract = {
	language: 'Solidity',
	sources: {
		'Lottery.sol': {
			content: lotteryContractSource,
		},
	},
	settings: {
		outputSelection: {
			'*': {
				'*': ['*'],
			},
		},
	},
};

export default JSON.parse(solc.compile(JSON.stringify(lotteryContract)))
	.contracts['Lottery.sol'].Lottery;
