const DB_NAME = 'NotesPlusDB';
const DB_VERSION = 1;
const STORE_NAME = 'backgroundImages';
const KEY = 'userBackgrounds';

let db: IDBDatabase;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('Error opening DB');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function getImages(): Promise<string[]> {
  const db = await getDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(KEY);

    request.onsuccess = () => {
      resolve(request.result || []); // Return empty array if nothing is found
    };
    
    request.onerror = () => {
        console.error('Error fetching images from DB:', request.error);
        resolve([]); // Return empty on error to prevent app crash
    }
  });
}

export async function saveImages(images: string[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(images, KEY);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
        console.error('Error saving images to DB:', request.error);
        reject('Could not save images.');
    };
  });
}

export async function clearImages(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };
      
    request.onerror = () => {
        console.error('Error clearing images from DB:', request.error);
        reject('Could not clear images.');
    };
  });
}
