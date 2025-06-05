document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.innerHTML = `
        <div class="mobile-menu-header">
            <div class="logo">
                <i class="fas fa-robot"></i>
                <span>SmartSched</span>
            </div>
            <button class="close-menu">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="mobile-menu-links">
            <a href="index.html" class="active">Home</a>
            <a href="#">Features</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
        </div>
        <div class="mobile-menu-actions">
            <div class="search-box">
                <input type="text" placeholder="Search...">
                <i class="fas fa-search"></i>
            </div>
            <a href="login.html" class="login-btn">Login</a>
            <a href="signup.html" class="signup-btn">Get Started</a>
        </div>
    `;
    document.body.appendChild(mobileMenu);
    
    hamburger.addEventListener('click', function() {
        mobileMenu.classList.add('active');
    });
    
    document.querySelector('.close-menu').addEventListener('click', function() {
        mobileMenu.classList.remove('active');
    });
    
    // Testimonial Carousel
    const testimonials = document.querySelectorAll('.testimonial');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentTestimonial = 0;
    
    function showTestimonial(index) {
        testimonials.forEach(testimonial => testimonial.classList.remove('active'));
        testimonials[index].classList.add('active');
    }
    
    prevBtn.addEventListener('click', function() {
        currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
        showTestimonial(currentTestimonial);
    });
    
    nextBtn.addEventListener('click', function() {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    });
    
    // Auto-rotate testimonials
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 5000);
    
    // Back to Top Button
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Active Nav Link Highlighting
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-menu-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
});