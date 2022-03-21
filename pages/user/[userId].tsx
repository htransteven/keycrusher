import { format } from "date-fns";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { useTheme } from "styled-components";
import { Button } from "../../components/form/Button";
import { Loading } from "../../components/Loading";
import { Login } from "../../components/Login";
import { UserHistory } from "../../components/UserHistory";
import { useFirebase } from "../../contexts/FirebaseContext";
import { useUser } from "../../contexts/UserContext";
import { User } from "../../models/api/user";
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

const UserIconContainer = styled.a<{ backgroundColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  border-radius: 50%;
  height: 35px;
  width: 35px;
  color: ${({ theme }) => theme.primaryTextColor};
  background-color: ${({ backgroundColor }) => backgroundColor};
  font-size: 1rem;
`;

const UserIcon: React.FC<{ username: string }> = ({ username }) => {
  const theme = useTheme();
  return (
    <Link href={`/user/${username}`} passHref>
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
    </Link>
  );
};

interface PageParams {
  userId?: string;
}

const UserPage = () => {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { firebaseUser } = useFirebase();
  const [loadingUser, setLoadingUser] = useState(true);
  const [otherUser, setOtherUser] = useState<User | null>(null);

  const followers = useMemo(() => {
    if (!otherUser) return [];
    return Object.keys(otherUser.network.followers).filter(
      (username) => otherUser.network.followers[username]
    );
  }, [otherUser]);
  const following = useMemo(() => {
    if (!otherUser) return [];
    return Object.keys(otherUser.network.following).filter(
      (username) => otherUser.network.following[username]
    );
  }, [otherUser]);

  const { userId } = router.query as PageParams;

  useEffect(() => {
    const loadUser = async () => {
      if (!userId || userId === user?.email || userId === user?.username) {
        router.replace("/profile");
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
      setOtherUser((await res.json()) as User);
      setLoadingUser(false);
    };

    loadUser();
  }, [router, user?.email, user?.username, userId]);

  const handleFollow = useCallback(async () => {
    if (!user || !otherUser || !firebaseUser) return;
    const res = await fetch("/api/user/network/follow", {
      method: "POST",
      headers: { authorization: `Bearer ${firebaseUser?.uid}` },
      body: JSON.stringify({ email: otherUser.email }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert("failed to follow user");
      console.log(data);
    }

    setUser((prev) =>
      !prev
        ? null
        : {
            ...prev,
            network: {
              ...prev.network,
              following: {
                ...prev.network.following,
                [otherUser.username]: true,
              },
            },
          }
    );
    setOtherUser((prev) =>
      !prev
        ? null
        : {
            ...prev,
            network: {
              ...prev.network,
              followers: {
                ...prev.network.followers,
                [user.username]: true,
              },
            },
          }
    );
  }, [firebaseUser, otherUser, setUser, user]);

  const handleUnfollow = useCallback(async () => {
    if (!user || !otherUser || !firebaseUser) return;
    const res = await fetch("/api/user/network/unfollow", {
      method: "POST",
      headers: { authorization: `Bearer ${firebaseUser?.uid}` },
      body: JSON.stringify({ email: otherUser.email }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert("failed to follow user");
      console.log(data);
    }

    setUser((prev) =>
      !prev
        ? null
        : {
            ...prev,
            network: {
              ...prev.network,
              following: {
                ...prev.network.following,
                [otherUser.username]: false,
              },
            },
          }
    );
    setOtherUser((prev) =>
      !prev
        ? null
        : {
            ...prev,
            network: {
              ...prev.network,
              followers: {
                ...prev.network.followers,
                [user.username]: false,
              },
            },
          }
    );
  }, [firebaseUser, otherUser, setUser, user]);

  console.log(otherUser, user);

  return (
    <>
      <Head>
        <title>Key Crusher | Profile</title>
        <meta
          name="description"
          content="A simple and fun speed typing application :)"
        />
      </Head>
      {!otherUser && loadingUser && <Loading value="LOADING USER" />}
      {!otherUser && !loadingUser && <Login />}
      {otherUser && (
        <Container>
          <LeftContainer>
            <Keycard>
              <KeycardData label="Username" value={otherUser.username} />
              <KeycardData label="Email" value={otherUser.email} />
              <KeycardData
                label="Member Since"
                value={format(otherUser.created, "MMM d, yyyy")}
              />
              {user && (
                <Button
                  onClick={
                    user.network.following[otherUser.username]
                      ? handleUnfollow
                      : handleFollow
                  }
                  variant={
                    user.network.following[otherUser.username]
                      ? "negative_inverse"
                      : "default_inverse"
                  }
                >
                  {user.network.following[otherUser.username]
                    ? "Unfollow"
                    : "Follow"}
                </Button>
              )}
            </Keycard>
            <UserNetworkContainer>
              <span>Followers</span>
              <UserNetworkSubContainer>
                {followers.length === 0 && <p>None</p>}
                {followers.map((username) => (
                  <UserIcon
                    key={`followers-user-${username}`}
                    username={username}
                  />
                ))}
                {followers.length > 5 && (
                  <AndMoreText>and {followers.length - 5} more...</AndMoreText>
                )}
              </UserNetworkSubContainer>
              <span>Following</span>
              <UserNetworkSubContainer>
                {following.length === 0 && <p>None</p>}
                {following.map((username) => (
                  <UserIcon
                    key={`following-user-${username}`}
                    username={username}
                  />
                ))}
                {following.length > 5 && (
                  <AndMoreText>and {following.length - 5} more...</AndMoreText>
                )}
              </UserNetworkSubContainer>
            </UserNetworkContainer>
          </LeftContainer>
          <RightContainer></RightContainer>
        </Container>
      )}
    </>
  );
};

export default UserPage;
