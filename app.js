document.addEventListener('DOMContentLoaded', () => {

    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('results');

    let guests = [];

    fetch('data.json')
        .then(response => response.json())
        .then(data => {

            guests = data;

            renderTablesOverview();

        })
        .catch(error => console.error('Error cargando JSON:', error));

    const normalizeString = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    };

    // =========================
    // RESUMEN DE MESAS
    // =========================

    function renderTablesOverview() {

        resultsContainer.innerHTML = '';

        const tables = {};

        guests
            .filter(g => g.Confirmado === "Yes")
            .forEach(guest => {

                if (!tables[guest.Mesa]) {
                    tables[guest.Mesa] = [];
                }

                tables[guest.Mesa].push(guest);
            });

        Object.keys(tables)
            .sort((a, b) => a - b)
            .forEach(tableNumber => {

                const tableGuests = tables[tableNumber];

                const totalPeople = tableGuests.reduce((acc, guest) => {
                    return acc + Number(guest.Cantidad || 0);
                }, 0);

                const namesPreview = tableGuests
                    .map(g => g.Name.split(',')[0])
                    .slice(0, 3)
                    .join(' • ');

                const detailsHTML = tableGuests.map(guest => `
                    <div class="detail-row">
                        <strong>${guest.Name}</strong>
                        <small>${guest.Cantidad} puesto(s)</small>
                    </div>
                `).join('');

                const card = document.createElement('div');

                card.className = 'guest-card table-summary-card';

                card.innerHTML = `
                    <div class="guest-info">

                        <h3>Mesa ${tableNumber}</h3>

                        <span>
                            ${totalPeople} personas
                        </span>

                        <div class="table-preview">
                            ${namesPreview}
                        </div>

                        <div class="table-details">
                            ${detailsHTML}
                        </div>

                    </div>

                    <div class="table-badge">
                        <span>Mesa</span>
                        <strong>${tableNumber}</strong>
                    </div>
                `;

                resultsContainer.appendChild(card);

                // =========================
                // EXPANDIR / CERRAR
                // =========================

                card.addEventListener('click', () => {

                    const details = card.querySelector('.table-details');

                    details.classList.toggle('expanded');

                });

            });
    }

    // =========================
    // BUSCADOR
    // =========================

    searchInput.addEventListener('input', (e) => {

        const searchTerm = normalizeString(e.target.value.trim());

        if (searchTerm.length < 2) {

            renderTablesOverview();
            return;
        }

        resultsContainer.innerHTML = '';

        const filteredGuests = guests.filter(guest => {

            if (!guest.Name || guest.Confirmado !== "Yes") {
                return false;
            }

            return normalizeString(guest.Name)
                .includes(searchTerm);
        });

        if (filteredGuests.length === 0) {

            resultsContainer.innerHTML = `
                <p style="
                    color: #8D8D8D;
                    margin-top: 20px;
                    font-size: 0.9rem;
                ">
                    No encontramos ningún invitado confirmado.
                </p>
            `;

            return;
        }

        filteredGuests.forEach(guest => {

            const card = document.createElement('div');

            card.className = 'guest-card';

            card.innerHTML = `
                <div class="guest-info">

                    <h3>${guest.Name}</h3>

                    <span>
                        Puestos reservados: ${guest.Cantidad}
                    </span>

                </div>

                <div class="table-badge">
                    <span>Mesa</span>
                    <strong>${guest.Mesa}</strong>
                </div>
            `;

            resultsContainer.appendChild(card);
        });
    });

    // =========================
    // COPIAR CUENTA
    // =========================

    const copyButton = document.getElementById('copyButton');

    if (copyButton) {

        copyButton.addEventListener('click', async () => {

            const accountNumber = document
                .getElementById('accountNumber')
                .innerText
                .trim();

            await navigator.clipboard.writeText(accountNumber);

            const feedback = document.getElementById('copyFeedback');

            feedback.classList.add('show-feedback');

            setTimeout(() => {

                feedback.classList.remove('show-feedback');

            }, 2200);
        });
    }

});