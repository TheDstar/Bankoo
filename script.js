// Liste des ienclis
const clients = [
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Eve"
];

// Comptes bancaires
// - Chaque iencli peut avoir plusieurs comptes
// - Chaque compte a un numéro, un nom, un solde et un historique des transactions
const bankAccounts = {
    "Alice": [{ accountNumber: 1, accountName: "Compte courant", balance: 5000, history: [] }],
    "Bob": [{ accountNumber: 1, accountName: "Compte courant", balance: 3000, history: [] }],
    "Charlie": [{ accountNumber: 1, accountName: "LDDS", balance: 7000, history: [] }],
    "Diana": [{ accountNumber: 1, accountName: "Compte courant", balance: 10000, history: [] }],
    "Eve": [{ accountNumber: 1, accountName: "Compte commun", balance: 2000, history: [] }]
};

function test() {
    console.log("Le script fonctionne correctement !");
}

// Check si le client existe
function validateClientExists(name) {
    if (!clients.includes(name)) {
        console.log(`Le client ${name} n'existe pas.`);
        return false;
    }
    return "Le client existe.";
}

// Trouver un compte par nom
function findAccount(name, accountName) {
    return bankAccounts[name]?.find(acc => acc.accountName === accountName);
}

// Vérif si le compte existe bien
function ensureAccount(name, accountName, missingMessage) {
    if (!validateClientExists(name)) {
        return null;
    }
    const account = findAccount(name, accountName);
    if (!account) {
        console.log(missingMessage || `Le compte "${accountName}" n'existe pas pour ${name}.`);
        return null;
    }
    return account;
}

// Générer un UUID par log
function generateUuid() {
    return crypto.randomUUID();
}

function createHistoryEntry(type, amount, transferDestination = null) {
    return {
        uuid: generateUuid(),
        type,
        transferDestination,
        amount,
        date: Date.now()
    };
}

function formatHistoryMessage(entry) {
    if (!entry || typeof entry !== "object") {
        return entry;
    }
    const { type, transferDestination, amount, date } = entry;
    let message = `${type}: ${amount}€`;
    if (type === "TRANSFER" && transferDestination) {
        message += ` avec ${transferDestination.accountName} (${transferDestination.clientName})`;
    }
    return `${message} - ${new Date(date).toLocaleString()}`;
}

function createBankAccount(name, accountName, initialDeposit) {
    if (!validateClientExists(name)) {
        return;
    }
    const initialHistory = initialDeposit > 0 ? [createHistoryEntry("DEPOSIT", initialDeposit)] : [];
    const newAccount = {
        accountNumber: Date.now(),
        accountName,
        balance: initialDeposit,
        history: initialHistory
    };
    bankAccounts[name] = bankAccounts[name] || [];
    bankAccounts[name].push(newAccount);
    console.log(`Le compte bancaire "${accountName}" a été créé pour ${name} avec ${initialDeposit}€ déposés.`);
}

function depositMoneyOnBankAccount(name, accountName, amount) {
    const account = ensureAccount(name, accountName);
    if (!account) {
        return;
    }
    account.balance += amount;
    account.history.push(createHistoryEntry("DEPOSIT", amount));
    console.log(`Dépôt de ${amount}€ effectué sur le compte "${accountName}" de ${name}. Nouveau solde : ${account.balance}€.`);
}

function withdrawMoneyFromBankAccount(name, accountName, amount) {
    const account = ensureAccount(name, accountName);
    if (!account) {
        return;
    }
    if (account.balance >= amount) {
        account.balance -= amount;
        account.history.push(createHistoryEntry("WITHDRAW", amount));
        console.log(`Retrait de ${amount}€ effectué sur le compte "${accountName}" de ${name}. Nouveau solde : ${account.balance}€.`);
    } else {
        console.log(`Fonds insuffisants pour le retrait de ${amount}€ sur le compte "${accountName}" de ${name}. Solde actuel : ${account.balance}€.`);
    }
}

