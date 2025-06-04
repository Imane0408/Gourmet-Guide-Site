// Mise à jour améliorée de la barre de navigation

// Fonction pour ajouter le lien vers la boîte de réception dans la barre de navigation
function addInboxLink() {
  const navbarNav = document.querySelector("#navbarNav .navbar-nav")
  if (!navbarNav) return

  // Vérifier si le lien existe déjà
  if (document.getElementById("inbox-nav-item")) return

  // Créer le nouvel élément de navigation
  const inboxNavItem = document.createElement("li")
  inboxNavItem.className = "nav-item"
  inboxNavItem.id = "inbox-nav-item"

  inboxNavItem.innerHTML = `
        <a class="nav-link" href="inbox.html">
            Messages
            <span id="email-badge" class="badge bg-danger ms-1" style="display: none;"></span>
        </a>
    `

  // Insérer avant le lien du profil si possible
  const profileLink = document.getElementById("profile-link")
  if (profileLink) {
    navbarNav.insertBefore(inboxNavItem, profileLink)
  } else {
    navbarNav.appendChild(inboxNavItem)
  }

  // Mettre à jour le badge des notifications
  setTimeout(updateNotificationBadge, 300)
}

// Fonction pour mettre à jour le badge des notifications
function updateNotificationBadge() {
  const badge = document.getElementById("email-badge")
  if (!badge) {
    console.log("Badge non trouvé dans le DOM")
    return
  }

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
  if (!loggedInUser) {
    badge.style.display = "none"
    return
  }

  // Vérifier si le système de notifications est disponible
  if (!window.unifiedNotificationSystem) {
    console.log("Système de notifications n'est pas encore disponible, nouvelle tentative...")
    setTimeout(updateNotificationBadge, 300)
    return
  }

  try {
    const userNotifications = window.unifiedNotificationSystem.getUserNotifications(loggedInUser.id)
    const unreadCount = userNotifications.filter((notification) => !notification.read).length

    console.log(`Badge mis à jour: ${unreadCount} notifications non lues pour l'utilisateur ${loggedInUser.username}`)

    if (unreadCount > 0) {
      badge.textContent = unreadCount
      badge.style.display = "inline-block"

      // Animation du badge pour attirer l'attention
      badge.style.animation = "pulse 2s infinite"
    } else {
      badge.style.display = "none"
      badge.style.animation = "none"
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du badge:", error)
  }
}

// Ajouter les styles CSS pour l'animation du badge
function addBadgeStyles() {
  const style = document.createElement("style")
  style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        #email-badge {
            transition: all 0.3s ease;
        }
    `
  document.head.appendChild(style)
}

// Ajouter un écouteur pour les nouvelles notifications
document.addEventListener("notificationAdded", () => {
  console.log("Événement notificationAdded détecté, mise à jour du badge...")
  setTimeout(updateNotificationBadge, 100)
})

document.addEventListener("notificationRead", () => {
  console.log("Événement notificationRead détecté, mise à jour du badge...")
  setTimeout(updateNotificationBadge, 100)
})

// Ajouter le lien vers la boîte de réception au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM chargé, ajout du lien inbox...")
  addBadgeStyles()
  addInboxLink()

  // Vérifier périodiquement les nouvelles notifications
  setInterval(updateNotificationBadge, 30000) // Toutes les 30 secondes
})

// Exposer la fonction updateNotificationBadge globalement
window.updateEmailBadge = updateNotificationBadge

// Fonction pour réinitialiser l'état des alertes lors de la déconnexion
function resetNotificationAlerts() {
  // Supprimer toutes les clés d'alerte de session
  const keysToRemove = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key && key.startsWith("notificationAlertShown_")) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((key) => sessionStorage.removeItem(key))

  // Supprimer toute alerte active
  const existingAlert = document.querySelector(".notification-alert-auto")
  if (existingAlert) {
    existingAlert.remove()
  }
}

// Ajouter un écouteur pour la déconnexion
document.addEventListener("DOMContentLoaded", () => {
  // Écouter les clics sur le bouton de déconnexion
  const logoutButton = document.getElementById("logout-button")
  if (logoutButton) {
    logoutButton.addEventListener("click", resetNotificationAlerts)
  }

  // Écouter l'événement de déconnexion personnalisé si il existe
  document.addEventListener("userLoggedOut", resetNotificationAlerts)
})

// Exposer la fonction globalement
window.resetNotificationAlerts = resetNotificationAlerts
