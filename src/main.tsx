// 只引 latin 子集:等宽字体不覆盖 CJK,其余子集(cyrillic/greek/vietnamese 等)用不到
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { reportWebVitals } from './lib/reportWebVitals.ts'
import './styles/globals.css'

reportWebVitals()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
