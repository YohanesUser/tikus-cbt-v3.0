let questions = [];

// Fungsi untuk memuat pertanyaan dari file JSON
async function loadQuestions() {
    try {
        const response = await fetch("../data/questions.json");
        if (!response.ok) throw new Error("Gagal memuat data!");

        questions = await response.json();
        console.log("Data soal berhasil dimuat:", questions);
        loadQuestion();
    } catch (error) {
        console.error("Error:", error);
    }
}

// Fungsi untuk memuat pertanyaan saat ini
function loadQuestion() {
    // Implementasi untuk memuat pertanyaan
}

// Peringatan saat ingin meninggalkan halaman
window.addEventListener('beforeunload', function (e) {
    // Memutar bunyi peringatan
    const alertSound = document.getElementById('alert-sound');
    alertSound.play(); // Memutar bunyi

    // Pesan peringatan
    const confirmationMessage = "Anda yakin ingin meninggalkan halaman ini? Semua jawaban yang belum disimpan akan hilang.";
    
    // Untuk beberapa browser, Anda perlu mengatur returnValue
    e.returnValue = confirmationMessage; // Standar
    return confirmationMessage; // Beberapa browser mungkin memerlukan ini
});

// Panggil fungsi untuk memuat pertanyaan saat halaman dimuat
loadQuestions();

function loadQuestion() {
    if (questions.length > 0) {
        const questionContainer = document.getElementById("question-container");
        questionContainer.innerText = questions[0].question; // Menampilkan soal
        questionContainer.classList.add("no-copy"); // Menambahkan class no-copy
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadQuestions();

    // Mencegah klik kanan
    document.addEventListener("contextmenu", (event) => event.preventDefault());

    // Mencegah kombinasi tombol copy (Ctrl+C, Ctrl+U, dll.)
    document.addEventListener("keydown", (event) => {
        if (event.ctrlKey && ["c", "u", "s", "p"].includes(event.key.toLowerCase())) {
            event.preventDefault();
        }
    });
});

document.addEventListener('selectstart', function (e) {
    e.preventDefault(); // Mencegah pemilihan teks
});

document.addEventListener('copy', function (e) {
    e.preventDefault(); // Mencegah copy teks
});

document.addEventListener('contextmenu', function (e) {
    e.preventDefault(); // Mencegah klik kanan
});

document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && ['c', 'u', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault(); // Mencegah Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+P
    }
});



















;
let userName = localStorage.getItem("userName") || "";

// Jika nama kosong, minta input
if (!userName.trim()) {
    userName = prompt("Masukkan nama Anda (nama asli):").trim();
    if (userName) {
        localStorage.setItem("userName", userName);
    } else {
        alert("Nama tidak boleh kosong!");
        location.reload(); // Reload jika tidak ada input
    }
}

// Menampilkan nama pengguna di halaman
document.getElementById('user-name').textContent = ` ${userName}`;
document.querySelector('.user-info').style.display = 'flex';

// Fungsi untuk mengirim hasil ke WhatsApp
function submitQuiz() {
    clearInterval(timerInterval);

    const score = selectedAnswers.reduce((acc, answer, index) => {
        return answer === questions[index]?.answer ? acc + 1 : acc;
    }, 0);

    const totalQuestions = questions.length;
    if (totalQuestions === 0) {
        alert("Tidak ada soal yang tersedia!");
        return;
    }

    const percentage = (score / totalQuestions) * 100;
    const nilai = percentage.toFixed(2);

    // Pastikan nama tersimpan dan tidak 'undefined' saat dikirim
    let nama = userName || "Tidak diketahui";

    let data = { nama: nama, nilai: nilai };

    // Kirim data ke Google Sheet
    fetch("https://script.google.com/macros/s/AKfycbyfNmrVJ3_NyAnMuMI0LIYRLDFlOqG1ZU0XzypHeiphoxw3JJiGK9-nsxgt8aHSwUut-w/exec", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === "success") {
            alert("Kuis selesai! Nilai Anda: " + nilai);
        } else {
            throw new Error("Gagal menyimpan data di Google Sheet!");
        }
    })
    .catch(error => {
        alert("Terjadi kesalahan saat mengirim data!");
        console.error("Error:", error);
    });

    setTimeout(() => {
        const phoneNumber = "6289530067456";
        const message = `Nilai PROJOTAMANSARI: ${nama} adalah ${score} dari ${totalQuestions} (${percentage.toFixed(2)}%)`;
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
    }, 1000);
}

