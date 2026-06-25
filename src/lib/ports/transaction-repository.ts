import type { Transaction, NewTransaction } from '../../domain/transaction'

export interface TransactionRepository {
  list(userId: string): Promise<Transaction[]>
  add(tx: NewTransaction): Promise<Transaction>
  remove(id: string): Promise<void>
}
