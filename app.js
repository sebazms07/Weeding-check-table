document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('results');

    let guests = [];

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            guests = data;

            // Mostrar mesas apenas cargue
            renderTablesOverview();
        })
        .catch(error => console.error('Error cargando el JSON:', error));

    // Normalizar texto
    const normalizeString = (str) => {
        return str.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    };

    // =========================
    // RESUMEN DE MESAS
    // =========================
    const renderTablesOverview = () => {

        resultsContainer.innerHTML = '';

        // Solo confirmados
        const confirmedGuests = guests.filter(
            guest => guest.Confirmado === "Yes"
        );

        // Agrupar por mesa
        const tables = {};

        confirmedGuests.forEach(guest => {

            const tableNumber = guest.Mesa;

            if (!tables[tableNumber]) {
                tables[tableNumber] = {
                    guests: [],
                    totalPeople: 0
                };
            }

            tables[tableNumber].guests.push(guest);

            tables[tableNumber].totalPeople += Number(guest.Cantidad || 0);
        });

        // Ordenar mesas
        const sortedTables = Object.keys(tables).sort((a, b) => a - b);

        sortedTables.forEach(tableNumber => {

            const table = tables[tableNumber];

            const card = document.createElement('div');
            card.className = 'guest-card table-summary-card';

            const guestNames = table.guests
                .map(g => g.Name)
                .join(' • ');

            card.innerHTML = `
                <div class="guest-info">
                    <h3>Mesa ${tableNumber}</h3>

                    <span>
                        ${table.totalPeople} personas
                    </span>

                    <p class="table-preview">
                        ${guestNames}
                    </p>

                    <div class="table-details hidden">
                        ${table.guests.map(guest => `
                            <div class="detail-row">
                                <strong>${guest.Name}</strong>
                                <small>
                                    ${guest.Cantidad} puesto(s)
                                </small>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="table-badge">
                    <span>Mesa</span>
                    <strong>${tableNumber}</strong>
                </div>
            `;

            // Expandir detalle
            card.addEventListener('click', () => {
                const details = card.querySelector('.table-details');

                details.classList.toggle('hidden');
            });

            resultsContainer.appendChild(card);
        });
    };

    // =========================
    // BÚSQUEDA
    // =========================
    searchInput.addEventListener('input', (e) => {

        const searchTerm = normalizeString(e.target.value.trim());

        resultsContainer.innerHTML = '';

        // Si no hay búsqueda → mostrar mesas
        if (searchTerm.length === 0) {
            renderTablesOverview();
            return;
        }

        // Esperar mínimo 2 letras
        if (searchTerm.length < 2) return;

        const filteredGuests = guests.filter(guest => {

            if (!guest.Name || guest.Confirmado !== "Yes") return false;

            return normalizeString(guest.Name)
                .includes(searchTerm);
        });

        if (filteredGuests.length === 0) {

            resultsContainer.innerHTML = `
                <p style="color: #8D8D8D; margin-top: 20px; font-size: 0.9rem;">
                    No encontramos ningún invitado confirmado con ese nombre.
                    Intenta buscar solo por tu primer nombre o apellido.
                </p>`;

            return;
        }

        // Render invitados
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
});