import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { auditApi, userApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Search } from 'lucide-react'

interface Audit {
  id: string
  website_url: string
  status: string
  wcag_score: number | null
  wcag_level: string | null
  total_violations: number
  created_at: string
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [audits, setAudits] = useState<Audit[]>([])
  const [filteredAudits, setFilteredAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    fetchData()
  }, [user, navigate])

  const fetchData = async () => {
    setLoading(true)

    // Fetch audits
    const auditsResponse = await auditApi.list()
    if (auditsResponse.data) {
      setAudits(auditsResponse.data as Audit[])
      setFilteredAudits(auditsResponse.data as Audit[])
    }

    // Fetch credits
    const creditsResponse = await userApi.getCredits()
    if (creditsResponse.data) {
      setCredits((creditsResponse.data as { credits: number }).credits)
    }

    setLoading(false)
  }

  useEffect(() => {
    let filtered = [...audits]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((audit) =>
        audit.website_url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const days = dateFilter === '7days' ? 7 : 30
      const cutoff = new Date(now.setDate(now.getDate() - days))

      filtered = filtered.filter(
        (audit) => new Date(audit.created_at) >= cutoff
      )
    }

    setFilteredAudits(filtered)
  }, [searchQuery, dateFilter, audits])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'scanning':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getWcagColor = (score: number | null) => {
    if (!score) return 'text-gray-500'
    if (score >= 95) return 'text-green-600'
    if (score >= 85) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Audit Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-600">Credits:</span>{' '}
              <span className="font-semibold">{credits}</span>
            </div>
            <Link to="/pricing">
              <Button variant="outline">Buy Credits</Button>
            </Link>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Audits</h3>
            <p className="text-3xl font-bold mt-2">{audits.length}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600">Credits Used</h3>
            <p className="text-3xl font-bold mt-2">{audits.length}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600">Avg WCAG Score</h3>
            <p className="text-3xl font-bold mt-2">
              {audits.length > 0
                ? (
                    audits.reduce((sum, a) => sum + (a.wcag_score || 0), 0) /
                    audits.filter((a) => a.wcag_score).length
                  ).toFixed(1)
                : '—'}
            </p>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by website URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
            <Link to="/scan">
              <Button>New Scan</Button>
            </Link>
          </div>
        </div>

        {/* Audits List */}
        {filteredAudits.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-medium mb-2">No audits yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by running your first accessibility audit
            </p>
            <Link to="/scan">
              <Button>Run First Scan</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAudits.map((audit) => (
              <Card key={audit.id} className="p-6 hover:shadow-lg transition-shadow">
                <Link to={`/audits/${audit.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {audit.website_url}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(audit.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">WCAG Score</p>
                        <p className={`text-2xl font-bold ${getWcagColor(audit.wcag_score)}`}>
                          {audit.wcag_score?.toFixed(1) || '—'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Violations</p>
                        <p className="text-2xl font-bold">{audit.total_violations}</p>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            audit.status
                          )}`}
                        >
                          {audit.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
