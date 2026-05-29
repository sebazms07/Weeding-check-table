document.addEventListener('DOMContentLoaded', () => {

    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('results');

    let guests = [];

    // =========================
    // NORMALIZE STRING
    // =========================

    const normalizeString = (str) => {

        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    };

    // =========================
    // LOADING STATE
    // =========================

    const hideLoading = () => {

        const loadingState = document.getElementById('loadingState');

        if (loadingState) {

            loadingState.style.display = 'none';
        }
    };

    // =========================
    // FETCH DATA
    // =========================

    fetch('data.json')

        .then(response => response.json())

        .then(data => {

            guests = data;

            hideLoading();

            renderTablesOverview();

            updateEventCounter();

        })

        .catch(error => {

            console.error('Error cargando JSON:', error);

            hideLoading();

            resultsContainer.innerHTML = `
                <p style="
                    color: #8D8D8D;
                    margin-top: 20px;
                    font-size: 0.9rem;
                    text-align: center;
                ">
                    Ocurrió un problema cargando las mesas.
                </p>
            `;
        });

    // =========================
    // EVENT COUNTER
    // =========================

    function updateEventCounter() {

        const counter = document.querySelector('.event-counter');

        if (!counter) return;

        const confirmedGuests = guests.filter(
            guest => guest.Confirmado === "Yes"
        );

        const tables = [
            ...new Set(
                confirmedGuests.map(g => g.Mesa)
            )
        ];

        counter.innerHTML = `
            ${tables.length} mesas preparadas con amor ✨
        `;
    }

    // =========================
    // RENDER TABLES OVERVIEW
    // =========================

    function renderTablesOverview() {

        resultsContainer.innerHTML = '';

        const tables = {};

        guests
            .filter(guest => guest.Confirmado === "Yes")
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

                    .map(g => {

                        return g.Name
                            .split(',')
                            [0]
                            .split('&')[0]
                            .trim();

                    })

                    .slice(0, 3)

                    .join(' • ');

                const detailsHTML = tableGuests.map(guest => `

                    <div class="detail-row">

                        <strong>
                            ${guest.Name}
                        </strong>

                        <small>
                            ${guest.Cantidad} puesto(s)
                        </small>

                    </div>

                `).join('');

                const card = document.createElement('div');

                card.className =
                    'guest-card table-summary-card';

                card.innerHTML = `

                    <div class="guest-info">

                        <h3>
                            Mesa ${tableNumber}
                        </h3>

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

                        <strong>
                            ${tableNumber}
                        </strong>

                    </div>

                `;

                resultsContainer.appendChild(card);

                // =========================
                // EXPAND / COLLAPSE
                // =========================

                card.addEventListener('click', () => {

                    const details = card.querySelector('.table-details');

                    const isExpanded =
                        details.classList.contains('expanded');

                    // cerrar otras abiertas

                    document
                        .querySelectorAll('.table-details')
                        .forEach(detail => {

                            detail.classList.remove('expanded');

                        });

                    // abrir actual

                    if (!isExpanded) {

                        details.classList.add('expanded');
                    }
                });
            });
    }

    // =========================
    // SEARCH
    // =========================

    searchInput.addEventListener('input', (e) => {

        const searchTerm =
            normalizeString(
                e.target.value.trim()
            );

        // volver al overview

        if (searchTerm.length < 2) {

            renderTablesOverview();

            return;
        }

        resultsContainer.innerHTML = '';

        const filteredGuests = guests.filter(guest => {

            if (
                !guest.Name ||
                guest.Confirmado !== "Yes"
            ) {

                return false;
            }

            return normalizeString(guest.Name)
                .includes(searchTerm);
        });

        // =========================
        // EMPTY STATE
        // =========================

        if (filteredGuests.length === 0) {

            resultsContainer.innerHTML = `

                <p style="
                    color: #8D8D8D;
                    margin-top: 20px;
                    font-size: 0.9rem;
                    text-align: center;
                    line-height: 1.6;
                ">

                    No encontramos ningún invitado confirmado.

                    <br><br>

                    Intenta buscar solamente
                    por tu primer nombre
                    o apellido ✨

                </p>

            `;

            return;
        }

        // =========================
        // SEARCH RESULTS
        // =========================

        filteredGuests.forEach(guest => {

            const card = document.createElement('div');

            card.className = 'guest-card';

            const highlightedName =
                highlightMatch(
                    guest.Name,
                    searchTerm
                );

            card.innerHTML = `

                <div class="guest-info">

                    <h3>
                        ${highlightedName}
                    </h3>

                    <span>
                        Puestos reservados:
                        ${guest.Cantidad}
                    </span>

                </div>

                <div class="table-badge">

                    <span>Mesa</span>

                    <strong>
                        ${guest.Mesa}
                    </strong>

                </div>

            `;

            resultsContainer.appendChild(card);

            // scroll suave

            card.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        });
    });

    // =========================
    // HIGHLIGHT SEARCH
    // =========================

    function highlightMatch(text, searchTerm) {

        const normalizedText =
            normalizeString(text);

        const index =
            normalizedText.indexOf(searchTerm);

        if (index === -1) {

            return text;
        }

        const matchLength =
            searchTerm.length;

        return `
            ${text.substring(0, index)}
            <mark>
                ${text.substring(index, index + matchLength)}
            </mark>
            ${text.substring(index + matchLength)}
        `;
    }

    // =========================
    // COPY ACCOUNT NUMBER
    // =========================

    const copyButton =
        document.getElementById('copyButton');

    if (copyButton) {

        copyButton.addEventListener('click', async () => {

            const accountNumber =
                document
                    .getElementById('accountNumber')
                    .innerText
                    .trim();

            try {

                await navigator.clipboard.writeText(accountNumber);

                const feedback =
                    document.getElementById('copyFeedback');

                feedback.classList.add('show-feedback');

                setTimeout(() => {

                    feedback.classList.remove('show-feedback');

                }, 2200);

            } catch (err) {

                console.error('No se pudo copiar');
            }
        });
    }

    // =========================
    // COPY DOTS CODE
    // =========================

    const copyMemoryButton =
        document.getElementById('copyMemoryButton');

    if (copyMemoryButton) {

        copyMemoryButton.addEventListener('click', async () => {

            const code =
                document
                    .getElementById('memoryCode')
                    .innerText
                    .trim();

            try {

                await navigator.clipboard.writeText(code);

                const feedback =
                    document.getElementById('memoryFeedback');

                feedback.classList.add('show-feedback');

                setTimeout(() => {

                    feedback.classList.remove('show-feedback');

                }, 2200);

            } catch (err) {

                console.error('No se pudo copiar');
            }
        });
    }

});