// # GLOBAL STATE
// Stores current user, plan, and rating using localStorage

let currentUser = localStorage.getItem("user") || null;
let plan = localStorage.getItem("plan") || null;
let selectedRating = 0;

// # CART HELPERS
// Handles reading and saving cart data in localStorage

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// # ADD TO CART
// Adds item if not already موجود, updates UI and opens cart

function addToCart(id, name, price) {
  let cart = getCart();
  if (cart.find(i => i.id === id)) {
    alert(name + " is already in your cart!");
    return;
  }
  cart.push({ id, name, price });
  saveCart(cart);
  updateCartCount();
  renderCart();
  openCart();
}

// # REMOVE FROM CART
// Removes item from cart and updates display

function removeFromCart(id) {
  let cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  updateCartCount();
  renderCart();
}

// # CART COUNT
// Updates cart badge number in navbar

function updateCartCount() {
  let count = getCart().length;
  document.querySelectorAll(".cart-count").forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? "flex" : "none";
  });
}

// # CART PANEL
// Controls opening, closing, and toggling cart UI

function openCart() {
  let panel = document.getElementById("cartPanel");
  let overlay = document.getElementById("cartOverlay");
  if (panel) panel.classList.add("open");
  if (overlay) overlay.classList.add("open");
}

function closeCart() {
  let panel = document.getElementById("cartPanel");
  let overlay = document.getElementById("cartOverlay");
  if (panel) panel.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
}

function toggleCart() {
  let panel = document.getElementById("cartPanel");
  if (panel && panel.classList.contains("open")) {
    closeCart();
  } else {
    openCart();
  }
}

// # RENDER CART
// Displays cart items and calculates total price

function renderCart() {
  let list = document.getElementById("cartItems");
  let totalEl = document.getElementById("cartTotal");
  if (!list) return;

  let cart = getCart();
  list.innerHTML = "";

  if (cart.length === 0) {
    list.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
    if (totalEl) totalEl.textContent = "";
    return;
  }

  let sum = 0;
  cart.forEach(item => {
    let div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML =
      '<span class="cart-item-name">' + item.name + '</span>' +
      '<span class="cart-item-price">' + item.price + ' SAR</span>' +
      '<button class="cart-remove" onclick="removeFromCart(\'' + item.id + '\')">&#x2715;</button>';
    list.appendChild(div);
    let p = parseFloat(item.price);
    if (!isNaN(p)) sum += p;
  });

  if (totalEl) totalEl.textContent = "Total: " + sum + " SAR";
}

// # CREATE CART PANEL
// Injects cart UI and payment modal into the page

function createCartPanel() {
  if (document.getElementById("cartPanel")) return;

  let overlay = document.createElement("div");
  overlay.id = "cartOverlay";
  overlay.className = "cart-overlay";
  overlay.onclick = closeCart;
  document.body.appendChild(overlay);

  let panel = document.createElement("div");
  panel.id = "cartPanel";
  panel.className = "cart-panel";
  panel.innerHTML =
    '<div class="cart-header">' +
      '<h3>Your Cart</h3>' +
      '<button class="cart-close" onclick="closeCart()">&#x2715;</button>' +
    '</div>' +
    '<div id="cartItems"></div>' +
    '<div class="cart-footer">' +
      '<p id="cartTotal" class="cart-total"></p>' +
      '<button class="cart-pay-btn" id="cartPayBtn" onclick="openPaymentModal()">Pay Now</button>' +
    '</div>';
  document.body.appendChild(panel);

  createPaymentModal();
  renderCart();
}

// # PAYMENT MODAL
// Shows checkout form with items and total

