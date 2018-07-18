

/*onmessage = function (event) {
    console.log('inside the worker');
    console.log(event);
    console.log(event.data);

    postMessage({ someData: 1 });
};*/


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
