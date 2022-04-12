import Head from "next/head";
import Link from "next/link";
import styled from "styled-components";
import { PaddedContainer } from "../components/layout/Containers";

const Title = styled.h2`
  border-left: 5px solid ${({ theme }) => theme.graphs.info.title.accent};
  padding: 2px 0 2px 10px;
`;

const SectionTitle = styled.h3``;

const Paragraph = styled.p``;

const UnorderedList = styled.ul``;
const ListItem = styled.li`
  margin: 10px 0;
`;

const TerminologyKey = styled.span`
  color: ${({ theme }) => theme.green};
  font-weight: bold;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 5px;
  margin: 10px 0;
`;

const ContactName = styled.span``;
const ContactEmail = styled.a`
  color: ${({ theme }) => theme.green};
`;

const AboutPage = () => {
  return (
    <>
      <Head>
        <title>About | Key Crusher</title>
        <meta name="description" content="About Key Crusher" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PaddedContainer includeNavPadding={true}>
        <Title>About Key Crusher</Title>
        <Paragraph>
          Key Crusher is a web app designed to calculate a user&apos;s typing
          statistics such as words-per-minute (wpm or WPM), accuracy, and
          read-to-type/text time (RTT).
        </Paragraph>
        <SectionTitle>Defining Terminology</SectionTitle>
        <UnorderedList>
          <ListItem>
            <TerminologyKey>Challenge</TerminologyKey>
            <Paragraph>synonym for typing test, assessment, etc.</Paragraph>
          </ListItem>
          <ListItem>
            <TerminologyKey>Daily Challenge</TerminologyKey>
            <Paragraph>
              The daily challenge is a new and random challenge generated
              everyday at 12:00am PST. The same set of words are given to
              everyone.
            </Paragraph>
          </ListItem>
          <ListItem>
            <TerminologyKey>Words-per-Minute (WPM)</TerminologyKey>
            <Paragraph>the rate at which a user can type</Paragraph>
            <Paragraph>
              This is calculated by dividing the total number of correct keys
              typed by 5 and then dividing by the challenge duration.
            </Paragraph>
          </ListItem>
          <ListItem>
            <TerminologyKey>Read-to-Type/Text Time (RTT)</TerminologyKey>
            <Paragraph>
              the measurement from when you begin processing the next character
              to type and when you actually press the key
            </Paragraph>
            <Paragraph>
              For example, if you were typing the word &quot;crusher&quot; and
              have already typed &quot;cr&quot;, the RTT for key &quot;u&quot;
              would be the time between pressing &quot;r&quot; and pressing
              &quot;u&quot;.
            </Paragraph>
          </ListItem>
          <ListItem>
            <TerminologyKey>Accuracy</TerminologyKey>
            <Paragraph>
              a measurement of how correct your input was relative to the
              challenge text
            </Paragraph>
            <Paragraph>
              This is calculated by dividing the total number of correct keys by
              the total number of keys typed.
            </Paragraph>
          </ListItem>
        </UnorderedList>
        <SectionTitle>Privacy Page</SectionTitle>
        <Paragraph>
          Your privacy is important! Click <Link href="/privacy">here</Link> to
          view Key Crusher&apos;s privacy policy.
        </Paragraph>
        <SectionTitle>Contact</SectionTitle>
        <Paragraph>
          Thank you for using Key Crusher. If you have any feedback,
          suggestions, or found a bug please feel free to contact me!
        </Paragraph>
        <ContactInfo>
          <ContactName>Steven Huynh-Tran</ContactName>
          <ContactEmail href="mailto:hello@keycrusher.com">
            hello@keycrusher.com 🚀
          </ContactEmail>
        </ContactInfo>
      </PaddedContainer>
    </>
  );
};

export default AboutPage;
