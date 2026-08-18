let players = [];
let currentRound = 1;
let betAmount = 100;
let gamePool = 0;
let activePlayerId = null;
let currentDealerIndex = 0;
let isGameStarted = false;
let historyStack = [];
let reentryLog = [];
const TARGET_SCORE = 201;

let gameRules = {
    allowStandardDrop: true,
    standardDropPts: 20,
    customDropEnabled: false,
    customDropPts: 25
};

const STORAGE_KEY = "universal_scoreboard_state_v1";

window.addEventListener("DOMContentLoaded", () => {
    checkSavedState();
});

function toggleCustomDropInput() {
    const isChecked = document.getElementById("rule-custom-drop-toggle").checked;
    const wrapper = document.getElementById("custom-drop-wrapper");
    if (isChecked) {
        wrapper.classList.remove("hidden");
    } else {
        wrapper.classList.add("hidden");
    }
}

function pushHistoryState() {
    const snapshot = {
        players: JSON.parse(JSON.stringify(players)),
        currentRound,
        betAmount,
        gamePool,
        currentDealerIndex,
        isGameStarted,
        reentryLog: JSON.parse(JSON.stringify(reentryLog)),
        gameRules: JSON.parse(JSON.stringify(gameRules))
    };
    historyStack.push(snapshot);
    updateUndoButtonUI();
}

function updateUndoButtonUI() {
    const undoBtn = document.getElementById("undo-btn");
    if (historyStack.length > 0) {
        undoBtn.disabled = false;
        undoBtn.classList.remove("bg-slate-800", "text-slate-500", "cursor-not-allowed");
        undoBtn.classList.add("bg-amber-600", "hover:bg-amber-500", "text-white", "cursor-pointer", "shadow-md");
    } else {
        undoBtn.disabled = true;
        undoBtn.classList.add("bg-slate-800", "text-slate-500", "cursor-not-allowed");
        undoBtn.classList.remove("bg-amber-600", "hover:bg-amber-500", "text-white", "cursor-pointer", "shadow-md");
    }
}

function undoLastAction() {
    if (historyStack.length === 0) return;

    const previousState = historyStack.pop();
    players = previousState.players;
    currentRound = previousState.currentRound;
    betAmount = previousState.betAmount;
    gamePool = previousState.gamePool;
    currentDealerIndex = previousState.currentDealerIndex;
    isGameStarted = previousState.isGameStarted;
    reentryLog = previousState.reentryLog || [];
    if (previousState.gameRules) gameRules = previousState.gameRules;

    updateUndoButtonUI();
    saveState();
    renderDashboard();
}

function checkSavedState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        document.getElementById("resume-btn").classList.remove("hidden");
    }
}

function saveState() {
    const state = { players, currentRound, betAmount, gamePool, currentDealerIndex, isGameStarted, historyStack, reentryLog, gameRules };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    
    const indicator = document.getElementById("storage-status");
    indicator.classList.remove("hidden");
    setTimeout(() => indicator.classList.add("hidden"), 2000);
}

function clearState() {
    localStorage.removeItem(STORAGE_KEY);
}

function resumeGame() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
        const state = JSON.parse(saved);
        players = state.players;
        currentRound = state.currentRound;
        betAmount = state.betAmount;
        gamePool = state.gamePool;
        currentDealerIndex = state.currentDealerIndex;
        isGameStarted = state.isGameStarted;
        if (state.historyStack) historyStack = state.historyStack;
        if (state.reentryLog) reentryLog = state.reentryLog;
        if (state.gameRules) gameRules = state.gameRules;

        updateUndoButtonUI();

        if (isGameStarted) {
            document.getElementById("setup-screen").classList.add("hidden");
            document.getElementById("game-screen").classList.remove("hidden");
            renderDashboard();
        }
    } catch(e) {
        alert("Failed to load saved game session.");
    }
}

document.getElementById("player-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") addPlayer();
});

document.getElementById("midgame-player-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") confirmMidGameAdd();
});

function addPlayer() {
    const input = document.getElementById("player-input");
    const name = input.value.trim();
    if (!name) return;

    players.push({
        id: Date.now() + Math.random(),
        name: name,
        rounds: [], 
        total: 0,
        status: 'active' 
    });

    input.value = "";
    updateSetupUI();
}

function removePlayer(id) {
    players = players.filter(p => p.id !== id);
    updateSetupUI();
}

