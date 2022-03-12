import { format } from "date-fns";
import Head from "next/head";
import styled from "styled-components";
import { Button } from "../components/form/Button";
import { Loading } from "../components/Loading";
import { Login } from "../components/Login";
import { UserHistory } from "../components/UserHistory";
import { useFirebase } from "../contexts/FirebaseContext";
import { useUser } from "../contexts/UserContext";

const Container = styled.div`
  padding-top: 10px;
  display: flex;
  flex-flow: row wrap;
  gap: 20px 10px;
`;

const Keycard = styled.div`
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  height: min-content;
  gap: 10px;
  padding: 20px;
  border-radius: 3px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  background-color: ${({ theme }) => theme.profile.keycard.backgroundColor};
`;

const KeycardDataContainer = styled.div`
  height: 100%;
  width: max-content;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 5px;
`;
const KeycardLabel = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.profile.keycard.labelColor};
`;
const KeycardValue = styled.span`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.profile.keycard.textColor};
`;
const KeycardData: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => {
  return (
    <KeycardDataContainer>
      <KeycardLabel>{label}</KeycardLabel>
      <KeycardValue>{value}</KeycardValue>
    </KeycardDataContainer>
  );
};

const ProfilePage = () => {
  const { auth } = useFirebase();
  const { user, loadingUser } = useUser();

  return (
    <>
      <Head>
        <title>Key Crusher | Profile</title>
        <meta
          name="description"
          content="A simple and fun speed typing application :)"
        />
      </Head>
      {!user && loadingUser && <Loading value="LOADING USER" />}
      {!user && !loadingUser && <Login />}
      {user && (
        <Container>
          <Keycard>
            <KeycardData label="Username" value={user.username} />
            <KeycardData label="Email" value={user.email} />
            <KeycardData
              label="Member Since"
              value={format(user.created, "MMM d, yyyy")}
            />
            <Button variant={"negative"} onClick={() => auth.signOut()}>
              Sign out
            </Button>
          </Keycard>
          <UserHistory />
        </Container>
      )}
    </>
  );
};

export default ProfilePage;
