import { AztecAddress, CompleteAddress } from '@aztec/circuits.js';
import { useState } from 'react';
import { contractArtifact, diceArtifact } from '../../config.js';
import Canvas, { Game } from './canvas.js';
import { ContractFunctionForm, handleFunctionCall } from './contract_function_form.js';
import styles from './dadagame.module.scss';

const DICES_ADDRESS = '0x0c2ad7646f10706f85ebbc4b3dcb21292aff2aac6bebe45b1c081592a753ebc8';

const DadaGame = ({ wallet }: { wallet: CompleteAddress }) => {
  const [state, setState] = useState<'lobby' | 'join' | 'create' | 'game'>('lobby');
  const [error, setError] = useState('');
  const [wipContractAddress, setWipContractAddress] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<AztecAddress | undefined>(undefined);
  const [processingFunction, setProcessingFunction] = useState('');
  const [seed, _] = useState<number>(Math.ceil(Math.random() * 100000));
  const [game, setGame] = useState<Game>({} as Game);

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
    const a = AztecAddress.fromString(wipContractAddress);
    setContractAddress(a);
    register(a);
  };

  const handleSetWipContract = (e: any) => {
    setWipContractAddress(e.target.value);
  };

  const handleContractDeployed = (address: AztecAddress) => {
    if (address === undefined) {
      return;
    }
    setContractAddress(address);
    register(address);
  };

  const handleSubmitForm = (functionName: string) => {
    setProcessingFunction(functionName);
  };

  // CREATE GAME
  const constructorAbi = contractArtifact.functions.find(f => f.name === 'constructor')!;
  const registerAbi = contractArtifact.functions.find(f => f.name === 'register')!;
  const playersAbi = contractArtifact.functions.find(f => f.name === 'players')!;
  const seedHashesAbi = contractArtifact.functions.find(f => f.name === 'seedHashes')!;
  const dicesAbi = contractArtifact.functions.find(f => f.name === 'dices')!;
  const horsesAbi = contractArtifact.functions.find(f => f.name === 'horses')!;
  const winnerAbi = contractArtifact.functions.find(f => f.name === 'winner')!;
  const roundAbi = contractArtifact.functions.find(f => f.name === 'round')!;
  const lastTimestampAbi = contractArtifact.functions.find(f => f.name === 'last_timestamp')!;
  const diceAbi = diceArtifact.functions.find(f => f.name === 'dice')!;

  const hasResult = !!(contractAddress || error);

  // SETUP
  const register = async (addr: AztecAddress) => {
    await handleFunctionCall(
      addr,
      contractArtifact,
      registerAbi.name,
      {
        dicesAddress: DICES_ADDRESS,
        _seed: seed.toString(),
      },
      wallet,
    );
    setInterval(() => {
      getState(addr);
    }, 5000);
  };

  const getState = async (address: AztecAddress) => {
    const players = await handleFunctionCall(address, contractArtifact, playersAbi.name, {}, wallet);
    const seedHashes = await handleFunctionCall(address, contractArtifact, seedHashesAbi.name, {}, wallet);
    const dices = await handleFunctionCall(address, contractArtifact, dicesAbi.name, {}, wallet);
    const horses = await handleFunctionCall(address, contractArtifact, horsesAbi.name, {}, wallet);
    const winner = await handleFunctionCall(address, contractArtifact, winnerAbi.name, {}, wallet);
    const round = await handleFunctionCall(address, contractArtifact, roundAbi.name, {}, wallet);
    const last_time = await handleFunctionCall(address, contractArtifact, lastTimestampAbi.name, {}, wallet);
    const dice = await handleFunctionCall(
      AztecAddress.fromString(DICES_ADDRESS),
      diceArtifact,
      diceAbi.name,
      { addr: address.toString(), _game_id: '0' },
      wallet,
    );
    setGame({
      players: players.map((p: any) => AztecAddress.fromBigInt(p).toString()),
      seedHashes: seedHashes,
      board: horses.map(x => {
        const h = Number(x);
        return [(h >> 24) & 0xff, (h >> 16) & 0xff, (h >> 8) & 0xff, h & 0xff];
      }),
      finishLines: [],
      turn:
        Number(round) === 0 ? '' : AztecAddress.fromBigInt(players[(Number(round) - 1) % players.length]).toString(),
      lastMove: Number(dice),
      winner: AztecAddress.fromBigInt(winner).toString(),
      lastTime: last_time,
    });
    if (state !== 'game') {
      setState('game');
    }
  };

  console.log(state, game);

  return (
    <div className={styles.game}>
      <div className={styles.hheader}>
        <h1>My little Dada</h1>
        {state === 'game' ? (
          <div className={styles.topheader}>
            <div className={styles.listh}>
              <p className={styles.player}>Game: {contractAddress?.toString()}</p>
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
              {game.players?.map((player: any, index: any) => (
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
