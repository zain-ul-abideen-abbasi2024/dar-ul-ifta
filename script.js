document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Categories entry animation
    const categoriesGroups = document.querySelectorAll('.categories-grid');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const categoriesObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find all cards inside the grid and add animation class
                const cards = entry.target.querySelectorAll('.category-card');
                cards.forEach(card => {
                    card.classList.add('animate-in');
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    categoriesGroups.forEach(group => {
        categoriesObserver.observe(group);
    });

    // 2. Add dynamic subtle parallax to geometric background based on scroll
    const patternBg = document.querySelector('.pattern-bg');
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        // Move the background slightly
        if (patternBg) {
            patternBg.style.transform = `translateY(${scrollPosition * 0.15}px)`;
        }
    });

    // 3. Search Bar Interactivity
    const searchBar = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchResults');

    if (searchBar && searchDropdown) {

        // Data source mockup based on existing DOM cards (can be replaced by API later)
        const getFatwasData = () => {
            const fatwaCards = document.querySelectorAll('.fatwa-grid .fatwa-card');
            return Array.from(fatwaCards).map(card => {
                return {
                    title: card.querySelector('.fatwa-question').textContent,
                    snippet: card.querySelector('.fatwa-snippet').textContent,
                    category: card.querySelector('.fatwa-category').textContent,
                    date: card.querySelector('.fatwa-date').textContent,
                    mufti: card.querySelector('.mufti-name').textContent
                };
            });
        };

        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const fatwas = getFatwasData();

            if (query.length === 0) {
                searchDropdown.style.display = 'none';
                return;
            }

            const results = fatwas.filter(f =>
                f.title.toLowerCase().includes(query) ||
                f.snippet.toLowerCase().includes(query) ||
                f.category.toLowerCase().includes(query) ||
                f.mufti.toLowerCase().includes(query)
            );

            searchDropdown.innerHTML = '';

            if (results.length > 0) {
                results.forEach(result => {
                    const item = document.createElement('a');
                    item.href = 'fatwa-detail.html';
                    item.className = 'search-result-item';
                    item.innerHTML = `
                        <div class="search-result-title">${result.title}</div>
                        <div style="font-size: 0.9rem; color: var(--clr-text-muted); margin-bottom: 0.5rem;">${result.snippet.substring(0, 60)}...</div>
                        <div class="search-result-category">${result.category} &bull; ${result.mufti}</div>
                    `;
                    // Note: Since it's an actual link now, clicking it will navigate away
                    searchDropdown.appendChild(item);
                });
            } else {
                searchDropdown.innerHTML = `
                    <div class="search-no-results">
                        <i class="ri-search-eye-line"></i>
                        <p>کوئی نتیجہ نہیں ملا</p>
                    </div>
                `;
            }

            searchDropdown.style.display = 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchBar.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.style.display = 'none';
            }
        });
    }

    // 4. Subtle hover interaction for Fatwa Cards to tilt slightly
    const fatwaCards = document.querySelectorAll('.fatwa-card');

    fatwaCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const tiltX = (y - centerY) / 20; // Adjust division for intense/subtle effect
            const tiltY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
            // Ensure transition smoothness when mouse leaves
            card.style.transition = 'transform 0.5s ease, box-shadow 0.3s ease';

            setTimeout(() => {
                card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; // Restore CSS var equivalent
            }, 500);
        });
    });



    // 5. Hero Image 3D Tilt Effect
    const heroImage = document.querySelector('.hero-image-display');
    if (heroImage) {
        heroImage.addEventListener('mousemove', (e) => {
            const rect = heroImage.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Tilt calculation - distinct from cards for a slightly softer feel for large image
            const tiltX = (y - centerY) / 25;
            const tiltY = (centerX - x) / 25;

            heroImage.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02) translateY(-5px)`;
            heroImage.style.transition = 'none'; // Disable transition during mousemove for instant follow
        });

        heroImage.addEventListener('mouseleave', () => {
            heroImage.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)`;
            heroImage.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });
    }

    // 6. Fix Search Bar Direction for Automatic Browser Translation
    const htmlLangAttrBase = document.documentElement.lang;
    const searchInput = document.querySelector('.search-bar');

    if (searchInput) {
        // Observer to detect when Google Translate modifies the HTML tag
        const mutationObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'lang' || mutation.attributeName === 'class') {
                    const currentLang = document.documentElement.lang;
                    // Google translate sometimes adds classes or changes lang
                    if (currentLang.toLowerCase().includes('en') || document.documentElement.classList.contains('translated-ltr')) {
                        // Switch completely to LTR when English is detected
                        searchInput.style.direction = "ltr";
                        searchInput.style.textAlign = "left";
                    } else if (currentLang.toLowerCase().includes('ur') || currentLang === htmlLangAttrBase) {
                        // Revert to RTL when Urdu is active
                        searchInput.style.direction = "rtl";
                        searchInput.style.textAlign = "right";
                    }
                }
            });
        });

        mutationObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['lang', 'class']
        });
    }

    // 7. Modal Open/Close Logic
    const modal = document.getElementById('fatwaModal');
    const openBtns = document.querySelectorAll('.open-modal-btn');
    const closeBtn = document.querySelector('.close-modal');

    if (modal && openBtns && closeBtn) {
        openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'block';
            });
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    }

    // 8. Submit Fatwa via Backend API
    const fatwaForm = document.getElementById('fatwaForm');
    const formMessage = document.getElementById('formMessage');

    if (fatwaForm) {
        fatwaForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = fatwaForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.innerHTML = 'بھیجا جا رہا ہے... <i class="ri-loader-4-line ri-spin"></i>';
            submitBtn.disabled = true;

            const formData = new FormData(fatwaForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/fatwa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    fatwaForm.reset();
                    modal.style.display = 'none'; // Close question modal

                    // Show success modal
                    const successModal = document.getElementById('successModal');
                    if (successModal) {
                        successModal.style.display = 'flex';
                    }
                } else {
                    formMessage.className = 'form-message error';
                    formMessage.textContent = result.message || 'Error occurred';
                }
                formMessage.style.display = 'block';
            } catch (error) {
                formMessage.className = 'form-message error';
                formMessage.textContent = 'سرور سے رابطہ نہیں ہوسکا۔ براہ کرم دوبارہ کوشش کریں۔';
                formMessage.style.display = 'block';
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Close Success Modal Logic
    const successModal = document.getElementById('successModal');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');

    if (successModal && closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            successModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target == successModal) {
                successModal.style.display = 'none';
            }
        });
    }
});
