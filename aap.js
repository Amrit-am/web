// app.js

// Initialize Firebase Authentication
const auth = firebase.auth();

// Login with Email and Password
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      window.location.href = "index.html"; // Redirect to main page
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});

// Signup with Email and Password
document.getElementById("signupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      window.location.href = "index.html"; // Redirect to main page
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});

// Sign in with Google
const signInWithGoogle = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      window.location.href = "index.html"; // Redirect to main page
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
};





// app.js

// Sign up a new user
const signUp = (email, password) => {
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User created:", user);
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
};

// Sign in an existing user
const signIn = (email, password) => {
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User signed in:", user);
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
};

// Example usage
signUp("test@example.com", "password123");
signIn("test@example.com", "password123");