import { useEffect, useState } from 'react'
import { useAuth } from '../auth/auth-context'
import { getTransactionRepository } from '../lib/registry'
import type { Transaction } from '../domain/transaction'

export default function Home() {
  const { user, signOut } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (!user) return
    const repo = getTransactionRepository()
    void repo.list(user.id).then(setTransactions)
  }, [user])

  return (
    <main>
      <h1>Budget</h1>
      <p>Welcome, {user?.name ?? user?.email}</p>
      <button onClick={() => void signOut()}>Sign out</button>
      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            {t.description}: ${t.amount}
          </li>
        ))}
      </ul>
    </main>
  )
}
