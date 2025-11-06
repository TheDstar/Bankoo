import { getAllClients } from './functions.js';

function createClientItem(name) {
    const clientItem = document.createElement('div');
    clientItem.classList.add('client-item');
    
    const clientName = document.createElement('p');
    clientName.textContent = name;
    
    clientItem.appendChild(clientName);

    return clientItem;
}

const clientList = document.querySelector('div.client-list');
const addClientNameInput = document.querySelector('div.add-client input');
const addClientButton = document.querySelector('div.add-client button');

window.addEventListener('DOMContentLoaded', () => {
    addClientButton.addEventListener('click', () => {
        // trim pour enlever les espaces avant & apres
        const clientName = addClientNameInput.value.trim();
        if (clientName) {
            // verif si client déjà existant
            const ifClientExists = validateClientExists(clientName);
            if (ifClientExists) {
                window.alert('Ce client existe déjà.');
                return;
            }

            addClient(clientName);
            const clientList = document.querySelector('div.client-list');
            const clientItem = createClientItem(clientName);
            clientList.appendChild(clientItem);
            addClientNameInput.value = '';
        } else {
            window.alert('Veuillez entrer un nom de client valide.');
        }
    });

    // Initialisation de la liste des clients à partir des données existantes
    let clients = getAllClients();
    clients.forEach(name => {
        console.log(name);
        const clientItem = createClientItem(name);
        clientList.appendChild(clientItem);
    });

});