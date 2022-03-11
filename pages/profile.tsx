import Head from "next/head";
import styled from "styled-components";
import { Button } from "../components/form/Button";
import { Login } from "../components/Login";
import { useFirebase } from "../contexts/FirebaseContext";
import { useUser } from "../contexts/UserContext";

const Container = styled.div`
  padding-top: 20px;
`;

const ProfileHeader = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const Title = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.primaryText};
`;

const ProfilePage = () => {
  const { auth } = useFirebase();
  const { user } = useUser();

  if (!user) {
    return (
      <Container>
        <Login />
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Key Crusher | Profile</title>
        <meta
          name="description"
          content="A simple and fun speed typing application :)"
        />
      </Head>
      <Container>
        <ProfileHeader>
          <Title>Logged in as {user.username}</Title>
          <Button variant={"negative"} onClick={() => auth.signOut()}>
            Sign out
          </Button>
        </ProfileHeader>
      </Container>
    </>
  );
};

export default ProfilePage;
