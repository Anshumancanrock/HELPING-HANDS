import styled from "styled-components";
import { FormState } from "../Form";
import { useContext } from "react";

const FormLeftWrapper = () => {
  const Handler = useContext(FormState);

  return (
    <FormLeft>
      <FormInput>
        <Label>Campaign Title</Label>
        <Input
          onChange={Handler.FormHandler}
          value={Handler.form.campaignTitle}
          placeholder="Enter Campaign Title"
          name="campaignTitle"
        />
      </FormInput>
      <FormInput>
        <Label>Story</Label>
        <TextArea
          onChange={Handler.FormHandler}
          value={Handler.form.story}
          name="story"
          placeholder="Describe Your Story"
        />
      </FormInput>
    </FormLeft>
  );
};

const FormLeft = styled.div`
  width: 48%;
  padding: 1.5rem;
  background: #1e1e1e;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
`;

const FormInput = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1.2rem;
`;

const Label = styled.label`
  font-size: 1rem;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.6rem;
  background: #2a2e36;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  color: #e0e0e0;
  outline: none;
  transition: box-shadow 0.3s ease;
  width: 100%;
  &:focus {
    box-shadow: 0 0 8px #00bcd4;
  }
`;

const TextArea = styled.textarea`
  padding: 0.9rem;
  background: #2a2e36;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  color: #e0e0e0;
  outline: none;
  transition: box-shadow 0.3s ease;
  min-height: 150px;
  resize: vertical;
  &:focus {
    box-shadow: 0 0 8px #00bcd4;
  }
`;

export default FormLeftWrapper;
