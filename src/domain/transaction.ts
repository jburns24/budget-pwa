export type Transaction = {
  id: string
  userId: string
  amount: number
  description: string
  date: string
  category: string
  createdAt: string
}

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt'>
