// menu.js - Gère l'affichage du menu côté client

document.addEventListener("DOMContentLoaded", () => {
    console.log("Menu page DOM loaded.");
    loadClientMenu();

    // Écouter les mises à jour du menu depuis l'admin (via localStorage et l'événement storage)
    window.addEventListener("storage", function(event) {
        if (event.key === "menuData") {
            console.log("Menu data updated in localStorage, reloading menu...");
            loadClientMenu();
        }
    });
    // Écouter aussi les événements personnalisés si l'admin est sur la même page (peu probable mais par sécurité)
    document.addEventListener("menuUpdated", loadClientMenu);
});

function loadClientMenu() {
    console.log("Loading client menu...");
    const menuData = JSON.parse(localStorage.getItem("menuData")) || {
        menuDuJour: {},
        menusSpeciaux: [],
        carte: { entrees: [], plats: [], desserts: [] }
    };

    renderMenuDuJour(menuData.menuDuJour);
    renderMenusSpeciaux(menuData.menusSpeciaux);
    renderCarte(menuData.carte);
}

function renderMenuDuJour(menu) {
    const container = document.getElementById("menu-du-jour");
    if (!container) return;

    if (menu && menu.titre) {
        container.innerHTML = `
            <h3 class="card-title text-center mb-3">${menu.titre}</h3>
            <p class="card-text text-center">${menu.description || ""}</p>
            <p class="card-text text-center fw-bold">Prix: ${menu.prix ? menu.prix + "€" : "N/A"}</p>
            `;
            // Potentiellement ajouter une image ou des détails de plats associés si la structure le permettait
    } else {
        container.innerHTML = `<p class="text-center text-muted">Le menu du jour n'est pas encore défini.</p>`;
    }
}

function renderMenusSpeciaux(menus) {
    const container = document.getElementById("menus-speciaux");
    if (!container) return;

    if (menus && menus.length > 0) {
        container.innerHTML = `<div class="row">` + menus.map(menu => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm">
                    ${menu.image ? `<img src="${menu.image}" class="card-img-top" alt="${menu.titre}" style="height: 180px; object-fit: cover;">` : 
                    `<div class="card-img-top bg-secondary text-white d-flex align-items-center justify-content-center" style="height: 180px;"><i class="fas fa-utensils fa-3x"></i></div>`}
                    <div class="card-body">
                        <h4 class="card-title">${menu.titre}</h4>
                        <p class="card-text">${menu.description || ""}</p>
                        <p class="card-text fw-bold">Prix: ${menu.prix ? menu.prix + "€" : "N/A"}</p>
                        </div>
                </div>
            </div>
        `).join("") + `</div>`;
    } else {
        container.innerHTML = `<p class="text-center text-muted">Aucun menu spécial proposé actuellement.</p>`;
    }
}

function renderCarte(carte) {
    renderCarteSection("entrees-list", carte?.entrees || []);
    renderCarteSection("plats-list", carte?.plats || []);
    renderCarteSection("desserts-list", carte?.desserts || []);
}

function renderCarteSection(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (items && items.length > 0) {
        container.innerHTML = items.map(item => `
            <div class="menu-item mb-3 border-bottom pb-2">
                <div class="d-flex justify-content-between">
                    <h5 class="mb-1">${item.nom}</h5>
                    <span class="text-primary fw-bold">${item.prix ? item.prix + "€" : "N/A"}</span>
                </div>
                ${item.description ? `<p class="description text-muted small mb-0">${item.description}</p>` : ""}
            </div>
        `).join("");
    } else {
        container.innerHTML = `<p class="text-center text-muted small">Aucun élément dans cette catégorie.</p>`;
    }
}
