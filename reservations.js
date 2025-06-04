// 🚀 SYSTÈME DE RÉSERVATIONS AVEC JQUERY
// Version améliorée avec animations et validations

class ReservationManagerJQuery {
  constructor() {
    this.reservationForm = $("#reservation-form")
    this.guestCount = 2
    this.selectedTime = null
    this.timeSlots = [
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "19:00",
      "19:30",
      "20:00",
      "20:30",
      "21:00",
      "21:30",
      "22:00",
    ]

    if (this.reservationForm.length) {
      this.init()
    }
  }

  init() {
    console.log("Système de réservations jQuery initialisé!")
    this.setupEventListeners()
    this.generateTimeSlots()
    this.setupGuestCounter()
    this.setupFormValidation()
    this.prefillUserData()
    this.setupDateRestrictions()

    // Animation d'entrée
    this.animateFormEntrance()
  }

  setupEventListeners() {
    // Soumission du formulaire avec jQuery
    this.reservationForm.on("submit", (e) => {
      e.preventDefault()
      this.handleReservationSubmit()
    })

    // Validation en temps réel
    this.reservationForm.find("input, textarea").on("blur", (e) => {
      this.validateField($(e.target))
    })

    // Animation des champs au focus
    this.reservationForm
      .find(".form-control")
      .on("focus", function () {
        $(this).parent().addClass("animate__animated animate__pulse")
      })
      .on("blur", function () {
        $(this).parent().removeClass("animate__animated animate__pulse")
      })
  }

  generateTimeSlots() {
    const $timeSlotsContainer = $("#time-slots")
    $timeSlotsContainer.empty()

    this.timeSlots.forEach((time, index) => {
      const $slot = $(`
                <div class="time-slot" data-time="${time}">
                    <i class="fas fa-clock me-1"></i>
                    ${time}
                </div>
            `)

      // Animation d'apparition échelonnée
      $slot
        .css({
          opacity: 0,
          transform: "translateY(20px)",
        })
        .delay(index * 50)
        .animate(
          {
            opacity: 1,
          },
          300,
        )
        .css("transform", "translateY(0)")

      $slot.on("click", () => this.selectTimeSlot($slot, time))
      $timeSlotsContainer.append($slot)
    })
  }

  selectTimeSlot($slot, time) {
    // Désélectionner les autres créneaux
    $(".time-slot").removeClass("selected")

    // Sélectionner le créneau cliqué
    $slot.addClass("selected animate__animated animate__bounceIn")
    this.selectedTime = time
    $("#time").val(time)

    // Supprimer l'animation après
    setTimeout(() => {
      $slot.removeClass("animate__animated animate__bounceIn")
    }, 1000)

    // Validation
    this.validateField($("#time"))

    // Notification jQuery
    this.showNotification(`Créneau ${time} sélectionné`, "info", 2000)
  }

  setupGuestCounter() {
    const $decreaseBtn = $("#decrease-guests")
    const $increaseBtn = $("#increase-guests")
    const $display = $("#guest-display")
    const $hiddenInput = $("#guests")

    $decreaseBtn.on("click", () => {
      if (this.guestCount > 1) {
        this.guestCount--
        this.updateGuestDisplay()
        $decreaseBtn.addClass("animate__animated animate__pulse")
        setTimeout(() => $decreaseBtn.removeClass("animate__animated animate__pulse"), 600)
      }
    })

    $increaseBtn.on("click", () => {
      if (this.guestCount < 10) {
        this.guestCount++
        this.updateGuestDisplay()
        $increaseBtn.addClass("animate__animated animate__pulse")
        setTimeout(() => $increaseBtn.removeClass("animate__animated animate__pulse"), 600)
      }
    })
  }

  updateGuestDisplay() {
    const $display = $("#guest-display")
    const $hiddenInput = $("#guests")

    $display.addClass("animate__animated animate__bounceIn")
    $display.text(this.guestCount)
    $hiddenInput.val(this.guestCount)

    setTimeout(() => {
      $display.removeClass("animate__animated animate__bounceIn")
    }, 600)
  }

