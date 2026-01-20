const API_URL = "https://script.google.com/macros/s/AKfycbyUHIkZVpV_h8S6aEkmwNjT-BoE1jwjR8NQtLJv2HK_dtRvzpAVLcyoD2XR_d9odm3kdA/exec";

const matches = [
    { 
        id: 1, 
        game: "BGMI - Erangel", 
        time: "8:00 PM", 
        prize: "₹100", 
        image: "https://placehold.co/600x400/orange/white?text=BGMI",
        maxPlayers: 100 // Room for 100
    },
    { 
        id: 2, 
        game: "Strinova - 5v5", 
        time: "9:30 PM", 
        prize: "₹500", 
        image: "https://placehold.co/600x400/purple/white?text=Strinova",
        maxPlayers: 2 // Set LOW to test "Sold Out"
    },
    // ... add maxPlayers to the others too ...
    { 
        id: 3, 
        game: "Valorant - TDM", 
        time: "10:00 PM", 
        prize: "₹200", 
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
        // 1. Check the "Backpack" (Local Storage) to see if we already joined
        const isJoined = localStorage.getItem("joined-" + match.id);

        let buttonText = "Register";
        let buttonStyle = ""; 

        // 2. If we found it in the backpack, change the look immediately
        if (isJoined === "yes") {
            buttonText = "Joined";
            buttonStyle = "background-color: #2ed573; cursor: default;"; 
        }

        const cardHTML = `
            <div class="match-card">
                <img src="${match.image}" class="game-img">
                
                <h3>${match.game}</h3>
                <p>Time: ${match.time}</p>
                <p>Prize: ${match.prize}</p>
                
                <p style="color: #bbb; font-size: 14px; margin-bottom: 10px;">
                    👥 <span id="count-${match.id}">Loading...</span> Registered
                </p>

                <button
                    id="btn-${match.id}"
                    class="small-btn"
                    style="${buttonStyle}"
                    onclick="register(this, ${match.id})">
                    ${buttonText}
                </button>
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
    .then(response => response.json()) // Convert the answer to JSON
    .then(data => {
        // 'data' looks like: { "BGMI - Erangel": 5, "Valorant": 2 }
        
        matches.forEach(match => {
            // Find the <span> we created for this game
            const countSpan = document.getElementById("count-" + match.id);
            
            // Get the count from the data (or 0 if nobody joined yet)
            const count = data[match.game] || 0;
            
            // Update the text
            if (countSpan) {
                countSpan.innerText = count;
            }
        });
    })
    .catch(error => console.error("Error fetching counts:", error));
}

// Run this immediately when the page loads
updatePlayerCounts();

function updatePlayerCounts() {
    fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        matches.forEach(match => {
            // 1. Get the current count
            const count = data[match.game] || 0;

            // 2. Update the text to show "5 / 10"
            const countSpan = document.getElementById("count-" + match.id);
            if (countSpan) {
                countSpan.innerText = count + " / " + match.maxPlayers;
            }

            // 3. THE SOLD OUT CHECK
            const btn = document.getElementById("btn-" + match.id);

            // If the room is full...
            if (count >= match.maxPlayers) {
                if (btn) {
                    btn.innerText = "SOLD OUT";
                    btn.style.backgroundColor = "#555"; // Grey color
                    btn.style.coursor = "not-allowed";
                    btn.disabled = true; // Click worn't work
                }
            }
        });
    })
    .catch(error => console.error("Error", error));
}