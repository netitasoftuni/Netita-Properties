/**
 * Netita Properties - Property Details Page JavaScript
 * Handles loading and displaying individual property information
 */

const PropertyDetailsHandler = {
    property: null,
    currentImageIndex: 0,
    images: [],
    imotiUrl: null,
    imotiInsights: null,

    // Lightweight local metrics for bundled demo data.
    // NOTE: These are simple benchmarks; adjust if you have real comps.
    localDistrictMetrics: {
        'Sofia City': { avg_price_per_m2: 2500, avg_rent_per_m2: 12, growth_pct_yoy: 3.5, demand_index: 70, liquidity_index: 65 },
        'Sofia': { avg_price_per_m2: 2500, avg_rent_per_m2: 12, growth_pct_yoy: 3.5, demand_index: 70, liquidity_index: 65 },
        'Plovdiv': { avg_price_per_m2: 1400, avg_rent_per_m2: 9, growth_pct_yoy: 2.8, demand_index: 60, liquidity_index: 55 },
        'Varna': { avg_price_per_m2: 1600, avg_rent_per_m2: 10, growth_pct_yoy: 3.0, demand_index: 62, liquidity_index: 55 },
        'Burgas': { avg_price_per_m2: 1300, avg_rent_per_m2: 9, growth_pct_yoy: 2.5, demand_index: 58, liquidity_index: 50 },
        'Ruse': { avg_price_per_m2: 1100, avg_rent_per_m2: 8, growth_pct_yoy: 2.0, demand_index: 52, liquidity_index: 48 },
        'Vidin': { avg_price_per_m2: 800, avg_rent_per_m2: 6, growth_pct_yoy: 1.2, demand_index: 45, liquidity_index: 40 },
        'Haskovo': { avg_price_per_m2: 900, avg_rent_per_m2: 7, growth_pct_yoy: 1.6, demand_index: 48, liquidity_index: 44 },
        'Gabrovo': { avg_price_per_m2: 850, avg_rent_per_m2: 6.5, growth_pct_yoy: 1.4, demand_index: 46, liquidity_index: 42 },
        'Trendy Varna': { avg_price_per_m2: 1750, avg_rent_per_m2: 10.5, growth_pct_yoy: 3.2, demand_index: 65, liquidity_index: 58 }
    },
    
    init() {
        const params = APP.Utilities.getQueryParams();
        // AI insights mode (imoti.net URL)
        if (params.imotiUrl) {
            this.imotiUrl = params.imotiUrl;
            this.renderImotiLoading();
            this.loadImotiInsights();
            return;
        }

        const propertyId = parseInt(params.id);
        const aiMode = String(params.ai || '') === '1';
        
        if (!propertyId) {
            this.showError('No property specified');
            return;
        }
        
        this.property = APP.properties.find(p => p.id === propertyId);
        
        if (!this.property) {
            this.showError('Property not found');
            return;
        }

        // Local AI-only mode (when user pastes a local property URL)
        if (aiMode) {
            this.renderLocalAiInsights();
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

    renderLocalAiInsights() {
        const container = document.getElementById('propertyDetails');
        document.getElementById('breadcrumbCurrent').textContent = 'AI Property Insights';
        document.title = 'AI Property Insights - Netita Properties';

        // Hide similar properties section for AI-only mode
        const similarSection = document.querySelector('.similar-properties');
        if (similarSection) similarSection.style.display = 'none';

        const insights = this.computeLocalInsights(this.property);
        if (!insights) {
            this.showError('Could not compute AI insights for this property');
            return;
        }

        const pa = insights.price_analysis;
        const score = insights.investment_score;
        const area = insights.area_insights;

        container.innerHTML = `
            <div class="container">
                <div class="property-details__main">
                    <div class="property-details__info">
                        <div class="property-details__price">Investment Score: ${score}/100</div>
                        <div class="property-details__address">AI Property Intelligence (Local)</div>
                        <div class="property-details__location">Based on the property’s structured fields</div>

                        <div class="property-details__meta">
                            <div class="property-details__meta-item">
                                <span class="property-details__meta-label">Price per m²</span>
                                <span class="property-details__meta-value">${pa.price_per_m2} €/m²</span>
                            </div>
                            <div class="property-details__meta-item">
                                <span class="property-details__meta-label">Area Avg</span>
                                <span class="property-details__meta-value">${pa.district_avg_price_per_m2} €/m²</span>
                            </div>
                            <div class="property-details__meta-item">
                                <span class="property-details__meta-label">Deviation</span>
                                <span class="property-details__meta-value">${pa.deviation_pct}%</span>
                            </div>
                            <div class="property-details__meta-item">
                                <span class="property-details__meta-label">Classification</span>
                                <span class="property-details__meta-value">${pa.classification}</span>
                            </div>
                        </div>

                        <div class="property-details__description">
                            <h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-base);">Price Analysis</h3>
                            <p>${pa.explanation}</p>
                        </div>

                        <div class="property-details__description">
                            <h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-base);">Area Insights</h3>
                            <p>${area}</p>
                        </div>

                        <div style="padding-top: var(--spacing-lg); border-top: 1px solid var(--color-border);">
                            <p style="color: var(--color-text-lighter); font-size: var(--font-size-sm);">
                                This is an automated estimate based on the local dataset and area benchmarks.
                            </p>
                        </div>
                    </div>

                    <div class="property-details__sidebar">
                        <div class="property-details__card">
                            <h4 class="property-details__card-title">Source</h4>
                            <p style="font-size: var(--font-size-sm); color: var(--color-text-light);">
                                Property #${String(this.property.id).padStart(5, '0')} — ${this.property.address}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    },

    normalizeTo100(value, { min, max }) {
        if (!Number.isFinite(value)) return 0;
        if (max === min) return 0;
        return this.clamp(((value - min) / (max - min)) * 100, 0, 100);
    },

    round2(n) {
        return Math.round(n * 100) / 100;
    },

    typeRentMultiplier(propertyType) {
        const t = String(propertyType || '').toLowerCase();
        if (t.includes('studio')) return 1.1;
        if (t.includes('office')) return 0.9;
        if (t.includes('house')) return 0.95;
        return 1.0;
    },

    getLocalDistrictMetrics(property) {
        const key = String(property?.location || '').trim();
        return this.localDistrictMetrics[key] || { avg_price_per_m2: 1400, avg_rent_per_m2: 9, growth_pct_yoy: 2.0, demand_index: 50, liquidity_index: 50 };
    },

    computeLocalInsights(property) {
        const price = Number(property?.price);
        const sqft = Number(property?.sqft);
        if (!Number.isFinite(price) || !Number.isFinite(sqft) || sqft <= 0) return null;

        const area_m2 = sqft * 0.092903;
        const district = String(property?.location || 'Unknown');
        const property_type = String(property?.type || 'Property');
        const districtMetrics = this.getLocalDistrictMetrics(property);

        const pricePerM2 = price / area_m2;
        const districtAvg = Number(districtMetrics?.avg_price_per_m2) || pricePerM2;
        const deviationPct = ((pricePerM2 - districtAvg) / districtAvg) * 100;

        let classification = 'Fair';
        if (deviationPct <= -8) classification = 'Undervalued';
        else if (deviationPct >= 8) classification = 'Overpriced';

        const price_analysis = {
            price_per_m2: Math.round(pricePerM2),
            district_avg_price_per_m2: Math.round(districtAvg),
            deviation_pct: this.round2(deviationPct),
            classification,
            explanation:
                `Based on an estimated area average of ${Math.round(districtAvg)} €/m² in ${district}, ` +
                `this property is ${Math.abs(this.round2(deviationPct))}% ${deviationPct < 0 ? 'below' : 'above'} the benchmark.`
        };

        const avgRentPerM2 = Number(districtMetrics?.avg_rent_per_m2) || 10;
        const growth = Number(districtMetrics?.growth_pct_yoy) || 0;
        const demand = Number(districtMetrics?.demand_index) || 50;
        const liquidity = Number(districtMetrics?.liquidity_index) || 50;

        const estMonthlyRent = avgRentPerM2 * area_m2 * this.typeRentMultiplier(property_type);
        const grossYield = ((estMonthlyRent * 12) / price) * 100;
        const priceEdge = -Number(price_analysis.deviation_pct) || 0;

        const yieldScore = this.normalizeTo100(grossYield, { min: 2, max: 8 });
        const growthScore = this.normalizeTo100(growth, { min: 0, max: 8 });
        const demandScore = this.clamp(demand, 0, 100);
        const liquidityScore = this.clamp(liquidity, 0, 100);
        const priceEdgeScore = this.normalizeTo100(priceEdge, { min: -10, max: 20 });

        const investment_score = Math.round(
            this.clamp(
                yieldScore * 0.35 + demandScore * 0.20 + liquidityScore * 0.20 + growthScore * 0.15 + priceEdgeScore * 0.10,
                0,
                100
            )
        );

        const demandLabel = demandScore >= 75 ? 'high' : demandScore >= 55 ? 'steady' : 'mixed';
        const liquidityLabel = liquidityScore >= 75 ? 'high' : liquidityScore >= 55 ? 'moderate' : 'lower';

        const area_insights =
            `${district} shows ${demandLabel} demand with ${liquidityLabel} liquidity. ` +
            `Typical pricing is around ${Math.round(Number(districtMetrics?.avg_price_per_m2) || 0)} €/m², ` +
            `with average rents near ${Math.round(Number(districtMetrics?.avg_rent_per_m2) || 0)} €/m². ` +
            `Recent growth is approximately ${Number(growth).toFixed(1)}% YoY.`;

        return { price_analysis, investment_score, area_insights };
    },

    renderImotiLoading() {
        const container = document.getElementById('propertyDetails');
        document.getElementById('breadcrumbCurrent').textContent = 'AI Property Insights';
        document.title = 'AI Property Insights - Netita Properties';

        // Hide similar properties section for imoti mode (avoid republishing platform listings here)
        const similarSection = document.querySelector('.similar-properties');
        if (similarSection) similarSection.style.display = 'none';

        container.innerHTML = `
            <div class="container">
                <div class="property-details__main">
                    <div class="property-details__info">
                        <div class="property-details__price">Analyzing...</div>
                        <div class="property-details__address">AI Property Intelligence</div>
                        <div class="property-details__location">📍 Processing imoti.net URL</div>
                        <div class="property-details__description">
                            <p>We only extract minimal structured numeric fields and return insights (no listing text or images).</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async loadImotiInsights() {
        try {
            const res = await fetch('/api/imoti/analyze', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ url: this.imotiUrl })
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) {
                const msg = data?.error?.message || 'Failed to analyze URL';
                throw new Error(msg);
            }

            this.imotiInsights = data;
            this.renderImotiInsights();
        } catch (e) {
            this.showError(e?.message || 'Failed to analyze URL');
        }
    },

    renderImotiInsights() {
        const container = document.getElementById('propertyDetails');
        const insights = this.imotiInsights;
        if (!insights) {
            this.showError('No insights available');
            return;
        }

        const pa = insights.price_analysis;
        const score = insights.investment_score;
        const area = insights.area_insights;

        container.innerHTML = `
            <div class="container">
                <div class="property-details__main">
                    <div class="property-details__info">
                        <div class="property-details__price">Investment Score: ${score}/100</div>
                        <div class="property-details__address">AI Property Intelligence</div>
                        <div class="property-details__location">Insights only (no listing content)</div>

                        <div class="property-details__meta">
                            <div class="property-details__meta-item">
                                <span class="property-details__meta-label">Price per m²</span>
                                <span class="property-details__meta-value">${pa.price_per_m2} €/m²</span>
                            </div>
                            <div class="property-details__meta-item">
                                <span class="property-details__meta-label">District Avg</span>
                                <span class="property-details__meta-value">${pa.district_avg_price_per_m2} €/m²</span>
                            </div>
                            <div class="property-details__meta-item">
                                <span class="property-details__meta-label">Deviation</span>
                                <span class="property-details__meta-value">${pa.deviation_pct}%</span>
                            </div>
                            <div class="property-details__meta-item">
                                <span class="property-details__meta-label">Classification</span>
                                <span class="property-details__meta-value">${pa.classification}</span>
                            </div>
                        </div>

                        <div class="property-details__description">
                            <h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-base);">Price Analysis</h3>
                            <p>${pa.explanation}</p>
                        </div>

                        <div class="property-details__description">
                            <h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-base);">Area Insights</h3>
                            <p>${area}</p>
                        </div>

                        <div style="padding-top: var(--spacing-lg); border-top: 1px solid var(--color-border);">
                            <p style="color: var(--color-text-lighter); font-size: var(--font-size-sm);">
                                This is an automated estimate based on extracted structured fields and district benchmarks.
                            </p>
                        </div>
                    </div>

                    <div class="property-details__sidebar">
                        <div class="property-details__card">
                            <h4 class="property-details__card-title">Source</h4>
                            <p style="font-size: var(--font-size-sm); color: var(--color-text-light); overflow-wrap: anywhere;">
                                ${this.imotiUrl}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    render() {
        const container = document.getElementById('propertyDetails');
        
        // Update breadcrumb
        document.getElementById('breadcrumbCurrent').textContent = this.property.address;
        document.title = `${this.property.address} - Netita Properties`;
        
        const localInsights = this.computeLocalInsights(this.property);

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

                        ${localInsights ? `
                        <div class="property-details__description">
                            <h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-base);">AI Property Insights</h3>
                            <p style="margin-bottom: var(--spacing-base); color: var(--color-text-light);">Investment Score: <strong>${localInsights.investment_score}/100</strong></p>

                            <div class="property-details__meta" style="margin-bottom: var(--spacing-lg);">
                                <div class="property-details__meta-item">
                                    <span class="property-details__meta-label">Price per m²</span>
                                    <span class="property-details__meta-value">${localInsights.price_analysis.price_per_m2} €/m²</span>
                                </div>
                                <div class="property-details__meta-item">
                                    <span class="property-details__meta-label">Area Avg</span>
                                    <span class="property-details__meta-value">${localInsights.price_analysis.district_avg_price_per_m2} €/m²</span>
                                </div>
                                <div class="property-details__meta-item">
                                    <span class="property-details__meta-label">Deviation</span>
                                    <span class="property-details__meta-value">${localInsights.price_analysis.deviation_pct}%</span>
                                </div>
                                <div class="property-details__meta-item">
                                    <span class="property-details__meta-label">Classification</span>
                                    <span class="property-details__meta-value">${localInsights.price_analysis.classification}</span>
                                </div>
                            </div>

                            <p style="margin-bottom: var(--spacing-base);">${localInsights.price_analysis.explanation}</p>
                            <p>${localInsights.area_insights}</p>

                            <p style="color: var(--color-text-lighter); font-size: var(--font-size-sm); margin-top: var(--spacing-lg);">
                                This is an automated estimate based on the property’s structured fields and area benchmarks.
                            </p>
                        </div>
                        ` : ''}
                        
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

                        <div style="margin-top: var(--spacing-lg);">
                            <a href="property-details.html?id=${this.property.id}&ai=1" class="button button--primary" aria-label="Open AI Property Intelligence for this property">
                                AI Property Intelligence (Local)
                            </a>
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
        const isImotiMode = !!this.imotiUrl;
        const subtitle = isImotiMode
            ? 'We could not analyze the provided imoti.net URL. Please verify the link and try again.'
            : "The property you're looking for could not be found.";
        container.innerHTML = `
            <div class="container">
                <div style="text-align: center; padding: var(--spacing-4xl) var(--spacing-base);">
                    <h2 style="color: var(--color-danger); margin-bottom: var(--spacing-base);">⚠️ ${message}</h2>
                    <p style="color: var(--color-text-light); margin-bottom: var(--spacing-2xl);">${subtitle}</p>
                    <a href="${isImotiMode ? 'index.html' : 'listings.html'}" class="button button--primary">← Back</a>
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
