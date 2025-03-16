import styled from "styled-components";
import { FormState } from "../Form";
import { useState, useContext } from "react";
import { toast } from "react-toastify";
import { TailSpin } from "react-loader-spinner";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

const uploadJSONToPinata = async (jsonData) => {
  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      body: JSON.stringify(jsonData),
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });
    const result = await res.json();
    if (result.IpfsHash) return result.IpfsHash;
    else throw new Error("Failed to upload JSON to Pinata");
  } catch (error) {
    throw error;
  }
};

const uploadFileToPinata = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const metadata = JSON.stringify({ name: file.name });
    formData.append("pinataMetadata", metadata);
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      body: formData,
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });
    const result = await res.json();
    if (result.IpfsHash) return result.IpfsHash;
    else throw new Error("Failed to upload file to Pinata");
  } catch (error) {
    throw error;
  }
};

const FormRightWrapper = () => {
  const Handler = useContext(FormState);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const uploadFiles = async (e) => {
    e.preventDefault();
    setUploadLoading(true);

    if (Handler.form.story !== "") {
      try {
        const ipfsHash = await uploadJSONToPinata({
          story: Handler.form.story,
        });
        Handler.setStoryUrl(ipfsHash);
      } catch (error) {
        console.error("Error uploading story:", error);
        toast.warn("Error Uploading Story");
      }
    }

    if (Handler.image !== null) {
      try {
        const ipfsHash = await uploadFileToPinata(Handler.image);
        Handler.setImageUrl(ipfsHash);
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.warn("Error Uploading Image");
      }
    }

    setUploadLoading(false);
    setUploaded(true);
    Handler.setUploaded(true);
    toast.success("Files Uploaded Successfully");
  };

  return (
    <FormRight>
      <FormInput>
        <FormRow>
          <RowFirstInput>
            <Label>Required Amount</Label>
            <Input
              onChange={Handler.FormHandler}
              value={Handler.form.requiredAmount}
              name="requiredAmount"
              type="number"
              placeholder="Enter Amount"
            />
          </RowFirstInput>
          <RowSecondInput>
            <Label>Choose Category</Label>
            <Select
              onChange={Handler.FormHandler}
              value={Handler.form.category}
              name="category"
            >
              <option>Education</option>
              <option>Health</option>
              <option>Animal</option>
            </Select>
          </RowSecondInput>
        </FormRow>
      </FormInput>
      <FormInput>
        <Label>Select Image</Label>
        <ImageInput
          alt="Upload Image"
          onChange={Handler.ImageHandler}
          type="file"
          accept="image/*"
        />
      </FormInput>
      {uploadLoading ? (
        <FuturisticButton>
          <TailSpin color="#fff" height={20} />
        </FuturisticButton>
      ) : !uploaded ? (
        <FuturisticButton onClick={uploadFiles}>Upload Files</FuturisticButton>
      ) : (
        <FuturisticButton disabled style={{ cursor: "not-allowed" }}>
          Files Uploaded Successfully
        </FuturisticButton>
      )}
      <FuturisticButton onClick={Handler.startCampaign}>
        Start Campaign
      </FuturisticButton>
    </FormRight>
  );
};

const FormRight = styled.div`
  width: 45%;
  padding: 2rem;
  background: #1e1e1e;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.8);
`;

const FormInput = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1.2rem;
  font-family: "Poppins", sans-serif;
`;

const FormRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const Label = styled.label`
  font-size: 1rem;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  background: #2a2e36;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  color: #e0e0e0;
  outline: none;
  width: 100%;
  transition: box-shadow 0.3s ease;
  &[type="number"]::-webkit-inner-spin-button,
  &[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
  &:focus {
    box-shadow: 0 0 8px #00bcd4;
  }
`;

const RowFirstInput = styled.div`
  width: 48%;
  display: flex;
  flex-direction: column;
`;

const RowSecondInput = styled.div`
  width: 48%;
  display: flex;
  flex-direction: column;
`;

const Select = styled.select`
  padding: 0.9rem;
  background: #2a2e36;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  color: #e0e0e0;
  outline: none;
  width: 100%;
  transition: box-shadow 0.3s ease;
  &:focus {
    box-shadow: 0 0 8px #00bcd4;
  }
`;

const ImageInput = styled.input`
  padding: 0.9rem;
  background: #2a2e36;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  color: #e0e0e0;
  outline: none;
  width: 100%;
  transition: all 0.3s ease;
  &::-webkit-file-upload-button {
    padding: 0.9rem;
    background: #00bcd4;
    color: #121212;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
  }
`;

const FuturisticButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(90deg, #00bcd4, #00e5ff);
  border: none;
  border-radius: 12px;
  color: #121212;
  font-size: 1.1rem;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  }
  &:disabled {
    background: gray;
    cursor: not-allowed;
  }
`;

export default FormRightWrapper;
