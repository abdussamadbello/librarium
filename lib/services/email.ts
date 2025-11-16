import { Resend } from 'resend'

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = 'Librarium <notifications@librarium.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface SendReservationReadyEmailParams {
  to: string
  userName: string
  bookTitle: string
  expiresAt: Date
  reservationId: number
}

interface SendReservationExpiringEmailParams {
  to: string
  userName: string
  bookTitle: string
  expiresAt: Date
  reservationId: number
}

interface SendOverdueNotificationParams {
  to: string
  userName: string
  bookTitle: string
  dueDate: Date
  daysOverdue: number
}

/**
 * Send email notification when a reserved book becomes available
 */
export async function sendReservationReadyEmail(params: SendReservationReadyEmailParams) {
  if (!resend) {
    console.warn('Resend not configured. Skipping email notification.')
    return null
  }

  const { to, userName, bookTitle, expiresAt, reservationId } = params

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: '📚 Your Reserved Book is Ready for Pickup!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: 'Georgia', 'Crimson Pro', serif;
                line-height: 1.6;
                color: #1e293b;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
                color: #ffffff;
                padding: 32px 24px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
              }
              .content {
                padding: 32px 24px;
              }
              .greeting {
                font-size: 18px;
                margin-bottom: 16px;
                color: #334155;
              }
              .book-title {
                font-size: 20px;
                font-weight: 600;
                color: #7c3aed;
                margin: 16px 0;
              }
              .info-box {
                background: linear-gradient(to bottom right, #f1f5f9, #e2e8f0);
                border-left: 4px solid #7c3aed;
                padding: 16px;
                margin: 24px 0;
                border-radius: 4px;
              }
              .info-box p {
                margin: 8px 0;
                color: #475569;
              }
              .warning {
                background: #fef3c7;
                border-left-color: #f59e0b;
                color: #92400e;
              }
              .button {
                display: inline-block;
                background: linear-gradient(to right, #7c3aed, #6d28d9);
                color: #ffffff;
                text-decoration: none;
                padding: 14px 28px;
                border-radius: 6px;
                font-weight: 600;
                margin: 16px 0;
                box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);
              }
              .footer {
                background-color: #f8fafc;
                padding: 24px;
                text-align: center;
                font-size: 14px;
                color: #64748b;
                border-top: 1px solid #e2e8f0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📚 Book Ready for Pickup!</h1>
              </div>
              <div class="content">
                <p class="greeting">Hello ${userName},</p>
                <p>Great news! The book you reserved is now available and waiting for you at the library.</p>

                <div class="book-title">"${bookTitle}"</div>

                <div class="info-box warning">
                  <p><strong>⏰ Important:</strong></p>
                  <p>Please pick up your book by <strong>${expiresAt.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</strong></p>
                  <p>Your reservation will expire after 48 hours if not collected.</p>
                </div>

                <div class="info-box">
                  <p><strong>Next Steps:</strong></p>
                  <p>1. Visit the library during opening hours</p>
                  <p>2. Show your membership card or QR code</p>
                  <p>3. Collect your book from the circulation desk</p>
                </div>

                <center>
                  <a href="${APP_URL}/member/reservations" class="button">
                    View My Reservations
                  </a>
                </center>

                <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
                  If you no longer need this book, please cancel your reservation so we can offer it to the next person in the queue.
                </p>
              </div>
              <div class="footer">
                <p>Librarium - Your Digital Library Management System</p>
                <p style="margin-top: 8px;">This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log('Reservation ready email sent:', result)
    return result
  } catch (error) {
    console.error('Error sending reservation ready email:', error)
    return null
  }
}

/**
 * Send reminder email when reservation is about to expire
 */
export async function sendReservationExpiringEmail(params: SendReservationExpiringEmailParams) {
  if (!resend) {
    console.warn('Resend not configured. Skipping email notification.')
    return null
  }

  const { to, userName, bookTitle, expiresAt, reservationId } = params

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: '⏰ Reminder: Your Reserved Book Expires Soon',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Georgia', 'Crimson Pro', serif;
                line-height: 1.6;
                color: #1e293b;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: #ffffff;
                padding: 32px 24px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
              }
              .content {
                padding: 32px 24px;
              }
              .warning-box {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 16px;
                margin: 24px 0;
                border-radius: 4px;
                color: #92400e;
              }
              .button {
                display: inline-block;
                background: linear-gradient(to right, #f59e0b, #d97706);
                color: #ffffff;
                text-decoration: none;
                padding: 14px 28px;
                border-radius: 6px;
                font-weight: 600;
                margin: 16px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⏰ Reservation Expiring Soon</h1>
              </div>
              <div class="content">
                <p>Hello ${userName},</p>
                <p>This is a friendly reminder that your reservation for <strong>"${bookTitle}"</strong> is expiring soon.</p>

                <div class="warning-box">
                  <p><strong>Expires:</strong> ${expiresAt.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                  <p>Please collect your book before it expires and becomes available to others in the queue.</p>
                </div>

                <center>
                  <a href="${APP_URL}/member/reservations" class="button">
                    View Reservation
                  </a>
                </center>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    return result
  } catch (error) {
    console.error('Error sending reservation expiring email:', error)
    return null
  }
}

/**
 * Send overdue notification email
 */
export async function sendOverdueNotification(params: SendOverdueNotificationParams) {
  if (!resend) {
    console.warn('Resend not configured. Skipping email notification.')
    return null
  }

  const { to, userName, bookTitle, dueDate, daysOverdue } = params

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: '📅 Overdue Book Reminder',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Georgia', 'Crimson Pro', serif;
                line-height: 1.6;
                color: #1e293b;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                color: #ffffff;
                padding: 32px 24px;
                text-align: center;
              }
              .content {
                padding: 32px 24px;
              }
              .warning-box {
                background: #fee2e2;
                border-left: 4px solid #dc2626;
                padding: 16px;
                margin: 24px 0;
                border-radius: 4px;
                color: #7f1d1d;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📅 Overdue Book Reminder</h1>
              </div>
              <div class="content">
                <p>Hello ${userName},</p>
                <p>Your borrowed book <strong>"${bookTitle}"</strong> is now overdue.</p>

                <div class="warning-box">
                  <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
                  <p><strong>Days Overdue:</strong> ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}</p>
                  <p><strong>Fine:</strong> $${(daysOverdue * 0.5).toFixed(2)}</p>
                </div>

                <p>Please return the book as soon as possible to avoid additional fines.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    return result
  } catch (error) {
    console.error('Error sending overdue notification:', error)
    return null
  }
}
