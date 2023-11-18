mod types;

// Minimal token implementation that supports `AuthWit` accounts.
// The auth message follows a similar pattern to the cross-chain message and includes a designated caller.
// The designated caller is ALWAYS used here, and not based on a flag as cross-chain.
// message hash = H([caller, contract, selector, ...args])
// To be read as `caller` calls function at `contract` defined by `selector` with `args`
// Including a nonce in the message hash ensures that the message can only be used once.


contract zkPetitsChevaux {

    use dep::aztec::{
        hash::pedersen_hash,
        selector::compute_selector,
        context::{PrivateContext, PublicContext, Context},
        types::type_serialization::{
            TypeSerializationInterface,
            field_serialization::{FieldSerializationMethods, FIELD_SERIALIZED_LEN},
        },
        state_vars::{map::Map, public_state::PublicState, set::Set},
        types::address::{AztecAddress},
    };

    // docs:end:storage_struct
    use crate::types::{
        game::{Game, GameSerializationMethods, GAME_SERIALIZED_LEN, serializeGame, deserializeGame},
    };

    // docs:start:storage_struct
    struct Storage {
        currentGame: PublicState<Field, FIELD_SERIALIZED_LEN>,
        currentPlayers: PublicState<Field, FIELD_SERIALIZED_LEN>,
        dices: PublicState<Field, FIELD_SERIALIZED_LEN>,
        game: PublicState<[Field;91], GAME_SERIALIZED_LEN>,
    }

    // docs:start:storage_init
    impl Storage {
        fn init(context: Context) -> Self {
            Storage {
                dices: PublicState::new(
                    context,
                    1,
                    FieldSerializationMethods,
                ),
                currentGame: PublicState::new(
                    context,
                    2,
                    FieldSerializationMethods,
                ),
                currentPlayers: PublicState::new(
                    context,
                    3,
                    FieldSerializationMethods,
                ),
                game: PublicState::new(
                    context,
                    4,
                    GameSerializationMethods,
                ),
            }
        }
    }
    // docs:end:storage_init

    // docs:start:constructor
    #[aztec(private)]
    fn constructor(dicesAddress: Field) {
        let selector = compute_selector("_constructor(Field)");
        context.call_public_function(context.this_address(), selector, [dicesAddress]);
    }

    // docs:end:constructor
    #[aztec(public)]
    internal fn _constructor(dicesAddress: Field) {
        storage.dices.write(dicesAddress);
        let mut game = Game {
		    players: [0; 4],
		    seedHashes: [0; 4],
		    board: [0; 56],
		    finish_lines: [0; 24],
		    turn: 0,
		    winner: 0,
		    last_move: 0,
	    };
        storage.game.write(serializeGame(game));
    }

    #[aztec(private)]
    fn register(dicesAddress: Field, seed: u96) {
        let rollSelector = compute_selector("roll(u96,u96)");
        let _ = context.call_private_function(dicesAddress, rollSelector, [0, seed as Field]); 
        let seedHash = pedersen_hash([seed as Field], 10);

        let selector = compute_selector("_register(Field,Field)");
        context.call_public_function(context.this_address(), selector, [context.msg_sender(), seedHash]); 
    }

    #[aztec(public)]
    internal fn _register(user: Field, seedHash: Field) {
        let mut game: Game = deserializeGame(storage.game.read());
        let mut registered = false;
        for i in 0..4 {
            if game.players[i] == 0 {
                if registered == false {
                game.players[i] = user;
                game.seedHashes[i] = seedHash;
                registered = true;
                }
            }
        }
        if game.players[3] != 0 {
            game.last_move = context.timestamp();
        }
        storage.game.write(serializeGame(game));
    }


    // Below this point is the stuff of nightmares.
    // This should ideally not be required. What do we do if vastly different types of serialized_notes?

    // docs:start:compute_note_hash_and_nullifier
    // Computes note hash and nullifier.
    // Note 1: Needs to be defined by every contract producing logs.
    // Note 2: Having it in all the contracts gives us the ability to compute the note hash and nullifier differently for different kind of notes.
    unconstrained fn compute_note_hash_and_nullifier(_: Field, _: Field, _: Field, _: [Field; 0]) -> [Field; 4] {
        [0, 0, 0, 0]
    }
    // docs:end:compute_note_hash_and_nullifier
}
// docs:end:token_all
