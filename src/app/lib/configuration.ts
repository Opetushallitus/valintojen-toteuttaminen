interface Configuration  {
    loginUrl: string,
    sessionCookie: string,
};



export const configuration: Configuration = {
    loginUrl: process.env.LOGIN_URL || 'https://virkailija.untuvaopintopolku.fi/cas/login?service=http://localhost:3404',
    sessionCookie: process.env.SESSION_COOKIE || 'JSESSIONID'
}