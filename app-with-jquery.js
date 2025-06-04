// Vérification de l'authentification sur chaque page avec jQuery intégré
$(document).ready(() => {
  console.log("jQuery est chargé et prêt !")

  // Vérifier si jQuery est disponible
  if (typeof $ !== "undefined") {
    console.log("✅ jQuery version:", $.fn.jquery)

    // Ajouter des fonctionnalités jQuery à l'app existante
    initializeJQueryFeatures()
  }

  // Continuer avec les fonctions existantes
  checkAuth()
})

// Nouvelles fonctionnalités jQuery
function initializeJQueryFeatures() {
  // 1. Animation des notifications avec jQuery
  window.showNotificationWithJQuery = (message, type = "success") => {
    const $notification = $(`
      <div class="alert alert-${type} alert-dismissible fade show jquery-notification">
        <div class="d-flex align-items-center">
          <i class="fas fa-bell me-2"></i>
          <strong>${message}</strong>
          <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
      </div>
    `)

    // Styles avec jQuery
    $notification.css({
      position: "fixed",
      top: "20px",
      right: "-400px",
      "z-index": "9999",
      "min-width": "300px",
      "box-shadow": "0 4px 12px rgba(0,0,0,0.15)",
      "border-radius": "8px",
    })

    // Ajouter au DOM et animer
    $("body").append($notification)
    $notification.animate({ right: "20px" }, 500)

    // Disparition automatique
    setTimeout(() => {
      $notification.animate({ right: "-400px" }, 500, function () {
        $(this).remove()
      })
    }, 4000)
  }

  // 2. Recherche améliorée avec jQuery
  $("#search-input").on("input", function () {
    const searchTerm = $(this).val().toLowerCase()

    if (searchTerm.length > 2) {
      $(".recipe-card").each(function () {
        const $card = $(this)
        const title = $card.find(".card-title").text().toLowerCase()
        const category = $card.find(".card-text").text().toLowerCase()

        if (title.includes(searchTerm) || category.includes(searchTerm)) {
          $card.fadeIn(300)
        } else {
          $card.fadeOut(300)
        }
      })
    } else {
      $(".recipe-card").fadeIn(300)
    }
  })

  // 3. Gestion des favoris avec jQuery
  $(document).on("click", ".toggle-favorite", function () {
    const $btn = $(this)
    const recipeId = $btn.data("id")

    // Animation du bouton
    $btn.addClass("animate__animated animate__pulse")

    setTimeout(() => {
      $btn.removeClass("animate__animated animate__pulse")

      if ($btn.hasClass("btn-warning")) {
        $btn.removeClass("btn-warning").addClass("btn-outline-secondary")
        $btn.find("i").removeClass("fas").addClass("far")
        showNotificationWithJQuery("Retiré des favoris", "info")
      } else {
        $btn.removeClass("btn-outline-secondary").addClass("btn-warning")
        $btn.find("i").removeClass("far").addClass("fas")
        showNotificationWithJQuery("Ajouté aux favoris", "success")
      }
    }, 300)
  })

  // 4. Validation de formulaire avec jQuery
  $("form").on("submit", function (e) {
    const $form = $(this)
    let isValid = true

    // Vérifier les champs requis
    $form.find("[required]").each(function () {
      const $field = $(this)
      if (!$field.val().trim()) {
        $field.addClass("is-invalid")
        isValid = false
      } else {
        $field.removeClass("is-invalid").addClass("is-valid")
      }
    })

    if (!isValid) {
      e.preventDefault()
      showNotificationWithJQuery("Veuillez remplir tous les champs requis", "danger")

      // Faire défiler vers le premier champ invalide
      const $firstInvalid = $form.find(".is-invalid").first()
      if ($firstInvalid.length) {
        $("html, body").animate(
          {
            scrollTop: $firstInvalid.offset().top - 100,
          },
          500,
        )
      }
    }
  })

  // 5. Compteur animé avec jQuery
  function animateCounters() {
    $(".counter").each(function () {
      const $counter = $(this)
      const target = Number.parseInt($counter.text())

      $counter.text("0")
      $counter.animate(
        {
          countNum: target,
        },
        {
          duration: 2000,
          easing: "swing",
          step: function () {
            $counter.text(Math.floor(this.countNum))
          },
          complete: () => {
            $counter.text(target)
          },
        },
      )
    })
  }

  // 6. Tooltip et popover avec jQuery
  $('[data-bs-toggle="tooltip"]').tooltip()
  $('[data-bs-toggle="popover"]').popover()

  // 7. Smooth scroll avec jQuery
  $('a[href^="#"]').on("click", function (e) {
    e.preventDefault()
    const target = $(this.getAttribute("href"))

    if (target.length) {
      $("html, body").animate(
        {
          scrollTop: target.offset().top - 70,
        },
        1000,
      )
    }
  })

  // 8. Lazy loading des images avec jQuery
  function lazyLoadImages() {
    $(".lazy-image").each(function () {
      const $img = $(this)
      const src = $img.data("src")

      if (src && isElementInViewport($img[0])) {
        $img.attr("src", src).removeClass("lazy-image").addClass("loaded").fadeIn(500)
      }
    })
  }

  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  // Déclencher le lazy loading au scroll
  $(window).on("scroll", lazyLoadImages)
  lazyLoadImages() // Charger les images visibles immédiatement

  // 9. Gestion des modals avec jQuery
  $(".modal").on("show.bs.modal", function () {
    $(this).find(".modal-body").addClass("animate__animated animate__fadeIn")
  })

  $(".modal").on("hidden.bs.modal", function () {
    $(this).find("form")[0]?.reset()
    $(this).find(".is-invalid, .is-valid").removeClass("is-invalid is-valid")
  })

  // 10. Bouton "Retour en haut" avec jQuery
  const $backToTop = $(`
    <button id="back-to-top" class="btn btn-primary position-fixed" style="bottom: 20px; right: 20px; z-index: 1000; display: none;">
      <i class="fas fa-arrow-up"></i>
    </button>
  `)

  $("body").append($backToTop)

  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 300) {
      $backToTop.fadeIn()
    } else {
      $backToTop.fadeOut()
    }
  })

  $backToTop.on("click", () => {
    $("html, body").animate({ scrollTop: 0 }, 800)
  })

  // Exposer les fonctions globalement
  window.animateCounters = animateCounters
  window.lazyLoadImages = lazyLoadImages

  console.log("✅ Fonctionnalités jQuery initialisées avec succès !")
}

