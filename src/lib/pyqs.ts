export function canUploadPyqs(role: string) { return role === 'super_admin'; }
export function validatePyqFile(file: {name: string; size: number}) {
  if (!file.name.toLowerCase().endsWith('.pdf')) throw new Error('Choose a PDF question paper.');
  if (file.size === 0 || file.size > 10 * 1024 * 1024) throw new Error('Choose a PDF up to 10 MB.');
}