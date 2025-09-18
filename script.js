// Supabase Configuration (from .env file)
const supabaseUrl = "https://mtztmhaxwmgwwxfofgkh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10enRtaGF4d21nd3d4Zm9mZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDU3NDEsImV4cCI6MjA3MzQyMTc0MX0.K98XBk-GUhDexymgjK_lkTqlPX-l1KM9sSZGGrDzOEo";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up your Supabase connection.');
}

// Initialize Supabase Client (assuming createClient is on the window object from CDN)
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers (from src/lib/supabase.js)
const auth = {
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers (from src/lib/supabase.js)
const db = {
  // Profile operations
  createProfile: async (profileData) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
    return { data, error }
  },

  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
    return { data, error }
  },

  // Contact form operations
  submitContactForm: async (contactData) => {
    const { data, error } = await supabase
      .from('contact_queries')
      .insert([contactData])
      .select()
    return { data, error }
  }
}

// Modern Fitness Website JavaScript (from script.js)
class FitnessApp {
    constructor() {
        this.currentUser = null;
        this.authSubscription = null;
        this.init();
    }

    async init() {
        await this.initializeAuth();
        this.setupEventListeners();
        this.setupTestimonialCarousel();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        await this.hideLoading();
        this.setupFormValidation();
        this.setupModalAnimations();
    }

