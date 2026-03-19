import { useState, useEffect } from 'react'

const WELCOME_KEY = 'welcome_seen'
const TUTORIAL_KEY = 'tutorial_complete'
const PROFILE_KEY = 'onboarding_answers'

export function useOnboarding() {
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(WELCOME_KEY)
    if (!seen) setShowWelcome(true)
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem(WELCOME_KEY, 'true')
    setShowWelcome(false)
  }

  const completeTutorial = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true')
  }

  const saveProfile = (profile: Record<string, string>) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  }

  return { showWelcome, completeOnboarding, completeTutorial, saveProfile }
}
