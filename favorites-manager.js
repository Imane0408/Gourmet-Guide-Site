// Gestionnaire des listes de favoris personnalisées
class FavoritesManager {
  constructor() {
    this.storageKey = "customFavoriteLists"
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadFavoriteLists()
  }

  // Créer une nouvelle liste de favoris
  createFavoriteList(name, description = "") {
    try {
      const user = JSON.parse(localStorage.getItem("loggedInUser"))
      if (!user || user.role !== "client") return false

      const lists = this.getAllFavoriteLists()

      // Vérifier si le nom existe déjà
      if (lists.some((list) => list.userId === user.id && list.name === name)) {
        this.showNotification("Une liste avec ce nom existe déjà", "warning")
        return false
      }

      const newList = {
        id: Date.now(),
        userId: user.id,
        name: name,
        description: description,
        recipes: [],
        createdAt: new Date().toISOString(),
      }

      lists.push(newList)
      localStorage.setItem(this.storageKey, JSON.stringify(lists))

      this.showNotification(`Liste "${name}" créée avec succès!`, "success")
      this.loadFavoriteLists()

      return true
    } catch (error) {
      console.error("Erreur lors de la création de la liste:", error)
      return false
    }
  }

  // Récupérer toutes les listes de favoris
  getAllFavoriteLists() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || []
    } catch (error) {
      console.error("Erreur lors de la récupération des listes:", error)
      return []
    }
  }

  // Récupérer les listes de l'utilisateur courant
  getUserFavoriteLists() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"))
    if (!user) return []

    const allLists = this.getAllFavoriteLists()
    return allLists.filter((list) => list.userId === user.id)
  }

  // Ajouter une recette à une liste
  addRecipeToList(listId, recipeId) {
    try {
      const lists = this.getAllFavoriteLists()
      const list = lists.find((l) => l.id === listId)

      if (!list) {
        this.showNotification("Liste non trouvée", "danger")
        return false
      }

      if (list.recipes.includes(recipeId)) {
        this.showNotification("Cette recette est déjà dans la liste", "warning")
        return false
      }

      list.recipes.push(recipeId)
      localStorage.setItem(this.storageKey, JSON.stringify(lists))

      this.showNotification("Recette ajoutée à la liste!", "success")
      return true
    } catch (error) {
      console.error("Erreur lors de l'ajout à la liste:", error)
      return false
    }
  }

  // Retirer une recette d'une liste
  removeRecipeFromList(listId, recipeId) {
    try {
      const lists = this.getAllFavoriteLists()
      const list = lists.find((l) => l.id === listId)

      if (!list) return false

      list.recipes = list.recipes.filter((id) => id !== recipeId)
      localStorage.setItem(this.storageKey, JSON.stringify(lists))

      this.showNotification("Recette retirée de la liste", "info")
      return true
    } catch (error) {
      console.error("Erreur lors de la suppression de la liste:", error)
      return false
    }
  }

  // Supprimer une liste
  deleteList(listId) {
    try {
      const lists = this.getAllFavoriteLists()
      const filtered = lists.filter((l) => l.id !== listId)

      localStorage.setItem(this.storageKey, JSON.stringify(filtered))
      this.showNotification("Liste supprimée", "info")
      this.loadFavoriteLists()

      return true
    } catch (error) {
      console.error("Erreur lors de la suppression de la liste:", error)
      return false
    }
  }

  // Charger et afficher les listes
  loadFavoriteLists() {
    const container = document.getElementById("favorite-lists-container")
    if (!container) return

    const lists = this.getUserFavoriteLists()

    if (lists.length === 0) {
      container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-heart fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Aucune liste personnalisée</h5>
                    <p class="text-muted">Créez votre première liste de favoris personnalisée</p>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createListModal">
                        <i class="fas fa-plus"></i> Créer une liste
                    </button>
                </div>
            `
      return
    }

    container.innerHTML = lists.map((list) => this.createListHTML(list)).join("")

    this.attachListEvents()
  }

  // Créer le HTML d'une liste
  createListHTML(list) {
    const recipes = JSON.parse(localStorage.getItem("recipes")) || []
    const listRecipes = recipes.filter((recipe) => list.recipes.includes(recipe.id))

    return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${list.name}</h6>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item view-list-btn" href="#" data-list-id="${list.id}">
                                    <i class="fas fa-eye"></i> Voir les recettes
                                </a></li>
                                <li><a class="dropdown-item edit-list-btn" href="#" data-list-id="${list.id}">
                                    <i class="fas fa-edit"></i> Modifier
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger delete-list-btn" href="#" data-list-id="${list.id}">
                                    <i class="fas fa-trash"></i> Supprimer
                                </a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="card-text text-muted small">${list.description || "Aucune description"}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-primary">${listRecipes.length} recette(s)</span>
                            <small class="text-muted">
                                Créée le ${new Date(list.createdAt).toLocaleDateString("fr-FR")}
                            </small>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-outline-primary btn-sm w-100 view-list-btn" data-list-id="${list.id}">
                            <i class="fas fa-eye"></i> Voir les recettes
                        </button>
                    </div>
                </div>
            </div>
        `
  }

  // Afficher les recettes d'une liste
  viewListRecipes(listId) {
    const lists = this.getAllFavoriteLists()
    const list = lists.find((l) => l.id === listId)

    if (!list) return

    const recipes = JSON.parse(localStorage.getItem("recipes")) || []
    const listRecipes = recipes.filter((recipe) => list.recipes.includes(recipe.id))

    const modalBody = document.getElementById("listRecipesModalBody")
    const modalTitle = document.getElementById("listRecipesModalLabel")

    if (!modalBody || !modalTitle) return

    modalTitle.textContent = `Recettes de "${list.name}"`

    if (listRecipes.length === 0) {
      modalBody.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-utensils fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Aucune recette dans cette liste</h5>
                    <p class="text-muted">Ajoutez des recettes depuis la page des recettes</p>
                </div>
            `
    } else {
      modalBody.innerHTML = `
                <div class="row">
                    ${listRecipes
                      .map(
                        (recipe) => `
                        <div class="col-md-6 mb-3">
                            <div class="card">
                                <img src="${recipe.image || "/placeholder.svg?height=150&width=300"}" 
                                     class="card-img-top" alt="${recipe.name}" style="height: 150px; object-fit: cover;">
                                <div class="card-body">
                                    <h6 class="card-title">${recipe.name}</h6>
                                    <p class="card-text small text-muted">${recipe.category || "N/A"}</p>
                                    <div class="d-flex justify-content-between">
                                        <button class="btn btn-sm btn-outline-primary view-recipe-details" data-recipe-id="${recipe.id}">
                                            Détails
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger remove-from-list" 
                                                data-list-id="${listId}" data-recipe-id="${recipe.id}">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            `

      // Attacher les événements pour les boutons dans le modal
      modalBody.querySelectorAll(".remove-from-list").forEach((btn) => {
        btn.addEventListener("click", () => {
          const listId = Number.parseInt(btn.dataset.listId)
          const recipeId = Number.parseInt(btn.dataset.recipeId)
          if (confirm("Retirer cette recette de la liste ?")) {
            this.removeRecipeFromList(listId, recipeId)
            this.viewListRecipes(listId) // Recharger le modal
          }
        })
      })

      modalBody.querySelectorAll(".view-recipe-details").forEach((btn) => {
        btn.addEventListener("click", () => {
          const recipeId = Number.parseInt(btn.dataset.recipeId)
          if (window.showRecipeDetails) {
            window.showRecipeDetails(recipeId)
          }
        })
      })
    }

    const modal = new bootstrap.Modal(document.getElementById("listRecipesModal"))
    modal.show()
  }

  // Attacher les événements
  attachListEvents() {
    document.querySelectorAll(".view-list-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        const listId = Number.parseInt(btn.dataset.listId)
        this.viewListRecipes(listId)
      })
    })

    document.querySelectorAll(".delete-list-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        const listId = Number.parseInt(btn.dataset.listId)
        if (confirm("Supprimer cette liste de favoris ?")) {
          this.deleteList(listId)
        }
      })
    })
  }

  // Configurer les événements de la page
  setupEventListeners() {
    document.addEventListener("DOMContentLoaded", () => {
      // Formulaire de création de liste
      const createListForm = document.getElementById("createListForm")
      if (createListForm) {
        createListForm.addEventListener("submit", (e) => {
          e.preventDefault()
          const name = document.getElementById("listName").value.trim()
          const description = document.getElementById("listDescription").value.trim()

          if (name) {
            this.createFavoriteList(name, description)
            createListForm.reset()
            const modal = bootstrap.Modal.getInstance(document.getElementById("createListModal"))
            if (modal) modal.hide()
          }
        })
      }

      // Bouton pour créer une nouvelle liste
      document.getElementById("createNewListBtn")?.addEventListener("click", () => {
        const modal = new bootstrap.Modal(document.getElementById("createListModal"))
        modal.show()
      })
    })
  }

  // Obtenir les listes pour le sélecteur
  getListsForSelector() {
    return this.getUserFavoriteLists().map((list) => ({
      id: list.id,
      name: list.name,
      count: list.recipes.length,
    }))
  }

  // Afficher une notification temporaire
  showNotification(message, type = "success") {
    const notification = document.createElement("div")
    notification.className = `alert alert-${type} alert-dismissible fade show fixed-top mx-auto mt-3`
    notification.setAttribute("role", "alert")
    notification.style.width = "fit-content"
    notification.style.maxWidth = "80%"
    notification.style.zIndex = "1100"
    notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `
    document.body.appendChild(notification)

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  }
}

// Initialiser le gestionnaire de favoris
window.favoritesManager = new FavoritesManager()
