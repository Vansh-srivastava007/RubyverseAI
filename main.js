/**
 * RubyVerse.ai Website JavaScript
 * Handles animations, form validation, and interactive elements
 */

(function() {
    'use strict';

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeAOS();
        initializeNavbar();
        initializeContactForm();
        initializeSmoothScrolling();
        initializeTooltips();
        initializeLoadingStates();
        initializePricingInteractions();
    });

    /**
     * Initialize AOS (Animate On Scroll) library
     */
    function initializeAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                offset: 100,
                disable: function() {
                    // Disable on mobile devices with small screens
                    var maxWidth = 768;
                    return window.innerWidth < maxWidth;
                }
            });
        }
    }

    /**
     * Initialize navbar scroll behavior and mobile navigation
     */
    function initializeNavbar() {
        const navbar = document.querySelector('.navbar');
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        if (!navbar) return;

        // Add scroll behavior to navbar
        let lastScrollTop = 0;
        let isScrolling = false;

        window.addEventListener('scroll', function() {
            if (!isScrolling) {
                window.requestAnimationFrame(function() {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    
                    // Add/remove shadow based on scroll position
                    if (scrollTop > 10) {
                        navbar.classList.add('shadow');
                    } else {
                        navbar.classList.remove('shadow');
                    }
                    
                    // Update last scroll position
                    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
                    isScrolling = false;
                });
                isScrolling = true;
            }
        });

        // Close mobile menu when clicking on nav links
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            });
        });

        // Handle navbar collapse on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 992 && navbarCollapse.classList.contains('show')) {
                navbarToggler.click();
            }
        });
    }

    /**
     * Initialize contact form validation and submission handling
     */
    function initializeContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.innerHTML : '';

        // Real-time validation
        const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(function(input) {
            input.addEventListener('blur', function() {
                validateField(input);
            });

            input.addEventListener('input', function() {
                clearFieldError(input);
            });
        });

        // Email validation
        const emailInput = contactForm.querySelector('input[type="email"]');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                validateEmail(emailInput);
            });
        }

        // Phone number formatting
        const phoneInput = contactForm.querySelector('input[type="tel"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                formatPhoneNumber(phoneInput);
            });
        }

        // Form submission handling
        contactForm.addEventListener('submit', function(e) {
            let isValid = true;

            // Validate all required fields
            inputs.forEach(function(input) {
                if (!validateField(input)) {
                    isValid = false;
                }
            });

            // Validate email specifically
            if (emailInput && !validateEmail(emailInput)) {
                isValid = false;
            }

            if (!isValid) {
                e.preventDefault();
                showFormError('Please fill in all required fields correctly.');
                return;
            }

            // Show loading state
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            }

            // Form will submit normally to Flask backend
            // Loading state will be cleared by page reload or navigation
        });

        /**
         * Validate individual form field
         */
        function validateField(field) {
            const value = field.value.trim();
            let isValid = true;

            if (field.hasAttribute('required') && !value) {
                showFieldError(field, 'This field is required.');
                isValid = false;
            } else if (field.type === 'email' && value && !isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address.');
                isValid = false;
            } else {
                clearFieldError(field);
            }

            return isValid;
        }

        /**
         * Validate email field
         */
        function validateEmail(field) {
            const value = field.value.trim();
            let isValid = true;

            if (field.hasAttribute('required') && !value) {
                showFieldError(field, 'Email is required.');
                isValid = false;
            } else if (value && !isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address.');
                isValid = false;
            } else {
                clearFieldError(field);
            }

            return isValid;
        }

        /**
         * Check if email format is valid
         */
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        /**
         * Format phone number input
         */
        function formatPhoneNumber(field) {
            let value = field.value.replace(/\D/g, '');
            
            // Add country code if not present and number starts with valid Indian mobile prefixes
            if (value.length === 10 && ['6', '7', '8', '9'].includes(value[0])) {
                value = '91' + value;
            }
            
            // Format: +91-XXXXX-XXXXX
            if (value.length >= 12 && value.startsWith('91')) {
                value = '+91-' + value.substring(2, 7) + '-' + value.substring(7, 12);
            }
            
            field.value = value;
        }

        /**
         * Show error message for specific field
         */
        function showFieldError(field, message) {
            clearFieldError(field);
            
            field.classList.add('is-invalid');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = message;
            
            field.parentNode.appendChild(errorDiv);
        }

        /**
         * Clear error message for specific field
         */
        function clearFieldError(field) {
            field.classList.remove('is-invalid');
            
            const errorDiv = field.parentNode.querySelector('.invalid-feedback');
            if (errorDiv) {
                errorDiv.remove();
            }
        }

        /**
         * Show general form error
         */
        function showFormError(message) {
            // Remove existing error alerts
            const existingAlerts = contactForm.querySelectorAll('.alert-danger');
            existingAlerts.forEach(function(alert) {
                alert.remove();
            });

            // Create new error alert
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
            alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;

            // Insert before submit button
            const submitRow = contactForm.querySelector('.col-12:last-child');
            if (submitRow) {
                submitRow.parentNode.insertBefore(alertDiv, submitRow);
            }

            // Auto-dismiss after 5 seconds
            setTimeout(function() {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        }
    }

    /**
     * Initialize smooth scrolling for anchor links
     */
    function initializeSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const href = link.getAttribute('href');
                const target = document.querySelector(href);
                
                if (target && href !== '#') {
                    e.preventDefault();
                    
                    const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Smooth scroll to top functionality
        const scrollToTopButton = document.createElement('button');
        scrollToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollToTopButton.className = 'btn btn-primary position-fixed';
        scrollToTopButton.style.cssText = `
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
        `;
        scrollToTopButton.setAttribute('aria-label', 'Scroll to top');
        
        document.body.appendChild(scrollToTopButton);

        // Show/hide scroll to top button
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopButton.style.opacity = '1';
                scrollToTopButton.style.visibility = 'visible';
            } else {
                scrollToTopButton.style.opacity = '0';
                scrollToTopButton.style.visibility = 'hidden';
            }
        });

        // Scroll to top when clicked
        scrollToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /**
     * Initialize Bootstrap tooltips
     */
    function initializeTooltips() {
        // Only initialize if Bootstrap tooltip is available
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            tooltipElements.forEach(function(element) {
                new bootstrap.Tooltip(element);
            });
        }
    }

    /**
     * Initialize loading states for buttons and links
     */
    function initializeLoadingStates() {
        // Add loading state to external links
        const externalLinks = document.querySelectorAll('a[href^="http"], a[href^="mailto:"], a[href^="tel:"]');
        
        externalLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Don't show loading for mailto and tel links
                if (link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
                    return;
                }
                
                // Show brief loading state for external links
                const originalText = link.innerHTML;
                link.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
                link.style.pointerEvents = 'none';
                
                // Reset after a short delay (in case link doesn't navigate)
                setTimeout(function() {
                    link.innerHTML = originalText;
                    link.style.pointerEvents = 'auto';
                }, 3000);
            });
        });
    }

    /**
     * Initialize pricing interactions
     */
    function initializePricingInteractions() {
        // Add hover effects to pricing cards
        const pricingCards = document.querySelectorAll('.pricing-card');
        
        pricingCards.forEach(function(card) {
            card.addEventListener('mouseenter', function() {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', function() {
                card.style.transform = 'translateY(0)';
            });
        });

        // Service selection handling
        const serviceButtons = document.querySelectorAll('a[href*="service="]');
        
        serviceButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                // Add visual feedback
                button.style.transform = 'scale(0.95)';
                setTimeout(function() {
                    button.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }

    /**
     * Initialize WhatsApp link with pre-filled message
     */
    function initializeWhatsAppLinks() {
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
        
        whatsappLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Track WhatsApp clicks (if analytics is set up)
                if (typeof gtag === 'function') {
                    gtag('event', 'click', {
                        event_category: 'Contact',
                        event_label: 'WhatsApp'
                    });
                }
            });
        });
    }

    /**
     * Initialize accessibility enhancements
     */
    function initializeAccessibility() {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only-focusable btn btn-primary position-absolute';
        skipLink.style.cssText = `
            top: 1rem;
            left: 1rem;
            z-index: 9999;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
        `;
        
        skipLink.addEventListener('focus', function() {
            skipLink.style.transform = 'translateY(0)';
        });
        
        skipLink.addEventListener('blur', function() {
            skipLink.style.transform = 'translateY(-100%)';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main landmark if not present
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main';
        }

        // Enhance form labels
        const formControls = document.querySelectorAll('.form-control, .form-select');
        formControls.forEach(function(control) {
            if (!control.getAttribute('aria-label') && !control.getAttribute('aria-labelledby')) {
                const label = document.querySelector(`label[for="${control.id}"]`);
                if (label) {
                    control.setAttribute('aria-labelledby', label.id || (label.id = 'label-' + control.id));
                }
            }
        });
    }

    /**
     * Initialize error handling
     */
    function initializeErrorHandling() {
        // Global error handler
        window.addEventListener('error', function(e) {
            console.error('JavaScript error:', e.error);
            
            // Show user-friendly error message for critical errors
            if (e.error && e.error.stack && e.error.stack.includes('main.js')) {
                showGlobalError('Something went wrong. Please refresh the page or try again later.');
            }
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', function(e) {
            console.error('Unhandled promise rejection:', e.reason);
        });

        function showGlobalError(message) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-warning alert-dismissible fade show position-fixed';
            alertDiv.style.cssText = `
                top: 100px;
                right: 1rem;
                z-index: 9999;
                max-width: 300px;
            `;
            alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            document.body.appendChild(alertDiv);
            
            // Auto-dismiss after 5 seconds
            setTimeout(function() {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        }
    }

    // Initialize accessibility and error handling
    initializeWhatsAppLinks();
    initializeAccessibility();
    initializeErrorHandling();

    // Expose utility functions for potential external use
    window.RubyVerseUtils = {
        showNotification: function(message, type = 'info') {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
            alertDiv.style.cssText = `
                top: 100px;
                right: 1rem;
                z-index: 9999;
                max-width: 300px;
            `;
            alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            document.body.appendChild(alertDiv);
            
            setTimeout(function() {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 4000);
        },
        
        scrollToElement: function(elementId, offset = 80) {
            const element = document.getElementById(elementId);
            if (element) {
                const offsetTop = element.offsetTop - offset;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    };

})();
