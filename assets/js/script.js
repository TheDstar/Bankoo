import { createLS } from './functions.js';

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

    let clientAccounts = client.bankAccounts;

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

function displayBankAccount(clientName, accountName) {
    // Fonction pour afficher les détails du compte bancaire
    const accounts = JSON.parse(localStorage.getItem('bankoo_accounts')) || [];
    const client = accounts.find(c => c.name === clientName);
    if (!client) {
        console.error('Client non trouvé');
        return;
    }

    console.log("aaaaa");


    const balance = client.bankAccounts[accountName];
    if (balance === undefined) {
        console.error('Compte bancaire non trouvé');
        return;
    }
    console.log(`Compte: ${accountName}, Solde: ${balance}€`);

    const rightContainerHeader = document.querySelector('.right-container-header');

    rightContainerHeader.innerHTML = `<h2>Compte: ${accountName}</h2><p>Solde: ${balance}€</p>`;
}

const clientList = document.querySelector('div.client-list');
const addClientNameInput = document.querySelector('div.add-client input');
const addClientButton = document.querySelector('div.add-client button');
// Remove this line; we'll select client names after rendering them

window.addEventListener('DOMContentLoaded', () => {
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

            // Ajout du client dans le localStorage
            clients.push({ name: clientName, age: null, bankAccounts: {} });
            localStorage.setItem('bankoo_accounts', JSON.stringify(clients));

            const clientItem = createClientContainer(clientName);
            clientList.appendChild(clientItem);
            addClientNameInput.value = '';
        } else {
            window.alert('Veuillez entrer un nom de client valide.');
        }
    });

    // Attach click event listeners to client name elements after rendering

    let selectedClient = null;
    let selectedAccount = null;

    clientList.addEventListener('click', (event) => {
        const nameElem = event.target.closest('.client-name[data-client-name]');
        const accountElem = event.target.closest('.client-bank-account[data-client-name]');
        if (nameElem) {
            const name = nameElem.getAttribute('data-client-name');
            selectedClient = name;
            console.log(`Client cliqué: ${name}`);
            displayBankAccount(selectedClient, selectedAccount);

        } else if (accountElem) {
            const name = accountElem.getAttribute('data-client-name');
            const accountName = accountElem.getAttribute('data-account-name');
            selectedAccount = accountName;
            console.log(`Compte cliqué: ${accountName} du client ${name}`);
            displayBankAccount(name, selectedAccount);
        }
    });

    // initialisation de la liste des clients à partir des données existantes
    let clients = JSON.parse(createLS());

    console.log(clients);

    if (!clients || clients.length === 0) {
        const noClientMsg = document.createElement('p');
        noClientMsg.classList.add('no-client-message');
        noClientMsg.textContent = 'Aucun client disponible.';
        clientList.appendChild(noClientMsg);
        return;
    }

    clients.forEach(client => {
        const clientItem = createClientContainer(client);
        clientList.appendChild(clientItem);
    });


    const addNewAccountButtons = document.querySelectorAll('.add-new-account-btn');

    addNewAccountButtons.forEach(button => {
        button.addEventListener('click', () => {
            let accountName = window.prompt('Quel est le nom du compte que vous souhaitez ajouter ?');
            if (accountName) {
                // Récupérer le nom du client à partir du bouton cliqué
                const clientName = button.getAttribute('data-client-name');
                let accounts = JSON.parse(localStorage.getItem('bankoo_accounts')) || [];
                const clientIndex = accounts.findIndex(client => client.name === clientName);
                if (clientIndex !== -1) {
                    accounts[clientIndex].bankAccounts[accountName] = 0;
                    localStorage.setItem('bankoo_accounts', JSON.stringify(accounts));
                }
            }
        });
    });
});