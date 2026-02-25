'use client'

import { useEffect, useState } from 'react'

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    async function fetchStats() {
        try {
            const res = await fetch('/api/admin/stats')
            const data = await res.json()
            setStats(data.stats)
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <h1>Dashboard Overview</h1>
            <div>Total Products: {stats?.totalProducts || 0}</div>
        </div>
    )
}
