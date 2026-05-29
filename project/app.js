document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('results');
    let guests = [];

    // 1. Cargar el JSON (debe estar en la misma carpeta del proyecto)
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            guests = data;
        })
        .catch(error => console.error('Error cargando el JSON:', error));

    // 2. Función clave: quita tildes y pasa todo a minúsculas
    const normalizeString = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    // 3. Escuchar lo que el usuario escribe
    searchInput.addEventListener('input', (e) => {
        const searchTerm = normalizeString(e.target.value.trim());
        resultsContainer.innerHTML = ''; // Limpiamos la vista

        // Empezar a buscar solo cuando haya al menos 2 letras
        if (searchTerm.length < 2) return; 

        // Filtrar la data
        const filteredGuests = guests.filter(guest => {
            // Validamos que el invitado tenga un nombre registrado y opcionalmente que haya confirmado
            if (!guest.Name || guest.Confirmado !== "Yes") return false;
            return normalizeString(guest.Name).includes(searchTerm);
        });

        // Manejo de estado vacío
        if (filteredGuests.length === 0) {
            resultsContainer.innerHTML = `
                <p style="color: #8D8D8D; margin-top: 20px; font-size: 0.9rem;">
                    No encontramos ningún invitado confirmado con ese nombre. 
                    Intenta buscar solo por tu primer nombre o apellido.
                </p>`;
            return;
        }

        // Renderizar las tarjetas
        filteredGuests.forEach(guest => {
            const card = document.createElement('div');
            card.className = 'guest-card';
            card.innerHTML = `
                <div class="guest-info">
                    <h3>${guest.Name}</h3>
                    <span>Puestos reservados: ${guest.Cantidad}</span>
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