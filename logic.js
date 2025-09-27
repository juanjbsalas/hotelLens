// Hotel Lens - Interactive Booking System JavaScript
// Enhanced form validation, search functionality, and user interactions

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Set up form validation and submission
    setupFormHandling();
    
    // Set up navigation
    setupNavigation();
    
    // Set up date constraints
    setupDateConstraints();
    
    // Set up accessibility enhancements
    setupAccessibilityEnhancements();
    
    // Set up mobile navigation if needed
    setupMobileNavigation();
    
    // Initialize animations
    initializeAnimations();
}

// Form Handling and Validation
function setupFormHandling() {
    const searchForm = document.getElementById('searchForm');
    const destinationInput = document.getElementById('destination');
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const guestsSelect = document.getElementById('guests');
    
    if (!searchForm) return;
    
    // Form submission handler
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            handleFormSubmission();
        }
    });
    
    // Real-time validation
    destinationInput?.addEventListener('input', validateDestination);
    checkinInput?.addEventListener('change', validateDates);
    checkoutInput?.addEventListener('change', validateDates);
    guestsSelect?.addEventListener('change', validateGuests);
    
    // Enhanced input interactions
    setupInputEnhancements();
}

function validateForm() {
    let isValid = true;
    const errors = [];
    
    // Validate destination
    const destination = document.getElementById('destination').value.trim();
    if (!destination || destination.length < 2) {
        showFieldError('destination', 'Please enter a valid destination (minimum 2 characters)');
        isValid = false;
        errors.push('Invalid destination');
    } else {
        clearFieldError('destination');
    }
    
    // Validate dates
    const checkin = new Date(document.getElementById('checkin').value);
    const checkout = new Date(document.getElementById('checkout').value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!checkin || checkin < today) {
        showFieldError('checkin', 'Check-in date must be today or later');
        isValid = false;
        errors.push('Invalid check-in date');
    } else {
        clearFieldError('checkin');
    }
    
    if (!checkout || checkout <= checkin) {
        showFieldError('checkout', 'Check-out date must be after check-in date');
        isValid = false;
        errors.push('Invalid check-out date');
    } else {
        clearFieldError('checkout');
    }
    
    // Validate guests
    const guests = document.getElementById('guests').value;
    if (!guests) {
        showFieldError('guests', 'Please select number of guests');
        isValid = false;
        errors.push('No guests selected');
    } else {
        clearFieldError('guests');
    }
    
    return isValid;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    
    // Remove existing error
    clearFieldError(fieldId);
    
    // Add error styling
    field.style.borderColor = '#dc3545';
    field.setAttribute('aria-invalid', 'true');
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        color: #dc3545;
        font-size: 0.8rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
    `;
    errorDiv.innerHTML = `<span style="margin-right: 4px;">⚠</span>${message}`;
    errorDiv.setAttribute('role', 'alert');
    
    formGroup.appendChild(errorDiv);
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    const existingError = formGroup.querySelector('.error-message');
    
    if (existingError) {
        existingError.remove();
    }
    
    field.style.borderColor = '';
    field.removeAttribute('aria-invalid');
}

function handleFormSubmission() {
    const formData = {
        destination: document.getElementById('destination').value.trim(),
        checkin: document.getElementById('checkin').value,
        checkout: document.getElementById('checkout').value,
        guests: document.getElementById('guests').value
    };
    
    // Show loading state
    showLoadingState();
    
    // Simulate API call with timeout
    setTimeout(() => {
        hideLoadingState();
        showSearchResults(formData);
    }, 1500);
}

function showLoadingState() {
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.disabled = true;
    searchBtn.innerHTML = `
        <span style="display: inline-flex; align-items: center;">
            <span style="width: 16px; height: 16px; margin-right: 8px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></span>
            Searching Hotels...
        </span>
    `;
    
    // Add spin animation
    if (!document.querySelector('#spin-style')) {
        const style = document.createElement('style');
        style.id = 'spin-style';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

function hideLoadingState() {
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.disabled = false;
    searchBtn.innerHTML = 'Search Available Hotels';
}

function showSearchResults(searchData) {
    // Create results summary
    const checkinDate = new Date(searchData.checkin).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    const checkoutDate = new Date(searchData.checkout).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const message = `Found hotels in ${searchData.destination} for ${searchData.guests} guest(s) from ${checkinDate} to ${checkoutDate}`;
    
    // Show success notification
    showNotification(message, 'success');
    
    // In a real application, this would redirect to results page or show results
    console.log('Search Results:', searchData);
}

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Handle internal navigation
            if (href.startsWith('#')) {
                e.preventDefault();
                smoothScrollToSection(href);
            }
        });
    });
}

function smoothScrollToSection(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Date Constraints
function setupDateConstraints() {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    if (!checkinInput || !checkoutInput) return;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    checkinInput.min = today;
    checkoutInput.min = today;
    
    // Update checkout minimum when checkin changes
    checkinInput.addEventListener('change', function() {
        const checkinDate = new Date(this.value);
        const minCheckout = new Date(checkinDate);
        minCheckout.setDate(minCheckout.getDate() + 1);
        
        checkoutInput.min = minCheckout.toISOString().split('T')[0];
        
        // Clear checkout if it's before new minimum
        if (checkoutInput.value && new Date(checkoutInput.value) <= checkinDate) {
            checkoutInput.value = '';
        }
    });
}

// Input Enhancements
function setupInputEnhancements() {
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        // Add focus/blur effects
        input.addEventListener('focus', function() {
            this.closest('.form-group').classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.closest('.form-group').classList.remove('focused');
        });
        
        // Add filled state for styling
        input.addEventListener('input', function() {
            if (this.value) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    });
}

// Accessibility Enhancements
function setupAccessibilityEnhancements() {
    // Keyboard navigation for form
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            const form = e.target.closest('form');
            if (form && e.target !== form.querySelector('[type="submit"]')) {
                e.preventDefault();
                const submitBtn = form.querySelector('[type="submit"]');
                if (submitBtn) submitBtn.click();
            }
        }
    });
    
    // Announce form validation results to screen readers
    const form = document.getElementById('searchForm');
    if (form) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        announcement.id = 'form-announcements';
        form.appendChild(announcement);
    }
}

// Mobile Navigation
function setupMobileNavigation() {
    // This would handle mobile menu if you add a hamburger menu later
    const nav = document.querySelector('nav');
    
    // Add touch-friendly interactions for mobile
    if ('ontouchstart' in window) {
        nav.classList.add('touch-device');
    }
}

// Animations
function initializeAnimations() {
    // Add intersection observer for animations
    const animatedElements = document.querySelectorAll('.hero-content, .search-form');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => observer.observe(el));
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 6px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        z-index: 1000;
        max-width: 300px;
        font-size: 0.9rem;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        role: alert;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

function validateDestination(e) {
    const value = e.target.value.trim();
    if (value.length > 0 && value.length < 2) {
        showFieldError('destination', 'Destination must be at least 2 characters');
    } else if (value.length >= 2) {
        clearFieldError('destination');
    }
}

function validateDates() {
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    
    if (checkin && checkout) {
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);
        
        if (checkoutDate <= checkinDate) {
            showFieldError('checkout', 'Check-out date must be after check-in date');
        } else {
            clearFieldError('checkout');
        }
    }
}

function validateGuests() {
    const guests = document.getElementById('guests').value;
    if (guests) {
        clearFieldError('guests');
    }
}

// Export functions for potential external use
window.HotelLens = {
    validateForm,
    showNotification,
    smoothScrollToSection
};