function transferMoneyBetweenAccounts(fromName, fromAccountName, toName, toAccountName, amount) {
    if (!validateClientExists(fromName) || !validateClientExists(toName)) {
        return;
    }
    const fromAccount = findAccount(fromName, fromAccountName);
    const toAccount = findAccount(toName, toAccountName);
    if (!fromAccount || !toAccount) {
        console.log(`Un ou les deux comptes spécifiés n'existent pas.`);
        return;
    }
    if (fromAccount.balance >= amount) {
        fromAccount.balance -= amount;
        toAccount.balance += amount;
        const outgoingEntry = createHistoryEntry("TRANSFER", amount, {
            clientName: toName,
            accountName: toAccountName
        });
        const incomingEntry = createHistoryEntry("TRANSFER", amount, {
            clientName: fromName,
            accountName: fromAccountName
        });
        fromAccount.history.push(outgoingEntry);
        toAccount.history.push(incomingEntry);
        console.log(`Transfert de ${amount}€ de "${fromAccountName}" (${fromName}) à "${toAccountName}" (${toName}) effectué. Nouveau solde de "${fromAccountName}" : ${fromAccount.balance}€. Nouveau solde de "${toAccountName}" : ${toAccount.balance}€.`);
    } else {
        console.log(`Fonds insuffisants pour le transfert de ${amount}€ de "${fromAccountName}" (${fromName}) à "${toAccountName}" (${toName}). Solde actuel de "${fromAccountName}" : ${fromAccount.balance}€.`);
    }
}

function displayBankAccounts(name) {
    if (!validateClientExists(name)) {
        return;
    }
    console.log(`Comptes bancaires de ${name} :`);
    bankAccounts[name].forEach(account => {
        console.log(`- ${account.accountName} (Numéro: ${account.accountNumber}) : ${account.balance}€`);
    });
}

function displayHistory(name, accountName) {
    const account = ensureAccount(name, accountName);
    if (!account) {
        return;
    }
    console.log(`Historique des transactions pour le compte "${accountName}" de ${name} :`);
    account.history.forEach((entry, index) => {
        console.log(`${index + 1}. ${formatHistoryMessage(entry)}`);
    });
}

function displayMoneyFromBankAccounts(name) {
    if (!validateClientExists(name)) {
        return;
    }
    console.log(`Comptes bancaires de ${name} :`);
    bankAccounts[name].forEach(account => {
        console.log(`- ${account.accountName} (Numéro: ${account.accountNumber}) : ${account.balance}€`);
    });
}

function displayAllMoney() {
    let total = 0;
    clients.forEach(name => {
        bankAccounts[name].forEach(account => {
            total += account.balance;
        });
    });
    console.log(`Total de l'argent dans toutes les banques : ${total}€`);
}

function checkIfAccountIsNotEmpty(name, accountName) {
    const account = ensureAccount(name, accountName);
    if (!account) {
        return false;
    }
    if (account.balance > 0) {
        console.log(`Le compte "${accountName}" de ${name} n'est pas vide et ne peut être supprimé. Solde actuel : ${account.balance}€.`);
        return true;
    } else {
        console.log(`Le compte "${accountName}" de ${name} est vide. Vous pouvez le supprimer si nécessaire.`);
        return false;
    }
}

function checkIfAccountIsNegative(name, accountName) {
    const account = ensureAccount(name, accountName);
    if (!account) {
        return false;
    }
    if (account.balance < 0) {
        console.log(`Le compte "${accountName}" de ${name} est en négatif. Solde actuel : ${account.balance}€.`);
        return true;
    } else {
        console.log(`Le compte "${accountName}" de ${name} n'est pas en négatif. Solde actuel : ${account.balance}€.`);
        return false;
    }
}

function deleteBankAccount(name, accountName) {
    if (!validateClientExists(name)) {
        return;
    }
    const accountIndex = bankAccounts[name]?.findIndex(acc => acc.accountName === accountName);
    if (accountIndex === undefined || accountIndex === -1) {
        console.log(`Le compte "${accountName}" n'existe pas pour ${name}.`);
        return;
    }
    if (checkIfAccountIsNotEmpty(name, accountName)) {
        return;
    }
    bankAccounts[name].splice(accountIndex, 1);
    console.log(`Le compte "${accountName}" de ${name} a été supprimé.`);
}