function updateSetupUI() {
    const listEl = document.getElementById("player-list");
    const startBtn = document.getElementById("start-btn");

    if (players.length === 0) {
        listEl.innerHTML = `<span class="text-slate-500 italic text-xs py-1">No players added yet. Add at least 2 players in sequence.</span>`;
    } else {
        listEl.innerHTML = players.map((p, index) => `
            <span class="inline-flex items-center bg-slate-800/80 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-xl text-xs font-medium gap-2 shadow-sm">
                <span class="bg-emerald-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">${index + 1}</span>
                ${p.name}
                <button onclick="removePlayer(${p.id})" class="text-slate-400 hover:text-rose-400 font-bold">&times;</button>
            </span>
        `).join('');
    }

    if (players.length >= 2) {
        startBtn.disabled = false;
        startBtn.classList.remove("bg-slate-800", "text-slate-500", "cursor-not-allowed");
        startBtn.classList.add("bg-gradient-to-r", "from-emerald-600", "to-teal-600", "hover:from-emerald-500", "hover:to-teal-500", "text-white", "cursor-pointer", "shadow-lg", "shadow-emerald-900/30");
    } else {
        startBtn.disabled = true;
        startBtn.classList.add("bg-slate-800", "text-slate-500", "cursor-not-allowed");
        startBtn.classList.remove("bg-gradient-to-r", "from-emerald-600", "to-teal-600", "hover:from-emerald-500", "hover:to-teal-500", "text-white", "cursor-pointer", "shadow-lg", "shadow-emerald-900/30");
    }
}

