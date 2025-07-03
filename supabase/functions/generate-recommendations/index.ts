import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

serve(async (req) => {
  const { userId } = await req.json()
  
  // Initialize Supabase client
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  // Initialize OpenAI
  const configuration = new Configuration({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
  })
  const openai = new OpenAIApi(configuration)
  
  try {
    // Get user data
    const { data: userInteractions, error: interactionsError } = await supabaseClient
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
    
    if (interactionsError) throw interactionsError
    
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('*')
    
    if (productsError) throw productsError
    
    // Extract user preferences
    const viewedProducts = userInteractions
      .filter(i => i.interaction_type === 'view')
      .map(i => products.find(p => p.id === i.product_id))
      .filter(Boolean)
    
    const likedProducts = userInteractions
      .filter(i => i.interaction_type === 'like')
      .map(i => products.find(p => p.id === i.product_id))
      .filter(Boolean)
    
    const cartProducts = userInteractions
      .filter(i => i.interaction_type === 'cart')
      .map(i => products.find(p => p.id === i.product_id))
      .filter(Boolean)

    // If user has no interactions, return popular products
    if (viewedProducts.length === 0 && likedProducts.length === 0 && cartProducts.length === 0) {
      const popularProducts = products
        .sort((a, b) => (b.rating * b.review_count) - (a.rating * a.review_count))
        .slice(0, 10)
        .map(p => ({
          productId: p.id,
          score: p.rating * Math.log(p.review_count + 1),
          reason: 'Popular and highly rated product'
        }))
      
      return new Response(
        JSON.stringify({ recommendations: popularProducts }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Create prompt for OpenAI
    const prompt = {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a recommendation system expert. Generate product recommendations based on user behavior and product catalog."
        },
        {
          role: "user",
          content: `
            Generate 10 product recommendations for a user with the following behavior:
            
            Viewed products: ${JSON.stringify(viewedProducts.map(p => ({ name: p.name, category: p.category, brand: p.brand })))}
            
            Liked products: ${JSON.stringify(likedProducts.map(p => ({ name: p.name, category: p.category, brand: p.brand })))}
            
            Cart products: ${JSON.stringify(cartProducts.map(p => ({ name: p.name, category: p.category, brand: p.brand })))}
            
            Available products: ${JSON.stringify(products.slice(0, 50).map(p => ({ id: p.id, name: p.name, category: p.category, brand: p.brand, price: p.price, rating: p.rating })))}
            
            Return a JSON array with objects containing: 
            1. productId (the id of the recommended product)
            2. score (a number between 0 and 1 indicating confidence)
            3. reason (a short explanation for why this product is recommended)
            
            Format your response as valid JSON only, with no additional text.
          `
        }
      ]
    }
    
    // Get recommendations from OpenAI
    const completion = await openai.createChatCompletion(prompt)
    let recommendationsText = completion.data.choices[0].message.content
    
    // Clean up the response to ensure it's valid JSON
    recommendationsText = recommendationsText.trim()
    if (recommendationsText.startsWith('```json')) {
      recommendationsText = recommendationsText.replace('```json', '').replace('```', '')
    } else if (recommendationsText.startsWith('```')) {
      recommendationsText = recommendationsText.replace('```', '').replace('```', '')
    }
    
    // Parse recommendations
    const recommendations = JSON.parse(recommendationsText)
    
    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}) 