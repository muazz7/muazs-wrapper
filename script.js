document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide Icons
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // Initialize Marked options
    if (typeof marked !== "undefined") {
        marked.setOptions({
            gfm: true,
            breaks: true,
        });
    }

    /* ========================================================
       1. STARFIELD BACKGROUND (CANVAS INTERACTIVE PHYSICS)
       ======================================================== */
    const canvas = document.getElementById("starfield");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let stars = [];
        let mouse = { x: -1000, y: -1000 };
        let animationFrameId = 0;
        let isMobile = window.innerWidth < 768;

        const STAR_COUNT = 200;
        const INTERACTION_RADIUS = 150;
        const REPEL_STRENGTH = 0.15;
        const RETURN_SPEED = 0.05;
        const CONNECTION_DISTANCE = 80;

        function initStars(width, height) {
            stars = [];
            for (let i = 0; i < STAR_COUNT; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                stars.push({
                    x: x,
                    y: y,
                    baseX: x,
                    baseY: y,
                    size: Math.random() * 2 + 0.5,
                    opacity: Math.random() * 0.5 + 0.3,
                    twinkleSpeed: Math.random() * 0.02 + 0.01,
                    twinkleOffset: Math.random() * Math.PI * 2,
                });
            }
        }

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            isMobile = window.innerWidth < 768;
            initStars(canvas.width, canvas.height);
        }

        function updateStars() {
            stars.forEach((star) => {
                const dx = star.x - mouse.x;
                const dy = star.y - mouse.y;
                const distance = Math.hypot(dx, dy);

                if (distance < INTERACTION_RADIUS && distance > 0) {
                    // Repel from cursor
                    const force = (INTERACTION_RADIUS - distance) / INTERACTION_RADIUS;
                    const angle = Math.atan2(dy, dx);
                    star.x += Math.cos(angle) * force * REPEL_STRENGTH * 10;
                    star.y += Math.sin(angle) * force * REPEL_STRENGTH * 10;
                }

                // Return to base position
                star.x += (star.baseX - star.x) * RETURN_SPEED;
                star.y += (star.baseY - star.y) * RETURN_SPEED;
            });
        }

        function drawConnections() {
            if (!ctx) return;
            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];
                const distToMouse = Math.hypot(star.x - mouse.x, star.y - mouse.y);

                if (distToMouse < INTERACTION_RADIUS) {
                    for (let j = i + 1; j < stars.length; j++) {
                        const otherStar = stars[j];
                        const distBetween = Math.hypot(star.x - otherStar.x, star.y - otherStar.y);
                        const otherDistToMouse = Math.hypot(otherStar.x - mouse.x, otherStar.y - mouse.y);

                        if (distBetween < CONNECTION_DISTANCE && otherDistToMouse < INTERACTION_RADIUS) {
                            const opacity = (1 - distBetween / CONNECTION_DISTANCE) * (1 - distToMouse / INTERACTION_RADIUS) * 0.4;
                            ctx.beginPath();
                            ctx.moveTo(star.x, star.y);
                            ctx.lineTo(otherStar.x, otherStar.y);
                            ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                }
            }
        }

        function drawStars(time) {
            if (!ctx) return;
            stars.forEach((star) => {
                const distToCursor = Math.hypot(star.x - mouse.x, star.y - mouse.y);
                const proximityRadius = 120;
                const proximityBoost = distToCursor < proximityRadius ? (1 - distToCursor / proximityRadius) * 0.8 : 0;

                let breathMultiplier = 1;
                let sizeMultiplier = 1;

                if (isMobile) {
                    const starBreathSpeed = 0.002 + star.twinkleSpeed * 0.003;
                    const breathCycle = Math.sin(time * starBreathSpeed + star.twinkleOffset);
                    breathMultiplier = 0.8 + breathCycle * 0.4;
                    sizeMultiplier = 1 + breathCycle * 0.3;
                }

                const glowOpacity = (star.opacity * 0.6 + proximityBoost) * breathMultiplier;
                const glowSize = star.size * (4 + proximityBoost * 2) * sizeMultiplier;

                // Draw outer gold glow
                const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize);
                gradient.addColorStop(0, `rgba(212, 175, 55, ${Math.min(glowOpacity * 0.8, 1)})`);
                gradient.addColorStop(0.3, `rgba(212, 175, 55, ${Math.min(glowOpacity * 0.4, 0.8)})`);
                gradient.addColorStop(0.6, `rgba(180, 140, 40, ${Math.min(glowOpacity * 0.2, 0.5)})`);
                gradient.addColorStop(1, "rgba(180, 140, 40, 0)");

                ctx.beginPath();
                ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Draw white-gold core
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 245, 220, ${Math.min(glowOpacity + 0.2, 1)})`;
                ctx.fill();
            });
        }

        function animate(time) {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            updateStars();
            drawConnections();
            drawStars(time);

            animationFrameId = requestAnimationFrame(animate);
        }

        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("mousemove", (e) => {
            mouse = { x: e.clientX, y: e.clientY };
        });
        document.addEventListener("mouseleave", () => {
            mouse = { x: -1000, y: -1000 };
        });

        resizeCanvas();
        animate(0);
    }

    /* ========================================================
       2. NAVIGATION & MOBILE MENU
       ======================================================== */
    const logoBtn = document.getElementById("logo-btn");
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    const menuIcon = document.getElementById("menu-icon");

    if (logoBtn) {
        logoBtn.addEventListener("click", () => {
            window.location.reload();
        });
    }

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
            const isOpen = !mobileMenu.classList.contains("hidden");
            if (menuIcon) {
                menuIcon.setAttribute("data-lucide", isOpen ? "x" : "menu");
                if (typeof lucide !== "undefined") {
                    lucide.createIcons();
                }
            }
        });
    }

    /* ========================================================
       3. MODALS (ABOUT, SIGN-IN, SETTINGS)
       ======================================================== */
    const modals = {
        about: document.getElementById("about-modal"),
        signin: document.getElementById("signin-modal"),
        settings: document.getElementById("settings-modal"),
    };

    function openModal(modalId) {
        const modal = modals[modalId];
        if (modal) {
            modal.classList.remove("hidden");
            // Trigger animation frame to apply transitions smoothly
            requestAnimationFrame(() => {
                modal.classList.add("show");
            });
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.remove("show");
            // Delay hide to match CSS transition durations
            setTimeout(() => {
                modal.classList.add("hidden");
            }, 300);
        }
    }

    // Attach open triggers on navigation elements
    document.querySelectorAll("[data-nav]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const dest = btn.getAttribute("data-nav");
            
            // Close mobile menu if open
            if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
                mobileMenu.classList.add("hidden");
                if (menuIcon) {
                    menuIcon.setAttribute("data-lucide", "menu");
                    if (typeof lucide !== "undefined") {
                        lucide.createIcons();
                    }
                }
            }

            if (dest === "about" || dest === "signin" || dest === "settings") {
                e.preventDefault();
                openModal(dest);
            } else if (dest === "home") {
                e.preventDefault();
                window.location.href = "index.html";
            }
        });
    });

    // Attach close triggers to backdrop click and close buttons
    document.querySelectorAll(".modal-overlay").forEach((modal) => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });

        const closeBtn = modal.querySelector(".modal-close");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                closeModal(modal);
            });
        }
    });

    /* ========================================================
       4. LOCAL SETTINGS MANAGEMENT (API KEY CONFIGURATION)
       ======================================================== */
    const apiKeyInput = document.getElementById("local-api-key");
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    const clearApiKeyBtn = document.getElementById("clear-api-key-btn");

    // Load saved key on boot
    if (apiKeyInput) {
        const savedKey = localStorage.getItem("groq_api_key");
        if (savedKey) {
            apiKeyInput.value = savedKey;
        }
    }

    if (saveSettingsBtn && apiKeyInput) {
        saveSettingsBtn.addEventListener("click", () => {
            const keyVal = apiKeyInput.value.trim();
            if (keyVal) {
                localStorage.setItem("groq_api_key", keyVal);
                alert("API Key saved to browser storage!");
            } else {
                localStorage.removeItem("groq_api_key");
                alert("Empty key cleared.");
            }
            closeModal(modals.settings);
        });
    }

    if (clearApiKeyBtn && apiKeyInput) {
        clearApiKeyBtn.addEventListener("click", () => {
            apiKeyInput.value = "";
            localStorage.removeItem("groq_api_key");
            alert("API Key cleared.");
            closeModal(modals.settings);
        });
    }

    /* ========================================================
       5. CHAT LOGIC & PROMPT SEARCH PROCESSOR
       ======================================================== */
    const mainContent = document.getElementById("main-content");
    const heroSection = document.getElementById("hero-section");
    const initialSearchContainer = document.getElementById("initial-search-container");
    
    const searchForm = document.getElementById("search-form");
    const queryInput = document.getElementById("query-input");
    const sendButton = document.getElementById("send-button");
    const btnIcon = document.getElementById("btn-icon");
    const searchBox = document.getElementById("search-box");

    const chatHistoryBox = document.getElementById("chat-history-box");
    const chatMessages = document.getElementById("chat-messages");
    const thinkingIndicator = document.getElementById("thinking-indicator");
    
    const bottomSearchBar = document.getElementById("bottom-search-bar");
    const scrollTopBtn = document.getElementById("scroll-top-btn");
    const landingFooter = document.getElementById("landing-footer");

    let messagesList = [];
    let isChatActive = false;
    let isLoading = false;

    // Auto-grow textarea functionality
    if (queryInput) {
        queryInput.addEventListener("input", () => {
            queryInput.style.height = "auto";
            queryInput.style.height = `${Math.min(queryInput.scrollHeight, 200)}px`;

            // Enable/disable send button based on prompt content
            const hasValue = queryInput.value.trim().length > 0;
            sendButton.disabled = !hasValue || isLoading;
            
            if (hasValue && !isLoading) {
                sendButton.classList.remove("bg-midnight-blue", "text-nebula-gray", "cursor-not-allowed");
                sendButton.classList.add("bg-cosmic-gold", "text-void-black", "hover:bg-cosmic-gold-light");
            } else {
                sendButton.classList.add("bg-midnight-blue", "text-nebula-gray", "cursor-not-allowed");
                sendButton.classList.remove("bg-cosmic-gold", "text-void-black", "hover:bg-cosmic-gold-light");
            }
        });

        // Submit on Enter key (without Shift)
        queryInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                searchForm.dispatchEvent(new Event("submit"));
            }
        });

        // Highlight box styling on focus
        queryInput.addEventListener("focus", () => {
            searchBox.classList.add("glow-gold", "shadow-2xl");
        });
        queryInput.addEventListener("blur", () => {
            searchBox.classList.remove("glow-gold", "shadow-2xl");
        });
        
        // Auto focus
        queryInput.focus();
    }

    // Scroll back to top
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Scroll monitor for scroll-to-top button
    window.addEventListener("scroll", () => {
        if (scrollTopBtn && isChatActive) {
            const shouldShow = window.scrollY > 200;
            if (shouldShow) {
                scrollTopBtn.classList.remove("translate-y-10", "opacity-0", "pointer-events-none");
            } else {
                scrollTopBtn.classList.add("translate-y-10", "opacity-0", "pointer-events-none");
            }
        }
    });

    // Helper: Scroll chat container to bottom
    function scrollToBottom() {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });
    }

    // Helper: Format messages with Markdown parsing
    function renderMarkdownContent(content) {
        if (typeof marked !== "undefined" && typeof marked.parse === "function") {
            return marked.parse(content);
        }
        // Fallback simple line break mapping if Marked library failed to load
        return content.replace(/\n/g, "<br>");
    }

    // Helper: Add bubble to chat box
    function appendMessageBubble(role, content) {
        const isUser = role === "user";
        const bubbleWrapper = document.createElement("div");
        bubbleWrapper.className = `flex animate-message ${isUser ? "justify-end" : "justify-start"}`;

        const row = document.createElement("div");
        row.className = `flex gap-4 items-start max-w-[85%] ${isUser ? "flex-row-reverse" : ""}`;

        // Avatar Column
        const avatarCol = document.createElement("div");
        avatarCol.className = "flex flex-col items-center flex-shrink-0 mt-1";
        
        const label = document.createElement("span");
        label.className = "text-[10px] text-nebula-gray/70 mb-1";
        label.textContent = isUser ? "You" : "MUAZ";
        
        const avatar = document.createElement("div");
        avatar.className = `w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-cosmic-gold/20 text-cosmic-gold" : "bg-midnight-blue/80 text-star-white border border-white/10"
        }`;
        
        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", isUser ? "user" : "bot");
        icon.className = "w-4 h-4";
        
        avatar.appendChild(icon);
        avatarCol.appendChild(label);
        avatarCol.appendChild(avatar);
        row.appendChild(avatarCol);

        // Content Bubble Column
        const bubble = document.createElement("div");
        bubble.className = `px-4 py-3 rounded-2xl flex-shrink mt-4 ${isUser ? "glass-light text-star-white" : "glass"}`;
        
        if (isUser) {
            bubble.style.minWidth = "min-content";
            const textElement = document.createElement("p");
            textElement.className = "text-star-white text-[15px]";
            textElement.style.textWrap = "balance";
            textElement.style.overflowWrap = "break-word";
            textElement.textContent = content;
            bubble.appendChild(textElement);
        } else {
            const htmlBox = document.createElement("div");
            htmlBox.className = "text-star-white prose prose-invert max-w-none prose-sm";
            htmlBox.innerHTML = renderMarkdownContent(content);
            bubble.appendChild(htmlBox);
        }

        row.appendChild(bubble);
        bubbleWrapper.appendChild(row);
        chatMessages.appendChild(bubbleWrapper);

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    // Main API Search Function
    async function handleSearch(prompt) {
        if (isLoading || !prompt.trim()) return;

        isLoading = true;
        // Update send button state
        sendButton.disabled = true;
        sendButton.classList.add("bg-midnight-blue", "text-nebula-gray", "cursor-not-allowed");
        sendButton.classList.remove("bg-cosmic-gold", "text-void-black", "hover:bg-cosmic-gold-light");
        if (btnIcon) {
            btnIcon.setAttribute("data-lucide", "loader-2");
            btnIcon.classList.add("animate-spin");
            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }
        }

        // Add user prompt to history
        messagesList.push({ role: "user", content: prompt });
        appendMessageBubble("user", prompt);
        
        // Transition layouts on first search
        if (!isChatActive) {
            isChatActive = true;
            
            // Hide Landing items
            if (heroSection) heroSection.classList.add("hidden");
            if (initialSearchContainer) initialSearchContainer.classList.add("hidden");
            if (landingFooter) landingFooter.classList.add("hidden");
            
            // Re-style main layout container (removing center items)
            if (mainContent) {
                mainContent.classList.remove("items-center", "justify-center");
                mainContent.classList.add("pt-32", "pb-32");
            }
            
            // Display chat views
            if (chatHistoryBox) chatHistoryBox.classList.remove("hidden");
            
            // Move Search Form to Bottom Bar and animate it
            if (bottomSearchBar) {
                bottomSearchBar.appendChild(searchForm);
                bottomSearchBar.classList.remove("translate-y-12", "opacity-0", "pointer-events-none");
            }
        }

        // Show thinking indicator
        if (thinkingIndicator) {
            thinkingIndicator.classList.remove("hidden");
            chatHistoryBox.appendChild(thinkingIndicator); // ensure it's at the end
        }
        
        scrollToBottom();

        try {
            const savedKey = localStorage.getItem("groq_api_key");
            let responseText = "";

            if (savedKey) {
                // Scenario A: Client-Side direct calling (bypass server proxy)
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${savedKey}`
                    },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: messagesList.map(msg => ({
                            role: msg.role,
                            content: msg.content
                        }))
                    })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error?.message || `Groq API Error: ${response.status}`);
                }

                const data = await response.json();
                responseText = data.choices[0]?.message?.content || "No response received.";
            } else {
                // Scenario B: Request through server proxy endpoint
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        messages: messagesList.map(msg => ({
                            role: msg.role,
                            content: msg.content
                        }))
                    })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || `Server Proxy Error: ${response.status}`);
                }

                const data = await response.json();
                responseText = data.text || "No response received.";
            }

            // Hide thinking indicator
            if (thinkingIndicator) {
                thinkingIndicator.classList.add("hidden");
            }

            // Add Assistant response to history
            messagesList.push({ role: "assistant", content: responseText });
            appendMessageBubble("assistant", responseText);

        } catch (error) {
            console.error("Query handling failure:", error);
            if (thinkingIndicator) {
                thinkingIndicator.classList.add("hidden");
            }
            appendMessageBubble("assistant", `**Error:** ${error.message || "Failed to contact AI service. Please verify your connection or API Key configuration."}`);
        } finally {
            isLoading = false;
            // Restore search input button states
            if (btnIcon) {
                btnIcon.setAttribute("data-lucide", "send");
                btnIcon.classList.remove("animate-spin");
                if (typeof lucide !== "undefined") {
                    lucide.createIcons();
                }
            }
            if (queryInput) {
                queryInput.value = "";
                queryInput.style.height = "auto";
                queryInput.focus();
            }
            scrollToBottom();
        }
    }

    // Search Form Submit Handler
    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (queryInput) {
                const text = queryInput.value.trim();
                if (text) {
                    handleSearch(text);
                }
            }
        });
    }

    // Prompt Suggestions Buttons Handlers
    document.querySelectorAll(".suggestion-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const prompt = btn.getAttribute("data-prompt");
            if (prompt) {
                handleSearch(prompt);
            }
        });
    });
});