function startGame() {
    const betInput = parseFloat(document.getElementById("bet-input").value);
    betAmount = isNaN(betInput) ? 100 : betInput;

    gameRules.allowStandardDrop = document.getElementById("rule-standard-drop").checked;
    gameRules.customDropEnabled = document.getElementById("rule-custom-drop-toggle").checked;
    
    if (gameRules.customDropEnabled) {
        const customVal = parseInt(document.getElementById("custom-drop-val").value);
        gameRules.customDropPts = isNaN(customVal) ? 25 : customVal;
    }

    gamePool = betAmount * players.length;
    currentDealerIndex = players.length - 1;
    isGameStarted = true;
    historyStack = [];
    reentryLog = [];

    document.getElementById("setup-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    
    players.forEach(p => { if(p.rounds.length === 0) p.rounds.push(null); });

    updateUndoButtonUI();
    saveState();
    renderDashboard();
}

function resetGame() {
    if (confirm("Reset current game session? This will clear saved data.")) {
        clearState();
        players = [];
        currentRound = 1;
        gamePool = 0;
        currentDealerIndex = 0;
        isGameStarted = false;
        historyStack = [];
        reentryLog = [];
        document.getElementById("game-screen").classList.add("hidden");
        document.getElementById("setup-screen").classList.remove("hidden");
        document.getElementById("resume-btn").classList.add("hidden");
        updateSetupUI();
    }
}

function newRound() {
    const pending = players.some(p => p.status === 'active' && (p.rounds[currentRound - 1] === undefined || p.rounds[currentRound - 1] === null));
    if (pending) {
        alert("Please fill scores for all active players before starting the next round.");
        return;
    }

    pushHistoryState();

    currentRound++;
    currentDealerIndex = (currentDealerIndex + 1) % players.length;

    players.forEach(p => {
        if(p.status === 'active') {
            p.rounds.push(null);
        } else {
            p.rounds.push("-");
        }
    });
    saveState();
    renderDashboard();
}

function getDistributerName() {
    if (players.length === 0) return "-";
    if (currentDealerIndex >= players.length) {
        currentDealerIndex = 0;
    }
    return players[currentDealerIndex].name;
}

function openModal(id) {
    activePlayerId = id;
    const player = players.find(p => p.id === id);
    document.getElementById("modal-player-name").innerText = player.name;
    document.getElementById("custom-score-input").value = "";

    let modalBtnsHtml = `
        <button onclick="submitScore(0, 'Winner (0 Pts)')" class="w-full bg-gradient-to-r from-emerald-900/40 to-teal-900/40 hover:from-emerald-900/60 hover:to-teal-900/60 text-emerald-200 border border-emerald-500/30 font-medium p-2.5 rounded-xl text-left flex items-center justify-between transition">
            <span class="font-bold text-xs sm:text-sm">🏆 Round Winner</span>
            <span class="text-[11px] text-emerald-400 font-bold">0 Pts</span>
        </button>
    `;

    if (gameRules.allowStandardDrop) {
        modalBtnsHtml += `
            <button onclick="submitScore(${gameRules.standardDropPts}, 'Standard Drop')" class="w-full glass-card hover:bg-slate-800 text-amber-200 border border-amber-500/20 font-medium p-2.5 rounded-xl text-left flex items-center justify-between transition">
                <span class="font-bold text-xs sm:text-sm">Standard Drop</span>
                <span class="text-[11px] text-amber-400 font-bold">${gameRules.standardDropPts} Pts</span>
            </button>
        `;
    }

    modalBtnsHtml += `
        <button onclick="submitScore(40, 'Middle Drop')" class="w-full glass-card hover:bg-slate-800 text-orange-200 border border-orange-500/20 font-medium p-2.5 rounded-xl text-left flex items-center justify-between transition">
            <span class="font-bold text-xs sm:text-sm">Middle Drop</span>
            <span class="text-[11px] text-orange-400 font-bold">40 Pts</span>
        </button>
    `;

    if (gameRules.customDropEnabled) {
        modalBtnsHtml += `
            <button onclick="submitScore(${gameRules.customDropPts}, 'Custom Drop')" class="w-full glass-card hover:bg-slate-800 text-cyan-200 border border-cyan-500/20 font-medium p-2.5 rounded-xl text-left flex items-center justify-between transition">
                <span class="font-bold text-xs sm:text-sm">Custom Drop</span>
                <span class="text-[11px] text-cyan-400 font-bold">${gameRules.customDropPts} Pts</span>
            </button>
        `;
    }

    modalBtnsHtml += `
        <button onclick="submitScore(80, 'Full Count')" class="w-full glass-card hover:bg-slate-800 text-rose-200 border border-rose-500/20 font-medium p-2.5 rounded-xl text-left flex items-center justify-between transition">
            <span class="font-bold text-xs sm:text-sm">Full Count</span>
            <span class="text-[11px] text-rose-400 font-bold">80 Pts</span>
        </button>
        <button onclick="submitScore(80, 'Wrong Show')" class="w-full glass-card hover:bg-slate-800 text-purple-200 border border-purple-500/20 font-medium p-2.5 rounded-xl text-left flex items-center justify-between transition">
            <span class="font-bold text-xs sm:text-sm">Wrong Show</span>
            <span class="text-[11px] text-purple-400 font-bold">80 Pts</span>
        </button>
    `;

    document.getElementById("modal-buttons-container").innerHTML = modalBtnsHtml;
    document.getElementById("score-modal").classList.remove("hidden");
    document.getElementById("score-modal").classList.add("flex");
}

function closeModal() {
    activePlayerId = null;
    document.getElementById("score-modal").classList.remove("flex");
    document.getElementById("score-modal").classList.add("hidden");
}

function openMidGameAddModal() {
    if (currentRound > 3) {
        alert("New player addition is closed after Round 3!");
        return;
    }

    let defaultDropPenalty = gameRules.allowStandardDrop ? gameRules.standardDropPts : 20;
    document.getElementById("midgame-desc").innerText = `Assigned ${defaultDropPenalty} points per prior completed round.`;
    document.getElementById("midgame-player-input").value = "";
    document.getElementById("midgame-add-modal").classList.remove("hidden");
    document.getElementById("midgame-add-modal").classList.add("flex");
}

function closeMidGameAddModal() {
    document.getElementById("midgame-add-modal").classList.remove("flex");
    document.getElementById("midgame-add-modal").classList.add("hidden");
}

function confirmMidGameAdd() {
    if (currentRound > 3) {
        alert("New player addition is closed after Round 3!");
        closeMidGameAddModal();
        return;
    }

    const nameInput = document.getElementById("midgame-player-input");
    const name = nameInput.value.trim();
    if (!name) return;

    pushHistoryState();

    gamePool += betAmount;

    let penaltyPerRound = gameRules.allowStandardDrop ? gameRules.standardDropPts : 20;
    let newRounds = [];
    let totalScore = 0;

    for (let i = 0; i < currentRound - 1; i++) {
        newRounds.push({ pts: penaltyPerRound, label: 'Standard Drop' });
        totalScore += penaltyPerRound;
    }
    newRounds.push(null);

    let status = totalScore >= TARGET_SCORE ? 'out' : 'active';

    players.push({
        id: Date.now() + Math.random(),
        name: name,
        rounds: newRounds,
        total: totalScore,
        status: status
    });

    closeMidGameAddModal();
    saveState();
    renderDashboard();
}

function submitScore(points, actionLabel = 'Custom Score') {
    if (activePlayerId) {
        applyScore(activePlayerId, points, actionLabel);
        closeModal();
    }
}

function submitCustomScore() {
    const val = parseInt(document.getElementById("custom-score-input").value);
    if (isNaN(val)) {
        alert("Please enter a valid number");
        return;
    }
    if (activePlayerId) {
        applyScore(activePlayerId, val, 'Custom Score');
        closeModal();
    }
}

function applyScore(id, points, actionLabel) {
    pushHistoryState();

    const player = players.find(p => p.id === id);
    let currentVal = player.rounds[currentRound - 1];

    if (currentVal && typeof currentVal === 'object' && currentVal.isReentryRound) {
        currentVal.roundScore = points;
        currentVal.label = actionLabel;
    } else {
        player.rounds[currentRound - 1] = { pts: points, label: actionLabel };
    }
    
    let computedTotal = 0;
    player.rounds.forEach(val => {
        if (typeof val === 'number') {
            computedTotal += val;
        } else if (val && typeof val === 'object' && val.isReentryRound) {
            computedTotal += (val.baseScore + val.roundScore);
        } else if (val && typeof val === 'object' && val.pts !== undefined) {
            computedTotal += val.pts;
        }
    });
    player.total = computedTotal;

    if (player.total >= TARGET_SCORE) {
        player.status = 'out';
    } else if (player.status === 'out' && player.total < TARGET_SCORE) {
        player.status = 'active';
    }

    saveState();
    renderDashboard();
}

function rejoinPlayer(id) {
    const nonOutPlayers = players.filter(p => p.status !== 'out');
    let maxNonOutScore = nonOutPlayers.length > 0 ? Math.max(...nonOutPlayers.map(p => p.total)) : 0;

    if (maxNonOutScore > 180) {
        alert("Re-entry is locked! Active highest score exceeds 180 (> 180).");
        return;
    }

    pushHistoryState();

    gamePool += betAmount;

    const activePlayers = players.filter(p => p.status === 'active');
    let globalMaxScore = players.length > 0 ? Math.max(...players.map(p => p.total)) : 0;
    let currentHighest = activePlayers.length > 0 ? Math.max(...activePlayers.map(p => p.total)) : globalMaxScore;

    const player = players.find(p => p.id === id);
    
    reentryLog.push({
        name: player.name,
        round: currentRound,
        amount: betAmount,
        matchedScore: currentHighest
    });

    let freshRounds = [];
    for (let r = 1; r < currentRound; r++) {
        freshRounds.push("-");
    }
    
    freshRounds.push({
        isReentryRound: true,
        baseScore: currentHighest,
        roundScore: 0,
        label: 'Re-entry'
    });

    player.rounds = freshRounds;
    player.total = currentHighest;
    player.status = 'active';

    saveState();
    renderDashboard();
}

function renderDashboard() {
    document.getElementById("game-info-bar").innerHTML = `<span>💰 Unit Pool: ${gamePool}</span> <span class="text-[11px] text-slate-400 font-normal ml-2">(Unit Value: ${betAmount} | Round ${currentRound})</span>`;
    document.getElementById("distributer-info").innerHTML = `🎴 Round ${currentRound} Turn Dealer: <span class="text-amber-300 font-bold">${getDistributerName()}</span>`;

    const addMidGameBtn = document.getElementById("add-midgame-btn");
    if (currentRound > 3) {
        addMidGameBtn.disabled = true;
        addMidGameBtn.classList.remove("bg-indigo-600/80", "hover:bg-indigo-600");
        addMidGameBtn.classList.add("bg-slate-800", "text-slate-500", "cursor-not-allowed", "border-slate-700");
        addMidGameBtn.innerText = "➕ Mid-Game Closed (After R3)";
    }

    renderMatrixTable();
    renderReentryLog();
    renderMandatoryPlayPanel();
    renderStatistics();
}

function renderMatrixTable() {
    const table = document.getElementById("matrix-table");
    
    const nonOutPlayers = players.filter(p => p.status !== 'out');
    let maxNonOutScore = nonOutPlayers.length > 0 ? Math.max(...nonOutPlayers.map(p => p.total)) : 0;
    let isReentryLocked = maxNonOutScore > 180;

    let html = `<thead><tr class="bg-slate-900/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
        <th class="p-2 border-r border-slate-800 text-center w-16">Round</th>`;
    
    players.forEach((p, idx) => {
        html += `<th class="p-2 border-r border-slate-800 text-center">
            <div class="font-bold text-slate-200 text-xs sm:text-sm">${p.name}</div>
            <div class="text-[9px] text-slate-400 font-normal">#${idx + 1}</div>
        </th>`;
    });
    html += `</tr></thead><tbody class="divide-y divide-slate-800/60">`;

    for (let r = 1; r <= currentRound; r++) {
        html += `<tr class="hover:bg-slate-800/30 transition">
            <td class="p-2 border-r border-slate-800/60 text-center font-bold text-emerald-400 text-xs bg-slate-900/40">R${r}</td>`;
        
        players.forEach(p => {
            let scoreVal = p.rounds[r - 1];
            let displayVal = "";

            if (scoreVal !== undefined && scoreVal !== null && scoreVal !== "-") {
                if (typeof scoreVal === 'object' && scoreVal.isReentryRound) {
                    displayVal = `<div class="font-bold text-amber-300">${scoreVal.baseScore} + ${scoreVal.roundScore}</div><div class="text-[9px] text-amber-400/80 font-normal">Re-entry</div>`;
                } else if (typeof scoreVal === 'object' && scoreVal.pts !== undefined) {
                    let labelColor = "text-slate-300";
                    if (scoreVal.label.includes("Drop")) labelColor = "text-amber-400";
                    if (scoreVal.label.includes("Middle")) labelColor = "text-orange-400";
                    if (scoreVal.label.includes("Full Count") || scoreVal.label.includes("Wrong Show")) labelColor = "text-rose-400";
                    if (scoreVal.label.includes("Winner")) labelColor = "text-emerald-400";

                    displayVal = `<div class="font-bold text-slate-100">${scoreVal.pts} Pts</div><div class="text-[9px] ${labelColor} font-medium">${scoreVal.label}</div>`;
                } else {
                    displayVal = `<div class="font-bold">${scoreVal} Pts</div>`;
                }
            } else if (scoreVal === "-") {
                displayVal = "-";
            } else {
                displayVal = `<button onclick="openModal(${p.id})" class="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded transition font-medium">+ Add Score</button>`;
            }
            html += `<td class="p-2 text-center border-r border-slate-800/60 text-xs sm:text-sm">${displayVal}</td>`;
        });
        html += `</tr>`;
    }

    html += `<tr class="bg-slate-900/90 font-bold border-t-2 border-slate-700">
        <td class="p-2 border-r border-slate-800 text-center text-xs text-slate-300">Total Pts</td>`;
    players.forEach(p => {
        let computedTotal = 0;
        p.rounds.forEach(val => {
            if (typeof val === 'number') {
                computedTotal += val;
            } else if (val && typeof val === 'object' && val.isReentryRound) {
                computedTotal += (val.baseScore + val.roundScore);
            } else if (val && typeof val === 'object' && val.pts !== undefined) {
                computedTotal += val.pts;
            }
        });
        p.total = computedTotal;
        if (p.total >= TARGET_SCORE && p.status === 'active') {
            p.status = 'out';
        }

        html += `<td class="p-2 text-center border-r border-slate-800 text-slate-100 text-xs sm:text-sm">${p.total}</td>`;
    });
    html += `</tr>`;

    html += `<tr class="bg-slate-900/60 border-t border-slate-800">
        <td class="p-2 border-r border-slate-800 text-center text-[10px] uppercase tracking-wider text-slate-400">Status & Actions</td>`;
    players.forEach(p => {
        let statusBadge = p.status === 'active' 
            ? `<span class="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded-full font-semibold">Active</span>`
            : `<span class="bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[9px] px-2 py-0.5 rounded-full font-semibold">Out</span>`;

        let statusTabContent = `<div class="flex flex-col items-center justify-center gap-1">`;
        statusTabContent += statusBadge;
        
        if (p.status === 'out') {
            if (!isReentryLocked) {
                statusTabContent += `<button onclick="rejoinPlayer(${p.id})" class="text-[9px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-medium transition shadow-sm">🔄 Rejoin</button>`;
            } else {
                statusTabContent += `<span class="text-[8px] bg-slate-800 text-slate-500 px-1 py-0.5 rounded">Locked</span>`;
            }
        }
        statusTabContent += `<button onclick="openModal(${p.id})" class="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-medium transition">Edit</button>`;
        statusTabContent += `</div>`;

        html += `<td class="p-2 text-center border-r border-slate-800">${statusTabContent}</td>`;
    });
    html += `</tr>`;

    html += `</tbody>`;
    table.innerHTML = html;
}

function renderReentryLog() {
    const container = document.getElementById("reentry-log-list");
    const countBadge = document.getElementById("reentry-count");

    countBadge.innerText = `${reentryLog.length} Re-entr${reentryLog.length === 1 ? 'y' : 'ies'}`;

    if (reentryLog.length === 0) {
        container.innerHTML = `<p class="text-[11px] text-amber-200/50 italic">No re-entries recorded yet.</p>`;
        return;
    }

    container.innerHTML = reentryLog.map((log, idx) => `
        <div class="bg-slate-900/80 border border-amber-500/30 p-2 rounded-xl flex justify-between items-center text-xs">
            <div>
                <span class="font-bold text-amber-300">${idx + 1}. ${log.name}</span>
                <div class="text-[9px] text-slate-400">Round ${log.round} | Fresh Start: ${log.matchedScore} Pts</div>
            </div>
            <div class="text-right">
                <span class="text-teal-300 font-bold">+${log.amount}</span>
                <div class="text-[9px] text-slate-400">Unit Contribution</div>
            </div>
        </div>
    `).join('');
}

function renderMandatoryPlayPanel() {
    const container = document.getElementById("mandatory-play-list");
    const mandatoryPlayers = players.filter(p => p.total >= 181 && p.status === 'active');

    if (mandatoryPlayers.length === 0) {
        container.innerHTML = `<p class="text-[11px] text-emerald-100/50 italic">No players at or above 181 points.</p>`;
        return;
    }

    container.innerHTML = mandatoryPlayers.map(p => `
        <div class="flex justify-between items-center bg-slate-900/60 border border-emerald-500/20 p-2 rounded-xl shadow-inner">
            <span class="font-bold text-amber-200 text-xs">${p.name}</span>
            <span class="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-lg font-bold">${p.total} Pts</span>
        </div>
    `).join('');
}

function renderStatistics() {
    const statsEl = document.getElementById("stats-content");

    let validPlayers = [...players].sort((a, b) => a.total - b.total);
    let leader = validPlayers[0];
    let highest = validPlayers[validPlayers.length - 1];

    statsEl.innerHTML = `
        <div class="bg-gradient-to-r from-emerald-950/40 to-slate-900/80 border border-emerald-500/30 p-2.5 rounded-xl flex items-center justify-between shadow-sm">
            <div>
                <div class="text-[9px] uppercase tracking-wider text-emerald-400/80 font-semibold">Leader (Min Score)</div>
                <div class="font-bold text-emerald-300 text-xs">${leader ? leader.name : '-'}</div>
            </div>
            <div class="text-emerald-400 font-extrabold text-sm">${leader ? leader.total : 0}</div>
        </div>

        <div class="bg-gradient-to-r from-rose-950/40 to-slate-900/80 border border-rose-500/30 p-2.5 rounded-xl flex items-center justify-between shadow-sm">
            <div>
                <div class="text-[9px] uppercase tracking-wider text-rose-400/80 font-semibold">Highest Risk (Max)</div>
                <div class="font-bold text-rose-300 text-xs">${highest ? highest.name : '-'}</div>
            </div>
            <div class="text-rose-400 font-extrabold text-sm">${highest ? highest.total : 0}</div>
        </div>

        <div class="grid grid-cols-2 gap-2">
            <div class="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center">
                <div class="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Active / Total</div>
                <div class="font-bold text-slate-200 text-xs mt-0.5">${players.filter(p => p.status === 'active').length} / ${players.length}</div>
            </div>
            <div class="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center">
                <div class="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Total Unit Pool</div>
                <div class="font-bold text-teal-300 text-xs mt-0.5">${gamePool}</div>
            </div>
        </div>
    `;
}