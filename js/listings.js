/**
 * Netita Properties - Listings Page JavaScript
 * Handles property filtering, sorting, and pagination
 */

const ListingsHandler = {
    currentPage: 1,
    itemsPerPage: 12,
    filteredProperties: [...properties],
    
    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.loadFromURL();
        // Apply filters after loading any URL state
        this.applyFilters();
    },
    
    cacheElements() {
        this.locationInput = document.getElementById('locationFilter');
        this.minPriceInput = document.getElementById('minPrice');
        this.maxPriceInput = document.getElementById('maxPrice');
        this.propertyTypeCheckboxes = document.querySelectorAll('.property-type-filter');
        this.bedroomsCheckboxes = document.querySelectorAll('.bedrooms-filter');
        this.bathroomsCheckboxes = document.querySelectorAll('.bathrooms-filter');
        this.sortBySelect = document.getElementById('sortBy');
        this.resetBtn = document.getElementById('resetFilters');
        this.clearFiltersBtn = document.getElementById('clearFiltersBtn');
        this.filterToggleBtn = document.getElementById('filterToggle');
        this.filtersSidebar = document.getElementById('filters');
        this._previouslyFocused = null;
        this._focusTrapHandler = null;
        this.propertiesGrid = document.getElementById('propertiesGrid');
        this.noResults = document.getElementById('noResults');
        this.propertiesCount = document.getElementById('propertiesCount');
        this.pagination = document.getElementById('pagination');
    },
    
    attachEventListeners() {
        // Filter inputs (debounced where appropriate)
        const debouncedApply = APP.Utilities.debounce(() => this.applyFilters(), 300);
        this.locationInput?.addEventListener('input', () => debouncedApply());
        this.minPriceInput?.addEventListener('input', () => debouncedApply());
        this.maxPriceInput?.addEventListener('input', () => debouncedApply());
        this.sortBySelect?.addEventListener('change', () => this.applyFilters());
        
        // Filter checkboxes
        this.propertyTypeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.applyFilters());
        });
        this.bedroomsCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.applyFilters());
        });
        this.bathroomsCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.applyFilters());
        });
        
        // Reset buttons
        this.resetBtn?.addEventListener('click', () => this.resetFilters());
        this.clearFiltersBtn?.addEventListener('click', () => this.resetFilters());

        // Mobile filter toggle
        if (this.filterToggleBtn && this.filtersSidebar) {
            this.filterToggleBtn.addEventListener('click', (e) => {
                const expanded = this.filterToggleBtn.getAttribute('aria-expanded') === 'true';
                if (expanded === true || expanded === 'true') {
                    this.closeFilters();
                } else {
                    this.openFilters();
                }
            });

            // Close filters when clicking outside the sidebar
            document.addEventListener('click', (e) => {
                if (!document.body.classList.contains('filters-open')) return;
                const inside = e.target.closest && (e.target.closest('#filters') || e.target.closest('#filterToggle'));
                if (!inside) {
                    this.closeFilters();
                }
            });

            // Close with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && document.body.classList.contains('filters-open')) {
                    this.closeFilters();
                }
            });
        }

        // Accessible keyboard navigation for pagination (left/right)
        this.setupPaginationKeyboard();
    },

    openFilters() {
        if (!this.filtersSidebar || !this.filterToggleBtn) return;
        this._previouslyFocused = document.activeElement;
        document.body.classList.add('filters-open');
        this.filterToggleBtn.setAttribute('aria-expanded', 'true');
        this.filtersSidebar.setAttribute('aria-hidden', 'false');

        // Focus first focusable element inside sidebar
        const focusable = this.getFilterFocusables();
        if (focusable.length) focusable[0].focus();

        // Install focus trap
        this._focusTrapHandler = (e) => {
            if (e.key !== 'Tab') return;
            const focusables = this.getFilterFocusables();
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', this._focusTrapHandler);
    },

    closeFilters() {
        if (!this.filtersSidebar || !this.filterToggleBtn) return;
        document.body.classList.remove('filters-open');
        this.filterToggleBtn.setAttribute('aria-expanded', 'false');
        this.filtersSidebar.setAttribute('aria-hidden', 'true');

        if (this._focusTrapHandler) {
            document.removeEventListener('keydown', this._focusTrapHandler);
            this._focusTrapHandler = null;
        }

        if (this._previouslyFocused && typeof this._previouslyFocused.focus === 'function') {
            try { this._previouslyFocused.focus(); } catch (e) {}
            this._previouslyFocused = null;
        }
    },

    getFilterFocusables() {
        if (!this.filtersSidebar) return [];
        const selectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        return Array.from(this.filtersSidebar.querySelectorAll(selectors)).filter(el => el.offsetParent !== null);
    },

    setupPaginationKeyboard() {
        if (!this.pagination) return;
        // Allow arrow keys to move pages when pagination has focus
        this.pagination.addEventListener('keydown', (e) => {
            const key = e.key;
            if (key === 'ArrowLeft' || key === 'PageUp') {
                // move to previous
                const prev = this.pagination.querySelector('.pagination__button[aria-label="Previous page"]');
                if (prev && !prev.disabled) {
                    prev.click();
                }
            } else if (key === 'ArrowRight' || key === 'PageDown') {
                const next = this.pagination.querySelector('.pagination__button[aria-label="Next page"]');
                if (next && !next.disabled) {
                    next.click();
                }
            }
        });
    },
    
    loadFromURL() {
        const params = APP.Utilities.getQueryParams();
        // Populate filters from URL params if present
        if (!params) return;

        if (params.search && this.locationInput) {
            this.locationInput.value = params.search;
        }

        if (params.location && this.locationInput) {
            // explicit location param takes precedence
            this.locationInput.value = params.location;
        }

        // Preserve listing type param for filtering (if present)
        if (params.listingType) {
            this.listingType = params.listingType;
        }

        if (params.minPrice && this.minPriceInput) this.minPriceInput.value = params.minPrice;
        if (params.maxPrice && this.maxPriceInput) this.maxPriceInput.value = params.maxPrice;
        if (params.sort && this.sortBySelect) this.sortBySelect.value = params.sort;

        if (params.types) {
            const types = params.types.split(',');
            this.propertyTypeCheckboxes.forEach(cb => { cb.checked = types.includes(cb.value); });
        }

        if (params.beds) {
            const beds = params.beds.split(',').map(n => String(n));
            this.bedroomsCheckboxes.forEach(cb => { cb.checked = beds.includes(cb.value); });
        }

        if (params.baths) {
            const baths = params.baths.split(',').map(n => String(n));
            this.bathroomsCheckboxes.forEach(cb => { cb.checked = baths.includes(cb.value); });
        }

        if (params.page) {
            const p = parseInt(params.page, 10);
            if (!isNaN(p) && p > 0) this.currentPage = p;
        }
    },
    
    applyFilters() {
        this.currentPage = 1;
        
        const location = this.locationInput.value.toLowerCase();
        const minPrice = this.minPriceInput.value ? parseInt(this.minPriceInput.value) : 0;
        const maxPrice = this.maxPriceInput.value ? parseInt(this.maxPriceInput.value) : Infinity;
        
        const selectedTypes = Array.from(this.propertyTypeCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        
        const selectedBedrooms = Array.from(this.bedroomsCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => parseInt(cb.value));
        
        const selectedBathrooms = Array.from(this.bathroomsCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => parseInt(cb.value));
        
        // Filter properties
        this.filteredProperties = properties.filter(property => {
            // Listing type filter (only if property explicitly has listingType)
            const listingType = this.listingType || '';
            if (listingType) {
                if (property.listingType && property.listingType !== listingType) {
                    return false;
                }
            }

            // Location filter
            if (location && !property.location.toLowerCase().includes(location) && 
                !property.address.toLowerCase().includes(location)) {
                return false;
            }
            
            // Price filter
            if (property.price < minPrice || property.price > maxPrice) {
                return false;
            }
            
            // Property type filter
            if (selectedTypes.length > 0 && !selectedTypes.includes(property.type)) {
                return false;
            }
            
            // Bedrooms filter
            if (selectedBedrooms.length > 0) {
                if (!selectedBedrooms.some(beds => property.bedrooms >= beds)) {
                    return false;
                }
            }
            
            // Bathrooms filter
            if (selectedBathrooms.length > 0) {
                if (!selectedBathrooms.some(baths => property.bathrooms >= baths)) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Apply sorting
        this.sortProperties();
        // Update URL with current filter state
        this.updateURL();
        this.render();
    },

    /**
     * Update browser URL to reflect current filters without reloading
     */
    updateURL() {
        const params = new URLSearchParams();
        const location = this.locationInput?.value.trim();
        if (location) params.set('search', location);

        // Persist listing type if present
        if (this.listingType) params.set('listingType', this.listingType);

        const min = this.minPriceInput?.value;
        const max = this.maxPriceInput?.value;
        if (min) params.set('minPrice', min);
        if (max) params.set('maxPrice', max);

        const selectedTypes = Array.from(this.propertyTypeCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        if (selectedTypes.length) params.set('types', selectedTypes.join(','));

        const selectedBeds = Array.from(this.bedroomsCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        if (selectedBeds.length) params.set('beds', selectedBeds.join(','));

        const selectedBaths = Array.from(this.bathroomsCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        if (selectedBaths.length) params.set('baths', selectedBaths.join(','));

        if (this.sortBySelect && this.sortBySelect.value) params.set('sort', this.sortBySelect.value);

        if (this.currentPage && this.currentPage > 1) params.set('page', String(this.currentPage));

        const qs = params.toString();
        const url = qs ? `listings.html?${qs}` : 'listings.html';
        history.replaceState(null, '', url);
    },
    
    sortProperties() {
        const sortValue = this.sortBySelect.value;
        
        switch(sortValue) {
            case 'newest':
                this.filteredProperties.sort((a, b) => 
                    new Date(b.listingDate) - new Date(a.listingDate)
                );
                break;
            case 'price-low':
                this.filteredProperties.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProperties.sort((a, b) => b.price - a.price);
                break;
            case 'beds':
                this.filteredProperties.sort((a, b) => b.bedrooms - a.bedrooms);
                break;
            case 'sqft':
                this.filteredProperties.sort((a, b) => b.sqft - a.sqft);
                break;
        }
    },
    
    render() {
        // Clear grid
        this.propertiesGrid.innerHTML = '';
        
        // Update count
        this.propertiesCount.textContent = this.filteredProperties.length;
        
        // Show/hide no results
        if (this.filteredProperties.length === 0) {
            this.noResults.style.display = 'block';
            this.pagination.innerHTML = '';
            return;
        }
        
        this.noResults.style.display = 'none';
        
        // Calculate pagination
        const totalPages = Math.ceil(this.filteredProperties.length / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageProperties = this.filteredProperties.slice(start, end);
        
        // Render property cards
        pageProperties.forEach(property => {
            const card = APP.PropertyCardFactory.createCard(property);
            this.propertiesGrid.appendChild(card);
            // observe card for entrance animation if observer available
            if (APP.CardObserver && typeof APP.CardObserver.observe === 'function') {
                APP.CardObserver.observe(card);
            }
        });
        
        // Render pagination
        this.renderPagination(totalPages);
    },
    
    renderPagination(totalPages) {
        this.pagination.innerHTML = '';
        // Accessibility: mark pagination region
        this.pagination.setAttribute('role', 'navigation');
        this.pagination.setAttribute('aria-label', 'Pagination');
        
        if (totalPages <= 1) return;
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination__button';
        prevBtn.textContent = '← Previous';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.setAttribute('aria-label', 'Previous page');
        prevBtn.setAttribute('aria-disabled', String(prevBtn.disabled));
        prevBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.updateURL();
                this.render();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        this.pagination.appendChild(prevBtn);
        
        // Page buttons with truncation for large page counts
        const maxVisible = 7; // total numbered buttons to aim for
        let pages = [];

        if (totalPages <= maxVisible) {
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            const first = 1;
            const last = totalPages;
            const left = Math.max(this.currentPage - 1, 2);
            const right = Math.min(this.currentPage + 1, totalPages - 1);

            if (this.currentPage <= 4) {
                pages = [1,2,3,4,5,'...', last];
            } else if (this.currentPage >= totalPages - 3) {
                pages = [first, '...', totalPages-4, totalPages-3, totalPages-2, totalPages-1, last];
            } else {
                pages = [first, '...', this.currentPage-1, this.currentPage, this.currentPage+1, '...', last];
            }
        }

        pages.forEach(p => {
            if (p === '...') {
                const ell = document.createElement('span');
                ell.className = 'pagination__ellipsis';
                ell.textContent = '…';
                ell.setAttribute('aria-hidden', 'true');
                this.pagination.appendChild(ell);
                return;
            }

            const pageBtn = document.createElement('button');
            pageBtn.className = 'pagination__button';
            pageBtn.textContent = p;
            pageBtn.setAttribute('aria-label', `Go to page ${p}`);

            if (p === this.currentPage) {
                pageBtn.classList.add('active');
                pageBtn.setAttribute('aria-current', 'page');
            }

            pageBtn.addEventListener('click', () => {
                this.currentPage = p;
                this.updateURL();
                this.render();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            this.pagination.appendChild(pageBtn);
        });
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination__button';
        nextBtn.textContent = 'Next →';
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.setAttribute('aria-label', 'Next page');
        nextBtn.setAttribute('aria-disabled', String(nextBtn.disabled));
        nextBtn.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.updateURL();
                this.render();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        this.pagination.appendChild(nextBtn);
    },
    
    resetFilters() {
        this.locationInput.value = '';
        this.minPriceInput.value = '';
        this.maxPriceInput.value = '';
        this.sortBySelect.value = 'newest';
        
        this.propertyTypeCheckboxes.forEach(cb => cb.checked = false);
        this.bedroomsCheckboxes.forEach(cb => cb.checked = false);
        this.bathroomsCheckboxes.forEach(cb => cb.checked = false);
        
        this.filteredProperties = [...properties];
        this.currentPage = 1;
        // Clear URL state
        history.replaceState(null, '', 'listings.html');
        this.render();
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ListingsHandler.init());
} else {
    ListingsHandler.init();
}
