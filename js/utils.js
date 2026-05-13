(function () {
    "use strict";

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function formatNumber(value) {
        return new Intl.NumberFormat().format(Math.floor(value));
    }

    function deepGet(source, path) {
        return path.split(".").reduce((current, key) => {
            if (!current || typeof current !== "object") {
                return undefined;
            }

            return current[key];
        }, source);
    }

    function translate(key, params, languageCode) {
        const rawLang = languageCode || window.GameState?.settings?.language || window.Base?.defaultLanguage;
        const language = window.GameLocalization?.normalizeLanguageCode?.(rawLang) || rawLang || "en";
        const localeDict = window.Localization?.[language];
        let value = localeDict ? deepGet(localeDict, key) : undefined;

        if (value === undefined || value === null) {
            value = deepGet(window.Localization?.en, key);
        }

        if (value === undefined || value === null) {
            value = deepGet(window.Localization?.ru, key);
        }

        if (value === undefined || value === null) {
            value = key;
        }

        if (!params) {
            return value;
        }

        return Object.keys(params).reduce((text, paramKey) => {
            return text.replace(new RegExp("\\{" + paramKey + "\\}", "g"), params[paramKey]);
        }, value);
    }

    function createDebounce(callback, delayMs) {
        let timerId = 0;

        return function debounced() {
            window.clearTimeout(timerId);
            timerId = window.setTimeout(callback, delayMs);
        };
    }

    const imageGroups = {
        ui: [
            "coin", "cup", "cube", "hp", "damage", "level", "crit", "click",
            "passive", "settings", "profile", "fighters", "leaderboard", "shop",
            "upgrade", "vip", "box", "ad-box", "panel-bg", "button-bg", "card-bg",
            "background"
        ],
        effects: ["bullet", "merge", "cartoon"]
    };



    const soundVolumes = {
        "bg-music": 0.35,
        "box": 0.45,
        "merge": 0.42,
        "win": 0.38,
        "lose": 0.42
    };

    const soundKeys = ["bg-music", "click", "shoot", "merge", "box", "win", "lose", "button", "coin-scatter"];

    const assets = {
        loaded: false,
        images: {},
        sounds: {},
        soundLastPlay: Object.create(null),
        appSuspended: false,
        webAudio: null,
        music: {
            started: false,
            fileSource: null,
            synthGain: null,
            synthTimerId: 0,
            synthStep: 0
        }
    };

    function getOrCreateWebAudio() {
        if (assets.webAudio) {
            return assets.webAudio;
        }

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            return null;
        }

        const context = new AudioContextClass();
        const masterGain = context.createGain();
        masterGain.gain.value = 1;
        masterGain.connect(context.destination);

        const musicGain = context.createGain();
        musicGain.gain.value = 0.28;
        musicGain.connect(masterGain);

        assets.webAudio = {
            context,
            masterGain,
            musicGain
        };

        return assets.webAudio;
    }

    function resumeAudioContextIfNeeded() {
        const ctx = assets.webAudio?.context;

        if (ctx && ctx.state === "suspended" && typeof ctx.resume === "function") {
            ctx.resume().catch(() => {});
        }
    }

    async function decodeSoundAsset(key) {
        const sound = assets.sounds[key];

        if (!sound) {
            return sound;
        }

        try {
            const response = await fetch(sound.path);

            if (!response.ok) {
                throw new Error("sound_fetch");
            }

            const arrayBuffer = await response.arrayBuffer();
            const wa = getOrCreateWebAudio();

            if (!wa) {
                sound.missing = true;
                return sound;
            }

            sound.buffer = await wa.context.decodeAudioData(arrayBuffer.slice(0));
        } catch (error) {
            sound.missing = true;
        }

        return sound;
    }

    function stopFileBackgroundMusic() {
        if (assets.music.fileSource) {
            try {
                assets.music.fileSource.stop(0);
            } catch (error) {
                void error;
            }

            try {
                assets.music.fileSource.disconnect();
            } catch (error) {
                void error;
            }

            assets.music.fileSource = null;
        }
    }

    function updateMusicGainFromSettings() {
        const wa = assets.webAudio;

        if (!wa?.musicGain) {
            return;
        }

        const musicVolume = window.GameState?.settings?.musicVolume ?? 1;

        wa.musicGain.gain.value = clamp(0.28 * musicVolume, 0, 1);
    }

    function createImageEntry(key, path, label) {
        return new Promise((resolve) => {
            const image = new Image();
            const entry = {
                key,
                path,
                label,
                image,
                missing: false
            };

            image.onload = () => {
                assets.images[key] = entry;
                resolve(entry);
            };

            image.onerror = () => {
                entry.missing = true;
                entry.image = null;
                assets.images[key] = entry;
                resolve(entry);
            };

            image.src = path;
        });
    }

    function ensureSoundLoaded(key) {
        if (assets.sounds[key]) {
            return;
        }

        const extension = key === "bg-music" || key === "coin-scatter" ? "mp3" : "wav";
        const path = "assets/sounds/" + key + "." + extension;
        const sound = {
            key,
            path,
            buffer: null,
            missing: false,
            decodePromise: null
        };

        assets.sounds[key] = sound;
        sound.decodePromise = decodeSoundAsset(key);
    }

    function getImageManifest() {
        const brawlers = (window.BrawlerConfig || []).map((brawler) => ({
            key: "brawler:" + brawler.type,
            path: brawler.icon,
            label: brawler.nameKey
        }));

        const ui = imageGroups.ui.map((name) => ({
            key: "ui:" + name,
            path: "assets/images/ui/" + name + ".png",
            label: name
        }));

        const effects = imageGroups.effects.map((name) => ({
            key: "effect:" + name,
            path: "assets/images/effects/" + name + ".png",
            label: name
        }));

        return brawlers.concat(ui, effects);
    }

    const deferredImageLoadKeys = new Set(["ui:background"]);

    function loadAssets(onProgress) {
        const manifest = getImageManifest();
        const total = manifest.length;
        let loaded = 0;

        function notify() {
            if (typeof onProgress === "function" && total > 0) {
                onProgress(loaded / total);
            }
        }

        function startImageEntry(entry) {
            createImageEntry(entry.key, entry.path, entry.label).then(() => {
                loaded += 1;
                notify();
            });
        }

        const now = [];
        const later = [];

        manifest.forEach((entry) => {
            if (deferredImageLoadKeys.has(entry.key)) {
                later.push(entry);
            } else {
                now.push(entry);
            }
        });

        now.forEach(startImageEntry);
        if (later.length > 0) {
            window.setTimeout(() => {
                later.forEach(startImageEntry);
            }, 100);
        }

        assets.loaded = true;
        if (typeof onProgress === "function") {
            onProgress(1);
        }

        soundKeys.forEach((key) => ensureSoundLoaded(key));
        const soundDecodePromises = soundKeys.map((key) => assets.sounds[key].decodePromise);

        return Promise.all(soundDecodePromises).then(() => assets);
    }

    function getImage(key) {
        return assets.images[key] || null;
    }

    function drawImageOrPlaceholder(ctx, key, x, y, width, height, label, color) {
        const entry = getImage(key);

        if (entry && !entry.missing && entry.image) {
            ctx.drawImage(entry.image, x, y, width, height);
            return;
        }

        if (key === "ui:box" || key === "ui:ad-box") {
            drawLootBoxPlaceholder(ctx, x, y, width, height, key === "ui:ad-box");
            return;
        }

        if (label === "") {
            ctx.save();
            ctx.fillStyle = color || "rgba(255, 255, 255, 0.08)";
            ctx.fillRect(x, y, width, height);
            ctx.restore();
            return;
        }

        const radius = Math.min(width, height) * 0.18;
        ctx.save();
        ctx.fillStyle = color || "#4964ff";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, y, width, height, radius);
        } else {
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "700 " + Math.max(12, Math.floor(height * 0.18)) + "px Arial";
        ctx.fillText(label || "?", x + width / 2, y + height / 2, width * 0.82);
        ctx.restore();
    }

    function drawLootBoxPlaceholder(ctx, x, y, width, height, isRewardBox) {
        const scale = Math.min(width, height) / 160;
        const centerX = x + width / 2;
        const centerY = y + height / 2 + 8 * scale;
        const boxWidth = 124 * scale;
        const boxHeight = 88 * scale;
        const left = centerX - boxWidth / 2;
        const top = centerY - boxHeight / 2 + 18 * scale;
        const lidHeight = 34 * scale;
        const bodyTop = top + 30 * scale;

        ctx.save();
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        ctx.beginPath();
        ctx.ellipse(centerX, top + boxHeight + 10 * scale, boxWidth * 0.45, 12 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isRewardBox ? "#38d8ff" : "#ffbd38";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 5 * scale;
        ctx.beginPath();
        roundedRect(ctx, left + 6 * scale, bodyTop, boxWidth - 12 * scale, boxHeight - 28 * scale, 15 * scale);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isRewardBox ? "#ff4d7d" : "#7d54ff";
        ctx.fillRect(centerX - 12 * scale, bodyTop, 24 * scale, boxHeight - 28 * scale);
        ctx.fillRect(left + 6 * scale, bodyTop + 28 * scale, boxWidth - 12 * scale, 16 * scale);

        ctx.fillStyle = isRewardBox ? "#78efff" : "#ffd766";
        ctx.beginPath();
        roundedRect(ctx, left + 4 * scale, top + 8 * scale, boxWidth - 8 * scale, lidHeight - 6 * scale, 8 * scale);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isRewardBox ? "#ff4d7d" : "#7d54ff";
        ctx.fillRect(centerX - 13 * scale, top + 8 * scale, 26 * scale, lidHeight - 6 * scale);

        ctx.fillStyle = "#ffe15c";
        ctx.strokeStyle = "#8a5a00";
        ctx.lineWidth = 3 * scale;
        drawStar(ctx, centerX, bodyTop + 36 * scale, 17 * scale, 8 * scale, 5);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    function roundedRect(ctx, x, y, width, height, radius) {
        if (ctx.roundRect) {
            ctx.roundRect(x, y, width, height, radius);
            return;
        }

        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
    }

    function drawStar(ctx, centerX, centerY, outerRadius, innerRadius, points) {
        ctx.beginPath();
        for (let index = 0; index < points * 2; index += 1) {
            const radius = index % 2 === 0 ? outerRadius : innerRadius;
            const angle = -Math.PI / 2 + index * Math.PI / points;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
    }

    function playSound(key) {
        ensureSoundLoaded(key);
        const sound = assets.sounds[key];

        if (!sound || sound.missing || !sound.buffer || window.GameState?.settings?.sound === false) {
            return;
        }

        if (assets.appSuspended) {
            return;
        }

        const throttleMs = window.PerformanceConfig?.soundThrottleMs?.[key] ?? 0;

        if (throttleMs > 0) {
            const now = performance.now();

            if (now - (assets.soundLastPlay[key] || 0) < throttleMs) {
                return;
            }

            assets.soundLastPlay[key] = now;
        }

        const wa = getOrCreateWebAudio();

        if (!wa) {
            return;
        }

        try {
            const ctx = wa.context;
            const volumeScale = window.GameState?.settings?.soundVolume ?? 1;
            const baseVol = Number.isFinite(soundVolumes[key]) ? soundVolumes[key] : 0.6;
            const gainNode = ctx.createGain();
            gainNode.gain.value = clamp(baseVol * volumeScale, 0, 1);

            const source = ctx.createBufferSource();
            source.buffer = sound.buffer;
            source.connect(gainNode);
            gainNode.connect(wa.masterGain);
            resumeAudioContextIfNeeded();
            source.start(0);
        } catch (error) {
            console.warn("Sound playback failed:", key, error);
        }
    }

    const SYNTH_MELODY = [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 392];

    function stopSynthNoteInterval() {
        if (assets.music.synthTimerId) {
            window.clearInterval(assets.music.synthTimerId);
            assets.music.synthTimerId = 0;
        }
    }

    function startSynthNoteInterval() {
        if (!assets.webAudio?.context || !assets.music.synthGain || assets.music.synthTimerId) {
            return;
        }

        const context = assets.webAudio.context;
        const gain = assets.music.synthGain;

        assets.music.synthTimerId = window.setInterval(() => {
            const frequency = SYNTH_MELODY[assets.music.synthStep % SYNTH_MELODY.length];
            const oscillator = context.createOscillator();
            const noteGain = context.createGain();
            const now = context.currentTime;

            oscillator.type = "triangle";
            oscillator.frequency.setValueAtTime(frequency, now);
            noteGain.gain.setValueAtTime(0, now);
            noteGain.gain.linearRampToValueAtTime(1, now + 0.02);
            noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            oscillator.connect(noteGain);
            noteGain.connect(gain);
            oscillator.start(now);
            oscillator.stop(now + 0.24);
            assets.music.synthStep += 1;
        }, 280);
    }

    function pauseBackgroundAudio() {
        stopSynthNoteInterval();

        if (assets.webAudio?.context && typeof assets.webAudio.context.suspend === "function") {
            assets.webAudio.context.suspend().catch(() => {});
        }
    }

    function resumeBackgroundAudio() {
        if (window.GameState?.settings?.music === false) {
            return;
        }

        if (!assets.music.started) {
            return;
        }

        const ctx = assets.webAudio?.context;

        if (ctx && typeof ctx.resume === "function") {
            ctx.resume().then(() => {
                if (!assets.music.fileSource && assets.music.synthGain) {
                    startSynthNoteInterval();
                }
            }).catch(() => {});
        } else if (!assets.music.fileSource && assets.music.synthGain) {
            startSynthNoteInterval();
        }
    }

    function setAppSuspended(suspended) {
        const next = Boolean(suspended);

        if (assets.appSuspended === next) {
            return;
        }

        assets.appSuspended = next;

        if (next) {
            pauseBackgroundAudio();
        } else {
            resumeBackgroundAudio();
        }
    }

    function isAppSuspended() {
        return Boolean(assets.appSuspended);
    }

    function tryStartFileBackgroundMusic(sound) {
        const wa = getOrCreateWebAudio();

        if (!wa || !sound.buffer) {
            startSynthMusic();
            return;
        }

        try {
            stopSynthNoteInterval();

            if (assets.music.synthGain) {
                try {
                    assets.music.synthGain.disconnect();
                } catch (error) {
                    void error;
                }

                assets.music.synthGain = null;
            }

            stopFileBackgroundMusic();

            const ctx = wa.context;
            const source = ctx.createBufferSource();

            source.buffer = sound.buffer;
            source.loop = true;
            source.connect(wa.musicGain);
            updateMusicGainFromSettings();
            source.start(0);
            assets.music.fileSource = source;
            assets.music.started = true;
            ctx.resume().catch(() => {
                assets.music.started = false;
                stopFileBackgroundMusic();
                startSynthMusic();
            });
        } catch (error) {
            assets.music.started = false;
            stopFileBackgroundMusic();
            startSynthMusic();
        }
    }

    function startBackgroundMusic() {
        if (assets.music.started || window.GameState?.settings?.music === false) {
            return;
        }

        ensureSoundLoaded("bg-music");
        const sound = assets.sounds["bg-music"];

        if (!sound) {
            startSynthMusic();
            return;
        }

        if (sound.buffer) {
            tryStartFileBackgroundMusic(sound);
            return;
        }

        if (sound.missing) {
            startSynthMusic();
            return;
        }

        sound.decodePromise?.then(() => {
            if (assets.music.started || window.GameState?.settings?.music === false) {
                return;
            }

            startBackgroundMusic();
        });
    }

    function startSynthMusic() {
        if (assets.music.started || window.GameState?.settings?.music === false) {
            return;
        }

        const wa = getOrCreateWebAudio();

        if (!wa) {
            return;
        }

        stopFileBackgroundMusic();
        stopSynthNoteInterval();

        if (assets.music.synthGain) {
            try {
                assets.music.synthGain.disconnect();
            } catch (error) {
                void error;
            }

            assets.music.synthGain = null;
        }

        const context = wa.context;
        const gain = context.createGain();
        const musicVolume = window.GameState?.settings?.musicVolume ?? 1;

        gain.gain.value = 0.025 * musicVolume;
        gain.connect(wa.masterGain);
        assets.music.synthGain = gain;
        assets.music.started = true;
        context.resume().then(() => {
            startSynthNoteInterval();
        }).catch(() => {});
    }

    window.GameUtils = {
        clamp,
        randomInt,
        formatNumber,
        translate,
        createDebounce
    };

    function refreshAudioSettings() {
        ensureSoundLoaded("bg-music");
        updateMusicGainFromSettings();

        if (assets.music.synthGain) {
            const musicVolume = window.GameState?.settings?.musicVolume ?? 1;

            assets.music.synthGain.gain.value = 0.025 * musicVolume;
        }
    }

    window.GameAssets = {
        state: assets,
        load: loadAssets,
        getImage,
        drawImageOrPlaceholder,
        playSound,
        startBackgroundMusic,
        refreshAudioSettings,
        setAppSuspended,
        isAppSuspended
    };
}());
