import firebase from "firebase/app";
import "firebase/auth";
import "./App.css";
import firebaseConfig from "./firebase.config";
import React, { useState } from "react";

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignIn: false,
    name: "",
    email: "",
    password: "",
    photo: "",
    message: "",
    messageColor: "",
  });

  const provider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((res) => {
        const { displayName, photoURL, email } = res.user;
        const signedInUser = {
          isSignIn: true,
          name: displayName,
          email: email,
          photo: photoURL,
        };
        setUser(signedInUser);
      })
      .catch((err) => {
        console.log(err);
        console.log(err.message);
      });
  };

  const handleFbSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // The signed-in user info.
        var user = result.user;

        console.log("fb user after sign in", user);
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var accessToken = credential.accessToken;

        // ...
      })
      .catch((error) => {
        console.log(error.message);
        // Handle Errors here.
        // var errorCode = error.code;
        // var errorMessage = error.message;
        // // The email of the user's account used.
        // var email = error.email;
        // // The firebase.auth.AuthCredential type that was used.
        // var credential = error.credential;
        // ...
      });
  };
  const handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then((res) => {
        const signOutUser = {
          isSignIn: false,
          name: "",
          email: "",
          photo: "",
        };
        setUser(signOutUser);
      })
      .catch((err) => console.log(err));
  };
  const handleSubmit = (event) => {
    if (newUser && user.email && user.password) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then((userCredential) => {
          const newUser = { ...user };
          newUser.message = "You have successfully created your account!";
          newUser.messageColor = "green";
          setUser(newUser);
          updateUserName(user.name);
        })
        .catch((error) => {
          const newUser = { ...user };
          newUser.message = "Sorry! Your account is already created!";
          newUser.messageColor = "red";
          setUser(newUser);
        });
    }
    if (!newUser && user.email && user.password) {
      firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          // Signed in
          // ...
          console.log("signed in user info", res.user);
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
    event.preventDefault();
  };
  const handleBlur = (event) => {
    let isFieldValid = true;
    if (event.target.name === "email") {
      isFieldValid = /\S+@\S+\.\S+/.test(event.target.value);
    }
    if (event.target.name === "password") {
      const isPasswordValid = event.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(event.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }
  };

  const updateUserName = (name) => {
    const user = firebase.auth().currentUser;
    user
      .updateProfile({
        displayName: name,
      })
      .then(function () {
        // Update successful.
        console.log("user name updated successfully!");
      })
      .catch(function (error) {
        // An error happened.
        console.log(error);
      });
  };

  return (
    <div className="App">
      {user.isSignIn ? (
        <button onClick={handleSignOut}>Sign out</button>
      ) : (
        <button onClick={handleSignIn}>Sign in using Google</button>
      )}
      <br />
      <button onClick={handleFbSignIn}>Sign in using Facebook!</button>
      {user.isSignIn && (
        <div>
          <p>Welcome, {user.name}</p>
          <p>Your email: {user.email}</p>
          <img src={user.photo} alt="" />
        </div>
      )}
      <h1>Our Own Authentication</h1>
      <input
        type="checkbox"
        onChange={() => setNewUser(!newUser)}
        name="newUser"
        id=""
      />
      <label htmlFor="newUser">New User Sign Up</label>
      <form onSubmit={handleSubmit}>
        {newUser && (
          <input
            onBlur={handleBlur}
            type="text"
            name="name"
            placeholder="Your name"
          />
        )}
        <br />
        <input
          onBlur={handleBlur}
          type="text"
          name="email"
          placeholder="Your email address"
          required
        />
        <br />
        <input
          onBlur={handleBlur}
          type="password"
          name="password"
          placeholder="Your password"
          required
        />
        <br />
        <input type="submit" value={newUser ? "Sign Up" : "Sign in"} />
      </form>
      {user.messageColor === "green" && (
        <h1 style={{ color: "green" }}>{user.message}</h1>
      )}
      {user.messageColor === "red" && (
        <h1 style={{ color: "red" }}>{user.message}</h1>
      )}
    </div>
  );
}

export default App;
