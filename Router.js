/**
 * Gestionnaire de routes pour l'application
 */
class Router {
    /**
     * Crée une instance du routeur
     * @param {Object} routes - Les routes de l'application
     */
    constructor(routes) {
        this.routes = routes;
        this.currentRoute = null;
        this.init();
    }
    
    /**
     * Initialise le routeur
     */
    init() {
        // Écoute les changements de hash
        window.addEventListener('hashchange', () => this.handleRouting());
        
        // Gestion de la route initiale
        this.handleRouting();
    }
    
    /**
     * Gère le routage vers la bonne page
     */
    handleRouting() {
        // Récupérer le hash actuel sans le #
        let url = window.location.hash.slice(1) || '/';
        
        // Trouver la route correspondante
        let route = this.findRouteByUrl(url);
        
        if (route) {
            // Afficher le loader pendant le chargement
            UI.showLoading();
            
            // Extraction des paramètres d'URL (si présents)
            const params = this.extractParams(route, url);
            
            // Appeler le contrôleur associé à la route
            if (typeof route.controller === 'function') {
                // Sauvegarde de la route actuelle
                this.currentRoute = route;
                
                // Appel du contrôleur avec les paramètres extraits
                route.controller(params);
                
                // Mise à jour du titre de la page
                document.title = route.title ? `${route.title} - Gourmet Guide` : 'Gourmet Guide';
                
                // Masquer le loader après le chargement
                setTimeout(() => {
                    UI.hideLoading();
                }, 300);
            }
        } else {
            // Route non trouvée, rediriger vers la page 404
            window.location.hash = '/not-found';
        }
    }
    
    /**
     * Trouve une route correspondant à l'URL donnée
     * @param {string} url - L'URL à analyser
     * @returns {Object|null} La route correspondante ou null si non trouvée
     */
    findRouteByUrl(url) {
        // Vérifier les routes exactes d'abord
        if (this.routes[url]) {
            return this.routes[url];
        }
        
        // Essayer de faire correspondre les routes avec des paramètres
        for (const path in this.routes) {
            // Convertir la définition de route en regex
            const routeRegex = this.routeToRegex(path);
            if (routeRegex.test(url)) {
                return this.routes[path];
            }
        }
        
        return null;
    }
    
    /**
     * Convertit une définition de route en expression régulière
     * @param {string} route - La définition de route
     * @returns {RegExp} L'expression régulière correspondante
     */
    routeToRegex(route) {
        // Remplacer les paramètres :param par des groupes de capture
        const pattern = route.replace(/:\w+/g, '([^/]+)');
        return new RegExp(`^${pattern}$`);
    }
    
    /**
     * Extrait les paramètres d'une URL
     * @param {Object} route - La définition de route
     * @param {string} url - L'URL à analyser
     * @returns {Object} Les paramètres extraits
     */
    extractParams(route, url) {
        const params = {};
        
        // Si la route n'a pas de paramètres, retourner un objet vide
        if (!route.path || !route.path.includes(':')) {
            return params;
        }
        
        // Obtenir le modèle et l'URL
        const pattern = route.path;
        const urlParts = url.split('/');
        const patternParts = pattern.split('/');
        
        // Extraire les paramètres
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                const paramName = patternParts[i].slice(1);
                params[paramName] = urlParts[i];
            }
        }
        
        return params;
    }
    
    /**
     * Navigue vers une route spécifique
     * @param {string} url - L'URL cible 
     * @param {Object} params - Les paramètres à passer (optionnel)
     */
    navigateTo(url, params = {}) {
        // Construire l'URL avec les paramètres
        let targetUrl = url;
        
        // Remplacer les paramètres dans l'URL
        for (const key in params) {
            targetUrl = targetUrl.replace(`:${key}`, params[key]);
        }
        
        // Naviguer vers la nouvelle URL
        window.location.hash = targetUrl;
    }
    
    /**
     * Obtient la route actuelle
     * @returns {Object} La route actuelle
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
}