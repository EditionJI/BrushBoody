<template>
  <div class="privacy-page">
    <div class="privacy-container">
      <h1>Privacy Policy for BrushBoody</h1>
      <p class="effective-date">Effective Date: February 27, 2026</p>

      <p>At BrushBoody, we respect the privacy of your family. This Privacy Policy explains how we handle information for our 7-day beta testing program.</p>

      <h2>1. Information We Collect</h2>
      <p><strong>Email Address:</strong> We collect your email solely to send you the daily magic access links for your child's personalized stories.</p>
      <p><strong>Child's First Name:</strong> Used only to personalize the story text (e.g., "Leo the Brave").</p>
      <p><strong>Photos:</strong> To create the AI-generated illustrations, you may upload a photo of your child.</p>

      <h2>2. How We Handle AI Photos (Crucial)</h2>
      <p><strong>No Permanent Storage:</strong> Photos are used as a reference for the AI model to generate custom artwork. Once the illustration is generated, the original photo is automatically deleted from our temporary processing cache.</p>
      <p><strong>No Data Selling:</strong> We never sell, rent, or share your child's photos or your personal data with third-party advertisers.</p>

      <h2>3. Children's Privacy (COPPA)</h2>
      <p>BrushBoody is designed for parents to use with their children. We do not knowingly collect personal information directly from children under 13. All data must be provided by a parent or legal guardian.</p>

      <h2>4. Your Rights</h2>
      <p>You can request the deletion of your email and any associated progress at any time by replying to our welcome email.</p>

      <h2>5. Contact Us</h2>
      <p>For any questions about this Privacy Policy, please contact us at: <strong>jiwd@starspulse.com</strong></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // Allow scrolling for privacy policy page
  document.body.style.overflow = 'auto'
  document.body.style.position = 'relative'
  document.documentElement.style.overflow = 'auto'
  document.documentElement.style.position = 'relative'
})

onUnmounted(() => {
  // Reset to fixed position when leaving privacy page
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.documentElement.style.overflow = 'hidden'
  document.documentElement.style.position = 'fixed'
})
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: #ffffff;
  padding: 40px 20px;
  overflow-y: auto;
}

.privacy-container {
  max-width: 800px;
  margin: 0 auto;
  color: #333333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
}

.privacy-container h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000000;
}

.effective-date {
  font-size: 14px;
  color: #666666;
  margin-bottom: 32px;
}

.privacy-container h2 {
  font-size: 18px;
  font-weight: 600;
  margin-top: 32px;
  margin-bottom: 16px;
  color: #000000;
}

.privacy-container p {
  margin-bottom: 12px;
}

.privacy-container strong {
  font-weight: 600;
}
</style>
