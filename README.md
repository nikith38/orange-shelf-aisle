# 🛍️ Amazon Style E-Commerce Platform

A modern e-commerce platform with AI-powered product recommendations, built with React, TypeScript, Supabase, and OpenAI.

## 📸 Screenshots

### Homepage with AI-Powered Recommendations
The homepage displays personalized product recommendations using our AI-powered recommendation engine. Users can see why products are recommended to them and easily add items to their cart or wishlist.

![Homepage Screenshot](./public/images/homepage-screenshot.png)

### Shopping Cart
The shopping cart provides a seamless checkout experience with the ability to adjust quantities, remove items, and see the total price before proceeding to checkout.

![Shopping Cart Screenshot](./public/images/cart-screenshot.png)

## ✨ Features

- **🔐 User Authentication**: Secure sign-up and login using Supabase Auth
- **🏷️ Product Catalog**: Browse and search products with filtering by category
- **🛒 Shopping Cart**: Add, remove, and update quantities with persistent storage
- **🧠 AI-Powered Recommendations**: Multiple recommendation algorithms:
  - OpenAI-powered personalized recommendations
  - Content-based filtering based on user preferences
  - Collaborative filtering based on similar users
  - Hybrid approach combining multiple methods
- **📊 User Interaction Tracking**: Track views, likes, and cart additions to improve recommendations
- **📱 Responsive Design**: Mobile-friendly interface using Tailwind CSS

## 🛠️ Technology Stack

- **🖥️ Frontend**: React, TypeScript, Vite
- **🎨 UI Components**: Shadcn UI, Tailwind CSS
- **🗄️ Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **🤖 AI Integration**: OpenAI API
- **📦 State Management**: React Context API
- **💅 Styling**: Tailwind CSS

## 🧠 Recommendation System Implementation

Our recommendation system combines multiple sophisticated approaches to deliver highly personalized product suggestions:

### 1. OpenAI-Powered Recommendations

We leverage OpenAI's GPT-4 model to analyze user behavior patterns and generate intelligent product recommendations. The system:

- Processes user interaction data (views, likes, cart additions)
- Analyzes product metadata and relationships
- Generates personalized recommendations with explanations

```typescript
// Example of OpenAI recommendation prompt structure
const prompt = {
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: "You are a recommendation system expert..."
    },
    {
      role: "user",
      content: `Generate recommendations based on user behavior: ${JSON.stringify(userBehavior)}`
    }
  ]
};
```

### 2. Content-Based Filtering

This approach recommends products similar to those the user has previously interacted with:

- Analyzes product attributes (category, brand, features)
- Creates user preference profiles
- Matches products with similar characteristics

### 3. Collaborative Filtering

This method identifies patterns across users with similar tastes:

- Identifies users with similar interaction patterns
- Recommends products popular among similar users
- Weights recommendations based on similarity scores

### 4. Hybrid Approach

Our system combines all three methods for optimal recommendations:

- Weighted scoring system prioritizes the most relevant products
- Contextual factors adjust recommendation relevance
- Real-time updates based on user behavior

## 👨‍💻 Development Process with Cursor

This project was developed using Cursor, an AI-powered IDE that significantly enhanced the development workflow. Here's how Cursor assisted in the development process:

### Initial Setup and Scaffolding 🏗️

Cursor helped generate the initial project structure and boilerplate code, saving hours of setup time. The AI suggested appropriate file organization and component structure based on best practices for React and TypeScript applications.

### Component Development 🧩

When building UI components, Cursor:
- Generated component templates with proper TypeScript typing
- Suggested appropriate props and state management
- Helped implement responsive designs using Tailwind CSS
- Provided real-time suggestions for accessibility improvements

### AI Recommendation System Implementation 🧠

The most complex part of the project was implementing the AI recommendation system:

1. **Supabase Edge Function**: Cursor helped write the serverless function that connects to OpenAI, analyzing user behavior data to generate recommendations.

2. **Data Schema Design**: Cursor suggested the optimal database schema for tracking user interactions and storing recommendation data.

3. **Integration with OpenAI**: Cursor provided code for properly formatting prompts to OpenAI and parsing the responses.

4. **Caching Strategy**: Cursor helped implement an efficient caching mechanism to reduce API calls and improve performance.

### Debugging and Problem Solving 🐛

When issues arose, Cursor:
- Identified potential bugs in the code
- Suggested fixes with explanations
- Helped trace through complex logic flows
- Provided alternative approaches when initial solutions didn't work

### Testing 🧪

Cursor assisted in creating comprehensive tests by:
- Generating test cases for critical functionality
- Suggesting edge cases to test
- Helping implement mock data and services

## 🧪 Test Suite

Our comprehensive test suite ensures the reliability and performance of the recommendation system:

### Unit Tests

- Tests for utility functions in the recommendation engine
- Tests for data transformation and processing
- Tests for caching mechanisms

### Component Tests

- Tests for UI components rendering recommendations
- Tests for user interaction handling
- Tests for state management

### Integration Tests

- Tests for API integration with OpenAI
- Tests for database operations with Supabase
- Tests for end-to-end recommendation flows

To run the tests:

```bash
npm test
# or
yarn test
```

## 🚀 Installation and Setup

### Prerequisites

- Node.js (v16+)
- npm or Yarn
- Supabase account
- OpenAI API key

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/amazon-style.git
cd amazon-style
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase Edge Function environment:
Create a `.env` file in the `supabase/functions` directory:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

5. Deploy the Supabase Edge Function:
```bash
supabase functions deploy generate-recommendations --no-verify-jwt
```

6. Run the development server:
```bash
npm run dev
# or
yarn dev
```

## 🔮 Future Enhancements

- 📊 Implement A/B testing for recommendation algorithms
- ⭐ Add product reviews and ratings system
- 🔍 Enhance search with natural language processing
- 💳 Add payment processing integration
- 📦 Implement inventory management system

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
