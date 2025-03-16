import styled from "styled-components";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import PaidIcon from "@mui/icons-material/Paid";
import EventIcon from "@mui/icons-material/Event";
import Image from "next/image";
import { ethers } from "ethers";
import CampaignFactory from "../artifacts/contracts/Campaign.sol/CampaignFactory.json";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [campaignsData, setCampaignsData] = useState([]);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state update after unmount

    const Request = async () => {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const Web3provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = Web3provider.getSigner();
      const Address = await signer.getAddress();

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ADDRESS,
        CampaignFactory.abi,
        provider
      );

      const getAllCampaigns = contract.filters.campaignCreated(
        null,
        null,
        Address
      );
      const AllCampaigns = await contract.queryFilter(getAllCampaigns);
      const AllData = AllCampaigns.map((e) => ({
        title: e.args.title,
        image: e.args.imgURI,
        owner: e.args.owner,
        timeStamp: parseInt(e.args.timestamp),
        amount: ethers.utils.formatEther(e.args.requiredAmount),
        address: e.args.campaignAddress,
      }));

      if (isMounted) {
        setCampaignsData(AllData);
      }
    };

    Request();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardWrapper>
      <Header>
        <DashboardTitle>My Campaigns</DashboardTitle>
      </Header>
      <CardsWrapper>
        {campaignsData.map((e) => (
          <Card key={e.title}>
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
    </DashboardWrapper>
  );
}

const DashboardWrapper = styled.div`
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

const DashboardTitle = styled.h1`
  font-size: 2.5rem;
  margin: 0;
  letter-spacing: 1.5px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
  color: #ccc;
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
  font-size: 1.3rem;
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
  &:hover {
    transform: scale(1.05);
  }
`;
