'use client'

import { useState, useEffect } from 'react'

export function useGamification() {
    const [points, setPoints] = useState(0)
    const [streak, setStreak] = useState(0)

    useEffect(() => {
        // Only access localStorage on client-side
        const localPoints = localStorage.getItem('hub_points')
        const localStreak = localStorage.getItem('hub_streak')
        const lastActive = localStorage.getItem('hub_last_active')

        if (localPoints) setPoints(parseInt(localPoints, 10))

        const today = new Date().toDateString()

        if (!lastActive) {
            // First visit
            setStreak(1)
            localStorage.setItem('hub_streak', '1')
            localStorage.setItem('hub_last_active', today)
        } else if (lastActive !== today) {
            // Check if consecutive
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            if (lastActive === yesterday.toDateString()) {
                const newStreak = (parseInt(localStreak || '0', 10)) + 1
                setStreak(newStreak)
                localStorage.setItem('hub_streak', newStreak.toString())
            } else {
                setStreak(1)
                localStorage.setItem('hub_streak', '1')
            }
            localStorage.setItem('hub_last_active', today)
        } else {
            // Already active today
            if (localStreak) setStreak(parseInt(localStreak, 10))
        }
    }, [])

    const addPoints = (amount: number) => {
        setPoints(prev => {
            const np = prev + amount
            localStorage.setItem('hub_points', np.toString())
            return np
        })
    }

    return { points, streak, addPoints }
}