function createPaymentModal() {
  if (document.getElementById("payModal")) return;

  let modal = document.createElement("div");
  modal.id = "payModal";
  modal.className = "pay-modal-overlay";
  modal.innerHTML =
    '<div class="pay-modal">' +
      '<button class="pay-modal-close" onclick="closePaymentModal()">&#x2715;</button>' +
      '<h2>&#128274; Secure Payment</h2>' +
      '<p class="pay-hint">Test card: <strong>4242 4242 4242 4242</strong></p>' +
      '<div id="payItems" class="pay-items"></div>' +
      '<p id="payTotal" class="pay-total"></p>' +
      '<div class="pay-field">' +
        '<label>Card Number</label>' +
        '<input type="text" id="payCard" placeholder="4242 4242 4242 4242" maxlength="19" oninput="formatCard(this)">' +
      '</div>' +
      '<div class="pay-row">' +
        '<div class="pay-field">' +
          '<label>Expiry</label>' +
          '<input type="text" id="payExpiry" placeholder="MM / YY" maxlength="7" oninput="formatExpiry(this)">' +
        '</div>' +
        '<div class="pay-field">' +
          '<label>CVV</label>' +
          '<input type="text" id="payCvv" placeholder="123" maxlength="3">' +
        '</div>' +
      '</div>' +
      '<button class="btn pay-submit-btn" onclick="processPayment()">Pay Now</button>' +
      '<p id="payError" class="pay-error"></p>' +
    '</div>';
  document.body.appendChild(modal);
}

function openPaymentModal() {
  let cart = getCart();
  if (cart.length === 0) { alert("Your cart is empty!"); return; }

  // Re-populate the modal's item list + total every time it opens
  let itemsEl = document.getElementById("payItems");
  let totalEl = document.getElementById("payTotal");
  itemsEl.innerHTML = "";
  let sum = 0;
  cart.forEach(item => {
    let row = document.createElement("div");
    row.className = "pay-item-row";
    row.innerHTML = '<span>' + item.name + '</span><span>' + item.price + ' SAR</span>';
    itemsEl.appendChild(row);
    let p = parseFloat(item.price);
    if (!isNaN(p)) sum += p;
  });
  totalEl.textContent = "Total: " + sum + " SAR";

  // Clear previous inputs
  document.getElementById("payCard").value = "";
  document.getElementById("payExpiry").value = "";
  document.getElementById("payCvv").value = "";
  document.getElementById("payError").textContent = "";

  document.getElementById("payModal").classList.add("open");
  closeCart(); // Close the cart panel so the modal isn't hidden behind it
}

function closePaymentModal() {
  document.getElementById("payModal").classList.remove("open");
}

// # CARD FORMAT
// Formats card number and expiry input fields

function formatCard(input) {
  let v = input.value.replace(/\D/g, "").substring(0, 16);
  input.value = v.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g, "").substring(0, 4);
  if (v.length >= 2) v = v.substring(0, 2) + " / " + v.substring(2);
  input.value = v;
}

// # PROCESS PAYMENT
// Validates inputs, unlocks items, clears cart, shows success

function processPayment() {
  let card   = document.getElementById("payCard").value.replace(/\s/g, "");
  let expiry = document.getElementById("payExpiry").value;
  let cvv    = document.getElementById("payCvv").value;
  let errEl  = document.getElementById("payError");

  errEl.textContent = "";

  if (card.length !== 16) { errEl.textContent = "Please enter a valid 16-digit card number."; return; }
  if (expiry.replace(/\s/g, "").length < 4) { errEl.textContent = "Please enter a valid expiry date."; return; }
  if (cvv.length < 3) { errEl.textContent = "Please enter a 3-digit CVV."; return; }

  let btn = document.querySelector(".pay-submit-btn");
  btn.textContent = "Processing...";
  btn.disabled = true;

  setTimeout(function() {
    let cart = getCart();
    // Mark each purchased item as unlocked in localStorage
    cart.forEach(item => {
      localStorage.setItem(item.id, "true");
    });
    saveCart([]);
    updateCartCount();
    renderCart();
    updateButtons();        // Refresh class buttons (locked -> unlocked)
    updateRecipeButtons();  // Refresh recipe buttons (locked -> unlocked)

    closePaymentModal();
    btn.textContent = "Pay Now";
    btn.disabled = false;

    showSuccessBanner(cart);
  }, 1800);
}

// # SUCCESS MESSAGE
// Shows temporary confirmation after payment

function showSuccessBanner(items) {
  let banner = document.createElement("div");
  banner.className = "pay-success-banner";
  banner.innerHTML =
    '<span>&#10003; Payment successful! ' +
    items.map(i => i.name).join(", ") +
    ' unlocked.</span>' +
    '<button onclick="this.parentElement.remove()">&#x2715;</button>';
  document.body.appendChild(banner);
  setTimeout(function() { if (banner.parentElement) banner.remove(); }, 5000);
}

// # CART BADGE
// Adds cart icon behavior and badge to navbar

