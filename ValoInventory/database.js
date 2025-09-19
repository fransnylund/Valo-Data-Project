/*
    Functions:
        addItem(date, description, quantity, category, location)
        addCategory(categoryName)
        addLocation(locationName)
        updateItem(item)
        updateCategory(oldName, newName)
        updateLocation(oldName, newName)
        removeItem(id)
        removeCategory(categoryName)
        removeLocation(locationName)
        getItems() -> [{ id, date, description, quantity, category, location }]
        getCategories() -> [String]
        getLocations() -> [String]

    Example usage:
        addItem(
            date.toDateString(),
            document.getElementById("description").value,
            document.getElementById("quantity").value,
            document.getElementById("category").value,
            document.getElementById("location").value
        );
        const items = await getItems();
        document.getElementById("test").innerText += items.map(item =>
            `id: ${item.id} date: ${item.date} description: ${item.description} quantity: ` + 
            `${item.quantity} category: ${item.category} location: ${item.location}\n`).join('');
        updateItem({id: 1, date: date.toDateString(), description: 'Mouse', quantity: 2,
            category: 'Peripherals', location: 'Cabinet 2'});
        removeItem(document.getElementById("description").value);
        addCategory(document.getElementById("description").value)
*/
let db;
function initDatabase() {
    let request = indexedDB.open('inventoryDatabase', 3);

    request.onerror = function (event) {
        error('Database failed to open: ' + event.target.errorCode, true);
    };

    request.onsuccess = function (event) {
        db = event.target.result;
    };

    request.onupgradeneeded = function (event) {
        try {
            db = event.target.result;
            if (event.oldVersion < 1) {
                let store = db.createObjectStore('items', {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                store.createIndex('date', 'date');
                store.createIndex('description', 'description');
                store.createIndex('quantity', 'quantity');
                store.createIndex('category', 'category');
                store.createIndex('location', 'location');
            }
            if (event.oldVersion < 2) {
                let store = db.createObjectStore('categories', { keyPath: 'name' });
            }
            if (event.oldVersion < 3) {
                let store = db.createObjectStore('locations', { keyPath: 'name' });
            }
        } catch (e) {
            error('Error: ' + e.message, true);
        }
    };
}
initDatabase();

function addItem(date, description, quantity, category, location) {
    const tx = db.transaction('items', 'readwrite');
    const store = tx.objectStore('items');
    store.add({
        date: date,
        description: description,
        quantity: quantity,
        category: category,
        location: location,
    });
}

function addCategory(categoryName) {
    const tx = db.transaction('categories', 'readwrite');
    const store = tx.objectStore('categories');
    store.add({ name: categoryName });
}

function addLocation(locationName) {
    const tx = db.transaction('locations', 'readwrite');
    const store = tx.objectStore('locations');
    store.add({ name: locationName });
}

/*
    updateItem input parameter should be an object with 6 proporties:
        id, date, descrption, quantity, category, location

    e.g.
    const item = {
        id: 6,
        date: date.toDateString(),
        description: 'Mouse',
        quantity: 3,
        category: 'Peripherals',
        location: 'Cabinet 2'
    };
    updateItem(item);
*/
function updateItem(item) {
    const tx = db.transaction('items', 'readwrite');
    const store = tx.objectStore('items');
    store.put(item);
}

function updateCategory(oldName, newName) {
    const tx = db.transaction('categories', 'readwrite');
    const store = tx.objectStore('categories');
    store.delete(oldName);
    store.add({ name: newName });
}

function updateLocation(oldName, newName) {
    const tx = db.transaction('locations', 'readwrite');
    const store = tx.objectStore('locations');
    store.delete(oldName);
    store.add({ name: newName });
}

function removeItem(id) {
    const tx = db.transaction('items', 'readwrite');
    const store = tx.objectStore('items');
    store.delete(+id);
}

function removeCategory(categoryName) {
    const tx = db.transaction('categories', 'readwrite');
    const store = tx.objectStore('categories');
    store.delete(categoryName);
}

function removeLocation(locationName) {
    const tx = db.transaction('categories', 'readwrite');
    const store = tx.objectStore('categories');
    store.delete(locationName);
}

/*
    Returns an array containing all items as objects with the proporties:
        id, date, description, quantity, category, location
*/
async function getItems() {
    try {
        return new Promise((resolve) => {
            const output = new Array();
            const tx = db.transaction('items', 'readonly');
            const store = tx.objectStore('items');
            var request = store.openCursor();

            request.onsuccess = function () {
                var cursor = request.result;
                if (cursor) {
                    output.push({
                        id: cursor.value.id,
                        date: cursor.value.date,
                        description: cursor.value.description,
                        quantity: cursor.value.quantity,
                        category: cursor.value.category,
                        location: cursor.value.location,
                    });
                    cursor.continue();
                }
            };

            tx.oncomplete = function () {
                resolve(output);
            };
        });
    } catch (e) {
        error('Error: ' + e.message, true);
    }
}

/*
    Returns an array containing the names of all categories
*/
async function getCategories() {
    try {
        return new Promise((resolve) => {
            const output = new Array();
            const tx = db.transaction('categories', 'readonly');
            const store = tx.objectStore('categories');
            var request = store.openCursor();

            request.onsuccess = function () {
                var cursor = request.result;
                if (cursor) {
                    output.push(cursor.value.name);
                    cursor.continue();
                }
            };

            tx.oncomplete = function () {
                resolve(output);
            };
        });
    } catch (e) {
        error('Error: ' + e.message, true);
    }
}

/*
    Returns an array containing the names of all locations
*/
async function getLocations() {
    try {
        return new Promise((resolve) => {
            const output = new Array();
            const tx = db.transaction('locations', 'readonly');
            const store = tx.objectStore('locations');
            var request = store.openCursor();

            request.onsuccess = function () {
                var cursor = request.result;
                if (cursor) {
                    output.push(cursor.value.name);
                    cursor.continue();
                }
            };

            tx.oncomplete = function () {
                resolve(output);
            };
        });
    } catch (e) {
        error('Error: ' + e.message, true);
    }
}

//==============================================================================
// temp old functions for writing data to text file
// TODO: remove these, not needed
function saveData(date, description, quantity, category, location) {
    const fs = require('fs');
    fs.appendFileSync('data.txt',
        date + ',' + description + ',' + quantity + ',' +
        category + ',' + location + '\n',
    );
}

async function getData() {
    try {
        const { readFile } = require('node:fs/promises');
        const { resolve } = require('node:path');
        const filePath = resolve('./data.txt');
        const contents = await readFile(filePath, { encoding: 'utf8' });
        const lines = contents.split('\n');
        lines.pop();
        const output = new Array();
        for (i in lines) {
            output.push(lines[i].split(','));
        }
        return output;
    } catch (e) {
        error('Error: ' + e.message);
    }
}
