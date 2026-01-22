const API_URL = "https://script.google.com/macros/s/AKfycbyUHIkZVpV_h8S6aEkmwNjT-BoE1jwjR8NQtLJv2HK_dtRvzpAVLcyoD2XR_d9odm3kdA/exec";

// --- THE DATABASE ---
const matches = [
    { 
        id: 1, 
        game: "BGMI - Erangel", 
        time: "8:00 PM", 
        prize: "₹2880", 
        image: "https://placehold.co/600x400/orange/white?text=BGMI",
        maxPlayers: 64 
    },
    { 
        id: 2, 
        game: "Strinova - 5v5", 
        time: "9:30 PM", 
        prize: "₹5000", 
        image: "https://placehold.co/600x400/purple/white?text=Strinova",
        maxPlayers: 10 
    },
    { 
        id: 3, 
        game: "Valorant - TDM", 
        time: "10:00 PM", 
        prize: "₹4600", 
        image: "https://placehold.co/600x400/red/white?text=Valorant",
        maxPlayers: 10 
    }
];

const container = document.getElementById("match-list");

// --- 🧠 THE BRAIN (Global Memory) ---
// We store the Google Sheet numbers here so we never lose them.
let globalGameData = {}; 
let selectedGameId = null; // For the modal

// 1. RENDER FUNCTION (Builds the cards)
function renderMatches(data) {
    container.innerHTML = ""; 

    if (data.length === 0) {
        container.innerHTML = "<p>No matches found.</p>";
        return; 
    }

    data.forEach(match => {
        // A. Check Local Storage (My Laptop's Memory)
        const isJoined = localStorage.getItem("joined-" + match.id) === "yes";

        // B. Check Global Data (Google Sheet's Memory)
        // If we have data, use it. If not, show "Loading..."
        let countText = "Loading...";
        let currentCount = 0;
        
        if (globalGameData[match.game] !== undefined) {
            currentCount = globalGameData[match.game];
            countText = currentCount + " / " + match.maxPlayers;
        }

        // C. Decide Button Status
        let buttonText = "Register";
        let buttonStyle = "";
        let isDisabled = false;

        if (isJoined) {
            // Priority 1: I already joined
            buttonText = "Joined";
            buttonStyle = "background-color: #2ed573; cursor: default;"; 
            isDisabled = true;
        } else if (globalGameData[match.game] !== undefined && currentCount >= match.maxPlayers) {
            // Priority 2: Room is Full (Only check this if we actually have data!)
            buttonText = "SOLD OUT";
            buttonStyle = "background-color: #555; cursor: not-allowed;";
            isDisabled = true;
        }

        // D. Build the HTML
        const cardHTML = `
            <div class="match-card">
                <img src="${match.image}" class="game-img">
                
                <div class="match-info">
                    <h3>${match.game}</h3>
                    <div class="meta-row">
                        <p>🕒 ${match.time}</p>
                        <p>🏆 ${match.prize}</p>
                    </div>
                    <p style="color: #bbb; font-size: 12px; margin-top: 5px;">
                        👥 <span id="count-${match.id}">${countText}</span>
                    </p>
                </div>

                <div class="match-action">
                    <button 
                        id="btn-${match.id}" 
                        class="small-btn" 
                        style="${buttonStyle}" 
                        ${isDisabled ? 'disabled' : ''} 
                        onclick="register(this, ${match.id})">
                        ${buttonText}
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// 2. SEARCH FUNCTION
function filterGames() {
    const searchInput = document.getElementById("search-box").value.toLowerCase();
    const filteredMatches = matches.filter(match => {
        return match.game.toLowerCase().includes(searchInput);
    });
    renderMatches(filteredMatches);
}

// 3. FETCH DATA (Updates the Brain)
function updatePlayerCounts() {
    fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        // SAVE DATA TO BRAIN
        globalGameData = data; 
        
        // RE-RENDER THE SCREEN (This applies the new numbers instantly)
        filterGames(); 
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

// --- POP-UP MODAL LOGIC ---

function register(button, id) {
    selectedGameId = id;
    const match = matches.find(m => m.id === id);
    document.getElementById("modal-game-name").innerText = match.game;
    document.getElementById("reg-modal").style.display = "block";
}

function closeModal() {
    document.getElementById("reg-modal").style.display = "none";
}

function submitRegistration() {
    const ign = document.getElementById("player-ign").value;
    const phone = document.getElementById("player-phone").value;
    
    if (ign === "" || phone === "") {
        alert("Please fill in all details!");
        return;
    }

    // A. Visual Update
    // Since we re-render often, we save to storage immediately
    localStorage.setItem("joined-" + selectedGameId, "yes");
    
    // B. Close Modal
    closeModal();

    // C. Re-render to show "Joined" button immediately
    filterGames();

    // D. Send to Cloud
    const match = matches.find(m => m.id === selectedGameId);
    
    fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            game: match.game,
            prize: match.prize,
            ign: ign,
            phone: phone
        })
    }).then(() => {
        console.log("Sent to Admin!");
    });
}

function resetSystem() {
    localStorage.clear();
    location.reload();
}

window.onclick = function(event) {
    const modal = document.getElementById("reg-modal");
    if (event.target == modal) {
        closeModal();
    }
}

// --- SMART NAVBAR LOGIC ---
let lastScrollTop = 0;
const navbar = document.querySelector("nav");

window.addEventListener("scroll", function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
        navbar.style.top = "-100px"; 
    } else {
        navbar.style.top = "0";
    }
    lastScrollTop = scrollTop;
});

// START THE SYSTEM
updatePlayerCounts();