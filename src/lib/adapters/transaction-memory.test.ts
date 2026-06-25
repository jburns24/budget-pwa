import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryTransactionRepository } from './transaction-memory'
import type { NewTransaction } from '../../domain/transaction'

function newTx(overrides: Partial<NewTransaction> = {}): NewTransaction {
  return {
    userId: 'user-1',
    amount: 10.5,
    description: 'Coffee',
    date: '2026-01-15',
    category: 'food',
    ...overrides,
  }
}

describe('InMemoryTransactionRepository', () => {
  let repo: InMemoryTransactionRepository

  beforeEach(() => {
    repo = new InMemoryTransactionRepository()
  })

  it('adds a transaction and returns it with an id and createdAt', async () => {
    const result = await repo.add(newTx())
    expect(result.id).toBeTruthy()
    expect(result.description).toBe('Coffee')
    expect(result.createdAt).toBeTruthy()
  })

  it('lists only transactions for the requested user', async () => {
    await repo.add(newTx({ userId: 'user-1' }))
    await repo.add(newTx({ userId: 'user-2', description: 'Lunch' }))
    const list = await repo.list('user-1')
    expect(list).toHaveLength(1)
    expect(list[0].userId).toBe('user-1')
  })

  it('reflects added transactions in subsequent list calls', async () => {
    await repo.add(newTx({ description: 'Breakfast' }))
    await repo.add(newTx({ description: 'Lunch' }))
    const list = await repo.list('user-1')
    expect(list).toHaveLength(2)
  })

  it('removes a transaction by id', async () => {
    const tx = await repo.add(newTx())
    await repo.remove(tx.id)
    const list = await repo.list('user-1')
    expect(list).toHaveLength(0)
  })

  it('separate instances are isolated from each other', async () => {
    await repo.add(newTx())
    const repo2 = new InMemoryTransactionRepository()
    const list = await repo2.list('user-1')
    expect(list).toHaveLength(0)
  })
})
