
// Mise à jour de la barre de navigation pour inclure le lien vers la boîte de réception

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

  // Mettre à jour le badge des emails
  setTimeout(updateEmailBadge, 300) // Délai pour s'assurer que emailSystem est chargé
}

// Fonction pour mettre à jour le badge des emails
function updateEmailBadge() {
  // Rechercher le badge dans le document entier, pas seulement dans l'élément inbox-nav-item
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

  // Vérifier si emailSystem est disponible
  if (!window.emailSystem) {
    console.log("EmailSystem n'est pas encore disponible, nouvelle tentative...")
    setTimeout(updateEmailBadge, 300)
    return
  }

  try {
    // Utiliser le username comme identifiant principal
    const userIdentifier = loggedInUser.email || loggedInUser.username
    const userEmails = window.emailSystem.getUserEmails(userIdentifier)
    const unreadCount = userEmails.filter((email) => !email.read).length

    console.log(`Badge mis à jour: ${unreadCount} emails non lus pour ${userIdentifier}`)

    if (unreadCount > 0) {
      badge.textContent = unreadCount
      badge.style.display = "inline-block"
    } else {
      badge.style.display = "none"
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du badge:", error)
  }
}

// Ajouter un écouteur pour les nouveaux emails
document.addEventListener("emailSent", () => {
  console.log("Événement emailSent détecté, mise à jour du badge...")
  setTimeout(updateEmailBadge, 300)
})

// Ajouter le lien vers la boîte de réception au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM chargé, ajout du lien inbox...")
  addInboxLink()

  // Vérifier périodiquement les nouveaux emails
  setInterval(updateEmailBadge, 30000) // Toutes les 30 secondes
})

// Exposer la fonction updateEmailBadge globalement pour pouvoir l'appeler depuis d'autres scripts
window.updateEmailBadge = updateEmailBadge
