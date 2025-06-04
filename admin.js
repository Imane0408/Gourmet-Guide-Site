// admin.js - Version corrigée

// Ensure showNotification is available
window.showNotification =
  window.showNotification ||
  ((message, type = "success") => {
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
  })

// Activity Log
window.addActivity =
  window.addActivity ||
  ((message) => {
    console.log("Activity:", message)
    const activityList = document.getElementById("recent-activity-list")
    if (activityList) {
      const li = document.createElement("li")
      li.className = "list-group-item"
      li.textContent = `${new Date().toLocaleTimeString()}: ${message}`
      activityList.insertBefore(li, activityList.firstChild)
      while (activityList.children.length > 10) {
        activityList.removeChild(activityList.lastChild)
      }
    }
  })

// Reservations Management
window.loadAdminReservationsTable = () => {
  const reservations = JSON.parse(localStorage.getItem("reservations")) || []
  const tbody = document.getElementById("admin-reservations-list")
  if (!tbody) return

  tbody.innerHTML = ""

  if (reservations.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Aucune réservation pour le moment.</td></tr>'
    return
  }

  reservations.sort((a, b) => new Date(b.date + "T" + b.time) - new Date(a.date + "T" + a.time))

  reservations.forEach((res) => {
    const row = `
            <tr>
                <td>${res.date}</td>
                <td>${res.time}</td>
                <td>${res.name}</td>
                <td>${res.email}</td>
                <td>${res.guests}</td>
                <td>
                    <span class="badge ${
                      res.status === "confirmed"
                        ? "bg-success"
                        : res.status === "cancelled"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                    }">
                        ${res.status === "confirmed" ? "Confirmée" : res.status === "cancelled" ? "Annulée" : "En attente"}
                    </span>
                </td>
                <td>
                    ${res.status !== "confirmed" ? `<button class="btn btn-sm btn-success me-1" onclick="updateReservationStatus(${res.id}, 'confirmed')" title="Confirmer"><i class="fas fa-check"></i></button>` : ""}
                    ${res.status !== "cancelled" ? `<button class="btn btn-sm btn-warning me-1" onclick="updateReservationStatus(${res.id}, 'cancelled')" title="Annuler"><i class="fas fa-times"></i></button>` : ""}
                    <button class="btn btn-sm btn-danger" onclick="deleteReservation(${res.id})" title="Supprimer"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `
    tbody.innerHTML += row
  })
}

window.updateReservationStatus = (id, status) => {
  const reservations = JSON.parse(localStorage.getItem("reservations")) || []
  const index = reservations.findIndex((r) => r.id === id)
  if (index !== -1) {
    const oldStatus = reservations[index].status
    reservations[index].status = status
    localStorage.setItem("reservations", JSON.stringify(reservations))
    window.addActivity(
      `Réservation de ${reservations[index].name} (${reservations[index].date}) changée de "${oldStatus}" à "${status}"`,
    )
    window.showNotification(`Réservation mise à jour: ${status}`, "info")

    // Notify client if confirming or cancelling
    if (status === "confirmed" || status === "cancelled") {
      const users = JSON.parse(localStorage.getItem("users")) || []
      // Chercher l'utilisateur par email ET par username
      const clientUser = users.find(
        (u) => u.username === reservations[index].email || u.email === reservations[index].email,
      )

      if (clientUser) {
        const title = status === "confirmed" ? "Réservation Confirmée" : "Réservation Annulée"
        const message = `Votre réservation pour ${reservations[index].guests} personne(s) le ${reservations[index].date} à ${reservations[index].time} a été ${status === "confirmed" ? "confirmée" : "annulée"}.`

        // Ajouter la notification directement
        try {
          const allNotifications = JSON.parse(localStorage.getItem("userNotifications")) || []
          const newNotification = {
            id: Date.now(),
            userId: clientUser.id,
            title: title,
            message: message,
            timestamp: new Date().toISOString(),
            read: false,
          }
          allNotifications.push(newNotification)
          localStorage.setItem("userNotifications", JSON.stringify(allNotifications))

          console.log("Notification ajoutée:", newNotification)
          document.dispatchEvent(new CustomEvent("notificationAdded"))
        } catch (error) {
          console.error("Erreur lors de l'ajout de la notification:", error)
        }
      } else {
        console.log("Utilisateur client non trouvé pour email:", reservations[index].email)
        console.log("Utilisateurs disponibles:", users)
      }
    }

    document.dispatchEvent(new CustomEvent("reservationUpdated"))
  }
}

