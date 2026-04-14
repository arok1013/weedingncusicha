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
        
        // AUTO-PLAY MUSIK saat undangan dibuka
        if (music) {
            music.volume = 0.5;
            music.play().then(() => {
                musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
                musicBtn.classList.add('playing');
            }).catch(err => {
                console.log('Autoplay blocked by browser:', err);
                musicBtn.innerHTML = '<i class="fas fa-music"></i>';
                musicBtn.classList.remove('playing');
            });
        }
        
        setTimeout(() => {
            mainContent.classList.add('visible');
            document.body.classList.add('loaded');
        }, 100);
        
        window.scrollTo(0, 0);
        
        // Load wishes dari Google Sheets saat undangan dibuka
        loadWishesFromGoogleSheet();
    }

    if (openBtn) openBtn.addEventListener('click', openInvitation);

    // Music Toggle (Play/Pause)
    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (music.paused) {
                music.play().then(() => {
                    musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    musicBtn.classList.add('playing');
                }).catch(err => {
                    console.log('Playback prevented:', err);
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
        
        music.addEventListener('ended', () => {
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
                    <div class="bg-white p-4 md:p-6 rounded-2xl shadow-xl min-w-[80px] md:min-w-[100px] border border-gold/10">
                        <span class="text-4xl md:text-6xl font-serif text-gold">${days}</span>
                        <p class="text-xs md:text-sm uppercase tracking-wider mt-2 text-gray-500">Hari</p>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-2xl shadow-xl min-w-[80px] md:min-w-[100px] border border-gold/10">
                        <span class="text-4xl md:text-6xl font-serif text-gold">${hours}</span>
                        <p class="text-xs md:text-sm uppercase tracking-wider mt-2 text-gray-500">Jam</p>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-2xl shadow-xl min-w-[80px] md:min-w-[100px] border border-gold/10">
                        <span class="text-4xl md:text-6xl font-serif text-gold">${minutes}</span>
                        <p class="text-xs md:text-sm uppercase tracking-wider mt-2 text-gray-500">Menit</p>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-2xl shadow-xl min-w-[80px] md:min-w-[100px] border border-gold/10">
                        <span class="text-4xl md:text-6xl font-serif text-gold">${seconds}</span>
                        <p class="text-xs md:text-sm uppercase tracking-wider mt-2 text-gray-500">Detik</p>
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
            const data = {
                nama: formData.get('nama'),
                kehadiran: formData.get('kehadiran'),
                pesan: formData.get('pesan'),
                timestamp: new Date().toISOString()
            };
            
            try {
                // Kirim data ke Google Apps Script
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams(data).toString()
                });
                
                // Simpan juga ke localStorage sebagai backup
                const wishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
                wishes.unshift(data);
                localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
                
                // Reset form
                rsvpForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                // Reload wishes dari localStorage (karena no-cors tidak bisa baca response)
                loadWishesFromLocalStorage();
                showToast('🎉 Terima kasih! Doa restu Anda telah tercatat.');
                
            } catch (error) {
                console.error('Error sending to Google Sheets:', error);
                
                // Fallback: tetap simpan ke localStorage
                const wishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
                wishes.unshift(data);
                localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
                
                rsvpForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                loadWishesFromLocalStorage();
                showToast('🎉 Terima kasih! Doa restu Anda telah tercatat (offline).');
            }
        });
    }

    // =====================
    // LOAD WISHES DARI GOOGLE SHEETS
    // =====================
    async function loadWishesFromGoogleSheet() {
        if (wishesLoading) wishesLoading.style.display = 'flex';
        
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL);
            const text = await response.text();
            
            // Coba parse sebagai JSON
            try {
                const data = JSON.parse(text);
                if (data && Array.isArray(data) && data.length > 0) {
                    displayWishes(data);
                    // Update localStorage dengan data terbaru
                    localStorage.setItem('wedding_wishes', JSON.stringify(data));
                } else {
                    loadWishesFromLocalStorage();
                }
            } catch (parseError) {
                console.log('Response is not JSON, loading from localStorage');
                loadWishesFromLocalStorage();
            }
        } catch (error) {
            console.error('Error fetching from Google Sheets:', error);
            // Fallback ke localStorage
            loadWishesFromLocalStorage();
        }
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
            const formattedDate = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
            
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
    // INITIAL LOAD WISHES
    // =====================
    if (wishesList) {
        // Load dari localStorage dulu (tampilan cepat)
        loadWishesFromLocalStorage();
        // Kemudian sync dengan Google Sheets di background
        setTimeout(() => {
            loadWishesFromGoogleSheet();
        }, 500);
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