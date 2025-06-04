// js/utils.js

/**
 * Affiche une notification de style Bootstrap en haut et au centre de l'écran.
 * C'est une alerte générale pour un retour immédiat (par exemple, "Succès !", "Erreur !").
 * @param {string} message - Le message à afficher.
 * @param {string} type - Le type de notification (par exemple, 'success', 'danger', 'warning', 'info').
 */
window.showNotification = (message, type = "success") => {
  let notificationContainer = document.getElementById("notification-container");

  // Crée le conteneur s'il n'existe pas
  if (!notificationContainer) {
    const div = document.createElement("div");
    div.id = "notification-container";
    div.style.position = "fixed";
    div.style.top = "10px";
    div.style.left = "50%";
    div.style.transform = "translateX(-50%)";
    div.style.zIndex = "2000"; // Assurez-vous qu'il est au-dessus des autres contenus
    div.style.width = "fit-content";
    div.style.maxWidth = "90%";
    div.style.pointerEvents = "none"; // Permet aux clics de passer à travers les éléments derrière
    document.body.appendChild(div);
    notificationContainer = div; // Met à jour la référence
  }

  const notification = document.createElement("div");
  notification.className = `alert alert-${type} alert-dismissible fade show`;
  notification.setAttribute("role", "alert");
  notification.style.pointerEvents = "auto"; // Rend la notification cliquable
  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

  notificationContainer.appendChild(notification);

  // Supprime automatiquement la notification après 5 secondes
  setTimeout(() => {
    // Vérifie si la notification existe toujours avant d'essayer de la fermer
    if (notification.parentNode === notificationContainer) {
      const bsAlert = bootstrap.Alert.getInstance(notification);
      if (bsAlert) {
        bsAlert.close();
      } else {
        // Repli si le JS de Bootstrap n'est pas initialisé ou si l'alerte n'est pas une instance Bootstrap Alert
        notification.remove();
      }
    }
  }, 5000);
};

/**
 * Ajoute une entrée d'activité au journal d'activités stocké dans localStorage.
 * Ceci est principalement pour le fil d'activités du tableau de bord de l'administrateur.
 * @param {string} description - La description de l'activité.
 */
window.addActivity = (description) => {
  console.log("Activité:", description);
  const activities = JSON.parse(localStorage.getItem("activities")) || [];
  const timestamp = new Date().toISOString();
  activities.push({
    date: timestamp,
    description: description
  });
  // Ne conserve que les 20 dernières activités pour éviter l'encombrement du localStorage
  localStorage.setItem("activities", JSON.stringify(activities.slice(-20)));

  // Si une liste d'activités est présente sur la page actuelle (par exemple, tableau de bord admin), la met à jour
  const activityList = document.getElementById("recent-activity-list");
  if (activityList) {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = `${new Date(timestamp).toLocaleTimeString()} - ${description}`;
    activityList.insertBefore(li, activityList.firstChild);
    // Ne conserve que les 10 dernières activités visibles dans la liste
    while (activityList.children.length > 10) {
      activityList.removeChild(activityList.lastChild);
    }
  }
};

/**
 * Gère les notifications spécifiques à l'utilisateur dans localStorage.
 * Ce sont des notifications persistantes pour des actions/événements utilisateur spécifiques.
 */
