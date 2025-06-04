// 🚀 ADDON JQUERY EXPRESS POUR TOUTES VOS PAGES
// Copiez-collez ce code dans n'importe quel fichier JS

;(() => {
  // ⚡ CHARGEMENT AUTOMATIQUE DE JQUERY
  function loadJQuery(callback) {
    if (typeof $ !== "undefined") {
      callback()
    } else {
      console.log("⚡ Chargement automatique de jQuery...")
      const script = document.createElement("script")
      script.src = "https://code.jquery.com/jquery-3.7.1.min.js"
      script.onload = () => {
        console.log("✅ jQuery chargé avec succès!")
        callback()
      }
      document.head.appendChild(script)
    }
  }

  // 🎯 FONCTIONS JQUERY UNIVERSELLES
  loadJQuery(() => {
    $(document).ready(() => {
      console.log("🎉 jQuery Express activé!")

      // 🔔 NOTIFICATION UNIVERSELLE
      window.jNotify = (message, type = "success", duration = 3000) => {
        const $notification = $(`
                    <div class="alert alert-${type} alert-dismissible fade show jquery-notification">
                        <i class="fas fa-${getNotificationIcon(type)} me-2"></i>
                        <strong>${message}</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                `)

        $notification.css({
          position: "fixed",
          top: "20px",
          right: "-400px",
          zIndex: 9999,
          minWidth: "300px",
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

      function getNotificationIcon(type) {
        const icons = {
          success: "check-circle",
          danger: "exclamation-triangle",
          warning: "exclamation-circle",
          info: "info-circle",
        }
        return icons[type] || "info-circle"
      }

      // 🎭 ANIMATIONS UNIVERSELLES
      $.fn.pulseOnClick = function () {
        return this.on("click", function () {
          $(this).addClass("animate__animated animate__pulse")
          setTimeout(() => {
            $(this).removeClass("animate__animated animate__pulse")
          }, 600)
        })
      }

      $.fn.bounceIn = function () {
        return this.addClass("animate__animated animate__bounceIn")
      }

      $.fn.fadeInUp = function () {
        return this.addClass("animate__animated animate__fadeInUp")
      }

      // 🔍 RECHERCHE UNIVERSELLE
      $(".search-input, #search-input").on("input", function () {
        const term = $(this).val().toLowerCase()
        $(".searchable-item, .recipe-card").each(function () {
          const text = $(this).text().toLowerCase()
          if (text.includes(term)) {
            $(this).fadeIn(200)
          } else {
            $(this).fadeOut(200)
          }
        })
      })

      // ❤️ FAVORIS UNIVERSELS
      $(document).on("click", ".favorite-btn, .toggle-favorite", function () {
        const $btn = $(this)
        $btn.pulseOnClick()

        setTimeout(() => {
          $btn.toggleClass("favorited")
          if ($btn.hasClass("favorited")) {
            $btn.find("i").removeClass("far").addClass("fas text-danger")
            window.jNotify("Ajouté aux favoris!", "success")
          } else {
            $btn.find("i").removeClass("fas text-danger").addClass("far")
            window.jNotify("Retiré des favoris", "info")
          }
        }, 300)
      })

      // 📱 HELPERS RESPONSIVES
      window.jQueryHelpers = {
        isMobile: () => $(window).width() <= 768,
        isTablet: () => $(window).width() <= 1024 && $(window).width() > 768,
        isDesktop: () => $(window).width() > 1024,

        onMobile: (callback) => {
          if (window.jQueryHelpers.isMobile()) callback()
        },

        onDesktop: (callback) => {
          if (window.jQueryHelpers.isDesktop()) callback()
        },

        smoothScroll: (target, offset = 70) => {
          $("html, body").animate(
            {
              scrollTop: $(target).offset().top - offset,
            },
            800,
          )
        },
      }

      // 🔄 AMÉLIORER LES FONCTIONS EXISTANTES
      if (typeof window.showNotification === "function") {
        const originalShowNotification = window.showNotification
        window.showNotification = (message, type) => {
          window.jNotify(message, type)
        }
      }

      // 🎯 AUTO-INITIALISATION
      $(".btn").pulseOnClick()

      // 📊 COMPTEURS ANIMÉS
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

      // 🔧 VALIDATION DE FORMULAIRE UNIVERSELLE
      $("form").on("submit", function (e) {
        let isValid = true

        $(this)
          .find("[required]")
          .each(function () {
            const $field = $(this)
            if (!$field.val().trim()) {
              $field.addClass("is-invalid").focus()
              isValid = false
              return false
            } else {
              $field.removeClass("is-invalid").addClass("is-valid")
            }
          })

        if (!isValid) {
          e.preventDefault()
          window.jNotify("Veuillez remplir tous les champs requis", "danger")
        }
      })

      console.log("✅ jQuery Express prêt à l'emploi!")
    })
  })
})()