// Vérification de l'authentification sur chaque page (code existant)
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
    "manage-users.html",
    "notifications.html",
  ]

  if (protectedPages.includes(currentPage)) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"))
    if (!user) {
      window.location.href = "login.html"
      return
    }

    if (currentPage === "reservations.html" && user.role === "admin") {
      window.location.href = "admin_dashboard.html"
      if (typeof showNotificationWithJQuery !== "undefined") {
        showNotificationWithJQuery(
          "Les administrateurs confirment les réservations, ils ne peuvent pas en créer.",
          "warning",
        )
      } else {
        showNotification("Les administrateurs confirment les réservations, ils ne peuvent pas en créer.", "warning")
      }
    }
  }
}

// Fonction pour mettre à jour la barre de navigation avec jQuery
function updateNavbarForAuth() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))

  // Utiliser jQuery si disponible
  if (typeof $ !== "undefined") {
    const $loginLink = $("#login-link")
    const $registerLink = $("#register-link")
    const $logoutButton = $("#logout-button")

    if (!loggedInUser) {
      $loginLink.show()
      $registerLink.show()
      $logoutButton.hide()
    } else {
      $loginLink.hide()
      $registerLink.hide()
      $logoutButton.show()

      // Animation d'entrée pour les éléments de navigation
      $logoutButton.addClass("animate__animated animate__fadeIn")
    }
  } else {
    // Fallback vers JavaScript natif
    const loginLink = document.getElementById("login-link")
    const registerLink = document.getElementById("register-link")
    const logoutButton = document.getElementById("logout-button")

    if (!loggedInUser) {
      if (loginLink) loginLink.style.display = "block"
      if (registerLink) registerLink.style.display = "block"
      if (logoutButton) logoutButton.style.display = "none"
    } else {
      if (loginLink) loginLink.style.display = "none"
      if (registerLink) registerLink.style.display = "none"
      if (logoutButton) logoutButton.style.display = "block"
    }
  }
}

