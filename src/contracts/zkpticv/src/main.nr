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
        game::{Game, GameSerializationMethods, GAME_SERIALIZED_LEN, serializeGame, deserializeGame, serializeField4, deserializeField4},
    };

    // docs:start:storage_struct
    struct Storage {
        dices: PublicState<Field, FIELD_SERIALIZED_LEN>,
        horses: PublicState<[Field;4], 4>,
        players: PublicState<[Field;4], 4>,
        seedHashes: PublicState<[Field;4], 4>,
        winner: PublicState<Field, FIELD_SERIALIZED_LEN>,
        round: PublicState<Field, FIELD_SERIALIZED_LEN>,
        last_timestamp: PublicState<Field, FIELD_SERIALIZED_LEN>,
        debug: PublicState<Field, FIELD_SERIALIZED_LEN>,
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
                horses: PublicState::new(
                    context,
                    2,
                    TypeSerializationInterface {
                        serialize: serializeField4,
                        deserialize: deserializeField4,
                    }
                ),
                players: PublicState::new(
                    context,
                    6,
                    TypeSerializationInterface {
                        serialize: serializeField4,
                        deserialize: deserializeField4,
                    }
                ),
                seedHashes: PublicState::new(
                    context,
                    10,
                    TypeSerializationInterface {
                        serialize: serializeField4,
                        deserialize: deserializeField4,
                    }
                ),
                winner: PublicState::new(
                    context,
                    14,
                    FieldSerializationMethods,
                ),
                round: PublicState::new(
                    context,
                    15,
                    FieldSerializationMethods,
                ),
                last_timestamp: PublicState::new(
                    context,
                    16,
                    FieldSerializationMethods,
                ),
                debug: PublicState::new(
                    context,
                    17,
                    FieldSerializationMethods,
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
    }

    #[aztec(private)]
    fn register(dicesAddress: Field, _seed: Field) {
        let seed: u96 = _seed as u96;
        let rollSelector = compute_selector("roll(u96,u96)");
        let _ = context.call_private_function(dicesAddress, rollSelector, [0, seed as Field]); 
        let seedHash = pedersen_hash([seed as Field], 10);

        let selector = compute_selector("_register(Field,Field)");
        context.call_public_function(context.this_address(), selector, [context.msg_sender(), seedHash]); 
    }

    #[aztec(public)]
    internal fn _register(user: Field, seedHash: Field) {
        let mut players = storage.players.read();
        let mut seedHashes = storage.seedHashes.read();
        let mut registered = false;
        for i in 0..4 {
            if players[i] == 0 {
                if registered == false {
                players[i] = user;
                seedHashes[i] = seedHash;
                registered = true;
                }
            }
        }
        if players[3] != 0 {
            storage.last_timestamp.write(context.timestamp());
        }
        storage.players.write(players);
        storage.seedHashes.write(seedHashes);
    }

    #[aztec(private)]
    fn play(dicesAddress: Field, _seed: Field, player: Field, _move: Field) {
       let seed: u96 = _seed as u96;
       let move: u8 = _move as u8;
       let seedHash = pedersen_hash([seed as Field], 10);
       let rollSelector = compute_selector("roll(u96,u96)");
       let _ = context.call_private_function(dicesAddress, rollSelector, [0, seed as Field]); 
       let playSelector = compute_selector("_play(Field,Field,u8)");
       context.call_public_function(context.this_address(), playSelector, [seedHash, player, move as Field]);
    }

    #[aztec(public)]
    internal fn _play(seedHash: Field, player: Field, _move: Field) {
        let move: u8 = _move as u8;
        let currentRound = storage.round.read();
        assert(currentRound as u120 % 4 == player as u120, "Not your turn");
        let selector = compute_selector("readDice(Field,u96)");
        let return_values = context.call_public_function(storage.dices.read(), selector, [context.this_address(), 0]);
        storage.debug.write(return_values[0]);
        let diceValue = return_values[0] as u8;
        let mut horsesRawValue: [Field;4] = storage.horses.read();
        let spawnPoint: u120 = 1 + (player * 14) as u120;
        let endPoint: u120 = 1 + ((((player * 14) + 55) as u120) % 56);
        if move < 4 {
            // get horse id based on player
            let horseId: u120 = move as u120;
            let mut horsesValue: u120 = horsesRawValue[player as u8] as u120;
            let horsePosition = (horsesValue >> (8 * horseId));
            if horsePosition == 0 {
                if diceValue == 6 {
                    for i in 0..4 {
                        for y in 0..4 {
                            assert(((horsesRawValue[i] as u120) >> (8 * (y as u120))) & (0xFF as u120) != spawnPoint , "Horse already on spawn point");
                        }
                    }
                    horsesValue = horsesValue | (1 << (8 * horseId));
                } else {
                    assert(false, "You can only move a horse out if you roll a 6");
                }
                horsesRawValue[player as u8] = horsesValue as Field;
            } else {
                let mut newHorsePosition = horsePosition + diceValue as u120;
                if (horsePosition == endPoint) {
                   let expected = 1;
                   if expected as u8 == diceValue {
                    newHorsePosition = 57;
                   } else {
                    newHorsePosition = horsePosition;
                   }
                } else {
                    if horsePosition > 56 {
                        let expected = horsePosition - 55;
                        if expected as u8 == diceValue {
                            newHorsePosition = horsePosition + 1;
                        } else {
                            newHorsePosition = horsePosition;
                        }
                    } else {
                let mut invalidPos = true;
                for i in 0..16 {
                    if invalidPos == true {
                    for hi in 0..4 {
                        for hy in 0..4 {
                            if ((horsesRawValue[hi as u120] as u120) >> (8 * (hy as u120))) & (0xFF as u120) == newHorsePosition {
                                    if hi == player {
                                        if hy != move {
                                            if newHorsePosition > 0 {
                                                newHorsePosition -= 1;
                                            } else {
                                                newHorsePosition = 55;
                                            }
                                        }
                                    } else {
                                        horsesRawValue[hi as u120] = ((horsesRawValue[hi as u120] as u120) & !(0xFF << (8 * (hy as u120)))) as Field;
                                        invalidPos = false;
                                    }
                            }
                        }
                    }
                    }
                }

                if horsePosition < endPoint {
                    if newHorsePosition > endPoint {
                        newHorsePosition = endPoint - (newHorsePosition - endPoint);
                    }
                }

                if newHorsePosition > 56 {
                    newHorsePosition = ((newHorsePosition - 1) % 56) + 1;
                }
                }
                }

                horsesRawValue[player as u120] = ((((horsesRawValue[player as u8] as u120) & !(0xFF << (8 * (horseId as u120)))) as u120) | ((newHorsePosition << (8 * horseId)) as u120)) as Field;
                if (newHorsePosition == 62) {
                    storage.winner.write(player + 1);
                }
            }
            storage.horses.write(horsesRawValue);
            if diceValue != 6 {
                storage.round.write(currentRound + 1);
            }
        }
    }

    unconstrained fn players() -> [Field; 4] {
        storage.players.read()
    }

    unconstrained fn seedHashes() -> [Field; 4] {
        storage.seedHashes.read()
    }

    unconstrained fn dices() -> Field {
        storage.dices.read()
    }

    unconstrained fn horses() -> [Field;4] {
        storage.horses.read()
    }

    unconstrained fn winner() -> Field {
        storage.winner.read()
    }

    unconstrained fn round() -> Field {
        storage.round.read()
    }

    unconstrained fn last_timestamp() -> Field {
        storage.last_timestamp.read()
    }

    unconstrained fn debug() -> Field {
        storage.debug.read()
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