document.getElementById('submit').addEventListener('click', submitQuiz);



// Menampilkan nama pengguna di halaman
if (userName) {
    document.getElementById('user-name').textContent = ` ${userName}`;
    document.querySelector('.user-info').style.display = 'flex'; // Menampilkan elemen
} else {
    document.getElementById('user-name').textContent = "tidak diketahui";
    document.querySelector('.user-info').style.display = 'flex'; // Menampilkan elemen
}

// Timer untuk kuis
let timeRemaining = 30 * 60;
let timerInterval = setInterval(() => {
    timeRemaining -= 1;
    document.getElementById('time').textContent = formatTime(timeRemaining);
    if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        alert('Waktu habis! Soal akan disubmit.');
        submitQuiz();
    }
}, 1000);

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsRemaining = seconds % 60;
    return `${minutes}:${secondsRemaining.toString().padStart(2, '0')}`;
}

// Inisialisasi variabel
let currentPage = 1;
const selectedAnswers = new Array(questions.length).fill(null);
let answeredQuestions = [];

// Muat soal saat ini
function loadQuestion() {
    const questionData = questions[currentPage - 1];
    document.getElementById('question').textContent = questionData.question;

    // Tampilkan gambar soal jika ada
    const questionImage = document.getElementById('question-image');
    if (questionData.image) {
        questionImage.src = questionData.image;
        questionImage.style.display = 'block';
    } else {
        questionImage.style.display = 'none';
    }

    // Tampilkan pilihan jawaban
    const optionsElement = document.getElementById('options');
    optionsElement.innerHTML = '';

    questionData.options.forEach((option, index) => {
        const li = document.createElement('li');
        
        if (option.image) {
            const img = document.createElement('img');
            img.src = option.image;
            img.alt = option.alt || "Jawaban";
            img.classList.add('option-image');
            li.appendChild(img);
        } else {
            li.textContent = option.text || option;
        }
        
        li.addEventListener('click', () => selectOption(index));
        
        if (selectedAnswers[currentPage - 1] === index) {
            li.classList.add('selected');
        }
        
        optionsElement.appendChild(li);
    });

    document.getElementById('next').style.display = (currentPage === questions.length) ? 'none' : 'inline-block';
    document.getElementById('submit').style.display = (currentPage === questions.length) ? 'inline-block' : 'none';
}

// Pilih jawaban
function selectOption(index) {
    selectedAnswers[currentPage - 1] = index;

    if (!answeredQuestions.includes(currentPage - 1)) {
        answeredQuestions.push(currentPage - 1);
    }

    loadQuestion();
}

// Navigasi soal
document.getElementById('next').addEventListener('click', () => {
    if (currentPage < questions.length) {
        currentPage++;
        document.getElementById('current-question').textContent = currentPage;
        loadQuestion();
    }
});

document.getElementById('back').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        document.getElementById('current-question').textContent = currentPage;
        loadQuestion();
    }
});



// Tambahkan event listener hanya sekali
document.getElementById('submit').addEventListener('click', submitQuiz);


// Tampilkan daftar soal
document.getElementById('view-questions').addEventListener('click', () => {
    const questionListElement = document.getElementById('question-list');
    const questionListUl = questionListElement.querySelector('ul');
    questionListUl.innerHTML = '';

    questions.forEach((_, index) => {
        const li = document.createElement('li');
        li.textContent = `Soal ${index + 1}`;
        
        if (answeredQuestions.includes(index)) {
            li.textContent += ' - Sudah Dijawab';
        }
        
        li.addEventListener('click', () => {
            currentPage = index + 1;
            document.getElementById('current-question').textContent = currentPage;
            loadQuestion();
            questionListElement.style.display = 'none';
        });
        
        questionListUl.appendChild(li);
    });

    questionListElement.style.display = 'block';
});