// Reste du code existant...
// (Toutes vos autres fonctions restent identiques)

// Fonction pour charger les recettes avec jQuery
function loadRecipesWithJQuery() {
  const $recipeList = $("#recipe-list")
  if (!$recipeList.length) return

  let recipes = JSON.parse(localStorage.getItem("recipes")) || []
  recipes = recipes.filter((recipe) => recipe && recipe.name && recipe.id)

  // Vider le conteneur avec animation
  $recipeList.fadeOut(300, function () {
    $(this).empty()

    // Générer le HTML des recettes
    const recipesHtml = recipes
      .map((recipe) => {
        // Votre logique de génération HTML existante
        return `
        <div class="col-md-4 mb-4 recipe-card">
          <div class="card h-100">
            <img src="${recipe.image || "images/default-recipe.jpg"}" 
                 class="card-img-top" 
                 alt="${recipe.name}"
                 style="height: 200px; object-fit: cover;">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${recipe.name}</h5>
              <p class="card-text">${recipe.category || "N/A"}</p>
              <div class="mt-auto">
                <button class="btn btn-primary view-details" data-id="${recipe.id}">
                  Voir détails
                </button>
              </div>
            </div>
          </div>
        </div>
      `
      })
      .join("")

    $(this).html(recipesHtml).fadeIn(300)

    // Ajouter des animations aux cartes
    $(".recipe-card").each(function (index) {
      $(this)
        .delay(index * 100)
        .animate(
          {
            opacity: 1,
            transform: "translateY(0)",
          },
          500,
        )
    })
  })
}

// Exposer les nouvelles fonctions
window.loadRecipesWithJQuery = loadRecipesWithJQuery
window.showNotificationWithJQuery = window.showNotificationWithJQuery || (() => {})

// Initialisation principale
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.")

  // Vérifier si jQuery est chargé
  if (typeof $ !== "undefined") {
    console.log("🎉 jQuery est disponible ! Version:", $.fn.jquery)
  } else {
    console.log("⚠️ jQuery n'est pas chargé")
  }

  // Continuer avec l'initialisation existante
  initializeDefaultData()
  checkAuth()
  cleanInvalidRecipes()

  // Load content based on current page
  if (document.getElementById("recipe-list")) {
    console.log("Loading recipes...")
    if (typeof $ !== "undefined") {
      loadRecipesWithJQuery()
    } else {
      loadRecipes()
    }
  }

  // Reste de votre code d'initialisation existant...
})

// Toutes vos autres fonctions existantes restent identiques
// (Je les ai omises pour la brièveté, mais elles doivent rester)

// Fonctions existantes (gardez-les toutes)
function loadRecipes() {
  // Votre code existant
}

function addRecipeEventHandlers() {
  // Votre code existant
}

function rateRecipe(recipeId, userId, rating) {
  // Votre code existant
}

function showRecipeDetails(recipeId) {
  // Votre code existant
}

function loadFavoriteRecipes() {
  // Votre code existant
}

function setupSearch() {
  // Votre code existant
}

function setupContactForm(form) {
  // Votre code existant
}

function setupRegisterForm(form) {
  // Votre code existant
}

function setupLoginForm(form) {
  // Votre code existant
}

function setupLogoutButton(button) {
  // Votre code existant
}

function setupProfileInfo(element) {
  // Votre code existant
}

function setupRecipeForm(form) {
  // Votre code existant
}

function redirectToRolePage(role) {
  // Votre code existant
}

function showNotification(message, type = "success") {
  // Votre code existant
}

function cleanInvalidRecipes() {
  // Votre code existant
}

function initializeDefaultData() {
  // Votre code existant
}

function addUserNotification(userId, title, message) {
  // Votre code existant
}

function updateNotificationBadge() {
  // Votre code existant
}
