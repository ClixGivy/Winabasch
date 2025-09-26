// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNel8c8bMvT2_xh1twCaZ0LuhLHpFsFxk",
  authDomain: "winabasch.firebaseapp.com",
  projectId: "winabasch",
  storageBucket: "winabasch.firebasestorage.app",
  messagingSenderId: "1078589518455",
  appId: "1:1078589518455:web:b2ae37f6a90d10a2978c72",
  measurementId: "G-L2KCGW9FQZ"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- Protection par mot de passe ---
// Change le mot de passe ici 👇
const ADMIN_PASSWORD = "secret123";

function checkPassword() {
  const input = document.getElementById("adminPassword").value;
  if (input === ADMIN_PASSWORD) {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    loadCandidates();
  } else {
    alert("Mauvais mot de passe ❌");
  }
}

// --- Ajouter un candidat ---
document.getElementById("addCandidateForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;

  if (!name.trim()) return;

  await db.collection("candidates").add({
    name: name,
    votes: 0
  });

  document.getElementById("name").value = "";
  loadCandidates();
});

// --- Charger candidats pour affichage ---
async function loadCandidates() {
  const snapshot = await db.collection("candidates").get();
  const container = document.getElementById("candidatesList");
  container.innerHTML = "";

  snapshot.forEach(doc => {
    let data = doc.data();
    let div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${data.name}</h3>
      <p>Votes actuels : ${data.votes}</p>
      <button onclick="deleteCandidate('${doc.id}')">🗑 Supprimer</button>
    `;
    container.appendChild(div);
  });
}

// --- Supprimer un candidat ---
async function deleteCandidate(candidateId) {
  if (confirm("Tu es sûr de vouloir supprimer ce candidat ?")) {
    await db.collection("candidates").doc(candidateId).delete();
    loadCandidates();
  }
}
