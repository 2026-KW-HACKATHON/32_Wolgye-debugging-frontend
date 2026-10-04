import { Suspense, useEffect, useState } from 'react'
import { Box, CircularProgress } from '@mui/material'
import AppShell from './components/AppShell'
import { pageComponents } from './pages'
import { pageFromHash, pages } from './types/navigation'
import './App.css'

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash)
  const pageId = pageFromHash(hash)

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const Page = pageComponents[pageId]
  const current = pages.find((page) => page.id === pageId) ?? pages[0]

  return <AppShell current={current}><Suspense fallback={<Box minHeight="60vh" display="grid" sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>}><Page key={hash} /></Suspense></AppShell>
}
