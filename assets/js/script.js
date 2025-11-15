import { createLS } from './functions.js';

const clients = JSON.parse(createLS());

// *------ FONCTIONS ------*

// clear la liste des clients avant de la re-remplir
function clearClientList() {
    while (clientList.firstChild) {
        clientList.removeChild(clientList.firstChild);
    }
}

// afficher la liste des clients au chargement de la page ou après ajout d'un client/compte
function displayClients(clients) {
    clearClientList();
    clients.forEach(client => {
        const clientItem = createClientContainer(client);
        clientList.appendChild(clientItem);
    });
};

// créer un container pour chaque client
function createClientContainer(client) {
    const clientContainer = document.createElement('div');
    clientContainer.classList.add('client-container');

    const clientItem = document.createElement('div');
    clientItem.classList.add('client-item');
    const clientName = document.createElement('p');
    clientName.classList.add('client-name');
    clientName.textContent = client.name;
    clientName.setAttribute('data-client-name', client.name);
    clientItem.appendChild(clientName);

    const clientBankAccountsContainer = document.createElement('div');
    clientBankAccountsContainer.classList.add('client-bank-accounts-container');

    let clientAccounts = client.bankAccounts || {};

    Object.entries(clientAccounts).forEach(([accountName, balance]) => {
        const clientBankAccount = document.createElement('div');
        clientBankAccount.classList.add('client-bank-account');
        clientBankAccount.setAttribute('data-client-name', client.name);
        clientBankAccount.setAttribute('data-account-name', accountName);

        const accountNameElem = document.createElement('p');
        accountNameElem.classList.add('account-name');
        accountNameElem.textContent = `${accountName}`;
        clientBankAccount.appendChild(accountNameElem);

        const balanceElem = document.createElement('p');
        balanceElem.classList.add('account-balance');
        balanceElem.textContent = `${balance}€`;
        clientBankAccount.appendChild(balanceElem);

        clientBankAccountsContainer.appendChild(clientBankAccount);
    });

    const addNewAccountBtn = document.createElement('button');
    addNewAccountBtn.classList.add('add-new-account-btn');
    addNewAccountBtn.setAttribute('data-client-name', client.name);
    addNewAccountBtn.textContent = 'Ajouter un compte';
    clientBankAccountsContainer.appendChild(addNewAccountBtn);

    
    clientItem.appendChild(clientBankAccountsContainer);
    clientContainer.appendChild(clientItem);

    return clientContainer;
}

const rightContainerHeader = document.querySelector('.right-container-header');
const rightContainerTable = document.querySelector('.right-container-table');

// Dans le cas où on clique sur un compte bancaire
function findAccount(clientName) {
    const accounts = JSON.parse(localStorage.getItem('bankoo_accounts')) || [];
    const client = accounts.find(c => c.name === clientName);
    if (!client) {
        console.error('Client non trouvé');
        return;
    } else {
        return client;
    }
}

