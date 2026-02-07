/**
 * Custom Dropdown Component
 * Replaces native select elements with styled dropdown menus
 */

class CustomDropdown {
    constructor(selectElement) {
        this.select = selectElement;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createDropdown();
        this.attachEvents();
    }

    createDropdown() {
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-dropdown-wrapper';

        // Create button that shows selected value
        const button = document.createElement('button');
        button.className = 'custom-dropdown-button search-bar__select';
        button.textContent = this.select.options[this.select.selectedIndex].text;
        button.type = 'button';

        // Create menu
        const menu = document.createElement('div');
        menu.className = 'custom-dropdown-menu';

        // Add options to menu
        Array.from(this.select.options).forEach((option, index) => {
            const item = document.createElement('div');
            item.className = 'custom-dropdown-item';
            item.textContent = option.text;
            item.dataset.value = option.value;
            item.dataset.index = index;

            if (index === this.select.selectedIndex) {
                item.classList.add('selected');
            }

            item.addEventListener('click', () => this.selectOption(index, item, button));
            menu.appendChild(item);
        });

        // Build structure
        wrapper.appendChild(button);
        wrapper.appendChild(menu);

        // Replace select with wrapper
        this.select.style.display = 'none';
        this.select.parentNode.insertBefore(wrapper, this.select);

        this.button = button;
        this.menu = menu;
        this.wrapper = wrapper;
    }

    attachEvents() {
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMenu();
        });

        document.addEventListener('click', (e) => {
            if (!this.wrapper.contains(e.target)) {
                this.closeMenu();
            }
        });

        this.menu.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMenu();
                this.button.focus();
            }
        });
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.menu.classList.add('open');
        this.isOpen = true;
        this.button.setAttribute('aria-expanded', 'true');
    }

    closeMenu() {
        this.menu.classList.remove('open');
        this.isOpen = false;
        this.button.setAttribute('aria-expanded', 'false');
    }

    selectOption(index, itemElement, button) {
        this.select.selectedIndex = index;
        this.button.textContent = itemElement.textContent;

        // Update visual state
        document.querySelectorAll('.custom-dropdown-item', this.menu).forEach(item => {
            item.classList.remove('selected');
        });
        itemElement.classList.add('selected');

        // Trigger change event
        this.select.dispatchEvent(new Event('change', { bubbles: true }));

        this.closeMenu();
    }
}

// Initialize custom dropdowns when DOM is ready
function initCustomDropdowns() {
    const selects = document.querySelectorAll('.search-bar__select');
    selects.forEach(select => {
        new CustomDropdown(select);
    });
}

// Wait for DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomDropdowns);
} else {
    initCustomDropdowns();
}
