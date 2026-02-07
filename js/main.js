/**
 * Netita Properties - Main Application File
 * Entry point for the application
 * Handles initialization and orchestration of modules
 */

// ============================================
// Module: Navigation Handler
// ============================================

const NavigationHandler = {
    init() {
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleMenu());
        }
        
        // Close menu when a link is clicked
        const navLinks = this.navMenu.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
        
        // Update active link based on current page
        this.updateActiveLink();
    },
    
    toggleMenu() {
        this.navMenu.classList.toggle('active');
    },
    
    closeMenu() {
        this.navMenu.classList.remove('active');
    },
    
    updateActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = this.navMenu.querySelectorAll('.nav__link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('nav__link--active');
            } else {
                link.classList.remove('nav__link--active');
            }
        });
    }
};

// ============================================
// Module: Property Card Factory
// ============================================

const PropertyCardFactory = {
    /**
     * Create a property card HTML element
     * @param {Object} property - Property data object
     * @returns {HTMLElement} - Property card element
     */
    createCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card anim-card';
        card.setAttribute('role', 'article');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `${property.address} — ${APP.Utilities.formatCurrency(property.price)}`);
        card.innerHTML = `
            <img loading="lazy" src="${property.image}" alt="${property.address}" class="property-card__image" onerror="this.src='https://via.placeholder.com/300x200?text=Property+Image'">
            <div class="property-card__content">
                <div class="property-card__price">${APP.Utilities.formatCurrency(property.price)}</div>
                <div class="property-card__address" id="prop-${property.id}-addr">${property.address}</div>
                <div class="property-card__location">${property.location}</div>
                <div class="property-card__meta">
                    <div class="property-card__meta-item">
                        <span class="property-card__meta-label">Beds</span>
                        <span class="property-card__meta-value">${property.bedrooms}</span>
                    </div>
                    <div class="property-card__meta-item">
                        <span class="property-card__meta-label">Baths</span>
                        <span class="property-card__meta-value">${property.bathrooms}</span>
                    </div>
                    <div class="property-card__meta-item">
                        <span class="property-card__meta-label">Sqft</span>
                        <span class="property-card__meta-value">${property.sqft.toLocaleString()}</span>
                    </div>
                </div>
                <a href="property-details.html?id=${property.id}" class="property-card__link" aria-label="View details for ${property.address}">View Details →</a>
            </div>
        `;
        
        // Add click handler to navigate to property details (unless link clicked)
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.property-card__link')) {
                window.location.href = `property-details.html?id=${property.id}`;
            }
        });

        // Keyboard support: Enter or Space should open details
        card.addEventListener('keydown', (e) => {
            const key = e.key || e.keyCode;
            if (key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 13 || key === 32) {
                // prevent double activation when focus is on the internal link
                if (!document.activeElement || !document.activeElement.closest || !document.activeElement.closest('.property-card__link')) {
                    e.preventDefault();
                    window.location.href = `property-details.html?id=${property.id}`;
                }
            }
        });
        
        return card;
    }
};

// Animate property cards when they enter the viewport
const _CardObserver = (function () {
    let observer = null;

    function init() {
        if (!('IntersectionObserver' in window)) return;
        
        // Use performance-optimized options
        const options = {
            threshold: 0.15,
            rootMargin: '50px'
        };
        
        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        // Observe existing cards
        document.querySelectorAll('.anim-card').forEach(el => observer.observe(el));
    }

    function observe(node) {
        if (observer && node) observer.observe(node);
    }

    return { init, observe };
})();

// ============================================
// Module: Featured Properties
// ============================================

const FeaturedPropertiesHandler = {
    init() {
        const container = document.getElementById('featuredProperties');
        if (!container) return;
        
        // Get first 6 properties as featured
        const featuredProperties = properties.slice(0, 6);
        
        // Clear skeleton cards
        container.innerHTML = '';
        
        // Render property cards
        featuredProperties.forEach(property => {
            const card = PropertyCardFactory.createCard(property);
            container.appendChild(card);
            // ensure observer watches new cards
            _CardObserver.observe(card);
        });
    }
};

