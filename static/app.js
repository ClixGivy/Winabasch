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

// --- Charger candidats ---
async function loadCandidates(ip) {
  const snapshot = await db.collection("candidates").get();
  const container = document.getElementById("candidates");
  container.innerHTML = "";

  snapshot.forEach(doc => {
    let data = doc.data();
    let div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h2>${data.name}</h2>
      <p>Votes : ${data.votes}</p>
      <p>Cote : ${(100 / (data.votes+1)).toFixed(2)}%</p>
      <button onclick="vote('${doc.id}', '${ip}')">Voter</button>
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
