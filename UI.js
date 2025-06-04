/**
 * Utilitaire pour l'interface utilisateur
 */
class UI {
    /**
     * Affiche une notification
     * @param {string} message - Le message à afficher
     * @param {string} type - Le type de notification (success, error, warning, info)
     * @param {number} duration - La durée d'affichage en millisecondes
     * @static
     */
    static showNotification(message, type = 'info', duration = 3000) {
        const notification = document.getElementById('notification');
        const notificationMessage = notification.querySelector('.notification-message');
        
        // Définir le type et le message
        notification.className = 'notification show ' + type;
        notificationMessage.textContent = message;
        
        // Définir l'icône en fonction du type
        const icon = notification.querySelector('.notification-icon');
        if (icon) {
            icon.className = 'notification-icon';
            switch (type) {
                case 'success':
                    icon.className += ' fas fa-check-circle';
                    break;
                case 'error':
                    icon.className += ' fas fa-exclamation-circle';
                    break;
                case 'warning':
                    icon.className += ' fas fa-exclamation-triangle';
                    break;
                default:
                    icon.className += ' fas fa-info-circle';
            }
        }
        
        // Afficher la notification
        notification.classList.add('show');
        
        // Cacher la notification après la durée spécifiée
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }
    
    /**
     * Affiche un indicateur de chargement
     * @static
     */
    static showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }
    
    /**
     * Masque l'indicateur de chargement
     * @static
     */
    static hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
    
    /**
     * Crée un élément HTML avec des attributs et du contenu
     * @param {string} tag - Le nom de la balise
     * @param {Object} attributes - Les attributs à ajouter à l'élément
     * @param {string|HTMLElement|Array} content - Le contenu à ajouter à l'élément
     * @returns {HTMLElement} L'élément créé
     * @static
     */
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // Ajouter les attributs
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        
        // Ajouter le contenu
        if (content) {
            if (typeof content === 'string') {
                element.textContent = content;
            } else if (content instanceof HTMLElement) {
                element.appendChild(content);
            } else if (Array.isArray(content)) {
                content.forEach(item => {
                    if (item instanceof HTMLElement) {
                        element.appendChild(item);
                    } else if (typeof item === 'string') {
                        element.appendChild(document.createTextNode(item));
                    }
                });
            }
        }
        
        return element;
    }
    
    /**
     * Formate une date en chaîne de caractères
     * @param {string|Date} date - La date à formater
     * @param {string} format - Le format à utiliser (short, medium, long)
     * @returns {string} La date formatée
     * @static
     */
    static formatDate(date, format = 'medium') {
        const dateObj = date instanceof Date ? date : new Date(date);
        
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        if (format === 'short') {
            options.month = 'short';
        } else if (format === 'long') {
            options.weekday = 'long';
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return dateObj.toLocaleDateString('fr-FR', options);
    }
    
    /**
     * Tronque un texte à une longueur donnée
     * @param {string} text - Le texte à tronquer
     * @param {number} maxLength - La longueur maximale
     * @param {string} ellipsis - Le texte à ajouter en fin de chaîne
     * @returns {string} Le texte tronqué
     * @static
     */
    static truncateText(text, maxLength = 100, ellipsis = '...') {
        if (!text || text.length <= maxLength) {
            return text;
        }
        
        return text.substr(0, maxLength - ellipsis.length) + ellipsis;
    }
    
    /**
     * Remplace les retours à la ligne par des balises HTML
     * @param {string} text - Le texte à traiter
     * @returns {string} Le texte avec les retours à la ligne remplacés
     * @static
     */
    static nl2br(text) {
        if (!text) return '';
        return text.replace(/\n/g, '<br>');
    }
    
    /**
     * Échappe les caractères HTML spéciaux
     * @param {string} text - Le texte à échapper
     * @returns {string} Le texte échappé
     * @static
     */
    static escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}