// ============================================
// Module: Hero Animations
// ============================================

const HeroAnimationsHandler = {
    init() {
        const title = document.querySelector('.hero__title');
        const subtitle = document.querySelector('.hero__subtitle');
        const search = document.querySelector('.hero__search');

        // initial state is handled in CSS; add in-view with stagger
        if (title) setTimeout(() => title.classList.add('in-view'), 200);
        if (subtitle) setTimeout(() => subtitle.classList.add('in-view'), 350);
        if (search) setTimeout(() => search.classList.add('in-view'), 550);
    }
};

// ============================================
// Module: Hero Search Handler
// ============================================

const HeroSearchHandler = {
    init() {
        this.searchInput = document.getElementById('heroSearch');
        this.searchBtn = document.getElementById('heroSearchBtn');
        this.listingTypeSelect = document.getElementById('heroListingType');
        this.locationSelect = document.getElementById('heroLocationSelect');
        this.propertyTypeSelect = document.getElementById('heroPropertyTypeSelect');
        
        if (!this.searchInput || !this.searchBtn) return;

        // Populate property types from properties data if available
        if (typeof properties !== 'undefined' && this.propertyTypeSelect) {
            const types = Array.from(new Set(properties.map(p => p.type).filter(Boolean)));
            types.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t;
                opt.textContent = t;
                this.propertyTypeSelect.appendChild(opt);
            });
        }

        // If location select has only the default, try populating from properties
        if (typeof properties !== 'undefined' && this.locationSelect && this.locationSelect.options.length <= 1) {
            const locs = Array.from(new Set(properties.map(p => p.location).filter(Boolean)));
            locs.sort();
            locs.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l;
                opt.textContent = l;
                this.locationSelect.appendChild(opt);
            });
        }

        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    },
    
    handleSearch() {
        const query = this.searchInput?.value.trim() || '';
        const listingType = this.listingTypeSelect?.value || '';
        const location = this.locationSelect?.value || '';
        const propertyType = this.propertyTypeSelect?.value || '';

        const params = new URLSearchParams();
        if (query) params.set('search', query);
        if (location) params.set('location', location);
        if (propertyType) params.set('types', propertyType);
        if (listingType) params.set('listingType', listingType);

        const qs = params.toString();
        const url = qs ? `listings.html?${qs}` : 'listings.html';
        window.location.href = url;
    }
};

// ============================================
// Module: Utilities
// ============================================

const Utilities = {
    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, delay = 300) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    /**
     * Get URL query parameters
     * @returns {Object} - Query parameters as key-value pairs
     */
    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const paramsObj = {};
        
        for (const [key, value] of params) {
            paramsObj[key] = decodeURIComponent(value);
        }
        
        return paramsObj;
    },
    
    /**
     * Format currency
     * @param {number} value - Value to format
     * @param {string} currency - Currency code (default: USD)
     * @returns {string} - Formatted currency string
     */
    formatCurrency(value, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    },
    
    /**
     * Format number with comma separator
     * @param {number} value - Value to format
     * @returns {string} - Formatted number
     */
    formatNumber(value) {
        return value.toLocaleString('en-US');
    }
};

// ============================================
// Application Initialization
// ============================================

function initializeApp() {
    // Check if properties data is loaded
    if (typeof properties === 'undefined') {
        console.error('Properties data not loaded. Make sure data/properties.js is included before main.js');
        return;
    }
    
    // Initialize modules
    NavigationHandler.init();
    FeaturedPropertiesHandler.init();
    HeroSearchHandler.init();
    HeroAnimationsHandler.init();
    _CardObserver.init();
    
    console.log('✓ Netita Properties app initialized successfully');
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ============================================
// Expose utilities and data globally for other pages
// ============================================

window.APP = {
    properties,
    Utilities,
    PropertyCardFactory,
    NavigationHandler,
    FeaturedPropertiesHandler,
    HeroSearchHandler,
    HeroAnimationsHandler,
    CardObserver: _CardObserver
};
