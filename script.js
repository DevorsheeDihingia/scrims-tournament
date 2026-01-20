const API_URL = "https://script.google.com/macros/s/AKfycbyUHIkZVpV_h8S6aEkmwNjT-BoE1jwjR8NQtLJv2HK_dtRvzpAVLcyoD2XR_d9odm3kdA/exec";

const matches = [
    { 
        id: 1, 
        game: "BGMI - Erangel", 
        time: "8:00 PM", 
        prize: "₹100",
        image: "https://placehold.co/600x400/orange/white?text=BGMI"
    },
    { 
        id: 2, 
        game: "Strinova - 5v5", 
        time: "9:30 PM", 
        prize: "₹500",
        image: "https://placehold.co/600x400/purple/white?text=Strinova"
    },
    { 
        id: 3, 
        game: "Valorant - TDM", 
        time: "10:00 PM", 
        prize: "₹200",
        image: "https://placehold.co/600x400/red/white?text=Valorant"
    },
    { 
        id: 4, 
        game: "Minecraft - SMP", 
        time: "11:00 PM", 
        prize: "₹0",
        image: "https://placehold.co/600x400/green/white?text=Minecraft"
    },
    { 
        id: 5, 
        game: "Free Fire - 1v4", 
        time: "11:00 PM", 
        prize: "₹0",
        image: "https://placehold.co/600x400/yellow/black?text=Free+Fire"
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
                <button class="small-btn" style="${buttonStyle}" onclick="register(this, ${match.id})">${buttonText}</button>
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