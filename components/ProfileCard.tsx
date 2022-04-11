import { format } from "date-fns";
import styled from "styled-components";
import { useUser } from "../contexts/UserContext";
import { LabelValuePair } from "./layout/LabelValuePair";
import Image from "next/image";
import logo_src from "../assets/logo.png";
import { FlexColumn, FlexRow } from "./layout/FlexLayout";
import Link from "next/link";

const Container = styled.div`
  background: linear-gradient(
    45deg,
    rgb(0 19 31) 15%,
    rgba(41, 199, 172, 1) 105%
  );
  width: min-content;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgb(10 10 10 / 20%);
  padding: 35px;
  max-width: max-content;
  width: auto;
`;

const LogoWrapper = styled.div`
  position: relative;
  display: block;
  height: auto;
  width: 6rem;

  &::before {
    content: "";
    position: absolute;
    height: 85%;
    width: 85%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 2px solid white;
  }
`;

const LABEL_STYLE: React.CSSProperties = {
  textTransform: "uppercase",
};

const ProfileCard: React.FC = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div>
        Click <Link href={"/profile"}>here</Link> to sign in
      </div>
    );
  }

  return (
    <Container>
      <FlexRow style={{ gap: "20px" }}>
        <LogoWrapper>
          <Image
            src={logo_src}
            alt={"Key Crusher Logo"}
            layout={"responsive"}
            width={741}
            height={761}
          />
        </LogoWrapper>
        <FlexColumn>
          <FlexRow style={{ justifyContent: "space-between" }}>
            <LabelValuePair
              direction="column"
              gap={0}
              label="Username"
              value={user.username}
              labelStyle={LABEL_STYLE}
            />
            <LabelValuePair
              direction="column"
              gap={0}
              label="Member Since"
              value={format(user.created, "MMM d, yyyy")}
              labelStyle={LABEL_STYLE}
            />
          </FlexRow>
          <FlexRow style={{ gap: "20px" }}>
            <LabelValuePair
              direction="column"
              gap={0}
              label="Avg WPM"
              value={"100.82 wpm"}
              labelStyle={LABEL_STYLE}
            />
            <LabelValuePair
              direction="column"
              gap={0}
              label="Max WPM"
              value={"150.32 wpm"}
              labelStyle={LABEL_STYLE}
            />
            <LabelValuePair
              direction="column"
              gap={0}
              label="Avg RTT"
              value={"13.28 ms"}
              labelStyle={LABEL_STYLE}
            />
            <LabelValuePair
              direction="column"
              gap={0}
              label="Min RTT"
              value={"8.01 ms"}
              labelStyle={LABEL_STYLE}
            />
          </FlexRow>
        </FlexColumn>
      </FlexRow>
    </Container>
  );
};

export default ProfileCard;
