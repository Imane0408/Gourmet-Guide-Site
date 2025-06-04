// Système de notifications corrigé et simplifié
class NotificationManager {
  constructor() {
    this.storageKey = "userNotifications"
    this.init()
  }

  init() {
    this.updateNotificationBadge()
    this.setupEventListeners()
  }

  // Ajouter une notification
  addNotification(userId, title, message, type = "info") {
    try {
      const notifications = this.getAllNotifications()
      const newNotification = {
        id: Date.now(),
        userId: String(userId),
        title: title,
        message: message,
        type: type,
        timestamp: new Date().toISOString(),
        read: false,
      }

      notifications.push(newNotification)
      localStorage.setItem(this.storageKey, JSON.stringify(notifications))

      this.updateNotificationBadge()
      document.dispatchEvent(new CustomEvent("notificationAdded"))

      return true
    } catch (error) {
      console.error("Erreur lors de l'ajout de la notification:", error)
      return false
    }
  }

  // Récupérer toutes les notifications
  getAllNotifications() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || []
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error)
      return []
    }
  }

  // Récupérer les notifications de l'utilisateur courant
  getUserNotifications() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"))
    if (!user) return []

    const allNotifications = this.getAllNotifications()
    return allNotifications.filter((n) => n.userId === String(user.id))
  }

  // Marquer comme lu
  markAsRead(notificationId) {
    try {
      const notifications = this.getAllNotifications()
      const notification = notifications.find((n) => n.id === notificationId)

      if (notification && !notification.read) {
        notification.read = true
        localStorage.setItem(this.storageKey, JSON.stringify(notifications))
        this.updateNotificationBadge()
        return true
      }
      return false
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error)
      return false
    }
  }

  // Marquer toutes comme lues
  markAllAsRead() {
    try {
      const user = JSON.parse(localStorage.getItem("loggedInUser"))
      if (!user) return false

      const notifications = this.getAllNotifications()
      let updated = false

      notifications.forEach((notification) => {
        if (notification.userId === String(user.id) && !notification.read) {
          notification.read = true
          updated = true
        }
      })

      if (updated) {
        localStorage.setItem(this.storageKey, JSON.stringify(notifications))
        this.updateNotificationBadge()
        this.showNotification("Toutes les notifications marquées comme lues", "success")
      }

      return updated
    } catch (error) {
      console.error("Erreur lors du marquage de toutes comme lues:", error)
      return false
    }
  }

  // Supprimer une notification
  deleteNotification(notificationId) {
    try {
      const notifications = this.getAllNotifications()
      const filtered = notifications.filter((n) => n.id !== notificationId)

      localStorage.setItem(this.storageKey, JSON.stringify(filtered))
      this.updateNotificationBadge()
      this.showNotification("Notification supprimée", "info")

      return true
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      return false
    }
  }

  // Mettre à jour le badge de notification
  updateNotificationBadge() {
    const badge = document.getElementById("notification-count")
    const navItem = document.getElementById("notifications-nav-item")

    const user = JSON.parse(localStorage.getItem("loggedInUser"))

    if (!user || user.role !== "client") {
      if (navItem) navItem.style.display = "none"
      return
    }

    if (navItem) navItem.style.display = "block"

    const unreadCount = this.getUserNotifications().filter((n) => !n.read).length

    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount
        badge.style.display = "inline-block"
      } else {
        badge.textContent = ""
        badge.style.display = "none"
      }
    }
  }

  // Charger les notifications sur la page
  loadNotifications() {
    const container = document.getElementById("notifications-container")
    if (!container) return

    const notifications = this.getUserNotifications()

    if (notifications.length === 0) {
      container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Aucune notification</h5>
                    <p class="text-muted">Vous n'avez aucune notification pour le moment</p>
                </div>
            `
      return
    }

    // Trier par date (récentes en premier)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    container.innerHTML = notifications.map((notification) => this.createNotificationHTML(notification)).join("")

    this.attachNotificationEvents()
  }

  // Créer le HTML d'une notification
  createNotificationHTML(notification) {
    const date = new Date(notification.timestamp)
    const formattedDate =
      date.toLocaleDateString("fr-FR") +
      " à " +
      date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

    const typeIcons = {
      reservation: "fa-calendar-check",
      complaint: "fa-comment-dots",
      info: "fa-info-circle",
      success: "fa-check-circle",
      warning: "fa-exclamation-triangle",
    }

    const typeColors = {
      reservation: "text-success",
      complaint: "text-warning",
      info: "text-primary",
      success: "text-success",
      warning: "text-warning",
    }

    const icon = typeIcons[notification.type] || "fa-bell"
    const color = typeColors[notification.type] || "text-secondary"

    return `
            <div class="list-group-item ${!notification.read ? "list-group-item-primary" : ""}" 
                 data-notification-id="${notification.id}">
                <div class="d-flex gap-3 w-100">
                    <div class="${color} mt-1">
                        <i class="fas ${icon} fa-lg"></i>
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between">
                            <h6 class="mb-1 ${!notification.read ? "fw-bold" : ""}">${notification.title}</h6>
                            <small class="text-muted">${formattedDate}</small>
                        </div>
                        <p class="mb-1">${notification.message}</p>
                    </div>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-2">
                    ${
                      !notification.read
                        ? `<button class="btn btn-sm btn-outline-success mark-read-btn" 
                               data-id="${notification.id}">
                        <i class="fas fa-check"></i> Marquer comme lu
                      </button>`
                        : ""
                    }
                    <button class="btn btn-sm btn-outline-danger delete-btn" 
                            data-id="${notification.id}">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `
  }

  // Attacher les événements
  attachNotificationEvents() {
    document.querySelectorAll(".mark-read-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        const notificationId = Number.parseInt(btn.dataset.id)
        this.markAsRead(notificationId)
        this.loadNotifications()
      })
    })

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        const notificationId = Number.parseInt(btn.dataset.id)
        if (confirm("Supprimer cette notification ?")) {
          this.deleteNotification(notificationId)
          this.loadNotifications()
        }
      })
    })
  }

  // Configurer les événements de la page
  setupEventListeners() {
    document.addEventListener("DOMContentLoaded", () => {
      if (document.getElementById("notifications-container")) {
        this.loadNotifications()
      }

      document.getElementById("mark-all-read-btn")?.addEventListener("click", () => {
        this.markAllAsRead()
        this.loadNotifications()
      })

      document.getElementById("clear-all-btn")?.addEventListener("click", () => {
        if (confirm("Supprimer toutes vos notifications ?")) {
          this.clearAllNotifications()
          this.loadNotifications()
        }
      })
    })

    // Écouter les événements de notification
    document.addEventListener("notificationAdded", () => {
      if (document.getElementById("notifications-container")) {
        this.loadNotifications()
      }
    })
  }

  // Supprimer toutes les notifications
  clearAllNotifications() {
    try {
      const user = JSON.parse(localStorage.getItem("loggedInUser"))
      if (!user) return false

      const notifications = this.getAllNotifications()
      const filtered = notifications.filter((n) => n.userId !== String(user.id))

      localStorage.setItem(this.storageKey, JSON.stringify(filtered))
      this.updateNotificationBadge()
      this.showNotification("Toutes les notifications ont été supprimées", "info")

      return true
    } catch (error) {
      console.error("Erreur lors de la suppression de toutes:", error)
      return false
    }
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
    }, 5000)
  }
}

// Initialiser le gestionnaire de notifications
window.notificationManager = new NotificationManager()

// Fonction globale pour ajouter des notifications
window.addUserNotification = (userId, title, message, type = "info") => {
  return window.notificationManager.addNotification(userId, title, message, type)
}
