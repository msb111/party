import styled from "styled-components";

export const Header = styled.header`
  background-color: #000000;
  min-height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  color: white;
`;

export const FaucetInfo = styled.div`
  background-color: #edbb99;
  border: 2px;
  border-radius: 1px;
  color: #282c34;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  margin: 0px 2px;
  padding: 4px 12px;

  ${props => props.hidden && "hidden"} :focus {
    border: none;
    outline: none;
  }
`;

export const WalletInfo = styled.div`
  background-color: #a3e4d7;
  border: 2px;
  border-radius: 1px;
  color: #282c34;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  margin: 0px 2px;
  padding: 4px 12px;

  ${props => props.hidden && "hidden"} :focus {
    border: none;
    outline: none;
  }
`;

export const RequestButton = styled.button`
  background-color: #52be80;
  border: 2px;
  border-radius: 8px;
  color: #282c34;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  margin: 0px 6px;
  padding: 10px 10px;

  ${props => props.hidden && "hidden"} :focus {
    border: none;
    outline: none;
  }
`;

export const WalletButton = styled.button`
  background-color: white;
  border: 2px;
  border-radius: 8px;
  color: #282c34;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  margin: 0px 6px;
  padding: 10px 10px;

  ${props => props.hidden && "hidden"} :focus {
    border: none;
    outline: none;
  }
`;
