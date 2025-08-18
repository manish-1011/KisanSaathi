import React from "react";
import { Box, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { preloadedImages } from "../utils/imagePreloader";

const CompactHeroContainer = styled(Stack)(({ theme }) => ({
  direction: 'row',
  gap: '12px', // Reduced from 16px
  justifyContent: 'center',
  alignItems: 'center',
  padding: '8px 16px', // Reduced from 16px 24px
  margin: '0 auto', // Removed top/bottom margins
  maxWidth: '1200px',
  overflowX: 'auto',
  '&::-webkit-scrollbar': {
    height: '6px', // Reduced scrollbar height
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0,0,0,.12)',
    borderRadius: '999px',
  },
  [theme.breakpoints.down('md')]: {
    gap: '10px',
    padding: '6px 12px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '8px',
    padding: '4px 8px',
  },
}));

const CompactHeroImage = styled('img')(({ theme }) => ({
  display: 'block',
  width: '200px', // Reduced from 240px
  height: '200px',
  objectFit: 'cover',
  borderRadius: '16px',
  background: '#fff',
  boxShadow: '0 4px 16px rgba(16,24,40,.08)', // Reduced shadow
  transition: 'transform .15s ease, box-shadow .2s ease',
  '&:hover': {
    transform: 'translateY(-1px)', // Reduced from -2px
    boxShadow: '0 6px 20px rgba(16,24,40,.12)', // Reduced shadow
  },
  [theme.breakpoints.down('md')]: {
    width: '180px',
    height: '180px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '140px', // Reduced from 160px
    height: '140px',
  },
}));

export default function OptimizedLazyHeroImages() {
  return (
    <CompactHeroContainer>
      <CompactHeroImage 
        src={preloadedImages.img1} 
        alt="Farming scene 1" 
        loading="eager"
        decoding="sync"
      />
      <CompactHeroImage 
        src={preloadedImages.img2} 
        alt="Farming scene 2" 
        loading="eager"
        decoding="sync"
      />
      <CompactHeroImage 
        src={preloadedImages.img3} 
        alt="Farming scene 3" 
        loading="eager"
        decoding="sync"
      />
      <CompactHeroImage 
        src={preloadedImages.img4} 
        alt="Farming scene 4" 
        loading="eager"
        decoding="sync"
      />
    </CompactHeroContainer>
  );
}