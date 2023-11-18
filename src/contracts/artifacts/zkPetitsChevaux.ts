
/* Autogenerated file, do not edit! */

/* eslint-disable */
import {
  AztecAddress,
  AztecAddressLike,
  CompleteAddress,
  Contract,
  ContractArtifact,
  ContractBase,
  ContractFunctionInteraction,
  ContractMethod,
  DeployMethod,
  EthAddress,
  EthAddressLike,
  FieldLike,
  Fr,
  Point,
  PublicKey,
  Wallet,
} from '@aztec/aztec.js';
import zkPetitsChevauxContractArtifactJson from './zkPetitsChevaux.json' assert { type: 'json' };
export const zkPetitsChevauxContractArtifact = zkPetitsChevauxContractArtifactJson as ContractArtifact;

/**
 * Type-safe interface for contract zkPetitsChevaux;
 */
export class zkPetitsChevauxContract extends ContractBase {
  
  private constructor(
    completeAddress: CompleteAddress,
    wallet: Wallet,
    portalContract = EthAddress.ZERO
  ) {
    super(completeAddress, zkPetitsChevauxContractArtifact, wallet, portalContract);
  }
  

  
  /**
   * Creates a contract instance.
   * @param address - The deployed contract's address.
   * @param wallet - The wallet to use when interacting with the contract.
   * @returns A promise that resolves to a new Contract instance.
   */
  public static async at(
    address: AztecAddress,
    wallet: Wallet,
  ) {
    return Contract.at(address, zkPetitsChevauxContract.artifact, wallet) as Promise<zkPetitsChevauxContract>;
  }

  
  /**
   * Creates a tx to deploy a new instance of this contract.
   */
  public static deploy(wallet: Wallet, dicesAddress: FieldLike) {
    return new DeployMethod<zkPetitsChevauxContract>(Point.ZERO, wallet, zkPetitsChevauxContractArtifact, Array.from(arguments).slice(1));
  }

  /**
   * Creates a tx to deploy a new instance of this contract using the specified public key to derive the address.
   */
  public static deployWithPublicKey(publicKey: PublicKey, wallet: Wallet, dicesAddress: FieldLike) {
    return new DeployMethod<zkPetitsChevauxContract>(publicKey, wallet, zkPetitsChevauxContractArtifact, Array.from(arguments).slice(2));
  }
  

  
  /**
   * Returns this contract's artifact.
   */
  public static get artifact(): ContractArtifact {
    return zkPetitsChevauxContractArtifact;
  }
  

  /** Type-safe wrappers for the public methods exposed by the contract. */
  public methods!: {
    
    /** _constructor(dicesAddress: field) */
    _constructor: ((dicesAddress: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;

    /** _register(user: field, seedHash: field) */
    _register: ((user: FieldLike, seedHash: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;

    /** compute_note_hash_and_nullifier(_: field, _: field, _: field, _: array) */
    compute_note_hash_and_nullifier: ((_: FieldLike, _: FieldLike, _: FieldLike, _: FieldLike[]) => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;

    /** register(dicesAddress: field, seed: integer) */
    register: ((dicesAddress: FieldLike, seed: (bigint | number)) => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;
  };
}
