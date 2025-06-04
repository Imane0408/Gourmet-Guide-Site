// Système de notification par email simulé
// Dans un environnement réel, ceci serait remplacé par un vrai service d'envoi d'emails

class EmailNotificationSystem {
  constructor() {
    this.storageKey = "emailNotifications"
    this.init()
    console.log("EmailNotificationSystem initialisé")
  }

  init() {
    // Initialiser le stockage des emails si nécessaire
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]))
    }

    // Ajouter des écouteurs pour les événements de réservation et réclamation
    document.addEventListener("reservationUpdated", this.handleReservationUpdate.bind(this))
    document.addEventListener("complaintReplied", this.handleComplaintReply.bind(this))

    // Vérifier les nouveaux emails au chargement
    document.addEventListener("DOMContentLoaded", () => {
      this.checkForNewEmails()
    })
  }

  // Gérer les mises à jour de réservation
  handleReservationUpdate(event) {
    if (event.detail && event.detail.reservation) {
      const reservation = event.detail.reservation
      if (reservation.status === "confirmed" || reservation.status === "cancelled") {
        const title = reservation.status === "confirmed" ? "Réservation Confirmée" : "Réservation Annulée"
        const message = `Bonjour,\n\nVotre réservation pour ${reservation.guests} personne(s) le ${reservation.date} à ${reservation.time} a été ${reservation.status === "confirmed" ? "confirmée" : "annulée"}.\n\nMerci de votre confiance,\nL'équipe Gourmet Guide`

        this.sendEmail(reservation.email, title, message)
      }
    }
  }

  // Gérer les réponses aux réclamations
  handleComplaintReply(event) {
    if (event.detail && event.detail.complaint) {
      const complaint = event.detail.complaint
      const title = `Réponse à votre réclamation: ${complaint.subject}`
      const message = `Bonjour ${complaint.name},\n\nNous avons répondu à votre réclamation concernant "${complaint.subject}".\n\nNotre réponse:\n${complaint.reply}\n\nMerci de votre patience,\nL'équipe Gourmet Guide`

      this.sendEmail(complaint.email, title, message)
    }
  }

  // Envoyer un email (simulé)
  sendEmail(to, subject, message) {
    try {
      const emails = this.getAllEmails()
      const newEmail = {
        id: Date.now(),
        to: to,
        subject: subject,
        message: message,
        timestamp: new Date().toISOString(),
        read: false,
      }

      emails.push(newEmail)
      localStorage.setItem(this.storageKey, JSON.stringify(emails))

      console.log(`Email envoyé à ${to}: ${subject}`)
      console.log("Nouvel email créé:", newEmail)

      // Déclencher un événement pour informer l'interface utilisateur
      document.dispatchEvent(
        new CustomEvent("emailSent", {
          detail: { email: newEmail },
        }),
      )

      // Debug pour vérifier
      this.debugEmails()

      return true
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error)
      return false
    }
  }

  // Récupérer tous les emails
  getAllEmails() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || []
    } catch (error) {
      console.error("Erreur lors de la récupération des emails:", error)
      return []
    }
  }

  // Récupérer les emails d'un utilisateur spécifique
  getUserEmails(userIdentifier) {
    try {
      const allEmails = this.getAllEmails()
      return allEmails.filter((email) => email.to === userIdentifier)
    } catch (error) {
      console.error("Erreur lors de la récupération des emails utilisateur:", error)
      return []
    }
  }

  // Fonction de debug pour vérifier les emails
  debugEmails() {
    const allEmails = this.getAllEmails()
    console.log("=== DEBUG EMAILS ===")
    console.log("Tous les emails:", allEmails)

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
    if (loggedInUser) {
      const userIdentifier = loggedInUser.email || loggedInUser.username
      console.log("Utilisateur connecté:", userIdentifier)
      const userEmails = this.getUserEmails(userIdentifier)
      console.log("Emails de l'utilisateur:", userEmails)
    }
    console.log("===================")
  }

  // Marquer un email comme lu
  markAsRead(emailId) {
    try {
      const emails = this.getAllEmails()
      const emailIndex = emails.findIndex((email) => email.id === emailId)

      if (emailIndex !== -1) {
        emails[emailIndex].read = true
        localStorage.setItem(this.storageKey, JSON.stringify(emails))

        // Déclencher un événement pour mettre à jour l'interface
        document.dispatchEvent(new CustomEvent("emailRead"))

        return true
      }
      return false
    } catch (error) {
      console.error("Erreur lors du marquage de l'email:", error)
      return false
    }
  }

  // Vérifier les nouveaux emails pour l'utilisateur connecté
  checkForNewEmails() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
    if (!loggedInUser) return

    // Utiliser le username comme identifiant principal
    const userIdentifier = loggedInUser.email || loggedInUser.username
    const userEmails = this.getUserEmails(userIdentifier)
    const unreadCount = userEmails.filter((email) => !email.read).length

    if (unreadCount > 0) {
      this.showEmailNotification(unreadCount)
    }
  }

  // Afficher une notification pour les nouveaux emails
  showEmailNotification(count) {
    const notification = document.createElement("div")
    notification.className = "alert alert-info alert-dismissible fade show fixed-top mx-auto mt-3"
    notification.setAttribute("role", "alert")
    notification.style.width = "fit-content"
    notification.style.maxWidth = "80%"
    notification.style.zIndex = "1100"
    notification.innerHTML = `
      <strong>Vous avez ${count} nouveau(x) message(s)!</strong>
      <p>Consultez votre boîte de réception pour plus de détails.</p>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `

    document.body.appendChild(notification)

    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 5000)

    // Mettre à jour le badge
    if (window.updateEmailBadge) {
      window.updateEmailBadge()
    }
  }
}

// Initialiser le système de notification par email
window.emailSystem = new EmailNotificationSystem()

// Ajouter un écouteur pour mettre à jour le badge quand un email est lu
document.addEventListener("emailRead", () => {
  if (window.updateEmailBadge) {
    window.updateEmailBadge()
  }
})
