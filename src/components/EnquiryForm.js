"use client";

import React, { useState } from "react";
import styles from "./EnquiryForm.module.css";

export default function EnquiryForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    // Allows digits, optional starting +, spaces, dashes, and parentheses, length between 7 and 15
    const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number (7-15 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContent}>
        <h2 className={styles.heading}>Can you Tell me about you</h2>
        <p className={styles.subheading}>Please fill in your details to start the chat</p>
        
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
              placeholder="e.g. +27 82 123 4567"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
          </div>

          <button type="submit" className={styles.submitButton}>
            Submit & Start Chat
          </button>
        </form>
      </div>
    </div>
  );
}
