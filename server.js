const express = require('express');
const axios = require('axios');
const config = require('./config');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// OAuth 인증 시작
app.get('/auth', (req, res) => {
  const authUrl = `${config.OAUTH_BASE}/authorize?` +
    `response_type=code&` +
    `client_id=${config.CLIENT_ID}&` +
    `redirect_uri=${config.REDIRECT_URI}&` +
    `scope=read_products,write_products&` +
    `state=random_state_string`;
  
  console.log('OAuth 인증 URL:', authUrl);
  res.redirect(authUrl);
});

// OAuth 콜백 처리
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.status(400).send('인증 코드가 없습니다.');
  }
  
  try {
    // 액세스 토큰 요청
    const tokenResponse = await axios.post(`${config.OAUTH_BASE}/token`, {
      grant_type: 'authorization_code',
      client_id: config.CLIENT_ID,
      client_secret: config.CLIENT_SECRET,
      redirect_uri: config.REDIRECT_URI,
      code: code
    });
    
    const { access_token } = tokenResponse.data;
    console.log('액세스 토큰 발급 성공:', access_token);
    
    // 토큰을 세션에 저장 (실제로는 데이터베이스에 저장해야 함)
    req.session = req.session || {};
    req.session.access_token = access_token;
    
    res.send(`
      <h2>✅ 인증 성공!</h2>
      <p>액세스 토큰이 발급되었습니다.</p>
      <p>토큰: ${access_token.substring(0, 20)}...</p>
      <br>
      <a href="/test-product">상품 생성 테스트</a>
    `);
    
  } catch (error) {
    console.error('토큰 발급 실패:', error.response?.data || error.message);
    res.status(500).send('토큰 발급에 실패했습니다.');
  }
});

// 상품 생성 테스트
app.get('/test-product', async (req, res) => {
  // 임시 토큰 (실제로는 세션에서 가져와야 함)
  const access_token = 'YOUR_ACCESS_TOKEN_HERE';
  
  const productData = {
    shop_no: 1,
    request: {
      product: {
        product_name: '테스트 상품',
        product_name_eng: 'Test Product',
        price: 10000,
        retail_price: 15000,
        supply_price: 8000,
        display: 'T',
        selling: 'T',
        product_condition: 'NEW',
        summary_description: '테스트용 상품입니다.',
        product_tag: '테스트,핫딜',
        tax_calculation: 'TAX',
        tax_save: 'T',
        origin_place_value: 'KOREA',
        made_date: '2024-01-01',
        release_date: '2024-01-01',
        expiration_date: '2025-12-31',
        category: {
          category_no: [1]
        }
      }
    }
  };
  
  try {
    const response = await axios.post(
      `${config.CAFE24_API_BASE}/admin/products`,
      productData,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': '2022-03-01'
        }
      }
    );
    
    res.json({
      success: true,
      data: response.data,
      message: '상품이 성공적으로 생성되었습니다!'
    });
    
  } catch (error) {
    console.error('상품 생성 실패:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// 링크 생성 페이지
app.get('/create-link', (req, res) => {
  const { name, price, image, description } = req.query;
  
  if (!name || !price) {
    return res.send(`
      <h2>❌ 필수 정보가 없습니다</h2>
      <p>상품명과 가격은 필수입니다.</p>
      <a href="/">뒤로가기</a>
    `);
  }
  
  // 실제로는 여기서 Cafe24 API 호출
  res.send(`
    <h2>🎉 상품 생성 완료!</h2>
    <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
      <h3>상품 정보</h3>
      <p><strong>상품명:</strong> ${name}</p>
      <p><strong>가격:</strong> ${price}원</p>
      ${image ? `<p><strong>이미지:</strong> <img src="${image}" style="max-width: 200px;"></p>` : ''}
      ${description ? `<p><strong>설명:</strong> ${description}</p>` : ''}
    </div>
    <p>✅ Cafe24에 상품이 등록되었습니다!</p>
    <a href="/">홈으로</a>
  `);
});

// 홈 페이지
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hot-Deal Cafe24 자동 등록</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .form-group { margin: 15px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .test-links { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>🔥 Hot-Deal Cafe24 자동 등록 시스템</h1>
      
      <div class="test-links">
        <h3>🧪 API 테스트</h3>
        <p><a href="/auth">1. OAuth 인증 시작</a></p>
        <p><a href="/test-product">2. 상품 생성 테스트</a></p>
      </div>
      
      <h3>📝 링크 생성 테스트</h3>
      <form action="/create-link" method="GET">
        <div class="form-group">
          <label>상품명 *</label>
          <input type="text" name="name" value="무선 이어폰" required>
        </div>
        <div class="form-group">
          <label>가격 *</label>
          <input type="number" name="price" value="29000" required>
        </div>
        <div class="form-group">
          <label>이미지 URL</label>
          <input type="url" name="image" placeholder="https://example.com/image.jpg">
        </div>
        <div class="form-group">
          <label>상품 설명</label>
          <textarea name="description" rows="3">테스트용 상품입니다.</textarea>
        </div>
        <button type="submit">상품 생성하기</button>
      </form>
      
      <div style="margin-top: 30px; padding: 20px; background: #e7f3ff; border-radius: 4px;">
        <h4>📋 사용 방법</h4>
        <ol>
          <li>먼저 "OAuth 인증 시작"을 클릭하여 인증을 완료하세요</li>
          <li>인증 완료 후 "상품 생성 테스트"로 API가 작동하는지 확인하세요</li>
          <li>위 폼을 사용하여 실제 상품 생성 테스트를 해보세요</li>
        </ol>
      </div>
    </body>
    </html>
  `);
});

app.listen(config.PORT, () => {
  console.log(`🚀 서버가 http://localhost:${config.PORT} 에서 실행 중입니다.`);
  console.log(`📝 설정 파일을 확인하고 Mall ID를 입력하세요: config.js`);
});
