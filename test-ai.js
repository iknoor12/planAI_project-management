import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000/api';

async function testAI() {
  try {
    // Step 1: Register a test user
    console.log('📝 Registering test user...');
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'testPassword123'
      })
    });

    const registerData = await registerResponse.json();
    if (!registerData.token) {
      console.error('❌ Registration failed:', registerData);
      return;
    }

    const token = registerData.token;
    console.log('✅ User registered! Token:', token.substring(0, 20) + '...');

    // Step 2: Test AI task generation
    console.log('\n🤖 Testing AI task generation...');
    const aiResponse = await fetch(`${API_URL}/ai/generate-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        projectDescription: 'Build a mobile app for task management'
      })
    });

    const aiData = await aiResponse.json();
    
    if (aiResponse.ok) {
      console.log('✅ AI Response:', JSON.stringify(aiData, null, 2));
    } else {
      console.error('❌ AI Error:', aiData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAI();