window.notificationManager = {
  /**
   * Récupère les notifications pour un utilisateur spécifique.
   * @param {string} userId - L'ID de l'utilisateur.
   * @returns {Array} Un tableau d'objets de notification.
   */
  getNotifications: (userId) => {
    const allNotifications =
      JSON.parse(localStorage.getItem("userNotifications")) || [];
    return allNotifications.filter((n) => String(n.userId) === String(userId));
  },

  /**
   * Ajoute une nouvelle notification pour un utilisateur.
   * @param {string} userId - L'ID de l'utilisateur.
   * @param {string} title - Le titre de la notification.
   * @param {string} message - Le message de la notification.
   * @param {string} type - Le type de notification (par exemple, 'info', 'success', 'danger').
   */
  addNotification: (userId, title, message, type = "info") => {
    // Assurez-vous que userId est une chaîne pour une comparaison cohérente
    userId = String(userId);

    const newNotification = {
      id: Date.now(), // ID unique pour la notification
      userId: userId,
      title: title,
      message: message,
      timestamp: new Date().toISOString(),
      read: false,
      type: type, // Pour un style potentiel futur sur la page des notifications
    };
    const allNotifications =
      JSON.parse(localStorage.getItem("userNotifications")) || [];
    allNotifications.push(newNotification);
    localStorage.setItem("userNotifications", JSON.stringify(allNotifications));
    // Déclenche un événement personnalisé afin que d'autres parties de l'application puissent réagir (par exemple, mettre à jour le badge de notification)
    document.dispatchEvent(
      new CustomEvent("notificationAdded", {
        detail: newNotification
      })
    );
    console.log(`Notification ajoutée pour l'utilisateur ${userId}:`, newNotification);
  },

  /**
   * Marque une notification spécifique comme lue.
   * @param {number} notificationId - L'ID de la notification à marquer.
   * @param {string} userId - L'ID de l'utilisateur à qui appartient la notification.
   * @returns {boolean} Vrai si marquée, faux sinon.
   */
  markAsRead: (notificationId, userId) => {
    userId = String(userId);
    let allNotifications =
      JSON.parse(localStorage.getItem("userNotifications")) || [];
    const notificationIndex = allNotifications.findIndex(
      (n) => n.id === notificationId && String(n.userId) === userId
    );
    if (notificationIndex > -1 && !allNotifications[notificationIndex].read) {
      allNotifications[notificationIndex].read = true;
      localStorage.setItem("userNotifications", JSON.stringify(allNotifications));
      document.dispatchEvent(
        new CustomEvent("notificationRead", {
          detail: {
            notificationId,
            userId
          }
        })
      );
      console.log(`Notification ${notificationId} marquée comme lue pour l'utilisateur ${userId}`);
      return true;
    }
    return false;
  },

  /**
   * Marque toutes les notifications pour un utilisateur spécifique comme lues.
   * @param {string} userId - L'ID de l'utilisateur.
   */
  markAllAsRead: (userId) => {
    userId = String(userId);
    let allNotifications =
      JSON.parse(localStorage.getItem("userNotifications")) || [];
    let changed = false;
    allNotifications = allNotifications.map((n) => {
      if (String(n.userId) === userId && !n.read) {
        changed = true;
        return { ...n,
          read: true
        };
      }
      return n;
    });
    if (changed) {
      localStorage.setItem("userNotifications", JSON.stringify(allNotifications));
      document.dispatchEvent(
        new CustomEvent("allNotificationsRead", {
          detail: {
            userId
          }
        })
      );
      console.log(`Toutes les notifications marquées comme lues pour l'utilisateur ${userId}`);
    }
  },

  /**
   * Supprime une notification spécifique.
   * @param {number} notificationId - L'ID de la notification à supprimer.
   * @param {string} userId - L'ID de l'utilisateur à qui appartient la notification.
   * @returns {boolean} Vrai si supprimée, faux sinon.
   */
  deleteNotification: (notificationId, userId) => {
    userId = String(userId);
    let allNotifications =
      JSON.parse(localStorage.getItem("userNotifications")) || [];
    const initialLength = allNotifications.length;
    allNotifications = allNotifications.filter(
      (n) => !(n.id === notificationId && String(n.userId) === userId)
    );
    if (allNotifications.length < initialLength) {
      localStorage.setItem("userNotifications", JSON.stringify(allNotifications));
      document.dispatchEvent(
        new CustomEvent("notificationDeleted", {
          detail: {
            notificationId,
            userId
          }
        })
      );
      console.log(`Notification ${notificationId} supprimée pour l'utilisateur ${userId}`);
      return true;
    }
    return false;
  },

  /**
   * Supprime toutes les notifications pour un utilisateur spécifique.
   * @param {string} userId - L'ID de l'utilisateur.
   */
  deleteAllNotifications: (userId) => {
    userId = String(userId);
    let allNotifications =
      JSON.parse(localStorage.getItem("userNotifications")) || [];
    const initialLength = allNotifications.length;
    allNotifications = allNotifications.filter(
      (n) => String(n.userId) !== userId
    );
    if (allNotifications.length < initialLength) {
      localStorage.setItem("userNotifications", JSON.stringify(allNotifications));
      document.dispatchEvent(
        new CustomEvent("allNotificationsDeleted", {
          detail: {
            userId
          }
        })
      );
      console.log(`Toutes les notifications supprimées pour l'utilisateur ${userId}`);
    }
  },

  /**
   * Obtient le nombre de notifications non lues pour un utilisateur.
   * @param {string} userId - L'ID de l'utilisateur.
   * @returns {number} Le nombre de notifications non lues.
   */
  getUnreadCount: (userId) => {
    const notifications = window.notificationManager.getNotifications(userId);
    return notifications.filter((n) => !n.read).length;
  },
};
