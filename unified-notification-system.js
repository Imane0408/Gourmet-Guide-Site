// Système unifié de notifications pour résoudre les problèmes de correspondance utilisateur
class UnifiedNotificationSystem {
  constructor() {
    this.storageKey = "unifiedNotifications"
    this.init()
    console.log("UnifiedNotificationSystem initialisé")
  }

  init() {
    // Initialiser le stockage si nécessaire
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]))
    }

    // Écouter les événements
    document.addEventListener("reservationUpdated", this.handleReservationUpdate.bind(this))
    document.addEventListener("complaintReplied", this.handleComplaintReply.bind(this))

    // Vérifier les notifications au chargement
    document.addEventListener("DOMContentLoaded", () => {
      this.checkForNewNotifications()
    })
  }

  // Trouver un utilisateur par email OU username
  findUserByIdentifier(identifier) {
    const users = JSON.parse(localStorage.getItem("users")) || []
    return users.find((user) => user.email === identifier || user.username === identifier)
  }

  // Gérer les mises à jour de réservation
  handleReservationUpdate(event) {
    if (event.detail && event.detail.reservation) {
      const reservation = event.detail.reservation
      if (reservation.status === "confirmed" || reservation.status === "cancelled") {
        // Trouver l'utilisateur correspondant
        const clientUser = this.findUserByIdentifier(reservation.email)

        if (clientUser) {
          const title = reservation.status === "confirmed" ? "Réservation Confirmée" : "Réservation Annulée"
          const message = `Votre réservation pour ${reservation.guests} personne(s) le ${reservation.date} à ${reservation.time} a été ${reservation.status === "confirmed" ? "confirmée" : "annulée"}.`

          this.addNotification(clientUser.id, title, message, "reservation")
          console.log(`Notification de réservation envoyée à l'utilisateur ${clientUser.username}`)
        } else {
          console.warn(`Utilisateur non trouvé pour l'identifiant: ${reservation.email}`)
        }
      }
    }
  }

  // Gérer les réponses aux réclamations
  handleComplaintReply(event) {
    if (event.detail && event.detail.complaint) {
      const complaint = event.detail.complaint

      // Trouver l'utilisateur correspondant
      const clientUser = this.findUserByIdentifier(complaint.email)

      if (clientUser) {
        const title = `Réponse à votre réclamation: ${complaint.subject}`
        const message = `L'administrateur a répondu à votre réclamation.\n\nRéponse: ${complaint.reply}`

        this.addNotification(clientUser.id, title, message, "complaint")
        console.log(`Notification de réclamation envoyée à l'utilisateur ${clientUser.username}`)
      } else {
        console.warn(`Utilisateur non trouvé pour l'identifiant: ${complaint.email}`)
      }
    }
  }

  // Ajouter une notification
  addNotification(userId, title, message, type = "info") {
    try {
      const notifications = this.getAllNotifications()
      const newNotification = {
        id: Date.now(),
        userId: userId,
        title: title,
        message: message,
        type: type,
        timestamp: new Date().toISOString(),
        read: false,
      }

      notifications.push(newNotification)
      localStorage.setItem(this.storageKey, JSON.stringify(notifications))

      // Déclencher un événement pour mettre à jour l'interface
      document.dispatchEvent(
        new CustomEvent("notificationAdded", {
          detail: { notification: newNotification },
        }),
      )

      console.log("Notification ajoutée:", newNotification)
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

  // Récupérer les notifications d'un utilisateur
  getUserNotifications(userId) {
    try {
      const allNotifications = this.getAllNotifications()
      return allNotifications.filter((notification) => notification.userId === userId)
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications utilisateur:", error)
      return []
    }
  }

  // Marquer une notification comme lue
  markAsRead(notificationId) {
    try {
      const notifications = this.getAllNotifications()
      const notificationIndex = notifications.findIndex((n) => n.id === notificationId)

      if (notificationIndex !== -1) {
        notifications[notificationIndex].read = true
        localStorage.setItem(this.storageKey, JSON.stringify(notifications))

        // Déclencher un événement pour mettre à jour l'interface
        document.dispatchEvent(new CustomEvent("notificationRead"))
        return true
      }
      return false
    } catch (error) {
      console.error("Erreur lors du marquage de la notification:", error)
      return false
    }
  }

  // Marquer toutes les notifications d'un utilisateur comme lues
  markAllAsRead(userId) {
    try {
      const notifications = this.getAllNotifications()
      let updated = false

      notifications.forEach((notification) => {
        if (notification.userId === userId && !notification.read) {
          notification.read = true
          updated = true
        }
      })

      if (updated) {
        localStorage.setItem(this.storageKey, JSON.stringify(notifications))
        document.dispatchEvent(new CustomEvent("notificationRead"))
      }

      return updated
    } catch (error) {
      console.error("Erreur lors du marquage des notifications:", error)
      return false
    }
  }

  // Vérifier les nouvelles notifications
  checkForNewNotifications() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
    if (!loggedInUser) return

    const userNotifications = this.getUserNotifications(loggedInUser.id)
    const unreadCount = userNotifications.filter((n) => !n.read).length

    if (unreadCount > 0) {
      this.showNotificationAlert(unreadCount)
    }

    // Mettre à jour le badge
    this.updateNotificationBadge()
  }

  // Afficher une alerte pour les nouvelles notifications
  showNotificationAlert(count) {
    // Ne pas afficher d'alerte sur la page inbox pour éviter le spam
    if (window.location.pathname.includes("inbox.html")) return

    const notification = document.createElement("div")
    notification.className = "alert alert-info alert-dismissible fade show fixed-top mx-auto mt-3"
    notification.setAttribute("role", "alert")
    notification.style.width = "fit-content"
    notification.style.maxWidth = "80%"
    notification.style.zIndex = "1100"
    notification.innerHTML = `
            <strong>Vous avez ${count} nouveau(x) message(s)!</strong>
            <a href="inbox.html" class="alert-link ms-2">Voir les messages</a>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `

    document.body.appendChild(notification)

    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 5000)
  }

  // Mettre à jour le badge de notification
  updateNotificationBadge() {
    const badge = document.getElementById("email-badge")
    if (!badge) return

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
    if (!loggedInUser) {
      badge.style.display = "none"
      return
    }

    const userNotifications = this.getUserNotifications(loggedInUser.id)
    const unreadCount = userNotifications.filter((n) => !n.read).length

    if (unreadCount > 0) {
      badge.textContent = unreadCount
      badge.style.display = "inline-block"
    } else {
      badge.style.display = "none"
    }
  }
}

// Initialiser le système unifié
window.unifiedNotificationSystem = new UnifiedNotificationSystem()

// Exposer la fonction de mise à jour du badge
window.updateEmailBadge = () => {
  if (window.unifiedNotificationSystem) {
    window.unifiedNotificationSystem.updateNotificationBadge()
  }
}

// Écouter les événements pour mettre à jour le badge
document.addEventListener("notificationAdded", () => {
  if (window.unifiedNotificationSystem) {
    window.unifiedNotificationSystem.updateNotificationBadge()
  }
})

document.addEventListener("notificationRead", () => {
  if (window.unifiedNotificationSystem) {
    window.unifiedNotificationSystem.updateNotificationBadge()
  }
})
