class Book {
    constructor(id, title, author, year, isComplete = false) {
        this.id = id || Date.now().toString();
        this.title = title;
        this.author = author;
        this.year = year;
        this.isComplete = isComplete;
    }
}

const STORAGE_KEY = 'BOOKSHELF_APPS';
let books = [];
let isEditing = false;
let editingBookId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadDataFromStorage();
    refreshBookList();
    setupEventListeners();
});

function setupEventListeners() {
    const bookForm = document.getElementById('bookForm');
    bookForm.addEventListener('submit', handleBookSubmit);

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', handleSearchSubmit);

    const completeCheckbox = document.getElementById('bookFormIsComplete');
    completeCheckbox.addEventListener('change', updateSubmitButtonText);

    const clearStorageButton = document.getElementById('clearStorageButton');
    clearStorageButton.addEventListener('click', clearLocalStorage);
}

function handleBookSubmit(e) {
    e.preventDefault();
    const titleInput = document.getElementById('bookFormTitle');
    const authorInput = document.getElementById('bookFormAuthor');
    const yearInput = document.getElementById('bookFormYear');
    const isCompleteInput = document.getElementById('bookFormIsComplete');

    const book = new Book(
        isEditing ? editingBookId : null,
        titleInput.value,
        authorInput.value,
        parseInt(yearInput.value),
        isCompleteInput.checked
    );

    if (isEditing) {
        updateBook(book);
    } else {
        addBook(book);
    }

    e.target.reset();
    isEditing = false;
    editingBookId = null;
    document.getElementById('bookFormSubmit').querySelector('span').textContent = 'Belum selesai dibaca';
}

function handleSearchSubmit(e) {
    e.preventDefault();
    const searchTerm = document.getElementById('searchBookTitle').value.toLowerCase();
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm)
    );
    refreshBookList(filteredBooks);
}

function addBook(book) {
    books.push(book);
    saveDataToStorage();
    refreshBookList();
}

function updateBook(updatedBook) {
    const index = books.findIndex(book => book.id === updatedBook.id);
    if (index !== -1) {
        books[index] = updatedBook;
        saveDataToStorage();
        refreshBookList();
    }
}

function deleteBook(bookId) {
    const confirmDelete = confirm('Apakah Anda yakin ingin menghapus buku ini?');
    if (confirmDelete) {
        books = books.filter(book => book.id !== bookId);
        saveDataToStorage();
        refreshBookList();
    }
}

function toggleBookComplete(bookId) {
    const book = books.find(book => book.id === bookId);
    if (book) {
        book.isComplete = !book.isComplete;
        saveDataToStorage();
        refreshBookList();
    }
}

function editBook(bookId) {
    const book = books.find(book => book.id === bookId);
    if (book) {
        isEditing = true;
        editingBookId = bookId;

        document.getElementById('bookFormTitle').value = book.title;
        document.getElementById('bookFormAuthor').value = book.author;
        document.getElementById('bookFormYear').value = book.year;
        document.getElementById('bookFormIsComplete').checked = book.isComplete;

        updateSubmitButtonText();
        document.getElementById('bookFormTitle').focus();
    }
}

function createBookElement(book) {
    const bookElement = document.createElement('div');
    bookElement.setAttribute('data-bookid', book.id);
    bookElement.setAttribute('data-testid', 'bookItem');

    bookElement.innerHTML = `
      <h3 data-testid="bookItemTitle">${book.title}</h3>
      <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
      <p data-testid="bookItemYear">Tahun: ${book.year}</p>
      <div>
        <button data-testid="bookItemIsCompleteButton">
          ${book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca'}
        </button>
        <button data-testid="bookItemDeleteButton">Hapus Buku</button>
        <button data-testid="bookItemEditButton">Edit Buku</button>
      </div>
    `;

    bookElement.querySelector('[data-testid="bookItemIsCompleteButton"]')
        .addEventListener('click', () => toggleBookComplete(book.id));

    bookElement.querySelector('[data-testid="bookItemDeleteButton"]')
        .addEventListener('click', () => deleteBook(book.id));

    bookElement.querySelector('[data-testid="bookItemEditButton"]')
        .addEventListener('click', () => editBook(book.id));

    return bookElement;
}

function refreshBookList(booksToDisplay = books) {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    booksToDisplay.forEach(book => {
        const bookElement = createBookElement(book);
        if (book.isComplete) {
            completeBookList.appendChild(bookElement);
        } else {
            incompleteBookList.appendChild(bookElement);
        }
    });
}

function updateSubmitButtonText() {
    const isComplete = document.getElementById('bookFormIsComplete').checked;
    const submitButton = document.getElementById('bookFormSubmit');
    const buttonText = submitButton.querySelector('span');
    buttonText.textContent = isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData) {
        books = JSON.parse(serializedData);
    }
}

function saveDataToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function clearLocalStorage() {
    const confirmClear = confirm('Apakah Anda yakin ingin menghapus semua data di localStorage?');
    if (confirmClear) {
        localStorage.removeItem(STORAGE_KEY);
        books = [];
        refreshBookList();
    }
}