document.getElementById('close-list').addEventListener('click', () => {
    document.getElementById('question-list').style.display = 'none';
});

let pressTimer;
const questionImage = document.getElementById('question-image');

// Function to add zoom on mouse and touch
function zoomIn() {
    questionImage.classList.add('zoomed');
}

// Function to remove zoom on mouse and touch
function zoomOut() {
    questionImage.classList.remove('zoomed');
}

// For mouse events
questionImage.addEventListener('mousedown', function() {
    pressTimer = setTimeout(zoomIn, 0.00); // Start zoom after 500ms hold
});

questionImage.addEventListener('mouseup', function() {
    clearTimeout(pressTimer); // Clear the zoom-in timer
    zoomOut();
});

questionImage.addEventListener('mouseleave', function() {
    clearTimeout(pressTimer); // Clear the zoom-in timer when mouse leaves
    zoomOut();
});

// For touch events (mobile compatibility)
questionImage.addEventListener('touchstart', function() {
    pressTimer = setTimeout(zoomIn, 0.00); // Start zoom after 500ms touch hold
});

questionImage.addEventListener('touchend', function() {
    clearTimeout(pressTimer); // Clear the zoom-in timer
    zoomOut();
});

questionImage.addEventListener('touchcancel', function() {
    clearTimeout(pressTimer); // Clear the zoom-in timer if touch is canceled
    zoomOut();
});

// Inisialisasi pertama
loadQuestion();

// Menangani dropdown untuk mengubah ukuran teks
const textSizeToggleButton = document.getElementById('text-size-toggle');
const textSizeOptions = document.getElementById('text-size-options');
const increaseTextSizeOption = document.getElementById('increase-text-size');
const decreaseTextSizeOption = document.getElementById('decrease-text-size');
const questionTitle = document.getElementById('question');
const questionOptions = document.getElementById('options');

// Ukuran font awal
let titleFontSize = 1.2; // Ukuran font awal untuk h2 (em)
let optionFontSize = 0.8; // Ukuran font awal untuk li (em)

// Toggle tampilkan/ sembunyikan pilihan ukuran teks
textSizeToggleButton.addEventListener('click', () => {
    const isVisible = textSizeOptions.style.display === 'block';
    textSizeOptions.style.display = isVisible ? 'none' : 'block';
});

// Fungsi untuk memperbesar teks
increaseTextSizeOption.addEventListener('click', () => {
    titleFontSize += 0.1; // Menambah ukuran font h2
    optionFontSize += 0.1; // Menambah ukuran font li
    updateTextSize(); // Memperbarui ukuran teks
    textSizeOptions.style.display = 'none'; // Menutup dropdown setelah memilih
});

// Fungsi untuk memperkecil teks
decreaseTextSizeOption.addEventListener('click', () => {
    titleFontSize = Math.max(0.5, titleFontSize - 0.1); // Mengurangi ukuran font h2 (dengan batas minimum)
    optionFontSize = Math.max(0.5, optionFontSize - 0.1); // Mengurangi ukuran font li (dengan batas minimum)
    updateTextSize(); // Memperbarui ukuran teks
    textSizeOptions.style.display = 'none'; // Menutup dropdown setelah memilih
});

// Fungsi untuk memperbarui ukuran teks
function updateTextSize() {
    questionTitle.style.fontSize = `${titleFontSize}em`; // Update ukuran teks h2
    const options = questionOptions.getElementsByTagName('li');
    for (let option of options) {
        option.style.fontSize = `${optionFontSize}em`; // Update ukuran teks li
    }
}
// Mencegah pemilihan teks
document.addEventListener('selectstart', function (e) {
    e.preventDefault(); // Menonaktifkan pemilihan teks
});

// Mencegah salin (copy)
document.addEventListener('copy', function (e) {
    e.preventDefault(); // Menonaktifkan aksi salin
});