    async initializeAuth() {
        // Check for existing session
        try {
            const { user } = await auth.getCurrentUser();
            if (user) {
                await this.handleExistingUser(user);
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
        }

        // Listen for auth changes
        this.authSubscription = auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                await this.handleExistingUser(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.updateUIForLoggedOutUser();
            }
        });
    }

    async handleExistingUser(user) {
        try {
            const { data: profile, error } = await db.getProfile(user.id);
            
            if (profile) {
                this.currentUser = {
                    id: user.id,
                    email: user.email,
                    name: profile.full_name,
                    mobile: profile['mobile _number'] || 'Not provided',
                    age: profile.age || 'Not provided'
                };
            } else {
                // Create basic profile from auth data
                this.currentUser = {
                    id: user.id,
                    email: user.email,
                    name: user.email.split('@')[0],
                    mobile: 'Not provided',
                    age: 'Not provided'
                };
            }
            
            this.updateUIForLoggedInUser();
        } catch (error) {
            console.error('Error handling existing user:', error);
        }
    }
    setupEventListeners() {
        // Get Started Button Events
        document.getElementById('get-started-btn')?.addEventListener('click', () => this.openAuthModal());
        document.getElementById('get-started-btn-banner')?.addEventListener('click', () => this.openAuthModal());

        // Auth Modal Events
        document.getElementById('close-modal')?.addEventListener('click', () => this.closeAuthModal());
        document.getElementById('auth-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'auth-modal') this.closeAuthModal();
        });

        // Tab Switching
        document.getElementById('login-tab')?.addEventListener('click', () => this.switchTab('login'));
        document.getElementById('signup-tab')?.addEventListener('click', () => this.switchTab('signup'));

        // Form Submissions
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signup-form')?.addEventListener('submit', (e) => this.handleSignup(e));
        document.getElementById('contact-form')?.addEventListener('submit', (e) => this.handleContact(e));

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());

        // Dashboard Navigation
        document.getElementById('dashboard-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showDashboard();
        });

        document.getElementById('home-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showHomepage();
        });

        // Keyboard Events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAuthModal();
        });
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        mobileMenuBtn?.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking on links
        const mobileLinks = mobileMenu?.querySelectorAll('a');
        mobileLinks?.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    setupTestimonialCarousel() {
        const container = document.getElementById('testimonials-container');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (!container || !prevBtn || !nextBtn) return;

        prevBtn.addEventListener('click', () => {
            container.scrollBy({
                left: -340,
                behavior: 'smooth'
            });
        });

        nextBtn.addEventListener('click', () => {
            container.scrollBy({
                left: 340,
                behavior: 'smooth'
            });
        });

        // Auto-scroll every 5 seconds
        setInterval(() => {
            const maxScroll = container.scrollWidth - container.clientWidth;
            if (container.scrollLeft >= maxScroll) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: 340, behavior: 'smooth' });
            }
        }, 5000);
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                if (href && href.length > 1) {
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    setupFormValidation() {
        // Real-time validation for forms
        const forms = ['login-form', 'signup-form', 'contact-form'];
        
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (!form) return;

            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styles
        field.classList.remove('input-error', 'input-success');

        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                errorMessage = 'Please enter a valid email address';
                break;
            case 'password':
                isValid = value.length >= 6;
                errorMessage = 'Password must be at least 6 characters long';
                break;
            case 'tel':
                const phoneRegex = /^\d{10}$/;
                isValid = phoneRegex.test(value.replace(/\D/g, ''));
                errorMessage = 'Please enter a valid 10-digit phone number';
                break;
            case 'number':
                if (field.id === 'signup-age') {
                    const age = parseInt(value);
                    isValid = age >= 13 && age <= 120;
                    errorMessage = 'Age must be between 13 and 120';
                }
                break;
            default:
                if (field.required) {
                    isValid = value.length > 0;
                    errorMessage = 'This field is required';
                }
        }

        if (field.required && value.length === 0) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        if (isValid && value.length > 0) {
            field.classList.add('input-success');
        } else if (!isValid) {
            field.classList.add('input-error');
        }

        return isValid;
    }

    clearFieldError(field) {
        field.classList.remove('input-error');
    }

    setupModalAnimations() {
        const modal = document.getElementById('auth-modal');
        const modalContent = document.getElementById('modal-content');
        
        if (!modal || !modalContent) return;

        // Setup intersection observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        // Observe cards and sections
        document.querySelectorAll('.bg-white, .bg-gray-50').forEach(el => {
            observer.observe(el);
        });
    }

    async hideLoading() {
        return new Promise(resolve => {
            setTimeout(() => {
                const loading = document.getElementById('loading');
                if (loading) {
                    loading.style.opacity = '0';
                    setTimeout(() => {
                        loading.style.display = 'none';
                        resolve();
                    }, 300);
                } else {
                    resolve();
                }
            }, 1000);
        });
    }

    openAuthModal() {
        const modal = document.getElementById('auth-modal');
        const modalContent = document.getElementById('modal-content');
        
        if (!modal || !modalContent) return;

        modal.classList.remove('hidden');
        
        // Trigger animation
        setTimeout(() => {
            modalContent.style.transform = 'scale(1)';
            modalContent.style.opacity = '1';
        }, 10);
    }

    closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        const modalContent = document.getElementById('modal-content');
        
        if (!modal || !modalContent) return;

        modalContent.style.transform = 'scale(0.95)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            modal.classList.add('hidden');
            this.clearFormErrors();
        }, 300);
    }

    switchTab(tab) {
        const loginTab = document.getElementById('login-tab');
        const signupTab = document.getElementById('signup-tab');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        if (!loginTab || !signupTab || !loginForm || !signupForm) return;

        if (tab === 'login') {
            loginTab.classList.add('border-indigo-600', 'text-indigo-600');
            loginTab.classList.remove('border-transparent', 'text-gray-500');
            signupTab.classList.add('border-transparent', 'text-gray-500');
            signupTab.classList.remove('border-indigo-600', 'text-indigo-600');
            
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        } else {
            signupTab.classList.add('border-indigo-600', 'text-indigo-600');
            signupTab.classList.remove('border-transparent', 'text-gray-500');
            loginTab.classList.add('border-transparent', 'text-gray-500');
            loginTab.classList.remove('border-indigo-600', 'text-indigo-600');
            
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
        
        this.clearFormErrors();
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;

        if (!email || !password) {
            this.showError('login-error', 'Please fill in all fields');
            return;
        }

        if (!this.validateField(document.getElementById('login-email')) || 
            !this.validateField(document.getElementById('login-password'))) {
            this.showError('login-error', 'Please correct the errors above');
            return;
        }

        try {
            const { data, error } = await auth.signIn(email, password);
            
            if (error) {
                throw error;
            }

            if (data.user) {
                this.handleLoginSuccess();
            } else {
                // Supabase signInWithPassword should return a user or error,
                // if data.user is null without an error, it's an unexpected state.
                // Assuming success on session, if session is present, handleExistingUser will be called by listener.
                // For simplicity and matching the old structure, we treat non-error as potentially successful for UI.
                if (data.session) {
                    this.handleLoginSuccess();
                } else {
                    throw new Error('Login failed - no user data received');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('login-error', error.message || 'Login failed. Please try again.');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('signup-full-name')?.value,
            email: document.getElementById('signup-email')?.value,
            mobile: document.getElementById('signup-mobile')?.value,
            age: document.getElementById('signup-age')?.value,
            password: document.getElementById('signup-password')?.value
        };

        // Validate all fields
        const fields = ['signup-full-name', 'signup-email', 'signup-mobile', 'signup-age', 'signup-password'];
        let isValid = true;

        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showError('signup-error', 'Please correct the errors above');
            return;
        }

        try {
            // Sign up the user
            const { data: authData, error: authError } = await auth.signUp(
                formData.email, 
                formData.password,
                {
                    full_name: formData.name
                }
            );

            if (authError) {
                throw authError;
            }

            if (authData.user) {
                // Create profile in database
                const profileData = {
                    id: authData.user.id,
                    full_name: formData.name,
                    email: formData.email,
                    'mobile _number': formData.mobile,
                    age: parseInt(formData.age)
                };

                const { error: profileError } = await db.createProfile(profileData);
                
                if (profileError) {
                    console.error('Profile creation error:', profileError);
                    // Continue anyway as auth was successful
                }

                this.currentUser = {
                    id: authData.user.id,
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile,
                    age: formData.age
                };
                
                this.handleLoginSuccess();
            } else {
                throw new Error('Signup failed - no user data received');
            }
            
        } catch (error) {
            console.error('Signup error:', error);
            this.showError('signup-error', error.message || 'Signup failed. Please try again.');
        }
    }

    async handleContact(e) {
        e.preventDefault();
        
        const name = document.getElementById('contact-name')?.value;
        const email = document.getElementById('contact-email')?.value;
        const message = document.getElementById('contact-message')?.value;

        if (!name || !email || !message) {
            return;
        }

        try {
            const contactData = {
                name: name,
                email: email,
                message: message
            };

            const { error } = await db.submitContactForm(contactData);
            
            if (error) {
                throw error;
            }
            
            // Show success message
            const successElement = document.getElementById('contact-success');
            if (successElement) {
                successElement.classList.remove('hidden');
                
                // Clear form
                document.getElementById('contact-form')?.reset();
                
                // Hide success message after 3 seconds
                setTimeout(() => {
                    successElement.classList.add('hidden');
                }, 3000);
            }
        } catch (error) {
            console.error('Contact form submission failed:', error);
            // FIX: Use the specific error message from Supabase for better diagnosis.
            const errorMessage = error.message || 'Failed to send message.check console for RLS voilation .';
            this.showNotification(errorMessage, 'error');
        }
    }
 

    handleLoginSuccess() {
        this.closeAuthModal();
        this.updateUIForLoggedInUser();
        this.showNotification('Login successful! Welcome to Fitness Hub.', 'success');
    }

    async handleLogout() {
        try {
            const { error } = await auth.signOut();
            
            if (error) {
                throw error;
            }
            
            this.currentUser = null;
            this.updateUIForLoggedOutUser();
            this.showHomepage();
            this.showNotification('You have been logged out successfully.', 'info');
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Error logging out. Please try again.', 'error');
        }
    }

    updateUIForLoggedInUser() {
        // Hide get started button, show logout button
        document.getElementById('get-started-btn')?.classList.add('hidden');
        document.getElementById('logout-btn')?.classList.remove('hidden');
        document.getElementById('dashboard-link')?.classList.remove('hidden');

        // Update dashboard with user info
        if (this.currentUser) {
            const nameElement = document.getElementById('dashboard-user-name');
            const emailElement = document.getElementById('dashboard-email');
            const mobileElement = document.getElementById('dashboard-mobile');
            const ageElement = document.getElementById('dashboard-age');
            const avatarElement = document.getElementById('dashboard-avatar');

            if (nameElement) nameElement.textContent = this.currentUser.name;
            if (emailElement) emailElement.textContent = this.currentUser.email;
            if (mobileElement) mobileElement.textContent = this.currentUser.mobile;
            if (ageElement) ageElement.textContent = this.currentUser.age;
            if (avatarElement) avatarElement.textContent = this.currentUser.name.charAt(0).toUpperCase();
        }
    }

    updateUIForLoggedOutUser() {
        document.getElementById('get-started-btn')?.classList.remove('hidden');
        document.getElementById('logout-btn')?.classList.add('hidden');
        document.getElementById('dashboard-link')?.classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('homepage')?.classList.add('hidden');
        document.getElementById('dashboard')?.classList.remove('hidden');
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showHomepage() {
        document.getElementById('dashboard')?.classList.add('hidden');
        document.getElementById('homepage')?.classList.remove('hidden');
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    clearFormErrors() {
        const errorElements = document.querySelectorAll('[id$="-error"]');
        errorElements.forEach(element => {
            element.classList.add('hidden');
            element.textContent = '';
        });

        // Clear input error styles
        document.querySelectorAll('.input-error').forEach(input => {
            input.classList.remove('input-error');
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-500', 'text-white');
                break;
            case 'info':
            default:
                notification.classList.add('bg-blue-500', 'text-white');
        }

        notification.innerHTML = `
            <div class="flex items-center">
                <span>${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // Cleanup method
    destroy() {
        if (this.authSubscription) {
            this.authSubscription.data.subscription.unsubscribe();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FitnessApp();
});

// Service Worker Registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}