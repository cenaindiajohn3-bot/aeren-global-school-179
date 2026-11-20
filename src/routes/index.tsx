import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/components/school/login-page';
import { pageHead } from '@/components/school/portal-page';
export const Route=createFileRoute('/')({head:()=>pageHead('School Login','Student, teacher and admin login for the Aeren Global School examination and result portal.'),component:()=> <LoginPage/>});