// Mencegah klik kanan untuk membuka menu konteks
document.addEventListener('contextmenu', function (e) {
    e.preventDefault(); // Menonaktifkan menu konteks (klik kanan)
});
// Mencegah tombol back
window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.pushState(null, null, window.location.href);
};
window.addEventListener('beforeunload', function (e) {
    e.preventDefault(); // Membatalkan event default
    e.returnValue = ''; // Menampilkan peringatan kepada pengguna
});
window.addEventListener('beforeunload', function (e) {
    e.preventDefault(); // Membatalkan event default
    e.returnValue = 'Anda yakin ingin meninggalkan halaman ini?'; // Pesan peringatan
});
function goFullscreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) { // Firefox
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
        document.documentElement.msRequestFullscreen();
    }
}

goFullscreen();
// Menyimpan data
function saveData() {
    const userData = {
        username: "JohnDoe",
        progress: 50,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem("userData", JSON.stringify(userData));
    console.log("Data disimpan");
}

// Mengambil data
function loadData() {
    const savedData = localStorage.getItem("userData");
    if (savedData) {
        const userData = JSON.parse(savedData);
        console.log("Data dimuat:", userData);
    } else {
        console.log("Tidak ada data yang disimpan");
    }
}

// Menghapus data
function clearData() {
    localStorage.removeItem("userData");
    console.log("Data dihapus");
}

// Panggil fungsi untuk menyimpan atau memuat data
saveData(); // Menyimpan data
loadData(); // Mengambil data
// Menyimpan data
function saveSessionData() {
    const sessionData = {
        level: 5,
        score: 1000
    };
    sessionStorage.setItem("sessionData", JSON.stringify(sessionData));
    console.log("Data sesi disimpan");
}

// Mengambil data sesi
function loadSessionData() {
    const savedSessionData = sessionStorage.getItem("sessionData");
    if (savedSessionData) {
        const sessionData = JSON.parse(savedSessionData);
        console.log("Data sesi dimuat:", sessionData);
    } else {
        console.log("Tidak ada data sesi yang disimpan");
    }
}

// Menghapus data sesi
function clearSessionData() {
    sessionStorage.removeItem("sessionData");
    console.log("Data sesi dihapus");
}

// Panggil fungsi untuk menyimpan atau memuat data sesi
saveSessionData(); // Menyimpan data sesi
loadSessionData(); // Mengambil data sesi
let db;

const request = indexedDB.open("userDataDB", 1);

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("Database dibuka");
    storeData();
};

request.onerror = function(event) {
    console.error("Error membuka database", event.target.error);
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("users", { keyPath: "id" });
    objectStore.createIndex("name", "name", { unique: false });
    console.log("Object store dibuat");
};

function storeData() {
    const transaction = db.transaction(["users"], "readwrite");
    const objectStore = transaction.objectStore("users");
    const userData = { id: 1, name: "John Doe", progress: 75 };
    objectStore.add(userData);
    console.log("Data disimpan dalam IndexedDB");
}

function getData() {
    const transaction = db.transaction(["users"]);
    const objectStore = transaction.objectStore("users");
    const request = objectStore.get(1);
    
    request.onsuccess = function(event) {
        console.log("Data yang diambil:", event.target.result);
    };

    request.onerror = function(event) {
        console.error("Gagal mengambil data", event.target.error);
    };
}

function clearData() {
    const transaction = db.transaction(["users"], "readwrite");
    const objectStore = transaction.objectStore("users");
    objectStore.clear();
    console.log("Data dihapus dari IndexedDB");
}
window.addEventListener("beforeunload", function(e) {
    // Simpan data sebelum keluar
    localStorage.setItem("userData", JSON.stringify({ username: "JohnDoe", progress: 50 }));
});

// Fungsi untuk masuk ke mode layar penuh
function enterFullscreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen(); // Untuk browser desktop
    } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen(); // Firefox
    } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(); // Chrome, Safari, dan Opera
    } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen(); // Internet Explorer/Edge
    }
}


