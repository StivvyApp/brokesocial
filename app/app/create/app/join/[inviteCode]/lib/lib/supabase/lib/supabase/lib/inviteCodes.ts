const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 8
 
export function generateInviteCode(): string {
  return Array.from({ length: CODE_LENGTH }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
}
 
export function formatInviteCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`
}
 
export function cleanInviteCode(code: string): string {
  return code.replace(/-/g, '').toUpperCase()
}
 
export function getJoinUrl(inviteCode: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://brokesocial.app'
  return `${base}/join/${inviteCode}`
}
