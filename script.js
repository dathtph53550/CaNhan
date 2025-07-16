document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. KHAI BÁO BIẾN VÀ DOM ELEMENTS TOÀN CỤC
    // =========================================================================
    const cartDropdown = document.getElementById('cart-dropdown');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total-price'); // Cập nhật ID cho đúng
    const cartIcon = document.querySelector('#cart-icon'); // Chọn ID cho chính xác hơn
    const productGrid = document.getElementById('product-grid');
    const loader = document.getElementById('loader');
    const productDetailModal = document.getElementById('product-detail-modal');
    const closeModalBtn = productDetailModal.querySelector('.close');
    const productDetailContent = document.getElementById('product-detail-content');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let allProducts = []; // Lưu trữ danh sách sản phẩm từ API

    // =========================================================================
    // 2. CÁC HÀM XỬ LÝ GIỎ HÀNG (CART)
    // =========================================================================
    function updateCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Giỏ hàng của bạn đang trống.</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.title}">
                    <div class="cart-item-info">
                        <p class="cart-item-title">${item.title.substring(0, 25)}...</p>
                        <p class="cart-item-price">${item.price.toLocaleString('vi-VN')}đ</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <input type="text" value="${item.quantity}" readonly>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="remove-item" data-id="${item.id}">&times;</button>
                `;
                cartItemsContainer.appendChild(cartItem);
                total += item.price * item.quantity;
            });
        }
            if (cartTotal) {
            cartTotal.textContent = total.toLocaleString('vi-VN') + 'đ';
        }
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function addToCart(productId, quantity = 1) {
        const product = allProducts.find(p => p.id == productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id == productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity: quantity });
        }
        updateCart();
    }

    function changeQuantity(productId, change) {
        const item = cart.find(i => i.id == productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id != productId);
            }
            updateCart();
        }
    }

    // =========================================================================
    // 3. CÁC HÀM HIỂN THỊ (DISPLAY FUNCTIONS)
    // =========================================================================
    function displayProducts() {
        productGrid.innerHTML = allProducts.map(product => `
            <div class="product-card">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.title}" class="product-image">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title.substring(0, 30)}...</h3>
                    <p class="product-price">${product.price.toLocaleString('vi-VN')}đ</p>
                    <button class="btn view-detail-btn" data-id="${product.id}">Xem chi tiết</button>
                </div>
            </div>
        `).join('');
    }

    function openProductDetail(product) {
        const img = document.getElementById('product-detail-img');
        const infoDiv = productDetailContent.querySelector('.product-detail-info');

        img.src = product.image;
        img.alt = product.title;

        infoDiv.innerHTML = `
            <h2>${product.title}</h2>
            <p class="price">${product.price.toLocaleString('vi-VN')}đ</p>
            <p class="description">${product.description}</p>
            <div class="quantity-selector">
                <button class="quantity-btn minus" aria-label="Giảm số lượng">-</button>
                <input type="number" class="quantity-input" value="1" min="1">
                <button class="quantity-btn plus" aria-label="Tăng số lượng">+</button>
            </div>
            <button class="btn add-to-cart-btn" data-id="${product.id}">Thêm vào giỏ hàng</button>
        `;
        productDetailModal.style.display = 'block';
        if (img.complete) {
            imageZoom("product-detail-img", "zoom-result");
        } else {
            img.onload = () => imageZoom("product-detail-img", "zoom-result");
        }
    }

    // =========================================================================
    // 4. HÀM TIỆN ÍCH (UTILITY FUNCTIONS)
    // =========================================================================
    function imageZoom(imgID, resultID) {
        let img = document.getElementById(imgID);
        let result = document.getElementById(resultID);
        if (!img || !result) return;

        let lens = document.createElement("DIV");
        lens.setAttribute("class", "img-zoom-lens");
        img.parentElement.insertBefore(lens, img);

        let cx = result.offsetWidth / lens.offsetWidth;
        let cy = result.offsetHeight / lens.offsetHeight;

        result.style.backgroundImage = "url('" + img.src + "')";
        result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";

        lens.addEventListener("mousemove", moveLens);
        img.addEventListener("mousemove", moveLens);

        function moveLens(e) {
            e.preventDefault();
            let pos = getCursorPos(e);
            let x = pos.x - (lens.offsetWidth / 2);
            let y = pos.y - (lens.offsetHeight / 2);
            if (x > img.width - lens.offsetWidth) { x = img.width - lens.offsetWidth; }
            if (x < 0) { x = 0; }
            if (y > img.height - lens.offsetHeight) { y = img.height - lens.offsetHeight; }
            if (y < 0) { y = 0; }
            lens.style.left = x + "px";
            lens.style.top = y + "px";
            result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
        }

        function getCursorPos(e) {
            let a, x = 0, y = 0;
            e = e || window.event;
            a = img.getBoundingClientRect();
            x = e.pageX - a.left - window.pageXOffset;
            y = e.pageY - a.top - window.pageYOffset;
            return { x: x, y: y };
        }

        lens.addEventListener("mouseenter", showZoom);
        img.addEventListener("mouseenter", showZoom);
        lens.addEventListener("mouseleave", hideZoom);
        img.addEventListener("mouseleave", hideZoom);

        function showZoom() { result.style.display = 'block'; lens.style.display = 'block'; }
        function hideZoom() { result.style.display = 'none'; lens.style.display = 'none'; }
    }

    // =========================================================================
    // 5. CÁC TRÌNH LẮNG NGHE SỰ KIỆN (EVENT LISTENERS)
    // =========================================================================
    // Xử lý sự kiện nút thanh toán
    document.querySelector('.checkout-btn').addEventListener('click', handleCheckout);

    // Mở/đóng giỏ hàng dropdown
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault(); // Ngăn hành vi mặc định của thẻ <a>
        e.stopPropagation(); // Ngăn sự kiện click lan ra window
        cartDropdown.classList.toggle('open');
    });

    // Thay đổi số lượng/xóa sản phẩm trong giỏ hàng
    cartItemsContainer.addEventListener('click', e => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('remove-item')) {
            cart = cart.filter(item => item.id != id);
            updateCart();
        } else if (e.target.classList.contains('plus')) {
            changeQuantity(id, 1);
        } else if (e.target.classList.contains('minus')) {
            changeQuantity(id, -1);
        }
    });

    // Mở modal chi tiết sản phẩm
    productGrid.addEventListener('click', e => {
        if (e.target.classList.contains('view-detail-btn')) {
            const productId = e.target.dataset.id;
            const product = allProducts.find(p => p.id == productId);
            if (product) openProductDetail(product);
        }
    });

    // Xử lý sự kiện trong modal chi tiết sản phẩm
    productDetailModal.addEventListener('click', (e) => {
        const quantityInput = productDetailModal.querySelector('.quantity-input');
        if (!quantityInput) return;

        if (e.target.classList.contains('plus')) {
            quantityInput.value = parseInt(quantityInput.value) + 1;
        } else if (e.target.classList.contains('minus')) {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        } else if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = e.target.dataset.id;
            const quantity = parseInt(quantityInput.value);
            const product = allProducts.find(p => p.id == productId);
            
            // Thêm vào giỏ hàng
            addToCart(productId, quantity);
            
            // Hiển thị thông báo thành công
            Toastify({
                text: `Đã thêm ${quantity} ${product.title.substring(0, 20)}... vào giỏ hàng`,
                duration: 3000,
                gravity: "top",
                position: "right",
                style: {
                    background: "#4CAF50",
                }
            }).showToast();

            // Đóng modal và mở giỏ hàng
            productDetailModal.style.display = 'none';
            cartDropdown.classList.add('open');
            
            // Thêm hiệu ứng highlight cho item mới thêm vào
            setTimeout(() => {
                const newItem = cartItemsContainer.lastElementChild;
                if (newItem) {
                    newItem.classList.add('highlight');
                    setTimeout(() => newItem.classList.remove('highlight'), 1000);
                }
            }, 100);
        }
    });

    // Hàm xử lý thanh toán
    function handleCheckout() {
        if (cart.length === 0) {
            Toastify({
                text: "Giỏ hàng của bạn đang trống!",
                duration: 3000,
                gravity: "top",
                position: "right",
                style: {
                    background: "#ff6b6b",
                }
            }).showToast();
            return;
        }

        // Tính tổng tiền
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        // Hiển thị thông báo thanh toán thành công
        Toastify({
            text: `Thanh toán thành công! Tổng thanh toán: ${total.toLocaleString('vi-VN')}đ`,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
                background: "#4CAF50",
            }
        }).showToast();

        // Xóa giỏ hàng
        cart = [];
        updateCart();
        
        // Đóng dropdown giỏ hàng
        cartDropdown.classList.remove('open');
    }

    // Đóng modal hoặc dropdown khi click ra ngoài
    closeModalBtn.addEventListener('click', () => productDetailModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        // Đóng modal
        if (e.target == productDetailModal) {
            productDetailModal.style.display = 'none';
        }

        // Đóng dropdown giỏ hàng
        // Kiểm tra xem dropdown có đang mở không và click có nằm ngoài dropdown và icon không
        if (cartDropdown.classList.contains('open') && !cartDropdown.contains(e.target) && !cartIcon.contains(e.target)) {
            cartDropdown.classList.remove('open');
        }
    });

    // =========================================================================
    // 6. KHỞI TẠO ỨNG DỤNG
    // =========================================================================
    function initializeApp() {
        fetch('https://fakestoreapi.com/products')
            .then(res => res.json())
            .then(products => {
                allProducts = products;
                if(loader) loader.style.display = 'none';
                displayProducts();
                updateCart();
            })
            .catch(error => {
                console.error('Lỗi khi tải sản phẩm:', error);
                if(loader) loader.style.display = 'none';
                productGrid.innerHTML = '<p class="error-message">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>';
            });
    }

    // =========================================================================
    // 7. BANNER SLIDER FUNCTIONALITY
    // =========================================================================
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    
    function showSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        
        // Ẩn tất cả slides
        slides.forEach(slide => {
            slide.style.opacity = '0';
            slide.style.transform = 'scale(0.95)';
            setTimeout(() => slide.style.display = 'none', 500);
        });
        
        // Hiển thị slide hiện tại với animation
        setTimeout(() => {
            slides[index].style.display = 'block';
            setTimeout(() => {
                slides[index].style.opacity = '1';
                slides[index].style.transform = 'scale(1)';
            }, 50);
        }, 500);
        
        currentSlide = index;
        
        // Animation cho nội dung slide
        const currentContent = slides[index].querySelector('.slide-content');
        if (currentContent) {
            currentContent.style.opacity = '0';
            currentContent.style.transform = 'translateY(20px)';
            setTimeout(() => {
                currentContent.style.opacity = '1';
                currentContent.style.transform = 'translateY(0)';
            }, 800);
        }
    }

    // Auto slide
    let slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);

    // Event listeners cho nút prev/next
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            showSlide(currentSlide - 1);
            slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            showSlide(currentSlide + 1);
            slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
        });
    }

    // Animation cho landing page elements khi scroll
    function addScrollAnimation() {
        const elements = document.querySelectorAll('.project-grid, .news-grid, section h2');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        elements.forEach(element => {
            element.style.opacity = '0';
            observer.observe(element);
        });
    }

    // Khởi tạo slider và animations
    showSlide(0);
    addScrollAnimation();

    // Khởi động ứng dụng
    initializeApp();

});
