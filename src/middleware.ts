import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar se o usuário está autenticado
  const isAuthenticated = request.cookies.has('isLoggedIn');
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  // Se não estiver autenticado e não estiver na página de login, redirecionar para login
  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Se estiver autenticado e na página de login, redirecionar para home
  if (isAuthenticated && isLoginPage) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

// Configurar os caminhos onde o middleware será executado
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto:
     * 1. /api (rotas API)
     * 2. /_next (arquivos internos do Next.js)
     * 3. /_vercel (arquivos internos da Vercel)
     * 4. /favicon.ico, /robots.txt, /sitemap.xml (arquivos estáticos)
     */
    '/((?!api|_next|_vercel|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}; 