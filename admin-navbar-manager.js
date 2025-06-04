// 🔧 GESTIONNAIRE DE NAVIGATION ADMIN UNIFIÉ ET ROBUSTE
// Ce script force une navigation identique sur TOUTES les pages admin

$(document).ready(() => {
  console.log("🔧 Gestionnaire de navigation admin unifié initialisé")

  // Détecter si l'utilisateur est admin
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))

  if (loggedInUser && loggedInUser.role === "admin") {
    console.log("👨‍💼 Utilisateur admin détecté - Configuration de la navigation unifiée")

    // Forcer le remplacement après un court délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
      forceAdminNavigation()
    }, 100)
  }
})

function forceAdminNavigation() {
  // Obtenir la page actuelle
  const currentPage = window.location.pathname.split("/").pop()
  console.log(`📄 Page actuelle: ${currentPage}`)

  // Créer la structure de navigation admin unifiée COMPLÈTE
  const adminNavStructure = `
    <ul class="navbar-nav me-auto">
      <li class="nav-item">
        <a class="nav-link ${currentPage === "index.html" ? "active" : ""}" href="index.html">
          <i class="fas fa-home me-1"></i>Accueil
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${currentPage === "about.html" ? "active" : ""}" href="about.html">
          <i class="fas fa-info-circle me-1"></i>À propos
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${currentPage === "admin_dashboard.html" ? "active" : ""}" href="admin_dashboard.html">
          <i class="fas fa-tachometer-alt me-1"></i>Dashboard
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${currentPage === "manage_users.html" ? "active" : ""}" href="manage_users.html">
          <i class="fas fa-users me-1"></i>Gestion Utilisateurs
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${currentPage === "recipes.html" ? "active" : ""}" href="recipes.html">
          <i class="fas fa-utensils me-1"></i>Gestion Recettes
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${getMenuActiveClass()}" href="${getMenuLink()}">
          <i class="fas fa-clipboard-list me-1"></i>Gestion Menu
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${getComplaintsActiveClass()}" href="${getComplaintsLink()}">
          <i class="fas fa-comment-dots me-1"></i>Réclamations
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${currentPage === "inbox.html" ? "active" : ""}" href="inbox.html">
          <i class="fas fa-envelope me-1"></i>Messages
          <span id="email-badge" class="badge bg-danger ms-1" style="display: none;"></span>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${currentPage === "profile.html" ? "active" : ""}" href="profile.html">
          <i class="fas fa-user me-1"></i>Profil
        </a>
      </li>
    </ul>
  `

  // Trouver et remplacer la navigation - essayer plusieurs sélecteurs
  const possibleSelectors = ["#navbarNav .navbar-nav", ".navbar-nav", "#navbarNav ul", ".navbar-collapse .navbar-nav"]

  let navbarNav = null
  for (const selector of possibleSelectors) {
    navbarNav = document.querySelector(selector)
    if (navbarNav) {
      console.log(`✅ Navigation trouvée avec le sélecteur: ${selector}`)
      break
    }
  }

  if (navbarNav) {
    navbarNav.outerHTML = adminNavStructure
    console.log("✅ Navigation admin unifiée mise en place")

    // Réinitialiser les événements après le remplacement
    setTimeout(() => {
      setupAdminNavEvents()
    }, 100)
  } else {
    console.error("❌ Impossible de trouver l'élément de navigation")

    // Essayer de créer la navigation si elle n'existe pas
    const navbarCollapse = document.querySelector("#navbarNav") || document.querySelector(".navbar-collapse")
    if (navbarCollapse) {
      navbarCollapse.innerHTML =
        adminNavStructure +
        `
        <div class="d-flex">
          <button class="btn btn-outline-light" id="logout-button">Déconnexion</button>
        </div>
      `
      console.log("✅ Navigation admin créée de force")
      setupAdminNavEvents()
    }
  }
}

// Fonction pour déterminer le lien du menu selon la page actuelle
function getMenuLink() {
  const currentPage = window.location.pathname.split("/").pop()

  if (currentPage === "admin_dashboard.html") {
    return "#menu-section"
  } else {
    return "admin_dashboard.html#menu-section"
  }
}

// Fonction pour déterminer le lien des réclamations selon la page actuelle
function getComplaintsLink() {
  const currentPage = window.location.pathname.split("/").pop()

  if (currentPage === "admin_dashboard.html") {
    return "#complaints-section"
  } else {
    return "admin_dashboard.html#complaints-section"
  }
}

// Fonction pour déterminer si le lien menu est actif
function getMenuActiveClass() {
  const currentPage = window.location.pathname.split("/").pop()
  const hash = window.location.hash

  if (currentPage === "admin_dashboard.html" && hash === "#menu-section") {
    return "active"
  }
  return ""
}

