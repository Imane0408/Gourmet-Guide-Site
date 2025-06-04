// Extension pour ajouter des recettes aux listes personnalisées
document.addEventListener("DOMContentLoaded", () => {
  // Ajouter le sélecteur de listes aux cartes de recettes
  function enhanceRecipeCards() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"))
    if (!user || user.role !== "client") return

    // Ajouter un bouton pour ajouter à une liste personnalisée
    document.querySelectorAll(".card .btn-group").forEach((btnGroup) => {
      const recipeId = btnGroup.closest(".card").querySelector("[data-id]")?.dataset.id
      if (!recipeId) return

      // Vérifier si le bouton n'existe pas déjà
      if (btnGroup.querySelector(".add-to-custom-list")) return

      const addToListBtn = document.createElement("button")
      addToListBtn.className = "btn btn-sm btn-outline-info add-to-custom-list"
      addToListBtn.dataset.recipeId = recipeId
      addToListBtn.title = "Ajouter à une liste"
      addToListBtn.innerHTML = '<i class="fas fa-plus"></i>'

      addToListBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        showAddToListModal(Number.parseInt(recipeId))
      })

      btnGroup.appendChild(addToListBtn)
    })
  }

  // Afficher le modal pour ajouter à une liste
  function showAddToListModal(recipeId) {
    if (!window.favoritesManager) return

    const lists = window.favoritesManager.getListsForSelector()

    if (lists.length === 0) {
      if (confirm("Vous n'avez aucune liste personnalisée. Voulez-vous en créer une ?")) {
        const createListModal = document.getElementById("createListModal")
        if (createListModal) {
          const modal = new bootstrap.Modal(createListModal)
          modal.show()
        }
      }
      return
    }

    const modalHtml = `
            <div class="modal fade" id="addToListModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Ajouter à une liste</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Sélectionnez la liste à laquelle ajouter cette recette :</p>
                            <div class="list-group">
                                ${lists
                                  .map(
                                    (list) => `
                                    <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                            data-list-id="${list.id}">
                                        <span>${list.name}</span>
                                        <span class="badge bg-primary rounded-pill">${list.count}</span>
                                    </button>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `

    // Supprimer le modal existant s'il y en a un
    const existingModal = document.getElementById("addToListModal")
    if (existingModal) existingModal.remove()

    document.body.insertAdjacentHTML("beforeend", modalHtml)

    const modalElement = document.getElementById("addToListModal")
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement)
      modal.show()

      // Attacher les événements
      document.querySelectorAll("#addToListModal .list-group-item").forEach((item) => {
        item.addEventListener("click", () => {
          const listId = Number.parseInt(item.dataset.listId)
          if (window.favoritesManager.addRecipeToList(listId, recipeId)) {
            modal.hide()
          }
        })
      })
    }
  }

  // Observer les changements dans la liste des recettes
  const observer = new MutationObserver(() => {
    enhanceRecipeCards()
  })

  const recipeList = document.getElementById("recipe-list")
  if (recipeList) {
    observer.observe(recipeList, { childList: true, subtree: true })
    enhanceRecipeCards() // Appel initial
  }
})
