// IndexedDB setup
let db;
const request = indexedDB.open('vocabDB', 1);

request.onupgradeneeded = (e) => {
  db = e.target.result;
  const wordStore = db.createObjectStore('words', { keyPath: 'id', autoIncrement: true });
  wordStore.createIndex('nextReview', 'nextReview', { unique: false });
};

request.onsuccess = (e) => {
  db = e.target.result;
  displayAllWords();
  displayReviewWords();
};

request.onerror = (e) => console.error('IndexedDB error', e);

// Add word
document.getElementById('addBtn').onclick = addWord;
document.getElementById('wordEN').addEventListener('keydown', handleKey);
document.getElementById('wordFR').addEventListener('keydown', handleKey);

function handleKey(e) {
  if (e.key === 'Enter' || e.key === ' ') addWord();
}

// Core function: add word
function addWord() {
  const en = document.getElementById('wordEN').value.trim();
  const fr = document.getElementById('wordFR').value.trim();
  if (!en || !fr) return;

  const transaction = db.transaction(['words'], 'readwrite');
  const store = transaction.objectStore('words');
  const newWord = {
    en,
    fr,
    stage_id: 1,
    nextReview: new Date().toISOString().split('T')[0]
  };
  store.add(newWord);

  transaction.oncomplete = () => {
    document.getElementById('wordEN').value = '';
    document.getElementById('wordFR').value = '';
    displayAllWords();
    displayReviewWords();
  };
}

// Display all words
function displayAllWords() {
  const list = document.getElementById('allWordsList');
  list.innerHTML = '';
  const transaction = db.transaction(['words'], 'readonly');
  const store = transaction.objectStore('words');

  store.openCursor().onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      const li = document.createElement('li');
      li.innerHTML = `<span>${cursor.value.en}</span><span>${cursor.value.fr}</span>`;
      list.appendChild(li);
      cursor.continue();
    }
  };
}

// Display words due for review
function displayReviewWords() {
  const list = document.getElementById('reviewList');
  list.innerHTML = '';
  const today = new Date().toISOString().split('T')[0];
  const transaction = db.transaction(['words'], 'readonly');
  const store = transaction.objectStore('words');
  const index = store.index('nextReview');

  index.openCursor().onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      if (cursor.value.nextReview <= today) {
        const li = document.createElement('li');
        li.innerHTML = `
          <span>${cursor.value.en}</span><span>${cursor.value.fr}</span>
          <div>
            <button class="ok">OK</button>
            <button class="ko">KO</button>
          </div>`;
        li.querySelector('.ok').onclick = () => updateWord(cursor.value, true);
        li.querySelector('.ko').onclick = () => updateWord(cursor.value, false);
        list.appendChild(li);
      }
      cursor.continue();
    }
  };
}

// Update on OK/KO
function updateWord(word, success) {
  const transaction = db.transaction(['words'], 'readwrite');
  const store = transaction.objectStore('words');

  if (success) {
    word.stage_id = Math.min(word.stage_id + 1, 10);
    const days = [1, 3, 7, 15, 30, 60, 120, 180, 365, 730];
    const next = new Date();
    next.setDate(next.getDate() + days[word.stage_id - 1]);
    word.nextReview = next.toISOString().split('T')[0];
  } else {
    word.stage_id = 1;
    const next = new Date();
    next.setDate(next.getDate() + 1);
    word.nextReview = next.toISOString().split('T')[0];
  }

  store.put(word);
  transaction.oncomplete = () => displayReviewWords();
}

// Export JSON
document.getElementById('exportBtn').onclick = async () => {
  const words = [];
  const transaction = db.transaction(['words'], 'readonly');
  const store = transaction.objectStore('words');
  store.openCursor().onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      words.push(cursor.value);
      cursor.continue();
    } else {
      const blob = new Blob([JSON.stringify(words, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'vocab.json';
      a.click();
    }
  };
};

// Import JSON
document.getElementById('importBtn').onclick = () => document.getElementById('importFile').click();
document.getElementById('importFile').onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result);
    const transaction = db.transaction(['words'], 'readwrite');
    const store = transaction.objectStore('words');
    data.forEach(w => store.put(w));
    transaction.oncomplete = () => {
      displayAllWords();
      displayReviewWords();
    };
  };
  reader.readAsText(file);
};
