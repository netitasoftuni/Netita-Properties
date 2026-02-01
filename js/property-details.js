/**
 * Netita Properties - Property Details Page JavaScript
 * Handles loading and displaying individual property information
 */

const PropertyDetailsHandler = {
    property: null,
    currentImageIndex: 0,
    images: [],
    
    init() {
        const params = APP.Utilities.getQueryParams();
        const propertyId = parseInt(params.id);
        
        if (!propertyId) {
            this.showError('No property specified');
            return;
        }
        
        this.property = APP.properties.find(p => p.id === propertyId);
        
        if (!this.property) {
            this.showError('Property not found');
            return;
        }
        
        // Build gallery images array from property data if available
        if (Array.isArray(this.property.images) && this.property.images.length > 0) {
            // Use provided images array (ensure shallow copy)
            this.images = [...this.property.images];
        } else if (this.property.image) {
            // Fallback to single main image
            this.images = [this.property.image];
        } else {
            // Final fallback to a placeholder
            this.images = ['https://via.placeholder.com/600x400?text=Property+Image'];
        }
        this.currentImageIndex = 0;
        
        this.render();
        this.attachEventListeners();
    },
    
    render() {
        const container = document.getElementById('propertyDetails');
        
        // Update breadcrumb
        document.getElementById('breadcrumbCurrent').textContent = this.property.address;
        document.title = `${this.property.address} - Netita Properties`;
        
        // Build property details HTML with gallery
        const detailsHTML = `
            <div class="container">
                <!-- Image Gallery -->
                <div class="property-gallery">
                    <div class="property-gallery__main">
                        <img 
                            id="mainImage" 
                            src="${this.images[this.currentImageIndex]}" 
                            alt="${this.property.address}" 
                            class="property-gallery__image"
                            onerror="this.src='https://via.placeholder.com/600x400?text=Property+Image'"
                        >
                        <button class="property-gallery__nav property-gallery__nav--prev" id="prevImage" aria-label="Previous image" title="Previous">‹</button>
                        <button class="property-gallery__nav property-gallery__nav--next" id="nextImage" aria-label="Next image" title="Next">›</button>
                        <div class="property-gallery__counter" aria-live="polite" aria-atomic="true">
                            <span id="imageCounter">${this.currentImageIndex + 1}</span> / <span>${this.images.length}</span>
                        </div>
                    </div>
                    
                    <!-- Thumbnails -->
                    <div class="property-gallery__thumbnails" role="region" aria-label="Image thumbnails">
                        ${this.images.map((img, idx) => `
                            <button 
                                class="property-gallery__thumbnail ${idx === this.currentImageIndex ? 'active' : ''}"
                                data-index="${idx}"
                                aria-label="View image ${idx + 1} of ${this.images.length}"
                                aria-current="${idx === this.currentImageIndex ? 'true' : 'false'}"
                            >
                                <img src="${img}" alt="Thumbnail ${idx + 1}" loading="lazy" onerror="this.src='https://via.placeholder.com/80x60?text=Thumb'">
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Lightbox Modal -->
                <div id="imageLightbox" class="property-gallery__lightbox" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 9999; overflow: auto;">
                    <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                        <button id="lightboxClose" style="position: absolute; top: 20px; right: 30px; font-size: 40px; font-weight: bold; color: white; background: none; border: none; cursor: pointer;" aria-label="Close lightbox">×</button>
                        <img id="lightboxImage" src="" alt="Full size property image" style="max-width: 90%; max-height: 90%; object-fit: contain;">
                        <button id="lightboxPrev" style="position: absolute; left: 20px; font-size: 36px; color: white; background: none; border: none; cursor: pointer; padding: 10px;" aria-label="Previous image">‹</button>
                        <button id="lightboxNext" style="position: absolute; right: 20px; font-size: 36px; color: white; background: none; border: none; cursor: pointer; padding: 10px;" aria-label="Next image">›</button>
                        <div style="position: absolute; bottom: 20px; color: white; font-size: 16px; background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 4px;">
                            <span id="lightboxCounter">1</span> / <span id="lightboxTotal">1</span>
                        </div>
                    </div>
                </div>
                
                <div class="property-details__main">
                    <div class="property-details__info">
                        <div class="property-details__price">${APP.Utilities.formatCurrency(this.property.price)}</div>
                        <div class="property-details__address">${this.property.address}</div>
                        <div class="property-details__location">📍 ${this.property.location}</div>
                        
                        <div class="property-details__meta">
                            <div class="property-details__meta-item">
                                <span class="property-details__meta-label">Bedrooms</span>
                                <span class="property-details__meta-value">${this.property.bedrooms}</span>
                            </div>
                            <div class="property-details__meta-item">
                                <span class="property-details__meta-label">Bathrooms</span>
                                <span class="property-details__meta-value">${this.property.bathrooms}</span>
                            </div>
                            <div class="property-details__meta-item">
                                <span class="property-details__meta-label">Square Feet</span>
                                <span class="property-details__meta-value">${APP.Utilities.formatNumber(this.property.sqft)}</span>
                            </div>
                            <div class="property-details__meta-item">
                                <span class="property-details__meta-label">Year Built</span>
                                <span class="property-details__meta-value">${this.property.yearBuilt}</span>
                            </div>
                        </div>
                        
                        <div class="property-details__description">
                            <h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-base);">About This Property</h3>
                            <p>${this.property.description}</p>
                        </div>
                        
                        <div class="property-details__amenities">
                            <h3 class="property-details__amenities-title">Amenities & Features</h3>
                            <ul class="property-details__amenities-list">
                                ${this.property.amenities.map(amenity => `
                                    <li class="property-details__amenities-item">${amenity}</li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div style="padding-top: var(--spacing-lg); border-top: 1px solid var(--color-border);">
                            <p style="color: var(--color-text-lighter); font-size: var(--font-size-sm);">
                                <strong>Property Type:</strong> ${this.property.type}<br>
                                <strong>Listed:</strong> ${new Date(this.property.listingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    
                    <div class="property-details__sidebar">
                        <div class="property-details__card">
                            <h4 class="property-details__card-title">Quick Info</h4>
                            <dl style="font-size: var(--font-size-sm); color: var(--color-text-light);">
                                <dt style="font-weight: var(--font-weight-semibold); color: var(--color-text); margin-top: var(--spacing-base);">Property ID</dt>
                                <dd>#${String(this.property.id).padStart(5, '0')}</dd>
                                
                                <dt style="font-weight: var(--font-weight-semibold); color: var(--color-text); margin-top: var(--spacing-base);">Price per Sqft</dt>
                                <dd>${APP.Utilities.formatCurrency(Math.round(this.property.price / this.property.sqft))}</dd>
                                
                                <dt style="font-weight: var(--font-weight-semibold); color: var(--color-text); margin-top: var(--spacing-base);">Status</dt>
                                <dd><span style="background-color: var(--color-success); color: white; padding: 2px 8px; border-radius: var(--radius-sm); font-size: var(--font-size-xs);">Available</span></dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = detailsHTML;
        this.renderSimilarProperties();
    },
    
    renderSimilarProperties() {
        const similarContainer = document.getElementById('similarProperties');
        
        // Find similar properties (same type or location, excluding current)
        const similar = APP.properties.filter(p => 
            p.id !== this.property.id && 
            (p.type === this.property.type || p.location === this.property.location)
        ).slice(0, 3);
        
        similarContainer.innerHTML = '';
        
        if (similar.length === 0) {
            similarContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--color-text-light);">No similar properties found</p>';
            return;
        }
        
        similar.forEach(property => {
            const card = APP.PropertyCardFactory.createCard(property);
            similarContainer.appendChild(card);
        });
    },
    
    attachEventListeners() {
        const form = document.getElementById('agentContactForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Gallery image navigation
        const prevBtn = document.getElementById('prevImage');
        const nextBtn = document.getElementById('nextImage');
        const thumbnails = document.querySelectorAll('.property-gallery__thumbnail');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousImage());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextImage());
        
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const idx = parseInt(thumb.dataset.index);
                this.showImage(idx);
            });
        });
        
        // Lightbox handlers
        const mainImage = document.getElementById('mainImage');
        const lightbox = document.getElementById('imageLightbox');
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxClose = document.getElementById('lightboxClose');
        const lightboxPrev = document.getElementById('lightboxPrev');
        const lightboxNext = document.getElementById('lightboxNext');
        
        if (mainImage) {
            mainImage.addEventListener('click', () => this.openLightbox());
            mainImage.style.cursor = 'pointer';
        }
        
        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => this.closeLightbox());
        }
        
        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', () => {
                this.previousImage();
                this.updateLightbox();
            });
        }
        
        if (lightboxNext) {
            lightboxNext.addEventListener('click', () => {
                this.nextImage();
                this.updateLightbox();
            });
        }
        
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    this.closeLightbox();
                }
            });
        }
        
        // Keyboard navigation for gallery
        document.addEventListener('keydown', (e) => {
            const lightbox = document.getElementById('imageLightbox');
            if (lightbox && lightbox.style.display !== 'none') {
                if (e.key === 'ArrowLeft') {
                    this.previousImage();
                    this.updateLightbox();
                }
                if (e.key === 'ArrowRight') {
                    this.nextImage();
                    this.updateLightbox();
                }
                if (e.key === 'Escape') {
                    this.closeLightbox();
                }
            } else {
                if (e.key === 'ArrowLeft') this.previousImage();
                if (e.key === 'ArrowRight') this.nextImage();
            }
        });
    },
    
    previousImage() {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
        this.updateGalleryDisplay();
    },
    
    nextImage() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        this.updateGalleryDisplay();
    },
    
    showImage(idx) {
        if (idx >= 0 && idx < this.images.length) {
            this.currentImageIndex = idx;
            this.updateGalleryDisplay();
        }
    },
    
    updateGalleryDisplay() {
        const mainImg = document.getElementById('mainImage');
        const counter = document.getElementById('imageCounter');
        const thumbnails = document.querySelectorAll('.property-gallery__thumbnail');
        
        if (mainImg) {
            mainImg.src = this.images[this.currentImageIndex];
        }
        
        if (counter) {
            counter.textContent = this.currentImageIndex + 1;
        }
        
        thumbnails.forEach((thumb, idx) => {
            const isCurrent = idx === this.currentImageIndex;
            thumb.classList.toggle('active', isCurrent);
            thumb.setAttribute('aria-current', String(isCurrent));
        });
    },
    
    openLightbox() {
        const lightbox = document.getElementById('imageLightbox');
        if (lightbox) {
            lightbox.style.display = 'block';
            this.updateLightbox();
            document.body.style.overflow = 'hidden';
        }
    },
    
    closeLightbox() {
        const lightbox = document.getElementById('imageLightbox');
        if (lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },
    
    updateLightbox() {
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxCounter = document.getElementById('lightboxCounter');
        const lightboxTotal = document.getElementById('lightboxTotal');
        
        if (lightboxImage) {
            lightboxImage.src = this.images[this.currentImageIndex];
        }
        if (lightboxCounter) {
            lightboxCounter.textContent = this.currentImageIndex + 1;
        }
        if (lightboxTotal) {
            lightboxTotal.textContent = this.images.length;
        }
    },
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        // Collect form data
        const name = e.target.querySelector('input[type="text"]').value;
        const email = e.target.querySelector('input[type="email"]').value;
        const phone = e.target.querySelector('input[type="tel"]').value;
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Show success message
        alert(`Thank you, ${name}! We'll contact you soon about this property.`);
        e.target.reset();
    },
    
    showError(message) {
        const container = document.getElementById('propertyDetails');
        container.innerHTML = `
            <div class="container">
                <div style="text-align: center; padding: var(--spacing-4xl) var(--spacing-base);">
                    <h2 style="color: var(--color-danger); margin-bottom: var(--spacing-base);">⚠️ ${message}</h2>
                    <p style="color: var(--color-text-light); margin-bottom: var(--spacing-2xl);">The property you're looking for could not be found.</p>
                    <a href="listings.html" class="button button--primary">← Back to Listings</a>
                </div>
            </div>
        `;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PropertyDetailsHandler.init());
} else {
    PropertyDetailsHandler.init();
}
