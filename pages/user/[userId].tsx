import { format } from "date-fns";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import styled, { useTheme } from "styled-components";
import { Button } from "../../components/form/Button";
import { Loading } from "../../components/Loading";
import { Login } from "../../components/Login";
import { UserHistory } from "../../components/UserHistory";
import { useFirebase } from "../../contexts/FirebaseContext";
import { APIResponse_User_Network } from "../../models/api/network";
import { User } from "../../models/firestore/User";
import { BREAKPOINTS } from "../../styles/breakpoints";

const Container = styled.div`
  width: 100%;
  padding-top: 10px;
  display: flex;
  flex-flow: row wrap;
  gap: 20px 10px;
`;

const LeftContainer = styled.div`
  flex: 1;
  max-width: max-content;
  display: flex;
  flex-flow: column nowrap;
  gap: 10px;

  @media only screen and (max-width: ${BREAKPOINTS.desktop}) {
    max-width: none;
  }
`;

const RightContainer = styled.div`
  flex: auto;
`;

const Keycard = styled.div`
  display: flex;
  flex-flow: column nowrap;
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

const UserNetworkContainer = styled.div`
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

const UserNetworkSubContainer = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 5px;
`;

const AndMoreText = styled.p`
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserIconContainer = styled.span<{ backgroundColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  border-radius: 50%;
  height: 35px;
  width: 35px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  font-size: 1rem;
`;

const UserIcon: React.FC<{ username: string }> = ({ username }) => {
  const theme = useTheme();
  return (
    <UserIconContainer
      backgroundColor={
        theme.profile.userNetwork.userIcon.backgroundColors[
          Math.floor(
            theme.profile.userNetwork.userIcon.backgroundColors.length *
              Math.random()
          )
        ]
      }
      title={username}
    >
      {username.charAt(0)}
    </UserIconContainer>
  );
};

interface PageParams {
  userId?: string;
}

const UserPage = () => {
  const router = useRouter();
  const { firebaseUser } = useFirebase();
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const { userId } = router.query as PageParams;

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) {
        //router.replace("/profile");
        return;
      }

      const query = new URLSearchParams();
      if (userId.includes("@")) {
        query.append("email", `${userId}`);
      } else {
        query.append("username", `${userId}`);
      }

      const res = await fetch(`/api/user?${query.toString()}`);
      if (!res.ok) {
        alert("failed to get user");
        console.log(await res.json());
      }
      setUser((await res.json()) as User);
      setLoadingUser(false);
    };

    loadUser();
  }, [router, userId]);

  useEffect(() => {
    const loadFollowersAndFollowing = async () => {
      if (!user) return;
      try {
        const query = new URLSearchParams();
        query.append("username", user.username);
        const res = await fetch(`/api/user/network?${query.toString()}`);
        if (!res.ok) {
          console.log(await res.json());
        }

        const data = (await res.json()) as APIResponse_User_Network;
        setFollowers(data.followers);
        setFollowing(data.following);
      } catch (error) {
        console.log(error);
      }
    };

    loadFollowersAndFollowing();
  }, [user]);

  const handleFollow = useCallback(async () => {
    if (!user || !firebaseUser) return;
    const res = await fetch("/api/user/network/follow", {
      method: "POST",
      headers: { authorization: `Bearer ${firebaseUser?.uid}` },
      body: JSON.stringify({ email: user.email }),
    });
    if (!res.ok) {
      alert("failex to follkow user");
      console.log(await res.json());
    }
  }, [firebaseUser, user]);

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
          <LeftContainer>
            <Keycard>
              <KeycardData label="Username" value={user.username} />
              <KeycardData label="Email" value={user.email} />
              <KeycardData
                label="Member Since"
                value={format(user.created, "MMM d, yyyy")}
              />
              <Button onClick={handleFollow}>Follow</Button>
            </Keycard>
            <UserNetworkContainer>
              <span>Followers</span>
              <UserNetworkSubContainer>
                {!followers && <p>Loading...</p>}
                {followers?.length === 0 && <p>None</p>}
                {followers?.map((username) => (
                  <UserIcon
                    key={`followers-user-${username}`}
                    username={username}
                  />
                ))}
                {followers && followers.length > 5 && (
                  <AndMoreText>and {followers.length - 5} more...</AndMoreText>
                )}
              </UserNetworkSubContainer>
              <span>Following</span>
              <UserNetworkSubContainer>
                {!following && <p>Loading...</p>}
                {following?.length === 0 && <p>None</p>}
                {following?.map((username) => (
                  <UserIcon
                    key={`following-user-${username}`}
                    username={username}
                  />
                ))}
                {following && following.length > 5 && (
                  <AndMoreText>and {following.length - 5} more...</AndMoreText>
                )}
              </UserNetworkSubContainer>
            </UserNetworkContainer>
          </LeftContainer>
          <RightContainer>
            <UserHistory />
          </RightContainer>
        </Container>
      )}
    </>
  );
};

export default UserPage;