  setupFormValidation() {
    // Validation du nom
    $("#name").on("input", function () {
      const $this = $(this)
      const value = $this.val().trim()

      if (value.length >= 2) {
        $this.removeClass("is-invalid").addClass("is-valid")
      } else {
        $this.removeClass("is-valid").addClass("is-invalid")
      }
    })

    // Validation de l'email
    $("#email").on("input", function () {
      const $this = $(this)
      const value = $this.val()
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (emailRegex.test(value)) {
        $this.removeClass("is-invalid").addClass("is-valid")
      } else {
        $this.removeClass("is-valid").addClass("is-invalid")
      }
    })

    // Validation du téléphone
    $("#phone").on("input", function () {
      const $this = $(this)
      const value = $this.val().replace(/\s/g, "")
      const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/

      if (phoneRegex.test(value)) {
        $this.removeClass("is-invalid").addClass("is-valid")
      } else {
        $this.removeClass("is-valid").addClass("is-invalid")
      }
    })

    // Validation de la date
    $("#date").on("change", function () {
      const $this = $(this)
      const selectedDate = new Date($this.val())
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate >= today) {
        $this.removeClass("is-invalid").addClass("is-valid")
      } else {
        $this.removeClass("is-valid").addClass("is-invalid")
      }
    })
  }

  validateField($field) {
    const fieldId = $field.attr("id")
    let isValid = false

    switch (fieldId) {
      case "name":
        isValid = $field.val().trim().length >= 2
        break
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        isValid = emailRegex.test($field.val())
        break
      case "phone":
        const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
        isValid = phoneRegex.test($field.val().replace(/\s/g, ""))
        break
      case "date":
        const selectedDate = new Date($field.val())
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        isValid = selectedDate >= today
        break
      case "time":
        isValid = this.selectedTime !== null
        break
    }

    if (isValid) {
      $field.removeClass("is-invalid").addClass("is-valid")
    } else {
      $field.removeClass("is-valid").addClass("is-invalid")
    }

    return isValid
  }

  prefillUserData() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
    if (loggedInUser) {
      $("#name").val(loggedInUser.username || "")
      $("#email").val(loggedInUser.email || "")

      // Animation de pré-remplissage
      $("#name, #email").each(function () {
        if ($(this).val()) {
          $(this).addClass("animate__animated animate__fadeIn is-valid")
        }
      })
    }
  }

  setupDateRestrictions() {
    const today = new Date()
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3) // 3 mois à l'avance

    const todayStr = today.toISOString().split("T")[0]
    const maxDateStr = maxDate.toISOString().split("T")[0]

    $("#date").attr("min", todayStr).attr("max", maxDateStr)
  }

  animateFormEntrance() {
    $(".reservation-form").addClass("animate__animated animate__fadeInUp")

    // Animation échelonnée des champs
    $(".form-control").each(function (index) {
      $(this)
        .css({
          opacity: 0,
          transform: "translateX(-20px)",
        })
        .delay(index * 100)
        .animate(
          {
            opacity: 1,
          },
          500,
        )
        .css("transform", "translateX(0)")
    })
  }

  async handleReservationSubmit() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))

    if (!loggedInUser) {
      this.showNotification("Vous devez être connecté pour faire une réservation.", "danger")
      setTimeout(() => {
        window.location.href = "login.html"
      }, 1500)
      return
    }

    // Validation complète du formulaire
    if (!this.validateForm()) {
      this.showNotification("Veuillez corriger les erreurs dans le formulaire.", "warning")
      return
    }

    // Afficher l'overlay de chargement
    this.showLoadingOverlay()

    // Désactiver le bouton de soumission
    const $submitBtn = this.reservationForm.find('button[type="submit"]')
    $submitBtn.prop("disabled", true)
    $submitBtn.find(".btn-text").text("Traitement...")
    $submitBtn.find(".spinner-border").removeClass("d-none")

    try {
      // Simuler un délai de traitement
      await this.delay(2000)

      const reservationData = {
        name: $("#name").val().trim(),
        email: $("#email").val().trim(),
        phone: $("#phone").val().trim(),
        date: $("#date").val(),
        time: this.selectedTime,
        guests: this.guestCount,
        notes: $("#notes").val().trim(),
      }

      await this.addReservation(reservationData, loggedInUser.id)
    } catch (error) {
      console.error("Erreur lors de la réservation:", error)
      this.showNotification("Une erreur est survenue. Veuillez réessayer.", "danger")
    } finally {
      // Masquer l'overlay et réactiver le bouton
      this.hideLoadingOverlay()
      $submitBtn.prop("disabled", false)
      $submitBtn.find(".btn-text").text("Confirmer la Réservation")
      $submitBtn.find(".spinner-border").addClass("d-none")
    }
  }

  validateForm() {
    let isValid = true
    const fields = ["name", "email", "phone", "date"]

    fields.forEach((fieldId) => {
      const $field = $(`#${fieldId}`)
      if (!this.validateField($field)) {
        isValid = false
      }
    })

    // Vérifier le créneau horaire
    if (!this.selectedTime) {
      $("#time").addClass("is-invalid")
      isValid = false
    }

    return isValid
  }

  async addReservation(reservationData, userId) {
    const reservations = JSON.parse(localStorage.getItem("reservations")) || []

    // Vérifier les conflits
    const existingReservation = reservations.find(
      (r) =>
        String(r.userId) === String(userId) &&
        r.date === reservationData.date &&
        r.time === reservationData.time &&
        r.status !== "cancelled",
    )

    if (existingReservation) {
      throw new Error("Vous avez déjà une réservation pour cette date et heure.")
    }

    const newReservation = {
      id: Date.now(),
      userId: String(userId),
      name: reservationData.name,
      email: reservationData.email,
      phone: reservationData.phone,
      date: reservationData.date,
      time: reservationData.time,
      guests: reservationData.guests,
      notes: reservationData.notes,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    reservations.push(newReservation)
    localStorage.setItem("reservations", JSON.stringify(reservations))

    // Notifications
    this.showNotification(
      "🎉 Votre réservation a été soumise avec succès! En attente de confirmation.",
      "success",
      5000,
    )

    // Notifier les admins
    this.notifyAdmins(reservationData, newReservation)

    // Déclencher l'événement
    $(document).trigger("reservationAdded")

    // Réinitialiser le formulaire avec animation
    this.resetFormWithAnimation()
  }

  notifyAdmins(reservationData, newReservation) {
    const users = JSON.parse(localStorage.getItem("users")) || []
    const adminUsers = users.filter((u) => u.role === "admin")

    adminUsers.forEach((admin) => {
      if (window.unifiedNotificationSystem) {
        window.unifiedNotificationSystem.addNotification(
          admin.id,
          "Nouvelle réservation soumise",
          `Une nouvelle réservation a été soumise par ${reservationData.name} pour le ${newReservation.date} à ${newReservation.time}.`,
          "reservation",
        )
      }
    })
  }

  resetFormWithAnimation() {
    // Animation de sortie
    this.reservationForm.addClass("animate__animated animate__fadeOut")

    setTimeout(() => {
      // Réinitialiser le formulaire
      this.reservationForm[0].reset()
      this.selectedTime = null
      this.guestCount = 2

      // Réinitialiser les classes de validation
      this.reservationForm.find(".form-control").removeClass("is-valid is-invalid")
      $(".time-slot").removeClass("selected")
      $("#guest-display").text("2")
      $("#guests").val("2")

      // Animation d'entrée
      this.reservationForm.removeClass("animate__animated animate__fadeOut")
      this.reservationForm.addClass("animate__animated animate__fadeIn")

      setTimeout(() => {
        this.reservationForm.removeClass("animate__animated animate__fadeIn")
      }, 1000)
    }, 500)
  }

  showLoadingOverlay() {
    $("#loading-overlay").addClass("show")
  }

  hideLoadingOverlay() {
    $("#loading-overlay").removeClass("show")
  }

  showNotification(message, type = "success", duration = 3000) {
    const $notification = $(`
            <div class="alert alert-${type} alert-dismissible fade show reservation-notification">
                <i class="fas fa-${this.getIconForType(type)} me-2"></i>
                <strong>${message}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `)

    $notification.css({
      position: "fixed",
      top: "20px",
      right: "-400px",
      zIndex: 9999,
      minWidth: "350px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      borderRadius: "8px",
    })

    $("body").append($notification)
    $notification.animate({ right: "20px" }, 500)

    setTimeout(() => {
      $notification.animate({ right: "-400px" }, 500, function () {
        $(this).remove()
      })
    }, duration)
  }

  getIconForType(type) {
    const icons = {
      success: "check-circle",
      danger: "exclamation-triangle",
      warning: "exclamation-circle",
      info: "info-circle",
    }
    return icons[type] || "info-circle"
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// 🚀 FONCTION D'INITIALISATION GLOBALE
function initializeReservationSystem() {
  $(document).ready(() => {
    console.log("🎉 Initialisation du système de réservations jQuery")

    // Vérifier si on est sur la page de réservations
    if ($("#reservation-form").length) {
      window.reservationManager = new ReservationManagerJQuery()

      // Notification de bienvenue
      setTimeout(() => {
        if (window.reservationManager) {
          window.reservationManager.showNotification("Système de réservations jQuery activé! 🚀", "info", 2000)
        }
      }, 1000)
    }

    // Fonctions utilitaires globales
    window.jQueryReservation = {
      notify: (msg, type, duration) => {
        if (window.reservationManager) {
          window.reservationManager.showNotification(msg, type, duration)
        }
      },

      resetForm: () => {
        if (window.reservationManager) {
          window.reservationManager.resetFormWithAnimation()
        }
      },
    }

    console.log("✅ Système de réservations jQuery prêt!")
  })
}

// Compatibilité avec l'ancien système
document.addEventListener("DOMContentLoaded", () => {
  if (typeof $ === "undefined") {
    console.log("⚠️ jQuery non disponible, utilisation du système classique")
    // Fallback vers l'ancien ReservationManager si nécessaire
  }
})
