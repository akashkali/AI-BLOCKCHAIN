import smtplib
from email.mime.text import MIMEText

# Optional Twilio import - app will work without it
try:
    from twilio.rest import Client
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    Client = None

# Email settings (replace with your actual SMTP server and credentials)
SMTP_SERVER = 'smtp.example.com'
SMTP_PORT = 587
SMTP_USER = 'your_email@example.com'
SMTP_PASS = 'your_password'

# Twilio settings (replace with your actual Twilio credentials)
TWILIO_SID = 'your_twilio_sid'
TWILIO_TOKEN = 'your_twilio_token'
TWILIO_FROM = '+1234567890'
ADMIN_PHONE = '+1987654321'

ADMIN_EMAIL = 'admin@example.com'

def send_email(subject, body, to=ADMIN_EMAIL):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = SMTP_USER
    msg['To'] = to
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, [to], msg.as_string())

def send_sms(body, to=ADMIN_PHONE):
    if not TWILIO_AVAILABLE:
        print(f"SMS notification (Twilio not available): {body}")
        return
    try:
        client = Client(TWILIO_SID, TWILIO_TOKEN)
        client.messages.create(body=body, from_=TWILIO_FROM, to=to)
    except Exception as e:
        print(f"Failed to send SMS: {e}") 