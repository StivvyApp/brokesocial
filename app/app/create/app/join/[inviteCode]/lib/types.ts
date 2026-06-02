export type NightType = 'night_out' | 'dinner' | 'date' | 'tailgate' | 'pregame' | 'trip' | 'custom'
export type VibeMode = 'safe' | 'balanced' | 'menace'
export type ExpenseCategory = 'food' | 'uber' | 'cover' | 'drinks' | 'snacks' | 'tickets' | 'outfit' | 'other'
export type NightStatus = 'active' | 'archived'
 
export interface User { id: string; display_name: string; email?: string; created_at: string }
 
export interface Night {
  id: string; invite_code: string; creator_id: string | null; title: string
  night_type: NightType; budget_total: number; group_size: number
  vibe_mode: VibeMode; categories: ExpenseCategory[]
  budget_breakdown: BudgetBreakdown; status: NightStatus; created_at: string
}
 
export interface NightMember {
  id: string; night_id: string; user_id: string | null; display_name: string
  session_token: string | null; is_creator: boolean; joined_at: string
}
 
export interface Expense {
  id: string; night_id: string; paid_by_member_id: string
  title: string; amount: number; category: ExpenseCategory; created_at: string
  paid_by?: NightMember
}
 
export interface ExpenseSplit {
  id: string; expense_id: string; night_id: string
  owed_by_member_id: string; amount: number; created_at: string
  owed_by?: NightMember; expense?: Expense
}
 
export interface Photo {
  id: string; night_id: string; uploaded_by_member_id: string | null
  storage_path: string; caption: string | null; created_at: string; url?: string
}
 
export interface DamageReport {
  id: string; night_id: string; planned_total: number; actual_total: number
  over_under: number; biggest_leak_category: ExpenseCategory | null
  awards: MemberAward[]; roast_text: string; group_rating: string
  created_at: string; updated_at: string
}
 
export interface MemberAward { member_id: string; member_name: string; award: AwardType; label: string }
 
export type AwardType = 'uber_victim' | 'responsible_menace' | 'late_night_food_liability'
  | 'budget_demon' | 'cover_charge_casualty' | 'financially_dangerous'
  | 'most_economical_menace' | 'top_payer' | 'biggest_debtor'
 
export interface BudgetBreakdown { [category: string]: number }
 
export interface MemberBalance {
  member: NightMember; totalPaid: number; totalOwed: number; netBalance: number
}
 
export interface DebtSimplified {
  from: NightMember; to: NightMember; amount: number; venmoText: string
}
 
export interface CreateNightForm {
  title: string; night_type: NightType; budget_total: number
  group_size: number; vibe_mode: VibeMode; categories: ExpenseCategory[]
}
 
export interface AddExpenseForm {
  title: string; amount: number; category: ExpenseCategory
  paid_by_member_id: string; involved_member_ids: string[]
  split_type: 'even' | 'custom'
  custom_splits?: { member_id: string; amount: number }[]
}
 
