"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./ChatWidget.module.css";
import EnquiryForm from "./EnquiryForm";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:7000/api/";
const CMS_ENDPOINT = process.env.NEXT_PUBLIC_CMS_API_ENDPOINT || "https://cmsapi.one9ty.com/api";
const SHOW_PRICING_URL = process.env.NEXT_PUBLIC_SHOW_PRICING_URL || "https://pilotexamssa.com/subscriptions.asp";
const CONTACT_SUPPORT_URL = process.env.NEXT_PUBLIC_CONTACT_SUPPORT_URL || "https://pilotexamssa.com/contact.asp";

const RECOMMENDATIONS = [
  "How do I prepare for SACAA exams?",
  "Help me prepare for SACAA exams",
  "Explain the PPL subscription",
  "Do you provide mock exams?"
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "agent",
      text: "Hi! I am Pontius. How can I help you with Pilot Exams today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);

  const toggleChat = () => setIsOpen((prev) => !prev);
  const toggleFullScreen = () => setIsFullScreen((prev) => !prev);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage({ type: "AEROMIND_WIDGET_STATE", isOpen, isFullScreen }, "*");
    }
  }, [isOpen, isFullScreen]);

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    // Check if the user has an enquiry_id in localStorage
    const hasEnquiryId = typeof window !== "undefined" && localStorage.getItem("enquiry_id");
    if (!hasEnquiryId) {
      setPendingMessage(textToSend.trim());
      setShowEnquiryForm(true);
      if (!messageText) setInputValue("");
      return;
    }

    if (!messageText) setInputValue("");
    
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: textToSend.trim() },
    ]);
    setIsLoading(true);

    try {
      const payload = { question: textToSend.trim() };
      if (typeof window !== "undefined") {
        const name = localStorage.getItem("name");
        const email = localStorage.getItem("email");
        const phone = localStorage.getItem("phone");
        if (name) payload.name = name;
        if (email) payload.email = email;
        if (phone) payload.phone = phone;
      }

      if (conversationId) {
        payload.conversation_id = conversationId;
      }

      const response = await fetch(API_ENDPOINT+"chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!conversationId && data?.meta?.conversation_id) {
        setConversationId(data.meta.conversation_id);
      }

      const reply = data?.data?.message?.reply || "Sorry, I couldn't understand that.";
      const suggestedActions = data?.data?.suggested_actions || [];

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "agent", text: reply, suggestedActions },
      ]);
    } catch (error) {
      console.error("Error communicating with AI API:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "agent",
          text: "Oops, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEnquirySubmit = async (formData) => {
   const res = await fetch(CMS_ENDPOINT+"/v1/public/forms/3/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (typeof window !== "undefined") {
      localStorage.setItem("enquiry_id", data.submission_no);
      localStorage.setItem("name", formData.name);
      localStorage.setItem("email", formData.email);
      localStorage.setItem("phone", formData.phone);
    }
    setShowEnquiryForm(false);
    if (pendingMessage) {
      const msg = pendingMessage;
      setPendingMessage(null);
      handleSend(msg);
    }
  };

  return (
    <div className={styles.widgetContainer}>
      {isOpen && (
        <div className={`${styles.chatWindow} ${isFullScreen ? styles.fullScreen : ''}`}>
          
          <div className={styles.chatHeader}>
            <div className={styles.headerLogo}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <div className={styles.headerText}>
              <div className={styles.headerTitle}>Pontius</div>
              <div className={styles.headerSubtitle}>
                Pilot Exams 
              </div>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.actionButton} onClick={toggleFullScreen} title="Toggle Full Screen">
                {isFullScreen ? (
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                )}
              </button>
              <button className={styles.actionButton} onClick={toggleChat} title="Close Chat">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                </svg>
              </button>
            </div>
          </div>

          {showEnquiryForm ? (
            <EnquiryForm onSubmit={handleEnquirySubmit} />
          ) : (
            <>
              <div className={styles.messagesArea}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.messageWrapper} ${
                      msg.sender === "user" ? styles.user : styles.agent
                    }`}
                  >
                    <div className={styles.messageBubble}>
                      {msg.sender === "agent" ? (
                        <div className={styles.markdownContent}>
                          <ReactMarkdown>
                            {msg.text}
                          </ReactMarkdown>
                          {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                            <div className={styles.suggestedActions}>
                              {msg.suggestedActions.includes("show_pricing") && (
                                <button
                                  className={styles.actionBtn}
                                  onClick={() => window.open(SHOW_PRICING_URL, "_blank")}
                                >
                                  Show Pricing
                                </button>
                              )}
                              {msg.suggestedActions.includes("contact_support") && (
                                <button
                                  className={styles.actionBtn}
                                  onClick={() => window.open(CONTACT_SUPPORT_URL, "_blank")}
                                >
                                  Contact Support
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className={`${styles.messageWrapper} ${styles.agent}`}>
                    <div className={styles.messageBubble}>
                      <div className={styles.typingIndicator}>
                        <div className={styles.typingDot}></div>
                        <div className={styles.typingDot}></div>
                        <div className={styles.typingDot}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {messages.length === 1 && !isLoading && (
                <div className={styles.recommendationsWrapper}>
                  {RECOMMENDATIONS.map((rec, idx) => (
                    <button 
                      key={idx} 
                      className={styles.recommendationChip}
                      onClick={() => handleSend(rec)}
                    >
                      {rec}
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.footerWrapper}>
                <div className={styles.chatFooter}>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="Ask Pontius anything..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                  />
                  <button
                    className={styles.sendButton}
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim() || isLoading}
                  >
                    <svg
                      className={styles.sendIcon}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </button>
                </div>
                <div className={styles.poweredByBar}>
                  Powered By <a style={{ color: '#00ffd2e0', textDecoration: 'none' }} href="https://www.one9ty.com/" target="_blank">One9ty</a>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {!isOpen && (
        <button className={styles.chatBubble} onClick={toggleChat}>
          <svg
            className={styles.chatBubbleIcon}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
