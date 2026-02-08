import styled from 'styled-components';

export const Button = styled.button`
    background: linear-gradient(90deg, #ff8a00, #e52e71);
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
    &:hover {
        transform: scale(1.05);
    }
`;

export const Container = styled.div`
    padding: 50px;
    text-align: center;
    font-family: 'Arial', sans-serif;
    background: #f3f3f3;
    min-height: 100vh;
`;

export const NFTCard = styled.div`
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 20px;
    margin: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;
