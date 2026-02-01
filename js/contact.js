/**
 * Netita Properties - Contact Page JavaScript
 * Handles contact form submission and validation
 */

const ContactHandler = {
    form: null,
    fields: {},
    
    init() {
        this.cacheElements();
        this.attachEventListeners();
    },
    
    cacheElements() {
        this.form = document.getElementById('contactForm');
        this.fields = {
            fullName: document.getElementById('fullName'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            subject: document.getElementById('subject'),
            message: document.getElementById('message'),
            agreeTerms: document.getElementById('agreeTerms')
        };
    },
    
    attachEventListeners() {
        if (!this.form) return;
        
        // Submit handler
        this.form.addEventListener('submit', (e) => this.handleContactSubmit(e));
        
        // Real-time validation for fields
        if (this.fields.fullName) {
            this.fields.fullName.addEventListener('blur', () => this.validateField('fullName'));
            this.fields.fullName.addEventListener('input', () => this.validateField('fullName'));
        }
        
        if (this.fields.email) {
            this.fields.email.addEventListener('blur', () => this.validateField('email'));
            this.fields.email.addEventListener('input', () => this.validateField('email'));
        }
        
        if (this.fields.phone) {
            this.fields.phone.addEventListener('blur', () => this.validateField('phone'));
        }
        
        if (this.fields.subject) {
            this.fields.subject.addEventListener('change', () => this.validateField('subject'));
        }
        
        if (this.fields.message) {
            this.fields.message.addEventListener('blur', () => this.validateField('message'));
            this.fields.message.addEventListener('input', () => this.validateField('message'));
        }
    },
    
    validateField(fieldName) {
        const field = this.fields[fieldName];
        const errorElementId = `${fieldName}Error`;
        const errorElement = document.getElementById(errorElementId);
        
        if (!field || !errorElement) return true;
        
        let isValid = true;
        let errorMsg = '';
        
        const value = field.value.trim();
        
        switch (fieldName) {
            case 'fullName':
                if (!value) {
                    isValid = false;
                    errorMsg = 'Full name is required';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMsg = 'Full name must be at least 2 characters';
                }
                break;
            
            case 'email':
                if (!value) {
                    isValid = false;
                    errorMsg = 'Email is required';
                } else if (!this.isValidEmail(value)) {
                    isValid = false;
                    errorMsg = 'Please enter a valid email address';
                }
                break;
            
            case 'phone':
                if (value && !this.isValidPhone(value)) {
                    isValid = false;
                    errorMsg = 'Please enter a valid phone number';
                }
                break;
            
            case 'subject':
                if (!value) {
                    isValid = false;
                    errorMsg = 'Please select a subject';
                }
                break;
            
            case 'message':
                if (!value) {
                    isValid = false;
                    errorMsg = 'Message must be at least 10 characters';
                } else if (value.length < 10) {
                    isValid = false;
                    errorMsg = 'Message must be at least 10 characters';
                }
                break;
        }
        
        if (!isValid) {
            field.setAttribute('aria-invalid', 'true');
            field.setAttribute('aria-describedby', errorElementId);
            errorElement.textContent = errorMsg;
            errorElement.setAttribute('role', 'alert');
            errorElement.style.display = 'block';
        } else {
            field.setAttribute('aria-invalid', 'false');
            field.removeAttribute('aria-describedby');
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        return isValid;
    },
    
    handleContactSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const fieldsToValidate = ['fullName', 'email', 'subject', 'message'];
        let hasErrors = false;
        
        fieldsToValidate.forEach(field => {
            if (!this.validateField(field)) {
                hasErrors = true;
            }
        });
        
        // Check terms agreement
        if (!this.fields.agreeTerms.checked) {
            const errorDiv = document.createElement('div');
            errorDiv.setAttribute('role', 'alert');
            errorDiv.style.color = 'var(--color-danger)';
            errorDiv.style.fontSize = 'var(--font-size-sm)';
            errorDiv.style.marginTop = 'var(--spacing-sm)';
            errorDiv.textContent = 'You must agree to the privacy policy';
            this.fields.agreeTerms.parentElement.after(errorDiv);
            hasErrors = true;
        }
        
        if (hasErrors) {
            this.announceToScreenReader('Please fix the errors in the form before submitting');
            return;
        }
        
        // Form is valid - show success message
        const fullName = this.fields.fullName.value.trim();
        this.showSuccess(fullName);
    },
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    isValidPhone(phone) {
        const phoneRegex = /^[\d+\-\s()]{7,}$/;
        return phoneRegex.test(phone);
    },
    
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 3000);
    },
    
    showSuccess(name) {
        const form = document.getElementById('contactForm');
        const successDiv = document.getElementById('formSuccess');
        
        if (successDiv) {
            successDiv.style.display = 'block';
            successDiv.innerHTML = `<p>✓ Thank you, ${this.escapeHtml(name)}! Your message has been sent successfully. We'll get back to you soon.</p>`;
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 5000);
        }
    },
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ContactHandler.init());
} else {
    ContactHandler.init();
}
