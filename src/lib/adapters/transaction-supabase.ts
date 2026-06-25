import type { Transaction, NewTransaction } from '../../domain/transaction'
import type { TransactionRepository } from '../ports/transaction-repository'
import { supabase } from '../supabase'

export class SupabaseTransactionRepository implements TransactionRepository {
  async list(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => ({
      id: row.id as string,
      userId: row.user_id as string,
      amount: row.amount as number,
      description: row.description as string,
      date: row.date as string,
      category: row.category as string,
      createdAt: row.created_at as string,
    }))
  }

  async add(tx: NewTransaction): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: tx.userId,
        amount: tx.amount,
        description: tx.description,
        date: tx.date,
        category: tx.category,
      })
      .select()
      .single()
    if (error) throw error
    return {
      id: data.id as string,
      userId: data.user_id as string,
      amount: data.amount as number,
      description: data.description as string,
      date: data.date as string,
      category: data.category as string,
      createdAt: data.created_at as string,
    }
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
  }
}
