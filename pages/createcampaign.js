import styled from "styled-components";
import Image from "next/image";
import { ethers } from "ethers";
import CampaignFactory from "../artifacts/contracts/Campaign.sol/CampaignFactory.json";
import Campaign from "../artifacts/contracts/Campaign.sol/Campaign.json";
import { useEffect, useState } from "react";

export default function Detail({ Data, DonationsData }) {
  const [mydonations, setMydonations] = useState([]);
  const [story, setStory] = useState("");
  const [amount, setAmount] = useState("");
  const [change, setChange] = useState(false);

  useEffect(() => {
    const Request = async () => {
      let storyData;
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const Web3provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = Web3provider.getSigner();
      const Address = await signer.getAddress();

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      const contract = new ethers.Contract(
        Data.address,
        Campaign.abi,
        provider
      );

      const res = await fetch(
        "https://crowdfunding.infura-ipfs.io/ipfs/" + Data.storyUrl
      );
      storyData = await res.text();

      const MyDonations = contract.filters.donated(Address);
      const MyAllDonations = await contract.queryFilter(MyDonations);

      setMydonations(
        MyAllDonations.map((e) => ({
          donar: e.args.donar,
          amount: ethers.utils.formatEther(e.args.amount),
          timestamp: parseInt(e.args.timestamp),
        }))
      );

      setStory(storyData);
    };

    Request();
  }, [change]);

  const DonateFunds = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(Data.address, Campaign.abi, signer);
      const transaction = await contract.donate({
        value: ethers.utils.parseEther(amount),
      });
      await transaction.wait();
      setChange(true);
      setAmount("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DetailWrapper>
      <LeftContainer>
        <ImageSection>
          <Image
            alt="Campaign Image"
            layout="fill"
            objectFit="cover"
            src={"https://crowdfunding.infura-ipfs.io/ipfs/" + Data.image}
          />
        </ImageSection>
        <StoryText>{story}</StoryText>
      </LeftContainer>
      <RightContainer>
        <CampaignTitle>{Data.title}</CampaignTitle>
        <DonateSection>
          <DonationInput
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            placeholder="Enter Donation Amount"
          />
          <DonateButton onClick={DonateFunds}>Donate</DonateButton>
        </DonateSection>
        <FundsData>
          <FundsBox>
            <FundLabel>Required Amount</FundLabel>
            <FundValue>{Data.requiredAmount} Matic</FundValue>
          </FundsBox>
          <FundsBox>
            <FundLabel>Received Amount</FundLabel>
            <FundValue>{Data.receivedAmount} Matic</FundValue>
          </FundsBox>
        </FundsData>
        <DonationsSection>
          <SectionTitle>Recent Donations</SectionTitle>
          {DonationsData.map((e) => (
            <DonationItem key={e.timestamp}>
              <DonationInfo>
                {e.donar.slice(0, 6)}...{e.donar.slice(-4)}
              </DonationInfo>
              <DonationInfo>{e.amount} Matic</DonationInfo>
              <DonationInfo>
                {new Date(e.timestamp * 1000).toLocaleString()}
              </DonationInfo>
            </DonationItem>
          ))}
          <SectionTitle>My Donations</SectionTitle>
          {mydonations.map((e) => (
            <DonationItem key={e.timestamp}>
              <DonationInfo>
                {e.donar.slice(0, 6)}...{e.donar.slice(-4)}
              </DonationInfo>
              <DonationInfo>{e.amount} Matic</DonationInfo>
              <DonationInfo>
                {new Date(e.timestamp * 1000).toLocaleString()}
              </DonationInfo>
            </DonationItem>
          ))}
        </DonationsSection>
      </RightContainer>
    </DetailWrapper>
  );
}

export async function getStaticPaths() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL
  );
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_ADDRESS,
    CampaignFactory.abi,
    provider
  );
  const getAllCampaigns = contract.filters.campaignCreated();
  const AllCampaigns = await contract.queryFilter(getAllCampaigns);

  return {
    paths: AllCampaigns.map((e) => ({
      params: { address: e.args.campaignAddress.toString() },
    })),
    fallback: "blocking",
  };
}

export async function getStaticProps(context) {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL
  );
  const contract = new ethers.Contract(
    context.params.address,
    Campaign.abi,
    provider
  );

  const title = await contract.title();
  const requiredAmount = await contract.requiredAmount();
  const image = await contract.image();
  const storyUrl = await contract.story();
  const owner = await contract.owner();
  const receivedAmount = await contract.receivedAmount();

  const Donations = contract.filters.donated();
  const AllDonations = await contract.queryFilter(Donations);

  const Data = {
    address: context.params.address,
    title,
    requiredAmount: ethers.utils.formatEther(requiredAmount),
    image,
    receivedAmount: ethers.utils.formatEther(receivedAmount),
    storyUrl,
    owner,
  };

  const DonationsData = AllDonations.map((e) => ({
    donar: e.args.donar,
    amount: ethers.utils.formatEther(e.args.amount),
    timestamp: parseInt(e.args.timestamp),
  }));

  return {
    props: { Data, DonationsData },
    revalidate: 10,
  };
}

/* ---------------------- Styled Components ---------------------- */

const DetailWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 2rem;
  background: linear-gradient(135deg, #0d1117, #161b22);
  min-height: 100vh;
  color: #e0e0e0;
  font-family: "Roboto", sans-serif;
`;

const LeftContainer = styled.div`
  width: 45%;
  margin-bottom: 2rem;
`;

const RightContainer = styled.div`
  width: 45%;
  margin-bottom: 2rem;
`;

const ImageSection = styled.div`
  position: relative;
  width: 100%;
  height: 350px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
`;

const StoryText = styled.p`
  font-size: 1rem;
  text-align: justify;
  color: #ccc;
`;

const CampaignTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
  color: #e0e0e0;
`;

const DonateSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DonationInput = styled.input`
  padding: 0.8rem;
  width: 40%;
  border: none;
  border-radius: 8px;
  outline: none;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  /* Remove number input arrows */
  &[type="number"]::-webkit-inner-spin-button,
  &[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

const DonateButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: linear-gradient(90deg, #00b712, #5aff15);
  border: none;
  border-radius: 30px;
  color: #141e30;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const FundsData = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FundsBox = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const FundLabel = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #ccc;
`;

const FundValue = styled.p`
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
`;

const DonationsSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  text-transform: uppercase;
  background: #4cd137;
  padding: 0.5rem;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const DonationItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 8px;
`;

const DonationInfo = styled.p`
  font-size: 0.9rem;
  margin: 0;
  color: #ccc;
`;
