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

// --- Récupérer IP ---
async function getUserIP() {
  let res = await fetch("https://api.ipify.org?format=json");
  let data = await res.json();
  return data.ip;
}

//Gere les candidats et leurs côtes
async function loadCandidates(ip) {
  const snapshot = await db.collection("candidates").get();
  const container = document.getElementById("candidates");
  container.innerHTML = "";

  let totalVotes = 0;
  const candidates = [];
  snapshot.forEach(doc => {
    let data = doc.data();
    candidates.push({ id: doc.id, votes: data.votes, name: data.name });
    totalVotes += data.votes;
  });

  const numCandidates = candidates.length;
  const adjustedTotal = totalVotes + numCandidates;

  // Calculer toutes les probabilités
  let probs = candidates.map(c => (c.votes + 1) / adjustedTotal);

  // Calculer la moyenne des cotes brutes
  let rawCotes = probs.map(p => 1 / p);
  let averageRawCote = rawCotes.reduce((a, b) => a + b, 0) / numCandidates;

  // Valeur cible pour la cote moyenne (par exemple 50 au départ)
  const baseCote = totalVotes === 0 ? 50 : averageRawCote;

  // Affichage
  candidates.forEach((c, i) => {
    let rawCote = rawCotes[i];

    // Normaliser la cote pour que la moyenne globale soit baseCote
    let normalizedCote = (rawCote * baseCote / averageRawCote).toFixed(2);

    let div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h2>${c.name}</h2>
      <p>Votes : ${c.votes}</p>
      <p>Cote : ${normalizedCote}</p>
      <button onclick="vote('${c.id}', '${ip}')">Voter</button>
    `;
    container.appendChild(div);
  });
}





// --- Vérifier et voter ---
async function vote(candidateId, ip) {
  let check = await db.collection("votes").where("ip", "==", ip).get();
  if (!check.empty) {
    alert("Tu as déjà voté !");
    return;
  }

  // Enregistrer le vote
  await db.collection("votes").add({ ip, candidateId });
  await db.collection("candidates").doc(candidateId).update({
    votes: firebase.firestore.FieldValue.increment(1)
  });

  alert("Vote enregistré !");
  loadCandidates(ip);
}

// --- Init ---
getUserIP().then(ip => {
  loadCandidates(ip);
});
