let db;

const request = indexedDB.open('Budget', 1);
// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('pending', { autoIncrement: true });
  };

  // upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    
    if (navigator.onLine) {
        uploadTransaction();
      
    }
  };
  
  request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };


function saveRecord(record) {
    const transaction = db.transaction(['pending'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('pending');
    transactionObjectStore.add(record);
  }

  function uploadTransaction() {
    // open a transaction on your db
    const transaction = db.transaction(['pending'], 'readwrite');
  
    // access your object store
    const transactionObjectStore = transaction.objectStore('pending');
  
    // get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll();
  
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
          fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
          })
            .then(response => response.json())
            .then(serverResponse => {
              if (serverResponse.message) {
                throw new Error(serverResponse);
              }
              // open one more transaction
              const transaction = db.transaction(['pending'], 'readwrite');
              const transactionObjectStore = transaction.objectStore('pending');
              transactionObjectStore.clear();
    
              alert('All saved transactions have been submitted!');
            })
            .catch(err => {
              console.log(err);
            });
        }
      };
  }

  window.addEventListener('online', uploadTransaction)