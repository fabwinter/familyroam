import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResendClient(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export const resend = new Proxy({} as Resend, {
  get(_target, prop, receiver) {
    return Reflect.get(getResendClient(), prop, receiver);
  },
});
