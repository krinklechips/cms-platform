import nodemailer from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'
import { APIError, type EmailAdapter, type SendEmailOptions } from 'payload'

type Environment = Record<string, string | undefined>
type Transport = { sendMail: (message: SendEmailOptions) => Promise<unknown> }
type CreateTransport = (options: SMTPTransport.Options) => Transport

/** Missing delivery configuration must not fall back to a successful console log. */
export function cmsEmailAdapter(env: Environment = process.env, createTransport: CreateTransport = nodemailer.createTransport): EmailAdapter {
  const port = Number(env.SMTP_PORT || 465)
  const configured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && Number.isInteger(port) && port > 0 && port < 65536)
  return () => {
    const transport = configured ? createTransport({
      host: env.SMTP_HOST,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user: env.SMTP_USER!, pass: env.SMTP_PASS! },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    }) : null
    return {
      name: configured ? 'smtp' : 'unconfigured',
      defaultFromAddress: env.SMTP_USER || 'no-reply@serviettelab.com',
      defaultFromName: 'Roomchang CMS',
      sendEmail: async (message) => {
        if (!transport) throw new APIError('CMS email delivery is not configured. Please contact the administrator.', 503)
        try {
          return await transport.sendMail({ ...message, from: env.SMTP_FROM || message.from || env.SMTP_USER })
        } catch {
          throw new APIError('The CMS email could not be delivered. Please contact the administrator.', 503)
        }
      },
    }
  }
}
