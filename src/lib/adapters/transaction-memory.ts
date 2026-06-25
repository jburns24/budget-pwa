import type { Transaction, NewTransaction } from '../../domain/transaction'
import type { TransactionRepository } from '../ports/transaction-repository'

export class InMemoryTransactionRepository implements TransactionRepository {
  private store: Transaction[] = []

  async list(userId: string): Promise<Transaction[]> {
    return this.store.filter((t) => t.userId === userId)
  }

  async add(tx: NewTransaction): Promise<Transaction> {
    const transaction: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    this.store.push(transaction)
    return transaction
  }

  async remove(id: string): Promise<void> {
    this.store = this.store.filter((t) => t.id !== id)
  }
}
