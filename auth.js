// auth.js

// Initialize Firebase Authentication
const auth = firebase.auth();

// Sign up a new user
const signUp = (email, password) => {
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User created:", user);
      alert("User created successfully!");
    })
    .catch((error) => {
      console.error("Error:", error.message);
      alert("Error: " + error.message);
    });
};

// Sign in an existing user
const signIn = (email, password) => {
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User signed in:", user);
      alert("User signed in successfully!");
    })
    .catch((error) => {
      console.error("Error:", error.message);
      alert("Error: " + error.message);
    });
};

// Sign out
const signOut = () => {
  auth.signOut()
    .then(() => {
      console.log("User signed out");
      alert("User signed out successfully!");
    })
    .catch((error) => {
      console.error("Error:", error.message);
      alert("Error: " + error.message);
    });
};

// Export functions if needed
export { signUp, signIn, signOut };