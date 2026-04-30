"use server";

import pool from '@/lib/mysql';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { headers } from 'next/headers';

/**
 * Ensures the ebook_leads table exists.
 */
async function ensureEbookLeadsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ebook_leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error("Database initialization error (ebook_leads):", err);
  }
}

/**
 * Sends the ebook PDF via email to the requester.
 */
export async function sendEbookEmail(email: string) {
  console.log("Attempting to send ebook email to:", email);
  try {
    const port = parseInt(process.env.EMAIL_PORT || '465');
    console.log("Transporter Config:", {
      host: process.env.EMAIL_HOST,
      port: port,
      user: process.env.EMAIL_USER
    });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: port,
      secure: port === 465, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // Helps with some shared hosting certificates
      }
    });

    const filePath = path.join(process.cwd(), 'public', 'Business Growth Guide By Color Hut.pdf');
    console.log("Looking for PDF at:", filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error("PDF file NOT found at path:", filePath);
      return { success: false, error: "PDF file not found" };
    }

    const headerList = await headers();
    const host = headerList.get('host');
    const proto = headerList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${proto}://${host}`;
    const pdfUrl = `${baseUrl}/Business%20Growth%20Guide%20By%20Color%20Hut.pdf`;

    console.log("Starting mail delivery with dynamic URL:", pdfUrl);
    const info = await transporter.sendMail({
      from: `"MenuSnap" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "আপনার বিজনেস গ্রোথ গাইড - ডাউনলোড লিংক",
      text: `আপনার আগ্রহের জন্য ধন্যবাদ। নিচের লিংক থেকে বিজনেস গ্রোথ গাইডটি ডাউনলোড করে নিন: ${pdfUrl}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ea580c; margin-bottom: 10px;">আপনার বিজনেস গ্রোথ গাইড প্রস্তুত!</h2>
            <div style="height: 2px; width: 60px; background-color: #ea580c; margin: 0 auto;"></div>
          </div>
          <p style="color: #444; line-height: 1.6;">আপনার রেস্টুরেন্ট বা বিজনেস ডেভেলপমেন্টের জন্য আমরা একটি পরিপূর্ণ গাইড তৈরি করেছি। এটি আপনার ব্যবসার ডিজিটাল সাকসেস নিশ্চিত করতে সাহায্য করবে।</p>
          <p style="color: #444; line-height: 1.6;">নিচের বাটনে ক্লিক করে আপনার ইবুকটি এখনই সংগ্রহ করুন:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${pdfUrl}" 
               style="background-color: #ea580c; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.2);">
               ইবুকটি ডাউনলোড করুন
            </a>
          </div>
          
          <p style="font-size: 13px; color: #777; line-height: 1.5;">বা সরাসরি এই লিংকে ক্লিক করুন: <br/> 
            <a href="${pdfUrl}" style="color: #ea580c;">${pdfUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">ধন্যবাদ,<br/>টিম মেনুস্ন্যাপ (MenuSnap)</p>
        </div>
      `,
      attachments: [
        {
          filename: 'Business Growth Guide By Color Hut.pdf',
          path: filePath
        }
      ]
    });

    console.log("Email successfully sent! Message ID:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("CRITICAL Email Sending Error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

/**
 * Main action to handle ebook lead capture and email delivery.
 */
export async function submitEbookLead(email: string) {
  try {
    await ensureEbookLeadsTable();

    // 1. Save lead to database
    await pool.execute(
      'INSERT INTO ebook_leads (email) VALUES (?)',
      [email]
    );

    // 2. Send the email in the background (don't wait for it to return to user)
    // Actually, for better UX we might want to wait or at least handle the error
    const emailResult = await sendEbookEmail(email);

    return { 
      success: true, 
      message: emailResult.success ? "আপনার ইমেইল চেক করুন, আমরা গাইডটি পাঠিয়ে দিয়েছি!" : "গাইডটি সরাসরি ডাউনলোড হচ্ছে..." 
    };
  } catch (error) {
    console.error("Ebook Lead Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}