// Fonction pour déterminer si le lien réclamations est actif
function getComplaintsActiveClass() {
  const currentPage = window.location.pathname.split("/").pop()
  const hash = window.location.hash

  if (currentPage === "admin_dashboard.html" && hash === "#complaints-section") {
    return "active"
  }
  return ""
}

function setupAdminNavEvents() {
  // Animation au survol des liens
  $(".navbar-nav .nav-link").hover(
    function () {
      $(this).addClass("animate__animated animate__pulse")
    },
    function () {
      $(this).removeClass("animate__animated animate__pulse")
    },
  )

  // Gestion des clics sur les liens internes (Menu et Réclamations)
  $('a[href^="#"]').on("click", function (e) {
    const target = $(this.getAttribute("href"))
    if (target.length) {
      e.preventDefault()
      $("html, body").animate(
        {
          scrollTop: target.offset().top - 100,
        },
        800,
      )

      // Mettre à jour la classe active
      $(".navbar-nav .nav-link").removeClass("active")
      $(this).addClass("active")
    }
  })

  // Gestion des liens vers dashboard avec ancre
  $('a[href^="admin_dashboard.html#"]').on("click", function (e) {
    const href = $(this).attr("href")
    const hash = href.split("#")[1]

    // Si on est déjà sur le dashboard, juste scroller
    if (window.location.pathname.includes("admin_dashboard.html")) {
      e.preventDefault()
      const target = $("#" + hash)
      if (target.length) {
        $("html, body").animate(
          {
            scrollTop: target.offset().top - 100,
          },
          800,
        )
      }
    }
    // Sinon, laisser le navigateur aller à la page avec l'ancre
  })

  // Mise à jour du badge de messages
  updateMessageBadge()

  // Écouter les changements de notifications
  $(document).on("notificationAdded", updateMessageBadge)
  $(document).on("notificationRead", updateMessageBadge)

  // Mettre à jour les liens actifs selon l'ancre actuelle
  updateActiveLinksBasedOnHash()

  // Gérer le bouton de déconnexion
  setupLogoutButton()
}

// Fonction pour gérer le bouton de déconnexion
function setupLogoutButton() {
  const logoutButton = document.getElementById("logout-button")
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser")
      window.location.href = "login.html"
    })
  }
}

// Fonction pour mettre à jour les liens actifs selon l'ancre
function updateActiveLinksBasedOnHash() {
  const hash = window.location.hash

  if (hash === "#menu-section") {
    $(".navbar-nav .nav-link").removeClass("active")
    $('a[href*="menu-section"]').addClass("active")
  } else if (hash === "#complaints-section") {
    $(".navbar-nav .nav-link").removeClass("active")
    $('a[href*="complaints-section"]').addClass("active")
  }
}

// Écouter les changements d'ancre
$(window).on("hashchange", () => {
  updateActiveLinksBasedOnHash()
})

function updateMessageBadge() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
  const $badge = $("#email-badge")

  if (!loggedInUser || loggedInUser.role !== "admin") {
    $badge.hide()
    return
  }

  // Vérifier les notifications non lues pour l'admin
  if (window.unifiedNotificationSystem) {
    try {
      const adminNotifications = window.unifiedNotificationSystem.getUserNotifications(loggedInUser.id)
      const unreadCount = adminNotifications.filter((n) => !n.read).length

      if (unreadCount > 0) {
        $badge.text(unreadCount).show()
        $badge.addClass("animate__animated animate__pulse")
      } else {
        $badge.hide()
        $badge.removeClass("animate__animated animate__pulse")
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du badge:", error)
    }
  }
}

// Exposer les fonctions globalement
window.forceAdminNavigation = forceAdminNavigation
window.updateMessageBadge = updateMessageBadge

// Forcer le remplacement si la page change dynamiquement
if (typeof MutationObserver !== "undefined") {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
        if (loggedInUser && loggedInUser.role === "admin") {
          // Vérifier si la navigation a été modifiée
          const navLinks = document.querySelectorAll(".navbar-nav .nav-link")
          const hasAdminNav = Array.from(navLinks).some(
            (link) => link.textContent.includes("Dashboard") || link.textContent.includes("Gestion Utilisateurs"),
          )

          if (!hasAdminNav) {
            console.log("🔄 Navigation modifiée détectée, re-application de la navigation admin")
            setTimeout(forceAdminNavigation, 100)
          }
        }
      }
    })
  })

  // Observer les changements dans la navigation
  const navbarElement = document.querySelector(".navbar") || document.querySelector("header")
  if (navbarElement) {
    observer.observe(navbarElement, {
      childList: true,
      subtree: true,
    })
  }
}
