(function() {
    "use strict";

    // ========================================
    // GOOGLE APPS SCRIPT URL
    // ========================================
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

    // ========================================
    // GUEST NAME FROM URL
    // ========================================
    const urlParams = new URLSearchParams(window.location.search);
    const guestParam = urlParams.get('to') || urlParams.get('guest');
    if (guestParam && guestNameSpan) {
        guestNameSpan.textContent = decodeURIComponent(guestParam.replace(/\+/g, ' '));
    }

    // ========================================
    // OPEN INVITATION WITH AUTO-PLAY MUSIC
    // ========================================
    function openInvitation() {
        overlay.classList.add('hidden');
        mainContent.classList.remove('hidden');
        musicToggle.classList.remove('hidden');
        
        // Auto-play music
        if (music) {
            music.volume = 0.4;
            music.play().then(() => {
                if (musicBtn) {
                    musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    musicBtn.classList.add('playing');
                }
            }).catch(err => {
                console.log('Autoplay blocked:', err);
                if (musicBtn) {
                    musicBtn.innerHTML = '<i class="fas fa-music"></i>';
                    musicBtn.classList.remove('playing');
                }
            });
        }
        
        setTimeout(() => {
            mainContent.classList.add('visible');
            document.body.classList.add('loaded');
            document.body.style.overflow = 'auto';
        }, 100);
        
        window.scrollTo(0, 0);
        
        // Load wishes
        loadWishes();
    }

    if (openBtn) openBtn.addEventListener('click', openInvitation);

    // ========================================
    // MUSIC TOGGLE
    // ========================================
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

    // ========================================
    // COUNTDOWN TIMER
    // ========================================
    function updateCountdown() {
        const targetDate = new Date('April 12, 2030 08:00:00').getTime();
        
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;
            
            if (distance < 0) {
                clearInterval(timer);
                if (countdownEl) countdownEl.innerHTML = '<div class="text-center"><span class="text-2xl font-serif text-gold">Acara telah dimulai!</span></div>';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            if (countdownEl) {
                countdownEl.innerHTML = `
                    <div>
                        <span>${days}</span>
                        <p>Hari</p>
                    </div>
                    <div>
                        <span>${hours}</span>
                        <p>Jam</p>
                    </div>
                    <div>
                        <span>${minutes}</span>
                        <p>Menit</p>
                    </div>
                    <div>
                        <span>${seconds}</span>
                        <p>Detik</p>
                    </div>
                `;
            }
        }, 1000);
    }
    
    if (countdownEl) updateCountdown();

    // ========================================
    // COPY REKENING
    // ========================================
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

    // ========================================
    // TOAST NOTIFICATION
    // ========================================
    function showToast(message) {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) existingToast.remove();
        
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

    // ========================================
    // RSVP FORM - SEND TO GOOGLE APPS SCRIPT
    // ========================================
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
            
            if (!nama || !pesan) {
                showToast('❌ Mohon isi nama dan ucapan doa');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                return;
            }
            
            const postData = new URLSearchParams();
            postData.append('nama', nama);
            postData.append('kehadiran', kehadiran);
            postData.append('pesan', pesan);
            
            try {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: postData
                });
                
                rsvpForm.reset();
                showToast('🎉 Terima kasih! Doa restu Anda telah tercatat.');
                
                addNewWishToDisplay({
                    nama: nama,
                    kehadiran: kehadiran,
                    pesan: pesan,
                    timestamp: new Date().toLocaleString('id-ID')
                });
                
                setTimeout(() => {
                    loadWishesFromGoogleSheet();
                }, 2000);
                
            } catch (error) {
                console.error('Error:', error);
                showToast('❌ Gagal mengirim. Silakan coba lagi.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // ========================================
    // ADD NEW WISH TO DISPLAY (OPTIMISTIC)
    // ========================================
    function addNewWishToDisplay(wish) {
        if (wishesLoading) wishesLoading.style.display = 'none';
        
        const badgeClass = wish.kehadiran === 'Hadir' ? 'badge-hadir' : 'badge-tidak';
        const newWishHTML = `
            <div class="wish-bubble" style="animation: fadeIn 0.5s ease;">
                <div class="flex justify-between items-start mb-2 flex-wrap gap-2">
                    <div>
                        <h5 class="font-semibold text-gray-800">${escapeHtml(wish.nama)}</h5>
                        <span class="${badgeClass}">${escapeHtml(wish.kehadiran)}</span>
                    </div>
                    <span class="text-xs text-gray-400">Baru saja</span>
                </div>
                <p class="text-gray-600 text-sm leading-relaxed">"${escapeHtml(wish.pesan)}"</p>
            </div>
        `;
        
        const existingContent = wishesList.innerHTML;
        
        if (existingContent.includes('Belum ada ucapan') || existingContent.includes('wishes-loading')) {
            wishesList.innerHTML = newWishHTML;
        } else {
            wishesList.innerHTML = newWishHTML + existingContent;
        }
        
        updateCommentCount();
    }

    // ========================================
    // LOAD WISHES FROM GOOGLE SHEETS
    // ========================================
    function loadWishesFromGoogleSheet() {
        if (wishesLoading) wishesLoading.style.display = 'flex';
        
        const callbackName = 'jsonpCallback_' + Date.now();
        
        window[callbackName] = function(data) {
            if (data && Array.isArray(data) && data.length > 0) {
                displayWishes(data);
                localStorage.setItem('wedding_wishes', JSON.stringify(data));
            } else {
                loadWishesFromLocalStorage();
            }
            
            if (document.head.contains(script)) document.head.removeChild(script);
            delete window[callbackName];
        };
        
        const script = document.createElement('script');
        script.src = GOOGLE_SCRIPT_URL + '?callback=' + callbackName;
        script.onerror = function() {
            fetch(GOOGLE_SCRIPT_URL)
                .then(response => response.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        displayWishes(data);
                        localStorage.setItem('wedding_wishes', JSON.stringify(data));
                    } else {
                        loadWishesFromLocalStorage();
                    }
                })
                .catch(() => loadWishesFromLocalStorage());
            
            if (document.head.contains(script)) document.head.removeChild(script);
            delete window[callbackName];
        };
        
        document.head.appendChild(script);
    }

    // ========================================
    // LOAD WISHES FROM LOCALSTORAGE
    // ========================================
    function loadWishesFromLocalStorage() {
        const wishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
        displayWishes(wishes);
    }

    // ========================================
    // DISPLAY WISHES
    // ========================================
    function displayWishes(wishes) {
        if (wishesLoading) wishesLoading.style.display = 'none';
        
        if (!wishes || wishes.length === 0) {
            wishesList.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <i class="fa-regular fa-message text-4xl mb-3 opacity-30"></i>
                    <p class="elegant-body text-sm">Belum ada ucapan. Jadilah yang pertama memberikan doa restu.</p>
                </div>
            `;
            if (commentCountSpan) commentCountSpan.textContent = '0 Ucapan';
            return;
        }
        
        const sortedWishes = [...wishes].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        if (commentCountSpan) commentCountSpan.textContent = `${sortedWishes.length} Ucapan`;
        
        wishesList.innerHTML = sortedWishes.map(wish => {
            const badgeClass = wish.kehadiran === 'Hadir' ? 'badge-hadir' : 'badge-tidak';
            const formattedDate = wish.timestamp ? wish.timestamp.split(',')[0] : new Date().toLocaleDateString('id-ID');
            
            return `
                <div class="wish-bubble">
                    <div class="flex justify-between items-start mb-2 flex-wrap gap-2">
                        <div>
                            <h5 class="font-semibold text-gray-800">${escapeHtml(wish.nama)}</h5>
                            <span class="${badgeClass}">${escapeHtml(wish.kehadiran || 'Hadir')}</span>
                        </div>
                        <span class="text-xs text-gray-400">${formattedDate}</span>
                    </div>
                    <p class="text-gray-600 text-sm leading-relaxed">"${escapeHtml(wish.pesan)}"</p>
                </div>
            `;
        }).join('');
    }

    // ========================================
    // UPDATE COMMENT COUNT
    // ========================================
    function updateCommentCount() {
        const wishItems = wishesList.querySelectorAll('.wish-bubble');
        if (commentCountSpan) commentCountSpan.textContent = `${wishItems.length} Ucapan`;
    }

    // ========================================
    // ESCAPE HTML
    // ========================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // LOAD WISHES (INITIAL)
    // ========================================
    function loadWishes() {
        const localWishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
        if (localWishes.length > 0) {
            displayWishes(localWishes);
        }
        loadWishesFromGoogleSheet();
    }

    if (wishesList) {
        loadWishes();
    }

    // ========================================
    // INTERSECTION OBSERVER FOR FADE SECTIONS
    // ========================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.fade-section').forEach(el => observer.observe(el));

    // ========================================
    // GALLERY LIGHTBOX
    // ========================================
    document.querySelectorAll('.gallery-img').forEach(img => {
        img.addEventListener('click', function() {
            const lightbox = document.createElement('div');
            lightbox.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
            
            const imgClone = document.createElement('img');
            imgClone.src = this.src;
            imgClone.style.cssText = 'max-width:90%;max-height:90%;object-fit:contain;border-radius:8px;';
            
            lightbox.appendChild(imgClone);
            document.body.appendChild(lightbox);
            
            lightbox.addEventListener('click', () => lightbox.remove());
        });
    });

})();