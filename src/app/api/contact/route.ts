import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
    const { name, mensaId, email, subject, message } = await req.json();

    if (!name || !email || !message) {
        return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST     ?? 'smtp.gmail.com',
        port:   Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const toAddress = process.env.CONTACT_TO ?? 'photocup@mensa.org';

    await transporter.sendMail({
        from:    `"PhotoCup 2026" <${process.env.SMTP_USER}>`,
        replyTo: `"${name}" <${email}>`,
        to:      toAddress,
        subject: `[PhotoCup Contact] ${subject || 'General Inquiry'} — ${name}`,
        text: [
            `Name:      ${name}`,
            `Mensa ID:  ${mensaId || '—'}`,
            `Email:     ${email}`,
            `Subject:   ${subject || '—'}`,
            '',
            message,
        ].join('\n'),
        html: `
            <div style="font-family:sans-serif;max-width:600px;color:#222">
                <h2 style="color:#C8860A">PhotoCup 2026 — Contact Form</h2>
                <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
                    <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold;width:120px">Name</td><td style="padding:6px 12px">${name}</td></tr>
                    <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Mensa ID</td><td style="padding:6px 12px">${mensaId || '—'}</td></tr>
                    <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Email</td><td style="padding:6px 12px"><a href="mailto:${email}">${email}</a></td></tr>
                    <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Subject</td><td style="padding:6px 12px">${subject || '—'}</td></tr>
                </table>
                <div style="background:#fafafa;padding:16px;border-left:3px solid #C8860A;white-space:pre-wrap">${message}</div>
            </div>
        `,
    });

    return NextResponse.json({ ok: true });
}
