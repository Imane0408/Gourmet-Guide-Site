// Ce fichier ajoute des fonctionnalités d'email à admin.js sans le modifier

// Fonction originale de mise à jour du statut de réservation
const originalUpdateReservationStatus = window.updateReservationStatus

// Remplacer par une version qui envoie également un email
window.updateReservationStatus = (id, status) => {
  // Appeler la fonction originale
  originalUpdateReservationStatus(id, status)

  // Envoyer un email si le statut est confirmé ou annulé
  if (status === "confirmed" || status === "cancelled") {
    const reservations = JSON.parse(localStorage.getItem("reservations")) || []
    const reservation = reservations.find((r) => r.id === id)

    if (reservation) {
      // Chercher l'utilisateur par email OU par username
      const users = JSON.parse(localStorage.getItem("users")) || []
      const clientUser = users.find((u) => u.email === reservation.email || u.username === reservation.email)

      if (clientUser) {
        // Utiliser le username comme identifiant d'email
        const emailAddress = clientUser.email || clientUser.username

        // Déclencher un événement pour le système d'email
        document.dispatchEvent(
          new CustomEvent("reservationUpdated", {
            detail: {
              reservation: {
                ...reservation,
                email: emailAddress, // Utiliser l'email ou username de l'utilisateur
              },
            },
          }),
        )

        // Mettre à jour le badge après un court délai
        setTimeout(() => {
          if (window.updateEmailBadge) {
            window.updateEmailBadge()
          }
        }, 500)
      }
    }
  }
}

// Ajouter une fonction pour répondre aux réclamations avec email
document.addEventListener("DOMContentLoaded", () => {
  const complaintReplyForm = document.getElementById("complaint-reply-form")

  if (complaintReplyForm) {
    // Sauvegarder le gestionnaire d'événements original
    const originalSubmitHandler = complaintReplyForm.onsubmit

    // Remplacer par un nouveau gestionnaire qui envoie également un email
    complaintReplyForm.addEventListener(
      "submit",
      (e) => {
        // Ne pas empêcher le comportement par défaut pour que le gestionnaire original fonctionne

        const complaintId = Number.parseInt(document.getElementById("complaintReplyFormHiddenId").value)
        const replyText = document.getElementById("complaintReplyText").value.trim()

        if (replyText) {
          // Attendre un court instant pour que la mise à jour de la réclamation soit terminée
          setTimeout(() => {
            const complaints = JSON.parse(localStorage.getItem("complaints")) || []
            const complaint = complaints.find((c) => c.id === complaintId)

            if (complaint && complaint.replied) {
              // Chercher l'utilisateur par email OU par username
              const users = JSON.parse(localStorage.getItem("users")) || []
              const clientUser = users.find((u) => u.email === complaint.email || u.username === complaint.email)

              if (clientUser) {
                // Utiliser le username comme identifiant d'email
                const emailAddress = clientUser.email || clientUser.username

                // Déclencher un événement pour le système d'email
                document.dispatchEvent(
                  new CustomEvent("complaintReplied", {
                    detail: {
                      complaint: {
                        ...complaint,
                        email: emailAddress, // Utiliser l'email ou username de l'utilisateur
                      },
                    },
                  }),
                )

                // Mettre à jour le badge après un court délai
                setTimeout(() => {
                  if (window.updateEmailBadge) {
                    window.updateEmailBadge()
                  }
                }, 300)
              }
            }
          }, 300)
        }
      },
      false,
    )
  }
})
