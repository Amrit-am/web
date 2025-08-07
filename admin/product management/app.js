// app.js

// Save Product
document.getElementById("productForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("productName").value;
  const description = document.getElementById("productDescription").value;
  const rate = parseFloat(document.getElementById("productRate").value);
  const brand = document.getElementById("productBrand").value;
  const category = document.getElementById("productCategory").value;
  const imageFile = document.getElementById("productImage").files[0];

  // Upload image to Firebase Storage
  const storageRef = storage.ref("product-images/" + imageFile.name);
  const uploadTask = storageRef.put(imageFile);

  uploadTask.on("state_changed", 
    null,
    (error) => {
      console.error("Error uploading image:", error);
    },
    () => {
      // Get image URL
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        // Save product data to Firestore
        db.collection("products").add({
          name,
          description,
          rate,
          brand,
          category,
          imageURL: downloadURL,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
          alert("Product saved successfully!");
          document.getElementById("productForm").reset();
        })
        .catch((error) => {
          console.error("Error saving product:", error);
        });
      });
    }
  );
});

// Search and Display Products
const searchInput = document.getElementById("searchInput");
const productList = document.getElementById("productList");

searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();

  db.collection("products")
    .orderBy("name")
    .startAt(searchTerm)
    .endAt(searchTerm + "\uf8ff")
    .get()
    .then((querySnapshot) => {
      productList.innerHTML = "";
      querySnapshot.forEach((doc) => {
        const product = doc.data();
        productList.innerHTML += `
          <div class="product-item">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Rate: $${product.rate}</p>
            <p>Brand: ${product.brand || "N/A"}</p>
            <p>Category: ${product.category}</p>
            <img src="${product.imageURL}" alt="${product.name}" width="100">
            <button onclick="editProduct('${doc.id}')">Edit</button>
          </div>
        `;
      });
    })
    .catch((error) => {
      console.error("Error searching products:", error);
    });
});

// Edit Product
const editProduct = (productId) => {

// Track product save event
firebase.analytics().logEvent("product_saved");

  // Redirect to edit page with product ID
  window.location.href = `edit-product.html?id=${productId}`;
};