// Dans le cas où on clique sur un client
function displayClientInfo(clientName) {
    // Clear right container
    rightContainerHeader.innerHTML = '';
    rightContainerTable.innerHTML = '';
    const accounts = JSON.parse(localStorage.getItem('bankoo_accounts')) || [];
    const client = accounts.find(c => c.name === clientName);
    if (!client) return;

    // Header: nom + boutons
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.paddingBottom = '1rem';
    header.style.borderBottom = '1px solid #ccc';

    const nameElem = document.createElement('h2');
    nameElem.textContent = client.name;
    nameElem.style.margin = 0;
    header.appendChild(nameElem);

    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '0.5rem';

    const renameBtn = document.createElement('button');
    renameBtn.innerHTML = '<span title="Renommer">✏️</span> Renommer';
    renameBtn.classList.add('rename-client-btn');
    btnGroup.appendChild(renameBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<span title="Supprimer">🗑️</span> Supprimer';
    deleteBtn.classList.add('delete-client-btn');
    btnGroup.appendChild(deleteBtn);

    header.appendChild(btnGroup);
    rightContainerHeader.appendChild(header);

    // Table: liste des comptes avec fonds et date de création
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Nom du compte</th><th>Solde</th><th>Date de création</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    Object.entries(client.bankAccounts || {}).forEach(([accountName, balance]) => {
        // Chercher la date de création dans les logs
        const logs = JSON.parse(localStorage.getItem('bankoo_logs')) || [];
        const creationLog = logs.find(log => log.action === 'create' && log.clientName === clientName && log.accountName === accountName);
        let dateStr = creationLog ? new Date(creationLog.timestamp).toLocaleString() : '-';
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="account-link" style="cursor:pointer;color:#fff;text-decoration:underline">${accountName}</td><td>${balance}€</td><td>${dateStr}</td>`;
        tr.querySelector('.account-link').onclick = () => {
            displayBankAccountInfo(clientName, accountName);
        };
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    rightContainerTable.appendChild(table);

    // Listeners pour les boutons
    renameBtn.onclick = () => {
        const newName = window.prompt('Nouveau nom du client ?', client.name);
        if (newName && newName.trim() && newName !== client.name) {
            if (accounts.some(c => c.name === newName)) {
                window.alert('Ce nom existe déjà.');
                return;
            }
            client.name = newName;
            localStorage.setItem('bankoo_accounts', JSON.stringify(accounts));
            displayClients(accounts);
            displayClientInfo(newName);
        }
    };
    deleteBtn.onclick = () => {
        if (window.confirm('Supprimer ce client ?')) {
            const idx = accounts.findIndex(c => c.name === clientName);
            if (idx !== -1) {
                accounts.splice(idx, 1);
                localStorage.setItem('bankoo_accounts', JSON.stringify(accounts));
                displayClients(accounts);
                rightContainerHeader.innerHTML = '';
                rightContainerTable.innerHTML = '';
            }
        }
    };
}

function addLog(action, clientName, accountName, details = {}) {
    const logs = JSON.parse(localStorage.getItem('bankoo_logs')) || [];
    logs.push({
        timestamp: new Date().toISOString(),
        action,
        clientName,
        accountName,
        ...details
    });
    localStorage.setItem('bankoo_logs', JSON.stringify(logs));
}

function displayBankAccountInfo(clientName, accountName) {
    // Clear right container
    rightContainerHeader.innerHTML = '';
    rightContainerTable.innerHTML = '';
    const accounts = JSON.parse(localStorage.getItem('bankoo_accounts')) || [];
    const client = accounts.find(c => c.name === clientName);
    if (!client) return;
    const balance = client.bankAccounts[accountName];
    // Récupérer les logs de ce compte
    const logs = JSON.parse(localStorage.getItem('bankoo_logs')) || [];
    const accountLogs = logs.filter(log => log.clientName === clientName && log.accountName === accountName);

    // Header: nom du client (petit), nom du compte (gros), boutons à droite
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.paddingBottom = '1rem';
    header.style.borderBottom = '1px solid #ccc';

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.flexDirection = 'column';
    left.style.alignItems = 'flex-start';

    const clientNameElem = document.createElement('span');
    clientNameElem.textContent = clientName;
    clientNameElem.style.fontSize = '0.9rem';
    clientNameElem.style.opacity = '0.7';
    left.appendChild(clientNameElem);

    const accountNameElem = document.createElement('h2');
    accountNameElem.textContent = `${accountName} (${balance}€)`;
    accountNameElem.style.margin = 0;
    left.appendChild(accountNameElem);

    header.appendChild(left);

    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '0.5rem';

    const depositBtn = document.createElement('button');
    depositBtn.innerHTML = '<span title="Déposer">➕</span> Déposer';
    depositBtn.classList.add('deposit-account-btn');
    btnGroup.appendChild(depositBtn);

    const withdrawBtn = document.createElement('button');
    withdrawBtn.innerHTML = '<span title="Retirer">➖</span> Retirer';
    withdrawBtn.classList.add('withdraw-account-btn');
    btnGroup.appendChild(withdrawBtn);

    const transferBtn = document.createElement('button');
    transferBtn.innerHTML = '<span title="Transférer">🔁</span> Transférer';
    transferBtn.classList.add('transfer-account-btn');
    btnGroup.appendChild(transferBtn);

    const renameBtn = document.createElement('button');
    renameBtn.innerHTML = '<span title="Renommer">✏️</span> Renommer';
    renameBtn.classList.add('rename-account-btn');
    btnGroup.appendChild(renameBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<span title="Supprimer">🗑️</span> Supprimer';
    deleteBtn.classList.add('delete-account-btn');
    btnGroup.appendChild(deleteBtn);

    header.appendChild(btnGroup);
    rightContainerHeader.appendChild(header);

    // Listeners pour les boutons
    renameBtn.onclick = () => {
        const newAccountName = window.prompt('Nouveau nom du compte ?', accountName);
        if (newAccountName && newAccountName.trim() && newAccountName !== accountName) {
            if (client.bankAccounts.hasOwnProperty(newAccountName)) {
                window.alert('Ce nom de compte existe déjà pour ce client.');
                return;
            }
            client.bankAccounts[newAccountName] = client.bankAccounts[accountName];
            delete client.bankAccounts[accountName];
            localStorage.setItem('bankoo_accounts', JSON.stringify(accounts));
            addLog('rename', clientName, accountName, { newAccountName });
            displayBankAccountInfo(clientName, newAccountName);
            displayClients(accounts);
        }
    };
    deleteBtn.onclick = () => {
        if (client.bankAccounts[accountName] > 0) {
            window.alert('Impossible de supprimer ce compte : il reste des fonds dessus.');
            return;
        }
        if (window.confirm('Supprimer ce compte bancaire ?')) {
            delete client.bankAccounts[accountName];
            localStorage.setItem('bankoo_accounts', JSON.stringify(accounts));
            addLog('delete', clientName, accountName);
            displayClientInfo(clientName);
            displayClients(accounts);
        }
    };
    depositBtn.onclick = () => {
        let amount = window.prompt('Montant à déposer ?');
        amount = parseFloat(amount);
        if (!isNaN(amount) && amount > 0) {
            client.bankAccounts[accountName] += amount;
            localStorage.setItem('bankoo_accounts', JSON.stringify(accounts));
            addLog('deposit', clientName, accountName, { amount });
            displayBankAccountInfo(clientName, accountName);
            displayClients(accounts);
        } else {
            window.alert('Montant invalide.');
        }
    };
    withdrawBtn.onclick = () => {
        let amount = window.prompt('Montant à retirer ?');
        amount = parseFloat(amount);
        if (!isNaN(amount) && amount > 0) {
            if (client.bankAccounts[accountName] >= amount) {
                client.bankAccounts[accountName] -= amount;
                localStorage.setItem('bankoo_accounts', JSON.stringify(accounts));
                addLog('withdraw', clientName, accountName, { amount });
                displayBankAccountInfo(clientName, accountName);
                displayClients(accounts);
            } else {
                window.alert('Fonds insuffisants.');
            }
        } else {
            window.alert('Montant invalide.');
        }
    };
    transferBtn.onclick = () => {
        let toClient = window.prompt('Nom du client destinataire ?');
        let toAccount = window.prompt('Nom du compte destinataire ?');
        let amount = window.prompt('Montant à transférer ?');
        amount = parseFloat(amount);
        if (!toClient || !toAccount || isNaN(amount) || amount <= 0) {
            window.alert('Informations de transfert invalides.');
            return;
        }
        if (!client.bankAccounts[accountName] || client.bankAccounts[accountName] < amount) {
            window.alert('Fonds insuffisants.');
            return;
        }
        // Correction : on modifie le solde du compte source et du compte destinataire sur le même objet 'accounts'
        const destClient = accounts.find(c => c.name === toClient);
        if (!destClient) {
            window.alert('Client destinataire introuvable.');
            return;
        }
        if (!destClient.bankAccounts[toAccount] && destClient.bankAccounts[toAccount] !== 0) {
            window.alert('Compte destinataire introuvable.');
            return;
        }
        accounts.find(c => c.name === clientName).bankAccounts[accountName] -= amount;
        destClient.bankAccounts[toAccount] += amount;
        localStorage.setItem('bankoo_accounts', JSON.stringify(accounts));
        addLog('transfer_out', clientName, accountName, { toClient, toAccount, amount });
        addLog('transfer_in', toClient, toAccount, { fromClient: clientName, fromAccount: accountName, amount });
        displayBankAccountInfo(clientName, accountName);
        displayClients(accounts);
        window.alert('Transfert effectué !');
    };

    // Afficher l'historique des transactions
    rightContainerTable.innerHTML = '';
    const logsTitle = document.createElement('h3');
    logsTitle.textContent = 'Historique des transactions';
    rightContainerTable.appendChild(logsTitle);
    if (accountLogs.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Aucune transaction.';
        rightContainerTable.appendChild(p);
    } else {
        const logsContainer = document.createElement('div');
        logsContainer.style.display = 'flex';
        logsContainer.style.flexDirection = 'column';
        logsContainer.style.gap = '0.5rem';
        logsContainer.style.width = '100%';
        accountLogs.forEach(log => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.alignItems = 'center';
            row.style.width = '100%';
            row.style.padding = '0.5rem 0';
            let icon = '';
            let amountColor = '#fff';
            let amountText = '';
            let actionText = '';
            if (log.action === 'deposit') {
                icon = '➕';
                amountColor = '#2ecc40';
                amountText = `+${log.amount}€`;
                actionText = 'Dépôt';
            } else if (log.action === 'withdraw') {
                icon = '➖';
                amountColor = '#fff';
                amountText = `-${log.amount}€`;
                actionText = 'Retrait';
            } else if (log.action === 'rename') {
                icon = '✏️';
                amountText = '';
                actionText = `Renommé en "${log.newAccountName}"`;
            } else if (log.action === 'delete') {
                icon = '🗑️';
                amountText = '';
                actionText = 'Compte supprimé';
            } else if (log.action === 'transfer_out') {
                icon = '🔁';
                amountColor = '#fff';
                amountText = `-${log.amount}€`;
                actionText = `Transfert vers ${log.toClient} / ${log.toAccount}`;
            } else if (log.action === 'transfer_in') {
                icon = '🔁';
                amountColor = '#2ecc40';
                amountText = `+${log.amount}€`;
                actionText = `Transfert reçu de ${log.fromClient} / ${log.fromAccount}`;
            } else if (log.action === 'create') {
                icon = '🆕';
                amountText = '';
                actionText = 'Compte créé';
            }
            // Partie gauche : icône + action + montant
            const left = document.createElement('div');
            left.style.display = 'flex';
            left.style.alignItems = 'center';
            left.style.gap = '0.5rem';
            left.style.flex = '1';
            const iconSpan = document.createElement('span');
            iconSpan.textContent = icon;
            iconSpan.style.fontSize = '1.2rem';
            left.appendChild(iconSpan);
            const actionSpan = document.createElement('span');
            actionSpan.textContent = actionText;
            left.appendChild(actionSpan);
            if (amountText) {
                const amountSpan = document.createElement('span');
                amountSpan.textContent = amountText;
                amountSpan.style.color = amountColor;
                amountSpan.style.fontWeight = 'bold';
                amountSpan.style.fontSize = '1.1rem';
                amountSpan.style.marginLeft = '0.5rem';
                left.appendChild(amountSpan);
            }
            // Partie droite : date
            const dateSpan = document.createElement('span');
            dateSpan.textContent = new Date(log.timestamp).toLocaleString();
            dateSpan.style.color = '#fff';
            dateSpan.style.opacity = '0.5';
            dateSpan.style.marginLeft = 'auto';
            row.appendChild(left);
            row.appendChild(dateSpan);
            logsContainer.appendChild(row);
        });
        rightContainerTable.appendChild(logsContainer);
    }
}

const clientList = document.querySelector('div.client-list');
const addClientNameInput = document.querySelector('div.add-client input');
const addClientButton = document.querySelector('div.add-client button');

// *----- LISTENERS -----* 

window.addEventListener('DOMContentLoaded', () => {

    //clic sur bouton ajout d'un nouveau client
    addClientButton.addEventListener('click', () => {
        const clientName = addClientNameInput.value.trim();
        if (clientName) {
            // verif si client déjà existant
            const clients = JSON.parse(localStorage.getItem('bankoo_accounts')) || [];
            const exists = clients.some(client => client.name === clientName);
            if (exists) {
                window.alert('Ce client existe déjà.');
                return;
            }

            clients.push({ name: clientName, age: null, bankAccounts: {} });
            localStorage.setItem('bankoo_accounts', JSON.stringify(clients));

            const clientItem = createClientContainer(clientName);
            clientList.appendChild(clientItem);
            addClientNameInput.value = '';

            const updatedClients = JSON.parse(localStorage.getItem('bankoo_accounts')) || [];
            displayClients(updatedClients);
        } else {
            window.alert('Veuillez entrer un nom de client valide.');
        }
    });


    // Clic sur un client / compte bancaire
    let selectedClient = null;
    let selectedAccount = null;

    clientList.addEventListener('click', (event) => {
        const addAccountBtn = event.target.closest('.add-new-account-btn');
        if (addAccountBtn) {
            let accountName = window.prompt('Quel est le nom du compte que vous souhaitez ajouter ?');
            if (accountName) {
                const clientName = addAccountBtn.getAttribute('data-client-name');
                let accounts = JSON.parse(localStorage.getItem('bankoo_accounts')) || [];
                const clientIndex = accounts.findIndex(client => client.name === clientName);
                if (clientIndex !== -1) {
                    const bankAccounts = accounts[clientIndex].bankAccounts || {};
                    if (bankAccounts.hasOwnProperty(accountName)) {
                        window.alert('Ce nom de compte existe déjà pour ce client.');
                        return;
                    }
                    accounts[clientIndex].bankAccounts[accountName] = 0;
                    localStorage.setItem('bankoo_accounts', JSON.stringify(accounts));
                    addLog('create', clientName, accountName);
                    displayClients(accounts);
                }
            }
            return;
        }
        const nameElem = event.target.closest('.client-name[data-client-name]');
        const accountElem = event.target.closest('.client-bank-account[data-client-name]');
        if (nameElem) {
            const name = nameElem.getAttribute('data-client-name');
            selectedClient = name;
            console.log(`Client cliqué: ${name}`);
            displayClientInfo(selectedClient);

        } else if (accountElem) {
            const name = accountElem.getAttribute('data-client-name');
            const accountName = accountElem.getAttribute('data-account-name');
            selectedAccount = accountName;
            console.log(`Compte cliqué: ${accountName} du client ${name}`);
            displayBankAccountInfo(name, selectedAccount);
        }
    });

    // si aucun compte bancaire / client existant
    if (!clients || clients.length === 0) {
        const noClientMsg = document.createElement('p');
        noClientMsg.classList.add('no-client-message');
        noClientMsg.textContent = 'Aucun client disponible.';
        clientList.appendChild(noClientMsg);
        return;
    } else {
        displayClients(clients);
    }
});