import styled from "styled-components";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
} from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useFirebase } from "../contexts/FirebaseContext";
import { TextInput } from "./form/TextInput";
import { Button } from "./form/Button";
import { FormEventHandler, useCallback, useState } from "react";
import { getUnixTime } from "date-fns";
import GoogleIcon from "../assets/google-brands.svg";

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
`;

const Form = styled.form`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
  width: 350px;
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
  color: ${({ theme }) => theme.appTitle.crusherColor};
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
  color: ${({ theme }) => theme.primaryText};
  background-color: ${({ theme }) => theme.teleprompt.input.backgroundColor};
  transition: 0.3s all;

  &:hover {
    color: ${({ theme }) =>
      theme.form.button.variants.default_inverse.textColor};
  }

  cursor: pointer;
`;

export const Login = () => {
  const { auth, firestore } = useFirebase();
  const [signUpForm, setSignUpForm] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleSignIn = useCallback(async () => {
    // Sign in using a redirect.
    const provider = new GoogleAuthProvider();
    // Start a sign in process for an unauthenticated user.
    provider.addScope("profile");
    provider.addScope("email");
    await signInWithRedirect(auth, provider);
    // This will trigger a full page redirect away from your app
    // See FirebaseContext.tsx for capturing redirect results
  }, [auth]);

  const handleSignIn = useCallback(() => {
    if (email.length < 4 || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Sign in with email and pass.
    signInWithEmailAndPassword(auth, email, password)
      .then((userCreds) => {
        const now = getUnixTime(new Date());
        updateDoc(doc(firestore, "users", userCreds.user.uid), {
          lastLoggedIn: now,
        });
      })
      .catch(function (error) {
        // Handle Errors here.
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
        console.log(error);
      });
  }, [auth, email, firestore, password]);

  /**
   * Handles the sign up button press.
   */
  const handleSignUp = useCallback(() => {
    if (email.length < 4 || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Create user with email and pass.
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCreds) => {
        const now = getUnixTime(new Date());
        setDoc(doc(firestore, "users", userCreds.user.uid), {
          username,
          email,
          lastLoggedIn: now,
          created: now,
        });
      })
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == "auth/weak-password") {
          setErrorMessage("Please use a stronger password.");
        } else {
          setErrorMessage(errorMessage);
        }
        console.log(error);
      });
  }, [auth, email, firestore, password, username]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (signUpForm) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <FormHeader>
          <Title>LOGIN</Title>
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
                height: "1.5rem",
                width: "1.5rem",
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
            >
              {signUpForm ? "Sign up" : "Log in"}
            </Button>
          </FormSubmitOptions>
        </FormOptions>
      </Form>
    </Container>
  );
};
