// Intégration améliorée pour l'admin avec le nouveau système de notifications

// Fonction pour déclencher les événements de notification lors des actions admin
function triggerReservationNotification(reservationId, newStatus) {
  const reservations = JSON.parse(localStorage.getItem("reservations")) || []
  const reservation = reservations.find((r) => r.id === reservationId)

  if (reservation && (newStatus === "confirmed" || newStatus === "cancelled")) {
    // Déclencher l'événement avec les détails de la réservation
    document.dispatchEvent(
      new CustomEvent("reservationUpdated", {
        detail: {
          reservation: {
            ...reservation,
            status: newStatus,
          },
        },
      }),
    )
  }
}

function triggerComplaintNotification(complaintId) {
  const complaints = JSON.parse(localStorage.getItem("complaints")) || []
  const complaint = complaints.find((c) => c.id === complaintId)

  if (complaint && complaint.replied) {
    // Déclencher l'événement avec les détails de la réclamation
    document.dispatchEvent(
      new CustomEvent("complaintReplied", {
        detail: {
          complaint: complaint,
        },
      }),
    )
  }
}

// Intercepter les fonctions admin existantes
document.addEventListener("DOMContentLoaded", () => {
  // Intercepter la mise à jour du statut de réservation
  const originalUpdateReservationStatus = window.updateReservationStatus
  if (originalUpdateReservationStatus) {
    window.updateReservationStatus = (id, status) => {
      // Appeler la fonction originale
      originalUpdateReservationStatus(id, status)

      // Déclencher la notification
      setTimeout(() => {
        triggerReservationNotification(id, status)
      }, 100)
    }
  }

  // Intercepter la soumission du formulaire de réponse aux réclamations
  const complaintReplyForm = document.getElementById("complaint-reply-form")
  if (complaintReplyForm) {
    complaintReplyForm.addEventListener("submit", (e) => {
      const complaintId = Number.parseInt(document.getElementById("complaintReplyFormHiddenId").value)

      // Attendre que la réponse soit sauvegardée
      setTimeout(() => {
        triggerComplaintNotification(complaintId)
      }, 500)
    })
  }
})