function injectCartBadge() {
  document.querySelectorAll("a.bag").forEach(bag => {
    bag.removeAttribute("href");
    bag.style.cursor = "pointer";
    bag.onclick = function(e) { e.preventDefault(); toggleCart(); };

    if (!bag.querySelector(".cart-count")) {
      let badge = document.createElement("span");
      badge.className = "cart-count";
      badge.style.display = "none";
      bag.appendChild(badge);
    }
  });
  updateCartCount();
}

// # SIGN UP
// Creates new user and saves data in localStorage

function signUp() {
  let name    = document.getElementById("signupName").value.trim();
  let email   = document.getElementById("signupEmail").value.trim();
  let pass    = document.getElementById("signupPass").value;
  let confirm = document.getElementById("signupConfirm").value;

  if (!name || !email || !pass || !confirm) {
    alert("Please fill in all fields.");
    return;
  }
  if (pass !== confirm) {
    alert("Passwords do not match.");
    return;
  }
  if (pass.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[email]) {
    alert("An account with this email already exists.");
    return;
  }

  users[email] = { name: name, email: email, password: pass };
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("user", email);
  localStorage.setItem("userName", name);

  alert("Account created successfully! Welcome, " + name + " 🎉");
  window.location.href = "onboarding.html"; // Goes straight to the onboarding quiz
}

// # LOGIN
// Verifies user credentials and redirects to dashboard

function loginUser() {
  let email = document.querySelector("input[type='email']").value.trim();
  let pass  = document.querySelector("input[type='password']").value;

  if (!email || !pass) { alert("Please enter email and password"); return; }

  let users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[email] && users[email].password === pass) {
    localStorage.setItem("user", email);
    localStorage.setItem("userName", users[email].name);
    alert("Welcome back, " + users[email].name + "!");
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid email or password. Please try again.");
  }
}

// # CONTACT FORM
// Validates input and shows confirmation message

function contactForm() {
  let nameEl = document.getElementById("name");
  let emailEl = document.getElementById("email");
  let msgEl = document.getElementById("message");
  if (!nameEl) return false;
  if (!nameEl.value || !emailEl.value || !msgEl.value) {
    alert("Please fill in all fields.");
    return false;
  }
  alert("Thank you " + nameEl.value + "! We will contact you soon.");
  nameEl.value = "";
  emailEl.value = "";
  msgEl.value = "";
  return false;
}

// # PLAN SELECTION
// Saves selected membership plan

function selectPlan(p) {
  localStorage.setItem("plan", p);
  alert("You selected " + p + " plan");
}

// # BOOK CLASS
// Adds class to bookings list in localStorage

function bookClass(c) {
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  if (bookings.includes(c)) { alert("Already booked!"); return; }
  bookings.push(c);
  localStorage.setItem("bookings", JSON.stringify(bookings));
  alert("Booked: " + c);
}

// # STAR RATING
// Handles star selection for reviews

function setRating(r) {
  selectedRating = r;
  document.querySelectorAll("#stars span").forEach((star, index) => {
    if (index < r) { star.classList.add("active"); }
    else { star.classList.remove("active"); }
  });
}

// # REVIEWS
// Add, display, and delete reviews (stored in localStorage)

function addReview() {
  let name = document.getElementById("reviewName").value;
  let text = document.getElementById("reviewText").value;

  if (name === "" || text === "" || selectedRating === 0) {
    alert("Please fill all fields and select a rating");
    return;
  }

  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  reviews.push({ name: name, text: text, rating: selectedRating });
  localStorage.setItem("reviews", JSON.stringify(reviews));
  displayReviews();

  document.getElementById("reviewName").value = "";
  document.getElementById("reviewText").value = "";
  selectedRating = 0;
  document.querySelectorAll("#stars span").forEach(s => s.classList.remove("active"));
}

function displayReviews() {
  let container = document.getElementById("newReviews");
  if (!container) return;
  container.innerHTML = "";

  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  reviews.forEach((r, index) => {
    let stars = "⭐".repeat(r.rating);
    let card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML =
      '<h4>' + r.name + '</h4>' +
      '<span>' + stars + '</span>' +
      '<p>' + r.text + '</p>' +
      '<button class="delete-btn" onclick="deleteReview(' + index + ')">Delete</button>';
    container.appendChild(card);
  });
}

