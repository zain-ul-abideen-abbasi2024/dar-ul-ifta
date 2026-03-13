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
        // Shift the background position slightly for a smooth parallax effect
        if (patternBg) {
            patternBg.style.backgroundPositionY = `${scrollPosition * 0.1}px`;
        }
    });

    // 3. Search Bar Interactivity & Gemini AI Smart Search
    const searchBar = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchResults');
    const searchMicBtn = document.getElementById('searchMicBtn');
    
    // Gemini API Key for Semantic Search
    const GEMINI_API_KEY = "AIzaSyDklba_NS3cNu4good9kqPdfL1sXiPOIno";

    // Enhanced Mock database with more Fatwas for better semantic search demonstration
    const fatwaDatabase = [
        {
            title: 'ڈیجیٹل کرنسی (کرپٹو) میں سرمایہ کاری کا شرعی حکم کیا ہے؟',
            snippet: 'جدید دور میں کرپٹو کرنسی کی خرید و فروخت کے حوالے سے علمائے کرام کی آراء اور شرعی اصولوں کی روشنی میں تفصیلی جائزہ...',
            category: 'تجارت و معیشت',
            date: '۱۲ رجب ۱۴۴۷ھ',
            mufti: 'مفتی محمد احمد',
            keywords: 'crypto bitcoin trading digital currency حرام حلال سود'
        },
        {
            title: 'ٹرین یا ہوائی جہاز میں نماز ادا کرنے کا کیا طریقہ ہے؟',
            snippet: 'دوران سفر سواری کے اندر نماز فرض ادا کرنے کی شرائط، قیام اور قبلہ رخ ہونے کے حوالے سے تفصیلی شرعی احکام...',
            category: 'نماز',
            date: '۱۱ رجب ۱۴۴۷ھ',
            mufti: 'مفتی عبداللہ',
            keywords: 'safar plane airplane train qibla direction prayer سفر قصر قبلہ'
        },
        {
            title: 'پلاٹ یا پراپرٹی پر زکوٰۃ کی کٹوتی کے اصول کیا ہیں؟',
            snippet: 'وہ زمین یا پراپرٹی جو ذاتی استعمال کے لیے ہو یا تجارت کی نیت سے خریدی گئی ہو، اس پر زکوٰۃ کی فرضیت کے اصول...',
            category: 'زکوٰۃ',
            date: '۱۰ رجب ۱۴۴۷ھ',
            mufti: 'مفتی ابراہیم قاسمی',
            keywords: 'zakat property land tax plot zakah زکوۃ زمین جائیداد'
        },
        {
            title: 'وراثت میں بیٹی کا کتنا حصہ مقرر ہے؟',
            snippet: 'قرآن و سنت کی روشنی میں وراثت کی تقسیم، خاص طور پر بیٹی، بہن اور بیوی کے حقوق اور حصوں کی تفصیل...',
            category: 'وراثت',
            date: '۸ رجب ۱۴۴۷ھ',
            mufti: 'مفتی محمد احمد',
            keywords: 'inheritance daughter share property will وصیت بیٹی وارث ترکہ'
        },
        {
            title: 'کیا شوہر غصے میں طلاق دے تو واقع ہو جاتی ہے؟',
            snippet: 'غصے کی حالت (غضب) میں دی گئی طلاق کے مختلف درجات اور شرعی احکام پر تفصیلی فتویٰ...',
            category: 'نکاح و طلاق',
            date: '۵ رجب ۱۴۴۷ھ',
            mufti: 'مفتی ابراہیم قاسمی',
            keywords: 'divorce anger talaq shohar biwi خلع میاں بیوی غصہ'
        },
        {
            title: 'رمضان میں شوگر ٹیسٹ کے لیے خون نکالنے سے روزہ ٹوٹتا ہے؟',
            snippet: 'روزے کی حالت میں انجکشن لگوانے، خون ٹیسٹ کروانے یا ڈرپ لگوانے سے متعلق مسائل...',
            category: 'روزہ',
            date: '۱ رمضان ۱۴۴۶ھ',
            mufti: 'مفتی عبداللہ',
            keywords: 'roza fasting blood test injection sugar diabetes رمضان روزے دار'
        }
    ];

    if (searchBar && searchDropdown) {
        
        let typingTimer;
        const doneTypingInterval = 800; // Wait for user to stop typing before calling API
        
        // Show loading state
        const showSearchLoading = () => {
            searchDropdown.innerHTML = `
                <div class="search-no-results">
                    <i class="ri-loader-4-line ri-spin" style="color: var(--clr-primary);"></i>
                    <p>سوال کا مفہوم سمجھا جا رہا ہے...</p>
                </div>
            `;
            searchDropdown.style.display = 'block';
        };

        // Render results
        const renderResults = (results) => {
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
                    searchDropdown.appendChild(item);
                });
            } else {
                searchDropdown.innerHTML = `
                    <div class="search-no-results">
                        <i class="ri-search-eye-line"></i>
                        <p>اس سے متعلق کوئی فتویٰ نہیں ملا</p>
                    </div>
                `;
            }
            searchDropdown.style.display = 'block';
        };

        // Gemini AI Semantic Search Logic
        const performSemanticSearch = async (query) => {
            try {
                // Construct prompt containing our database
                const dbContext = fatwaDatabase.map((f, i) => 
                    `[ID: ${i}] Title: ${f.title} | Snippet: ${f.snippet} | Category: ${f.category} | Keywords: ${f.keywords}`
                ).join('\n');

                const prompt = `You are a semantic search engine for an Islamic Fatwa (Dar-ul-Ifta) website. 
User's query (in Urdu or Roman Urdu): "${query}"

Here is the database of available fatwas:
${dbContext}

Task: Find the best matching fatwas that conceptually answer or relate to the user's query. The query might not contain the exact words, but might ask about the concepts (e.g., query "aurat ki wirasat" matches the fatwa about "وراثت میں بیٹی کا حصہ").
Return ONLY a valid JSON array of the IDs of perfectly matching fatwas, ordered by relevance (best match first). Return an empty array [] if nothing is conceptually related. Do not return markdown, just the JSON array like: [3, 0].`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.1 }
                    })
                });

                const data = await response.json();
                if (data.error) throw new Error(data.error.message);

                let textResponse = data.candidates[0].content.parts[0].text.trim();
                // clean markdown if Gemini wraps it
                textResponse = textResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '');
                
                const matchedIds = JSON.parse(textResponse);
                const matchedFatwas = matchedIds.map(id => fatwaDatabase[id]).filter(f => f);
                
                renderResults(matchedFatwas);
                
            } catch (error) {
                console.error("Semantic search error:", error);
                // Fallback to basic text search if API fails
                const fallbackResults = fatwaDatabase.filter(f =>
                    f.title.includes(query) || f.snippet.includes(query) || f.category.includes(query)
                );
                renderResults(fallbackResults);
            }
        };

        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(typingTimer);
            
            if (query.length === 0) {
                searchDropdown.style.display = 'none';
                return;
            }

            // Fallback fast text search for immediate visual feedback before AI kicks in
            const fastResults = fatwaDatabase.filter(f => f.title.includes(query) || f.category.includes(query));
            if(fastResults.length > 0 && query.length < 3) {
                 renderResults(fastResults);
            } else {
                 showSearchLoading();
                 typingTimer = setTimeout(() => {
                     performSemanticSearch(query);
                 }, doneTypingInterval);
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchBar.contains(e.target) && !searchDropdown.contains(e.target) && e.target !== searchMicBtn && !searchMicBtn?.contains(e.target)) {
                searchDropdown.style.display = 'none';
            }
        });
    }

    // --- Voice to Text functionality (Web Speech API) ---
    const initVoiceRecognition = (btnElement, inputElement, onResultCallback) => {
        if (!btnElement || !inputElement) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            btnElement.style.display = 'none'; // Hide if browser doesn't support
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'ur-PK'; // Set language to Urdu (Pakistan)
        recognition.interimResults = true; // Show results as they are spoken
        recognition.maxAlternatives = 1;

        let isRecording = false;

        btnElement.addEventListener('click', () => {
            if (isRecording) {
                recognition.stop();
            } else {
                recognition.start();
                inputElement.focus();
            }
        });

        recognition.onstart = () => {
            isRecording = true;
            btnElement.classList.add('recording');
            inputElement.placeholder = "سن رہا ہوں... بولیے";
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    // Interim results could be appended if needed, but we assign final directly
                    inputElement.value = event.results[i][0].transcript; 
                }
            }
            if (finalTranscript !== '') {
                inputElement.value = finalTranscript;
                if(onResultCallback) onResultCallback(finalTranscript);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            btnElement.classList.remove('recording');
            isRecording = false;
        };

        recognition.onend = () => {
            isRecording = false;
            btnElement.classList.remove('recording');
            inputElement.placeholder = inputElement.id === 'question' ? "اپنا سوال واضح اردو رسم الخط میں درج کریں۔۔۔" : "فتاویٰ مسائل یا مفتیان کرام تلاش کریں";
            
            // Re-trigger input event to run search or validation
            const event = new Event('input', { bubbles: true });
            inputElement.dispatchEvent(event);
        };
    };

    // Initialize Voice Search for Search Bar
    if(document.getElementById('searchMicBtn') && document.getElementById('searchInput')) {
        initVoiceRecognition(
            document.getElementById('searchMicBtn'), 
            document.getElementById('searchInput')
        );
    }

    // Initialize Voice Text for Modal Question area
    if(document.getElementById('modalMicBtn') && document.getElementById('question')) {
        initVoiceRecognition(
            document.getElementById('modalMicBtn'), 
            document.getElementById('question')
        );
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

    // 6. Fix Search Bar Direction for Automatic Browser Translation and Clear Icon
    // Removed legacy mutation observer for LTR/RTL that was overriding CSS paddings.
    const searchInput = document.querySelector('.search-bar');
    const searchClearIcon = document.getElementById('searchClear');

    if (searchInput) {
        // Search clear icon logic
        if (searchClearIcon) {
            searchInput.addEventListener('input', function () {
                if (this.value.length > 0) {
                    searchClearIcon.style.display = 'flex'; // Changed from 'block' to 'flex' so centering works
                } else {
                    searchClearIcon.style.display = 'none';
                }
            });

            searchClearIcon.addEventListener('click', function () {
                searchInput.value = '';
                searchClearIcon.style.display = 'none';
                searchInput.focus();
                // trigger input event to reset search results
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            });
        }
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
                // Simulate network request since there is no real backend API
                await new Promise(resolve => setTimeout(resolve, 800));

                fatwaForm.reset();
                modal.style.display = 'none'; // Close question modal

                // Show success modal
                const successModal = document.getElementById('successModal');
                if (successModal) {
                    successModal.style.display = 'flex';
                }
            } catch (error) {
                formMessage.className = 'form-message error';
                formMessage.textContent = 'کچھ خرابی پیش آ گئی۔ براہ کرم دوبارہ کوشش کریں۔';
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

    // Scroll to Top Button Logic
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                scrollToTopBtn.style.display = 'flex';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            // Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Add subtle hover animation for scroll button
        scrollToTopBtn.addEventListener('mouseenter', () => {
            scrollToTopBtn.style.transform = 'translateY(-5px)';
            scrollToTopBtn.style.backgroundColor = 'var(--clr-primary)';
        });

        scrollToTopBtn.addEventListener('mouseleave', () => {
            scrollToTopBtn.style.transform = 'translateY(0)';
            scrollToTopBtn.style.backgroundColor = 'var(--clr-gold)';
        });
    }

    // 9. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Toggle icon
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.className = 'ri-close-line';
            } else {
                icon.className = 'ri-menu-line';
            }
        });
    }
});