window.deleteReservation = (id) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette réservation définitivement ?")) return

  let reservations = JSON.parse(localStorage.getItem("reservations")) || []
  const initialLength = reservations.length
  const reservationToDelete = reservations.find((r) => r.id === id)
  reservations = reservations.filter((r) => r.id !== id)

  if (reservations.length < initialLength) {
    localStorage.setItem("reservations", JSON.stringify(reservations))
    window.addActivity(`Réservation de ${reservationToDelete?.name || `ID: ${id}`} supprimée`)
    window.showNotification("Réservation supprimée avec succès!", "danger")
    document.dispatchEvent(new CustomEvent("reservationUpdated"))
  }
}

// Menu Management
let addEditMenuModalInstance = null

window.loadAdminMenuItems = () => {
  const menuData = JSON.parse(localStorage.getItem("menuData")) || {
    menuDuJour: {},
    menusSpeciaux: [],
    carte: { entrees: [], plats: [], desserts: [] },
  }

  const allMenuItems = []

  if (menuData.menuDuJour && menuData.menuDuJour.titre) {
    allMenuItems.push({
      id: "menuDuJour-0",
      type: "menuDuJour",
      name: menuData.menuDuJour.titre,
      description: menuData.menuDuJour.description || "",
      price: menuData.menuDuJour.prix || "N/A",
    })
  }

  menuData.menusSpeciaux.forEach((m, i) => {
    allMenuItems.push({
      id: `menusSpeciaux-${i}`,
      type: "menusSpeciaux",
      name: m.titre,
      description: m.description || "",
      price: m.prix || "N/A",
    })
  })
  ;["entrees", "plats", "desserts"].forEach((category) => {
    if (menuData.carte && menuData.carte[category]) {
      menuData.carte[category].forEach((item, i) => {
        allMenuItems.push({
          id: `${category}-${i}`,
          type: category,
          name: item.nom,
          description: item.description || "",
          price: item.prix || "N/A",
        })
      })
    }
  })

  const menuListBody = document.getElementById("admin-menu-list")
  if (!menuListBody) return

  menuListBody.innerHTML = ""

  if (allMenuItems.length === 0) {
    menuListBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Aucun élément de menu pour le moment.</td></tr>`
    return
  }

  allMenuItems.forEach((item) => {
    let typeDisplay = ""
    switch (item.type) {
      case "menuDuJour":
        typeDisplay = "Menu du Jour"
        break
      case "menusSpeciaux":
        typeDisplay = "Menu Spécial"
        break
      case "entrees":
        typeDisplay = "Entrée"
        break
      case "plats":
        typeDisplay = "Plat"
        break
      case "desserts":
        typeDisplay = "Dessert"
        break
      default:
        typeDisplay = item.type
    }

    const row = `
            <tr>
                <td>${item.name}</td>
                <td>${typeDisplay}</td>
                <td>${item.price}€</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-menu-item me-1" data-id="${item.id}" data-type="${item.type}" title="Modifier"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm delete-menu-item" data-id="${item.id}" data-type="${item.type}" title="Supprimer"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `
    menuListBody.insertAdjacentHTML("beforeend", row)
  })

  attachMenuActionListeners()
}

function attachMenuActionListeners() {
  if (!addEditMenuModalInstance) {
    const addEditMenuModalElement = document.getElementById("addEditMenuModal")
    if (addEditMenuModalElement) {
      addEditMenuModalInstance = new bootstrap.Modal(addEditMenuModalElement)
    }
  }
  if (!addEditMenuModalInstance) {
    console.error("Modal element #addEditMenuModal not found!")
    return
  }

  const menuForm = document.getElementById("menu-form")
  const menuItemIdInput = document.getElementById("menuItemId")
  const menuItemNameInput = document.getElementById("menuItemName")
  const menuItemDescriptionInput = document.getElementById("menuItemDescription")
  const menuItemPriceInput = document.getElementById("menuItemPrice")
  const menuItemCategorySelect = document.getElementById("menuItemCategory")
  const addEditMenuModalLabel = document.getElementById("addEditMenuModalLabel")

  document.querySelectorAll(".edit-menu-item").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id
      const type = e.currentTarget.dataset.type
      const menuData = JSON.parse(localStorage.getItem("menuData")) || {}
      let itemToEdit = null
      let index = -1

      if (type === "menuDuJour") {
        itemToEdit = menuData.menuDuJour
        index = 0
      } else if (type === "menusSpeciaux") {
        index = Number.parseInt(id.split("-")[1])
        itemToEdit = menuData.menusSpeciaux?.[index]
      } else if (menuData.carte && menuData.carte[type]) {
        index = Number.parseInt(id.split("-")[1])
        itemToEdit = menuData.carte[type]?.[index]
      }

      if (itemToEdit) {
        menuItemIdInput.value = id
        menuItemNameInput.value = itemToEdit.titre || itemToEdit.nom
        menuItemDescriptionInput.value = itemToEdit.description || ""
        menuItemPriceInput.value = itemToEdit.prix || ""
        menuItemCategorySelect.value = type
        menuItemCategorySelect.disabled = true
        addEditMenuModalLabel.textContent = "Modifier l'Élément de Menu"
        addEditMenuModalInstance.show()
      } else {
        showNotification("Erreur: Élément de menu non trouvé.", "danger")
      }
    })
  })

  document.querySelectorAll(".delete-menu-item").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id
      const type = e.currentTarget.dataset.type
      if (confirm("Êtes-vous sûr de vouloir supprimer cet élément du menu ?")) {
        const menuData = JSON.parse(localStorage.getItem("menuData")) || {}
        let itemDeleted = false
        let itemName = ""

        if (type === "menuDuJour") {
          if (menuData.menuDuJour && menuData.menuDuJour.titre) {
            itemName = menuData.menuDuJour.titre
            menuData.menuDuJour = {}
            itemDeleted = true
          }
        } else if (type === "menusSpeciaux") {
          const index = Number.parseInt(id.split("-")[1])
          if (menuData.menusSpeciaux?.[index]) {
            itemName = menuData.menusSpeciaux[index].titre
            menuData.menusSpeciaux.splice(index, 1)
            itemDeleted = true
          }
        } else if (menuData.carte && menuData.carte[type]) {
          const index = Number.parseInt(id.split("-")[1])
          if (menuData.carte[type]?.[index]) {
            itemName = menuData.carte[type][index].nom
            menuData.carte[type].splice(index, 1)
            itemDeleted = true
          }
        }

        if (itemDeleted) {
          localStorage.setItem("menuData", JSON.stringify(menuData))
          window.addActivity(`Élément de menu "${itemName}" (${type}) supprimé`)
          window.showNotification("Élément de menu supprimé!", "success")
          window.loadAdminMenuItems()
          document.dispatchEvent(new CustomEvent("menuUpdated"))
        } else {
          window.showNotification("Erreur lors de la suppression.", "danger")
        }
      }
    })
  })
}

function setupMenuModalAndForm() {
  if (!addEditMenuModalInstance) {
    const addEditMenuModalElement = document.getElementById("addEditMenuModal")
    if (addEditMenuModalElement) {
      addEditMenuModalInstance = new bootstrap.Modal(addEditMenuModalElement)
    } else {
      console.error("Modal element #addEditMenuModal not found! Cannot setup menu management.")
      return
    }
  }

  const menuForm = document.getElementById("menu-form")
  const menuItemIdInput = document.getElementById("menuItemId")
  const menuItemNameInput = document.getElementById("menuItemName")
  const menuItemDescriptionInput = document.getElementById("menuItemDescription")
  const menuItemPriceInput = document.getElementById("menuItemPrice")
  const menuItemCategorySelect = document.getElementById("menuItemCategory")
  const addEditMenuModalLabel = document.getElementById("addEditMenuModalLabel")
  const addMenuItemBtn = document.getElementById("add-menu-item-btn")

  if (addMenuItemBtn) {
    addMenuItemBtn.addEventListener("click", () => {
      if (!addEditMenuModalInstance) {
        console.error("Modal instance not available for Add button.")
        return
      }
      addEditMenuModalLabel.textContent = "Ajouter un Élément de Menu"
      menuItemIdInput.value = ""
      menuForm.reset()
      menuItemCategorySelect.disabled = false
      addEditMenuModalInstance.show()
    })
  } else {
    console.error("Add Menu Item button #add-menu-item-btn not found!")
  }

  if (menuForm) {
    menuForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const id = menuItemIdInput.value
      const name = menuItemNameInput.value
      const description = menuItemDescriptionInput.value
      const price = Number.parseFloat(menuItemPriceInput.value)
      const category = menuItemCategorySelect.value

      if (!name || isNaN(price) || !category) {
        showNotification("Veuillez remplir nom, prix (nombre valide) et catégorie.", "danger")
        return
      }

      const menuData = JSON.parse(localStorage.getItem("menuData")) || {
        menuDuJour: {},
        menusSpeciaux: [],
        carte: { entrees: [], plats: [], desserts: [] },
      }

      let successMessage = ""
      if (id) {
        const type = category
        if (type === "menuDuJour") {
          menuData.menuDuJour = { titre: name, description: description, prix: price }
          window.addActivity(`Menu du Jour mis à jour: ${name}`)
        } else if (type === "menusSpeciaux") {
          const index = Number.parseInt(id.split("-")[1])
          if (menuData.menusSpeciaux?.[index]) {
            menuData.menusSpeciaux[index] = { titre: name, description: description, prix: price }
            window.addActivity(`Menu Spécial mis à jour: ${name}`)
          }
        } else if (menuData.carte && menuData.carte[type]) {
          const index = Number.parseInt(id.split("-")[1])
          if (menuData.carte[type]?.[index]) {
            menuData.carte[type][index] = { nom: name, description: description, prix: price }
            window.addActivity(`Élément "${name}" (${type}) mis à jour`)
          }
        }
        successMessage = "Élément de menu mis à jour avec succès!"
      } else {
        if (category === "menuDuJour") {
          if (menuData.menuDuJour && menuData.menuDuJour.titre) {
            showNotification("Un seul Menu du Jour peut être défini. Modifiez l'existant.", "warning")
            return
          }
          menuData.menuDuJour = { titre: name, description: description, prix: price }
          window.addActivity(`Nouveau Menu du Jour ajouté: ${name}`)
        } else if (category === "menusSpeciaux") {
          if (!menuData.menusSpeciaux) menuData.menusSpeciaux = []
          menuData.menusSpeciaux.push({ titre: name, description: description, prix: price })
          window.addActivity(`Nouveau Menu Spécial ajouté: ${name}`)
        } else {
          if (!menuData.carte) menuData.carte = {}
          if (!menuData.carte[category]) {
            menuData.carte[category] = []
          }
          menuData.carte[category].push({ nom: name, description: description, prix: price })
          window.addActivity(`Nouvel élément "${name}" ajouté à ${category}`)
        }
        successMessage = "Élément de menu ajouté avec succès!"
      }

      localStorage.setItem("menuData", JSON.stringify(menuData))
      window.showNotification(successMessage, "success")
      if (addEditMenuModalInstance) addEditMenuModalInstance.hide()
      window.loadAdminMenuItems()
      document.dispatchEvent(new CustomEvent("menuUpdated"))
    })
  } else {
    console.error("Menu form #menu-form not found!")
  }
}

// Complaints Management
window.loadAdminComplaintsTable = () => {
  const complaints = JSON.parse(localStorage.getItem("complaints")) || []
  const tbody = document.getElementById("admin-complaints-list")
  if (!tbody) return

  tbody.innerHTML = ""

  if (complaints.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucune réclamation pour le moment.</td></tr>'
    return
  }

  complaints.sort((a, b) => new Date(b.date) - new Date(a.date))

  complaints.forEach((c) => {
    const row = `
            <tr>
                <td>${new Date(c.date).toLocaleDateString()}</td>
                <td>${c.name} (${c.email})</td>
                <td>${c.subject}</td>
                <td>
                    <span class="badge ${c.replied ? "bg-success" : "bg-warning text-dark"}">
                        ${c.replied ? "Répondu" : "En attente"}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="viewComplaintDetails(${c.id})" title="Voir Détails"><i class="fas fa-eye"></i></button>
                    ${!c.replied ? `<button class="btn btn-sm btn-primary me-1" onclick="openReplyModal(${c.id})" title="Répondre"><i class="fas fa-reply"></i></button>` : ""}
                    <button class="btn btn-sm btn-danger" onclick="deleteComplaint(${c.id})" title="Supprimer"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `
    tbody.innerHTML += row
  })
}

window.viewComplaintDetails = (id) => {
  const complaints = JSON.parse(localStorage.getItem("complaints")) || []
  const complaint = complaints.find((c) => c.id === id)
  if (!complaint) return

  document.getElementById("complaintDetailsModalLabel").textContent = `Détails: ${complaint.subject}`
  document.getElementById("complaint-detail-name").textContent = complaint.name
  document.getElementById("complaint-detail-email").textContent = complaint.email
  document.getElementById("complaint-detail-date").textContent = new Date(complaint.date).toLocaleString()
  document.getElementById("complaint-detail-subject").textContent = complaint.subject
  document.getElementById("complaint-detail-message").textContent = complaint.message
  document.getElementById("complaint-detail-reply").textContent = complaint.reply || "Pas encore de réponse."

  const modalElement = document.getElementById("complaintDetailsModal")
  if (modalElement) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement)
    modal.show()
  }
}

window.openReplyModal = (id) => {
  document.getElementById("complaintReplyFormHiddenId").value = id
  document.getElementById("complaintReplyText").value = ""
  const modalElement = document.getElementById("replyComplaintModal")
  if (modalElement) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement)
    modal.show()
  }
}

window.deleteComplaint = (id) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette réclamation ?")) return

  let complaints = JSON.parse(localStorage.getItem("complaints")) || []
  const initialLength = complaints.length
  const complaintToDelete = complaints.find((c) => c.id === id)
  complaints = complaints.filter((c) => c.id !== id)

  if (complaints.length < initialLength) {
    localStorage.setItem("complaints", JSON.stringify(complaints))
    window.addActivity(`Réclamation de ${complaintToDelete?.name || `ID: ${id}`} supprimée`)
    window.showNotification("Réclamation supprimée!", "success")
    window.loadAdminComplaintsTable()
  }
}

// Initial Setup on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin Dashboard DOM loaded.")

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
  if (!loggedInUser || loggedInUser.role !== "admin") {
    window.showNotification("Accès non autorisé.", "danger")
    return
  }

  if (typeof window.loadAdminReservationsTable === "function") {
    window.loadAdminReservationsTable()
  }
  if (typeof window.loadAdminMenuItems === "function") {
    window.loadAdminMenuItems()
  }
  if (typeof window.loadAdminComplaintsTable === "function") {
    window.loadAdminComplaintsTable()
  }

  setupMenuModalAndForm()

  if (typeof window.updateAdminStats === "function") {
    window.updateAdminStats()
  }
  if (typeof window.loadCharts === "function") {
    window.loadCharts()
  }

  const addReservationForm = document.getElementById("reservation-form")
  if (addReservationForm) {
    addReservationForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const reservationData = {
        id: Date.now(),
        name: document.getElementById("reservationName").value,
        email: document.getElementById("reservationEmail").value,
        date: document.getElementById("reservationDate").value,
        time: document.getElementById("reservationTime").value,
        guests: Number.parseInt(document.getElementById("reservationGuests").value),
        notes: document.getElementById("reservationNotes").value,
        status: "pending",
      }

      const reservations = JSON.parse(localStorage.getItem("reservations")) || []
      reservations.push(reservationData)
      localStorage.setItem("reservations", JSON.stringify(reservations))

      window.showNotification("Nouvelle réservation ajoutée par admin!", "success")
      window.addActivity(`Nouvelle réservation ajoutée pour ${reservationData.name}`)
      addReservationForm.reset()
      const modalElement = document.getElementById("addReservationModal")
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement)
        if (modal) modal.hide()
      }
      document.dispatchEvent(new CustomEvent("reservationAdded"))
    })
  }

  const complaintReplyForm = document.getElementById("complaint-reply-form")
  if (complaintReplyForm) {
    complaintReplyForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const complaintId = Number.parseInt(document.getElementById("complaintReplyFormHiddenId").value)
      const replyText = document.getElementById("complaintReplyText").value.trim()

      if (!replyText) {
        showNotification("La réponse ne peut pas être vide.", "warning")
        return
      }

      const complaints = JSON.parse(localStorage.getItem("complaints")) || []
      const index = complaints.findIndex((c) => c.id === complaintId)

      if (index !== -1) {
        complaints[index].reply = replyText
        complaints[index].replied = true
        localStorage.setItem("complaints", JSON.stringify(complaints))

        const users = JSON.parse(localStorage.getItem("users")) || []
        const clientUser = users.find(
          (u) => u.username === complaints[index].email || u.email === complaints[index].email,
        )
        if (clientUser) {
          try {
            const allNotifications = JSON.parse(localStorage.getItem("userNotifications")) || []
            const newNotification = {
              id: Date.now(),
              userId: clientUser.id,
              title: `Réponse à votre réclamation: ${complaints[index].subject}`,
              message: `L'administrateur a répondu à votre réclamation. Consultez la page "Réponses aux réclamations".`,
              timestamp: new Date().toISOString(),
              read: false,
            }
            allNotifications.push(newNotification)
            localStorage.setItem("userNotifications", JSON.stringify(allNotifications))
            document.dispatchEvent(new CustomEvent("notificationAdded"))
          } catch (error) {
            console.error("Erreur lors de l'ajout de la notification:", error)
          }
        }

        window.showNotification("Réponse envoyée avec succès!", "success")
        window.addActivity(`Répondu à la réclamation de ${complaints[index].name}`)
        const modalElement = document.getElementById("replyComplaintModal")
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement)
          if (modal) modal.hide()
        }
        window.loadAdminComplaintsTable()
      } else {
        window.showNotification("Erreur: Réclamation non trouvée.", "danger")
      }
    })
  }

  document.addEventListener("reservationAdded", window.loadAdminReservationsTable)
  document.addEventListener("reservationUpdated", window.loadAdminReservationsTable)
  document.addEventListener("complaintAdded", window.loadAdminComplaintsTable)
})
