import React from "react";
import { preloadedImages } from "../utils/imagePreloader";

export default function LazyHeroImages() {
  return (
    <div className="hero-tiles">
      <img 
        src={preloadedImages.img1} 
        alt="" 
        className="hero-tile-img" 
        loading="eager"
        decoding="sync"
      />
      <img 
        src={preloadedImages.img2} 
        alt="" 
        className="hero-tile-img" 
        loading="eager"
        decoding="sync"
      />
      <img 
        src={preloadedImages.img3} 
        alt="" 
        className="hero-tile-img" 
        loading="eager"
        decoding="sync"
      />
      <img 
        src={preloadedImages.img4} 
        alt="" 
        className="hero-tile-img" 
        loading="eager"
        decoding="sync"
      />
    </div>
  );
}