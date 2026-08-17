document.addEventListener("DOMContentLoaded", () => {
    const refreshIcons = () => typeof lucide !== "undefined" && lucide.createIcons();
    refreshIcons();

    if (typeof marked !== "undefined") {
        marked.setOptions({ gfm: true, breaks: true });
    }

    /* 1. Starfield Background Canvas */
    const canvas = document.getElementById("starfield");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let stars = [], mouse = { x: -1000, y: -1000 }, isMobile = false;
        const STAR_COUNT = 200, INTERACTION_RADIUS = 150, REPEL_STRENGTH = 0.15, RETURN_SPEED = 0.05, CONNECTION_DIST = 80;

        const initStars = (w, h) => {
            stars = Array.from({ length: STAR_COUNT }, () => {
                const x = Math.random() * w, y = Math.random() * h;
                return {
                    x, y, baseX: x, baseY: y,
                    size: Math.random() * 2 + 0.5,
                    opacity: Math.random() * 0.5 + 0.3,
                    twinkleSpeed: Math.random() * 0.02 + 0.01,
                    twinkleOffset: Math.random() * Math.PI * 2
                };
            });
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            isMobile = window.innerWidth < 768;
            initStars(canvas.width, canvas.height);
        };

        const updateStars = () => {
            stars.forEach((star) => {
                const dx = star.x - mouse.x, dy = star.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < INTERACTION_RADIUS && dist > 0) {
                    const force = (INTERACTION_RADIUS - dist) / INTERACTION_RADIUS;
                    const angle = Math.atan2(dy, dx);
                    star.x += Math.cos(angle) * force * REPEL_STRENGTH * 10;
                    star.y += Math.sin(angle) * force * REPEL_STRENGTH * 10;
                }
                star.x += (star.baseX - star.x) * RETURN_SPEED;
                star.y += (star.baseY - star.y) * RETURN_SPEED;
            });
        };

        const drawConnections = () => {
            if (!ctx) return;
            for (let i = 0; i < stars.length; i++) {
                const s1 = stars[i];
                const d1 = Math.hypot(s1.x - mouse.x, s1.y - mouse.y);
                if (d1 >= INTERACTION_RADIUS) continue;
                for (let j = i + 1; j < stars.length; j++) {
                    const s2 = stars[j];
                    const dist = Math.hypot(s1.x - s2.x, s1.y - s2.y);
                    const d2 = Math.hypot(s2.x - mouse.x, s2.y - mouse.y);
                    if (dist < CONNECTION_DIST && d2 < INTERACTION_RADIUS) {
                        ctx.beginPath();
                        ctx.moveTo(s1.x, s1.y);
                        ctx.lineTo(s2.x, s2.y);
                        ctx.strokeStyle = `rgba(212, 175, 55, ${(1 - dist / CONNECTION_DIST) * (1 - d1 / INTERACTION_RADIUS) * 0.4})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        };

        const drawStars = (time) => {
            if (!ctx) return;
            stars.forEach((star) => {
                const dist = Math.hypot(star.x - mouse.x, star.y - mouse.y);
                const proximityBoost = dist < 120 ? (1 - dist / 120) * 0.8 : 0;
                let breath = 1, sizeMul = 1;
                if (isMobile) {
                    const cycle = Math.sin(time * (0.002 + star.twinkleSpeed * 0.003) + star.twinkleOffset);
                    breath = 0.8 + cycle * 0.4;
                    sizeMul = 1 + cycle * 0.3;
                }
                const glowOpacity = (star.opacity * 0.6 + proximityBoost) * breath;
                const glowSize = star.size * (4 + proximityBoost * 2) * sizeMul;

                const grad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize);
                grad.addColorStop(0, `rgba(212, 175, 55, ${Math.min(glowOpacity * 0.8, 1)})`);
                grad.addColorStop(0.3, `rgba(212, 175, 55, ${Math.min(glowOpacity * 0.4, 0.8)})`);
                grad.addColorStop(0.6, `rgba(180, 140, 40, ${Math.min(glowOpacity * 0.2, 0.5)})`);
                grad.addColorStop(1, "rgba(180, 140, 40, 0)");

                ctx.beginPath();
                ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 245, 220, ${Math.min(glowOpacity + 0.2, 1)})`;
                ctx.fill();
            });
        };

        const animate = (time) => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            updateStars();
            drawConnections();
            drawStars(time);
            requestAnimationFrame(animate);
        };

        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("mousemove", (e) => (mouse = { x: e.clientX, y: e.clientY }));
        document.addEventListener("mouseleave", () => (mouse = { x: -1000, y: -1000 }));
        resizeCanvas();
        animate(0);
    }

    /* 2. Navigation & Mobile Menu */
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    const menuIcon = document.getElementById("menu-icon");

    document.getElementById("logo-btn")?.addEventListener("click", () => window.location.reload());

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener("click", () => {
            const isClosed = mobileMenu.classList.toggle("hidden");
            menuIcon?.setAttribute("data-lucide", isClosed ? "menu" : "x");
            refreshIcons();
        });
    }

    /* 3. Modals Management */
    const modals = {
        about: document.getElementById("about-modal"),
        signin: document.getElementById("signin-modal"),
        settings: document.getElementById("settings-modal"),
    };

    const openModal = (id) => {
        const modal = modals[id];
        if (!modal) return;
        modal.classList.remove("hidden");
        requestAnimationFrame(() => modal.classList.add("show"));
    };

    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove("show");
        setTimeout(() => modal.classList.add("hidden"), 300);
    };

    document.querySelectorAll("[data-nav]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const dest = btn.getAttribute("data-nav");
            if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
                mobileMenu.classList.add("hidden");
                menuIcon?.setAttribute("data-lucide", "menu");
                refreshIcons();
            }
            if (dest in modals) {
                e.preventDefault();
                openModal(dest);
            } else if (dest === "home" && !window.location.pathname.endsWith("index.html") && window.location.pathname !== "/") {
                e.preventDefault();
                window.location.href = "index.html";
            }
        });
    });

    document.querySelectorAll(".modal-overlay").forEach((modal) => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal || e.target.closest(".modal-close")) closeModal(modal);
        });
    });

    /* 4. Local Settings (Groq API Key & Model) */
    const apiKeyInput = document.getElementById("local-api-key");
    const modelInput = document.getElementById("local-model");
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    const clearApiKeyBtn = document.getElementById("clear-api-key-btn");

    if (apiKeyInput) apiKeyInput.value = localStorage.getItem("groq_api_key") || "";
    if (modelInput) modelInput.value = localStorage.getItem("groq_model") || "";

    saveSettingsBtn?.addEventListener("click", () => {
        const key = apiKeyInput?.value.trim();
        const mdl = modelInput?.value.trim();
        if (key) localStorage.setItem("groq_api_key", key);
        else localStorage.removeItem("groq_api_key");
        if (mdl) localStorage.setItem("groq_model", mdl);
        else localStorage.removeItem("groq_model");
        alert("Settings saved!");
        closeModal(modals.settings);
    });

    clearApiKeyBtn?.addEventListener("click", () => {
        if (apiKeyInput) apiKeyInput.value = "";
        if (modelInput) modelInput.value = "";
        localStorage.removeItem("groq_api_key");
        localStorage.removeItem("groq_model");
        alert("API Key cleared.");
        closeModal(modals.settings);
    });

    /* 5. Chat & Search Processor */
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

    let messagesList = [], isChatActive = false, isLoading = false;

    const setSendButtonState = (active) => {
        if (!sendButton) return;
        sendButton.disabled = !active;
        sendButton.classList.toggle("bg-midnight-blue", !active);
        sendButton.classList.toggle("text-nebula-gray", !active);
        sendButton.classList.toggle("cursor-not-allowed", !active);
        sendButton.classList.toggle("bg-cosmic-gold", active);
        sendButton.classList.toggle("text-void-black", active);
        sendButton.classList.toggle("hover:bg-cosmic-gold-light", active);
    };

    if (queryInput) {
        queryInput.addEventListener("input", () => {
            queryInput.style.height = "auto";
            queryInput.style.height = `${Math.min(queryInput.scrollHeight, 200)}px`;
            setSendButtonState(queryInput.value.trim().length > 0 && !isLoading);
        });

        queryInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                searchForm?.dispatchEvent(new Event("submit"));
            }
        });

        queryInput.addEventListener("focus", () => searchBox?.classList.add("glow-gold", "shadow-2xl"));
        queryInput.addEventListener("blur", () => searchBox?.classList.remove("glow-gold", "shadow-2xl"));
        queryInput.focus();
    }

    const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });

    scrollTopBtn?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => {
        if (scrollTopBtn && isChatActive) {
            const hide = window.scrollY <= 200;
            scrollTopBtn.classList.toggle("translate-y-10", hide);
            scrollTopBtn.classList.toggle("opacity-0", hide);
            scrollTopBtn.classList.toggle("pointer-events-none", hide);
        }
    });

    const renderMarkdown = (content) => (typeof marked !== "undefined" && typeof marked.parse === "function" ? marked.parse(content) : content.replace(/\n/g, "<br>"));

    function appendMessageBubble(role, content) {
        const isUser = role === "user";
        const wrapper = document.createElement("div");
        wrapper.className = `flex animate-message ${isUser ? "justify-end" : "justify-start"}`;
        wrapper.innerHTML = `
            <div class="flex gap-4 items-start max-w-[85%] ${isUser ? "flex-row-reverse" : ""}">
                <div class="flex flex-col items-center flex-shrink-0 mt-1">
                    <span class="avatar-label text-[10px] text-nebula-gray/70 mb-1">${isUser ? "You" : "MUAZ"}</span>
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-cosmic-gold/20 text-cosmic-gold" : "bg-midnight-blue/80 text-star-white border border-white/10"}">
                        <i data-lucide="${isUser ? "user" : "bot"}" class="w-4 h-4"></i>
                    </div>
                </div>
                <div class="px-4 py-3 rounded-2xl flex-shrink mt-4 ${isUser ? "glass-light text-star-white" : "glass"}" ${isUser ? 'style="min-width: min-content;"' : ""}>
                    ${isUser ? '<p class="text-star-white text-[15px]" style="text-wrap: balance; overflow-wrap: break-word;"></p>' : `<div class="text-star-white prose prose-invert max-w-none prose-sm">${renderMarkdown(content)}</div>`}
                </div>
            </div>`;
        if (isUser) wrapper.querySelector("p").textContent = content;
        chatMessages.appendChild(wrapper);
        refreshIcons();
    }

    async function handleSearch(prompt) {
        if (isLoading || !prompt.trim()) return;

        isLoading = true;
        setSendButtonState(false);
        if (btnIcon) {
            btnIcon.setAttribute("data-lucide", "loader-2");
            btnIcon.classList.add("animate-spin");
            refreshIcons();
        }

        messagesList.push({ role: "user", content: prompt });
        appendMessageBubble("user", prompt);

        if (!isChatActive) {
            isChatActive = true;
            heroSection?.classList.add("hidden");
            initialSearchContainer?.classList.add("hidden");
            landingFooter?.classList.add("hidden");
            mainContent?.classList.remove("items-center", "justify-center");
            mainContent?.classList.add("pt-32", "pb-32");
            chatHistoryBox?.classList.remove("hidden");
            if (bottomSearchBar && searchForm) {
                bottomSearchBar.appendChild(searchForm);
                bottomSearchBar.classList.remove("translate-y-12", "opacity-0", "pointer-events-none");
            }
        }

        if (thinkingIndicator) {
            thinkingIndicator.classList.remove("hidden");
            chatHistoryBox?.appendChild(thinkingIndicator);
        }
        scrollToBottom();

        try {
            const savedKey = localStorage.getItem("groq_api_key");
            const customModel = localStorage.getItem("groq_model");
            let reply = "";

            if (savedKey) {
                const isGroq = savedKey.startsWith("gsk_");
                if (isGroq) {
                    const modelsToTry = [customModel, "openai/gpt-oss-20b", "qwen/qwen3-32b", "llama-3.3-70b-versatile"].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
                    let lastErr = null;
                    for (const m of modelsToTry) {
                        try {
                            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedKey}` },
                                body: JSON.stringify({ model: m, messages: messagesList })
                            });
                            const data = await res.json();
                            if (!res.ok) {
                                const msg = data.error?.message || `Error: ${res.status}`;
                                if (msg.includes("model_not_found") || msg.includes("does not exist")) {
                                    lastErr = new Error(msg);
                                    continue;
                                }
                                throw new Error(msg);
                            }
                            reply = data.choices[0]?.message?.content || "No response received.";
                            break;
                        } catch (err) {
                            lastErr = err;
                            if (!err.message?.includes("model_not_found") && !err.message?.includes("does not exist")) throw err;
                        }
                    }
                    if (!reply && lastErr) throw lastErr;
                } else {
                    // Google Gemini API client-side
                    const geminiModels = [customModel, "gemini-3.7-flash", "gemini-3.6-flash", "gemini-flash-latest"].filter(Boolean);
                    const contents = messagesList.map(({ role, content }) => ({
                        role: role === "assistant" ? "model" : "user",
                        parts: [{ text: content }]
                    }));
                    let lastErr = null;
                    for (const m of geminiModels) {
                        const cleanModel = m.startsWith("models/") ? m.slice(7) : m;
                        try {
                            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${savedKey}`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ contents })
                            });
                            const data = await res.json();
                            if (!res.ok) {
                                lastErr = new Error(data.error?.message || `Gemini Error: ${res.status}`);
                                continue;
                            }
                            reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (reply) break;
                        } catch (err) {
                            lastErr = err;
                        }
                    }
                    if (!reply && lastErr) throw lastErr;
                }
            } else {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: messagesList, model: customModel })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error?.message || data.error || `Error: ${res.status}`);
                reply = data.text || "No response received.";
            }

            thinkingIndicator?.classList.add("hidden");
            messagesList.push({ role: "assistant", content: reply });
            appendMessageBubble("assistant", reply);
        } catch (error) {
            console.error("Query failure:", error);
            thinkingIndicator?.classList.add("hidden");
            appendMessageBubble("assistant", `**Error:** ${error.message || "Failed to contact AI service. Please verify your connection or API Key configuration."}`);
        } finally {
            isLoading = false;
            if (btnIcon) {
                btnIcon.setAttribute("data-lucide", "send");
                btnIcon.classList.remove("animate-spin");
                refreshIcons();
            }
            if (queryInput) {
                queryInput.value = "";
                queryInput.style.height = "auto";
                queryInput.focus();
            }
            scrollToBottom();
        }
    }

    searchForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = queryInput?.value.trim();
        if (text) handleSearch(text);
    });

    document.querySelectorAll(".suggestion-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const prompt = btn.getAttribute("data-prompt");
            if (prompt) handleSearch(prompt);
        });
    });
});