function deleteReview(index) {
  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  reviews.splice(index, 1);
  localStorage.setItem("reviews", JSON.stringify(reviews));
  displayReviews();
}

// # SEARCH
// Filters classes/recipes based on user input

function searchClass() {
  let input = document.getElementById("search").value.toLowerCase();
  document.querySelectorAll(".class-card").forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(input) ? "block" : "none";
  });
}

// # PROGRESS
// Saves workout progress for dashboard

function saveProgress() {
  let num = document.getElementById("workouts").value;
  localStorage.setItem("progress", num);
  document.getElementById("progressText").innerText = "You completed " + num + " workouts 🎉";
}

// # COUNTDOWN
// Runs timer for next class on dashboard

function countdown() {
  let timerEl = document.getElementById("timer");
  if (!timerEl) return;
  let time = 60;
  let interval = setInterval(() => {
    timerEl.innerText = "Next class in " + time + " seconds";
    time--;
    if (time < 0) clearInterval(interval);
  }, 1000);
}

// # HANDLE CLASS
// Opens class if purchased, otherwise redirects to payment

function handleClass(className) {
  if (localStorage.getItem(className) === "true") {
    alert("Access granted!");
    let pages = {
      hiit: "hiit.html",
      strength: "strength.html",
      yoga: "yoga.html",
      sculpt: "sculpt.html",
      pilates: "pilates.html",
      recovery: "recovery.html"
    };
    if (pages[className]) window.location.href = pages[className];
  } else {
    // Stripe test checkout links — one per class
    let links = {
      hiit:     "https://buy.stripe.com/test_eVq6oA1ez7YH9q08V7c3m06",
      strength: "https://buy.stripe.com/test_bJefZaaP95QzfOo4ERc3m01",
      yoga:     "https://buy.stripe.com/test_4gMbIU9L592LeKk3ANc3m07",
      sculpt:   "https://buy.stripe.com/test_5kQfZa2iD92Lau4dbnc3m08",
      pilates:  "https://buy.stripe.com/test_3cI4gs3mH4Mvau4b3fc3m09",
      recovery: "https://buy.stripe.com/test_8x2fZa6yT7YH6dO3ANc3m0a"
    };
    if (links[className]) window.open(links[className], "_blank");
  }
}

// # UPDATE CLASS BUTTONS
// Switches buttons between Buy and Start based on purchase

function updateButtons() {
  let classes = ["hiit", "strength", "yoga", "sculpt", "pilates", "recovery"];
  classes.forEach(c => {
    let btn = document.getElementById(c + "-btn");
    if (!btn) return;
    btn.innerText = localStorage.getItem(c) === "true" ? "🔓 Start Class" : "🔒 Buy Class";
  });
}

// # HANDLE RECIPE
// Opens recipe if purchased, otherwise redirects to payment

function handleRecipe(recipe) {
  if (localStorage.getItem(recipe) === "true") {
    window.location.href = "recipe-" + recipe + ".html";
  } else {
    let links = {
      acai:     "https://buy.stripe.com/test_bJe00i88J6rI64q9aj5ZC03",
      chicken:  "https://buy.stripe.com/test_aFaaEWfBbeYe3Wi4U35ZC02",
      salmon:   "https://buy.stripe.com/test_4gM5kC1Kl9DUfF0aen5ZC04",
      smoothie: "https://buy.stripe.com/test_bJecN4bkV6rI2Se2LV5ZC05",
      oats:     "https://buy.stripe.com/test_3cI4cyfBbdUa0K61HR5ZC06",
      wrap:     "https://buy.stripe.com/test_7sY8wOcoZ6rI1Oaaen5ZC07"
    };
    if (links[recipe]) window.open(links[recipe], "_blank");
  }
}

// # UPDATE RECIPE BUTTONS
// Switches buttons between Buy and View based on purchase

function updateRecipeButtons() {
  let recipes = ["acai", "chicken", "salmon", "smoothie", "oats", "wrap"];
  recipes.forEach(r => {
    let btn = document.getElementById(r + "-btn");
    if (!btn) return;
    btn.innerText = localStorage.getItem(r) === "true" ? "🔓 View Recipe" : "🔒 Buy Recipe";
  });
}

// # INIT
// Runs all setup functions when page loads

window.onload = function() {
  createCartPanel();
  injectCartBadge();
  displayReviews();
  updateButtons();
  updateRecipeButtons();
  countdown();
};
