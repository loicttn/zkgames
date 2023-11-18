import { AztecAddress, CompleteAddress } from '@aztec/circuits.js';
import { useState } from 'react';
import { contractArtifact } from '../../config.js';
import Canvas, { Game } from './canvas.js';
import { ContractFunctionForm } from './contract_function_form.js';
import styles from './dadagame.module.scss';

const DadaGame = ({ game, wallet }: { game: Game; wallet: CompleteAddress }) => {
  const [state, setState] = useState<'lobby' | 'join' | 'create' | 'game'>('lobby');
  const [error, setError] = useState('');
  const [wipContractAddress, setWipContractAddress] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<AztecAddress | undefined>(undefined);
  const [processingFunction, setProcessingFunction] = useState('');

  // UTILS

  const hasIdlingHorses = (): number => {
    let player = 0;
    while (game.players[player] !== wallet.address.toString()) {
      player++;
    }
    const board = game.board[player];
    let ttl = 0;
    for (let i = 0; i < 4; i++) {
      if (board[i] === 0) {
        ttl += 1;
      }
    }
    return ttl;
  };

  // HANDLERS

  const handleCreateGame = () => {
    setState('create');
  };

  const handleJoinGame = () => {
    setState('join');
  };

  const handleJoinContract = () => {
    if (wipContractAddress === undefined || wipContractAddress === '') {
      return;
    }
    console.log(wipContractAddress);
    setContractAddress(AztecAddress.fromString(wipContractAddress));
    setState('game');
  };

  const handleSetWipContract = (e: any) => {
    setWipContractAddress(e.target.value);
  };

  const handleContractDeployed = (address: AztecAddress) => {
    if (address === undefined) {
      return;
    }
    setContractAddress(address);
    setState('game');
  };

  const handleSubmitForm = (functionName: string) => {
    setProcessingFunction(functionName);
  };

  // CREATE GAME
  const constructorAbi = contractArtifact.functions.find(f => f.name === 'constructor')!;
  const hasResult = !!(contractAddress || error);

  return (
    <div className={styles.game}>
      <div className={styles.header}>
        <h1>My little Dada</h1>
        {state === 'game' ? (
          <div className={styles.topheader}>
            <div className={styles.listh}>
              <p className={styles.player}>
                Game Address: {contractAddress?.toString().slice(0, 16)}...
                {contractAddress?.toString().slice(-4, contractAddress.toString().length)}
              </p>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      {state === 'lobby' ? (
        <div className={styles.lobby}>
          <button className={styles.lobbybtn} onClick={handleCreateGame}>
            Create Game
          </button>
          <button className={styles.lobbybtn} onClick={handleJoinGame}>
            Join Game
          </button>
        </div>
      ) : (
        <> </>
      )}
      {state === 'create' ? (
        <div>
          <ContractFunctionForm
            wallet={wallet}
            artifact={contractArtifact}
            functionAbi={constructorAbi}
            defaultAddress={wallet.address.toString()}
            buttonText="Deploy Game"
            isLoading={!!processingFunction && !hasResult}
            disabled={!!processingFunction && hasResult}
            onSubmit={() => handleSubmitForm('constructor')}
            onSuccess={handleContractDeployed}
            onError={setError}
          />
        </div>
      ) : (
        <></>
      )}
      {state === 'join' ? (
        <div className={styles.list}>
          <label>Game Address</label>
          <input value={wipContractAddress} onChange={handleSetWipContract} />
          <button className={styles.lobbybtn} onClick={handleJoinContract}>
            Join
          </button>
        </div>
      ) : (
        <></>
      )}
      {state === 'game' ? (
        <div className={styles.game}>
          <div className={styles.header}>
            <div className={styles.list}>
              <h3>Players</h3>
              {game.players.map((player: any, index: any) => (
                <div key={index} className={styles.player}>
                  <p>
                    Player {index + 1}: {player.slice(0, 6)}...{player.slice(-4)}
                  </p>
                  {game.turn === player && <p className={styles.playing}>(playing)</p>}
                </div>
              ))}
            </div>
            <div className={styles.list}>
              <h3>Last Dice</h3>
              <img src={`dice${game.lastMove}.svg`} className={styles.diceface} />
            </div>
          </div>
          <div className={styles.canvasbox}>
            <div className={styles.canvas}>
              <Canvas game={game} />
            </div>
          </div>
          {wallet.address.toString() === game.turn && hasIdlingHorses() ? (
            <button className={styles.dice}>🐎 Spawn</button>
          ) : (
            <></>
          )}
          {wallet.address.toString() === game.turn ? <button className={styles.dice}>🎲 Roll</button> : <></>}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default DadaGame;
