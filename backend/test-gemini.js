require('dotenv').config()
const { GoogleGenerativeAI } = require('@google/generative-ai')

console.log('API Key present:', !!process.env.GEMINI_API_KEY)
console.log('API Key length:', process.env.GEMINI_API_KEY?.length)

if (process.env.GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  console.log('Gemini initialized:', !!genAI)
  console.log('Gemini object:', typeof genAI)
} else {
  console.log('No API Key found')
}
