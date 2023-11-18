import { Loader } from '@aztec/aztec-ui';
import { CompleteAddress } from '@aztec/aztec.js';
import { useState } from 'react';
import { PXE_URL } from '../config.js';
import DadaGame from './components/dadagame.js';
import { WalletDropdown } from './components/wallet_dropdown.js';
import styles from './home.module.scss';

export function Home() {
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<CompleteAddress>();
  const [selectWalletError, setSelectedWalletError] = useState('');
  const [currentGame, setCurrentGame] = useState<'dada' | null>(null);

  const handleSelectWallet = (address: CompleteAddress | undefined) => {
    setSelectedWallet(address);
    setIsLoadingWallet(false);
  };

  const handleSelectWalletError = (msg: string) => {
    setSelectedWalletError(msg);
    setIsLoadingWallet(false);
  };

  function createRandomGame() {
    const game = {
      players: [
        '0x16efad912187aa8ef0dcc6ef4f3743ab327b06465d4d229943f2fe3f88b06ad9',
        '0x16efad912187aa8ef0dcc6ef4f3743ab327b06465d4d229943f2fe3f88b06ad8',
        '0x16efad912187aa8ef0dcc6ef4f3743ab327b06465d4d229943f2fe3f88b06ad7',
        '0x16efad912187aa8ef0dcc6ef4f3743ab327b06465d4d229943f2fe3f88b06ad2',
      ],
      seedHashes: [],
      board: [
        [1, 5, 8, 0],
        [12, 15, 17, 20],
        [1, 5, 0, 0],
        [52, 0, 0, 0],
      ],
      turn: '',
      lastMove: 1,
      finishLines: [],
    };

    // Generate a random board
    game.players = [
      '0x16efad912187aa8ef0dcc6ef4f3743ab327b06465d4d229943f2fe3f88b06ad9',
      '0x16efad912187aa8ef0dcc6ef4f3743ab327b06465d4d229943f2fe3f88b06ad8',
      '0x16efad912187aa8ef0dcc6ef4f3743ab327b06465d4d229943f2fe3f88b06ad7',
      '0x16efad912187aa8ef0dcc6ef4f3743ab327b06465d4d229943f2fe3f88b06ad2',
    ];

    game.turn = game.players[Math.floor(Math.random() * 4)];
    game.turn = game.players[0];

    return game;
  }

  const game = createRandomGame();

  const handleSelectGame = () => {
    setCurrentGame('dada');
  };

  return (
    <main className={styles.main}>
      <img src="aztec_logo.svg" alt="Aztec" className={styles.logo} />
      <>
        {isLoadingWallet && <Loader />}
        {!isLoadingWallet && (
          <>
            {!!selectWalletError && (
              <>
                {`Failed to load accounts. Error: ${selectWalletError}`}
                <br />
                {`Make sure PXE from Aztec Sandbox is running at: ${PXE_URL}`}
              </>
            )}
            {!selectWalletError && !selectedWallet && `No accounts.`}
          </>
        )}
        {!isLoadingWallet && currentGame === null && (
          <div className={styles.menu}>
            <h1>Select a Game</h1>
            <button className={styles.menubtn} onClick={handleSelectGame}>
              🐎 My little Dada
            </button>
          </div>
        )}
        {currentGame === 'dada' && !isLoadingWallet && selectedWallet?.address ? (
          <DadaGame game={game} wallet={selectedWallet} />
        ) : (
          <></>
        )}
        <WalletDropdown
          selected={selectedWallet}
          onSelectChange={handleSelectWallet}
          onError={handleSelectWalletError}
        />
      </>
    </main>
  );
}
