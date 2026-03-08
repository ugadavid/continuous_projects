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

// === Toggle All Words Visibility ===
const toggleAllBtn = document.getElementById('toggleAllBtn');
const allWordsList = document.getElementById('allWordsList');
toggleAllBtn.onclick = () => {
  allWordsList.style.display = allWordsList.style.display === 'none' ? 'block' : 'none';
};

// === Display all words with state + reset button ===
function displayAllWords() {
  const list = document.getElementById('allWordsList');
  list.innerHTML = '';
  const transaction = db.transaction(['words'], 'readonly');
  const store = transaction.objectStore('words');

  store.openCursor().onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      const w = cursor.value;
      const li = document.createElement('li');

      // État du mot
      const today = new Date().toISOString().split('T')[0];
      let stateClass = 'ok';
      let stateLabel = `Next: ${w.nextReview}`;
      if (!w.nextReview) {
        stateClass = 'new';
        stateLabel = 'New';
      } else if (w.nextReview <= today) {
        stateClass = 'due';
        stateLabel = 'To review';
      }

      li.innerHTML = `
        <span class="state ${stateClass}">${stateLabel}</span>
        <span>${w.en}</span><span>${w.fr}</span>
        <div>
          <button class="reset">↩️ Reset</button>
          <button class="ok">✅ OK</button>
          <button class="ko">❌ KO</button>
        </div>
      `;

      // Boutons d’action
      li.querySelector('.ok').onclick = () => updateWord(w, true);
      li.querySelector('.ko').onclick = () => updateWord(w, false);
      li.querySelector('.reset').onclick = () => resetWord(w);

      list.appendChild(li);
      cursor.continue();
    }
  };
}

// === Reset word ===
function resetWord(word) {
  const transaction = db.transaction(['words'], 'readwrite');
  const store = transaction.objectStore('words');
  word.stage_id = 1;
  const next = new Date();
  next.setDate(next.getDate() + 1);
  word.nextReview = next.toISOString().split('T')[0];
  store.put(word);
  transaction.oncomplete = () => displayAllWords();
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

// === MODE SWITCH ===
const editMode = document.getElementById('editMode');
const reviewMode = document.getElementById('reviewMode');
const editBtn = document.getElementById('editModeBtn');
const reviewBtn = document.getElementById('reviewModeBtn');

editBtn.onclick = () => switchMode('edit');
reviewBtn.onclick = () => switchMode('review');

function switchMode(mode) {
  if (mode === 'edit') {
    editMode.style.display = 'block';
    reviewMode.style.display = 'none';
    editBtn.classList.add('active');
    reviewBtn.classList.remove('active');
  } else {
    editMode.style.display = 'none';
    reviewMode.style.display = 'block';
    reviewBtn.classList.add('active');
    editBtn.classList.remove('active');
  }
}

// === REVIEW SESSION ===
let reviewList = [];
let currentIndex = 0;

document.getElementById('startReviewBtn').onclick = startReview;
document.getElementById('showBtn').onclick = showTranslation;
document.getElementById('okBtn').onclick = () => answer(true);
document.getElementById('koBtn').onclick = () => answer(false);
document.getElementById('nextBtn').onclick = nextWord;

function startReview() {
  reviewList = [];
  const transaction = db.transaction(['words'], 'readonly');
  const store = transaction.objectStore('words');
  const index = store.index('nextReview');
  const today = new Date().toISOString().split('T')[0];
  index.openCursor().onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      if (cursor.value.nextReview <= today) reviewList.push(cursor.value);
      cursor.continue();
    } else {
      currentIndex = 0;
      showWord();
    }
  };
}

function showWord() {
  if (reviewList.length === 0) {
    document.getElementById('wordENReview').textContent = "🎉 No words to review!";
    document.getElementById('wordFRReview').textContent = "";
    return;
  }
  const word = reviewList[currentIndex];
  document.getElementById('wordENReview').textContent = word.en;
  document.getElementById('wordFRReview').textContent = word.fr;
  document.getElementById('wordFRReview').classList.add('hidden');
}

function showTranslation() {
  document.getElementById('wordFRReview').classList.remove('hidden');
}

function answer(success) {
  if (reviewList.length === 0) return;
  const word = reviewList[currentIndex];
  updateWord(word, success);
  nextWord();
}

function nextWord() {
  if (reviewList.length === 0) return;
  currentIndex++;
  if (currentIndex >= reviewList.length) currentIndex = 0;
  showWord();
}

// === Keyboard shortcuts for review mode ===
document.addEventListener('keydown', (e) => {
  if (reviewMode.style.display === 'block') {
    if (e.key === 'ArrowRight') nextWord();
    if (e.key === 'ArrowLeft') showTranslation();
    if (e.key === 'Enter') answer(true);
    if (e.key === ' ') answer(false);
  }
});


