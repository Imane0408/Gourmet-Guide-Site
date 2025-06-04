// ⚡ AJOUTEZ CECI EN HAUT DE VOTRE FICHIER app.js EXISTANT

// 🚀 INTÉGRATION JQUERY DANS APP.JS
document.addEventListener("DOMContentLoaded", () => {
  // Vérifier si jQuery est chargé
  if (typeof $ !== "undefined") {
    console.log("✅ jQuery disponible dans app.js")
    initJQueryFeatures()
  } else {
    console.log("⚠️ jQuery non disponible dans app.js")
  }

  // Continuer avec votre code existant
  checkAuth()
  initializeDefaultData()
  cleanInvalidRecipes()

  // Load content based on current page
  if (document.getElementById("recipe-list")) {
    console.log("Loading recipes...")
    loadRecipes()
  }
  if (document.getElementById("favorites-list")) {
    console.log("Loading favorites...")
    loadFavoriteRecipes()
  }
  if (document.getElementById("add-recipe-button-container") && window.location.pathname.includes("recipes.html")) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
    const container = document.getElementById("add-recipe-button-container")
    if (loggedInUser && loggedInUser.role === "admin") {
      container.style.display = "block"
    } else {
      container.style.display = "none"
    }
  }

  // Setup search functionality
  if (document.getElementById("search-input") && document.getElementById("search-button")) {
    setupSearch()
  }

  // Setup form handlers
  const contactForm = document.getElementById("contact-form-main")
  const registerForm = document.getElementById("register-form")
  const loginForm = document.getElementById("login-form")
  const logoutButton = document.getElementById("logout-button")
  const profileInfo = document.getElementById("profile-info")
  const recipeForm = document.getElementById("recipe-form")

  if (contactForm) setupContactForm(contactForm)
  if (registerForm) setupRegisterForm(registerForm)
  if (loginForm) setupLoginForm(loginForm)
  if (logoutButton) setupLogoutButton(logoutButton)
  if (profileInfo) setupProfileInfo(profileInfo)
  if (recipeForm) setupRecipeForm(recipeForm)

  setTimeout(updateNotificationBadge, 50)
})

function initJQueryFeatures() {
  $(document).ready(() => {
    // 🔔 Notification globale avec jQuery
    window.jNotify = (message, type = "success") => {
      const $alert = $(`
                <div class="alert alert-${type} alert-dismissible fade show global-notification">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>${message}</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `)

      $alert.css({
        position: "fixed",
        top: "20px",
        right: "20px",
        "z-index": "9999",
        "min-width": "300px",
        "box-shadow": "0 4px 12px rgba(0,0,0,0.15)",
        "border-radius": "8px",
      })

      $("body").append($alert)
      $alert.hide().slideDown(300)

      setTimeout(() => {
        $alert.slideUp(300, function () {
          $(this).remove()
        })
      }, 3000)
    }

    // 🎯 Améliorer showNotification existant
    if (typeof window.showNotification === "function") {
      const originalShowNotification = window.showNotification
      window.showNotification = (message, type) => {
        if (typeof window.jNotify === "function") {
          window.jNotify(message, type)
        } else {
          originalShowNotification(message, type)
        }
      }
    }

    // 🔍 Recherche améliorée
    $(".search-input, #search-input").on("input", function () {
      const term = $(this).val().toLowerCase()
      $(".recipe-card, .searchable-item").each(function () {
        const $item = $(this)
        const text = $item.text().toLowerCase()
        if (text.includes(term)) {
          $item.fadeIn(200)
        } else {
          $item.fadeOut(200)
        }
      })
    })

    // ❤️ Favoris avec animation
    $(document).on("click", ".favorite-btn, .toggle-favorite", function () {
      const $btn = $(this)
      $btn.addClass("animate__animated animate__pulse")

      setTimeout(() => {
        $btn.removeClass("animate__animated animate__pulse")
        $btn.toggleClass("favorited")

        if ($btn.hasClass("favorited")) {
          $btn.find("i").removeClass("far").addClass("fas text-danger")
          window.jNotify("Ajouté aux favoris!", "success")
        } else {
          $btn.find("i").removeClass("fas text-danger").addClass("far")
          window.jNotify("Retiré des favoris", "info")
        }
      }, 300)
    })

    console.log("🎉 app.js avec jQuery prêt!")
  })
}

// Vérification de l'authentification sur chaque page
function checkAuth() {
  // Pages publiques qui ne nécessitent PAS de connexion
  const publicPages = ["login.html", "registre.html", "index.html", "about.html", "contact.html"]
  const currentPage = window.location.pathname.split("/").pop()

  // Mettre à jour la barre de navigation même sur les pages publiques
  updateNavbarForAuth()

  // Pages qui nécessitent une connexion
  const protectedPages = [
    "recipes.html",
    "favorites.html",
    "profile.html",
    "admin_dashboard.html",
    "menu.html",
    "reservations.html",
    "add.html",
    "complaint_response.html",
    "manage_users.html",
    "notifications.html",
    "inbox.html",
  ]

  if (protectedPages.includes(currentPage)) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"))
    if (!user) {
      window.location.href = "login.html"
      return
    }

    if (currentPage === "reservations.html" && user.role === "admin") {
      window.location.href = "admin_dashboard.html"
      showNotification("Les administrateurs confirment les réservations, ils ne peuvent pas en créer.", "warning")
    }
  }
}

