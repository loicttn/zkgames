mod types;

// Minimal token implementation that supports `AuthWit` accounts.
// The auth message follows a similar pattern to the cross-chain message and includes a designated caller.
// The designated caller is ALWAYS used here, and not based on a flag as cross-chain.
// message hash = H([caller, contract, selector, ...args])
// To be read as `caller` calls function at `contract` defined by `selector` with `args`
// Including a nonce in the message hash ensures that the message can only be used once.

contract Dices {

    use dep::aztec::{
        hash::pedersen_hash,
        selector::compute_selector,
        context::{PrivateContext, PublicContext, Context},
        types::type_serialization::{
            field_serialization::{FieldSerializationMethods, FIELD_SERIALIZED_LEN},
        },
        state_vars::{map::Map, public_state::PublicState, set::Set},
        types::address::{AztecAddress},
    };

    // docs:start:storage_struct
    struct Storage {
        dices: Map<PublicState<Field, FIELD_SERIALIZED_LEN>>,
    }
    // docs:end:storage_struct

    // docs:start:storage_init
    impl Storage {
        fn init(context: Context) -> Self {
            Storage {
                // docs:start:storage_admin_init
                dices: Map::new(
                    context,
                    1,
                    |context, slot| {
                        PublicState::new(
                            context,
                            slot,
                            FieldSerializationMethods,
                        )
                    },
                )
            }
        }
    }
    // docs:end:storage_init

    // docs:start:constructor
    #[aztec(private)]
    fn constructor() {
    }
    // docs:end:constructor

    #[aztec(public)]
    internal fn _roll(diceId: Field, seed: Field) {
        let dice = storage.dices.at(diceId).read();
        let newDice = pedersen_hash([dice as Field, seed as Field], 10);
        storage.dices.at(diceId).write(newDice);
    }

    // docs:start:shuffle
    #[aztec(private)]
    fn roll(game_id: u96, seed: u96) {
        let msg_sender = context.msg_sender();
        let diceId = pedersen_hash([msg_sender, game_id as Field], 10);
        
        let getterSelector = compute_selector("_roll(Field,Field)");
        context.call_public_function(context.this_address(), getterSelector, [diceId, seed as Field]);
    }
    // docs:end:shuffle

    unconstrained fn dice(addr: Field, _game_id: Field) -> u8 {
        let game_id: u96 = _game_id as u96;
        let x = [addr, game_id as Field];
        let diceId = pedersen_hash(x, 10);
        (storage.dices.at(diceId).read() as u8 % 6) + 1
    }

    #[aztec(public)]
    fn readDice(addr: Field, game_id: u96) -> u8 {
        let x = [addr, game_id as Field];
        let diceId = pedersen_hash(x, 10);
        (storage.dices.at(diceId).read() as u8 % 6) + 1
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
