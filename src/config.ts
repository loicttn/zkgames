import { PXE, createPXEClient } from '@aztec/aztec.js';
import { ContractArtifact } from '@aztec/foundation/abi';
import { DicesContractArtifact } from './artifacts/Dices.js';
import { zkPetitsChevauxContractArtifact } from './artifacts/zkPetitsChevaux.js';

// update this if using a different contract

export const diceArtifact: ContractArtifact = DicesContractArtifact;
export const contractArtifact: ContractArtifact = zkPetitsChevauxContractArtifact;

export const PXE_URL: string = process.env.PXE_URL || 'http://localhost:8080';
export const pxe: PXE = createPXEClient(PXE_URL);

export const CONTRACT_ADDRESS_PARAM_NAMES = ['owner', 'address', 'recipient'];
export const FILTERED_FUNCTION_NAMES = ['compute_note_hash_and_nullifier'];
