import type { TransactionRepository } from './ports/transaction-repository'
import type { AuthPort } from './ports/auth-port'
import { InMemoryTransactionRepository } from './adapters/transaction-memory'
import { SupabaseTransactionRepository } from './adapters/transaction-supabase'
import { FakeAuthProvider } from './adapters/auth-fake'
import { SupabaseAuthProvider } from './adapters/auth-supabase'

// Outer DEV guard ensures fake adapters are tree-shaken from production bundles.
// Inner VITE_USE_FAKE_* flags allow opting into the real adapter during dev.

export function getTransactionRepository(): TransactionRepository {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FAKE_DATA === 'true') {
    return new InMemoryTransactionRepository()
  }
  return new SupabaseTransactionRepository()
}

export function getAuthPort(): AuthPort {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FAKE_AUTH === 'true') {
    return new FakeAuthProvider()
  }
  return new SupabaseAuthProvider()
}
