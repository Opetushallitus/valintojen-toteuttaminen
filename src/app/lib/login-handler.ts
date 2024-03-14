'use server'

import { cookies } from 'next/headers';
import { configuration } from './configuration';
import { redirect, RedirectType } from 'next/navigation';

export async function login() {
  if (cookies().get(configuration.sessionCookie) === undefined) {
    redirect(configuration.loginUrl, RedirectType.replace);
  }
}