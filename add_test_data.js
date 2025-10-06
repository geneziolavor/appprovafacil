
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "${config.apiKey}",
  authDomain: "${config.authDomain}",
  projectId: "${config.projectId}",
  storageBucket: "${config.storageBucket}",
  messagingSenderId: "${config.messagingSenderId}",
  appId: "${config.appId}",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addTestData() {
  try {
    const provaRef = doc(db, "provas", "prova-de-teste-01");
    await setDoc(provaRef, {
      id: "prova-de-teste-01",
      titulo: "Prova de Matemática - Teste",
      dataAplicacao: new Date().toISOString(),
      turmaId: "turma-exemplo-01",
      numeroDeQuestoes: 5,
      gabarito: {
        '1': 'A',
        '2': 'B',
        '3': 'C',
        '4': 'D',
        '5': 'A'
      }
    });
    console.log("Prova de teste adicionada com sucesso!");
  } catch (e) {
    console.error("Erro ao adicionar dados de teste: ", e);
  }
}

addTestData();
