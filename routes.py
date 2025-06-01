from flask import render_template, request, flash, redirect, url_for, jsonify
from flask_mail import Message
from app import app, mail
import logging

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/services')
def services():
    return render_template('services.html')

@app.route('/pricing')
def pricing():
    return render_template('pricing.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/send_message', methods=['POST'])
def send_message():
    try:
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        service = request.form.get('service')
        message_text = request.form.get('message')
        
        if not all([name, email, message_text]):
            flash('Please fill in all required fields.', 'error')
            return redirect(url_for('contact'))
        
        # Create email message
        subject = f"New Contact Form Submission from {name}"
        body = f"""
        New contact form submission:
        
        Name: {name}
        Email: {email}
        Phone: {phone if phone else 'Not provided'}
        Service Interest: {service if service else 'Not specified'}
        
        Message:
        {message_text}
        """
        
        msg = Message(
            subject=subject,
            recipients=['vanshsrivastava252@gmail.com'],
            body=body,
            reply_to=email
        )
        
        mail.send(msg)
        flash('Thank you for your message! We will get back to you soon.', 'success')
        
    except Exception as e:
        logging.error(f"Error sending email: {str(e)}")
        flash('There was an error sending your message. Please try again or contact us directly.', 'error')
    
    return redirect(url_for('contact'))

@app.route('/quote')
def quote():
    service = request.args.get('service', '')
    return render_template('contact.html', service=service)
