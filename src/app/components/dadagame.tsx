import Canvas from './canvas.js';
import styles from './dadagame.module.scss';

const DadaGame = ({ game, address }: any) => {
  return (
    <div className={styles.game}>
      <h1>My little Dada</h1>
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
          <h3>Last Roll</h3>
          <img src={`dice${game.lastMove}.svg`} className={styles.diceface} />
        </div>
      </div>
      <div className={styles.canvasbox}>
        <div className={styles.canvas}>
          <Canvas game={game} />
        </div>
      </div>
      {address === game.turn && <button className={styles.dice}>🎲 Roll</button>}
    </div>
  );
};

export default DadaGame;
