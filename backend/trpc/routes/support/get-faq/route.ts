import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure
  .query(() => {
    return {
      categories: [
        {
          id: "payments",
          title: "Payments & Billing",
          icon: "CreditCard",
          faqs: [
            {
              id: "faq-1",
              question: "How do I pay my rent?",
              answer: "You can pay rent through M-Pesa, bank transfer, or card. Go to Dashboard > Rent Due > Pay Now. Payments are processed instantly for M-Pesa and within 1-2 business days for bank transfers."
            },
            {
              id: "faq-2",
              question: "When are utility bills due?",
              answer: "Water bills are typically due 7 days after they are posted to your account. You'll receive a notification when a new bill is available."
            },
            {
              id: "faq-3",
              question: "What payment methods are accepted?",
              answer: "We accept M-Pesa, Airtel Money, bank transfers, and credit/debit cards (Visa, Mastercard). M-Pesa is the most popular and fastest option."
            }
          ]
        },
        {
          id: "bookings",
          title: "Bookings & Rentals",
          icon: "Home",
          faqs: [
            {
              id: "faq-4",
              question: "How do I book a property?",
              answer: "Browse properties, select your preferred unit, choose your dates, and click 'Book Now'. For monthly rentals, you may need to schedule a site inspection first."
            },
            {
              id: "faq-5",
              question: "What is a site inspection?",
              answer: "A site inspection allows you to physically view the property before committing to a monthly rental. You can request one from the property page."
            },
            {
              id: "faq-6",
              question: "Can I cancel my booking?",
              answer: "Cancellation policies vary by property and booking type. Check your booking details for the specific cancellation policy. Monthly rentals typically require 30-60 days notice."
            }
          ]
        },
        {
          id: "maintenance",
          title: "Maintenance & Support",
          icon: "Wrench",
          faqs: [
            {
              id: "faq-7",
              question: "How do I report a maintenance issue?",
              answer: "Go to Dashboard > Maintenance > Report Issue. Add photos and description. Your landlord will be notified immediately and will assign a technician."
            },
            {
              id: "faq-8",
              question: "How long does maintenance take?",
              answer: "Response times vary by priority: High (24 hours), Medium (48 hours), Low (5 business days). Emergency issues like water leaks are addressed immediately."
            }
          ]
        },
        {
          id: "account",
          title: "Account & Security",
          icon: "User",
          faqs: [
            {
              id: "faq-9",
              question: "How do I update my profile?",
              answer: "Go to Profile > Settings > Account Preferences. You can update your name, phone, email, language, and profile photo."
            },
            {
              id: "faq-10",
              question: "Is my data secure?",
              answer: "Yes. We use bank-level encryption (TLS 1.3) for all data transmission. Sensitive information like payment details is encrypted at rest and never shared with third parties."
            },
            {
              id: "faq-11",
              question: "How do I enable two-factor authentication?",
              answer: "Go to Settings > Security > Two-Factor Authentication. You can enable 2FA via SMS or authenticator app for added account security."
            }
          ]
        }
      ]
    };
  });
