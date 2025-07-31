import smtplib, ssl

smtp_server = "webmail.workd.go.th"
port = 587  # For starttls
sender_email = "suspend.mdes@mdes.go.th"
receiver_email = "arnon3339@gmail.com"
password = input("Type your password and press enter: ")

# Create a secure SSL context
context = ssl.create_default_context()

# Try to log in to server and send email
server = None

try:
    server = smtplib.SMTP(smtp_server, port)
    server.ehlo()  # Can be omitted
    server.starttls(context=context)  # Secure the connection
    server.ehlo()  # Can be omitted
    server.login(sender_email, password)
    # --- build a simple message ---
    subject = "Test Email from Python"
    body = "Hello, this is a test email sent using Python and smtplib."

    message = f"Subject: {subject}\n\n{body}"

    # --- send mail ---
    server.sendmail(sender_email, receiver_email, message)
    print("✅ Email sent successfully!")
except Exception as e:
    # Print any error messages to stdout
    print(e)
finally:
    if server:
        server.quit()
