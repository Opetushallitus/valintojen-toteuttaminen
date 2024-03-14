interface Configuration  {
    serviceUrl: string,
    loginUrl: string,
    sessionCookie: string,
    hautUrl: string
};



export const configuration: Configuration = {
    serviceUrl: process.env.SERVICE_URL || 'http://localhost:3404',
    loginUrl: process.env.LOGIN_URL || 'https://virkailija.untuvaopintopolku.fi/cas/login?service=http://localhost:3404/api/login',
    sessionCookie: process.env.SESSION_COOKIE || 'JSESSIONID',
    hautUrl: 'https://virkailija.untuvaopintopolku.fi/kouta-internal/haku/search'
}