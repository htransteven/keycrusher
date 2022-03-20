import styled from "styled-components";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useFirebase } from "../contexts/FirebaseContext";
import { TextInput } from "./form/TextInput";
import { Button } from "./form/Button";
import { FormEventHandler, useCallback, useState } from "react";
import GoogleIcon from "../assets/google-brands.svg";
import { User } from "../models/User";
import { Loading } from "./Loading";

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  margin: 35px 0px;
`;

const Form = styled.form`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
  width: 350px;
  margin-bottom: 50px;
`;

const FormHeader = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

const FormOptions = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const FormSubmitOptions = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
`;

const Title = styled.span`
  font-size: 2rem;
  letter-spacing: 0.2rem;
  color: ${({ theme }) => theme.navbar.appTitle.crusherColor};
  font-weight: bold;
`;

const ErrorMessage = styled.span`
  font-size: 0.8rem;
  text-align: right;
  color: ${({ theme }) => theme.form.errorMessageColor};
  opacity: 0.5;
`;

const GoogleIconWrapper = styled.a`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 3px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  background-color: ${({ theme }) => theme.teleprompt.input.backgroundColor};
  transition: 0.3s all;

  &:hover {
    color: ${({ theme }) =>
      theme.form.button.variants.default_inverse.textColor};
  }

  cursor: pointer;
`;

export const Login = () => {
  const { auth, firestore, setFirebaseUser } = useFirebase();
  const [signUpForm, setSignUpForm] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [waiting, setWaiting] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    setWaiting(true);

    try {
      // use popup to sign in with google
      const userCreds = await signInWithPopup(auth, provider);
      if (!userCreds.user.email) {
        throw new Error("The user from Google's redirect result has no email");
      }

      // find user with same email
      const querySnapshot = await getDocs(
        query(
          collection(firestore, "users"),
          where("email", "==", userCreds.user.email)
        )
      );

      // check for multiple users with same email
      if (querySnapshot.size > 1) {
        throw new Error("More than one user was found with that email address");
      }
      // user with that email does not exist, create a new user
      if (querySnapshot.empty) {
        console.log("creating new user via google");
        let i = 1;
        const baseUsername = userCreds.user.email.substring(
          0,
          userCreds.user.email.indexOf("@")
        );
        let generatedUsername = baseUsername;

        // avoid duplicate usernames
        let existingUserDocsWithSameUsername = await getDocs(
          query(
            collection(firestore, "users"),
            where("username", "==", username)
          )
        );
        while (!existingUserDocsWithSameUsername.empty) {
          generatedUsername = `${baseUsername}${i}`;
          i++;
          existingUserDocsWithSameUsername = await getDocs(
            query(
              collection(firestore, "users"),
              where("username", "==", username)
            )
          );
        }

        const now = Date.now();
        const userPayload: User = {
          username: generatedUsername,
          email: userCreds.user.email,
          lastLoggedIn: now,
          created: now,
        };

        /*
        const credential = GoogleAuthProvider.credentialFromResult(userCreds);
        if (credential) {
          userPayload["oauth"] = {
            providerId: credential.providerId,
            idToken: credential.idToken,
            accessToken: credential.accessToken,
          };
        }
        */
        // create new user
        await setDoc(doc(firestore, "users", userCreds.user.uid), userPayload);
      } else {
        // user found
        await updateDoc(doc(firestore, "users", userCreds.user.uid), {
          lastLoggedIn: Date.now(),
        });
      }
      setFirebaseUser(userCreds.user);
    } catch (error: any) {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === "auth/popup-closed-by-user") {
        setErrorMessage("Login window was closed, please try again.");
      } else {
        setErrorMessage(errorMessage);
      }
      console.log(error);
    } finally {
      setWaiting(false);
    }
  }, [auth, firestore, setFirebaseUser, username]);

  const handleSignIn = useCallback(async () => {
    if (email.length < 4 || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // sign in with email and password
    setWaiting(true);
    try {
      const userCreds = await signInWithEmailAndPassword(auth, email, password);
      updateDoc(doc(firestore, "users", userCreds.user.uid), {
        lastLoggedIn: Date.now(),
      });
      setFirebaseUser(userCreds.user);
    } catch (error: any) {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === "auth/wrong-password") {
        setErrorMessage("Incorrect password");
      } else if (errorCode === "auth/user-not-found") {
        setSignUpForm(true);
        setErrorMessage("No user found with that email");
      } else {
        setErrorMessage(errorMessage);
      }
    } finally {
      setWaiting(false);
    }
  }, [auth, email, firestore, password, setFirebaseUser]);

  /**
   * Handles the sign up button press.
   */
  const handleSignUp = useCallback(async () => {
    if (email.length < 4 || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      // check for accounts with same username
      const existingUserDocsWithSameUsername = await getDocs(
        query(collection(firestore, "users"), where("username", "==", username))
      );
      if (!existingUserDocsWithSameUsername.empty) {
        throw new Error("That username is already taken.");
      }

      // create account
      const userCreds = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // create user
      const now = Date.now();
      await setDoc(doc(firestore, "users", userCreds.user.uid), {
        username,
        email,
        lastLoggedIn: now,
        created: now,
      });
      setFirebaseUser(userCreds.user);
    } catch (error: any) {
      var errorCode = error.code;
      var errorMessage = error.message;
      switch (errorCode) {
        case "auth/weak-password": {
          setErrorMessage("Please use a stronger password.");
          break;
        }
        case "auth/email-already-in-use": {
          setErrorMessage("That email is aready in use.");
          break;
        }
        default: {
          setErrorMessage(errorMessage);
        }
      }
      console.log(error);
    } finally {
      setWaiting(false);
    }
  }, [auth, email, firestore, password, setFirebaseUser, username]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (email.length === 0 || password.length === 0) {
      return;
    }
    if (signUpForm) {
      if (username.length === 0) {
        return;
      }
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <FormHeader>
          <Title>{signUpForm ? "SIGN UP" : "LOGIN"}</Title>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </FormHeader>
        {signUpForm && (
          <TextInput
            id="username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
        <TextInput
          id="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type={"email"}
        />
        <TextInput
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={"password"}
        />
        <FormOptions>
          <GoogleIconWrapper onClick={handleGoogleSignIn}>
            <GoogleIcon
              style={{
                height: "1rem",
                width: "1rem",
              }}
            />
          </GoogleIconWrapper>
          <FormSubmitOptions>
            <Button
              variant="helper"
              onClick={() => setSignUpForm((prev) => !prev)}
            >
              {signUpForm ? "I have an account" : "I need a new account"}
            </Button>
            <Button
              style={{ alignSelf: "flex-end" }}
              variant="default_inverse"
              type="submit"
              disabled={
                (signUpForm && username.length === 0) ||
                email.length === 0 ||
                password.length === 0
              }
            >
              {signUpForm ? "Sign up" : "Log in"}
            </Button>
          </FormSubmitOptions>
        </FormOptions>
      </Form>
      {waiting && <Loading />}
    </Container>
  );
};
