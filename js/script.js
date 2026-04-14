(function() {
    "use strict";

    // =====================
    // GOOGLE APPS SCRIPT URL
    // =====================
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby_DN2pad9OyDl7s2WBgzcny5kZgJCUZ5A97klbrcsHZHxhxf1DMlrDwAYR0gf6cqJixA/exec';

    // DOM Elements
    const overlay = document.getElementById('overlay');
    const mainContent = document.getElementById('main-content');
    const openBtn = document.getElementById('open-invitation-btn');
    const music = document.getElementById('wedding-music');
    const musicToggle = document.getElementById('music-toggle');
    const musicBtn = document.getElementById('music-btn');
    const guestNameSpan = document.getElementById('guest-name');
    const countdownEl = document.getElementById('countdown');
    const rsvpForm = document.getElementById('rsvp-form');
    const wishesList = document.getElementById('wishes-list');
    const commentCountSpan = document.getElementById('comment-count');
    const wishesLoading = document.getElementById('wishes-loading');

    // Guest name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const guestParam = urlParams.get('to') || urlParams.get('guest');
    if (guestParam && guestNameSpan) {
        guestNameSpan.textContent = decodeURIComponent(guestParam.replace(/\+/g, ' '));
    }

    // Open Invitation (DENGAN AUTO-PLAY MUSIK)
    function openInvitation() {
        overlay.classList.add('hidden');
        mainContent.classList.remove('hidden');
        musicToggle.classList.remove('hidden');
        
        // AUTO-PLAY MUSIK
        if (music) {
            music.volume = 0.5;
            music.play().then(() => {
                musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
                musicBtn.classList.add('playing');
            }).catch(err => {
                console.log('Autoplay blocked:', err);
                musicBtn.innerHTML = '<i class="fas fa-music"></i>';
                musicBtn.classList.remove('playing');
            });
        }
        
        setTimeout(() => {
            mainContent.classList.add('visible');
            document.body.classList.add('loaded');
        }, 100);
        
        window.scrollTo(0, 0);
        
        // Load wishes
        loadWishes();
    }

    if (openBtn) openBtn.addEventListener('click', openInvitation);

    // Music Toggle
    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (music.paused) {
                music.play().then(() => {
                    musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    musicBtn.classList.add('playing');
                }).catch(err => {
                    showToast('🎵 Klik untuk memutar musik');
                });
            } else {
                music.pause();
                musicBtn.innerHTML = '<i class="fas fa-music"></i>';
                musicBtn.classList.remove('playing');
            }
        });
        
        music.addEventListener('play', () => {
            musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
            musicBtn.classList.add('playing');
        });
        
        music.addEventListener('pause', () => {
            musicBtn.innerHTML = '<i class="fas fa-music"></i>';
            musicBtn.classList.remove('playing');
        });
    }

    // Countdown Timer
    function updateCountdown() {
        const targetDate = new Date('April 12, 2030 08:00:00').getTime();
        
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;
            
            if (distance < 0) {
                clearInterval(timer);
                if (countdownEl) countdownEl.innerHTML = '<div class="text-3xl font-serif text-gold">Acara telah dimulai!</div>';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            if (countdownEl) {
                countdownEl.innerHTML = `
                    <div class="bg-white p-4 md:p-6 rounded-2xl shadow-xl min-w-[80px] border border-gold/10">
                        <span class="text-4xl md:text-6xl font-serif text-gold">${days}</span>
                        <p class="text-xs uppercase tracking-wider mt-2 text-gray-500">Hari</p>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-2xl shadow-xl min-w-[80px] border border-gold/10">
                        <span class="text-4xl md:text-6xl font-serif text-gold">${hours}</span>
                        <p class="text-xs uppercase tracking-wider mt-2 text-gray-500">Jam</p>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-2xl shadow-xl min-w-[80px] border border-gold/10">
                        <span class="text-4xl md:text-6xl font-serif text-gold">${minutes}</span>
                        <p class="text-xs uppercase tracking-wider mt-2 text-gray-500">Menit</p>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-2xl shadow-xl min-w-[80px] border border-gold/10">
                        <span class="text-4xl md:text-6xl font-serif text-gold">${seconds}</span>
                        <p class="text-xs uppercase tracking-wider mt-2 text-gray-500">Detik</p>
                    </div>
                `;
            }
        }, 1000);
    }
    
    if (countdownEl) updateCountdown();

    // Copy Rekening
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const rekening = btn.dataset.rekening;
            try {
                await navigator.clipboard.writeText(rekening);
                showToast('✅ Nomor berhasil disalin!');
            } catch (err) {
                const textarea = document.createElement('textarea');
                textarea.value = rekening;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showToast('✅ Nomor berhasil disalin!');
            }
        });
    });

    // Toast Notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // =====================
    // RSVP FORM - KIRIM KE GOOGLE APPS SCRIPT
    // =====================
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Mengirim...';
            
            const formData = new FormData(rsvpForm);
            const nama = formData.get('nama');
            const kehadiran = formData.get('kehadiran');
            const pesan = formData.get('pesan');
            
            // Data untuk dikirim
            const postData = new URLSearchParams();
            postData.append('nama', nama);
            postData.append('kehadiran', kehadiran);
            postData.append('pesan', pesan);
            
            try {
                // Kirim data ke Google Apps Script
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: postData
                });
                
                // Reset form
                rsvpForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                // Tampilkan pesan sukses
                showToast('🎉 Terima kasih! Doa restu Anda telah tercatat.');
                
                // TAMBAHKAN DATA BARU KE TAMPILAN SECARA OPTIMISTIC
                addNewWishToDisplay({
                    nama: nama,
                    kehadiran: kehadiran,
                    pesan: pesan,
                    timestamp: new Date().toLocaleString('id-ID')
                });
                
                // Refresh data dari server setelah beberapa detik
                setTimeout(() => {
                    loadWishesFromGoogleSheet();
                }, 2000);
                
            } catch (error) {
                console.error('Error:', error);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                showToast('❌ Gagal mengirim. Silakan coba lagi.');
            }
        });
    }

    // =====================
    // TAMBAH WISH BARU KE TAMPILAN (OPTIMISTIC UPDATE)
    // =====================
    function addNewWishToDisplay(wish) {
        // Sembunyikan loading
        if (wishesLoading) wishesLoading.style.display = 'none';
        
        // Buat element baru
        const badgeClass = wish.kehadiran === 'Hadir' ? 'badge-hadir' : 'badge-tidak';
        const newWishHTML = `
            <div class="wish-bubble" style="animation: slideUp 0.5s ease;">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h5 class="font-semibold text-gray-800">${escapeHtml(wish.nama)}</h5>
                        <span class="${badgeClass}">${wish.kehadiran}</span>
                    </div>
                    <span class="text-xs text-gray-400">Baru saja</span>
                </div>
                <p class="text-gray-600 text-sm leading-relaxed">"${escapeHtml(wish.pesan)}"</p>
            </div>
        `;
        
        // Cek apakah ada ucapan sebelumnya
        const existingContent = wishesList.innerHTML;
        
        if (existingContent.includes('Belum ada ucapan')) {
            // Jika kosong, ganti seluruh konten
            wishesList.innerHTML = newWishHTML;
            commentCountSpan.textContent = '1 Ucapan';
        } else {
            // Jika sudah ada, tambahkan di paling atas
            wishesList.innerHTML = newWishHTML + existingContent;
            
            // Update count
            const currentCount = parseInt(commentCountSpan.textContent) || 0;
            commentCountSpan.textContent = (currentCount + 1) + ' Ucapan';
        }
    }

    // =====================
    // LOAD WISHES DARI GOOGLE SHEETS (DENGAN JSONP)
    // =====================
    function loadWishesFromGoogleSheet() {
        if (wishesLoading) wishesLoading.style.display = 'flex';
        
        // Gunakan callback untuk JSONP
        const callbackName = 'jsonpCallback_' + Date.now();
        
        window[callbackName] = function(data) {
            if (data && Array.isArray(data) && data.length > 0) {
                displayWishes(data);
                localStorage.setItem('wedding_wishes', JSON.stringify(data));
            } else {
                loadWishesFromLocalStorage();
            }
            
            // Cleanup
            document.head.removeChild(script);
            delete window[callbackName];
        };
        
        const script = document.createElement('script');
        script.src = GOOGLE_SCRIPT_URL + '?callback=' + callbackName;
        script.onerror = function() {
            console.log('JSONP failed, trying fetch...');
            // Fallback ke fetch dengan mode no-cors
            fetch(GOOGLE_SCRIPT_URL)
                .then(response => response.text())
                .then(text => {
                    try {
                        const data = JSON.parse(text);
                        if (Array.isArray(data)) {
                            displayWishes(data);
                            localStorage.setItem('wedding_wishes', JSON.stringify(data));
                        } else {
                            loadWishesFromLocalStorage();
                        }
                    } catch (e) {
                        loadWishesFromLocalStorage();
                    }
                })
                .catch(() => loadWishesFromLocalStorage());
            
            document.head.removeChild(script);
            delete window[callbackName];
        };
        
        document.head.appendChild(script);
    }

    // =====================
    // LOAD WISHES DARI LOCALSTORAGE (FALLBACK)
    // =====================
    function loadWishesFromLocalStorage() {
        const wishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
        displayWishes(wishes);
    }

    // =====================
    // DISPLAY WISHES
    // =====================
    function displayWishes(wishes) {
        if (wishesLoading) wishesLoading.style.display = 'none';
        
        if (!wishes || wishes.length === 0) {
            wishesList.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <i class="fa-regular fa-message text-4xl mb-4 opacity-30"></i>
                    <p>Belum ada ucapan. Jadilah yang pertama memberikan doa restu.</p>
                </div>
            `;
            commentCountSpan.textContent = '0 Ucapan';
            return;
        }
        
        // Urutkan dari terbaru
        const sortedWishes = [...wishes].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        commentCountSpan.textContent = `${sortedWishes.length} Ucapan`;
        
        wishesList.innerHTML = sortedWishes.map(wish => {
            const badgeClass = wish.kehadiran === 'Hadir' ? 'badge-hadir' : 'badge-tidak';
            const date = wish.timestamp ? new Date(wish.timestamp) : new Date();
            const formattedDate = wish.timestamp ? wish.timestamp.split(',')[0] : `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
            
            return `
                <div class="wish-bubble">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h5 class="font-semibold text-gray-800">${escapeHtml(wish.nama)}</h5>
                            <span class="${badgeClass}">${wish.kehadiran || 'Hadir'}</span>
                        </div>
                        <span class="text-xs text-gray-400">${formattedDate}</span>
                    </div>
                    <p class="text-gray-600 text-sm leading-relaxed">"${escapeHtml(wish.pesan)}"</p>
                </div>
            `;
        }).join('');
    }

    // =====================
    // ESCAPE HTML
    // =====================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =====================
    // LOAD WISHES (INITIAL)
    // =====================
    function loadWishes() {
        // Coba load dari localStorage dulu (tampilan cepat)
        const localWishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
        if (localWishes.length > 0) {
            displayWishes(localWishes);
        }
        
        // Kemudian sync dengan Google Sheets
        loadWishesFromGoogleSheet();
    }

    if (wishesList) {
        loadWishes();
    }

    // =====================
    // INTERSECTION OBSERVER
    // =====================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.fade-section').forEach(el => observer.observe(el));

    // =====================
    // GALLERY LIGHTBOX
    // =====================
    document.querySelectorAll('.gallery-img').forEach(img => {
        img.addEventListener('click', function() {
            const lightbox = document.createElement('div');
            lightbox.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
            
            const imgClone = document.createElement('img');
            imgClone.src = this.src;
            imgClone.style.cssText = 'max-width:90%;max-height:90%;object-fit:contain;border-radius:10px;';
            
            lightbox.appendChild(imgClone);
            document.body.appendChild(lightbox);
            
            lightbox.addEventListener('click', () => lightbox.remove());
        });
    });

})();