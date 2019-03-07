//import io from 'socket.io-client';

const socket = io.connect(
    'http://localhost:3000',
    {
        transports: ['websocket'],
        reconnectionDelay: 100,
        reconnectionDelayMax: 1000,
    },
);

// STATE

const state = {
    dataset: '', // save the name of the actual dataset
    count: 0, // count of all nodes
    nodes: [], // TODO is there a way to initial the array bedder
};

// AKTIONS

const CLEAR_ALL = 0;

const UPDATE_EMBEDING = 0;

const SET_DATASET = 0;

const GET_IMAGES = 0;

/*
    1. get name/id of Dataset from main thread (args)
    2. load information from server
        - count #
        - names
    3. get
*/

// actionHandler is used for the messages and also can be handlet from other functions
const actionHandler = (action = { type: undefined, payload: undefined }) => {
    switch (action.type) {
    case SET_DATASET:
        state.dataset = action.payload;

        // TODO fetch dataset from the server

        // TODO create all nodes with {name, id, imgs, x, y)
        break;
    case CLEAR_ALL:
        state.nodes = [];
        state.count = 0;
        // TODO drigger draw???
        break;

    case GET_IMAGES:
        // TODO first get all over the socket like before with (dataset)

        // TODO second - iterate over all nodes and fetch images - if possible as bytes

    default:
        return null;
    }

    return null;
};

/* TODO
    Der canvas Store sollte eigentlich in einem worker sein
    1. Speichern der großen Datenmenegn in einem eigenen thread
    2. berechnen des canvas in einem eigenen Thread

    Der main Thread kann mit dem Worker über eigenens feinierten events kommunizieren die über das 'type' att definerit werden
    die selben events können dann auch für die/den Socket genutzt werden
    - type: GET_DATASET
    - type: GET_IMG
    - type: UPDATE_EMBEDING
*
*
* */

// Respond to message from parent thread
self.onmessage = (event) => {
    console.log('worker gets a massage');
    console.log(event);
    console.log(event.data);

    // Post data to parent thread
    self.postMessage({ someData: 1 });
};
