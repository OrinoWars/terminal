import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html, body, #root {
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: auto; /* Tüm sayfa için scroll eklendi */
        background: url('/bg.png') no-repeat center center fixed;
        background-size: cover;
    }

    body {
        font-family: 'Poppins', sans-serif;
        color: white;
    }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 50%;
  margin: auto;
  text-align: center;
  overflow: auto; /* Scroll için eklendi */

  @media (max-width: 1550px) {
    width: 60%;
  }

  @media (max-width: 1070px) {
    width: 80%;
  }

  @media (max-width: 830px) {
    width: 90%;
  }

  @media (max-width: 766px) {
    width: 80%;
  }

  @media (max-width: 629px) {
    width: 100%;
  }
`;

export const Button = styled.button`
  font-weight: bold;
  letter-spacing: 1px;
  transition: all 0.4s ease;
  margin: 20px;
  &:hover {
    transform: scale(1.05);
  }
  &:disabled {
    background: grey;
    cursor: not-allowed;
  }
`;

export const LoadingText = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  font-size: 18px;
  color: #ff8a00;
`;

export const Title = styled.h1`
  margin-bottom: 20px;
`;
