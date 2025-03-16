import styled from "styled-components";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import PaidIcon from "@mui/icons-material/Paid";
import EventIcon from "@mui/icons-material/Event";
import Image from "next/image";
import { ethers } from "ethers";
import CampaignFactory from "../artifacts/contracts/Campaign.sol/CampaignFactory.json";
import { useState } from "react";
import Link from "next/link";

export default function Index({
  AllData,
  HealthData,
  EducationData,
  AnimalData,
}) {
  const [filter, setFilter] = useState(AllData);

  return (
    <PageWrapper>
      <Header>
        <TitleMain>WEB 3.0 Crowdfunding</TitleMain>
        <Subtitle>Empowering Decentralized Campaigns</Subtitle>
      </Header>
      <FilterWrapper>
        <FilterAltIcon style={{ fontSize: 40, color: "#aaa" }} />
        <Category onClick={() => setFilter(AllData)}>All</Category>
        <Category onClick={() => setFilter(HealthData)}>Health</Category>
        <Category onClick={() => setFilter(EducationData)}>Education</Category>
        <Category onClick={() => setFilter(AnimalData)}>Animal</Category>
      </FilterWrapper>
      <CardsWrapper>
        {filter.map((e, idx) => (
          <Card key={idx}>
            <CardImg>
              <Image
                alt="Campaign Image"
                layout="fill"
                objectFit="cover"
                src={"https://crowdfunding.infura-ipfs.io/ipfs/" + e.image}
              />
            </CardImg>
            <CardContent>
              <CampaignTitle>{e.title}</CampaignTitle>
              <CardData>
                <TextIcon>
                  <AccountBoxIcon style={{ color: "#888" }} />
                  <span>
                    {e.owner.slice(0, 6)}...{e.owner.slice(-4)}
                  </span>
                </TextIcon>
                <TextIcon>
                  <PaidIcon style={{ color: "#888" }} />
                  <span>{e.amount} Matic</span>
                </TextIcon>
                <TextIcon>
                  <EventIcon style={{ color: "#888" }} />
                  <span>{new Date(e.timeStamp * 1000).toLocaleString()}</span>
                </TextIcon>
              </CardData>
              <Link passHref href={`/${e.address}`}>
                <FuturisticButton>Go to Campaign</FuturisticButton>
              </Link>
            </CardContent>
          </Card>
        ))}
      </CardsWrapper>
    </PageWrapper>
  );
}

export async function getStaticProps() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL
  );
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_ADDRESS,
    CampaignFactory.abi,
    provider
  );
  const allCampaignEvents = await contract.queryFilter(
    "campaignCreated",
    0,
    "latest"
  );

  const AllData = allCampaignEvents.map((e) => ({
    title: e.args.title,
    image: e.args.imgURI,
    owner: e.args.owner,
    timeStamp: parseInt(e.args.timestamp),
    amount: ethers.utils.formatEther(e.args.requiredAmount),
    address: e.args.campaignAddress,
    category: e.args.category || "",
  }));

  const HealthData = AllData.filter(
    (campaign) => campaign.category === "Health"
  );
  const EducationData = AllData.filter(
    (campaign) => campaign.category === "Education"
  );
  const AnimalData = AllData.filter(
    (campaign) => campaign.category === "Animal"
  );

  return {
    props: {
      AllData,
      HealthData,
      EducationData,
      AnimalData,
    },
    revalidate: 10,
  };
}

/* ---------------------- Styled Components ---------------------- */

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #0d1117, #161b22);
  min-height: 100vh;
  padding: 2rem;
  color: #ccc;
  font-family: "Roboto", sans-serif;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const TitleMain = styled.h1`
  font-size: 3rem;
  margin: 0;
  letter-spacing: 2px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
  color: #ccc;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #aaa;
`;

const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Category = styled.div`
  padding: 0.8rem 1.5rem;
  background-color: rgba(0, 0, 0, 0.3);
  border: 2px solid transparent;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #ccc;
  &:hover {
    background-color: rgba(0, 0, 0, 0.5);
    border-color: #00bcd4;
  }
`;

const CardsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
`;

const Card = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  overflow: hidden;
  width: 300px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.9);
  }
`;

const CardImg = styled.div`
  position: relative;
  height: 200px;
  width: 100%;
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const CampaignTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0.5rem 0;
  color: #ccc;
`;

const CardData = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.8rem 0;
`;

const TextIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #aaa;
`;

const FuturisticButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: linear-gradient(90deg, #00bcd4, #00e5ff);
  border: none;
  border-radius: 30px;
  color: #0d1117;
  font-size: 1rem;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.3s ease;
  margin-top: 1rem;
  &:hover {
    transform: scale(1.05);
  }
`;
