import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Example from './src/App.SendButtonEnhanced'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Example />
  </StrictMode>,
)