// Fonction pour mettre à jour la barre de navigation
function updateNavbarForAuth() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
  const loginLink = document.getElementById("login-link")
  const registerLink = document.getElementById("register-link")
  const logoutButton = document.getElementById("logout-button")

  // Tous les éléments de navigation possibles
  const navItems = {
    // Pages publiques
    home: document.querySelector('a[href="index.html"]')?.parentElement,
    about: document.querySelector('a[href="about.html"]')?.parentElement,
    contact: document.querySelector('a[href="contact.html"]')?.parentElement,

    // Pages client
    recipes: document.querySelector('a[href="recipes.html"]')?.parentElement,
    favorites: document.querySelector('a[href="favorites.html"]')?.parentElement,
    menu: document.querySelector('a[href="menu.html"]')?.parentElement,
    reservations: document.querySelector('a[href="reservations.html"]')?.parentElement,
    notifications: document.querySelector('a[href="notifications.html"]')?.parentElement,

    // Pages admin
    adminDashboard: document.querySelector('a[href="admin_dashboard.html"]')?.parentElement,
    manageUsers: document.querySelector('a[href="manage_users.html"]')?.parentElement,
    addRecipe: document.querySelector('a[href="add.html"]')?.parentElement,
    complaintResponse: document.querySelector('a[href="complaint_response.html"]')?.parentElement,
    inbox: document.querySelector('a[href="inbox.html"]')?.parentElement,

    // Profil (commun)
    profile: document.getElementById("profile-link"),
  }

  // Masquer tous les éléments de navigation par défaut
  Object.values(navItems).forEach((item) => {
    if (item) item.style.display = "none"
  })

  if (!loggedInUser) {
    // Utilisateur non connecté - afficher seulement les pages publiques
    if (loginLink) loginLink.style.display = "block"
    if (registerLink) registerLink.style.display = "block"
    if (logoutButton) logoutButton.style.display = "none"

    // Pages publiques toujours visibles
    if (navItems.home) navItems.home.style.display = "block"
    if (navItems.about) navItems.about.style.display = "block"
    if (navItems.contact) navItems.contact.style.display = "block"
  } else {
    // Utilisateur connecté
    if (loginLink) loginLink.style.display = "none"
    if (registerLink) registerLink.style.display = "none"
    if (logoutButton) logoutButton.style.display = "block"

    // Profil toujours visible pour les utilisateurs connectés
    if (navItems.profile) navItems.profile.style.display = "block"

    if (loggedInUser.role === "admin") {
      // 🔧 NAVIGATION ADMIN - Afficher seulement les pages admin + pages publiques
      console.log("🔧 Configuration navigation ADMIN")

      // Pages publiques (Accueil et À propos)
      if (navItems.home) navItems.home.style.display = "block"
      if (navItems.about) navItems.about.style.display = "block"

      // Pages admin
      if (navItems.adminDashboard) navItems.adminDashboard.style.display = "block"
      if (navItems.manageUsers) navItems.manageUsers.style.display = "block"
      if (navItems.recipes) navItems.recipes.style.display = "block" // Gestion des recettes
      if (navItems.inbox) navItems.inbox.style.display = "block" // Messages
      if (navItems.addRecipe) navItems.addRecipe.style.display = "block"

      // MASQUER les pages client
      if (navItems.favorites) navItems.favorites.style.display = "none"
      if (navItems.menu) navItems.menu.style.display = "none"
      if (navItems.reservations) navItems.reservations.style.display = "none"
      if (navItems.contact) navItems.contact.style.display = "none"
      if (navItems.notifications) navItems.notifications.style.display = "none"
      if (navItems.complaintResponse) navItems.complaintResponse.style.display = "none"
    } else if (loggedInUser.role === "client") {
      // 👤 NAVIGATION CLIENT
      console.log("👤 Configuration navigation CLIENT")

      // Pages publiques
      if (navItems.home) navItems.home.style.display = "block"
      if (navItems.about) navItems.about.style.display = "block"
      if (navItems.contact) navItems.contact.style.display = "block"

      // Pages client
      if (navItems.recipes) navItems.recipes.style.display = "block"
      if (navItems.favorites) navItems.favorites.style.display = "block"
      if (navItems.menu) navItems.menu.style.display = "block"
      if (navItems.reservations) navItems.reservations.style.display = "block"
      if (navItems.notifications) navItems.notifications.style.display = "block"

      // Vérifier les réclamations avec réponse
      const complaints = JSON.parse(localStorage.getItem("complaints")) || []
      const userComplaints = complaints.filter((c) => c.email === loggedInUser.username && c.replied)
      if (userComplaints.length > 0 && navItems.complaintResponse) {
        navItems.complaintResponse.style.display = "block"
      }

      // MASQUER les pages admin
      if (navItems.adminDashboard) navItems.adminDashboard.style.display = "none"
      if (navItems.manageUsers) navItems.manageUsers.style.display = "none"
      if (navItems.addRecipe) navItems.addRecipe.style.display = "none"
      if (navItems.inbox) navItems.inbox.style.display = "none"
    }
  }

  console.log("🔄 Navigation mise à jour pour:", loggedInUser?.role || "non connecté")
}
document.addEventListener("DOMContentLoaded", function() {
    updateNavbarForAuth();  // Force la mise à jour au chargement
});
// --- Recipe Loading and Display ---
function loadRecipes() {
  const recipeList = document.getElementById("recipe-list")
  if (!recipeList) return
  let recipes = JSON.parse(localStorage.getItem("recipes")) || []

  recipes = recipes.filter((recipe) => recipe && recipe.name && recipe.id)

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
  const isAdmin = loggedInUser && loggedInUser.role === "admin"
  const isClient = loggedInUser && loggedInUser.role === "client"
  const currentUserId = loggedInUser ? loggedInUser.id : null

  recipeList.innerHTML = recipes
    .map((recipe) => {
      if (!recipe.ratings) recipe.ratings = {}
      const ratings = Object.values(recipe.ratings)
      const averageRating =
        ratings.length > 0 ? (ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(1) : 0
      const averageRatingDisplay = ratings.length > 0 ? averageRating : "N/A"

      const averageStarIcons = Array(5)
        .fill(0)
        .map(
          (_, i) => `
            <i class="fas fa-star ${i < Math.round(averageRating) ? "text-warning" : "text-muted"}"></i>
        `,
        )
        .join("")

      let userRatingHtml = ""
      if (isClient) {
        const userRating = recipe.ratings[currentUserId]
        const userStarIcons = Array(5)
          .fill(0)
          .map(
            (_, i) => `
                <i class="fas fa-star rating-star ${userRating && i < userRating ? "text-warning" : "text-muted"}"
                   data-recipe-id="${recipe.id}"
                   data-rating="${i + 1}"
                   style="cursor: pointer;"></i>
            `,
          )
          .join("")
        userRatingHtml = `
                <div class="mt-2">
                    <small class="text-muted">Votre note:</small>
                    <div class="user-rating-stars">${userStarIcons}</div>
                </div>
            `
      }

      const isFavoriteForCurrentUser = recipe.favoritedBy && currentUserId && recipe.favoritedBy.includes(currentUserId)
      const favoriteButtonHtml = isClient
        ? `
            <button class="btn btn-sm ${isFavoriteForCurrentUser ? "btn-warning" : "btn-outline-secondary"} toggle-favorite" data-id="${recipe.id}" title="Ajouter/Retirer des favoris">
                <i class="fas fa-bookmark"></i>
            </button>
        `
        : ""

      const adminButtonsHtml = isAdmin
        ? `
            <button class="btn btn-sm btn-primary edit-recipe me-1" data-id="${recipe.id}" title="Modifier">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-recipe" data-id="${recipe.id}" title="Supprimer">
                <i class="fas fa-trash"></i>
            </button>
        `
        : ""

      return `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <img src="${recipe.image || "images/default-recipe.jpg"}"
                         class="card-img-top"
                         alt="${recipe.name}"
                         style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${recipe.name}</h5>
                        <p class="card-text mb-1"><small><strong>Temps:</strong> ${recipe.time || "N/A"} min</small></p>
                        <p class="card-text mb-1"><small><strong>Difficulté:</strong> ${recipe.difficulty || "N/A"}</small></p>
                        <p class="card-text mb-2"><small><strong>Catégorie:</strong> ${recipe.category || "N/A"}</small></p>
                        <div class="d-flex align-items-center mb-2">
                            ${averageStarIcons}
                            <span class="ms-2 text-muted">(${averageRatingDisplay})</span>
                        </div>
                        ${userRatingHtml} 
                        <div class="mt-auto d-flex justify-content-between align-items-center pt-2">
                            <button class="btn btn-outline-primary btn-sm view-details" data-id="${recipe.id}">
                                <i class="fas fa-eye"></i> Détails
                            </button>
                            <div class="btn-group">
                                ${favoriteButtonHtml}
                                ${adminButtonsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    })
    .join("")

  addRecipeEventHandlers()
}

function addRecipeEventHandlers() {
  // Favorite Button Handler
  document.querySelectorAll(".toggle-favorite").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation()
      const recipeId = Number.parseInt(this.getAttribute("data-id"))
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))

      if (!loggedInUser || loggedInUser.role !== "client") {
        showNotification("Veuillez vous connecter en tant que client pour gérer les favoris.", "warning")
        return
      }

      const recipes = JSON.parse(localStorage.getItem("recipes")) || []
      const recipeIndex = recipes.findIndex((recipe) => recipe.id === recipeId)

      if (recipeIndex !== -1) {
        if (!recipes[recipeIndex].favoritedBy) {
          recipes[recipeIndex].favoritedBy = []
        }
        const userIndex = recipes[recipeIndex].favoritedBy.indexOf(loggedInUser.id)

        if (userIndex === -1) {
          recipes[recipeIndex].favoritedBy.push(loggedInUser.id)
          showNotification("Recette ajoutée aux favoris!", "success")
        } else {
          recipes[recipeIndex].favoritedBy.splice(userIndex, 1)
          showNotification("Recette retirée des favoris.", "info")
        }
        localStorage.setItem("recipes", JSON.stringify(recipes))
        loadRecipes()
        if (typeof updateCounters === "function") updateCounters()
        if (window.location.pathname.includes("favorites.html") && typeof loadFavoriteRecipes === "function") {
          loadFavoriteRecipes()
        }
      }
    })
  })

  // Rating Star Handler
  document.querySelectorAll(".rating-star").forEach((star) => {
    star.addEventListener("click", function (e) {
      e.stopPropagation()
      const recipeId = Number.parseInt(this.getAttribute("data-recipe-id"))
      const rating = Number.parseInt(this.getAttribute("data-rating"))
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))

      if (!loggedInUser || loggedInUser.role !== "client") {
        showNotification("Veuillez vous connecter en tant que client pour noter.", "warning")
        return
      }
      rateRecipe(recipeId, loggedInUser.id, rating)
    })
  })

  // Admin Delete Button Handler
  document.querySelectorAll(".delete-recipe").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation()
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
      if (!loggedInUser || loggedInUser.role !== "admin") return

      if (confirm("Êtes-vous sûr de vouloir supprimer cette recette?")) {
        const recipeId = Number.parseInt(this.getAttribute("data-id"))
        let recipes = JSON.parse(localStorage.getItem("recipes")) || []
        recipes = recipes.filter((recipe) => recipe.id !== recipeId)
        localStorage.setItem("recipes", JSON.stringify(recipes))
        loadRecipes()
        if (typeof updateCounters === "function") updateCounters()
        showNotification("Recette supprimée avec succès!", "danger")
      }
    })
  })

  // Admin Edit Button Handler
  document.querySelectorAll(".edit-recipe").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation()
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
      if (!loggedInUser || loggedInUser.role !== "admin") return

      const recipeId = Number.parseInt(this.getAttribute("data-id"))
      window.location.href = `add.html?edit=${recipeId}`
    })
  })

  // View Details Button Handler
  document.querySelectorAll(".view-details").forEach((button) => {
    button.addEventListener("click", function () {
      const recipeId = Number.parseInt(this.getAttribute("data-id"))
      showRecipeDetails(recipeId)
    })
  })
}

// Rating Function
function rateRecipe(recipeId, userId, rating) {
  const recipes = JSON.parse(localStorage.getItem("recipes")) || []
  const recipeIndex = recipes.findIndex((r) => r.id === recipeId)

  if (recipeIndex !== -1) {
    if (!recipes[recipeIndex].ratings) {
      recipes[recipeIndex].ratings = {}
    }
    recipes[recipeIndex].ratings[userId] = rating

    localStorage.setItem("recipes", JSON.stringify(recipes))
    showNotification(`Vous avez noté cette recette ${rating}/5.`, "success")
    loadRecipes()
  } else {
    showNotification("Erreur lors de la notation de la recette.", "danger")
  }
}

// Show Recipe Details Modal
function showRecipeDetails(recipeId) {
  const recipes = JSON.parse(localStorage.getItem("recipes")) || []
  const recipe = recipes.find((r) => r.id === recipeId)

  if (!recipe) return

  if (!recipe.ratings) recipe.ratings = {}
  const ratings = Object.values(recipe.ratings)
  const averageRating =
    ratings.length > 0 ? (ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(1) : 0
  const averageRatingDisplay = ratings.length > 0 ? averageRating : "N/A"
  const starIcons = Array(5)
    .fill(0)
    .map(
      (_, i) => `
        <i class="fas fa-star ${i < Math.round(averageRating) ? "text-warning" : "text-muted"}"></i>
    `,
    )
    .join("")

  const ingredientsHtml = recipe.ingredients
    ? recipe.ingredients
        .split(",")
        .map((ing) => `<li>${ing.trim()}</li>`)
        .join("")
    : "<li>Non spécifié</li>"

  const stepsHtml = recipe.steps
    ? recipe.steps
        .split("\n")
        .map((step) => `<li>${step.trim()}</li>`)
        .join("")
    : "<li>Non spécifié</li>"

  const modalHtml = `
        <div class="modal fade" id="recipeDetailsModal" tabindex="-1" aria-labelledby="recipeDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="recipeDetailsModalLabel">${recipe.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <img src="${recipe.image || "images/default-recipe.jpg"}"
                                     class="img-fluid rounded mb-3"
                                     alt="${recipe.name}">
                                <p><strong>Temps:</strong> ${recipe.time || "N/A"} min</p>
                                <p><strong>Difficulté:</strong> ${recipe.difficulty || "N/A"}</p>
                                <p><strong>Catégorie:</strong> ${recipe.category || "N/A"}</p>
                                <div class="d-flex align-items-center mb-2">
                                    <strong>Note moyenne:</strong>
                                    <span class="ms-2">${starIcons} (${averageRatingDisplay})</span>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h4>Ingrédients</h4>
                                <ul>${ingredientsHtml}</ul>
                            </div>
                        </div>
                        <hr>
                        <h4>Préparation</h4>
                        <ol>${stepsHtml}</ol>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `

  const existingModal = document.getElementById("recipeDetailsModal")
  if (existingModal) {
    existingModal.remove()
  }
  document.body.insertAdjacentHTML("beforeend", modalHtml)

  const modalElement = document.getElementById("recipeDetailsModal")
  const modal = new bootstrap.Modal(modalElement)
  modal.show()
}

// Load Favorite Recipes (pour favorites.html)
function loadFavoriteRecipes() {
  const favoritesList = document.getElementById("favorites-list")
  if (!favoritesList) return

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
  if (!loggedInUser || loggedInUser.role !== "client") {
    favoritesList.innerHTML =
      '<div class="alert alert-warning">Vous devez être connecté en tant que client pour voir vos favoris.</div>'
    return
  }

  const recipes = JSON.parse(localStorage.getItem("recipes")) || []
  const favoriteRecipes = recipes.filter((recipe) => recipe.favoritedBy && recipe.favoritedBy.includes(loggedInUser.id))

  if (favoriteRecipes.length === 0) {
    favoritesList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center">
                    <i class="fas fa-heart fa-3x mb-3"></i>
                    <h4>Aucune recette favorite</h4>
                    <p>Vous n'avez pas encore ajouté de recettes à vos favoris.</p>
                    <a href="recipes.html" class="btn btn-primary">Découvrir les recettes</a>
                </div>
            </div>
        `
    return
  }

  favoritesList.innerHTML = favoriteRecipes
    .map((recipe) => {
      if (!recipe.ratings) recipe.ratings = {}
      const ratings = Object.values(recipe.ratings)
      const averageRating =
        ratings.length > 0 ? (ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(1) : 0
      const averageRatingDisplay = ratings.length > 0 ? averageRating : "N/A"

      const averageStarIcons = Array(5)
        .fill(0)
        .map(
          (_, i) => `
            <i class="fas fa-star ${i < Math.round(averageRating) ? "text-warning" : "text-muted"}"></i>
        `,
        )
        .join("")

      return `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <img src="${recipe.image || "images/default-recipe.jpg"}"
                         class="card-img-top"
                         alt="${recipe.name}"
                         style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${recipe.name}</h5>
                        <p class="card-text mb-1"><small><strong>Temps:</strong> ${recipe.time || "N/A"} min</small></p>
                        <p class="card-text mb-1"><small><strong>Difficulté:</strong> ${recipe.difficulty || "N/A"}</small></p>
                        <p class="card-text mb-2"><small><strong>Catégorie:</strong> ${recipe.category || "N/A"}</small></p>
                        <div class="d-flex align-items-center mb-2">
                            ${averageStarIcons}
                            <span class="ms-2 text-muted">(${averageRatingDisplay})</span>
                        </div>
                        <div class="mt-auto d-flex justify-content-between align-items-center pt-2">
                            <button class="btn btn-outline-primary btn-sm view-details" data-id="${recipe.id}">
                                <i class="fas fa-eye"></i> Détails
                            </button>
                            <button class="btn btn-sm btn-warning toggle-favorite" data-id="${recipe.id}" title="Retirer des favoris">
                                <i class="fas fa-heart"></i> Retirer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
    })
    .join("")

  // Réattacher les gestionnaires d'événements
  addRecipeEventHandlers()
}

// Setup Search Function
function setupSearch() {
  const searchInput = document.getElementById("search-input")
  const searchButton = document.getElementById("search-button")

  if (!searchInput || !searchButton) return

  function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase()
    const recipeList = document.getElementById("recipe-list")

    if (!recipeList) return

    if (searchTerm === "") {
      loadRecipes()
      return
    }

    const recipes = JSON.parse(localStorage.getItem("recipes")) || []
    const filteredRecipes = recipes.filter((recipe) => {
      return (
        recipe.name.toLowerCase().includes(searchTerm) ||
        (recipe.category && recipe.category.toLowerCase().includes(searchTerm)) ||
        (recipe.ingredients && recipe.ingredients.toLowerCase().includes(searchTerm)) ||
        (recipe.steps && recipe.steps.toLowerCase().includes(searchTerm))
      )
    })

    if (filteredRecipes.length === 0) {
      recipeList.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h3 class="text-muted">Aucune recette trouvée pour "${searchTerm}"</h3>
                    <button class="btn btn-primary mt-3" onclick="loadRecipes()">Voir toutes les recettes</button>
                </div>
            `
    } else {
      displayFilteredRecipes(filteredRecipes)
    }
  }

  function displayFilteredRecipes(recipes) {
    const recipeList = document.getElementById("recipe-list")
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
    const isAdmin = loggedInUser && loggedInUser.role === "admin"
    const isClient = loggedInUser && loggedInUser.role === "client"
    const currentUserId = loggedInUser ? loggedInUser.id : null

    recipeList.innerHTML = recipes
      .map((recipe) => {
        if (!recipe.ratings) recipe.ratings = {}
        const ratings = Object.values(recipe.ratings)
        const averageRating =
          ratings.length > 0 ? (ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(1) : 0
        const averageRatingDisplay = ratings.length > 0 ? averageRating : "N/A"

        const averageStarIcons = Array(5)
          .fill(0)
          .map(
            (_, i) => `
                <i class="fas fa-star ${i < Math.round(averageRating) ? "text-warning" : "text-muted"}"></i>
            `,
          )
          .join("")

        let userRatingHtml = ""
        if (isClient) {
          const userRating = recipe.ratings[currentUserId]
          const userStarIcons = Array(5)
            .fill(0)
            .map(
              (_, i) => `
                    <i class="fas fa-star rating-star ${userRating && i < userRating ? "text-warning" : "text-muted"}"
                       data-recipe-id="${recipe.id}"
                       data-rating="${i + 1}"
                       style="cursor: pointer;"></i>
                `,
            )
            .join("")
          userRatingHtml = `
                    <div class="mt-2">
                        <small class="text-muted">Votre note:</small>
                        <div class="user-rating-stars">${userStarIcons}</div>
                    </div>
                `
        }

        const isFavoriteForCurrentUser =
          recipe.favoritedBy && currentUserId && recipe.favoritedBy.includes(currentUserId)
        const favoriteButtonHtml = isClient
          ? `
                <button class="btn btn-sm ${isFavoriteForCurrentUser ? "btn-warning" : "btn-outline-secondary"} toggle-favorite" data-id="${recipe.id}" title="Ajouter/Retirer des favoris">
                    <i class="fas fa-bookmark"></i>
                </button>
            `
          : ""

        const adminButtonsHtml = isAdmin
          ? `
                <button class="btn btn-sm btn-primary edit-recipe me-1" data-id="${recipe.id}" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-recipe" data-id="${recipe.id}" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            `
          : ""

        return `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <img src="${recipe.image || "images/default-recipe.jpg"}"
                             class="card-img-top"
                             alt="${recipe.name}"
                             style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${recipe.name}</h5>
                            <p class="card-text mb-1"><small><strong>Temps:</strong> ${recipe.time || "N/A"} min</small></p>
                            <p class="card-text mb-1"><small><strong>Difficulté:</strong> ${recipe.difficulty || "N/A"}</small></p>
                            <p class="card-text mb-2"><small><strong>Catégorie:</strong> ${recipe.category || "N/A"}</small></p>
                            <div class="d-flex align-items-center mb-2">
                                ${averageStarIcons}
                                <span class="ms-2 text-muted">(${averageRatingDisplay})</span>
                            </div>
                            ${userRatingHtml} 
                            <div class="mt-auto d-flex justify-content-between align-items-center pt-2">
                                <button class="btn btn-outline-primary btn-sm view-details" data-id="${recipe.id}">
                                    <i class="fas fa-eye"></i> Détails
                                </button>
                                <div class="btn-group">
                                    ${favoriteButtonHtml}
                                    ${adminButtonsHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
      })
      .join("")

    addRecipeEventHandlers()
  }

  searchButton.addEventListener("click", performSearch)
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      performSearch()
    }
  })
}

// Form Setup Functions
function setupContactForm(form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    const name = document.getElementById("name").value.trim()
    const email = document.getElementById("email").value.trim()
    const subject = document.getElementById("subject").value.trim()
    const message = document.getElementById("message").value.trim()

    if (!name || !email || !subject || !message) {
      showNotification("Veuillez remplir tous les champs obligatoires.", "danger")
      return
    }

    const complaint = {
      id: Date.now(),
      name: name,
      email: email,
      subject: subject,
      message: message,
      reply: "",
      replied: false,
      date: new Date().toISOString(),
    }

    const complaints = JSON.parse(localStorage.getItem("complaints")) || []
    complaints.push(complaint)
    localStorage.setItem("complaints", JSON.stringify(complaints))

    showNotification("Réclamation envoyée avec succès!", "success")
    form.reset()
  })
}

function setupRegisterForm(form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    const username = document.getElementById("username").value.trim()
    const password = document.getElementById("password").value.trim()
    const role = document.getElementById("role")?.value || "client"

    if (!username || !password) {
      showNotification("Nom d'utilisateur et mot de passe requis.", "danger")
      return
    }

    if (role === "admin") {
      showNotification("Inscription en tant qu'admin non autorisée via ce formulaire.", "danger")
      return
    }

    const users = JSON.parse(localStorage.getItem("users")) || []
    if (users.some((u) => u.username === username)) {
      showNotification("Ce nom d'utilisateur existe déjà.", "danger")
      return
    }

    const newUser = {
      id: Date.now(),
      username,
      password,
      role: "client",
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    showNotification("Inscription réussie! Veuillez vous connecter.", "success")
    window.location.href = "login.html"
  })
}

function setupLoginForm(form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    const username = document.getElementById("username").value.trim()
    const password = document.getElementById("password").value.trim()

    if (!username || !password) {
      showNotification("Nom d'utilisateur et mot de passe requis.", "danger")
      return
    }

    const users = JSON.parse(localStorage.getItem("users")) || []
    const user = users.find((u) => u.username === username && u.password === password)

    if (user) {
      localStorage.setItem("loggedInUser", JSON.stringify(user))
      showNotification("Connexion réussie!", "success")
      redirectToRolePage(user.role)
    } else {
      showNotification("Nom d'utilisateur ou mot de passe incorrect.", "danger")
    }
  })
}

function setupLogoutButton(button) {
  button.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser")
    showNotification("Déconnexion réussie!", "success")
    window.location.href = "login.html"
  })
}

function setupProfileInfo(element) {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
  if (loggedInUser) {
    element.innerHTML = `
            <p>Bienvenue, <strong class="text-primary">${loggedInUser.username}</strong>!</p>
            <p>Votre rôle: <span class="badge bg-info">${loggedInUser.role}</span></p>
        `
  } else {
    window.location.href = "login.html"
  }
}

function setupRecipeForm(form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
    if (!loggedInUser || loggedInUser.role !== "admin") {
      showNotification("Seuls les administrateurs peuvent ajouter des recettes.", "danger")
      return
    }

    // Récupérer les valeurs du formulaire
    const name = document.getElementById("recipe-name").value.trim()
    const time = document.getElementById("recipe-time").value.trim()
    const difficulty = document.getElementById("recipe-difficulty").value
    const category = document.getElementById("recipe-category").value
    const ingredients = document.getElementById("ingredients").value.trim()
    const steps = document.getElementById("steps").value.trim()

    // Validation
    if (!name || !time || !difficulty || !category || !ingredients || !steps) {
      showNotification("Veuillez remplir tous les champs obligatoires.", "danger")
      return
    }

    // Récupérer l'image (si elle existe)
    let recipeImage = null
    if (window.currentImage) {
      recipeImage = window.currentImage
    }

    // Vérifier si c'est une modification ou un ajout
    const urlParams = new URLSearchParams(window.location.search)
    const editId = urlParams.get("edit")

    const recipes = JSON.parse(localStorage.getItem("recipes")) || []

    if (editId) {
      // Mode modification
      const recipeIndex = recipes.findIndex((r) => r.id === Number.parseInt(editId))
      if (recipeIndex !== -1) {
        recipes[recipeIndex] = {
          ...recipes[recipeIndex],
          name: name,
          time: time,
          difficulty: difficulty,
          category: category,
          ingredients: ingredients,
          steps: steps,
          image: recipeImage || recipes[recipeIndex].image,
        }
        localStorage.setItem("recipes", JSON.stringify(recipes))
        showNotification("Recette modifiée avec succès!", "success")
      } else {
        showNotification("Erreur: Recette non trouvée.", "danger")
        return
      }
    } else {
      // Mode ajout
      const newRecipe = {
        id: Date.now(),
        name: name,
        time: time,
        difficulty: difficulty,
        category: category,
        ingredients: ingredients,
        steps: steps,
        image: recipeImage,
        favoritedBy: [],
        ratings: {},
        views: 0,
        comments: [],
        createdAt: new Date().toISOString(),
      }

      recipes.push(newRecipe)
      localStorage.setItem("recipes", JSON.stringify(recipes))
      showNotification("Recette ajoutée avec succès!", "success")
    }

    // Rediriger vers la page des recettes après un court délai
    setTimeout(() => {
      window.location.href = "recipes.html"
    }, 1500)
  })
}

// Utility Functions
function redirectToRolePage(role) {
  switch (role) {
    case "admin":
      window.location.href = "admin_dashboard.html"
      break
    default:
      window.location.href = "profile.html"
      break
  }
}

function showNotification(message, type = "success") {
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
}

function cleanInvalidRecipes() {
  try {
    let recipes = JSON.parse(localStorage.getItem("recipes")) || []
    const originalLength = recipes.length
    recipes = recipes.filter((recipe) => recipe && recipe.name && recipe.id)
    if (recipes.length < originalLength) {
      localStorage.setItem("recipes", JSON.stringify(recipes))
      console.log(`Cleaned ${originalLength - recipes.length} invalid recipe entries.`)
    }
  } catch (error) {
    console.error("Error cleaning recipes:", error)
  }
}

function initializeDefaultData() {
  try {
    if (!localStorage.getItem("users")) {
      localStorage.setItem(
        "users",
        JSON.stringify([
          { id: 1, username: "admin", password: "admin", role: "admin", email: "admin@restaurant.com" },
          { id: 2, username: "client", password: "client", role: "client", email: "client@restaurant.com" },
        ]),
      )
      console.log("Initialized default users.")
    }
    if (!localStorage.getItem("recipes")) {
      localStorage.setItem(
        "recipes",
        JSON.stringify([
          {
            id: 101,
            name: "Salade César Classique",
            time: "15",
            difficulty: "Facile",
            category: "Entrée",
            ingredients: "Laitue romaine, Poulet grillé, Croûtons à l'ail, Copeaux de parmesan, Sauce César maison",
            steps:
              "1. Laver et couper la laitue.\n2. Griller le poulet et le trancher.\n3. Préparer les croûtons.\n4. Assembler la salade, ajouter la sauce et le parmesan.",
            image: "https://placehold.co/400x200/8D5B4C/FFFFFF?text=Salade+César",
            favoritedBy: [],
            ratings: {},
            views: 120,
            comments: [],
            createdAt: "2023-01-01T10:00:00Z",
          },
          {
            id: 102,
            name: "Pâtes Carbonara Authentiques",
            time: "25",
            difficulty: "Moyen",
            category: "Plat principal",
            ingredients:
              "Spaghetti, Guanciale (ou pancetta), Jaunes d'œufs, Pecorino Romano râpé, Poivre noir fraîchement moulu",
            steps:
              "1. Cuire les spaghetti al dente.\n2. Faire revenir le guanciale jusqu'à ce qu'il soit croustillant.\n3. Mélanger les jaunes d'œufs, le pecorino et beaucoup de poivre.\n4. Égoutter les pâtes (réserver un peu d'eau de cuisson), mélanger avec le guanciale.\n5. Hors du feu, ajouter le mélange œufs/fromage, émulsionner avec un peu d'eau de cuisson si nécessaire.",
            image: "https://placehold.co/400x200/6E4A3A/FFFFFF?text=Pâtes+Carbonara",
            favoritedBy: [2],
            ratings: { 2: 4 },
            views: 200,
            comments: [],
            createdAt: "2023-01-05T12:00:00Z",
          },
          {
            id: 103,
            name: "Tiramisu Express",
            time: "20",
            difficulty: "Facile",
            category: "Dessert",
            ingredients:
              "Mascarpone, Œufs (jaunes seulement), Sucre, Café fort froid, Biscuits à la cuillère (Savoiardi), Cacao amer en poudre",
            steps:
              "1. Battre les jaunes d'œufs avec le sucre jusqu'à blanchiment.\n2. Incorporer délicatement le mascarpone.\n3. Tremper rapidement les biscuits dans le café froid.\n4. Dans des verrines ou un plat, alterner une couche de biscuits et une couche de crème.\n5. Réfrigérer au moins 2 heures.\n6. Saupoudrer généreusement de cacao avant de servir.",
            image: "https://placehold.co/400x200/A67C70/FFFFFF?text=Tiramisu",
            favoritedBy: [],
            ratings: {},
            views: 150,
            comments: [],
            createdAt: "2023-01-10T16:00:00Z",
          },
        ]),
      )
      console.log("Initialized default recipes.")
    }
    if (!localStorage.getItem("complaints")) {
      localStorage.setItem("complaints", JSON.stringify([]))
      console.log("Initialized empty complaints.")
    }
    if (!localStorage.getItem("reservations")) {
      localStorage.setItem("reservations", JSON.stringify([]))
      console.log("Initialized empty reservations.")
    }
    if (!localStorage.getItem("menuData")) {
      localStorage.setItem(
        "menuData",
        JSON.stringify({ menuDuJour: {}, menusSpeciaux: [], carte: { entrees: [], plats: [], desserts: [] } }),
      )
      console.log("Initialized empty menu data.")
    }
    if (!localStorage.getItem("userNotifications")) {
      localStorage.setItem("userNotifications", JSON.stringify([]))
      console.log("Initialized empty user notifications.")
    }
  } catch (error) {
    console.error("Error initializing default data:", error)
  }
}

// Notification System
function addUserNotification(userId, title, message) {
  try {
    const allNotifications = JSON.parse(localStorage.getItem("userNotifications")) || []
    const newNotification = {
      id: Date.now(),
      userId: userId,
      title: title,
      message: message,
      timestamp: new Date().toISOString(),
      read: false,
    }
    allNotifications.push(newNotification)
    localStorage.setItem("userNotifications", JSON.stringify(allNotifications))
    document.dispatchEvent(new CustomEvent("notificationAdded"))
    console.log("Notification ajoutée:", newNotification)
  } catch (error) {
    console.error("Error adding user notification:", error)
  }
}

function updateNotificationBadge() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
  const notificationBadge = document.getElementById("notification-count")
  const notificationsNavItem = document.getElementById("notifications-nav-item")

  if (!notificationsNavItem) return

  if (!loggedInUser || loggedInUser.role !== "client") {
    notificationsNavItem.style.display = "none"
    if (notificationBadge) notificationBadge.textContent = ""
    return
  }

  try {
    const allNotifications = JSON.parse(localStorage.getItem("userNotifications")) || []
    const unreadCount = allNotifications.filter((n) => n.userId === loggedInUser.id && !n.read).length

    notificationsNavItem.style.display = "block"

    if (notificationBadge) {
      if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount
        notificationBadge.style.display = "inline-block"
      } else {
        notificationBadge.textContent = ""
        notificationBadge.style.display = "none"
      }
    }
  } catch (error) {
    console.error("Error updating notification badge:", error)
    notificationsNavItem.style.display = "none"
    if (notificationBadge) notificationBadge.textContent = ""
  }
}

// Event Listeners
document.addEventListener("notificationAdded", updateNotificationBadge)
document.addEventListener("notificationsMarkedRead", updateNotificationBadge)

window.addEventListener("storage", (event) => {
  console.log("Storage event detected:", event.key)
  if (event.key === "userNotifications") {
    updateNotificationBadge()
  }
  if (event.key === "recipes") {
    if (document.getElementById("recipe-list") && typeof loadRecipes === "function") {
      loadRecipes()
    }
    if (window.location.pathname.includes("favorites.html") && typeof loadFavoriteRecipes === "function") {
      loadFavoriteRecipes()
    }
  }
  if (event.key === "loggedInUser") {
    checkAuth()
  }
})
