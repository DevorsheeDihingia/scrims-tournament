const API_URL = "https://script.google.com/macros/s/AKfycbyUHIkZVpV_h8S6aEkmwNjT-BoE1jwjR8NQtLJv2HK_dtRvzpAVLcyoD2XR_d9odm3kdA/exec";

const matches = [
    { 
        id: 1, 
        game: "BGMI - Erangel", 
        time: "8:00 PM", 
        prize: "₹2880", 
        image: "https://placehold.co/600x400/orange/white?text=BGMI",
        maxPlayers: 64 // Room for 64
    },
    { 
        id: 2, 
        game: "Strinova - 5v5", 
        time: "9:30 PM", 
        prize: "₹5000", 
        image: "https://placehold.co/600x400/purple/white?text=Strinova",
        maxPlayers: 10 // Set LOW to test "Sold Out"
    },
    // ... add maxPlayers to the others too ...
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

function renderMatches(data) {
    container.innerHTML = ""; 

    if (data.length === 0) {
        container.innerHTML = "<p>No matches found.</p>";
        return; 
    }

    data.forEach(match => {
        // 1. Check the "Backpack" (Local Storage)
        const isJoined = localStorage.getItem("joined-" + match.id);

        let buttonText = "Register";
        let buttonStyle = ""; 

        // 2. Button Logic
        if (isJoined === "yes") {
            buttonText = "Joined";
            buttonStyle = "background-color: #2ed573; cursor: default;"; 
        }

        // 3. THE FIX: We use a "Flex Wrapper" structure
        // Left = Image, Middle = Details, Right = Button
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
                        👥 <span id="count-${match.id}">Loading...</span>
                    </p>
                </div>

                <div class="match-action">
                    <button 
                        id="btn-${match.id}" 
                        class="small-btn" 
                        style="${buttonStyle}" 
                        disabled 
                        onclick="register(this, ${match.id})">
                        ${buttonText}
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// Run it once at the start
renderMatches(matches);

function register(button, id) {
    // 1. Find the game details using the ID so we know what to send
    const match = matches.find(m => m.id === id);

    // 2. Visual Change (Immediate feedback for the user)
    button.innerText = "Joined";
    button.style.backgroundColor = "#2ed573";
    button.disabled = true; // Stop them from clicking twice
    
    // 3. Save to Local Storage (Memory)
    localStorage.setItem("joined-" + id, "yes");

    // 4. Send data to Google Sheets (The Cloud)
    fetch(API_URL, {
        method: "POST",
        mode: "no-cors", // This creates a "Fire and Forget" request
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            game: match.game,
            prize: match.prize
        })
    }).then(() => {
        console.log("Sent to Admin!");
    }).catch(error => {
        console.error("Error:", error);
    });
}

function filterGames() {
    const searchInput = document.getElementById("search-box").value.toLowerCase();
    const filteredMatches = matches.filter(match => {
        return match.game.toLowerCase().includes(searchInput);
    });
    renderMatches(filteredMatches);
}

function joinMatch() {
    alert("System Status: Online. Searching for players...");
}

function resetSystem() {
    // 1. Clear the memory
    localStorage.clear();
    
    // 2. Refresh the page automatically
    location.reload();
}

// This function asks Google Sheets for the numbers
function updatePlayerCounts() {
    fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        matches.forEach(match => {
            // 1. Find the elements
            const btn = document.getElementById("btn-" + match.id);
            const countSpan = document.getElementById("count-" + match.id);
            
            // 2. Update the Text (e.g. "2 / 100")
            const count = data[match.game] || 0;
            if (countSpan) {
                countSpan.innerText = count + " / " + match.maxPlayers;
            }

            // 3. DECIDE BUTTON STATUS
            if (btn) {
                // Check if I already joined locally
                const isJoined = localStorage.getItem("joined-" + match.id) === "yes";

                if (isJoined) {
                    // CASE A: Already Joined -> Green & Disabled
                    btn.innerText = "Joined";
                    btn.style.backgroundColor = "#2ed573"; 
                    btn.disabled = true;
                    btn.style.cursor = "default";

                } else if (count >= match.maxPlayers) {
                    // CASE B: Sold Out -> Grey & Disabled
                    btn.innerText = "SOLD OUT";
                    btn.style.backgroundColor = "#555"; 
                    btn.disabled = true;
                    btn.style.cursor = "not-allowed";

                } else {
                    // CASE C: Space Available -> Red & Active (THE MISSING PIECE)
                    btn.innerText = "Register";
                    btn.style.backgroundColor = "#ff4757"; 
                    btn.disabled = false; // Enable the click!
                    btn.style.cursor = "pointer";
                }
            }
        });
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

// Run this immediately when the page loads
updatePlayerCounts();

// --- SMART NAVBAR LOGIC ---
let lastScrollTop = 0;
const navbar = document.querySelector("nav");

window.addEventListener("scroll", function() {
    // 1. Get current scroll position
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // 2. Compare with last position
    if (scrollTop > lastScrollTop) {
        // SCROLLING DOWN -> Hide Navbar (Move it up out of view)
        navbar.style.top = "-100px"; 
    } else {
        // SCROLLING UP -> Show Navbar (Bring it back to 0)
        navbar.style.top = "0";
    }
    
    // 3. Update the "last" position for the next check
    lastScrollTop = scrollTop;
});80.

