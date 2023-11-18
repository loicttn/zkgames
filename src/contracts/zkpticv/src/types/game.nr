use dep::aztec::types::type_serialization::TypeSerializationInterface;

struct Game {
    players: [Field; 4],
    seedHashes: [Field; 4],
    board: [Field; 56],
    finish_lines: [Field; 24],
    turn: Field,
    winner: Field,
	last_move: Field,
}

global GAME_SERIALIZED_LEN: Field = 91;

global TEST_LEN = 15;

fn deserializeArr(raw: [Field; TEST_LEN]) -> [Field; TEST_LEN] {
	raw
}

fn serializeArr(value: [Field; TEST_LEN]) -> [Field; TEST_LEN] {
	value
}

fn deserializeField4(raw: [Field; 4]) -> [Field; 4] {
	raw
}

fn serializeField4(value: [Field; 4]) -> [Field; 4] {
	value
}

fn deserializeGame(raw: [Field; GAME_SERIALIZED_LEN]) -> Game {
    let mut game = Game {
		players: [0; 4],
		seedHashes: [0; 4],
		board: [0; 56],
		finish_lines: [0; 24],
		turn: 0,
		winner: 0,
		last_move: 0,
	};
    game.players[0] = raw[0];
    game.players[1] = raw[1];
    game.players[2] = raw[2];
    game.players[3] = raw[3];
    game.seedHashes[0] = raw[4];
    game.seedHashes[1] = raw[5];
    game.seedHashes[2] = raw[6];
    game.seedHashes[3] = raw[7];

    for i in 0..56 {
        game.board[i] = raw[8+i];
    }
    for i in 0..24 {
        game.finish_lines[i] = raw[64+i];
    }
    game.turn = raw[88];
    game.winner = raw[89];
	game.last_move = raw[90];
    game
}

fn serializeGame(value: Game) -> [Field; GAME_SERIALIZED_LEN] {
	let mut res: [Field; GAME_SERIALIZED_LEN] = [0; GAME_SERIALIZED_LEN];
	res[0] = value.players[0];
	res[1] = value.players[1];
	res[2] = value.players[2];
	res[3] = value.players[3];
	res[4] = value.seedHashes[0];
	res[5] = value.seedHashes[1];
	res[6] = value.seedHashes[2];
	res[7] = value.seedHashes[3];
	for i in 0..56 {
		res[8+i] = value.board[i];
	}
	for i in 0..24 {
		res[64+i] = value.finish_lines[i];
	}
	res[88] = value.turn;
	res[89] = value.winner;
	res[90] = value.last_move;
	res
}

global GameSerializationMethods = TypeSerializationInterface {
    deserialize: deserializeArr,
    serialize: serializeArr,
};