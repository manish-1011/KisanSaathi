import React from "react";
import { Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { preloadedImages } from "../utils/imagePreloader";

const UltraCompactHeroContainer = styled(Stack)(({ theme }) => ({
  direction: 'row',
  gap: '6px', // Reduced from 12px
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2px 8px', // Drastically reduced from 8px 16px
  margin: '0 auto',
  maxWidth: '1200px',
  overflowX: 'auto',
  '&::-webkit-scrollbar': {
    height: '4px', // Reduced scrollbar height
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0,0,0,.08)',
    borderRadius: '999px',
  },
  [theme.breakpoints.down('md')]: {
    gap: '4px',
    padding: '2px 6px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '3px',
    padding: '1px 4px',
  },
}));

const UltraCompactHeroImage = styled('img')(({ theme }) => ({
  display: 'block',
  width: '120px', // Drastically reduced from 200px
  height: '120px',
  objectFit: 'cover',
  borderRadius: '12px', // Reduced from 16px
  background: '#fff',
  boxShadow: '0 2px 8px rgba(16,24,40,.06)', // Reduced shadow
  transition: 'transform .15s ease, box-shadow .2s ease',
  '&:hover': {
    transform: 'translateY(-0.5px)', // Minimal hover effect
    boxShadow: '0 3px 12px rgba(16,24,40,.08)',
  },
  [theme.breakpoints.down('md')]: {
    width: '100px',
    height: '100px',
    borderRadius: '10px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '80px', // Very compact for mobile
    height: '80px',
    borderRadius: '8px',
  },
}));

export default function UltraCompactLazyHeroImages() {
  return (
    <UltraCompactHeroContainer>
      <UltraCompactHeroImage 
        src={preloadedImages.img1} 
        alt="Farming scene 1" 
        loading="eager"
        decoding="sync"
      />
      <UltraCompactHeroImage 
        src={preloadedImages.img2} 
        alt="Farming scene 2" 
        loading="eager"
        decoding="sync"
      />
      <UltraCompactHeroImage 
        src={preloadedImages.img3} 
        alt="Farming scene 3" 
        loading="eager"
        decoding="sync"
      />
      <UltraCompactHeroImage 
        src={preloadedImages.img4} 
        alt="Farming scene 4" 
        loading="eager"
        decoding="sync"
      />
    </UltraCompactHeroContainer>
  );
}