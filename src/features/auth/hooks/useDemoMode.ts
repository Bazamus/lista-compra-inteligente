import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import type { SavedList } from '../../../hooks/useListHistory'

interface DemoSession {
  id: string
  created_at: string
  lists: SavedList[]
}

export function useDemoMode() {
  const { isAuthenticated } = useAuth()
  const [demoLists, setDemoLists] = useState<SavedList[]>([])
  const isDemoMode = !isAuthenticated

  // Cargar listas demo al montar
  useEffect(() => {
    if (isDemoMode) {
      loadDemoLists()
    }
  }, [isDemoMode])

  const loadDemoLists = () => {
    try {
      const sessionStr = localStorage.getItem('demo_session')
      if (sessionStr) {
        const session: DemoSession = JSON.parse(sessionStr)
        setDemoLists(session.lists || [])
      } else {
        // Crear nueva sesión demo
        createDemoSession()
      }
    } catch (error) {
      console.error('Error loading demo lists:', error)
      createDemoSession()
    }
  }

  const createDemoSession = () => {
    const newSession: DemoSession = {
      id: 'demo_' + Date.now(),
      created_at: new Date().toISOString(),
      lists: []
    }
    localStorage.setItem('demo_session', JSON.stringify(newSession))
    setDemoLists([])
  }

  const saveDemoList = (list: SavedList): boolean => {
    try {
      const sessionStr = localStorage.getItem('demo_session')
      const session: DemoSession = sessionStr
        ? JSON.parse(sessionStr)
        : {
            id: 'demo_' + Date.now(),
            created_at: new Date().toISOString(),
            lists: []
          }

      // Límite de 3 listas en modo demo
      if (session.lists.length >= 3) {
        return false // Indica que se alcanzó el límite
      }

      session.lists.push(list)
      localStorage.setItem('demo_session', JSON.stringify(session))
      setDemoLists(session.lists)
      return true
    } catch (error) {
      console.error('Error saving demo list:', error)
      return false
    }
  }

  const deleteDemoList = (listId: string) => {
    try {
      const sessionStr = localStorage.getItem('demo_session')
      if (!sessionStr) return

      const session: DemoSession = JSON.parse(sessionStr)
      session.lists = session.lists.filter(list => list.id !== listId)
      localStorage.setItem('demo_session', JSON.stringify(session))
      setDemoLists(session.lists)
    } catch (error) {
      console.error('Error deleting demo list:', error)
    }
  }

  const clearDemoSession = () => {
    localStorage.removeItem('demo_session')
    setDemoLists([])
  }

  const updateDemoListName = (listId: string, newName: string) => {
    try {
      const sessionStr = localStorage.getItem('demo_session')
      if (!sessionStr) return

      const session: DemoSession = JSON.parse(sessionStr)
      session.lists = session.lists.map(list =>
        list.id === listId ? { ...list, nombre: newName } : list
      )
      localStorage.setItem('demo_session', JSON.stringify(session))
      setDemoLists(session.lists)
    } catch (error) {
      console.error('Error updating demo list name:', error)
    }
  }

  const getDemoListsCount = (): number => {
    return demoLists.length
  }

  const canAddMoreLists = (): boolean => {
    return demoLists.length < 3
  }

  return {
    isDemoMode,
    demoLists,
    saveDemoList,
    deleteDemoList,
    clearDemoSession,
    updateDemoListName,
    getDemoListsCount,
    canAddMoreLists,
  }
}

